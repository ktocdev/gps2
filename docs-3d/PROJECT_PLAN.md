# GPS2 3D Environment System - Project Plan

> **Status:** 🚧 In Development - Phase 1
> **Started:** November 29, 2025
> **Current Phase:** Phase 1 - MVP (Basic 3D Scene with Guinea Pig Movement)

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

- **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)** - Phase breakdown and roadmap
- **Phase 1: MVP** - [phase1/](phase1/)
  - [threejs-integration.md](phase1/threejs-integration.md) - Three.js setup with Vue 3
  - [coordinate-mapping.md](phase1/coordinate-mapping.md) - Grid to 3D world conversion
  - [guinea-pig-model.md](phase1/guinea-pig-model.md) - 3D model construction
  - [camera-system.md](phase1/camera-system.md) - Camera controls (orbit, pan, zoom)
- **Phase 2: Enhanced Objects** - [phase2/](phase2/)
  - [item-models.md](phase2/item-models.md) - 3D habitat item models
  - [interactions.md](phase2/interactions.md) - Click and raycasting system
- **Phase 3: Full Playability** - [phase3/](phase3/)
  - [ui-overlay.md](phase3/ui-overlay.md) - Floating action buttons and UI
  - [playability.md](phase3/playability.md) - Complete gameplay features

---

## 🗺️ **Development Phases**

### **Phase 1: MVP - Basic 3D Scene with Guinea Pig Movement** 🚧
**Status:** In Progress
**Goal:** Basic 3D habitat with guinea pigs moving in real-time

**Key Features:**
- Three.js integration with Vue 3
- Grid-to-3D coordinate mapping (14x10 grid → Vector3)
- Guinea pig 3D model (ported from demo)
- Real-time position sync from `habitatConditions` store
- Camera system (perspective with orbit controls)
- Basic environment (floor, walls, lighting, sky)

**Milestone:** Guinea pigs move in 3D when clicking 2D game or using 2D controls

---

### **Phase 2: Enhanced Objects and Basic Interactions** 📋
**Status:** Not Started
**Goal:** All habitat items rendered in 3D with click-to-move

**Key Features:**
- 3D models for all items (bowls, water bottles, shelters, toys, etc.)
- Item positioning from `habitatConditions.itemPositions`
- Click interactions (raycasting for floor movement)
- Poop visualization and cleanup
- Walking animation (procedural cycle)

**Milestone:** Full 3D habitat environment with clickable floor movement

---

### **Phase 3: Full Playability** 📋 ⭐ Sprint Resume Milestone
**Status:** Not Started
**Goal:** Complete playable 3D game with minimal guinea pig care

**Key Features:**
- Floating action buttons (feed, water, clean)
- Navigation and UI overlay (stats, activity feed)
- Item interactions (click items to use them)
- Behavior animations (eat, drink, sleep)
- Debug panel integration
- All starter objects working

**Milestone:** Fully playable 3D mode with guinea pig care → Resume SPRINT-2025-11-17.md

---

### **Phase 4: Polish & Parity** 📋
**Status:** Not Started
**Goal:** Full feature parity with 2D game + polish

**Key Features:**
- Advanced animations (popcorn, zoomies, social)
- Particle effects
- Sound system
- Performance optimization
- Mobile refinement

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
- 🚧 Phase 1 in progress
- 📋 Phases 2-4 planned

### **Next Steps**
1. Complete documentation structure
2. Install Three.js
3. Implement Phase 1 composables
4. Create 3D habitat debug page
5. Test guinea pig movement synchronization

---

## 🔗 **Related Documentation**

- [Main Project Plan](../docs/PROJECT_PLAN.md) - 2D game documentation
- [SPRINT-2025-11-17.md](../docs/SPRINT-2025-11-17.md) - Deferred sprint (resume after Phase 3)
- [guinea-pig-sim-demo-backup.html](../src/guinea-pig-sim-demo-backup.html) - 3D demo reference

---

**Last Updated:** November 29, 2025
