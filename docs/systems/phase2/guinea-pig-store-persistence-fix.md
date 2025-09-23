# Guinea Pig Store Persistence Fix + Save Game System - System Documentation

**Phase:** Phase 2 (Save Game System Implementation)
**Status:** ✅ **Core Complete** - Ready for Save Game System Implementation
**Created:** September 22, 2025 | Branch: GPS2-7
**Updated:** September 22, 2025 | Save Game Planning Complete

## Overview
Guinea pig data persistence issues have been successfully resolved. Core guinea pig functionality is now stable and reliable. The next phase involves implementing a save game slot system (up to 3 saved games) with support for multiple guinea pigs per game (max 2 per slot). The foundation is solid and ready for save game management implementation.

**Related Documentation:** See `save-game-manager-plan.md` for detailed implementation plan.

### Save Game Architecture (Ready for Implementation)
- **SaveGameManager Store**: New Pinia store to coordinate slot management and guinea pig assignments
- **Multiple Save Slots**: Players can maintain up to 3 separate saved games
- **Guinea Pig Selection**: Each saved game supports 1-2 guinea pigs selected from available pool
- **Availability System**: Guinea pigs assigned to slots become unavailable for other slots
- **Save/Load UI**: SaveGameSlot components with two states (new slot creation vs saved slot management)
- **Permanent Deletion**: Deleting save slots permanently removes assigned guinea pigs

## Problem Analysis

### Current Implementation Status
- ✅ **Guinea pig store core**: Complete with TypeScript interfaces, CRUD operations
- ✅ **Debug panel integration**: Full debug interface with working functionality
- ✅ **GameController integration**: Store coordination and state management working
- ✅ **Data persistence**: Fixed - guinea pig data persists across page refreshes
- 📋 **Save game slot system**: Planned - SaveGameManager store and UI components designed
- 📋 **Save/Load UI components**: Planned - SaveGameSlot component with dual states designed
- 📋 **Guinea pig availability**: Planned - filtering system to prevent assignment conflicts

### Issues Resolved

#### 1. Global Store Initialization ✅ FIXED
```typescript
// SOLUTION: Stores now initialize properly on app startup
// Fixed through proper Pinia persistence configuration
```
**Result**: Stores initialize automatically, no longer dependent on debug panel

#### 2. Persistence Systems ✅ FIXED
```typescript
// SOLUTION: Clean Pinia persistence with explicit paths
persist: {
  key: 'gps2-guinea-pig-store',
  storage: localStorage,
  paths: ['collection', 'settings'] // Explicit paths prevent conflicts
}
```
**Result**: Reliable automatic persistence, no conflicts between systems

#### 3. State Coordination ✅ FIXED
```typescript
// SOLUTION: Simplified GameController, removed state clearing
// Guinea pig data managed independently by guinea pig store
// Game controller focuses on game state only, not guinea pig management
```
**Result**: Consistent state management, no data loss during game operations

#### 4. Initialization Order ✅ FIXED
```typescript
// SOLUTION: Pinia persistence handles initialization automatically
// Stores restore from localStorage on creation
// No manual initialization required, data preserved
```
**Result**: Automatic restoration of all persisted data on app startup

## Save Game System Architecture (Next Phase)

### Implementation Strategy
- **SaveGameManager Store**: New Pinia store to coordinate guinea pig assignments and slot management
- **Guinea Pig Availability**: Filter available guinea pigs (exclude those assigned to save slots)
- **GameController Integration**: Enhanced to work with save slots, Start Game requires loaded slot
- **SaveGameSlot Components**: UI for creating new games and managing existing saves
- **Permanent Deletion**: Deleting save slots removes assigned guinea pigs permanently

### Save Game Manager Integration
```typescript
// NEW: SaveGameManager store for slot coordination
// File: src/stores/saveGameManager.ts
interface SaveGameSlot {
  id: string
  name: string
  createdAt: number
  lastPlayed: number
  guineaPigIds: string[] // Max 2 guinea pig IDs
  gameState: GameState
  settings: GameSettings
}

interface SaveGameManager {
  slots: Record<string, SaveGameSlot>
  activeSlotId: string | null
  maxSlots: 3
}
```

### Guinea Pig Availability System
```typescript
// NEW: Availability filtering in guinea pig store
const availableGuineaPigs = computed(() => {
  const saveGameManager = useSaveGameManager()
  const usedGuineaPigIds = saveGameManager.usedGuineaPigIds

  return Object.values(collection.value.guineaPigs).filter(
    gp => !usedGuineaPigIds.includes(gp.id)
  )
})

const usedGuineaPigIds = computed(() => {
  return Object.values(slots.value)
    .flatMap(slot => slot.guineaPigIds)
})
```

## Implementation Steps (Next Phase)

### Phase 1: SaveGameManager Store Creation
1. **Create SaveGameManager store**
   - Define SaveGameSlot and SaveGameManager interfaces
   - Implement slot creation, loading, and deletion methods
   - Add Pinia persistence with separate localStorage key
   - Add computed properties for slot validation and availability

2. **Extend Guinea Pig Store with availability filtering**
   - Add `availableGuineaPigs` computed property
   - Add `usedGuineaPigIds` computed property
   - Implement guinea pig assignment prevention logic
   - Add protection against deleting assigned guinea pigs

### Phase 2: SaveGameSlot Component Development
1. **Create SaveGameSlot component**
   - Two-state component: new slot vs saved slot display
   - Guinea pig selection interface with checkboxes (max 2)
   - Create Game button with proper validation logic
   - Load Game and Delete Game buttons for saved slots

2. **Integrate into GameController panel**
   - Add Save Game Manager section to GameController.vue
   - Update Start Game button logic (requires loaded save slot)
   - Display available vs saved slots appropriately

### Phase 3: Game Controller Integration
1. **Update GameController store methods**
   - Add `loadSaveSlot(slotId)` method
   - Add `createSaveSlot(guineaPigIds, name)` method
   - Update game state synchronization with active save slot
   - Implement Start Game validation (requires loaded save slot)

2. **State coordination between stores**
   - Sync guinea pig activation with save slot selection
   - Update game state when switching save slots
   - Maintain consistency across save/load operations

### Phase 4: Testing & Validation
1. **Save game functionality testing**
   - Create save slot with 1-2 guinea pigs selected
   - Load save slot and verify correct game state restoration
   - Delete save slot and confirm guinea pig permanent removal
   - Test maximum slot limits (3 slots max)

2. **Guinea pig availability testing**
   - Verify guinea pigs disappear from available list when assigned
   - Test that assigned guinea pigs cannot be deleted
   - Validate "no available guinea pigs" message display
   - Test slot creation when no guinea pigs available

### Phase 4: Save Game Slot Implementation
1. **Save game slot management**
   - Create SaveGameManager store for slot coordination
   - Implement slot-specific persistence keys
   - Add save slot metadata (creation date, guinea pig names, progress)

2. **Save/Load UI components**
   - Create SaveGameSlot component for slot display
   - Create LoadGameModal for slot selection
   - Create SaveGameModal for saving to specific slots
   - Integrate with main navigation and GameController

3. **Guinea pig limit enforcement**
   - Update guinea pig store maxGuineaPigs to 2
   - Add validation in creation workflow
   - Update debug panel guinea pig creation controls

### Phase 5: Testing & Validation
1. **Persistence testing**
   - Create guinea pig → refresh page → verify data persists
   - Test navigation between pages → data preserved
   - Test browser close/reopen → data preserved

2. **Edge case testing**
   - Clear all guinea pigs → refresh → verify empty state
   - Multiple guinea pigs → refresh → verify all data
   - Mix of guinea pig operations → verify consistency

### Phase 6: Navigation-Based Game Control
1. **Add navigation pause reason**
   - Extend GameController pause reasons with `'navigation'`
   - Update pause priority logic: manual > navigation > orientation
   - Ensure navigation pause can be manually resumed

2. **Implement router navigation guards**
   - Add beforeEach guard to pause game when leaving game pages
   - Add afterEach guard to auto-pause when entering game pages
   - Identify game pages: `/` (debug panel) and `/home` (main game)

3. **Page lifecycle management**
   - Update DebugView with onMounted/onUnmounted pause logic
   - Update HomeView with automatic pause on entry/exit
   - Preserve game state between page navigations

4. **User experience enhancement**
   - Game starts paused when entering game pages
   - User must manually click play to resume
   - Clear visual indication of pause state
   - Activity feed shows navigation pause events

## Expected Outcomes

### Core Persistence (Completed) ✅
- ✅ Guinea pig data persists across page refreshes
- ✅ Stores initialize automatically on app startup
- ✅ No conflicts between persistence systems
- ✅ Consistent state management across all operations
- ✅ Debug panel works immediately on page load
- ✅ Guinea pig creation works reliably

### Save Game System (Next Phase) 📋
- 📋 Up to 3 independent save game slots
- 📋 Guinea pig assignment and availability management
- 📋 Start Game only enabled with loaded save slot
- 📋 Create Game button enabled when 1-2 guinea pigs selected
- 📋 Load existing save games with correct state restoration
- 📋 Delete save games with permanent guinea pig removal
- 📋 "No available guinea pigs" message when appropriate
- 📋 Clear visual distinction between new and saved slots

## Testing Strategy (Save Game System)

### Save Game Functionality Testing
1. **Save Slot Creation**
   - Create new save slot with 1 guinea pig → verify slot created
   - Create new save slot with 2 guinea pigs → verify slot created
   - Try to create slot with 0 guinea pigs → verify Create Game disabled
   - Try to create slot with 3+ guinea pigs → verify max 2 limit

2. **Save Slot Management**
   - Load existing save slot → verify game state restoration
   - Load save slot → verify correct guinea pigs activated
   - Delete save slot → verify permanent guinea pig removal
   - Test maximum 3 slots → verify no additional slots appear

3. **Guinea Pig Availability Testing**
   - Assign guinea pig to slot → verify it disappears from available list
   - Try to delete assigned guinea pig → verify deletion prevented
   - Create all save slots → verify "no available guinea pigs" message
   - Delete save slot → verify guinea pig removed from availability forever

4. **Game Controller Integration Testing**
   - Start Game button disabled with no loaded save slot
   - Load save slot → Start Game button becomes enabled
   - Switch between save slots → verify correct game state loaded
   - Delete active save slot → verify Start Game disabled again

### Debug Verification
- Debug panel shows correct data immediately on load
- No delay or initialization issues
- Placeholder state works when no guinea pigs exist
- All 7 needs categories display correctly

## Integration Notes

### Dependencies
- **Requires**: Pinia persist plugin (already installed)
- **New Components**: SaveGameSlot, LoadGameModal, SaveGameModal, SaveGameManager store
- **Blocks**: All Phase 2 systems that depend on guinea pig data
- **Enables**:
  - Reliable foundation for needs system, timing, habitat conditions
  - Multiple save game experimentation
  - Multi-guinea pig cage dynamics (up to 2 per cage)
  - Player progression tracking across save slots

### Future Considerations
- This fix enables Phase 2 continuation with confidence in data persistence
- Save game slots enable experimentation with different game scenarios
- Multi-guinea pig dynamics (2 per cage) create social interaction opportunities
- Needs system can build on reliable guinea pig data with slot independence
- Habitat conditions can reference persistent guinea pig state per save slot
- Debug panels for other systems can assume guinea pig data exists within active slot
- **Navigation pause system** provides foundation for proper game state management
- **User control requirement** ensures intentional game interaction on each page visit
- **Consistent behavior** across debug and main game interfaces improves user experience
- Future expansion: More guinea pigs per cage, additional save slots, save slot sharing
- Navigation pause integration with upcoming Phase 2 main game interface

## Technical Notes

### Save Game Slot Interfaces
```typescript
// New save game slot interfaces
interface SaveGameSlot {
  id: string
  name: string
  createdAt: number
  lastPlayed: number
  guineaPigCount: number
  guineaPigNames: string[]
  gameProgress: {
    totalPlayTime: number
    achievementsUnlocked: number
    daysPlayed: number
  }
}

interface SaveGameManager {
  currentSlotId: string | null
  slots: Record<string, SaveGameSlot>
  maxSlots: 3
}
```

### Slot-Specific Persistence
```typescript
// Guinea pig store with slot-specific persistence
export const useGuineaPigStore = defineStore('guineaPigStore', () => {
  // Store implementation
}, {
  persist: {
    key: () => {
      const saveGameManager = useSaveGameManager()
      return `gps2-guinea-pig-store-${saveGameManager.currentSlotId || 'default'}`
    },
    storage: localStorage
  }
})

// GameController with slot coordination
export const useGameController = defineStore('gameController', () => {
  // Store implementation
}, {
  persist: {
    key: () => {
      const saveGameManager = useSaveGameManager()
      return `gps2-game-controller-${saveGameManager.currentSlotId || 'default'}`
    },
    storage: localStorage
  }
})
```

### Save Game UI Components
```typescript
// SaveGameSlot.vue - Individual slot display
interface SaveGameSlotProps {
  slot: SaveGameSlot
  isActive: boolean
  isEmpty: boolean
}

// LoadGameModal.vue - Slot selection interface
interface LoadGameModalProps {
  isVisible: boolean
}

// SaveGameModal.vue - Save to slot interface
interface SaveGameModalProps {
  isVisible: boolean
  currentSlotId?: string
}
```

### Guinea Pig Limit Updates
```typescript
// Updated guinea pig store settings
const settings = ref<GuineaPigSettings>({
  autoNeedsDecay: true,
  needsDecayRate: 1.0,
  maxGuineaPigs: 2, // Changed from 6 to 2 per cage
  enableBreeding: false
})
```

### Navigation-Based Game Control
```typescript
// Enhanced pause reasons in GameController
type PauseReason = 'manual' | 'orientation' | 'navigation'

// Router navigation guards
router.beforeEach((to, from) => {
  const gameController = useGameController()

  // Auto-pause when leaving game pages
  if (isGamePage(from.path) && gameController.isGameActive) {
    gameController.pauseGame('navigation')
  }
})

router.afterEach((to) => {
  const gameController = useGameController()

  // Auto-pause when entering game pages
  if (isGamePage(to.path)) {
    gameController.pauseGame('navigation')
  }
})

// Page lifecycle management
// DebugView.vue and HomeView.vue
onMounted(() => {
  const gameController = useGameController()
  gameController.pauseGame('navigation')
})

onUnmounted(() => {
  const gameController = useGameController()
  if (gameController.isGameActive) {
    gameController.pauseGame('navigation')
  }
})
```

## Progress Update - December 2024

### ✅ Completed (Session Work)
- **Guinea pig data persistence**: Fixed localStorage persistence with explicit paths configuration
- **Store initialization**: Stores now initialize properly on app startup
- **Guinea pig creation**: Reliable guinea pig creation functionality restored
- **UI cleanup**: Removed complex save game management that was causing interference
- **Button spacing fix**: Restored proper button-wrap CSS for validation testing interface
- **Delete protection**: Implemented prevention of guinea pig deletion when used in save games
- **Import fixes**: Corrected store import paths for GameController component

### ⚠️ Partially Implemented
- **Save game slot system**: Started implementation but removed due to complexity and interference with core functionality
- **Guinea pig availability logic**: Basic filtering implemented but caused issues with button enabling
- **Add New Game functionality**: Implemented but caused availability calculation problems

### ❌ Save Game Architecture - Removed/Deferred
The complex save game slot system (up to 3 slots, slot-specific persistence, save/load UI) was **removed** during this session due to:
- Interference with basic guinea pig creation
- Complex computed property dependencies causing reactivity issues
- User feedback that reliable guinea pig creation was more important than save slots

**Current Status**: Back to clean, working state with reliable guinea pig persistence

## Success Criteria

### Core Persistence (Completed) ✅
- [x] Guinea pig data persists across page refreshes
- [x] Stores initialize on app startup without debug panel
- [x] No conflicts between persistence systems
- [x] State remains consistent across all operations
- [x] Debug panel works immediately on page load
- [x] Empty state handling works correctly
- [x] Guinea pig creation works reliably
- [x] Button layouts and spacing work properly
- [x] Delete protection prevents removing guinea pigs in use

### Save Game System (Ready for Implementation) 📋
- [ ] SaveGameManager store created with slot management
- [ ] Guinea pig availability filtering implemented
- [ ] SaveGameSlot component with dual states (new/saved)
- [ ] Create Game button enabled only with 1-2 guinea pigs selected
- [ ] Start Game button enabled only with loaded save slot
- [ ] Load Game functionality restores correct state
- [ ] Delete Game functionality permanently removes guinea pigs
- [ ] Maximum 3 save slots enforced
- [ ] "No available guinea pigs" message when appropriate

## Current State
- **Core guinea pig functionality**: ✅ Working reliably and stable
- **Data persistence**: ✅ Fixed and tested across page refreshes
- **Debug interface**: ✅ Clean, functional, and ready for save game integration
- **Save game system**: 📋 **Planned and designed** - Ready for implementation
- **Game controller**: ✅ Stable foundation ready for save slot integration

## Next Steps (Implementation Ready)
1. **SaveGameManager Store** - Create new store with slot management logic
2. **Guinea Pig Availability** - Add filtering system to guinea pig store
3. **SaveGameSlot Component** - Build UI component with dual states
4. **GameController Integration** - Update Start Game logic and add save game section
5. **Testing & Validation** - Comprehensive testing of save game functionality

**Reference:** See `save-game-manager-plan.md` for detailed implementation steps.