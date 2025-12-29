import { ref } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import type { use3DHabitatCare } from './use3DHabitatCare'

/**
 * Composable for managing water bottle menu and interactions
 * Handles opening/closing menu and refill actions
 */
export function use3DWaterBottle() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()

  // State refs (reactive for UI)
  const showWaterBottleMenu = ref(false)
  const waterBottleMenuPosition = ref({ x: 0, y: 0 })

  // Internal state (non-reactive)
  let itemModels: Map<string, THREE.Group> | null = null
  let habitatCare: ReturnType<typeof use3DHabitatCare> | null = null

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Initialize the water bottle system with THREE.js references
   */
  function init(
    itemModelsRef: Map<string, THREE.Group>,
    habitatCareRef: ReturnType<typeof use3DHabitatCare>
  ) {
    itemModels = itemModelsRef
    habitatCare = habitatCareRef
    console.log('[use3DWaterBottle] Initialized')
  }

  /**
   * Dispose the water bottle system
   */
  function dispose() {
    showWaterBottleMenu.value = false
    itemModels = null
    habitatCare = null
    console.log('[use3DWaterBottle] Disposed')
  }

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Find the water bottle model in the scene
   */
  function findWaterBottleModel(): THREE.Group | null {
    if (!itemModels) return null

    for (const [itemId, model] of itemModels.entries()) {
      const item = suppliesStore.getItemById(itemId)
      if (item?.stats?.itemType === 'water_bottle') {
        return model
      }
    }
    return null
  }

  /**
   * Open the water bottle menu at the specified position
   */
  function openMenu(position: { x: number; y: number }) {
    showWaterBottleMenu.value = true
    waterBottleMenuPosition.value = position
    console.log('[use3DWaterBottle] Opened menu')
  }

  /**
   * Close the water bottle menu
   */
  function closeMenu() {
    showWaterBottleMenu.value = false
  }

  /**
   * Handle refilling the water bottle
   */
  function handleRefill() {
    if (!habitatCare) {
      console.warn('[use3DWaterBottle] Cannot refill - habitatCare not initialized')
      return
    }

    const previousLevel = habitatConditions.waterLevel
    habitatConditions.refillWater()
    const amountFilled = 100 - previousLevel
    console.log('[use3DWaterBottle] Water bottle refilled')
    closeMenu()

    // Log player action
    if (amountFilled >= 1) {
      loggingStore.addPlayerAction(`Refilled water bottle (+${amountFilled.toFixed(0)}%)`, '💧')
    }

    // Show result dialog (using habitatCare composable's dialog)
    habitatCare.actionResultIcon.value = '💧'
    habitatCare.actionResultTitle.value = 'Water Refilled!'
    habitatCare.actionResultMessage.value = amountFilled < 1
      ? 'The water bottle was already full!'
      : ''
    habitatCare.actionResultStats.value = amountFilled >= 1
      ? [
          { label: 'Water Added', value: `${amountFilled.toFixed(0)}%` },
          { label: 'Water Level', value: '100%' }
        ]
      : [{ label: 'Water Level', value: '100%' }]
    habitatCare.showActionResultDialog.value = true
  }

  /**
   * Check if menu is currently open
   */
  function isMenuOpen(): boolean {
    return showWaterBottleMenu.value
  }

  return {
    // State
    showWaterBottleMenu,
    waterBottleMenuPosition,

    // Lifecycle
    init,
    dispose,

    // Functions
    findWaterBottleModel,
    openMenu,
    closeMenu,
    handleRefill,
    isMenuOpen
  }
}
