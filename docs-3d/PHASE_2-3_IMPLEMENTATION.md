# Phase 2-3 Implementation Plan

> **Phases:** Camera Controls → Items & Interactions → Basic UI Controls
> **Milestone:** After Phase 3, continue refining 3D gameplay and controls

---

## Current Status

✅ **Phase 1 Complete:**
- Three.js scene integration with Vue 3
- Guinea pig 3D models with real-time position sync
- Basic coordinate mapping (2D grid → 3D world)
- Debug dashboard integration

🔧 **Current Issue:**
- Camera controls not responding (mouse drag, scroll, keyboard)
- Guinea pigs visible and moving correctly

---

## Phase 2: Camera Controls & Items

### 2.1 Camera Controls (Priority 1)

**Goal:** Fix and verify all camera controls are working

**Controls to Debug:**
- Mouse drag to rotate world
- Scroll or Z/X keys for camera up/down
- Arrow keys to pan camera
- Touch support for mobile

**Implementation:**
- Debug event listener attachment timing
- Verify canvas ref availability
- Test `use3DCamera` composable initialization
- Ensure animation loop is calling `updateCameraPosition()`

**Files:**
- [src/composables/use3DCamera.ts](../src/composables/use3DCamera.ts)
- [src/components/debug/environment/Habitat3DDebug.vue](../src/components/debug/environment/Habitat3DDebug.vue)

---

### 2.2 Habitat Items (Priority 2)

**Goal:** Add all 2D habitat items to 3D scene using existing demo models or placeholders

**Item Mapping Strategy:**

| Item Type | 3D Model Source | Notes |
|-----------|----------------|-------|
| Bowls (all types) | Demo bowl model | Reuse for all bowl items |
| Shelters (all types) | Demo igloo model | Reuse for all shelter items |
| Water bottles | Demo water bottle | Mounted on wall/edge |
| Beds | **New flat mat model** | Create simple flat rectangle |
| Toys (stick, ball) | Demo stick/ball | Use existing models |
| Other items | Cube placeholder | Simple colored cubes |
| Poop pellets | Small brown sphere | Click to remove |

**Data Source:**
- Watch `habitatConditions.itemPositions` (Map structure)
- Sync item additions/removals
- Update positions on changes

**Implementation:**

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

**Files to Create:**
- `src/composables/use3DItems.ts` (main implementation)
- `src/composables/use3DModels.ts` (optional, for model definitions)

**Files to Modify:**
- [src/components/debug/environment/Habitat3DDebug.vue](../src/components/debug/environment/Habitat3DDebug.vue) - integrate use3DItems

---

## Phase 3: Basic Interactions & UI

### 3.1 Guinea Pig Selection

**Goal:** Click guinea pig to select, show selection indicator

**Implementation:**
- Raycasting on canvas click
- Detect guinea pig model hits
- Add selection ring/glow to selected model
- Store selected guinea pig ID in component state

---

### 3.2 Floating Action Buttons

**Goal:** Trigger existing autonomy functions from 3D view

**Buttons to Add:**
- Feed (opens food selection)
- Give Water
- Play
- Pet
- Clean Habitat

**Implementation:**

1. **Create `src/components/debug/environment/Habitat3DControls.vue`:**
   - Floating button panel (bottom-right)
   - Import `useAutonomy` or access trigger functions
   - Each button calls existing manual trigger functions
   - Disable buttons when no guinea pig selected

2. **Wire to Existing Functions:**
   - Use same functions as AutonomyDebug component
   - Pass selected guinea pig ID
   - Show feedback on action triggered

**Files to Create:**
- `src/components/debug/environment/Habitat3DControls.vue`

**Files to Modify:**
- [src/components/debug/environment/Habitat3DDebug.vue](../src/components/debug/environment/Habitat3DDebug.vue) - add controls component

---

### 3.3 Poop Cleanup Interaction

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

## Phase 4: UI Overlays (Future)

**Deferred for later refinement:**
- Selected guinea pig stats overlay
- Activity feed integration
- Inventory quick-access
- Time controls (pause/play/speed)

---

## Testing Checklist

### Phase 2
- [ ] Mouse drag rotates world smoothly
- [ ] Scroll or Z/X moves camera up/down
- [ ] Arrow keys pan camera left/right/forward/back
- [ ] All item types appear in correct positions
- [ ] Items update when added/removed in 2D
- [ ] Poop pellets appear and disappear correctly
- [ ] Click on poop removes it from scene and store

### Phase 3
- [ ] Click on guinea pig shows selection indicator
- [ ] Action buttons appear when guinea pig selected
- [ ] Feed button triggers food selection (same as 2D)
- [ ] Other action buttons trigger correct behaviors
- [ ] Buttons disabled when no selection

---

## Success Criteria

**Phase 2-3 Complete When:**
1. ✅ All camera controls working smoothly
2. ✅ All 2D habitat items visible in 3D
3. ✅ Poop cleanup works by clicking
4. ✅ Can select guinea pig and trigger basic care actions
5. ✅ 3D view remains fully synced with 2D state changes

**Milestone:** Continue refining 3D gameplay and controls (not resuming sprint work yet)

---

## Notes

- Keep implementation simple - no over-engineering
- Reuse demo models where possible
- Use cube placeholders for unknown items
- All game logic remains in existing Pinia stores
- 3D view is pure visualization + input layer
- TypeScript strict mode must pass
- Build before committing changes
