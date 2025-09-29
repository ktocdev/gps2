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
- **[System 6: Guinea Pig Store](systems/phase2/system-6-guinea-pig-store.md)** - Central guinea pig state management ✅ **Core Completed** (September 22, 2025 | Branch: GPS2-7)
- **[System 6.5: Pet Store & Game Session Manager](systems/phase2/system-6.5-pet-store-manager.md)** - Single-session pet store system with 10 guinea pigs featuring weighted rarity system, smart eye color genetics, 24-hour auto-refresh, persistent progression, and session management ✅ **Completed** (September 27, 2025 | Branch: GPS2-11)
- **[System 6.9: Guinea Pig Favorites](systems/phase2/system-6.9-guinea-pig-favorites.md)** - Save beloved guinea pigs permanently with purchasable slots and store refresh protection
- **[System 7: Needs System](systems/phase2/system-7-needs-system.md)** - Seven fundamental needs with decay and satisfaction
- **[System 8: Needs Controller Store](systems/phase2/system-8-needs-controller-store.md)** - Centralized needs management ✅ **Implemented** (needsController.ts)
- **[Systems 9-10: Game Timing](systems/phase2/system-9-10-game-timing.md)** - Game loop and time management ✅ **Implemented** (gameTimingStore.ts)

##### Phase 3: Game World & Environment
- **[System 11: Habitat Conditions](systems/phase3/system-11-habitat-conditions.md)** - Environmental state tracking with resource management
- **[Inventory Store System](systems/phase3/inventory-store-system.md)** - Item management and purchasing
- **[Habitat Item System](systems/phase3/habitat-item-system.md)** - Interactive environment objects
- **[Habitat Maintenance Hygiene](systems/phase3/habitat-maintenance-hygiene-system.md)** - Environmental care and cleanliness

##### Phase 4: Interactions & Behaviors
- **[Direct Interaction System](systems/phase4/direct-interaction-system.md)** - Player-to-guinea pig interactions
- **[Guinea Pig Autonomy System](systems/phase4/guinea-pig-autonomy-system.md)** - AI-driven autonomous behaviors
- **[Guinea Pig Social Interactions](systems/phase2/system-8.5-needs-integration-plan.md#phase-4-guinea-pig-social-interactions-2-3-days)** - Guinea pig to guinea pig social interactions for enhanced social need satisfaction
- **[Guinea Pig Bonding System](systems/phase4/guinea-pig-bonding-system.md)** - Hidden compatibility and bonding mechanics with personality hints for authentic relationship development

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
- **[system-5-guinea-pig-creation.md](archive/system-5-guinea-pig-creation.md)** - Character creation system documentation (archived 9/28/2025)

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
**Branch:** GPS2-11 | **Updated:** September 28, 2025

### Recently Completed ✅
- **Pet Store & Game Session Manager**: Complete implementation with PetStoreManager store, pet store debug panel, GameController integration, and 10-guinea pig generation system
- **Weighted Rarity System**: Breeds range from common (American, Abyssinian) to ultra-rare (Baldwin, Skinny Pig) with realistic distribution percentages and rarity badge UI
- **Smart Eye Color Genetics**: Pink/red eyes only appear with light-colored guinea pigs (white, cream, beige, gray, lilac, buff) creating realistic albino/leucistic appearances
- **24-Hour Auto-Refresh**: Guinea pig store automatically refreshes daily with live countdown timer, persistent across sessions, and startup checks for overdue refreshes
- **System 6.8 Preference Randomization**: Natural variation in guinea pig preferences with guaranteed 1-2 items per category and no overlap between likes/dislikes
- **Enhanced Debug Interface**: Accessibility improvements with fieldset/legend structure, horizontal dividers, and improved form organization
- **Early Inventory Debug Panel**: Phase 3 Inventory tab implemented early with currency controls (add/deduct, quick actions, reset functionality)
- **Session Management**: Game session lifecycle with refined controls, simplified UI, and clear "Return Guinea Pigs & End Session" functionality
- **Enhanced Form System**: Slider component with prefix/suffix support for currency display, improved accessibility
- **Guinea Pig Store Persistence Fix**: Resolved data persistence issues, documented guinea pig store architecture

### Next Phase Priority 📋
**Phase 2 Completion Tasks**
- Complete needs system validation and testing
- Implement Guinea Pig Favorites System (System 6.9)
- Validate game timing system integration (Systems 9-10) ✅ **Core implemented**
- Connect needs display to UI placeholders
- Create comprehensive debug panels for all systems
- **NEW**: Guinea pig social interactions for enhanced social need satisfaction (Phase 4)

### Phase 2 Foundation Complete ✅
Core pet store, session management, and timing systems complete. Ready for:
- Needs system validation and testing (immediate priority)
- Guinea Pig Favorites System implementation
- Game timing system validation ✅ **Core implemented**
- Phase 2 completion and transition to Phase 3

## Documentation Maintenance
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep this PROJECT_PLAN.md navigation current
- Document architectural decisions in appropriate system files