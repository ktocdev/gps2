# Guinea Pig Favorites System - System Documentation

**Phase:** Phase 2 (Pet Store & Session Management)
**Status:** 📋 Ready for Implementation
**System Number:** 6.75
**Prerequisites:** Pet Store & Game Session Manager (System 6.5) ✅
**Created:** September 28, 2025

## Overview

A favorites system allowing players to save beloved guinea pigs permanently. Players can save up to 3 favorites initially (expandable via purchase) and move them back to the pet store when desired. Favorites are protected from pet store refresh cycles, providing emotional attachment benefits while maintaining the core pet store refresh mechanics.

## Core Concepts

**Favorites Model:**
- Players can save up to 3 guinea pigs to favorites initially
- Maximum of 10 favorite slots (purchasable upgrades)
- Favorites survive pet store refresh cycles
- Favorites can be moved back to store for game selection
- Each additional slot has escalating cost

**Progression Integration:**
- Currency-based slot purchases (100, 250, 625, 1,563...)
- Slot upgrades persist across game sessions
- Maximum 10 total slots to prevent collection bloat
- Activity logging for slot purchases

**User Experience:**
- Heart/star icon on guinea pig cards
- Visual favorites section above main store
- Clear slot indicators (filled/empty)
- "Move to Store" functionality for flexibility

## System Architecture

### 1. PetStoreManager Store Extension (`src/stores/petStoreManager.ts`)

**State Additions:**

```typescript
interface PetStoreState {
  // Existing fields...
  favoriteGuineaPigs: GuineaPig[]
  maxFavoriteSlots: number  // Starts at 3, purchasable up to 10
}
```

**New Computed Properties:**

```typescript
const favoriteCount = computed(() => favoriteGuineaPigs.value.length)
const availableFavoriteSlots = computed(() =>
  maxFavoriteSlots.value - favoriteCount.value
)
const canAddToFavorites = computed(() =>
  favoriteCount.value < maxFavoriteSlots.value
)
const canPurchaseMoreSlots = computed(() =>
  maxFavoriteSlots.value < 10
)
```

**New Methods:**

```typescript
function addToFavorites(guineaPigId: string): boolean {
  // Validate guinea pig exists in available pool
  const guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
  if (!guineaPig) return false

  // Check slot availability
  if (!canAddToFavorites.value) {
    getLoggingStore().logWarning('No available favorite slots')
    return false
  }

  // Remove from available pool
  availableGuineaPigs.value = availableGuineaPigs.value.filter(
    gp => gp.id !== guineaPigId
  )

  // Add to favorites
  favoriteGuineaPigs.value.push({
    ...guineaPig,
    favoritedAt: Date.now()
  })

  getLoggingStore().addPlayerAction(
    `Added ${guineaPig.name} to favorites ⭐`,
    '⭐',
    { guineaPigId, name: guineaPig.name }
  )

  return true
}

function removeFromFavorites(guineaPigId: string): boolean {
  const index = favoriteGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
  if (index === -1) return false

  const guineaPig = favoriteGuineaPigs.value[index]

  // Remove from favorites
  favoriteGuineaPigs.value.splice(index, 1)

  getLoggingStore().addPlayerAction(
    `Removed ${guineaPig.name} from favorites`,
    '💔',
    { guineaPigId, name: guineaPig.name }
  )

  return true
}

function moveFromFavoritesToStore(guineaPigId: string): boolean {
  const index = favoriteGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
  if (index === -1) return false

  const guineaPig = favoriteGuineaPigs.value[index]

  // Remove from favorites
  favoriteGuineaPigs.value.splice(index, 1)

  // Add to available pool
  availableGuineaPigs.value.push(guineaPig)

  getLoggingStore().addPlayerAction(
    `Moved ${guineaPig.name} from favorites to store 🏪`,
    '🏪',
    { guineaPigId, name: guineaPig.name }
  )

  return true
}
```

**Store Refresh Protection:**

```typescript
function refreshPetStore(): void {
  if (!canRefreshPetStore.value) {
    getLoggingStore().logWarning('Pet store refresh on cooldown')
    return
  }

  // End any active session before refreshing
  if (activeGameSession.value) {
    endGameSession()
  }

  // Preserve favorites during refresh (key feature!)
  const favoritesBackup = [...favoriteGuineaPigs.value]

  generateRandomGuineaPigs(10)
  lastRefreshTimestamp.value = Date.now()

  // Restore favorites
  favoriteGuineaPigs.value = favoritesBackup

  getLoggingStore().addPlayerAction(
    'Refreshed pet store with new guinea pigs 🔄',
    '🔄',
    { favoritesPreserved: favoritesBackup.length }
  )
}
```

### 2. PlayerProgression Store Integration (`src/stores/playerProgression.ts`)

**State Additions:**

```typescript
interface PlayerProgression {
  // Existing fields...
  favoriteSlotsPurchased: number  // Additional slots beyond initial 3
}
```

**Slot Cost Calculation:**

```typescript
function getFavoriteSlotCost(nextSlotNumber: number): number {
  // Slots 1-3 are free (initial)
  // Slot 4: $100
  // Slot 5: $250
  // Slot 6: $625
  // Slot 7: $1,563
  // Slot 8: $3,906
  // Slot 9: $9,766
  // Slot 10: $24,414

  if (nextSlotNumber <= 3) return 0

  const baseCost = 100
  const slotIndex = nextSlotNumber - 4
  const cost = Math.floor(baseCost * Math.pow(2.5, slotIndex))

  return cost
}

const nextFavoriteSlotCost = computed(() => {
  const petStoreManager = usePetStoreManager()
  const nextSlot = petStoreManager.maxFavoriteSlots + 1
  return getFavoriteSlotCost(nextSlot)
})

const canAffordFavoriteSlot = computed(() => {
  return currency.value >= nextFavoriteSlotCost.value
})
```

**Purchase Method:**

```typescript
function purchaseFavoriteSlot(): boolean {
  const petStoreManager = usePetStoreManager()

  // Validate max slots not reached
  if (petStoreManager.maxFavoriteSlots >= 10) {
    getLoggingStore().logWarning('Maximum favorite slots already purchased')
    return false
  }

  const cost = nextFavoriteSlotCost.value

  // Validate currency
  if (currency.value < cost) {
    getLoggingStore().logWarning('Insufficient currency for favorite slot purchase')
    return false
  }

  // Deduct currency
  deductCurrency(cost, 'favorite_slot_purchase')

  // Increase max slots
  petStoreManager.maxFavoriteSlots++
  favoriteSlotsPurchased.value++

  getLoggingStore().addPlayerAction(
    `Purchased favorite slot #${petStoreManager.maxFavoriteSlots} for $${cost} 🎁`,
    '🎁',
    { slotNumber: petStoreManager.maxFavoriteSlots, cost }
  )

  return true
}
```

### 3. UI Components

#### A. FavoritesPanel Component (`src/components/petstore/FavoritesPanel.vue`)

**Purpose:** Display favorite guinea pigs with management controls

**Features:**
- Grid display of favorite guinea pigs
- Empty slot indicators
- "Move to Store" button for each favorite
- "Purchase More Slots" button when available
- Slot count display (e.g., "3/3 slots filled" or "2/5 slots")

**Template Structure:**

```vue
<template>
  <div class="favorites-panel">
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Favorite Guinea Pigs</h3>
        <span class="favorites-panel__slot-count">
          {{ favoriteCount }}/{{ maxSlots }} slots
        </span>
      </div>

      <div class="panel__content">
        <div class="favorites-panel__grid">
          <!-- Filled slots -->
          <div
            v-for="favorite in favorites"
            :key="favorite.id"
            class="favorites-panel__item favorites-panel__item--filled"
          >
            <div class="favorites-panel__guinea-pig">
              <div class="favorites-panel__header">
                <span class="favorites-panel__name">{{ favorite.name }}</span>
                <Badge variant="warning" size="sm">⭐ Favorite</Badge>
              </div>
              <div class="favorites-panel__details">
                <span class="favorites-panel__breed">{{ favorite.breed }}</span>
                <div class="favorites-panel__appearance">
                  <Badge variant="secondary" size="sm">{{ favorite.appearance.furColor }}</Badge>
                  <Badge variant="secondary" size="sm">{{ favorite.appearance.furPattern }}</Badge>
                </div>
              </div>
              <Button
                @click="handleMoveToStore(favorite.id)"
                variant="secondary"
                size="sm"
                full-width
              >
                Move to Store
              </Button>
            </div>
          </div>

          <!-- Empty slots -->
          <div
            v-for="n in emptySlots"
            :key="`empty-${n}`"
            class="favorites-panel__item favorites-panel__item--empty"
          >
            <div class="favorites-panel__empty-slot">
              <span class="favorites-panel__empty-icon">⭐</span>
              <span class="favorites-panel__empty-text">Empty Slot</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canPurchaseMoreSlots" class="panel__footer">
        <Button
          @click="showPurchaseDialog = true"
          :disabled="!canAffordSlot"
          variant="primary"
          full-width
        >
          Buy More Slots ({{ formattedSlotCost }})
        </Button>
        <p v-if="!canAffordSlot" class="favorites-panel__warning">
          Insufficient funds
        </p>
      </div>
    </div>

    <FavoriteSlotUpgrade
      v-if="showPurchaseDialog"
      @confirm="handlePurchaseSlot"
      @cancel="showPurchaseDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePetStoreManager } from '@/stores/petStoreManager'
import { usePlayerProgression } from '@/stores/playerProgression'
import Button from '@/components/basic/Button.vue'
import Badge from '@/components/basic/Badge.vue'
import FavoriteSlotUpgrade from './FavoriteSlotUpgrade.vue'

const petStoreManager = usePetStoreManager()
const playerProgression = usePlayerProgression()

const showPurchaseDialog = ref(false)

const favorites = computed(() => petStoreManager.favoriteGuineaPigs)
const favoriteCount = computed(() => favorites.value.length)
const maxSlots = computed(() => petStoreManager.maxFavoriteSlots)
const emptySlots = computed(() => maxSlots.value - favoriteCount.value)
const canPurchaseMoreSlots = computed(() => maxSlots.value < 10)
const formattedSlotCost = computed(() =>
  `$${playerProgression.nextFavoriteSlotCost}`
)
const canAffordSlot = computed(() =>
  playerProgression.canAffordFavoriteSlot
)

function handleMoveToStore(guineaPigId: string): void {
  petStoreManager.moveFromFavoritesToStore(guineaPigId)
}

function handlePurchaseSlot(): void {
  if (playerProgression.purchaseFavoriteSlot()) {
    showPurchaseDialog.value = false
  }
}
</script>

<style>
.favorites-panel {
  margin-block-end: var(--space-6);
}

.favorites-panel__slot-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.favorites-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-4);
}

.favorites-panel__item {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-medium);
}

.favorites-panel__item--filled {
  background-color: var(--color-bg-secondary);
}

.favorites-panel__item--empty {
  background-color: var(--color-bg-primary);
  border-style: dashed;
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 180px;
}

.favorites-panel__empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.favorites-panel__empty-icon {
  font-size: 2rem;
  opacity: 0.3;
}

.favorites-panel__empty-text {
  font-size: var(--font-size-sm);
  font-style: italic;
}

.favorites-panel__guinea-pig {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.favorites-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.favorites-panel__name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.favorites-panel__breed {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-block-end: var(--space-2);
}

.favorites-panel__appearance {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.favorites-panel__warning {
  margin-block-start: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  text-align: center;
}
</style>
```

#### B. FavoriteSlotUpgrade Component (`src/components/petstore/FavoriteSlotUpgrade.vue`)

**Purpose:** Confirmation dialog for purchasing additional favorite slots

```vue
<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal modal--sm">
      <div class="modal__header">
        <h3>Purchase Favorite Slot</h3>
      </div>

      <div class="modal__content">
        <p>Purchase an additional favorite slot to save more guinea pigs?</p>

        <div class="upgrade-info">
          <div class="upgrade-info__item">
            <span class="upgrade-info__label">Current Slots:</span>
            <span class="upgrade-info__value">{{ currentSlots }}</span>
          </div>
          <div class="upgrade-info__item">
            <span class="upgrade-info__label">New Total:</span>
            <span class="upgrade-info__value">{{ newSlots }}</span>
          </div>
          <div class="upgrade-info__item upgrade-info__item--cost">
            <span class="upgrade-info__label">Cost:</span>
            <span class="upgrade-info__value">{{ formattedCost }}</span>
          </div>
          <div class="upgrade-info__item">
            <span class="upgrade-info__label">Balance After:</span>
            <span class="upgrade-info__value">{{ formattedBalance }}</span>
          </div>
        </div>

        <p v-if="insufficientFunds" class="upgrade-warning">
          ⚠️ Insufficient funds for this purchase
        </p>
      </div>

      <div class="modal__footer">
        <Button @click="$emit('cancel')" variant="secondary">
          Cancel
        </Button>
        <Button
          @click="$emit('confirm')"
          :disabled="insufficientFunds"
          variant="primary"
        >
          Confirm Purchase
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePetStoreManager } from '@/stores/petStoreManager'
import { usePlayerProgression } from '@/stores/playerProgression'
import Button from '@/components/basic/Button.vue'

defineEmits<{
  confirm: []
  cancel: []
}>()

const petStoreManager = usePetStoreManager()
const playerProgression = usePlayerProgression()

const currentSlots = computed(() => petStoreManager.maxFavoriteSlots)
const newSlots = computed(() => currentSlots.value + 1)
const cost = computed(() => playerProgression.nextFavoriteSlotCost)
const formattedCost = computed(() => `$${cost.value.toLocaleString()}`)
const formattedBalance = computed(() => {
  const balance = playerProgression.currency - cost.value
  return `$${balance.toLocaleString()}`
})
const insufficientFunds = computed(() =>
  playerProgression.currency < cost.value
)
</script>

<style>
.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-block: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
}

.upgrade-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upgrade-info__item--cost {
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--color-border-medium);
  font-weight: var(--font-weight-semibold);
}

.upgrade-info__label {
  color: var(--color-text-muted);
}

.upgrade-info__value {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.upgrade-warning {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-block-start: var(--space-3);
  text-align: center;
}
</style>
```

#### C. Pet Store Selection Integration

**Modifications to existing PetStoreSelection component:**

1. **Add heart/star button to guinea pig cards:**

```vue
<template>
  <div class="pet-store-selection">
    <!-- Add Favorites Panel above store -->
    <FavoritesPanel v-if="hasFavorites || canAddFavorites" />

    <div class="panel">
      <div class="panel__header">
        <h3>Pet Store ({{ availableCount }} available)</h3>
      </div>

      <div class="panel__content">
        <div class="pet-store-grid">
          <div
            v-for="guineaPig in availableGuineaPigs"
            :key="guineaPig.id"
            class="guinea-pig-card"
          >
            <!-- Guinea pig info -->
            <div class="guinea-pig-card__header">
              <h4>{{ guineaPig.name }}</h4>

              <!-- Add to Favorites button -->
              <button
                v-if="canAddToFavorites"
                @click="handleAddToFavorites(guineaPig.id)"
                class="favorites-button"
                :class="{ 'favorites-button--disabled': !canAddMoreFavorites }"
                :disabled="!canAddMoreFavorites"
                :title="canAddMoreFavorites ? 'Add to favorites' : 'No available favorite slots'"
              >
                <span class="favorites-button__icon">⭐</span>
              </button>
            </div>

            <!-- Rest of guinea pig card content -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePetStoreManager } from '@/stores/petStoreManager'
import FavoritesPanel from './FavoritesPanel.vue'

const petStoreManager = usePetStoreManager()

const availableGuineaPigs = computed(() =>
  petStoreManager.availableGuineaPigs
)
const availableCount = computed(() =>
  availableGuineaPigs.value.length
)
const hasFavorites = computed(() =>
  petStoreManager.favoriteGuineaPigs.length > 0
)
const canAddFavorites = computed(() =>
  petStoreManager.maxFavoriteSlots > 0
)
const canAddMoreFavorites = computed(() =>
  petStoreManager.canAddToFavorites
)

function handleAddToFavorites(guineaPigId: string): void {
  petStoreManager.addToFavorites(guineaPigId)
}
</script>

<style>
.favorites-button {
  background: none;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.4;
  transition: all var(--transition-fast);
}

.favorites-button:hover:not(:disabled) {
  opacity: 1;
  transform: scale(1.1);
}

.favorites-button--disabled {
  cursor: not-allowed;
  opacity: 0.2;
}

.favorites-button__icon {
  display: block;
}
</style>
```

### 4. Debug Panel Integration

**Add to PetStoreDebug.vue:**

```vue
<div class="panel panel--compact">
  <div class="panel__header">
    <h3>Favorites System Debug</h3>
  </div>
  <div class="panel__content">
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Favorite Slots:</span>
        <span class="stat-value">
          {{ petStoreManager.favoriteGuineaPigs.length }}/{{ petStoreManager.maxFavoriteSlots }}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Can Purchase More:</span>
        <span class="stat-value">
          {{ petStoreManager.maxFavoriteSlots < 10 ? 'Yes' : 'No' }}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Next Slot Cost:</span>
        <span class="stat-value">
          ${{ playerProgression.nextFavoriteSlotCost }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-4 mt-4">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="unlimitedFavoriteSlots"
        />
        <span>Unlimited Favorite Slots (Debug)</span>
      </label>

      <Button
        @click="handleForceAddSlot"
        :disabled="petStoreManager.maxFavoriteSlots >= 10"
        full-width
      >
        Force Add Slot (No Cost)
      </Button>

      <Button
        @click="handleClearFavorites"
        :disabled="petStoreManager.favoriteGuineaPigs.length === 0"
        variant="danger"
        full-width
      >
        Clear All Favorites
      </Button>
    </div>
  </div>
</div>
```

## Implementation Steps

### Phase 1: Core Favorites System (2-3 days)

**Tasks:**
1. Extend PetStoreManager Store
   - Add `favoriteGuineaPigs` array to state
   - Add `maxFavoriteSlots` (default: 3) to state
   - Implement `addToFavorites()` method
   - Implement `removeFromFavorites()` method
   - Implement `moveFromFavoritesToStore()` method
   - Update `refreshPetStore()` to preserve favorites
   - Add persistence configuration for favorites

2. Integrate PlayerProgression Store
   - Add `favoriteSlotsPurchased` to state
   - Implement `getFavoriteSlotCost()` calculation
   - Implement `purchaseFavoriteSlot()` method
   - Add `nextFavoriteSlotCost` computed property
   - Add `canAffordFavoriteSlot` computed property
   - Add activity logging for slot purchases

**Deliverables:**
- [ ] Favorites storage in PetStoreManager
- [ ] Favorites preservation during store refresh
- [ ] Slot purchase mechanics in PlayerProgression
- [ ] Cost escalation formula (100, 250, 625...)
- [ ] Activity logging for favorites actions

### Phase 2: UI Components (1-2 days)

**Tasks:**
1. Create FavoritesPanel Component
   - Grid display of favorite guinea pigs
   - Empty slot indicators
   - "Move to Store" buttons
   - "Purchase More Slots" button
   - Slot count display

2. Create FavoriteSlotUpgrade Component
   - Confirmation dialog for slot purchase
   - Cost and balance display
   - Currency validation
   - Confirm/Cancel actions

3. Update PetStoreSelection Component
   - Add heart/star button to guinea pig cards
   - Integrate FavoritesPanel above store grid
   - Handle add to favorites action
   - Disable button when slots full

**Deliverables:**
- [ ] FavoritesPanel component created
- [ ] FavoriteSlotUpgrade dialog component created
- [ ] Pet Store Selection integrated with favorites
- [ ] Heart/star buttons functional
- [ ] Visual feedback for favorites

### Phase 3: Debug & Testing (1 day)

**Tasks:**
1. Debug Panel Integration
   - Add favorites statistics display
   - Add "Unlimited Favorite Slots" toggle
   - Add "Force Add Slot" button
   - Add "Clear All Favorites" button
   - Show next slot cost and affordability

2. Testing & Validation
   - Test adding guinea pigs to favorites
   - Test moving favorites back to store
   - Test store refresh preserves favorites
   - Test slot purchase with sufficient/insufficient funds
   - Test maximum slot limit (10)
   - Test persistence across browser sessions

**Deliverables:**
- [ ] Debug tools for favorites management
- [ ] All test cases passing
- [ ] No bugs or edge cases
- [ ] Persistence verified

## User Experience Flow

### Adding to Favorites:
1. User browses pet store guinea pigs
2. Sees heart/star icon on each card
3. Clicks heart → guinea pig moves to favorites section
4. Favorites section shows guinea pig with "Move to Store" button
5. Empty slot indicator fills, remaining slots show as empty

### Purchasing More Slots:
1. User has all favorite slots filled
2. "Buy More Slots" button appears with cost
3. Clicks button → confirmation dialog opens
4. Dialog shows: current slots, new total, cost, balance after
5. Confirms purchase → currency deducted, slot added
6. New empty slot appears in favorites section
7. Can continue adding favorites

### Moving Favorites to Store:
1. User wants to try different guinea pig
2. Clicks "Move to Store" on favorite guinea pig
3. Guinea pig appears in main store pool
4. Can be selected for game session
5. Favorite slot becomes empty and available
6. Can add different guinea pig to empty slot

## Integration with Existing Systems

### Pet Store Manager
- Favorites stored alongside available guinea pigs
- Refresh logic modified to preserve favorites
- Game session can use favorites or store guinea pigs

### Player Progression
- Currency deduction for slot purchases
- Slot purchase tracking
- Statistics for favorites management

### Guinea Pig Store
- No changes needed (uses same GuineaPig entity)
- Favorites and store guinea pigs use identical structure

## Success Criteria

- [ ] Players can save up to 3 guinea pigs to favorites initially
- [ ] Favorites survive pet store refresh cycles
- [ ] Players can purchase additional slots (up to 10 total)
- [ ] Slot costs escalate appropriately
- [ ] Favorites can be moved back to store for selection
- [ ] Currency validation prevents overspending
- [ ] All functionality persists across browser sessions
- [ ] Debug tools enable effective testing
- [ ] Visual feedback clear and intuitive
- [ ] No bugs or performance issues

## Future Enhancements

- **Favorite Nicknames**: Allow renaming favorite guinea pigs
- **Favorite Notes**: Add personal notes about each favorite
- **Favorite History**: Track adoption history for favorites
- **Auto-Favorite**: Rare guinea pigs auto-favorite on discovery
- **Favorite Bonuses**: Favorites gain small friendship bonus
- **Breeding Integration**: Bred guinea pigs occupy favorite slots
- **Achievement Integration**: Unlock achievements for favorites management
- **Special Slots**: Premium slots with unique benefits

## Expected Outcomes

### Before Implementation:
- ❌ Players lose beloved guinea pigs during store refresh
- ❌ No way to preserve specific guinea pigs
- ❌ Emotional attachment conflicts with experimentation
- ❌ No collection management system

### After Implementation:
- ✅ Players can save beloved guinea pigs permanently
- ✅ Favorites protected from store refresh
- ✅ Emotional attachment benefits maintained
- ✅ Still encourages experimentation with store pool
- ✅ Progression goal through slot purchases
- ✅ Flexible system (can move favorites back to store)
- ✅ Clean UI with clear visual feedback