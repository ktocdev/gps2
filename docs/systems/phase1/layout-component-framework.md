# Unified Layout & Component Framework - System 2

**Phase 1: Foundation & Infrastructure**

## Overview
Combined development approach for Systems 2-4 with region-based construction, providing CSS foundation, component library, and responsive design system.

## CSS Styling Foundation

### Core Methodology
- **BEM methodology** for consistent class naming
- **CSS custom properties** in `src/styles/variables.css`
- **Theming system** with dark mode and light mode support
- **Mobile-first breakpoint strategy** with landscape mobile (768px+) foundation
- **Global CSS only** (no scoped styles) for consistency and reusability
- **Container Queries** for component-specific responsive design
- **Responsive layout regions** using CSS Grid/Flexbox

## Adaptive Navigation System

### Navigation Modes
- **Desktop/Tablet:** Full bottom navigation bar with complete controls
- **Mobile Landscape (height < 500px):** Bottom nav collapses into Floating Action Button (FAB)

### Mobile Landscape Layout Grid
- **Layout Grid:** Three-column layout with fixed top nav (50-60px height)
- **Left Navigation:** Fixed sidebar (~200px max width, 15% of screen)
- **Habitat Container:** Centered main content area (~60-65% of available width)
- **TextInfoPanel:** Right sidebar (~25-30% of width, 280px minimum for comfortable reading)
- **FAB Positioning:** Bottom-right corner between TextInfoPanel and habitat with 16px spacing
- **Container-Query Integration:** Components adapt based on their allocated container size

### FAB Implementation
- **FAB Implementation:** Bottom-right positioned, expandable to reveal nav controls
- **FAB Menu Options:** Radial menu, slide-up panel, or contextual overlay
- **Primary FAB Actions:** Most common interactions (interact with guinea pig, urgent needs)

## Region-Based Development Strategy

1. **Step 1:** Responsive layout framework foundation with OrientationModal
2. **Step 2:** Navigation regions (top nav, adaptive bottom nav/FAB)
3. **Step 3:** Core content regions (habitat grid, info panels, activity feed)
4. **Step 4:** Iterative component development as regions are populated

## Reusable Component Library

### Basic Form Components
Button, Toggle, Checkbox, Input, ProgressBar, Slider, Dropdown/Select, DatePicker, RadioButton, TextArea

### Game-Specific Components

#### Core Game Display
- **NeedBar** - displays individual need with value/color/label
- **HappinessIndicator** - specialized happiness display with boredom alerts and variety tracking
- **PreferenceTracker** - discovered preferences display with visual indicators
- **PreferenceLearningHint** - visual cues for newly discovered preferences
- **StatsDisplay** - guinea pig info card with name, age, gender, coat
- **FriendshipMeter** - displays friendship level with trend indicators, wellness penalty alerts

#### Activity & Information Display
- **ActivityFeed** - scrolling text-based activity stream with timestamps and filtering
- **TextInfoPanel** - container-query responsive text information display with activity feed, stats, and contextual actions
- **ActivityFeedStream** - enhanced activity feed with real-time updates, emoji graphics, and container-query sizing
- **QuickStatsCard** - compact stats summary for narrow layouts with responsive text sizing
- **ContextualActionSuggester** - displays context-aware action suggestions based on guinea pig state

#### Habitat & Interaction
- **GridCell** - habitat grid individual cell component
- **GridContainer** - habitat grid layout container with container-query responsive sizing
- **HabitatItem** - draggable/placeable items like food dish, water bottle
- **GuineaPigSprite** - guinea pig visual representation (starts as static emoji, later enhanced with animation system)
- **HabitatStatusDisplay** - cleanliness, bedding freshness, water level indicators

#### Selectors & Controls
- **FoodSelector** - component for selecting specific hay/vegetable/fruit types
- **BeddingTypeSelector** - interface for selecting bedding varieties
- **MenuCard** - interaction menu panels with icons and labels
- **ActionButton** - interaction buttons with cooldown states
- **InteractionCooldownDisplay** - shows when interactions are available again

#### Inventory & Store
- **ResourceCounter** - bedding inventory count with low-stock alerts
- **CurrencyDisplay** - coins/money display with icon
- **ItemCard** - inventory/store item with image, price, description
- **ItemRotationManager** - interface for managing item storage/rotation
- **MultiSelectGrid** - for selecting multiple items in store/inventory

#### Progress & Feedback
- **StatusIndicator** - behavior indicators, cleanliness status
- **ProgressIndicator** - friendship building, preference discovery progress tracking
- **Timer** - countdown/elapsed time display
- **NotificationBadge** - alerts and count indicators
- **AchievementCard** - achievement display with progress
- **TooltipWrapper** - hover/touch information popups
- **LoadingSpinner** - async operation indicator
- **ErrorMessage** - error display with retry options

### Layout Components
- **NavigationHeader** - persistent header with play/pause, new game
- **BottomMenu** - touch-friendly bottom interaction area (desktop/tablet)
- **FloatingActionButton** - FAB for adaptive bottom nav (mobile landscape)
- **FABMenu** - expandable controls overlay for constrained screens
- **SidePanel** - inventory/store sliding panels
- **FloatingMenu** - context menus for interactions
- **TabContainer** - tabbed interface for settings/menus
- **Accordion** - collapsible content sections
- **PageHeader** - screen titles with back navigation
- **LayoutRegionContainer** - container-query wrapper for major layout regions with responsive sizing

### Modal System
- **Modal** - base modal component
- **ConfirmationModal** - "Start New Game" warning, etc.
- **FormModal** - guinea pig creation form
- **TutorialModal** - onboarding and tip displays
- **SettingsModal** - preferences and configuration
- **InfoModal** - help text and game information
- **OrientationModal** - mobile portrait rotation prompt with game pause

### Debug Components
- **DebugPanel** - collapsible debug interface
- **NeedControl** - individual need manipulation controls
- **WellnessDebugger** - wellness calculation breakdown and penalty testing
- **HabitatDebugger** - habitat condition manipulation and testing controls
- **ResponsiveDetector** - service component for viewport monitoring
- **DeviceTypeIndicator** - debug component showing current device/orientation state
- **LogViewer** - scrollable log display
- **ValueAdjuster** - debug slider/input for numeric values
- **FeatureToggle** - enable/disable feature flags for testing

## Component Standards
- Consistent prop interfaces and TypeScript definitions
- Component documentation and usage examples
- Theming integration with CSS variables
- Built with responsive design principles

## Responsive Layout Controller

### Core Functionality
- Device type detection (mobile, tablet, desktop)
- Orientation monitoring (portrait, landscape) with throttled resize events
- Screen size tracking with performance optimization (100-200ms throttling)
- Breakpoint management and layout state updates
- Adaptive navigation switching (bottom nav ↔ FAB based on screen height)

### Container-Query Integration
- Container observation setup for major layout regions (habitat, text-panel, layout-region)
- Component-level responsive behavior coordination with global layout changes
- Performance-optimized container resize detection with debouncing
- Context-aware component sizing that responds to allocated container space rather than viewport

## Mobile Portrait Handling
- **OrientationModal takeover** for mobile portrait mode (< 768px width, height > width)
- **Automatic game pause** when orientation modal is active
- **Full-screen rotation prompt** with clear user instructions
- **Game resume** on landscape rotation (preserves manual pause state)

## Complete Game UI Structure with Placeholders

### Interface Layout
- Game intro screen with guinea pig creation form placeholders
- Navigation header with play/pause and new game button placeholders
- Guinea pig stats display area (name, gender, coat, age placeholders)
- Needs bars/indicators with placeholder data
- **Habitat status display area** (cleanliness, bedding freshness, water level)
- Main habitat grid container with container-query responsive sizing and placeholder guinea pig (emoji-based)
- **Activity feed panel** (sidebar or bottom area) for real-time text-based interactions

### Adaptive Interaction Areas
- **Desktop/Tablet:** Full bottom menu with complete interaction controls
- **Mobile Landscape (height < 500px):** Floating Action Button (FAB) with expandable menu

### Additional Interface Elements
- Inventory interface placeholders
- Store interface placeholders
- Direct interaction menu placeholders
- Cage maintenance interaction menu placeholders
- Guinea pig behavior indicators placeholders
- Cage cleanliness status placeholders
- Modal overlay structure for all popups
- Responsive breakpoints for tablet and desktop layouts

## UI Implementation Strategy
- Build complete visual framework using Reusable Component Library
- Connect real data/functionality as systems are implemented
- Maintain consistent styling and interaction patterns throughout

## Integration Points
- **Game Controller Store:** State management and responsive control
- **Logging System:** Activity feed display and debug logging
- **All Future Systems:** Provide UI components and responsive framework