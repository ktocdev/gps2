<template>
  <div
    class="habitat-sidebar inventory-sidebar"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @touchmove.prevent="handleTouchMoveOnSidebar"
    @touchend="handleTouchEndOnSidebar"
    :class="{ 'inventory-sidebar--drop-target': isDragOver || isTouchOver }"
  >
    <div class="inventory-sidebar__header">
      <h3>🎒 Inventory</h3>
    </div>
    <div class="inventory-sidebar__items">
      <!-- Serving-based consumables -->
      <InventoryTileServing
        v-for="item in servingBasedItems"
        :key="item.itemId"
        :item-id="item.itemId"
        :name="item.name"
        :emoji="item.emoji"
        :servings-remaining="item.servingsRemaining"
        :max-servings="item.maxServings"
        :instance-count="item.instanceCount"
        :is-disabled="item.isDisabled"
        :tooltip-message="item.tooltipMessage"
        @dragstart="(_itemId, event) => handleServingDragStart(event, item)"
        @dragend="handleDragEnd"
        @touchstart="(_itemId, event) => handleServingTouchStart(event, item)"
        @touchmove="(_itemId, event) => handleServingTouchMove(event, item)"
        @touchend="(_itemId, event) => handleServingTouchEnd(event, item)"
      />

      <!-- Regular habitat items and food -->
      <div
        v-for="item in regularItems"
        :key="item.id"
        class="inventory-sidebar__item-card"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd"
        @touchstart="handleRegularTouchStart($event, item)"
        @touchmove="handleRegularTouchMove($event, item)"
        @touchend="handleRegularTouchEnd($event, item)"
      >
        <span class="inventory-sidebar__item-emoji no-select">{{ item.emoji }}</span>
        <span class="inventory-sidebar__item-name no-select">{{ item.name }}</span>
        <span v-if="item.availableCount > 1" class="inventory-sidebar__item-count no-select">×{{ item.availableCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHabitatConditions } from '../../../../stores/habitatConditions'
import { useInventoryStore } from '../../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../../stores/suppliesStore'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import InventoryTileServing from '../../shop/InventoryTileServing.vue'

interface Props {
  habitatVisualRef?: any
}

const props = defineProps<Props>()

const habitat = useHabitatConditions()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const guineaPigStore = useGuineaPigStore()

const isDragOver = ref(false)
const isTouchOver = ref(false)

// Touch state
const activeTouchItem = ref<{
  itemId: string
  instanceId?: string
  isServingBased: boolean
  size: { width: number; height: number }
} | null>(null)

// Get the first active guinea pig for consumption limit checks
const activeGuineaPig = computed(() => {
  const activeIds = guineaPigStore.collection.activeGuineaPigIds
  if (activeIds.length === 0) return null
  return guineaPigStore.getGuineaPig(activeIds[0])
})

// Serving-based consumables (hay, lettuce, carrots)
const servingBasedItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Only show items with serving metadata
      return item?.stats?.servings !== undefined
    })
    .map(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Filter instances with servings remaining
      const availableInstances = invItem.instances.filter(
        inst => inst.servingsRemaining !== undefined && inst.servingsRemaining > 0
      )

      // Use first instance for display, but show count of all instances
      const firstInstance = availableInstances[0]

      // Check food consumption limits
      const subCategory = item?.subCategory || ''
      const foodType = guineaPigStore.getFoodTypeFromSubCategory(subCategory)
      let isDisabled = false
      let tooltipMessage = ''

      if (activeGuineaPig.value && foodType && item?.category === 'food') {
        const canFeed = guineaPigStore.checkConsumptionLimit(activeGuineaPig.value.id, foodType)
        if (!canFeed) {
          isDisabled = true
          tooltipMessage = `Food limit reached (5 servings per hunger cycle)`
        }
      }

      return {
        instanceId: firstInstance?.instanceId || '',
        itemId: invItem.itemId,
        name: item?.name || 'Unknown',
        emoji: item?.emoji || '📦',
        servingsRemaining: firstInstance?.servingsRemaining || 0,
        maxServings: firstInstance?.maxServings || 0,
        instanceCount: availableInstances.length,
        isDisabled,
        tooltipMessage
      }
    })
    .filter(item => item.instanceCount > 0) // Only show if at least one instance exists
})

// Regular habitat items and non-serving food
const regularItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Show habitat items and food WITHOUT serving metadata
      const isPlaceable = item?.category === 'habitat_item' || item?.category === 'food'
      const hasNoServings = item?.stats?.servings === undefined
      return isPlaceable && hasNoServings
    })
    .map(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Count how many are in habitat vs available
      const inHabitatCount = habitat.habitatItems.filter((id: string) => id === invItem.itemId).length
      const availableCount = invItem.quantity - inHabitatCount

      return {
        id: invItem.itemId,
        name: item?.name || 'Unknown',
        emoji: item?.emoji || '📦',
        size: getItemSize(item),
        quantity: invItem.quantity,
        availableCount
      }
    })
    .filter(item => item.availableCount > 0) // Only show if at least one is available
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
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.itemId, { width: 1, height: 1 })
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

  // Create custom drag image with only the emoji
  const dragImage = document.createElement('div')
  dragImage.textContent = item.emoji || '📦'
  dragImage.style.fontSize = '2rem'
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 16, 16)

  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)

  // Notify HabitatVisual about the drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.id, item.size)
  }

  // Visual feedback
  const target = event.target as HTMLElement
  target.style.opacity = '0.5'
}

function handleDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.style.opacity = '1'

  // Clear dragged item
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Inventory drop zone handlers
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const itemData = event.dataTransfer?.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const itemId = data.itemId
    const isRepos = data.isRepositioning || false

    // Only handle items being dragged FROM the habitat (repositioning = true)
    if (!isRepos) {
      console.log('Item is from inventory, not habitat. Ignoring drop.')
      return
    }

    // Check if item is a bowl or hay rack with contents
    const isBowl = itemId.includes('bowl') || itemId.includes('dish')
    const isHayRack = itemId.includes('hay_rack')

    if (isBowl && habitat.getBowlContents(itemId).length > 0) {
      console.warn('Cannot remove bowl with food. Clear it first.')
      return
    }

    if (isHayRack && habitat.getHayRackContents(itemId).length > 0) {
      console.warn('Cannot remove hay rack with hay. Clear it first.')
      return
    }

    // Remove item from habitat and return to inventory
    const success = habitat.removeItemFromHabitat(itemId)
    if (success) {
      console.log(`Removed ${itemId} from habitat and returned to inventory`)
    }
  } catch (e) {
    console.error('Error parsing drag data:', e)
  }
}

// Touch handlers for serving-based items
function handleServingTouchStart(_event: TouchEvent, item: any) {
  activeTouchItem.value = {
    itemId: item.itemId,
    instanceId: item.instanceId,
    isServingBased: true,
    size: { width: 1, height: 1 }
  }

  // Notify HabitatVisual about the touch drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.itemId, { width: 1, height: 1 })
  }
}

function handleServingTouchMove(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to update hover cell based on touch position
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchMove(event)
  }
}

function handleServingTouchEnd(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to complete the drop
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchEnd(event, activeTouchItem.value)
  }

  // Clear touch state
  activeTouchItem.value = null
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Touch handlers for regular items
function handleRegularTouchStart(_event: TouchEvent, item: any) {
  activeTouchItem.value = {
    itemId: item.id,
    isServingBased: false,
    size: item.size
  }

  // Notify HabitatVisual about the touch drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.id, item.size)
  }
}

function handleRegularTouchMove(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to update hover cell based on touch position
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchMove(event)
  }
}

function handleRegularTouchEnd(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to complete the drop
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchEnd(event, activeTouchItem.value)
  }

  // Clear touch state
  activeTouchItem.value = null
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Touch handlers for sidebar drop zone
function handleTouchMoveOnSidebar(event: TouchEvent) {
  if (!activeTouchItem.value) return

  // Check if touch is over sidebar
  const sidebar = event.currentTarget as HTMLElement
  const rect = sidebar.getBoundingClientRect()
  const touch = event.touches[0]

  if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
    isTouchOver.value = true
  } else {
    isTouchOver.value = false
  }
}

function handleTouchEndOnSidebar(_event: TouchEvent) {
  if (!isTouchOver.value || !activeTouchItem.value) {
    isTouchOver.value = false
    return
  }

  isTouchOver.value = false

  // Only handle items being dragged FROM the habitat (not from inventory)
  // This is determined in HabitatVisual - if the touch originated from
  // a placed item, it will have repositioning metadata
  // For now, we'll let HabitatVisual handle the drop logic
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.inventory-sidebar {
  transition: background 0.2s ease, border-color 0.2s ease;
}

.inventory-sidebar--drop-target {
  background: rgba(16, 185, 129, 0.15);
  border-color: var(--color-success);
  box-shadow: inset 0 2px 8px rgba(16, 185, 129, 0.2), 0 0 0 2px var(--color-success);
}

.inventory-sidebar__header {
  padding: var(--space-4);
  border-block-end: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.inventory-sidebar__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.inventory-sidebar__items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
}

.inventory-sidebar__item-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  cursor: grab;
  transition: all 0.2s ease;
  flex: 0 0 auto;
  min-inline-size: 0;
}

.inventory-sidebar__item-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.inventory-sidebar__item-card:active {
  cursor: grabbing;
}

.inventory-sidebar__item-emoji {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.inventory-sidebar__item-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inventory-sidebar__item-count {
  position: absolute;
  inset-block-start: calc(var(--space-1) * -0.5);
  inset-inline-end: var(--space-1);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  line-height: 1;
  box-shadow: var(--shadow-sm);
}
</style>
