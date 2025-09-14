# Guinea Pig Autonomy System

**Phase 4, System 16 - Interactions & Behaviors**

## Core System Overview

The Guinea Pig Autonomy System provides artificial intelligence-driven behavior for guinea pigs, creating realistic autonomous actions based on need thresholds, friendship levels, and environmental conditions. This system makes guinea pigs feel alive and responsive through intelligent decision-making, pathfinding, and natural behaviors.

## Autonomous Behavior Framework

### 1. Need-Based Behavior Triggers
Autonomous behaviors triggered automatically when specific need thresholds are reached:

#### High Priority Needs (0-30% threshold)
- **Hunger < 30%:** Walk to food dish, eat available food
- **Thirst < 25%:** Walk to water bottle, drink water
- **Health < 30%:** Seek shelter, rest behaviors, reduced activity

#### Medium Priority Needs (30-60% threshold)
- **Happiness < 50%:** Explore toys, use enrichment items
- **Energy < 40%:** Walk to sleeping area, rest, nap behaviors
- **Cleanliness < 45%:** Self-grooming behaviors, avoid dirty areas

#### Low Priority Needs (60-80% threshold)
- **Social < 70%:** Watch player, approach interaction areas
- **Happiness < 75%:** Investigate new items, explore environment

### 2. Pathfinding and Movement System
Intelligent movement around the habitat grid:

#### Basic Pathfinding
- **A* algorithm implementation** for efficient route calculation
- **Grid-based movement** between habitat positions
- **Obstacle avoidance** around items and habitat boundaries
- **Goal-oriented navigation** to specific habitat items

#### Movement Patterns
- **Direct paths** for urgent needs (hunger, thirst)
- **Exploratory wandering** when all needs are satisfied
- **Shelter-seeking** during low friendship or stress
- **Item investigation** for new or rotated habitat items

#### Static Visual Movement (Phase 4)
- **Guinea pig emoji moves between grid positions**
- **No animation initially** - position changes only
- **Clear visual feedback** for movement and destination
- **Preparation for future animation enhancement** in Phase 5

### 3. Autonomous Actions by Category

#### Survival Actions
- **Walk to Food/Water** - Navigate to essential need satisfaction items
- **Eat/Drink** - Automatic consumption when reaching food/water sources
- **Seek Shelter** - Hide in shelter items during stress or fear
- **Rest/Sleep** - Energy recovery in comfortable locations

#### Exploration Actions
- **Item Investigation** - Approach and examine new or interesting items
- **Habitat Exploration** - Wander around cage when content
- **Sniffing Behaviors** - Investigate changes in environment
- **Territory Patrol** - Regular movement around familiar areas

#### Comfort Actions
- **Self-Grooming** - Cleanliness maintenance behaviors
- **Stretching** - Comfort movements in safe spaces
- **Hiding** - Retreat to shelter during stress or fear
- **Sunbathing** - Rest in preferred habitat locations

## Friendship-Influenced Behavior System

### High Friendship Behaviors (70-100% friendship)
Positive, engaging behaviors that demonstrate strong bonding:

#### Spontaneous Positive Actions
- **Spontaneous Popcorn** - Random excitement displays
- **Zoomies** - Fast, playful running around cage
- **Watch Lovingly** - Sustained, relaxed gaze at player
- **Investigate Player Cursor** - Follow and respond to mouse/touch movements

#### Interactive Responses
- **Approach Player Interactions** - Move toward interaction opportunities
- **Excited Greeting Behaviors** - Show enthusiasm when player is active
- **Comfortable Stretching** - Relaxed postures indicating trust
- **Playful Exploration** - Confident investigation of new items

### Medium Friendship Behaviors (40-70% friendship)
Neutral to mildly positive interactions:

#### Cautious Engagement
- **Look at Player** - Acknowledge player presence without fear
- **Chirp Greetings** - Mild positive vocalizations
- **Comfortable Stretching** - Relaxed but not fully trusting postures
- **Curious Investigation** - Interest in player actions with some distance

#### Balanced Responses
- **Normal interaction acceptance** - Standard responsiveness to player actions
- **Moderate exploration** - Balanced between caution and curiosity
- **Regular activity patterns** - Normal need satisfaction behaviors

### Low Friendship Behaviors (0-40% friendship)
Defensive, fearful, or avoidant behaviors:

#### Avoidance Actions
- **Hide Behaviors** - Frequent retreats to shelter items
- **Avoid Eye Contact** - Turn away from player cursor/interactions
- **Freeze When Approached** - Motionless fear responses
- **Warning Reactions** - Defensive postures or sounds

#### Stress Indicators
- **Reduced exploration** - Limited movement around habitat
- **Shelter-seeking** - Preference for hiding spots
- **Cautious feeding** - Quick, nervous eating patterns
- **Minimal interaction acceptance** - Rejection of most player interactions

## AI Decision Making System

### Decision Priority Matrix
```typescript
interface BehaviorPriority {
  urgentNeeds: number;      // Weight: 100 (needs < 30%)
  moderateNeeds: number;    // Weight: 75  (needs 30-60%)
  friendshipBehaviors: number; // Weight: 50  (varies by friendship)
  exploration: number;      // Weight: 25  (when content)
  environmental: number;    // Weight: 40  (habitat conditions)
}
```

### Decision Algorithm
1. **Urgent Need Check** - Highest priority for critical needs
2. **Friendship State Assessment** - Determines interaction willingness
3. **Environmental Evaluation** - Habitat cleanliness and item availability
4. **Moderate Need Processing** - Secondary priority needs
5. **Exploration/Entertainment** - Lowest priority when all needs satisfied

### Behavior Selection Logic
- **Random factor** (10-20%) prevents completely predictable behavior
- **Cooldown systems** prevent repetitive action loops
- **State memory** maintains behavior context between decisions
- **Progressive behavior** builds on previous actions for continuity

## Need Satisfaction Logic

### Smart Need Management
- **Won't use items if corresponding need is already full**
- **Priority-based need selection** when multiple needs are low
- **Efficiency optimization** - shortest path to most beneficial items
- **Resource awareness** - recognizes when food/water is unavailable

### Cross-System Integration
- **Habitat condition awareness** - responds to cleanliness and freshness
- **Item availability detection** - adapts behavior to available resources
- **Player interaction consideration** - balances autonomous behavior with player actions
- **Wellness calculation impact** - behavior affects overall wellness rating

## Environmental Interaction

### Intermittent Poop Dropping
- **Realistic waste elimination** during movement and activity
- **Random timing** with biological authenticity
- **Location variability** - drops poop throughout habitat exploration
- **Habitat cleanliness impact** - contributes to environmental deterioration

### Habitat Item Usage
- **Intelligent item selection** based on need satisfaction potential
- **Item effectiveness recognition** - prefers items that better satisfy needs
- **Novelty attraction** - shows interest in new or recently rotated items
- **Comfort item preference** - develops attachment to familiar items

## Activity Feed Integration

### Autonomous Behavior Messages
Rich, descriptive text for all autonomous actions:

#### Movement and Navigation
- **"Guinea pig walks purposefully to the water bottle"**
- **"Guinea pig explores the habitat curiously"**
- **"Guinea pig investigates the new tunnel with interest"**
- **"Guinea pig retreats to the cozy shelter"**

#### Need Satisfaction
- **"Guinea pig munches contentedly on timothy hay"**
- **"Guinea pig drinks deeply from the water bottle"**
- **"Guinea pig grooms fur carefully"**
- **"Guinea pig stretches and settles down for a nap"**

#### Friendship-Based Behaviors
- **"Guinea pig does excited zoomies around the cage!"**
- **"Guinea pig watches you lovingly from the platform"**
- **"Guinea pig hides nervously in the shelter"**
- **"Guinea pig perks up hopefully when you approach"**

#### Environmental Interactions
- **"Guinea pig drops a poop near the hay rack"**
- **"Guinea pig sniffs the fresh bedding approvingly"**
- **"Guinea pig seems uncomfortable with the messy cage"**
- **"Guinea pig discovers the newly rotated toy setup"**

## Technical Implementation

### AI State Management
```typescript
interface AutonomyState {
  currentGoal: BehaviorGoal | null;
  pathToGoal: GridPosition[];
  lastDecisionTime: number;
  behaviorCooldowns: Map<BehaviorType, number>;
  explorationHistory: GridPosition[];
  preferredLocations: GridPosition[];
}

interface BehaviorGoal {
  type: 'satisfy_need' | 'explore' | 'friendship_behavior';
  target: GridPosition | HabitatItem;
  priority: number;
  estimatedDuration: number;
}
```

### Pathfinding Implementation
- **A* algorithm** with heuristic optimization for guinea pig movement
- **Grid-based navigation** with obstacle detection and avoidance
- **Path caching** for frequently used routes to improve performance
- **Dynamic path recalculation** when obstacles or goals change

### Performance Optimization
- **Decision throttling** - AI decisions every 2-5 seconds instead of every frame
- **Efficient pathfinding** - Cached routes and simplified calculations
- **Behavior prediction** - Pre-calculate likely next actions
- **Memory management** - Limited behavior history storage

## Store Integration

### Core Dependencies
- **Guinea Pig Store** - Friendship level, current position, reaction state
- **Needs Controller Store** - All need levels for decision making
- **Habitat Conditions Store** - Environmental factors affecting behavior
- **Habitat Item System** - Available items and their positions

### Data Flow
- **Need thresholds trigger autonomous behavior selection**
- **Friendship level modifies behavior probability and intensity**
- **Habitat conditions influence movement and comfort preferences**
- **Player interactions can interrupt or modify autonomous behaviors**

## Debug Integration

### Debug Menu Features
- **Behavior Decision Viewer** - Shows current AI decision process
- **Pathfinding Visualizer** - Displays planned routes and obstacles
- **Friendship Behavior Tester** - Simulate different friendship levels
- **Need Threshold Adjuster** - Test behavior triggers at various need levels
- **Behavior Override Controls** - Force specific autonomous actions

### Testing Tools
- **AI decision logging** - Track behavior selection reasoning
- **Performance monitoring** - Pathfinding and decision timing
- **Behavior pattern analysis** - Identify repetitive or unrealistic patterns
- **Cross-system integration testing** - Verify need satisfaction and habitat interaction

## Animation Integration (Future Phase 5)

### Animation System Preparation
Current system designed for seamless enhancement with future animation:

#### Movement Animation
- **Smooth pathfinding animation** using CSS transforms
- **Walking animation cycles** for movement between positions
- **Idle animation loops** for stationary behaviors
- **Sleeping animation** with breathing effects

#### Behavior Animation
- **Eating/drinking animations** with mouth movements
- **Grooming animation sequences** for self-care behaviors
- **Exploration animations** for investigation behaviors
- **Friendship-specific animations** for relationship expressions

## Gameplay Impact

### Player Engagement
- **Living pet experience** - Guinea pig feels alive and autonomous
- **Unpredictable behaviors** - Maintains long-term interest through variety
- **Friendship feedback** - Visible relationship progression through behavior changes
- **Care consequences** - Poor care results in visible behavior deterioration

### Educational Value
- **Realistic guinea pig behaviors** based on actual pet behaviors
- **Care responsibility** - Autonomous needs demonstrate proper pet care
- **Relationship building** - Shows importance of trust and bonding with pets
- **Environmental awareness** - Demonstrates impact of habitat quality on pet well-being

This system creates a convincing artificial intelligence that makes guinea pigs feel like genuine, living pets with personalities, needs, and relationship dynamics.