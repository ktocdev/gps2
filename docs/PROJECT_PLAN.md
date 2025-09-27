# Guinea Pig Simulation Game - Project Documentation

## Overview
Comprehensive virtual guinea pig care simulator featuring individual personality discovery, environmental management, and friendship development through attentive care. Built with Vue 3, TypeScript, and Pinia for a responsive, mobile-first experience.

## Documentation Navigation

### Primary Documentation Files
- **[Development Phases](DEVELOPMENT_PHASES.md)** - Implementation roadmap and phase summaries
- **[System Integration](SYSTEM_INTEGRATION.md)** - Architecture, dependencies, and data flow details

### Documentation Directories

#### Core Game Design
**[game-design/](game-design/)** - Fundamental mechanics and design philosophy
- **[Wellness System](game-design/wellness-system.md)** - Hidden wellness calculation and friendship penalties
- **[Happiness Mechanics](game-design/happiness-mechanics.md)** - Entertainment system preventing boredom
- **[Preferences System](game-design/preferences-system.md)** - Individual guinea pig personality through discovery
- **[Habitat Conditions](game-design/habitat-conditions.md)** - Environmental management separate from needs
- **[Activity Feed Design](game-design/activity-feed-design.md)** - Text-based communication before animations

#### System Implementation Details
**[systems/](systems/)** - Detailed system specifications organized by development phase

##### Phase 1: Foundation & Infrastructure
- **[Game Controller Store](systems/phase1/game-controller-store.md)** - Central control system with save/load ✅ **Completed** (September 17, 2025 | Branch: GPS2-3)
- **[Layout Component Framework](systems/phase1/layout-component-framework.md)** - Region-based development with responsive UI
- **[Logging Activity Feed](systems/phase1/logging-activity-feed.md)** - Centralized logging and natural language activity generation

##### Phase 1.5: Developer Tools
- **[Error Tracking System](systems/phase1/error-tracking.md)** - Professional debugging interface with system monitoring, error analysis, and developer tools ✅ **Completed** (September 20, 2025 | Branch: GPS2-7)

**Note:** Debug Menu panels for specific game systems (Needs, Wellness, Habitat, etc.) are built incrementally alongside each system in subsequent phases, with final consolidation into a unified Debug Menu tab in Phase 5.

##### Phase 2: Core Entities & Timing
- **[Guinea Pig Store](systems/phase2/guinea-pig-store.md)** - Central guinea pig state management ✅ **Core Completed** (September 22, 2025 | Branch: GPS2-7)
- **[Guinea Pig Creation](systems/phase2/guinea-pig-creation.md)** - Character creation with enhanced forms, accessibility, and segmented button groups ✅ **Completed** (September 20, 2025 | Branch: GPS2-7)
- **[Pet Store & Game Session Manager](systems/phase2/save-game-manager-plan.md)** - Single-session pet store system with 10 random guinea pigs, persistent progression, and session management 📋 **Planned** (September 27, 2025 | Branch: GPS2-9)
- **[Needs System](systems/phase2/needs-system.md)** - Seven fundamental needs with decay and satisfaction
- **[Needs Controller Store](systems/phase2/needs-controller-store.md)** - Centralized needs management
- **[Habitat Conditions](systems/phase2/habitat-conditions.md)** - Environmental state tracking
- **[Game Timing](systems/phase2/game-timing.md)** - Game loop and time management

##### Phase 3: Game World & Environment
- **[Guinea Pig Store Persistence Fix](systems/phase2/guinea-pig-store-persistence-fix.md)** - Guinea pig persistence and save game system documentation ✅ **Completed** (September 27, 2025 | Branch: GPS2-9)
- **[Inventory Store System](systems/phase3/inventory-store-system.md)** - Item management and purchasing
- **[Habitat Item System](systems/phase3/habitat-item-system.md)** - Interactive environment objects
- **[Habitat Maintenance Hygiene](systems/phase3/habitat-maintenance-hygiene-system.md)** - Environmental care and cleanliness

##### Phase 4: Interactions & Behaviors
- **[Direct Interaction System](systems/phase4/direct-interaction-system.md)** - Player-to-guinea pig interactions
- **[Guinea Pig Autonomy System](systems/phase4/guinea-pig-autonomy-system.md)** - AI-driven autonomous behaviors

##### Phase 5: Polish & Enhancements
- **[Achievement Progression System](systems/phase5/achievement-progression-system.md)** - Milestone tracking and rewards
- **[Sound System](systems/phase5/sound-system.md)** - Audio feedback and reactions
- **[Settings Preferences Enhancement](systems/phase5/settings-preferences-enhancement.md)** - User configuration management
- **[Guinea Pig Animation System](systems/phase5/guinea-pig-animation-system.md)** - Visual animation enhancement

#### Technical Guides
**[technical/](technical/)** - Implementation and platform considerations
- **[Performance Optimization](technical/performance-optimization.md)** - Game loop optimization and efficiency strategies
- **[Architecture Guidelines](technical/architecture-guidelines.md)** - TypeScript patterns and system design
- **[Mobile Cross Platform](technical/mobile-cross-platform.md)** - Mobile-first responsive design and PWA features
- **[Audio Media Implementation](technical/audio-media-implementation.md)** - Web Audio API and cross-platform audio
- **[Data Persistence](technical/data-persistence.md)** - Storage strategies and state management

#### Archive
**[archive/](archive/)** - Reference materials
- **[PROJECT_PLAN_FULL.md](archive/PROJECT_PLAN_FULL.md)** - Complete original monolithic documentation (archived 9/14/2025)

## Quick Start Guide

### For Developers
1. Start with **[Development Phases](DEVELOPMENT_PHASES.md)** for implementation roadmap
2. Review **[System Integration](SYSTEM_INTEGRATION.md)** for architecture overview
3. Follow phase-specific documentation in **[systems/](systems/)** directory
4. Reference **[technical/](technical/)** guides for implementation details

### For Game Designers
1. Explore **[game-design/](game-design/)** for core mechanics understanding
2. Review **[Preferences System](game-design/preferences-system.md)** for personality mechanics
3. Study **[Happiness Mechanics](game-design/happiness-mechanics.md)** for engagement strategy

### For Understanding Project Structure
1. Begin with this **PROJECT_PLAN.md** for navigation overview
2. Check **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)** for implementation sequence
3. Dive into specific system documentation as needed

## Current Development Status
**Branch:** GPS2-7 | **Updated:** September 22, 2025

### Recently Completed ✅
- **Guinea Pig Store Persistence Fix**: Resolved data persistence issues, documented guinea pig store architecture
- **Pet Store Architecture Design**: New single-session system with 10-guinea pig pet store replacing multi-slot saves
- **Codebase Cleanup**: Removed old save/load game system, guinea pig creation flow, and unused code
- **TypeScript Error Resolution**: All build errors fixed, clean compilation
- **UI Improvements**: Enhanced stats display with Roboto font, improved layout and styling

### Next Phase Priority 📋
**Pet Store & Game Session Manager Implementation**
- Create PetStoreManager store with 10-guinea pig generation
- Create PlayerProgression store for persistent currency and items
- Implement pet store selection UI (1-2 guinea pig selection)
- Create end game flow with guinea pig return and penalties
- Add guinea pig swap functionality with 1-hour cooldown
- Build PetStoreSelection component
- Implement session state management
- Add debug panel for pet store testing

### Phase 2 Foundation Complete ✅
Core guinea pig functionality is stable and ready for:
- Save game slot implementation (immediate priority)
- Needs system development
- Timing system integration
- Habitat conditions tracking

## Documentation Maintenance
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep this PROJECT_PLAN.md navigation current
- Document architectural decisions in appropriate system files