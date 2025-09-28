# Pet Store & Game Session Manager - System Documentation

**Phase:** Phase 2 (Game Session System)
**Status:** ✅ **Completed**
**Created:** September 27, 2025 | Branch: GPS2-9
**Completed:** September 27, 2025 | Branch: GPS2-11
**Replaces:** Previous save game slot architecture

## Overview

A streamlined single-game session system where guinea pigs are selected from a randomized pet store of 10 guinea pigs. Players can start/end game sessions freely, with guinea pigs returning to the store with reset needs. This approach eliminates permanent deletion concerns and encourages experimentation with different guinea pig combinations.

## Core Concepts

**Pet Store Model:**
- 10 randomly generated guinea pigs available in the "pet store"
- Players select 1-2 guinea pigs to start a game session
- Only one active game session at a time
- Ending a game returns guinea pigs to store with needs reset

**Progression Persistence:**
- Currency persists across game sessions
- Non-consumable items persist (habitat furniture, toys, etc.)
- Unused consumables persist (bedding not placed, hay not added, etc.)
- End game penalty: Small currency fine for returning guinea pigs

**Guinea Pig Refresh System:**
- "Swap Guinea Pigs" button replaces entire pet store pool
- 1-hour cooldown between swaps
- Debug mode allows unlimited swaps for testing

## Architecture Overview

### 1. PetStoreManager Store (`src/stores/petStoreManager.ts`)

**Manages pet store inventory and game session:**

```typescript
interface PetStoreState {
  // Pet store inventory
  availableGuineaPigs: GuineaPig[] // Always 10 guinea pigs
  lastRefreshTimestamp: number
  refreshCooldownMs: number // Default: 3600000 (1 hour)

  // Active game session
  activeGameSession: GameSession | null

  // Settings
  endGamePenalty: number // Currency fine for ending game
  allowUnlimitedRefresh: boolean // Debug mode flag
}

interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[] // 1-2 guinea pig IDs
  sessionDuration: number // Tracked play time
}
```

### 2. Persistent Progression Store (`src/stores/playerProgression.ts`)

**Persists across all game sessions:**

```typescript
interface PlayerProgression {
  // Currency (persists across sessions)
  currency: number
  totalCurrencyEarned: number

  // Non-consumable inventory (persists)
  ownedItems: Record<string, OwnedItem>

  // Consumable inventory (persists unused quantities)
  consumables: Record<string, number> // bedding, hay, treats

  // Statistics
  totalGameSessions: number
  totalPlayTime: number
  guineaPigsAdopted: number

  // Achievements (persist)
  unlockedAchievements: string[]
}

interface OwnedItem {
  itemId: string
  purchasedAt: number
  timesUsed: number
}
```

### 3. Game Session State (Resets Each Game)

**State that resets when ending game:**
- Guinea pig needs (all reset to default)
- Guinea pig wellness and friendship
- Habitat conditions (cleanliness, bedding freshness, water level)
- Placed habitat items (consumables removed, non-consumables return to inventory)
- Activity feed history

**State that persists:**
- Player currency (minus end game penalty)
- Owned non-consumable items
- Unused consumable quantities
- Player progression statistics
- Achievements

## User Flows

### Initial App Launch (Empty localStorage)

1. App detects no existing pet store data
2. Generate 10 random guinea pigs with random preferences
3. Display pet store selection interface
4. User selects 1-2 guinea pigs
5. User clicks "Start Game" → Game session begins

### Starting a Game Session

1. Pet store shows 10 available guinea pigs
2. User selects 1-2 guinea pigs (checkboxes)
3. "Start Game" button enabled when 1-2 selected
4. Click Start Game:
   - Create GameSession with selected guinea pig IDs
   - Initialize guinea pig needs to default values
   - Initialize habitat conditions
   - Load game interface

### Ending a Game Session

1. User clicks "End Game & Return Guinea Pigs" button
2. Confirmation dialog shows:
   - Guinea pigs will return to pet store
   - Needs will be reset
   - Currency penalty: `-$X`
   - Items will return to inventory
3. Upon confirmation:
   - Deduct end game penalty from currency
   - Return guinea pigs to pet store
   - Reset guinea pig needs to default
   - Clear habitat conditions
   - Return non-consumables to inventory
   - Persist consumables (unused quantities)
   - Update player statistics
   - Show pet store selection interface

### Refreshing Pet Store (Guinea Pig Swap)

1. User clicks "Swap Guinea Pigs" button
2. Check cooldown:
   - If on cooldown: Show remaining time
   - If debug mode enabled: Allow swap
   - If cooldown expired: Proceed
3. Confirmation dialog:
   - "This will replace all 10 guinea pigs with new ones"
   - "Current guinea pigs will be permanently lost"
4. Upon confirmation:
   - Generate 10 new random guinea pigs
   - Replace entire availableGuineaPigs array
   - Set lastRefreshTimestamp to now
   - Show updated pet store

## Implementation Steps

### Phase 1: Core Store Implementation

1. **Create PetStoreManager store**
   - Define PetStoreState interface
   - Implement generateRandomGuineaPigs(count: 10)
   - Implement startGameSession(guineaPigIds)
   - Implement endGameSession() with penalty
   - Implement refreshPetStore() with cooldown check
   - Add Pinia persistence configuration
   - Add computed properties for cooldown status

2. **Create PlayerProgression store**
   - Define PlayerProgression interface
   - Implement currency management methods
   - Implement item ownership tracking
   - Implement consumable inventory
   - Implement statistics tracking
   - Add Pinia persistence (separate from game session)

### Phase 2: Guinea Pig Store Integration

1. **Refactor Guinea Pig Store**
   - Remove guinea pig creation methods (no longer needed)
   - Update to work with PetStoreManager
   - Active guinea pigs pulled from game session
   - Needs reset method for returning to store
   - Remove max guinea pig limits (pet store has fixed 10)

2. **Session State Management**
   - Clear method for resetting game session state
   - Initialize method for new game session
   - State coordination with PetStoreManager

### Phase 3: Component Development

1. **Create PetStoreSelection component**
   - Grid display of 10 guinea pigs
   - Show basic info (name, breed, colors, emoji)
   - Multi-select with checkboxes (max 2)
   - "Start Game" button (enabled when 1-2 selected)
   - "Swap Guinea Pigs" button with cooldown display

2. **Create EndGameDialog component**
   - Confirmation dialog for ending game
   - Show currency penalty
   - Explain what resets vs persists
   - Confirm/Cancel buttons

3. **Update GameController component**
   - Add "End Game & Return Guinea Pigs" button
   - Integrate with PetStoreManager
   - Remove guinea pig creation UI (no longer needed)

### Phase 4: Debug Panel Integration

1. **Pet Store Debug Panel**
   - Toggle unlimited refresh mode
   - Force refresh pet store (bypass cooldown)
   - Adjust end game penalty
   - View pet store state
   - Generate specific guinea pig configurations

2. **Player Progression Debug Panel**
   - View/edit currency
   - View owned items
   - View consumable inventory
   - View statistics
   - Reset progression

### Phase 5: Testing & Validation

1. **Game Session Flow**
   - Start game with 1 guinea pig
   - Start game with 2 guinea pigs
   - End game and verify penalty applied
   - Verify guinea pigs returned to store with reset needs
   - Start new game with different guinea pigs

2. **Persistence Testing**
   - Earn currency → end game → verify currency persisted (minus penalty)
   - Purchase items → end game → verify items persisted
   - Use consumables → end game → verify unused quantities persisted
   - Page refresh → verify pet store and progression intact

3. **Guinea Pig Swap Testing**
   - Swap guinea pigs → verify cooldown starts
   - Try swap during cooldown → verify blocked
   - Enable debug mode → verify unlimited swaps
   - Verify pet store completely replaced

## Technical Implementation Details

### Pet Store Generation

```typescript
function generateRandomGuineaPigs(count: 10): GuineaPig[] {
  const guineaPigs: GuineaPig[] = []

  for (let i = 0; i < count; i++) {
    guineaPigs.push({
      id: generateId(),
      name: generateRandomName(),
      breed: randomBreed(),
      colors: randomColors(),
      emoji: randomEmoji(),
      birthDate: Date.now(),

      // Hidden preferences (to be discovered)
      preferences: generateRandomPreferences(),

      // Default needs (will be initialized on game start)
      needs: getDefaultNeeds(),

      // Store metadata
      inStore: true,
      adoptionCount: 0
    })
  }

  return guineaPigs
}
```

### End Game Logic

```typescript
function endGameSession() {
  if (!activeGameSession.value) return

  const penalty = settings.endGamePenalty
  const progression = usePlayerProgression()

  // Apply currency penalty
  progression.deductCurrency(penalty, 'end_game_penalty')

  // Return guinea pigs to store with reset needs
  const guineaPigStore = useGuineaPigStore()
  activeGameSession.value.guineaPigIds.forEach(id => {
    guineaPigStore.resetGuineaPigNeeds(id)
    guineaPigStore.returnToStore(id)
  })

  // Clear habitat (return non-consumables to inventory)
  const habitatStore = useHabitatStore()
  habitatStore.endGameCleanup()

  // Update statistics
  progression.incrementGameSessions()
  progression.addPlayTime(activeGameSession.value.sessionDuration)

  // Clear active session
  activeGameSession.value = null

  // Activity feed
  logActivity('game_session_ended', { penalty })
}
```

### Cooldown Management

```typescript
const canRefreshPetStore = computed(() => {
  if (settings.allowUnlimitedRefresh) return true

  const elapsed = Date.now() - lastRefreshTimestamp.value
  return elapsed >= refreshCooldownMs.value
})

const remainingCooldownMs = computed(() => {
  if (settings.allowUnlimitedRefresh) return 0

  const elapsed = Date.now() - lastRefreshTimestamp.value
  const remaining = refreshCooldownMs.value - elapsed
  return Math.max(0, remaining)
})

function refreshPetStore() {
  if (!canRefreshPetStore.value) {
    throw new Error('Pet store refresh on cooldown')
  }

  // Generate new guinea pigs
  availableGuineaPigs.value = generateRandomGuineaPigs(10)
  lastRefreshTimestamp.value = Date.now()

  logActivity('pet_store_refreshed')
}
```

## Visual Design

### Pet Store Selection Interface

```
┌─────────────────────────────────────────┐
│ 🏪 Guinea Pig Pet Store                │
│ Select 1-2 guinea pigs to adopt        │
├─────────────────────────────────────────┤
│                                         │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│ │☐GP│ │☑GP│ │☐GP│ │☑GP│ │☐GP│        │
│ └───┘ └───┘ └───┘ └───┘ └───┘        │
│ Name  Name  Name  Name  Name          │
│ Breed Breed Breed Breed Breed         │
│                                         │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│ │☐GP│ │☐GP│ │☐GP│ │☐GP│ │☐GP│        │
│ └───┘ └───┘ └───┘ └───┘ └───┘        │
│ Name  Name  Name  Name  Name          │
│ Breed Breed Breed Breed Breed         │
│                                         │
├─────────────────────────────────────────┤
│ [Start Game] (2 selected)               │
│ [Swap Guinea Pigs] (58m cooldown)      │
└─────────────────────────────────────────┘
```

### End Game Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ ⚠️  End Game & Return Guinea Pigs?    │
├─────────────────────────────────────────┤
│                                         │
│ This will:                              │
│ • Return guinea pigs to pet store      │
│ • Reset their needs                    │
│ • Clear habitat conditions             │
│ • Return items to inventory            │
│                                         │
│ Return Fee: -$50                        │
│                                         │
│ You will keep:                          │
│ ✓ Currency (minus fee)                 │
│ ✓ Purchased items                      │
│ ✓ Unused consumables                   │
│ ✓ Achievements                         │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel] [Confirm & End Game]          │
└─────────────────────────────────────────┘
```

## Expected Outcomes

### Before Implementation:
- ❌ No streamlined game session system
- ❌ Complex multi-slot save game architecture
- ❌ Permanent guinea pig deletion concerns
- ❌ Manual guinea pig creation flow

### After Implementation:
- ✅ Simple single-session game model
- ✅ 10 random guinea pigs always available
- ✅ No guilt about ending games
- ✅ Persistent player progression
- ✅ Encourages experimentation
- ✅ Pet store refresh for variety
- ✅ Clean start/end game flow

## Integration with Existing Systems

### Guinea Pig Store
- Remove creation UI from debug panel
- Add methods for resetting needs
- Add methods for store status (inStore flag)
- Coordinate active guinea pigs with PetStoreManager

### Game Controller
- Add end game button to main controls
- Integrate session state with PetStoreManager
- Update start game logic to check for active session
- Add session duration tracking

### Inventory System (Phase 3)
- Separate consumables from non-consumables
- Track placed vs inventory items
- Return items to inventory on end game
- Persist unused consumables

### Player Progression (New)
- Track currency across sessions
- Track owned items
- Track statistics
- Track achievements

## Settings & Configuration

### PetStoreManager Settings
- `refreshCooldownMs`: 3600000 (1 hour default)
- `endGamePenalty`: 50 (currency fine)
- `allowUnlimitedRefresh`: false (debug mode)
- `guineaPigsInStore`: 10 (fixed)
- `maxGuineaPigsPerGame`: 2

### Debug Mode Overrides
- Unlimited pet store refresh
- Adjustable end game penalty
- Force generate specific guinea pig traits
- Skip cooldowns

## Future Considerations

- **Guinea Pig History**: Track which guinea pigs were previously adopted
- **Favorites System**: Allow marking favorite guinea pigs to prevent swap
- **Store Expansion**: Increase store size as player progresses
- **Special Guinea Pigs**: Rare/special guinea pigs in store rotation
- **Adoption Events**: Temporary themed guinea pig pools
- **Return Bonuses**: Reward players for well-cared-for guinea pigs
- **Store Refresh Cost**: Optional paid refresh for instant swap

## Success Criteria

### Game Session Management
- [ ] Pet store generates 10 random guinea pigs on first launch
- [ ] User can select 1-2 guinea pigs to start game
- [ ] Start Game button enabled only when 1-2 selected
- [ ] End game returns guinea pigs to store with reset needs
- [ ] End game penalty applied to currency
- [ ] Only one active game session at a time

### Persistence
- [ ] Pet store persists across page refreshes
- [ ] Player currency persists (minus penalties)
- [ ] Owned items persist across sessions
- [ ] Unused consumables persist
- [ ] Active game session restores correctly

### Guinea Pig Swap
- [ ] Swap button replaces all 10 guinea pigs
- [ ] 1-hour cooldown enforced
- [ ] Cooldown timer displays remaining time
- [ ] Debug mode allows unlimited swaps
- [ ] Confirmation dialog prevents accidental swaps

## Migration Notes

### From Previous Architecture
This system **replaces** the previous multi-slot save game architecture with:
- Simpler single-session model
- No slot management complexity
- No guinea pig availability filtering
- Persistent progression separate from game state
- Encourages experimentation without consequences

### Data Migration
If implementing over existing guinea pig data:
1. Generate initial 10 random guinea pigs for pet store
2. Migrate currency to new PlayerProgression store
3. Clear any existing save game slot data
4. Initialize pet store manager state

This streamlined architecture provides better UX, simpler implementation, and encourages players to explore different guinea pig combinations without emotional attachment concerns.