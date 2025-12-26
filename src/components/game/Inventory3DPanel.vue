<template>
  <SidePanel3D
    :is-open="isOpen"
    side="right"
    color="violet"
    title="Info Panel"
    icon="📦"
    :tabs="tabs"
    :active-tab="activeTab"
    @toggle="$emit('toggle')"
    @update:active-tab="activeTab = $event"
  >
    <template #header-extra>
      <span v-if="activeTab === 'inventory'" class="inventory-3d-panel__count">{{ totalItemCount }} items</span>
    </template>

    <!-- Inventory Tab Content -->
    <template v-if="activeTab === 'inventory'">
      <!-- Empty state -->
      <div v-if="totalItemCount === 0" class="inventory-3d-panel__empty">
        📦 No items in inventory
      </div>

      <!-- Food & Consumables Section -->
      <div v-if="consumableItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🥬 Food & Consumables
        </div>
        <div class="inventory-3d-panel__items">
          <button
            v-for="item in consumableItems"
            :key="item.itemId"
            class="inventory-3d-panel__item"
            :class="{
              'inventory-3d-panel__item--selected': selectedItemId === item.itemId,
              'inventory-3d-panel__item--hay': item.category === 'hay',
              'inventory-3d-panel__item--food': item.category === 'food'
            }"
            @click="handleItemClick(item)"
            :title="item.name"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span class="inventory-3d-panel__item-servings">
              {{ item.servingsRemaining }}/{{ item.maxServings }}
            </span>
          </button>
        </div>
      </div>

      <!-- Habitat Items Section -->
      <div v-if="habitatItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🏠 Habitat Items
        </div>
        <div class="inventory-3d-panel__items">
          <button
            v-for="item in habitatItems"
            :key="item.itemId"
            class="inventory-3d-panel__item"
            :class="{ 'inventory-3d-panel__item--selected': selectedItemId === item.itemId }"
            @click="handleItemClick(item)"
            :title="item.name"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span v-if="item.quantity > 1" class="inventory-3d-panel__item-quantity">
              ×{{ item.quantity }}
            </span>
          </button>
        </div>
      </div>

      <!-- Bedding Section (read-only info) -->
      <div v-if="beddingItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🛏️ Bedding
        </div>
        <div class="inventory-3d-panel__items">
          <div
            v-for="item in beddingItems"
            :key="item.itemId"
            class="inventory-3d-panel__item inventory-3d-panel__item--readonly"
            :title="'Used automatically during cleaning'"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span class="inventory-3d-panel__item-amount">{{ item.formattedAmount }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Guinea Pig Info Tab Content -->
    <template v-else-if="activeTab === 'guinea-pigs'">
      <div class="guinea-pig-info">
        <div class="guinea-pig-info__header">
          🐹 Guinea Pig Information
        </div>
        <div class="guinea-pig-info__placeholder">
          <p>Select a guinea pig in the habitat to see detailed information here.</p>
          <p class="guinea-pig-info__hint">Click on a guinea pig to view:</p>
          <ul class="guinea-pig-info__list">
            <li>Current needs & wellness</li>
            <li>Personality & preferences</li>
            <li>Friendship levels</li>
            <li>Activity history</li>
          </ul>
        </div>
      </div>
    </template>
  </SidePanel3D>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SidePanel3D, { type TabDefinition } from './SidePanel3D.vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  selectItem: [itemId: string]
  deselectItem: []
}>()

const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

const selectedItemId = ref<string | null>(null)

// Tab definitions
const tabs: TabDefinition[] = [
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'guinea-pigs', label: 'Guinea Pigs', icon: '🐹' }
]

const activeTab = ref('inventory')

// Computed: Total item count
const totalItemCount = computed(() => {
  return inventoryStore.allItems.reduce((sum, item) => sum + item.quantity, 0)
})

// Check if an item needs to be placed into a container (bowl/rack)
function isContainerItem(category: string): boolean {
  return category === 'hay' || category === 'food'
}

// Computed: Food & Consumables (hay, food items - all have servings)
const consumableItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    quantity: number
    servingsRemaining: number
    maxServings: number
    category: string
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    // Include hay and food categories (all have servings)
    if (isContainerItem(supplyItem.category)) {
      // Get total servings across all instances
      const totalServings = inventoryStore.getTotalServings(invItem.itemId)
      const maxServingsPerItem = supplyItem.stats?.servings || 1

      items.push({
        itemId: invItem.itemId,
        name: supplyItem.name,
        emoji: supplyItem.emoji || '🍽️',
        quantity: invItem.quantity,
        servingsRemaining: totalServings,
        maxServings: maxServingsPerItem * invItem.quantity,
        category: supplyItem.category
      })
    }
  }

  return items
})

// Computed: Habitat items (toys, hideaways, bowls, etc.)
const habitatItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    quantity: number
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'habitat_item') {
      // Count items not yet placed in habitat
      const placedCount = inventoryStore.getPlacedCount(invItem.itemId)
      const availableCount = invItem.quantity - placedCount

      if (availableCount > 0) {
        items.push({
          itemId: invItem.itemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '📦',
          quantity: availableCount
        })
      }
    }
  }

  return items
})

// Computed: Bedding items (read-only display)
const beddingItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    formattedAmount: string
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'bedding') {
      // Calculate total amount remaining across all instances
      let totalAmount = 0
      for (const instance of invItem.instances) {
        totalAmount += instance.amountRemaining ?? 1
      }

      items.push({
        itemId: invItem.itemId,
        name: supplyItem.name,
        emoji: supplyItem.emoji || '🛏️',
        formattedAmount: totalAmount.toFixed(1) + ' bags'
      })
    }
  }

  return items
})

// Handle habitat item click - for direct placement in habitat
function handleItemClick(item: { itemId: string }) {
  if (selectedItemId.value === item.itemId) {
    selectedItemId.value = null
    emit('deselectItem')
  } else {
    selectedItemId.value = item.itemId
    emit('selectItem', item.itemId)
  }
}
</script>

<style>
/* Inventory-specific styles (content only, not panel structure) */
.inventory-3d-panel__count {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.inventory-3d-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Sections */
.inventory-3d-panel__section {
  margin-block-end: var(--spacing-md);
}

.inventory-3d-panel__section-header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-block-end: var(--spacing-xs);
  padding-block-end: var(--spacing-xs);
  border-block-end: 1px solid var(--color-border);
}

/* Items grid */
.inventory-3d-panel__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* Individual item */
.inventory-3d-panel__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  text-align: start;
  inline-size: 100%;
}

.inventory-3d-panel__item:hover {
  background-color: var(--color-bg-tertiary);
}

.inventory-3d-panel__item--selected {
  border-color: var(--color-accent-violet-500);
  background-color: var(--color-accent-violet-100);
}

.inventory-3d-panel__item--selected .inventory-3d-panel__item-name {
  color: var(--color-accent-violet-800);
}

.inventory-3d-panel__item--selected .inventory-3d-panel__item-servings {
  color: var(--color-accent-violet-700);
}

.inventory-3d-panel__item--selected:hover {
  background-color: var(--color-accent-violet-200);
}

/* Food items - green left border */
.inventory-3d-panel__item--food {
  border-inline-start: 3px solid var(--color-accent-green-500);
}

/* Hay items - yellow left border */
.inventory-3d-panel__item--hay {
  border-inline-start: 3px solid var(--color-accent-yellow-500);
}

.inventory-3d-panel__item-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.inventory-3d-panel__item-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inventory-3d-panel__item-quantity,
.inventory-3d-panel__item-amount {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.inventory-3d-panel__item-servings {
  font-size: var(--font-size-xs);
  color: var(--color-accent-green-600);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

/* Guinea Pig Info Tab Styles */
.guinea-pig-info {
  padding: var(--spacing-sm);
}

.guinea-pig-info__header {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-block-end: var(--spacing-md);
  padding-block-end: var(--spacing-sm);
  border-block-end: 1px solid var(--color-border);
}

.guinea-pig-info__placeholder {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.guinea-pig-info__placeholder p {
  margin-block-end: var(--spacing-sm);
}

.guinea-pig-info__hint {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.guinea-pig-info__list {
  margin: var(--spacing-xs) 0 0 var(--spacing-md);
  padding: 0;
  list-style: disc;
}

.guinea-pig-info__list li {
  margin-block-end: var(--spacing-xs);
}
</style>
