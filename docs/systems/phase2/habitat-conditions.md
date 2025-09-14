# Habitat Conditions Store (Pinia) - System 9

**Phase 2: Core Game Entities & State**

## Overview
Environmental condition tracking system managing cleanliness, bedding freshness, and water levels with resource management and guinea pig need integration.

## Core Habitat Conditions (0-100 Scale)

### Cleanliness Level
- **Range:** 0-100 scale representing overall habitat hygiene
- **Decay mechanism:** Decreases with poop accumulation over time
- **Reset method:** Cleaning cage action restores cleanliness to 100%
- **Factors affecting cleanliness:**
  - Poop placement frequency and locations
  - Time since last cleaning
  - Guinea pig activity levels
  - Bedding condition effects

### Bedding Freshness
- **Range:** 0-100 scale representing bedding quality and freshness
- **Decay mechanism:** Gradual decay over time regardless of activity
- **Refresh method:** Using bedding resource from inventory
- **Decay factors:**
  - Time-based deterioration (natural aging)
  - Guinea pig usage and movement
  - Moisture and waste absorption
  - Environmental conditions

### Water Level
- **Range:** 0-100 scale representing water bottle fullness
- **Consumption mechanism:** Decreases when guinea pig drinks
- **Refill method:** Refilled for free (infinite resource)
- **Consumption factors:**
  - Guinea pig thirst need levels
  - Activity levels affecting hydration needs
  - Environmental temperature effects
  - Health condition influences

## Resource Management System

### Bedding Resource Management
- **Consumable resource:** Bedding must be purchased and managed
- **Inventory integration:** Track bedding quantity in player inventory
- **Usage rates:** Different bedding types have different longevity
- **Cost implications:** Economic pressure for regular bedding maintenance

### Resource Consumption Tracking
- **Usage monitoring:** Track bedding consumption rates and patterns
- **Efficiency calculations:** Optimize bedding type recommendations
- **Budget impact analysis:** Help players understand maintenance costs
- **Inventory alerts:** Warn when bedding supplies run low

### Free vs Paid Resources
- **Water:** Infinite free resource requiring only player action
- **Cleaning supplies:** Implicit free resource for cage cleaning
- **Bedding:** Paid consumable resource with economic gameplay implications
- **Labor:** Player time and attention as implicit resource cost

## Habitat Condition Integration

### Guinea Pig Need Effects
- **Cleanliness need integration:** Low habitat cleanliness affects guinea pig cleanliness need
- **Happiness effects:** Fresh bedding and clean environment boost happiness
- **Health implications:** Poor conditions can accelerate health need decay
- **Comfort factors:** Good conditions provide baseline happiness bonuses

### Cross-Condition Dependencies
- **Cleanliness affects bedding:** Dirty conditions accelerate bedding freshness decay
- **Bedding quality affects cleanliness:** Poor bedding makes cleaning less effective
- **Water availability affects all needs:** Empty water bottle impacts multiple needs
- **Compound effects:** Multiple poor conditions create cascading negative effects

## Notification & Alert System

### Habitat Condition Alerts
- **Threshold-based notifications:** Alerts when conditions drop below acceptable levels
- **Proactive warnings:** Early notifications before conditions become critical
- **Resource depletion alerts:** Warnings when bedding supplies run low
- **Maintenance reminders:** Suggestions for optimal habitat care timing

### Player Guidance
- **Care suggestions:** Contextual advice for improving habitat conditions
- **Resource management tips:** Help optimize bedding usage and costs
- **Priority guidance:** Indicate which conditions need immediate attention
- **Progress feedback:** Show improvement results from maintenance actions

## Technical Implementation

### Store State Structure
```typescript
interface HabitatConditionsState {
  // Core conditions (0-100)
  cleanliness: number
  beddingFreshness: number
  waterLevel: number

  // Tracking and history
  lastCleaningTime: number
  lastBeddingRefresh: number
  lastWaterRefill: number
  conditionHistory: HabitatSnapshot[]

  // Resource management
  beddingInventory: number
  beddingType: string
  consumptionRates: ConsumptionData

  // Alerts and notifications
  activeAlerts: HabitatAlert[]
  notificationSettings: AlertPreferences
}

interface HabitatSnapshot {
  timestamp: number
  cleanliness: number
  beddingFreshness: number
  waterLevel: number
}
```

### Condition Update Logic
- **Time-based decay:** Gradual deterioration based on elapsed time
- **Activity-based changes:** Rapid changes from guinea pig actions
- **Maintenance actions:** Player interventions that improve conditions
- **Resource consumption:** Automatic resource depletion tracking

## Game Loop Integration

### Tick-Based Updates
- **Synchronized decay:** Condition updates aligned with main game tick
- **Predictable deterioration:** Consistent and balanced condition changes
- **Performance optimization:** Efficient batch processing of condition updates
- **State persistence:** Reliable saving and loading of condition states

### Event-Driven Changes
- **Immediate updates:** Player actions cause instant condition changes
- **Guinea pig actions:** Autonomous behaviors affect conditions in real-time
- **Environmental events:** Special situations that impact habitat conditions
- **Maintenance completion:** Instant improvements from care actions

## Maintenance Action System

### Cleaning Cage Action
- **Full cleanliness restoration:** Reset cleanliness to 100%
- **Poop removal:** Clear all accumulated waste from habitat
- **Time requirement:** Reasonable action duration for realism
- **Player satisfaction:** Immediate visible improvement feedback

### Bedding Refresh Action
- **Resource consumption:** Use bedding from inventory
- **Freshness restoration:** Reset bedding freshness based on bedding type
- **Type selection:** Different bedding types offer different benefits
- **Economic decision:** Balance cost vs longevity vs guinea pig preferences

### Water Refill Action
- **Free restoration:** No resource cost for water refills
- **Instant action:** Quick and easy maintenance task
- **Always available:** No inventory or resource constraints
- **Habit building:** Encourage regular water maintenance routine

## Debug Integration

### Development Tools
- **Condition manipulation:** Direct editing of habitat condition values
- **Decay rate testing:** Adjust and test different deterioration speeds
- **Resource simulation:** Test different bedding types and consumption rates
- **Alert testing:** Verify notification triggers and timing

### Analytics & Monitoring
- **Player behavior tracking:** Monitor habitat maintenance patterns
- **Condition balance validation:** Ensure appropriate difficulty and progression
- **Resource usage analysis:** Optimize bedding costs and availability
- **Performance monitoring:** Track system efficiency and optimization opportunities

## Integration Points

### Needs System Connection
- **Direct need effects:** Habitat conditions influence guinea pig needs
- **Wellness calculation input:** Poor conditions contribute to wellness penalties
- **Threshold coordination:** Align habitat alerts with needs system warnings
- **Recovery benefits:** Good conditions support needs system recovery

### Economic System Integration
- **Store system connection:** Bedding purchases through inventory/store
- **Currency impact:** Habitat maintenance affects player economy
- **Budget pressure:** Creates ongoing resource management gameplay
- **Value optimization:** Players learn to balance cost vs effectiveness

### UI Component Integration
- **HabitatStatusDisplay:** Real-time condition visualization
- **ResourceCounter:** Bedding inventory management
- **AlertSystem:** Maintenance notifications and warnings
- **ActionButtons:** Direct habitat maintenance controls

## Future Enhancements
- **Advanced bedding types:** More variety in materials and effects
- **Environmental factors:** Temperature, humidity, lighting effects
- **Automatic maintenance systems:** Upgradeable improvements reducing maintenance burden
- **Habitat themes:** Different visual environments with unique maintenance requirements
- **Seasonal effects:** Environmental changes affecting habitat condition decay rates