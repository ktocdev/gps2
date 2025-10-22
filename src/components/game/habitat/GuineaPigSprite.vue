<template>
  <div
    class="guinea-pig-sprite"
    :class="{ 'guinea-pig-sprite--selected': isSelected }"
    :style="spriteStyle"
    @click="handleClick"
  >
    <div class="guinea-pig-sprite__emoji">
      {{ guineaPigEmoji }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GuineaPig } from '../../../stores/guineaPigStore'

interface Props {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isInteractingWithDepthItem: boolean
  isSelected: boolean
}

interface Emits {
  (e: 'select', guineaPigId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const CELL_SIZE = 60 // Match HabitatVisual cell size

// Get guinea pig emoji - use a simple mapping based on gender for now
const guineaPigEmoji = computed(() => {
  // Future: This could be based on breed, appearance, or stored emoji property
  return props.guineaPig.gender === 'male' ? '🐹' : '🐭'
})

// Calculate CSS transform for grid position and dynamic z-index
const spriteStyle = computed(() => ({
  transform: `translate(${props.gridPosition.col * CELL_SIZE}px, ${props.gridPosition.row * CELL_SIZE}px)`,
  zIndex: props.isInteractingWithDepthItem ? 3 : 10
}))

function handleClick() {
  emit('select', props.guineaPig.id)
}
</script>

<style>
.guinea-pig-sprite {
  position: absolute;
  inline-size: var(--space-16); /* 64px - slightly larger than cell for visibility */
  block-size: var(--space-16);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* Indicates guinea pig is clickable for selection */
  /* z-index set dynamically via inline style: 3 or 10 */
  transition: transform 0.3s ease-in-out, z-index 0s;
  pointer-events: all; /* Enable clicks on guinea pig sprites */
}

.guinea-pig-sprite__emoji {
  font-size: var(--font-size-4xl); /* 36px - 2.25rem */
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Selection visual - indicates which guinea pig is selected for interaction */
.guinea-pig-sprite--selected {
  filter: brightness(1.2);
}

.guinea-pig-sprite--selected .guinea-pig-sprite__emoji {
  outline: 3px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.3);
  padding: var(--space-2);
}

/* Hover feedback indicates guinea pig is clickable */
.guinea-pig-sprite:hover .guinea-pig-sprite__emoji {
  filter: brightness(1.15) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  transform: scale(1.05);
  transition: all var(--transition-fast);
}
</style>
