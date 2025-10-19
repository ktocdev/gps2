/**
 * Supplies Store Type Definitions
 * System 11: Supplies Store - Phase 3.11
 *
 * Type definitions for all purchasable items in the game:
 * - Bedding, Hay, Food (6 subcategories), Habitat Items (5 subcategories)
 */

// ============================================================================
// Core Item Interface
// ============================================================================

export interface SuppliesItem {
  id: string
  name: string
  description: string
  category: 'bedding' | 'hay' | 'food' | 'habitat_item'
  subCategory?:
    // Food subcategories
    | 'greens'
    | 'herbs'
    | 'vegetables'
    | 'fruits'
    | 'pellets'
    | 'treats'
    // Habitat item subcategories
    | 'hideaways'
    | 'toys'
    | 'chews'
    | 'bowls_bottles'
    | 'enrichment'
  basePrice: number
  currency: 'dollars'

  // Stats (category-dependent)
  stats?: {
    // Bedding stats
    absorbency?: number
    decayRate?: number
    aestheticBoost?: number // Visual appeal multiplier (color bedding)

    // Food stats
    nutrition?: number
    hungerSatisfaction?: number
    servingSize?: string
    shelfLife?: string
    servings?: number // Number of servings per item (for hay, lettuce, carrots)

    // Habitat item stats
    durability?: number
    playBoost?: number // Affects Play need (toys, chews)
    stimulationBoost?: number // Affects Stimulation need (chews, enrichment, color bedding)
    comfortBoost?: number // Affects Comfort need (hideaways, bottles, bowls, color bedding)
    wellnessBoost?: number // Affects Wellness need (wellness bottle, refreshing bottle)

    // Bowls & Bottles specific
    capacity?: string // e.g., "8oz", "16oz", "12oz"
    foodCapacity?: number // Number of food items bowl can hold (2 or 3)
    tipResistance?: boolean
    cleanlinessRating?: number // 1-10 scale

    // Chews specific
    dentalBenefit?: number // 1-10 scale
    chewSatisfaction?: number // 1-10 scale

    // Toys & Enrichment specific
    interactiveRating?: number // 1-10 scale
    complexityRating?: number // 1-10 scale
    spaceRequired?: 'small' | 'medium' | 'large'

    // Hideaways specific
    size?: 'small' | 'medium' | 'large'
    washable?: boolean
  }

  // Premium treat effects
  visualEffect?: {
    type: 'glow' | 'color_shift'
    color: string | string[] // Single color or gradient
    duration: number // Duration in minutes
  }

  badgeUnlock?: {
    id: string
    name: string
    emoji: string
  }

  // Availability
  availability: 'always' | 'seasonal' | 'limited'
  stockQuantity?: number
  isEssential?: boolean // True for basic bottle (included with habitat)

  // Metadata
  emoji?: string
  quality?: 'cheap' | 'average' | 'premium'
  tier?: 'basic' | 'standard' | 'premium' // For items with quality tiers
  tags?: string[] // ['popular', 'best-value', 'new', 'fresh', 'special', 'included']
}

// ============================================================================
// Category-Specific Types
// ============================================================================

export type BeddingItem = SuppliesItem & {
  category: 'bedding'
  stats: {
    absorbency: number
    decayRate: number
  }
}

export type HayItem = SuppliesItem & {
  category: 'hay'
}

export type FoodItem = SuppliesItem & {
  category: 'food'
  subCategory: 'greens' | 'herbs' | 'vegetables' | 'fruits' | 'pellets' | 'treats'
  stats?: {
    nutrition?: number
    hungerSatisfaction?: number
    servingSize?: string
    shelfLife?: string
  }
}

export type HabitatItem = SuppliesItem & {
  category: 'habitat_item'
  subCategory: 'hideaways' | 'toys' | 'chews' | 'bowls_bottles' | 'enrichment'
}

// ============================================================================
// Shopping Cart Types
// ============================================================================

export interface CartItem {
  itemId: string
  quantity: number
  addedAt: number // timestamp
}

export interface ShoppingCart {
  items: CartItem[]
  totalCost: number
  itemCount: number
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface ItemFilters {
  category?: SuppliesItem['category']
  subCategory?: SuppliesItem['subCategory']
  minPrice?: number
  maxPrice?: number
  quality?: SuppliesItem['quality']
  tier?: SuppliesItem['tier']
  availability?: SuppliesItem['availability']
  tags?: string[]
  searchTerm?: string
}

export interface ItemSortOptions {
  field: 'name' | 'price' | 'quality' | 'tier'
  direction: 'asc' | 'desc'
}

// ============================================================================
// Inventory Types
// ============================================================================

export interface ItemInstance {
  instanceId: string // Unique ID for this specific instance
  acquiredAt: number // timestamp
  lastUsedAt?: number // timestamp
  isOpened?: boolean // For bags of hay/bedding - once opened, cannot be returned
  isPlacedInHabitat?: boolean // If placed in habitat, cannot be returned
  servingsRemaining?: number // For consumables (hay, lettuce, carrots) - tracks remaining servings
  maxServings?: number // Total servings when fresh/new
}

export interface InventoryItem {
  itemId: string
  instances: ItemInstance[] // Array of individual item instances
  quantity: number // Computed from instances.length
}

export interface InventoryState {
  items: InventoryItem[]
}

// ============================================================================
// Purchase Types
// ============================================================================

export interface PurchaseResult {
  success: boolean
  message: string
  itemsPurchased?: {
    itemId: string
    quantity: number
    totalCost: number
  }[]
  remainingBalance?: number
}

export interface SellBackResult {
  success: boolean
  message: string
  itemsSold?: {
    itemId: string
    quantity: number
    totalRefund: number
  }[]
  newBalance?: number
}
