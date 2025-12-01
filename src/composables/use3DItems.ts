import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { disposeObject3D } from '../utils/three-cleanup'
import { createItemModel, getWaterBottleRotation, gridToWorld } from './3d-models'

/**
 * Sync habitat items with 3D scene
 */
export function use3DItems(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()

  // Registry of item 3D models
  const itemModels = new Map<string, THREE.Group>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  // Watch for item position changes
  stopWatchers.push(watch(
    () => habitatConditions.itemPositions,
    (positions) => {
      // Get all item IDs from positions map
      const positionedItemIds = new Set(positions.keys())

      // Add models for items that have positions
      positionedItemIds.forEach((itemId) => {
        if (!itemModels.has(itemId)) {
          const model = createItemModel(itemId)
          itemModels.set(itemId, model)
          worldGroup.add(model)
        }

        // Update position
        const position = positions.get(itemId)
        if (position) {
          const worldPos = gridToWorld(position.x, position.y)
          const model = itemModels.get(itemId)
          if (model) {
            // Preserve the model's X, Y, and Z offsets (set in creation function)
            const modelX = model.position.x
            const modelY = model.position.y
            const modelZ = model.position.z
            model.position.copy(worldPos)
            model.position.x += modelX // Add X offset to grid position
            model.position.y = modelY
            model.position.z += modelZ // Add Z offset to grid position

            // Apply smart rotation for water bottles based on wall position
            if (itemId.includes('water') && itemId.includes('bottle')) {
              model.rotation.y = getWaterBottleRotation(position.x, position.y)
            }
          }
        }
      })

      // Remove models for items that no longer have positions
      itemModels.forEach((model, itemId) => {
        if (!positionedItemIds.has(itemId)) {
          disposeObject3D(model)
          worldGroup.remove(model)
          itemModels.delete(itemId)
        }
      })
    },
    { deep: true, immediate: true }
  ))

  // Watch for bowl contents changes and re-render affected bowls
  stopWatchers.push(watch(
    () => habitatConditions.bowlContents,
    () => {
      // Re-render all bowl models when contents change
      itemModels.forEach((model, itemId) => {
        if (itemId.includes('bowl')) {
          // Get current position
          const position = habitatConditions.itemPositions.get(itemId)
          if (position) {
            // Remove old model
            disposeObject3D(model)
            worldGroup.remove(model)

            // Create new model with updated contents
            const newModel = createItemModel(itemId)
            const worldPos = gridToWorld(position.x, position.y)
            // Preserve the model's X, Y, and Z offsets (set in creation function)
            const modelX = newModel.position.x
            const modelY = newModel.position.y
            const modelZ = newModel.position.z
            newModel.position.copy(worldPos)
            newModel.position.x += modelX // Add X offset to grid position
            newModel.position.y = modelY
            newModel.position.z += modelZ // Add Z offset to grid position

            // Update registry and add to scene
            itemModels.set(itemId, newModel)
            worldGroup.add(newModel)
          }
        }
      })
    },
    { deep: true }
  ))

  /**
   * Cleanup function - stops watchers and disposes models
   */
  function cleanup() {
    // Stop all watchers
    stopWatchers.forEach(stop => stop())

    // Dispose all item models
    itemModels.forEach(model => {
      disposeObject3D(model)
      worldGroup.remove(model)
    })
    itemModels.clear()
  }

  return {
    itemModels,
    cleanup,
  }
}
