import type { GuineaPig } from '../stores/guineaPigStore'
import { generateReactionMessage } from '../data/guineaPigMessages'
import type { MessageContext, ReactionMessage } from '../data/guineaPigMessages'

export interface InteractionValidation {
  canInteract: boolean
  successRate: number
  wellnessTier: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  rejectionReason?: 'tired' | 'stressed' | 'full' | 'limit_reached' | 'low_friendship'
  reactionMessage?: ReactionMessage
}

export interface InteractionAttempt {
  success: boolean
  reactionMessage: ReactionMessage
  cooldownMs?: number
}

/**
 * Get wellness tier from wellness percentage
 */
export function getWellnessTier(wellness: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (wellness >= 80) return 'excellent'
  if (wellness >= 60) return 'good'
  if (wellness >= 40) return 'fair'
  if (wellness >= 20) return 'poor'
  return 'critical'
}

/**
 * Calculate interaction success rate based on wellness tier
 * From System 22 spec
 */
export function getSuccessRateForWellness(wellnessTier: string): number {
  switch (wellnessTier) {
    case 'excellent': return 0.95
    case 'good': return 0.85
    case 'fair': return 0.70
    case 'poor': return 0.50
    case 'critical': return 0.20
    default: return 0.70
  }
}

/**
 * Get interaction type modifier
 * From System 22 spec
 */
export function getInteractionTypeModifier(interactionType: string): number {
  // Essential care interactions (feeding, water, cleaning) get +15% success
  if (['feed', 'hand-feed', 'water', 'clean'].includes(interactionType)) {
    return 0.15
  }

  // Physical handling interactions (hold, pick-up, weigh) get -10% success
  if (['hold', 'pick-up', 'weigh'].includes(interactionType)) {
    return -0.10
  }

  // Comfort interactions (pet, talk-to, sing-to) get +10% success
  if (['pet', 'talk-to', 'sing-to', 'gentle-wipe'].includes(interactionType)) {
    return 0.10
  }

  // Default: no modifier
  return 0
}

/**
 * Calculate personality modifier for interaction success
 * Boldness affects interaction acceptance
 */
export function getPersonalityModifier(guineaPig: GuineaPig): number {
  const boldness = guineaPig.personality.boldness

  // Boldness 1-3: Shy (-10% success)
  if (boldness <= 3) return -0.10

  // Boldness 8-10: Bold (+10% success)
  if (boldness >= 8) return 0.10

  // Boldness 4-7: Neutral (no modifier)
  return 0
}

/**
 * Calculate friendship modifier for interaction success
 */
export function getFriendshipModifier(friendship: number): number {
  if (friendship >= 80) return 0.15  // Best friends: +15%
  if (friendship >= 60) return 0.10  // Close: +10%
  if (friendship >= 40) return 0.05  // Friendly: +5%
  if (friendship >= 20) return 0     // Acquaintances: no modifier
  return -0.15                        // Strangers: -15%
}

/**
 * Validate if an interaction can proceed based on wellness and calculate success rate
 */
export function validateInteraction(
  guineaPig: GuineaPig,
  wellness: number,
  interactionType: string
): InteractionValidation {
  const wellnessTier = getWellnessTier(wellness)

  // Base success rate from wellness
  let successRate = getSuccessRateForWellness(wellnessTier)

  // Apply modifiers
  successRate += getInteractionTypeModifier(interactionType)
  successRate += getPersonalityModifier(guineaPig)
  successRate += getFriendshipModifier(guineaPig.friendship)

  // Clamp between 0 and 1
  successRate = Math.max(0, Math.min(1, successRate))

  // Determine rejection reason if wellness is very low
  let rejectionReason: InteractionValidation['rejectionReason']
  if (wellness < 30) {
    rejectionReason = 'tired'
  }

  return {
    canInteract: true, // Always allow attempt, but may fail
    successRate,
    wellnessTier,
    rejectionReason
  }
}

/**
 * Attempt an interaction and generate appropriate reaction
 */
export function attemptInteraction(
  guineaPig: GuineaPig,
  wellness: number,
  interactionType: 'feed' | 'play' | 'socialize' | 'general',
  preferenceLevel?: 'favorite' | 'liked' | 'neutral' | 'disliked'
): InteractionAttempt {
  const validation = validateInteraction(guineaPig, wellness, interactionType)

  // Roll for success
  const roll = Math.random()
  const success = roll <= validation.successRate

  // Generate reaction message
  const context: MessageContext = {
    interactionType,
    wellnessTier: validation.wellnessTier,
    preferenceLevel,
    rejectionReason: success ? undefined : validation.rejectionReason
  }

  const reactionMessage = generateReactionMessage(context)

  // Calculate cooldown if rejected
  let cooldownMs: number | undefined
  if (!success) {
    // Cooldown based on wellness (worse wellness = longer cooldown)
    switch (validation.wellnessTier) {
      case 'excellent': cooldownMs = 30000; break   // 30s
      case 'good': cooldownMs = 45000; break        // 45s
      case 'fair': cooldownMs = 60000; break        // 1min
      case 'poor': cooldownMs = 90000; break        // 1.5min
      case 'critical': cooldownMs = 120000; break   // 2min
    }
  }

  return {
    success,
    reactionMessage,
    cooldownMs
  }
}

/**
 * Check if a need is at warning or critical level
 */
export function checkNeedWarning(needValue: number): 'warning' | 'critical' | null {
  if (needValue <= 15) return 'critical'
  if (needValue <= 30) return 'warning'
  return null
}
