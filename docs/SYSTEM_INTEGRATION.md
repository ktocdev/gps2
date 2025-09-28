# System Integration & Architecture

## Overview
Comprehensive architecture documentation covering store communication patterns, component integration, data flow, and cross-system dependencies for the guinea pig simulation game.

## Store Communication Patterns

### Central Coordination
- **Game Controller Store** ↔ All other stores (game state, pause/resume, settings)
- **Interval Management** → All stores with time-based updates

### Core Entity Management
- **Guinea Pig Store** ↔ Needs Controller Store (entity data, preference discovery)
- **Guinea Pig Store** ↔ Habitat Conditions Store (habitat impact on guinea pig)
- **Needs Controller Store** ↔ Habitat Conditions Store (cross-condition effects)
- **PetStoreManager Store** ↔ Guinea Pig Store (pet store inventory, active guinea pigs, session management)
- **PlayerProgression Store** (persistent currency, items, achievements across sessions)

### Data Flow Principles
- **Reactive updates** through Pinia store connections
- **Event-driven communication** for loosely coupled systems
- **Centralized state management** with distributed processing
- **Consistent update patterns** across all system interactions

## Component-Store Integration Map

### Information Display Components
- **ActivityFeed** ← All stores (activity message generation)
- **NeedBar, HappinessIndicator** ← Needs Controller Store
- **FriendshipMeter** ← Guinea Pig Store (friendship + wellness penalties)
- **HabitatStatusDisplay, ResourceCounter** ← Habitat Conditions Store
- **PreferenceTracker, PreferenceLearningHint** ← Guinea Pig Store

### System Control Components
- **OrientationModal, ResponsiveDetector** ← Game Controller Store (responsive state, pause control)
- **Debug Components** ↔ Respective system stores (bidirectional for testing)

### UI Framework Integration
- **Container-query components** adapt based on allocated space
- **Responsive layout controller** coordinates with Game Controller Store
- **Component library** provides consistent interfaces across all systems

## Event Flow & Dependencies

### 1. Game Initialization Flow
```
Game Controller → UI Framework → Component Library → Logging System
```
- Game state setup and responsive framework initialization
- Component library setup with debug system integration
- Logging system preparation for all subsequent events

### 2. Pet Store & Game Session Flow
```
Pet Store Generation → Pet Store Selection → Game Session Start → Guinea Pig Store → Activity Feed
```
- 10 random guinea pigs generated on first launch with hidden preferences
- Player selects 1-2 guinea pigs to start game session
- Session state initialized, persistent progression loaded
- Initial activity messages for session start

### 3. Game Loop Flow
```
Interval Management → Needs Controller → Habitat Conditions → Activity Generation → UI Updates
```
- Time-based processing coordination
- Batch needs processing and wellness calculation
- Habitat condition updates and resource management
- Activity feed message generation and UI synchronization

### 4. Player Interaction Flow
```
Direct Interaction System → Guinea Pig Store → Reaction System → Activity Feed → Sound System
```
- User action processing and validation
- Guinea pig state updates and reaction generation
- Natural language message creation and audio feedback

### 5. Autonomous Behavior Flow
```
Autonomy System → Pathfinding → Guinea Pig Store → Activity Feed
```
- AI decision making based on needs and preferences
- Movement and interaction execution
- State updates and activity message generation

## Data Flow Architecture

### Pinia Store Management
- **Centralized state management** with reactive updates
- **Session-based state** with localStorage integration:
  - **Session State**: Resets each game (guinea pig needs, habitat conditions, activity feed history)
  - **Persistent State**: Survives sessions (currency, owned items, achievements, statistics)
  - **Pet Store State**: Fixed pool of 10 guinea pigs with swap cooldown (1 hour)
- **Type-safe interfaces** with TypeScript definitions
- **Performance optimization** through efficient state updates

### Event Bus System
- **Cross-system communication** for loosely coupled components
- **Event prioritization** for critical vs routine updates
- **Error handling** and event recovery mechanisms
- **Debug integration** for development monitoring

### Activity Feed Integration
- **Central messaging system** for all user-facing events
- **Real-time updates** with performance optimization
- **Message categorization** and filtering capabilities
- **Accessibility integration** with screen reader support

### Logging & Debug Systems
- **Comprehensive event tracking** for development and analytics
- **Debug system integration** with all store communications
- **Performance monitoring** and bottleneck identification
- **Error tracking** and recovery mechanisms

## Cross-System Dependencies

### Phase 1 Dependencies (Foundation)
- **No external dependencies** - foundational systems
- **Provides infrastructure** for all subsequent phases
- **Debug system** enables testing of future systems
- **UI framework** provides placeholders for all functionality

### Phase 2 Dependencies (Core Entities)
- **Requires:** Complete Phase 1 foundation
- **Depends on:** Game Controller Store, UI framework, debug systems
- **Provides:** Core game entities, pet store system, session management, and timing for subsequent phases
- **Session Model:** Single-session gameplay with pet store selection (1-2 guinea pigs from pool of 10)
- **Progression System:** Persistent player progression (currency, items) across game sessions

### Phase 3 Dependencies (Game World)
- **Requires:** Guinea pig entity and needs framework from Phase 2
- **Depends on:** Complete timing system and state management
- **Provides:** Interactive environment for Phase 4 behaviors

### Phase 4 Dependencies (Interactions)
- **Requires:** Complete game world and habitat system from Phase 3
- **Depends on:** All entity management and environmental systems
- **Provides:** Complete gameplay loop for Phase 5 enhancements

### Phase 5 Dependencies (Polish)
- **Requires:** Complete core gameplay from Phases 1-4
- **Enhances:** Existing functionality without breaking dependencies
- **Optional:** Animation system as visual enhancement layer

## Key Technical Considerations

### Performance Optimization

#### Game Loop Efficiency
- Use `setInterval` with proper cleanup for game loops
- Implement **efficient batch processing** for multiple needs, wellness calculations, and habitat conditions
- **Optimize habitat condition updates** - bedding decay, water consumption, cleanliness changes
- **Resource management efficiency** - track bedding inventory without excessive state updates

#### Responsive Performance
- **Throttle resize events** (100-200ms) to prevent excessive layout recalculations
- **Debounce orientation changes** (300ms) to avoid rapid modal show/hide
- **Container-query optimization** with performance-optimized observation
- **Smart rendering** to minimize unnecessary UI updates

### Architecture Design Principles

#### Extensibility
- **Design for extensibility** - easy to add new needs/features/habitat conditions
- **Modular system architecture** enabling independent system development
- **Plugin-like enhancement** capabilities for future features
- **Backward compatibility** maintenance across system updates

#### Type Safety & Development
- **TypeScript interfaces** for strong typing across all systems
- **Consistent API patterns** for store and component interactions
- **Comprehensive error handling** with graceful degradation
- **Development tool integration** for efficient debugging and testing

#### State Management Strategy
- **Session-based persistence model**:
  - **Session State**: Guinea pig needs, habitat conditions, activity feed (clears on game end)
  - **Persistent State**: Player currency, owned items, achievements, statistics (survives sessions)
  - **Pet Store State**: 10 guinea pig pool with swap cooldown management
  - **End Game Penalty**: Currency deduction when returning guinea pigs to store
- **Performance optimization for frequent updates** - The game's continuous loop creates multiple performance challenges:
  - **Wellness recalculation** happens every game tick (1-5 seconds) to check friendship penalties
  - **Habitat condition monitoring** tracks cleanliness decay, bedding freshness, and water consumption on different schedules
  - **Cross-system reactivity** where changes in one store trigger updates across multiple connected stores
  - **Mitigation strategies**: Batch calculations, throttle non-critical updates, cache frequently accessed values, optimize reactive subscriptions
- **Efficient reactivity** through targeted state observations
- **Memory management** for long-running game sessions

## Integration Testing Strategy

### Component Integration Testing
- **Store-component communication** validation
- **Event flow verification** across system boundaries
- **Performance testing** under various load conditions
- **Responsive behavior validation** across device constraints

### System Integration Testing
- **Cross-system data flow** verification
- **Error propagation** and recovery testing
- **Performance bottleneck** identification and resolution
- **Debug system validation** for all integration points

### User Experience Testing
- **Activity feed integration** with all systems
- **Responsive design** across all device types and orientations
- **Accessibility compliance** for screen readers and alternative interfaces
- **Performance validation** on lower-end devices

## Future Architecture Considerations

### Scalability Planning
- **Multi-guinea pig support** architecture preparation
- **Advanced AI systems** integration planning
- **Community features** architecture considerations
- **Performance scaling** for complex scenarios

### Enhancement Integration
- **Animation system** overlay architecture
- **Advanced physics** integration possibilities
- **AI/ML integration** for adaptive gameplay
- **External service integration** for community features

### Maintenance Strategy
- **Modular update** capabilities for individual systems
- **Backward compatibility** maintenance across updates
- **Data migration** strategies for save file evolution
- **Performance monitoring** and optimization over time