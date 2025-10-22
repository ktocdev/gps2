# System 17: Visual Presence & Positioning

**Phase 4, Stage 1 - Guinea Pig Visual Integration**

**Time Estimate:** 2-3 hours

## Goal

Get guinea pigs rendering on the habitat grid with basic click interaction and selection functionality.

## Dependencies

**Required Systems (Already Complete):**
- Position tracking (`habitatConditions.guineaPigPositions`)
- Guinea pig store (`guineaPigStore.activeGuineaPigs`)
- Habitat grid system

**Provides Foundation For:**
- System 18: Pathfinding & Movement
- System 19: Autonomous AI Behaviors
- System 20: Direct Interaction System
- System 21: Social Bonding System

## Implementation Tasks

### Task 1: GuineaPigSprite Component

Create the visual representation component for guinea pigs in the habitat.

#### Component Interface

```typescript
interface GuineaPigSpriteProps {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isSelected: boolean
}

interface GuineaPigSpriteEmits {
  (e: 'select', guineaPigId: string): void
}
```

#### Features

**Visual Rendering:**
- Breed-specific emoji rendering (use `guineaPig.emoji` from existing guinea pig data)
- Grid-based positioning using CSS transforms
- Z-index layering (sprites render above habitat items, below UI overlays)

**Interaction:**
- Click interaction for guinea pig selection
- Visual highlight when selected
- Hover state (optional subtle effect)

**Visual States:**
- `idle` - Default stationary state
- `selected` - Visual highlight when clicked

#### Component Structure

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { GuineaPig } from '@/types/guineaPig'

interface Props {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isSelected: boolean
}

interface Emits {
  (e: 'select', guineaPigId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Calculate CSS transform for grid position
const spriteStyle = computed(() => ({
  transform: `translate(${props.gridPosition.col * CELL_SIZE}px, ${props.gridPosition.row * CELL_SIZE}px)`
}))

function handleClick() {
  emit('select', props.guineaPig.id)
}
</script>

<template>
  <div
    class="guinea-pig-sprite"
    :class="{ 'guinea-pig-sprite--selected': isSelected }"
    :style="spriteStyle"
    @click="handleClick"
  >
    <div class="guinea-pig-sprite__emoji">
      {{ guineaPig.emoji }}
    </div>
  </div>
</template>
```

#### CSS Styling

```css
.guinea-pig-sprite {
  position: absolute;
  inline-size: var(--cell-size);
  block-size: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10; /* Above habitat items (z-index: 5) */
  transition: transform 0.3s ease-in-out;
}

.guinea-pig-sprite__emoji {
  font-size: 2rem;
  line-height: 1;
}

.guinea-pig-sprite--selected {
  filter: brightness(1.2);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 50%;
}

.guinea-pig-sprite:hover {
  filter: brightness(1.1);
}
```

---

### Task 2: HabitatVisual Integration

Integrate guinea pig rendering into the existing habitat display component.

#### Rendering Logic

```typescript
// In HabitatVisual.vue
import { computed } from 'vue'
import { useGuineaPigStore } from '@/stores/guineaPigStore'
import { useHabitatConditionsStore } from '@/stores/habitatConditionsStore'
import GuineaPigSprite from './GuineaPigSprite.vue'

const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditionsStore()

// Get active guinea pigs and their positions
const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)
const guineaPigPositions = computed(() => habitatConditions.guineaPigPositions)
const selectedGuineaPigId = computed(() => guineaPigStore.selectedGuineaPigId)

function handleGuineaPigClick(guineaPigId: string) {
  guineaPigStore.selectGuineaPig(guineaPigId)
}

function getGuineaPigPosition(guineaPigId: string) {
  return guineaPigPositions.value[guineaPigId] || { row: 0, col: 0 }
}
```

#### Template Integration

```vue
<template>
  <div class="habitat-visual">
    <!-- Existing habitat grid and items -->
    <div class="habitat-visual__grid">
      <!-- Grid cells -->
    </div>

    <div class="habitat-visual__items">
      <!-- Habitat items -->
    </div>

    <!-- Guinea pig sprites layer -->
    <div class="habitat-visual__guinea-pigs">
      <GuineaPigSprite
        v-for="guineaPig in activeGuineaPigs"
        :key="guineaPig.id"
        :guinea-pig="guineaPig"
        :grid-position="getGuineaPigPosition(guineaPig.id)"
        :is-selected="selectedGuineaPigId === guineaPig.id"
        @select="handleGuineaPigClick"
      />
    </div>
  </div>
</template>
```

#### Z-Index Layering

Ensure proper rendering order (bottom to top):
1. **Grid background** - z-index: 1
2. **Habitat items** - z-index: 5
3. **Guinea pig sprites** - z-index: 10
4. **UI overlays** - z-index: 100

---

### Task 3: Guinea Pig Store Selection

Add selection state management to guinea pig store.

```typescript
// In guineaPigStore.ts
export const useGuineaPigStore = defineStore('guineaPig', () => {
  // ... existing store state

  const selectedGuineaPigId = ref<string | null>(null)

  function selectGuineaPig(guineaPigId: string) {
    selectedGuineaPigId.value = guineaPigId
  }

  function clearSelection() {
    selectedGuineaPigId.value = null
  }

  return {
    // ... existing exports
    selectedGuineaPigId: readonly(selectedGuineaPigId),
    selectGuineaPig,
    clearSelection
  }
})
```

---

### Task 4: Testing & Validation

#### Visual Testing

**Grid Position Accuracy:**
- [ ] Guinea pigs render at correct grid positions
- [ ] Position matches `guineaPigPositions` store data
- [ ] Position updates when store data changes

**Multi-Guinea Pig Rendering:**
- [ ] Multiple guinea pigs (up to 2) visible simultaneously
- [ ] Each guinea pig renders at different positions
- [ ] No visual overlap or collision issues

**Selection Interaction:**
- [ ] Clicking guinea pig triggers selection
- [ ] Selected guinea pig shows visual highlight
- [ ] Only one guinea pig can be selected at a time
- [ ] Selection visual feedback is clear and immediate

**Z-Index Layering:**
- [ ] Guinea pigs render above habitat items
- [ ] Guinea pigs render below UI overlays
- [ ] No z-index conflicts or visual glitches

#### Performance Testing

**Rendering Performance:**
- [ ] Smooth rendering with 2 guinea pigs + full habitat items
- [ ] No visual glitches during position updates
- [ ] Smooth selection state transitions
- [ ] No frame rate drops

**Responsive Interaction:**
- [ ] Click detection works reliably
- [ ] No lag between click and selection
- [ ] Hover effects (if implemented) are smooth

---

## Files to Create/Modify

### New Files

```
src/components/game/habitat/GuineaPigSprite.vue
```

### Modified Files

```
src/components/game/habitat/HabitatVisual.vue - Integrate guinea pig rendering layer
src/stores/guineaPigStore.ts - Add selection state management
```

---

## Success Criteria

**Core Functionality:**
- [x] Guinea pigs render at correct grid positions
- [x] Multiple guinea pigs visible simultaneously
- [x] Clicking guinea pig selects it
- [x] Selected guinea pig shows visual highlight
- [x] Z-index layering correct (sprites above items)
- [x] No visual rendering conflicts

**Quality Standards:**
- [x] Rendering performance acceptable (60fps)
- [x] Selection interaction responsive (< 100ms)
- [x] Visual feedback clear and intuitive
- [x] Code follows project conventions (BEM CSS, TypeScript strict mode)

---

## Implementation Notes

### CSS Variables to Use

```css
--cell-size: /* Habitat grid cell size */
--color-primary: /* Selection highlight color */
--z-index-habitat-items: 5
--z-index-guinea-pigs: 10
--z-index-ui-overlay: 100
```

### Emoji Rendering

Use the existing `emoji` property from guinea pig data:
- Retrieved from breed data during guinea pig creation
- Already stored in `GuineaPig` interface
- Renders consistently across browsers

### Grid Position Calculation

Grid positions are already tracked in `habitatConditions.guineaPigPositions`:
```typescript
guineaPigPositions: {
  [guineaPigId: string]: { row: number; col: number }
}
```

No additional position calculation needed for Stage 1 (stationary rendering only).

---

## Next Steps

After completing System 17:

1. **Verify all success criteria** are met
2. **Test with 2 guinea pigs** thoroughly
3. **Move to System 18:** [Pathfinding & Movement](system-18-pathfinding-movement.md)

System 18 will add movement capabilities, which depend on the visual rendering established in this system.

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Next System:** [system-18-pathfinding-movement.md](system-18-pathfinding-movement.md)
- **Habitat Items Reference:** [system-14-habitat-items.md](../phase3/system-14-habitat-items.md)
