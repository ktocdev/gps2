/**
 * System 19: Autonomous AI Behaviors
 * Core AI decision-making and behavior selection for guinea pigs
 */

import { ref, computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useMovement } from './useMovement'
import { usePathfinding } from './usePathfinding'
import { MessageGenerator } from '../../utils/messageGenerator'
import type { NeedType } from '../../stores/guineaPigStore'
import type { GridPosition } from './usePathfinding'

export type BehaviorType =
  | 'eat'
  | 'eat_hay'
  | 'drink'
  | 'sleep'
  | 'wander'
  | 'groom'
  | 'seek_shelter'
  | 'chew'
  | 'popcorn'
  | 'zoomies'
  | 'watch_player'
  | 'hide'
  | 'idle'

export interface BehaviorGoal {
  type: BehaviorType
  target: GridPosition | null
  priority: number
  estimatedDuration: number // milliseconds
  needSatisfied?: NeedType
  targetItemId?: string
}

export interface BehaviorState {
  currentGoal: BehaviorGoal | null
  currentActivity: 'idle' | 'walking' | 'eating' | 'drinking' | 'sleeping' | 'grooming'
  activityStartTime: number
  lastDecisionTime: number
  behaviorCooldowns: Map<BehaviorType, number>
}

// Default behavior thresholds
const DEFAULT_THRESHOLDS = {
  hunger: 30,  // Seek food when hunger < 30%
  thirst: 25,  // Seek water when thirst < 25%
  energy: 40,  // Sleep when energy < 40%
  hygiene: 30, // Groom when hygiene < 30%
  shelter: 60, // Seek shelter when shelter < 60%
  chew: 40     // Use chew items when chew < 40%
}

export function useGuineaPigBehavior(guineaPigId: string) {
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const movement = useMovement(guineaPigId)
  const pathfinding = usePathfinding()

  const behaviorState = ref<BehaviorState>({
    currentGoal: null,
    currentActivity: 'idle',
    activityStartTime: Date.now(),
    lastDecisionTime: Date.now(),
    behaviorCooldowns: new Map()
  })

  const guineaPig = computed(() => guineaPigStore.getGuineaPig(guineaPigId))

  /**
   * Check if behavior is on cooldown
   */
  function isOnCooldown(behaviorType: BehaviorType): boolean {
    const cooldownEnd = behaviorState.value.behaviorCooldowns.get(behaviorType)
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  /**
   * Set behavior cooldown
   */
  function setCooldown(behaviorType: BehaviorType, durationMs: number): void {
    behaviorState.value.behaviorCooldowns.set(behaviorType, Date.now() + durationMs)
  }

  /**
   * Calculate priority for a need-based behavior
   */
  function calculateNeedPriority(needValue: number, threshold: number, baseWeight: number): number {
    if (needValue >= threshold) return 0 // Need not urgent

    // Calculate urgency: lower need value = higher urgency
    const urgency = (threshold - needValue) / threshold // 0-1 scale
    return baseWeight * urgency
  }

  /**
   * Find nearest item by need type
   */
  function findNearestItemForNeed(needType: NeedType): { position: GridPosition; itemId: string } | null {
    const currentPos = movement.currentPosition.value
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    // Map need types to item keywords
    const itemKeywords: Record<NeedType, string[]> = {
      hunger: ['bowl', 'dish', 'food'],
      thirst: ['water', 'bottle'],
      energy: ['bed', 'sleeping'], // Will use floor if no bed
      shelter: ['shelter', 'hideaway', 'igloo', 'house'],
      hygiene: [], // Self-groom, no item needed
      play: ['toy', 'tunnel'],
      social: [], // Handled separately
      stimulation: ['toy', 'enrichment'],
      comfort: ['bed', 'hideaway'],
      nails: [], // Player action
      health: ['shelter'], // Rest in shelter
      chew: ['chew', 'wood']
    }

    const keywords = itemKeywords[needType] || []
    if (keywords.length === 0) return null

    let nearest: { position: GridPosition; itemId: string; distance: number } | null = null

    for (const itemId of items) {
      const position = itemPositions.get(itemId)
      if (!position) continue

      // Check if item matches need type
      const matchesNeed = keywords.some(keyword => itemId.toLowerCase().includes(keyword))
      if (!matchesNeed) continue

      // Calculate Manhattan distance
      const distance = Math.abs(currentPos.row - position.y) + Math.abs(currentPos.col - position.x)

      if (!nearest || distance < nearest.distance) {
        nearest = {
          position: { row: position.y, col: position.x },
          itemId,
          distance
        }
      }
    }

    if (!nearest) return null

    // For multi-tile items, check if anchor position is pathfindable
    // If not, find an accessible adjacent cell
    const targetPos = nearest.position

    // Try the anchor position first
    if (pathfinding.isValidPosition(targetPos)) {
      return { position: targetPos, itemId: nearest.itemId }
    }

    // If blocked, check adjacent cells (including diagonals for better accessibility)
    const adjacentOffsets = [
      { row: -1, col: 0 }, { row: 1, col: 0 }, // up, down
      { row: 0, col: -1 }, { row: 0, col: 1 }, // left, right
      { row: -1, col: -1 }, { row: -1, col: 1 }, // diagonals
      { row: 1, col: -1 }, { row: 1, col: 1 }
    ]

    for (const offset of adjacentOffsets) {
      const adjacentPos = {
        row: targetPos.row + offset.row,
        col: targetPos.col + offset.col
      }

      // Check if position is valid (in bounds and not blocked)
      if (pathfinding.isValidPosition(adjacentPos)) {
        return { position: adjacentPos, itemId: nearest.itemId }
      }
    }

    // Fallback: return anchor position even if blocked (pathfinding will handle it as goal)
    return { position: targetPos, itemId: nearest.itemId }
  }

  /**
   * Select highest priority behavior goal
   */
  function selectBehaviorGoal(thresholds = DEFAULT_THRESHOLDS): BehaviorGoal | null {
    const gp = guineaPig.value
    if (!gp) return null

    const needs = gp.needs
    const goals: BehaviorGoal[] = []

    // URGENT NEEDS (Priority 80-100)

    // Hunger < threshold - prioritize food bowls, but also consider hay racks
    if (needs.hunger < thresholds.hunger) {
      // Try food bowl first
      if (!isOnCooldown('eat')) {
        const target = findNearestItemForNeed('hunger')
        if (target) {
          goals.push({
            type: 'eat',
            target: target.position,
            targetItemId: target.itemId,
            priority: calculateNeedPriority(needs.hunger, thresholds.hunger, 100),
            estimatedDuration: 5000, // 5 seconds to eat
            needSatisfied: 'hunger'
          })
        }
      }

      // Hay racks as secondary option (slightly lower priority)
      if (!isOnCooldown('eat_hay')) {
        const hayRacks = habitatConditions.habitatItems.filter(id =>
          id.toLowerCase().includes('hay') && id.toLowerCase().includes('rack')
        )

        if (hayRacks.length > 0) {
          const hayRackId = hayRacks[0]
          const position = habitatConditions.itemPositions.get(hayRackId)

          if (position) {
            goals.push({
              type: 'eat_hay',
              target: { row: position.y, col: position.x },
              targetItemId: hayRackId,
              priority: calculateNeedPriority(needs.hunger, thresholds.hunger, 95), // Slightly lower than food bowl
              estimatedDuration: 6000, // 6 seconds to eat hay
              needSatisfied: 'hunger'
            })
          }
        }
      }
    }

    // Thirst < threshold
    if (needs.thirst < thresholds.thirst && !isOnCooldown('drink')) {
      const target = findNearestItemForNeed('thirst')
      if (target) {
        goals.push({
          type: 'drink',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.thirst, thresholds.thirst, 100),
          estimatedDuration: 3000, // 3 seconds to drink
          needSatisfied: 'thirst'
        })
      }
    }

    // Energy < threshold (sleep) - Enhanced bed selection
    if (needs.energy < thresholds.energy && !isOnCooldown('sleep')) {
      // Try to find preferred bed/shelter first
      const bed = findNearestItemForNeed('energy')
      const shelter = findNearestItemForNeed('shelter')

      // Prefer bed if available, otherwise use shelter, fallback to floor
      let target = bed || shelter
      let targetItemId = target?.itemId

      goals.push({
        type: 'sleep',
        target: target?.position || null, // Sleep at bed/shelter or in place
        targetItemId,
        priority: calculateNeedPriority(needs.energy, thresholds.energy, 80),
        estimatedDuration: 10000, // Base duration, actual varies by energy level
        needSatisfied: 'energy'
      })
    }

    // MODERATE NEEDS (Priority 40-70)

    // Shelter < threshold
    if (needs.shelter < thresholds.shelter && !isOnCooldown('seek_shelter')) {
      const target = findNearestItemForNeed('shelter')
      if (target) {
        goals.push({
          type: 'seek_shelter',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.shelter, thresholds.shelter, 70),
          estimatedDuration: 8000, // 8 seconds in shelter
          needSatisfied: 'shelter'
        })
      }
    }

    // Hygiene < threshold (self-groom)
    if (needs.hygiene < thresholds.hygiene && !isOnCooldown('groom')) {
      goals.push({
        type: 'groom',
        target: null, // Groom in place
        priority: calculateNeedPriority(needs.hygiene, thresholds.hygiene, 50),
        estimatedDuration: 4000, // 4 seconds grooming
        needSatisfied: 'hygiene'
      })
    }

    // Chew < threshold (use chew items)
    if (needs.chew < thresholds.chew && !isOnCooldown('chew')) {
      const chewItem = findNearestItemForNeed('chew')
      if (chewItem) {
        goals.push({
          type: 'chew',
          target: chewItem.position,
          targetItemId: chewItem.itemId,
          priority: calculateNeedPriority(needs.chew, thresholds.chew, 55),
          estimatedDuration: 5000, // 5 seconds chewing
          needSatisfied: 'chew'
        })
      }
    }

    // FRIENDSHIP BEHAVIORS (Priority 15-50)

    // Check friendship level for spontaneous behaviors
    const friendship = gp.friendship || 50

    // High Friendship (70-100%): Spontaneous positive behaviors
    if (friendship >= 70) {
      // 5% chance to popcorn (excited jumps)
      if (Math.random() < 0.05 && !isOnCooldown('popcorn')) {
        goals.push({
          type: 'popcorn',
          target: null,
          priority: 50,
          estimatedDuration: 2000 // 2 seconds of popcorning
        })
      }

      // 3% chance for zoomies (excited running)
      if (Math.random() < 0.03 && !isOnCooldown('zoomies')) {
        goals.push({
          type: 'zoomies',
          target: null,
          priority: 45,
          estimatedDuration: 4000 // 4 seconds of zoomies
        })
      }

      // 8% chance to watch player lovingly
      if (Math.random() < 0.08 && !isOnCooldown('watch_player')) {
        goals.push({
          type: 'watch_player',
          target: null,
          priority: 35,
          estimatedDuration: 3000 // 3 seconds watching
        })
      }
    }

    // Medium Friendship (40-70%): Neutral curious behaviors
    else if (friendship >= 40) {
      // 5% chance to watch player
      if (Math.random() < 0.05 && !isOnCooldown('watch_player')) {
        goals.push({
          type: 'watch_player',
          target: null,
          priority: 30,
          estimatedDuration: 2000 // 2 seconds watching
        })
      }
    }

    // Low Friendship (0-40%): Avoidance behaviors
    else {
      // 10% chance to hide when friendship is low
      if (Math.random() < 0.10 && !isOnCooldown('hide')) {
        const shelter = findNearestItemForNeed('shelter')
        if (shelter) {
          goals.push({
            type: 'hide',
            target: shelter.position,
            targetItemId: shelter.itemId,
            priority: 55, // Higher priority when scared
            estimatedDuration: 5000 // 5 seconds hiding
          })
        }
      }
    }

    // LOW PRIORITY (Priority 10-30)

    // Wandering when content
    if (!isOnCooldown('wander')) {
      goals.push({
        type: 'wander',
        target: null, // Random destination
        priority: 25,
        estimatedDuration: 5000 // 5 seconds wandering
      })
    }

    // Sort by priority (highest first)
    goals.sort((a, b) => b.priority - a.priority)

    return goals[0] || null
  }

  /**
   * Execute a behavior goal
   */
  async function executeBehavior(goal: BehaviorGoal): Promise<boolean> {
    const gp = guineaPig.value
    if (!gp) return false

    behaviorState.value.currentGoal = goal

    switch (goal.type) {
      case 'eat':
        return await executeEatBehavior(goal)

      case 'eat_hay':
        return await executeEatHayBehavior(goal)

      case 'drink':
        return await executeDrinkBehavior(goal)

      case 'sleep':
        return await executeSleepBehavior(goal)

      case 'wander':
        return await executeWanderBehavior()

      case 'groom':
        return await executeGroomBehavior(goal)

      case 'chew':
        return await executeChewBehavior(goal)

      case 'seek_shelter':
        return await executeShelterBehavior(goal)

      case 'popcorn':
        return await executePopcornBehavior(goal)

      case 'zoomies':
        return await executeZoomiesBehavior(goal)

      case 'watch_player':
        return await executeWatchPlayerBehavior(goal)

      case 'hide':
        return await executeHideBehavior(goal)

      default:
        return false
    }
  }

  /**
   * Execute eat behavior with preference-based food selection
   */
  async function executeEatBehavior(goal: BehaviorGoal): Promise<boolean> {
    console.log('[executeEatBehavior] Starting eat behavior', { goal, guineaPigId })

    if (!goal.target) {
      console.error('[executeEatBehavior] No target specified in goal')
      return false
    }
    if (!guineaPig.value) {
      console.error('[executeEatBehavior] Guinea pig not found')
      return false
    }

    const currentPos = movement.currentPosition.value
    console.log('[executeEatBehavior] Guinea pig current position:', currentPos)
    console.log('[executeEatBehavior] Initiating movement to food bowl at', goal.target)

    // Navigate to food bowl
    let success = false
    try {
      success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
      console.log('[executeEatBehavior] moveTo returned:', success)
    } catch (error) {
      console.error('[executeEatBehavior] moveTo threw an error:', error)
      return false
    }

    if (!success) {
      console.warn('[executeEatBehavior] Movement to food bowl FAILED - pathfinding could not find route from', currentPos, 'to', goal.target)
      return false
    }

    console.log('[executeEatBehavior] Movement initiated successfully, waiting for arrival...')

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => {
        console.log('[executeEatBehavior] Arrived at food bowl!')
        resolve()
      })
    })

    // Select food from bowl based on preferences
    let hungerRestored = 30 // Base restoration
    let foodQuality = 1.0 // Quality multiplier

    console.log('[executeEatBehavior] Checking bowl contents for', goal.targetItemId)

    if (goal.targetItemId) {
      const bowlContents = habitatConditions.getBowlContents(goal.targetItemId)
      console.log('[executeEatBehavior] Bowl contents:', bowlContents)

      if (bowlContents && bowlContents.length > 0) {
        // Find preferred food if available
        const preferredFood = bowlContents.find(food =>
          guineaPig.value!.preferences.favoriteFood.some(fav =>
            food.itemId.toLowerCase().includes(fav.toLowerCase())
          )
        )

        // Find disliked food
        const dislikedFood = bowlContents.find(food =>
          guineaPig.value!.preferences.dislikedFood.some(dislike =>
            food.itemId.toLowerCase().includes(dislike.toLowerCase())
          )
        )

        const selectedFood = preferredFood || bowlContents[0]

        // Apply preference modifiers
        if (preferredFood) {
          foodQuality = 1.25 // +25% effectiveness for favorite foods
        } else if (dislikedFood && !preferredFood && bowlContents.length === 1) {
          foodQuality = 0.75 // -25% effectiveness for disliked foods
        }

        // Apply freshness modifier
        const freshness = selectedFood.freshness / 100
        foodQuality *= (0.5 + freshness * 0.5) // 50-100% based on freshness

        // Consume food from bowl (by index)
        const foodIndex = bowlContents.indexOf(selectedFood)
        if (foodIndex >= 0) {
          habitatConditions.removeFoodFromBowl(goal.targetItemId, foodIndex)
        }
      }
    }

    // Set eating state
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    console.log('[executeEatBehavior] Starting eating animation, duration:', goal.estimatedDuration)

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    console.log('[executeEatBehavior] Eating complete, restoring hunger')

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * foodQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      console.log('[executeEatBehavior] Restored', hungerRestored, 'hunger points')

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousEatMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('eat', 60000) // 1 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    console.log('[executeEatBehavior] Eat behavior completed successfully')

    return true
  }

  /**
   * Execute drink behavior
   */
  async function executeDrinkBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to water bottle
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set drinking state
    behaviorState.value.currentActivity = 'drinking'
    behaviorState.value.activityStartTime = Date.now()

    // Simulate drinking duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy thirst need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', 35) // Restore 35%

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousDrinkMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Consume water from habitat
    if (goal.targetItemId) {
      habitatConditions.consumeWater(goal.targetItemId)
    }

    // Set cooldown and return to idle
    setCooldown('drink', 45000) // 45 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute sleep behavior with enhanced bed selection and quality mechanics
   */
  async function executeSleepBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!guineaPig.value) return false

    // Navigate to bed/shelter if target specified
    if (goal.target) {
      const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
      if (!success) {
        // Fall back to sleeping in place if can't reach bed
        goal.targetItemId = undefined
      } else {
        // Wait for arrival
        await new Promise<void>(resolve => {
          movement.onArrival(() => resolve())
        })
      }
    }

    // Calculate sleep quality multiplier based on location
    let sleepQuality = 1.0 // Base quality (floor)

    if (goal.targetItemId) {
      // Sleeping in/near a bed or shelter - calculate bonuses
      const itemId = goal.targetItemId.toLowerCase()

      // Base bed effectiveness (1.25x - 1.5x depending on bed type)
      sleepQuality = 1.35

      // Preference bonus: +20% if this bed type is preferred
      const preferenceMatch = guineaPig.value.preferences.habitatPreference.some(pref =>
        itemId.includes(pref.toLowerCase())
      )
      if (preferenceMatch) {
        sleepQuality += 0.20
      }

      // Shelter synergy: +30% if bed is in/near shelter (enhances security)
      if (itemId.includes('shelter') || itemId.includes('tunnel') || itemId.includes('hideaway') || itemId.includes('igloo')) {
        sleepQuality += 0.30
      }
    }

    // Set sleeping state
    behaviorState.value.currentActivity = 'sleeping'
    behaviorState.value.activityStartTime = Date.now()

    // Calculate sleep duration based on energy level (lower energy = longer sleep)
    const energyLevel = guineaPig.value.needs.energy
    const baseDuration = 30000 // 30 seconds base
    const durationMultiplier = energyLevel < 20 ? 4 : energyLevel < 40 ? 2.5 : 1.5
    const sleepDuration = Math.min(baseDuration * durationMultiplier, 200000) // Max 200 seconds

    // Simulate sleeping duration
    await new Promise(resolve => setTimeout(resolve, sleepDuration))

    // Satisfy energy need with quality multiplier
    if (guineaPig.value) {
      const energyRestored = Math.floor(25 * sleepQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', energyRestored)

      // Log to activity feed with location
      const location = goal.targetItemId ? goal.targetItemId.replace(/_/g, ' ') : 'a cozy spot'
      const msg = MessageGenerator.generateAutonomousSleepMessage(guineaPig.value.name, location)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('sleep', 120000) // 2 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute wander behavior
   */
  async function executeWanderBehavior(): Promise<boolean> {
    // Random wander
    const success = movement.wander({ maxDistance: 5 })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds
      setTimeout(() => resolve(), 10000)
    })

    // Set cooldown
    setCooldown('wander', 10000) // 10 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute groom behavior
   */
  async function executeGroomBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Set grooming state
    behaviorState.value.currentActivity = 'grooming'
    behaviorState.value.activityStartTime = Date.now()

    // Simulate grooming duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy hygiene need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'hygiene', 20) // Restore 20%

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousGroomMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('groom', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute eat hay behavior (from hay rack)
   */
  async function executeEatHayBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target || !guineaPig.value) return false

    // Navigate to hay rack
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Calculate hay quality based on freshness
    let hungerRestored = 25 // Base hay restoration (slightly less than food bowl)
    let hayQuality = 1.0

    if (goal.targetItemId) {
      const hayServings = habitatConditions.getHayRackContents(goal.targetItemId)

      if (hayServings && hayServings.length > 0) {
        const freshness = habitatConditions.getHayRackFreshness(goal.targetItemId) / 100
        hayQuality = 0.6 + freshness * 0.4 // 60-100% based on freshness

        // Remove hay from rack
        habitatConditions.removeHayFromRack(goal.targetItemId, 1)
      }
    }

    // Set eating state
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * hayQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousEatHayMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('eat_hay', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute chew behavior (use chew items for dental health)
   */
  async function executeChewBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target || !guineaPig.value) return false

    // Navigate to chew item
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set chewing state (use eating for now, will add 'chewing' later)
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    // Simulate chewing duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy chew need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'chew', 30) // Restore 30%

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousChewMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('chew', 120000) // 2 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute proactive shelter behavior with comfort zone development
   */
  async function executeShelterBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to shelter
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Calculate shelter quality based on preferences
    let shelterEffectiveness = 1.0

    if (goal.targetItemId && guineaPig.value) {
      const itemId = goal.targetItemId.toLowerCase()

      // Preference bonus: +25% if shelter type is preferred
      const preferenceMatch = guineaPig.value.preferences.habitatPreference.some(pref =>
        itemId.includes(pref.toLowerCase())
      )
      if (preferenceMatch) {
        shelterEffectiveness += 0.25
      }

      // Boldness modifier: less bold guinea pigs get more comfort from shelters
      const boldness = guineaPig.value.personality.boldness
      if (boldness <= 4) {
        shelterEffectiveness += 0.20 // Shy guinea pigs love their hidey holes
      }
    }

    // Stay in shelter (duration based on need severity)
    const shelterNeed = guineaPig.value?.needs.shelter || 50
    const duration = shelterNeed < 30 ? goal.estimatedDuration * 1.5 : goal.estimatedDuration
    await new Promise(resolve => setTimeout(resolve, duration))

    // Satisfy shelter need with effectiveness multiplier
    if (guineaPig.value) {
      const shelterRestored = Math.floor(30 * shelterEffectiveness)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', shelterRestored)

      // Also restore comfort when in shelter
      guineaPigStore.adjustNeed(guineaPigId, 'comfort', 15)

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousShelterMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown and return to idle
    setCooldown('seek_shelter', 60000) // 1 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute popcorn behavior (excited jumping - high friendship)
   */
  async function executePopcornBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Set activity (for future animation support)
    behaviorState.value.currentActivity = 'idle' // Will be 'popcorning' when animations added

    // Simulate popcorning duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Popcorning slightly increases happiness
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'play', 5)

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousPopcornMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown
    setCooldown('popcorn', 30000) // 30 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute zoomies behavior (excited running - high friendship)
   */
  async function executeZoomiesBehavior(_goal: BehaviorGoal): Promise<boolean> {
    // Do 2-3 quick random movements
    const zoomCount = Math.floor(Math.random() * 2) + 2 // 2-3 zooms

    for (let i = 0; i < zoomCount; i++) {
      const success = movement.wander({ maxDistance: 3 })
      if (success) {
        await new Promise<void>(resolve => {
          movement.onArrival(() => resolve())
          setTimeout(() => resolve(), 2000) // Quick timeout
        })
      }
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause between zooms
    }

    // Zoomies increase happiness and satisfy play need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'play', 10)
      guineaPigStore.adjustNeed(guineaPigId, 'stimulation', 5)

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousZoomiesMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown
    setCooldown('zoomies', 45000) // 45 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute watch player behavior (curious/friendly watching)
   */
  async function executeWatchPlayerBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Guinea pig stops and watches (no movement)
    behaviorState.value.currentActivity = 'idle'

    // Simulate watching duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Watching slightly satisfies social need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'social', 5)

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousWatchMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown
    setCooldown('watch_player', 20000) // 20 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute hide behavior (avoidance - low friendship)
   */
  async function executeHideBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to shelter quickly (scared)
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Stay hidden
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Hiding satisfies shelter need but decreases social
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', 20)
      guineaPigStore.adjustNeed(guineaPigId, 'social', -10) // Being scared reduces social

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousHideMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Set cooldown
    setCooldown('hide', 40000) // 40 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Check and handle autonomous poop dropping (environmental interaction)
   * Guinea pigs poop naturally every 30 seconds (for testing/demo purposes)
   */
  function checkAutonomousPooping(): void {
    const gp = guineaPig.value
    if (!gp) return

    const timeSinceLastPoop = Date.now() - gp.lastPoopTime
    const poopInterval = 30000 // 30 seconds

    if (timeSinceLastPoop > poopInterval) {
      // Drop poop at current position
      const currentPos = movement.currentPosition.value

      // Convert grid coordinates to subgrid coordinates (4x scale)
      // The subgrid is 4x finer than the main grid for precise poop placement
      const subgridX = currentPos.col * 4 + Math.floor(Math.random() * 4) // Random offset within cell
      const subgridY = currentPos.row * 4 + Math.floor(Math.random() * 4)

      habitatConditions.addPoop(subgridX, subgridY)

      // Update last poop time
      gp.lastPoopTime = Date.now()

      // Log to activity feed
      const msg = MessageGenerator.generateAutonomousPoopMessage(gp.name, 'the floor')
      loggingStore.addEnvironmentalEvent(msg.message, msg.emoji)
    }
  }

  /**
   * Main AI decision tick - should be called every 3-5 seconds
   */
  async function tick(thresholds = DEFAULT_THRESHOLDS): Promise<void> {
    const gp = guineaPig.value
    if (!gp) return

    // Check for autonomous pooping (environmental behavior)
    checkAutonomousPooping()

    // Skip if already executing a behavior
    if (behaviorState.value.currentGoal) return

    // Skip if still on cooldown from last decision
    const timeSinceLastDecision = Date.now() - behaviorState.value.lastDecisionTime
    if (timeSinceLastDecision < 3000) return // Minimum 3 seconds between decisions

    behaviorState.value.lastDecisionTime = Date.now()

    // Select next behavior
    const goal = selectBehaviorGoal(thresholds)
    if (!goal) {
      // No goal selected - guinea pig is satisfied or all behaviors on cooldown
      return
    }

    // Execute behavior (non-blocking)
    executeBehavior(goal).catch(err => {
      console.error(`[Behavior] Error executing ${goal.type}:`, err)
      behaviorState.value.currentGoal = null
      behaviorState.value.currentActivity = 'idle'
    })
  }

  return {
    behaviorState,
    selectBehaviorGoal,
    executeBehavior,
    tick,
    isOnCooldown
  }
}
