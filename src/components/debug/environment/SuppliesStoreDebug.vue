<template>
  <div class="supplies-store-debug">
    <div class="panel panel--compact">
      <div class="supplies-store-debug__header">
        <h2 class="panel__heading">Supplies Store</h2>
        <div class="supplies-store-debug__balance">
          <span class="text-label">Balance:</span>
          <span class="supplies-store-debug__balance-amount">{{ playerProgression.formattedCurrency }}</span>
        </div>
      </div>

      <div class="panel__section">
        <div v-if="purchaseMessage" :class="['supplies-store-debug__message', `supplies-store-debug__message--${purchaseMessage.type}`]">
          {{ purchaseMessage.text }}
        </div>
      </div>

      <!-- Department Navigation -->
      <div class="panel__section mb-8">
        <h3 class="panel__subheading">Departments</h3>
        <div class="supplies-store-debug__departments">
          <Button
            v-for="dept in departments"
            :key="dept.id"
            :variant="activeDepartment === dept.id ? 'primary' : 'secondary'"
            size="sm"
            @click="activeDepartment = dept.id"
          >
            {{ dept.icon }} {{ dept.label }}
          </Button>
        </div>
      </div>

      <!-- Food Items - Organized by Subcategory -->
      <div v-if="activeDepartment === 'food'" class="panel__section">
        <h3 class="panel__subheading sr-only">Food Items</h3>
        <SubTabContainer :tabs="foodSubTabs" v-model="activeFoodSubTab">
          <template #greens>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.greens"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #herbs>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.herbs"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #vegetables>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.vegetables"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #fruits>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.fruits"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #pellets>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.pellets"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #treats>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.treats"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>
        </SubTabContainer>
      </div>

      <!-- Habitat Items - Organized by Subcategory -->
      <div v-else-if="activeDepartment === 'habitat_item'" class="panel__section">
        <h3 class="panel__subheading sr-only">Habitat Items</h3>
        <SubTabContainer :tabs="habitatSubTabs" v-model="activeHabitatSubTab">
          <template #hideaways>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.hideaways"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #toys>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.toys"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #chews>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.chews"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #bowls_bottles>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.bowlsAndBottles"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>

          <template #enrichment>
            <div class="supplies-store-debug__items">
              <SupplyItemCard
                v-for="item in suppliesStore.enrichment"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </div>
          </template>
        </SubTabContainer>
      </div>

      <!-- Other Categories - Simple List -->
      <div v-else class="panel__section">
        <h3 class="panel__subheading sr-only">{{ activeDepartmentLabel }}</h3>
        <div class="supplies-store-debug__items">
          <SupplyItemCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :quantity="getPurchaseQuantity(item.id)"
            :current-balance="playerProgression.currency"
            :owned="inventoryStore.getItemQuantity(item.id)"
            :returnable="getItemDetails(item.id).returnable"
            :is-opened="getItemDetails(item.id).isOpened"
            :placed-count="getItemDetails(item.id).placedCount"
            @purchase="handlePurchase"
            @sellback="handleSellBack"
            @update:quantity="setPurchaseQuantity"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { usePlayerProgression } from '../../../stores/playerProgression'
import { useInventoryStore } from '../../../stores/inventoryStore'
import Button from '../../basic/Button.vue'
import SubTabContainer from '../../layout/SubTabContainer.vue'
import SupplyItemCard from '../../game/shop/SupplyItemCard.vue'

const suppliesStore = useSuppliesStore()
const playerProgression = usePlayerProgression()
const inventoryStore = useInventoryStore()

// Purchase state
const purchaseQuantities = ref<Record<string, number>>({})
const purchaseMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const getPurchaseQuantity = (itemId: string): number => {
  return purchaseQuantities.value[itemId] || 1
}

const setPurchaseQuantity = (itemId: string, quantity: number) => {
  purchaseQuantities.value[itemId] = Math.max(1, Math.min(99, quantity))
}

const handlePurchase = (itemId: string) => {
  const quantity = getPurchaseQuantity(itemId)
  const result = suppliesStore.purchaseItem(itemId, quantity)

  purchaseMessage.value = {
    text: result.message,
    type: result.success ? 'success' : 'error'
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    purchaseMessage.value = null
  }, 3000)

  // Reset quantity to 1 after successful purchase
  if (result.success) {
    purchaseQuantities.value[itemId] = 1
  }
}

const handleSellBack = (itemId: string) => {
  const quantity = getPurchaseQuantity(itemId)
  const result = inventoryStore.sellBackItem(itemId, quantity)

  purchaseMessage.value = {
    text: result.message,
    type: result.success ? 'success' : 'error'
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    purchaseMessage.value = null
  }, 3000)

  // Reset quantity to 1 after successful sell
  if (result.success) {
    purchaseQuantities.value[itemId] = 1
  }
}

const getItemDetails = (itemId: string) => {
  return {
    returnable: inventoryStore.getReturnableQuantity(itemId),
    isOpened: inventoryStore.getOpenedCount(itemId) > 0,
    placedCount: inventoryStore.getPlacedCount(itemId)
  }
}

// Department navigation
const activeDepartment = ref<'featured' | 'bedding' | 'hay' | 'food' | 'habitat_item' | 'all'>('featured')

const departments = [
  { id: 'featured' as const, label: 'Featured', icon: '⭐' },
  { id: 'bedding' as const, label: 'Bedding', icon: '🛏️' },
  { id: 'hay' as const, label: 'Hay', icon: '🌾' },
  { id: 'food' as const, label: 'Food', icon: '🥗' },
  { id: 'habitat_item' as const, label: 'Habitat Items', icon: '🏠' },
  { id: 'all' as const, label: 'All Items', icon: '🛍️' }
]

const activeDepartmentLabel = computed(() => {
  const dept = departments.find((d) => d.id === activeDepartment.value)
  if (!dept) return 'All Items'
  // Don't add "Items" suffix to "All Items" or "Featured"
  if (dept.id === 'all' || dept.id === 'featured') {
    return dept.label
  }
  return `${dept.label} Items`
})

const filteredItems = computed(() => {
  if (activeDepartment.value === 'all') {
    return suppliesStore.catalog
  }
  if (activeDepartment.value === 'featured') {
    // Show 12 featured items: treats, seasonal items, and select toys/hideouts
    const treats = suppliesStore.treats.slice(0, 3)
    const seasonal = suppliesStore.catalog.filter((item) => item.availability === 'seasonal').slice(0, 3)
    const toys = suppliesStore.toys.slice(0, 3)
    const hideaways = suppliesStore.hideaways.slice(0, 3)

    return [...treats, ...seasonal, ...toys, ...hideaways].slice(0, 12)
  }
  return suppliesStore.catalog.filter((item) => item.category === activeDepartment.value)
})

// Food subcategory tabs
const activeFoodSubTab = ref('greens')
const foodSubTabs = [
  { id: 'greens', label: 'Greens', icon: '🥬' },
  { id: 'herbs', label: 'Herbs', icon: '🌿' },
  { id: 'vegetables', label: 'Veggies', icon: '🥕' },
  { id: 'fruits', label: 'Fruits', icon: '🍓' },
  { id: 'pellets', label: 'Pellets', icon: '🌾' },
  { id: 'treats', label: 'Treats', icon: '🍪' }
]

// Habitat subcategory tabs
const activeHabitatSubTab = ref('hideaways')
const habitatSubTabs = [
  { id: 'hideaways', label: 'Hideaways', icon: '🏠' },
  { id: 'toys', label: 'Toys', icon: '🎾' },
  { id: 'chews', label: 'Chews', icon: '🦷' },
  { id: 'bowls_bottles', label: 'Bowls & Bottles', icon: '🍽️' },
  { id: 'enrichment', label: 'Enrichment', icon: '🎨' }
]

// Initialize catalog on mount
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }
})
</script>

<style>
/* Supplies Store Debug Styles */
.supplies-store-debug {
  container-type: inline-size;
  container-name: supplies-store-debug;
}

.supplies-store-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.supplies-store-debug__header .panel__heading {
  margin-block-end: 0;
}

.supplies-store-debug__departments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.supplies-store-debug__balance {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-secondary-bg) 100%);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.supplies-store-debug__balance-amount {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  color: var(--color-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.supplies-store-debug__message {
  margin-block-start: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.supplies-store-debug__message--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.supplies-store-debug__message--error {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.supplies-store-debug__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Container queries for responsive layout */
@container supplies-store-debug (min-width: 641px) {
  .supplies-store-debug__items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@container supplies-store-debug (min-width: 961px) {
  .supplies-store-debug__items {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
