import { ref, computed } from 'vue'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useHabitatConditions } from '../../stores/habitatConditions'

export interface ItemPopoverData {
  itemId: string
  itemName: string
  itemEmoji: string
  subCategory: string
}

// Item subcategories that can be removed via this popover
const REMOVABLE_SUBCATEGORIES = ['hideaways', 'toys', 'enrichment']

/**
 * Composable for managing general item popover menu in 3D view
 * Handles removal of habitat items (toys, hideaways, enrichment) back to inventory
 */
export function use3DItemPopover() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()
  const inventoryStore = useInventoryStore()

  // State
  const selectedItemId = ref<string | null>(null)
  const showItemPopover = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  /**
   * Get data for the currently selected item
   */
  const currentItemData = computed((): ItemPopoverData | null => {
    if (!selectedItemId.value) return null

    const item = suppliesStore.getItemById(selectedItemId.value)
    if (!item) return null

    return {
      itemId: selectedItemId.value,
      itemName: item.name,
      itemEmoji: item.emoji || '📦',
      subCategory: item.subCategory || ''
    }
  })

  /**
   * Check if an item can be removed via this popover
   */
  function canRemoveItem(itemId: string): boolean {
    const item = suppliesStore.getItemById(itemId)
    if (!item) return false

    // Only handle specific subcategories
    return REMOVABLE_SUBCATEGORIES.includes(item.subCategory || '')
  }

  /**
   * Open item popover for a specific item
   */
  function openItemPopover(
    itemId: string,
    position: { x: number; y: number }
  ) {
    if (!canRemoveItem(itemId)) {
      console.log(`[use3DItemPopover] Item ${itemId} not removable via this popover`)
      return false
    }

    selectedItemId.value = itemId
    menuPosition.value = position
    showItemPopover.value = true
    console.log(`[use3DItemPopover] Opened popover for: ${itemId}`)
    return true
  }

  /**
   * Close the item popover
   */
  function closeItemPopover() {
    showItemPopover.value = false
    selectedItemId.value = null
  }

  /**
   * Remove item from habitat (return to inventory)
   */
  function handleRemoveItem() {
    if (!selectedItemId.value || !currentItemData.value) return

    const itemId = selectedItemId.value
    const itemName = currentItemData.value.itemName
    const emoji = currentItemData.value.itemEmoji

    // Remove from habitat items
    habitatConditions.removeItemFromHabitat(itemId)

    // Unmark as placed in inventory
    inventoryStore.unmarkAsPlacedInHabitat(itemId)

    loggingStore.addPlayerAction(
      `Removed ${itemName} from habitat`,
      emoji
    )

    console.log(`[use3DItemPopover] Removed item: ${itemId}`)
    closeItemPopover()
  }

  /**
   * Check if popover is currently open
   */
  function isOpen(): boolean {
    return showItemPopover.value
  }

  return {
    // State
    selectedItemId,
    showItemPopover,
    menuPosition,

    // Computed
    currentItemData,

    // Functions
    canRemoveItem,
    openItemPopover,
    closeItemPopover,
    handleRemoveItem,
    isOpen
  }
}
