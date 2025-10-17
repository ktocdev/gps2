import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSuppliesStore } from './suppliesStore'
import { useInventoryStore } from './inventoryStore'

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

interface AlertPreferences {
  enableAlerts: boolean
  warningThreshold: number
  criticalThreshold: number
}

export const useHabitatConditions = defineStore('habitatConditions', () => {
  // Core conditions (0-100)
  const cleanliness = ref(85)
  const beddingFreshness = ref(90)
  const hayFreshness = ref(95)
  const waterLevel = ref(100)

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
    absorbency: 1.0,
    decayRate: 1.0
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
    warningThreshold: 40,
    criticalThreshold: 20
  })

  // Habitat Items (items currently placed in the habitat)
  const habitatItems = ref<string[]>([])

  // Item positions (Map of itemId -> grid position)
  const itemPositions = ref<Map<string, { x: number; y: number }>>(new Map())

  // Computed properties
  const overallCondition = computed(() => {
    return Math.floor(
      (cleanliness.value + beddingFreshness.value + hayFreshness.value + waterLevel.value) / 4
    )
  })

  const needsAttention = computed(() => {
    return (
      cleanliness.value < 40 ||
      beddingFreshness.value < 40 ||
      hayFreshness.value < 40 ||
      waterLevel.value < 40
    )
  })

  const criticalConditions = computed(() => {
    const critical: string[] = []
    if (cleanliness.value < 20) critical.push('Cleanliness')
    if (beddingFreshness.value < 20) critical.push('Bedding')
    if (hayFreshness.value < 20) critical.push('Hay')
    if (waterLevel.value < 20) critical.push('Water')
    return critical
  })

  // Actions
  function cleanCage() {
    cleanliness.value = 100
    lastCleaningTime.value = Date.now()
    recordSnapshot()
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
      absorbency: stats?.absorbency || 1.0,
      decayRate: stats?.decayRate || 1.0,
      color: beddingItem.quality === 'premium' && beddingItem.tags?.includes('color') ? beddingItem.name.toLowerCase() : undefined,
      stimulationBonus: stats?.stimulationBoost
    }

    beddingFreshness.value = 100
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

    // All hay bags have 20 handfuls
    const handfuls = 20

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

    hayFreshness.value = 100
    lastHayRefill.value = Date.now()
    recordSnapshot()
    return true
  }

  function refillWater() {
    waterLevel.value = 100
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

    // Keep only last 100 snapshots
    if (conditionHistory.value.length > 100) {
      conditionHistory.value.shift()
    }
  }

  function updateCondition(condition: string, value: number) {
    value = Math.max(0, Math.min(100, value))

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
    cleanliness.value = 100
    beddingFreshness.value = 100
    hayFreshness.value = 100
    waterLevel.value = 100

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

    return true
  }

  function initializeStarterHabitat(starterItemIds: string[]) {
    // Add starter items to habitat without checking inventory
    habitatItems.value = [...starterItemIds]

    // Set default positions for starter items (centered and spaced apart)
    // Assuming medium habitat: 14x10 grid
    const defaultPositions: { [key: string]: { x: number; y: number } } = {
      'habitat_plastic_igloo': { x: 3, y: 7 },         // Lower-left - 3 from left, 7 from top
      'habitat_ceramic_bowl': { x: 9, y: 4 },          // Center-right - 9 from left, 4 from top
      'habitat_basic_hay_rack': { x: 11, y: 4 },       // Right of dish - 11 from left, 4 from top
      'habitat_basic_water_bottle': { x: 0, y: 0 }     // Top-left corner
    }

    // Apply default positions
    starterItemIds.forEach(itemId => {
      if (defaultPositions[itemId]) {
        itemPositions.value.set(itemId, defaultPositions[itemId])
        console.log(`Setting starter position for ${itemId}:`, defaultPositions[itemId])
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

    // Computed
    overallCondition,
    needsAttention,
    criticalConditions,

    // Actions
    cleanCage,
    refreshBedding,
    refillHay,
    refillWater,
    consumeHayHandful,
    updateCondition,
    recordSnapshot,
    resetHabitatConditions,
    addItemToHabitat,
    removeItemFromHabitat,
    initializeStarterHabitat
  }
}, {
  persist: {
    key: 'gps2-habitat-conditions',
    storage: localStorage
  }
})
