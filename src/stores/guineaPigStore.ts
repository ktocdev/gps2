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

// Core guinea pig entity interfaces
export interface GuineaPigPersonality {
  friendliness: number    // 1-10: How social/friendly they are
  playfulness: number     // 1-10: How much they enjoy activities
  curiosity: number       // 1-10: How much they explore
  independence: number    // 1-10: How self-sufficient they are
}

export interface GuineaPigPreferences {
  favoriteFood: string[]     // Array of food items they prefer
  favoriteActivity: string[] // Array of activities they enjoy
  socialPreference: 'solitary' | 'social' | 'mixed' // How they like to interact
  habitatPreference: string[] // Preferred habitat features
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

  // Relationship data (for future friendship system)
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

  // Store initialization
  const initializeStore = () => {
    const logging = getLoggingStore()
    logging.logInfo('Guinea Pig Store initializing...')

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
    initializeStore
  }
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
  }
})