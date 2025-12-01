import * as THREE from 'three'
import { GRID_CONFIG } from '../../../constants/3d'

/**
 * Calculate water bottle rotation based on wall/corner position
 * Nozzle always points inward toward habitat center
 * - Corners: Use atan2 formula to angle toward center
 * - Edges: Use fixed rotations to point straight toward middle
 */
export function getWaterBottleRotation(gridX: number, gridY: number): number {
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

export function createWaterBottleModel(): THREE.Group {
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
