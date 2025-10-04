<template>
  <div class="inventory-debug">
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

    <!-- Future Inventory Sections (Placeholder) -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Player Inventory</h3>
      </div>
      <div class="panel__content">
        <div class="text-center text-muted">
          <p>Inventory management will be implemented in Phase 3</p>
          <p>This section will include:</p>
          <ul class="feature-list">
            <li>Owned habitat items</li>
            <li>Consumable resources (hay, bedding)</li>
            <li>Item capacity management</li>
            <li>Quick item placement</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Store Controls</h3>
      </div>
      <div class="panel__content">
        <div class="text-center text-muted">
          <p>Store system will be implemented in Phase 3</p>
          <p>This section will include:</p>
          <ul class="feature-list">
            <li>Item purchasing controls</li>
            <li>Price manipulation for testing</li>
            <li>Stock level adjustments</li>
            <li>Sale/discount controls</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerProgression } from '../../stores/playerProgression'
import Button from '../basic/Button.vue'

const playerProgression = usePlayerProgression()

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
  margin-top: var(--space-3);
}

.feature-list {
  text-align: left;
  margin: var(--space-3) 0 0 var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.feature-list li {
  margin-bottom: var(--space-1);
}

</style>