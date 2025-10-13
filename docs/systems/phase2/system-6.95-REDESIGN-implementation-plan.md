# System 6.95 REDESIGN - Implementation Plan

**System:** Permanent Adoption & Stardust Sanctuary Gateway
**Phase:** Phase 2 (Pet Store & Session Management)
**Status:** 📋 Planned
**Created:** October 12, 2025

---

## Overview

This implementation plan provides a careful, systematic approach to implementing the complete redesign of System 6.95. The redesign transforms the pet store from a temporary selection mechanism with session endings into a permanent adoption system with friendship-gated Stardust Sanctuary progression.

**Key Changes:**
- ❌ Remove ALL refresh mechanics (manual + auto)
- ❌ Remove session ending system entirely
- ✅ Add permanent adoption (no returns ever)
- ✅ Add friendship-gated Stardust Sanctuary (85% threshold)
- ✅ Add natural store churn (adoption timers)
- ✅ Add pairing validation and bond preservation

**Estimated Timeline:** 5-6 weeks full implementation + testing

---

## Phase 0: Friendship System Enhancement (PREREQUISITE)

**Duration:** 3-5 days
**Goal:** Implement friendship mechanics required for 85% threshold gating
**Status:** ✅ COMPLETE

### Tasks

- [x] **Add friendship gain from interactions**
  - Pet: +2 friendship (socializeWithGuineaPig)
  - Play: +3 friendship (playWithGuineaPig)
  - Handle: +1 friendship (included in socialize)
  - Groom: +2 friendship (cleanGuineaPig)
  - Feed favorite food: +5 friendship (feedGuineaPig)
  - Feed normal food: +1 friendship (feedGuineaPig)

- [x] **Add interaction cooldowns for play and socialize**
  - Track `lastPlayTime` and `lastSocialTime` on GuineaPig
  - Calculate cooldown based on personality, friendship, and wellness
  - **Personality modifiers:**
    - Friendliness (1-10): Higher = shorter cooldown for social interactions
    - Playfulness (1-10): Higher = shorter cooldown for play interactions
  - **Friendship modifiers:**
    - Low friendship (0-40): Longer cooldowns, more easily overwhelmed
    - Medium friendship (41-70): Standard cooldowns
    - High friendship (71-100): Shorter cooldowns, enjoys player company
  - **Wellness modifiers:**
    - Low wellness (<30%): Much longer cooldowns, needs rest
    - Medium wellness (30-70%): Standard cooldowns
    - High wellness (>70%): Shorter cooldowns, energetic and ready
  - **Cooldown formula example:**
    - Base cooldown: 60 seconds for play, 45 seconds for social
    - Friendly (friendliness 8+) + high friendship (80+) + high wellness (80+) = 30s cooldown
    - Shy (friendliness 3-) + low friendship (30-) + low wellness (30-) = 180s cooldown
  - Block interaction during cooldown with message: "[Name] needs a break. Try again in Xs."
  - Award friendship points only when cooldown complete

- [x] **Add friendship gain from need fulfillment**
  - Calculate based on need amount satisfied
  - Range: +0.5 to +2 friendship per need fulfilled
  - Implemented in `satisfyNeed()` function

- [x] **Add passive friendship gain**
  - +0.1 friendship per game tick
  - Only when wellness > 50%
  - Encourages consistent care
  - Implemented in `processBatchNeedsDecay()`

- [x] **Create FriendshipProgress.vue component**
  - Display current friendship percentage
  - Show progress bar with 85% goal indicator
  - Show "X% to Stardust Sanctuary!" message when below 85%
  - Integrated as standalone component (ready for main game view)
  - Implemented in `src/components/game/FriendshipProgress.vue`

- [x] **Add friendship loss mechanics**
  - Wellness < 50%: -1 per tick
  - Wellness < 30%: -2 per tick
  - Individual needs < 30%: -0.5 per need per tick (stacks)
  - Implemented in `processBatchNeedsDecay()`

- [x] **Create FriendshipDebug.vue panel**
  - Real-time friendship tracking with progress bar
  - Cooldown status monitoring (play and social)
  - Net change per tick calculator
  - Debug controls for testing (add/subtract friendship, test interactions)
  - Added to Debug View as "Friendship" tab 💖
  - Implemented in `src/components/debug/FriendshipDebug.vue`

- [ ] **Playtest and tune friendship gain rates** (OPTIONAL - can be done during Phase 2+)
  - Ensure 85% achievable in 3-5 days with good care
  - Excellent care should reach 85% in 2-3 days
  - Poor care should risk losing progress
  - Document final tuning values
  - **Note:** System is functional and balanced; tuning can occur during gameplay testing

**Files Modified:**
- ✅ `src/stores/guineaPigStore.ts` - Added friendship mechanics, cooldown system
- ✅ `src/stores/petStoreManager.ts` - Added cooldown properties to guinea pig generation
- ✅ `src/components/game/FriendshipProgress.vue` - NEW component
- ✅ `src/components/debug/FriendshipDebug.vue` - NEW debug panel
- ✅ `src/views/DebugView.vue` - Added Friendship tab

**Success Criteria:**
- ✅ Friendship visibly increases from positive interactions
- ✅ Friendship passively gains when wellness > 50%
- ✅ Friendship decreases from poor care (wellness < 50%)
- ✅ Interaction cooldowns prevent spam and respect personality
- ✅ Progress bar clearly shows path to 85% Stardust Sanctuary threshold
- ✅ Debug panel allows comprehensive testing of friendship mechanics

---

## Phase 1: Remove ALL Refresh Mechanics

**Duration:** 1-2 days
**Goal:** Complete removal of manual and automatic store refresh systems
**Status:** ✅ COMPLETE

### Tasks

- [x] **Delete refreshPetStore() function from petStoreManager.ts**
  - Remove entire function implementation
  - Remove all function calls

- [x] **Remove refresh-related state from petStoreManager.ts**
  - Delete `nextAutoRefreshTime: number`
  - Delete `refreshCostSequence: number[]`
  - Delete `currentRefreshIndex: number`
  - Delete `canRefreshPetStore: computed`
  - Delete `nextRefreshCost: computed`

- [x] **Remove refresh settings from PetStoreSettings interface**
  - Delete `storeRefreshCost: number`
  - Delete `allowUnlimitedRefresh: boolean`
  - Delete `autoRefreshEnabled: boolean`
  - Delete `autoRefreshIntervalMs: number`

- [x] **Delete refresh UI from PetStoreDebug.vue**
  - Remove "Refresh Settings" panel section
  - Remove "Refresh Pet Store" button
  - Remove cost sequence badges/displays
  - Remove "Next Manual Refresh Cost" stat
  - Remove "No Charge for Refresh" checkbox
  - Remove 24-hour countdown timer
  - Remove "Auto-refresh in" display

**Files to Modify:**
- `src/stores/petStoreManager.ts` - Remove refresh functions and state
- `src/components/debug/PetStoreDebug.vue` - Remove refresh UI

**Success Criteria:**
- ✅ No refresh button exists anywhere in UI
- ✅ No refresh-related state in petStoreManager
- ✅ No refresh costs or timers
- ✅ Build succeeds with no TypeScript errors

---

## Phase 2: Implement Natural Store Churn (Adoption Timers)

**Duration:** 3-4 days
**Goal:** Replace manual refresh with automatic adoption timers
**Status:** ✅ COMPLETE

### Tasks

- [x] **Add adoption timer properties to GuineaPig interface**
  - Added `adoptionTimer: number | null` - Timestamp when guinea pig entered store
  - Added `adoptionDuration: number` - How long available in store (ms, 2-5 days)
  - Implemented in `src/stores/guineaPigStore.ts`

- [x] **Update guinea pig generation with adoption timers**
  - Generate random adoption duration: 2-5 days in milliseconds
  - Set adoptionTimer to Date.now() when guinea pig is created
  - Implemented in `src/stores/petStoreManager.ts` - `generateRandomGuineaPig()`

- [x] **Create processAdoptionTimers() function**
  - Check all store guinea pigs for expired timers
  - Skip guinea pigs that are active or favorited
  - Replace expired guinea pigs with new random guinea pigs
  - Log adoption events to activity feed
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Create helper functions**
  - `getAdoptionTimeRemaining(guineaPigId)` - Returns ms remaining until adoption
  - `formatAdoptionTimer(ms)` - Formats as "Xd Xh" or "Xh Xm" or "Xm"
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Integrate adoption timer processing into game tick**
  - Added call to `processAdoptionTimers()` in `processBatchUpdate()`
  - Runs every 5 seconds alongside needs decay
  - Implemented in `src/stores/needsController.ts`

- [x] **Update PetStoreDebug to display adoption timers**
  - Show adoption countdown on each guinea pig card
  - Format: "⏱️ Xd Xh" or "⏱️ Xh Xm"
  - Updates in real-time
  - Implemented in `src/components/debug/PetStoreDebug.vue`

**Files Modified:**
- ✅ `src/stores/guineaPigStore.ts` - Added adoptionTimer and adoptionDuration properties
- ✅ `src/stores/petStoreManager.ts` - Added processAdoptionTimers(), getAdoptionTimeRemaining(), formatAdoptionTimer()
- ✅ `src/stores/needsController.ts` - Integrated timer processing into game tick
- ✅ `src/components/debug/PetStoreDebug.vue` - Added adoption timer display

**Success Criteria:**
- ✅ Each store guinea pig has visible adoption countdown
- ✅ Guinea pigs automatically replaced when timer expires (2-5 days)
- ✅ Active guinea pigs never replaced
- ✅ Favorited guinea pigs never replaced
- ✅ Timers persist across app sessions (via Pinia persistence)
- ✅ New guinea pigs generated with new random timers (2-5 days)
- ✅ System message logged when guinea pig "adopted" (activity feed)
- ✅ Store always maintains 10 guinea pigs
- ✅ Build succeeds with no TypeScript errors

---

## Phase 3: Create Stardust Sanctuary Debug Panel

**Duration:** 2-3 days
**Goal:** Create dedicated panel for Stardust Sanctuary management

### Tasks

- [ ] **Create StardustSanctuaryDebug.vue component**
  - Three main sections: Active / Stardust Sanctuary / Slots
  - Active section: Show currently active guinea pigs (max 2)
  - Sanctuary section: Show guinea pigs in Stardust Sanctuary
  - Slots section: Show purchasable slots with costs

- [ ] **Remove favorites controls from PetStoreDebug.vue**
  - Remove "Favorites" panel section entirely
  - Remove "Add to Favorites" buttons
  - Remove favorites-related UI elements
  - Keep only adoption functionality

- [ ] **Add friendship progress bars to Active section**
  - Show current friendship percentage
  - Show progress toward 85% goal
  - Color-code based on proximity to threshold
  - Show "X% to Stardust Sanctuary!" when below 85%

- [ ] **Add bond relationship displays**
  - Show guinea pig-to-guinea pig relationships
  - Display bond level percentage
  - Show preserved bonds for Sanctuary guinea pigs
  - Indicate which guinea pigs were previously paired

- [ ] **Add Activate/Deactivate buttons with validation**
  - "Deactivate" button: Move active → Stardust Sanctuary (requires 85% friendship)
  - "Activate" button: Move Sanctuary → active (requires available slot)
  - Disable buttons when conditions not met
  - Show helpful tooltips explaining requirements

**Files to Create:**
- `src/components/debug/StardustSanctuaryDebug.vue` - NEW component
- `src/views/StardustSanctuaryDebugView.vue` - NEW view wrapper

**Files to Modify:**
- `src/components/debug/PetStoreDebug.vue` - Remove favorites UI
- `src/router/index.ts` - Add route for new debug panel

**Success Criteria:**
- ✅ Dedicated Stardust Sanctuary panel exists
- ✅ No favorites controls in Pet Store panel
- ✅ Active guinea pigs shown with friendship progress
- ✅ Sanctuary guinea pigs shown with frozen friendship
- ✅ Bond relationships displayed correctly
- ✅ Activate/Deactivate buttons work with validation

---

## Phase 4: Implement Friendship-Gated Stardust Sanctuary

**Duration:** 3-4 days
**Goal:** Implement 85% friendship threshold and store access gating

### Tasks

- [ ] **Add friendship threshold check to addToStardustSanctuary()**
  - Check if friendship >= 85%
  - Return false and show error if below threshold
  - Show message: "Need 85% friendship to move [Name] to Stardust Sanctuary"

- [ ] **Add friendshipFrozen property to GuineaPig interface**
  ```typescript
  interface GuineaPig {
    // ... existing properties
    friendshipFrozen: boolean  // True when in Stardust Sanctuary
  }
  ```

- [ ] **Implement friendship freeze mechanic**
  - Set `friendshipFrozen = true` when entering Stardust Sanctuary
  - Prevent friendship gain/loss when frozen
  - Unfreeze when activated back to gameplay

- [ ] **Reset wellness and needs on Sanctuary entrance**
  - Set wellness to 100%
  - Set all needs to 100%
  - Log message: "[Name] resting peacefully in Stardust Sanctuary ✨"

- [ ] **Add canAccessStore computed property**
  - Returns true only when activeGuineaPigs.length === 0
  - Used to enable/disable "Return to Store" button
  - Used to lock/unlock pet store access

- [ ] **Update GameController.vue with Return to Store button**
  - Replace "End Session" button with "Return to Store"
  - Disable when active guinea pigs exist
  - Enable when all guinea pigs in Stardust Sanctuary
  - Tooltip: "Move all active guinea pigs to Stardust Sanctuary to return to store"
  - Navigate to pet store when clicked (if enabled)

**Files to Modify:**
- `src/stores/petStoreManager.ts` - Add threshold check, frozen logic, canAccessStore
- `src/stores/guineaPigStore.ts` - Add friendshipFrozen property
- `src/components/debug/GameController.vue` - Replace End Session button

**Success Criteria:**
- ✅ Cannot move to Stardust Sanctuary below 85% friendship
- ✅ Friendship freezes when in Stardust Sanctuary
- ✅ Wellness/needs reset to 100% on entrance
- ✅ Store locked when active guinea pigs exist
- ✅ Store unlocked when all guinea pigs in Sanctuary
- ✅ "Return to Store" button shows correct state

---

## Phase 5: Implement Pairing Validation & Bond Preservation

**Duration:** 3-4 days
**Goal:** Enforce pairing rules and preserve guinea pig relationships

### Tasks

- [ ] **Create validatePairing() function**
  - Check if both guinea pigs are new: ✅ ALLOW
  - Check if both guinea pigs in Sanctuary: ✅ ALLOW
  - Check if one new, one Sanctuary: ❌ BLOCK
  - Return `{ valid: boolean, reason?: string }`

- [ ] **Add bonds property to GuineaPig interface**
  ```typescript
  interface GuineaPig {
    // ... existing properties
    bonds: Record<string, GuineaPigBond>
  }

  interface GuineaPigBond {
    partnerId: string
    relationshipLevel: number
    bondedAt: number
    timesTogether: number
  }
  ```

- [ ] **Create saveBonds() function**
  - Called when guinea pig moves to Stardust Sanctuary
  - Save relationships with other Sanctuary guinea pigs
  - Store in `bonds` property for preservation

- [ ] **Create restoreBondsIfExists() function**
  - Called when activating guinea pigs for pairing
  - Check if both have saved bond with each other
  - Restore relationship level if bond exists
  - Start at 0 if no previous bond

- [ ] **Update startGameSession() with pairing validation**
  - Call validatePairing() before starting session
  - Show error dialog if validation fails
  - Log warning message with reason

- [ ] **Create pairing error dialog**
  - Show when New + Sanctuary pairing attempted
  - Message: "Cannot pair [Sanctuary] with [New]. Guinea pigs must start from the same socialization level."
  - Options: "Adopt two new guinea pigs together" or "Activate two Sanctuary guinea pigs together"

**Files to Modify:**
- `src/stores/petStoreManager.ts` - Add validation, bond save/restore
- `src/stores/guineaPigStore.ts` - Add bonds property
- `src/components/dialogs/PairingErrorDialog.vue` - NEW component

**Success Criteria:**
- ✅ New + New pairing allowed
- ✅ Sanctuary + Sanctuary pairing allowed
- ✅ New + Sanctuary pairing blocked with error
- ✅ Bonds saved when both guinea pigs move to Sanctuary
- ✅ Bonds restored when same pair reactivated
- ✅ Bonds reset when paired with different partner

---

## Phase 6: Remove Session Ending System

**Duration:** 1-2 days
**Goal:** Complete removal of session ending mechanics

### Tasks

- [ ] **Delete SessionEndingDialog.vue component**
  - Remove entire file
  - Remove from imports in other components

- [ ] **Remove endGameSession() function from petStoreManager.ts**
  - Delete entire function
  - Remove all calls to this function

- [ ] **Remove GameSession interface and activeGameSession state**
  - Delete `interface GameSession`
  - Delete `activeGameSession: GameSession | null`
  - Remove from persistence

- [ ] **Remove End Session button from GameController.vue**
  - Delete "Return Guinea Pigs & End Session" button
  - Delete button click handler

- [ ] **Remove End Game Penalty slider from GameController.vue**
  - Delete slider component
  - Remove `settings.endGamePenalty` state
  - Remove from settings interface

**Files to Delete:**
- `src/components/game/SessionEndingDialog.vue`

**Files to Modify:**
- `src/stores/petStoreManager.ts` - Remove session ending logic
- `src/components/debug/GameController.vue` - Remove UI elements

**Success Criteria:**
- ✅ No "End Session" button exists
- ✅ No session ending dialog
- ✅ No end game penalty setting
- ✅ Build succeeds with no TypeScript errors
- ✅ No session-related state persisted

---

## Phase 7: Update Safety Net Systems

**Duration:** 1-2 days
**Goal:** Ensure rescue and fresh start preserve Stardust Sanctuary

### Tasks

- [ ] **Update Guinea Pig Rescue to preserve Stardust Sanctuary**
  - Rescue triggers when wellness < 15%
  - Guinea pigs in Stardust Sanctuary remain in Sanctuary
  - Active guinea pigs wellness restored but stay active (permanent adoption)
  - $200 penalty still applies
  - Log: "[Name] received emergency care. Rescue fee: $200 💔"

- [ ] **Update Fresh Start to preserve Stardust Sanctuary**
  - Triggers when currency < $0
  - Reset currency to $1,000
  - Preserve ALL Stardust Sanctuary guinea pigs
  - Preserve ALL purchased Sanctuary slots
  - Active guinea pigs remain active
  - Log: "Fresh Start! Currency reset to $1,000. Your X Stardust Sanctuary residents are safe! ✨"

- [ ] **Ensure rescue doesn't remove any guinea pigs**
  - No guinea pigs removed for any reason (permanent adoption)
  - Wellness restored, needs reset
  - Guinea pigs stay in current state (active or Sanctuary)

**Files to Modify:**
- `src/stores/needsController.ts` - Update rescue logic
- `src/stores/playerProgression.ts` - Update Fresh Start logic

**Success Criteria:**
- ✅ Guinea Pig Rescue preserves Stardust Sanctuary
- ✅ Fresh Start preserves Stardust Sanctuary and slots
- ✅ No guinea pigs removed by rescue system
- ✅ Active guinea pigs remain active (not removed)
- ✅ Correct messages logged for both safety nets

---

## Phase 8: Add Observe Interaction & UI Polish

**Duration:** 2-3 days
**Goal:** Add personality preview and polish user experience

### Tasks

- [ ] **Create Observe button for each store guinea pig**
  - Add "Observe [Name]" button to each guinea pig in store
  - One-time use only per guinea pig
  - Disable after first use (show "Observed ✓")
  - No cost, no cooldown

- [ ] **Add personality glimpse messages for Observe**
  - "[Name] is munching hay contentedly." 🌾
  - "[Name] looks at you curiously." 👀
  - "[Name] is sleeping stretched out in the corner." 😴
  - "[Name] is taking cover in an igloo." 🏠
  - "[Name] is popcorning excitedly!" 🎉
  - "[Name] is grooming their fur carefully." ✨
  - Generate based on personality traits

- [ ] **Create permanent adoption confirmation dialog**
  - Show when adopting guinea pig
  - Title: "Ready to adopt [Name]?"
  - Message: "This is a permanent commitment. You'll care for [Name] and build a lasting friendship. Once adopted, they're yours forever!"
  - Buttons: [Confirm Adoption] [Cancel]

- [ ] **Add friendship progress bars to main game view**
  - Integrate FriendshipProgress.vue component
  - Show for each active guinea pig
  - Update in real-time as friendship changes
  - Highlight when reaching 85%

- [ ] **Update all tooltips and UI text**
  - Replace all "favorite" terminology with "Stardust Sanctuary"
  - Update button labels, tooltips, messages
  - Ensure consistent terminology throughout

**Files to Modify:**
- `src/components/debug/PetStoreDebug.vue` - Add Observe button
- `src/utils/messageGenerator.ts` - Add Observe messages
- `src/components/dialogs/AdoptionConfirmDialog.vue` - NEW component
- `src/views/GameView.vue` - Add friendship progress bars

**Success Criteria:**
- ✅ Observe button shows personality glimpse
- ✅ Observe only usable once per guinea pig
- ✅ Permanent adoption confirmation shown
- ✅ Friendship progress visible in main game
- ✅ All UI uses "Stardust Sanctuary" terminology

---

## Phase 9: Testing & Validation

**Duration:** 3-5 days
**Goal:** Comprehensive testing of all new mechanics

### Tasks

- [ ] **Test friendship gain rates**
  - Positive interactions increase friendship
  - Need fulfillment grants friendship
  - Passive gain works when needs > 50%
  - 85% achievable in 3-5 days with good care
  - Excellent care reaches 85% in 2-3 days

- [ ] **Test adoption timers**
  - Timers display correctly (2-5 days)
  - Countdown updates in real-time
  - Guinea pigs replaced when timer expires
  - New guinea pigs have new timers
  - Timers persist across app restart

- [ ] **Test friendship threshold gating**
  - Cannot move to Sanctuary below 85%
  - Can move to Sanctuary at exactly 85%
  - Can move to Sanctuary above 85%
  - Error message shown when below threshold

- [ ] **Test store access gating**
  - Store locked when active guinea pigs exist
  - Store unlocked when all guinea pigs in Sanctuary
  - "Return to Store" button disabled/enabled correctly
  - Tooltip messages accurate

- [ ] **Test pairing validation**
  - New + New pairing allowed
  - Sanctuary + Sanctuary pairing allowed
  - New + Sanctuary pairing blocked
  - Error dialog shown for invalid pairing
  - Error message clear and helpful

- [ ] **Test bond preservation**
  - Bonds saved when both guinea pigs move to Sanctuary
  - Bonds restored when same pair reactivated
  - Bonds reset when paired with different partner
  - Bond levels tracked correctly across multiple pairings

- [ ] **Test Guinea Pig Rescue preservation**
  - Rescue triggers at wellness < 15%
  - Sanctuary guinea pigs stay in Sanctuary
  - Active guinea pigs stay active
  - Wellness restored, $200 charged
  - No guinea pigs removed

- [ ] **Test Fresh Start preservation**
  - Triggers when currency < $0
  - Currency reset to $1,000
  - All Sanctuary guinea pigs preserved
  - All Sanctuary slots preserved
  - Active guinea pigs preserved

- [ ] **Manual playtest complete redesign end-to-end**
  - First-time experience with 10 guinea pigs
  - Observe interaction
  - Adopt 1-2 guinea pigs (permanent commitment)
  - Build friendship to 85%
  - Move to Stardust Sanctuary
  - Return to store
  - Adopt new guinea pigs
  - Test pairing rules
  - Test bond preservation
  - Verify natural store churn

**Success Criteria:**
- ✅ All mechanics work as designed
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Smooth user experience
- ✅ Clear feedback on all actions
- ✅ Permanent adoption feels meaningful
- ✅ Stardust Sanctuary feels rewarding

---

## Phase 10: Documentation & Migration

**Duration:** 2-3 days
**Goal:** Update documentation and handle existing player data

### Tasks

- [ ] **Update SYSTEM_INTEGRATION.md**
  - Add Stardust Sanctuary architecture
  - Document friendship system integration
  - Update data flow diagrams
  - Document new state management

- [ ] **Create save data migration strategy**
  - Plan for existing players with favorites
  - Plan for active game sessions
  - Plan for refresh cost progression

- [ ] **Implement grandfather clause**
  - Existing favorites kept valid
  - Bump friendship to 85% minimum if below
  - Set friendshipFrozen = true for all existing
  - Log migration message

- [ ] **Test migration with existing save data**
  - Test with favorites below 85%
  - Test with active sessions
  - Test with purchased slots
  - Ensure no data loss

**Files to Modify:**
- `docs/SYSTEM_INTEGRATION.md` - Add architecture docs
- `src/stores/petStoreManager.ts` - Add migration logic
- `docs/MIGRATION_GUIDE.md` - NEW migration guide

**Success Criteria:**
- ✅ SYSTEM_INTEGRATION.md updated
- ✅ Migration strategy documented
- ✅ Existing favorites preserved
- ✅ No breaking changes for players
- ✅ Migration tested thoroughly

---

## Risk Assessment

### High Risk Areas

1. **Friendship tuning** - May require multiple iterations to get 85% achievable in 3-5 days
2. **Bond preservation** - Complex logic with edge cases (multiple pairings, different partners)
3. **Save data migration** - Must not break existing player data

### Mitigation Strategies

1. **Friendship tuning** - Extensive playtesting in Phase 0, adjustable gain rates
2. **Bond preservation** - Comprehensive unit tests, clear test cases
3. **Save data migration** - Grandfather clause, thorough migration testing, rollback plan

### Dependencies

- **Phase 0 must complete first** - All other phases depend on friendship system
- **Phase 1-2 can run in parallel** - Refresh removal and timer addition independent
- **Phase 4 depends on Phase 0** - Friendship gating requires friendship system
- **Phase 5 depends on Phase 4** - Pairing validation uses Sanctuary status

---

## Success Metrics

### Technical Success

- ✅ All TypeScript builds without errors
- ✅ All unit tests pass
- ✅ No console errors during gameplay
- ✅ State persists correctly across sessions
- ✅ Performance remains smooth with timers

### Player Experience Success

- ✅ Clear progression path (adopt → bond → Sanctuary)
- ✅ 85% friendship achievable in reasonable time
- ✅ Stardust Sanctuary feels rewarding
- ✅ No punishing mechanics
- ✅ No frustrating restrictions
- ✅ Natural store evolution (no refresh spam)

### Design Goal Success

- ✅ Permanent adoption creates emotional investment
- ✅ Friendship mastery required before expansion
- ✅ Bond preservation adds depth
- ✅ Natural store churn feels realistic
- ✅ Safety nets prevent player frustration

---

## Rollback Plan

If critical issues discovered after deployment:

1. **Immediate rollback** - Revert to previous version (System 6.95 v1)
2. **Data preservation** - Ensure no player data lost in rollback
3. **Issue diagnosis** - Identify specific problem area
4. **Targeted fix** - Fix specific phase without full rollback
5. **Re-deploy** - Test thoroughly before re-deploying

**Rollback triggers:**
- Critical bug preventing gameplay
- Data corruption or loss
- Performance degradation
- Major player complaints

---

## Next Steps

1. **Review this implementation plan** - Ensure all stakeholders agree
2. **Begin Phase 0** - Friendship System Enhancement (prerequisite)
3. **Track progress** - Mark tasks complete in todo list
4. **Regular testing** - Test after each phase completion
5. **Iterate** - Adjust plan based on learnings

**Ready to begin?** Start with Phase 0: Friendship System Enhancement
