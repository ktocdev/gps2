/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoggingStore } from './loggingStore'
import { useNeedsController } from './needsController'
import { MessageGenerator } from '../utils/messageGenerator'

// Core guinea pig entity interfaces
export interface GuineaPigPersonality {
  friendliness: number    // 1-10: How social/friendly they are
  playfulness: number     // 1-10: How much they enjoy activities
  curiosity: number       // 1-10: How much they explore
  independence: number    // 1-10: How self-sufficient they are
}

export interface GuineaPigPreferences {
  favoriteFood: string[]     // Array of food items they prefer (up to 2 per category)
  dislikedFood: string[]     // Array of food items they dislike (up to 2 per category)
  favoriteActivity: string[] // Array of activities they enjoy (up to 2)
  dislikedActivity: string[] // Array of activities they dislike (up to 2)
  habitatPreference: string[] // Preferred habitat features (up to 2)
  dislikedHabitat: string[]   // Disliked habitat features (up to 2)
}

export interface GuineaPigNeeds {
  hunger: number        // 0-100: How hungry they are (100 = starving)
  thirst: number        // 0-100: How thirsty they are (100 = dehydrated)
  happiness: number     // 0-100: How much happiness they need (100 = very sad)
  cleanliness: number   // 0-100: How much they need grooming/cleaning (100 = very dirty)
  health: number        // 0-100: How much health care they need (100 = very sick)
  energy: number        // 0-100: How much rest/energy they need (100 = exhausted)
  social: number        // 0-100: How much they need social interaction (100 = lonely)
  nails: number         // 0-100: How much they need nail trimming (100 = overgrown)
  chew: number          // 0-100: How much they need chew items (100 = dental problems)
  shelter: number       // 0-100: How much they need security/shelter (100 = anxious)
}

export interface GuineaPigStats {
  weight: number        // In grams, realistic guinea pig weight range
  age: number           // In days since creation
  level: number         // Experience/growth level
  experience: number    // Experience points toward next level
  wellness: number      // 0-100: Calculated average of all needs (internal use)
  overallMood: number   // 0-100: Calculated mood based on needs and interactions
}

export interface GuineaPigAppearance {
  furColor: string      // Primary fur color
  furPattern: string    // Fur pattern type
  eyeColor: string      // Eye color
  size: 'small' | 'medium' | 'large' // Relative size
}

export interface GuineaPig {
  id: string
  name: string
  gender: 'male' | 'female'
  breed: string
  birthDate: number           // Timestamp when created
  lastInteraction: number     // Timestamp of last interaction

  // Core attributes
  personality: GuineaPigPersonality
  preferences: GuineaPigPreferences
  needs: GuineaPigNeeds
  stats: GuineaPigStats
  appearance: GuineaPigAppearance

  // Relationship data
  friendship: number          // 0-100: Relationship with player
  relationships: Record<string, number> // guinea pig ID -> friendship level (0-100)

  // Tracking data
  totalInteractions: number
  lifetimeHappiness: number   // Average happiness over lifetime
  achievementsUnlocked: string[]
}

// Store state interfaces
interface GuineaPigCollection {
  guineaPigs: Record<string, GuineaPig>
  activeGuineaPigIds: string[]  // Array to support up to 2 active guinea pigs
  lastUpdated: number
}

interface GuineaPigSettings {
  autoNeedsDecay: boolean
  needsDecayRate: number      // How fast needs decay (multiplier)
  maxGuineaPigs: number       // Limit for collection size
  enableBreeding: boolean     // Future feature toggle
}

export const useGuineaPigStore = defineStore('guineaPigStore', () => {
  // Get logging store for activity tracking
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  // Core state
  const collection = ref<GuineaPigCollection>({
    guineaPigs: {},
    activeGuineaPigIds: [],
    lastUpdated: Date.now()
  })

  const settings = ref<GuineaPigSettings>({
    autoNeedsDecay: true,
    needsDecayRate: 1.0,
    maxGuineaPigs: 10, // Allow creating multiple guinea pigs in collection
    enableBreeding: false // Disabled for now
  })

  // Computed properties
  const allGuineaPigs = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return Object.values(collection.value.guineaPigs).map(gp => ({
      ...gp,
      isActive: activeIds.includes(gp.id)
    }))
  })
  const guineaPigCount = computed(() => Object.keys(collection.value.guineaPigs).length)
  const hasGuineaPigs = computed(() => guineaPigCount.value > 0)
  const canAddMoreGuineaPigs = computed(() => guineaPigCount.value < settings.value.maxGuineaPigs)

  const activeGuineaPigs = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return activeIds
      .map(id => collection.value.guineaPigs[id])
      .filter(Boolean)
  })

  const activeGuineaPig = computed(() => {
    // For backward compatibility - returns the first active guinea pig
    return activeGuineaPigs.value[0] || null
  })

  const activeGuineaPigPair = computed(() => {
    return activeGuineaPigs.value.length === 2 ? activeGuineaPigs.value : null
  })

  const canAddActiveGuineaPig = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return activeIds.length < 2
  })



  const getGuineaPig = (id: string): GuineaPig | null => {
    return collection.value.guineaPigs[id] || null
  }

  const updateGuineaPig = (id: string, updates: Partial<GuineaPig>): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    // Prevent changing immutable properties
    const { id: _, birthDate: __, ...allowedUpdates } = updates

    collection.value.guineaPigs[id] = { ...guineaPig, ...allowedUpdates }
    collection.value.lastUpdated = Date.now()

    return true
  }

  const deleteGuineaPig = (id: string): boolean => {
    if (!collection.value.guineaPigs[id]) return false

    const guineaPig = collection.value.guineaPigs[id]
    delete collection.value.guineaPigs[id]

    // Remove from active guinea pigs if needed
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    const activeIndex = collection.value.activeGuineaPigIds.indexOf(id)
    if (activeIndex !== -1) {
      collection.value.activeGuineaPigIds.splice(activeIndex, 1)
    }

    collection.value.lastUpdated = Date.now()

    // Debug message for deletion (debug mode only)
    console.log(`[DEBUG] Deleted guinea pig: ${guineaPig.name} (ID: ${id})`)

    return true
  }

  // Active guinea pig pair management
  const addToActivePair = (id: string): boolean => {
    if (!collection.value.guineaPigs[id]) return false
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    if (collection.value.activeGuineaPigIds.includes(id)) return false
    if (collection.value.activeGuineaPigIds.length >= 2) return false

    collection.value.activeGuineaPigIds.push(id)
    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    const guineaPig = collection.value.guineaPigs[id]
    logging.addPlayerAction(
      `Added ${guineaPig.name} to active pair 🐹`,
      '➕',
      { guineaPigId: id, name: guineaPig.name }
    )

    return true
  }

  const removeFromActivePair = (id: string): boolean => {
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    const index = collection.value.activeGuineaPigIds.indexOf(id)
    if (index === -1) return false

    collection.value.activeGuineaPigIds.splice(index, 1)
    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    const guineaPig = collection.value.guineaPigs[id]
    logging.addPlayerAction(
      `Removed ${guineaPig.name} from active pair 🐹`,
      '➖',
      { guineaPigId: id, name: guineaPig.name }
    )

    return true
  }

  const setActivePair = (ids: string[]): boolean => {
    if (ids.length > 2) return false

    // Validate all IDs exist
    for (const id of ids) {
      if (!collection.value.guineaPigs[id]) return false
    }

    collection.value.activeGuineaPigIds = [...ids]
    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    if (ids.length === 0) {
      logging.addPlayerAction('Cleared active guinea pig pair', '🔄', {})
    } else {
      const names = ids.map(id => collection.value.guineaPigs[id].name).join(' & ')
      logging.addPlayerAction(
        `Set active pair: ${names} 🐹🐹`,
        '🔄',
        { guineaPigIds: ids, names }
      )
    }

    return true
  }

  // Backward compatibility function
  const setActiveGuineaPig = (id: string | null): boolean => {
    if (id === null) {
      return setActivePair([])
    }
    return setActivePair([id])
  }

  // Utility functions
  const generateGuineaPigId = (): string => {
    return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Save/Load functionality
  const getState = () => {
    return {
      collection: collection.value,
      settings: settings.value
    }
  }

  const loadState = (state: any) => {
    if (state.collection) {
      collection.value = state.collection
    }
    if (state.settings) {
      settings.value = state.settings
    }
  }

  // Needs decay system
  const needsDecayRates = ref({
    hunger: 20,       // Critical need - requires attention in 5 min sessions
    thirst: 25,       // Most critical - water needed quickly (4 min)
    happiness: 10,    // Medium-term engagement goal (10 min)
    cleanliness: 6,   // Periodic grooming needed (16 min)
    health: 2,        // Long-term care across sessions (50 min)
    energy: 15,       // Regular rest needed (7 min)
    social: 8,        // Regular interaction needed (12 min)
    nails: 1,         // Rare maintenance task (100 min)
    chew: 5,          // Moderate maintenance (20 min)
    shelter: 3        // Environmental comfort (33 min)
  })

  const needsLastUpdate = ref<Record<string, number>>({})

  const processNeedsDecay = (guineaPigId: string, deltaTimeMs: number): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig || !settings.value.autoNeedsDecay) return false

    const deltaTimeMinutes = deltaTimeMs / (1000 * 60) // Convert to minutes
    const decayMultiplier = settings.value.needsDecayRate

    // Individual variation factors (based on personality and age)
    const ageModifier = Math.max(0.5, Math.min(2.0, guineaPig.stats.age / 365)) // Age in years affects decay
    const healthModifier = Math.max(0.5, guineaPig.needs.health / 100) // Poor health accelerates some decays

    let needsChanged = false

    // Process each need with its specific decay rate
    Object.keys(needsDecayRates.value).forEach(needKey => {
      const currentValue = guineaPig.needs[needKey as keyof GuineaPigNeeds]
      const baseDecayRate = needsDecayRates.value[needKey as keyof typeof needsDecayRates.value]

      // Apply modifiers based on need type
      let finalDecayRate = baseDecayRate * decayMultiplier

      if (needKey === 'health' || needKey === 'energy') {
        finalDecayRate *= ageModifier // Age affects health and energy more
      }

      if (needKey === 'hunger' || needKey === 'thirst') {
        finalDecayRate *= healthModifier // Poor health increases basic needs
      }

      // Happiness has special boredom mechanics - handle in separate function
      if (needKey === 'happiness') {
        finalDecayRate = processHappinessDecay(guineaPig, deltaTimeMinutes, finalDecayRate)
      }

      // Calculate decay amount (needs decay downward from 100 to 0)
      const decayAmount = finalDecayRate * deltaTimeMinutes
      const newValue = Math.max(0, Math.min(100, currentValue - decayAmount))

      if (Math.abs(newValue - currentValue) > 0.01) {
        guineaPig.needs[needKey as keyof GuineaPigNeeds] = newValue
        needsChanged = true
      }
    })

    if (needsChanged) {
      collection.value.lastUpdated = Date.now()
      needsLastUpdate.value[guineaPigId] = Date.now()

      // Removed excessive needs_decay_processed logging to prevent message spam
      // This was logging every 5 seconds per guinea pig, creating 100+ messages quickly
    }

    return needsChanged
  }

  const processHappinessDecay = (guineaPig: GuineaPig, _deltaTimeMinutes: number, baseDecayRate: number): number => {
    // Happiness decay is affected by variety and boredom
    // This is a simplified version - full boredom system would track interaction history

    const timeSinceLastInteraction = Date.now() - guineaPig.lastInteraction
    const hoursSinceInteraction = timeSinceLastInteraction / (1000 * 60 * 60)

    // Accelerate happiness decay if no recent interaction
    let boredomMultiplier = 1.0
    if (hoursSinceInteraction > 2) {
      boredomMultiplier = 1.5 // 50% faster decay after 2 hours
    }
    if (hoursSinceInteraction > 6) {
      boredomMultiplier = 2.0 // 100% faster decay after 6 hours
    }

    return baseDecayRate * boredomMultiplier
  }

  const processBatchNeedsDecay = (): void => {
    const currentTime = Date.now()

    // Defensive check: ensure activeGuineaPigs is an array
    if (!Array.isArray(activeGuineaPigs.value)) {
      getLoggingStore().logWarn('activeGuineaPigs is not an array in processBatchNeedsDecay')
      return
    }

    activeGuineaPigs.value.forEach(guineaPig => {
      if (!guineaPig || !guineaPig.id) {
        getLoggingStore().logWarn('Invalid guinea pig in activeGuineaPigs during batch needs decay')
        return
      }

      // Initialize needsLastUpdate if not set (set to 5 seconds ago to allow immediate first decay)
      if (!needsLastUpdate.value[guineaPig.id]) {
        needsLastUpdate.value[guineaPig.id] = currentTime - 5000
      }

      const lastUpdate = needsLastUpdate.value[guineaPig.id]
      const deltaTime = currentTime - lastUpdate

      // Process decay on every game tick (every 5 seconds)
      if (deltaTime >= 1000) {
        processNeedsDecay(guineaPig.id, deltaTime)
      }
    })
  }

  const adjustNeed = (guineaPigId: string, needType: keyof GuineaPigNeeds, amount: number): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    const oldValue = guineaPig.needs[needType]
    const newValue = Math.max(0, Math.min(100, oldValue + amount))

    guineaPig.needs[needType] = newValue
    collection.value.lastUpdated = Date.now()

    // Removed need_adjusted logging to prevent spam when using debug sliders
    // Each slider adjustment was creating a system message

    return true
  }

  const satisfyNeed = (guineaPigId: string, needType: keyof GuineaPigNeeds, amount: number): boolean => {
    // Satisfy means increase the satisfaction level (needs are 100=satisfied, 0=empty)
    return adjustNeed(guineaPigId, needType, amount)
  }

  // Needs satisfaction mechanics for user interactions
  const feedGuineaPig = (guineaPigId: string, foodType: 'pellets' | 'hay' | 'vegetables' | 'treats' = 'pellets'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Base satisfaction amounts
    const feedingAmounts = {
      pellets: 25,     // Basic nutrition
      hay: 15,         // Continuous munching
      vegetables: 30,  // High nutrition + happiness
      treats: 35       // High satisfaction but should be limited
    }

    const hungerReduction = feedingAmounts[foodType]
    let happinessBonus = 0

    // Check preferences for bonus effects
    if (guineaPig.preferences.favoriteFood.includes(foodType)) {
      happinessBonus = 10 // Extra happiness for preferred food
    }

    // Feed the guinea pig
    satisfyNeed(guineaPigId, 'hunger', hungerReduction)
    if (happinessBonus > 0) {
      satisfyNeed(guineaPigId, 'happiness', happinessBonus)
    }

    // Vegetables provide slight thirst relief
    if (foodType === 'vegetables') {
      satisfyNeed(guineaPigId, 'thirst', 5)
    }

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const isFavorite = guineaPig.preferences.favoriteFood.includes(foodType)
    const { message, emoji } = MessageGenerator.generateFeedMessage(guineaPig.name, foodType, isFavorite)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        foodType,
        hungerReduction,
        happinessBonus,
        wasFavorite: isFavorite
      }
    )

    return true
  }

  const giveWater = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Water fully satisfies thirst
    satisfyNeed(guineaPigId, 'thirst', 40)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateWaterMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        thirstReduction: 40
      }
    )

    return true
  }

  const cleanGuineaPig = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Cleaning improves cleanliness and provides some happiness
    satisfyNeed(guineaPigId, 'cleanliness', 35)
    satisfyNeed(guineaPigId, 'happiness', 10)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateCleanMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        cleanlinessImprovement: 35,
        happinessBonus: 10
      }
    )

    return true
  }

  const playWithGuineaPig = (guineaPigId: string, activityType: string = 'general_play'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Play improves happiness, social needs, and provides some energy if not too energetic
    let happinessGain = 20
    const socialGain = 15
    let energyCost = 5 // Playing can be slightly tiring

    // Check if this activity is preferred
    const isFavorite = guineaPig.preferences.favoriteActivity.includes(activityType)
    if (isFavorite) {
      happinessGain += 10 // Bonus for preferred activities
    }

    // Apply effects
    satisfyNeed(guineaPigId, 'happiness', happinessGain)
    satisfyNeed(guineaPigId, 'social', socialGain)

    // Only tire them if they're not already tired
    if (guineaPig.needs.energy < 70) {
      adjustNeed(guineaPigId, 'energy', energyCost)
    }

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generatePlayMessage(guineaPig.name, activityType, isFavorite)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        activityType,
        happinessGain,
        socialGain,
        wasFavorite: isFavorite
      }
    )

    return true
  }

  const provideChewToy = (guineaPigId: string, toyType: string = 'wooden_block'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Chew toys satisfy chew needs and provide some happiness
    let chewSatisfaction = 30
    let happinessBonus = 5

    // Check preferences
    if (guineaPig.preferences.favoriteActivity.includes('chewing') ||
        guineaPig.preferences.favoriteActivity.includes(toyType)) {
      chewSatisfaction += 10
      happinessBonus += 10
    }

    satisfyNeed(guineaPigId, 'chew', chewSatisfaction)
    satisfyNeed(guineaPigId, 'happiness', happinessBonus)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateChewToyMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        toyType,
        chewSatisfaction,
        happinessBonus
      }
    )

    return true
  }

  const trimNails = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Nail trimming success depends on friendship and wellness
    const friendship = guineaPig.friendship

    // Get wellness from needs controller
    const needsController = useNeedsController()
    const wellness = needsController.calculateWellness(guineaPigId)

    const successRate = 40 + (friendship * 0.3) + (wellness * 0.2)
    const isSuccess = Math.random() * 100 < successRate

    let nailImprovement = 0
    let stressIncrease = 0

    if (isSuccess) {
      if (successRate >= 70) {
        // Complete success
        nailImprovement = 50
        stressIncrease = 0
      } else {
        // Partial success
        nailImprovement = 25
        stressIncrease = 5
      }
    } else {
      // Failed attempt
      nailImprovement = 5
      stressIncrease = 10
    }

    satisfyNeed(guineaPigId, 'nails', nailImprovement)
    if (stressIncrease > 0) {
      adjustNeed(guineaPigId, 'happiness', stressIncrease) // Stress reduces happiness
    }

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateTrimNailsMessage(guineaPig.name, isSuccess)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        successRate: Math.round(successRate),
        isSuccess,
        nailImprovement,
        stressIncrease
      }
    )

    return true
  }

  const provideShelter = (guineaPigId: string, shelterType: string = 'basic_hideout'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Shelter improves security needs
    let shelterSatisfaction = 25
    let happinessBonus = 5

    // Check habitat preferences
    if (guineaPig.preferences.habitatPreference.includes(shelterType) ||
        guineaPig.preferences.habitatPreference.includes('hideouts')) {
      shelterSatisfaction += 15
      happinessBonus += 10
    }

    satisfyNeed(guineaPigId, 'shelter', shelterSatisfaction)
    satisfyNeed(guineaPigId, 'happiness', happinessBonus)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateShelterMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        shelterType,
        shelterSatisfaction,
        happinessBonus
      }
    )

    return true
  }

  const performHealthCheck = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Health check improves health needs
    const healthImprovement = 20
    const happinessBonus = 5

    satisfyNeed(guineaPigId, 'health', healthImprovement)
    satisfyNeed(guineaPigId, 'happiness', happinessBonus)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateHealthCheckMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        healthImprovement,
        happinessBonus
      }
    )

    return true
  }

  const sootheToSleep = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Soothing to sleep restores energy
    satisfyNeed(guineaPigId, 'energy', 40)

    // Resting with good shelter provides bonus
    if (guineaPig.needs.shelter < 30) { // Low shelter need means good shelter
      satisfyNeed(guineaPigId, 'energy', 10) // Extra energy bonus
    }

    const { message, emoji } = MessageGenerator.generateSootheToSleepMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        energyRestored: guineaPig.needs.shelter < 30 ? 50 : 40
      }
    )

    return true
  }

  // Store initialization
  const initializeStore = () => {
    const logging = getLoggingStore()

    // Validate existing data
    validateCollection()

    logging.logInfo(`Guinea Pig Store initialized with ${guineaPigCount.value} guinea pigs`)
  }

  const validateCollection = () => {
    // Ensure activeGuineaPigIds is always initialized
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }

    // Migrate from old single active guinea pig to new pair system
    if ((collection.value as any).activeGuineaPigId) {
      const oldActiveId = (collection.value as any).activeGuineaPigId
      if (oldActiveId && collection.value.guineaPigs[oldActiveId]) {
        collection.value.activeGuineaPigIds = [oldActiveId]
      }
      delete (collection.value as any).activeGuineaPigId
      console.log('Migrated from single active guinea pig to pair system')
    }

    // Ensure active guinea pigs exist and clean up invalid IDs
    collection.value.activeGuineaPigIds = collection.value.activeGuineaPigIds.filter(id => {
      if (!collection.value.guineaPigs[id]) {
        console.warn(`Active guinea pig ${id} not found, removing from active list`)
        return false
      }
      return true
    })

    // Validate guinea pig data integrity
    for (const [id, guineaPig] of Object.entries(collection.value.guineaPigs)) {
      if (!guineaPig.id || !guineaPig.name || !guineaPig.birthDate) {
        console.warn(`Invalid guinea pig data for ${id}, removing`)
        delete collection.value.guineaPigs[id]
        // Also remove from active list if present
        const activeIndex = collection.value.activeGuineaPigIds.indexOf(id)
        if (activeIndex !== -1) {
          collection.value.activeGuineaPigIds.splice(activeIndex, 1)
        }
      }
    }
  }

  // Pet store integration methods
  const resetGuineaPigNeeds = (id: string): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    guineaPig.needs = {
      hunger: 100,
      thirst: 100,
      happiness: 100,
      cleanliness: 100,
      health: 100,
      energy: 100,
      social: 100,
      nails: 100,
      chew: 100,
      shelter: 100
    }

    guineaPig.stats.wellness = 0
    guineaPig.stats.overallMood = 0

    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    logging.logInfo(`Reset needs for guinea pig: ${guineaPig.name}`)

    return true
  }

  const returnToStore = (id: string): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    // Guinea pigs are always in the collection, this is just for metadata/logging
    const logging = getLoggingStore()
    logging.logInfo(`Guinea pig ${guineaPig.name} returned to store`)

    return true
  }

  const adjustFriendship = (id: string, amount: number): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    guineaPig.friendship = Math.max(0, Math.min(100, guineaPig.friendship + amount))
    collection.value.lastUpdated = Date.now()

    // Removed friendship change logging to prevent spam
    // This was being called every 5 seconds by wellness penalty/bonus system
    // Creating dozens of messages per minute

    return true
  }

  return {
    // State
    collection,
    settings,

    // Computed
    allGuineaPigs,
    guineaPigCount,
    hasGuineaPigs,
    canAddMoreGuineaPigs,
    activeGuineaPig,        // For backward compatibility
    activeGuineaPigs,       // New: Array of active guinea pigs
    activeGuineaPigPair,    // New: Pair when exactly 2 are active
    canAddActiveGuineaPig,  // New: Can add more to active pair

    // CRUD Operations
    getGuineaPig,
    updateGuineaPig,
    deleteGuineaPig,

    // Active management
    setActiveGuineaPig,     // For backward compatibility
    addToActivePair,        // New: Add guinea pig to active pair
    removeFromActivePair,   // New: Remove guinea pig from active pair
    setActivePair,          // New: Set the entire active pair

    // Utility
    generateGuineaPigId,

    // Save/Load
    getState,
    loadState,

    // Initialization
    initializeStore,

    // Pet store integration
    resetGuineaPigNeeds,
    returnToStore,

    // Relationship management
    adjustFriendship,

    // Needs system
    needsDecayRates,
    needsLastUpdate,
    processNeedsDecay,
    processBatchNeedsDecay,
    adjustNeed,
    satisfyNeed,

    // Interaction methods
    feedGuineaPig,
    giveWater,
    cleanGuineaPig,
    playWithGuineaPig,
    provideChewToy,
    trimNails,
    provideShelter,
    performHealthCheck,
    sootheToSleep
  }
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
  }
})