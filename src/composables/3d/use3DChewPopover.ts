import { ref, computed } from 'vue'
import { useHabitatContainers } from '../useHabitatContainers'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { CHEW_DEGRADATION } from '../../constants/supplies'

export interface ChewPopoverData {
  itemId: string
  itemName: string
  itemEmoji: string
  durability: number
  usageCount: number
  lastUsedAt: number
}

/**
 * Composable for managing chew item popover menu in 3D view
 * Handles opening/closing menu, showing durability info, and remove/discard actions
 */
export function use3DChewPopover() {
  // Stores
  const habitatContainers = useHabitatContainers()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()
  const inventoryStore = useInventoryStore()

  // State
  const selectedChewId = ref<string | null>(null)
  const showChewPopover = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  // ============================================================================
  // Computed Properties
  // ============================================================================

  /**
   * Get data for the currently selected chew item
   */
  const currentChewData = computed((): ChewPopoverData | null => {
    if (!selectedChewId.value) return null

    const chewData = habitatContainers.getChewData(selectedChewId.value)
    if (!chewData) return null

    const item = suppliesStore.getItemById(selectedChewId.value)
    if (!item) return null

    return {
      itemId: selectedChewId.value,
      itemName: item.name,
      itemEmoji: item.emoji || '🪵',
      durability: chewData.durability,
      usageCount: chewData.usageCount,
      lastUsedAt: chewData.lastUsedAt
    }
  })

  /**
   * Check if current chew is unsafe (needs discarding)
   */
  const isUnsafe = computed(() => {
    if (!currentChewData.value) return false
    return currentChewData.value.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD
  })

  /**
   * Get durability status text
   */
  const durabilityStatus = computed(() => {
    if (!currentChewData.value) return 'Unknown'
    const durability = currentChewData.value.durability
    if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'Unsafe'
    if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'Degraded'
    if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'Worn'
    return 'Good'
  })

  /**
   * Get durability bar color class
   */
  const durabilityColorClass = computed(() => {
    if (!currentChewData.value) return ''
    const durability = currentChewData.value.durability
    if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'chew-popover__bar--unsafe'
    if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'chew-popover__bar--degraded'
    if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'chew-popover__bar--worn'
    return 'chew-popover__bar--good'
  })

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Open chew popover for a specific item
   */
  function openChewPopover(
    chewItemId: string,
    position: { x: number; y: number }
  ) {
    selectedChewId.value = chewItemId
    menuPosition.value = position
    showChewPopover.value = true
    console.log(`[use3DChewPopover] Opened popover for: ${chewItemId}`)
  }

  /**
   * Close the chew popover
   */
  function closeChewPopover() {
    showChewPopover.value = false
    selectedChewId.value = null
  }

  /**
   * Discard unsafe chew (permanently delete)
   * Note: Chews cannot be moved to inventory - they can only be discarded when unsafe
   */
  function handleDiscardChew() {
    if (!selectedChewId.value || !currentChewData.value) return

    const itemId = selectedChewId.value
    const itemName = currentChewData.value.itemName

    // Remove from habitat items
    habitatConditions.removeItemFromHabitat(itemId)

    // Remove from inventory entirely (not just unmark)
    inventoryStore.removeItem(itemId, 1)

    // Remove chew tracking data
    habitatContainers.removeChewItem(itemId)

    loggingStore.addPlayerAction(
      `Discarded unsafe ${itemName}`,
      '🗑️'
    )

    console.log(`[use3DChewPopover] Discarded unsafe chew: ${itemId}`)
    closeChewPopover()
  }

  /**
   * Check if popover is currently open
   */
  function isOpen(): boolean {
    return showChewPopover.value
  }

  return {
    // State
    selectedChewId,
    showChewPopover,
    menuPosition,

    // Computed
    currentChewData,
    isUnsafe,
    durabilityStatus,
    durabilityColorClass,

    // Functions
    openChewPopover,
    closeChewPopover,
    handleDiscardChew,
    isOpen
  }
}
