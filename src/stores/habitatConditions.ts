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
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    clearHayRack,
    clearAllHayRacks
  } = containers

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

  // Note: Bowl and hay rack functions are now provided by useHabitatContainers composable

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
    clearAllBowls,
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    clearHayRack,
    clearAllHayRacks
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
