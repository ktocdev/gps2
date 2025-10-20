<template>
  <div class="habitat-debug debug-view__constrained">
    <h2>Habitat Conditions (Phase 1)</h2>

    <div v-if="hasActiveGuineaPigs" class="habitat-debug__content">
    <!-- Visual Habitat with Items Sidebar -->
    <div class="panel panel--full-width">
      <div class="panel__header">
        <h3>Habitat Visual</h3>
      </div>
      <div class="panel__content">
        <div class="habitat-layout">
          <div class="habitat-layout__main">
            <HabitatVisual ref="habitatVisualRef" :show-grid="true" habitat-size="medium" />
          </div>
          <InventorySidebar :habitat-visual-ref="habitatVisualRef" />
        </div>
      </div>
    </div>

    <!-- Habitat Conditions & Test Controls Row -->
    <div class="habitat-debug__conditions-row">
      <!-- Habitat Conditions Panel -->
      <div class="panel panel--compact panel--accent">
        <div class="panel__header">
          <h3>Habitat Conditions</h3>
          <div class="condition-summary">
            <span class="condition-summary__label">Overall Condition:</span>
            <span class="condition-summary__value" :class="getConditionClass(habitat.overallCondition)">
              {{ habitat.overallCondition }}%
            </span>
          </div>
        </div>
        <div class="panel__content">
          <!-- Individual Conditions -->
          <div class="conditions-grid">
            <!-- Cleanliness -->
            <div class="condition-item">
              <div class="condition-item__header">
                <label for="cleanliness">Cleanliness</label>
                <span class="condition-item__value" :class="getConditionClass(habitat.cleanliness)">
                  {{ habitat.cleanliness.toFixed(0) }}%
                </span>
              </div>
              <SliderField
                id="cleanliness"
                :modelValue="habitat.cleanliness"
                :min="0"
                :max="100"
                :step="1"
                prefix=""
                suffix="%"
                @update:modelValue="(v: number) => habitat.updateCondition('cleanliness', v)"
              />
              <Button
                @click="habitat.cleanCage"
                variant="tertiary"
                size="sm"
                full-width
                class="condition-item__action w-full"
              >
                🧹 Clean Cage
              </Button>
            </div>

            <!-- Bedding Freshness -->
            <div class="condition-item">
              <div class="condition-item__header">
                <label for="bedding">Bedding Freshness</label>
                <span class="condition-item__value" :class="getConditionClass(habitat.beddingFreshness)">
                  {{ habitat.beddingFreshness.toFixed(0) }}%
                </span>
              </div>
              <SliderField
                id="bedding"
                :modelValue="habitat.beddingFreshness"
                :min="0"
                :max="100"
                :step="1"
                prefix=""
                suffix="%"
                @update:modelValue="(v: number) => habitat.updateCondition('beddingFreshness', v)"
              />
              <Select
                v-model="selectedBeddingType"
                :options="beddingOptions"
                placeholder="Select bedding type"
                label="Bedding Type"
              />
              <Button
                @click="handleRefreshBedding"
                variant="tertiary"
                size="sm"
                full-width
                class="condition-item__action w-full"
                :disabled="!canRefreshBedding"
                :tooltip="!canRefreshBedding ? `No ${selectedBeddingType} bedding in inventory` : `Use ${selectedBeddingType} bedding`"
              >
                🛏️ Refresh Bedding
              </Button>
            </div>

            <!-- Hay Freshness -->
            <div class="condition-item">
              <div class="condition-item__header">
                <label for="hay">Hay Freshness</label>
                <span class="condition-item__value" :class="getConditionClass(habitat.hayFreshness)">
                  {{ habitat.hayFreshness.toFixed(0) }}%
                </span>
              </div>
              <SliderField
                id="hay"
                :modelValue="habitat.hayFreshness"
                :min="0"
                :max="100"
                :step="1"
                prefix=""
                suffix="%"
                @update:modelValue="(v: number) => habitat.updateCondition('hayFreshness', v)"
              />
            </div>

            <!-- Water Level -->
            <div class="condition-item">
              <div class="condition-item__header">
                <label for="water">Water Level</label>
                <span class="condition-item__value" :class="getConditionClass(habitat.waterLevel)">
                  {{ habitat.waterLevel.toFixed(0) }}%
                </span>
              </div>
              <SliderField
                id="water"
                :modelValue="habitat.waterLevel"
                :min="0"
                :max="100"
                :step="1"
                prefix=""
                suffix="%"
                @update:modelValue="(v: number) => habitat.updateCondition('waterLevel', v)"
              />
              <Button
                @click="habitat.refillWater"
                variant="tertiary"
                size="sm"
                full-width
                class="condition-item__action w-full"
              >
                💧 Refill Water
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Controls Panel -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Test Controls</h3>
        </div>
        <div class="panel__content">
          <div class="test-controls">
            <Button
              @click="addTestPoop"
              variant="secondary"
              size="sm"
            >
              Add Test Poop
            </Button>
            <Button
              @click="clearAllPoop"
              variant="primary"
              size="sm"
              :disabled="!habitatVisualRef || habitatVisualRef.poopCount === 0"
            >
              Clear All Poop{{ habitatVisualRef && habitatVisualRef.poopCount > 0 ? ` (${habitatVisualRef.poopCount})` : '' }}
            </Button>
            <Button
              @click="clearAllBowls"
              variant="warning"
              size="sm"
            >
              Clear All Bowls
            </Button>
            <Button
              @click="clearAllHayRacks"
              variant="warning"
              size="sm"
            >
              Clear All Hay Racks
            </Button>
            <Button
              @click="clearWater"
              variant="warning"
              size="sm"
            >
              Clear Water
            </Button>
          </div>
        </div>
      </div>
    </div>

    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p>No active guinea pigs. Start a game session from the Pet Store tab to test habitat system.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import Button from '../../basic/Button.vue'
import SliderField from '../../basic/SliderField.vue'
import Select from '../../basic/Select.vue'
import HabitatVisual from '../../game/habitat/HabitatVisual.vue'
import InventorySidebar from '../../game/habitat/InventorySidebar.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

// Ref to HabitatVisual component
const habitatVisualRef = ref<InstanceType<typeof HabitatVisual> | null>(null)

// Initialize supplies catalog on mount
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }
})

// Test control handlers
function addTestPoop() {
  habitatVisualRef.value?.addTestPoop()
}

function clearAllPoop() {
  habitatVisualRef.value?.clearAllPoop()
}

function clearAllBowls() {
  habitat.clearAllBowls()
}

function clearAllHayRacks() {
  habitat.clearAllHayRacks()
}

function clearWater() {
  habitat.waterLevel = 0
}

const hasActiveGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs.length > 0
})

// Bedding selection
const selectedBeddingType = ref<string>('average')
const beddingOptions = computed(() => [
  { value: 'cheap', label: `Cheap Bedding (${inventoryStore.getItemQuantity('bedding_cheap')} in stock)`, disabled: !inventoryStore.hasItem('bedding_cheap') },
  { value: 'average', label: `Average Bedding (${inventoryStore.getItemQuantity('bedding_average')} in stock)`, disabled: !inventoryStore.hasItem('bedding_average') },
  { value: 'premium', label: `Premium Bedding (${inventoryStore.getItemQuantity('bedding_premium')} in stock)`, disabled: !inventoryStore.hasItem('bedding_premium') }
])

// Map quality to item IDs
const beddingItemIds: Record<'cheap' | 'average' | 'premium', string> = {
  cheap: 'bedding_cheap',
  average: 'bedding_average',
  premium: 'bedding_premium'
}

const canRefreshBedding = computed(() => {
  const itemId = beddingItemIds[selectedBeddingType.value as 'cheap' | 'average' | 'premium']
  return inventoryStore.hasItem(itemId)
})

function handleRefreshBedding() {
  // Use the selected bedding type from the dropdown
  const itemId = beddingItemIds[selectedBeddingType.value as 'cheap' | 'average' | 'premium']
  const success = habitat.refreshBedding(itemId)
  if (!success) {
    console.warn(`Not enough ${selectedBeddingType.value} bedding in inventory`)
  }
}

function getConditionClass(value: number): string {
  if (value >= 80) return 'condition-value--good'
  if (value >= 40) return 'condition-value--warning'
  return 'condition-value--critical'
}
</script>

<style>
.habitat-debug {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.habitat-debug__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 2px solid var(--color-success);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.condition-summary__label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.condition-summary__value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Dynamic border color based on condition */
.condition-summary:has(.condition-value--warning) {
  border-color: var(--color-warning);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
}

.condition-summary:has(.condition-value--critical) {
  border-color: var(--color-error);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.condition-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.condition-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-item__header label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.condition-item__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.condition-value--good {
  color: var(--color-success);
}

.condition-value--warning {
  color: var(--color-warning);
}

.condition-value--critical {
  color: var(--color-error);
}

.condition-item__action {
  margin-block-start: var(--space-2);
}

/* Habitat Layout with Sidebar */
.habitat-layout {
  display: flex;
  gap: var(--space-4);
  align-items: stretch;
}

.habitat-layout__main {
  flex: 1;
  min-inline-size: 0;
}

/* Habitat Conditions & Test Controls Row */
.habitat-debug__conditions-row {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

/* Desktop: 2 columns - Habitat Conditions (66%) / Test Controls (33%) */
@media (min-width: 768px) {
  .habitat-debug__conditions-row {
    grid-template-columns: 2fr 1fr;
  }
}

.test-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
