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
import { useGuineaPigStore } from './guineaPigStore'

// TypeScript interfaces
interface GameState {
  currentState: 'intro' | 'playing' | 'paused' | 'stopped'
  pauseReason?: 'manual' | 'orientation' | 'navigation' | null
  hasGuineaPig: boolean
  isFirstTimeUser: boolean
  lastSaveTimestamp: number
}

interface GameSettings {
  autoSave: {
    enabled: boolean
    frequency: 30 | 60 | 120 // seconds
  }
  tutorial: {
    mode: 'auto' | 'always_show' | 'never_show'
    isGlobalFirstTime: boolean
  }
  performance: {
    mode: 'standard' | 'reduced'
  }
  errorReporting: {
    enabled: boolean
  }
}

interface SaveData {
  gameState: GameState
  settings: GameSettings
  loggingState?: any // Optional for backwards compatibility
  guineaPigState?: any // Optional for backwards compatibility
  version: string
}

export const useGameController = defineStore('gameController', () => {
  // Get stores (lazy initialization to avoid circular dependencies)
  let loggingStore: any = null
  let guineaPigStore: any = null

  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const getGuineaPigStore = () => {
    if (!guineaPigStore) {
      guineaPigStore = useGuineaPigStore()
    }
    return guineaPigStore
  }

  // Core state
  const gameState = ref<GameState>({
    currentState: 'intro',
    pauseReason: null,
    hasGuineaPig: false,
    isFirstTimeUser: true,
    lastSaveTimestamp: Date.now()
  })

  // Settings with defaults
  const settings = ref<GameSettings>({
    autoSave: {
      enabled: true,
      frequency: 60
    },
    tutorial: {
      mode: 'auto',
      isGlobalFirstTime: true
    },
    performance: {
      mode: 'standard'
    },
    errorReporting: {
      enabled: import.meta.env.DEV
    }
  })

  // Computed properties
  const isGameActive = computed(() => gameState.value.currentState === 'playing')
  const isPaused = computed(() => gameState.value.currentState === 'paused')
  const isManuallyPaused = computed(() =>
    gameState.value.currentState === 'paused' && gameState.value.pauseReason === 'manual'
  )
  const isOrientationPaused = computed(() =>
    gameState.value.currentState === 'paused' && gameState.value.pauseReason === 'orientation'
  )

  // Guinea pig related computed properties
  const hasGuineaPig = computed(() => {
    const guineaPigStore = getGuineaPigStore()
    return guineaPigStore.hasGuineaPigs
  })

  const activeGuineaPig = computed(() => {
    const guineaPigStore = getGuineaPigStore()
    return guineaPigStore.activeGuineaPig
  })

  // State transition validation
  const isValidTransition = (from: string, to: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      intro: ['playing'],
      playing: ['paused', 'stopped'],
      paused: ['playing', 'stopped'],
      stopped: ['intro', 'playing']
    }
    return validTransitions[from]?.includes(to) || false
  }

  // State management actions
  const setState = (newState: GameState['currentState'], pauseReason?: GameState['pauseReason']) => {
    if (!isValidTransition(gameState.value.currentState, newState)) {
      // Log to both console and error tracking system
      console.error(`Invalid state transition: ${gameState.value.currentState} -> ${newState}`)
      const logging = getLoggingStore()
      logging.logError(`Invalid state transition: ${gameState.value.currentState} -> ${newState}`, {
        from: gameState.value.currentState,
        to: newState,
        source: 'gameController'
      })
      return false
    }

    const previousState = gameState.value.currentState
    gameState.value.currentState = newState
    gameState.value.pauseReason = newState === 'paused' ? pauseReason : null
    gameState.value.lastSaveTimestamp = Date.now()

    // Log state changes
    const logging = getLoggingStore()
    const stateMessages = {
      intro: 'Game started - Welcome to Guinea Pig Simulator! 🎮',
      playing: 'Game resumed - Your guinea pig is ready for care! 🐹',
      paused: `Game paused${pauseReason ? ` (${pauseReason})` : ''} ⏸️`,
      stopped: 'Game stopped - See you next time! 👋'
    }

    if (previousState !== newState) {
      logging.addPlayerAction(
        stateMessages[newState] || `Game state changed to ${newState}`,
        '🎮',
        { previousState, newState, pauseReason }
      )
    }

    return true
  }

  const startGame = () => {
    if (hasGuineaPig.value) {
      setState('playing')
    } else {
      console.error('Cannot start game without guinea pig')
    }
  }

  const pauseGame = (reason: 'manual' | 'orientation' | 'navigation' = 'manual') => {
    if (gameState.value.currentState === 'playing') {
      setState('paused', reason)
    } else if (gameState.value.currentState === 'paused') {
      // Pause reason priority: manual > navigation > orientation
      const currentReason = gameState.value.pauseReason
      if (reason === 'manual' ||
          (reason === 'navigation' && currentReason === 'orientation')) {
        gameState.value.pauseReason = reason
      }
    }
  }

  const resumeGame = () => {
    if (gameState.value.currentState === 'paused') {
      setState('playing')
    }
  }

  const stopGame = () => {
    if (['playing', 'paused'].includes(gameState.value.currentState)) {
      setState('stopped')
    }
  }

  const newGame = (clearGuineaPigs: boolean = true) => {
    gameState.value = {
      currentState: 'intro',
      pauseReason: null,
      hasGuineaPig: false,
      isFirstTimeUser: settings.value.tutorial.isGlobalFirstTime,
      lastSaveTimestamp: Date.now()
    }

    // Only clear guinea pig store if explicitly requested (for true new game)
    if (clearGuineaPigs) {
      const guineaPigStore = getGuineaPigStore()
      guineaPigStore.collection.guineaPigs = {}
      guineaPigStore.collection.activeGuineaPigId = null
      guineaPigStore.collection.lastUpdated = Date.now()
    }
  }

  const setGuineaPigCreated = () => {
    gameState.value.hasGuineaPig = true
    gameState.value.isFirstTimeUser = false
    settings.value.tutorial.isGlobalFirstTime = false

    // Transition to playing state after creating guinea pig
    if (gameState.value.currentState === 'intro') {
      setState('playing')
    }

    const logging = getLoggingStore()
    logging.addAchievement('First Guinea Pig Created! 🐹', '🏆', {
      isFirstTimeUser: true,
      timestamp: Date.now()
    })
  }

  // Guinea pig creation helper that integrates with both stores
  const createGuineaPig = (name: string, gender: 'male' | 'female', breed: string): string => {
    const guineaPigStore = getGuineaPigStore()
    const guineaPigId = guineaPigStore.createGuineaPig(name, gender, breed)

    // Update game state to reflect guinea pig creation
    if (!hasGuineaPig.value) {
      setGuineaPigCreated()
    }

    // Sync game state with guinea pig data
    syncGameStateWithGuineaPigs()

    return guineaPigId
  }

  // State synchronization helpers
  const syncGameStateWithGuineaPigs = () => {
    const guineaPigStore = getGuineaPigStore()
    gameState.value.hasGuineaPig = guineaPigStore.hasGuineaPigs
  }

  // For future implementation of save game manager integration
  const syncGameStateWithSaveManager = () => {
    // This will be implemented when we add UI integration
    syncGameStateWithGuineaPigs()
  }

  // Save/Load functionality
  const createSaveData = (): SaveData => {
    const logging = getLoggingStore()
    const guineaPigStore = getGuineaPigStore()
    return {
      gameState: { ...gameState.value },
      settings: { ...settings.value },
      loggingState: logging.getState(),
      guineaPigState: guineaPigStore.getState(),
      version: '1.0.0'
    }
  }

  const saveGame = (slotIndex: number = 0): boolean => {
    try {
      const saveData = createSaveData()
      localStorage.setItem(`gps2-save-slot-${slotIndex}`, JSON.stringify(saveData))
      gameState.value.lastSaveTimestamp = Date.now()

      const logging = getLoggingStore()
      logging.logDebug(`Game saved successfully to slot ${slotIndex + 1}`, {
        slotIndex,
        timestamp: gameState.value.lastSaveTimestamp
      })
      return true
    } catch (error) {
      console.error('Failed to save game:', error)
      const logging = getLoggingStore()
      logging.logError(`Failed to save game: ${error}`, { error })

      if (settings.value.errorReporting.enabled) {
        // Error reporting would go here
      }
      return false
    }
  }

  const loadGame = (slotIndex: number = 0): boolean => {
    try {
      const savedData = localStorage.getItem(`gps2-save-slot-${slotIndex}`)
      if (!savedData) return false

      const saveData: SaveData = JSON.parse(savedData)

      // Validate save data structure
      if (!saveData.gameState || !saveData.settings) {
        throw new Error('Corrupted save data: missing required fields')
      }

      // Load state
      gameState.value = { ...saveData.gameState }
      settings.value = { ...saveData.settings }

      // Load logging state if available (backwards compatibility)
      const logging = getLoggingStore()
      if (saveData.loggingState) {
        logging.loadState(saveData.loggingState)
      }

      // Load guinea pig state if available (backwards compatibility)
      const guineaPigStore = getGuineaPigStore()
      if (saveData.guineaPigState) {
        guineaPigStore.loadState(saveData.guineaPigState)
      }

      // State recovery validation
      if (!isValidCurrentState()) {
        console.warn('Invalid state detected, recovering...')
        logging.logWarn('Invalid game state detected, attempting recovery')
        recoverFromInvalidState()
      }

      logging.logInfo(`Game loaded successfully from slot ${slotIndex + 1}`, {
        slotIndex,
        gameState: saveData.gameState.currentState,
        hasGuineaPig: saveData.gameState.hasGuineaPig
      })

      return true
    } catch (error) {
      console.error('Failed to load game:', error)
      const logging = getLoggingStore()
      logging.logError(`Failed to load game: ${error}`, { error })

      if (settings.value.errorReporting.enabled) {
        // Error reporting would go here
      }
      handleCorruptedSave()
      return false
    }
  }

  const isValidCurrentState = (): boolean => {
    const state = gameState.value

    // Check for invalid state combinations
    if (state.currentState === 'playing' && !state.hasGuineaPig) {
      return false
    }

    if (state.currentState === 'paused' && !state.pauseReason) {
      return false
    }

    return true
  }

  const recoverFromInvalidState = () => {
    if (gameState.value.hasGuineaPig) {
      gameState.value.currentState = 'playing'
      gameState.value.pauseReason = null
    } else {
      gameState.value.currentState = 'intro'
      gameState.value.pauseReason = null
    }
  }

  const handleCorruptedSave = () => {
    console.warn('Corrupted save detected, starting fresh game')
    newGame()
    // Could show user notification here
  }

  // Settings management
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveGame() // Auto-save settings changes
  }

  const updateAutoSaveFrequency = (frequency: 30 | 60 | 120) => {
    settings.value.autoSave.frequency = frequency
    saveGame()
  }

  const toggleAutoSave = () => {
    settings.value.autoSave.enabled = !settings.value.autoSave.enabled
    saveGame()
  }

  const setTutorialMode = (mode: 'auto' | 'always_show' | 'never_show') => {
    settings.value.tutorial.mode = mode
    saveGame()
  }

  const setPerformanceMode = (mode: 'standard' | 'reduced') => {
    settings.value.performance.mode = mode
    saveGame()
  }

  const toggleErrorReporting = () => {
    settings.value.errorReporting.enabled = !settings.value.errorReporting.enabled
    saveGame()
  }

  // Auto-save functionality
  let autoSaveInterval: number | null = null

  const startAutoSave = () => {
    if (!settings.value.autoSave.enabled) return

    stopAutoSave() // Clear any existing interval

    autoSaveInterval = setInterval(() => {
      if (isGameActive.value) {
        saveGame()
      }
    }, settings.value.autoSave.frequency * 1000)
  }

  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }

  // Initialize store
  const initializeStore = () => {
    const logging = getLoggingStore()
    const guineaPigStore = getGuineaPigStore()

    logging.logInfo('Game Controller initializing...')

    // Initialize guinea pig store first
    guineaPigStore.initializeStore()

    // Sync state with guinea pig store
    syncGameStateWithGuineaPigs()

    // Attempt to load existing save
    const loaded = loadGame()

    if (!loaded) {
      // Check if guinea pig store has data (from persistence)
      if (guineaPigStore.hasGuineaPigs) {
        // Guinea pig data exists, sync state but don't clear
        logging.logInfo('Guinea pig data found, syncing state')
        syncGameStateWithGuineaPigs()
      } else {
        // No save and no guinea pig data, start fresh
        logging.logInfo('No save data found, starting new game')
        newGame(true) // Clear everything for fresh start
      }
    }

    // Start auto-save if enabled
    if (settings.value.autoSave.enabled) {
      startAutoSave()
      logging.logDebug(`Auto-save enabled with ${settings.value.autoSave.frequency}s frequency`)
    }

    logging.logInfo('Game Controller initialized successfully')
  }

  // Save slot management functions
  const getSaveSlotInfo = (slotIndex: number) => {
    const savedData = localStorage.getItem(`gps2-save-slot-${slotIndex}`)
    if (!savedData) return null

    try {
      const saveData: SaveData = JSON.parse(savedData)

      // Extract guinea pig collection data
      const guineaPigs = saveData.guineaPigState?.collection?.guineaPigs || {}
      const guineaPigList = Object.values(guineaPigs)

      // Handle both old single active and new pairs format
      let activeGuineaPigIds: string[] = []
      if (saveData.guineaPigState?.collection?.activeGuineaPigIds) {
        // New pairs format
        activeGuineaPigIds = saveData.guineaPigState.collection.activeGuineaPigIds
      } else if (saveData.guineaPigState?.collection?.activeGuineaPigId) {
        // Old single active format
        activeGuineaPigIds = [saveData.guineaPigState.collection.activeGuineaPigId]
      }

      return {
        slotNumber: slotIndex + 1, // Display number (1-based)
        slotIndex, // Internal index (0-based)
        exists: true,
        timestamp: saveData.gameState.lastSaveTimestamp,
        gameState: saveData.gameState.currentState,
        hasGuineaPig: saveData.gameState.hasGuineaPig,
        lastSave: new Date(saveData.gameState.lastSaveTimestamp).toLocaleString(),
        guineaPigCount: guineaPigList.length,
        activePairCount: activeGuineaPigIds.length,
        isPair: activeGuineaPigIds.length === 2,
        guineaPigs: guineaPigList.map((gp: any) => ({
          id: gp.id,
          name: gp.name,
          gender: gp.gender,
          breed: gp.breed,
          level: gp.stats?.level || 1,
          wellness: gp.stats?.wellness || 0,
          isActive: activeGuineaPigIds.includes(gp.id)
        }))
      }
    } catch {
      return null
    }
  }

  const getAllSaveSlots = () => {
    const slots = []
    const maxSlots = 5 // Maximum number of save slots

    // Find all existing save slots
    for (let i = 0; i < maxSlots; i++) {
      const slotInfo = getSaveSlotInfo(i)
      if (slotInfo) {
        slots.push(slotInfo)
      } else {
        break // No more slots exist
      }
    }

    return slots
  }

  const getAllSaveSlotsWithEmpty = () => {
    const existingSlots = getAllSaveSlots()
    const guineaPigStore = getGuineaPigStore()

    // Get available guinea pigs (not in any save)
    const allSlots = existingSlots
    const usedGuineaPigIds = new Set<string>()
    allSlots.forEach(slot => {
      if (slot.exists && slot.guineaPigs) {
        slot.guineaPigs.forEach((gp: any) => usedGuineaPigIds.add(gp.id))
      }
    })

    const availableGuineaPigs = guineaPigStore.allGuineaPigs.filter((gp: any) => !usedGuineaPigIds.has(gp.id))
    const hasAvailableGuineaPigs = availableGuineaPigs.length > 0

    // Add empty slot if we have existing saves and available guinea pigs
    if (existingSlots.length > 0 && hasAvailableGuineaPigs && existingSlots.length < 5) {
      existingSlots.push({
        slotNumber: existingSlots.length + 1,
        slotIndex: existingSlots.length,
        exists: false,
        timestamp: 0,
        gameState: 'intro' as const,
        hasGuineaPig: false,
        lastSave: 'Empty',
        guineaPigCount: 0,
        activePairCount: 0,
        isPair: false,
        guineaPigs: []
      })
    }

    // If no existing slots, always show first slot
    if (existingSlots.length === 0) {
      existingSlots.push({
        slotNumber: 1,
        slotIndex: 0,
        exists: false,
        timestamp: 0,
        gameState: 'intro' as const,
        hasGuineaPig: false,
        lastSave: 'Empty',
        guineaPigCount: 0,
        activePairCount: 0,
        isPair: false,
        guineaPigs: []
      })
    }

    return existingSlots
  }

  const deleteSaveSlot = (slotIndex: number): boolean => {
    try {
      // Remove the slot
      localStorage.removeItem(`gps2-save-slot-${slotIndex}`)

      // Compact remaining slots by shifting them down
      const maxSlots = 5

      // Remove all slots after the deleted one
      for (let i = slotIndex + 1; i < maxSlots; i++) {
        const slotData = localStorage.getItem(`gps2-save-slot-${i}`)
        if (slotData) {
          localStorage.removeItem(`gps2-save-slot-${i}`)
        }
      }

      // Re-save the remaining slots in consecutive order
      const remainingSlots = []
      for (let i = 0; i < maxSlots; i++) {
        if (i === slotIndex) continue // Skip the deleted slot

        const slotData = localStorage.getItem(`gps2-save-slot-${i}`)
        if (slotData) {
          remainingSlots.push(slotData)
          localStorage.removeItem(`gps2-save-slot-${i}`)
        }
      }

      // Re-save in consecutive order starting from 0
      remainingSlots.forEach((slotData, index) => {
        localStorage.setItem(`gps2-save-slot-${index}`, slotData)
      })

      const logging = getLoggingStore()
      logging.logInfo(`Save slot ${slotIndex + 1} deleted and slots compacted`)
      return true
    } catch (error) {
      console.error(`Failed to delete save slot ${slotIndex + 1}:`, error)
      return false
    }
  }

  return {
    // State
    gameState,
    settings,

    // Computed
    isGameActive,
    isPaused,
    isManuallyPaused,
    isOrientationPaused,
    hasGuineaPig,
    activeGuineaPig,

    // Actions
    setState,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    newGame,
    setGuineaPigCreated,
    createGuineaPig,

    // Save/Load
    saveGame,
    loadGame,
    getSaveSlotInfo,
    getAllSaveSlots,
    getAllSaveSlotsWithEmpty,
    deleteSaveSlot,

    // Settings
    updateSettings,
    updateAutoSaveFrequency,
    toggleAutoSave,
    setTutorialMode,
    setPerformanceMode,
    toggleErrorReporting,

    // Auto-save
    startAutoSave,
    stopAutoSave,

    // Initialization
    initializeStore,

    // State synchronization
    syncGameStateWithGuineaPigs,
    syncGameStateWithSaveManager
  }
}, {
  persist: {
    key: 'gps2-game-controller',
    storage: localStorage
  }
})