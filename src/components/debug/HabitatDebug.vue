<template>
  <div class="habitat-debug debug-view__constrained">
    <h2>Habitat Conditions (Phase 1)</h2>

    <div v-if="hasActiveGuineaPigs" class="habitat-debug__content">
    <!-- Habitat Panels Row -->
    <div class="panel-row">
    <!-- Condition Management Panel -->
    <div class="panel panel--compact panel--accent">
      <div class="panel__header">
        <h3>Habitat Conditions</h3>
        <div class="panel__header-actions">
          <Badge v-if="habitat.needsAttention" variant="warning">Needs Attention</Badge>
          <Badge v-if="habitat.criticalConditions.length > 0" variant="danger">
            Critical: {{ habitat.criticalConditions.join(', ') }}
          </Badge>
        </div>
      </div>
      <div class="panel__content">
        <!-- Overall Condition -->
        <div class="condition-summary">
          <div class="condition-summary__label">Overall Condition:</div>
          <div class="condition-summary__value" :class="getConditionClass(habitat.overallCondition)">
            {{ habitat.overallCondition }}%
          </div>
        </div>

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
              class="condition-item__action"
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
            <Button
              @click="handleRefreshBedding"
              variant="tertiary"
              size="sm"
              full-width
              class="condition-item__action"
              :disabled="!canRefreshBedding"
              :tooltip="!canRefreshBedding ? 'No bedding in inventory' : ''"
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
            <Button
              @click="habitat.refillHay()"
              variant="tertiary"
              size="sm"
              full-width
              class="condition-item__action"
            >
              🌾 Refill Hay (20 handfuls)
            </Button>
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
              class="condition-item__action"
            >
              💧 Refill Water
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resource Management Panel -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Resource Management</h3>
      </div>
      <div class="panel__content">
        <!-- Current Bedding -->
        <div class="resource-section">
          <h4>Current Bedding</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Type:</span>
              <span class="stat-value">{{ previewBedding.type }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Quality:</span>
              <Badge>{{ previewBedding.quality }}</Badge>
            </div>
            <div class="stat-item">
              <span class="stat-label">Absorbency:</span>
              <span class="stat-value">{{ (previewBedding.absorbency * 100).toFixed(0) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Decay Rate:</span>
              <span class="stat-value">{{ (previewBedding.decayRate * 100).toFixed(0) }}%</span>
            </div>
            <div v-if="previewBedding.color" class="stat-item">
              <span class="stat-label">Color:</span>
              <Badge variant="secondary">{{ previewBedding.color }}</Badge>
            </div>
          </div>
          <div class="resource-select-group">
            <Select
              v-model="selectedBeddingType"
              :options="beddingOptions"
              placeholder="Select bedding type"
              class="resource-select-group__select"
            />
            <Button
              @click="handleSwitchBedding"
              variant="secondary"
              size="sm"
              :disabled="!canUseBedding(selectedBeddingType as 'cheap' | 'average' | 'premium')"
              :tooltip="!canUseBedding(selectedBeddingType as 'cheap' | 'average' | 'premium') ? 'No bedding in inventory' : 'Switch to selected bedding type'"
            >
              Use
            </Button>
          </div>
        </div>

        <!-- Current Hay Bag -->
        <div class="resource-section">
          <h4>Current Hay Bag</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Type:</span>
              <span class="stat-value">{{ previewHayType }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Bags in Stock:</span>
              <span class="stat-value">{{ previewHayCount }}</span>
            </div>
          </div>
          <div class="resource-select-group">
            <Select
              v-model="selectedHayType"
              :options="hayOptions"
              placeholder="Select hay type"
              class="resource-select-group__select"
            />
            <Button
              @click="handleSwitchHay"
              variant="secondary"
              size="sm"
              :disabled="!canUseHay(selectedHayType)"
              :tooltip="!canUseHay(selectedHayType) ? 'No hay in inventory' : 'Switch to selected hay type (20 handfuls)'"
            >
              Use
            </Button>
          </div>
        </div>

        <!-- Mini Hay Bales -->
        <div class="resource-section">
          <h4>Special Items</h4>
          <div class="resource-actions">
            <Button
              @click="habitat.useMiniHayBale()"
              variant="secondary"
              size="sm"
              full-width
              tooltip="Add 3 handfuls to current hay bag"
            >
              🌾 Add Mini-Hay Bale (+3 handfuls)
            </Button>
          </div>
        </div>

        <!-- Free Resources Toggle -->
        <div class="resource-section">
          <CheckboxField
            id="free-resources"
            :modelValue="habitat.freeResourcesEnabled"
            @update:modelValue="habitat.toggleFreeResources"
            label="Enable Free Resources (Testing Mode)"
          />
          <p v-if="habitat.freeResourcesEnabled" class="text-muted">
            ⚠️ Free Resources Mode Active - Unlimited inventory for testing
          </p>
        </div>
      </div>
    </div>
    </div>

    <!-- Inventory Row -->
    <div class="panel-row">
    <!-- Bedding Inventory Panel -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Bedding Inventory</h3>
      </div>
      <div class="panel__content">
        <div class="inventory-list">
            <div class="inventory-item">
              <div class="inventory-item__info">
                <span class="inventory-item__label">Cheap Bedding</span>
                <span class="inventory-item__count">{{ habitat.beddingInventory.cheap }} in stock</span>
              </div>
              <div class="inventory-item__actions">
                <Button @click="habitat.addBeddingToInventory('cheap')" variant="tertiary" size="sm" icon-only>+</Button>
              </div>
            </div>
            <div class="inventory-item">
              <div class="inventory-item__info">
                <span class="inventory-item__label">Average Bedding</span>
                <span class="inventory-item__count">{{ habitat.beddingInventory.average }} in stock</span>
              </div>
              <div class="inventory-item__actions">
                <Button @click="habitat.addBeddingToInventory('average')" variant="tertiary" size="sm" icon-only>+</Button>
              </div>
            </div>
            <div class="inventory-item">
              <div class="inventory-item__info">
                <span class="inventory-item__label">Premium Bedding</span>
                <span class="inventory-item__count">{{ habitat.beddingInventory.premium }} in stock</span>
              </div>
              <div class="inventory-item__actions">
                <Button @click="habitat.addBeddingToInventory('premium')" variant="tertiary" size="sm" icon-only>+</Button>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Hay Inventory Panel -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Hay Inventory</h3>
      </div>
      <div class="panel__content">
        <div class="inventory-list">
            <div v-for="hayType in hayTypes" :key="hayType.id" class="inventory-item">
              <div class="inventory-item__info">
                <span class="inventory-item__label">{{ hayType.name }}</span>
                <span class="inventory-item__count">{{ hayType.count }} bags in stock</span>
              </div>
              <div class="inventory-item__actions">
                <Button @click="() => addHayToInventory(hayType.id)" variant="tertiary" size="sm" icon-only>+</Button>
              </div>
            </div>
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
import { computed, ref } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import Button from '../basic/Button.vue'
import Badge from '../basic/Badge.vue'
import SliderField from '../basic/SliderField.vue'
import CheckboxField from '../basic/CheckboxField.vue'
import Select from '../basic/Select.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()

const hasActiveGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs.length > 0
})

// Hay inventory (temporary - will be moved to store in future phases)
const hayTypes = ref([
  { id: 'timothy', name: 'Timothy Hay', shortName: 'Timothy', count: 2 },
  { id: 'orchard_grass', name: 'Orchard Grass', shortName: 'Orchard', count: 0 },
  { id: 'meadow', name: 'Meadow Hay', shortName: 'Meadow', count: 0 },
  { id: 'alfalfa', name: 'Alfalfa Hay', shortName: 'Alfalfa', count: 0 },
  { id: 'botanical', name: 'Botanical Hay', shortName: 'Botanical', count: 0 },
  { id: 'oat', name: 'Oat Hay', shortName: 'Oat', count: 0 },
  { id: 'bermuda_grass', name: 'Bermuda Grass', shortName: 'Bermuda', count: 0 },
  { id: 'western_timothy', name: 'Western Timothy', shortName: 'W. Timothy', count: 0 }
])

// Bedding selection
const selectedBeddingType = ref<string>('average')
const beddingOptions = computed(() => [
  { value: 'cheap', label: `Cheap Bedding (${habitat.beddingInventory.cheap} in stock)`, disabled: !habitat.freeResourcesEnabled && habitat.beddingInventory.cheap === 0 },
  { value: 'average', label: `Average Bedding (${habitat.beddingInventory.average} in stock)`, disabled: !habitat.freeResourcesEnabled && habitat.beddingInventory.average === 0 },
  { value: 'premium', label: `Premium Bedding (${habitat.beddingInventory.premium} in stock)`, disabled: !habitat.freeResourcesEnabled && habitat.beddingInventory.premium === 0 }
])

// Hay selection
const selectedHayType = ref<string>('timothy')
const hayOptions = computed(() => hayTypes.value.map(h => ({
  value: h.id,
  label: `${h.name} (${h.count} bags in stock)`,
  disabled: !habitat.freeResourcesEnabled && h.count === 0
})))

// Preview bedding stats based on selection
const previewBedding = computed(() => {
  const beddingStats: Record<string, { type: string; quality: 'cheap' | 'average' | 'premium'; absorbency: number; decayRate: number; color?: string }> = {
    cheap: {
      type: 'Cheap Bedding',
      quality: 'cheap' as const,
      absorbency: 0.8,
      decayRate: 1.2
    },
    average: {
      type: 'Average Bedding',
      quality: 'average' as const,
      absorbency: 1.0,
      decayRate: 1.0
    },
    premium: {
      type: 'Premium Bedding',
      quality: 'premium' as const,
      absorbency: 1.3,
      decayRate: 0.7
    }
  }

  return beddingStats[selectedBeddingType.value as 'cheap' | 'average' | 'premium'] || habitat.currentBedding
})

// Preview hay type and stock based on selection
const previewHayType = computed(() => {
  const hayType = hayTypes.value.find(h => h.id === selectedHayType.value)
  return hayType?.name || 'No hay selected'
})

const previewHayCount = computed(() => {
  const hayType = hayTypes.value.find(h => h.id === selectedHayType.value)
  return hayType?.count || 0
})

const canRefreshBedding = computed(() => {
  if (habitat.freeResourcesEnabled) return true
  return habitat.beddingInventory.average > 0 ||
         habitat.beddingInventory.cheap > 0 ||
         habitat.beddingInventory.premium > 0
})

function handleRefreshBedding() {
  // Use current bedding quality by default
  const success = habitat.refreshBedding()
  if (!success && !habitat.freeResourcesEnabled) {
    console.warn('Not enough bedding in inventory')
  }
}

function handleRefreshBeddingType(type: 'cheap' | 'average' | 'premium') {
  const success = habitat.refreshBedding(type)
  if (!success && !habitat.freeResourcesEnabled) {
    console.warn(`Not enough ${type} bedding in inventory`)
  }
}

function handleSwitchBedding() {
  if (!selectedBeddingType.value) return
  handleRefreshBeddingType(selectedBeddingType.value as 'cheap' | 'average' | 'premium')
}

function handleSwitchHay() {
  if (!selectedHayType.value) return
  useHayBag(selectedHayType.value)
}

function canUseBedding(type: 'cheap' | 'average' | 'premium'): boolean {
  if (habitat.freeResourcesEnabled) return true
  return habitat.beddingInventory[type] > 0
}

function canUseHay(hayTypeId: string): boolean {
  if (habitat.freeResourcesEnabled) return true
  const hayType = hayTypes.value.find(h => h.id === hayTypeId)
  return hayType ? hayType.count > 0 : false
}

function useHayBag(hayTypeId: string) {
  const hayType = hayTypes.value.find(h => h.id === hayTypeId)
  if (!hayType) return

  // Decrement inventory (unless free resources enabled)
  if (!habitat.freeResourcesEnabled) {
    if (hayType.count <= 0) {
      console.warn(`No ${hayType.name} in inventory`)
      return
    }
    hayType.count--
  }

  // Refill hay rack (sets to 20 handfuls and updates freshness to 100%)
  habitat.refillHay(20)
}

function addHayToInventory(hayTypeId: string) {
  const hayType = hayTypes.value.find(h => h.id === hayTypeId)
  if (hayType) {
    hayType.count++
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

.panel__header-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.condition-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-block-end: var(--space-4);
}

.condition-summary__label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.condition-summary__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
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

.resource-section {
  margin-block-end: var(--space-4);
}

.resource-section h4 {
  margin-block-end: var(--space-3);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.inventory-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.inventory-item__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.inventory-item__label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.inventory-item__count {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.inventory-item__actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

@media (min-width: 769px) {
  .inventory-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .inventory-item__actions {
    flex-shrink: 0;
  }
}

.resource-select-group {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
  margin-block-start: var(--space-3);
}

.resource-select-group__select {
  flex: 1;
}

.resource-actions {
  display: flex;
  gap: var(--space-2);
  margin-block-start: var(--space-3);
}

.text-muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
  margin-block-start: var(--space-2);
}
</style>
