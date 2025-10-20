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
          <div class="habitat-layout__sidebar">
            <h4 class="habitat-layout__sidebar-title">Inventory</h4>
            <div class="habitat-layout__items">
              <!-- Serving-based consumables -->
              <InventoryTileServing
                v-for="item in servingBasedItems"
                :key="item.instanceId"
                :item-id="item.itemId"
                :name="item.name"
                :emoji="item.emoji"
                :servings-remaining="item.servingsRemaining"
                :max-servings="item.maxServings"
                @dragstart="(_itemId, event) => handleServingDragStart(event, item)"
                @dragend="handleDragEnd"
              />

              <!-- Regular habitat items and food -->
              <div
                v-for="item in regularItems"
                :key="item.id"
                class="draggable-item-card"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
              >
                <span class="draggable-item-card__emoji">{{ item.emoji }}</span>
                <span class="draggable-item-card__name">{{ item.name }}</span>
              </div>
            </div>
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
import InventoryTileServing from '../../game/shop/InventoryTileServing.vue'

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

// Serving-based consumables (hay, lettuce, carrots)
const servingBasedItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Only show items with serving metadata
      return item?.stats?.servings !== undefined
    })
    .flatMap(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Map each instance to a serving tile
      return invItem.instances
        .filter(inst => inst.servingsRemaining !== undefined && inst.servingsRemaining > 0)
        .map(inst => ({
          instanceId: inst.instanceId,
          itemId: invItem.itemId,
          name: item?.name || 'Unknown',
          emoji: item?.emoji || '📦',
          servingsRemaining: inst.servingsRemaining || 0,
          maxServings: inst.maxServings || 0
        }))
    })
})

// Regular habitat items and non-serving food
const regularItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Show habitat items and food WITHOUT serving metadata that aren't already placed
      const isPlaceable = item?.category === 'habitat_item' || item?.category === 'food'
      const hasNoServings = item?.stats?.servings === undefined
      return isPlaceable && hasNoServings && !habitat.habitatItems.includes(invItem.itemId)
    })
    .map(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      return {
        id: invItem.itemId,
        name: item?.name || 'Unknown',
        emoji: item?.emoji || '📦',
        size: getItemSize(item),
        quantity: invItem.quantity
      }
    })
})


function getItemSize(item: any): { width: number; height: number } {
  const size = item.stats?.size
  if (size === 'small') return { width: 1, height: 1 }
  if (size === 'medium') return { width: 2, height: 1 }
  if (size === 'large') return { width: 2, height: 2 }
  return { width: 1, height: 1 }
}

// Drag handlers
function handleServingDragStart(event: DragEvent, item: any) {
  if (!event.dataTransfer) return

  // Get item category for drag validation
  const suppliesItem = suppliesStore.getItemById(item.itemId)
  const category = suppliesItem?.category || 'unknown'

  // Store serving data for drop handler
  const dragData = {
    itemId: item.itemId,
    instanceId: item.instanceId,
    isServingBased: true,
    size: { width: 1, height: 1 } // Servings are always 1x1
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  // Add category as custom MIME type so we can check it during dragover
  event.dataTransfer.setData(`application/x-item-category-${category}`, '')

  // Notify HabitatVisual about the drag
  if (habitatVisualRef.value) {
    habitatVisualRef.value.setDraggedItem(item.itemId, { width: 1, height: 1 })
  }
}

function handleDragStart(event: DragEvent, item: any) {
  if (!event.dataTransfer) return

  // Get item category for drag validation
  const suppliesItem = suppliesStore.getItemById(item.id)
  const category = suppliesItem?.category || 'unknown'

  // Store item data for drop handler
  const dragData = {
    itemId: item.id,
    size: item.size
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  // Add category as custom MIME type so we can check it during dragover
  event.dataTransfer.setData(`application/x-item-category-${category}`, '')

  // Notify HabitatVisual about the drag
  if (habitatVisualRef.value) {
    habitatVisualRef.value.setDraggedItem(item.id, item.size)
  }

  // Visual feedback
  const target = event.target as HTMLElement
  target.style.opacity = '0.5'
}

function handleDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.style.opacity = '1'

  // Clear dragged item
  if (habitatVisualRef.value) {
    habitatVisualRef.value.clearDraggedItem()
  }
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

.habitat-layout__sidebar {
  inline-size: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
  align-self: stretch;
}

.habitat-layout__sidebar-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-align: center;
  padding-block-end: var(--space-2);
  border-block-end: 1px solid var(--color-border);
  margin-block-end: var(--space-1);
}

.habitat-layout__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-block-size: 800px;
  overflow-y: auto;
  padding-inline-end: var(--space-2);
  margin-inline-end: calc(var(--space-2) * -1);
}

.habitat-layout__items::-webkit-scrollbar {
  inline-size: 6px;
}

.habitat-layout__items::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
}

.habitat-layout__items::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.habitat-layout__items::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-hover);
}

.draggable-item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  cursor: grab;
  transition: all 0.2s ease;
}

.draggable-item-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.draggable-item-card:active {
  cursor: grabbing;
}

.draggable-item-card__emoji {
  font-size: var(--font-size-3xl);
}

.draggable-item-card__name {
  font-size: var(--font-size-xs);
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.test-controls {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
</style>
