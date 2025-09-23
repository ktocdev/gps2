# Save Game Manager Implementation Plan

**Phase:** Phase 2 (Save Game System)
**Status:** 📋 **Planning** - Ready for Implementation
**Created:** September 22, 2025 | Branch: GPS2-7

## Overview

Implementation of a save game slot system for the GameController panel that allows users to create up to 3 independent saved games, each with 1-2 selected guinea pigs. The system provides clear guinea pig availability management and permanent deletion when save games are removed.

## User Requirements

- **New Save Game Slot**: Shows available guinea pigs as selectable cards, "Create Game" button enabled when 1-2 guinea pigs selected
- **Guinea Pig Selection**: Multi-select interface with max 2 guinea pigs per slot
- **Save Game Management**: Load existing games, delete games (permanently removes guinea pigs)
- **Availability Logic**: Guinea pigs assigned to slots are unavailable for other slots
- **Slot Limits**: Maximum 3 save slots, new slots appear until limit reached
- **Empty State**: "No available guinea pigs, create one" when no guinea pigs available

## Architecture Overview

**Current State Analysis:**
- Guinea pig store: Manages collection of guinea pigs with `activeGuineaPigIds` array (supports up to 2 active)
- Game Controller: Manages game state transitions and settings
- Max guinea pigs: Currently 10 in collection, up to 2 can be active
- Persistence: Both stores use Pinia persist plugin with localStorage

## Implementation Strategy

### 1. SaveGameManager Store (`src/stores/saveGameManager.ts`)
**New Pinia store to coordinate between guinea pig and game controller stores:**

```typescript
interface SaveGameSlot {
  id: string
  name: string
  createdAt: number
  lastPlayed: number
  guineaPigIds: string[] // Max 2 guinea pig IDs assigned to this slot
  gameState: GameState // Copy of game controller state
  settings: GameSettings // Copy of game controller settings
}

interface SaveGameManager {
  slots: Record<string, SaveGameSlot>
  activeSlotId: string | null
  maxSlots: 3
}
```

### 2. Guinea Pig Availability System
**Add computed properties to track which guinea pigs are available:**
- `availableGuineaPigs`: Guinea pigs not assigned to any save slot
- `usedGuineaPigIds`: Array of guinea pig IDs currently in save slots
- Filter logic: Exclude guinea pigs that are already assigned to existing save slots

### 3. SaveGameSlot Component (`src/components/debug/SaveGameSlot.vue`)
**Two states: New Slot and Saved Slot**

**New Slot State:**
- Shows available guinea pigs as selectable cards
- Multi-select (max 2) with checkboxes
- "Create Game" button (enabled when 1-2 guinea pigs selected)
- "No available guinea pigs, create one" message when none available

**Saved Slot State:**
- Shows slot metadata (name, created date, last played)
- Shows assigned guinea pig cards (read-only)
- "Load Game" button
- "Delete Game" button (with confirmation)

### 4. Integration Points

**GameController Component Updates:**
- Add Save Game Manager section above or below current Game Controls
- Replace current game controls logic to work with active save slot
- Start Game button: Only enabled when a save slot is loaded
- New validation: `canStartGame = hasActiveSaveSlot && activeSaveSlotHasGuineaPigs`

**Guinea Pig Store Integration:**
- Add methods: `assignToSaveSlot(guineaPigIds, slotId)`, `removeFromSaveSlot(slotId)`
- Update guinea pig deletion: Prevent deletion if guinea pig is assigned to save slot
- Add `isAssignedToSlot(guineaPigId)` computed property

**Game Controller Store Integration:**
- Add methods: `loadSaveSlot(slotId)`, `createSaveSlot(guineaPigIds, name)`
- Update game state synchronization with active save slot
- Save slot state should override game controller state when loading

### 5. User Flow

**Creating New Save Game:**
1. User sees "New Game Slot" component
2. Available guinea pigs displayed as selectable cards
3. User selects 1-2 guinea pigs
4. "Create Game" button becomes enabled
5. User clicks Create Game → slot becomes saved game
6. New empty slot appears (up to max 3)

**Loading Save Game:**
1. User clicks "Load Game" on saved slot
2. Game controller loads slot's game state and settings
3. Guinea pig store activates slot's guinea pigs
4. Start Game button becomes available
5. Game can begin with loaded state

**Deleting Save Game:**
1. User clicks "Delete Game" button
2. Confirmation dialog appears
3. Upon confirmation: slot deleted, guinea pigs permanently removed
4. New empty slot appears if under max limit

### 6. Visual Design

**New Slot Layout:**
```
┌─────────────────────────────────┐
│ 🆕 New Game Slot               │
├─────────────────────────────────┤
│ Select Guinea Pigs (1-2):       │
│ ┌───┐ ┌───┐ ┌───┐              │
│ │☐GP│ │☑GP│ │☐GP│              │
│ └───┘ └───┘ └───┘              │
│                                 │
│ [Create Game] ←enabled when 1-2 │
└─────────────────────────────────┘
```

**Saved Slot Layout:**
```
┌─────────────────────────────────┐
│ 💾 Game Slot #1                │
│ Created: Jan 15, 2025           │
│ Last Played: 2 hours ago        │
├─────────────────────────────────┤
│ Guinea Pigs:                    │
│ ┌───┐ ┌───┐                    │
│ │GP1│ │GP2│                    │
│ └───┘ └───┘                    │
│                                 │
│ [Load Game] [Delete Game]       │
└─────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Core Store Implementation
1. **Create SaveGameManager store**
   - Define SaveGameSlot and SaveGameManager interfaces
   - Implement slot creation, deletion, and loading methods
   - Add Pinia persistence configuration
   - Add computed properties for available slots and validation

2. **Extend Guinea Pig Store**
   - Add `availableGuineaPigs` computed (filters out assigned guinea pigs)
   - Add `usedGuineaPigIds` computed (from SaveGameManager)
   - Add `isAssignedToSlot(guineaPigId)` method
   - Prevent deletion of assigned guinea pigs

### Phase 2: Component Development
1. **Create SaveGameSlot component**
   - Two-state component (new vs saved)
   - Guinea pig selection interface with checkboxes
   - Create Game button with proper enabling logic
   - Load Game and Delete Game buttons for saved slots

2. **Update GameController component**
   - Add Save Game Manager section to UI
   - Update canStartGame logic to require active save slot
   - Integrate save slot management into existing controls

### Phase 3: Integration & Coordination
1. **Game Controller Store Integration**
   - Add loadSaveSlot and createSaveSlot methods
   - Sync game state with active save slot
   - Update Start Game validation logic

2. **State Synchronization**
   - Ensure guinea pig activation matches save slot selection
   - Update game state when switching between save slots
   - Maintain consistency between stores

### Phase 4: Testing & Validation
1. **Save Game Functionality**
   - Create save slot with 1-2 guinea pigs
   - Load save slot and verify game state
   - Delete save slot and confirm guinea pig removal

2. **Availability Logic**
   - Verify guinea pigs disappear from available list when assigned
   - Test maximum slot limits (3 slots)
   - Validate "no available guinea pigs" message

## Technical Implementation Details

### Data Flow:
1. SaveGameManager store tracks slot assignments
2. Guinea pig store filters available guinea pigs based on assignments
3. Game controller coordinates state with active slot
4. UI components reactively update based on store state changes

### Persistence Strategy:
- SaveGameManager uses separate localStorage key: `gps2-save-game-manager`
- Guinea pig assignments stored in SaveGameManager slots
- Game state snapshots stored per slot for restoration
- Guinea pig deletion protection via slot assignment validation

### Component Architecture:
- **SaveGameSlot.vue**: Self-contained slot component (new/saved states)
- **SaveGameManager section**: Integration into GameController.vue
- **Reactive UI**: Components update automatically based on store changes
- **Validation**: Real-time enabling/disabling of action buttons

## Expected Outcomes

### Before Implementation:
- ❌ No save game system
- ❌ All guinea pigs available globally
- ❌ Game state not persistent per scenario
- ❌ No multi-game management

### After Implementation:
- ✅ Up to 3 independent save game slots
- ✅ Guinea pig assignment and availability management
- ✅ Persistent game state per save slot
- ✅ Clear user interface for save game management
- ✅ Permanent deletion with confirmation
- ✅ Start Game only enabled with loaded save slot

## Future Considerations

- **Save Slot Naming**: Allow users to name their save slots
- **Save Slot Thumbnails**: Visual previews of guinea pigs in slots
- **Export/Import**: Save slot backup and sharing functionality
- **Progress Tracking**: Per-slot achievement and progress tracking
- **Slot Metadata**: Additional information like play time, achievements

This plan provides a complete save game system that integrates cleanly with existing architecture while maintaining data consistency and providing clear user experience.