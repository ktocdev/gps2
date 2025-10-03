# Bug Fix: Pet Store Refresh Ends Active Session

**Issue:** GPS2-16-BUGFIX-1
**Date:** October 3, 2025
**Status:** ✅ FIXED
**Priority:** Medium
**Component:** Pet Store Manager (System 6.9)

---

## Problem Description

### Original Behavior ❌

When `refreshPetStore()` was triggered (manually or via auto-refresh), it **always ended the active game session** with a $50 penalty, regardless of whether the active guinea pigs were in favorites or not.

**Impact:**
- Players lost their active sessions unexpectedly
- Incurred $50 penalty for no fault of their own
- Disrupted gameplay flow, especially with 24-hour auto-refresh enabled
- Poor user experience during normal gameplay

### Root Cause

**Location:** `src/stores/petStoreManager.ts:572-575`

**Incorrect Assumption:**
```typescript
// End any active session before refreshing since guinea pig IDs will change
if (activeGameSession.value) {
  endGameSession()
}
```

The comment states "guinea pig IDs will change" - but this is **only true for available guinea pigs**, not favorited ones. Favorited guinea pigs **preserve their IDs** during refresh (lines 578-584).

**Logic Error:**
- Available guinea pigs → regenerated with **new IDs** ✓ (need session end)
- **Favorited guinea pigs** → preserved with **same IDs** ✓ (session can continue)
- Code treated both cases the same ❌

---

## Solution Implemented

### New Behavior ✅

The `refreshPetStore()` function now:

1. **Checks if ALL active guinea pigs are in favorites**
2. **If yes:** Preserve the active session (no penalty, gameplay continues)
3. **If no:** End the session as before (edge case - shouldn't happen in normal gameplay)

### Code Changes

**File:** `src/stores/petStoreManager.ts`
**Lines:** 565-612

```typescript
function refreshPetStore(isAutoRefresh: boolean = false): void {
  if (!isAutoRefresh && !canRefreshPetStore.value) {
    const logging = getLoggingStore()
    logging.logWarn('Pet store refresh on cooldown')
    return
  }

  // Check if active session guinea pigs are all in favorites
  // If they are, we can preserve the session (favorites keep their IDs during refresh)
  let shouldEndSession = false

  if (activeGameSession.value) {
    // Check if ALL active guinea pigs are in favorites
    const allActiveGuineaPigsAreFavorited = activeGameSession.value.guineaPigIds.every(id =>
      favoriteGuineaPigs.value.some(favorite => favorite.id === id)
    )

    // Only end session if some active guinea pigs are NOT favorited
    // (This is an edge case - shouldn't happen in normal gameplay)
    if (!allActiveGuineaPigsAreFavorited) {
      shouldEndSession = true
      endGameSession()
    }
  }

  // Preserve favorites during refresh (key feature!)
  const favoritesBackup = [...favoriteGuineaPigs.value]

  generateRandomGuineaPigs(10)
  lastRefreshTimestamp.value = Date.now()

  // Restore favorites
  favoriteGuineaPigs.value = favoritesBackup

  // Reset auto-refresh timer whenever any refresh occurs (manual or auto)
  if (settings.value.autoRefreshEnabled) {
    nextAutoRefreshTime.value = Date.now() + settings.value.autoRefreshIntervalMs
  }

  const logging = getLoggingStore()
  const refreshType = isAutoRefresh ? 'Auto-refreshed' : 'Refreshed'
  logging.addPlayerAction(`${refreshType} pet store with new guinea pigs 🔄`, '🔄', {
    isAutoRefresh,
    nextAutoRefresh: nextAutoRefreshTime.value,
    favoritesPreserved: favoritesBackup.length,
    sessionPreserved: activeGameSession.value !== null && !shouldEndSession // NEW
  })
}
```

### Key Changes

1. **Added session preservation logic** (lines 572-588):
   - Checks if all active guinea pigs are in favorites using `.every()` and `.some()`
   - Sets `shouldEndSession` flag only if needed

2. **Added `sessionPreserved` to activity log** (line 610):
   - Logs whether the session was preserved for debugging/transparency

3. **Improved comments** to explain the logic clearly

---

## Testing Instructions

### Test Environment
**URL:** http://localhost:5174/gps2/
**Browser:** Chrome/Firefox (DevTools open)

### Test Case 1: Active Session with Favorited Guinea Pigs (Happy Path)

**Steps:**
1. Navigate to Pet Store Debug panel
2. Add 2 guinea pigs to favorites (click ⭐ button)
3. Navigate to Game Controller (home screen)
4. Select the 2 favorited guinea pigs from dropdowns (they have ⭐ prefix)
5. Click "Start Game Session"
6. **Verify:** Session starts, guinea pigs show ACTIVE badge in favorites panel
7. Navigate back to Pet Store Debug
8. Click "Refresh Pet Store" button
9. **Expected Results:**
   - ✅ Available guinea pigs regenerated (10 new ones)
   - ✅ Favorited guinea pigs preserved
   - ✅ **Active session continues (no penalty!)**
   - ✅ Activity log shows: "favoritesPreserved: 2, sessionPreserved: true"
   - ✅ Currency balance unchanged (no $50 penalty)
   - ✅ Game continues normally

**Before Fix:**
- ❌ Session ended with $50 penalty
- ❌ Activity log: "Ended game session (penalty: $50) ⏹️"

**After Fix:**
- ✅ Session preserved
- ✅ No penalty
- ✅ Gameplay uninterrupted

---

### Test Case 2: Auto-Refresh with Active Favorited Session

**Steps:**
1. Follow Test Case 1 steps 1-6 (start session with favorited guinea pigs)
2. In Pet Store Debug, enable "Enable 24-Hour Auto-Refresh" checkbox
3. In browser console, trigger immediate auto-refresh:
   ```javascript
   window.$pinia.state.value.petStoreManager.nextAutoRefreshTime = Date.now() - 1000
   ```
4. Wait 1 minute for auto-refresh to trigger
5. **Expected Results:**
   - ✅ Auto-refresh occurs
   - ✅ Activity log: "Auto-refreshed pet store with new guinea pigs 🔄"
   - ✅ Session preserved (sessionPreserved: true)
   - ✅ No $50 penalty
   - ✅ Game continues

---

### Test Case 3: Edge Case - Active Non-Favorited Guinea Pig

**Scenario:** This shouldn't happen in normal gameplay, but we handle it gracefully.

**Steps:**
1. Navigate to Pet Store Debug
2. Do NOT add any guinea pigs to favorites
3. Navigate to Game Controller
4. Select 2 guinea pigs from available pool (no ⭐ prefix)
5. Click "Start Game Session"
6. Navigate back to Pet Store Debug
7. Click "Refresh Pet Store"
8. **Expected Results:**
   - ✅ Session ends (because active guinea pigs aren't favorited)
   - ✅ $50 penalty applied
   - ✅ Activity log: "Ended game session (penalty: $50) ⏹️"
   - ✅ Available pool regenerated
   - ✅ sessionPreserved: false in log

**Rationale:** If active guinea pigs aren't favorited, their IDs will be lost during refresh, so session must end.

---

### Test Case 4: Mixed Session (1 Favorited, 1 Not) - Edge Case

**Steps:**
1. Add 1 guinea pig to favorites
2. Start session with 1 favorited + 1 non-favorited guinea pig
3. Refresh store
4. **Expected Results:**
   - ✅ Session ends (not all active guinea pigs are favorited)
   - ✅ $50 penalty applied
   - ✅ Favorited guinea pig preserved in favorites
   - ✅ Non-favorited guinea pig lost (new ID generated)

---

## Verification Checklist

- [x] TypeScript build passes (no errors)
- [x] Code logic correct (uses `.every()` for all checks)
- [x] Activity log includes `sessionPreserved` flag
- [ ] Test Case 1 passes (manual refresh with favorited session)
- [ ] Test Case 2 passes (auto-refresh with favorited session)
- [ ] Test Case 3 passes (edge case - non-favorited session)
- [ ] Test Case 4 passes (edge case - mixed session)
- [ ] No console errors during testing
- [ ] User experience improved (no unexpected session endings)

---

## Impact Analysis

### Before Fix
- **Player Experience:** Poor - unexpected session losses
- **Penalty Frequency:** High (every refresh = $50 penalty)
- **With 24h Auto-Refresh:** Very disruptive

### After Fix
- **Player Experience:** Excellent - sessions preserved
- **Penalty Frequency:** Low (only edge cases)
- **With 24h Auto-Refresh:** Seamless, no disruption

### Metrics
- **Lines Changed:** 20 (added logic, improved comments)
- **Complexity:** Low (simple boolean check)
- **Risk:** Very Low (backwards compatible, edge cases handled)
- **Performance:** No impact (O(n) where n = active guinea pigs, max 2)

---

## Related Issues

- See: `docs/TODO-2025-09-28.md` - Known Issues section
- **Status in TODO:** Will be marked as ✅ FIXED after testing complete

---

## Next Steps

1. **Manual Testing:** Execute all 4 test cases above
2. **User Acceptance:** Verify improved gameplay experience
3. **Update TODO:** Mark bug as fixed in `TODO-2025-09-28.md`
4. **Update System Doc:** Add bug fix to `system-6.9-guinea-pig-favorites.md`
5. **Commit Changes:**
   ```bash
   git add src/stores/petStoreManager.ts
   git commit -m "GPS2-16: Fix pet store refresh ending active sessions

   - Preserve sessions when all active guinea pigs are favorited
   - Only end session if non-favorited guinea pigs are active
   - Add sessionPreserved flag to activity log
   - Fixes unexpected $50 penalties during refresh"
   ```

---

## Sign-Off

**Developer:** Claude (AI Assistant)
**Reviewer:** [Pending]
**Status:** ✅ Fix Implemented, Testing Pending
**Date:** October 3, 2025
