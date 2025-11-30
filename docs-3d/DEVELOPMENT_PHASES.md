# GPS2 3D Environment System - Development Phases

> **Navigation:** [← Back to Project Plan](PROJECT_PLAN.md)

---

## 📋 **Phase Overview**

This document outlines the development phases for the 3D environment system. Each phase builds upon the previous, progressively adding features until full playability is achieved.

### **Phase Summary**

| Phase | Status | Goal | Milestone |
|-------|--------|------|-----------|
| **Phase 1** | 🚧 In Progress | Basic 3D scene with guinea pig movement | Guinea pigs move in 3D in real-time |
| **Phase 2** | 📋 Not Started | Enhanced objects and interactions | Full 3D habitat with click-to-move |
| **Phase 3** | 📋 Not Started | Full playability | Complete guinea pig care in 3D ⭐ |
| **Phase 4** | 📋 Not Started | Polish & parity | Full 2D feature parity + polish |

⭐ **Sprint Resume Milestone:** Phase 3 completion triggers resumption of [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md)

---

## 🎯 **Phase 1: MVP - Basic 3D Scene with Guinea Pig Movement**

**Status:** 🚧 In Progress
**Start Date:** November 29, 2025
**Target Completion:** TBD

### **Goals**

Create a minimal viable 3D habitat that:
1. Displays guinea pigs in 3D space
2. Syncs positions in real-time with 2D game state
3. Provides camera controls (orbit, pan, zoom)
4. Renders basic environment (floor, walls, lighting)

### **Technical Components**

#### **1. Three.js Integration**
- Install `three` package via npm
- Set up scene, camera, renderer in Vue 3 composable
- Handle canvas resizing and aspect ratio
- Enable shadow maps for realistic lighting

**Files:**
- `src/composables/use3DScene.ts`

**Documentation:**
- [phase1/threejs-integration.md](phase1/threejs-integration.md)

---

#### **2. Coordinate Mapping System**
- Convert 14x10 grid (2D) to 3D Vector3 positions
- Define world size and cell dimensions
- Handle center origin vs corner origin mapping
- Support sub-grid positions for offsets

**Algorithm:**
```typescript
// Grid cell (7, 5) → 3D world position
const worldX = (gridCol - 7) * cellSize  // Center at col 7
const worldZ = (gridRow - 5) * cellSize  // Center at row 5
const worldY = 0  // Ground level
```

**Files:**
- `src/composables/use3DSync.ts`

**Documentation:**
- [phase1/coordinate-mapping.md](phase1/coordinate-mapping.md)

---

#### **3. Guinea Pig 3D Model**
- Port model from `guinea-pig-sim-demo-backup.html`
- Construct from Three.js primitives (spheres, capsules)
- Apply materials (fur, skin, eyes)
- Support multiple guinea pigs (up to 2)

**Model Parts:**
- Body (scaled sphere)
- Head (scaled sphere)
- Ears (flattened spheres)
- Eyes (glossy spheres with clearcoat)
- Nose (flattened sphere)
- Feet (capsules)

**Files:**
- `src/composables/use3DGuineaPig.ts`

**Documentation:**
- [phase1/guinea-pig-model.md](phase1/guinea-pig-model.md)

---

#### **4. Camera System**
- Perspective camera positioned at angle (like demo)
- Mouse drag to rotate world (rotate worldGroup)
- Scroll to zoom (adjust camera Y position)
- Arrow keys to pan camera
- Touch support (drag, pinch-to-zoom)

**Controls:**
- **Drag:** Rotate world on Y axis
- **Scroll:** Zoom camera in/out
- **Arrow Keys:** Pan camera position
- **Z/X Keys:** Move camera up/down

**Files:**
- `src/composables/use3DCamera.ts`

**Documentation:**
- [phase1/camera-system.md](phase1/camera-system.md)

---

#### **5. Basic Environment**
- Floor plane with bedding texture
- Habitat boundaries (walls or visual indicators)
- Sky blue background with fog
- Lighting (ambient + directional with shadows)
- Optional: Clouds (like demo)

**Files:**
- `src/composables/use3DScene.ts` (extended)

---

#### **6. Real-Time Synchronization**
- Watch `habitatConditions.guineaPigPositions` Map
- Convert grid positions to 3D world coordinates
- Update guinea pig mesh positions in animation loop
- Sync rotation/facing direction

**Files:**
- `src/composables/use3DSync.ts`

---

### **Deliverables**

- [ ] Three.js installed and integrated with Vue 3
- [ ] Coordinate mapping system (grid → 3D)
- [ ] Guinea pig 3D model renders correctly
- [ ] Camera controls work (orbit, pan, zoom)
- [ ] Basic environment (floor, walls, lighting)
- [ ] Guinea pigs move in 3D when 2D game updates

### **Testing**

1. Click on 2D game habitat → Guinea pig moves in 3D
2. Drag mouse → World rotates
3. Scroll → Camera zooms in/out
4. Arrow keys → Camera pans
5. Multiple guinea pigs render without conflict

### **Milestone**

✅ **Phase 1 Complete** when guinea pigs move in 3D scene in real-time sync with 2D game state.

---

## 🎨 **Phase 2: Enhanced Objects and Basic Interactions**

**Status:** 📋 Not Started
**Target Start:** After Phase 1 completion

### **Goals**

Render all habitat items in 3D and enable basic click interactions:
1. All habitat items have 3D models
2. Items positioned correctly from game state
3. Click floor to move guinea pig
4. Poop visualization and cleanup
5. Walking animation

### **Technical Components**

#### **1. 3D Item Models**

Port existing items from demo:
- Hay bowl (cylinder with hay strands)
- Water bottle (cylinder + nozzle)
- Igloo shelter (hemisphere with cutout)
- Wooden arch/tunnel (extruded shape)
- Chew stick (textured cylinder)
- Play ball (woven torus rings)

Create additional models:
- Beds (various shapes)
- Hay racks (wall-mounted)
- Other shelter types
- Additional toys and chews

**Files:**
- `src/composables/use3DItems.ts`

**Documentation:**
- [phase2/item-models.md](phase2/item-models.md)

---

#### **2. Item Positioning System**

- Watch `habitatConditions.itemPositions` Map
- Convert grid positions to 3D coordinates
- Handle item rotation and orientation
- Support dynamic add/remove

**Files:**
- `src/composables/use3DItems.ts` (extended)

---

#### **3. Click Interactions**

- Raycasting from mouse click to 3D scene
- Detect floor intersection → move guinea pig
- Detect item intersection → highlight item
- Visual feedback (hover states, outlines)

**Files:**
- `src/composables/use3DCamera.ts` (extended)
- `src/views/debug/Habitat3DDebug.vue`

**Documentation:**
- [phase2/interactions.md](phase2/interactions.md)

---

#### **4. Poop Visualization**

- Watch `habitatConditions.poopPositions` Map
- Render poop pellets at positions
- Click to clean → remove from store
- Pellet 3D model (capsule)

**Files:**
- `src/composables/use3DItems.ts` (extended)

---

#### **5. Walking Animation**

- Procedural walk cycle (bobbing, foot movement)
- Smooth rotation toward movement direction
- Idle breathing animation
- Blinking animation

**Files:**
- `src/composables/use3DGuineaPig.ts` (extended)

---

### **Deliverables**

- [ ] All habitat items render in 3D
- [ ] Items sync with game state
- [ ] Click floor to move guinea pig works
- [ ] Poop appears and can be cleaned
- [ ] Walking animation plays during movement

### **Milestone**

✅ **Phase 2 Complete** when full 3D habitat is visible with all items and clickable floor movement works.

---

## 🎮 **Phase 3: Full Playability** ⭐

**Status:** 📋 Not Started
**Target Start:** After Phase 2 completion

### **Goals**

Make the 3D view fully playable with complete guinea pig care:
1. Floating action buttons for interactions
2. UI overlay (stats, activity feed)
3. Click items to interact (feed, water, etc.)
4. Behavior animations (eat, drink, sleep)
5. Debug panel integration
6. All starter objects working

### **Technical Components**

#### **1. Floating Action Buttons (FAB)**

Mobile-friendly action buttons:
- Feed button → trigger eat behavior
- Water button → trigger drink behavior
- Clean button → remove poop
- Position: Bottom center (like demo)

**Files:**
- `src/components/game/habitat/Habitat3DControls.vue`

**Documentation:**
- [phase3/ui-overlay.md](phase3/ui-overlay.md)

---

#### **2. Navigation & UI Overlay**

Overlay Vue components on 3D canvas:
- Top navigation bar (habitat name, time, coins)
- Stats panel (needs bars, wellness meter)
- Activity feed (messages scroll over 3D)
- Settings/menu button

**Files:**
- `src/views/debug/Habitat3DDebug.vue` (extended)
- Various UI components

---

#### **3. Item Interactions**

Click items to trigger actions:
- Click bowl → feed guinea pig menu
- Click water bottle → refill water
- Click hay rack → add hay
- Click shelter → inspect item
- Visual feedback (highlights, tooltips)

**Files:**
- `src/composables/use3DCamera.ts` (extended)

---

#### **4. Behavior Animations**

- **Eat:** Head down to bowl, chewing motion, food disappears
- **Drink:** Approach water bottle, head tilt, bubbles spawn
- **Sleep:** Lie down, eyes close, breathing slows
- **Idle:** Nose wiggle, ear twitch

**Files:**
- `src/composables/use3DGuineaPig.ts` (extended)

---

#### **5. Debug Panel Integration**

- Toggle 2D/3D view
- Show/hide grid overlay
- Behavior trigger buttons
- Camera position reset
- Performance stats (FPS, draw calls)

**Files:**
- `src/views/debug/Habitat3DDebug.vue` (extended)

---

#### **6. Starter Objects Support**

Ensure all Phase 1 starting items work:
- Ceramic food bowl
- Wall-mounted water bottle
- Small hay rack
- Plastic igloo shelter
- Timothy hay
- Guinea pig pellets

**Documentation:**
- [phase3/playability.md](phase3/playability.md)

---

### **Deliverables**

- [ ] Floating action buttons work (feed, water, clean)
- [ ] UI overlay renders over 3D scene
- [ ] Click items to interact
- [ ] Behavior animations play correctly
- [ ] Debug panel functional
- [ ] All starter objects render and function

### **Milestone**

✅ **Phase 3 Complete** → Resume [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md)
This is the **sprint resume milestone** - once achieved, return to 2D sprint work.

---

## ✨ **Phase 4: Polish & Parity**

**Status:** 📋 Not Started
**Target Start:** After resuming and completing SPRINT-2025-11-17.md

### **Goals**

Achieve full feature parity with 2D game and add polish:
1. Advanced animations (social, popcorn, zoomies)
2. Particle effects
3. Sound system
4. Performance optimization
5. Mobile refinement

### **Features**

#### **Advanced Animations**
- Popcorn jump (vertical leap)
- Zoomies (fast running in circles)
- Social interactions (nose touch, grooming, following)
- Play animations (toy interactions)

#### **Particle Effects**
- Dust clouds during movement
- Food particles when eating
- Hay strands falling
- Water droplets

#### **Sound System**
- Wheeks (guinea pig vocalizations)
- Chewing/crunching sounds
- Movement sounds (patter of feet)
- Ambient habitat sounds

#### **Performance Optimization**
- Instanced meshes for repeated objects
- Level of Detail (LOD) system
- Occlusion culling
- Texture atlases
- Efficient shadow maps

#### **Mobile Refinement**
- Touch gesture improvements
- Performance mode toggle
- Simplified graphics option
- Battery-saving mode

---

### **Deliverables**

- [ ] All 18 autonomous behaviors have animations
- [ ] Particle system implemented
- [ ] Sound system integrated
- [ ] Performance optimized for mobile
- [ ] Full 2D feature parity

### **Milestone**

✅ **Phase 4 Complete** → 3D system fully polished and production-ready

---

## 📊 **Overall Progress**

### **Completed Phases**
_None yet_

### **Current Phase**
**Phase 1:** MVP - Basic 3D Scene with Guinea Pig Movement 🚧

### **Next Phase**
**Phase 2:** Enhanced Objects and Basic Interactions 📋

---

## 🔗 **Quick Navigation**

- [← Back to Project Plan](PROJECT_PLAN.md)
- [Phase 1 Documentation →](phase1/)
- [2D Game Documentation](../docs/PROJECT_PLAN.md)

---

**Last Updated:** November 29, 2025
