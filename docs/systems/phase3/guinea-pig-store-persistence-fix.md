# Guinea Pig Store Persistence Fix + Save Game System - System Documentation

**Phase:** Phase 3 (Immediate Priority - Phase 2 Continuation)
**Status:** ⚡ **Immediate Priority** - Blocks further Phase 2 development
**Created:** September 21, 2025 | Branch: GPS2-7

## Overview
Critical fix for guinea pig data persistence issues preventing data from saving on app refresh, plus implementation of a save game slot system (up to 3 saved games) with support for multiple guinea pigs per game (max 2 per cage). The guinea pig store core implementation is complete, but needs enhanced persistence architecture and save game management.

### Save Game Architecture
- **Multiple Save Slots**: Players can maintain up to 3 separate saved games
- **Multiple Guinea Pigs Per Game**: Each saved game supports up to 2 guinea pigs in the same cage
- **Independent Game States**: Each save slot maintains separate guinea pig collections, game progress, and settings
- **Save/Load UI**: New components for game slot management and switching between saved games

## Problem Analysis

### Current Implementation Status
- ✅ **Guinea pig store core**: Complete with TypeScript interfaces, CRUD operations
- ✅ **Debug panel integration**: Full debug interface with placeholder states
- ✅ **GameController integration**: Store coordination and creation workflow
- ⚠️ **Data persistence**: Not working - data lost on page refresh
- ❌ **Save game slot system**: Not implemented - need multiple save slots
- ❌ **Save/Load UI components**: Not implemented - need game management interface
- ⚠️ **Guinea pig limit**: Currently allows 6 guinea pigs - need to limit to 2 per cage

### Root Causes Identified

#### 1. Missing Global Store Initialization
```typescript
// PROBLEM: Store only initializes in debug panel component
// File: src/components/debug/GameController.vue
onMounted(() => {
  gameController.initializeStore() // Only called in debug panel!
})
```
**Impact**: Stores don't initialize on app startup, only when visiting debug panel

#### 2. Conflicting Persistence Systems
```typescript
// CONFLICT: Two different persistence approaches
// Guinea Pig Store (automatic)
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
  }
})

// GameController (manual save/load)
const loadGame = (): boolean => {
  // Manual localStorage management
  const saveData = createSaveData() // Includes guinea pig state
}
```
**Impact**: Pinia persist plugin vs manual save/load can override each other

#### 3. State Coordination Issues
```typescript
// PROBLEM: GameController clears guinea pig data on newGame()
const newGame = () => {
  // Clears guinea pig store data unnecessarily
  guineaPigStore.collection.guineaPigs = {}
  guineaPigStore.collection.activeGuineaPigId = null
}
```
**Impact**: Game state resets can wipe persisted guinea pig data

#### 4. Initialization Order Problems
```typescript
// PROBLEM: GameController initializes before checking guinea pig store
const initializeStore = () => {
  guineaPigStore.initializeStore()
  const loaded = loadGame()
  if (!loaded) {
    newGame() // May clear guinea pig data that was already persisted!
  }
}
```
**Impact**: Initialization can override existing persisted data

## Solution Architecture

### Persistence Strategy
- **Save Game Slots**: Each slot persists independently with separate localStorage keys
- **Guinea Pig Store**: Use Pinia persist plugin with slot-specific keys
- **GameController**: Enhanced save/load system for slot management and coordination
- **UI Integration**: Save/Load components for game slot selection and management
- **Guinea Pig Limits**: Enforce max 2 guinea pigs per cage/save slot

### Global Initialization
```typescript
// NEW: App.vue will initialize stores on startup
// File: src/App.vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameController } from './stores/gameController'
import { useGuineaPigStore } from './stores/guineaPigStore'

onMounted(() => {
  // Initialize stores in correct order
  const guineaPigStore = useGuineaPigStore()
  const gameController = useGameController()

  guineaPigStore.initializeStore()
  gameController.initializeStore()
})
</script>
```

### State Synchronization
```typescript
// NEW: Sync helper functions
const syncGameStateWithGuineaPigs = () => {
  const guineaPigStore = getGuineaPigStore()
  gameState.value.hasGuineaPig = guineaPigStore.hasGuineaPigs
}

const initializeStore = () => {
  // Check guinea pig store state first
  const guineaPigStore = getGuineaPigStore()
  syncGameStateWithGuineaPigs()

  // Only call newGame() if truly starting fresh
  const loaded = loadGame()
  if (!loaded && !guineaPigStore.hasGuineaPigs) {
    newGame() // Safe to reset when no guinea pigs exist
  }
}
```

## Implementation Steps

### Phase 1: Enhanced Architecture Planning
1. **Update guinea pig store limits**
   - Change maxGuineaPigs from 6 to 2 per save slot
   - Add validation for guinea pig creation limits
   - Update debug panel to reflect 2-guinea pig limit

2. **Design save game slot system**
   - Define SaveGameSlot interface with metadata
   - Plan slot-specific localStorage key strategy
   - Design save/load UI component architecture

### Phase 2: Global Store Initialization
1. **Add App.vue store initialization**
   - Import both stores in App.vue
   - Initialize on app mount in correct order
   - Remove initialization from debug panel component

2. **Test global initialization**
   - Verify stores initialize on app startup
   - Confirm debug panel no longer needed for initialization
   - Check persistence works across navigation

### Phase 2: Fix Persistence Coordination
1. **Update GameController initialization**
   - Add state synchronization helper
   - Check guinea pig store before calling newGame()
   - Respect existing guinea pig data from persist plugin

2. **Fix newGame() behavior**
   - Only clear guinea pig data when explicitly starting new game
   - Add parameter to control guinea pig clearing
   - Preserve guinea pig data during normal initialization

### Phase 3: State Synchronization
1. **Add sync helper functions**
   - `syncGameStateWithGuineaPigs()` - sync hasGuineaPig flag
   - `validateStateConsistency()` - check for data mismatches
   - Call sync functions after guinea pig CRUD operations

2. **Update guinea pig operations**
   - Call sync after creation, deletion, activation
   - Ensure GameController state stays consistent
   - Test state persistence across operations

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

### Before Fix
- ❌ Guinea pig data lost on page refresh
- ❌ Stores only initialize in debug panel
- ❌ Conflicting persistence systems
- ❌ State coordination issues

### After Fix
- ✅ Guinea pig data persists automatically per save slot
- ✅ Stores initialize on app startup
- ✅ Clean persistence architecture with slot management
- ✅ Consistent state coordination across save slots
- ✅ Up to 3 independent saved games
- ✅ Max 2 guinea pigs per cage/save slot
- ✅ Save/Load UI for game management
- ✅ Automatic game pause on page navigation
- ✅ User-controlled game resume requirement
- ✅ Consistent pause behavior across game pages

## Testing Strategy

### Manual Testing
1. **Basic Persistence per Save Slot**
   - Create guinea pig in slot 1 → refresh page → verify data preserved
   - Create guinea pig in slot 2 → refresh page → verify slot independence
   - Delete guinea pig from slot 1 → verify slot 2 unaffected
   - Switch active guinea pig within slot → refresh page → verify active selection preserved

2. **Save Slot Management**
   - Create 3 save slots → verify all persist independently
   - Switch between save slots → verify correct data loads
   - Save over existing slot → verify data overwrites correctly
   - Load empty slot → verify clean initialization

2. **Navigation Testing**
   - Create guinea pig → navigate between pages → data preserved
   - Works from any page, not just debug panel
   - State consistent across all components

3. **Edge Cases**
   - Empty state → refresh → verify placeholder state
   - Full guinea pig collection → refresh → verify all data
   - Browser storage cleared → verify graceful empty state

4. **Navigation Flow Testing**
   - Enter debug panel → verify game starts paused
   - Enter main game view → verify game starts paused
   - Leave game page while playing → verify auto-pause
   - Return to game page → verify paused state preserved
   - Manual resume after navigation pause → verify user control

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

## Success Criteria
- [ ] Guinea pig data persists across page refreshes per save slot
- [ ] Stores initialize on app startup without debug panel
- [ ] No conflicts between persistence systems
- [ ] State remains consistent across all operations
- [ ] Debug panel works immediately on page load
- [ ] Empty state handling works correctly
- [ ] Save game slots work independently (up to 3 slots)
- [ ] Guinea pig limit enforced (max 2 per cage/slot)
- [ ] Save/Load UI provides clear game management
- [ ] Slot switching preserves all game state correctly
- [ ] Game auto-pauses when entering game pages (debug panel, main game)
- [ ] User must manually resume game after navigation pause
- [ ] Game auto-pauses when leaving game pages
- [ ] Navigation pause can be manually overridden by user
- [ ] Activity feed shows navigation pause events clearly