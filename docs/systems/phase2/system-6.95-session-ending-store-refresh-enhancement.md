# Session Ending & Store Refresh Enhancement - System 6.95

**Phase:** Phase 2 (Pet Store & Session Management)
**Status:** ✅ **Implemented**
**System Number:** 6.95
**Prerequisites:**
- Pet Store & Game Session Manager (System 6.5) ✅
- Guinea Pig Favorites System (System 6.9) ✅
**Created:** October 11, 2025
**Implemented:** October 11, 2025

## Overview

A comprehensive revision of session ending and store refresh mechanics that creates meaningful consequences for abandonment while enabling flexible gameplay through the favorites system. This enhancement transforms the pet store from a simple selection tool into a strategic system where commitment (favoriting) and abandonment have real stakes.

## Core Philosophy

**"Build lasting relationships. Favorites = commitment. Abandonment has consequences."**

This system rewards players who:
- Build long-term relationships with guinea pigs
- Commit through the favorites system
- Earn currency through positive interactions and milestones
- Personalize items for specific guinea pigs
- Learn preferences, build bonds, and teach skills

## Key Design Changes

### From Current System:
- Ending session returns guinea pigs to store (no cost)
- Fixed store refresh cost ($100)
- Guinea pigs cycle back into availability

### To New System:
- Ending session has **three outcomes** based on commitment (favoriting)
- **Escalating store refresh costs** ($100 → $3,200)
- **Permanent removal** for non-favorited guinea pigs (consequence of abandonment)

---

## Session Ending Mechanics

### Rule 1: Ending with Non-Favorited Guinea Pigs (Abandonment)

**Scenario:** Player adopted guinea pigs but never favorited them

**Outcome:**
- **Fee:** $100 (rescue fee)
- **Result:** Guinea pigs **permanently removed** from game (rehomed to another family)
- **Loss:** All progress (friendship, learned preferences, bonds) deleted
- **Cannot see them again:** Complete removal from all pools

**Narrative Message:**
```
"You returned Peanut and Oreo to the pet store without building a lasting bond.
They've found a new home with another family who will care for them long-term.
Rescue fee: $100 💔"
```

**Design Intent:**
- Creates emotional stake in decisions
- Teaches value of favorites system
- Discourages casual "try and discard" gameplay
- Makes guinea pig selection meaningful

---

### Rule 2: Ending with Favorited Guinea Pigs (Collection Management)

**Scenario:** Player favorited guinea pigs (committed to relationship)

**Outcome:**
- **Fee:** $0 (free - collection management, not abandonment)
- **Result:** Guinea pigs return to favorites **safely**
- **Preserved:** All progress (friendship, preferences, bonds, skills)
- **Memory intact:** Can resume relationship anytime
- **Flexible gameplay:** Swap between favorites without penalty

**Narrative Message:**
```
"Peanut and Oreo are taking a break and resting in your favorites.
All your progress with them is saved! ✨
Their friendship (85%) and learned preferences are safe."
```

**Design Intent:**
- Rewards commitment (favoriting)
- Enables flexible gameplay without fear
- Encourages building a collection of beloved guinea pigs
- No penalty for managing your roster

---

### Rule 3: Mixed Session (1 Favorite + 1 Non-Favorite)

**Scenario:** One guinea pig is favorited, one is not

**User Flow:**
1. **Warning Dialog Appears** when player tries to end session
2. **Shows non-favorited guinea pig(s)** with option to favorite them now
3. **Player can choose:**
   - Favorite the guinea pig(s) → All return safely, $0 fee
   - Don't favorite → Non-favorited permanently removed, $50 fee

**Dialog Content:**
```
⚠️ Wait! You're about to end this session.

✨ Peanut is in your favorites and will return safely.

💔 Oreo is NOT favorited and will be rehomed permanently if you continue.

Would you like to favorite Oreo before ending?

[Favorite Oreo] [End Without Favoriting ($50)]
```

**Outcomes:**
- **If player favorites:** All guinea pigs return to favorites, $0 fee, all progress saved
- **If player doesn't favorite:** Favorited returns safely, non-favorited permanently removed, $50 fee

**Design Intent:**
- **Second chance:** Prevents accidental permanent loss
- **Educational:** Teaches value of favorites system
- **Player-friendly:** Clear warning before irreversible action
- **Still has stakes:** Must actively choose to favorite (not automatic)
- **Consequence remains:** If player declines, non-favorited is still removed

**Why This Works:**
- Respects player agency (clear choice with consequences)
- Prevents rage-quit scenarios ("I forgot to favorite them!")
- Teaches system naturally (prompt explains what will happen)
- Maintains stakes (must actively engage with favorites system)
- Lower fee ($25) rewards partial commitment

---

## Bonding Effects When Partner is Removed

### Overview

When guinea pigs have formed a bond and one partner is removed (rehomed), the remaining guinea pig experiences **emotional consequences** that affect gameplay.

### Bond Detection

**Check for bonding:**
```typescript
// In guineaPig interface (Phase 4 feature)
interface GuineaPig {
  // ... existing fields
  relationships: {
    [guineaPigId: string]: {
      bondLevel: number      // 0-100, bond exists if > 50
      bondedAt?: number      // Timestamp when bond formed
    }
  }
}
```

**When is a guinea pig bonded?**
- `bondLevel >= 50` with their current partner
- Has spent significant time together in sessions
- (Bonding System from Phase 4 - Guinea Pig Bonding System)

---

### Emotional Consequences

#### Scenario: Bonded Partner is Removed

**When ending session:**
1. Check if guinea pigs have bond (`bondLevel >= 50`)
2. If one is favorited and one is not:
   - Non-favorited guinea pig is removed (rehomed)
   - **Favorited guinea pig experiences sadness/grief**

**Effects on Remaining Guinea Pig:**

**Immediate Effects:**
- **Friendship decreases by 10-20 points** (grief/confusion)
- **Comfort need drops to 50%** (emotional distress)
- **Social need drops to 60%** (missing companion)
- **Activity feed message:** Special bond-breaking message

**Temporary Status:**
- **"Grieving" status for 1-2 game sessions** (or 4-8 real hours)
- During grieving period:
  - Social interactions 50% less effective
  - More likely to reject interactions
  - Activity feed shows sad reactions
  - Special comfort interactions needed

**Activity Feed Messages:**
```
💔 Peanut is heartbroken. Their bonded friend Oreo has been rehomed.
Peanut seems confused and keeps looking for Oreo 😢
Peanut needs extra comfort and reassurance right now.
```

---

### Implementation Details

**Add to endGameSession() logic:**

```typescript
function endGameSession(): void {
  // ... existing logic for processing each guinea pig

  // NEW: Check for broken bonds
  for (const id of activeGameSession.value.guineaPigIds) {
    const gp = guineaPigStore.getGuineaPig(id)
    if (!gp) continue

    const isInFavorites = favoriteGuineaPigs.value.some(f => f.id === id)

    if (isInFavorites || gp.wasFromFavorites) {
      // This guinea pig is returning to favorites
      // Check if their partner was removed (bonded but not favorited)

      for (const partnerId of activeGameSession.value.guineaPigIds) {
        if (partnerId === id) continue  // Skip self

        const partner = guineaPigStore.getGuineaPig(partnerId)
        const partnerInFavorites = favoriteGuineaPigs.value.some(f => f.id === partnerId)

        // Check bond exists
        const bondLevel = gp.relationships?.[partnerId]?.bondLevel || 0

        if (bondLevel >= 50 && !partnerInFavorites) {
          // Partner was bonded but is being removed - apply grief
          applyBondBreakingEffects(gp, partner)
        }
      }
    }
  }

  // ... rest of existing logic
}

function applyBondBreakingEffects(guineaPig: GuineaPig, removedPartner: GuineaPig): void {
  // Friendship penalty
  guineaPig.friendship = Math.max(30, guineaPig.friendship - 15)

  // Need penalties
  guineaPig.needs.comfort = Math.max(40, 50)
  guineaPig.needs.social = Math.max(40, 60)

  // Add grieving status (temporary state)
  guineaPig.temporaryStatuses = guineaPig.temporaryStatuses || []
  guineaPig.temporaryStatuses.push({
    type: 'grieving',
    startedAt: Date.now(),
    duration: 14400000,  // 4 hours real time
    partnerId: removedPartner.id,
    partnerName: removedPartner.name
  })

  // Activity feed message
  const logging = getLoggingStore()
  logging.addGuineaPigReaction(
    `${guineaPig.name} is heartbroken. Their bonded friend ${removedPartner.name} has been rehomed 💔`,
    '💔',
    {
      guineaPigId: guineaPig.id,
      removedPartnerId: removedPartner.id,
      bondLevel: guineaPig.relationships[removedPartner.id].bondLevel,
      category: 'emotional',
      severity: 'high'
    }
  )

  logging.addGuineaPigReaction(
    `${guineaPig.name} needs extra comfort and reassurance right now 😢`,
    '😢',
    {
      guineaPigId: guineaPig.id,
      category: 'need_warning'
    }
  )
}
```

---

### Grieving Status Mechanics

**During grieving period, guinea pig:**
- Shows sad animations/behaviors (Phase 5)
- Social interactions provide 50% normal benefit
- Comfort interactions provide 150% benefit (what they need)
- Rejection rate increased by 20%
- Activity feed shows grief-related messages

**Special comfort interactions during grieving:**
- "Comfort [guinea pig name]" action available
- Costs no currency, but has cooldown (10 minutes)
- Provides +10 friendship, +15 comfort
- Shows heartwarming message: "Peanut snuggled close to you for comfort 💙"

**Grieving ends when:**
- Duration expires (4-8 hours real time)
- OR guinea pig is paired with new companion in session (new bond forming)
- OR player provides 3+ comfort interactions

---

### Edge Cases

**Both Guinea Pigs Bonded and Both Removed:**
- No grieving effects (both gone together)
- Activity feed: "Peanut and Oreo have been rehomed together 💔"

**Both Guinea Pigs Bonded and Both Favorited:**
- No grieving effects (both safe in favorites)
- Activity feed: "Peanut and Oreo are resting in your favorites together ✨"

**Weakly Bonded (bondLevel 25-49):**
- No full grieving status
- Minor friendship decrease (-5 points)
- Activity feed: "Peanut seems to miss Oreo a little 😔"

**No Bond (bondLevel < 25):**
- No effects
- Standard end session messages

---

### Player Experience

**What this adds:**
- **Emotional stakes:** Breaking bonds has visible consequences
- **Teaches bonding value:** Shows bonds matter in gameplay
- **Encourages commitment:** Makes you think before ending session
- **Natural storytelling:** Guinea pigs "remember" their companions
- **Recovery mechanic:** Grieving can be healed through comfort

**Why this works:**
- Not punishing enough to prevent restarts
- Creates empathy for guinea pigs
- Rewards long-term play (bonds take time to form)
- Makes favorites even more valuable (keeps bonds intact)

---

## Store Refresh Mechanics

### Escalating Cost Structure

**Purpose:** Discourage "guinea pig shopping" and encourage working with available guinea pigs

**Cost Sequence:**
```
1st refresh:  $100
2nd refresh:  $300   (+$200)
3rd refresh:  $500   (+$200)
4th refresh:  $800   (+$300)
5th refresh:  $1,600 (x2)
6th refresh:  $3,200 (x2)
7th+ refresh: $3,200 (capped)

24-hour auto-refresh: FREE + resets to $100
```

**Pattern Analysis:**
- **Early refreshes:** Moderate cost ($100-$500) - accessible
- **Mid refreshes:** Steep increase ($800-$1,600) - discouraging
- **Late refreshes:** Extreme cost ($3,200) - severely punishing
- **Auto-refresh:** Always free, always resets to $100 (patience rewarded)

**Design Intent:**
- First refresh is reasonable ($100) - players can try once
- Costs escalate quickly to discourage spam
- $3,200 cap is prohibitively expensive (about 3-4 game sessions worth)
- 24-hour free refresh is always available (encourages patience)
- Makes favorites system more valuable (don't need to refresh)

---

### 24-Hour Reset Mechanics

**Trigger Conditions:**
- **Auto-refresh occurs:** Free refresh after 24 hours
- **24 hours pass since last manual refresh:** Cost resets even without refresh

**What Resets:**
- `currentRefreshIndex` → 0 (back to first cost in sequence)
- Next refresh costs $100 again
- Timer starts fresh (24 hours from now)

**Why This Matters:**
- Players always have access to $100 refresh after waiting
- Can't be permanently stuck at $3,200 cost
- Encourages taking breaks between play sessions
- Rewards patience

---

## Implementation Details

### Data Structure Changes

#### PetStoreSettings Interface

**New fields:**
```typescript
interface PetStoreSettings {
  // Store Refresh Cost System
  refreshCostSequence: number[]          // [100, 300, 500, 800, 1600, 3200]
  currentRefreshIndex: number            // Position in sequence (0-5)
  maxRefreshCost: number                 // 3200
  lastManualRefreshTime: number          // Timestamp for 24h reset

  // Session Ending System
  endGameReturnFee: number               // 50 (full), 25 (mixed), 0 (all favorites)

  // Existing fields
  allowUnlimitedRefresh: boolean
  autoRefreshEnabled: boolean
  autoRefreshIntervalMs: number
}
```

**Default values:**
```typescript
const settings = ref<PetStoreSettings>({
  refreshCostSequence: [100, 300, 500, 800, 1600, 3200],
  currentRefreshIndex: 0,
  maxRefreshCost: 3200,
  lastManualRefreshTime: 0,
  endGameReturnFee: 50,
  allowUnlimitedRefresh: false,
  autoRefreshEnabled: true,
  autoRefreshIntervalMs: 86400000  // 24 hours
})
```

---

#### GuineaPig Interface

**New field:**
```typescript
export interface GuineaPig {
  // ... existing fields
  wasFromFavorites: boolean    // Track if session started from favorites
}
```

**Purpose:**
- Determines outcome when ending session
- Set in `startGameSession()` based on whether guinea pig is in favorites
- Used in `endGameSession()` to apply correct rules

---

### Core Function Changes

#### startGameSession()

**New logic:**
```typescript
function startGameSession(guineaPigIds: string[]): void {
  // ... existing validation

  // NEW: Track origin of each guinea pig
  for (const guineaPigId of guineaPigIds) {
    let guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
    if (!guineaPig) {
      guineaPig = favoriteGuineaPigs.value.find(gp => gp.id === guineaPigId)
    }

    if (guineaPig) {
      const isFavorite = favoriteGuineaPigs.value.some(gp => gp.id === guineaPigId)
      guineaPig.wasFromFavorites = isFavorite
      guineaPigStore.collection.guineaPigs[guineaPigId] = { ...guineaPig }
    }
  }

  // ... rest of existing logic (create session, start game, etc.)
}
```

---

#### endGameSession() - WITH Confirmation Dialog

**New flow with mixed session warning:**

```typescript
// Called from UI button (GameController.vue)
async function handleEndSession(): void {
  if (!petStoreManager.activeGameSession) return

  const guineaPigStore = useGuineaPigStore()

  // Check for mixed session (some favorited, some not)
  const nonFavoritedIds: string[] = []
  const favoritedIds: string[] = []

  for (const id of petStoreManager.activeGameSession.guineaPigIds) {
    const isFavorited = petStoreManager.favoriteGuineaPigs.some(f => f.id === id)
    if (isFavorited) {
      favoritedIds.push(id)
    } else {
      nonFavoritedIds.push(id)
    }
  }

  // CASE: Mixed session - show warning dialog
  if (nonFavoritedIds.length > 0 && favoritedIds.length > 0) {
    const nonFavoritedGuineaPigs = nonFavoritedIds.map(id => {
      const gp = guineaPigStore.getGuineaPig(id)
      return { id, name: gp?.name || 'Unknown' }
    })

    const favoritedGuineaPigs = favoritedIds.map(id => {
      const gp = guineaPigStore.getGuineaPig(id)
      return { id, name: gp?.name || 'Unknown' }
    })

    // Show confirmation dialog
    showMixedSessionDialog.value = true
    mixedSessionData.value = {
      nonFavorited: nonFavoritedGuineaPigs,
      favorited: favoritedGuineaPigs
    }

    // Wait for user response (handled by dialog component)
    return
  }

  // CASE: All favorited OR all non-favorited - proceed directly
  petStoreManager.endGameSession()
}

// Called from dialog "Favorite" button
function handleFavoriteAndEnd(guineaPigIds: string[]): void {
  // Favorite the guinea pigs first
  for (const id of guineaPigIds) {
    if (petStoreManager.canAddToFavorites) {
      petStoreManager.addToFavorites(id)
    }
  }

  // Close dialog
  showMixedSessionDialog.value = false

  // Now end session (all will be favorited)
  petStoreManager.endGameSession()
}

// Called from dialog "End Without Favoriting" button
function handleEndWithoutFavoriting(): void {
  // Close dialog
  showMixedSessionDialog.value = false

  // End session with mixed outcome
  petStoreManager.endGameSession()
}
```

---

#### endGameSession() - Core Logic

**Complete rewrite (called after dialog resolution):**
```typescript
function endGameSession(): void {
  if (!activeGameSession.value) return

  const guineaPigStore = useGuineaPigStore()
  const playerProgression = usePlayerProgression()
  const logging = getLoggingStore()

  let favoritedCount = 0
  let nonFavoritedCount = 0
  const favoritedNames: string[] = []
  const removedNames: string[] = []

  // Process each guinea pig
  for (const id of activeGameSession.value.guineaPigIds) {
    const gp = guineaPigStore.getGuineaPig(id)
    if (!gp) continue

    // Reset needs regardless of outcome
    guineaPigStore.resetGuineaPigNeeds(id)

    // Check if currently in favorites OR was started from favorites
    const isInFavorites = favoriteGuineaPigs.value.some(f => f.id === id)

    if (isInFavorites || gp.wasFromFavorites) {
      // COMMITTED - Return to favorites
      favoritedCount++
      favoritedNames.push(gp.name)

      // Update or add to favorites
      const favIndex = favoriteGuineaPigs.value.findIndex(f => f.id === id)
      if (favIndex !== -1) {
        favoriteGuineaPigs.value[favIndex] = gp  // Update existing
      } else {
        favoriteGuineaPigs.value.push(gp)  // Add new
      }
    } else {
      // NOT COMMITTED - Permanently remove (rehomed)
      nonFavoritedCount++
      removedNames.push(gp.name)

      // Remove from guinea pig collection
      delete guineaPigStore.collection.guineaPigs[id]

      // Remove from available pool if present
      availableGuineaPigs.value = availableGuineaPigs.value.filter(g => g.id !== id)
    }
  }

  // Calculate fee based on commitment
  let fee = 0
  if (nonFavoritedCount > 0 && favoritedCount === 0) {
    fee = settings.value.endGameReturnFee  // Full abandonment: $50
  } else if (nonFavoritedCount > 0 && favoritedCount > 0) {
    fee = Math.floor(settings.value.endGameReturnFee / 2)  // Partial: $25
  }
  // All favorited: fee = 0 (collection management)

  // Charge fee if applicable
  if (fee > 0) {
    playerProgression.deductCurrency(fee, 'abandon_guinea_pigs')
  }

  // Logging messages
  if (favoritedNames.length > 0) {
    logging.addPlayerAction(
      `${favoritedNames.join(' & ')} are resting in your favorites. All progress saved! ✨`,
      '✨',
      { returnedToFavorites: true, savedProgress: true }
    )
  }

  if (removedNames.length > 0) {
    logging.addPlayerAction(
      `${removedNames.join(' & ')} have been rehomed. You didn't favorite them in time 💔`,
      '💔',
      { permanentlyRemoved: true, abandonmentFee: fee, names: removedNames }
    )
  }

  // Common cleanup
  guineaPigStore.setActivePair([])
  const needsController = useNeedsController()
  needsController.pauseProcessing()

  const duration = Date.now() - activeGameSession.value.startedAt
  playerProgression.addPlayTime(duration)

  activeGameSession.value = null
}
```

---

#### refreshPetStore()

**Updated logic:**
```typescript
function refreshPetStore(isAutoRefresh: boolean = false): void {
  if (!isAutoRefresh && !canRefreshPetStore.value) {
    const logging = getLoggingStore()
    logging.logWarn('Manual refresh disabled - toggle "Allow Unlimited Refresh" to enable')
    return
  }

  const now = Date.now()
  const timeSinceLastRefresh = now - settings.value.lastManualRefreshTime
  const twentyFourHours = 86400000

  // Reset cost if 24 hours passed OR auto-refresh
  if (isAutoRefresh || timeSinceLastRefresh >= twentyFourHours) {
    settings.value.currentRefreshIndex = 0  // Reset to $100
  }

  // Get current cost from sequence
  const sequence = settings.value.refreshCostSequence
  const currentCost = sequence[settings.value.currentRefreshIndex]
  const playerProgression = usePlayerProgression()

  // Charge and escalate
  if (!isAutoRefresh) {
    playerProgression.deductCurrency(currentCost, 'pet_store_refresh')
    settings.value.lastManualRefreshTime = now

    // Move to next cost in sequence (capped at end)
    settings.value.currentRefreshIndex = Math.min(
      settings.value.currentRefreshIndex + 1,
      sequence.length - 1
    )
  }

  // Get next cost for display
  const nextCost = sequence[settings.value.currentRefreshIndex]

  // Preserve active guinea pigs during refresh (existing logic)
  const sessionWasActive = activeGameSession.value !== null
  const activeGuineaPigs: GuineaPig[] = []

  if (sessionWasActive) {
    const guineaPigStore = useGuineaPigStore()
    for (const id of activeGameSession.value!.guineaPigIds) {
      const gp = guineaPigStore.getGuineaPig(id)
      if (gp) {
        activeGuineaPigs.push(gp)
      }
    }
  }

  // Preserve favorites in available list (existing logic)
  const favoritesBackup = [...favoriteGuineaPigs.value]
  const favoriteGuineaPigsInAvailableList: GuineaPig[] = []

  for (const favorite of favoriteGuineaPigs.value) {
    const availableGP = availableGuineaPigs.value.find(gp => gp.id === favorite.id)
    if (availableGP) {
      const isAlreadyInActiveList = activeGuineaPigs.some(gp => gp.id === favorite.id)
      if (!isAlreadyInActiveList) {
        favoriteGuineaPigsInAvailableList.push(availableGP)
      }
    }
  }

  // Generate new random guinea pigs
  const preservedCount = activeGuineaPigs.length + favoriteGuineaPigsInAvailableList.length
  const newGuineaPigsCount = 10 - preservedCount
  const newGuineaPigs: GuineaPig[] = []

  for (let i = 0; i < newGuineaPigsCount; i++) {
    newGuineaPigs.push(generateRandomGuineaPig())
  }

  // Build new available list
  availableGuineaPigs.value = [
    ...activeGuineaPigs,
    ...favoriteGuineaPigsInAvailableList,
    ...newGuineaPigs
  ]

  favoriteGuineaPigs.value = favoritesBackup

  // Reset auto-refresh timer
  if (settings.value.autoRefreshEnabled) {
    nextAutoRefreshTime.value = Date.now() + settings.value.autoRefreshIntervalMs
  }

  // Logging
  const logging = getLoggingStore()
  const refreshType = isAutoRefresh ? 'Auto-refreshed' : 'Refreshed'
  const costMsg = isAutoRefresh
    ? ' (free - cost reset to $100)'
    : ` (cost: $${currentCost}, next: $${nextCost})`

  logging.addPlayerAction(
    `${refreshType} pet store with ${newGuineaPigsCount} new guinea pigs${costMsg} 🔄`,
    '🔄',
    {
      isAutoRefresh,
      costPaid: isAutoRefresh ? 0 : currentCost,
      nextCost: nextCost,
      currentIndex: settings.value.currentRefreshIndex,
      newGuineaPigsGenerated: newGuineaPigsCount,
      favoritesPreserved: favoritesBackup.length,
      sessionPreserved: sessionWasActive
    }
  )
}
```

---

## UI Updates

### PetStoreDebug.vue - Settings Panel

**New sections to add:**

#### 1. Refresh Cost Sequence Display
```vue
<div class="panel panel--compact panel--info mb-4">
  <div class="panel__header">
    <h4>Store Refresh Cost Sequence</h4>
  </div>
  <div class="panel__content">
    <div class="cost-sequence">
      <div
        v-for="(cost, index) in petStoreManager.settings.refreshCostSequence"
        :key="index"
        class="cost-sequence__item"
        :class="{ 'cost-sequence__item--current': index === petStoreManager.settings.currentRefreshIndex }"
      >
        <span class="cost-sequence__number">{{ index + 1 }}.</span>
        <span class="cost-sequence__cost">${{ cost }}</span>
        <Badge
          v-if="index === petStoreManager.settings.currentRefreshIndex"
          variant="primary"
          size="sm"
        >
          Next
        </Badge>
      </div>
    </div>
    <p class="text-xs text-muted mt-3">
      💡 24-hour auto-refresh resets cost back to $100 (free)
    </p>
  </div>
</div>
```

#### 2. Debug Controls
```vue
<!-- Manual Reset Button (Debug) -->
<Button
  @click="() => petStoreManager.settings.currentRefreshIndex = 0"
  variant="tertiary"
  size="sm"
  full-width
  class="mb-4"
>
  Reset Refresh Cost to $100 (Debug)
</Button>
```

#### 3. Return Fee Slider
```vue
<SliderField
  v-model="petStoreManager.settings.endGameReturnFee"
  :min="0"
  :max="200"
  :step="10"
  label="Guinea Pig Return Fee (Abandonment)"
  size="sm"
  prefix="$"
  class="mb-6"
/>
```

#### 4. Info Panel
```vue
<div class="panel panel--compact panel--bordered">
  <div class="panel__content">
    <p class="text-sm text-muted">
      💔 Non-favorited guinea pigs are permanently removed when you end a session.<br>
      ✨ Favorited guinea pigs return safely to your collection.
    </p>
  </div>
</div>
```

---

### GameController.vue - End Session Button

**Enhanced button with dynamic text and tooltips:**

```vue
<Button
  @click="handleEndSession"
  variant="secondary"
  full-width
  :disabled="!petStoreManager.activeGameSession"
  :title="getEndSessionTooltip()"
>
  {{ getEndSessionButtonText() }}
</Button>

<script setup lang="ts">
function getEndSessionButtonText(): string {
  if (!petStoreManager.activeGameSession) {
    return 'End Session'
  }

  const { favoritedCount, nonFavoritedCount } = countSessionFavorites()

  if (nonFavoritedCount > 0 && favoritedCount === 0) {
    return `End & Rehome ($50)`
  } else if (nonFavoritedCount > 0 && favoritedCount > 0) {
    return `End Session ($25)`
  } else {
    return `Save to Favorites (Free)`
  }
}

function getEndSessionTooltip(): string {
  if (!petStoreManager.activeGameSession) {
    return 'No active session'
  }

  const guineaPigStore = useGuineaPigStore()
  const names = activeGameSession.guineaPigIds.map(id => {
    const gp = guineaPigStore.getGuineaPig(id)
    return gp?.name || 'Unknown'
  })

  const { favoritedCount, nonFavoritedCount } = countSessionFavorites()

  if (nonFavoritedCount > 0 && favoritedCount === 0) {
    return `${names.join(' & ')} will be rehomed permanently. You didn't favorite them. ($50 fee)`
  } else if (nonFavoritedCount > 0 && favoritedCount > 0) {
    return `Favorited guinea pigs return to favorites safely. Non-favorited will be rehomed permanently. ($25 fee)`
  } else {
    return `${names.join(' & ')} will return to your favorites. All progress saved! (Free)`
  }
}

function countSessionFavorites() {
  if (!petStoreManager.activeGameSession) {
    return { favoritedCount: 0, nonFavoritedCount: 0 }
  }

  let favoritedCount = 0
  let nonFavoritedCount = 0

  for (const id of petStoreManager.activeGameSession.guineaPigIds) {
    const isFavorited = petStoreManager.favoriteGuineaPigs.some(f => f.id === id)
    if (isFavorited) {
      favoritedCount++
    } else {
      nonFavoritedCount++
    }
  }

  return { favoritedCount, nonFavoritedCount }
}
</script>
```

---

## Integration with Existing Systems

### Guinea Pig Rescue System (System 4)

**Current behavior:** When wellness < 15%, automatic rescue triggers

**Integration with new system:**
- Rescue is **automatic** (not player choice)
- **Favorited guinea pigs:** Return to favorites after treatment
- **Non-favorited guinea pigs:** **Permanently removed** (poor care + abandonment)
- **Rescue fee:** $200 (unchanged)
- **Fresh Start option:** Still available (resets to $1000, preserves slots 1-3)

**Updated rescue message:**
```
"The pet store has intervened due to poor care.
Peanut (favorited) has received treatment and returned to your favorites.
Oreo was not in your favorites and has been rehomed to ensure proper care 💔
Rescue fee: $200"
```

**Why permanent removal?**
- Even though rescue is automatic, poor care has consequences
- Non-favorited guinea pigs show lack of commitment
- Encourages favoriting guinea pigs you care about
- Maintains stakes even in safety net scenario

---

### Favorites System (System 6.9)

**Existing functionality preserved:**
- Up to 10 favorite slots (3 free, 7 purchasable)
- Favorites survive store refreshes
- Can move favorites back to store for selection
- Visual indicators on guinea pig cards

**New integration:**
- **Favorites now protect against permanent loss** (primary value)
- **Session ending is free when all guinea pigs are favorited**
- **Favorites become the "collection" system** (not just preservation)
- **Strategic value increased** (worth purchasing extra slots)

---

## Game Economy Impact

### Currency Flow Analysis

**Earning Potential:**
- Positive interactions: ~$5-20 per action
- Milestones: ~$50-200 per achievement
- Long game sessions: ~$100-300 total earnings
- Average session (4-6 hours): ~$200-400 net

**Spending Requirements:**
- Session abandonment: $50 (or $25 mixed)
- Store refresh escalation: $100, $300, $500, $800, $1,600, $3,200
- Favorite slots 4-10: $50, $100, $200, $400, $800, $1,600, $3,200 (total: $6,350)
- Items for guinea pigs: Variable

**Economic Pressure:**
- **Early game:** Store refreshes affordable ($100-$300), encourages exploration
- **Mid game:** Focus shifts to favorites and items, refresh becomes expensive
- **Late game:** Large favorites collection, rarely need refreshes
- **Rescue scenarios:** $200 rescue fee is significant but not devastating

**Strategic Play:**
- Patience pays off (24h free refresh)
- Favorites are investment protection
- Abandonment is costly but not catastrophic
- Multiple refreshes severely punishing (as intended)

---

## Player Experience Flow

### Ideal Progression

**Phase 1: Discovery (Early Game)**
1. Adopt guinea pigs from store ($0)
2. Play with them, learn preferences, build friendship
3. Decide which ones to favorite (commitment)
4. Earn currency through positive interactions (~$200-400 per session)
5. Refresh store once or twice if needed ($100-$300 total)

**Phase 2: Collection Building (Mid Game)**
1. Maintain favorites with high friendship
2. Purchase items for specific guinea pigs
3. Build bonds between paired guinea pigs
4. Teach skills to favorites
5. Purchase additional favorite slots (slots 4-7)
6. Occasionally refresh store for new relationships (expensive but possible)

**Phase 3: Mastery (Late Game)**
1. Large collection of beloved favorites (8-10 slots)
2. All favorites maxed: friendship, preferences known, bonded, skilled
3. Swap between favorites freely for different experiences
4. Currency sustains gameplay through positive interactions
5. Rarely need store refresh (have excellent collection)

---

### Mistake Recovery

**Bad Scenario 1: Abandoned Guinea Pigs**
- Player ends session without favoriting → $50 fee + permanent removal
- **Lesson:** Should have favorited them before ending
- **Recovery:** Can still refresh store ($100) to find new guinea pigs
- **Not devastating:** One mistake doesn't break the game

**Bad Scenario 2: Excessive Refreshing**
- Player refreshes 5 times in one day → $100 + $300 + $500 + $800 + $1,600 = $3,300
- **Lesson:** Should work with available guinea pigs or wait 24 hours
- **Recovery:** Can still earn currency through gameplay, wait for 24h reset
- **Expensive:** Severely punishing (as intended)

**Bad Scenario 3: Poor Care Leading to Rescue**
- Player neglects guinea pigs → automatic rescue → $200 fee + non-favorited removed
- **Lesson:** Take better care OR favorite them for protection
- **Recovery:** Fresh Start available if stuck ($1,000, lose slots 4-10)
- **Safety net:** Can't be permanently stuck

---

## Testing Plan

### Unit Tests

**Session Ending Logic:**
- [ ] Test ending with all non-favorited guinea pigs (fee = $50, permanent removal)
- [ ] Test ending with all favorited guinea pigs (fee = $0, return to favorites)
- [ ] Test ending with mixed session (fee = $25, split outcomes)
- [ ] Verify friendship/progress preserved for favorited guinea pigs
- [ ] Verify complete removal of non-favorited guinea pigs

**Store Refresh Logic:**
- [ ] Test cost escalation sequence ($100 → $300 → $500 → $800 → $1,600 → $3,200)
- [ ] Test cost capping at $3,200
- [ ] Test 24-hour reset to $100
- [ ] Test auto-refresh resets cost to $100
- [ ] Verify new guinea pigs generated correctly

**Integration:**
- [ ] Test rescue with mixed favorites/non-favorites
- [ ] Test Fresh Start preserves favorites in slots 1-3
- [ ] Test favorites survive store refresh

---

### Manual Testing Checklist

**Session Ending:**
- [ ] Start session with store guinea pig, don't favorite, end → Check $50 fee, guinea pig removed
- [ ] Start session with store guinea pig, favorite during play, end → Check $0 fee, returns to favorites
- [ ] Start session with favorite guinea pig, end → Check $0 fee, returns to favorites
- [ ] Start session with 1 favorite + 1 non-favorite, end → Check $25 fee, split outcomes
- [ ] Verify favorited guinea pigs retain friendship, preferences, bonds
- [ ] Verify non-favorited guinea pigs completely removed

**Store Refresh:**
- [ ] Refresh store manually 6 times in a row → Check costs: $100, $300, $500, $800, $1,600, $3,200
- [ ] Verify 7th refresh costs $3,200 (capped)
- [ ] Wait 24 hours (or adjust system clock) → Check cost resets to $100
- [ ] Trigger auto-refresh → Check cost resets to $100 and refresh is free
- [ ] Verify debug button resets cost to $100

**UI Verification:**
- [ ] End session button shows correct text/fee based on favorites status
- [ ] Tooltip shows correct information about outcomes
- [ ] Refresh cost sequence displays correctly in PetStoreDebug
- [ ] Current refresh cost highlighted in sequence
- [ ] Activity feed shows correct messages for all scenarios

---

## Success Criteria

**Core Mechanics:**
- ✅ Non-favorited guinea pigs are permanently removed when session ends
- ✅ Favorited guinea pigs return safely to favorites
- ✅ Store refresh costs escalate according to sequence
- ✅ 24-hour auto-refresh is free and resets cost
- ✅ Mixed sessions charge half fee

**Player Experience:**
- ✅ Favorites system feels valuable (protection from loss)
- ✅ Store refreshing feels strategic (not casual)
- ✅ Abandonment has real emotional weight
- ✅ Can recover from mistakes without being stuck
- ✅ Long-term collection building is rewarding

**Economy Balance:**
- ✅ Early game refreshes accessible
- ✅ Late game refreshes prohibitively expensive
- ✅ Earnings sustain gameplay without grinding
- ✅ Favorites slots worth purchasing
- ✅ Rescue system provides safety net

---

## Future Enhancements

**Potential Additions (Out of Scope for Initial Implementation):**

1. **Adoption History Tracking**
   - Track how many times player has abandoned guinea pigs
   - Could affect reputation or unlock special events

2. **"Second Chance" Mechanic**
   - One-time ability to undo an abandonment
   - Expensive ($200-500) but prevents permanent loss

3. **Store Manager Relationship**
   - Build relationship with pet store over time
   - Could unlock discounts on refreshes or early warnings

4. **Guinea Pig Memories**
   - Favorited guinea pigs could have memories of past sessions
   - Unlock special interactions or dialogue

5. **Collection Showcase**
   - Visual display of your favorites collection
   - Stats showing longest relationships, highest friendships

---

## Related Systems

- **[System 6.5: Pet Store & Game Session Manager](system-6.5-pet-store-manager.md)** - Base system being enhanced
- **[System 6.9: Guinea Pig Favorites](system-6.9-guinea-pig-favorites.md)** - Primary integration point
- **[System 4: Guinea Pig Rescue](../phase2.5/system-4-guinea-pig-rescue.md)** - Safety net integration

---

## Implementation Checklist

### Phase 1: Core Logic (petStoreManager.ts)
- [ ] Update PetStoreSettings interface with new fields
- [ ] Add refreshCostSequence, currentRefreshIndex, endGameReturnFee
- [ ] Update GuineaPig interface with wasFromFavorites field
- [ ] Modify startGameSession() to track origin
- [ ] Rewrite endGameSession() with three outcome logic
- [ ] Update refreshPetStore() with escalating costs
- [ ] Add helper functions for cost calculation
- [ ] Update persistence configuration

### Phase 2: UI Updates
- [ ] Update PetStoreDebug.vue with cost sequence display
- [ ] Add debug reset button for refresh cost
- [ ] Add return fee slider
- [ ] Add info panel explaining system
- [ ] Update GameController.vue end session button
- [ ] Add dynamic button text based on favorites
- [ ] Add detailed tooltips explaining outcomes
- [ ] Style cost sequence display

### Phase 3: Integration & Testing
- [ ] Update rescue system integration
- [ ] Test all session ending scenarios
- [ ] Test refresh cost escalation
- [ ] Test 24-hour reset mechanics
- [ ] Verify favorites preservation
- [ ] Verify permanent removal
- [ ] Manual testing of all UI elements
- [ ] Economy balance verification

### Phase 4: Documentation & Polish
- [ ] Update PROJECT_PLAN.md
- [ ] Update DEVELOPMENT_PHASES.md
- [ ] Add to SYSTEM_INTEGRATION.md
- [ ] Write testing guide
- [ ] Create player-facing documentation (if needed)
- [ ] Polish activity feed messages
- [ ] Final balance adjustments

---

## Notes

**Design Rationale:**
- Permanent removal creates **emotional stakes** without being punishing
- Escalating costs **discourage spam** while allowing strategic refreshes
- Favorites system becomes **primary collection mechanic**
- Economy balanced around **positive play**, not grinding
- Multiple recovery options prevent **stuck states**

**Player Psychology:**
- Loss aversion drives favoriting behavior
- Escalating costs encourage patience
- Free option (24h) always available
- Flexibility with favorites removes anxiety
- Can experiment safely with one slot

**Technical Considerations:**
- No hidden pools or complex tracking needed
- Simpler implementation than alternatives
- Clean separation of concerns
- Persisted state is minimal
- Debug controls for testing

---

## Implementation Summary

**Status:** ✅ **Implemented** (October 11, 2025)

### Files Modified

1. **[src/stores/petStoreManager.ts](../../../src/stores/petStoreManager.ts)**
   - Added `wasFromFavorites` tracking to `GameSession` interface
   - Added `refreshCostSequence` and `currentRefreshIndex` to settings
   - Implemented three-outcome session ending logic (all favorited, none favorited, mixed)
   - Implemented escalating store refresh costs with auto-reset on 24h refresh
   - Added `applyBondBreakingEffects()` function for grief mechanics (placeholder)
   - Added `nextRefreshCost` computed property

2. **[src/components/game/SessionEndingDialog.vue](../../../src/components/game/SessionEndingDialog.vue)** (NEW)
   - Created warning dialog for session ending
   - Shows different messages for all favorited, none favorited, and mixed sessions
   - Provides option to favorite non-favorited guinea pigs before ending
   - Dynamic cost display based on session type

3. **[src/components/debug/GameController.vue](../../../src/components/debug/GameController.vue)**
   - Integrated SessionEndingDialog
   - Updated `handleEndSession()` to open dialog instead of directly ending
   - Added handlers for confirm, cancel, and favorite-non-favorites actions
   - Added End Game Penalty slider to Session Controls panel

4. **[src/components/debug/PetStoreDebug.vue](../../../src/components/debug/PetStoreDebug.vue)**
   - Renamed "Pet Store Settings" to "Refresh Settings"
   - Added visual cost sequence display with badges (past/current/future)
   - Removed "Refresh Count" stat
   - Renamed "Allow Unlimited Refresh" to "No Charge for Refresh"
   - Removed "Enable 24-Hour Auto-Refresh" checkbox (always on)
   - Refresh button now always enabled
   - Moved End Game Penalty slider to GameController

### Key Features Implemented

✅ **Escalating Store Refresh Costs**
- Sequence: $100 → $300 → $500 → $800 → $1,600 → $3,200 (capped)
- Visual indicator showing current position in sequence
- Auto-reset to $100 after 24-hour refresh
- Debug mode to skip charges

✅ **Three Session Ending Outcomes**
- All Favorited: $0 fee, all return to favorites safely
- None Favorited: $100 rescue fee, permanently removed
- Mixed: $50 fee, non-favorites removed, favorites return

✅ **Session Ending Dialog**
- Warning dialog prevents accidental permanent removal
- Option to favorite non-favorited guinea pigs before ending
- Clear messaging about consequences
- Different variants for each session type

✅ **Bonding Effects** (Placeholder)
- `applyBondBreakingEffects()` function ready for future bonding system
- Applies grief mechanics when bonded partners are separated
- Uses relationships as proxy for bond level

### Testing Notes

- All TypeScript checks pass
- Build successful with no errors
- CSS variables corrected to use proper design system tokens
- Components properly integrated with existing systems

### Balance Changes

| Scenario | Old Cost | New Cost |
|----------|----------|----------|
| End session (non-favorited) | $50 | $100 |
| End session (mixed) | N/A | $50 |
| End session (all favorited) | N/A | $0 |
| Store refresh (1st) | $100 | $100 |
| Store refresh (2nd) | $100 | $300 |
| Store refresh (3rd) | $100 | $500 |
| Store refresh (4th+) | $100 | $800/$1,600/$3,200 |
| 24h auto-refresh | Free | Free (resets cost) |

---

**Next Steps:** Manual playtesting to verify economy balance and player experience
