# Needs System Architecture - System 7

**Phase 2: Core Game Entities & State**

## Overview
Core game mechanics system managing guinea pig needs, wellness calculation, and friendship integration with complex interdependencies and feedback loops.

## Base Need Architecture

### Need Categories (0-100 Scale)
1. **Hunger** - Food consumption and satisfaction
2. **Thirst** - Water intake and hydration
3. **Happiness** - Entertainment, variety, and emotional well-being
4. **Cleanliness** - Personal hygiene and habitat cleanliness
5. **Health** - Physical condition and medical needs
6. **Energy** - Rest, sleep, and activity balance
7. **Social** - Interaction and companionship needs

### Need Value Ranges & Thresholds
- **Critical (0-25%):** Urgent attention required, severe penalties
- **Low (25-50%):** Needs attention, minor penalties and warnings
- **Moderate (50-75%):** Stable but could be improved
- **Good (75-90%):** Well-maintained, positive effects
- **Excellent (90-100%):** Optimal condition, maximum bonuses

### Decay Rate System
- **Variable decay rates** based on guinea pig age and health status
- **Base decay rates** for each need type with individual characteristics
- **Age influences:** Young and old guinea pigs have different needs patterns
- **Health multipliers:** Poor health accelerates certain need decays
- **Environmental modifiers:** Habitat conditions affect decay rates

## Need Interdependencies

### Cross-Need Effects
- **Low health affects other needs:** Sick guinea pigs have accelerated need decay
- **Happiness influences satisfaction:** Happy guinea pigs are more resilient to other need deficits
- **Energy affects activity:** Tired guinea pigs have reduced interaction effectiveness
- **Cleanliness impacts health:** Poor hygiene increases health decay rates

### Cascading Effects
- **Multiple need failures** create compound negative effects
- **Positive synergies** when multiple needs are well-maintained
- **Recovery bonuses** when addressing critical needs quickly
- **Preventive care** rewards for maintaining needs before they become critical

## Detailed Happiness Need System

### Natural Decay Mechanics
- **Baseline decay rate:** Happiness naturally decreases without stimulation
- **Time-based reduction:** Steady decline requiring regular attention
- **Individual variation:** Each guinea pig has unique happiness decay patterns

### Boredom System
- **Variety tracking:** Monitor diversity of interactions and toys over time
- **Accelerated decay:** Happiness drops faster with repetitive activities
- **Staleness penalties:** Same interactions become less effective over time
- **Novelty rewards:** New activities provide enhanced happiness benefits

### Stimulation & Excitement
- **Excitement boost:** New toys/interactions provide temporary happiness surge (+15-25 points)
- **Duration effects:** Boosts fade over time, requiring sustained engagement
- **Diminishing returns:** Repeated use of same stimulation reduces effectiveness
- **Peak management:** Balance between excitement and sustainable happiness

### Comfort & Maintenance
- **Familiar items:** Provide steady happiness baseline with slower decay
- **Comfort zones:** Established preferences that maintain happiness stability
- **Security factors:** Consistent care builds happiness resilience
- **Trust building:** Long-term relationship development affects happiness sustainability

### Environmental Happiness Factors
- **Fresh bedding:** Clean environment provides happiness bonus
- **Cleanliness effects:** Dirty habitat reduces happiness over time
- **Cage enrichment:** Toys, hiding places, and variety boost baseline happiness
- **Seasonal variations:** Environmental changes affect happiness needs

## Internal Wellness Rating System

### Wellness Calculation
- **Real-time average** of all 7 needs (0-100 scale)
- **Not displayed to player** - internal system only
- **Continuous monitoring** for threshold detection and penalty triggers
- **Weighted averaging** with potential for need-specific importance factors

### Wellness Threshold System
- **Penalty threshold:** < 45% wellness triggers friendship penalties
- **Warning threshold:** < 50% wellness provides contextual warnings only
- **Recovery threshold:** > 55% wellness stops friendship penalties
- **Optimal range:** > 75% wellness provides friendship bonuses

### Friendship Penalty Mechanism
- **Penalty rate:** -0.5 to -1 friendship points per game tick when wellness < 45%
- **Graduated penalties:** More severe penalties for lower wellness levels
- **Immediate consequences:** Real-time feedback through friendship meter changes
- **Recovery incentives:** Quick wellness improvement stops penalties immediately

## Friendship System Integration

### Friendship Level Mechanics
- **Range:** 0-100 friendship scale
- **Positive growth:** Increases through positive interactions and good care
- **Negative impacts:** Decreases through wellness penalties and poor care
- **Stability factors:** Established friendship is more resilient but still vulnerable

### Friendship Effects on Gameplay
- **Interaction unlocks:** Higher friendship enables new interactions and items
- **Behavior influence:** Friendship affects guinea pig autonomous behavior patterns
- **Reaction intensity:** Higher friendship produces more expressive reactions
- **Need satisfaction rates:** Higher friendship makes interactions more effective

### Wellness-to-Friendship Feedback Loop
- **Care consequences:** Poor overall care results in friendship deterioration
- **Recovery rewards:** Improved care quickly restores friendship levels
- **Long-term relationship:** Consistent good care builds lasting friendship resilience
- **Neglect penalties:** Extended poor care has compound negative effects

## Advanced Need Features

### Seasonal & Time-Based Variations
- **Seasonal needs changes:** Different needs patterns throughout the year
- **Daily rhythm effects:** Energy needs vary based on time of day
- **Activity cycles:** Natural periods of higher/lower needs based on guinea pig behavior
- **Environmental adaptation:** Needs adjust to habitat conditions over time

### Individual Variation
- **Personality-based needs:** Some guinea pigs have unique needs patterns
- **Age-related changes:** Needs evolve as guinea pig ages
- **Health condition effects:** Chronic conditions alter needs requirements
- **Preference integration:** Individual preferences affect happiness needs specifically

## Technical Implementation

### Need Class Structure
```typescript
interface Need {
  id: string
  name: string
  value: number // 0-100
  decayRate: number
  lastUpdate: number
  modifiers: NeedModifier[]
  thresholds: NeedThreshold[]
}

interface NeedModifier {
  source: string
  effect: number
  duration?: number
  condition?: () => boolean
}
```

### Performance Optimization
- **Batch processing:** Update all needs simultaneously for efficiency
- **Smart intervals:** Different needs update at appropriate frequencies
- **Threshold caching:** Avoid recalculating thresholds on every update
- **Lazy evaluation:** Only calculate complex interdependencies when needed

## Integration Points

### Needs Controller Store Connection
- **Central processing:** Batch needs updates through controller
- **Wellness calculation coordination** with controller system
- **State synchronization** across all needs-related systems

### Guinea Pig Store Integration
- **Individual needs storage** within guinea pig entity
- **Preference effects** on needs satisfaction rates
- **Reaction system** responds to needs levels and changes

### Debug Integration
- **Need manipulation tools** for testing and balancing
- **Wellness calculation visualization** for development insight
- **Threshold testing** capabilities for validation
- **Performance monitoring** for optimization

## Future Enhancements
- **Advanced interdependencies** with more complex need relationships
- **Learning system** where guinea pig needs adapt to player care patterns
- **Health system expansion** with specific medical conditions affecting needs
- **Social needs expansion** for multiple guinea pig interactions