# System 22: Interaction Enhancement System

**Phase:** 5 - Polish & Enhancement
**Status:** 📋 Planned
**Dependencies:** System 10.1 (Personality), System 10.2 (Preferences), System 7 (Needs), System 21 (Social Bonding)

## Overview

Comprehensive interaction feedback system that creates meaningful consequences for guinea pig care through wellness-based reactions, context-aware activity messages, and safety net mechanics. Consolidates Phase 2.5 Systems 10.3, 10.4, and 10.5 into a cohesive interaction enhancement framework.

**Core Philosophy:**
- **Visible consequences**: Low wellness creates observable behavioral changes
- **Realistic responses**: Unwell animals are less social and more withdrawn
- **Recovery motivation**: Players want to restore wellness to regain full interaction
- **Graduated severity**: Effects worsen progressively as wellness declines
- **Educational feedback**: Messages teach players about wellness importance
- **Safety net**: Prevents permanent loss while maintaining meaningful stakes

---

## Component 1: Wellness-Based Interaction Reactions
_(From Phase 2.5 System 10.3)_

### Wellness Tiers

#### 🌟 Excellent (80-100%)
**Behavioral State**: Thriving
- **Responsiveness**: Maximum, eager to interact
- **Base success rate**: **95%**
- **Social behavior**: Actively seeks companion interactions
- **Movement**: Full habitat exploration, curious
- **Vocalizations**: Frequent wheeks, chirps, purrs

#### 😊 Good (60-79%)
**Behavioral State**: Content
- **Responsiveness**: Normal baseline behavior
- **Base success rate**: **85%**
- **Social behavior**: Normal companion interaction frequency
- **Movement**: Regular habitat movement
- **Vocalizations**: Moderate, situation-appropriate

#### 😐 Fair (40-59%)
**Behavioral State**: Stressed
- **Responsiveness**: Subdued, cautious
- **Base success rate**: **65%**
- **Social behavior**: Reduced companion seeking (30% less)
- **Movement**: Limited to safe zones
- **Vocalizations**: Quiet, infrequent

#### 😟 Poor (20-39%)
**Behavioral State**: Withdrawn
- **Responsiveness**: Low, often avoids contact
- **Base success rate**: **40%**
- **Social behavior**: Minimal companion interaction (60% less)
- **Movement**: Stays in shelter, minimal movement
- **Rejection cooldown**: 30-60 seconds before retry
- **Vocalizations**: Rare, quiet distress sounds

#### 😰 Critical (<20%)
**Behavioral State**: Survival Mode
- **Responsiveness**: Minimal, hiding constantly
- **Base success rate**: **20%**
- **Social behavior**: Isolates from companions (80% less)
- **Movement**: None, remains in shelter
- **Rejection cooldown**: 60 seconds minimum
- **Warning**: Rescue system approaching (wellness < 15%)
- **Vocalizations**: Silent or distressed squeaks

### Interaction Type Modifiers

#### Essential Care (Higher Success)
- **feedGuineaPig()**: +15% bonus (survival instinct, min 50% success even at critical)
- **giveWater()**: +15% bonus (thirst drives acceptance, min 50% success)

#### Physical Handling (Lower Success)
- **trimNails()**: No modifier (uses friendship + wellness formula already)
- **cleanGuineaPig()**: -10% penalty (dislikes handling when unwell)
- **performHealthCheck()**: -10% penalty (stressful examination when sick)

#### Social Interactions (Wellness-Dependent)
- **socializeWithGuineaPig()**: Standard rate (0%)
- **playWithGuineaPig()**: -5% penalty (requires energy and good mood)

#### Comfort Activities (Higher Success When Unwell)
- **sootheToSleep()**: +10% bonus (seeks comfort when stressed)
- **provideShelter()**: +10% bonus (anxious animals seek hiding spots)

#### Enrichment Activities
- **rearrangeCage()**: -8% penalty (change is stressful when already stressed)
- **provideBedding()**: +5% bonus (comfort-seeking when unwell)
- **provideChewToy()**: -5% penalty (less interest in enrichment when stressed)

### Interaction Outcomes

#### Full Success
**Conditions**: Random roll < success rate
**Effects:**
- 100% interaction benefit applied
- Full need satisfaction amount
- Positive friendship gain (if applicable)
- Enthusiastic reaction message
- No cooldown timer

#### Partial Success
**Conditions**: Wellness 40-60%, failed primary roll but in partial window
**Effects:**
- 50% interaction benefit applied
- Reduced need satisfaction
- No friendship change
- Neutral/subdued reaction message
- No cooldown

#### Complete Rejection
**Conditions**: Failed roll, wellness < 60%
**Effects:**
- 0% interaction benefit
- No need satisfaction
- No friendship change
- Negative/avoidant reaction message
- **Cooldown timer**: 30-60 seconds before retry allowed

### Rejection Cooldown System

```typescript
interface InteractionCooldown {
  guineaPigId: string
  interactionType: string
  rejectedAt: number
  cooldownMs: number
  consecutiveRejections: number
}

function calculateCooldownDuration(wellness: number, consecutive: number): number {
  let baseCooldown = 30000 // 30 seconds

  // Longer cooldown at lower wellness
  if (wellness < 20) baseCooldown = 60000 // 1 minute
  else if (wellness < 40) baseCooldown = 45000 // 45 seconds

  // Increase for consecutive rejections (player pushing too hard)
  baseCooldown += consecutive * 15000 // +15s per consecutive rejection

  return Math.min(baseCooldown, 120000) // Max 2 minutes
}
```

### Guinea Pig Pair Interactions

**Both Guinea Pigs' Wellness Matters:**
```typescript
function getPairInteractionSuccess(
  wellness1: number,
  wellness2: number,
  interactionType: string
): number {
  const avgWellness = (wellness1 + wellness2) / 2
  const wellnessDifference = Math.abs(wellness1 - wellness2)

  // Base rate from average wellness
  let baseRate = getInteractionSuccessRate(avgWellness, interactionType)

  // Large wellness gap reduces success
  if (wellnessDifference > 30) {
    baseRate -= 15
  }

  // If either is critical, very low success
  if (wellness1 < 20 || wellness2 < 20) {
    baseRate *= 0.3 // 70% reduction
  }

  return Math.max(5, Math.min(95, baseRate))
}
```

**Pair Interaction Types:**
- **Grooming Each Other**: Hygiene + Social for both
- **Playing Together**: Play + Social for both
- **Sharing Food**: Hunger + Social
- **Sleeping Together**: Energy + Comfort + Social
- **Exploring Together**: Play + Social

---

## Component 2: Guinea Pig Rescue System
_(From Phase 2.5 System 10.4)_

### Trigger Conditions

**Wellness Threshold**: When any active guinea pig's wellness drops below **15%**

**Rescue Actions:**
1. **Immediate session end**: Game automatically ends active session
2. **Both guinea pigs rescued**: If 2 guinea pigs are active, BOTH return to store
3. **Needs fully restored**: All rescued guinea pigs have all 11 needs reset to 100%
4. **Financial penalty**: Money deducted (default: $200)
5. **Balance floor**: Balance cannot go negative (caps at $0 if can't afford penalty)
6. **Needs processing paused**: System automatically pauses needs processing
7. **Rescue notification**: Modal dialog explains what happened and offers choices

### Warning System

**Level 1 - Warning** (Wellness 20-30%):
- **Message**: "Guinea pig needs urgent care! If wellness drops below 15%, the store will rescue them."
- **Frequency**: Every 60 seconds (throttled)
- **Category**: `environmental` with warning severity
- **Visual**: ⚠️ emoji, yellow border in activity feed

**Level 2 - Critical** (Wellness 15-20%):
- **Message**: "⚠️ CRITICAL: Guinea pig will be rescued if wellness drops below 15%!"
- **Frequency**: Every 30 seconds (throttled)
- **Category**: `environmental` with critical severity
- **Visual**: 🚨 emoji, red border in activity feed

### Fresh Start System

**Always offered** after every rescue, regardless of balance

**✅ Preserved:**
- **First 3 favorite guinea pigs** (free slots 1-3)
- **Total game sessions** (statistics)
- **Total play time** (statistics)

**❌ Lost:**
- **Money reset to $1,000** (fresh start amount)
- **All owned items** (cleared)
- **All consumables** (cleared)
- **All achievements** (cleared)
- **Favorite slots 4-10** (if purchased)
- **⚠️ Guinea pigs in slots 4-10** (permanently lost!)

**Economic Impact:**
Losing purchased favorite slots represents significant investment:
- Slot 4: $50
- Slot 5: $100
- Slot 6: $200
- Slot 7: $400
- Slot 8: $800
- Slot 9: $1,600
- Slot 10: $3,200
- **Total potential loss**: $6,350

**Player Choice:**
- **Continue with penalty**: Pay $200 (or max available), keep all progress
- **Fresh Start**: Reset to $1,000, lose items/slots, keep first 3 favorites

---

## Component 3: Enhanced Activity Messages
_(From Phase 2.5 System 10.5)_

### Feature 1: Guinea Pig Reactions to User Interactions

**Implementation:**
- Reaction messages appear AFTER player action messages
- Reactions vary based on guinea pig preferences
- Uses `loggingStore.addGuineaPigReaction()` for proper categorization

**Examples:**
- After feeding favorite food: "Guinea pig popcorns with excitement! ✨"
- After feeding disliked food: "Guinea pig sniffs cautiously but eats reluctantly"
- After playing with favorite activity: "Guinea pig squeaks with delight!"
- After grooming: "Guinea pig feels fresh and clean!"

### Feature 2: Need Warning System

**Warning Levels:**
- **Warning** (needs 20-30): Gentle reminders every 60 seconds
- **Critical** (needs ≤15): Urgent alerts every 30 seconds

**Need-Specific Messages (11 needs):**
- **Hunger**: Warning: "Guinea pig sniffs around for food" | Critical: "Guinea pig is desperately hungry!"
- **Thirst**: Warning: "Guinea pig licks the water bottle spout" | Critical: "Guinea pig needs water urgently!"
- **Energy**: Warning: "Guinea pig yawns sleepily" | Critical: "Guinea pig is completely exhausted!"
- **Shelter**: Warning: "Guinea pig seeks a safe hiding spot" | Critical: "Guinea pig is anxiously looking for shelter!"
- **Play**: Warning: "Guinea pig seems restless and bored" | Critical: "Guinea pig is extremely bored!"
- **Social**: Warning: "Guinea pig wheeks softly for attention" | Critical: "Guinea pig feels very lonely!"
- **Comfort**: Warning: "Guinea pig adjusts bedding uncomfortably" | Critical: "Guinea pig is very uncomfortable!"
- **Hygiene**: Warning: "Guinea pig tries to groom itself" | Critical: "Guinea pig urgently needs cleaning!"
- **Nails**: Warning: "Guinea pig's nails are getting long" | Critical: "Guinea pig's nails are overgrown!"
- **Health**: Warning: "Guinea pig seems a bit under the weather" | Critical: "Guinea pig needs medical attention!"
- **Chew**: Warning: "Guinea pig looks for something to chew" | Critical: "Guinea pig's teeth need attention!"

**Throttling Logic:**
```typescript
// Warning threshold: needs <= 30, check every 60 seconds
// Critical threshold: needs <= 15, check every 30 seconds
if (needValue <= 15 && timeSinceLastWarning >= 30000) {
  // Show critical warning
} else if (needValue <= 30 && timeSinceLastWarning >= 60000) {
  // Show warning
}
```

### Feature 3: General Wellness Messages

**Wellness Ranges:**
- **Excellent** (80-100): "Guinea pig couldn't be better!", "Guinea pig is thriving!"
- **Good** (60-79): "Guinea pig is doing well", "Guinea pig is content"
- **Fair** (40-59): "Guinea pig could use some care", "Guinea pig seems a bit off"
- **Poor** (<40): "Guinea pig needs urgent attention!", "Guinea pig is struggling"

**Timing & Throttling:**
- Only appear when activity feed is quiet (no messages in last 30 seconds)
- Random interval: 5-10 minutes between wellness messages
- Prevents feed flooding during active gameplay

### Feature 4: Preference Discovery Clues

**Preference Levels:**
- **Favorite**: "✨ Guinea pig's eyes light up! They love this!", "Guinea pig does an excited popcorn!"
- **Neutral**: "Guinea pig munches contentedly", "Guinea pig accepts the food"
- **Disliked**: "Guinea pig sniffs cautiously", "Guinea pig eats reluctantly", "Guinea pig turns away"

**Discovery Mechanic:**
- Players learn preferences through observation
- No explicit "this is their favorite" indicators
- Natural language clues in activity feed
- Builds over time through repeated interactions

### Feature 5: Friendship Milestone Tracking

**6 Friendship Tiers:**
1. **Distant** (0-25%): "Guinea pig is wary of you", "Guinea pig keeps their distance"
2. **Acquainted** (25-40%): "Guinea pig is getting used to you", "Guinea pig watches you curiously"
3. **Comfortable** (40-60%): "Guinea pig trusts you", "Guinea pig comes when called"
4. **Friendly** (60-75%): "Guinea pig greets you warmly", "Guinea pig enjoys your company"
5. **Close Friends** (75-90%): "Guinea pig loves spending time with you", "Guinea pig seeks you out"
6. **Best Friends** (90-100%): "Guinea pig adores you!", "Guinea pig and you are inseparable!"

**Milestone Messages:**
- Appear when crossing tier thresholds
- Special celebration messages at major milestones
- Activity feed logs achievement

---

## Integration with Existing Systems

### Personality Modifiers

**Friendliness + Wellness:**
```typescript
// High friendliness provides resilience against wellness rejection
const friendlinessBonus = (personality.friendliness - 5) * 2
finalSuccessRate = wellnessBaseRate + friendlinessBonus

// Example: Friendliness 9, Wellness 35% (poor)
// Base: 40% + Personality: 8% = 48%
// Friendly guinea pig still trusts player despite feeling unwell
```

**Boldness + Wellness:**
```typescript
// High boldness: MORE withdrawn at low wellness
if (personality.boldness >= 7 && wellness < 40) {
  hideoutPreference += 25% // Seeks isolation
  socialRejectionBonus += 10% // Rejects more interactions
}

// Low boldness: SEEKS comfort at low wellness
if (personality.boldness <= 3 && wellness < 40) {
  comfortInteractionBonus += 15% // More likely to accept soothing
  socialRejectionPenalty -= 10% // Rejects fewer interactions
}
```

### Friendship Impact

**Friendship Moderates Wellness Effects:**
```typescript
// High friendship provides buffer
if (friendship >= 80) wellnessSuccessBonus += 10%
if (friendship >= 90) wellnessSuccessBonus += 15%

// Low friendship + low wellness compound penalty
if (friendship < 30 && wellness < 40) {
  interactionSuccessRate *= 0.7 // 30% additional reduction
}
```

---

## Implementation Examples

### Enhanced feedGuineaPig()

```typescript
function feedGuineaPig(
  guineaPigId: string,
  foodType: 'pellets' | 'hay' | 'vegetables' | 'treats'
): InteractionResult {
  const guineaPig = getGuineaPig(guineaPigId)
  if (!guineaPig) return { success: false }

  const wellness = needsController.calculateWellness(guineaPigId)

  // Check cooldown from previous rejection
  if (!canAttemptInteraction(guineaPigId, 'feed')) {
    return {
      success: false,
      message: `${guineaPig.name} is still recovering from earlier stress`,
      cooldownRemaining: getCooldownRemaining(guineaPigId, 'feed')
    }
  }

  // Calculate success rate (essential care +15% bonus)
  const baseRate = getInteractionSuccessRate(wellness, 'feed')
  const successRate = Math.min(100, baseRate + 15)

  const roll = Math.random() * 100

  if (roll < successRate) {
    // Full success
    satisfyNeed(guineaPigId, 'hunger', hungerReduction)

    // Check preferences for happiness bonus
    if (guineaPig.preferences.favoriteFood.includes(foodType)) {
      adjustNeed(guineaPigId, 'happiness', 10)
    }

    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'success'
    )

    loggingStore.addPlayerAction(message, emoji)
    return { success: true }
  } else {
    // Rejection (rare for feeding)
    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'rejection'
    )

    loggingStore.addGuineaPigReaction(message, emoji)
    setInteractionCooldown(guineaPigId, 'feed', wellness)

    return { success: false }
  }
}
```

---

## Testing Scenarios

### Wellness Decline Testing
1. **Start**: Healthy guinea pig (wellness 90%)
2. **Action**: Stop all care, let needs decay
3. **Track**: Success rates at each tier (80%, 60%, 40%, 20%)
4. **Verify**: Messages reflect wellness accurately, cooldowns apply correctly

### Rescue System Testing
1. **Action**: Let wellness drop below 15%
2. **Verify**: Rescue triggers, both guinea pigs rescued, $200 penalty applied
3. **Test**: Fresh Start dialog appears, options work correctly
4. **Verify**: First 3 favorites preserved, slots 4-10 lost

### Activity Message Throttling
1. **Action**: Let multiple needs drop below 30%
2. **Verify**: Warning messages appear every 60 seconds (not spamming)
3. **Action**: Let need drop below 15%
4. **Verify**: Critical warnings appear every 30 seconds
5. **Verify**: No message spam, clear urgency escalation

---

## Success Criteria

**Player Understanding:**
- ✅ Players recognize wellness impact through rejection feedback
- ✅ Players adjust care strategy when guinea pig becomes withdrawn
- ✅ Players understand wellness recovery improves interaction

**System Balance:**
- ✅ Interaction rejection feels fair, not punishing
- ✅ Recovery path is clear and achievable
- ✅ Excellent care rewarded with enthusiastic interactions
- ✅ Poor care has meaningful consequences

**Emotional Impact:**
- ✅ Players care about guinea pig wellness beyond mechanics
- ✅ Rejection messages motivate better care
- ✅ Recovery feels satisfying and rewarding
- ✅ Guinea pig feels alive with believable responses

---

## References

**Phase 2.5 Detailed Specifications:**
- [System 10.3: Wellness-Based Interaction Reactions](../../phase2.5/system-10.3-wellness-interaction-reactions.md) - Complete wellness tier mechanics
- [System 10.4: Guinea Pig Rescue](../../phase2.5/system-10.4-guinea-pig-rescue.md) - Rescue system details and Fresh Start mechanics
- [System 10.5: Enhanced Activity Messages](../../phase2.5/system-10.5-enhanced-activity-messages.md) - Message generation and throttling

**Related Systems:**
- [System 10.1: Personality Trait Influences](../../phase2.5/system-10.1-personality-trait-influences.md) - Personality modifiers
- [System 10.2: Preferences](../../phase2.5/system-10.2-preferences-likes-dislikes.md) - Preference discovery
- [Wellness System Design](../../../game-design/wellness-system.md) - Hidden wellness mechanics
- [System 21: Social Bonding](../../phase4/system-21-social-bonding-system.md) - Pair interaction foundation
