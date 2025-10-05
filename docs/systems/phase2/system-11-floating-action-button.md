# Floating Action Button & Pause State Management

**Phase:** Phase 2 (UI Components & UX Improvements)
**Status:** 📋 **Planned**
**Created:** October 5, 2025
**Branch:** TBD

---

## Overview

Create a reusable FloatingActionButton component and improve pause state management UX to prevent user confusion when needs processing stays paused after resuming the game.

### Problem Statement

**Current Issue:**
Two independent pause systems (Game Pause and Needs Processing Pause) can confuse users:
- User manually pauses needs processing to test something
- User pauses game to take a break
- User resumes game
- **Problem:** Needs processing stays paused (user may forget they manually paused it)
- Result: Game appears broken, needs don't decay, user confused

### Solution

**Design Philosophy:**
- Respect user control - don't auto-change what they explicitly set
- Provide clear visual feedback when something unexpected is happening
- Make it easy to fix with one click

**Approach:**
1. Track whether needs pause was user-initiated or automatic
2. Show prominent visual warning when game is active but needs are manually paused
3. Provide one-click resume via floating action button
4. Enhance debug panel to show pause type ("Manual" vs "Auto")

---

## Component Specification

### FloatingActionButton Component

**File:** `src/components/basic/FloatingActionButton.vue`

#### Props Interface

```typescript
interface Props {
  icon?: string              // Emoji or icon character (e.g., "▶️", "⚙️")
  label?: string             // Optional text label
  showLabel?: 'always' | 'hover' | 'never'  // Label visibility strategy
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean            // Attention-grabbing animation
  ariaLabel: string          // Required for accessibility (ARIA label)
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}
```

#### Default Values

```typescript
{
  showLabel: 'hover',
  variant: 'primary',
  position: 'bottom-right',
  size: 'md',
  pulse: false,
  disabled: false
}
```

#### BEM Class Structure

```css
/* Base */
.floating-action-button

/* Variants */
.floating-action-button--variant-primary
.floating-action-button--variant-secondary
.floating-action-button--variant-warning
.floating-action-button--variant-danger
.floating-action-button--variant-info

/* Positions */
.floating-action-button--position-bottom-right
.floating-action-button--position-bottom-left
.floating-action-button--position-top-right
.floating-action-button--position-top-left

/* Sizes */
.floating-action-button--size-sm
.floating-action-button--size-md
.floating-action-button--size-lg

/* States */
.floating-action-button--pulse
.floating-action-button--disabled

/* Elements */
.floating-action-button__icon
.floating-action-button__label
.floating-action-button__label--visible
```

#### Styling Requirements

**Fixed Positioning:**
```css
.floating-action-button {
  position: fixed;
  z-index: 1040; /* Below modals (1050), above regular content */

  /* Use logical properties for RTL support */
  /* Example for bottom-right: */
  inset-block-end: var(--space-6);
  inset-inline-end: var(--space-6);

  /* Safe area support for mobile */
  inset-block-end: max(var(--space-6), env(safe-area-inset-bottom));
  inset-inline-end: max(var(--space-6), env(safe-area-inset-right));
}
```

**Size Variants:**
```css
.floating-action-button--size-sm {
  inline-size: 48px;
  block-size: 48px;
  font-size: var(--font-size-lg);
}

.floating-action-button--size-md {
  inline-size: 56px;
  block-size: 56px;
  font-size: var(--font-size-xl);
}

.floating-action-button--size-lg {
  inline-size: 64px;
  block-size: 64px;
  font-size: var(--font-size-2xl);
}
```

**Color Variants:**
```css
.floating-action-button--variant-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-warning {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
}

.floating-action-button--variant-danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-info {
  background-color: var(--color-info);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
}
```

**Pulse Animation:**
```css
@keyframes floating-action-button-pulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 0 8px currentColor;
    opacity: 0.5;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
}

.floating-action-button--pulse::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: floating-action-button-pulse 2s infinite;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .floating-action-button--pulse::before {
    animation: none;
  }
}
```

**Label Behavior:**
```css
.floating-action-button__label {
  position: absolute;
  inset-inline-end: 100%;
  margin-inline-end: var(--space-3);
  background-color: var(--color-bg-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(8px);
  transition: all var(--transition-fast);
  pointer-events: none;
}

.floating-action-button:hover .floating-action-button__label,
.floating-action-button:focus-visible .floating-action-button__label {
  opacity: 1;
  transform: translateX(0);
}

.floating-action-button__label--visible {
  opacity: 1;
  transform: translateX(0);
}
```

**Mobile Responsive:**
```css
@media (max-width: 768px) {
  .floating-action-button--size-md {
    inline-size: 48px;
    block-size: 48px;
  }

  .floating-action-button--size-lg {
    inline-size: 56px;
    block-size: 56px;
  }

  /* Adjust spacing on mobile */
  .floating-action-button {
    inset-block-end: var(--space-4);
    inset-inline-end: var(--space-4);
  }
}

/* Touch devices - always show label if showLabel !== 'never' */
@media (hover: none) and (pointer: coarse) {
  .floating-action-button__label {
    opacity: 1;
    transform: translateX(0);
  }
}
```

#### Accessibility Requirements

1. **Keyboard Navigation:**
   - Button must be focusable via Tab key
   - Enter/Space to activate
   - Visible focus indicator

2. **ARIA Labels:**
   - `aria-label` prop is required
   - Describes current state and action
   - Example: "Resume needs processing - currently manually paused"

3. **Screen Reader Support:**
   - Announces button purpose
   - Announces state changes
   - Live region for dynamic updates (if applicable)

4. **Focus Management:**
   - Clear focus indicator (outline or ring)
   - Focus trap if modal behavior needed (future enhancement)

5. **Reduced Motion:**
   - Disable pulse animation when `prefers-reduced-motion: reduce`
   - Disable slide animations for label

6. **Touch Targets:**
   - Minimum 44x44px (WCAG AAA)
   - Adequate spacing from screen edges

#### Component Template

```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span v-if="icon" class="floating-action-button__icon">{{ icon }}</span>
    <span
      v-if="label && showLabel !== 'never'"
      :class="labelClasses"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  label?: string
  showLabel?: 'always' | 'hover' | 'never'
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  ariaLabel: string
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: 'hover',
  variant: 'primary',
  position: 'bottom-right',
  size: 'md',
  pulse: false,
  disabled: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const base = 'floating-action-button'
  const variant = `floating-action-button--variant-${props.variant}`
  const position = `floating-action-button--position-${props.position}`
  const size = `floating-action-button--size-${props.size}`
  const pulse = props.pulse ? 'floating-action-button--pulse' : ''
  const disabled = props.disabled ? 'floating-action-button--disabled' : ''

  return [base, variant, position, size, pulse, disabled].filter(Boolean).join(' ')
})

const labelClasses = computed(() => {
  const base = 'floating-action-button__label'
  const visible = props.showLabel === 'always' ? 'floating-action-button__label--visible' : ''
  return [base, visible].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

---

## Pause State Management Enhancement

### Needs Controller Updates

**File:** `src/stores/needsController.ts`

#### State Additions

```typescript
// Add to state
const manuallyPausedByUser = ref<boolean>(false)

// Add computed property
const isPausedManually = computed(() =>
  !processingEnabled.value && manuallyPausedByUser.value
)
```

#### Function Updates

**pauseProcessing():**
```typescript
function pauseProcessing(isManual: boolean = false): void {
  processingEnabled.value = false

  // Track if pause was user-initiated
  if (isManual) {
    manuallyPausedByUser.value = true
  }

  getLoggingStore().logActivity({
    category: 'system',
    action: 'needs_processing_paused',
    details: {
      timestamp: Date.now(),
      manual: isManual
    }
  })
}
```

**resumeProcessing():**
```typescript
function resumeProcessing(): void {
  processingEnabled.value = true
  manuallyPausedByUser.value = false  // Clear manual flag when resuming
  lastBatchUpdate.value = Date.now()

  // Reset needsLastUpdate timestamps to prevent accumulated time delta
  const guineaPigStore = useGuineaPigStore()
  const currentTime = Date.now()
  guineaPigStore.activeGuineaPigs.forEach(gp => {
    if (gp && gp.id) {
      guineaPigStore.needsLastUpdate[gp.id] = currentTime
    }
  })

  getLoggingStore().logActivity({
    category: 'system',
    action: 'needs_processing_resumed',
    details: { timestamp: Date.now() }
  })
}
```

#### Export Updates

```typescript
return {
  // ... existing exports
  manuallyPausedByUser,
  isPausedManually,
  pauseProcessing,  // Updated signature
  resumeProcessing,
  // ... rest
}
```

#### Persistence Updates

```typescript
}, {
  persist: {
    key: 'gps2-needs-controller',
    storage: localStorage,
    // Ensure manuallyPausedByUser is persisted
    paths: [
      'currentWellness',
      'wellnessHistory',
      'processingEnabled',
      'manuallyPausedByUser',  // Add this
      // ... other paths
    ]
  }
})
```

---

## UI Integration

### Needs Debug Panel Updates

**File:** `src/components/debug/NeedsDebug.vue`

#### Toggle Function Update

```typescript
const toggleNeedsProcessing = () => {
  if (needsController.processingEnabled) {
    // Pass true to indicate manual pause
    needsController.pauseProcessing(true)
  } else {
    needsController.resumeProcessing()
  }
}
```

#### Status Display Update

```vue
<div class="stat-item">
  <span class="stat-label">Processing:</span>
  <span
    v-if="needsController.isPausedManually"
    class="stat-value text--warning"
  >
    Paused (Manual) ⚠️
  </span>
  <span
    v-else-if="!needsController.processingEnabled"
    class="stat-value text--muted"
  >
    Paused (Auto)
  </span>
  <span
    v-else
    class="stat-value text--success"
  >
    Active ✓
  </span>
</div>
```

#### Button Tooltip Update

```vue
<Button
  @click="toggleNeedsProcessing"
  :variant="needsController.processingEnabled ? 'secondary' : 'primary'"
  full-width
  :disabled="gameController.isPaused"
  :tooltip="needsController.processingEnabled
    ? 'Pause needs processing (will stay paused when game resumes)'
    : 'Resume needs processing'"
  tooltip-position="top"
  class="needs-processing-button"
>
  {{ needsController.processingEnabled ? 'Pause' : 'Resume' }} Needs Processing
</Button>
```

### Main Game View Updates

**File:** `src/views/HomeView.vue`

#### Import Component

```vue
<script setup lang="ts">
import FloatingActionButton from '../components/basic/FloatingActionButton.vue'
import { useNeedsController } from '../stores/needsController'
import { useGameController } from '../stores/gameController'
import { computed } from 'vue'

const needsController = useNeedsController()
const gameController = useGameController()

// ... existing code
</script>
```

#### Add Computed Property

```typescript
const showNeedsPausedWarning = computed(() => {
  return gameController.isGameActive &&
         needsController.isPausedManually
})
```

#### Add to Template

```vue
<template>
  <div class="home-view">
    <!-- Existing game content -->

    <!-- Needs Paused Warning (only shows when needed) -->
    <FloatingActionButton
      v-if="showNeedsPausedWarning"
      icon="▶️"
      label="Resume Needs"
      show-label="hover"
      variant="warning"
      position="bottom-right"
      :pulse="true"
      aria-label="Resume needs processing - currently manually paused"
      @click="needsController.resumeProcessing()"
    />
  </div>
</template>
```

---

## User Flows

### Scenario 1: Manual Pause → Game Pause → Game Resume

**Steps:**
1. User clicks "Pause Needs Processing" in debug panel
   - `manuallyPausedByUser = true`
   - `processingEnabled = false`
   - Button shows "Resume Needs Processing"
   - Status shows "Paused (Manual) ⚠️"

2. User pauses game to take a break
   - Game state changes to 'paused'
   - Needs button becomes disabled
   - Tooltip shows "Pause needs processing (will stay paused when game resumes)"

3. User resumes game
   - Game state changes to 'playing'
   - Needs processing stays paused (respects user's manual setting)
   - **FloatingActionButton appears** on main view:
     - Shows "▶️ Resume Needs" with pulse animation
     - Warning variant (yellow/orange)
     - Bottom-right position

4. User clicks floating button
   - `needsController.resumeProcessing()` called
   - `manuallyPausedByUser = false`
   - `processingEnabled = true`
   - Floating button disappears
   - Needs decay resumes normally

**Expected Result:** User is clearly warned and can easily fix the situation with one click.

### Scenario 2: Game Pause → Game Resume (No Manual Pause)

**Steps:**
1. User pauses game
   - Game state changes to 'paused'
   - Needs processing continues (or pauses automatically by game system)

2. User resumes game
   - Game state changes to 'playing'
   - Needs processing resumes automatically
   - No floating button appears
   - No manual flag set

**Expected Result:** Normal operation, no warnings needed.

### Scenario 3: Manual Pause → Manual Resume in Debug Panel

**Steps:**
1. User manually pauses needs in debug panel
   - `manuallyPausedByUser = true`
   - Status shows "Paused (Manual) ⚠️"

2. User manually resumes in debug panel
   - `manuallyPausedByUser = false`
   - Status shows "Active ✓"

**Expected Result:** Manual flag cleared, normal operation.

### Scenario 4: Navigation Auto-Pause

**Steps:**
1. User navigates to debug view
   - Game auto-pauses with reason 'navigation'
   - Needs processing may auto-pause (controlled by game system)
   - No manual flag set (`isManual = false`)

2. User navigates back
   - Game auto-resumes
   - Needs auto-resume
   - No manual flag, no warnings

**Expected Result:** Automatic pause/resume doesn't trigger warnings.

---

## Testing Checklist

### Component Testing

- [ ] **Visual Rendering**
  - [ ] Renders in all 4 positions (bottom-right, bottom-left, top-right, top-left)
  - [ ] All size variants display correctly (sm, md, lg)
  - [ ] All color variants match design (primary, secondary, warning, danger, info)
  - [ ] Icon displays correctly
  - [ ] Label shows/hides based on `showLabel` prop

- [ ] **Animations**
  - [ ] Pulse animation works when `pulse={true}`
  - [ ] Label slides in on hover when `showLabel="hover"`
  - [ ] Transitions are smooth
  - [ ] Animations respect `prefers-reduced-motion`

- [ ] **Interactions**
  - [ ] Click event fires correctly
  - [ ] Disabled state prevents clicks
  - [ ] Keyboard navigation works (Tab, Enter, Space)
  - [ ] Focus indicator visible

- [ ] **Accessibility**
  - [ ] ARIA label present and descriptive
  - [ ] Screen reader announces correctly
  - [ ] Keyboard accessible
  - [ ] Minimum 44x44px touch target
  - [ ] Color contrast meets WCAG AA

- [ ] **Mobile/Responsive**
  - [ ] Sizes adjust on mobile
  - [ ] Safe area insets respected
  - [ ] Label behavior correct on touch devices
  - [ ] Works in portrait and landscape

### Integration Testing

- [ ] **Pause State Tracking**
  - [ ] Manual pause sets `manuallyPausedByUser = true`
  - [ ] Auto pause keeps `manuallyPausedByUser = false`
  - [ ] Resume clears manual flag
  - [ ] Flag persists in localStorage

- [ ] **Needs Debug Panel**
  - [ ] Status shows "Paused (Manual)" when manually paused
  - [ ] Status shows "Paused (Auto)" when auto-paused by game
  - [ ] Status shows "Active ✓" when processing
  - [ ] Toggle button calls pauseProcessing with correct flag
  - [ ] Tooltip displays helpful text

- [ ] **Main Game View**
  - [ ] Floating button appears when game active + needs manually paused
  - [ ] Floating button hidden when needs not manually paused
  - [ ] Floating button hidden when game not active
  - [ ] Clicking button resumes needs processing
  - [ ] Button disappears after clicking

### End-to-End Testing

- [ ] **Scenario 1:** Manual pause persists through game pause/resume
- [ ] **Scenario 2:** Auto pause doesn't trigger warnings
- [ ] **Scenario 3:** Manual resume clears warnings
- [ ] **Scenario 4:** Navigation pause works correctly
- [ ] **Persistence:** Manual flag survives page reload
- [ ] **Multi-session:** Works across multiple game sessions

---

## Future Enhancements

### Potential Use Cases for FloatingActionButton

1. **Quick Actions in Game View**
   - Feed guinea pigs
   - Clean habitat
   - Quick health check

2. **Tutorial/Help System**
   - Context-sensitive help button
   - Tutorial step indicators

3. **Settings Shortcut**
   - Quick access to common settings
   - Volume control

4. **Achievement Notifications**
   - Show achievement unlocked
   - Click to view details

5. **Emergency Alerts**
   - Low health warning
   - Critical needs alert
   - Friendship penalty active

### Component Enhancements

- [ ] **Badge Support:** Add number badge for counts (e.g., "3 actions needed")
- [ ] **Stack Support:** Allow multiple floating buttons with automatic positioning
- [ ] **Animations:** Entrance/exit animations (slide, scale, fade)
- [ ] **Custom Icons:** Support for icon libraries (not just emoji)
- [ ] **Drag to Reposition:** Allow user to customize position
- [ ] **Persistent Preferences:** Remember user's preferred position
- [ ] **Mini/Expanded States:** Expand to show more info on click

---

## Implementation Order

1. ✅ **Add to TODO** (completed)
2. ⬜ **Write documentation** (`system-11-floating-action-button.md`) ← You are here
3. ⬜ **Create component** (`FloatingActionButton.vue`)
4. ⬜ **Update needs controller** (add manual tracking)
5. ⬜ **Update debug panel** (call pauseProcessing with manual flag)
6. ⬜ **Add warning to HomeView** (show floating button when needed)
7. ⬜ **Test thoroughly** (verify all pause scenarios)
8. ⬜ **Mark as complete in TODO**

---

## Files to Create/Modify

### New Files
- `src/components/basic/FloatingActionButton.vue` (Component)
- `docs/systems/phase2/system-11-floating-action-button.md` (This file)

### Modified Files
- `src/stores/needsController.ts` (Add manual tracking)
- `src/components/debug/NeedsDebug.vue` (Update status display, toggle function)
- `src/views/HomeView.vue` (Add floating button)
- `docs/TODO-2025-10-04.md` (Mark as complete)

---

## References

- **Badge Component:** `src/components/basic/Badge.vue`
- **Button Component:** `src/components/basic/Button.vue`
- **Variables:** `src/styles/variables.css`
- **BEM Methodology:** CLAUDE.md
- **Accessibility:** WCAG 2.1 AA/AAA guidelines

---

## Success Criteria

✅ **Component is reusable** - Can be used anywhere in the app
✅ **Fully accessible** - Meets WCAG AA standards
✅ **Mobile-friendly** - Works on all device sizes
✅ **Solves the problem** - Users don't forget about manual pause
✅ **Clear visual feedback** - Impossible to miss the warning
✅ **One-click fix** - Easy to resume without hunting in debug panel
✅ **Well-documented** - Future developers can use/extend easily

---

**Status:** 📋 Ready for Implementation
**Estimated Effort:** 4-6 hours
**Priority:** High (UX/Bug Fix)
