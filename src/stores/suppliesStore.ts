/**
 * Supplies Store - System 11
 * Phase 3.11 - Habitat & Environment
 *
 * Central catalog of all purchasable items with pricing, descriptions, and availability.
 * Contains 104+ unique items across 4 main categories:
 * - Bedding (3 items)
 * - Hay (8 varieties)
 * - Food (25+ items, 6 subcategories)
 * - Habitat Items (64+ items, 5 subcategories)
 */

import { defineStore } from 'pinia'
import type { SuppliesItem, ItemFilters, ItemSortOptions, PurchaseResult } from '../types/supplies'
import { usePlayerProgression } from './playerProgression'
import { useInventoryStore } from './inventoryStore'

interface SuppliesStoreState {
  catalog: SuppliesItem[]
  catalogLoaded: boolean
}

export const useSuppliesStore = defineStore('supplies', {
  state: (): SuppliesStoreState => ({
    catalog: [],
    catalogLoaded: false
  }),

  getters: {
    // ========================================================================
    // Category Getters
    // ========================================================================

    allBedding: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.category === 'bedding')
    },

    allHay: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.category === 'hay')
    },

    allFood: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.category === 'food')
    },

    allHabitatItems: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.category === 'habitat_item')
    },

    // ========================================================================
    // Subcategory Getters - Food
    // ========================================================================

    greens: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'greens')
    },

    herbs: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'herbs')
    },

    vegetables: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'vegetables')
    },

    fruits: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'fruits')
    },

    pellets: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'pellets')
    },

    treats: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'treats')
    },

    // ========================================================================
    // Subcategory Getters - Habitat Items
    // ========================================================================

    hideaways: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'hideaways')
    },

    toys: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'toys')
    },

    chews: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'chews')
    },

    bowlsAndBottles: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'bowls_bottles')
    },

    enrichment: (state): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === 'enrichment')
    }
  },

  actions: {
    // ========================================================================
    // Initialization
    // ========================================================================

    initializeCatalog() {
      if (this.catalogLoaded) return

      this.catalog = [
        ...this.createBeddingItems(),
        ...this.createHayItems(),
        ...this.createFoodItems(),
        ...this.createHabitatItems()
      ]

      this.catalogLoaded = true
      console.log(`✅ Supplies Store initialized with ${this.catalog.length} items`)
    },

    // ========================================================================
    // Item Creation Methods - Bedding
    // ========================================================================

    createBeddingItems(): SuppliesItem[] {
      return [
        {
          id: 'bedding_cheap',
          name: 'Cheap Bedding',
          description: 'Basic paper bedding, budget-friendly option',
          category: 'bedding',
          basePrice: 5.99,
          currency: 'dollars',
          stats: {
            absorbency: 0.8,
            decayRate: 1.2
          },
          availability: 'always',
          emoji: '📄',
          quality: 'cheap',
          tier: 'basic',
          tags: ['budget']
        },
        {
          id: 'bedding_average',
          name: 'Average Bedding',
          description: 'Quality paper bedding with good absorbency',
          category: 'bedding',
          basePrice: 9.99,
          currency: 'dollars',
          stats: {
            absorbency: 1.0,
            decayRate: 1.0
          },
          availability: 'always',
          emoji: '📋',
          quality: 'average',
          tier: 'standard',
          tags: ['popular', 'best-value']
        },
        {
          id: 'bedding_premium',
          name: 'Premium Bedding',
          description: 'Ultra-soft premium bedding with superior absorbency',
          category: 'bedding',
          basePrice: 15.99,
          currency: 'dollars',
          stats: {
            absorbency: 1.3,
            decayRate: 0.7
          },
          availability: 'always',
          emoji: '✨',
          quality: 'premium',
          tier: 'premium',
          tags: []
        },
        {
          id: 'bedding_color_pink',
          name: 'Pink Color Bedding',
          description: 'Vibrant pink paper bedding for a fun habitat look',
          category: 'bedding',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            absorbency: 0.95,
            decayRate: 1.1,
            aestheticBoost: 1.2,
            stimulationBoost: 5
          },
          availability: 'always',
          emoji: '🎀',
          quality: 'average',
          tier: 'standard',
          tags: ['colorful', 'aesthetic']
        },
        {
          id: 'bedding_color_blue',
          name: 'Blue Color Bedding',
          description: 'Cool blue paper bedding for a calming habitat',
          category: 'bedding',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            absorbency: 0.95,
            decayRate: 1.1,
            aestheticBoost: 1.2,
            comfortBoost: 5
          },
          availability: 'always',
          emoji: '💙',
          quality: 'average',
          tier: 'standard',
          tags: ['colorful', 'calming']
        },
        {
          id: 'bedding_color_purple',
          name: 'Purple Color Bedding',
          description: 'Rich purple paper bedding for a regal habitat',
          category: 'bedding',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            absorbency: 0.95,
            decayRate: 1.1,
            aestheticBoost: 1.2,
            stimulationBoost: 5
          },
          availability: 'always',
          emoji: '💜',
          quality: 'average',
          tier: 'standard',
          tags: ['colorful', 'aesthetic']
        },
        {
          id: 'bedding_color_green',
          name: 'Green Color Bedding',
          description: 'Fresh green paper bedding for a natural habitat look',
          category: 'bedding',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            absorbency: 0.95,
            decayRate: 1.1,
            aestheticBoost: 1.2,
            comfortBoost: 5
          },
          availability: 'always',
          emoji: '💚',
          quality: 'average',
          tier: 'standard',
          tags: ['colorful', 'natural']
        }
      ]
    },

    // ========================================================================
    // Item Creation Methods - Hay
    // ========================================================================

    createHayItems(): SuppliesItem[] {
      return [
        {
          id: 'hay_timothy',
          name: 'Timothy Hay',
          description: 'Classic timothy hay, most popular choice for guinea pigs',
          category: 'hay',
          basePrice: 12.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌾',
          tags: ['popular', 'best-value']
        },
        {
          id: 'hay_orchard_grass',
          name: 'Orchard Grass',
          description: 'Soft and sweet orchard grass hay',
          category: 'hay',
          basePrice: 13.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌿',
          tags: []
        },
        {
          id: 'hay_alfalfa',
          name: 'Alfalfa Hay',
          description: 'Rich alfalfa hay, high in calcium (young guinea pigs only)',
          category: 'hay',
          basePrice: 11.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🍀',
          tags: []
        },
        {
          id: 'hay_meadow',
          name: 'Meadow Hay',
          description: 'Mixed meadow hay with variety of grasses',
          category: 'hay',
          basePrice: 12.49,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌾',
          tags: []
        },
        {
          id: 'hay_oat',
          name: 'Oat Hay',
          description: 'Oat hay with tasty oat heads for enrichment',
          category: 'hay',
          basePrice: 14.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌾',
          tags: []
        },
        {
          id: 'hay_botanical',
          name: 'Botanical Hay',
          description: 'Timothy hay blend with dried flowers and herbs',
          category: 'hay',
          basePrice: 16.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌸',
          tags: []
        },
        {
          id: 'hay_wheat',
          name: 'Wheat Hay',
          description: 'Soft wheat hay for sensitive guinea pigs',
          category: 'hay',
          basePrice: 13.49,
          currency: 'dollars',
          availability: 'seasonal',
          emoji: '🌾',
          tags: []
        },
        {
          id: 'hay_mixed',
          name: 'Mixed Hay',
          description: 'Blend of timothy, orchard grass, and meadow hay',
          category: 'hay',
          basePrice: 12.99,
          currency: 'dollars',
          availability: 'always',
          emoji: '🌿',
          tags: []
        }
      ]
    },

    // ========================================================================
    // Item Creation Methods - Food
    // ========================================================================

    createFoodItems(): SuppliesItem[] {
      return [
        ...this.createGreensItems(),
        ...this.createHerbsItems(),
        ...this.createVegetablesItems(),
        ...this.createFruitsItems(),
        ...this.createPelletsItems(),
        ...this.createTreatsItems()
      ]
    },

    createGreensItems(): SuppliesItem[] {
      return [
        {
          id: 'food_green_leaf_lettuce',
          name: 'Green Leaf Lettuce',
          description: 'Fresh green leaf lettuce, crisp and nutritious',
          category: 'food',
          subCategory: 'greens',
          basePrice: 2.49,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 15,
            servingSize: '1-2 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        },
        {
          id: 'food_romaine_lettuce',
          name: 'Romaine Lettuce',
          description: 'Crunchy romaine lettuce with high water content',
          category: 'food',
          subCategory: 'greens',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 8,
            hungerSatisfaction: 18,
            servingSize: '1-2 leaves',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh', 'popular']
        },
        {
          id: 'food_red_leaf_lettuce',
          name: 'Red Leaf Lettuce',
          description: 'Colorful red leaf lettuce with mild flavor',
          category: 'food',
          subCategory: 'greens',
          basePrice: 2.79,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 15,
            servingSize: '1-2 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        },
        {
          id: 'food_spinach',
          name: 'Spinach',
          description: 'Nutrient-rich spinach leaves (feed in moderation)',
          category: 'food',
          subCategory: 'greens',
          basePrice: 3.49,
          currency: 'dollars',
          stats: {
            nutrition: 9,
            hungerSatisfaction: 12,
            servingSize: '2-3 small leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        },
        {
          id: 'food_kale',
          name: 'Kale',
          description: 'Super nutritious kale (feed in moderation)',
          category: 'food',
          subCategory: 'greens',
          basePrice: 3.99,
          currency: 'dollars',
          stats: {
            nutrition: 10,
            hungerSatisfaction: 14,
            servingSize: '1-2 small leaves',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        },
        {
          id: 'food_arugula',
          name: 'Arugula',
          description: 'Peppery arugula with bold flavor',
          category: 'food',
          subCategory: 'greens',
          basePrice: 3.49,
          currency: 'dollars',
          stats: {
            nutrition: 8,
            hungerSatisfaction: 13,
            servingSize: '2-3 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        },
        {
          id: 'food_butter_lettuce',
          name: 'Butter Lettuce',
          description: 'Soft butter lettuce with sweet mild flavor',
          category: 'food',
          subCategory: 'greens',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 16,
            servingSize: '2-3 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: ['fresh']
        }
      ]
    },

    createHerbsItems(): SuppliesItem[] {
      return [
        {
          id: 'food_dill',
          name: 'Dill',
          description: 'Fresh dill with aromatic flavor',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 8,
            servingSize: '1-2 sprigs',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh']
        },
        {
          id: 'food_cilantro',
          name: 'Cilantro',
          description: 'Fresh cilantro, guinea pig favorite!',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 2.49,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 10,
            servingSize: '2-3 sprigs',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh', 'popular']
        },
        {
          id: 'food_parsley',
          name: 'Parsley',
          description: 'Fresh parsley, rich in vitamin C',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 2.79,
          currency: 'dollars',
          stats: {
            nutrition: 8,
            hungerSatisfaction: 9,
            servingSize: '1-2 sprigs',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh']
        },
        {
          id: 'food_mint',
          name: 'Mint',
          description: 'Fresh mint leaves with cooling properties',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 3.49,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 8,
            servingSize: '1-2 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh']
        },
        {
          id: 'food_basil',
          name: 'Basil',
          description: 'Sweet basil with aromatic fragrance',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 9,
            servingSize: '1-2 leaves',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh']
        },
        {
          id: 'food_oregano',
          name: 'Oregano',
          description: 'Fresh oregano with earthy flavor (feed sparingly)',
          category: 'food',
          subCategory: 'herbs',
          basePrice: 2.79,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 7,
            servingSize: '1 small sprig',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🌿',
          tags: ['fresh']
        }
      ]
    },

    createVegetablesItems(): SuppliesItem[] {
      return [
        {
          id: 'food_carrot',
          name: 'Carrot',
          description: 'Crunchy carrot, high in sugar (treat only)',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 1.99,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 12,
            servingSize: '1-2 baby carrots',
            shelfLife: '7-10 days'
          },
          availability: 'always',
          emoji: '🥕',
          tags: ['popular']
        },
        {
          id: 'food_bell_pepper_red',
          name: 'Red Bell Pepper',
          description: 'Sweet red bell pepper, excellent vitamin C source',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 3.99,
          currency: 'dollars',
          stats: {
            nutrition: 9,
            hungerSatisfaction: 20,
            servingSize: '1/8 pepper',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🫑',
          tags: ['fresh', 'popular']
        },
        {
          id: 'food_bell_pepper_yellow',
          name: 'Yellow Bell Pepper',
          description: 'Sweet yellow bell pepper, vitamin C rich',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 3.99,
          currency: 'dollars',
          stats: {
            nutrition: 9,
            hungerSatisfaction: 20,
            servingSize: '1/8 pepper',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🫑',
          tags: ['fresh']
        },
        {
          id: 'food_cucumber',
          name: 'Cucumber',
          description: 'Refreshing cucumber with high water content',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 2.49,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 16,
            servingSize: '2-3 slices',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🥒',
          tags: ['fresh']
        },
        {
          id: 'food_celery',
          name: 'Celery',
          description: 'Crunchy celery stalks (remove strings)',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 5,
            hungerSatisfaction: 14,
            servingSize: '1 small stalk',
            shelfLife: '7-10 days'
          },
          availability: 'always',
          emoji: '🥬',
          tags: []
        },
        {
          id: 'food_zucchini',
          name: 'Zucchini',
          description: 'Fresh zucchini, mild flavor',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 2.79,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 15,
            servingSize: '2-3 slices',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🥒',
          tags: ['fresh']
        },
        {
          id: 'food_cherry_tomato',
          name: 'Cherry Tomato',
          description: 'Sweet cherry tomato (occasional treat, high in acid)',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 3.49,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 13,
            servingSize: '1 small tomato',
            shelfLife: '5-7 days'
          },
          availability: 'seasonal',
          emoji: '🍅',
          tags: ['fresh']
        },
        {
          id: 'food_broccoli',
          name: 'Broccoli',
          description: 'Nutritious broccoli florets (feed in moderation)',
          category: 'food',
          subCategory: 'vegetables',
          basePrice: 3.29,
          currency: 'dollars',
          stats: {
            nutrition: 9,
            hungerSatisfaction: 17,
            servingSize: '1 small floret',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🥦',
          tags: ['fresh']
        }
      ]
    },

    createFruitsItems(): SuppliesItem[] {
      return [
        {
          id: 'food_apple',
          name: 'Apple',
          description: 'Sweet apple slice (remove seeds, occasional treat)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 2.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 10,
            servingSize: '1 small slice',
            shelfLife: '7-10 days'
          },
          availability: 'always',
          emoji: '🍎',
          tags: []
        },
        {
          id: 'food_strawberry',
          name: 'Strawberry',
          description: 'Sweet strawberry, high in vitamin C (occasional treat)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 4.99,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 12,
            servingSize: '1 small berry',
            shelfLife: '3-5 days'
          },
          availability: 'seasonal',
          emoji: '🍓',
          tags: ['fresh']
        },
        {
          id: 'food_blueberry',
          name: 'Blueberry',
          description: 'Tiny blueberries packed with antioxidants (occasional treat)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 5.99,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 8,
            servingSize: '2-3 berries',
            shelfLife: '5-7 days'
          },
          availability: 'seasonal',
          emoji: '🫐',
          tags: ['fresh']
        },
        {
          id: 'food_banana',
          name: 'Banana',
          description: 'Creamy banana, very high in sugar (rare treat only)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 1.99,
          currency: 'dollars',
          stats: {
            nutrition: 5,
            hungerSatisfaction: 14,
            servingSize: '1 small coin',
            shelfLife: '3-5 days'
          },
          availability: 'always',
          emoji: '🍌',
          tags: []
        },
        {
          id: 'food_melon',
          name: 'Melon',
          description: 'Refreshing melon, hydrating summer treat',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 3.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 16,
            servingSize: '1 small cube',
            shelfLife: '3-5 days'
          },
          availability: 'seasonal',
          emoji: '🍉',
          tags: ['fresh']
        },
        {
          id: 'food_orange',
          name: 'Orange',
          description: 'Juicy orange segment, vitamin C boost (occasional treat)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 2.49,
          currency: 'dollars',
          stats: {
            nutrition: 8,
            hungerSatisfaction: 11,
            servingSize: '1 small segment',
            shelfLife: '7-10 days'
          },
          availability: 'always',
          emoji: '🍊',
          tags: []
        },
        {
          id: 'food_pear',
          name: 'Pear',
          description: 'Sweet pear slice (occasional treat)',
          category: 'food',
          subCategory: 'fruits',
          basePrice: 2.79,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 12,
            servingSize: '1 small slice',
            shelfLife: '5-7 days'
          },
          availability: 'always',
          emoji: '🍐',
          tags: []
        }
      ]
    },

    createPelletsItems(): SuppliesItem[] {
      return [
        {
          id: 'food_pellets_cheap',
          name: 'Cheap Pellets',
          description: 'Basic guinea pig pellets, budget-friendly',
          category: 'food',
          subCategory: 'pellets',
          basePrice: 8.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 25,
            servingSize: '1/8 cup daily',
            shelfLife: '6 months'
          },
          availability: 'always',
          emoji: '🌰',
          quality: 'cheap',
          tier: 'basic',
          tags: ['budget']
        },
        {
          id: 'food_pellets_standard',
          name: 'Standard Pellets',
          description: 'Quality timothy-based pellets with vitamin C',
          category: 'food',
          subCategory: 'pellets',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            nutrition: 8,
            hungerSatisfaction: 30,
            servingSize: '1/8 cup daily',
            shelfLife: '6 months'
          },
          availability: 'always',
          emoji: '🌰',
          quality: 'average',
          tier: 'standard',
          tags: ['popular', 'best-value']
        },
        {
          id: 'food_pellets_fortified',
          name: 'Fortified Pellets',
          description: 'Premium fortified pellets with enhanced nutrition',
          category: 'food',
          subCategory: 'pellets',
          basePrice: 22.99,
          currency: 'dollars',
          stats: {
            nutrition: 10,
            hungerSatisfaction: 35,
            servingSize: '1/8 cup daily',
            shelfLife: '6 months'
          },
          availability: 'always',
          emoji: '✨',
          quality: 'premium',
          tier: 'premium',
          tags: []
        }
      ]
    },

    createTreatsItems(): SuppliesItem[] {
      return [
        {
          id: 'food_treat_pumpkin_spice',
          name: 'Pumpkin Spice Treat',
          description: 'Premium pumpkin spice flavored treat with magical glow effect',
          category: 'food',
          subCategory: 'treats',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            nutrition: 5,
            hungerSatisfaction: 20,
            playBoost: 15,
            stimulationBoost: 10,
            servingSize: '1 treat',
            shelfLife: '12 months'
          },
          visualEffect: {
            type: 'glow',
            color: '#FF8C00', // Orange
            duration: 180 // 3 hours (180 minutes)
          },
          badgeUnlock: {
            id: 'badge_pumpkin_spice_fan',
            name: 'Pumpkin Spice Fan',
            emoji: '🎃'
          },
          availability: 'seasonal',
          emoji: '🎃',
          tier: 'premium',
          tags: ['special', 'limited']
        },
        {
          id: 'food_treat_tie_dye',
          name: 'Tie-Dye Treat',
          description: 'Groovy rainbow treat with mesmerizing color-shifting effect',
          category: 'food',
          subCategory: 'treats',
          basePrice: 24.99,
          currency: 'dollars',
          stats: {
            nutrition: 5,
            hungerSatisfaction: 22,
            stimulationBoost: 20,
            comfortBoost: 10,
            servingSize: '1 treat',
            shelfLife: '12 months'
          },
          visualEffect: {
            type: 'color_shift',
            color: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'], // Rainbow
            duration: 240 // 4 hours (240 minutes)
          },
          badgeUnlock: {
            id: 'badge_groovy_guinea',
            name: 'Groovy Guinea',
            emoji: '🌈'
          },
          availability: 'limited',
          emoji: '🌈',
          tier: 'premium',
          tags: ['special', 'limited']
        },
        {
          id: 'food_treat_island',
          name: 'Island Treat',
          description: 'Tropical paradise treat with soothing island glow',
          category: 'food',
          subCategory: 'treats',
          basePrice: 16.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 18,
            comfortBoost: 15,
            playBoost: 10,
            servingSize: '1 treat',
            shelfLife: '12 months'
          },
          visualEffect: {
            type: 'glow',
            color: '#20B2AA', // Tropical teal
            duration: 150 // 2.5 hours (150 minutes)
          },
          badgeUnlock: {
            id: 'badge_island_vibes',
            name: 'Island Vibes',
            emoji: '🌺'
          },
          availability: 'seasonal',
          emoji: '🌺',
          tier: 'premium',
          tags: ['special']
        },
        {
          id: 'food_treat_dried_fruit_mix',
          name: 'Dried Fruit Mix',
          description: 'Affordable dried fruit treat mix with apple and banana chips',
          category: 'food',
          subCategory: 'treats',
          basePrice: 5.99,
          currency: 'dollars',
          stats: {
            nutrition: 5,
            hungerSatisfaction: 15,
            servingSize: '1-2 pieces',
            shelfLife: '6 months'
          },
          availability: 'always',
          emoji: '🍇',
          tier: 'basic',
          tags: ['affordable']
        },
        {
          id: 'food_treat_veggie_cookie',
          name: 'Veggie Cookie',
          description: 'Crunchy vegetable-based cookie treat',
          category: 'food',
          subCategory: 'treats',
          basePrice: 4.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 12,
            servingSize: '1 cookie',
            shelfLife: '6 months'
          },
          availability: 'always',
          emoji: '🍪',
          tier: 'basic',
          tags: ['affordable']
        },
        {
          id: 'food_treat_hay_ball',
          name: 'Hay Ball Treat',
          description: 'Compressed hay ball with herbs, edible and fun',
          category: 'food',
          subCategory: 'treats',
          basePrice: 6.49,
          currency: 'dollars',
          stats: {
            nutrition: 7,
            hungerSatisfaction: 18,
            playBoost: 8,
            servingSize: '1 ball',
            shelfLife: '12 months'
          },
          availability: 'always',
          emoji: '⚽',
          tier: 'standard',
          tags: ['affordable', 'enrichment']
        },
        {
          id: 'food_treat_timothy_sticks',
          name: 'Timothy Sticks',
          description: 'Crunchy timothy hay sticks, natural and healthy',
          category: 'food',
          subCategory: 'treats',
          basePrice: 7.99,
          currency: 'dollars',
          stats: {
            nutrition: 6,
            hungerSatisfaction: 14,
            playBoost: 5,
            servingSize: '1-2 sticks',
            shelfLife: '12 months'
          },
          availability: 'always',
          emoji: '🌾',
          tier: 'standard',
          tags: ['affordable']
        }
      ]
    },

    // ========================================================================
    // Item Creation Methods - Habitat Items
    // ========================================================================

    createHabitatItems(): SuppliesItem[] {
      return [
        ...this.createHideawaysItems(),
        ...this.createToysItems(),
        ...this.createChewsItems(),
        ...this.createBowlsAndBottlesItems(),
        ...this.createEnrichmentItems()
      ]
    },

    createHideawaysItems(): SuppliesItem[] {
      return [
        // Basic Hideaways
        {
          id: 'habitat_plastic_igloo',
          name: 'Plastic Igloo',
          description: 'Classic dome hideaway, easy to clean',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 12.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            comfortBoost: 8,
            size: 'medium'
          },
          availability: 'always',
          emoji: '🏠',
          tier: 'basic',
          tags: ['popular']
        },
        {
          id: 'habitat_wooden_hideout',
          name: 'Wooden Hideout',
          description: 'Natural wood hideaway with chewable edges',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            comfortBoost: 10,
            size: 'medium'
          },
          availability: 'always',
          emoji: '🪵',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_fabric_tent',
          name: 'Fabric Tent',
          description: 'Cozy fabric hideaway with cushioned floor',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 15.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            comfortBoost: 12,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '⛺',
          tier: 'basic',
          tags: []
        },
        // Tunnel Hideaways
        {
          id: 'habitat_straight_tunnel',
          name: 'Straight Tunnel',
          description: 'Basic tube for running through',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 16.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            comfortBoost: 6,
            playBoost: 8,
            size: 'large'
          },
          availability: 'always',
          emoji: '🚇',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_curved_tunnel',
          name: 'Curved Tunnel',
          description: 'L-shaped corner tunnel',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            comfortBoost: 7,
            playBoost: 10,
            size: 'large'
          },
          availability: 'always',
          emoji: '🚇',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_multi_exit_tunnel',
          name: 'Multi-Exit Tunnel',
          description: 'T-junction tunnel with 3 exits',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 22.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            comfortBoost: 8,
            playBoost: 12,
            size: 'large'
          },
          availability: 'always',
          emoji: '🚇',
          tier: 'standard',
          tags: []
        },
        // Premium Hideaways
        {
          id: 'habitat_castle_hideout',
          name: 'Castle Hideout',
          description: 'Multi-level hideaway with turrets',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 28.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            comfortBoost: 15,
            playBoost: 8,
            size: 'large'
          },
          availability: 'always',
          emoji: '🏰',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_log_cabin',
          name: 'Log Cabin',
          description: 'Rustic wooden cabin with windows',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 26.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            comfortBoost: 18,
            size: 'large'
          },
          availability: 'always',
          emoji: '🛖',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_cuddle_cup',
          name: 'Cuddle Cup',
          description: 'Soft hanging bed/hideaway combo',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 24.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            comfortBoost: 20,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '🛏️',
          tier: 'premium',
          tags: []
        },
        // Beds
        {
          id: 'habitat_fleece_bed',
          name: 'Fleece Bed',
          description: 'Soft fleece cushion bed, washable',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            comfortBoost: 16,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '🛏️',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_pillow_bed',
          name: 'Pillow Bed',
          description: 'Plush pillow-style bed with raised edges',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 22.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            comfortBoost: 18,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '🛏️',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_faux_fur_bed',
          name: 'Faux Fur Bed',
          description: 'Luxurious faux fur lined bed',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 26.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            comfortBoost: 22,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '✨',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_banana_bed',
          name: 'Banana Bed',
          description: 'Fun banana-shaped bed with cushioned interior',
          category: 'habitat_item',
          subCategory: 'hideaways',
          basePrice: 24.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            comfortBoost: 20,
            size: 'medium',
            washable: true
          },
          availability: 'always',
          emoji: '🍌',
          tier: 'premium',
          tags: ['fun']
        }
      ]
    },

    createToysItems(): SuppliesItem[] {
      return [
        // Rolling Toys
        {
          id: 'habitat_willow_ball',
          name: 'Willow Ball',
          description: 'Natural woven ball, rollable and chewable',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 6.99,
          currency: 'dollars',
          stats: {
            durability: 5,
            playBoost: 10
          },
          availability: 'always',
          emoji: '⚽',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_rattan_ball',
          name: 'Rattan Ball',
          description: 'Durable rattan sphere with bell inside',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 8.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            playBoost: 12,
            stimulationBoost: 6
          },
          availability: 'always',
          emoji: '🔔',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_activity_ball',
          name: 'Activity Ball',
          description: 'Plastic ball with treat dispensing holes',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            playBoost: 14,
            stimulationBoost: 8,
            interactiveRating: 7
          },
          availability: 'always',
          emoji: '⚽',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_rolling_tunnel_ball',
          name: 'Rolling Tunnel Ball',
          description: 'Hollow ball guinea pig can push around',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 12.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            playBoost: 16
          },
          availability: 'always',
          emoji: '🏀',
          tier: 'standard',
          tags: []
        },
        // Interactive Toys
        {
          id: 'habitat_treat_maze',
          name: 'Treat Maze',
          description: 'Puzzle toy requiring problem-solving',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 15.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            playBoost: 12,
            stimulationBoost: 15,
            interactiveRating: 9
          },
          availability: 'always',
          emoji: '🧩',
          tier: 'standard',
          tags: ['popular']
        },
        {
          id: 'habitat_foraging_mat',
          name: 'Foraging Mat',
          description: 'Textured mat for hiding food',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            playBoost: 10,
            stimulationBoost: 12,
            interactiveRating: 8,
            washable: true
          },
          availability: 'always',
          emoji: '🎯',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_hanging_toy',
          name: 'Hanging Toy',
          description: 'Suspended toy with dangling chewables',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 13.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            playBoost: 14,
            stimulationBoost: 10
          },
          availability: 'always',
          emoji: '🎪',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_push_toy',
          name: 'Push Toy',
          description: 'Small cart guinea pig can push',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 16.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            playBoost: 18,
            interactiveRating: 7
          },
          availability: 'always',
          emoji: '🛒',
          tier: 'standard',
          tags: []
        },
        // Premium Toys
        {
          id: 'habitat_activity_center',
          name: 'Activity Center',
          description: 'Multi-feature toy with tunnels, ramps, bells',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 34.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            playBoost: 25,
            stimulationBoost: 18,
            interactiveRating: 10,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🎡',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_digging_box',
          name: 'Digging Box',
          description: 'Safe digging area with soft fill material',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 28.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            playBoost: 22,
            stimulationBoost: 15,
            spaceRequired: 'medium'
          },
          availability: 'always',
          emoji: '⛏️',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_obstacle_course',
          name: 'Obstacle Course Kit',
          description: 'Modular pieces for custom courses',
          category: 'habitat_item',
          subCategory: 'toys',
          basePrice: 39.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            playBoost: 24,
            stimulationBoost: 20,
            interactiveRating: 9,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🏃',
          tier: 'premium',
          tags: []
        }
      ]
    },

    createChewsItems(): SuppliesItem[] {
      return [
        // Natural Wood Chews
        {
          id: 'habitat_apple_wood_sticks',
          name: 'Apple Wood Sticks',
          description: 'Sweet flavored chew sticks (3-pack)',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 5.99,
          currency: 'dollars',
          stats: {
            durability: 4,
            playBoost: 6,
            stimulationBoost: 5,
            dentalBenefit: 8,
            chewSatisfaction: 7
          },
          availability: 'always',
          emoji: '🍎',
          tier: 'basic',
          tags: ['popular']
        },
        {
          id: 'habitat_willow_sticks',
          name: 'Willow Sticks',
          description: 'Classic willow branches (5-pack)',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 4.99,
          currency: 'dollars',
          stats: {
            durability: 3,
            playBoost: 5,
            stimulationBoost: 4,
            dentalBenefit: 7,
            chewSatisfaction: 6
          },
          availability: 'always',
          emoji: '🌿',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_pear_wood_block',
          name: 'Pear Wood Block',
          description: 'Chunky block for aggressive chewing',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 7.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            playBoost: 8,
            stimulationBoost: 6,
            dentalBenefit: 9,
            chewSatisfaction: 8
          },
          availability: 'always',
          emoji: '🍐',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_hazelnut_branch',
          name: 'Hazelnut Branch',
          description: 'Natural branch with bark',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 6.99,
          currency: 'dollars',
          stats: {
            durability: 5,
            playBoost: 7,
            stimulationBoost: 6,
            dentalBenefit: 8,
            chewSatisfaction: 7
          },
          availability: 'always',
          emoji: '🌰',
          tier: 'basic',
          tags: []
        },
        // Shaped Chews
        {
          id: 'habitat_grass_woven_ball',
          name: 'Grass Woven Ball',
          description: 'Edible woven ball',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 8.99,
          currency: 'dollars',
          stats: {
            durability: 4,
            playBoost: 10,
            stimulationBoost: 8,
            dentalBenefit: 6,
            chewSatisfaction: 9
          },
          availability: 'always',
          emoji: '⚽',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_timothy_hay_cake',
          name: 'Timothy Hay Cake',
          description: 'Compressed hay circle',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 9.99,
          currency: 'dollars',
          stats: {
            durability: 5,
            playBoost: 8,
            stimulationBoost: 7,
            dentalBenefit: 7,
            chewSatisfaction: 10
          },
          availability: 'always',
          emoji: '🍰',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_carrot_chew_toy',
          name: 'Carrot Chew Toy',
          description: 'Carrot-shaped wooden chew',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 7.99,
          currency: 'dollars',
          stats: {
            durability: 5,
            playBoost: 9,
            stimulationBoost: 7,
            dentalBenefit: 8,
            chewSatisfaction: 8
          },
          availability: 'always',
          emoji: '🥕',
          tier: 'standard',
          tags: ['fun']
        },
        {
          id: 'habitat_corn_husk_toy',
          name: 'Corn Husk Toy',
          description: 'Natural corn husk bundle',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 6.99,
          currency: 'dollars',
          stats: {
            durability: 3,
            playBoost: 7,
            stimulationBoost: 8,
            dentalBenefit: 5,
            chewSatisfaction: 7
          },
          availability: 'seasonal',
          emoji: '🌽',
          tier: 'standard',
          tags: []
        },
        // Premium Chews
        {
          id: 'habitat_chew_stick_kabob',
          name: 'Chew Stick Kabob',
          description: 'Variety wood sticks on metal holder',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 12.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            playBoost: 12,
            stimulationBoost: 10,
            dentalBenefit: 9,
            chewSatisfaction: 10
          },
          availability: 'always',
          emoji: '🍡',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_edible_hideaway',
          name: 'Edible Hideaway',
          description: 'Fully edible grass hut',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 2,
            playBoost: 10,
            stimulationBoost: 12,
            comfortBoost: 8,
            dentalBenefit: 6,
            chewSatisfaction: 10
          },
          availability: 'always',
          emoji: '🏠',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_lava_ledge',
          name: 'Lava Ledge',
          description: 'Chewable pumice stone for teeth trimming',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            playBoost: 8,
            stimulationBoost: 6,
            dentalBenefit: 10,
            chewSatisfaction: 7
          },
          availability: 'always',
          emoji: '🪨',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_loofah_chew',
          name: 'Loofah Chew',
          description: 'Natural loofah for chewing and tossing',
          category: 'habitat_item',
          subCategory: 'chews',
          basePrice: 8.99,
          currency: 'dollars',
          stats: {
            durability: 4,
            playBoost: 11,
            stimulationBoost: 9,
            dentalBenefit: 6,
            chewSatisfaction: 8
          },
          availability: 'always',
          emoji: '🧽',
          tier: 'premium',
          tags: []
        }
      ]
    },

    createBowlsAndBottlesItems(): SuppliesItem[] {
      return [
        // Water Bottles
        {
          id: 'habitat_large_capacity_bottle',
          name: 'Large Capacity Bottle',
          description: '16oz for multiple guinea pigs or longer periods',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 10.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            capacity: '16oz',
            tipResistance: true,
            cleanlinessRating: 8
          },
          availability: 'always',
          emoji: '💧',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_wellness_bottle',
          name: 'Wellness Bottle',
          description: '12oz with vitamin C preservation technology',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            capacity: '12oz',
            tipResistance: true,
            cleanlinessRating: 9,
            wellnessBoost: 5
          },
          availability: 'always',
          emoji: '✨',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_refreshing_bottle',
          name: 'Refreshing Bottle',
          description: '12oz with cooling technology for comfort',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 22.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            capacity: '12oz',
            tipResistance: true,
            cleanlinessRating: 10,
            comfortBoost: 8,
            wellnessBoost: 5
          },
          availability: 'always',
          emoji: '❄️',
          tier: 'premium',
          tags: []
        },
        // Food Bowls
        {
          id: 'habitat_ceramic_bowl',
          name: 'Basic Ceramic Bowl',
          description: 'Heavy ceramic bowl, tip-resistant',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 6.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            tipResistance: true,
            cleanlinessRating: 9
          },
          availability: 'always',
          emoji: '🍽️',
          tier: 'basic',
          tags: ['popular']
        },
        {
          id: 'habitat_corner_bowl',
          name: 'Corner Bowl',
          description: 'Space-saving corner design',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 9.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            tipResistance: true,
            cleanlinessRating: 8,
            spaceRequired: 'small'
          },
          availability: 'always',
          emoji: '🍽️',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_elevated_bowl',
          name: 'Elevated Bowl',
          description: 'Raised platform for easier eating',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 12.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            tipResistance: true,
            cleanlinessRating: 9,
            comfortBoost: 3
          },
          availability: 'always',
          emoji: '🍽️',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_divided_bowl',
          name: 'Divided Bowl',
          description: 'Two compartments for pellets and veggies',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            tipResistance: true,
            cleanlinessRating: 10
          },
          availability: 'always',
          emoji: '🍱',
          tier: 'premium',
          tags: []
        },
        // Hay Racks
        {
          id: 'habitat_basic_hay_rack',
          name: 'Basic Hay Rack',
          description: 'Simple wire rack for hay',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 8.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            cleanlinessRating: 6
          },
          availability: 'always',
          emoji: '🌾',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_corner_hay_rack',
          name: 'Corner Hay Rack',
          description: 'Corner-mounted space saver',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 11.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            cleanlinessRating: 7,
            spaceRequired: 'small'
          },
          availability: 'always',
          emoji: '🌾',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_hay_ball',
          name: 'Hay Ball',
          description: 'Hanging sphere keeps hay clean',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 13.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            cleanlinessRating: 9,
            playBoost: 5
          },
          availability: 'always',
          emoji: '⚽',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_premium_hay_feeder',
          name: 'Premium Hay Feeder',
          description: 'Enclosed feeder with minimal waste',
          category: 'habitat_item',
          subCategory: 'bowls_bottles',
          basePrice: 19.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            cleanlinessRating: 10
          },
          availability: 'always',
          emoji: '✨',
          tier: 'premium',
          tags: []
        }
      ]
    },

    createEnrichmentItems(): SuppliesItem[] {
      return [
        // Platforms & Levels
        {
          id: 'habitat_basic_platform',
          name: 'Basic Platform',
          description: 'Single level wooden platform',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            stimulationBoost: 10,
            spaceRequired: 'medium'
          },
          availability: 'always',
          emoji: '📐',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_corner_ramp',
          name: 'Corner Ramp',
          description: 'Space-saving corner platform with ramp',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            stimulationBoost: 12,
            spaceRequired: 'small'
          },
          availability: 'always',
          emoji: '↗️',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_multi_level_platform',
          name: 'Multi-Level Platform',
          description: 'Two-tier platform system',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 26.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            stimulationBoost: 16,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🏢',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_bridge_platform',
          name: 'Bridge Platform',
          description: 'Connecting bridge between two areas',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 22.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            stimulationBoost: 14,
            playBoost: 8,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🌉',
          tier: 'standard',
          tags: []
        },
        // Exploration Items
        {
          id: 'habitat_tube_system',
          name: 'Tube System',
          description: 'Modular connecting tubes (3-piece set)',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 24.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            stimulationBoost: 18,
            playBoost: 12,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🚇',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_peekaboo_tunnel',
          name: 'Peek-a-Boo Tunnel',
          description: 'Tunnel with viewing windows',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 19.99,
          currency: 'dollars',
          stats: {
            durability: 7,
            stimulationBoost: 15,
            playBoost: 10,
            spaceRequired: 'medium'
          },
          availability: 'always',
          emoji: '👀',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_maze_kit',
          name: 'Maze Kit',
          description: 'Reconfigurable maze walls (6-piece)',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 29.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            stimulationBoost: 22,
            interactiveRating: 9,
            complexityRating: 8,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🧩',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_observation_deck',
          name: 'Observation Deck',
          description: 'Elevated viewing platform',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 21.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            stimulationBoost: 16,
            comfortBoost: 6,
            spaceRequired: 'medium'
          },
          availability: 'always',
          emoji: '🔭',
          tier: 'standard',
          tags: []
        },
        // Sensory Enrichment
        {
          id: 'habitat_texture_board',
          name: 'Texture Board',
          description: 'Board with various textures to explore',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 16.99,
          currency: 'dollars',
          stats: {
            durability: 8,
            stimulationBoost: 14,
            interactiveRating: 7
          },
          availability: 'always',
          emoji: '🎨',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_scent_garden',
          name: 'Scent Garden Box',
          description: 'Safe herbs planted in box for exploration',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 18.99,
          currency: 'dollars',
          stats: {
            durability: 5,
            stimulationBoost: 18,
            interactiveRating: 8,
            spaceRequired: 'medium'
          },
          availability: 'seasonal',
          emoji: '🌿',
          tier: 'standard',
          tags: []
        },
        {
          id: 'habitat_crinkle_mat',
          name: 'Crinkle Mat',
          description: 'Noisy crinkly mat for sensory play',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 12.99,
          currency: 'dollars',
          stats: {
            durability: 6,
            stimulationBoost: 12,
            playBoost: 8,
            washable: true
          },
          availability: 'always',
          emoji: '📄',
          tier: 'basic',
          tags: []
        },
        {
          id: 'habitat_mirror_toy',
          name: 'Mirror Toy',
          description: 'Safe acrylic mirror for curiosity',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 14.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            stimulationBoost: 16,
            interactiveRating: 7
          },
          availability: 'always',
          emoji: '🪞',
          tier: 'standard',
          tags: []
        },
        // Premium Enrichment
        {
          id: 'habitat_adventure_playground',
          name: 'Adventure Playground',
          description: 'Multi-feature complex with tunnels, ramps, platforms',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 49.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            stimulationBoost: 30,
            playBoost: 20,
            interactiveRating: 10,
            complexityRating: 10,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🎡',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_foraging_wall',
          name: 'Foraging Wall',
          description: 'Vertical wall with pockets for hiding food',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 36.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            stimulationBoost: 24,
            interactiveRating: 9,
            spaceRequired: 'medium'
          },
          availability: 'always',
          emoji: '🧗',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_climbing_frame',
          name: 'Climbing Frame',
          description: 'Safe low-height climbing structure',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 42.99,
          currency: 'dollars',
          stats: {
            durability: 10,
            stimulationBoost: 26,
            playBoost: 18,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🪜',
          tier: 'premium',
          tags: []
        },
        {
          id: 'habitat_sensory_course',
          name: 'Sensory Course',
          description: 'Complete course with textures, sounds, obstacles',
          category: 'habitat_item',
          subCategory: 'enrichment',
          basePrice: 54.99,
          currency: 'dollars',
          stats: {
            durability: 9,
            stimulationBoost: 28,
            playBoost: 16,
            interactiveRating: 10,
            complexityRating: 9,
            spaceRequired: 'large'
          },
          availability: 'always',
          emoji: '🎪',
          tier: 'premium',
          tags: []
        }
      ]
    },

    // ========================================================================
    // Query Methods
    // ========================================================================

    getItemById(itemId: string): SuppliesItem | undefined {
      return this.catalog.find((item) => item.id === itemId)
    },

    getItemsByCategory(category: SuppliesItem['category']): SuppliesItem[] {
      return this.catalog.filter((item) => item.category === category)
    },

    getItemsBySubCategory(subCategory: SuppliesItem['subCategory']): SuppliesItem[] {
      return this.catalog.filter((item) => item.subCategory === subCategory)
    },

    filterItems(filters: ItemFilters): SuppliesItem[] {
      let results = [...this.catalog]

      if (filters.category) {
        results = results.filter((item) => item.category === filters.category)
      }

      if (filters.subCategory) {
        results = results.filter((item) => item.subCategory === filters.subCategory)
      }

      if (filters.minPrice !== undefined) {
        results = results.filter((item) => item.basePrice >= filters.minPrice!)
      }

      if (filters.maxPrice !== undefined) {
        results = results.filter((item) => item.basePrice <= filters.maxPrice!)
      }

      if (filters.quality) {
        results = results.filter((item) => item.quality === filters.quality)
      }

      if (filters.tier) {
        results = results.filter((item) => item.tier === filters.tier)
      }

      if (filters.availability) {
        results = results.filter((item) => item.availability === filters.availability)
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((item) =>
          filters.tags!.some((tag) => item.tags?.includes(tag))
        )
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        results = results.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        )
      }

      return results
    },

    sortItems(items: SuppliesItem[], sortOptions: ItemSortOptions): SuppliesItem[] {
      const sorted = [...items]

      sorted.sort((a, b) => {
        let comparison = 0

        switch (sortOptions.field) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'price':
            comparison = a.basePrice - b.basePrice
            break
          case 'quality':
            const qualityOrder = { cheap: 1, average: 2, premium: 3 }
            comparison =
              (qualityOrder[a.quality || 'average'] || 0) -
              (qualityOrder[b.quality || 'average'] || 0)
            break
          case 'tier':
            const tierOrder = { basic: 1, standard: 2, premium: 3 }
            comparison =
              (tierOrder[a.tier || 'standard'] || 0) - (tierOrder[b.tier || 'standard'] || 0)
            break
        }

        return sortOptions.direction === 'asc' ? comparison : -comparison
      })

      return sorted
    },

    // ========================================================================
    // Purchase Methods
    // ========================================================================

    purchaseItem(itemId: string, quantity: number = 1): PurchaseResult {
      const item = this.getItemById(itemId)

      if (!item) {
        return {
          success: false,
          message: `Item not found: ${itemId}`
        }
      }

      const totalCost = item.basePrice * quantity
      const playerProgression = usePlayerProgression()

      // Check if player has enough currency
      if (playerProgression.currency < totalCost) {
        return {
          success: false,
          message: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${playerProgression.currency.toFixed(2)}`
        }
      }

      // Deduct currency
      playerProgression.deductCurrency(totalCost, `purchase_${itemId}`)

      // Add to inventory
      const inventoryStore = useInventoryStore()
      inventoryStore.addItem(itemId, quantity)

      console.log(`🛒 Purchase successful: ${quantity}x ${item.name} for $${totalCost.toFixed(2)}`)

      return {
        success: true,
        message: `Successfully purchased ${quantity}x ${item.name}`,
        itemsPurchased: [{
          itemId,
          quantity,
          totalCost
        }],
        remainingBalance: playerProgression.currency
      }
    },

    purchaseMultipleItems(items: { itemId: string; quantity: number }[]): PurchaseResult {
      const playerProgression = usePlayerProgression()
      let totalCost = 0
      const itemDetails: { itemId: string; quantity: number; totalCost: number; item: SuppliesItem }[] = []

      // Validate all items and calculate total cost
      for (const { itemId, quantity } of items) {
        const item = this.getItemById(itemId)

        if (!item) {
          return {
            success: false,
            message: `Item not found: ${itemId}`
          }
        }

        const itemCost = item.basePrice * quantity
        totalCost += itemCost
        itemDetails.push({ itemId, quantity, totalCost: itemCost, item })
      }

      // Check if player has enough currency
      if (playerProgression.currency < totalCost) {
        return {
          success: false,
          message: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${playerProgression.currency.toFixed(2)}`
        }
      }

      // Deduct currency
      playerProgression.deductCurrency(totalCost, 'purchase_multiple')

      // Add all items to inventory
      const inventoryStore = useInventoryStore()
      inventoryStore.addMultipleItems(items)

      console.log(`🛒 Purchase successful: ${items.length} different items for $${totalCost.toFixed(2)}`)

      return {
        success: true,
        message: `Successfully purchased ${items.length} item(s)`,
        itemsPurchased: itemDetails.map(({ itemId, quantity, totalCost }) => ({
          itemId,
          quantity,
          totalCost
        })),
        remainingBalance: playerProgression.currency
      }
    }
  }
})
