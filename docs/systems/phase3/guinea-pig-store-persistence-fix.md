# Guinea Pig Store Persistence Fix - System Documentation

**Phase:** Phase 3 (Immediate Priority - Phase 2 Continuation)
**Status:** ⚡ **Immediate Priority** - Blocks further Phase 2 development
**Created:** September 21, 2025 | Branch: GPS2-7

## Overview
Critical fix for guinea pig data persistence issues preventing data from saving on app refresh. The guinea pig store core implementation is complete, but data doesn't persist due to conflicting persistence systems and missing global store initialization.

## Problem Analysis

### Current Implementation Status
- ✅ **Guinea pig store core**: Complete with TypeScript interfaces, CRUD operations
- ✅ **Debug panel integration**: Full debug interface with placeholder states
- ✅ **GameController integration**: Store coordination and creation workflow
- ⚠️ **Data persistence**: Not working - data lost on page refresh

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
- **Guinea Pig Store**: Use Pinia persist plugin for automatic persistence
- **GameController**: Manual save/load for coordinated state and settings only
- **Coordination**: Sync `hasGuineaPig` flag with actual guinea pig count

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

### Phase 1: Global Store Initialization
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

### Phase 4: Testing & Validation
1. **Persistence testing**
   - Create guinea pig → refresh page → verify data persists
   - Test navigation between pages → data preserved
   - Test browser close/reopen → data preserved

2. **Edge case testing**
   - Clear all guinea pigs → refresh → verify empty state
   - Multiple guinea pigs → refresh → verify all data
   - Mix of guinea pig operations → verify consistency

## Expected Outcomes

### Before Fix
- ❌ Guinea pig data lost on page refresh
- ❌ Stores only initialize in debug panel
- ❌ Conflicting persistence systems
- ❌ State coordination issues

### After Fix
- ✅ Guinea pig data persists automatically
- ✅ Stores initialize on app startup
- ✅ Clean persistence architecture
- ✅ Consistent state coordination

## Testing Strategy

### Manual Testing
1. **Basic Persistence**
   - Create guinea pig → refresh page → verify data preserved
   - Delete guinea pig → refresh page → verify deletion preserved
   - Switch active guinea pig → refresh page → verify active selection preserved

2. **Navigation Testing**
   - Create guinea pig → navigate between pages → data preserved
   - Works from any page, not just debug panel
   - State consistent across all components

3. **Edge Cases**
   - Empty state → refresh → verify placeholder state
   - Full guinea pig collection → refresh → verify all data
   - Browser storage cleared → verify graceful empty state

### Debug Verification
- Debug panel shows correct data immediately on load
- No delay or initialization issues
- Placeholder state works when no guinea pigs exist
- All 7 needs categories display correctly

## Integration Notes

### Dependencies
- **Requires**: Pinia persist plugin (already installed)
- **Blocks**: All Phase 2 systems that depend on guinea pig data
- **Enables**: Reliable foundation for needs system, timing, habitat conditions

### Future Considerations
- This fix enables Phase 2 continuation with confidence in data persistence
- Needs system can build on reliable guinea pig data
- Habitat conditions can reference persistent guinea pig state
- Debug panels for other systems can assume guinea pig data exists

## Technical Notes

### Pinia Persist Plugin
```typescript
// Already configured in main.ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

### Store Persist Configuration
```typescript
// Guinea pig store persist config
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
  }
})
```

### GameController Save Integration
```typescript
// Updated save data structure
interface SaveData {
  gameState: GameState
  settings: GameSettings
  loggingState?: any
  // NOTE: guineaPigState handled by persist plugin
  version: string
}
```

## Success Criteria
- [ ] Guinea pig data persists across page refreshes
- [ ] Stores initialize on app startup without debug panel
- [ ] No conflicts between persistence systems
- [ ] State remains consistent across all operations
- [ ] Debug panel works immediately on page load
- [ ] Empty state handling works correctly