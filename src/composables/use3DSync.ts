import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { useGuineaPigStore } from '../stores/guineaPigStore'
import { createGuineaPigModel } from './use3DGuineaPig'

// Grid configuration
const GRID_COLS = 14
const GRID_ROWS = 10
const CELL_SIZE = 1.0 // 1 unit per grid cell
const PIXELS_PER_CELL = 64 // 2D sprite size

/**
 * Convert 2D grid position to 3D world coordinates
 */
export function gridToWorld(col: number, row: number): THREE.Vector3 {
  // Center the grid (col 7, row 5 → world 0, 0)
  const worldX = (col - GRID_COLS / 2) * CELL_SIZE
  const worldZ = (row - GRID_ROWS / 2) * CELL_SIZE
  const worldY = 0 // Ground level

  return new THREE.Vector3(worldX, worldY, worldZ)
}

/**
 * Convert 2D grid position with pixel offsets to 3D world coordinates
 */
export function gridToWorldWithOffset(pos: {
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}): THREE.Vector3 {
  // Base world position (x and y in the store correspond to col and row)
  const worldX = (pos.x - GRID_COLS / 2) * CELL_SIZE
  const worldZ = (pos.y - GRID_ROWS / 2) * CELL_SIZE

  // Convert pixel offsets to world offsets
  const offsetX = ((pos.offsetX || 0) / PIXELS_PER_CELL) * CELL_SIZE
  const offsetZ = ((pos.offsetY || 0) / PIXELS_PER_CELL) * CELL_SIZE

  return new THREE.Vector3(worldX + offsetX, 0, worldZ + offsetZ)
}

/**
 * Sync guinea pig positions and create/remove models as needed
 */
export function use3DSync(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()
  const guineaPigStore = useGuineaPigStore()

  // Registry of guinea pig 3D models
  const guineaPigModels = new Map<string, THREE.Group>()

  // Watch for guinea pig additions/removals
  watch(
    () => guineaPigStore.collection.activeGuineaPigIds,
    (activeIds) => {
      // Add models for active guinea pigs
      activeIds.forEach((guineaPigId) => {
        if (!guineaPigModels.has(guineaPigId)) {
          // TODO: Get guinea pig and map appearance colors
          // const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
          const model = createGuineaPigModel({
            // TODO: Map appearance colors from guineaPig.appearance
          })
          guineaPigModels.set(guineaPigId, model)
          worldGroup.add(model)
        }
      })

      // Remove models for inactive guinea pigs
      guineaPigModels.forEach((model, guineaPigId) => {
        if (!activeIds.includes(guineaPigId)) {
          worldGroup.remove(model)
          guineaPigModels.delete(guineaPigId)
        }
      })
    },
    { immediate: true },
  )

  // Watch guinea pig positions and update 3D models
  watch(
    () => habitatConditions.guineaPigPositions,
    (positions) => {
      positions.forEach((pos: { x: number; y: number; offsetX?: number; offsetY?: number }, guineaPigId: string) => {
        const worldPos = gridToWorldWithOffset(pos)

        // Update 3D model position
        const model = guineaPigModels.get(guineaPigId)
        if (model) {
          model.position.copy(worldPos)
        }
      })
    },
    { deep: true },
  )

  return {
    guineaPigModels,
    gridToWorld,
    gridToWorldWithOffset,
  }
}
