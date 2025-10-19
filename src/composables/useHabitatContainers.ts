/**
 * Habitat Containers Composable
 * Phase 3 - Bowl and Hay Rack Management
 *
 * Manages food bowls and hay racks in the habitat:
 * - Food bowl contents and capacity
 * - Hay rack contents and serving tracking
 * - Adding/removing items from containers
 */

import { ref } from 'vue'
import { useSuppliesStore } from '../stores/suppliesStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { CONSUMPTION } from '../constants/supplies'
import { hasServingSystem } from '../utils/servingSystem'

// Types
interface FoodItem {
  itemId: string
  emoji: string
  name: string
}

interface HayServing {
  itemId: string
  instanceId: string
}

export function useHabitatContainers() {
  // State - Maps of container ID -> contents
  const bowlContents = ref<Map<string, FoodItem[]>>(new Map())
  const hayRackContents = ref<Map<string, HayServing[]>>(new Map())

  // ========================================================================
  // Bowl Management
  // ========================================================================

  function addFoodToBowl(bowlItemId: string, foodItemId: string): boolean {
    const suppliesStore = useSuppliesStore()
    const inventoryStore = useInventoryStore()

    // Check if food item is in inventory
    if (!inventoryStore.hasItem(foodItemId)) {
      console.warn(`Food item ${foodItemId} not in inventory`)
      return false
    }

    // Get bowl item to check capacity
    const bowlItem = suppliesStore.getItemById(bowlItemId)
    if (!bowlItem) {
      console.warn(`Bowl ${bowlItemId} not found`)
      return false
    }

    // Validate bowl is actually a bowl/bottle container
    if (bowlItem.subCategory !== 'bowls_bottles') {
      console.warn(`Item ${bowlItemId} is not a food bowl`)
      return false
    }

    const capacity = bowlItem.stats?.foodCapacity || CONSUMPTION.DEFAULT_FOOD_CAPACITY
    const currentContents = bowlContents.value.get(bowlItemId) || []

    // Check if bowl is full
    if (currentContents.length >= capacity) {
      console.warn(`Bowl is full (capacity: ${capacity})`)
      return false
    }

    // Get food item details
    const foodItem = suppliesStore.getItemById(foodItemId)
    if (!foodItem) {
      console.warn(`Food item ${foodItemId} not found`)
      return false
    }

    // Validate food type compatibility
    if (foodItem.category !== 'food') {
      console.warn(`Item ${foodItemId} is not food - bowls only accept food items`)
      return false
    }

    // Remove food from inventory (consume it)
    let removed = false

    if (hasServingSystem(foodItem)) {
      // Consume one serving
      removed = inventoryStore.consumeServing(foodItemId)
    } else {
      // Remove entire item (old system)
      removed = inventoryStore.removeItem(foodItemId, 1)
    }

    if (!removed) {
      console.warn(`Failed to remove ${foodItemId} from inventory`)
      return false
    }

    // Add food to bowl
    const updatedContents = [
      ...currentContents,
      {
        itemId: foodItemId,
        emoji: foodItem.emoji || '🍽️',
        name: foodItem.name
      }
    ]

    bowlContents.value.set(bowlItemId, updatedContents)
    console.log(`Added ${foodItem.name} to bowl (${updatedContents.length}/${capacity})`)
    return true
  }

  function removeFoodFromBowl(bowlItemId: string, foodItemId: string): boolean {
    const inventoryStore = useInventoryStore()
    const currentContents = bowlContents.value.get(bowlItemId)
    if (!currentContents) {
      console.warn(`Bowl ${bowlItemId} has no contents`)
      return false
    }

    const foodIndex = currentContents.findIndex(food => food.itemId === foodItemId)
    if (foodIndex === -1) {
      console.warn(`Food ${foodItemId} not found in bowl`)
      return false
    }

    // Add food back to inventory
    inventoryStore.addItem(foodItemId, 1)

    // Remove food from bowl
    const updatedContents = currentContents.filter((_, index) => index !== foodIndex)

    if (updatedContents.length === 0) {
      bowlContents.value.delete(bowlItemId)
    } else {
      bowlContents.value.set(bowlItemId, updatedContents)
    }

    console.log(`Removed food from bowl and returned to inventory`)
    return true
  }

  function getBowlContents(bowlItemId: string): FoodItem[] {
    return bowlContents.value.get(bowlItemId) || []
  }

  function clearBowl(bowlItemId: string): void {
    bowlContents.value.delete(bowlItemId)
  }

  // ========================================================================
  // Hay Rack Management
  // ========================================================================

  function addHayToRack(hayRackItemId: string, hayItemId: string): boolean {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Validate hay rack is actually a hay rack
    const hayRackItem = suppliesStore.getItemById(hayRackItemId)
    if (!hayRackItem || hayRackItem.subCategory !== 'bowls_bottles') {
      console.warn(`Item ${hayRackItemId} is not a hay rack`)
      return false
    }

    // Validate that this is actually a hay item
    const item = suppliesStore.getItemById(hayItemId)
    if (!item || item.category !== 'hay') {
      console.warn(`Item ${hayItemId} is not hay - hay racks only accept hay`)
      return false
    }

    // Check if hay item is in inventory
    const totalServings = inventoryStore.getTotalServings(hayItemId)
    if (totalServings <= 0) {
      console.warn(`No servings of ${hayItemId} in inventory`)
      return false
    }

    const currentContents = hayRackContents.value.get(hayRackItemId) || []

    // Check if hay rack is full
    if (currentContents.length >= CONSUMPTION.HAY_RACK_MAX_CAPACITY) {
      console.warn(`Hay rack is full (capacity: ${CONSUMPTION.HAY_RACK_MAX_CAPACITY})`)
      return false
    }

    // Consume one serving from inventory
    const consumed = inventoryStore.consumeServing(hayItemId)
    if (!consumed) {
      console.warn(`Failed to consume serving of ${hayItemId}`)
      return false
    }

    // Add hay serving to rack
    const updatedContents = [
      ...currentContents,
      {
        itemId: hayItemId,
        instanceId: `hay_${crypto.randomUUID()}`
      }
    ]

    hayRackContents.value.set(hayRackItemId, updatedContents)
    console.log(`Added hay to rack (${updatedContents.length}/${CONSUMPTION.HAY_RACK_MAX_CAPACITY})`)
    return true
  }

  function removeHayFromRack(hayRackItemId: string, servingIndex: number): boolean {
    const currentContents = hayRackContents.value.get(hayRackItemId)
    if (!currentContents || servingIndex >= currentContents.length) {
      console.warn(`Invalid hay rack or serving index`)
      return false
    }

    const serving = currentContents[servingIndex]
    const inventoryStore = useInventoryStore()

    // Add serving back to inventory
    inventoryStore.addConsumableWithServings(serving.itemId, 1)

    // Remove serving from rack
    const updatedContents = currentContents.filter((_, index) => index !== servingIndex)

    if (updatedContents.length === 0) {
      hayRackContents.value.delete(hayRackItemId)
    } else {
      hayRackContents.value.set(hayRackItemId, updatedContents)
    }

    console.log(`Removed hay from rack and returned to inventory`)
    return true
  }

  function getHayRackContents(hayRackItemId: string): HayServing[] {
    return hayRackContents.value.get(hayRackItemId) || []
  }

  function clearHayRack(hayRackItemId: string): void {
    hayRackContents.value.delete(hayRackItemId)
  }

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    // State
    bowlContents,
    hayRackContents,

    // Bowl methods
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,

    // Hay rack methods
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    clearHayRack
  }
}

// Export types for external use
export type { FoodItem, HayServing }
