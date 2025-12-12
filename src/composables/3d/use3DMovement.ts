/**
 * 3D Movement Composable
 * Handles guinea pig movement with RAF-based animation and pathfinding
 */

import { ref, onUnmounted } from 'vue'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useGameController } from '../../stores/gameController'
import { use3DPathfinding } from './use3DPathfinding'
import type { Vector3D } from '../../types/movement3d'

// Movement configuration
const MOVE_SPEED = 4.0 // World units per second
const ARRIVAL_THRESHOLD = 0.5 // Distance to consider "arrived"

export function use3DMovement(guineaPigId: string) {
  const movement3DStore = useMovement3DStore()
  const gameController = useGameController()
  const pathfinding = use3DPathfinding()

  // Animation state
  let animationFrameId: number | null = null
  let lastTime: number = 0
  let isAnimating = ref(false)

  // Callbacks
  let arrivalCallback: (() => void) | null = null

  /**
   * Move to a destination with pathfinding
   */
  function moveTo(destination: Vector3D): boolean {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (!state) {
      console.warn(`[Movement3D] Guinea pig ${guineaPigId} not found`)
      return false
    }

    // Find valid destination (not inside obstacle)
    const validDestination = pathfinding.findNearestValidPosition(destination)

    // Calculate path avoiding obstacles
    const path = pathfinding.calculatePath(state.worldPosition, validDestination)

    if (path.length === 0) {
      console.warn(`[Movement3D] No path found for guinea pig ${guineaPigId}`)
      return false
    }

    // Update state
    state.currentPath = path
    state.targetPosition = validDestination
    state.isMoving = true

    // Start animation if not already running
    if (!isAnimating.value) {
      startAnimationLoop()
    }

    console.log(`[Movement3D] Guinea pig ${guineaPigId} moving to (${validDestination.x.toFixed(1)}, ${validDestination.z.toFixed(1)}) via ${path.length} waypoints`)
    return true
  }

  /**
   * Wander to a random nearby position
   */
  function wander(maxDistance: number = 8): boolean {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (!state) {
      return false
    }

    // Generate random direction and distance
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * maxDistance + 2 // Minimum 2 units

    // Calculate target position
    const target: Vector3D = {
      x: state.worldPosition.x + Math.cos(angle) * distance,
      y: 0,
      z: state.worldPosition.z + Math.sin(angle) * distance
    }

    // Clamp to world bounds
    const clampedTarget = movement3DStore.clampToBounds(target)

    return moveTo(clampedTarget)
  }

  /**
   * Start the RAF animation loop
   */
  function startAnimationLoop(): void {
    if (isAnimating.value) return

    isAnimating.value = true
    lastTime = performance.now()

    function animate(currentTime: number): void {
      // Calculate delta time
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      // Get current state
      const state = movement3DStore.getGuineaPigState(guineaPigId)

      if (!state || !state.isMoving) {
        // Stop animation if no state or not moving
        isAnimating.value = false
        return
      }

      // Check if game is paused
      if (!gameController.isGameActive) {
        // Keep the loop running but don't move
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      // Get current waypoint
      if (state.currentPath.length === 0) {
        // Arrived at destination
        state.isMoving = false
        state.targetPosition = null
        isAnimating.value = false

        // Trigger arrival callback
        if (arrivalCallback) {
          const callback = arrivalCallback
          arrivalCallback = null // Clear before calling to allow re-registration
          callback()
        }
        return
      }

      const waypoint = state.currentPath[0]

      // Calculate direction to waypoint
      const dx = waypoint.x - state.worldPosition.x
      const dz = waypoint.z - state.worldPosition.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < ARRIVAL_THRESHOLD) {
        // Reached waypoint, move to next
        state.currentPath.shift()

        if (state.currentPath.length === 0) {
          // Reached final destination
          state.isMoving = false
          state.targetPosition = null
          isAnimating.value = false

          // Trigger arrival callback
          if (arrivalCallback) {
            const callback = arrivalCallback
            arrivalCallback = null
            callback()
          }
          return
        }
      } else {
        // Move toward waypoint
        const moveDistance = MOVE_SPEED * deltaTime
        const ratio = Math.min(moveDistance / distance, 1)

        state.worldPosition.x += dx * ratio
        state.worldPosition.z += dz * ratio

        // Update rotation to face movement direction
        state.rotation = Math.atan2(dx, dz)
      }

      // Continue animation
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * Register a callback to be called when destination is reached
   */
  function onArrival(callback: () => void): void {
    arrivalCallback = callback
  }

  /**
   * Stop movement immediately
   */
  function stopMovement(): void {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    isAnimating.value = false

    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (state) {
      state.isMoving = false
      state.currentPath = []
      state.targetPosition = null
    }
  }

  /**
   * Pause movement (can be resumed)
   */
  function pauseMovement(): void {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (state) {
      state.isMoving = false
    }
  }

  /**
   * Resume paused movement
   */
  function resumeMovement(): void {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (state && state.currentPath.length > 0) {
      state.isMoving = true
      if (!isAnimating.value) {
        startAnimationLoop()
      }
    }
  }

  /**
   * Check if currently moving
   */
  function isMoving(): boolean {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    return state?.isMoving ?? false
  }

  /**
   * Get current position
   */
  function getPosition(): Vector3D | null {
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    return state?.worldPosition ?? null
  }

  /**
   * Cleanup when composable is destroyed
   */
  function cleanup(): void {
    stopMovement()
    arrivalCallback = null
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    moveTo,
    wander,
    onArrival,
    stopMovement,
    pauseMovement,
    resumeMovement,
    isMoving,
    getPosition,
    cleanup,
    isAnimating
  }
}
