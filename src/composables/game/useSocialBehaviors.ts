/**
 * Social Behaviors Composable
 * System 21: Social Bonding System
 *
 * Implements 6 core social interactions between guinea pigs:
 * 1. Approach Companion - Move closer for social interaction
 * 2. Groom Partner - Clean other guinea pig (cleanliness + social)
 * 3. Play Together - Shared play (play + social)
 * 4. Share Food - Eat together (hunger + social)
 * 5. Sleep Together - Rest in proximity (energy + social)
 * 6. Explore Together - Move around as pair (social)
 */

import { useGuineaPigStore, type GuineaPig, type ActiveBond } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { usePathfinding } from './usePathfinding'

export function useSocialBehaviors() {
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const { findPath } = usePathfinding()

  /**
   * Check if two guinea pigs are near each other (within specified distance)
   */
  function areGuineaPigsNear(gp1Id: string, gp2Id: string, maxDistance: number = 2): boolean {
    const pos1 = habitatConditions.getGuineaPigPosition(gp1Id)
    const pos2 = habitatConditions.getGuineaPigPosition(gp2Id)

    if (!pos1 || !pos2) return false

    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    )

    return distance <= maxDistance
  }

  /**
   * Get midpoint between two positions
   */
  function getMidpoint(pos1: { x: number; y: number }, pos2: { x: number; y: number }): { x: number; y: number } {
    return {
      x: Math.floor((pos1.x + pos2.x) / 2),
      y: Math.floor((pos1.y + pos2.y) / 2)
    }
  }

  /**
   * Delay helper for behavior timing
   */
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Move guinea pig to target position using pathfinding
   * Returns true if successful
   */
  async function moveToPosition(guineaPigId: string, target: { x: number; y: number }): Promise<boolean> {
    const currentPos = habitatConditions.getGuineaPigPosition(guineaPigId)
    if (!currentPos) return false

    // Convert positions to GridPosition format (row/col instead of x/y)
    const start = { row: currentPos.y, col: currentPos.x }
    const goal = { row: target.y, col: target.x }

    // Find path to target
    const result = findPath({ start, goal })
    if (!result.success || result.path.length === 0) return false

    // Move to target position immediately (simplified for now)
    // TODO: Implement animated movement when System 18 movement is integrated
    habitatConditions.guineaPigPositions.set(guineaPigId, {
      x: target.x,
      y: target.y,
      lastMoved: Date.now(),
      isMoving: false
    })
    habitatConditions.recordGuineaPigActivity('movement')

    return true
  }

  /**
   * 1. Approach Companion
   * Guinea pig moves closer to their partner
   */
  async function approachCompanion(
    initiator: GuineaPig,
    partner: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    const initiatorPos = habitatConditions.getGuineaPigPosition(initiator.id)
    const partnerPos = habitatConditions.getGuineaPigPosition(partner.id)

    if (!initiatorPos || !partnerPos) return false

    // Already near? No need to approach
    if (areGuineaPigsNear(initiator.id, partner.id, 1.5)) {
      return true
    }

    // Move toward partner (adjacent cell)
    const targetPos = {
      x: partnerPos.x + (Math.random() > 0.5 ? 1 : -1),
      y: partnerPos.y + (Math.random() > 0.5 ? 1 : -1)
    }

    const success = await moveToPosition(initiator.id, targetPos)
    if (!success) return false

    // Small bonding increase for approaching
    guineaPigStore.increaseBonding(bond.id, 1, 'proximity', `${initiator.name} approaches ${partner.name}`)

    return true
  }

  /**
   * 2. Groom Partner
   * One guinea pig grooms the other, cleaning and bonding
   */
  async function groomPartner(
    groomer: GuineaPig,
    partner: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Approach if not near
    if (!areGuineaPigsNear(groomer.id, partner.id, 1.5)) {
      await approachCompanion(groomer, partner, bond)
    }

    // Record activity for both (grooming counts as movement for now)
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for grooming duration
    await delay(4000)

    // Satisfy needs
    guineaPigStore.satisfyNeed(groomer.id, 'social', 20)
    guineaPigStore.satisfyNeed(partner.id, 'social', 20)
    guineaPigStore.satisfyNeed(partner.id, 'hygiene', 15) // Partner gets cleaner

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      5,
      'interaction',
      `${groomer.name} gently grooms ${partner.name}`
    )

    // Activity feed message
    loggingStore.addPlayerAction(
      `${groomer.name} gently grooms ${partner.name} who seems very content 💕`,
      '🐹'
    )

    return true
  }

  /**
   * 3. Play Together
   * Both guinea pigs play together happily
   */
  async function playTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
    const pos2 = habitatConditions.getGuineaPigPosition(gp2.id)

    if (!pos1 || !pos2) return false

    // Find meeting point
    const meetingPoint = getMidpoint(pos1, pos2)

    // Both move to meeting point (in parallel)
    await Promise.all([
      moveToPosition(gp1.id, meetingPoint),
      moveToPosition(gp2.id, { x: meetingPoint.x + 1, y: meetingPoint.y })
    ])

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for play duration
    await delay(5000)

    // Satisfy needs - use 'play' instead of 'happiness'
    guineaPigStore.satisfyNeed(gp1.id, 'play', 25)
    guineaPigStore.satisfyNeed(gp2.id, 'play', 25)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 20)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 20)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      4,
      'interaction',
      `${gp1.name} and ${gp2.name} play together`
    )

    // Activity feed message
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} play together happily! ✨`,
      '🎮'
    )

    return true
  }

  /**
   * 4. Share Food
   * Guinea pigs eat together side by side
   */
  async function shareFood(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond,
    foodItemId?: string
  ): Promise<boolean> {
    // Find food bowl or hay rack position
    let foodPos: { x: number; y: number } | null = null

    if (foodItemId) {
      // Use specific food item
      foodPos = habitatConditions.itemPositions.get(foodItemId) || null
    } else {
      // Find nearest food source (bowl or hay rack)
      const foodItems = habitatConditions.habitatItems.filter(id =>
        id.includes('bowl') || id.includes('hay_rack')
      )
      if (foodItems.length > 0) {
        foodPos = habitatConditions.itemPositions.get(foodItems[0]) || null
      }
    }

    if (!foodPos) {
      // No food available
      return false
    }

    // Both move to food (in parallel)
    await Promise.all([
      moveToPosition(gp1.id, { x: foodPos.x, y: foodPos.y }),
      moveToPosition(gp2.id, { x: foodPos.x + 1, y: foodPos.y })
    ])

    // Record eating activity
    habitatConditions.recordGuineaPigActivity('eating')

    // Wait for eating duration
    await delay(4500)

    // Satisfy needs (less hunger satisfaction than solo eating, but social bonus)
    guineaPigStore.satisfyNeed(gp1.id, 'hunger', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'hunger', 15)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 15)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      3,
      'shared_experience',
      `${gp1.name} and ${gp2.name} share a meal`
    )

    // Activity feed message
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} munch happily side by side 🥬`,
      '🍽️'
    )

    return true
  }

  /**
   * 5. Sleep Together
   * Guinea pigs rest together in proximity
   */
  async function sleepTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Find shelter or comfortable spot
    const shelters = habitatConditions.habitatItems.filter(id =>
      id.includes('hideaway') || id.includes('tunnel') || id.includes('house')
    )

    let sleepPos: { x: number; y: number }

    if (shelters.length > 0) {
      // Use shelter
      const shelterPos = habitatConditions.itemPositions.get(shelters[0])
      if (shelterPos) {
        sleepPos = shelterPos
      } else {
        // Default to current position of gp1
        const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
        if (!pos1) return false
        sleepPos = pos1
      }
    } else {
      // No shelter, sleep in open area
      const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
      if (!pos1) return false
      sleepPos = pos1
    }

    // Both move to sleep position (in parallel)
    await Promise.all([
      moveToPosition(gp1.id, sleepPos),
      moveToPosition(gp2.id, { x: sleepPos.x + 1, y: sleepPos.y })
    ])

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for sleep duration
    await delay(6000)

    // Satisfy needs
    guineaPigStore.satisfyNeed(gp1.id, 'energy', 30)
    guineaPigStore.satisfyNeed(gp2.id, 'energy', 30)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp1.id, 'comfort', 20)
    guineaPigStore.satisfyNeed(gp2.id, 'comfort', 20)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      4,
      'shared_experience',
      `${gp1.name} and ${gp2.name} sleep together`
    )

    // Activity feed message
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} sleep peacefully together 😴`,
      '💤'
    )

    return true
  }

  /**
   * 6. Explore Together
   * Guinea pigs move around the habitat together
   */
  async function exploreTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Pick random destination in habitat (using medium habitat size as default)
    // TODO: Get actual habitat size from settings when available
    const gridWidth = 14
    const gridHeight = 10

    const targetX = Math.floor(Math.random() * gridWidth)
    const targetY = Math.floor(Math.random() * gridHeight)

    // Both move to destination (in parallel, side by side)
    await Promise.all([
      moveToPosition(gp1.id, { x: targetX, y: targetY }),
      moveToPosition(gp2.id, { x: Math.min(targetX + 1, gridWidth - 1), y: targetY })
    ])

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Small pause for exploration
    await delay(2000)

    // Satisfy needs
    guineaPigStore.satisfyNeed(gp1.id, 'social', 10)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 10)
    guineaPigStore.satisfyNeed(gp1.id, 'play', 10)
    guineaPigStore.satisfyNeed(gp2.id, 'play', 10)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      2,
      'shared_experience',
      `${gp1.name} and ${gp2.name} explore together`
    )

    // Activity feed message (less frequent, only for bonded pairs)
    if (bond.bondingTier === 'bonded') {
      loggingStore.addPlayerAction(
        `${gp1.name} and ${gp2.name} explore the habitat together, staying close 🔍`,
        '🐹'
      )
    }

    return true
  }

  return {
    // Proximity helpers
    areGuineaPigsNear,
    getMidpoint,

    // 6 Core social behaviors
    approachCompanion,
    groomPartner,
    playTogether,
    shareFood,
    sleepTogether,
    exploreTogether
  }
}
