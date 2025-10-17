<template>
  <div class="habitat-debug debug-view__constrained">
    <h2>Habitat Conditions (Phase 1)</h2>

    <div v-if="hasActiveGuineaPigs" class="habitat-debug__content">
    <!-- Condition Management Panel -->
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
            <Select
              v-model="selectedHayType"
              :options="hayOptions"
              placeholder="Select hay type"
              label="Hay Type"
            />
            <div class="flex gap-2 w-full">
              <Button
                @click="handleRefillHay"
                variant="tertiary"
                size="sm"
                class="condition-item__action flex-1 w-full"
                :disabled="!canRefillHay"
                :tooltip="!canRefillHay ? `No ${hayTypes.find(h => h.id === selectedHayType)?.name} in inventory` : `Use ${hayTypes.find(h => h.id === selectedHayType)?.name}`"
              >
                🌾 Refill Hay
              </Button>
              <Button
                @click="handleGiveHayHandful"
                variant="tertiary"
                size="sm"
                class="condition-item__action flex-1 w-full"
                :disabled="!canGiveHayHandful"
                :tooltip="!canGiveHayHandful ? 'No hay available in bag or inventory' : habitat.currentHayBag ? `${habitat.currentHayBag.handfulsRemaining} handfuls remaining` : 'Will open new bag'"
              >
                🌾 Handful of Hay
              </Button>
            </div>
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

    <!-- Habitat Items Panel -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Habitat Items (FPO)</h3>
        <span class="text-label text-muted">{{ habitatItemsWithDetails.length }} items</span>
      </div>
      <div class="panel__content">
        <div v-if="habitatItemsWithDetails.length > 0" class="habitat-items-grid">
          <div v-for="item in habitatItemsWithDetails" :key="item.id" class="habitat-item-card">
            <div class="habitat-item-card__header">
              <span class="habitat-item-card__emoji">{{ item.emoji }}</span>
              <span class="habitat-item-card__name">{{ item.name }}</span>
            </div>
            <p class="habitat-item-card__description">{{ item.description }}</p>
            <Button
              @click="handleRemoveFromHabitat(item.id)"
              variant="secondary"
              size="sm"
              full-width
              class="w-full"
            >
              Move to Inventory
            </Button>
          </div>
        </div>
        <p v-else class="text-muted text-center">No items in habitat yet</p>
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
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import Button from '../basic/Button.vue'
import SliderField from '../basic/SliderField.vue'
import Select from '../basic/Select.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

const hasActiveGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs.length > 0
})

// Get habitat items with full details from supplies store
const habitatItemsWithDetails = computed(() => {
  return habitat.habitatItems.map(itemId => {
    const item = suppliesStore.getItemById(itemId)
    return {
      id: itemId,
      name: item?.name || 'Unknown Item',
      description: item?.description || '',
      emoji: item?.emoji || '📦'
    }
  })
})

// Hay types list (data now managed by inventory store)
const hayTypes = [
  { id: 'timothy', name: 'Timothy Hay', shortName: 'Timothy' },
  { id: 'orchard_grass', name: 'Orchard Grass', shortName: 'Orchard' },
  { id: 'meadow', name: 'Meadow Hay', shortName: 'Meadow' },
  { id: 'alfalfa', name: 'Alfalfa Hay', shortName: 'Alfalfa' },
  { id: 'botanical', name: 'Botanical Hay', shortName: 'Botanical' },
  { id: 'oat', name: 'Oat Hay', shortName: 'Oat' },
  { id: 'bermuda_grass', name: 'Bermuda Grass', shortName: 'Bermuda' },
  { id: 'western_timothy', name: 'Western Timothy', shortName: 'W. Timothy' }
]

// Bedding selection
const selectedBeddingType = ref<string>('average')
const beddingOptions = computed(() => [
  { value: 'cheap', label: `Cheap Bedding (${inventoryStore.getItemQuantity('bedding_cheap')} in stock)`, disabled: !inventoryStore.hasItem('bedding_cheap') },
  { value: 'average', label: `Average Bedding (${inventoryStore.getItemQuantity('bedding_average')} in stock)`, disabled: !inventoryStore.hasItem('bedding_average') },
  { value: 'premium', label: `Premium Bedding (${inventoryStore.getItemQuantity('bedding_premium')} in stock)`, disabled: !inventoryStore.hasItem('bedding_premium') }
])

// Hay selection
const selectedHayType = ref<string>('timothy')
const hayOptions = computed(() => hayTypes.map(h => ({
  value: h.id,
  label: `${h.name} (${inventoryStore.getItemQuantity(`hay_${h.id}`)} bags in stock)`,
  disabled: !inventoryStore.hasItem(`hay_${h.id}`)
})))

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

const canRefillHay = computed(() => {
  const itemId = `hay_${selectedHayType.value}`
  return inventoryStore.hasItem(itemId)
})

const canGiveHayHandful = computed(() => {
  // Can give handful if there's hay in the current bag OR if there's hay in inventory to open
  if (habitat.currentHayBag && habitat.currentHayBag.handfulsRemaining > 0) {
    return true
  }
  const itemId = `hay_${selectedHayType.value}`
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

function handleRefillHay() {
  // Use the selected hay type from the dropdown
  const itemId = `hay_${selectedHayType.value}`
  const success = habitat.refillHay(itemId)
  if (!success) {
    console.warn(`No ${selectedHayType.value} hay in inventory`)
  }
}

function handleGiveHayHandful() {
  // Smart hay handful - automatically refills from inventory if bag is empty
  if (!habitat.currentHayBag || habitat.currentHayBag.handfulsRemaining <= 0) {
    // Need to open a new bag from inventory
    const itemId = `hay_${selectedHayType.value}`

    if (!inventoryStore.hasItem(itemId)) {
      console.warn(`No ${selectedHayType.value} hay in inventory to open`)
      return
    }

    // Open a new bag (gives 20 handfuls)
    const success = habitat.refillHay(itemId)
    if (!success) {
      console.warn(`Failed to open new hay bag`)
      return
    }
  }

  // Now give one handful (from the current bag)
  habitat.consumeHayHandful()
}

function handleRemoveFromHabitat(itemId: string) {
  const success = habitat.removeItemFromHabitat(itemId)
  if (success) {
    console.log(`Moved ${itemId} from habitat to inventory`)
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

.habitat-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-4);
}

.habitat-item-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.habitat-item-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.habitat-item-card__emoji {
  font-size: var(--font-size-2xl);
}

.habitat-item-card__name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.habitat-item-card__description {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
