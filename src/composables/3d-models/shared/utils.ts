import * as THREE from 'three'
import { GRID_CONFIG } from '../../../constants/3d'

/**
 * Convert grid position to 3D world coordinates
 */
export function gridToWorld(x: number, y: number): THREE.Vector3 {
  const worldX = (x - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (y - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
  return new THREE.Vector3(worldX, 0, worldZ)
}

/**
 * Seeded random number generator for consistent randomness
 * Used to prevent model regeneration on each render
 */
export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}
