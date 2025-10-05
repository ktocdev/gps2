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
                <div class="favorites-panel__badges">
                  <Badge v-if="isGuineaPigActive(favorite.id)" variant="info" size="sm">ACTIVE</Badge>
                  <Badge variant="warning" size="sm">⭐ Favorite</Badge>
                  <Badge
                    v-if="shouldShowRarityBadge(favorite.breed)"
                    :variant="getRarityBadgeVariant(favorite.breed)"
                    size="sm"
                  >
                    {{ getRarityBadgeText(favorite.breed) }}
                  </Badge>
                </div>
              </div>
              <div class="favorites-panel__details">
                <span class="favorites-panel__breed">{{ favorite.breed }}</span>
                <div class="favorites-panel__appearance">
                  <Badge variant="secondary" size="sm">{{ capitalize(favorite.appearance.furColor) }}</Badge>
                  <Badge variant="secondary" size="sm">{{ capitalize(favorite.appearance.furPattern) }}</Badge>
                </div>
              </div>
              <Button
                @click="handleMoveToStore(favorite.id, favorite.name)"
                :disabled="isGuineaPigActive(favorite.id)"
                :title="isGuineaPigActive(favorite.id) ? 'Cannot move active guinea pig' : 'Move to available store'"
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

    <!-- Move to Store Confirmation Dialog -->
    <ConfirmDialog
      v-model="showMoveDialog"
      title="Move to Store?"
      :message="`Move ${selectedGuineaPigName} from favorites back to the pet store? You can add them back to favorites later if a slot is available.`"
      confirm-text="Move to Store"
      cancel-text="Cancel"
      variant="primary"
      @confirm="confirmMoveToStore"
      @cancel="cancelMoveToStore"
    />

    <!-- Purchase Slot Dialog -->
    <ConfirmDialog
      v-model="showPurchaseDialog"
      title="Purchase Favorite Slot"
      confirm-text="Confirm Purchase"
      cancel-text="Cancel"
      variant="primary"
      :close-on-backdrop="false"
      @confirm="handlePurchaseSlot"
    >
      <div class="favorites-panel__upgrade-content">
        <p>Purchase an additional favorite slot to save more guinea pigs?</p>

        <div class="favorites-panel__upgrade-info">
          <div class="favorites-panel__upgrade-row">
            <span class="favorites-panel__upgrade-label">Current Slots:</span>
            <span class="favorites-panel__upgrade-value">{{ currentSlots }}</span>
          </div>
          <div class="favorites-panel__upgrade-row">
            <span class="favorites-panel__upgrade-label">New Total:</span>
            <span class="favorites-panel__upgrade-value">{{ newSlots }}</span>
          </div>
          <div class="favorites-panel__upgrade-row favorites-panel__upgrade-row--cost">
            <span class="favorites-panel__upgrade-label">Cost:</span>
            <span class="favorites-panel__upgrade-value">{{ formattedSlotCost }}</span>
          </div>
          <div class="favorites-panel__upgrade-row">
            <span class="favorites-panel__upgrade-label">Balance After:</span>
            <span class="favorites-panel__upgrade-value">{{ formattedBalance }}</span>
          </div>
        </div>

        <p v-if="insufficientFunds" class="favorites-panel__upgrade-warning">
          ⚠️ Insufficient funds for this purchase
        </p>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { usePlayerProgression } from '../../stores/playerProgression'
import Button from '../basic/Button.vue'
import Badge from '../basic/Badge.vue'
import ConfirmDialog from '../basic/dialogs/ConfirmDialog.vue'

const petStoreManager = usePetStoreManager()
const playerProgression = usePlayerProgression()

const showMoveDialog = ref(false)
const showPurchaseDialog = ref(false)
const selectedGuineaPigId = ref<string | null>(null)
const selectedGuineaPigName = ref<string>('')

const favorites = computed(() => petStoreManager.favoriteGuineaPigs)
const favoriteCount = computed(() => favorites.value.length)
const maxSlots = computed(() => petStoreManager.maxFavoriteSlots)
const emptySlots = computed(() => maxSlots.value - favoriteCount.value)
const canPurchaseMoreSlots = computed(() => maxSlots.value < 10)

const currentSlots = computed(() => petStoreManager.maxFavoriteSlots)
const newSlots = computed(() => currentSlots.value + 1)
const cost = computed(() => playerProgression.nextFavoriteSlotCost)
const formattedSlotCost = computed(() => `$${cost.value.toLocaleString()}`)
const formattedBalance = computed(() => {
  const balance = playerProgression.currency - cost.value
  return `$${balance.toLocaleString()}`
})
const canAffordSlot = computed(() => playerProgression.canAffordFavoriteSlot)
const insufficientFunds = computed(() => !canAffordSlot.value)

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function isGuineaPigActive(guineaPigId: string): boolean {
  return petStoreManager.activeGameSession?.guineaPigIds.includes(guineaPigId) ?? false
}

function handleMoveToStore(guineaPigId: string, guineaPigName: string): void {
  selectedGuineaPigId.value = guineaPigId
  selectedGuineaPigName.value = guineaPigName
  showMoveDialog.value = true
}

function confirmMoveToStore(): void {
  if (selectedGuineaPigId.value) {
    petStoreManager.moveFromFavoritesToStore(selectedGuineaPigId.value)
  }
  selectedGuineaPigId.value = null
  selectedGuineaPigName.value = ''
}

function cancelMoveToStore(): void {
  selectedGuineaPigId.value = null
  selectedGuineaPigName.value = ''
}

function handlePurchaseSlot(): void {
  if (playerProgression.purchaseFavoriteSlot()) {
    showPurchaseDialog.value = false
  }
}

// Rarity badge helpers
function getBreedRarity(breed: string): string {
  return petStoreManager.getRarity(breed, petStoreManager.weightedBreeds) ?? 'common'
}

function shouldShowRarityBadge(breed: string): boolean {
  const rarity = getBreedRarity(breed)
  return rarity === 'very-rare' || rarity === 'ultra-rare'
}

function getRarityBadgeVariant(breed: string): 'warning' | 'primary' | 'secondary' {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'warning'
  if (rarity === 'very-rare') return 'primary'
  return 'secondary'
}

function getRarityBadgeText(breed: string): string {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'ULTRA RARE'
  if (rarity === 'very-rare') return 'VERY RARE'
  return ''
}
</script>

<style>
/* Favorites Panel Component - BEM Methodology */

.favorites-panel {
  margin-block-end: var(--space-6);
}

/* Panel Header Customization */
.favorites-panel .panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.favorites-panel__slot-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Vertical Layout */
.favorites-panel__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Item Base */
.favorites-panel__item {
  padding: var(--space-4);
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
  border: 2px solid var(--color-border-medium);
}

/* Filled Item */
.favorites-panel__item--filled {
  background-color: var(--color-bg-secondary);
}

/* Empty Item */
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

/* Guinea Pig Card */
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
  color: var(--color-text-primary);
}

.favorites-panel__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.favorites-panel__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.favorites-panel__breed {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.favorites-panel__appearance {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* Footer Warning */
.favorites-panel__warning {
  margin-block-start: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-error);
  text-align: center;
  margin-block-end: 0;
}

/* Upgrade Dialog Content */
.favorites-panel__upgrade-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.favorites-panel__upgrade-content p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.favorites-panel__upgrade-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-start-start-radius: var(--radius-base);
  border-start-end-radius: var(--radius-base);
  border-end-start-radius: var(--radius-base);
  border-end-end-radius: var(--radius-base);
}

.favorites-panel__upgrade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorites-panel__upgrade-row--cost {
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--color-border-medium);
  font-weight: var(--font-weight-semibold);
}

.favorites-panel__upgrade-label {
  color: var(--color-text-muted);
}

.favorites-panel__upgrade-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.favorites-panel__upgrade-warning {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
  margin: 0;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .favorites-panel__grid {
    grid-template-columns: 1fr;
  }

  .favorites-panel .panel__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Tablet Responsiveness */
@media (min-width: 641px) and (max-width: 1024px) {
  .favorites-panel__grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>