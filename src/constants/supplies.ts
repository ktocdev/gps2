/**
 * Supplies & Habitat Constants
 * Phase 3 - Centralized magic numbers and configuration values
 */

// ========================================================================
// Quality & Tier Order
// ========================================================================

export const QUALITY_ORDER = {
  cheap: 1,
  average: 2,
  premium: 3
} as const

export type QualityLevel = keyof typeof QUALITY_ORDER

// ========================================================================
// Habitat Condition Constants
// ========================================================================

export const HABITAT_CONDITIONS = {
  // Default starting values (0-100)
  DEFAULT_CLEANLINESS: 85,
  DEFAULT_BEDDING_FRESHNESS: 90,
  DEFAULT_HAY_FRESHNESS: 95,
  DEFAULT_WATER_LEVEL: 100,

  // Max/Min values
  CONDITION_MIN: 0,
  CONDITION_MAX: 100,

  // Alert thresholds
  WARNING_THRESHOLD: 40,
  CRITICAL_THRESHOLD: 20,

  // Reset value
  RESET_VALUE: 100
} as const

// ========================================================================
// Consumption & Capacity Constants
// ========================================================================

export const CONSUMPTION = {
  // Hay system
  HAY_HANDFULS_PER_BAG: 20,
  HAY_RACK_MAX_CAPACITY: 4,

  // Bedding defaults
  DEFAULT_ABSORBENCY: 1.0,
  DEFAULT_DECAY_RATE: 1.0,

  // Food bowl capacity
  DEFAULT_FOOD_CAPACITY: 2
} as const

// ========================================================================
// Poop & Cleanliness
// ========================================================================

export const POOP_CONSTANTS = {
  // Cleanliness reduction range per poop
  CLEANLINESS_REDUCTION_MIN: 2,
  CLEANLINESS_REDUCTION_MAX: 5,

  // Cleanliness recovery per poop removal
  CLEANLINESS_RECOVERY_PER_REMOVAL: 1
} as const

// ========================================================================
// Environmental Decay (System 16: Phase 3)
// ========================================================================

export const DECAY = {
  // Base decay rates (points per second)
  BEDDING_BASE_DECAY_PER_SECOND: 1 / (5 * 60), // -1 point per 5 minutes
  CLEANLINESS_BASE_DECAY_PER_SECOND: 1 / (10 * 60), // -1 point per 10 minutes

  // Quality modifiers for bedding decay
  QUALITY_MULTIPLIERS: {
    cheap: 1.2,
    average: 1.0,
    premium: 0.8,
    'colorful-premium': 0.8
  },

  // Activity acceleration (additional decay points per second)
  ACTIVITY_DECAY: {
    movement: 0.5 / 60, // -0.5 points per minute of movement
    eating: 1.0 / 60,   // -1.0 points per minute of eating
    drinking: 0.2 / 60  // -0.2 points per minute of drinking
  }
} as const

// ========================================================================
// History & Tracking
// ========================================================================

export const TRACKING = {
  // Maximum condition history snapshots to keep
  CONDITION_HISTORY_MAX: 100
} as const

// ========================================================================
// Starter Habitat Positions
// ========================================================================

export const STARTER_HABITAT_POSITIONS = {
  'habitat_plastic_igloo': { x: 3, y: 7 },
  'habitat_ceramic_bowl': { x: 9, y: 4 },
  'habitat_basic_hay_rack': { x: 11, y: 4 },
  'habitat_basic_water_bottle': { x: 0, y: 0 }
} as const

// ========================================================================
// Helper Functions
// ========================================================================

/**
 * Clamps a value between CONDITION_MIN and CONDITION_MAX
 */
export function clampCondition(value: number): number {
  return Math.max(
    HABITAT_CONDITIONS.CONDITION_MIN,
    Math.min(HABITAT_CONDITIONS.CONDITION_MAX, value)
  )
}

/**
 * Calculates random poop cleanliness reduction
 */
export function calculatePoopCleanlinessReduction(): number {
  const range = POOP_CONSTANTS.CLEANLINESS_REDUCTION_MAX - POOP_CONSTANTS.CLEANLINESS_REDUCTION_MIN
  return Math.floor(Math.random() * (range + 1)) + POOP_CONSTANTS.CLEANLINESS_REDUCTION_MIN
}

/**
 * Checks if a condition value is in warning state
 */
export function isWarningLevel(value: number): boolean {
  return value < HABITAT_CONDITIONS.WARNING_THRESHOLD && value >= HABITAT_CONDITIONS.CRITICAL_THRESHOLD
}

/**
 * Checks if a condition value is in critical state
 */
export function isCriticalLevel(value: number): boolean {
  return value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD
}
