/**
 * System 18: Pathfinding & Movement
 * A* pathfinding for guinea pig navigation
 */

import { useHabitatConditions } from '../../stores/habitatConditions'
import { useSuppliesStore } from '../../stores/suppliesStore'

export interface GridPosition {
  row: number
  col: number
}

export interface PathfindingOptions {
  start: GridPosition
  goal: GridPosition
  avoidOccupiedCells?: boolean
  maxPathLength?: number
}

export interface PathfindingResult {
  path: GridPosition[]
  distance: number
  success: boolean
}

interface PathNode {
  position: GridPosition
  g: number // Cost from start to this node
  h: number // Heuristic cost from this node to goal
  f: number // Total cost (g + h)
  parent: PathNode | null
}

export function usePathfinding() {
  const habitatConditions = useHabitatConditions()
  const suppliesStore = useSuppliesStore()

  // Grid dimensions (medium habitat default)
  const GRID_WIDTH = 14
  const GRID_HEIGHT = 10

  /**
   * Calculate Manhattan distance heuristic
   */
  function manhattanDistance(a: GridPosition, b: GridPosition): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  /**
   * Check if position is within grid boundaries
   */
  function isInBounds(pos: GridPosition): boolean {
    return pos.row >= 0 && pos.row < GRID_HEIGHT && pos.col >= 0 && pos.col < GRID_WIDTH
  }

  /**
   * Check if position is blocked by an obstacle
   */
  function isBlocked(pos: GridPosition): boolean {
    // Check habitat items for obstacles
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    for (const itemId of items) {
      const itemPosition = itemPositions.get(itemId)
      if (!itemPosition) continue

      const item = suppliesStore.getItemById(itemId)
      if (!item) continue

      // Get item size
      const size = item.stats?.size || 'small'
      let width = 1, height = 1
      if (size === 'medium') { width = 2; height = 1 }
      if (size === 'large') { width = 2; height = 2 }

      // Check if position overlaps with item
      const isWithinX = pos.col >= itemPosition.x && pos.col < itemPosition.x + width
      const isWithinY = pos.row >= itemPosition.y && pos.row < itemPosition.y + height

      if (isWithinX && isWithinY) {
        // Check if item blocks movement (default to true for safety)
        const blocksMovement = item.stats?.blocksMovement ?? true
        if (blocksMovement) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Check if position is occupied by another guinea pig
   */
  function isOccupiedByGuineaPig(pos: GridPosition, excludeGuineaPigId?: string): boolean {
    const positions = habitatConditions.guineaPigPositions

    for (const [guineaPigId, gpPos] of positions.entries()) {
      if (excludeGuineaPigId && guineaPigId === excludeGuineaPigId) continue
      if (gpPos.x === pos.col && gpPos.y === pos.row) {
        return true
      }
    }

    return false
  }

  /**
   * Check if position is valid for pathfinding
   */
  function isValidPosition(pos: GridPosition, options: { avoidOccupiedCells?: boolean; excludeGuineaPigId?: string } = {}): boolean {
    if (!isInBounds(pos)) return false
    if (isBlocked(pos)) return false
    if (options.avoidOccupiedCells && isOccupiedByGuineaPig(pos, options.excludeGuineaPigId)) return false
    return true
  }

  /**
   * Get neighboring positions (4 directions: up, down, left, right)
   */
  function getNeighbors(pos: GridPosition): GridPosition[] {
    return [
      { row: pos.row - 1, col: pos.col }, // Up
      { row: pos.row + 1, col: pos.col }, // Down
      { row: pos.row, col: pos.col - 1 }, // Left
      { row: pos.row, col: pos.col + 1 }  // Right
    ]
  }

  /**
   * Find path using A* algorithm
   */
  function findPath(options: PathfindingOptions): PathfindingResult {
    const { start, goal, avoidOccupiedCells = false, maxPathLength = 100 } = options

    // Early validation
    if (!isValidPosition(start) || !isValidPosition(goal, { avoidOccupiedCells })) {
      return { path: [], distance: 0, success: false }
    }

    // If start and goal are the same
    if (start.row === goal.row && start.col === goal.col) {
      return { path: [start], distance: 0, success: true }
    }

    const openSet: PathNode[] = []
    const closedSet = new Set<string>()

    // Helper to convert position to string key
    const posKey = (pos: GridPosition) => `${pos.row},${pos.col}`

    // Create start node
    const startNode: PathNode = {
      position: start,
      g: 0,
      h: manhattanDistance(start, goal),
      f: manhattanDistance(start, goal),
      parent: null
    }

    openSet.push(startNode)

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i
        }
      }

      const current = openSet[currentIndex]

      // Check if we reached the goal
      if (current.position.row === goal.row && current.position.col === goal.col) {
        // Reconstruct path
        const path: GridPosition[] = []
        let node: PathNode | null = current
        while (node) {
          path.unshift(node.position)
          node = node.parent
        }
        return { path, distance: current.g, success: true }
      }

      // Move current from open to closed
      openSet.splice(currentIndex, 1)
      closedSet.add(posKey(current.position))

      // Check neighbors
      const neighbors = getNeighbors(current.position)
      for (const neighborPos of neighbors) {
        // Skip if not valid
        if (!isValidPosition(neighborPos, { avoidOccupiedCells })) continue

        // Skip if already in closed set
        if (closedSet.has(posKey(neighborPos))) continue

        // Calculate costs
        const g = current.g + 1
        const h = manhattanDistance(neighborPos, goal)
        const f = g + h

        // Check if path is too long
        if (g > maxPathLength) continue

        // Check if neighbor is in open set
        const existingIndex = openSet.findIndex(n =>
          n.position.row === neighborPos.row && n.position.col === neighborPos.col
        )

        if (existingIndex === -1) {
          // Add new node to open set
          openSet.push({
            position: neighborPos,
            g,
            h,
            f,
            parent: current
          })
        } else if (g < openSet[existingIndex].g) {
          // Update existing node if we found a better path
          openSet[existingIndex].g = g
          openSet[existingIndex].f = f
          openSet[existingIndex].parent = current
        }
      }
    }

    // No path found
    return { path: [], distance: 0, success: false }
  }

  /**
   * Get all obstacle positions
   */
  function getObstacles(): GridPosition[] {
    const obstacles: GridPosition[] = []
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    for (const itemId of items) {
      const itemPosition = itemPositions.get(itemId)
      if (!itemPosition) continue

      const item = suppliesStore.getItemById(itemId)
      if (!item) continue

      // Check if item blocks movement
      const blocksMovement = item.stats?.blocksMovement ?? true
      if (!blocksMovement) continue

      // Get item size
      const size = item.stats?.size || 'small'
      let width = 1, height = 1
      if (size === 'medium') { width = 2; height = 1 }
      if (size === 'large') { width = 2; height = 2 }

      // Add all cells occupied by this item
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          obstacles.push({
            row: itemPosition.y + dy,
            col: itemPosition.x + dx
          })
        }
      }
    }

    return obstacles
  }

  return {
    findPath,
    isValidPosition,
    getObstacles,
    GRID_WIDTH,
    GRID_HEIGHT
  }
}
