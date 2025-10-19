/**
 * Inventory Store - System 11
 * Phase 3.11 - Habitat & Environment
 *
 * Manages player's owned items including:
 * - Habitat items (furniture, toys, etc.)
 * - Consumables (food, bedding, hay)
 * - Quantities and usage tracking
 */

import { defineStore } from 'pinia'
import type { InventoryItem, InventoryState, SellBackResult } from '../types/supplies'
import { useSuppliesStore } from './suppliesStore'
import { usePlayerProgression } from './playerProgression'

function generateInstanceId(): string {
  return `instance_${crypto.randomUUID()}`
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: [],
    maxSlots: undefined
  }),

  getters: {
    // ========================================================================
    // Item Queries
    // ========================================================================

    getItemQuantity: (state) => (itemId: string): number => {
      const inventoryItem = state.items.find((item) => item.itemId === itemId)
      return inventoryItem?.instances.length || 0
    },

    hasItem: (state) => (itemId: string): boolean => {
      return state.items.some((item) => item.itemId === itemId && item.instances.length > 0)
    },

    allItems: (state): InventoryItem[] => {
      return state.items.filter((item) => item.instances.length > 0)
    },

    totalItemCount(): number {
      return this.allItems.reduce((sum, item) => sum + item.instances.length, 0)
    },

    // ========================================================================
    // Category-Specific Getters
    // ========================================================================

    consumables(): InventoryItem[] {
      const suppliesStore = useSuppliesStore()
      return this.allItems.filter((item) => {
        const supplyItem = suppliesStore.getItemById(item.itemId)
        return supplyItem?.category === 'bedding' || supplyItem?.category === 'hay' || supplyItem?.category === 'food'
      })
    },

    habitatItems(): InventoryItem[] {
      const suppliesStore = useSuppliesStore()
      return this.allItems.filter((item) => {
        const supplyItem = suppliesStore.getItemById(item.itemId)
        return supplyItem?.category === 'habitat_item'
      })
    },

    // ========================================================================
    // Instance Counts
    // ========================================================================

    getOpenedCount() {
      return (itemId: string): number => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return 0
        return inventoryItem.instances.filter(inst => inst.isOpened).length
      }
    },

    getUnopenedCount() {
      return (itemId: string): number => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return 0
        return inventoryItem.instances.filter(inst => !inst.isOpened).length
      }
    },

    getPlacedCount() {
      return (itemId: string): number => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return 0
        return inventoryItem.instances.filter(inst => inst.isPlacedInHabitat).length
      }
    },

    getUnplacedCount() {
      return (itemId: string): number => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return 0
        return inventoryItem.instances.filter(inst => !inst.isPlacedInHabitat).length
      }
    },

    // ========================================================================
    // Inventory with Item Details
    // ========================================================================

    inventoryWithDetails(): Array<InventoryItem & { item: import('../types/supplies').SuppliesItem | undefined }> {
      const suppliesStore = useSuppliesStore()
      const items = this.allItems
      return items.map((invItem: InventoryItem) => ({
        ...invItem,
        item: suppliesStore.getItemById(invItem.itemId)
      })).filter((item: { item: import('../types/supplies').SuppliesItem | undefined }) => item.item !== undefined)
    },

    // ========================================================================
    // Sell-Back Eligibility
    // ========================================================================

    getReturnableQuantity() {
      return (itemId: string): number => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return 0

        // Count instances that are not opened and not placed
        return inventoryItem.instances.filter(inst => !inst.isOpened && !inst.isPlacedInHabitat).length
      }
    },

    canSellBack() {
      return (itemId: string, quantity: number = 1): boolean => {
        const inventoryItem = this.allItems.find((item) => item.itemId === itemId)
        if (!inventoryItem) return false

        const returnableCount = inventoryItem.instances.filter(
          inst => !inst.isOpened && !inst.isPlacedInHabitat
        ).length
        return returnableCount >= quantity
      }
    }
  },

  actions: {
    // ========================================================================
    // Add Items
    // ========================================================================

    addItem(itemId: string, quantity: number = 1): void {
      let inventoryItem = this.items.find((item) => item.itemId === itemId)

      if (!inventoryItem) {
        inventoryItem = {
          itemId,
          instances: [],
          quantity: 0
        }
        this.items.push(inventoryItem)
      }

      // Create new instances
      for (let i = 0; i < quantity; i++) {
        inventoryItem.instances.push({
          instanceId: generateInstanceId(),
          acquiredAt: Date.now()
        })
      }

      // Update quantity
      inventoryItem.quantity = inventoryItem.instances.length

      console.log(`✅ Added ${quantity}x ${itemId} to inventory`)
    },

    // ========================================================================
    // Remove/Use Items
    // ========================================================================

    removeItem(itemId: string, quantity: number = 1): boolean {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)

      if (!inventoryItem || inventoryItem.instances.length < quantity) {
        console.warn(`⚠️ Cannot remove ${quantity}x ${itemId} - insufficient quantity`)
        return false
      }

      // Remove instances (FIFO - oldest first)
      const removed = inventoryItem.instances.splice(0, quantity)
      removed.forEach(inst => inst.lastUsedAt = Date.now())

      // Update quantity
      inventoryItem.quantity = inventoryItem.instances.length

      // Remove from inventory if no instances left
      if (inventoryItem.instances.length === 0) {
        this.items = this.items.filter((item) => item.itemId !== itemId)
      }

      console.log(`✅ Removed ${quantity}x ${itemId} from inventory`)
      return true
    },

    useItem(itemId: string, quantity: number = 1): boolean {
      return this.removeItem(itemId, quantity)
    },

    // ========================================================================
    // Bulk Operations
    // ========================================================================

    addMultipleItems(items: { itemId: string; quantity: number }[]): void {
      items.forEach(({ itemId, quantity }) => {
        this.addItem(itemId, quantity)
      })
    },

    // ========================================================================
    // Sell Back Items (100% refund for returnable items)
    // ========================================================================

    sellBackItem(itemId: string, quantity: number = 1): SellBackResult {
      const suppliesStore = useSuppliesStore()
      const playerProgression = usePlayerProgression()

      const supplyItem = suppliesStore.getItemById(itemId)
      if (!supplyItem) {
        return {
          success: false,
          message: 'Item not found in supplies catalog'
        }
      }

      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem) {
        return {
          success: false,
          message: 'Item not found in inventory'
        }
      }

      // Find returnable instances (not opened, not placed)
      const returnableInstances = inventoryItem.instances.filter(
        inst => !inst.isOpened && !inst.isPlacedInHabitat
      )

      if (returnableInstances.length < quantity) {
        return {
          success: false,
          message: `Not enough returnable items (have ${returnableInstances.length}, tried to return ${quantity})`
        }
      }

      // Calculate 100% refund
      const refundAmount = supplyItem.basePrice * quantity

      // Remove the returnable instances (oldest first)
      for (let i = 0; i < quantity; i++) {
        const instToRemove = returnableInstances[i]
        const index = inventoryItem.instances.findIndex(inst => inst.instanceId === instToRemove.instanceId)
        if (index !== -1) {
          inventoryItem.instances.splice(index, 1)
        }
      }

      // Update quantity
      inventoryItem.quantity = inventoryItem.instances.length

      // Remove from items array if no instances left
      if (inventoryItem.instances.length === 0) {
        this.items = this.items.filter((item) => item.itemId !== itemId)
      }

      // Refund currency (100%)
      playerProgression.updateCurrency(refundAmount)

      console.log(`✅ Sold back ${quantity}x ${itemId} for $${refundAmount.toFixed(2)}`)

      return {
        success: true,
        message: `Sold ${quantity}x ${supplyItem.name} for $${refundAmount.toFixed(2)}`,
        itemsSold: [
          {
            itemId,
            quantity,
            totalRefund: refundAmount
          }
        ],
        newBalance: playerProgression.currency
      }
    },

    // ========================================================================
    // Mark Items as Opened/Placed (affects sell-back)
    // ========================================================================

    markAsOpened(itemId: string, count: number = 1): void {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem) return

      // Find unopened instances and mark them as opened
      const unopenedInstances = inventoryItem.instances.filter(inst => !inst.isOpened)
      const toMark = Math.min(count, unopenedInstances.length)

      for (let i = 0; i < toMark; i++) {
        unopenedInstances[i].isOpened = true
      }

      console.log(`📦 Marked ${toMark}x ${itemId} as opened (cannot be returned)`)
    },

    markAsPlacedInHabitat(itemId: string, count: number = 1): void {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem) return

      // Find unplaced instances and mark them as placed
      const unplacedInstances = inventoryItem.instances.filter(inst => !inst.isPlacedInHabitat)
      const toMark = Math.min(count, unplacedInstances.length)

      for (let i = 0; i < toMark; i++) {
        unplacedInstances[i].isPlacedInHabitat = true
      }

      console.log(`🏠 Marked ${toMark}x ${itemId} as placed in habitat (cannot be returned)`)
    },

    unmarkAsPlacedInHabitat(itemId: string, count: number = 1): void {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem) return

      // Find placed instances and unmark them
      const placedInstances = inventoryItem.instances.filter(inst => inst.isPlacedInHabitat)
      const toUnmark = Math.min(count, placedInstances.length)

      for (let i = 0; i < toUnmark; i++) {
        placedInstances[i].isPlacedInHabitat = false
      }

      console.log(`🏠 Unmarked ${toUnmark}x ${itemId} from habitat placement`)
    },

    // ========================================================================
    // Serving-Based System (System 15 - Hay Rack & Serving System)
    // ========================================================================

    /**
     * Add a consumable item with serving tracking
     */
    addConsumableWithServings(itemId: string, servings: number): void {
      let inventoryItem = this.items.find((item) => item.itemId === itemId)

      if (!inventoryItem) {
        inventoryItem = {
          itemId,
          instances: [],
          quantity: 0
        }
        this.items.push(inventoryItem)
      }

      // Create new instance with serving tracking
      inventoryItem.instances.push({
        instanceId: generateInstanceId(),
        acquiredAt: Date.now(),
        servingsRemaining: servings,
        maxServings: servings
      })

      inventoryItem.quantity = inventoryItem.instances.length
      console.log(`✅ Added 1x ${itemId} with ${servings} servings`)
    },

    /**
     * Consume one serving from an item
     */
    consumeServing(itemId: string): boolean {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem || inventoryItem.instances.length === 0) {
        console.warn(`⚠️ No ${itemId} in inventory`)
        return false
      }

      // Find first instance with servings remaining
      const instance = inventoryItem.instances.find(inst =>
        inst.servingsRemaining !== undefined && inst.servingsRemaining > 0
      )

      if (!instance) {
        console.warn(`⚠️ No servings remaining for ${itemId}`)
        return false
      }

      // Consume one serving
      instance.servingsRemaining!--
      instance.lastUsedAt = Date.now()

      // Remove instance if depleted
      if (instance.servingsRemaining === 0) {
        const index = inventoryItem.instances.findIndex(inst => inst.instanceId === instance.instanceId)
        if (index !== -1) {
          inventoryItem.instances.splice(index, 1)
          inventoryItem.quantity = inventoryItem.instances.length
        }

        // Remove from items if no instances left
        if (inventoryItem.instances.length === 0) {
          this.items = this.items.filter((item) => item.itemId !== itemId)
        }
      }

      console.log(`✅ Consumed 1 serving of ${itemId} (${instance.servingsRemaining}/${instance.maxServings} remaining)`)
      return true
    },

    /**
     * Get total servings remaining across all instances
     */
    getTotalServings(itemId: string): number {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem) return 0

      return inventoryItem.instances.reduce((total, inst) => {
        return total + (inst.servingsRemaining || 0)
      }, 0)
    },

    /**
     * Get serving depletion percentage (0-100) for oldest instance
     */
    getServingDepletion(itemId: string): number {
      const inventoryItem = this.items.find((item) => item.itemId === itemId)
      if (!inventoryItem || inventoryItem.instances.length === 0) return 100

      // Get oldest instance with servings
      const instance = inventoryItem.instances.find(inst =>
        inst.servingsRemaining !== undefined && inst.maxServings !== undefined
      )

      if (!instance || !instance.maxServings) return 0

      const remaining = instance.servingsRemaining || 0
      return Math.round((1 - remaining / instance.maxServings) * 100)
    },

    // ========================================================================
    // Debug/Testing
    // ========================================================================

    clearInventory(): void {
      this.items = []
      console.log('🗑️ Inventory cleared')
    },

    setItemQuantity(itemId: string, quantity: number): void {
      let inventoryItem = this.items.find((item) => item.itemId === itemId)

      if (quantity <= 0) {
        this.items = this.items.filter((item) => item.itemId !== itemId)
        return
      }

      if (!inventoryItem) {
        inventoryItem = {
          itemId,
          instances: [],
          quantity: 0
        }
        this.items.push(inventoryItem)
      }

      const currentCount = inventoryItem.instances.length
      const diff = quantity - currentCount

      if (diff > 0) {
        // Add instances
        for (let i = 0; i < diff; i++) {
          inventoryItem.instances.push({
            instanceId: generateInstanceId(),
            acquiredAt: Date.now()
          })
        }
      } else if (diff < 0) {
        // Remove instances
        inventoryItem.instances.splice(0, Math.abs(diff))
      }

      inventoryItem.quantity = inventoryItem.instances.length
    }
  },

  persist: true
})
