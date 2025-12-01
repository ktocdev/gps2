# GPS2 3D Environment System - Project Plan

> **Status:** ⭐ Phase 3 Complete - Sprint Resume Milestone Achieved!
> **Started:** November 29, 2025
> **Current Phase:** Phase 4 - Movement Polish & Animation (Next)

---

## 📋 **Project Overview**

This project implements a fully playable 3D version of the Guinea Pig Simulator that shares the same underlying logic (Pinia stores, composables) as the 2D game. The 3D view provides an immersive perspective while maintaining real-time synchronization with the core game state.

### **Core Principles**

1. **Shared Logic:** Both 2D and 3D use the same Pinia stores and composables
2. **Real-Time Sync:** 3D view reflects game state changes instantly
3. **Full Playability:** 3D mode is not just visualization - it's fully interactive
4. **Mobile-First UI:** Floating action buttons and touch controls for mobile devices
5. **Performance:** Optimized for smooth 60 FPS on modern devices

---

## 🎯 **Project Goals**

### **Primary Goal**
Create a 3D habitat view that allows players to fully interact with their guinea pigs using camera controls similar to the demo (drag to rotate, scroll to zoom, arrow keys to pan).

### **Milestone for Sprint Resume**
Complete **Phase 3** (Full Playability) with:
- Starter objects from 2D game working in 3D
- Minimal guinea pig care (feed, water, clean)
- Floating action buttons for interactions
- All basic behaviors and animations

Once this milestone is reached, resume work on [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md).

---

## 📂 **Documentation Structure**

### **Navigation**

- **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)** - Comprehensive phase documentation and roadmap
- **Phase 1: MVP** - [phase1/](phase1/)
  - [threejs-integration.md](phase1/threejs-integration.md) - Three.js setup with Vue 3
  - [coordinate-mapping.md](phase1/coordinate-mapping.md) - Grid to 3D world conversion
  - [guinea-pig-model.md](phase1/guinea-pig-model.md) - 3D model construction
  - [camera-system.md](phase1/camera-system.md) - Camera controls (orbit, pan, zoom)
- **Phase 2: Enhanced Objects** - [phase2/](phase2/)
  - `item-models.md` (planned) - 3D habitat item models
  - `interactions.md` (planned) - Click and raycasting system
- **Phase 3: Full Playability** - [phase3/](phase3/)
  - [3D-ITEM-MODELS-REFACTORING.md](phase3/3D-ITEM-MODELS-REFACTORING.md) - Scalability plan for 100+ items
  - `ui-overlay.md` (planned) - Floating action buttons and UI
  - `playability.md` (planned) - Complete gameplay features

---

## 🗺️ **Development Phases**

### **Phase 1: MVP - Basic 3D Scene with Guinea Pig Movement** ✅
**Status:** Complete
**Goal:** Basic 3D habitat with guinea pigs moving in real-time

**Completed Features:**
- Three.js integration with Vue 3
- Grid-to-3D coordinate mapping (14x10 grid → Vector3)
- Guinea pig 3D model (ported from demo)
- Real-time position sync from `habitatConditions` store
- Camera system (orbit controls: drag, scroll, keyboard)
- Basic environment (floor, walls, lighting, sky)
- Guinea pigs face movement direction

**Milestone:** ✅ Guinea pigs move in 3D, camera controls working

---

### **Phase 2: Items & Interactions** ✅
**Status:** Complete
**Completed:** November 30, 2025
**Goal:** All habitat items rendered in 3D with interactions

**Completed Features:**
- ✅ 3D models for all items (bowl, igloo, water bottle, stick, ball, bed, tunnel)
- ✅ Enhanced models with hay, food, and wood textures
- ✅ Smart water bottle rotation based on wall position (corners + edges)
- ✅ Item positioning from `habitatConditions.itemPositions`
- ✅ Poop visualization and click-to-cleanup (raycasting)
- ✅ Bowl contents rendering (hay and food items)

**Milestone:** ✅ Full 3D habitat environment with all items visible

**Refactoring Plan:** [3D Item Models Refactoring](phase3/3D-ITEM-MODELS-REFACTORING.md) - For scalability to 100+ items

---

### **Phase 3: Full Playability** ✅ ⭐ Sprint Resume Milestone
**Status:** Complete
**Completed:** November 30, 2025
**Goal:** Complete playable 3D game with minimal guinea pig care

**Completed Features:**
- ✅ Guinea pig selection (click to select with raycasting)
- ✅ Selection indicator (pulsing green ring)
- ✅ Floating action buttons (feed, water, play, pet, deselect)
- ✅ Button triggers call existing autonomy functions
- ✅ Poop cleanup interaction (click to remove)
- ✅ All buttons disabled when no guinea pig selected
- ✅ Selected guinea pig name displayed in UI

**Milestone:** ⭐ **COMPLETED** - Fully playable 3D mode → Ready to resume SPRINT-2025-11-17.md

---

### **Phase 4: Movement Polish & Animation** 📋
**Status:** Not Started
**Goal:** Smooth movement like demo (guinea-pig-sim-demo-backup.html)

**Key Features:**
- Position interpolation (lerping between grid updates)
- Rotation interpolation (smooth turning)
- Walking animation (feet alternating up/down)
- Body bobbing while walking
- Nose wiggle animation
- Idle vs. moving state detection

**Milestone:** Movement quality matches demo smoothness

**Reference:** See [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md#phase-4-movement-polish--animation) for detailed implementation plan

---

### **Phase 5: Polish & Parity** 📋
**Status:** Not Started
**Goal:** Full feature parity with 2D game + polish

**Key Features:**
- Advanced animations (popcorn, zoomies, social)
- Particle effects
- Sound system
- Performance optimization
- Mobile refinement
- UI overlays (stats, activity feed)

---

## 🏗️ **Architecture**

### **Shared Components (2D + 3D)**

**Pinia Stores:**
- `guineaPigStore` - Guinea pig entities and attributes
- `habitatConditions` - Environment state (positions, items, poop)
- `inventoryStore` - Player inventory
- `gameController` - Game state management
- `needsController` - Needs processing

**Composables:**
- `usePathfinding` - A* pathfinding (2D grid)
- `useMovement` - Movement controller
- `useGuineaPigBehavior` - Autonomous AI (18 behaviors)

### **3D-Specific Components**

**Composables:**
- `use3DScene` - Three.js scene, camera, renderer
- `use3DSync` - Sync game state to 3D positions
- `use3DGuineaPig` - Guinea pig 3D model creation
- `use3DItems` - Habitat item 3D models
- `use3DCamera` - Camera controls (orbit, pan, zoom)

**Views:**
- `Habitat3DDebug.vue` - 3D habitat debug page

**Components:**
- `Habitat3DControls.vue` - Floating action buttons

---

## 📊 **Progress Tracking**

### **Current Status**
- ✅ Project plan created
- ✅ Phase 1 complete (MVP with camera controls)
- ✅ Phase 2 complete (Items & Interactions)
- ✅ Phase 3 complete (Full Playability) ⭐ **Sprint Resume Milestone**
- 📋 Phase 4 ready to start (Movement Polish & Animation)
- 📋 Phase 5 planned

### **Completed**
- ✅ Three.js installed and integrated
- ✅ Phase 1 composables implemented (`use3DScene`, `use3DCamera`, `use3DSync`, `use3DGuineaPig`)
- ✅ Phase 2 composables implemented (`use3DItems`, `use3DPoop`, `use3DTextures`)
- ✅ 3D habitat debug page created
- ✅ Guinea pig movement synchronization working
- ✅ Camera controls fixed (drag, scroll, keyboard, touch)
- ✅ Guinea pigs face movement direction
- ✅ Floor scaled to match guinea pig proportions
- ✅ All habitat items rendered with enhanced models
- ✅ Smart water bottle rotation (corners + edges)
- ✅ Bowl contents rendering (hay, food)
- ✅ Poop pellet visualization and click-to-cleanup
- ✅ Raycasting system for interactions
- ✅ Guinea pig selection with click (raycasting)
- ✅ Selection indicator (pulsing green ring)
- ✅ Floating action buttons (Feed, Water, Play, Pet, Deselect)
- ✅ Action buttons wired to existing autonomy functions
- ✅ Selected guinea pig name displayed in UI

### **Next Steps (Phase 4 - Optional)**
1. Smooth position interpolation (lerping)
2. Smooth rotation interpolation
3. Walking animation (feet, body bobbing, nose wiggle)
4. Movement quality matching demo
5. Optional: Refactor item models for scalability (see [refactoring plan](phase3/3D-ITEM-MODELS-REFACTORING.md))

---

## 🔗 **Related Documentation**

- [Main Project Plan](../docs/PROJECT_PLAN.md) - 2D game documentation
- [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md) - Deferred sprint (resume after Phase 3)
- [guinea-pig-sim-demo-backup.html](../src/guinea-pig-sim-demo-backup.html) - 3D demo reference

---

**Last Updated:** November 30, 2025 (Phase 3 Complete - Sprint Resume Milestone Achieved!)
