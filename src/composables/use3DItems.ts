import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { disposeObject3D } from '../utils/three-cleanup'
import { createItemModel, getWaterBottleRotation, gridToWorld } from './3d-models'
import { use3DPhysics } from './3d/use3DPhysics'

/**
 * Sync habitat items with 3D scene
 */
export function use3DItems(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()
  const physics3D = use3DPhysics()

  // Registry of item 3D models
  const itemModels = new Map<string, THREE.Group>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  /**
   * Check if an item should have physics enabled
   */
  function shouldHavePhysics(itemId: string): 'ball' | 'stick' | null {
    const idLower = itemId.toLowerCase()
    if (idLower.includes('ball')) return 'ball'
    if (idLower.includes('stick') || idLower.includes('chew')) return 'stick'
    return null
  }

  /**
   * Initialize physics for a model if applicable
   */
  function initializePhysicsForItem(itemId: string, model: THREE.Group): void {
    const preset = shouldHavePhysics(itemId)
    if (preset) {
      // For physics items, the wrapper is the group and visual is the first mesh child
      const visual = model.children.find(child => child instanceof THREE.Mesh) || model
      physics3D.initializePhysicsItem(itemId, model, visual as THREE.Object3D, preset)
    }
  }

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
          // Initialize physics for applicable items
          initializePhysicsForItem(itemId, model)
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
          // Remove physics if applicable
          physics3D.removePhysicsItem(itemId)
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

  // Watch for hay rack contents changes and re-render affected hay racks
  stopWatchers.push(watch(
    () => habitatConditions.hayRackContents,
    () => {
      // Re-render all hay rack models when contents change
      itemModels.forEach((model, itemId) => {
        if (itemId.includes('hay') && itemId.includes('rack')) {
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

    // Cleanup physics
    physics3D.cleanup()

    // Dispose all item models
    itemModels.forEach(model => {
      disposeObject3D(model)
      worldGroup.remove(model)
    })
    itemModels.clear()
  }

  return {
    itemModels,
    physics3D,
    cleanup,
  }
}
