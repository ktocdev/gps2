import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSuppliesStore } from './suppliesStore'
import { useInventoryStore } from './inventoryStore'
import {
  HABITAT_CONDITIONS,
  CONSUMPTION,
  POOP_CONSTANTS,
  TRACKING,
  STARTER_HABITAT_POSITIONS,
  clampCondition,
  calculatePoopCleanlinessReduction
} from '../constants/supplies'
import { safeDeserializeMap, serializeMap } from '../utils/mapSerialization'

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
  stimulationBonus?: number
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

  // Bowl contents (Map of bowlItemId -> array of food items)
  interface FoodItem {
    itemId: string
    emoji: string
    name: string
  }
  const bowlContents = ref<Map<string, FoodItem[]>>(new Map())

  // Hay rack contents (Map of hayRackItemId -> array of hay servings)
  interface HayServing {
    itemId: string
    instanceId: string
  }
  const hayRackContents = ref<Map<string, HayServing[]>>(new Map())

  // Poop tracking
  const poops = ref<Poop[]>([])

  // Computed properties
  const overallCondition = computed(() => {
    return Math.floor(
      (cleanliness.value + beddingFreshness.value + hayFreshness.value + waterLevel.value) / 4
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
      color: beddingItem.quality === 'premium' && beddingItem.tags?.includes('color') ? beddingItem.name.toLowerCase() : undefined,
      stimulationBonus: stats?.stimulationBoost
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

    return true
  }

  // Bowl management functions
  function addFoodToBowl(bowlItemId: string, foodItemId: string): boolean {
    const suppliesStore = useSuppliesStore()
    const inventoryStore = useInventoryStore()

    // Check if food item is in inventory
    if (!inventoryStore.hasItem(foodItemId)) {
      console.warn(`Food item ${foodItemId} not in inventory`)
      return false
    }

    // Get bowl item to check capacity
    const bowlItem = suppliesStore.getItemById(bowlItemId)
    if (!bowlItem) {
      console.warn(`Bowl ${bowlItemId} not found`)
      return false
    }

    const capacity = bowlItem.stats?.foodCapacity || CONSUMPTION.DEFAULT_FOOD_CAPACITY
    const currentContents = bowlContents.value.get(bowlItemId) || []

    // Check if bowl is full
    if (currentContents.length >= capacity) {
      console.warn(`Bowl is full (capacity: ${capacity})`)
      return false
    }

    // Get food item details
    const foodItem = suppliesStore.getItemById(foodItemId)
    if (!foodItem) {
      console.warn(`Food item ${foodItemId} not found`)
      return false
    }

    // Remove food from inventory (consume it)
    // Check if item uses serving system
    const hasServings = foodItem.stats?.servings !== undefined
    let removed = false

    if (hasServings) {
      // Consume one serving
      removed = inventoryStore.consumeServing(foodItemId)
    } else {
      // Remove entire item (old system)
      removed = inventoryStore.removeItem(foodItemId, 1)
    }

    if (!removed) {
      console.warn(`Failed to remove ${foodItemId} from inventory`)
      return false
    }

    // Add food to bowl
    const updatedContents = [
      ...currentContents,
      {
        itemId: foodItemId,
        emoji: foodItem.emoji || '🍽️',
        name: foodItem.name
      }
    ]

    bowlContents.value.set(bowlItemId, updatedContents)
    console.log(`Added ${foodItem.name} to bowl (${updatedContents.length}/${capacity})`)
    return true
  }

  function removeFoodFromBowl(bowlItemId: string, foodItemId: string): boolean {
    const inventoryStore = useInventoryStore()
    const currentContents = bowlContents.value.get(bowlItemId)
    if (!currentContents) {
      console.warn(`Bowl ${bowlItemId} has no contents`)
      return false
    }

    const foodIndex = currentContents.findIndex(food => food.itemId === foodItemId)
    if (foodIndex === -1) {
      console.warn(`Food ${foodItemId} not found in bowl`)
      return false
    }

    // Add food back to inventory
    inventoryStore.addItem(foodItemId, 1)

    // Remove food from bowl
    const updatedContents = currentContents.filter((_, index) => index !== foodIndex)

    if (updatedContents.length === 0) {
      bowlContents.value.delete(bowlItemId)
    } else {
      bowlContents.value.set(bowlItemId, updatedContents)
    }

    console.log(`Removed food from bowl and returned to inventory`)
    return true
  }

  function getBowlContents(bowlItemId: string): FoodItem[] {
    return bowlContents.value.get(bowlItemId) || []
  }

  function clearBowl(bowlItemId: string): void {
    bowlContents.value.delete(bowlItemId)
  }

  // Hay rack management functions
  function addHayToRack(hayRackItemId: string, hayItemId: string): boolean {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Validate that this is actually a hay item
    const item = suppliesStore.getItemById(hayItemId)
    if (!item || item.category !== 'hay') {
      console.warn(`Item ${hayItemId} is not hay - hay racks only accept hay`)
      return false
    }

    // Check if hay item is in inventory
    const totalServings = inventoryStore.getTotalServings(hayItemId)
    if (totalServings <= 0) {
      console.warn(`No servings of ${hayItemId} in inventory`)
      return false
    }

    const currentContents = hayRackContents.value.get(hayRackItemId) || []

    // Check if hay rack is full
    if (currentContents.length >= CONSUMPTION.HAY_RACK_MAX_CAPACITY) {
      console.warn(`Hay rack is full (capacity: ${CONSUMPTION.HAY_RACK_MAX_CAPACITY})`)
      return false
    }

    // Consume one serving from inventory
    const consumed = inventoryStore.consumeServing(hayItemId)
    if (!consumed) {
      console.warn(`Failed to consume serving of ${hayItemId}`)
      return false
    }

    // Add hay serving to rack
    const updatedContents = [
      ...currentContents,
      {
        itemId: hayItemId,
        instanceId: `hay_${crypto.randomUUID()}`
      }
    ]

    hayRackContents.value.set(hayRackItemId, updatedContents)
    console.log(`Added hay to rack (${updatedContents.length}/${CONSUMPTION.HAY_RACK_MAX_CAPACITY})`)
    return true
  }

  function removeHayFromRack(hayRackItemId: string, servingIndex: number): boolean {
    const currentContents = hayRackContents.value.get(hayRackItemId)
    if (!currentContents || servingIndex >= currentContents.length) {
      console.warn(`Invalid hay rack or serving index`)
      return false
    }

    const serving = currentContents[servingIndex]
    const inventoryStore = useInventoryStore()

    // Add serving back to inventory
    inventoryStore.addConsumableWithServings(serving.itemId, 1)

    // Remove serving from rack
    const updatedContents = currentContents.filter((_, index) => index !== servingIndex)

    if (updatedContents.length === 0) {
      hayRackContents.value.delete(hayRackItemId)
    } else {
      hayRackContents.value.set(hayRackItemId, updatedContents)
    }

    console.log(`Removed hay from rack and returned to inventory`)
    return true
  }

  function getHayRackContents(hayRackItemId: string): HayServing[] {
    return hayRackContents.value.get(hayRackItemId) || []
  }

  function clearHayRack(hayRackItemId: string): void {
    hayRackContents.value.delete(hayRackItemId)
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
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    clearHayRack
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
          poops: state.poops || []
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
        return parsed
      }
    }
  }
})
