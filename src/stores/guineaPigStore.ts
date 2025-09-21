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
  activeGuineaPigId: string | null
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
    activeGuineaPigId: null,
    lastUpdated: Date.now()
  })

  const settings = ref<GuineaPigSettings>({
    autoNeedsDecay: true,
    needsDecayRate: 1.0,
    maxGuineaPigs: 6, // Reasonable limit for Phase 2
    enableBreeding: false // Disabled for now
  })

  // Computed properties
  const allGuineaPigs = computed(() => Object.values(collection.value.guineaPigs))
  const guineaPigCount = computed(() => allGuineaPigs.value.length)
  const hasGuineaPigs = computed(() => guineaPigCount.value > 0)
  const canAddMoreGuineaPigs = computed(() => guineaPigCount.value < settings.value.maxGuineaPigs)

  const activeGuineaPig = computed(() => {
    if (!collection.value.activeGuineaPigId) return null
    return collection.value.guineaPigs[collection.value.activeGuineaPigId] || null
  })

  // Default values and generators
  const createDefaultPersonality = (): GuineaPigPersonality => ({
    friendliness: Math.floor(Math.random() * 10) + 1,
    playfulness: Math.floor(Math.random() * 10) + 1,
    curiosity: Math.floor(Math.random() * 10) + 1,
    independence: Math.floor(Math.random() * 10) + 1
  })

  const createDefaultPreferences = (): GuineaPigPreferences => {
    const foods = ['hay', 'pellets', 'carrots', 'lettuce', 'bell_peppers', 'cucumber', 'apple']
    const activities = ['tunneling', 'running', 'exploring', 'socializing', 'foraging', 'resting']
    const habitats = ['cozy_corner', 'open_space', 'multi_level', 'hiding_spots', 'window_view']

    return {
      favoriteFood: [foods[Math.floor(Math.random() * foods.length)]],
      favoriteActivity: [activities[Math.floor(Math.random() * activities.length)]],
      socialPreference: ['solitary', 'social', 'mixed'][Math.floor(Math.random() * 3)] as 'solitary' | 'social' | 'mixed',
      habitatPreference: [habitats[Math.floor(Math.random() * habitats.length)]]
    }
  }

  const createDefaultNeeds = (): GuineaPigNeeds => ({
    hunger: Math.floor(Math.random() * 30) + 20, // Start somewhat hungry (20-50)
    thirst: Math.floor(Math.random() * 20) + 10, // Start slightly thirsty (10-30)
    happiness: Math.floor(Math.random() * 25) + 15, // Start needing some happiness (15-40)
    cleanliness: Math.floor(Math.random() * 15) + 5, // Start fairly clean (5-20)
    health: Math.floor(Math.random() * 10) + 5, // Start fairly healthy (5-15)
    energy: Math.floor(Math.random() * 35) + 25, // Start somewhat tired (25-60)
    social: Math.floor(Math.random() * 40) + 30 // Start needing some social interaction (30-70)
  })

  const createDefaultStats = (): GuineaPigStats => ({
    weight: Math.floor(Math.random() * 400) + 600, // 600-1000g (realistic range)
    age: 0, // New guinea pig
    level: 1,
    experience: 0,
    wellness: 75, // Start with good wellness (will be calculated later)
    overallMood: Math.floor(Math.random() * 30) + 60 // Start with good mood (60-90)
  })

  const createDefaultAppearance = (): GuineaPigAppearance => {
    const furColors = ['brown', 'black', 'white', 'golden', 'grey', 'cream', 'chocolate']
    const furPatterns = ['solid', 'spotted', 'striped', 'patched', 'brindle', 'roan']
    const eyeColors = ['brown', 'black', 'red', 'blue']
    const sizes = ['small', 'medium', 'large']

    return {
      furColor: furColors[Math.floor(Math.random() * furColors.length)],
      furPattern: furPatterns[Math.floor(Math.random() * furPatterns.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)] as 'small' | 'medium' | 'large'
    }
  }

  // CRUD Operations
  const createGuineaPig = (name: string, gender: 'male' | 'female', breed: string): string => {
    if (!canAddMoreGuineaPigs.value) {
      throw new Error(`Cannot create more guinea pigs. Maximum limit of ${settings.value.maxGuineaPigs} reached.`)
    }

    const id = generateGuineaPigId()
    const now = Date.now()

    const newGuineaPig: GuineaPig = {
      id,
      name: name.trim(),
      gender,
      breed,
      birthDate: now,
      lastInteraction: now,
      personality: createDefaultPersonality(),
      preferences: createDefaultPreferences(),
      needs: createDefaultNeeds(),
      stats: createDefaultStats(),
      appearance: createDefaultAppearance(),
      relationships: {},
      totalInteractions: 0,
      lifetimeHappiness: 75, // Start with baseline happiness
      achievementsUnlocked: []
    }

    collection.value.guineaPigs[id] = newGuineaPig
    collection.value.lastUpdated = now

    // Set as active guinea pig if it's the first one
    if (guineaPigCount.value === 1) {
      collection.value.activeGuineaPigId = id
    }

    // Log the creation
    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Created ${name} the ${breed}! 🐹`,
      '🎉',
      {
        guineaPigId: id,
        gender,
        breed,
        personality: newGuineaPig.personality,
        appearance: newGuineaPig.appearance
      }
    )

    return id
  }

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

    // Update active guinea pig if needed
    if (collection.value.activeGuineaPigId === id) {
      const remaining = Object.keys(collection.value.guineaPigs)
      collection.value.activeGuineaPigId = remaining.length > 0 ? remaining[0] : null
    }

    collection.value.lastUpdated = Date.now()

    // Log the deletion
    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Said goodbye to ${guineaPig.name} 😢`,
      '👋',
      { guineaPigId: id, name: guineaPig.name }
    )

    return true
  }

  // Active guinea pig management
  const setActiveGuineaPig = (id: string | null): boolean => {
    if (id && !collection.value.guineaPigs[id]) {
      return false
    }

    collection.value.activeGuineaPigId = id
    collection.value.lastUpdated = Date.now()

    if (id) {
      const logging = getLoggingStore()
      const guineaPig = collection.value.guineaPigs[id]
      logging.addPlayerAction(
        `Switched to caring for ${guineaPig.name} 🔄`,
        '🐹',
        { guineaPigId: id, name: guineaPig.name }
      )
    }

    return true
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
    // Ensure active guinea pig exists
    if (collection.value.activeGuineaPigId && !collection.value.guineaPigs[collection.value.activeGuineaPigId]) {
      console.warn('Active guinea pig not found, resetting')
      const remaining = Object.keys(collection.value.guineaPigs)
      collection.value.activeGuineaPigId = remaining.length > 0 ? remaining[0] : null
    }

    // Validate guinea pig data integrity
    for (const [id, guineaPig] of Object.entries(collection.value.guineaPigs)) {
      if (!guineaPig.id || !guineaPig.name || !guineaPig.birthDate) {
        console.warn(`Invalid guinea pig data for ${id}, removing`)
        delete collection.value.guineaPigs[id]
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
    activeGuineaPig,

    // CRUD Operations
    createGuineaPig,
    getGuineaPig,
    updateGuineaPig,
    deleteGuineaPig,

    // Active management
    setActiveGuineaPig,

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