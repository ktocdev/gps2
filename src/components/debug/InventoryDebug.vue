<template>
  <div class="inventory-debug">
    <h2>Inventory</h2>
    <!-- Currency Section -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Currency Controls</h3>
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

    <!-- Player Inventory -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Player Inventory</h3>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value">{{ inventoryStore.totalItemCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Unique Items:</span>
            <span class="stat-value">{{ inventoryStore.allItems.length }}</span>
          </div>
        </div>

        <div v-if="inventoryStore.allItems.length === 0" class="text-center text-muted">
          <p>No items in inventory yet. Visit the store to purchase items!</p>
        </div>

        <div v-else class="inventory-debug__sections">
          <!-- Consumables Section -->
          <div v-if="consumablesWithDetails.length > 0" class="inventory-debug__section">
            <h4 class="panel__subheading">Consumables</h4>
            <div class="inventory-debug__items">
              <div
                v-for="item in consumablesWithDetails"
                :key="item.itemId"
                class="inventory-debug__item"
              >
                <div class="inventory-debug__item-header">
                  <span class="inventory-debug__item-name">{{ item.item?.name }}</span>
                  <Badge variant="secondary" size="sm">Qty: {{ item.quantity }}</Badge>
                </div>
                <div class="inventory-debug__item-meta">
                  <span class="text-label text-label--muted">{{ item.item?.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Habitat Items Section -->
          <div v-if="habitatItemsWithDetails.length > 0" class="inventory-debug__section">
            <h4 class="panel__subheading">Habitat Items</h4>
            <div class="inventory-debug__items">
              <div
                v-for="item in habitatItemsWithDetails"
                :key="item.itemId"
                class="inventory-debug__item"
              >
                <div class="inventory-debug__item-header">
                  <span class="inventory-debug__item-name">{{ item.item?.name }}</span>
                  <Badge variant="secondary" size="sm">Qty: {{ item.quantity }}</Badge>
                </div>
                <div class="inventory-debug__item-meta">
                  <span class="text-label text-label--muted">{{ item.item?.subCategory }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import Button from '../basic/Button.vue'
import Badge from '../basic/Badge.vue'

const playerProgression = usePlayerProgression()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

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
</script>

<style>
.inventory-debug {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.controls-grid--compact {
  margin-block-start: var(--space-3);
}

.inventory-debug__sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-block-start: var(--space-4);
}

.inventory-debug__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.inventory-debug__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.inventory-debug__item {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.inventory-debug__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-block-end: var(--space-2);
}

.inventory-debug__item-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.inventory-debug__item-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

</style>