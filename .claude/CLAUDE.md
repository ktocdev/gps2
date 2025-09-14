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

## Build & Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes TypeScript checking)
- `npm run preview` - Preview production build locally

### Quality Checks
- Always run `npm run build` to verify TypeScript compilation
- Ensure all files pass linting before commits