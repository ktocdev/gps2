import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { GRID_CONFIG } from '../constants/3d'
import { disposeObject3D } from '../utils/three-cleanup'

/**
 * Convert grid position to 3D world coordinates (same as use3DSync)
 */
function gridToWorld(x: number, y: number): THREE.Vector3 {
  const worldX = (x - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (y - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
  return new THREE.Vector3(worldX, 0, worldZ)
}

/**
 * Create a poop pellet model
 */
function createPoopModel(): THREE.Mesh {
  // Scaled up 2x for better visibility
  const poopGeo = new THREE.SphereGeometry(0.3, 16, 16)
  // Slightly squash it
  poopGeo.scale(1, 0.7, 1)

  const poopMat = new THREE.MeshStandardMaterial({
    color: 0x4a3428,
    roughness: 0.9,
    metalness: 0.0
  })

  const poop = new THREE.Mesh(poopGeo, poopMat)
  poop.position.y = 0.15 // Slightly above ground
  poop.castShadow = true
  poop.receiveShadow = true

  return poop
}

/**
 * Sync poop pellets with 3D scene and handle click detection
 */
export function use3DPoop(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()

  // Registry of poop 3D models - maps poop ID to mesh
  const poopModels = new Map<string, THREE.Mesh>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  // Watch for poop changes
  stopWatchers.push(watch(
    () => habitatConditions.poops,
    (poops) => {
      // Get current poop IDs
      const currentPoopIds = new Set(poops.map(p => p.id))

      // Add models for new poops
      poops.forEach((poop) => {
        if (!poopModels.has(poop.id)) {
          const model = createPoopModel()
          const worldPos = gridToWorld(poop.x, poop.y)
          model.position.copy(worldPos)

          // Store poop ID in userData for click detection
          model.userData.poopId = poop.id

          poopModels.set(poop.id, model)
          worldGroup.add(model)
        }
      })

      // Remove models for deleted poops
      poopModels.forEach((model, poopId) => {
        if (!currentPoopIds.has(poopId)) {
          disposeObject3D(model)
          worldGroup.remove(model)
          poopModels.delete(poopId)
        }
      })
    },
    { deep: true, immediate: true }
  ))

  /**
   * Check if a clicked object is a poop pellet
   * Returns poop ID if clicked, null otherwise
   */
  function handlePoopClick(clickedObject: THREE.Object3D): string | null {
    // Check if the clicked object is a poop mesh
    if (clickedObject.userData.poopId) {
      return clickedObject.userData.poopId as string
    }

    // Check parent (in case mesh is part of a group)
    if (clickedObject.parent && clickedObject.parent.userData.poopId) {
      return clickedObject.parent.userData.poopId as string
    }

    return null
  }

  /**
   * Cleanup function - stops watchers and disposes models
   */
  function cleanup() {
    // Stop all watchers
    stopWatchers.forEach(stop => stop())

    // Dispose all poop models
    poopModels.forEach(model => {
      disposeObject3D(model)
      worldGroup.remove(model)
    })
    poopModels.clear()
  }

  return {
    poopModels,
    handlePoopClick,
    cleanup,
  }
}
