/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGuineaPigStore } from './guineaPigStore'
import { useLoggingStore } from './loggingStore'

export const useNeedsController = defineStore('needsController', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const currentWellness = ref<number>(100)
  const wellnessHistory = ref<number[]>([])
  const lastWellnessUpdate = ref<number>(Date.now())

  const isPenaltyActive = ref<boolean>(false)
  const currentPenaltyRate = ref<number>(0)
  const penaltyStartTime = ref<number | null>(null)

  const lastBatchUpdate = ref<number>(Date.now())
  const processingEnabled = ref<boolean>(true)
  const updateIntervalMs = ref<number>(5000)

  const wellnessThresholds = ref({
    penaltyThreshold: 45,
    warningThreshold: 50,
    recoveryThreshold: 55,
    bonusThreshold: 75
  })

  const penaltyRates = ref({
    severe: -1.0,
    high: -0.75,
    medium: -0.5
  })

  function calculateWellness(guineaPigId: string): number {
    const guineaPigStore = useGuineaPigStore()
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
    if (!guineaPig) return 100

    const needs = guineaPig.needs

    const criticalPhysical = (needs.hunger + needs.thirst + needs.energy) / 3
    const externalEnvironment = (needs.social + needs.cleanliness + needs.shelter) / 3
    const maintenance = (needs.chew + needs.nails + needs.health) / 3
    const happiness = needs.happiness

    const wellness = (
      (criticalPhysical * 0.40) +
      (externalEnvironment * 0.25) +
      (maintenance * 0.20) +
      (happiness * 0.15)
    )

    return Math.max(0, Math.min(100, wellness))
  }

  function getPenaltyRate(wellness: number): number {
    if (wellness < 25) return penaltyRates.value.severe
    if (wellness < 35) return penaltyRates.value.high
    return penaltyRates.value.medium
  }

  function applyFriendshipPenalties(guineaPigId: string): void {
    const wellness = calculateWellness(guineaPigId)

    if (wellness < wellnessThresholds.value.penaltyThreshold) {
      const penaltyRate = getPenaltyRate(wellness)
      const guineaPigStore = useGuineaPigStore()

      guineaPigStore.adjustFriendship(guineaPigId, penaltyRate)

      isPenaltyActive.value = true
      currentPenaltyRate.value = penaltyRate

      if (!penaltyStartTime.value) {
        penaltyStartTime.value = Date.now()
      }

      getLoggingStore().logActivity({
        category: 'needs',
        action: 'friendship_penalty_applied',
        details: {
          guineaPigId,
          wellness,
          penaltyRate
        }
      })
    } else if (wellness > wellnessThresholds.value.recoveryThreshold) {
      isPenaltyActive.value = false
      currentPenaltyRate.value = 0
      penaltyStartTime.value = null

      if (wellness > wellnessThresholds.value.bonusThreshold) {
        const guineaPigStore = useGuineaPigStore()
        guineaPigStore.adjustFriendship(guineaPigId, 0.2)

        getLoggingStore().logActivity({
          category: 'needs',
          action: 'friendship_bonus_applied',
          details: {
            guineaPigId,
            wellness,
            bonus: 0.2
          }
        })
      }
    }
  }

  function checkThresholds(guineaPigId: string, wellness: number): void {
    if (wellness < wellnessThresholds.value.warningThreshold) {
      getLoggingStore().logActivity({
        category: 'needs',
        action: 'wellness_warning',
        details: {
          guineaPigId,
          wellness,
          threshold: wellnessThresholds.value.warningThreshold
        }
      })
    }
  }

  function processBatchUpdate(): void {
    if (!processingEnabled.value) return

    const guineaPigStore = useGuineaPigStore()

    // First, process needs decay for all active guinea pigs
    guineaPigStore.processBatchNeedsDecay()

    // Then calculate wellness and apply friendship effects
    const activeGuineaPigs = guineaPigStore.activeGuineaPigs

    activeGuineaPigs.forEach(gp => {
      const wellness = calculateWellness(gp.id)

      currentWellness.value = wellness
      wellnessHistory.value.push(wellness)
      if (wellnessHistory.value.length > 100) {
        wellnessHistory.value.shift()
      }

      applyFriendshipPenalties(gp.id)

      checkThresholds(gp.id, wellness)
    })

    lastBatchUpdate.value = Date.now()
    lastWellnessUpdate.value = Date.now()
  }

  function pauseProcessing(): void {
    processingEnabled.value = false

    getLoggingStore().logActivity({
      category: 'system',
      action: 'needs_processing_paused',
      details: { timestamp: Date.now() }
    })
  }

  function resumeProcessing(): void {
    processingEnabled.value = true
    lastBatchUpdate.value = Date.now()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'needs_processing_resumed',
      details: { timestamp: Date.now() }
    })
  }

  function resetState(): void {
    currentWellness.value = 100
    wellnessHistory.value = []
    lastWellnessUpdate.value = Date.now()
    isPenaltyActive.value = false
    currentPenaltyRate.value = 0
    penaltyStartTime.value = null
    lastBatchUpdate.value = Date.now()
    processingEnabled.value = true
  }

  return {
    currentWellness,
    wellnessHistory,
    lastWellnessUpdate,
    isPenaltyActive,
    currentPenaltyRate,
    penaltyStartTime,
    lastBatchUpdate,
    processingEnabled,
    updateIntervalMs,
    wellnessThresholds,
    penaltyRates,
    calculateWellness,
    getPenaltyRate,
    applyFriendshipPenalties,
    checkThresholds,
    processBatchUpdate,
    pauseProcessing,
    resumeProcessing,
    resetState
  }
}, {
  persist: {
    key: 'gps2-needs-controller',
    storage: sessionStorage
  }
})