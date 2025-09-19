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

// TypeScript interfaces
interface GameState {
  currentState: 'intro' | 'playing' | 'paused' | 'stopped'
  pauseReason?: 'manual' | 'orientation' | null
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
  version: string
}

export const useGameController = defineStore('gameController', () => {
  // Get logging store (lazy initialization to avoid circular dependencies)
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
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

  // State transition validation
  const isValidTransition = (from: string, to: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      intro: ['playing'],
      playing: ['paused', 'stopped'],
      paused: ['playing', 'stopped'],
      stopped: ['intro']
    }
    return validTransitions[from]?.includes(to) || false
  }

  // State management actions
  const setState = (newState: GameState['currentState'], pauseReason?: GameState['pauseReason']) => {
    if (!isValidTransition(gameState.value.currentState, newState)) {
      console.error(`Invalid state transition: ${gameState.value.currentState} -> ${newState}`)
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
    if (gameState.value.hasGuineaPig) {
      setState('playing')
    } else {
      console.error('Cannot start game without guinea pig')
    }
  }

  const pauseGame = (reason: 'manual' | 'orientation' = 'manual') => {
    if (gameState.value.currentState === 'playing') {
      setState('paused', reason)
    } else if (gameState.value.currentState === 'paused' && reason === 'manual') {
      // Manual pause overrides orientation pause
      gameState.value.pauseReason = 'manual'
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

  const newGame = () => {
    gameState.value = {
      currentState: 'intro',
      pauseReason: null,
      hasGuineaPig: false,
      isFirstTimeUser: settings.value.tutorial.isGlobalFirstTime,
      lastSaveTimestamp: Date.now()
    }
  }

  const setGuineaPigCreated = () => {
    gameState.value.hasGuineaPig = true
    gameState.value.isFirstTimeUser = false
    settings.value.tutorial.isGlobalFirstTime = false

    const logging = getLoggingStore()
    logging.addAchievement('First Guinea Pig Created! 🐹', '🏆', {
      isFirstTimeUser: true,
      timestamp: Date.now()
    })
  }

  // Save/Load functionality
  const createSaveData = (): SaveData => {
    const logging = getLoggingStore()
    return {
      gameState: { ...gameState.value },
      settings: { ...settings.value },
      loggingState: logging.getState(),
      version: '1.0.0'
    }
  }

  const saveGame = (): boolean => {
    try {
      const saveData = createSaveData()
      localStorage.setItem('gps2-save', JSON.stringify(saveData))
      gameState.value.lastSaveTimestamp = Date.now()

      const logging = getLoggingStore()
      logging.logDebug('Game saved successfully', { timestamp: gameState.value.lastSaveTimestamp })
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

  const loadGame = (): boolean => {
    try {
      const savedData = localStorage.getItem('gps2-save')
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

      // State recovery validation
      if (!isValidCurrentState()) {
        console.warn('Invalid state detected, recovering...')
        logging.logWarn('Invalid game state detected, attempting recovery')
        recoverFromInvalidState()
      }

      logging.logInfo('Game loaded successfully', {
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
    logging.logInfo('Game Controller initializing...')

    // Attempt to load existing save
    const loaded = loadGame()

    if (!loaded) {
      // No save found or corrupted, start fresh
      logging.logInfo('No save data found, starting new game')
      newGame()
    }

    // Start auto-save if enabled
    if (settings.value.autoSave.enabled) {
      startAutoSave()
      logging.logDebug(`Auto-save enabled with ${settings.value.autoSave.frequency}s frequency`)
    }

    logging.logInfo('Game Controller initialized successfully')
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

    // Actions
    setState,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    newGame,
    setGuineaPigCreated,

    // Save/Load
    saveGame,
    loadGame,

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
    initializeStore
  }
}, {
  persist: {
    key: 'gps2-game-controller',
    storage: localStorage
  }
})