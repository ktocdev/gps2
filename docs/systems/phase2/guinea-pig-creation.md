# Guinea Pig Creation System - System 5

**Phase 2: Core Game Entities & State**

## Overview
Game intro screen providing guinea pig customization, hidden preference generation, and tutorial integration for new players.

## Core Functionality

### Guinea Pig Customization Options
- **Name input field** with validation and character limits
- **Gender selection** (sow or boar) with visual indicators
- **Coat type selection** from available varieties with preview images
- **Birthdate picker** for age calculation and personality development
- **"Set Random" button** for automatic generation of all properties

## Hidden Preference Generation

### Food Preferences
- **Random assignment** of food preferences for hay, vegetables, and fruits
- **One preferred and one disliked** item per food category
- **Balanced distribution** to ensure interesting gameplay variety
- **Preferences stored privately** - not displayed to player during creation

### Activity & Interaction Preferences
- **Random assignment** of activity and interaction preferences
- **Play style preferences** (gentle vs energetic interactions)
- **Toy preferences** and environmental enrichment preferences
- **Social interaction preferences** (cuddling, talking, singing)

### Preference System Integration
- **Preferences generated at creation** but discovered through gameplay
- **Discovery mechanics** reward player experimentation
- **Preference effects** influence happiness and friendship bonuses
- **Individual personality** emerges through player interactions

## Form Validation & User Experience

### Input Validation
- **Name requirements:** Character limits, appropriate content filtering
- **Date validation:** Reasonable birthdate ranges, age calculations
- **Required field checking** with clear error messaging
- **Real-time validation feedback** for better user experience

### Confirmation Process
- **Preview screen** showing all selected options
- **"Start Game" confirmation** with final review
- **Data persistence** preparation before entering main game
- **Tutorial preference reminder** based on global settings

## New Game Tips & Onboarding

### Welcome & Orientation
- **Welcome message** explaining basic game concept
- **Getting started tips** covering essential gameplay elements:
  - Watch needs bars and respond to guinea pig needs
  - Interact with guinea pig to build friendship
  - Keep cage clean and maintain habitat conditions
- **Expectation setting** about preference discovery and relationship building

### Tutorial System Integration

#### Tutorial Mode Respect
- **Global tutorial preferences** from Game Controller Store
- **'auto' mode:** Shows tutorials only for genuinely first-time users
- **'always_show' mode:** Displays all tutorial content regardless of experience
- **'never_show' mode:** Skips all tutorial content completely

#### Tutorial Persistence
- **Tutorial controls persist** across different guinea pig creations
- **User preference memory** maintains consistent experience
- **Override capabilities** for testing and demonstration purposes
- **First-time user detection** tracks across all game sessions

### Guided First Interactions
- **Tips on building friendship** through positive interactions
- **Guided first interactions** when tutorials are enabled
- **Preference discovery hints** without spoiling the discovery process
- **Gentle introduction** to core game mechanics

## Integration Points

### Game Controller Store Connection
- **State transition** from 'intro' to 'playing' after creation
- **Tutorial preference synchronization** with global settings
- **First-time user detection** and tracking
- **Save data initialization** for new guinea pig

### Guinea Pig Store Integration
- **Entity creation** with all customized properties
- **Preference generation** and storage in guinea pig data
- **Initial stats setup** based on selected characteristics
- **Logging integration** for creation events

### Activity Feed Integration
- **Creation event logging** for activity history
- **First interaction messages** welcoming new guinea pig
- **Tutorial message integration** when appropriate
- **Onboarding activity messages** for guided experience

## Technical Implementation

### Form Architecture
- **Vue 3 Composition API** with reactive form state
- **TypeScript interfaces** for form data validation
- **FormModal component** from Layout Framework
- **Responsive design** adapting to different screen sizes

### Data Flow
1. **User Input Collection** → Form validation and sanitization
2. **Preference Generation** → Random assignment with balance checks
3. **Data Validation** → Final validation before store creation
4. **Store Creation** → Guinea Pig Store initialization
5. **Game Transition** → State change to 'playing' mode

### Performance Considerations
- **Lazy loading** of coat type images and previews
- **Efficient preference generation** algorithms
- **Minimal re-renders** during form interaction
- **Fast transition** to main game after creation

## Future Enhancements
- **Advanced customization options** (coat patterns, special traits)
- **Import/export guinea pig profiles** for sharing
- **Breeding system integration** with inherited traits
- **Community features** for sharing created guinea pigs