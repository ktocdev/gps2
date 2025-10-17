<template>
  <div class="inventory-debug">
    <!-- Player Inventory -->
    <div class="panel panel--compact">
      <div class="inventory-debug__header">
        <h2 class="panel__heading">My Inventory</h2>
        <div class="inventory-debug__stats">
          <Badge variant="secondary" size="md">{{ inventoryStore.totalItemCount }} Items</Badge>
          <Badge variant="info" size="md">{{ inventoryStore.allItems.length }} Unique</Badge>
        </div>
      </div>

      <div class="panel__section">
        <div v-if="inventoryStore.allItems.length === 0" class="inventory-debug__empty">
          <p>No items in inventory yet. Visit the store to purchase items!</p>
        </div>

        <div v-else class="inventory-debug__sections">
          <h3 class="panel__subheading">Consumables</h3>
          <div v-if="consumablesWithDetails.length === 0" class="inventory-debug__empty-section">
            <p>No consumables yet</p>
          </div>
          <div v-else class="inventory-debug__grid">
            <div
              v-for="item in consumablesWithDetails"
              :key="item.itemId"
              class="inventory-item-card"
            >
              <div class="inventory-item-card__header">
                <div class="inventory-item-card__name-section">
                  <span class="inventory-item-card__name">{{ item.item?.name }}</span>
                  <span class="inventory-item-card__category">{{ item.item?.category }}</span>
                </div>
                <div class="inventory-item-card__quantity">×{{ item.quantity }}</div>
              </div>

              <div class="inventory-item-card__badges">
                <Badge v-if="inventoryStore.getOpenedCount(item.itemId) > 0" variant="warning" size="sm">
                  Opened: {{ inventoryStore.getOpenedCount(item.itemId) }}
                </Badge>
                <Badge v-if="inventoryStore.getUnopenedCount(item.itemId) > 0" variant="success" size="sm">
                  Unopened: {{ inventoryStore.getUnopenedCount(item.itemId) }}
                </Badge>
                <Badge v-if="inventoryStore.getReturnableQuantity(item.itemId) > 0" variant="info" size="sm">
                  Returnable: {{ inventoryStore.getReturnableQuantity(item.itemId) }}
                </Badge>
              </div>

              <div v-if="item.item?.category === 'hay' || item.item?.category === 'bedding'" class="inventory-item-card__actions">
                <Button
                  v-if="inventoryStore.getUnopenedCount(item.itemId) > 0"
                  @click="markAsOpened(item.itemId)"
                  variant="secondary"
                  size="sm"
                >
                  Open One ({{ inventoryStore.getUnopenedCount(item.itemId) }} unopened)
                </Button>
                <span v-else class="inventory-item-card__note">All items opened - cannot return</span>
              </div>
            </div>
          </div>

          <h3 class="panel__subheading">Habitat Items</h3>
          <div v-if="habitatItemsWithDetails.length === 0" class="inventory-debug__empty-section">
            <p>No habitat items yet</p>
          </div>
          <div v-else class="inventory-debug__grid">
            <div
              v-for="item in habitatItemsWithDetails"
              :key="item.itemId"
              class="inventory-item-card"
            >
              <div class="inventory-item-card__header">
                <div class="inventory-item-card__name-section">
                  <span class="inventory-item-card__name">{{ item.item?.name }}</span>
                  <span class="inventory-item-card__category">{{ item.item?.subCategory }}</span>
                </div>
                <div class="inventory-item-card__quantity">×{{ item.quantity }}</div>
              </div>

              <div class="inventory-item-card__badges">
                <Badge v-if="inventoryStore.getPlacedCount(item.itemId) > 0" variant="info" size="sm">
                  Placed: {{ inventoryStore.getPlacedCount(item.itemId) }}
                </Badge>
                <Badge v-if="inventoryStore.getUnplacedCount(item.itemId) > 0" variant="secondary" size="sm">
                  Unplaced: {{ inventoryStore.getUnplacedCount(item.itemId) }}
                </Badge>
                <Badge v-if="inventoryStore.getReturnableQuantity(item.itemId) > 0" variant="success" size="sm">
                  Returnable: {{ inventoryStore.getReturnableQuantity(item.itemId) }}
                </Badge>
              </div>

              <div class="inventory-item-card__actions">
                <Button
                  @click="markAsPlaced(item.itemId)"
                  variant="secondary"
                  size="sm"
                  :disabled="inventoryStore.getUnplacedCount(item.itemId) === 0"
                >
                  Place One ({{ inventoryStore.getUnplacedCount(item.itemId) }} available)
                </Button>
                <Button
                  v-if="inventoryStore.getPlacedCount(item.itemId) > 0"
                  @click="unmarkAsPlaced(item.itemId)"
                  variant="tertiary"
                  size="sm"
                >
                  Remove One ({{ inventoryStore.getPlacedCount(item.itemId) }} placed)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Currency Controls Panel -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Currency Controls (Debug)</h3>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Current Balance:</span>
            <span class="stat-value">{{ playerProgression.formattedCurrency }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Earned:</span>
            <span class="stat-value">{{ playerProgression.formattedTotalEarned }}</span>
          </div>
        </div>

        <hr class="divider">

        <div class="form-field-block mb-4">
          <label class="form-label" for="currency-amount">Currency Amount</label>
          <input
            id="currency-amount"
            type="number"
            v-model.number="currencyAmount"
            class="input input--sm"
            placeholder="Enter amount"
            min="1"
            max="10000"
            step="1"
          />
        </div>

        <div class="controls-grid controls-grid--compact">
          <Button
            @click="addCurrency"
            variant="primary"
            size="sm"
            :disabled="!isValidAmount"
          >
            Add Currency
          </Button>
          <Button
            @click="deductCurrency"
            variant="danger"
            size="sm"
            :disabled="!isValidAmount"
          >
            Deduct Currency
          </Button>
        </div>

        <hr class="divider">

        <div class="form-label mb-2">Quick Actions</div>
        <div class="controls-grid controls-grid--compact">
          <Button
            @click="addQuickAmount(100)"
            variant="secondary"
            size="sm"
          >
            +$100
          </Button>
          <Button
            @click="addQuickAmount(500)"
            variant="secondary"
            size="sm"
          >
            +$500
          </Button>
          <Button
            @click="addQuickAmount(1000)"
            variant="secondary"
            size="sm"
          >
            +$1000
          </Button>
          <Button
            @click="resetCurrency"
            variant="tertiary"
            size="sm"
          >
            Reset to $1000
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import Button from '../basic/Button.vue'
import Badge from '../basic/Badge.vue'

const playerProgression = usePlayerProgression()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

// Migrate old inventory data on mount
onMounted(() => {
  inventoryStore.migrateOldData()
})

// Get inventory items with details
const consumablesWithDetails = computed(() => {
  return inventoryStore.consumables.map((invItem) => ({
    ...invItem,
    item: suppliesStore.getItemById(invItem.itemId)
  }))
})

const habitatItemsWithDetails = computed(() => {
  return inventoryStore.habitatItems.map((invItem) => ({
    ...invItem,
    item: suppliesStore.getItemById(invItem.itemId)
  }))
})

const currencyAmount = ref<number>(100)

const isValidAmount = computed(() => {
  return currencyAmount.value > 0 && Number.isInteger(currencyAmount.value)
})

const addCurrency = () => {
  if (isValidAmount.value) {
    playerProgression.updateCurrency(currencyAmount.value)
  }
}

const deductCurrency = () => {
  if (isValidAmount.value) {
    playerProgression.deductCurrency(currencyAmount.value, 'debug_deduction')
  }
}

const addQuickAmount = (amount: number) => {
  playerProgression.updateCurrency(amount)
}

const resetCurrency = () => {
  const currentBalance = playerProgression.currency
  const resetAmount = 1000 - currentBalance
  playerProgression.updateCurrency(resetAmount)
}

const markAsOpened = (itemId: string) => {
  inventoryStore.markAsOpened(itemId)
}

const markAsPlaced = (itemId: string) => {
  inventoryStore.markAsPlacedInHabitat(itemId, 1)
}

const unmarkAsPlaced = (itemId: string) => {
  inventoryStore.unmarkAsPlacedInHabitat(itemId, 1)
}
</script>

<style>
.inventory-debug {
  container-type: inline-size;
  container-name: inventory-debug;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.inventory-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  flex-wrap: wrap;
}

.inventory-debug__header .panel__heading {
  margin-block-end: 0;
}

.inventory-debug__stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.inventory-debug__empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
}

.inventory-debug__sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.inventory-debug__empty-section {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.inventory-debug__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-block-start: var(--space-3);
}

/* Inventory Item Card Styles - Different from Supply Item Card */
.inventory-item-card {
  padding: var(--space-3);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: all 0.2s ease;
}

.inventory-item-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.inventory-item-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.inventory-item-card__name-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.inventory-item-card__name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.inventory-item-card__category {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inventory-item-card__quantity {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  color: var(--color-secondary);
  flex-shrink: 0;
}

.inventory-item-card__badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.inventory-item-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-block-start: var(--space-2);
  padding-block-start: var(--space-2);
  border-block-start: 1px solid var(--color-border-light);
}

.inventory-item-card__note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.controls-grid--compact {
  margin-block-start: var(--space-3);
}

/* Container queries for responsive 3-column grid */
@container inventory-debug (min-width: 641px) {
  .inventory-debug__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@container inventory-debug (min-width: 961px) {
  .inventory-debug__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

</style>