import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSuppliesStore } from './suppliesStore'
import { useInventoryStore } from './inventoryStore'
import {
  HABITAT_CONDITIONS,
  CONSUMPTION,
  POOP_CONSTANTS,
  TRACKING,
  DECAY,
  STARTER_HABITAT_POSITIONS,
  clampCondition,
  calculatePoopCleanlinessReduction
} from '../constants/supplies'
import { safeDeserializeMap, serializeMap } from '../utils/mapSerialization'
import { useHabitatContainers } from '../composables/useHabitatContainers'

// Types
interface HabitatSnapshot {
  timestamp: number
  cleanliness: number
  beddingFreshness: number
  hayFreshness: number
  waterLevel: number
}

interface CurrentBedding {
  type: string
  quality: 'cheap' | 'average' | 'premium' | 'colorful-premium'
  absorbency: number
  decayRate: number
  color?: string
}

interface CurrentHayBag {
  type: string
  handfulsRemaining: number
  bagId: string
}

interface ConsumptionData {
  beddingUsageRate: number
  hayConsumptionRate: number
  waterConsumptionRate: number
}

interface HabitatAlert {
  id: string
  type: 'warning' | 'critical'
  condition: string
  message: string
  timestamp: number
}

interface Poop {
  id: string
  x: number
  y: number
  timestamp: number
}

interface AlertPreferences {
  enableAlerts: boolean
  warningThreshold: number
  criticalThreshold: number
}

interface GuineaPigPosition {
  x: number
  y: number
  lastMoved: number
  targetPosition?: { x: number; y: number }
  isMoving: boolean
}

interface ItemUsage {
  lastUsedAt: number
  usageCount: number
  lastUsedBy: string
  effectiveness: number
  freshnessBonus: boolean
}

export const useHabitatConditions = defineStore('habitatConditions', () => {
  // Core conditions (0-100)
  const cleanliness = ref<number>(HABITAT_CONDITIONS.DEFAULT_CLEANLINESS)
  const beddingFreshness = ref<number>(HABITAT_CONDITIONS.DEFAULT_BEDDING_FRESHNESS)
  const hayFreshness = ref<number>(HABITAT_CONDITIONS.DEFAULT_HAY_FRESHNESS)
  const waterLevel = ref<number>(HABITAT_CONDITIONS.DEFAULT_WATER_LEVEL)

  // Tracking and history
  const lastCleaningTime = ref(Date.now())
  const lastBeddingRefresh = ref(Date.now())
  const lastHayRefill = ref(Date.now())
  const lastWaterRefill = ref(Date.now())
  const conditionHistory = ref<HabitatSnapshot[]>([])

  // Resource management (now connected to Supplies Store & Inventory)
  const currentBedding = ref<CurrentBedding>({
    type: 'None',
    quality: 'average',
    absorbency: CONSUMPTION.DEFAULT_ABSORBENCY,
    decayRate: CONSUMPTION.DEFAULT_DECAY_RATE
  })

  const currentHayBag = ref<CurrentHayBag | null>(null)

  const consumptionRates = ref<ConsumptionData>({
    beddingUsageRate: 0,
    hayConsumptionRate: 0,
    waterConsumptionRate: 0
  })

  // Alerts and notifications
  const activeAlerts = ref<HabitatAlert[]>([])
  const notificationSettings = ref<AlertPreferences>({
    enableAlerts: true,
    warningThreshold: HABITAT_CONDITIONS.WARNING_THRESHOLD,
    criticalThreshold: HABITAT_CONDITIONS.CRITICAL_THRESHOLD
  })

  // Habitat Items (items currently placed in the habitat)
  const habitatItems = ref<string[]>([])

  // Item positions (Map of itemId -> grid position)
  const itemPositions = ref<Map<string, { x: number; y: number }>>(new Map())

  // Bowl and Hay Rack Management (using composable)
  const containers = useHabitatContainers()
  const {
    bowlContents,
    hayRackContents,
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    clearHayRack,
    clearAllHayRacks
  } = containers

  // Poop tracking
  const poops = ref<Poop[]>([])

  // Guinea pig position tracking (System 16: Phase 4)
  const guineaPigPositions = ref<Map<string, GuineaPigPosition>>(new Map())

  // Habitat grid dimensions (medium habitat default)
  const gridWidth = 14
  const gridHeight = 10

  // Item usage history (System 16: Phase 5)
  const itemUsageHistory = ref<Map<string, ItemUsage>>(new Map())

  // Decay speed multiplier (System 16: Phase 3 Enhancement)
  const decaySpeedMultiplier = ref<number>(DECAY.DEFAULT_SPEED)

  // Computed properties
  const overallCondition = computed(() => {
    // Calculate average freshness from all hay racks
    let hayRackAvgFreshness = 100
    const hayRacks = Array.from(hayRackContents.value.values())
    if (hayRacks.length > 0) {
      const totalFreshness = hayRacks.reduce((sum, rack) => sum + rack.freshness, 0)
      hayRackAvgFreshness = totalFreshness / hayRacks.length
    }

    // Calculate average freshness from all food bowls
    let foodBowlAvgFreshness = 100
    const allFoods: number[] = []
    bowlContents.value.forEach(foods => {
      foods.forEach(food => allFoods.push(food.freshness))
    })
    if (allFoods.length > 0) {
      const totalFoodFreshness = allFoods.reduce((sum, f) => sum + f, 0)
      foodBowlAvgFreshness = totalFoodFreshness / allFoods.length
    }

    // Factor in all conditions: bedding, cleanliness, water, hay rack freshness, food freshness
    return Math.floor(
      (cleanliness.value + beddingFreshness.value + waterLevel.value + hayRackAvgFreshness + foodBowlAvgFreshness) / 5
    )
  })

  const needsAttention = computed(() => {
    return (
      cleanliness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      beddingFreshness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      hayFreshness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      waterLevel.value < HABITAT_CONDITIONS.WARNING_THRESHOLD
    )
  })

  const criticalConditions = computed(() => {
    const critical: string[] = []
    if (cleanliness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Cleanliness')
    if (beddingFreshness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Bedding')
    if (hayFreshness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Hay')
    if (waterLevel.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Water')
    return critical
  })

  // Actions
  function cleanCage() {
    cleanliness.value = HABITAT_CONDITIONS.RESET_VALUE
    lastCleaningTime.value = Date.now()
    poops.value = [] // Remove all poops
    recordSnapshot()
  }

  function addPoop(x: number, y: number) {
    const poop: Poop = {
      id: `poop_${crypto.randomUUID()}`,
      x,
      y,
      timestamp: Date.now()
    }
    poops.value.push(poop)

    // Reduce cleanliness based on poop count
    const reduction = calculatePoopCleanlinessReduction()
    cleanliness.value = Math.max(HABITAT_CONDITIONS.CONDITION_MIN, cleanliness.value - reduction)
    recordSnapshot()
  }

  function removePoop(poopId: string) {
    const index = poops.value.findIndex(p => p.id === poopId)
    if (index === -1) {
      return false
    }

    poops.value.splice(index, 1)

    // Slightly improve cleanliness when removing poop
    cleanliness.value = Math.min(
      HABITAT_CONDITIONS.CONDITION_MAX,
      cleanliness.value + POOP_CONSTANTS.CLEANLINESS_RECOVERY_PER_REMOVAL
    )
    recordSnapshot()
    return true
  }

  function refreshBedding(itemId: string) {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Check if supplies catalog is loaded
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
    }

    // Get bedding item from supplies store
    const beddingItem = suppliesStore.getItemById(itemId)
    if (!beddingItem || beddingItem.category !== 'bedding') {
      console.warn(`Invalid bedding item: ${itemId}`)
      return false
    }

    // Check inventory
    if (inventoryStore.getItemQuantity(itemId) <= 0) {
      console.warn(`No ${beddingItem.name} in inventory`)
      return false
    }

    // Mark bedding as opened (cannot be returned)
    inventoryStore.markAsOpened(itemId, 1)

    // Use one bedding from inventory
    inventoryStore.useItem(itemId, 1)

    // Apply bedding stats from supplies store
    const stats = beddingItem.stats
    currentBedding.value = {
      type: beddingItem.name,
      quality: beddingItem.quality as 'cheap' | 'average' | 'premium' | 'colorful-premium',
      absorbency: stats?.absorbency || CONSUMPTION.DEFAULT_ABSORBENCY,
      decayRate: stats?.decayRate || CONSUMPTION.DEFAULT_DECAY_RATE,
      color: beddingItem.quality === 'premium' && beddingItem.tags?.includes('color') ? beddingItem.name.toLowerCase() : undefined
    }

    beddingFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    lastBeddingRefresh.value = Date.now()
    recordSnapshot()
    return true
  }

  function refillHay(itemId: string) {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Check if supplies catalog is loaded
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
    }

    // Get hay item from supplies store
    const hayItem = suppliesStore.getItemById(itemId)
    if (!hayItem || hayItem.category !== 'hay') {
      console.warn(`Invalid hay item: ${itemId}`)
      return false
    }

    // Check inventory
    if (inventoryStore.getItemQuantity(itemId) <= 0) {
      console.warn(`No ${hayItem.name} in inventory`)
      return false
    }

    // Mark hay as opened (cannot be returned)
    inventoryStore.markAsOpened(itemId, 1)

    // Use one hay bag from inventory
    inventoryStore.useItem(itemId, 1)

    // All hay bags have standard handfuls per bag
    const handfuls = CONSUMPTION.HAY_HANDFULS_PER_BAG

    if (!currentHayBag.value) {
      currentHayBag.value = {
        type: hayItem.name,
        handfulsRemaining: handfuls,
        bagId: `${itemId}-${Date.now()}`
      }
    } else {
      // No limit - can add unlimited handfuls
      currentHayBag.value.handfulsRemaining += handfuls
      currentHayBag.value.type = hayItem.name
    }

    hayFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    lastHayRefill.value = Date.now()
    recordSnapshot()
    return true
  }

  function refillWater() {
    waterLevel.value = HABITAT_CONDITIONS.RESET_VALUE
    lastWaterRefill.value = Date.now()
    recordSnapshot()
  }

  function consumeHayHandful() {
    if (!currentHayBag.value || currentHayBag.value.handfulsRemaining <= 0) {
      return false
    }

    currentHayBag.value.handfulsRemaining--
    if (currentHayBag.value.handfulsRemaining === 0) {
      // Bag depleted
      currentHayBag.value = null
    }
    return true
  }

  function recordSnapshot() {
    const snapshot: HabitatSnapshot = {
      timestamp: Date.now(),
      cleanliness: cleanliness.value,
      beddingFreshness: beddingFreshness.value,
      hayFreshness: hayFreshness.value,
      waterLevel: waterLevel.value
    }

    conditionHistory.value.push(snapshot)

    // Keep only last N snapshots
    if (conditionHistory.value.length > TRACKING.CONDITION_HISTORY_MAX) {
      conditionHistory.value.shift()
    }
  }

  function updateCondition(condition: string, value: number) {
    value = clampCondition(value)

    switch (condition) {
      case 'cleanliness':
        cleanliness.value = value
        break
      case 'beddingFreshness':
        beddingFreshness.value = value
        break
      case 'hayFreshness':
        hayFreshness.value = value
        break
      case 'waterLevel':
        waterLevel.value = value
        break
    }

    recordSnapshot()
  }

  function resetHabitatConditions() {
    // Reset all conditions to 100%
    cleanliness.value = HABITAT_CONDITIONS.RESET_VALUE
    beddingFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    hayFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    waterLevel.value = HABITAT_CONDITIONS.RESET_VALUE

    // Update all timestamps
    const now = Date.now()
    lastCleaningTime.value = now
    lastBeddingRefresh.value = now
    lastHayRefill.value = now
    lastWaterRefill.value = now

    // Clear condition history
    conditionHistory.value = []

    // Record initial snapshot
    recordSnapshot()
  }

  function addItemToHabitat(itemId: string, position?: { x: number; y: number }) {
    const inventoryStore = useInventoryStore()

    // Check if item is in inventory
    if (!inventoryStore.hasItem(itemId)) {
      console.warn(`Item ${itemId} not found in inventory`)
      return false
    }

    // Check if already in habitat
    if (habitatItems.value.includes(itemId)) {
      console.warn(`Item ${itemId} already in habitat`)
      return false
    }

    // Mark as placed in habitat (cannot be returned to store)
    inventoryStore.markAsPlacedInHabitat(itemId, 1)

    // Add to habitat
    habitatItems.value.push(itemId)

    // Store position if provided
    if (position) {
      itemPositions.value.set(itemId, position)
    }

    // System 16: Phase 5 - Initialize item usage tracking with freshness bonus
    if (!itemUsageHistory.value.has(itemId)) {
      itemUsageHistory.value.set(itemId, {
        lastUsedAt: Date.now(),
        usageCount: 0,
        lastUsedBy: '',
        effectiveness: 100,
        freshnessBonus: true
      })
    }

    return true
  }

  function removeItemFromHabitat(itemId: string) {
    const index = habitatItems.value.indexOf(itemId)
    if (index === -1) {
      console.warn(`Item ${itemId} not found in habitat`)
      return false
    }

    const inventoryStore = useInventoryStore()

    // Remove placement flag
    inventoryStore.unmarkAsPlacedInHabitat(itemId, 1)

    // Remove from habitat
    habitatItems.value.splice(index, 1)

    // Remove position tracking
    itemPositions.value.delete(itemId)

    // Clear bowl contents if it's a bowl
    if (bowlContents.value.has(itemId)) {
      bowlContents.value.delete(itemId)
    }

    // System 16: Phase 5 - Reset effectiveness when item is removed (rotation benefit)
    resetItemEffectiveness(itemId)

    return true
  }

  // Note: Bowl and hay rack functions are now provided by useHabitatContainers composable

  // ============================================================================
  // Environmental Decay System (System 16: Phase 3)
  // ============================================================================

  /**
   * Apply environmental decay to bedding, cleanliness, and hay racks
   * @param deltaSeconds - Time elapsed since last update in seconds
   */
  function applyEnvironmentalDecay(deltaSeconds: number) {
    // 1. Apply bedding decay (quality-modified + speed multiplier)
    const qualityMultiplier = DECAY.QUALITY_MULTIPLIERS[currentBedding.value.quality] || 1.0
    const beddingDecay = DECAY.BEDDING_BASE_DECAY_PER_SECOND * qualityMultiplier * decaySpeedMultiplier.value * deltaSeconds
    beddingFreshness.value = clampCondition(beddingFreshness.value - beddingDecay)

    // 2. Apply cleanliness decay (with speed multiplier)
    const cleanlinessDecay = DECAY.CLEANLINESS_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    cleanliness.value = clampCondition(cleanliness.value - cleanlinessDecay)

    // 3. Apply hay freshness decay per hay rack (with speed multiplier) - hay oxidizes and loses nutritional value
    const hayDecay = DECAY.HAY_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    const { applyHayRackDecay, applyFoodBowlDecay } = useHabitatContainers()
    applyHayRackDecay(hayDecay)

    // 4. Apply food freshness decay per bowl (with speed multiplier) - food spoils over time
    const foodDecay = DECAY.FOOD_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    applyFoodBowlDecay(foodDecay)

    // Note: Activity-based decay will be recorded via recordGuineaPigActivity()
  }

  /**
   * Set decay speed multiplier
   */
  function setDecaySpeed(multiplier: number) {
    decaySpeedMultiplier.value = Math.max(0.1, Math.min(100, multiplier))
  }

  /**
   * Record guinea pig activity to accelerate decay
   * @param activityType - Type of activity ('movement', 'eating', 'drinking')
   */
  function recordGuineaPigActivity(activityType: 'movement' | 'eating' | 'drinking') {
    const activityDecay = DECAY.ACTIVITY_DECAY[activityType]

    // Activity primarily affects bedding freshness
    beddingFreshness.value = clampCondition(beddingFreshness.value - activityDecay)

    // Eating also affects cleanliness (food crumbs)
    if (activityType === 'eating') {
      cleanliness.value = clampCondition(cleanliness.value - (activityDecay * 0.5))
    }
  }

  // ============================================================================
  // Water Consumption System (System 16: Phase 2)
  // ============================================================================

  /**
   * Consume water from bottle (called when guinea pig drinks)
   * @param waterBottleItemId - ID of the water bottle item to drink from
   * @returns True if water was consumed successfully
   */
  function consumeWater(waterBottleItemId?: string): boolean {
    // If no specific bottle provided, find any water bottle in habitat
    let bottleId = waterBottleItemId

    if (!bottleId) {
      const suppliesStore = useSuppliesStore()
      bottleId = habitatItems.value.find(itemId => {
        const item = suppliesStore.getItemById(itemId)
        return item?.stats?.itemType === 'water_bottle'
      })
    }

    if (!bottleId) {
      console.warn('No water bottle found in habitat')
      return false
    }

    // Check if water bottle exists in habitat
    if (!habitatItems.value.includes(bottleId)) {
      console.warn(`Water bottle ${bottleId} not in habitat`)
      return false
    }

    // Check if item is actually a water bottle
    const suppliesStore = useSuppliesStore()
    const item = suppliesStore.getItemById(bottleId)
    if (item?.stats?.itemType !== 'water_bottle') {
      console.warn(`Item ${bottleId} is not a water bottle`)
      return false
    }

    // Check if water level is sufficient
    if (waterLevel.value < 5) {
      console.warn('Water bottle is empty - cannot drink')
      return false
    }

    // Consume water (10-15 units)
    const consumption = Math.floor(Math.random() * 6) + 10
    waterLevel.value = Math.max(0, waterLevel.value - consumption)

    console.log(`💧 Water consumed: ${consumption} units. Remaining: ${waterLevel.value}%`)
    recordSnapshot()
    return true
  }

  /**
   * Check if water is available for drinking
   * @returns True if water bottle is present and has sufficient water
   */
  function hasWaterAvailable(): boolean {
    // Check if any water bottle is placed in habitat
    const suppliesStore = useSuppliesStore()
    const waterBottle = habitatItems.value.find(itemId => {
      const item = suppliesStore.getItemById(itemId)
      return item?.stats?.itemType === 'water_bottle'
    })

    return waterBottle !== undefined && waterLevel.value >= 5
  }

  /**
   * Find water bottle position for autonomy pathfinding
   * @returns Position of first water bottle, or null if none found
   */
  function getWaterBottlePosition(): { x: number; y: number } | null {
    const suppliesStore = useSuppliesStore()

    // Find first water bottle in habitat
    const waterBottleId = habitatItems.value.find(itemId => {
      const item = suppliesStore.getItemById(itemId)
      return item?.stats?.itemType === 'water_bottle'
    })

    if (!waterBottleId) {
      return null
    }

    // Return stored position
    return itemPositions.value.get(waterBottleId) || null
  }

  function initializeStarterHabitat(starterItemIds: string[]) {
    // Add starter items to habitat without checking inventory
    habitatItems.value = [...starterItemIds]

    // Apply default positions from constants
    starterItemIds.forEach(itemId => {
      if (itemId in STARTER_HABITAT_POSITIONS) {
        const position = STARTER_HABITAT_POSITIONS[itemId as keyof typeof STARTER_HABITAT_POSITIONS]
        itemPositions.value.set(itemId, position)
        console.log(`Setting starter position for ${itemId}:`, position)
      } else {
        console.warn(`No default position defined for ${itemId}`)
      }
    })
    console.log('Item positions after init:', itemPositions.value)

    // Mark them as placed in habitat
    const inventoryStore = useInventoryStore()
    starterItemIds.forEach(itemId => {
      inventoryStore.markAsPlacedInHabitat(itemId, 1)
    })
  }

  // ============================================================================
  // Guinea Pig Position Tracking (System 16: Phase 4)
  // ============================================================================

  /**
   * Find an empty cell not occupied by items
   */
  function findEmptyCell(): { x: number; y: number } | null {
    const occupiedCells = new Set<string>()

    // Mark cells occupied by items
    habitatItems.value.forEach(itemId => {
      const position = itemPositions.value.get(itemId)
      if (position) {
        // For now, assume all items are 1x1 (gridSize will be added to item metadata in future)
        // const suppliesStore = useSuppliesStore()
        // const item = suppliesStore.getItemById(itemId)
        const width = 1
        const height = 1

        for (let dy = 0; dy < height; dy++) {
          for (let dx = 0; dx < width; dx++) {
            occupiedCells.add(`${position.x + dx},${position.y + dy}`)
          }
        }
      }
    })

    // Find random empty cell
    const attempts = 50
    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(Math.random() * gridWidth)
      const y = Math.floor(Math.random() * gridHeight)
      const key = `${x},${y}`

      if (!occupiedCells.has(key)) {
        return { x, y }
      }
    }

    return null // No empty cells found
  }

  /**
   * Initialize guinea pig position (called when guinea pig becomes active)
   */
  function initializeGuineaPigPosition(guineaPigId: string) {
    // Don't re-initialize if position already exists
    if (guineaPigPositions.value.has(guineaPigId)) {
      console.log(`Guinea pig ${guineaPigId} already has a position`)
      return
    }

    // Find random unoccupied cell
    const emptyCell = findEmptyCell()

    if (emptyCell) {
      guineaPigPositions.value.set(guineaPigId, {
        x: emptyCell.x,
        y: emptyCell.y,
        lastMoved: Date.now(),
        isMoving: false
      })
      console.log(`🐹 Guinea pig ${guineaPigId} placed at (${emptyCell.x}, ${emptyCell.y})`)
    } else {
      // Default to center if no empty cells (shouldn't happen)
      const centerX = Math.floor(gridWidth / 2)
      const centerY = Math.floor(gridHeight / 2)
      guineaPigPositions.value.set(guineaPigId, {
        x: centerX,
        y: centerY,
        lastMoved: Date.now(),
        isMoving: false
      })
      console.log(`🐹 Guinea pig ${guineaPigId} placed at center (${centerX}, ${centerY})`)
    }
  }

  /**
   * Move guinea pig to new position
   */
  function moveGuineaPigTo(guineaPigId: string, x: number, y: number): boolean {
    const currentPosition = guineaPigPositions.value.get(guineaPigId)
    if (!currentPosition) {
      console.warn(`Guinea pig ${guineaPigId} has no position`)
      return false
    }

    // Bounds check
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
      console.warn(`Invalid position (${x}, ${y}) - out of bounds`)
      return false
    }

    // Update position
    guineaPigPositions.value.set(guineaPigId, {
      x,
      y,
      lastMoved: Date.now(),
      isMoving: false
    })

    // Record movement activity (increases decay)
    recordGuineaPigActivity('movement')

    return true
  }

  /**
   * Get guinea pig position
   */
  function getGuineaPigPosition(guineaPigId: string): GuineaPigPosition | null {
    return guineaPigPositions.value.get(guineaPigId) || null
  }

  /**
   * Check if position is occupied by a guinea pig
   */
  function isPositionOccupiedByGuineaPig(x: number, y: number): boolean {
    for (const position of guineaPigPositions.value.values()) {
      if (position.x === x && position.y === y) {
        return true
      }
    }
    return false
  }

  // ============================================================================
  // Item Usage History (System 16: Phase 5)
  // ============================================================================

  /**
   * Record item usage by a guinea pig
   */
  function recordItemUsage(itemId: string, guineaPigId: string) {
    const now = Date.now()
    const existing = itemUsageHistory.value.get(itemId)

    if (existing) {
      // Update existing usage
      const effectivenessDecay = Math.floor(Math.random() * 4) + 2  // 2-5 points

      itemUsageHistory.value.set(itemId, {
        lastUsedAt: now,
        usageCount: existing.usageCount + 1,
        lastUsedBy: guineaPigId,
        effectiveness: Math.max(50, existing.effectiveness - effectivenessDecay),
        freshnessBonus: existing.freshnessBonus  // Freshness bonus check happens in getItemEffectiveness
      })
    } else {
      // First time usage - record initial placement time
      itemUsageHistory.value.set(itemId, {
        lastUsedAt: now,
        usageCount: 1,
        lastUsedBy: guineaPigId,
        effectiveness: 100,
        freshnessBonus: true
      })
    }

    console.log(`📊 Item ${itemId} used by ${guineaPigId}. Effectiveness: ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
  }

  /**
   * Get item effectiveness (0-100)
   */
  function getItemEffectiveness(itemId: string): number {
    const usage = itemUsageHistory.value.get(itemId)
    if (!usage) return 100  // New item, full effectiveness

    // Check for freshness bonus
    const now = Date.now()
    const hoursSinceFirstUse = (now - usage.lastUsedAt) / (1000 * 60 * 60)

    if (usage.freshnessBonus && hoursSinceFirstUse < 24) {
      return 100  // Freshness bonus active
    }

    return usage.effectiveness
  }

  /**
   * Apply daily effectiveness recovery (called periodically from game loop)
   */
  function applyEffectivenessRecovery() {
    const now = Date.now()
    const oneDayAgo = now - 86400000  // 24 hours

    itemUsageHistory.value.forEach((usage, itemId) => {
      // If item hasn't been used in 24 hours, recover 10% effectiveness
      if (usage.lastUsedAt < oneDayAgo && usage.effectiveness < 100) {
        usage.effectiveness = Math.min(100, usage.effectiveness + 10)
        console.log(`🔄 Item ${itemId} effectiveness recovered to ${usage.effectiveness}%`)
      }

      // Disable freshness bonus after 24 hours
      if (usage.freshnessBonus && (now - usage.lastUsedAt > 86400000)) {
        usage.freshnessBonus = false
      }
    })
  }

  /**
   * Reset effectiveness when item is rotated (removed and re-added)
   */
  function resetItemEffectiveness(itemId: string) {
    const existing = itemUsageHistory.value.get(itemId)
    if (existing) {
      itemUsageHistory.value.set(itemId, {
        ...existing,
        effectiveness: Math.min(100, existing.effectiveness + 50),  // Restore 50%
        freshnessBonus: true  // Re-enable freshness bonus
      })
      console.log(`🔄 Item ${itemId} rotated - effectiveness reset to ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
    }
  }

  /**
   * Get usage statistics for debug/display
   */
  function getItemUsageStats(itemId: string): ItemUsage | null {
    return itemUsageHistory.value.get(itemId) || null
  }

  /**
   * Get items sorted by effectiveness (for rotation suggestions)
   */
  function getItemsByEffectiveness(): Array<{ itemId: string; effectiveness: number }> {
    const items: Array<{ itemId: string; effectiveness: number }> = []

    habitatItems.value.forEach(itemId => {
      const effectiveness = getItemEffectiveness(itemId)
      items.push({ itemId, effectiveness })
    })

    return items.sort((a, b) => a.effectiveness - b.effectiveness)
  }

  return {
    // State
    cleanliness,
    beddingFreshness,
    hayFreshness,
    waterLevel,
    lastCleaningTime,
    lastBeddingRefresh,
    lastHayRefill,
    lastWaterRefill,
    conditionHistory,
    currentBedding,
    currentHayBag,
    consumptionRates,
    activeAlerts,
    notificationSettings,
    habitatItems,
    itemPositions,
    bowlContents,
    hayRackContents,
    poops,
    guineaPigPositions,
    itemUsageHistory,
    decaySpeedMultiplier,

    // Computed
    overallCondition,
    needsAttention,
    criticalConditions,

    // Actions
    cleanCage,
    addPoop,
    removePoop,
    refreshBedding,
    refillHay,
    refillWater,
    consumeHayHandful,
    updateCondition,
    recordSnapshot,
    resetHabitatConditions,
    addItemToHabitat,
    removeItemFromHabitat,
    initializeStarterHabitat,
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    clearHayRack,
    clearAllHayRacks,

    // System 16: Phase 2 - Water Consumption
    consumeWater,
    hasWaterAvailable,
    getWaterBottlePosition,

    // System 16: Phase 3 - Environmental Decay
    applyEnvironmentalDecay,
    recordGuineaPigActivity,
    setDecaySpeed,

    // System 16: Phase 4 - Guinea Pig Position Tracking
    initializeGuineaPigPosition,
    moveGuineaPigTo,
    getGuineaPigPosition,
    isPositionOccupiedByGuineaPig,

    // System 16: Phase 5 - Item Usage History
    recordItemUsage,
    getItemEffectiveness,
    applyEffectivenessRecovery,
    resetItemEffectiveness,
    getItemUsageStats,
    getItemsByEffectiveness
  }
}, {
  persist: {
    key: 'gps2-habitat-conditions',
    storage: localStorage,
    serializer: {
      serialize: (state) => {
        // Convert Maps to arrays for serialization
        const serialized = {
          ...state,
          itemPositions: serializeMap(state.itemPositions as Map<string, { x: number; y: number }>),
          bowlContents: serializeMap(state.bowlContents as Map<string, any[]>),
          hayRackContents: serializeMap(state.hayRackContents as Map<string, any[]>),
          poops: state.poops || [],
          guineaPigPositions: serializeMap(state.guineaPigPositions as Map<string, GuineaPigPosition>),
          itemUsageHistory: serializeMap(state.itemUsageHistory as Map<string, ItemUsage>)
        }
        return JSON.stringify(serialized)
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        // Safely convert arrays back to Maps with fallback
        parsed.itemPositions = safeDeserializeMap<string, { x: number; y: number }>(
          parsed.itemPositions,
          new Map()
        )
        parsed.bowlContents = safeDeserializeMap<string, any[]>(
          parsed.bowlContents,
          new Map()
        )
        parsed.hayRackContents = safeDeserializeMap<string, any[]>(
          parsed.hayRackContents,
          new Map()
        )
        parsed.poops = parsed.poops || []
        parsed.guineaPigPositions = safeDeserializeMap<string, GuineaPigPosition>(
          parsed.guineaPigPositions,
          new Map()
        )
        parsed.itemUsageHistory = safeDeserializeMap<string, ItemUsage>(
          parsed.itemUsageHistory,
          new Map()
        )
        return parsed
      }
    }
  }
})
