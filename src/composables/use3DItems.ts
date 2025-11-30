 import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { GRID_CONFIG, ITEM_CONFIG } from '../constants/3d'
import { disposeObject3D } from '../utils/three-cleanup'
import { createWoodTexture, displaceVertices } from './use3DTextures'

/**
 * Convert grid position to 3D world coordinates (same as use3DSync)
 */
function gridToWorld(x: number, y: number): THREE.Vector3 {
  const worldX = (x - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (y - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
  return new THREE.Vector3(worldX, 0, worldZ)
}

/**
 * Calculate water bottle rotation based on wall/corner position
 * Nozzle always points inward toward habitat center
 * - Corners: Use atan2 formula to angle toward center
 * - Edges: Use fixed rotations to point straight toward middle
 */
function getWaterBottleRotation(gridX: number, gridY: number): number {
  const isLeftEdge = gridX === 0
  const isRightEdge = gridX === GRID_CONFIG.COLS - 1 // 13
  const isTopEdge = gridY === 0
  const isBottomEdge = gridY === GRID_CONFIG.ROWS - 1 // 9

  // Check if it's a corner (both horizontal and vertical edge)
  const isCorner = (isLeftEdge || isRightEdge) && (isTopEdge || isBottomEdge)

  if (isCorner) {
    // For corners, calculate angle toward center using atan2
    const worldX = (gridX - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
    const worldZ = (gridY - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
    const deltaX = 0 - worldX
    const deltaZ = 0 - worldZ
    return Math.atan2(-deltaZ, deltaX)
  }

  // For edges (non-corners), point straight toward middle
  if (isTopEdge) return -Math.PI / 2    // Point down toward middle
  if (isBottomEdge) return Math.PI / 2  // Point up toward middle
  if (isLeftEdge) return 0              // Point right toward middle
  if (isRightEdge) return Math.PI       // Point left toward middle

  // Default (shouldn't happen for water bottles on walls)
  return 0
}

/**
 * Create simple placeholder models for habitat items
 * These will be progressively enhanced in later iterations
 */

function createBowlModel(bowlItemId: string): THREE.Group {
  const group = new THREE.Group()
  const habitatConditions = useHabitatConditions()

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

  // Get bowl contents and render accordingly
  const contents = habitatConditions.getBowlContents(bowlItemId)

  if (contents.length > 0) {
    // Separate hay from food items
    const hayItems = contents.filter(item => item.itemId.includes('hay'))
    const foodItems = contents.filter(item => !item.itemId.includes('hay'))

    // Render hay if present (always at bottom)
    if (hayItems.length > 0) {
      // Generate consistent seed from bowlItemId to prevent animation
      const seed = bowlItemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const hayPile = createHayPile(hayItems.length, seed)

      // Scale and position based on serving count
      if (hayItems.length >= 2) {
        // Two servings: taller pile, positioned higher
        hayPile.scale.set(0.8, 1.3, 0.8) // X, Y, Z - taller in Y
        hayPile.position.y = 0.6
      } else {
        // One serving: smaller pile
        hayPile.scale.set(0.8, 0.8, 0.8)
        hayPile.position.y = 0.6
      }

      group.add(hayPile)
    }

    // Render food items on top
    if (foodItems.length === 1) {
      // Single food item - centered
      const foodModel = createCucumberSlice()
      foodModel.position.set(
        ITEM_CONFIG.FOOD_POSITION.SINGLE.x,
        ITEM_CONFIG.FOOD_POSITION.SINGLE.y,
        ITEM_CONFIG.FOOD_POSITION.SINGLE.z
      )
      group.add(foodModel)
    } else if (foodItems.length >= 2) {
      // Two food items - split 50/50
      const foodLeft = createCucumberSlice()
      foodLeft.position.set(
        ITEM_CONFIG.FOOD_POSITION.LEFT.x,
        ITEM_CONFIG.FOOD_POSITION.LEFT.y,
        ITEM_CONFIG.FOOD_POSITION.LEFT.z
      )
      group.add(foodLeft)

      const foodRight = createCucumberSlice()
      foodRight.position.set(
        ITEM_CONFIG.FOOD_POSITION.RIGHT.x,
        ITEM_CONFIG.FOOD_POSITION.RIGHT.y,
        ITEM_CONFIG.FOOD_POSITION.RIGHT.z
      )
      group.add(foodRight)
    }
  }

  return group
}

function createShelterModel(): THREE.Group {
  const group = new THREE.Group()

  // Floor clipping plane to prevent geometry showing below ground
  const floorClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  // Material for shelter (pink transparent plastic)
  const shelterMat = new THREE.MeshPhysicalMaterial({
    color: 0xFF69B4,
    opacity: 0.5,
    transparent: true,
    roughness: 0.2,
    metalness: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    clippingPlanes: [floorClipPlane],
  })

  // Create dome with entrance cutout
  // Ultra-high resolution for smooth entrance cutout
  const domeGeo = new THREE.SphereGeometry(3.5, 256, 128, 0, Math.PI * 2, 0, Math.PI / 2)
  const posAttr = domeGeo.attributes.position
  const indexAttr = domeGeo.index

  if (indexAttr) {
    const newIndices: number[] = []
    const cutoutRadiusSq = 1.85 * 1.85 // Slightly larger for smoother edge

    // Filter triangles to create entrance cutout
    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i)
      const b = indexAttr.getX(i + 1)
      const c = indexAttr.getX(i + 2)

      // Get triangle vertices
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a)
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b)
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c)

      // Check if ALL vertices are in the cutout area (smoother edge)
      const distASq = vA.x * vA.x + vA.y * vA.y
      const distBSq = vB.x * vB.x + vB.y * vB.y
      const distCSq = vC.x * vC.x + vC.y * vC.y

      // Skip triangles where all vertices are in entrance area
      if (vA.z > 2.2 && vB.z > 2.2 && vC.z > 2.2 &&
          distASq < cutoutRadiusSq && distBSq < cutoutRadiusSq && distCSq < cutoutRadiusSq) {
        continue
      }

      newIndices.push(a, b, c)
    }

    domeGeo.setIndex(newIndices)
  }

  const dome = new THREE.Mesh(domeGeo, shelterMat)
  dome.castShadow = false
  dome.receiveShadow = false
  group.add(dome)

  // Add entrance tunnel - positioned to start at dome entrance and extend outward
  // Slightly larger radius to overlap and hide jagged dome edge
  const tunnelGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.6, 64, 1, true)
  const tunnel = new THREE.Mesh(tunnelGeo, shelterMat)
  tunnel.rotation.set(-Math.PI / 2, 0, 0) // Rotate to horizontal
  tunnel.position.set(0, 0, 3.8) // Position to connect at entrance, extend outward
  group.add(tunnel)

  return group
}

function createWaterBottleModel(): THREE.Group {
  const group = new THREE.Group()

  // Bottle container (transparent light blue, scaled 2x)
  const bottleGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.0, 32)
  const bottleMat = new THREE.MeshStandardMaterial({
    color: 0xE0F0FF,
    opacity: 0.3,
    transparent: true,
    roughness: 0.1,
    metalness: 0.0,
    depthWrite: false,
  })
  const bottle = new THREE.Mesh(bottleGeo, bottleMat)
  bottle.position.y = 3.5 // Bottle center (height 3.2 / 2 + bracket 0.5 + buffer)
  bottle.castShadow = true
  bottle.receiveShadow = false
  group.add(bottle)

  // Water inside (slightly smaller, with glow)
  const waterGeo = new THREE.CylinderGeometry(0.55, 0.55, 3.2, 32)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xC3E7FD,
    opacity: 0.8,
    transparent: true,
    roughness: 0.0,
    metalness: 0.0,
    emissive: 0x4da6ff,
    emissiveIntensity: 0.2,
  })
  const water = new THREE.Mesh(waterGeo, waterMat)
  water.position.y = 3.3 // Slightly lower than bottle
  group.add(water)

  // Green bracket at base
  const bracketGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32)
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x32cd32,
    roughness: 0.5,
  })
  const bracket = new THREE.Mesh(bracketGeo, bracketMat)
  bracket.position.y = 1.25 // Half height of bracket (0.5 / 2) + base offset
  bracket.castShadow = true
  group.add(bracket)

  // Metal nozzle (horizontal)
  const nozzleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16)
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 1.0,
  })
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
  nozzle.rotation.z = -Math.PI / 2 // Horizontal
  nozzle.position.set(1.1, 1.25, 0) // Aligned with bracket
  nozzle.castShadow = true
  group.add(nozzle)

  // Rotation will be set based on wall position (see use3DItems positioning logic)
  // Default rotation for reference (bottom-left corner)
  group.rotation.y = -Math.PI / 4

  // Offset to move bottle inside cage (away from wall)
  group.position.x = 1.5
  group.position.z = 2.0

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
    // Twig Ball - 12 interlocking torus rings (scaled 2x: 0.8 → 1.6 major, 0.06 → 0.12 tube)
    for (let i = 0; i < 12; i++) {
      const ringGeo = new THREE.TorusGeometry(1.6, 0.12, 6, 16)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xCD853F, // Peru/tan color
        roughness: 1.0, // Completely matte for natural twig look
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)

      // Random rotation for woven appearance
      ring.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )

      ring.castShadow = true
      ring.receiveShadow = true
      group.add(ring)
    }

    // Position the ball group
    // Major radius 1.6 + tube radius 0.12 + small buffer = 1.75
    group.position.y = 1.75
  } else if (type === 'stick') {
    // Enhanced wooden stick with displacement (scaled 2x)
    // Main stick cylinder (closed to prevent hollow ends and seams)
    const stickGeo = new THREE.CylinderGeometry(0.375, 0.375, 5.6, 32, 32, false)

    // Apply subtle vertex displacement for natural irregularity
    // Reduced magnitude to minimize visible seams
    displaceVertices(stickGeo, 0.03, 0.05)

    // Materials with solid wood colors (no texture to avoid seams)
    const stickSideMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Saddle brown
      roughness: 0.9,
    })
    const stickEndMat = new THREE.MeshStandardMaterial({
      color: 0xDEB887, // Burlywood (lighter for end caps)
      roughness: 0.8,
    })

    // Use material array: [side, top cap, bottom cap]
    const stick = new THREE.Mesh(stickGeo, [stickSideMat, stickEndMat, stickEndMat])
    stick.rotation.z = Math.PI / 2
    stick.castShadow = true
    stick.receiveShadow = true
    group.add(stick)

    // Add branch knob for natural appearance (scaled 2x)
    const knobGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.0, 16, 8, false)
    displaceVertices(knobGeo, 0.02, 0) // Subtle displacement

    const knob = new THREE.Mesh(knobGeo, [stickSideMat, stickEndMat, stickEndMat])
    knob.position.set(0.36, 0, 0) // Position to intersect through stick center
    knob.rotation.z = Math.PI / 2 - 0.3
    knob.rotation.y = Math.random() * Math.PI
    knob.castShadow = true
    knob.receiveShadow = true
    group.add(knob)

    // Position the stick group
    // Radius 0.375 + displacement ~0.06 + buffer = 0.5
    group.position.y = 0.5
    group.rotation.y = Math.random() * Math.PI
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

/**
 * Simple seeded random number generator for deterministic hay placement
 */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

/**
 * Create a simplified hay pile for bowls
 * Wider strands like thin tape with bends and angles
 * @param servings - Number of hay servings (1 or 2+)
 * @param seed - Seed for deterministic random placement (prevents animation)
 */
function createHayPile(servings: number = 2, seed: number = 12345): THREE.Group {
  const group = new THREE.Group()
  const { HAY } = ITEM_CONFIG

  // Use seeded random for deterministic placement
  const random = seededRandom(seed)

  // Calculate instance counts based on servings
  // 1 serving = 50%, 2+ servings = 100%
  const servingMultiplier = servings >= 2 ? 1.0 : 0.5
  const uprightCount = Math.floor(HAY.INSTANCES_UPRIGHT * servingMultiplier)
  const flatCount = Math.floor(HAY.INSTANCES_FLAT * servingMultiplier)

  // Create upright hay strands
  const uprightGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH, 1.0, HAY.STRAND_THICKNESS)
  uprightGeo.translate(0, 0.5, 0) // Pivot at bottom

  const uprightMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const uprightHay = new THREE.InstancedMesh(uprightGeo, uprightMat, uprightCount)
  uprightHay.castShadow = true
  uprightHay.receiveShadow = true
  uprightHay.matrixAutoUpdate = false // Disable auto-updates

  const dummy = new THREE.Object3D()

  // Place upright strands
  for (let i = 0; i < uprightCount; i++) {
    // Circular distribution
    const radius = Math.sqrt(random()) * 1.25
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Position with height variation
    const y = radius > 0.7 ? 0 : (random() * 0.6)
    dummy.position.set(x, y, z)

    // Natural hay angles - varied lean in all directions
    // Lean outward from center for natural "exploding" look
    const leanAngle = Math.atan2(z, x) // Angle from center
    const leanAmount = 0.3 + random() * 0.6 // Random lean 0.3-0.9 radians (17-52 degrees)

    dummy.rotation.set(
      Math.sin(leanAngle) * leanAmount, // Lean along angle from center
      random() * Math.PI * 2, // Random spin
      Math.cos(leanAngle) * leanAmount  // Lean perpendicular to angle
    )

    // Length variation
    const lengthScale = 0.5 + random() * 0.5
    dummy.scale.set(1, lengthScale, 1)

    dummy.updateMatrix()
    uprightHay.setMatrixAt(i, dummy.matrix)

    // Random color from palette
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    uprightHay.setColorAt(i, color)
  }

  // Finalize instance matrices
  uprightHay.instanceMatrix.needsUpdate = true
  if (uprightHay.instanceColor) {
    uprightHay.instanceColor.needsUpdate = true
  }

  group.add(uprightHay)

  // Create flat hay strands
  const flatGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH * 1.25, 1.0, HAY.STRAND_THICKNESS * 0.8)

  const flatMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const flatHay = new THREE.InstancedMesh(flatGeo, flatMat, flatCount)
  flatHay.castShadow = true
  flatHay.receiveShadow = true
  flatHay.matrixAutoUpdate = false // Disable auto-updates

  // Place flat strands
  for (let i = 0; i < flatCount; i++) {
    // Slightly larger circular distribution
    const radius = Math.sqrt(random()) * 1.35
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Height variation
    const y = 0.1 + random() * 1.2
    dummy.position.set(x, y, z)

    // Mostly horizontal with variation
    dummy.rotation.set(
      Math.PI / 2 + (random() - 0.5) * 0.4, // Near horizontal with variation
      random() * Math.PI * 2,               // Random spin
      (random() - 0.5) * 0.3                // Slight roll
    )

    // Length variation
    const lengthScale = 0.4 + random() * 0.4
    dummy.scale.set(1, lengthScale, 1)

    dummy.updateMatrix()
    flatHay.setMatrixAt(i, dummy.matrix)

    // Random color from palette
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    flatHay.setColorAt(i, color)
  }

  // Finalize instance matrices
  flatHay.instanceMatrix.needsUpdate = true
  if (flatHay.instanceColor) {
    flatHay.instanceColor.needsUpdate = true
  }

  group.add(flatHay)

  return group
}

/**
 * Create a cucumber slice for food display in bowls
 */
function createCucumberSlice(): THREE.Group {
  const group = new THREE.Group()

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x1b5e20, // Dark green
    roughness: 0.3,
  })
  const fleshMat = new THREE.MeshStandardMaterial({
    color: 0xDFF7DF, // Light mint green
    roughness: 0.5,
    side: THREE.DoubleSide,
  })

  // Half-cylinder (radius 0.5 → 1.0, thick 0.1 → 0.2, scaled 2x)
  const sliceGeo = new THREE.CylinderGeometry(
    1.0, // radius
    1.0, // radius
    0.2, // thickness
    32,  // segments
    1,   // height segments
    false, // open ended
    0,   // theta start
    Math.PI // theta length (half circle)
  )

  const slice = new THREE.Mesh(sliceGeo, [skinMat, fleshMat, fleshMat])
  slice.castShadow = true
  group.add(slice)

  // Cut surface (flat face)
  const cutGeo = new THREE.BoxGeometry(2.0, 0.2, 0.04)
  const cut = new THREE.Mesh(cutGeo, fleshMat)
  cut.rotation.y = Math.PI / 2
  cut.position.set(-0.02, 0, 0)
  group.add(cut)

  return group
}

/**
 * Create wooden archway tunnel (purchasable item)
 */
function createWoodenTunnelModel(): THREE.Group {
  const group = new THREE.Group()
  const woodTexture = createWoodTexture()

  // Create arch shape
  const tunnelShape = new THREE.Shape()
  const legHeight = 3.0 // Scaled 2x from 1.5

  // Outer arc
  tunnelShape.absarc(0, 0, 4.0, 0, Math.PI, false) // Scaled 2x from 2.0

  // Line down left side
  tunnelShape.lineTo(-4.0, -legHeight)

  // Line across bottom
  tunnelShape.lineTo(4.0, -legHeight)

  // Line up right side
  tunnelShape.lineTo(4.0, 0)

  // Inner arc (cut out)
  tunnelShape.absarc(0, 0, 3.2, Math.PI, 0, true) // Scaled 2x from 1.6

  // Extrude settings
  const extrudeSettings = {
    depth: 8.0, // Scaled 2x from 4.0
    bevelEnabled: true,
    bevelThickness: 0.1, // Scaled 2x from 0.05
    bevelSize: 0.1,      // Scaled 2x from 0.05
    bevelSegments: 2,
    curveSegments: 16,
    steps: 1,
  }

  const tunnelGeo = new THREE.ExtrudeGeometry(tunnelShape, extrudeSettings)

  // Wood materials (same as stick)
  const woodSideMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.1,
    roughness: 0.9,
  })
  const woodEndMat = new THREE.MeshStandardMaterial({
    color: 0xDEB887,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.05,
    roughness: 0.8,
  })

  const tunnel = new THREE.Mesh(tunnelGeo, [woodSideMat, woodEndMat])
  tunnel.position.y = 3.5 // Scaled 2x from 1.75
  tunnel.rotation.y = Math.PI / 2
  tunnel.castShadow = true
  tunnel.receiveShadow = true
  group.add(tunnel)

  return group
}

function createGenericItemModel(itemId: string): THREE.Group {
  // Determine model type based on item ID
  if (itemId.includes('bowl')) {
    return createBowlModel(itemId)
  } else if (itemId.includes('shelter') || itemId.includes('igloo') || itemId.includes('hideout')) {
    return createShelterModel()
  } else if (itemId.includes('water') && itemId.includes('bottle')) {
    return createWaterBottleModel()
  } else if (itemId.includes('bed') || itemId.includes('mat')) {
    return createBedModel()
  } else if (itemId.includes('tunnel') && itemId.includes('archway')) {
    return createWoodenTunnelModel()
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
            const newModel = createGenericItemModel(itemId)
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
