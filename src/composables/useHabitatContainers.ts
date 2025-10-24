/**
 * Habitat Containers Composable
 * Phase 3 - Bowl and Hay Rack Management
 *
 * Manages food bowls and hay racks in the habitat:
 * - Food bowl contents and capacity
 * - Hay rack contents and serving tracking
 * - Hay freshness tracking per rack with decay
 * - Adding/removing items from containers
 *
 * Note: Uses singleton pattern for shared state to ensure
 * consistent data across all component instances.
 */

import { ref } from 'vue'
import { useSuppliesStore } from '../stores/suppliesStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { CONSUMPTION, CHEW_DEGRADATION } from '../constants/supplies'
import { hasServingSystem } from '../utils/servingSystem'

// Types
interface FoodItem {
  itemId: string
  emoji: string
  name: string
  freshness: number
  addedAt: number
}

interface HayServing {
  itemId: string
  instanceId: string
  addedAt: number
}

interface HayRackData {
  servings: HayServing[]
  freshness: number
  lastDecayUpdate: number
}

interface ChewData {
  durability: number      // 0-100%, physical condition
  usageCount: number      // Times chewed
  lastUsedAt: number      // Timestamp
  degradationRate: number // Per-use degradation %
}

// Shared state - singleton pattern to ensure same instance across all uses
const bowlContents = ref<Map<string, FoodItem[]>>(new Map())
const hayRackContents = ref<Map<string, HayRackData>>(new Map())
const chewItems = ref<Map<string, ChewData>>(new Map())

export function useHabitatContainers() {

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

    // Validate food type compatibility - bowls accept food and hay
    if (foodItem.category !== 'food' && foodItem.category !== 'hay') {
      console.warn(`Item ${foodItemId} is not food or hay - bowls only accept food and hay items`)
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
        name: foodItem.name,
        freshness: 100,
        addedAt: Date.now()
      }
    ]

    // Create new Map to trigger reactivity
    const newMap = new Map(bowlContents.value)
    newMap.set(bowlItemId, updatedContents)
    bowlContents.value = newMap
    return true
  }

  function removeFoodFromBowl(bowlItemId: string, foodIndex: number): boolean {
    const inventoryStore = useInventoryStore()
    const currentContents = bowlContents.value.get(bowlItemId)
    if (!currentContents) {
      console.warn(`Bowl ${bowlItemId} has no contents`)
      return false
    }

    if (foodIndex < 0 || foodIndex >= currentContents.length) {
      console.warn(`Invalid food index ${foodIndex} for bowl ${bowlItemId}`)
      return false
    }

    const foodItem = currentContents[foodIndex]

    // Add food back to inventory
    inventoryStore.addItem(foodItem.itemId, 1)

    // Remove food from bowl - create new array to trigger reactivity
    const updatedContents = currentContents.filter((_, index) => index !== foodIndex)

    // Create new Map to trigger Vue reactivity
    const newMap = new Map(bowlContents.value)
    if (updatedContents.length === 0) {
      newMap.delete(bowlItemId)
    } else {
      newMap.set(bowlItemId, updatedContents)
    }
    bowlContents.value = newMap
    return true
  }

  function getBowlContents(bowlItemId: string): FoodItem[] {
    return bowlContents.value.get(bowlItemId) || []
  }

  function clearBowl(bowlItemId: string): void {
    bowlContents.value.delete(bowlItemId)
  }

  function clearAllBowls(): void {
    bowlContents.value.clear()
  }

  function setFoodFreshness(bowlItemId: string, foodIndex: number, freshness: number): void {
    const currentContents = bowlContents.value.get(bowlItemId)
    if (!currentContents || foodIndex >= currentContents.length) {
      console.warn(`Invalid bowl or food index`)
      return
    }

    const updatedContents = currentContents.map((food, index) => {
      if (index === foodIndex) {
        return {
          ...food,
          freshness: Math.max(0, Math.min(100, freshness))
        }
      }
      return food
    })

    // Create new Map to trigger reactivity
    const newMap = new Map(bowlContents.value)
    newMap.set(bowlItemId, updatedContents)
    bowlContents.value = newMap
  }

  function applyFoodBowlDecay(decayAmount: number): void {
    const newMap = new Map(bowlContents.value)

    newMap.forEach((foods, bowlId) => {
      const updatedFoods = foods.map(food => ({
        ...food,
        freshness: Math.max(0, Math.min(100, food.freshness - decayAmount))
      }))

      newMap.set(bowlId, updatedFoods)
    })

    // Assign new Map to trigger Vue reactivity
    bowlContents.value = newMap
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

    const currentData = hayRackContents.value.get(hayRackItemId) || {
      servings: [],
      freshness: 100,
      lastDecayUpdate: Date.now()
    }

    // Check if hay rack is full
    if (currentData.servings.length >= CONSUMPTION.HAY_RACK_MAX_CAPACITY) {
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
    const updatedServings = [
      ...currentData.servings,
      {
        itemId: hayItemId,
        instanceId: `hay_${crypto.randomUUID()}`,
        addedAt: Date.now()
      }
    ]

    hayRackContents.value.set(hayRackItemId, {
      servings: updatedServings,
      freshness: currentData.freshness,
      lastDecayUpdate: currentData.lastDecayUpdate
    })
    return true
  }

  function removeHayFromRack(hayRackItemId: string, servingIndex: number): boolean {
    const currentData = hayRackContents.value.get(hayRackItemId)
    if (!currentData || servingIndex >= currentData.servings.length) {
      console.warn(`Invalid hay rack or serving index`)
      return false
    }

    const serving = currentData.servings[servingIndex]
    const inventoryStore = useInventoryStore()

    // Add serving back to inventory
    inventoryStore.addConsumableWithServings(serving.itemId, 1)

    // Remove serving from rack
    const updatedServings = currentData.servings.filter((_, index) => index !== servingIndex)

    if (updatedServings.length === 0) {
      hayRackContents.value.delete(hayRackItemId)
    } else {
      hayRackContents.value.set(hayRackItemId, {
        servings: updatedServings,
        freshness: currentData.freshness,
        lastDecayUpdate: currentData.lastDecayUpdate
      })
    }

    return true
  }

  function getHayRackContents(hayRackItemId: string): HayServing[] {
    const data = hayRackContents.value.get(hayRackItemId)
    return data?.servings || []
  }

  function getHayRackFreshness(hayRackItemId: string): number {
    const data = hayRackContents.value.get(hayRackItemId)
    return data?.freshness ?? 100
  }

  function setHayRackFreshness(hayRackItemId: string, freshness: number): void {
    const data = hayRackContents.value.get(hayRackItemId)

    // If hay rack doesn't exist in the map yet, initialize it
    const rackData = data || {
      servings: [],
      freshness: 100,
      lastDecayUpdate: Date.now()
    }

    // Create a new Map to trigger Vue reactivity
    const newMap = new Map(hayRackContents.value)
    newMap.set(hayRackItemId, {
      servings: rackData.servings,
      freshness: Math.max(0, Math.min(100, freshness)),
      lastDecayUpdate: rackData.lastDecayUpdate
    })
    hayRackContents.value = newMap
  }

  function clearHayRack(hayRackItemId: string): void {
    hayRackContents.value.delete(hayRackItemId)
  }

  function clearAllHayRacks(): void {
    hayRackContents.value.clear()
  }

  function applyHayRackDecay(decayAmount: number): void {
    const now = Date.now()
    const newMap = new Map(hayRackContents.value)

    newMap.forEach((data, rackId) => {
      // Apply decay
      const newFreshness = Math.max(0, Math.min(100, data.freshness - decayAmount))

      newMap.set(rackId, {
        servings: data.servings,
        freshness: newFreshness,
        lastDecayUpdate: now
      })
    })

    // Assign new Map to trigger Vue reactivity
    hayRackContents.value = newMap
  }

  // ========================================================================
  // Chew Item Management
  // ========================================================================

  /**
   * Initialize chew item tracking when placed in habitat
   */
  function initializeChewItem(chewItemId: string): void {
    const suppliesStore = useSuppliesStore()
    const chewItem = suppliesStore.getItemById(chewItemId)

    if (!chewItem) {
      console.warn(`Chew item ${chewItemId} not found`)
      return
    }

    // Determine degradation rate based on chew type
    let degradationRate: number = CHEW_DEGRADATION.APPLE_WOOD // Default
    const itemName = chewItem.name.toLowerCase()

    if (itemName.includes('willow')) {
      degradationRate = CHEW_DEGRADATION.WILLOW_STICK
    } else if (itemName.includes('apple')) {
      degradationRate = CHEW_DEGRADATION.APPLE_WOOD
    } else if (itemName.includes('mineral') || itemName.includes('stone')) {
      degradationRate = CHEW_DEGRADATION.MINERAL_CHEW
    }

    // Initialize fresh chew data
    const newMap = new Map(chewItems.value)
    newMap.set(chewItemId, {
      durability: 100,
      usageCount: 0,
      lastUsedAt: Date.now(),
      degradationRate
    })
    chewItems.value = newMap
  }

  /**
   * Use/chew an item, reducing its durability
   */
  function chewItem(chewItemId: string): boolean {
    const chewData = chewItems.value.get(chewItemId)

    if (!chewData) {
      console.warn(`Chew item ${chewItemId} not initialized`)
      return false
    }

    // Don't allow using unsafe chews
    if (chewData.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
      console.warn(`Chew item ${chewItemId} is unsafe to use (durability: ${chewData.durability}%)`)
      return false
    }

    // Reduce durability and update usage
    const newDurability = Math.max(0, chewData.durability - chewData.degradationRate)
    const newMap = new Map(chewItems.value)
    newMap.set(chewItemId, {
      ...chewData,
      durability: newDurability,
      usageCount: chewData.usageCount + 1,
      lastUsedAt: Date.now()
    })
    chewItems.value = newMap

    return true
  }

  /**
   * Get chew item data
   */
  function getChewData(chewItemId: string): ChewData | undefined {
    return chewItems.value.get(chewItemId)
  }

  /**
   * Get durability of a chew item
   */
  function getChewDurability(chewItemId: string): number {
    const data = chewItems.value.get(chewItemId)
    return data?.durability ?? 100
  }

  /**
   * Set chew durability (for debug controls)
   */
  function setChewDurability(chewItemId: string, durability: number): void {
    const chewData = chewItems.value.get(chewItemId)
    if (!chewData) {
      console.warn(`Chew item ${chewItemId} not found`)
      return
    }

    const newMap = new Map(chewItems.value)
    newMap.set(chewItemId, {
      ...chewData,
      durability: Math.max(0, Math.min(100, durability))
    })
    chewItems.value = newMap
  }

  /**
   * Remove chew item tracking when removed from habitat
   */
  function removeChewItem(chewItemId: string): void {
    const newMap = new Map(chewItems.value)
    newMap.delete(chewItemId)
    chewItems.value = newMap
  }

  /**
   * Get all chew items with unsafe durability
   */
  function getUnsafeChews(): string[] {
    const unsafeChews: string[] = []
    chewItems.value.forEach((data, itemId) => {
      if (data.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
        unsafeChews.push(itemId)
      }
    })
    return unsafeChews
  }

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    // State
    bowlContents,
    hayRackContents,
    chewItems,

    // Bowl methods
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    applyFoodBowlDecay,

    // Hay rack methods
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    setHayRackFreshness,
    clearHayRack,
    clearAllHayRacks,
    applyHayRackDecay,

    // Chew item methods
    initializeChewItem,
    chewItem,
    getChewData,
    getChewDurability,
    setChewDurability,
    removeChewItem,
    getUnsafeChews
  }
}

// Export types for external use
export type { FoodItem, HayServing, HayRackData, ChewData }
