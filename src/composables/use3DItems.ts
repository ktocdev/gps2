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
 * Create simple placeholder models for habitat items
 * These will be progressively enhanced in later iterations
 */

function createBowlModel(): THREE.Group {
  const group = new THREE.Group()

  // Simple bowl - cylinder (scaled up 2x)
  const bowlGeo = new THREE.CylinderGeometry(1.8, 1.6, 1.0, 32, 1, true)
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0x2196F3,
    roughness: 0.4,
    side: THREE.DoubleSide
  })
  const bowl = new THREE.Mesh(bowlGeo, bowlMat)
  bowl.position.y = 0.5
  bowl.castShadow = true
  bowl.receiveShadow = true
  group.add(bowl)

  // Base
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32)
  const base = new THREE.Mesh(baseGeo, bowlMat)
  base.position.y = 0.05
  base.receiveShadow = true
  group.add(base)

  return group
}

function createShelterModel(): THREE.Group {
  const group = new THREE.Group()

  // Simple igloo - half sphere (scaled up 2.5x for visibility)
  const shelterGeo = new THREE.SphereGeometry(3.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
  const shelterMat = new THREE.MeshStandardMaterial({
    color: 0xFF69B4,
    opacity: 0.5,
    transparent: true,
    roughness: 0.3
  })
  const shelter = new THREE.Mesh(shelterGeo, shelterMat)
  shelter.castShadow = true
  shelter.receiveShadow = true
  group.add(shelter)

  return group
}

function createWaterBottleModel(): THREE.Group {
  const group = new THREE.Group()

  // Bottle cylinder (scaled up 2x)
  const bottleGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.0, 16)
  const bottleMat = new THREE.MeshStandardMaterial({
    color: 0xE0F0FF,
    opacity: 0.4,
    transparent: true,
    roughness: 0.1
  })
  const bottle = new THREE.Mesh(bottleGeo, bottleMat)
  bottle.position.y = 3.0
  bottle.castShadow = true
  group.add(bottle)

  // Nozzle (scaled up 2x)
  const nozzleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8)
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 1.0
  })
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
  nozzle.rotation.z = Math.PI / 2
  nozzle.position.set(0.8, 2.0, 0)
  nozzle.castShadow = true
  group.add(nozzle)

  return group
}

function createBedModel(): THREE.Group {
  const group = new THREE.Group()

  // Flat mat - plane geometry (scaled up 2x)
  const bedGeo = new THREE.PlaneGeometry(3.0, 3.0)
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.9,
    side: THREE.DoubleSide
  })
  const bed = new THREE.Mesh(bedGeo, bedMat)
  bed.rotation.x = -Math.PI / 2
  bed.position.y = 0.04 // Slightly above ground
  bed.receiveShadow = true
  group.add(bed)

  return group
}

function createToyModel(type: 'stick' | 'ball' | 'other'): THREE.Group {
  const group = new THREE.Group()

  if (type === 'ball') {
    // Ball (scaled up 2x)
    const ballGeo = new THREE.SphereGeometry(0.6, 16, 16)
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xFF6347,
      roughness: 0.5
    })
    const ball = new THREE.Mesh(ballGeo, ballMat)
    ball.position.y = 0.6
    ball.castShadow = true
    group.add(ball)
  } else if (type === 'stick') {
    // Stick (scaled up 2x)
    const stickGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8)
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8
    })
    const stick = new THREE.Mesh(stickGeo, stickMat)
    stick.rotation.z = Math.PI / 2
    stick.position.y = 0.1
    stick.castShadow = true
    group.add(stick)
  } else {
    // Placeholder cube (scaled up 2x)
    const cubeGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xFFA500,
      roughness: 0.6
    })
    const cube = new THREE.Mesh(cubeGeo, cubeMat)
    cube.position.y = 0.5
    cube.castShadow = true
    group.add(cube)
  }

  return group
}

function createGenericItemModel(itemId: string): THREE.Group {
  // Determine model type based on item ID
  if (itemId.includes('bowl')) {
    return createBowlModel()
  } else if (itemId.includes('shelter') || itemId.includes('igloo') || itemId.includes('hideout')) {
    return createShelterModel()
  } else if (itemId.includes('water') && itemId.includes('bottle')) {
    return createWaterBottleModel()
  } else if (itemId.includes('bed') || itemId.includes('mat')) {
    return createBedModel()
  } else if (itemId.includes('ball')) {
    return createToyModel('ball')
  } else if (itemId.includes('stick') || itemId.includes('chew')) {
    return createToyModel('stick')
  } else {
    return createToyModel('other')
  }
}

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
          const model = createGenericItemModel(itemId)
          itemModels.set(itemId, model)
          worldGroup.add(model)
        }

        // Update position
        const position = positions.get(itemId)
        if (position) {
          const worldPos = gridToWorld(position.x, position.y)
          const model = itemModels.get(itemId)
          if (model) {
            model.position.copy(worldPos)
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
