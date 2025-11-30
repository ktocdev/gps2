# 3D Development Phases

> **Current Phase:** Phase 2 - Items & Interactions
> **Navigation:** [← Back to Project Plan](PROJECT_PLAN.md)

---

## Phase Status Overview

| Phase | Status | Goal | Milestone |
|-------|--------|------|-----------|
| **Phase 1** | ✅ Complete | Basic 3D scene with guinea pig movement | Guinea pigs move in 3D in real-time |
| **Phase 2** | 🚧 In Progress | Items & interactions | Full 3D habitat with all items visible |
| **Phase 3** | 📋 Planned | Full playability | Complete guinea pig care in 3D ⭐ |
| **Phase 4** | 📋 Planned | Movement polish & animation | Movement quality matches demo |
| **Phase 5** | 📋 Planned | Polish & parity | Full 2D feature parity + polish |

⭐ **Sprint Resume Milestone:** Phase 3 completion triggers resumption of [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md)

---

## Phase 1: MVP - Basic 3D Scene ✅

**Status:** Complete
**Completed:** November 29, 2025

### Completed Features

- Three.js integration with Vue 3
- Grid-to-3D coordinate mapping (14x10 grid → Vector3)
- Guinea pig 3D model (ported from demo)
- Real-time position sync from `habitatConditions` store
- Camera system (orbit controls: drag, scroll, keyboard)
- Basic environment (floor, walls, lighting, sky)
- Guinea pigs face movement direction
- Floor scaled to match guinea pig proportions (CELL_SIZE: 3.0 units)

### Technical Implementation

**Composables Created:**
- `use3DScene.ts` - Scene, camera, renderer, lighting
- `use3DCamera.ts` - Mouse/keyboard/touch controls
- `use3DSync.ts` - Position sync and rotation
- `use3DGuineaPig.ts` - 3D model creation

**Key Technical Decisions:**
- CELL_SIZE = 3.0 units (increased from 1.0 to match guinea pig scale)
- Camera position: (10, 15, 30) for good viewing angle
- Floor: 42×30 units (14 cols × 10 rows × 3 units/cell)
- Walls: 2.0 units tall
- Shadow map: 2048×2048 for quality

**Documentation:**
- [threejs-integration.md](phase1/threejs-integration.md)
- [coordinate-mapping.md](phase1/coordinate-mapping.md)
- [guinea-pig-model.md](phase1/guinea-pig-model.md)
- [camera-system.md](phase1/camera-system.md)

---

## Phase 2: Items & Interactions 🚧

**Status:** In Progress
**Started:** November 29, 2025

### Goals

Add all habitat items to 3D scene and enable basic interactions:
1. All 2D habitat items have 3D models
2. Items positioned correctly from game state
3. Poop visualization and cleanup
4. Basic raycasting for interactions

### Item Mapping Strategy

| Item Type | 3D Model Source | Notes |
|-----------|----------------|-------|
| Bowls (all types) | Demo bowl model | Reuse for all bowl items |
| Shelters (all types) | Demo igloo model | Reuse for all shelter items |
| Water bottles | Demo water bottle | Mounted on wall/edge |
| Beds | **New flat mat model** | Create simple flat rectangle |
| Toys (stick, ball) | Demo stick/ball | Use existing models |
| Other items | Cube placeholder | Simple colored cubes |
| Poop pellets | Small brown sphere | Click to remove |

### Implementation Tasks

**Priority 1: Camera Controls** ✅ Complete
- [x] Mouse drag to rotate world
- [x] Scroll or Z/X keys for camera up/down
- [x] Arrow keys to pan camera
- [x] Touch support for mobile

**Priority 2: Habitat Items** (Current)
1. **Create `src/composables/use3DItems.ts`:**
   - Watch `habitatConditions.itemPositions`
   - Create/remove 3D models as items change
   - Map item types to appropriate models
   - Handle position updates

2. **Extract Models from Demo:**
   - Copy bowl, igloo, water bottle, stick, ball model creation
   - Adapt to match composable pattern
   - Store in `use3DItems.ts` or separate model files

3. **Create Flat Mat Model:**
   - Simple PlaneGeometry with soft material
   - Slightly raised from ground (0.01 units)
   - Scale to match bed size in grid cells

4. **Poop Pellet System:**
   - Small brown SphereGeometry (radius ~0.1)
   - Watch `habitatConditions.poopPellets` Map
   - Add click detection (raycasting)
   - On click → call store's remove poop function

### Testing Checklist

- [ ] All item types appear in correct positions
- [ ] Items update when added/removed in 2D
- [ ] Poop pellets appear and disappear correctly
- [ ] Click on poop removes it from scene and store

### Success Criteria

✅ **Phase 2 Complete** when:
1. All 2D habitat items visible in 3D
2. Items sync correctly with game state changes
3. Poop cleanup works by clicking

**Files to Create:**
- `src/composables/use3DItems.ts`
- `src/composables/use3DModels.ts` (optional)

**Files to Modify:**
- `src/components/debug/environment/Habitat3DDebug.vue`

**Documentation:**
- [item-models.md](phase2/item-models.md)
- [interactions.md](phase2/interactions.md)

---

## Phase 3: Full Playability 📋 ⭐

**Status:** Not Started
**Goal:** Complete playable 3D game with minimal guinea pig care

### Goals

Make the 3D view fully playable:
1. Click guinea pig to select
2. Floating action buttons for interactions
3. Button triggers call existing autonomy functions
4. All starter objects working

### Features

#### 3.1 Guinea Pig Selection

**Goal:** Click guinea pig to select, show selection indicator

**Implementation:**
- Raycasting on canvas click
- Detect guinea pig model hits
- Add selection ring/glow to selected model
- Store selected guinea pig ID in component state

---

#### 3.2 Floating Action Buttons

**Goal:** Trigger existing autonomy functions from 3D view

**Buttons to Add:**
- Feed (opens food selection) - 🥕 icon
- Give Water - 💧 icon
- Play - 🎾 icon
- Pet - 💚 icon
- Clean Habitat - 🧹 icon

**Implementation:**

1. **Use existing `FloatingActionButton` component:**
   - Import from `src/components/basic/FloatingActionButton.vue`
   - Create multiple instances in `Habitat3DDebug.vue` or new `Habitat3DControls.vue`
   - Position them in a vertical stack using custom wrapper or absolute positioning
   - Each button has appropriate icon, label, and variant

2. **Button Configuration Example:**
   ```vue
   <FloatingActionButton
     icon="🥕"
     label="Feed"
     variant="primary"
     :disabled="!selectedGuineaPigId"
     aria-label="Feed guinea pig"
     @click="handleFeed"
   />
   ```

3. **Wire to Existing Functions:**
   - Use same functions as AutonomyDebug component
   - Pass selected guinea pig ID
   - Show feedback on action triggered
   - Disable all buttons when no guinea pig selected

---

#### 3.3 Poop Cleanup Interaction

**Goal:** Click poop to remove (same as 2D)

**Implementation:**
- Raycasting on canvas click
- Detect poop pellet hits
- Call `habitatConditions.removePoop(poopId)`
- Visual feedback (pellet disappears)

**Integration:**
- Add to existing click handler in Habitat3DDebug.vue
- Check if ray intersects poop model first, then guinea pig

---

### Testing Checklist

- [ ] Click on guinea pig shows selection indicator
- [ ] Action buttons appear when guinea pig selected
- [ ] Feed button triggers food selection (same as 2D)
- [ ] Other action buttons trigger correct behaviors
- [ ] Buttons disabled when no selection

### Success Criteria

✅ **Phase 3 Complete** when:
1. Can select guinea pig and trigger basic care actions
2. All floating action buttons work
3. 3D view remains fully synced with 2D state changes

**Milestone:** ⭐ Resume [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md) after this phase

**Files to Create (Optional):**
- `src/components/debug/environment/Habitat3DControls.vue` (wrapper for multiple FloatingActionButton instances)

**Files to Modify:**
- `src/components/debug/environment/Habitat3DDebug.vue` (add FloatingActionButton instances or import Habitat3DControls)

**Existing Components to Use:**
- `src/components/basic/FloatingActionButton.vue` (already exists - use for all action buttons)

**Documentation:**
- [ui-overlay.md](phase3/ui-overlay.md)
- [playability.md](phase3/playability.md)

---

## Phase 4: Movement Polish & Animation 📋

**Status:** Not Started
**Goal:** Smooth guinea pig movement like demo (guinea-pig-sim-demo-backup.html)

### Current Issue

Movement is jerky (directly synced to 2D grid-based position updates). Need smooth interpolation like the demo.

### Features

#### 4.1 Position Interpolation (Lerping)

**Implementation:**
- Track target position (from 2D game state)
- Track current rendered position (interpolated)
- Lerp from current to target each frame
- Use appropriate lerp speed (e.g., 0.1-0.2)

**Changes to `use3DSync.ts`:**
```typescript
// Store both target and current positions
const targetPositions = new Map<string, THREE.Vector3>()
const currentPositions = new Map<string, THREE.Vector3>()

// In animation loop (called from Habitat3DDebug):
export function updateGuineaPigPositions(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const target = targetPositions.get(guineaPigId)
    const current = currentPositions.get(guineaPigId)
    if (target && current) {
      // Lerp position
      current.lerp(target, 0.15) // Smooth interpolation
      model.position.copy(current)
    }
  })
}
```

---

#### 4.2 Rotation Interpolation (Slerping)

**Implementation:**
- Track target rotation (from movement direction)
- Track current rotation
- Slerp rotation smoothly instead of instant snap
- Prevents jerky turning

**Changes to `use3DSync.ts`:**
```typescript
// Store target and current rotations
const targetRotations = new Map<string, number>()
const currentRotations = new Map<string, number>()

// Smooth rotation lerping
function lerpAngle(current: number, target: number, amount: number): number {
  // Handle angle wrapping (-π to π)
  let diff = target - current
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * amount
}
```

---

#### 4.3 Walking Animation

**Goal:** Animate guinea pig body parts while moving (like demo)

**Animations to Add:**
1. **Feet Movement:**
   - Front feet alternate up/down while walking
   - Back feet alternate up/down (offset from front)
   - Feet stay still when guinea pig is idle

2. **Body Bobbing:**
   - Slight up/down movement while walking
   - Synchronized with foot movement
   - Adds weight/realism

3. **Nose Wiggle:**
   - Continuous subtle animation
   - Independent of movement
   - Already have nose in model (userData)

**Implementation:**

Add to `use3DSync.ts`:
```typescript
// Animation state per guinea pig
const animationStates = new Map<string, {
  walkCycle: number // 0 to 2π
  isMoving: boolean
}>()

// Update in animation loop
export function updateGuineaPigAnimations(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const state = animationStates.get(guineaPigId)
    if (!state) return

    const { body, feet, nose } = model.userData

    if (state.isMoving) {
      // Increment walk cycle
      state.walkCycle += deltaTime * 8 // Walking speed

      // Feet movement (alternate)
      const footHeight = Math.abs(Math.sin(state.walkCycle)) * 0.15
      feet.frontLeft.position.y = footHeight
      feet.backRight.position.y = footHeight
      feet.frontRight.position.y = Math.abs(Math.sin(state.walkCycle + Math.PI)) * 0.15
      feet.backLeft.position.y = Math.abs(Math.sin(state.walkCycle + Math.PI)) * 0.15

      // Body bobbing
      body.position.y = Math.abs(Math.sin(state.walkCycle * 2)) * 0.05
    } else {
      // Reset feet when idle
      feet.frontLeft.position.y = 0
      feet.frontRight.position.y = 0
      feet.backLeft.position.y = 0
      feet.backRight.position.y = 0
      body.position.y = 0
    }

    // Nose wiggle (always active)
    nose.rotation.y = Math.sin(Date.now() * 0.003) * 0.1
  })
}
```

### Testing Checklist

- [ ] Position transitions are smooth (no jerky jumps)
- [ ] Rotation transitions are smooth (no instant snaps)
- [ ] Guinea pigs walk smoothly across the habitat
- [ ] Front feet alternate properly while walking
- [ ] Back feet alternate properly while walking
- [ ] Body bobs subtly while walking
- [ ] Feet/body reset when guinea pig stops
- [ ] Nose wiggles continuously
- [ ] Animations match demo quality

### Success Criteria

✅ **Phase 4 Complete** when:
1. Guinea pig position transitions are smooth (lerped)
2. Guinea pig rotation transitions are smooth (lerped angles)
3. Feet animate up/down while walking
4. Body bobs slightly while walking
5. Nose wiggles continuously
6. Movement quality matches demo smoothness

**Files to Modify:**
- `src/composables/use3DSync.ts` - Add interpolation and animation
- `src/composables/use3DGuineaPig.ts` - Store feet in userData
- `src/components/debug/environment/Habitat3DDebug.vue` - Call update functions in animation loop

---

## Phase 5: Polish & Parity 📋

**Status:** Not Started
**Goal:** Full feature parity with 2D game + polish

### Features

#### Advanced Animations
- Popcorn jump (vertical leap)
- Zoomies (fast running in circles)
- Social interactions (nose touch, grooming, following)
- Play animations (toy interactions)
- Eating animation (head down to bowl, chewing)
- Drinking animation (approach water bottle, head tilt)
- Sleeping animation (lie down, eyes close)

#### Particle Effects
- Dust clouds during movement
- Food particles when eating
- Hay strands falling
- Water droplets

#### Sound System
- Wheeks (guinea pig vocalizations)
- Chewing/crunching sounds
- Movement sounds (patter of feet)
- Ambient habitat sounds

#### Performance Optimization
- Instanced meshes for repeated objects
- Level of Detail (LOD) system
- Occlusion culling
- Texture atlases
- Efficient shadow maps

#### UI Overlays
- Selected guinea pig stats overlay
- Activity feed integration
- Inventory quick-access
- Time controls (pause/play/speed)

#### Mobile Refinement
- Touch gesture improvements
- Performance mode toggle
- Simplified graphics option
- Battery-saving mode

### Testing Checklist

- [ ] All 18 autonomous behaviors have animations
- [ ] Particle system implemented
- [ ] Sound system integrated
- [ ] Performance optimized for mobile
- [ ] Full 2D feature parity achieved

### Success Criteria

✅ **Phase 5 Complete** when:
1. All behaviors have appropriate animations
2. Particle effects enhance visual feedback
3. Sound system provides audio feedback
4. Performance is smooth on mobile devices
5. Full feature parity with 2D game achieved

---

## Implementation Notes

### General Principles

- Keep implementation simple - no over-engineering
- Reuse demo models where possible
- Use cube placeholders for unknown items
- All game logic remains in existing Pinia stores
- 3D view is pure visualization + input layer
- TypeScript strict mode must pass
- Build before committing changes

### Architecture

**Shared Components (2D + 3D):**
- Pinia stores: `guineaPigStore`, `habitatConditions`, `inventoryStore`, `gameController`, `needsController`
- Composables: `usePathfinding`, `useMovement`, `useGuineaPigBehavior`

**3D-Specific Components:**
- Composables: `use3DScene`, `use3DSync`, `use3DGuineaPig`, `use3DItems`, `use3DCamera`
- Views: `Habitat3DDebug.vue`
- Components: `Habitat3DControls.vue`

---

**Last Updated:** November 29, 2025
