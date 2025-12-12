/**
 * 3D Hunger Behavior Composable
 * Simple hunger-driven behavior loop for guinea pigs in 3D
 * - Wanders when not hungry
 * - Navigates to food bowl when hungry
 * - Eats at food bowl to satisfy hunger
 */

import { ref, onUnmounted } from 'vue'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useGameController } from '../../stores/gameController'
import { use3DMovement } from './use3DMovement'
import type { Vector3D } from '../../types/movement3d'

// Behavior configuration
const HUNGER_THRESHOLD = 70 // Seek food when hunger drops below this
const EATING_DURATION = 3000 // Time to eat in milliseconds
const BEHAVIOR_TICK_INTERVAL = 2000 // Check behavior every 2 seconds
const HUNGER_RESTORE_AMOUNT = 50 // Amount to restore hunger when eating

export function use3DHungerBehavior(guineaPigId: string) {
  const movement3DStore = useMovement3DStore()
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const suppliesStore = useSuppliesStore()
  const gameController = useGameController()

  // Create movement controller for this guinea pig
  const movement = use3DMovement(guineaPigId)

  // Behavior state
  const isEating = ref(false)
  const isSeekingFood = ref(false)
  let behaviorInterval: number | null = null
  let eatingTimeout: number | null = null

  /**
   * Get the guinea pig data
   */
  function getGuineaPig() {
    return guineaPigStore.collection.guineaPigs[guineaPigId]
  }

  /**
   * Find the position of a food bowl in world coordinates
   */
  function findFoodBowlPosition(): Vector3D | null {
    // Get all item positions from habitat
    const itemPositions = habitatConditions.itemPositions

    // Find a food bowl with food in it
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      // Check if it's a food bowl
      if (item?.stats?.itemType === 'food_bowl') {
        // Check if bowl has food
        const bowlContents = habitatConditions.getBowlContents(itemId)

        if (bowlContents && bowlContents.length > 0) {
          // Convert grid position to world coordinates
          return movement3DStore.gridToWorld(gridPos.x, gridPos.y)
        }
      }
    }

    // If no bowl with food, find any bowl (guinea pig will be disappointed)
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'food_bowl') {
        return movement3DStore.gridToWorld(gridPos.x, gridPos.y)
      }
    }

    return null
  }

  /**
   * Execute eating behavior
   */
  function startEating(): void {
    if (isEating.value) return

    isEating.value = true
    console.log(`[Hunger3D] Guinea pig ${guineaPigId} started eating`)

    eatingTimeout = window.setTimeout(() => {
      finishEating()
    }, EATING_DURATION)
  }

  /**
   * Finish eating and restore hunger
   */
  function finishEating(): void {
    isEating.value = false
    isSeekingFood.value = false

    // Satisfy hunger
    guineaPigStore.satisfyNeed(guineaPigId, 'hunger', HUNGER_RESTORE_AMOUNT)

    console.log(`[Hunger3D] Guinea pig ${guineaPigId} finished eating, hunger restored`)

    // Trigger next behavior tick immediately
    tick()
  }

  /**
   * Main behavior tick - decides what the guinea pig should do
   */
  function tick(): void {
    // Don't tick if game is paused
    if (!gameController.isGameActive) {
      return
    }

    // Don't interrupt eating
    if (isEating.value) {
      return
    }

    // Get guinea pig data
    const gp = getGuineaPig()
    if (!gp) {
      console.warn(`[Hunger3D] Guinea pig ${guineaPigId} not found`)
      return
    }

    // Get movement state
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (!state) {
      console.warn(`[Hunger3D] Guinea pig ${guineaPigId} has no movement state`)
      return
    }

    // If already moving, wait for arrival
    if (state.isMoving) {
      return
    }

    // Check hunger level
    const hunger = gp.needs.hunger

    if (hunger < HUNGER_THRESHOLD && !isSeekingFood.value) {
      // Hungry - find food
      const foodPosition = findFoodBowlPosition()

      if (foodPosition) {
        isSeekingFood.value = true
        console.log(`[Hunger3D] Guinea pig ${guineaPigId} hungry (${hunger.toFixed(0)}), seeking food`)

        movement.moveTo(foodPosition)
        movement.onArrival(() => {
          // Arrived at food bowl - start eating
          startEating()
        })
      } else {
        // No food bowl found, wander sadly
        console.log(`[Hunger3D] Guinea pig ${guineaPigId} hungry but no food bowl found`)
        movement.wander(5)
      }
    } else if (!isSeekingFood.value) {
      // Not hungry or already seeking - wander
      movement.wander()
    }
  }

  /**
   * Start the behavior loop
   */
  function start(): void {
    if (behaviorInterval !== null) {
      console.warn(`[Hunger3D] Behavior already running for ${guineaPigId}`)
      return
    }

    console.log(`[Hunger3D] Starting behavior loop for guinea pig ${guineaPigId}`)

    // Run first tick immediately
    tick()

    // Start interval for subsequent ticks
    behaviorInterval = window.setInterval(tick, BEHAVIOR_TICK_INTERVAL)
  }

  /**
   * Stop the behavior loop
   */
  function stop(): void {
    console.log(`[Hunger3D] Stopping behavior loop for guinea pig ${guineaPigId}`)

    if (behaviorInterval !== null) {
      clearInterval(behaviorInterval)
      behaviorInterval = null
    }

    if (eatingTimeout !== null) {
      clearTimeout(eatingTimeout)
      eatingTimeout = null
    }

    isEating.value = false
    isSeekingFood.value = false

    movement.cleanup()
  }

  /**
   * Pause behavior (for game pause)
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
    isEating,
    isSeekingFood
  }
}
