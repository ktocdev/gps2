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

  // Bowl contents (Map of bowlItemId -> array of food items)
  interface FoodItem {
    itemId: string
    emoji: string
    name: string
  }
  const bowlContents = ref<Map<string, FoodItem[]>>(new Map())

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

    const capacity = bowlItem.stats?.foodCapacity || 2
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
    const removed = inventoryStore.removeItem(foodItemId, 1)
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
    bowlContents,

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
    initializeStarterHabitat,
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl
  }
}, {
  persist: {
    key: 'gps2-habitat-conditions',
    storage: localStorage,
    serializer: {
      serialize: (state) => {
        // Convert Maps to plain objects for serialization
        const serialized = {
          ...state,
          itemPositions: Array.from((state.itemPositions as Map<string, { x: number; y: number }>).entries()),
          bowlContents: Array.from((state.bowlContents as Map<string, any[]>).entries())
        }
        return JSON.stringify(serialized)
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        // Convert plain arrays back to Maps
        if (parsed.itemPositions && Array.isArray(parsed.itemPositions)) {
          parsed.itemPositions = new Map(parsed.itemPositions)
        }
        if (parsed.bowlContents && Array.isArray(parsed.bowlContents)) {
          parsed.bowlContents = new Map(parsed.bowlContents)
        }
        return parsed
      }
    }
  }
})
