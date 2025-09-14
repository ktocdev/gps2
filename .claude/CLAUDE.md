# GPS2 Project Guidelines

## File Formatting Rules

1. **Always add a newline at the end of files** - Every file must end with a single newline character to follow Unix conventions and avoid git warnings.

## Code Style & Conventions

### Vue Components
- Use `<script setup lang="ts">` syntax for all Vue components
- Keep templates clean and readable
- Use composition API patterns consistently
- **Create reusable components** for all UI elements (buttons, toggles, checkboxes, inputs, progress bars, etc.)
- Place reusable components in `src/components/` directory
- Use consistent prop interfaces and emit patterns across components

### TypeScript
- Follow strict TypeScript settings configured in tsconfig files
- Use explicit types where beneficial for readability
- Leverage Vue 3 + TypeScript integration

### File Organization
- Place views in `src/views/`
- Use PascalCase for component file names
- Keep router configuration in `src/router/index.ts`

## Folder Organization Strategy

### Core Principle
**Organize by function, not file type.** As files accumulate, group related functionality together rather than separating by technical file type.

### Component Organization (`src/components/`)

**Start Simple:** Initially place all components directly in `src/components/`

**Reorganize When Needed:** When you have 8-10+ components, organize into functional folders:

- **`/basic/`** - Reusable form and UI elements
  - `Button.vue`, `Input.vue`, `Toggle.vue`, `ProgressBar.vue`, `Modal.vue`
- **`/game/`** - Game-specific components
  - `NeedBar.vue`, `ActivityFeed.vue`, `GuineaPigSprite.vue`, `FriendshipMeter.vue`
  - `PreferenceTracker.vue`, `HabitatStatusDisplay.vue`, `StatsDisplay.vue`
- **`/layout/`** - Layout and navigation components
  - `NavigationHeader.vue`, `BottomMenu.vue`, `SidePanel.vue`, `PageHeader.vue`
- **`/debug/`** - Development and debugging components
  - `DebugPanel.vue`, `ValueAdjuster.vue`, `LogViewer.vue`, `FeatureToggle.vue`

### Store Organization (`src/stores/`)

- **`/core/`** - Essential game state
  - `gameController.ts`, `guineaPig.ts`, `needs.ts`
- **`/systems/`** - Feature-specific stores
  - `habitat.ts`, `inventory.ts`, `interactions.ts`, `autonomy.ts`
- **`/ui/`** - UI and user preferences
  - `settings.ts`, `debug.ts`, `achievements.ts`

### Composable Organization (`src/composables/`)

- **`/game/`** - Core game logic
  - `useNeeds.ts`, `useWellness.ts`, `usePreferences.ts`, `useFriendship.ts`
- **`/ui/`** - UI utilities
  - `useModal.ts`, `useTooltip.ts`, `useResponsive.ts`, `useNotifications.ts`
- **`/data/`** - Data management
  - `useStorage.ts`, `useLogging.ts`, `useActivityFeed.ts`

### Reorganization Guidelines

1. **File Count Threshold:** When any folder contains 8-10+ files, consider subdividing
2. **Function-Based Grouping:** Group files that work together or serve similar purposes
3. **Update Imports:** Use find-and-replace to update import paths when reorganizing
4. **Document Changes:** Note major reorganization decisions in commit messages
5. **Consistent Naming:** Use consistent folder names across components/stores/composables

### Example Evolution

**Phase 1 (Simple):**
```
src/components/
  ├── Button.vue
  ├── Modal.vue
  ├── NeedBar.vue
  └── ActivityFeed.vue
```

**Phase 2 (Organized):**
```
src/components/
  ├── basic/
  │   ├── Button.vue
  │   └── Modal.vue
  └── game/
      ├── NeedBar.vue
      └── ActivityFeed.vue
```

### State Management
- Use Pinia for global state management
- Use composables for reusable logic
- Enable persistence for state that should survive page refreshes

### CSS & Styling
- **Mobile-first responsive design** - Start with mobile breakpoints and scale up
- **BEM methodology** - Use Block__Element--Modifier naming convention for CSS classes
- **CSS Variables** - Create reusable CSS custom properties in `src/styles/variables.css`
- **Theming system** - Design variables for easy theming with dark mode and light mode support
- **No scoped styles** - Always use global CSS with BEM naming to maintain consistency and reusability
- **Consistent naming** - Follow BEM conventions: `.game-board`, `.game-board__cell`, `.game-board__cell--active`
- **Container Queries** - Use `@container` for component-specific responsive design, enabling context-aware layouts that respond to container size rather than viewport
- **Container Types** - Set `container-type: inline-size` for width-based queries, `size` for both dimensions
- **Naming Convention** - Use descriptive container names: `text-panel`, `habitat-container`, `layout-region`

## Build & Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes TypeScript checking)
- `npm run preview` - Preview production build locally

### Quality Checks
- Always run `npm run build` to verify TypeScript compilation
- Ensure all files pass linting before commits

## Documentation Structure

The project uses an organized documentation system for maintainability:

### Primary Documentation Files
- **PROJECT_PLAN.md** - Master overview with navigation links to all systems
- **DEVELOPMENT_PHASES.md** - Implementation roadmap and phase summaries
- **SYSTEM_INTEGRATION.md** - Architecture, dependencies, and data flow details

### Documentation Directories
- **docs/systems/** - Detailed system specifications organized by development phase
  - **phase1/** - Foundation systems (Game Controller, Layout Framework, Logging, Debug)
  - **phase2/** - Core entities and timing (Guinea Pig, Needs, Habitat, Game Loop)
  - **phase3/** - Game world and environment (Items, Inventory, Maintenance)
  - **phase4/** - Interactions and behaviors (Player interactions, AI)
  - **phase5/** - Polish and enhancements (Achievements, Sound, Animation)
- **docs/game-design/** - Core mechanics and design philosophy
  - **wellness-system.md** - Hidden wellness calculation and friendship penalties
  - **happiness-mechanics.md** - Entertainment system preventing boredom
  - **preferences-system.md** - Individual guinea pig personality through discovery
  - **habitat-conditions.md** - Environmental management separate from needs
  - **activity-feed-design.md** - Text-based communication before animations
- **docs/technical/** - Technical considerations and guides (planned)

### Using the Documentation
- Start with **PROJECT_PLAN.md** for overview and navigation
- Use **phase-specific files** for detailed system implementation
- Reference **game-design files** for understanding core mechanics
- Check **SYSTEM_INTEGRATION.md** for architecture and dependencies
- Follow **DEVELOPMENT_PHASES.md** for implementation sequence

### Maintaining Documentation
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep PROJECT_PLAN.md navigation links current
- Document architectural decisions in appropriate system files