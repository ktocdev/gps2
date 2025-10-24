/**
 * Centralized Behavior State Store
 * Stores current activity and goal state for all guinea pigs
 * Allows components to access behavior state without creating multiple composable instances
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BehaviorState } from '../composables/game/useGuineaPigBehavior'

export const useBehaviorStateStore = defineStore('behaviorState', () => {
  // Map of guinea pig ID to their behavior state
  const behaviorStates = ref<Map<string, BehaviorState>>(new Map())

  /**
   * Initialize behavior state for a guinea pig
   */
  function initializeBehaviorState(guineaPigId: string): void {
    if (!behaviorStates.value.has(guineaPigId)) {
      behaviorStates.value.set(guineaPigId, {
        currentGoal: null,
        currentActivity: 'idle',
        activityStartTime: Date.now(),
        lastDecisionTime: Date.now(),
        behaviorCooldowns: new Map()
      })
    }
  }

  /**
   * Get behavior state for a guinea pig
   */
  function getBehaviorState(guineaPigId: string): BehaviorState | undefined {
    return behaviorStates.value.get(guineaPigId)
  }

  /**
   * Update behavior state for a guinea pig
   */
  function updateBehaviorState(guineaPigId: string, state: Partial<BehaviorState>): void {
    const currentState = behaviorStates.value.get(guineaPigId)
    if (currentState) {
      Object.assign(currentState, state)
    }
  }

  /**
   * Remove behavior state for a guinea pig (cleanup)
   */
  function removeBehaviorState(guineaPigId: string): void {
    behaviorStates.value.delete(guineaPigId)
  }

  /**
   * Clear all behavior states
   */
  function clearAll(): void {
    behaviorStates.value.clear()
  }

  return {
    behaviorStates,
    initializeBehaviorState,
    getBehaviorState,
    updateBehaviorState,
    removeBehaviorState,
    clearAll
  }
})
