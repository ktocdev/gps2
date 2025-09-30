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

export interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[]
  sessionDuration: number
}

interface PetStoreSettings {
  endGamePenalty: number
  allowUnlimitedRefresh: boolean
  autoRefreshEnabled: boolean
  autoRefreshIntervalMs: number
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
  const lastRefreshTimestamp = ref<number>(0)
  const refreshCooldownMs = ref<number>(3600000)
  const activeGameSession = ref<GameSession | null>(null)
  const nextAutoRefreshTime = ref<number>(0)

  const settings = ref<PetStoreSettings>({
    endGamePenalty: 50,
    allowUnlimitedRefresh: false,
    autoRefreshEnabled: false,
    autoRefreshIntervalMs: 86400000 // 24 hours in milliseconds
  })

  // Auto-refresh interval reference
  let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

  const canRefreshPetStore = computed(() => {
    if (settings.value.allowUnlimitedRefresh) return true
    const elapsed = Date.now() - lastRefreshTimestamp.value
    return elapsed >= refreshCooldownMs.value
  })

  const remainingCooldownMs = computed(() => {
    if (settings.value.allowUnlimitedRefresh) return 0
    const elapsed = Date.now() - lastRefreshTimestamp.value
    const remaining = refreshCooldownMs.value - elapsed
    return Math.max(0, remaining)
  })

  const formattedCooldown = computed(() => {
    const ms = remainingCooldownMs.value
    if (ms === 0) return 'Ready'

    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  })

  const timeUntilAutoRefresh = computed(() => {
    if (!settings.value.autoRefreshEnabled || nextAutoRefreshTime.value === 0) return 0
    const remaining = nextAutoRefreshTime.value - Date.now()
    return Math.max(0, remaining)
  })

  const formattedAutoRefreshTime = computed(() => {
    const ms = timeUntilAutoRefresh.value
    if (ms === 0) return 'Disabled'

    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
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
    // Common breeds (weight 100)
    { value: 'American', weight: 100, rarity: 'common' },
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
        independence: Math.floor(Math.random() * 10) + 1
      },

      preferences: generateRandomPreferences(),

      needs: {
        hunger: 0,
        thirst: 0,
        happiness: 0,
        cleanliness: 0,
        health: 0,
        energy: 0,
        social: 0,
        nails: 0,
        chew: 0,
        shelter: 0
      },

      stats: {
        weight: Math.floor(Math.random() * 500) + 700,
        age: Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24)),
        level: 1,
        experience: 0,
        wellness: 100,
        overallMood: 100
      },

      appearance: {
        furColor: color,
        furPattern: pattern,
        eyeColor: randomEyeColor(color),  // Now uses fur color-aware eye color selection
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
      },

      friendship: 50,
      relationships: {},
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

    // Check slot availability
    if (!canAddToFavorites.value) {
      getLoggingStore().logWarn('No available favorite slots')
      return false
    }

    // Check if guinea pig is in active game session
    const isInActiveSession = activeGameSession.value?.guineaPigIds.includes(guineaPigId) ?? false

    // Only remove from available pool if NOT in active game session
    if (!isInActiveSession) {
      availableGuineaPigs.value = availableGuineaPigs.value.filter(
        gp => gp.id !== guineaPigId
      )
    }

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
      `Removed ${guineaPig.name} from favorites 💔`,
      '💔',
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
      `Moved ${guineaPig.name} from favorites to store 🏪`,
      '🏪',
      { guineaPigId, name: guineaPig.name }
    )

    return true
  }

  function refreshPetStore(isAutoRefresh: boolean = false): void {
    if (!isAutoRefresh && !canRefreshPetStore.value) {
      const logging = getLoggingStore()
      logging.logWarn('Pet store refresh on cooldown')
      return
    }

    // End any active session before refreshing since guinea pig IDs will change
    if (activeGameSession.value) {
      endGameSession()
    }

    // Preserve favorites during refresh (key feature!)
    const favoritesBackup = [...favoriteGuineaPigs.value]

    generateRandomGuineaPigs(10)
    lastRefreshTimestamp.value = Date.now()

    // Restore favorites
    favoriteGuineaPigs.value = favoritesBackup

    // Reset auto-refresh timer whenever any refresh occurs (manual or auto)
    if (settings.value.autoRefreshEnabled) {
      nextAutoRefreshTime.value = Date.now() + settings.value.autoRefreshIntervalMs
    }

    const logging = getLoggingStore()
    const refreshType = isAutoRefresh ? 'Auto-refreshed' : 'Refreshed'
    logging.addPlayerAction(`${refreshType} pet store with new guinea pigs 🔄`, '🔄', {
      isAutoRefresh,
      nextAutoRefresh: nextAutoRefreshTime.value,
      favoritesPreserved: favoritesBackup.length
    })
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
    for (const guineaPigId of guineaPigIds) {
      let guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)

      // If not in available pool, check favorites
      if (!guineaPig) {
        guineaPig = favoriteGuineaPigs.value.find(gp => gp.id === guineaPigId)
      }

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
      sessionDuration: 0
    }

    guineaPigStore.setActivePair(guineaPigIds)

    const playerProgression = usePlayerProgression()
    playerProgression.incrementGameSessions()
    playerProgression.incrementGuineaPigsAdopted()

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

  function endGameSession(): void {
    if (!activeGameSession.value) {
      const logging = getLoggingStore()
      logging.logWarn('No active game session to end')
      return
    }

    const playerProgression = usePlayerProgression()
    playerProgression.deductCurrency(settings.value.endGamePenalty, 'end_game_penalty')

    const guineaPigStore = useGuineaPigStore()
    for (const id of activeGameSession.value.guineaPigIds) {
      guineaPigStore.resetGuineaPigNeeds(id)
    }

    guineaPigStore.setActivePair([])

    const duration = Date.now() - activeGameSession.value.startedAt
    playerProgression.addPlayTime(duration)

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Ended game session (penalty: $${settings.value.endGamePenalty}) ⏹️`,
      '⏹️',
      { penalty: settings.value.endGamePenalty, duration }
    )

    // Note: We do NOT return guinea pigs to availableGuineaPigs here
    // If they were favorited during the session, they should stay in favorites only
    // If they weren't favorited, they're already in availableGuineaPigs

    activeGameSession.value = null
  }

  function startAutoRefresh(): void {
    if (!settings.value.autoRefreshEnabled) return

    // Clear any existing interval
    stopAutoRefresh()

    // Set next refresh time if not already set
    if (nextAutoRefreshTime.value === 0) {
      nextAutoRefreshTime.value = Date.now() + settings.value.autoRefreshIntervalMs
    }

    // Check every minute if it's time to refresh
    autoRefreshInterval = setInterval(() => {
      if (Date.now() >= nextAutoRefreshTime.value) {
        refreshPetStore(true)
      }
    }, 60000) // Check every minute

    const logging = getLoggingStore()
    logging.logInfo('Auto-refresh started for pet store', {
      interval: settings.value.autoRefreshIntervalMs,
      nextRefresh: nextAutoRefreshTime.value
    })
  }

  function stopAutoRefresh(): void {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }

  function toggleAutoRefresh(): void {
    settings.value.autoRefreshEnabled = !settings.value.autoRefreshEnabled

    if (settings.value.autoRefreshEnabled) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
      nextAutoRefreshTime.value = 0
      const logging = getLoggingStore()
      logging.logInfo('Auto-refresh stopped for pet store')
    }
  }

  function initializeStore(): void {
    const logging = getLoggingStore()
    logging.logInfo('Pet Store Manager initializing...')

    if (availableGuineaPigs.value.length === 0) {
      generateRandomGuineaPigs(10)
      logging.logInfo('Generated initial pet store with 10 guinea pigs')
    }

    // Check if an auto-refresh is due (in case app was closed and reopened)
    if (settings.value.autoRefreshEnabled && nextAutoRefreshTime.value > 0) {
      if (Date.now() >= nextAutoRefreshTime.value) {
        logging.logInfo('Auto-refresh was due, refreshing pet store')
        refreshPetStore(true)
      }
      // Restart the auto-refresh interval
      startAutoRefresh()
    }

    logging.logInfo(`Pet Store Manager initialized with ${availableGuineaPigs.value.length} guinea pigs`)
  }

  return {
    availableGuineaPigs,
    favoriteGuineaPigs,
    maxFavoriteSlots,
    lastRefreshTimestamp,
    refreshCooldownMs,
    activeGameSession,
    settings,
    nextAutoRefreshTime,

    canRefreshPetStore,
    remainingCooldownMs,
    formattedCooldown,
    activeSessionGuineaPigs,
    timeUntilAutoRefresh,
    formattedAutoRefreshTime,

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
    refreshPetStore,
    startGameSession,
    endGameSession,
    initializeStore,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,

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