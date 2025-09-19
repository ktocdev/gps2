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
- **[Debug Menu System](systems/phase1/debug-menu-system.md)** - Development debugging tools
- **[Error Tracking System](systems/phase1/error-tracking.md)** - System monitoring and debugging interface

##### Phase 2: Core Entities & Timing
- **[Guinea Pig Store](systems/phase2/guinea-pig-store.md)** - Central guinea pig state management
- **[Guinea Pig Creation](systems/phase2/guinea-pig-creation.md)** - Character creation and preferences generation
- **[Needs System](systems/phase2/needs-system.md)** - Seven fundamental needs with decay and satisfaction
- **[Needs Controller Store](systems/phase2/needs-controller-store.md)** - Centralized needs management
- **[Habitat Conditions](systems/phase2/habitat-conditions.md)** - Environmental state tracking
- **[Game Timing](systems/phase2/game-timing.md)** - Game loop and time management

##### Phase 3: Game World & Environment
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

## Documentation Maintenance
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep this PROJECT_PLAN.md navigation current
- Document architectural decisions in appropriate system files