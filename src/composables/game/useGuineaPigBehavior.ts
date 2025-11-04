/**
 * System 19: Autonomous AI Behaviors
 * Core AI decision-making and behavior selection for guinea pigs
 */

import { computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useBehaviorStateStore } from '../../stores/behaviorStateStore'
import { useHabitatContainers } from '../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useMovement } from './useMovement'
import { usePathfinding } from './usePathfinding'
import { MessageGenerator } from '../../utils/messageGenerator'
import { detectNearbyLocation, gridToSubgridWithOffset } from '../../utils/locationDetection'
import { pausableDelay } from '../../utils/pausableTimer'
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
  | 'play'
  | 'socialize'
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
  metadata?: any // For social behaviors and other contextual data
}

export interface BehaviorState {
  currentGoal: BehaviorGoal | null
  currentActivity: 'idle' | 'walking' | 'eating' | 'drinking' | 'sleeping' | 'grooming' | 'hiding' | 'playing' | 'chewing' | 'interacting'
  activityStartTime: number
  lastDecisionTime: number
  behaviorCooldowns: Map<BehaviorType, number>
}

// Debug flags - set to false in production
const DEBUG_SOCIALIZE = false
const DEBUG_BEHAVIOR = false // Set to true to enable eat/hay behavior logging

// Environmental behavior intervals
const POOP_INTERVAL_MS = 30000 // 30 seconds - guinea pigs poop frequently for realism

// Default behavior thresholds
const DEFAULT_THRESHOLDS = {
  hunger: 30,  // Seek food when hunger < 30%
  thirst: 25,  // Seek water when thirst < 25%
  energy: 40,  // Sleep when energy < 40%
  hygiene: 60, // Groom when hygiene < 60%
  shelter: 50, // Seek shelter when shelter < 50%
  chew: 40,    // Use chew items when chew < 40%
  play: 45,    // Use toys when play < 45%
  social: 50   // Socialize with companion when social < 50%
}

export function useGuineaPigBehavior(guineaPigId: string) {
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const behaviorStateStore = useBehaviorStateStore()
  const habitatContainers = useHabitatContainers()
  const suppliesStore = useSuppliesStore()
  const movement = useMovement(guineaPigId)
  const pathfinding = usePathfinding()

  // Initialize centralized behavior state for this guinea pig
  behaviorStateStore.initializeBehaviorState(guineaPigId)

  // Use centralized behavior state instead of local ref
  const behaviorState = computed({
    get: () => behaviorStateStore.getBehaviorState(guineaPigId)!,
    set: (value) => behaviorStateStore.updateBehaviorState(guineaPigId, value)
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
   * @param needType - The need to satisfy
   * @param preferAnchor - If true, prefer anchor position over adjacent (e.g., sleep on top of shelter)
   */
  function findNearestItemForNeed(needType: NeedType, preferAnchor: boolean = false): { position: GridPosition; itemId: string } | null {
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

      // Check if item matches need type by keyword OR subCategory
      let matchesNeed = keywords.some(keyword => itemId.toLowerCase().includes(keyword))

      // Special handling for play and chew needs - check subCategory
      if (!matchesNeed && (needType === 'play' || needType === 'chew')) {
        const item = suppliesStore.getItemById(itemId)
        if (needType === 'play' && item?.subCategory === 'toys') {
          matchesNeed = true
        } else if (needType === 'chew' && item?.subCategory === 'chews') {
          matchesNeed = true
        }
      }

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

    const targetPos = nearest.position
    const itemId = nearest.itemId.toLowerCase()

    // Determine if this is a shelter/bed/tunnel item
    const isShelterLikeItem =
      itemId.includes('shelter') ||
      itemId.includes('hideaway') ||
      itemId.includes('igloo') ||
      itemId.includes('house') ||
      itemId.includes('bed') ||
      itemId.includes('sleeping') ||
      itemId.includes('tunnel')

    // For shelters/beds: positioning depends on use case
    // - preferAnchor=true: Sleep ON TOP of shelter (anchor position)
    // - preferAnchor=false: Hide INSIDE shelter (adjacent position)
    if (isShelterLikeItem && !preferAnchor) {
      // Check adjacent cells (including diagonals for better accessibility)
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

      // No valid adjacent cells found - shelter is completely blocked
      return null
    }

    // For shelters/beds with preferAnchor=true OR other items (bowls, bottles, etc)
    // Try anchor first, then adjacent
    if (pathfinding.isValidPosition(targetPos)) {
      return { position: targetPos, itemId: nearest.itemId }
    }

    // If anchor blocked, check adjacent cells (fallback for non-accessible anchors)
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

    // No valid position found - item is completely inaccessible
    return null
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
      // Try food bowl first (only if it has food)
      if (!isOnCooldown('eat')) {
        const target = findNearestItemForNeed('hunger')
        if (target) {
          const bowlContents = habitatConditions.getBowlContents(target.itemId)
          // Only add eat goal if bowl has food
          if (bowlContents && bowlContents.length > 0) {
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
      }

      // Hay racks as secondary option (or primary if bowl is empty)
      if (!isOnCooldown('eat_hay')) {
        const hayRacks = habitatConditions.habitatItems.filter(id =>
          id.toLowerCase().includes('hay') && id.toLowerCase().includes('rack')
        )

        if (hayRacks.length > 0) {
          const hayRackId = hayRacks[0]
          const hayRackContents = habitatConditions.getHayRackContents(hayRackId)
          // Only add eat_hay goal if hay rack has hay
          if (hayRackContents && hayRackContents.length > 0) {
            const position = habitatConditions.itemPositions.get(hayRackId)
            if (position) {
              goals.push({
                type: 'eat_hay',
                target: { row: position.y, col: position.x },
                targetItemId: hayRackId,
                priority: calculateNeedPriority(needs.hunger, thresholds.hunger, 98), // High priority (same as bowl when bowl is empty)
                estimatedDuration: 6000, // 6 seconds to eat hay
                needSatisfied: 'hunger'
              })
            }
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
      // preferAnchor=true: guinea pig sleeps ON TOP of shelter/bed
      const bed = findNearestItemForNeed('energy', true)
      const shelter = findNearestItemForNeed('shelter', true)

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
      // preferAnchor=true: guinea pig goes ON TOP of shelter (same as sleep)
      const target = findNearestItemForNeed('shelter', true)
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

    // Play < threshold (use toys)
    if (needs.play < thresholds.play && !isOnCooldown('play')) {
      const toy = findNearestItemForNeed('play')
      if (toy) {
        goals.push({
          type: 'play',
          target: toy.position,
          targetItemId: toy.itemId,
          priority: calculateNeedPriority(needs.play, thresholds.play, 50),
          estimatedDuration: 6000, // 6 seconds playing
          needSatisfied: 'play'
        })
      }
    }

    // System 21: Social < threshold (social behaviors with companion)
    if (needs.social < thresholds.social && !isOnCooldown('socialize')) {
      const guineaPigStore = useGuineaPigStore()
      const bonds = guineaPigStore.getAllBonds()

      if (bonds.length > 0) {
        // Get a partner to socialize with (prioritize by bonding level)
        const sortedBonds = bonds.sort((a, b) => b.bondingLevel - a.bondingLevel)
        const topBond = sortedBonds[0]
        const partnerId = topBond.guineaPig1Id === gp.id ? topBond.guineaPig2Id : topBond.guineaPig1Id

        goals.push({
          type: 'socialize',
          target: null, // Will be determined by social behavior type
          priority: calculateNeedPriority(needs.social, thresholds.social, 55),
          estimatedDuration: 8000, // 8 seconds for social interaction
          needSatisfied: 'social',
          metadata: { partnerId, bondId: topBond.id }
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
        // preferAnchor=true: guinea pig goes ON TOP of shelter (same as sleep/seek_shelter)
        const shelter = findNearestItemForNeed('shelter', true)
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

    // Add natural variation: if top goals are within 15 priority points, pick randomly
    // This prevents identical guinea pigs from always making identical choices
    // Wider threshold (15 instead of 5) allows more behavioral variety
    if (goals.length > 0) {
      const topPriority = goals[0].priority
      const topGoals = goals.filter(g => g.priority >= topPriority - 15)

      if (topGoals.length > 1) {
        // Multiple similar-priority goals - pick randomly for natural variation
        return topGoals[Math.floor(Math.random() * topGoals.length)]
      }

      return goals[0]
    }

    return null
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

      case 'play':
        return await executePlayBehavior(goal)

      case 'socialize':
        return await executeSocializeBehavior(goal)

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
    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Starting eat behavior', { goal, guineaPigId })

    if (!goal.target) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] No target specified in goal')
      return false
    }
    if (!guineaPig.value) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] Guinea pig not found')
      return false
    }

    const currentPos = movement.currentPosition.value
    if (DEBUG_BEHAVIOR) {
      console.log('[executeEatBehavior] Guinea pig current position:', currentPos)
      console.log('[executeEatBehavior] Initiating movement to food bowl at', goal.target)
    }

    // Navigate to food bowl
    let success = false
    try {
      success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] moveTo returned:', success)
    } catch (error) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] moveTo threw an error:', error)
      return false
    }

    if (!success) {
      if (DEBUG_BEHAVIOR) console.warn('[executeEatBehavior] Movement to food bowl FAILED - pathfinding could not find route from', currentPos, 'to', goal.target)
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Movement initiated successfully, waiting for arrival...')

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => {
        if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Arrived at food bowl!')
        resolve()
      })
    })

    // Select food from bowl based on preferences
    let hungerRestored = 40 // Base restoration (enough to get above 30% threshold)
    let foodQuality = 1.0 // Quality multiplier
    let eatenFoodName: string | undefined = undefined

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Checking bowl contents for', goal.targetItemId)

    if (goal.targetItemId) {
      const bowlContents = habitatConditions.getBowlContents(goal.targetItemId)
      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Bowl contents:', bowlContents)

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
        eatenFoodName = selectedFood.name

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

    // Log to activity feed BEFORE eating starts (so message appears during activity)
    const msg = MessageGenerator.generateAutonomousEatMessage(guineaPig.value.name, eatenFoodName)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Starting eating animation, duration:', goal.estimatedDuration)

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Eating complete, restoring hunger')

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * foodQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Restored', hungerRestored, 'hunger points')
    }

    // Set cooldown and return to idle
    setCooldown('eat', 60000) // 1 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Eat behavior completed successfully')

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

    // Log to activity feed BEFORE drinking starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousDrinkMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate drinking duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy thirst need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', 35) // Restore 35%
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
        // Wait for arrival with timeout
        await new Promise<void>(resolve => {
          movement.onArrival(() => resolve())
          // Timeout after 10 seconds to prevent infinite waiting
          setTimeout(() => resolve(), 10000)
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

    // Log to activity feed BEFORE sleeping starts (with location)
    let location = 'a cozy spot'
    if (goal.targetItemId) {
      // Convert ID to readable name (e.g., "habitat_banana_bed" -> "banana bed")
      location = goal.targetItemId
        .replace(/_/g, ' ')
        .replace(/^habitat\s+/, '') // Remove "habitat " prefix
    }
    const msg = MessageGenerator.generateAutonomousSleepMessage(guineaPig.value.name, location)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Calculate sleep duration based on energy level (lower energy = longer sleep)
    const energyLevel = guineaPig.value.needs.energy
    const baseDuration = 5000 // 5 seconds base (reduced for better UX)
    const durationMultiplier = energyLevel < 20 ? 2 : energyLevel < 40 ? 1.5 : 1.2
    const sleepDuration = Math.min(baseDuration * durationMultiplier, 15000) // Max 15 seconds

    // Sleep in interruptible chunks (check for cancellation frequently)
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation

    while (Date.now() - startTime < sleepDuration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'sleep') {
        console.log('[Sleep] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Sleep for check interval or remaining time, whichever is shorter
      const remainingTime = sleepDuration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Satisfy energy need with quality multiplier
    if (guineaPig.value) {
      const energyRestored = Math.floor(25 * sleepQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', energyRestored)
    }

    // System 24: Check for sleeping together bonding bonus
    if (guineaPig.value) {
      const myPosition = habitatConditions.getGuineaPigPosition(guineaPigId)
      if (myPosition) {
        // Find other guinea pigs at the same position
        const otherGuineaPigs = guineaPigStore.activeGuineaPigs.filter(gp => {
          if (gp.id === guineaPigId) return false
          const theirPosition = habitatConditions.getGuineaPigPosition(gp.id)
          return theirPosition && theirPosition.x === myPosition.x && theirPosition.y === myPosition.y
        })

        // For each companion at same position, increase bonding
        otherGuineaPigs.forEach(companion => {
          // Check if the companion is also sleeping
          const companionBehaviorState = behaviorStateStore.getBehaviorState(companion.id)
          if (companionBehaviorState?.currentActivity === 'sleeping') {
            // Find bond between these two guinea pigs
            const allBonds = guineaPigStore.getAllBonds()
            const bond = allBonds.find(b =>
              (b.guineaPig1Id === guineaPigId && b.guineaPig2Id === companion.id) ||
              (b.guineaPig1Id === companion.id && b.guineaPig2Id === guineaPigId)
            )

            if (bond) {
              // Increase bonding for sleeping together
              const bondingIncrease = 2 // Small but meaningful increase
              guineaPigStore.increaseBonding(
                bond.id,
                bondingIncrease,
                'interaction',
                `${guineaPig.value!.name} and ${companion.name} cuddled together while sleeping`
              )

              // Log to activity feed
              const cuddleMsg = `${guineaPig.value!.name} and ${companion.name} cuddle together in the ${location} 💕`
              loggingStore.addAutonomousBehavior(cuddleMsg, '💤')
            }
          }
        })
      }
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
    if (!guineaPig.value) return false

    // Set grooming state
    behaviorState.value.currentActivity = 'grooming'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE grooming starts
    const msg = MessageGenerator.generateAutonomousGroomMessage(guineaPig.value.name)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Personality affects grooming thoroughness and duration
    const cleanliness = guineaPig.value.personality.cleanliness

    // Cleanliness 1-10 affects:
    // - Higher cleanliness = more thorough grooming = more hygiene restored
    // - Higher cleanliness = longer grooming sessions
    const cleanlinessMultiplier = 0.5 + (cleanliness / 20) // Range: 0.55 to 1.0
    const durationMultiplier = 0.7 + (cleanliness / 20) // Range: 0.75 to 1.2

    // Adjust grooming duration based on personality
    const adjustedDuration = Math.floor(goal.estimatedDuration * durationMultiplier)

    // Simulate grooming duration
    await new Promise(resolve => setTimeout(resolve, adjustedDuration))

    // Calculate hygiene restoration based on cleanliness personality
    // Base restoration: 15%, personality range: 10.5% to 20%
    const hygieneRestored = Math.floor(15 * cleanlinessMultiplier)

    // Satisfy hygiene need with personality modifier
    guineaPigStore.adjustNeed(guineaPigId, 'hygiene', hygieneRestored)

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
    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Starting eat hay behavior', { goal, guineaPigId })

    if (!goal.target || !guineaPig.value) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatHayBehavior] Missing target or guinea pig')
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Initiating movement to hay rack at', goal.target)

    // Navigate to hay rack
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) {
      if (DEBUG_BEHAVIOR) console.warn('[executeEatHayBehavior] Movement to hay rack FAILED')
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Movement initiated, waiting for arrival...')

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => {
        if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Arrived at hay rack!')
        resolve()
      })
    })

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Checking hay rack contents')

    // Calculate hay quality based on freshness
    let hungerRestored = 35 // Base hay restoration (enough to get above 30% threshold, slightly less than food bowl)
    let hayQuality = 1.0

    if (goal.targetItemId) {
      const hayServings = habitatConditions.getHayRackContents(goal.targetItemId)
      if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Hay servings:', hayServings)

      if (hayServings && hayServings.length > 0) {
        const freshness = habitatConditions.getHayRackFreshness(goal.targetItemId) / 100
        hayQuality = 0.6 + freshness * 0.4 // 60-100% based on freshness

        if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Removing hay serving, freshness:', freshness)

        // Remove first hay serving from rack (index 0)
        habitatConditions.removeHayFromRack(goal.targetItemId, 0)
      } else {
        if (DEBUG_BEHAVIOR) console.warn('[executeEatHayBehavior] Hay rack is empty!')
      }
    }

    // Set eating state
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE eating starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousEatHayMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Starting eating animation, duration:', goal.estimatedDuration)

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Eating complete, restoring hunger')

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * hayQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Restored', hungerRestored, 'hunger points')
    }

    // Set cooldown and return to idle
    setCooldown('eat_hay', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Eat hay behavior completed successfully')

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

    // Set chewing state with chomp animation
    behaviorState.value.currentActivity = 'chewing'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE chewing starts (with chew item name)
    if (guineaPig.value) {
      let chewItemName: string | undefined
      if (goal.targetItemId) {
        chewItemName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
      }
      const msg = MessageGenerator.generateAutonomousChewMessage(guineaPig.value.name, chewItemName)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate chewing duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Use chew item durability system if chew item target is specified
    if (goal.targetItemId) {
      // Degrade the chew item durability
      habitatContainers.chewItem(goal.targetItemId)
    }

    // Satisfy chew need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'chew', 30) // Restore 30%
    }

    // Set cooldown and return to idle
    setCooldown('chew', 120000) // 2 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute play behavior (use toys for entertainment)
   */
  async function executePlayBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target || !guineaPig.value) return false

    // Navigate to toy
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set playing state
    behaviorState.value.currentActivity = 'playing'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE playing starts (with toy name)
    let toyName: string | undefined
    if (goal.targetItemId) {
      toyName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
    }
    const msg = MessageGenerator.generateAutonomousPlayMessage(guineaPig.value.name, toyName)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Personality affects play intensity and duration
    const playfulness = guineaPig.value.personality.playfulness

    // Playfulness 1-10 affects:
    // - Higher playfulness = more enthusiastic play = more play need satisfied
    // - Higher playfulness = longer play sessions
    const playfulnessMultiplier = 0.6 + (playfulness / 20) // Range: 0.65 to 1.1
    const durationMultiplier = 0.8 + (playfulness / 25) // Range: 0.84 to 1.2

    // Adjust play duration based on personality
    const adjustedDuration = Math.floor(goal.estimatedDuration * durationMultiplier)

    // Simulate playing duration (pause-aware)
    await pausableDelay(adjustedDuration)

    // Calculate play restoration based on playfulness personality
    // Base restoration: 35%, personality range: 22.75% to 38.5%
    const playRestored = Math.floor(35 * playfulnessMultiplier)

    // Satisfy play need with personality modifier
    guineaPigStore.adjustNeed(guineaPigId, 'play', playRestored)

    // Set cooldown and return to idle
    setCooldown('play', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * System 21: Execute social behavior with companion
   * Both guinea pigs move toward each other and interact with wiggle animation
   */
  async function executeSocializeBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Constants for socialize behavior timing and rewards
    const SOCIALIZE_MOVE_ANIMATION_MS = 800
    const SOCIALIZE_INTERACTION_DURATION_MS = 3000
    const SOCIALIZE_SOCIAL_NEED_REWARD = 25
    const SOCIALIZE_BONDING_INCREASE = 3
    const SOCIALIZE_COOLDOWN_MS = 120000 // 2 minutes

    if (!guineaPig.value || !goal.metadata) return false

    const { partnerId, bondId } = goal.metadata
    const partner = guineaPigStore.getGuineaPig(partnerId)
    const bond = guineaPigStore.getBondById(bondId)

    if (!partner || !bond) {
      if (DEBUG_SOCIALIZE) {
        console.warn('[Socialize] Partner or bond not found', { partnerId, bondId, partner, bond })
      }
      return false
    }

    if (DEBUG_SOCIALIZE) {
      console.log(`[Socialize] ${guineaPig.value.name} socializing with ${partner.name}`)
    }

    // Get current positions
    const myPos = habitatConditions.getGuineaPigPosition(guineaPig.value.id)
    const partnerPos = habitatConditions.getGuineaPigPosition(partnerId)

    if (!myPos || !partnerPos) {
      if (DEBUG_SOCIALIZE) {
        console.warn('[Socialize] Could not get positions')
      }
      return false
    }

    // Calculate distance between guinea pigs
    const distance = Math.abs(myPos.x - partnerPos.x) + Math.abs(myPos.y - partnerPos.y)

    // Move guinea pigs to be adjacent (distance = 1) if they're not already
    if (distance > 1) {
      if (DEBUG_SOCIALIZE) {
        console.log(`[Socialize] Moving guinea pigs to adjacent cells (current distance: ${distance})`)
      }

      // Calculate the midpoint to determine where they should meet
      const midX = (myPos.x + partnerPos.x) / 2
      const midY = (myPos.y + partnerPos.y) / 2

      // Determine target positions for both guinea pigs to be adjacent
      let myTargetX = myPos.x
      let myTargetY = myPos.y
      let partnerTargetX = partnerPos.x
      let partnerTargetY = partnerPos.y

      // Move horizontally or vertically to become adjacent
      const dx = partnerPos.x - myPos.x
      const dy = partnerPos.y - myPos.y

      if (Math.abs(dx) >= Math.abs(dy)) {
        // Move horizontally
        myTargetX = Math.floor(midX)
        partnerTargetX = Math.ceil(midX)
        myTargetY = Math.round(midY)
        partnerTargetY = Math.round(midY)
      } else {
        // Move vertically
        myTargetX = Math.round(midX)
        partnerTargetX = Math.round(midX)
        myTargetY = Math.floor(midY)
        partnerTargetY = Math.ceil(midY)
      }

      // Ensure positions are valid and adjacent
      if (Math.abs(myTargetX - partnerTargetX) + Math.abs(myTargetY - partnerTargetY) !== 1) {
        // Fallback: Move them adjacent horizontally OR vertically only (avoid diagonal)
        if (Math.abs(dx) > Math.abs(dy)) {
          // Move horizontally to be adjacent
          myTargetX = myPos.x + Math.sign(dx)
          myTargetY = myPos.y
          partnerTargetX = myTargetX + Math.sign(dx)
          partnerTargetY = myPos.y
        } else {
          // Move vertically to be adjacent
          myTargetX = myPos.x
          myTargetY = myPos.y + Math.sign(dy)
          partnerTargetX = myPos.x
          partnerTargetY = myTargetY + Math.sign(dy)
        }
      }

      if (DEBUG_SOCIALIZE) {
        console.log(`[Socialize] Targets: ${guineaPig.value.name} -> (${myTargetX}, ${myTargetY}), ${partner.name} -> (${partnerTargetX}, ${partnerTargetY})`)
      }

      // Validate positions before attempting movement
      const myTargetValid = pathfinding.isValidPosition({ row: myTargetY, col: myTargetX }, { avoidOccupiedCells: false })
      const partnerTargetValid = pathfinding.isValidPosition({ row: partnerTargetY, col: partnerTargetX }, { avoidOccupiedCells: false })

      if (!myTargetValid || !partnerTargetValid) {
        if (DEBUG_SOCIALIZE) {
          console.warn('[Socialize] Calculated positions are invalid or out of bounds')
        }
        behaviorState.value.currentGoal = null
        return false
      }

      // Move this guinea pig to target
      const moveSuccess = movement.moveTo({ row: myTargetY, col: myTargetX }, { avoidOccupiedCells: false })
      if (!moveSuccess) {
        if (DEBUG_SOCIALIZE) {
          console.warn('[Socialize] Failed to initiate movement for initiator')
        }
        behaviorState.value.currentGoal = null
        return false
      }

      // Move partner guinea pig to target with proper animation flags
      const currentPartnerPos = habitatConditions.getGuineaPigPosition(partnerId)
      if (currentPartnerPos) {
        habitatConditions.guineaPigPositions.set(partnerId, {
          ...currentPartnerPos,
          targetPosition: { x: partnerTargetX, y: partnerTargetY },
          isMoving: true,
          lastMoved: Date.now()
        })

        // Simulate movement completion for partner after animation time
        setTimeout(() => {
          const partnerPosAfterMove = habitatConditions.getGuineaPigPosition(partnerId)
          if (partnerPosAfterMove && partnerPosAfterMove.isMoving) {
            habitatConditions.guineaPigPositions.set(partnerId, {
              x: partnerTargetX,
              y: partnerTargetY,
              lastMoved: Date.now(),
              isMoving: false
            })
          }
        }, SOCIALIZE_MOVE_ANIMATION_MS)
      }

      // Wait for movement animation to complete
      await new Promise(resolve => setTimeout(resolve, SOCIALIZE_MOVE_ANIMATION_MS))
    }

    // Set both guinea pigs to playing state
    behaviorState.value.currentActivity = 'playing'
    behaviorState.value.activityStartTime = Date.now()

    // Set partner to playing state as well - verify partner still exists
    const partnerStillExists = guineaPigStore.getGuineaPig(partnerId)
    const partnerBehaviorState = behaviorStateStore.getBehaviorState(partnerId)
    if (partnerStillExists && partnerBehaviorState) {
      partnerBehaviorState.currentActivity = 'playing'
      partnerBehaviorState.activityStartTime = Date.now()
    }

    // Log to activity feed BEFORE interaction starts (so message appears during activity)
    if (partnerStillExists) {
      loggingStore.addAutonomousBehavior(`${guineaPig.value.name} and ${partnerStillExists.name} are bonding together 🤝`, '🐹')
    }

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    if (DEBUG_SOCIALIZE) {
      console.log(`[Socialize] Both guinea pigs playing together for ${SOCIALIZE_INTERACTION_DURATION_MS}ms`)
    }

    // Wait for interaction duration (wiggle animation happens via CSS, pause-aware)
    await pausableDelay(SOCIALIZE_INTERACTION_DURATION_MS)

    // Verify both guinea pigs still exist before finalizing
    if (!guineaPig.value) {
      if (DEBUG_SOCIALIZE) {
        console.warn('[Socialize] Initiator guinea pig was removed during interaction')
      }
      return false
    }

    const partnerAfterInteraction = guineaPigStore.getGuineaPig(partnerId)
    if (!partnerAfterInteraction) {
      if (DEBUG_SOCIALIZE) {
        console.warn('[Socialize] Partner guinea pig was removed during interaction')
      }
      behaviorState.value.currentActivity = 'idle'
      behaviorState.value.currentGoal = null
      return false
    }

    // Satisfy social needs for both guinea pigs
    guineaPigStore.satisfyNeed(guineaPig.value.id, 'social', SOCIALIZE_SOCIAL_NEED_REWARD)
    guineaPigStore.satisfyNeed(partnerId, 'social', SOCIALIZE_SOCIAL_NEED_REWARD)

    // Increase bonding
    guineaPigStore.increaseBonding(bondId, SOCIALIZE_BONDING_INCREASE, 'interaction', `${guineaPig.value.name} and ${partnerAfterInteraction.name} socialized together`)

    // Set cooldown
    setCooldown('socialize', SOCIALIZE_COOLDOWN_MS)

    // Reset both guinea pigs to idle
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    const finalPartnerBehaviorState = behaviorStateStore.getBehaviorState(partnerId)
    if (finalPartnerBehaviorState) {
      finalPartnerBehaviorState.currentActivity = 'idle'
    }

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

    // Wait for arrival with timeout
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds to prevent infinite waiting
      setTimeout(() => resolve(), 10000)
    })

    // Set sheltering/hiding state
    behaviorState.value.currentActivity = 'hiding'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE sheltering starts (with shelter name)
    if (guineaPig.value) {
      let shelterName: string | undefined
      if (goal.targetItemId) {
        shelterName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
      }
      const msg = MessageGenerator.generateAutonomousShelterMessage(guineaPig.value.name, shelterName)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

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

    // Shelter in interruptible chunks (check for cancellation frequently)
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation

    while (Date.now() - startTime < duration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'seek_shelter') {
        console.log('[Shelter] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Wait for check interval or remaining time, whichever is shorter
      const remainingTime = duration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Satisfy shelter need with effectiveness multiplier
    if (guineaPig.value) {
      const shelterRestored = Math.floor(30 * shelterEffectiveness)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', shelterRestored)

      // Also restore comfort when in shelter
      guineaPigStore.adjustNeed(guineaPigId, 'comfort', 15)
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

    // Log to activity feed BEFORE popcorning starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousPopcornMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate popcorning duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Popcorning slightly increases happiness
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'play', 5)
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
    // Log to activity feed BEFORE zoomies starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousZoomiesMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

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

    // Log to activity feed BEFORE watching starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousWatchMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate watching duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Watching slightly satisfies social need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'social', 5)
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

    // Wait for arrival with timeout
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds to prevent infinite waiting
      setTimeout(() => resolve(), 10000)
    })

    // Set hiding state
    behaviorState.value.currentActivity = 'hiding'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE hiding starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousHideMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Stay hidden in interruptible chunks
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation
    const duration = goal.estimatedDuration

    while (Date.now() - startTime < duration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'hide') {
        console.log('[Hide] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Wait for check interval or remaining time, whichever is shorter
      const remainingTime = duration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Hiding satisfies shelter need but decreases social
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', 20)
      guineaPigStore.adjustNeed(guineaPigId, 'social', -10) // Being scared reduces social
    }

    // Set cooldown and return to idle
    setCooldown('hide', 40000) // 40 second cooldown
    behaviorState.value.currentActivity = 'idle'
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

    if (timeSinceLastPoop > POOP_INTERVAL_MS) {
      // Drop poop at current position
      const currentPos = movement.currentPosition.value

      // Convert grid coordinates to subgrid coordinates with random offset
      const subgridPos = gridToSubgridWithOffset(currentPos)
      habitatConditions.addPoop(subgridPos.x, subgridPos.y)

      // Update last poop time with random offset backwards (-0 to -10 seconds)
      // This makes each guinea pig's next poop happen 20-30 seconds from now
      // Prevents all guinea pigs from pooping at the same time
      const randomOffset = -Math.random() * 10000 // -0s to -10s
      gp.lastPoopTime = Date.now() + randomOffset

      // Detect nearby items for location context
      const suppliesStore = useSuppliesStore()
      const nearbyLocation = detectNearbyLocation(currentPos, habitatConditions, suppliesStore)

      // Log to activity feed with location context
      const msg = MessageGenerator.generateAutonomousPoopMessage(gp.name, nearbyLocation)
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
    // Add random jitter (0-2 seconds) to prevent synchronized decision-making
    const randomJitter = Math.random() * 2000
    const timeSinceLastDecision = Date.now() - behaviorState.value.lastDecisionTime
    if (timeSinceLastDecision < (3000 + randomJitter)) return

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
    isOnCooldown,
    stopMovement: movement.stopMovement,
    resumeMovement: movement.resumeMovement
  }
}
