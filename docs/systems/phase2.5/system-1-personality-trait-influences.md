# Personality Trait Influence System - System 3

**Phase 2.5: Interactive Feedback Enhancement**

## Overview
Comprehensive system defining how the 4 core personality traits (Friendliness, Playfulness, Curiosity, Independence) influence guinea pig behavior, needs, interactions, and all gameplay mechanics. Personality creates unique individual experiences, making each guinea pig genuinely different to care for.

## Core Philosophy
- **Individual uniqueness**: Each guinea pig feels distinctly different based on personality
- **Observable differences**: Personality effects are noticeable in gameplay
- **Natural discovery**: Players learn personality through observation, not stat sheets
- **Meaningful choices**: Personality influences which care strategies work best
- **Future-proof design**: Framework supports expansion as new systems are added

## The Four Personality Traits

### Trait Structure
Each guinea pig has 4 personality traits rated 1-10:
- **1-3**: Low (trait is weak or minimal)
- **4-6**: Moderate (balanced, middle-ground)
- **7-10**: High (trait is strong or dominant)

### Trait Definitions

#### Friendliness (1-10)
**Definition**: How social, outgoing, and responsive to interaction the guinea pig is

**High Friendliness (7-10)**:
- Eager to interact with player
- Enjoys being handled and pet
- Responsive to attention
- Forms strong bonds quickly
- Comfortable with frequent human interaction

**Low Friendliness (1-3)**:
- Reserved and independent
- Takes time to warm up
- Prefers observing from distance
- Bonds slowly but still capable
- Comfortable with minimal interaction

**Moderate Friendliness (4-6)**:
- Balanced social needs
- Adaptable to varying interaction levels
- Neither clingy nor distant
- Steady, predictable bonding

#### Playfulness (1-10)
**Definition**: Energy level, enthusiasm for activities, and engagement with enrichment

**High Playfulness (7-10)**:
- High energy and active
- Loves toys and activities
- Needs frequent enrichment
- Enjoys dynamic interactions
- Enthusiastic reactions

**Low Playfulness (1-3)**:
- Calm and relaxed
- Prefers quiet activities
- Content with simple environment
- Less stimulation needed
- Peaceful disposition

**Moderate Playfulness (4-6)**:
- Balanced energy levels
- Enjoys both active and calm time
- Flexible enrichment needs
- Adaptable play style

#### Curiosity (1-10)
**Definition**: Drive to explore, investigate, and engage with novelty

**High Curiosity (7-10)**:
- Investigates everything immediately
- Loves habitat changes
- Quickly bored without novelty
- Adventurous and brave
- First to explore new items

**Low Curiosity (1-3)**:
- Comfortable with routine
- Cautious about changes
- Prefers familiar items
- Takes time to investigate
- Values predictability

**Moderate Curiosity (4-6)**:
- Balanced exploration drive
- Investigates at own pace
- Comfortable with some novelty
- Neither fearful nor reckless

#### Independence (1-10)
**Definition**: Self-sufficiency and comfort with solitude

**High Independence (7-10)**:
- Happy alone
- Self-entertaining
- Less needy for attention
- Confident and self-assured
- Tolerates solitude well

**Low Independence (1-3)**:
- Needs companionship
- Seeks frequent interaction
- More vocal when alone
- Thrives with attention
- Prefers group activities

**Moderate Independence (4-6)**:
- Balanced self-sufficiency
- Enjoys both alone time and company
- Adaptable to varying social situations
- Comfortable flexibility

## Current System Influences (Phase 2)

### Needs Decay Rate Modifiers

**Friendliness → Social Need Decay**:
```typescript
// High friendliness = slower social need decay (more socially satisfied)
socialDecayRate = baseDecayRate * (1 - (friendliness - 5) * 0.04)

// Examples:
// Friendliness 10: 0.8x decay rate (-20%)
// Friendliness 5: 1.0x decay rate (baseline)
// Friendliness 1: 1.16x decay rate (+16%)
```

**Playfulness → Play Need Decay**:
```typescript
// High playfulness = faster play need decay (needs more stimulation)
playDecayRate = baseDecayRate * (1 + (playfulness - 5) * 0.06)

// Examples:
// Playfulness 10: 1.30x decay rate (+30%)
// Playfulness 5: 1.0x decay rate (baseline)
// Playfulness 1: 0.76x decay rate (-24%)
```

**Curiosity → Stimulation Need Decay**:
```typescript
// High curiosity = faster stimulation decay (needs more enrichment)
stimulationDecayRate = baseDecayRate * (1 + (curiosity - 5) * 0.08)

// Examples:
// Curiosity 10: 1.40x decay rate (+40%)
// Curiosity 5: 1.0x decay rate (baseline)
// Curiosity 1: 0.68x decay rate (-32%)
```

**Independence → Social Need Decay**:
```typescript
// High independence = slower social decay (comfortable alone)
// Works opposite to friendliness, both influence social need
socialDecayModifier = baseDecayRate * (1 - (independence - 5) * 0.06)

// Examples:
// Independence 10: 0.70x decay rate (-30%)
// Independence 5: 1.0x decay rate (baseline)
// Independence 1: 1.24x decay rate (+24%)

// Combined with friendliness:
finalSocialDecay = baseRate * friendlinessModifier * independenceModifier
```

**Combined Example**:
```
Guinea Pig: High Friendliness (8) + Low Independence (2)
  Friendliness modifier: 1 - (8 - 5) * 0.04 = 0.88x (-12%)
  Independence modifier: 1 - (2 - 5) * 0.06 = 1.18x (+18%)
  Combined: 0.88 * 1.18 = 1.04x (+4% faster social decay)

Result: Socially needy guinea pig (friendly but not independent)
```

### Interaction Effectiveness Modifiers

**Friendliness → Social Interactions**:
```typescript
// socializeWithGuineaPig(), affection interactions
baseSatisfaction = 25
bonus = (friendliness - 5) * 3

effectiveSatisfaction = baseSatisfaction + bonus

// Examples:
// Friendliness 10: 25 + 15 = 40 (+60% effectiveness)
// Friendliness 5: 25 + 0 = 25 (baseline)
// Friendliness 1: 25 - 12 = 13 (-48% effectiveness)
```

**Playfulness → Play Interactions**:
```typescript
// playWithGuineaPig(), toy interactions
baseSatisfaction = 20
multiplier = 1 + (playfulness - 5) * 0.05

effectiveSatisfaction = baseSatisfaction * multiplier

// Examples:
// Playfulness 10: 20 * 1.25 = 25 (+25% effectiveness)
// Playfulness 5: 20 * 1.0 = 20 (baseline)
// Playfulness 1: 20 * 0.80 = 16 (-20% effectiveness)
```

**Curiosity → Stimulation Interactions**:
```typescript
// rearrangeCage(), new item introduction
baseSatisfaction = 30
newItemBonus = curiosity >= 7 ? 10 : 0
multiplier = 1 + (curiosity - 5) * 0.06

effectiveSatisfaction = (baseSatisfaction + newItemBonus) * multiplier

// Examples (new item):
// Curiosity 10: (30 + 10) * 1.30 = 52 (+73% effectiveness)
// Curiosity 5: 30 * 1.0 = 30 (baseline)
// Curiosity 1: 30 * 0.76 = 23 (-24% effectiveness)
```

**Independence → Comfort from Solitary Activities**:
```typescript
// provideBedding(), shelter(), self-grooming bonus
baseComfort = 35
independenceBonus = independence >= 7 ? 7 : 0

effectiveComfort = baseComfort + independenceBonus

// Examples:
// Independence 10: 35 + 7 = 42 (+20% from solitary care)
// Independence 5: 35 (baseline)
// Independence 1: 35 (no penalty, just no bonus)
```

### Friendship Progression Modifiers

**Friendliness → Friendship Gain Rate**:
```typescript
// adjustFriendship() when called from positive interactions
baseFriendshipGain = 0.5 // Per interaction
multiplier = 1 + (friendliness - 5) * 0.03

actualGain = baseFriendshipGain * multiplier

// Examples:
// Friendliness 10: 0.5 * 1.15 = 0.575 (+15% faster bonding)
// Friendliness 5: 0.5 * 1.0 = 0.5 (baseline)
// Friendliness 1: 0.5 * 0.88 = 0.44 (-12% slower bonding)
```

**Combined Personality → Friendship Ceiling**:
```typescript
// Very independent guinea pigs have slightly lower max friendship
// But can still reach "Best Friend" status, just takes longer

if (independence >= 8 && friendliness <= 3) {
  // Independent loner personality
  friendshipGainReduction = 0.85 // -15% to all friendship gains
} else {
  friendshipGainReduction = 1.0
}
```

### Activity Feed Reaction Variations

**Friendliness → Interaction Reactions**:

**High Friendliness**:
- "Guinea pig purrs contentedly and nuzzles your hand!"
- "Guinea pig wheeks excitedly at your approach!"
- "Guinea pig runs up eagerly for attention!"

**Low Friendliness**:
- "Guinea pig accepts the interaction calmly"
- "Guinea pig observes from a distance"
- "Guinea pig warms up slowly to your presence"

**Playfulness → Activity Reactions**:

**High Playfulness**:
- "Guinea pig bounces with excitement! 🎉"
- "Guinea pig does energetic zoomies around the cage!"
- "Guinea pig plays enthusiastically with the toy!"

**Low Playfulness**:
- "Guinea pig investigates the toy at a leisurely pace"
- "Guinea pig rests peacefully in the hideout"
- "Guinea pig enjoys a calm moment of relaxation"

**Curiosity → New Item Reactions**:

**High Curiosity**:
- "Guinea pig immediately investigates the new item!"
- "Guinea pig sniffs every corner with fascination"
- "Guinea pig explores the rearranged cage excitedly"

**Low Curiosity**:
- "Guinea pig cautiously approaches the new item"
- "Guinea pig prefers the familiar corner of the cage"
- "Guinea pig takes time to adjust to the changes"

**Independence → Solo Activity Reactions**:

**High Independence**:
- "Guinea pig contentedly entertains itself"
- "Guinea pig seems perfectly happy alone"
- "Guinea pig enjoys peaceful solitary time"

**Low Independence**:
- "Guinea pig looks around hopefully for company"
- "Guinea pig wheeks softly, seeking attention"
- "Guinea pig seems happiest with interaction"

## Future System Influences (Phase 3-5)

### Autonomy System (Phase 4)

**Friendliness → Approach Behaviors**:
```typescript
// Likelihood of approaching player vs. hiding
approachChance = (friendliness * 10) + "%"

// High friendliness (10): 100% approach when player nearby
// Low friendliness (1): 10% approach, 90% observe from distance
```

**Playfulness → Activity Selection**:
```typescript
// Autonomous toy usage frequency
toyUsageFrequency = playfulness * 2 // Minutes between toy interactions

// High playfulness (10): Every 20 minutes
// Low playfulness (1): Every 2 minutes
```

**Curiosity → Exploration Patterns**:
```typescript
// How quickly guinea pig investigates new items
investigationDelay = (11 - curiosity) * 30 // Seconds before investigation

// High curiosity (10): 30 seconds (immediate)
// Low curiosity (1): 300 seconds (5 minutes, cautious)

// Habitat exploration radius
explorationRadius = curiosity * 10 // Percentage of habitat explored per cycle

// High curiosity: Explores 100% of accessible areas
// Low curiosity: Stays in 10% comfort zone
```

**Independence → Solo Activity Preference**:
```typescript
// Preference for solo vs. companion activities
soloActivityWeight = independence * 10

// High independence: 100% weight to solo activities
// Low independence: 10% weight, prefers companion interaction
```

### Guinea Pig Bonding (Phase 4)

**Already Documented in [guinea-pig-bonding-system.md](../phase4/guinea-pig-bonding-system.md)**

Summary of personality compatibility:
- **Friendliness**: High+High = +20, High+Low = +10
- **Playfulness**: Similar levels bond better (within 3 points = +10)
- **Curiosity**: Complementary helps (High+Low = +5 for balance)
- **Independence**: Similar levels preferred (within 2 points = +15)

### Item Interaction Preferences (Phase 3-4)

**Playfulness → Toy Preference**:
- High playfulness: Prefers active toys (tunnels, balls, mazes)
- Low playfulness: Prefers passive comfort items (beds, hideouts)

**Curiosity → Enrichment Response**:
- High curiosity: Maximum benefit from puzzle feeders, new items
- Low curiosity: Consistent benefit from familiar enrichment

**Independence → Hideout Usage**:
- High independence: Uses individual hideouts more frequently
- Low independence: Prefers multi-guinea pig hideouts, open areas near companion

**Friendliness → Mirror/Social Toys**:
- High friendliness: Enjoys mirrors, "social" enrichment items
- Low friendliness: Neutral or slight discomfort with mirrors

### Habitat Maintenance (Phase 3)

**Playfulness → Mess Generation**:
```typescript
// Active guinea pigs scatter more bedding, move items
messMultiplier = 1 + (playfulness - 5) * 0.04

// High playfulness (10): 1.20x mess rate (more active = messier)
// Low playfulness (1): 0.84x mess rate
```

**Curiosity → Item Rearrangement**:
- High curiosity guinea pigs may autonomously move small items
- Adds gameplay variety and "personality" to habitat

## Personality Visualization & Communication

### Activity Feed Integration

**Personality Traits Should Influence**:
1. **Message Selection**: Different personality templates for same action
2. **Emoji Choice**: Energetic (🎉) vs. calm (😌) based on playfulness
3. **Frequency**: High playfulness = more frequent activity messages
4. **Tone**: Friendly vs. reserved language based on friendliness

### Debug Panel Display (Future Enhancement)

**Personality Panel**:
```
┌─ Personality Traits ──────────────┐
│ Friendliness:    ████████░░ 8/10  │
│ Playfulness:     ███░░░░░░░ 3/10  │
│ Curiosity:       ██████████ 10/10 │
│ Independence:    ████░░░░░░ 4/10  │
│                                   │
│ Personality Type: Curious Observer│
│ - Social but reserved             │
│ - Loves exploring                 │
│ - Calm energy level               │
└───────────────────────────────────┘
```

**Current Modifiers Display**:
```
┌─ Active Personality Modifiers ────┐
│ Social Need Decay:    0.96x ✓     │
│ Play Effectiveness:   0.85x       │
│ Stimulation Decay:    1.40x ⚠     │
│ Friendship Gain:      1.09x ✓     │
└───────────────────────────────────┘
```

### Personality Type Descriptions

**System generates personality summary based on trait combinations**:

**Combinations**:
- **Social Butterfly**: High Friendliness (8+), Low Independence (1-3)
- **Independent Explorer**: High Curiosity (8+), High Independence (8+)
- **Energetic Player**: High Playfulness (8+), High Curiosity (7+)
- **Calm Companion**: Low Playfulness (1-3), High Friendliness (7+)
- **Cautious Observer**: Low Curiosity (1-3), Low Playfulness (1-3)
- **Balanced Buddy**: All traits 4-6 (moderate everything)

## Balancing Guidelines

### Design Principles

**1. No "Bad" Personalities**:
- All personality combinations are viable
- Trade-offs rather than disadvantages
- High maintenance in one area, low in another

**2. Observable Differences**:
- Personality effects should be noticeable (minimum 15-20% variation)
- Players should recognize personality through gameplay, not just stats
- Different strategies work for different personalities

**3. Consistent Scaling**:
- Each point of personality trait should have consistent value
- Linear scaling preferred for predictability
- Special breakpoints only for thematic reasons (e.g., independence 8+ for "loner" behaviors)

**4. Future-Proof Framework**:
- New systems should consider how personality influences them
- Trait effects should be documented when new mechanics are added
- Maintain coherent personality expression across all systems

### Balancing Targets

**Care Difficulty Balance**:
```
Easy Care:
  - Low playfulness (content with less)
  - High independence (less social need)
  - Low curiosity (routine is fine)

Challenging Care:
  - High playfulness (needs constant enrichment)
  - Low independence (needs attention)
  - High curiosity (bores easily)
```

**Both Should Be Fun**:
- Easy care = relaxing, peaceful experience
- Challenging care = engaging, dynamic experience
- Neither is "better," just different play styles

## Implementation Notes

### Current Phase (2.5)

**Already Implemented**:
- Personality trait data structure (1-10 scale)
- Traits assigned during guinea pig generation
- Stored in GuineaPig interface

**Documentation Priority**:
- This document defines intended behavior
- Implementation in Phase 2 systems (needs, interactions)
- Framework for Phase 3-4 integration

**Debug Integration**:
- Add personality display to Guinea Pig Debug panel
- Show trait values and active modifiers
- Preview how personality affects specific interactions

### Code Integration Examples

**Needs Decay (needsController.ts)**:
```typescript
function calculatePersonalityNeedDecay(
  guineaPig: GuineaPig,
  needType: keyof GuineaPigNeeds
): number {
  const baseDecay = needsDecayRates[needType]
  let modifier = 1.0

  switch (needType) {
    case 'social':
      // Friendliness: higher = slower decay
      const friendlinessModifier = 1 - (guineaPig.personality.friendliness - 5) * 0.04
      // Independence: higher = slower decay
      const independenceModifier = 1 - (guineaPig.personality.independence - 5) * 0.06
      modifier = friendlinessModifier * independenceModifier
      break

    case 'play':
      // Playfulness: higher = faster decay
      modifier = 1 + (guineaPig.personality.playfulness - 5) * 0.06
      break

    case 'stimulation':
      // Curiosity: higher = faster decay
      modifier = 1 + (guineaPig.personality.curiosity - 5) * 0.08
      break
  }

  return baseDecay * modifier
}
```

**Interaction Benefits (guineaPigStore.ts)**:
```typescript
function socializeWithGuineaPig(guineaPigId: string): boolean {
  const guineaPig = getGuineaPig(guineaPigId)
  if (!guineaPig) return false

  // Base social gain
  let socialGain = 25

  // Friendliness bonus
  const friendlinessBonus = (guineaPig.personality.friendliness - 5) * 3
  socialGain += friendlinessBonus

  // Apply the benefit
  satisfyNeed(guineaPigId, 'social', socialGain)

  // Generate personality-appropriate reaction
  const reaction = generatePersonalityReaction(guineaPig, 'social_interaction')
  loggingStore.addGuineaPigReaction(reaction.message, reaction.emoji)

  return true
}
```

**Reaction Generation (messageGenerator.ts)**:
```typescript
function generatePersonalityReaction(
  guineaPig: GuineaPig,
  interactionType: string
): { message: string; emoji: string } {
  const { friendliness, playfulness, curiosity, independence } = guineaPig.personality

  if (interactionType === 'social_interaction') {
    if (friendliness >= 8) {
      return {
        message: `${guineaPig.name} purrs contentedly and nuzzles your hand!`,
        emoji: '🥰'
      }
    } else if (friendliness <= 3) {
      return {
        message: `${guineaPig.name} accepts the interaction calmly`,
        emoji: '😌'
      }
    }
  }

  if (interactionType === 'play') {
    if (playfulness >= 8) {
      return {
        message: `${guineaPig.name} bounces with excitement!`,
        emoji: '🎉'
      }
    } else if (playfulness <= 3) {
      return {
        message: `${guineaPig.name} enjoys a calm moment of play`,
        emoji: '😊'
      }
    }
  }

  // Default reaction
  return {
    message: `${guineaPig.name} reacts to the interaction`,
    emoji: '🐹'
  }
}
```

## Testing Scenarios

### Personality Extremes Testing

**Test Guinea Pig Profiles**:

**1. Social Butterfly**:
- Friendliness: 10, Playfulness: 8, Curiosity: 6, Independence: 2
- Expected: Needs lots of interaction, forms bonds quickly, social decay very slow

**2. Independent Explorer**:
- Friendliness: 3, Playfulness: 5, Curiosity: 10, Independence: 10
- Expected: Happy alone, needs constant enrichment, slow bonding, explores everything

**3. Energetic Player**:
- Friendliness: 7, Playfulness: 10, Curiosity: 9, Independence: 4
- Expected: High energy, needs toys, friendly but demanding, fast play decay

**4. Calm Companion**:
- Friendliness: 9, Playfulness: 2, Curiosity: 3, Independence: 3
- Expected: Loves attention, peaceful, routine-oriented, slow play decay

**5. Balanced Buddy**:
- All traits: 5-6
- Expected: Baseline behavior, adaptable, no extreme needs

### Verification Checklist
- [ ] Personality traits display correctly in debug panel
- [ ] Need decay rates visibly different between personalities
- [ ] Interaction effectiveness varies with personality
- [ ] Activity feed messages reflect personality
- [ ] Friendship progression shows personality influence
- [ ] No personality combination feels "broken" or unplayable
- [ ] Players can observe personality differences without checking stats

## Future Enhancements

### Personality Development (Phase 5+)
- **Personality drift**: Traits slowly shift based on player care style
- **Reinforcement**: Frequently used behaviors strengthen related traits
- **Age effects**: Young guinea pigs more curious, older ones more set in ways

### Advanced Interactions
- **Personality-specific achievements**: "Befriend a shy guinea pig"
- **Personality hints in store**: Subtle behavioral previews before adoption
- **Personality matching**: Suggest companions based on compatibility

### Player Feedback
- **Personality insights**: Periodic messages explaining personality effects
- **Care recommendations**: Suggestions tailored to personality
- **Milestone tracking**: Progress in understanding guinea pig's personality

## References
- [Guinea Pig Bonding System](../phase4/guinea-pig-bonding-system.md) - Personality compatibility
- [Guinea Pig Autonomy System](../phase4/guinea-pig-autonomy-system.md) - AI behavior influences
- [Preferences System](../../game-design/preferences-system.md) - Likes/dislikes separate from personality
- [Needs System](../phase2/system-7-needs-system.md) - Need categories and decay rates
