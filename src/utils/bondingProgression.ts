/**
 * Bonding Progression System
 * System 21: Social Bonding
 *
 * Handles bonding level increases over time through:
 * - Recent social interactions
 * - Proximity time together
 * - Wellness bonus (both healthy)
 * - Compatibility multiplier
 *
 * Bonding Tiers:
 * - Neutral (0-30%): Basic companionship
 * - Friends (31-70%): Enjoyable companionship
 * - Bonded (71-100%): Deep partnership
 */

import { useGuineaPigStore, type ActiveBond } from '../stores/guineaPigStore'
import { useLoggingStore } from '../stores/loggingStore'
import { useSocialBehaviors } from '../composables/game/useSocialBehaviors'

/**
 * Process bonding progression for a single bond
 * Called periodically (e.g., every game tick)
 */
export function processBondingProgression(bond: ActiveBond, deltaTimeMs: number): void {
  const guineaPigStore = useGuineaPigStore()
  const loggingStore = useLoggingStore()
  const { areGuineaPigsNear } = useSocialBehaviors()

  const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
  const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)

  if (!gp1 || !gp2) return

  let bondingIncrease = 0

  // 1. Recent social interactions (+2-5 points each, from social behaviors)
  // This is already handled by increaseBonding() calls in useSocialBehaviors
  // Interactions are tracked in bond.bondingHistory

  // 2. Proximity time (+1 point per hour spent near each other)
  if (areGuineaPigsNear(bond.guineaPig1Id, bond.guineaPig2Id, 2)) {
    const proximityHours = deltaTimeMs / (1000 * 60 * 60)
    bondingIncrease += proximityHours * 1

    // Track total proximity time
    bond.proximityTime += proximityHours
  }

  // 3. Wellness bonus (+1 point per day if both > 70% wellness)
  if (gp1.stats.wellness > 70 && gp2.stats.wellness > 70) {
    const daysPassed = deltaTimeMs / (1000 * 60 * 60 * 24)
    bondingIncrease += daysPassed * 1
  }

  // 4. Apply compatibility multiplier (affects how fast bonding progresses)
  const compatibilityMultiplier = bond.compatibilityScore / 100
  bondingIncrease *= compatibilityMultiplier

  // Only update if there's actual progression
  if (bondingIncrease > 0) {
    const previousTier = bond.bondingTier

    // Update bonding level
    guineaPigStore.updateBondingLevel(bond.id, bondingIncrease)

    // Check for tier advancement
    const currentTier = guineaPigStore.getBondingTier(bond.bondingLevel)
    if (currentTier !== previousTier) {
      // Tier changed! Generate milestone message
      generateTierMilestoneMessage(gp1.name, gp2.name, previousTier, currentTier, loggingStore)
    }
  }
}

/**
 * Generate activity feed message for tier milestone
 */
function generateTierMilestoneMessage(
  name1: string,
  name2: string,
  previousTier: 'neutral' | 'friends' | 'bonded',
  newTier: 'neutral' | 'friends' | 'bonded',
  loggingStore: any
): void {
  let message = ''
  let emoji = '💕'

  if (newTier === 'friends' && previousTier === 'neutral') {
    message = `${name1} and ${name2} are becoming friends! They enjoy each other's company 💚`
    emoji = '😊'
  } else if (newTier === 'bonded' && previousTier === 'friends') {
    message = `${name1} and ${name2} have formed a strong bond! They're inseparable companions 💕`
    emoji = '💕'
  } else if (newTier === 'bonded' && previousTier === 'neutral') {
    // Rare case: jumped from neutral to bonded
    message = `${name1} and ${name2} have formed an incredible bond! True friendship 💕`
    emoji = '✨'
  }

  if (message) {
    loggingStore.addPlayerAction(message, emoji)
  }
}

/**
 * Calculate bonding tier benefits
 * Returns modifiers for social need decay and proximity bonus
 */
export function getBondingTierBenefits(bondingLevel: number): {
  socialDecayModifier: number // Multiplier for social need decay (lower = slower decay)
  proximityBonus: number       // Bonus satisfaction when near partner
  interactionFrequency: number // Multiplier for autonomous interaction chance
} {
  if (bondingLevel >= 71) {
    // Bonded tier
    return {
      socialDecayModifier: 0.5,   // 50% slower social decay
      proximityBonus: 0.4,         // 40% proximity bonus
      interactionFrequency: 1.4    // 40% more autonomous interactions
    }
  } else if (bondingLevel >= 31) {
    // Friends tier
    return {
      socialDecayModifier: 0.7,   // 30% slower social decay
      proximityBonus: 0.25,        // 25% proximity bonus
      interactionFrequency: 1.2    // 20% more autonomous interactions
    }
  } else {
    // Neutral tier
    return {
      socialDecayModifier: 0.8,   // 20% slower social decay
      proximityBonus: 0.1,         // 10% proximity bonus
      interactionFrequency: 1.0    // Normal interaction frequency
    }
  }
}

/**
 * Process all active bonds
 * Called from game timing loop
 */
export function processAllBonds(deltaTimeMs: number): void {
  const guineaPigStore = useGuineaPigStore()
  const allBonds = guineaPigStore.getAllBonds()

  for (const bond of allBonds) {
    processBondingProgression(bond, deltaTimeMs)
  }
}
