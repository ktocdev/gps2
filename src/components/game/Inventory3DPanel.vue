<template>
  <SidePanel3D
    :is-open="isOpen"
    side="right"
    color="violet"
    title="Inventory"
    icon="🎒"
    @toggle="$emit('toggle')"
  >
    <template #header-extra>
      <span class="inventory-3d-panel__count">{{ totalItemCount }} items</span>
    </template>

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
            'inventory-3d-panel__item--has-servings': item.hasServings
          }"
          @click="handleItemClick(item)"
          :title="item.name"
        >
          <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
          <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
          <span v-if="item.hasServings" class="inventory-3d-panel__item-servings">
            {{ item.servingsRemaining }}/{{ item.maxServings }}
          </span>
          <span v-else-if="item.quantity > 1" class="inventory-3d-panel__item-quantity">
            ×{{ item.quantity }}
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
  </SidePanel3D>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SidePanel3D from './SidePanel3D.vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  selectItem: [itemId: string]
}>()

const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

const selectedItemId = ref<string | null>(null)

// Computed: Total item count
const totalItemCount = computed(() => {
  return inventoryStore.allItems.reduce((sum, item) => sum + item.quantity, 0)
})

// Computed: Food & Consumables (hay, food items with servings)
const consumableItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    quantity: number
    hasServings: boolean
    servingsRemaining?: number
    maxServings?: number
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    // Include hay and food categories
    if (supplyItem.category === 'hay' || supplyItem.category === 'food') {
      const hasServings = supplyItem.stats?.servings !== undefined

      if (hasServings) {
        // Get total servings across all instances
        const totalServings = inventoryStore.getTotalServings(invItem.itemId)
        const maxServingsPerItem = supplyItem.stats?.servings || 1

        items.push({
          itemId: invItem.itemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '🍽️',
          quantity: invItem.quantity,
          hasServings: true,
          servingsRemaining: totalServings,
          maxServings: maxServingsPerItem * invItem.quantity
        })
      } else {
        items.push({
          itemId: invItem.itemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '🍽️',
          quantity: invItem.quantity,
          hasServings: false
        })
      }
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

// Handle item click
function handleItemClick(item: { itemId: string }) {
  if (selectedItemId.value === item.itemId) {
    selectedItemId.value = null
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
  background-color: var(--color-accent-violet-50);
}

.inventory-3d-panel__item--readonly {
  cursor: default;
  opacity: 0.7;
}

.inventory-3d-panel__item--readonly:hover {
  background-color: var(--color-bg-secondary);
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

/* Serving-based item styling */
.inventory-3d-panel__item--has-servings {
  border-inline-start: 3px solid var(--color-accent-green-500);
}
</style>
