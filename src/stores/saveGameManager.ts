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

// Save game slot interfaces
export interface SaveGameSlot {
  id: string
  name: string
  createdAt: number
  lastPlayed: number
  guineaPigCount: number
  guineaPigNames: string[]
  gameProgress: {
    totalPlayTime: number
    achievementsUnlocked: number
    daysPlayed: number
  }
  isEmpty: boolean
}

export interface SaveGameMetadata {
  currentSlotId: string | null
  slots: Record<string, SaveGameSlot>
  maxSlots: number
  maxGuineaPigsPerSlot: number
  lastAutoSave: number
}

export const useSaveGameManager = defineStore('saveGameManager', () => {
  // Get logging store for activity tracking
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  // Core state
  const metadata = ref<SaveGameMetadata>({
    currentSlotId: null,
    slots: {},
    maxSlots: 3,
    maxGuineaPigsPerSlot: 2,
    lastAutoSave: Date.now()
  })

  // Computed properties
  const currentSlot = computed(() => {
    if (!metadata.value.currentSlotId) return null
    return metadata.value.slots[metadata.value.currentSlotId] || null
  })

  const allSlots = computed(() => Object.values(metadata.value.slots))
  const occupiedSlots = computed(() => allSlots.value.filter(slot => !slot.isEmpty))
  const emptySlots = computed(() => allSlots.value.filter(slot => slot.isEmpty))
  const canCreateNewSlot = computed(() => occupiedSlots.value.length < metadata.value.maxSlots)

  const slotIds = computed(() => {
    const ids: string[] = []
    for (let i = 1; i <= metadata.value.maxSlots; i++) {
      ids.push(`slot_${i}`)
    }
    return ids
  })

  // Default slot creation
  const createEmptySlot = (slotId: string): SaveGameSlot => ({
    id: slotId,
    name: `Save Slot ${slotId.replace('slot_', '')}`,
    createdAt: 0,
    lastPlayed: 0,
    guineaPigCount: 0,
    guineaPigNames: [],
    gameProgress: {
      totalPlayTime: 0,
      achievementsUnlocked: 0,
      daysPlayed: 0
    },
    isEmpty: true
  })

  // Slot management
  const initializeSlots = () => {
    slotIds.value.forEach(slotId => {
      if (!metadata.value.slots[slotId]) {
        metadata.value.slots[slotId] = createEmptySlot(slotId)
      }
    })
  }

  const createNewGameInSlot = (slotId: string, gameName?: string): boolean => {
    if (!slotIds.value.includes(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`)
      return false
    }

    const now = Date.now()
    const slotNumber = slotId.replace('slot_', '')

    metadata.value.slots[slotId] = {
      id: slotId,
      name: gameName || `Save Slot ${slotNumber}`,
      createdAt: now,
      lastPlayed: now,
      guineaPigCount: 0,
      guineaPigNames: [],
      gameProgress: {
        totalPlayTime: 0,
        achievementsUnlocked: 0,
        daysPlayed: 0
      },
      isEmpty: false
    }

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Created new game in ${metadata.value.slots[slotId].name} 🎮`,
      '💾',
      { slotId, gameName }
    )

    return true
  }

  const switchToSlot = (slotId: string): boolean => {
    if (!slotIds.value.includes(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`)
      return false
    }

    const previousSlotId = metadata.value.currentSlotId
    metadata.value.currentSlotId = slotId

    // Update last played time
    if (!metadata.value.slots[slotId].isEmpty) {
      metadata.value.slots[slotId].lastPlayed = Date.now()
    }

    const logging = getLoggingStore()
    const slotName = metadata.value.slots[slotId].name

    if (previousSlotId !== slotId) {
      logging.addPlayerAction(
        `Switched to ${slotName} 🔄`,
        '💾',
        { previousSlotId, newSlotId: slotId }
      )
    }

    return true
  }

  const saveGameToSlot = (slotId: string, gameData: any): boolean => {
    if (!slotIds.value.includes(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`)
      return false
    }

    try {
      const now = Date.now()
      const slot = metadata.value.slots[slotId]

      // Update slot metadata with current game data
      slot.lastPlayed = now
      slot.isEmpty = false
      slot.guineaPigCount = gameData.guineaPigCount || 0
      slot.guineaPigNames = gameData.guineaPigNames || []

      if (gameData.gameProgress) {
        slot.gameProgress = { ...slot.gameProgress, ...gameData.gameProgress }
      }

      const logging = getLoggingStore()
      logging.addPlayerAction(
        `Game saved to ${slot.name} 💾`,
        '✅',
        { slotId, guineaPigCount: slot.guineaPigCount }
      )

      return true
    } catch (error) {
      console.error(`Failed to save to slot ${slotId}:`, error)

      const logging = getLoggingStore()
      logging.logError(`Failed to save to slot ${slotId}: ${error}`, { slotId, error })

      return false
    }
  }

  const deleteSlot = (slotId: string): boolean => {
    if (!slotIds.value.includes(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`)
      return false
    }

    const slotName = metadata.value.slots[slotId].name
    metadata.value.slots[slotId] = createEmptySlot(slotId)

    // Clear slot-specific localStorage data
    const slotKeys = [
      `gps2-guinea-pig-store-${slotId}`,
      `gps2-game-controller-${slotId}`
    ]

    slotKeys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to clear localStorage key: ${key}`, error)
      }
    })

    // If deleting current slot, switch to first available or null
    if (metadata.value.currentSlotId === slotId) {
      const nextSlot = occupiedSlots.value.find(slot => slot.id !== slotId)
      metadata.value.currentSlotId = nextSlot?.id || null
    }

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Deleted ${slotName} 🗑️`,
      '❌',
      { slotId }
    )

    return true
  }

  const getSlotStorageKey = (baseKey: string, slotId?: string): string => {
    const activeSlotId = slotId || metadata.value.currentSlotId
    if (!activeSlotId) {
      return `${baseKey}-default`
    }
    return `${baseKey}-${activeSlotId}`
  }

  // Guinea pig management helpers
  const canAddGuineaPigToCurrentSlot = (): boolean => {
    if (!currentSlot.value || currentSlot.value.isEmpty) return false
    return currentSlot.value.guineaPigCount < metadata.value.maxGuineaPigsPerSlot
  }

  const updateSlotGuineaPigData = (guineaPigCount: number, guineaPigNames: string[]): void => {
    if (!currentSlot.value || currentSlot.value.isEmpty) return

    currentSlot.value.guineaPigCount = guineaPigCount
    currentSlot.value.guineaPigNames = [...guineaPigNames]
    currentSlot.value.lastPlayed = Date.now()
  }

  // Validation and debugging
  const validateSlots = (): boolean => {
    let isValid = true

    slotIds.value.forEach(slotId => {
      const slot = metadata.value.slots[slotId]
      if (!slot) {
        console.warn(`Missing slot: ${slotId}`)
        metadata.value.slots[slotId] = createEmptySlot(slotId)
        isValid = false
      }
    })

    // Validate current slot exists
    if (metadata.value.currentSlotId && !metadata.value.slots[metadata.value.currentSlotId]) {
      console.warn(`Current slot ${metadata.value.currentSlotId} not found, resetting`)
      metadata.value.currentSlotId = null
      isValid = false
    }

    return isValid
  }

  const getDebugInfo = () => ({
    currentSlotId: metadata.value.currentSlotId,
    occupiedSlots: occupiedSlots.value.length,
    emptySlots: emptySlots.value.length,
    canCreateNew: canCreateNewSlot.value,
    slots: metadata.value.slots
  })

  // Store initialization
  const initializeStore = () => {
    const logging = getLoggingStore()
    logging.logInfo('Save Game Manager initializing...')

    // Initialize all slot placeholders
    initializeSlots()

    // Validate existing data
    validateSlots()

    // Set default slot if none selected and slots exist
    if (!metadata.value.currentSlotId && occupiedSlots.value.length > 0) {
      const mostRecentSlot = occupiedSlots.value.reduce((latest, slot) =>
        slot.lastPlayed > latest.lastPlayed ? slot : latest
      )
      metadata.value.currentSlotId = mostRecentSlot.id
    }

    logging.logInfo(`Save Game Manager initialized - ${occupiedSlots.value.length}/${metadata.value.maxSlots} slots occupied`)
  }

  return {
    // State
    metadata,

    // Computed
    currentSlot,
    allSlots,
    occupiedSlots,
    emptySlots,
    canCreateNewSlot,
    slotIds,

    // Slot Management
    createNewGameInSlot,
    switchToSlot,
    saveGameToSlot,
    deleteSlot,
    getSlotStorageKey,

    // Guinea Pig Management
    canAddGuineaPigToCurrentSlot,
    updateSlotGuineaPigData,

    // Utilities
    validateSlots,
    getDebugInfo,
    initializeStore
  }
}, {
  persist: {
    key: 'gps2-save-game-manager',
    storage: localStorage
  }
})