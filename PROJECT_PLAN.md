# Guinea Pig Simulation Game - Framework Plan

## Phase 1: Foundation & Infrastructure
1. **Game Controller Store (Pinia)**
   - Game state (intro, playing, paused, stopped)
   - Save/load game functionality with browser persistence
   - New game functionality with data reset
   - Auto-save and auto-load on browser open
   - Settings management foundation (expandable structure for all game preferences)
   - Initial settings: basic game preferences only (theme selection added after CSS Framework)
   - Game session tracking (play time, statistics)

2. **CSS Styling Framework**
   - BEM methodology for consistent class naming
   - CSS custom properties in `src/styles/variables.css`
   - Theming system with dark mode and light mode support
   - Theme selection integration with Game Controller Store settings
   - Mobile-first breakpoint strategy
   - Global CSS only (no scoped styles) for consistency and reusability
   - Reusable design tokens for colors, spacing, typography

3. **Reusable Component Library**
   - Custom reusable components for all UI elements
   - **Basic Form Components:** Button, Toggle, Checkbox, Input, ProgressBar, Slider, Dropdown/Select, DatePicker, RadioButton, TextArea
   - **Game-Specific Components:**
     - NeedBar (displays individual need with value/color/label)
     - StatsDisplay (guinea pig info card with name, age, gender, coat)
     - GridCell (habitat grid individual cell component)
     - GridContainer (habitat grid layout container)
     - HabitatItem (draggable/placeable items like food dish, water bottle)
     - MenuCard (interaction menu panels with icons and labels)
     - StatusIndicator (behavior indicators, cleanliness status)
     - CurrencyDisplay (coins/money display with icon)
     - ItemCard (inventory/store item with image, price, description)
     - ActionButton (interaction buttons with cooldown states)
     - FriendshipMeter (displays friendship level with visual indicator)
     - Timer (countdown/elapsed time display)
     - NotificationBadge (alerts and count indicators)
     - AchievementCard (achievement display with progress)
     - TooltipWrapper (hover/touch information popups)
     - LoadingSpinner (async operation indicator)
     - ErrorMessage (error display with retry options)
     - GuineaPigSprite (animated guinea pig visual representation)
   - **Layout Components:**
     - NavigationHeader (persistent header with play/pause, new game)
     - BottomMenu (touch-friendly bottom interaction area)
     - SidePanel (inventory/store sliding panels)
     - FloatingMenu (context menus for interactions)
     - TabContainer (tabbed interface for settings/menus)
     - Accordion (collapsible content sections)
     - PageHeader (screen titles with back navigation)
   - **Modal System:**
     - Modal (base modal component)
     - ConfirmationModal ("Start New Game" warning, etc.)
     - FormModal (guinea pig creation form)
     - TutorialModal (onboarding and tip displays)
     - SettingsModal (preferences and configuration)
     - InfoModal (help text and game information)
   - **Debug Components:**
     - DebugPanel (collapsible debug interface)
     - NeedControl (individual need manipulation controls)
     - LogViewer (scrollable log display)
     - ValueAdjuster (debug slider/input for numeric values)
     - FeatureToggle (enable/disable feature flags for testing)
   - Consistent prop interfaces and TypeScript definitions
   - Component documentation and usage examples
   - Theming integration with CSS variables
   - Built with responsive design principles

4. **Responsive Design System & UI Framework**
   - Mobile-first responsive layout design
   - Touch-optimized interactions for mobile devices
   - Desktop-enhanced features and larger interaction areas
   - Adaptive UI scaling for different screen sizes
   - Context-aware menus and interfaces
   - Cross-platform compatibility (iOS, Android, desktop browsers)
   - **Complete Game UI Structure with Placeholders:**
     - Game intro screen with guinea pig creation form placeholders
     - Navigation header with play/pause and new game button placeholders
     - Guinea pig stats display area (name, gender, coat, age placeholders)
     - Needs bars/indicators with placeholder data
     - Main habitat grid container with responsive sizing and placeholder guinea pig
     - Bottom interaction menu area (touch-friendly) with placeholder buttons
     - Inventory interface placeholders
     - Store interface placeholders
     - Direct interaction menu placeholders
     - Cage maintenance interaction menu placeholders
     - Guinea pig behavior indicators placeholders
     - Cage cleanliness status placeholders
     - Modal overlay structure for all popups
     - Responsive breakpoints for tablet and desktop layouts
   - **UI Implementation Strategy:**
     - Build complete visual framework using Reusable Component Library
     - Connect real data/functionality as systems are implemented
     - Maintain consistent styling and interaction patterns throughout

5. **Logging System**
   - Action logs for needs changes
   - Game events history
   - Debug logging capabilities
   - Centralized logging service for all game systems
   - Log level filtering (debug, info, warn, error)
   - Integration hooks for all stores and systems

6. **Debug Menu System**
   - Development-only debug interface
   - Individual need controls:
     - Reset each need to 100% button
     - Adjust decay rate for each need (slider/input)
     - Enable/disable individual needs (toggle switches)
   - Game state debugging:
     - View all current need values
     - Monitor need decay rates in real-time
     - Access to logging output display
   - Only available in development builds
   - Toggle visibility with keyboard shortcut

## Phase 2: Core Game Entities & State
7. **Guinea Pig Creation System**
   - Game intro screen with creation form
   - Guinea pig customization options:
     - Name input field
     - Gender selection (sow or boar)
     - Coat type selection
     - Birthdate picker
   - "Set Random" button for automatic generation
   - Form validation and confirmation
   - **New Game Tips & Onboarding:**
     - Welcome message and basic game concept explanation
     - Getting started tips (watch needs bars, interact with guinea pig, keep cage clean)
     - First-time user tutorial highlighting key UI elements
     - Tips on building friendship through positive interactions
     - Optional tutorial mode for guided first interactions
   - Logging integration for creation events

8. **Guinea Pig Store (Pinia)**
   - Guinea pig entity with customizable properties (name, gender, coat, birthdate)
   - Core stats/needs structure
   - Age calculation based on birthdate
   - Persistence configuration
   - Logging integration for state changes

9. **Needs System Architecture**
   - Base Need class/interface with decay rates
   - Need categories (hunger, thirst, happiness, cleanliness, health, energy, social)
   - Need value ranges (0-100 scale) with critical thresholds (0-25%, 25-50%, etc.)
   - Variable decay rates based on guinea pig age and health
   - Need interdependencies (low health affects other needs)
   - **Friendship System Integration:**
     - Friendship level (0-100) that only increases through positive interactions
     - Higher friendship unlocks new user interactions and items
     - Friendship influences guinea pig autonomous behavior and reactions
     - Friendship affects need satisfaction rates (higher friendship = more effective interactions)
   - Seasonal/time-based need variations
   - Debug interface integration for need manipulation
   - Logging integration for need changes

10. **Needs Controller Store (Pinia)**
    - Central needs management
    - Batch processing all needs decay
    - Need state change notifications
    - Critical need alerts/warnings
    - Debug menu integration for need control
    - Logging integration for need processing events

11. **Interval Management System**
    - Main game tick (every 1-5 seconds)
    - Multiple interval speeds for different systems
    - Pause/resume functionality
    - Background tab handling
    - Logging integration for timing events

12. **Game Loop Integration**
    - Connect needs system with timing
    - Synchronize needs decay with game tick
    - Performance optimization for continuous operation
    - Logging integration for system integration events

## Phase 3: Game World & Environment
13. **Habitat Item System**
    - Grid-based habitat layout for item placement (drag & drop)
    - Item interaction system (guinea pig automatically uses items)
    - Default habitat items: water bottle, food dish, hay rack, small shelter, small chew
    - Item effectiveness on different needs with quality/durability system
    - Item wear and replacement needs
    - Special items unlock based on guinea pig age/achievements
    - Item positioning affects effectiveness (water near food, etc.)
    - Logging integration for item interactions

14. **Inventory & Store System**
    - Player inventory for owned items
    - Store with purchasable items and currency system
    - Currency earning through guinea pig care and achievements
    - Daily rewards and milestone bonuses
    - Item categories: food, toys, shelter, decoration, treats
    - Item rarity system (common, rare, premium)
    - Limited-time offers and seasonal items
    - Item management (buy, place, remove, sell back)
    - Logging integration for inventory and purchase events

15. **Cage Hygiene & Maintenance System**
    - Poop system with grid-based placement and accumulation tracking
    - Cage cleanliness affecting guinea pig needs
    - Click/touch poop removal interaction
    - Cage interaction menu with maintenance options:
      - Clean Cage (removes all poops)
      - Refresh Water (refills water bottle)
      - Auto Place Food (automatically places food in dish)
    - Logging integration for hygiene events

## Phase 4: Interactions & Behaviors
16. **Direct Interaction System**
    - User-to-guinea-pig interactions via click/touch menu
    - **Basic Interactions:** pet, clip nails, hold, brush, use pet wipe, hand feed
    - **Communication Interactions:** talk to, sing to, whistle to, call name, make kissing sounds
    - **Play Interactions:** play peek-a-boo, wave hand, show toy, gentle tickle, nose boop
    - **Care Interactions:** check health, weigh, massage, examine ears, gentle stretches
    - **Training Interactions:** teach trick, practice command, reward with treat, clicker training
    - **Bonding Interactions:** share snack, read to guinea pig, show photo, gentle humming
    - **Friendship-Gated Advanced Interactions:**
      - High friendship: teach advanced tricks, special cuddle time, guinea pig "conversations"
      - Maximum friendship: guinea pig responds to specific calls, performs learned behaviors on command
    - Interaction effects on specific needs
    - **Friendship Integration:**
      - All positive interactions increase friendship level
      - Friendship level unlocks advanced interactions (special treats, training, tricks)
      - Higher friendship increases interaction effectiveness
      - Friendship-gated premium interactions for bonded guinea pigs
    - Need satisfaction logic (guinea pig won't accept actions if need is already full)
    - Cooldown system for interactions
    - Logging integration for interaction events

17. **Guinea Pig Autonomy System**
    - Autonomous behavior triggered by need thresholds
    - Pathfinding and movement to habitat items
    - Autonomous actions: walk to food/water, hide in shelter, sleep, use items
    - AI decision making based on current need priorities
    - **Friendship-Influenced Behaviors:**
      - Higher friendship = more active and playful behaviors
      - Low friendship = more hiding, skittish reactions to user clicks
      - Friendship affects guinea pig's willingness to approach user interactions
      - High friendship enables spontaneous "showing off" behaviors
    - Need satisfaction logic (won't use items if corresponding need is already full)
    - Intermittent poop dropping while moving around cage
    - Animation and visual feedback for autonomous behaviors
    - Logging integration for autonomy and AI decision events

## Phase 5: Polish & Enhancement
18. **Achievement & Progression System**
    - Achievement tracking for various milestones
    - Guinea pig care achievements (feed X times, clean cage daily)
    - Collection achievements (own all items, unlock all coat colors)
    - Time-based achievements (play for X days straight)
    - Achievement rewards (currency, special items, new features)
    - Progress tracking and statistics
    - Achievement notifications and celebration animations
    - Logging integration for achievement events

19. **Sound System**
    - Audio manager for game sound effects
    - Click/touch interaction sound feedback
    - Guinea pig action sounds (eating, drinking, moving)
    - UI interaction sounds (button clicks, menu opens)
    - Background ambient sounds (optional)
    - Volume controls and mute functionality
    - Audio file optimization for web delivery
    - Logging integration for audio events

20. **Settings & Preferences Enhancement**
    - Expand settings as new features are added:
      - Sound settings (master volume, effects, music) - added with Sound System
      - Notification preferences - added with Achievement System
      - Auto-pause when tab inactive - added with Game Controller
      - Performance settings (animation quality, effects) - added with animations
      - Data export/import functionality - added when persistence is mature
    - Advanced preference categories and organization
    - Settings search and categorization for large option sets

## Recommended Development Order:

### Phase 1: Foundation & Infrastructure (Systems 1-6)
1. **Game Controller Store** - Central control system with save/load
2. **CSS Styling Framework** - Establish design system and theming foundation
3. **Reusable Component Library** - Base UI components including modal system
4. **Responsive Design System & UI Framework** - Complete game UI using components
5. **Logging System** - Centralized logging service for all systems (implement early!)
6. **Debug Menu System** - Development debugging tools (implement early for testing needs!)

### Phase 2: Core Game Entities & Timing (Systems 7-12)
7. **Guinea Pig Creation System** - Intro screen (connect to existing UI placeholders)
8. **Guinea Pig Store** - Entity management (connect to stats display placeholders)
9. **Needs System Architecture** - Core game mechanics (connect to needs bars and debug menu)
10. **Needs Controller Store** - Centralized need processing (connect to live needs display and debug controls)
11. **Interval Management System** - Game timing that drives needs decay
12. **Game Loop Integration** - Connect needs system with timing for core functionality

### Phase 3: Game World & Environment (Systems 13-15)
13. **Habitat Item System** - Item placement (connect to habitat grid placeholders)
14. **Inventory & Store System** - Item management (connect to inventory/store UI placeholders)
15. **Cage Hygiene & Maintenance System** - Poop system (connect to maintenance menu placeholders)

### Phase 4: Interactions & Behaviors (Systems 16-17)
16. **Direct Interaction System** - User-guinea pig interactions (connect to interaction menu placeholders)
17. **Guinea Pig Autonomy System** - AI behavior and pathfinding (connect to behavior indicator placeholders)

### Phase 5: Polish & Enhancement (Systems 18-20)
18. **Achievement & Progression System** - Milestone tracking and rewards
19. **Sound System** - Audio manager and interaction sound feedback
20. **Settings & Preferences System** - User preferences and customization

## Key Technical Considerations:
- Use `setInterval` with proper cleanup for game loops
- Implement efficient batch processing for multiple needs
- Design for extensibility (easy to add new needs/features)
- Use TypeScript interfaces for strong typing
- Consider performance with frequent state updates
- Implement pathfinding algorithm for guinea pig movement (A* or simple grid-based)
- Design behavior decision tree for autonomous actions
- Optimize animations for smooth guinea pig movement (CSS transforms/transitions)
- Mobile-first responsive design with touch interactions
- Ensure play/pause button is always accessible and visible
- Optimize for both mobile engagement and desktop robustness
- Consider PWA (Progressive Web App) features for mobile installation
- Implement audio context management for cross-browser compatibility
- Handle audio autoplay policies on mobile browsers
- State persistence strategy (localStorage vs IndexedDB for large data)
- Implement proper error boundaries and graceful degradation
- Consider WebGL/Canvas for habitat rendering if performance needed

## Gameplay Enhancement Ideas:
- **Guinea Pig Personality System:** Different personalities affect need priorities and behaviors
- **Seasonal Events:** Special items, decorations, and challenges during holidays
- **Multiple Guinea Pigs:** Allow caring for multiple pets with social interactions
- **Photo Mode:** Take and save pictures of your guinea pig in different poses
- **Daily Challenges:** Special tasks that reward extra currency/items
- **Guinea Pig Aging:** Visual changes and new needs as the pet grows older
- **Weather System:** Environmental changes that affect needs and available items
- **Mini-Games:** Interactive games with the guinea pig for bonding
- **Breeding System:** (Advanced) Raise baby guinea pigs with inherited traits
- **Community Features:** Share photos and compete in care challenges
- **Guinea Pig Genetics System:** Coat colors and patterns with inheritance mechanics
- **Habitat Themes:** Unlock different cage themes (forest, beach, winter, space)
- **Time Acceleration:** Speed up time when guinea pig is sleeping or content
- **Random Events:** Surprise visitors, lost toys, unexpected treats, vet visits
- **Guinea Pig Talents:** Special abilities that develop over time (acrobatics, singing, tricks)
- **Environmental Enrichment:** Interactive toys that provide cognitive stimulation
- **Health System:** Minor ailments that require specific care and vet visits
- **Guinea Pig Diary:** Auto-generated journal entries about daily activities
- **Customizable Sounds:** Record your own voice for guinea pig name calling
- **AR Mode:** (Advanced) Use device camera to place virtual guinea pig in real world
- **Seasonal Coat Changes:** Guinea pig appearance changes with seasons
- **Memory System:** Guinea pig remembers favorite foods, toys, and interaction spots
- **Social Media Integration:** Share achievements and photos to social platforms
- **Guinea Pig Olympics:** Compete in various guinea pig sports and activities

## Potential Conflicts Resolved:
- **FIXED:** Moved interval management from Game Controller to separate system
- **ENHANCED:** Added proper need interdependencies and thresholds
- **IMPROVED:** Made achievement system track meaningful gameplay milestones
- **CLARIFIED:** Separated settings from game controller for better organization