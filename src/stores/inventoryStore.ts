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
import type { InventoryItem, InventoryState } from '../types/supplies'
import { useSuppliesStore } from './suppliesStore'

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
      return inventoryItem?.quantity || 0
    },

    hasItem: (state) => (itemId: string): boolean => {
      return state.items.some((item) => item.itemId === itemId && item.quantity > 0)
    },

    allItems: (state): InventoryItem[] => {
      return state.items.filter((item) => item.quantity > 0)
    },

    totalItemCount(): number {
      return this.allItems.reduce((sum, item) => sum + item.quantity, 0)
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
    // Inventory with Item Details
    // ========================================================================

    inventoryWithDetails(): Array<InventoryItem & { item: import('../types/supplies').SuppliesItem | undefined }> {
      const suppliesStore = useSuppliesStore()
      const items = this.allItems
      return items.map((invItem: InventoryItem) => ({
        ...invItem,
        item: suppliesStore.getItemById(invItem.itemId)
      })).filter((item: { item: import('../types/supplies').SuppliesItem | undefined }) => item.item !== undefined)
    }
  },

  actions: {
    // ========================================================================
    // Add Items
    // ========================================================================

    addItem(itemId: string, quantity: number = 1): void {
      const existingItem = this.items.find((item) => item.itemId === itemId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          itemId,
          quantity,
          acquiredAt: Date.now()
        })
      }

      console.log(`✅ Added ${quantity}x ${itemId} to inventory`)
    },

    // ========================================================================
    // Remove/Use Items
    // ========================================================================

    removeItem(itemId: string, quantity: number = 1): boolean {
      const existingItem = this.items.find((item) => item.itemId === itemId)

      if (!existingItem || existingItem.quantity < quantity) {
        console.warn(`⚠️ Cannot remove ${quantity}x ${itemId} - insufficient quantity`)
        return false
      }

      existingItem.quantity -= quantity
      existingItem.lastUsedAt = Date.now()

      // Remove from inventory if quantity reaches 0
      if (existingItem.quantity === 0) {
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
    // Debug/Testing
    // ========================================================================

    clearInventory(): void {
      this.items = []
      console.log('🗑️ Inventory cleared')
    },

    setItemQuantity(itemId: string, quantity: number): void {
      const existingItem = this.items.find((item) => item.itemId === itemId)

      if (quantity <= 0) {
        this.items = this.items.filter((item) => item.itemId !== itemId)
        return
      }

      if (existingItem) {
        existingItem.quantity = quantity
      } else {
        this.items.push({
          itemId,
          quantity,
          acquiredAt: Date.now()
        })
      }
    }
  },

  persist: true
})
