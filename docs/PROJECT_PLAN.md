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
- **[Preferences System](game-design/preferences-system.md)** - Individual guinea pig personality through discovery
- **[Habitat Conditions](game-design/habitat-conditions.md)** - Environmental management separate from needs
- **[Activity Feed Design](game-design/activity-feed-design.md)** - Text-based communication before animations

#### System Implementation Details
**[systems/](systems/)** - Detailed system specifications organized by development phase

##### Phase 1: Foundation & Infrastructure
- **[Game Controller Store](systems/phase1/system-1-game-controller-store.md)** - Central control system with save/load ✅ **Completed** (September 17, 2025 | Branch: GPS2-3)
- **[Layout Component Framework](systems/phase1/system-2-layout-component-framework.md)** - Region-based development with responsive UI
- **[Logging Activity Feed](systems/phase1/system-3-logging-activity-feed.md)** - Centralized logging and natural language activity generation

##### Phase 1.5: Developer Tools
- **[Error Tracking System](systems/phase1/system-4-error-tracking.md)** - Professional debugging interface with system monitoring, error analysis, and developer tools ✅ **Completed** (September 20, 2025 | Branch: GPS2-7)

**Note:** Debug Menu panels for specific game systems (Needs, Wellness, Habitat, etc.) are built incrementally alongside each system in subsequent phases, with final consolidation into a unified Debug Menu tab in Phase 5.

##### Phase 2: Core Entities & Timing
- **[System 6: Guinea Pig Store](systems/phase2/system-6-guinea-pig-store.md)** - Central guinea pig state management ✅ **Core Completed** (September 22, 2025 | Branch: GPS2-7)
- **[System 6.5: Pet Store & Game Session Manager](systems/phase2/system-6.5-pet-store-manager.md)** - Single-session system with active/favorite preservation, 30% American breed spawn rate, 24-hour auto-refresh enabled by default, weighted rarity, smart genetics ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 6.9: Guinea Pig Favorites](systems/phase2/system-6.9-guinea-pig-favorites.md)** - Save beloved guinea pigs permanently with purchasable slots and store refresh protection ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 6.95: Permanent Adoption & Natural Store Churn - REDESIGN](systems/phase2/system-6.95-REDESIGN-permanent-adoption.md)** - Complete system redesign: permanent adoption (no returns ever), friendship-gated favorites (85% threshold), natural store churn via adoption timers (2-5 days), store access gating (all active must be favorited), pairing rules (New+New ✅, Favorite+Favorite ✅, New+Favorite ❌), bond preservation, removes ALL refresh mechanics 📋 **Planned** (Prerequisite: Friendship System Enhancement)
- **[System 7: Needs System](systems/phase2/system-7-needs-system.md)** - 10 needs categories with quick actions, smart disable states (game pause, needs pause, 100% saturation), informative tooltips ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 8: Needs Controller Store](systems/phase2/system-8-needs-controller-store.md)** - Centralized management with manual pause tracking, auto-reset on session end, System Controls panel ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[Systems 9-10: Game Timing](systems/phase2/system-9-10-game-timing.md)** - Unified tick system with pause/resume, automatic pause on navigation, Game State & Controls panel ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)

##### Phase 2.5: Interactive Feedback Enhancement
- **[System 10.1: Personality Trait Influences](systems/phase2.5/system-10.1-personality-trait-influences.md)** - How Friendliness, Playfulness, Curiosity, Boldness affect need decay, interaction effectiveness, and reactions ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
- **[System 10.2: Preferences: Likes & Dislikes](systems/phase2.5/system-10.2-preferences-likes-dislikes.md)** - Individual guinea pig preferences with hidden discovery mechanics (favorites/neutral/disliked) ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
- **[System 10.2.5: Fulfillment Limitation System](systems/phase2.5/system-10.2.5-fulfillment-limitation.md)** - Consumption limits per hunger cycle (fruit:1, veg:3, pellets:2, treats:1, hay:unlimited), interaction rejection based on personality + friendship + wellness with cooldown system (30s-2min) 🚧 **In Progress** (October 9, 2025)
- **[System 10.3: Wellness-Based Interaction Reactions](systems/phase2.5/system-10.3-wellness-interaction-reactions.md)** - How wellness affects interaction success rates, behavioral states, and guinea pig responsiveness
- **[System 10.4: Guinea Pig Rescue](systems/phase2.5/system-10.4-guinea-pig-rescue.md)** - Safety net when wellness < 15% with $200 penalty and Fresh Start option (slots 4-10 lost)
- **[System 10.5: Enhanced Activity Messages](systems/phase2.5/system-10.5-enhanced-activity-messages.md)** - Guinea pig reactions, need warnings (60s/30s throttle), wellness messages, like/dislike clues, friendship milestones

##### Phase 3: Game World & Environment
- **[System 11: Supplies Store System](systems/phase3/system-11-supplies-store.md)** - Central catalog of all purchasable items (bedding, hay, habitat items, food, treats) ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
- **[System 12: Inventory Management System](systems/phase3/inventory-management-system.md)** - Track owned items, quantities, and consumption ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
- **[System 13: Habitat Conditions](systems/phase3/system-13-habitat-conditions.md)** - Environmental state tracking consuming inventory resources ✅ **Foundation Complete** - Awaiting integration
- **[System 14: Habitat Item System](systems/phase3/habitat-item-system.md)** - Interactive environment objects using inventory data
- **[System 15: Habitat Maintenance Hygiene](systems/phase3/habitat-maintenance-hygiene-system.md)** - Environmental care and cleanliness

##### Phase 4: Interactions & Behaviors (Guinea Pig Integration)
📋 **Ready for Implementation** - Comprehensive planning complete with 5 sequential stages

**Master Plan:**
- **[Phase 4 Guinea Pig Integration Plan](systems/phase4/phase-4-guinea-pig-integration-plan-full.md)** - Complete overview with dependencies, timeline, and success criteria

**Implementation Plans (38-53 hours total):**
- **[System 17: Visual Presence & Positioning](systems/phase4/system-17-visual-presence-positioning.md)** - Stage 1: Guinea pig sprites and grid positioning (2-3 hours)
- **[System 18: Pathfinding & Movement](systems/phase4/system-18-pathfinding-movement.md)** - Stage 2: A* pathfinding and movement controller (6-8 hours)
- **[System 19: Autonomous AI Behaviors](systems/phase4/system-19-autonomous-ai-behaviors.md)** - Stage 3: Decision matrix and autonomous actions (12-16 hours)
- **[System 20: Direct Interaction System](systems/phase4/system-20-direct-interaction-system.md)** - Stage 4: 40+ player interactions across 7 categories (10-14 hours)
- **[System 21: Social Bonding System](systems/phase4/system-21-social-bonding-system.md)** - Stage 5: Hidden compatibility and multi-pig bonding (8-12 hours)

**Design Documentation:**
- **[Direct Interaction Design](systems/phase4/design-docs/direct-interaction-system.md)** - Comprehensive interaction catalog and mechanics
- **[Autonomy Design](systems/phase4/design-docs/guinea-pig-autonomy-system.md)** - Complete behavior specifications and AI design
- **[Bonding Design](systems/phase4/design-docs/guinea-pig-bonding-system.md)** - Research-based bonding mechanics and compatibility

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
3. Study **[Needs System](systems/phase2/system-7-needs-system.md)** for need mechanics including happiness

### For Understanding Project Structure
1. Begin with this **PROJECT_PLAN.md** for navigation overview
2. Check **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)** for implementation sequence
3. Dive into specific system documentation as needed

## Current Development Status
**Latest:** Phase 3 In Progress (Systems 11-12 Complete), Phase 4 Planning Complete | **Branch:** GPS2-34 | **Updated:** October 20, 2025

For detailed implementation status and phase breakdowns, see **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)**.

For active task tracking and recent completions, see **[TODO-2025-10-13.md](TODO-2025-10-13.md)**.

## Documentation Maintenance
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep this PROJECT_PLAN.md navigation current
- Document architectural decisions in appropriate system files