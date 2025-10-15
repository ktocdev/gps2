import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

interface BeddingInventory {
  cheap: number
  average: number
  premium: number
  colorfulPremium: { [color: string]: number }
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

  // Resource management
  const currentBedding = ref<CurrentBedding>({
    type: 'Average Bedding',
    quality: 'average',
    absorbency: 1.0,
    decayRate: 1.0
  })

  const beddingInventory = ref<BeddingInventory>({
    cheap: 0,
    average: 3,
    premium: 0,
    colorfulPremium: {}
  })

  const currentHayBag = ref<CurrentHayBag | null>({
    type: 'Timothy Hay',
    handfulsRemaining: 20,
    bagId: 'hay-001'
  })

  const consumptionRates = ref<ConsumptionData>({
    beddingUsageRate: 0,
    hayConsumptionRate: 0,
    waterConsumptionRate: 0
  })

  // Debug testing flags
  const freeResourcesEnabled = ref(false)

  // Alerts and notifications
  const activeAlerts = ref<HabitatAlert[]>([])
  const notificationSettings = ref<AlertPreferences>({
    enableAlerts: true,
    warningThreshold: 40,
    criticalThreshold: 20
  })

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

  function refreshBedding(beddingType?: 'cheap' | 'average' | 'premium' | 'colorful-premium', color?: string) {
    const type = beddingType || currentBedding.value.quality

    // Check inventory (unless free resources enabled)
    if (!freeResourcesEnabled.value) {
      if (type === 'colorful-premium' && color) {
        if ((beddingInventory.value.colorfulPremium[color] || 0) <= 0) {
          return false
        }
        beddingInventory.value.colorfulPremium[color]--
      } else if (type !== 'colorful-premium') {
        if (beddingInventory.value[type] <= 0) {
          return false
        }
        beddingInventory.value[type]--
      }
    }

    // Apply bedding type
    switch (type) {
      case 'cheap':
        currentBedding.value = {
          type: 'Cheap Bedding',
          quality: 'cheap',
          absorbency: 0.8,
          decayRate: 1.2
        }
        break
      case 'average':
        currentBedding.value = {
          type: 'Average Bedding',
          quality: 'average',
          absorbency: 1.0,
          decayRate: 1.0
        }
        break
      case 'premium':
        currentBedding.value = {
          type: 'Premium Bedding',
          quality: 'premium',
          absorbency: 1.3,
          decayRate: 0.7
        }
        break
      case 'colorful-premium':
        currentBedding.value = {
          type: `Colorful Premium Bedding (${color || 'Blue'})`,
          quality: 'colorful-premium',
          absorbency: 1.3,
          decayRate: 0.7,
          color: color || 'blue',
          stimulationBonus: 7.5
        }
        break
    }

    beddingFreshness.value = 100
    lastBeddingRefresh.value = Date.now()
    recordSnapshot()
    return true
  }

  function refillHay(handfuls: number = 20) {
    if (!freeResourcesEnabled.value && !currentHayBag.value) {
      return false
    }

    if (!currentHayBag.value) {
      currentHayBag.value = {
        type: 'Timothy Hay',
        handfulsRemaining: handfuls,
        bagId: `hay-${Date.now()}`
      }
    } else {
      // No limit - can add unlimited handfuls
      currentHayBag.value.handfulsRemaining += handfuls
    }

    hayFreshness.value = 100
    lastHayRefill.value = Date.now()
    recordSnapshot()
    return true
  }

  function useMiniHayBale() {
    // Mini-hay bale adds 3 handfuls
    return refillHay(3)
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

  function toggleFreeResources() {
    freeResourcesEnabled.value = !freeResourcesEnabled.value
  }

  function addBeddingToInventory(type: 'cheap' | 'average' | 'premium', quantity: number = 1) {
    beddingInventory.value[type] += quantity
  }

  function addColorfulBeddingToInventory(color: string, quantity: number = 1) {
    if (!beddingInventory.value.colorfulPremium[color]) {
      beddingInventory.value.colorfulPremium[color] = 0
    }
    beddingInventory.value.colorfulPremium[color] += quantity
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
    beddingInventory,
    currentHayBag,
    consumptionRates,
    freeResourcesEnabled,
    activeAlerts,
    notificationSettings,

    // Computed
    overallCondition,
    needsAttention,
    criticalConditions,

    // Actions
    cleanCage,
    refreshBedding,
    refillHay,
    useMiniHayBale,
    refillWater,
    consumeHayHandful,
    updateCondition,
    toggleFreeResources,
    addBeddingToInventory,
    addColorfulBeddingToInventory,
    recordSnapshot,
    resetHabitatConditions
  }
})
