/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GuineaPig } from './guineaPigStore'
import { useLoggingStore } from './loggingStore'
import { usePlayerProgression } from './playerProgression'
import { useGuineaPigStore } from './guineaPigStore'
import { useGameController } from './gameController'
import { useNeedsController } from './needsController'

export interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[]
  sessionDuration: number
  wasFromFavorites: Record<string, boolean> // Track which guinea pigs were from favorites
}

interface PetStoreSettings {
  endGamePenalty: number
}

export const usePetStoreManager = defineStore('petStoreManager', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const availableGuineaPigs = ref<GuineaPig[]>([])
  const favoriteGuineaPigs = ref<GuineaPig[]>([])
  const maxFavoriteSlots = ref<number>(3)
  const activeGameSession = ref<GameSession | null>(null)

  const settings = ref<PetStoreSettings>({
    endGamePenalty: 50
  })


  const activeSessionGuineaPigs = computed(() => {
    if (!activeGameSession.value) return []
    const guineaPigStore = useGuineaPigStore()
    return activeGameSession.value.guineaPigIds
      .map(id => guineaPigStore.getGuineaPig(id))
      .filter(Boolean) as GuineaPig[]
  })

  // Favorites computed properties
  const favoriteCount = computed(() => favoriteGuineaPigs.value.length)

  const availableFavoriteSlots = computed(() =>
    maxFavoriteSlots.value - favoriteCount.value
  )

  const canAddToFavorites = computed(() =>
    favoriteCount.value < maxFavoriteSlots.value
  )

  const canPurchaseMoreSlots = computed(() =>
    maxFavoriteSlots.value < 10
  )

  function generateGuineaPigId(): string {
    return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const guineaPigNames = [
    'Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch', 'Cinnamon',
    'Pepper', 'Sugar', 'Honey', 'Mocha', 'Caramel', 'Biscuit',
    'Mochi', 'Truffle', 'Cookie', 'Marshmallow', 'Nugget', 'Pickles',
    'Snickers', 'Waffles', 'Toffee', 'Pudding', 'Brownie', 'Cupcake',
    'Popcorn', 'Nacho', 'Cheddar', 'Olive', 'Peaches', 'Pumpkin',
    'Patches', 'Whiskers', 'Fuzzy', 'Squeaky', 'Nibbles', 'Buttons',
    'Snowball', 'Shadow', 'Midnight', 'Dusty', 'Rusty', 'Smokey',
    'Spot', 'Freckles', 'Marble', 'Speckles', 'Domino', 'Checkers',
    'Bubbles', 'Happy', 'Lucky', 'Sunny', 'Joy', 'Sparkle',
    'Zippy', 'Dash', 'Rocket', 'Turbo', 'Flash', 'Zoom',
    'Cuddles', 'Snuggle', 'Buddy', 'Angel', 'Princess', 'Prince',
    'Clover', 'Daisy', 'Poppy', 'Rose', 'Lily', 'Willow',
    'Hazel', 'Maple', 'Cedar', 'Fern', 'Sage', 'Basil'
  ]

  // Simple arrays for UI exports
  const breeds = ['American', 'Abyssinian', 'Peruvian', 'Silkie', 'Teddy', 'Rex', 'Texel', 'Coronet', 'Alpaca', 'Baldwin', 'Merino', 'Skinny Pig', 'White Crested']

  const furColors = [
    'white', 'black', 'brown', 'cream', 'orange', 'gray',
    'red', 'gold', 'beige', 'chocolate', 'lilac', 'buff',
    'tortoiseshell', 'tricolor', 'dalmatian'
  ]

  const furPatterns = [
    'self', 'agouti', 'dutch', 'brindle', 'roan',
    'satin', 'himalayan', 'magpie'
  ]

  // Weighted arrays for rarity system
  interface WeightedItem {
    value: string
    weight: number
    rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare'
  }

  const weightedBreeds: WeightedItem[] = [
    // Common breeds (American most common at weight 150, Abyssinian at 100)
    { value: 'American', weight: 150, rarity: 'common' },
    { value: 'Abyssinian', weight: 100, rarity: 'common' },
    // Uncommon breeds (weight 50)
    { value: 'Peruvian', weight: 50, rarity: 'uncommon' },
    { value: 'Teddy', weight: 50, rarity: 'uncommon' },
    { value: 'Rex', weight: 50, rarity: 'uncommon' },
    // Rare breeds (weight 20)
    { value: 'Silkie', weight: 20, rarity: 'rare' },
    { value: 'Texel', weight: 20, rarity: 'rare' },
    { value: 'Coronet', weight: 20, rarity: 'rare' },
    { value: 'White Crested', weight: 20, rarity: 'rare' },
    // Very rare breeds (weight 5)
    { value: 'Alpaca', weight: 5, rarity: 'very-rare' },
    { value: 'Merino', weight: 5, rarity: 'very-rare' },
    // Ultra rare breeds (weight 2)
    { value: 'Baldwin', weight: 2, rarity: 'ultra-rare' },
    { value: 'Skinny Pig', weight: 2, rarity: 'ultra-rare' }
  ]

  const weightedFurColors: WeightedItem[] = [
    // Common colors (weight 100)
    { value: 'black', weight: 100, rarity: 'common' },
    { value: 'white', weight: 100, rarity: 'common' },
    { value: 'brown', weight: 100, rarity: 'common' },
    { value: 'cream', weight: 100, rarity: 'common' },
    { value: 'tortoiseshell', weight: 100, rarity: 'common' },
    { value: 'tricolor', weight: 100, rarity: 'common' },
    // Uncommon colors (weight 80)
    { value: 'orange', weight: 80, rarity: 'uncommon' },
    { value: 'gray', weight: 80, rarity: 'uncommon' },
    { value: 'red', weight: 80, rarity: 'uncommon' },
    { value: 'gold', weight: 80, rarity: 'uncommon' },
    { value: 'beige', weight: 80, rarity: 'uncommon' },
    // Rare colors (weight 50)
    { value: 'chocolate', weight: 50, rarity: 'rare' },
    { value: 'lilac', weight: 50, rarity: 'rare' },
    { value: 'buff', weight: 50, rarity: 'rare' },
    { value: 'dalmatian', weight: 50, rarity: 'rare' }
  ]

  const weightedFurPatterns: WeightedItem[] = [
    // Common patterns (weight 100)
    { value: 'self', weight: 100, rarity: 'common' },
    { value: 'agouti', weight: 100, rarity: 'common' },
    // Uncommon patterns (weight 50)
    { value: 'dutch', weight: 50, rarity: 'uncommon' },
    { value: 'brindle', weight: 50, rarity: 'uncommon' },
    { value: 'magpie', weight: 50, rarity: 'uncommon' },
    // Rare patterns (weight 20)
    { value: 'roan', weight: 20, rarity: 'rare' },
    { value: 'satin', weight: 20, rarity: 'rare' },
    { value: 'himalayan', weight: 20, rarity: 'rare' }
  ]

  const vegetables = [
    'bell_pepper', 'carrot', 'cucumber', 'leafy_greens',
    'broccoli', 'celery', 'cherry_tomatoes', 'zucchini',
    'parsley', 'cilantro', 'sweet_potato', 'snap_peas', 'dill'
  ]

  const fruits = [
    'apple', 'banana', 'strawberry', 'blueberry',
    'grape', 'orange', 'pear', 'melon', 'kiwi', 'raspberry'
  ]

  const hayTypes = [
    'timothy', 'orchard_grass', 'meadow', 'alfalfa',
    'botanical', 'oat', 'bermuda_grass', 'western_timothy'
  ]

  const activities = [
    'tunnels', 'climbing', 'hiding_games', 'chewing',
    'exploring', 'puzzle_solving', 'foraging'
  ]

  const habitatFeatures = [
    'quiet_spaces', 'open_spaces', 'multi_level',
    'cozy_corners', 'viewing_platforms'
  ]

  // Weighted random selection function
  function weightedRandom(items: WeightedItem[]): string {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    for (const item of items) {
      random -= item.weight
      if (random <= 0) {
        return item.value
      }
    }

    // Fallback (should never reach here)
    return items[0].value
  }

  // Helper function to get rarity of a trait
  function getRarity(value: string, weightedArray: WeightedItem[]): string | undefined {
    const item = weightedArray.find(i => i.value === value)
    return item?.rarity
  }

  function randomName(): string {
    return guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)]
  }

  function randomBreed(): string {
    return weightedRandom(weightedBreeds)
  }

  function randomGender(): 'male' | 'female' {
    return Math.random() > 0.5 ? 'female' : 'male'
  }

  function randomFurColor(): string {
    return weightedRandom(weightedFurColors)
  }

  function randomFurPattern(breed?: string): string {
    // Hairless breeds (Baldwin, Skinny Pig) can only have skin pigmentation patterns
    // Exclude fur-specific patterns: agouti, brindle, roan, satin, himalayan
    const hairlessBreeds = ['Baldwin', 'Skinny Pig']
    const furSpecificPatterns = ['agouti', 'brindle', 'roan', 'satin', 'himalayan']

    if (breed && hairlessBreeds.includes(breed)) {
      const hairlessCompatiblePatterns = weightedFurPatterns.filter(
        pattern => !furSpecificPatterns.includes(pattern.value)
      )
      return weightedRandom(hairlessCompatiblePatterns)
    }

    return weightedRandom(weightedFurPatterns)
  }

  function randomEyeColor(furColor: string): string {
    // Light colors that are appropriate for pink/red eyes
    const lightColors = ['white', 'cream', 'beige', 'gray', 'lilac', 'buff']

    if (lightColors.includes(furColor)) {
      // Light colors: 25% pink/red, 20% blue, 55% brown/black
      const random = Math.random()

      if (random < 0.25) {
        // 25% chance of pink/red eyes
        return Math.random() < 0.5 ? 'pink' : 'red'
      } else if (random < 0.45) {
        // 20% chance of blue eyes (25% + 20% = 45%)
        return 'blue'
      } else {
        // 55% chance of brown/black eyes
        return Math.random() < 0.5 ? 'brown' : 'black'
      }
    } else {
      // Dark colors: 10% blue, 90% brown/black, no pink/red
      if (Math.random() < 0.1) {
        // 10% chance of blue eyes (rare)
        return 'blue'
      } else {
        // 90% chance of brown/black eyes
        return Math.random() < 0.5 ? 'brown' : 'black'
      }
    }
  }

  function pickRandomPreferences(items: string[], alreadyPicked: string[] = []): string[] {
    const available = items.filter(item => !alreadyPicked.includes(item))

    if (available.length === 0) return []

    const count = Math.random() < 0.5 ? 1 : 2

    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, available.length))
  }

  function generateRandomPreferences() {
    const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5)

    const shuffledVegetables = shuffleArray(vegetables)
    const vegLikes = pickRandomPreferences(shuffledVegetables)
    const vegDislikes = pickRandomPreferences(shuffledVegetables, vegLikes)

    const shuffledFruits = shuffleArray(fruits)
    const fruitLikes = pickRandomPreferences(shuffledFruits)
    const fruitDislikes = pickRandomPreferences(shuffledFruits, fruitLikes)

    const shuffledHay = shuffleArray(hayTypes)
    const hayLikes = pickRandomPreferences(shuffledHay)
    const hayDislikes = pickRandomPreferences(shuffledHay, hayLikes)

    const favoriteFood = [...vegLikes, ...fruitLikes, ...hayLikes]
    const dislikedFood = [...vegDislikes, ...fruitDislikes, ...hayDislikes]

    const shuffledActivities = shuffleArray(activities)
    const favoriteActivity = pickRandomPreferences(shuffledActivities)
    const dislikedActivity = pickRandomPreferences(shuffledActivities, favoriteActivity)

    const shuffledHabitat = shuffleArray(habitatFeatures)
    const habitatPreference = pickRandomPreferences(shuffledHabitat)
    const dislikedHabitat = pickRandomPreferences(shuffledHabitat, habitatPreference)

    return {
      favoriteFood,
      dislikedFood,
      favoriteActivity,
      dislikedActivity,
      habitatPreference,
      dislikedHabitat
    }
  }

  function generateRandomGuineaPig(): GuineaPig {
    const breed = randomBreed()
    const color = randomFurColor()
    const multiColorPatterns = ['tortoiseshell', 'tricolor', 'dalmatian']
    const pattern = multiColorPatterns.includes(color) ? 'self' : randomFurPattern(breed)

    const birthDate = Date.now() - (Math.floor(Math.random() * 730) + 30) * 24 * 60 * 60 * 1000

    return {
      id: generateGuineaPigId(),
      name: randomName(),
      gender: randomGender(),
      breed,
      birthDate,
      lastInteraction: Date.now(),

      personality: {
        friendliness: Math.floor(Math.random() * 10) + 1,
        playfulness: Math.floor(Math.random() * 10) + 1,
        curiosity: Math.floor(Math.random() * 10) + 1,
        boldness: Math.floor(Math.random() * 10) + 1
      },

      preferences: generateRandomPreferences(),

      needs: {
        hunger: 100,
        thirst: 100,
        energy: 100,
        shelter: 100,
        play: 100,
        social: 100,
        stimulation: 100,
        comfort: 100,
        hygiene: 100,
        nails: 100,
        health: 100,
        chew: 100
      },

      stats: {
        weight: Math.floor(Math.random() * 500) + 700,
        age: Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24)),
        level: 1,
        experience: 0,
        wellness: 0,
        overallMood: 0
      },

      appearance: {
        furColor: color,
        furPattern: pattern,
        eyeColor: randomEyeColor(color),  // Now uses fur color-aware eye color selection
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
      },

      friendship: 50,
      relationships: {},

      // System 2.5: Fulfillment Limitation System
      consumptionLimits: {
        fruit: { consumed: 0, limit: 1 },
        vegetables: { consumed: 0, limit: 3 },
        pellets: { consumed: 0, limit: 2 },
        treats: { consumed: 0, limit: 1 }
      },
      interactionRejection: {
        lastRejectionTime: null,
        cooldownEndTime: null,
        rejectionCount: 0,
        isOnCooldown: false
      },
      lastHungerResetLevel: 100,

      // Phase 0: Interaction cooldowns
      lastPlayTime: null,
      lastSocialTime: null,

      // Phase 2: Adoption timers
      adoptionTimer: Date.now(),
      adoptionDuration: Math.floor(Math.random() * (5 * 24 * 60 * 60 * 1000 - 2 * 24 * 60 * 60 * 1000) + 2 * 24 * 60 * 60 * 1000), // 2-5 days in ms

      totalInteractions: 0,
      lifetimeHappiness: 100,
      achievementsUnlocked: []
    }
  }

  function generateRandomGuineaPigs(count: number = 10): void {
    const guineaPigs: GuineaPig[] = []

    for (let i = 0; i < count; i++) {
      guineaPigs.push(generateRandomGuineaPig())
    }

    availableGuineaPigs.value = guineaPigs

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Generated ${count} random guinea pigs for pet store 🏪`,
      '🏪',
      { count }
    )
  }

  // Favorites management functions
  function addToFavorites(guineaPigId: string): boolean {
    // Validate guinea pig exists in available pool
    const guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
    if (!guineaPig) {
      getLoggingStore().logWarn('Guinea pig not found in available pool')
      return false
    }

    // Check if already in favorites (prevent duplicates)
    const isAlreadyFavorited = favoriteGuineaPigs.value.some(gp => gp.id === guineaPigId)
    if (isAlreadyFavorited) {
      getLoggingStore().logWarn('Guinea pig is already in favorites')
      return false
    }

    // Check slot availability
    if (!canAddToFavorites.value) {
      getLoggingStore().logWarn('No available favorite slots')
      return false
    }

    // Check if guinea pig is in active game session
    const isInActiveSession = activeGameSession.value?.guineaPigIds.includes(guineaPigId) ?? false

    // Keep guinea pig in available pool (don't remove)
    // This allows visual feedback that they're favorited while still showing them
    // Similar to how active guinea pigs remain visible

    // Add to favorites (create copy to avoid reference issues)
    favoriteGuineaPigs.value.push({ ...guineaPig })

    getLoggingStore().addPlayerAction(
      `Added ${guineaPig.name} to favorites ⭐`,
      '⭐',
      { guineaPigId, name: guineaPig.name, wasActive: isInActiveSession }
    )

    return true
  }

  function removeFromFavorites(guineaPigId: string): boolean {
    const index = favoriteGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
    if (index === -1) {
      getLoggingStore().logWarn('Guinea pig not found in favorites')
      return false
    }

    // Check if guinea pig is in active game session
    const isInActiveSession = activeGameSession.value?.guineaPigIds.includes(guineaPigId) ?? false

    if (isInActiveSession) {
      // Silently fail - UI should prevent this action by disabling the button
      return false
    }

    const guineaPig = favoriteGuineaPigs.value[index]

    // Remove from favorites
    favoriteGuineaPigs.value.splice(index, 1)

    getLoggingStore().addPlayerAction(
      `${guineaPig.name} is no longer a favorite (but still loved!) 💫`,
      '💫',
      { guineaPigId, name: guineaPig.name }
    )

    return true
  }

  function moveFromFavoritesToStore(guineaPigId: string): boolean {
    const index = favoriteGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
    if (index === -1) {
      getLoggingStore().logWarn('Guinea pig not found in favorites')
      return false
    }

    // Check if guinea pig is in active game session
    const isInActiveSession = activeGameSession.value?.guineaPigIds.includes(guineaPigId) ?? false

    if (isInActiveSession) {
      // Silently fail - UI should prevent this action by disabling the button
      return false
    }

    const guineaPig = favoriteGuineaPigs.value[index]

    // Remove from favorites
    favoriteGuineaPigs.value.splice(index, 1)

    // Add to available pool
    availableGuineaPigs.value.push(guineaPig)

    getLoggingStore().addPlayerAction(
      `${guineaPig.name} is heading back to the store to hang out with friends! 🏪`,
      '🏪',
      { guineaPigId, name: guineaPig.name }
    )

    return true
  }

  // Phase 2: Adoption Timer System
  /**
   * Process adoption timers for all store guinea pigs
   * Replaces guinea pigs whose adoption time has expired
   */
  function processAdoptionTimers(): void {
    const now = Date.now()
    const expiredGuineaPigs: string[] = []

    // Check all available guinea pigs for expired timers
    for (const guineaPig of availableGuineaPigs.value) {
      if (guineaPig.adoptionTimer !== null) {
        const expirationTime = guineaPig.adoptionTimer + guineaPig.adoptionDuration

        if (now >= expirationTime) {
          // Skip if guinea pig is in active session or favorites
          const isActive = activeGameSession.value?.guineaPigIds.includes(guineaPig.id) ?? false
          const isFavorited = favoriteGuineaPigs.value.some(fav => fav.id === guineaPig.id)

          if (!isActive && !isFavorited) {
            expiredGuineaPigs.push(guineaPig.id)
          }
        }
      }
    }

    // Replace expired guinea pigs with new ones
    for (const expiredId of expiredGuineaPigs) {
      const index = availableGuineaPigs.value.findIndex(gp => gp.id === expiredId)
      if (index !== -1) {
        const oldGuineaPig = availableGuineaPigs.value[index]
        const newGuineaPig = generateRandomGuineaPig()

        availableGuineaPigs.value.splice(index, 1, newGuineaPig)

        getLoggingStore().addPlayerAction(
          `${oldGuineaPig.name} was adopted by another family! ${newGuineaPig.name} has arrived at the store 🏪`,
          '🏪',
          {
            removedId: expiredId,
            removedName: oldGuineaPig.name,
            addedId: newGuineaPig.id,
            addedName: newGuineaPig.name
          }
        )
      }
    }
  }

  /**
   * Get time remaining until adoption for a guinea pig
   */
  function getAdoptionTimeRemaining(guineaPigId: string): number {
    const guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
    if (!guineaPig || guineaPig.adoptionTimer === null) return 0

    const expirationTime = guineaPig.adoptionTimer + guineaPig.adoptionDuration
    const remaining = expirationTime - Date.now()

    return Math.max(0, remaining)
  }

  /**
   * Format adoption timer as human-readable string
   */
  function formatAdoptionTimer(ms: number): string {
    if (ms === 0) return 'Adopted'

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  function startGameSession(guineaPigIds: string[]): void {
    if (guineaPigIds.length < 1 || guineaPigIds.length > 2) {
      const logging = getLoggingStore()
      logging.logError('Invalid guinea pig count for game session (must be 1-2)')
      return
    }

    if (activeGameSession.value) {
      const logging = getLoggingStore()
      logging.logWarn('Game session already active')
      return
    }

    const guineaPigStore = useGuineaPigStore()

    // Add guinea pigs to the guinea pig store collection before setting them as active
    // Check both available and favorite guinea pigs
    const wasFromFavorites: Record<string, boolean> = {}
    for (const guineaPigId of guineaPigIds) {
      let guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
      let isFromFavorites = false

      // If not in available pool, check favorites
      if (!guineaPig) {
        guineaPig = favoriteGuineaPigs.value.find(gp => gp.id === guineaPigId)
        isFromFavorites = !!guineaPig
      } else {
        // Check if also in favorites
        isFromFavorites = favoriteGuineaPigs.value.some(fav => fav.id === guineaPigId)
      }

      wasFromFavorites[guineaPigId] = isFromFavorites

      if (guineaPig) {
        // Add to guinea pig store collection
        guineaPigStore.collection.guineaPigs[guineaPigId] = { ...guineaPig }
      }
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    activeGameSession.value = {
      id: sessionId,
      startedAt: Date.now(),
      guineaPigIds: [...guineaPigIds],
      sessionDuration: 0,
      wasFromFavorites
    }

    guineaPigStore.setActivePair(guineaPigIds)

    // Initialize needs tracking for the guinea pigs
    const sessionStartTime = Date.now()
    for (const guineaPigId of guineaPigIds) {
      guineaPigStore.needsLastUpdate[guineaPigId] = sessionStartTime
    }

    // Enable needs processing for the session
    const needsController = useNeedsController()
    needsController.resumeProcessing()

    const playerProgression = usePlayerProgression()
    playerProgression.incrementGameSessions()
    playerProgression.incrementGuineaPigsAdopted(guineaPigIds.length)

    // Start the game for the new session
    const gameController = useGameController()
    gameController.startGame()

    const logging = getLoggingStore()
    const names = activeSessionGuineaPigs.value.map(gp => gp.name).join(' & ')
    logging.addPlayerAction(
      `Started game session with ${names} ▶️`,
      '▶️',
      { sessionId, guineaPigIds }
    )
  }

  /**
   * Apply bonding effects when a guinea pig's partner is removed
   * This function handles grief mechanics for bonded guinea pigs
   * @param guineaPigId - The guinea pig who is staying
   * @param removedPartnerId - The partner who was removed
   */
  function applyBondBreakingEffects(guineaPigId: string, removedPartnerId: string): void {
    const guineaPigStore = useGuineaPigStore()
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
    const removedPartner = guineaPigStore.getGuineaPig(removedPartnerId)

    if (!guineaPig || !removedPartner) return

    // Check if they had a bond (using relationships as a proxy for bondLevel)
    // In the future, this should use a proper bondLevel property (0-100)
    const bondLevel = guineaPig.relationships[removedPartnerId] || 0

    // Only apply effects if bond was significant (50+)
    if (bondLevel >= 50) {
      const logging = getLoggingStore()

      // Apply emotional consequences
      guineaPig.friendship = Math.max(30, guineaPig.friendship - 15)
      guineaPig.needs.comfort = Math.max(40, 50)
      guineaPig.needs.social = Math.max(40, 60)

      logging.addPlayerAction(
        `${guineaPig.name} is grieving the loss of their bonded partner ${removedPartner.name} 💔`,
        '💔',
        {
          guineaPigId,
          removedPartnerId,
          bondLevel,
          friendshipLoss: 15
        }
      )

      // Note: Full grieving status implementation would add:
      // guineaPig.temporaryStatuses.push({
      //   type: 'grieving',
      //   startedAt: Date.now(),
      //   duration: 14400000,  // 4 hours
      //   partnerId: removedPartnerId,
      //   partnerName: removedPartner.name
      // })
    } else if (bondLevel >= 25) {
      // Minor effects for weak bonds
      guineaPig.friendship = Math.max(40, guineaPig.friendship - 5)
      const logging = getLoggingStore()
      logging.addPlayerAction(
        `${guineaPig.name} misses ${removedPartner.name} a little 💙`,
        '💙',
        { guineaPigId, removedPartnerId, bondLevel }
      )
    }
  }

  function endGameSession(): void {
    if (!activeGameSession.value) {
      const logging = getLoggingStore()
      logging.logWarn('No active game session to end')
      return
    }

    const guineaPigStore = useGuineaPigStore()
    const playerProgression = usePlayerProgression()
    const logging = getLoggingStore()
    const { guineaPigIds, wasFromFavorites } = activeGameSession.value

    // Determine session type and calculate costs
    const favoriteCount = guineaPigIds.filter(id => wasFromFavorites[id]).length
    const nonFavoriteCount = guineaPigIds.length - favoriteCount

    let totalCost = 0
    const removedGuineaPigs: string[] = []

    if (nonFavoriteCount === 0) {
      // All favorited - $0 fee, all return to favorites
      totalCost = 0
      logging.addPlayerAction(
        `Session ended - all guinea pigs were favorites, returned safely! 💚`,
        '💚',
        { type: 'all_favorited', cost: 0 }
      )
    } else if (favoriteCount === 0) {
      // None favorited - $100 rescue fee, all permanently removed
      totalCost = 100
      removedGuineaPigs.push(...guineaPigIds)
      playerProgression.deductCurrency(totalCost, 'guinea_pig_rescue')

      const names = guineaPigIds.map(id => {
        const gp = guineaPigStore.getGuineaPig(id)
        return gp?.name || 'Unknown'
      }).join(' & ')

      logging.addPlayerAction(
        `Session ended - ${names} found new homes (rescue fee: $${totalCost}) 🏡`,
        '🏡',
        { type: 'none_favorited', cost: totalCost, removedCount: nonFavoriteCount }
      )
    } else {
      // Mixed - $50 fee, non-favorites removed, favorites return
      totalCost = 50
      playerProgression.deductCurrency(totalCost, 'mixed_guinea_pig_return')

      const nonFavoritedIds = guineaPigIds.filter(id => !wasFromFavorites[id])
      removedGuineaPigs.push(...nonFavoritedIds)

      const removedNames = nonFavoritedIds.map(id => {
        const gp = guineaPigStore.getGuineaPig(id)
        return gp?.name || 'Unknown'
      }).join(' & ')

      const favoritedNames = guineaPigIds.filter(id => wasFromFavorites[id]).map(id => {
        const gp = guineaPigStore.getGuineaPig(id)
        return gp?.name || 'Unknown'
      }).join(' & ')

      logging.addPlayerAction(
        `Session ended - ${favoritedNames} returned safely, ${removedNames} found new homes (fee: $${totalCost}) 🏡💚`,
        '🏡',
        { type: 'mixed', cost: totalCost, removedCount: nonFavoriteCount, favoritedCount: favoriteCount }
      )
    }

    // Apply bonding effects for guinea pigs whose partners are being removed
    if (removedGuineaPigs.length > 0) {
      // Check if any remaining guinea pigs had bonds with removed ones
      const remainingGuineaPigs = guineaPigIds.filter(id => !removedGuineaPigs.includes(id))

      for (const remainingId of remainingGuineaPigs) {
        for (const removedId of removedGuineaPigs) {
          // Apply bonding effects if they were partners
          applyBondBreakingEffects(remainingId, removedId)
        }
      }
    }

    // Remove non-favorited guinea pigs permanently
    for (const id of removedGuineaPigs) {
      // Remove from guinea pig store collection
      delete guineaPigStore.collection.guineaPigs[id]

      // Remove from available list
      const availableIndex = availableGuineaPigs.value.findIndex(gp => gp.id === id)
      if (availableIndex !== -1) {
        availableGuineaPigs.value.splice(availableIndex, 1)
      }
    }

    // Reset needs for all guinea pigs (before removal)
    for (const id of guineaPigIds) {
      guineaPigStore.resetGuineaPigNeeds(id)
    }

    guineaPigStore.setActivePair([])

    // Disable needs processing when session ends
    const needsController = useNeedsController()
    needsController.pauseProcessing()

    const duration = Date.now() - activeGameSession.value.startedAt
    playerProgression.addPlayTime(duration)

    activeGameSession.value = null
  }


  function initializeStore(): void {
    const logging = getLoggingStore()

    if (availableGuineaPigs.value.length === 0) {
      generateRandomGuineaPigs(10)
    }

    logging.logInfo(`Pet Store Manager initialized with ${availableGuineaPigs.value.length} guinea pigs`)
  }

  return {
    availableGuineaPigs,
    favoriteGuineaPigs,
    maxFavoriteSlots,
    activeGameSession,
    settings,

    activeSessionGuineaPigs,

    // Favorites computed properties
    favoriteCount,
    availableFavoriteSlots,
    canAddToFavorites,
    canPurchaseMoreSlots,

    // Data arrays for UI components
    furColors,
    furPatterns,
    breeds,
    eyeColors: ['brown', 'black', 'red', 'blue', 'pink'],
    vegetables,
    fruits,
    hayTypes,
    activities,
    habitatFeatures,

    // Weighted arrays for rarity display
    weightedBreeds,
    weightedFurColors,
    weightedFurPatterns,
    getRarity,

    generateRandomGuineaPigs,
    startGameSession,
    endGameSession,
    initializeStore,

    // Phase 2: Adoption timer methods
    processAdoptionTimers,
    getAdoptionTimeRemaining,
    formatAdoptionTimer,

    // Favorites methods
    addToFavorites,
    removeFromFavorites,
    moveFromFavoritesToStore
  }
}, {
  persist: {
    key: 'gps2-pet-store-manager',
    storage: localStorage
  }
})