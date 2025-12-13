/**
 * 3D Unified Behavior Composable
 * Priority-based behavior system for guinea pigs in 3D
 * Follows the 2D pattern from useGuineaPigBehavior.ts
 *
 * - Single movement controller per guinea pig
 * - Evaluates all needs and selects highest priority
 * - Handles: hunger (eat), thirst (drink), wandering
 * - Extensible for future needs (sleep, groom, play, etc.)
 */

import { ref, onUnmounted } from 'vue'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useGameController } from '../../stores/gameController'
import { use3DMovement } from './use3DMovement'
import type { Vector3D } from '../../types/movement3d'

// Behavior types (extensible for future needs)
export type Behavior3DType = 'eat' | 'drink' | 'wander'

// Goal structure matching 2D pattern
export interface Behavior3DGoal {
  type: Behavior3DType
  target: Vector3D | null
  priority: number
  estimatedDuration: number
  needSatisfied?: 'hunger' | 'thirst'
  targetItemId?: string
}

// Activity states for UI/animation
export type Activity3DType = 'idle' | 'walking' | 'eating' | 'drinking'

// Configuration
const BEHAVIOR_TICK_INTERVAL = 2000 // Check behavior every 2 seconds

const THRESHOLDS = {
  hunger: 70,  // Seek food when hunger < 70
  thirst: 65   // Seek water when thirst < 65
}

const COOLDOWNS = {
  eat: 10000,    // 10 seconds after eating
  drink: 8000,   // 8 seconds after drinking
  wander: 3000   // 3 seconds between wanders
}

const DURATIONS = {
  eat: 3000,     // 3 seconds to eat
  drink: 3000    // 3 seconds to drink
}

const RESTORE_AMOUNTS = {
  hunger: 50,    // Restore 50 hunger when eating
  thirst: 35     // Restore 35 thirst when drinking
}

// Poop configuration
const POOP_INTERVAL_MS = 30000 // 30 seconds between poops
const SUBGRID_SCALE = 4

export function use3DBehavior(guineaPigId: string) {
  const movement3DStore = useMovement3DStore()
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const suppliesStore = useSuppliesStore()
  const gameController = useGameController()

  // Single movement controller for all behaviors
  const movement = use3DMovement(guineaPigId)

  // Behavior state
  const currentActivity = ref<Activity3DType>('idle')
  const currentGoal = ref<Behavior3DGoal | null>(null)
  const behaviorCooldowns = new Map<Behavior3DType, number>()

  // Interval handles
  let behaviorInterval: number | null = null
  let actionTimeout: number | null = null

  // Callbacks for external notification (bubbles, animations)
  let onDrinkingStartCallback: (() => void) | null = null
  let onDrinkingEndCallback: (() => void) | null = null
  let onEatingStartCallback: (() => void) | null = null
  let onEatingEndCallback: (() => void) | null = null

  /**
   * Get the guinea pig data
   */
  function getGuineaPig() {
    return guineaPigStore.collection.guineaPigs[guineaPigId]
  }

  /**
   * Check if behavior is on cooldown
   */
  function isOnCooldown(behaviorType: Behavior3DType): boolean {
    const cooldownEnd = behaviorCooldowns.get(behaviorType)
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  /**
   * Set behavior cooldown
   */
  function setCooldown(behaviorType: Behavior3DType, durationMs: number): void {
    behaviorCooldowns.set(behaviorType, Date.now() + durationMs)
  }

  /**
   * Calculate priority for a need-based behavior (2D pattern)
   * Lower need value = higher urgency = higher priority
   */
  function calculateNeedPriority(needValue: number, threshold: number, baseWeight: number): number {
    if (needValue >= threshold) return 0
    const urgency = (threshold - needValue) / threshold
    return baseWeight * urgency
  }

  /**
   * Find the position of a food bowl in world coordinates
   */
  function findFoodBowlPosition(): { position: Vector3D; itemId: string } | null {
    const itemPositions = habitatConditions.itemPositions

    // Find a food bowl with food in it
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'food_bowl') {
        const bowlContents = habitatConditions.getBowlContents(itemId)

        if (bowlContents && bowlContents.length > 0) {
          return {
            position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
            itemId
          }
        }
      }
    }

    // If no bowl with food, find any bowl
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'food_bowl') {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId
        }
      }
    }

    return null
  }

  /**
   * Find the position of a water bottle in world coordinates
   */
  function findWaterBottlePosition(): { position: Vector3D; itemId: string } | null {
    if (!habitatConditions.hasWaterAvailable()) {
      return null
    }

    const gridPos = habitatConditions.getWaterBottlePosition()
    if (!gridPos) {
      return null
    }

    return {
      position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
      itemId: 'water-bottle'
    }
  }

  /**
   * Select the highest priority behavior goal (2D pattern)
   */
  function selectBehaviorGoal(): Behavior3DGoal | null {
    const gp = getGuineaPig()
    if (!gp) return null

    const needs = gp.needs
    const goals: Behavior3DGoal[] = []

    // CRITICAL NEEDS (Priority 80-100)

    // Hunger < threshold
    if (needs.hunger < THRESHOLDS.hunger && !isOnCooldown('eat')) {
      const target = findFoodBowlPosition()
      if (target) {
        goals.push({
          type: 'eat',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.hunger, THRESHOLDS.hunger, 100),
          estimatedDuration: DURATIONS.eat,
          needSatisfied: 'hunger'
        })
      }
    }

    // Thirst < threshold
    if (needs.thirst < THRESHOLDS.thirst && !isOnCooldown('drink')) {
      const target = findWaterBottlePosition()
      if (target) {
        goals.push({
          type: 'drink',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.thirst, THRESHOLDS.thirst, 100),
          estimatedDuration: DURATIONS.drink,
          needSatisfied: 'thirst'
        })
      }
    }

    // LOW PRIORITY (Priority 20-30)

    // Wandering when content
    if (!isOnCooldown('wander')) {
      goals.push({
        type: 'wander',
        target: null,
        priority: 25,
        estimatedDuration: 5000
      })
    }

    // Sort by priority (highest first)
    goals.sort((a, b) => b.priority - a.priority)

    // Add natural variation: if top goals within 15 priority points, pick randomly
    if (goals.length > 0) {
      const topPriority = goals[0].priority
      const topGoals = goals.filter(g => g.priority >= topPriority - 15)

      if (topGoals.length > 1) {
        return topGoals[Math.floor(Math.random() * topGoals.length)]
      }

      return goals[0]
    }

    return null
  }

  /**
   * Execute a behavior goal
   */
  function executeBehavior(goal: Behavior3DGoal): void {
    currentGoal.value = goal

    switch (goal.type) {
      case 'eat':
        executeEatBehavior(goal)
        break
      case 'drink':
        executeDrinkBehavior(goal)
        break
      case 'wander':
        executeWanderBehavior()
        break
    }
  }

  /**
   * Execute eat behavior
   */
  function executeEatBehavior(goal: Behavior3DGoal): void {
    if (!goal.target) return

    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} hungry, seeking food`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startEating()
    })
  }

  /**
   * Start eating at food bowl
   */
  function startEating(): void {
    currentActivity.value = 'eating'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started eating`)

    if (onEatingStartCallback) {
      onEatingStartCallback()
    }

    actionTimeout = window.setTimeout(() => {
      finishEating()
    }, DURATIONS.eat)
  }

  /**
   * Finish eating and restore hunger
   */
  function finishEating(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    guineaPigStore.satisfyNeed(guineaPigId, 'hunger', RESTORE_AMOUNTS.hunger)
    setCooldown('eat', COOLDOWNS.eat)

    if (onEatingEndCallback) {
      onEatingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished eating`)

    // Trigger next behavior tick
    tick()
  }

  /**
   * Execute drink behavior
   */
  function executeDrinkBehavior(goal: Behavior3DGoal): void {
    if (!goal.target) return

    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} thirsty, seeking water`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startDrinking()
    })
  }

  /**
   * Start drinking at water bottle
   */
  function startDrinking(): void {
    currentActivity.value = 'drinking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started drinking`)

    if (onDrinkingStartCallback) {
      onDrinkingStartCallback()
    }

    actionTimeout = window.setTimeout(() => {
      finishDrinking()
    }, DURATIONS.drink)
  }

  /**
   * Finish drinking and restore thirst
   */
  function finishDrinking(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    // Consume water from bottle
    habitatConditions.consumeWater()

    guineaPigStore.satisfyNeed(guineaPigId, 'thirst', RESTORE_AMOUNTS.thirst)
    setCooldown('drink', COOLDOWNS.drink)

    if (onDrinkingEndCallback) {
      onDrinkingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished drinking`)

    // Trigger next behavior tick
    tick()
  }

  /**
   * Execute wander behavior
   */
  function executeWanderBehavior(): void {
    currentActivity.value = 'walking'
    currentGoal.value = null

    const success = movement.wander()
    if (success) {
      setCooldown('wander', COOLDOWNS.wander)
      movement.onArrival(() => {
        currentActivity.value = 'idle'
      })
    } else {
      currentActivity.value = 'idle'
    }
  }

  /**
   * Check and handle autonomous poop dropping
   */
  function checkAutonomousPooping(): void {
    const gp = getGuineaPig()
    if (!gp) return

    const timeSinceLastPoop = Date.now() - gp.lastPoopTime

    if (timeSinceLastPoop > POOP_INTERVAL_MS) {
      const state = movement3DStore.getGuineaPigState(guineaPigId)
      if (!state) return

      const gridPos = movement3DStore.worldToGrid(state.worldPosition.x, state.worldPosition.z)

      const subgridX = gridPos.col * SUBGRID_SCALE + Math.floor(Math.random() * SUBGRID_SCALE)
      const subgridY = gridPos.row * SUBGRID_SCALE + Math.floor(Math.random() * SUBGRID_SCALE)

      habitatConditions.addPoop(subgridX, subgridY)

      // Random offset to desync multiple guinea pigs
      const randomOffset = -Math.random() * 10000
      gp.lastPoopTime = Date.now() + randomOffset

      console.log(`[Behavior3D] Guinea pig ${guineaPigId} pooped at subgrid (${subgridX}, ${subgridY})`)
    }
  }

  /**
   * Main behavior tick - decides what the guinea pig should do
   */
  function tick(): void {
    // Don't tick if game is paused
    if (!gameController.isGameActive) {
      return
    }

    // Check for autonomous pooping
    checkAutonomousPooping()

    // Don't interrupt active behaviors (eating, drinking)
    if (currentActivity.value === 'eating' || currentActivity.value === 'drinking') {
      return
    }

    // Get movement state
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (!state) {
      console.warn(`[Behavior3D] Guinea pig ${guineaPigId} has no movement state`)
      return
    }

    // If already moving, wait for arrival
    if (state.isMoving) {
      return
    }

    // Select and execute highest priority behavior
    const goal = selectBehaviorGoal()
    if (goal) {
      executeBehavior(goal)
    }
  }

  /**
   * Start the behavior loop
   */
  function start(): void {
    if (behaviorInterval !== null) {
      console.warn(`[Behavior3D] Behavior already running for ${guineaPigId}`)
      return
    }

    console.log(`[Behavior3D] Starting behavior loop for guinea pig ${guineaPigId}`)

    // Run first tick immediately
    tick()

    // Start interval for subsequent ticks
    behaviorInterval = window.setInterval(tick, BEHAVIOR_TICK_INTERVAL)
  }

  /**
   * Stop the behavior loop
   */
  function stop(): void {
    console.log(`[Behavior3D] Stopping behavior loop for guinea pig ${guineaPigId}`)

    if (behaviorInterval !== null) {
      clearInterval(behaviorInterval)
      behaviorInterval = null
    }

    if (actionTimeout !== null) {
      clearTimeout(actionTimeout)
      actionTimeout = null
    }

    currentActivity.value = 'idle'
    currentGoal.value = null

    movement.cleanup()
  }

  /**
   * Pause behavior (for game pause or Take Control mode)
   */
  function pause(): void {
    movement.pauseMovement()
  }

  /**
   * Resume behavior (after game resume)
   */
  function resume(): void {
    movement.resumeMovement()
  }

  /**
   * Set callback for when drinking starts (for bubble animation)
   */
  function onDrinkingStart(callback: () => void): void {
    onDrinkingStartCallback = callback
  }

  /**
   * Set callback for when drinking ends
   */
  function onDrinkingEnd(callback: () => void): void {
    onDrinkingEndCallback = callback
  }

  /**
   * Set callback for when eating starts
   */
  function onEatingStart(callback: () => void): void {
    onEatingStartCallback = callback
  }

  /**
   * Set callback for when eating ends
   */
  function onEatingEnd(callback: () => void): void {
    onEatingEndCallback = callback
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
    pause,
    resume,
    tick,
    currentActivity,
    currentGoal,
    onDrinkingStart,
    onDrinkingEnd,
    onEatingStart,
    onEatingEnd
  }
}
