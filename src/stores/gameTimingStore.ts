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
import { useGameController } from './gameController'

export const useGameTimingStore = defineStore('gameTiming', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  // Core timing state
  const isRunning = ref<boolean>(false)
  const gameLoopInterval = ref<number | null>(null)
  const lastUpdate = ref<number>(Date.now())
  const totalGameTime = ref<number>(0) // Total milliseconds of game time

  // Timing configuration
  const intervalMs = ref<number>(5000) // 5 seconds default
  const maxDeltaTime = ref<number>(30000) // 30 seconds max delta to prevent large jumps

  // Performance tracking
  const updateCount = ref<number>(0)
  const averageUpdateTime = ref<number>(0)
  const lastUpdateDuration = ref<number>(0)

  // Game loop statistics
  const stats = computed(() => ({
    isRunning: isRunning.value,
    intervalMs: intervalMs.value,
    updateCount: updateCount.value,
    totalGameTime: totalGameTime.value,
    averageUpdateTime: averageUpdateTime.value,
    lastUpdateDuration: lastUpdateDuration.value,
    uptime: Date.now() - (lastUpdate.value - totalGameTime.value)
  }))

  const startGameLoop = (): void => {
    if (isRunning.value) {
      getLoggingStore().logWarning('Game loop already running')
      return
    }

    isRunning.value = true
    lastUpdate.value = Date.now()

    gameLoopInterval.value = setInterval(() => {
      processGameTick()
    }, intervalMs.value) as unknown as number

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_started',
      details: {
        intervalMs: intervalMs.value,
        timestamp: Date.now()
      }
    })
  }

  const stopGameLoop = (): void => {
    if (!isRunning.value) return

    isRunning.value = false

    if (gameLoopInterval.value) {
      clearInterval(gameLoopInterval.value)
      gameLoopInterval.value = null
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_stopped',
      details: {
        totalUpdates: updateCount.value,
        totalGameTime: totalGameTime.value,
        timestamp: Date.now()
      }
    })
  }

  const pauseGameLoop = (): void => {
    if (!isRunning.value) return

    stopGameLoop()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_paused',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const resumeGameLoop = (): void => {
    if (isRunning.value) return

    // Reset timing to prevent large delta jumps after pause
    lastUpdate.value = Date.now()
    startGameLoop()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_resumed',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const processGameTick = (): void => {
    const updateStartTime = Date.now()
    const currentTime = updateStartTime
    let deltaTime = currentTime - lastUpdate.value

    // Prevent excessive delta times (e.g., after computer sleep)
    if (deltaTime > maxDeltaTime.value) {
      deltaTime = maxDeltaTime.value
      getLoggingStore().logActivity({
        category: 'system',
        action: 'delta_time_clamped',
        details: {
          originalDelta: currentTime - lastUpdate.value,
          clampedDelta: deltaTime
        }
      })
    }

    try {
      // Get the game controller to check if game is active
      const gameController = useGameController()

      // Only process game systems if game is in playing state
      if (gameController.isGameActive) {
        // Process needs system
        const needsController = useNeedsController()
        needsController.processBatchUpdate()

        // Update timing stats
        totalGameTime.value += deltaTime
        updateCount.value += 1
        lastUpdate.value = currentTime

        // Calculate performance metrics
        const updateDuration = Date.now() - updateStartTime
        lastUpdateDuration.value = updateDuration

        // Update rolling average of update times
        const weight = 0.1 // 10% weight for new sample
        averageUpdateTime.value = (averageUpdateTime.value * (1 - weight)) + (updateDuration * weight)

        // Log performance warnings if updates are taking too long
        if (updateDuration > 100) { // 100ms threshold
          getLoggingStore().logActivity({
            category: 'performance',
            action: 'slow_game_tick',
            details: {
              duration: updateDuration,
              deltaTime,
              updateCount: updateCount.value
            }
          })
        }

      } else {
        // Game is paused, just update the last update time to prevent delta accumulation
        lastUpdate.value = currentTime
      }

    } catch (error) {
      getLoggingStore().logActivity({
        category: 'error',
        action: 'game_tick_error',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: currentTime
        }
      })
    }
  }

  const setIntervalMs = (newInterval: number): void => {
    if (newInterval < 1000 || newInterval > 60000) {
      getLoggingStore().logWarning(`Invalid interval: ${newInterval}ms. Must be between 1000-60000ms`)
      return
    }

    const wasRunning = isRunning.value

    if (wasRunning) {
      stopGameLoop()
    }

    intervalMs.value = newInterval

    if (wasRunning) {
      startGameLoop()
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'interval_changed',
      details: {
        newInterval,
        wasRunning
      }
    })
  }

  const resetStats = (): void => {
    updateCount.value = 0
    totalGameTime.value = 0
    averageUpdateTime.value = 0
    lastUpdateDuration.value = 0
    lastUpdate.value = Date.now()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'timing_stats_reset',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const getGameTime = (): number => {
    return totalGameTime.value
  }

  const getGameTimeFormatted = (): string => {
    const seconds = Math.floor(totalGameTime.value / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return {
    // State
    isRunning,
    intervalMs,
    lastUpdate,
    totalGameTime,
    updateCount,
    averageUpdateTime,
    lastUpdateDuration,
    maxDeltaTime,

    // Computed
    stats,

    // Game loop control
    startGameLoop,
    stopGameLoop,
    pauseGameLoop,
    resumeGameLoop,

    // Configuration
    setIntervalMs,

    // Utilities
    resetStats,
    getGameTime,
    getGameTimeFormatted
  }
}, {
  persist: {
    key: 'gps2-game-timing',
    storage: sessionStorage
  }
})