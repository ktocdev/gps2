# Poop System Restoration - December 6, 2025

## Problem
After adding the 3D view, poop pellets were:
1. Appearing in wrong positions in both 2D and 3D views
2. Not syncing between 2D and 3D views
3. Wrong shape (squashed spheres instead of realistic pellets)

## Root Cause
The coordinate system mismatch:
- **2D View**: Uses subgrid coordinates (56×40, which is 4x finer than the grid)
- **3D View**: Uses world coordinates (centered at origin)
- **Incorrect Change**: We changed poop spawning to use grid coordinates (14×10), which broke the 2D view

## Solution: Restore GPS2-49 Working Version

### Changes Made

#### 1. useGuineaPigBehavior.ts (line 1759-1761)
**Restored to GPS2-49 version:**
```typescript
// Convert grid coordinates to subgrid coordinates with random offset
const subgridPos = gridToSubgridWithOffset(currentPos)
habitatConditions.addPoop(subgridPos.x, subgridPos.y)
```

#### 2. use3DPoop.ts
**Added subgrid-to-world coordinate conversion:**
```typescript
function subgridToWorld(subgridX: number, subgridY: number): THREE.Vector3 {
  const SUBGRID_TO_GRID_SCALE = 4

  // Convert subgrid to grid coordinates
  const gridX = subgridX / SUBGRID_TO_GRID_SCALE
  const gridY = subgridY / SUBGRID_TO_GRID_SCALE

  // Convert grid to world coordinates
  const worldX = (gridX - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (gridY - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE

  return new THREE.Vector3(worldX, 0, worldZ)
}
```

#### 3. Poop Model Shape (Already Fixed)
**Realistic capsule pellets:**
```typescript
const poopGeo = new THREE.CapsuleGeometry(0.1, 0.25, 8, 16)
poop.rotation.z = Math.PI / 2 // Lay horizontally
poop.rotation.y = Math.random() * Math.PI * 2 // Random rotation
```

## Coordinate System Reference

- **Grid**: 14 cols × 10 rows (0-13, 0-9)
- **Subgrid**: 56 cols × 40 rows (0-55, 0-39) - 4x finer than grid
- **World**: Centered at origin, scaled by CELL_SIZE

## Files Backed Up
- `use3DPoop.ts.backup` - Version before restoration
- `useGuineaPigBehavior.ts.backup` - Version before restoration

## Expected Results
✅ Poop appears in correct positions in 2D view
✅ Poop appears in correct positions in 3D view
✅ Both views stay synchronized
✅ Realistic brown capsule pellets in 3D view
✅ Poop drops every 30 seconds with random offset
