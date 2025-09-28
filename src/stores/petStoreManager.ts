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
  const lastRefreshTimestamp = ref<number>(0)
  const refreshCooldownMs = ref<number>(3600000)
  const activeGameSession = ref<GameSession | null>(null)

  const settings = ref<PetStoreSettings>({
    endGamePenalty: 50,
    allowUnlimitedRefresh: false
  })

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

  const activeSessionGuineaPigs = computed(() => {
    if (!activeGameSession.value) return []
    const guineaPigStore = useGuineaPigStore()
    return activeGameSession.value.guineaPigIds
      .map(id => guineaPigStore.getGuineaPig(id))
      .filter(Boolean) as GuineaPig[]
  })

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

  const breeds = ['American', 'Abyssinian', 'Peruvian', 'Silkie', 'Teddy', 'Rex', 'Texel', 'Coronet']

  const furColors = [
    'white', 'black', 'brown', 'cream', 'orange', 'gray',
    'red', 'gold', 'beige', 'chocolate', 'lilac', 'buff',
    'tortoiseshell', 'tricolor', 'dalmatian'
  ]

  const furPatterns = [
    'self', 'agouti', 'dutch', 'brindle', 'roan',
    'satin', 'himalayan', 'broken', 'pied', 'magpie'
  ]

  function randomName(): string {
    return guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)]
  }

  function randomBreed(): string {
    return breeds[Math.floor(Math.random() * breeds.length)]
  }

  function randomGender(): 'male' | 'female' {
    return Math.random() > 0.5 ? 'female' : 'male'
  }

  function randomFurColor(): string {
    return furColors[Math.floor(Math.random() * furColors.length)]
  }

  function randomFurPattern(): string {
    return furPatterns[Math.floor(Math.random() * furPatterns.length)]
  }

  function generateRandomPreferences() {
    const vegetables = ['bell_pepper', 'carrot', 'cucumber', 'leafy_greens', 'broccoli', 'celery']
    const fruits = ['apple', 'banana', 'strawberry', 'blueberry', 'grape', 'orange']

    const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5)

    const shuffledVegetables = shuffleArray(vegetables)
    const shuffledFruits = shuffleArray(fruits)

    return {
      favoriteFood: [shuffledVegetables[0], shuffledFruits[0]],
      favoriteActivity: ['tunnels', 'chew_toys'],
      socialPreference: ['solitary', 'social', 'mixed'][Math.floor(Math.random() * 3)] as 'solitary' | 'social' | 'mixed',
      habitatPreference: ['quiet_spaces', 'open_spaces']
    }
  }

  function generateRandomGuineaPig(): GuineaPig {
    const color = randomFurColor()
    const multiColorPatterns = ['tortoiseshell', 'tricolor', 'dalmatian']
    const pattern = multiColorPatterns.includes(color) ? 'self' : randomFurPattern()

    const birthDate = Date.now() - (Math.floor(Math.random() * 730) + 30) * 24 * 60 * 60 * 1000

    return {
      id: generateGuineaPigId(),
      name: randomName(),
      gender: randomGender(),
      breed: randomBreed(),
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
        eyeColor: ['brown', 'black', 'red', 'blue'][Math.floor(Math.random() * 4)],
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
      },

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

  function refreshPetStore(): void {
    if (!canRefreshPetStore.value) {
      const logging = getLoggingStore()
      logging.logWarning('Pet store refresh on cooldown')
      return
    }

    // End any active session before refreshing since guinea pig IDs will change
    if (activeGameSession.value) {
      endGameSession()
    }

    generateRandomGuineaPigs(10)
    lastRefreshTimestamp.value = Date.now()

    const logging = getLoggingStore()
    logging.addPlayerAction('Refreshed pet store with new guinea pigs 🔄', '🔄', {})
  }

  function startGameSession(guineaPigIds: string[]): void {
    if (guineaPigIds.length < 1 || guineaPigIds.length > 2) {
      const logging = getLoggingStore()
      logging.logError('Invalid guinea pig count for game session (must be 1-2)')
      return
    }

    if (activeGameSession.value) {
      const logging = getLoggingStore()
      logging.logWarning('Game session already active')
      return
    }

    const guineaPigStore = useGuineaPigStore()

    // Add guinea pigs to the guinea pig store collection before setting them as active
    for (const guineaPigId of guineaPigIds) {
      const guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
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

    // Reset and start the game for the new session
    const gameController = useGameController()
    gameController.stopGame() // Reset any previous game state
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
      logging.logWarning('No active game session to end')
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

    activeGameSession.value = null
  }

  function initializeStore(): void {
    const logging = getLoggingStore()
    logging.logInfo('Pet Store Manager initializing...')

    if (availableGuineaPigs.value.length === 0) {
      generateRandomGuineaPigs(10)
      logging.logInfo('Generated initial pet store with 10 guinea pigs')
    }

    logging.logInfo(`Pet Store Manager initialized with ${availableGuineaPigs.value.length} guinea pigs`)
  }

  return {
    availableGuineaPigs,
    lastRefreshTimestamp,
    refreshCooldownMs,
    activeGameSession,
    settings,

    canRefreshPetStore,
    remainingCooldownMs,
    formattedCooldown,
    activeSessionGuineaPigs,

    // Data arrays for UI components
    furColors,
    furPatterns,
    breeds,
    eyeColors: ['brown', 'black', 'red', 'blue'],

    generateRandomGuineaPigs,
    refreshPetStore,
    startGameSession,
    endGameSession,
    initializeStore
  }
}, {
  persist: {
    key: 'gps2-pet-store-manager',
    storage: localStorage
  }
})