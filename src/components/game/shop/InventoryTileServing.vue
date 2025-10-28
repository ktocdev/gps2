<template>
  <div
    class="inventory-tile-serving"
    :class="[depletionClass, { 'inventory-tile-serving--disabled': isDisabled }]"
    :title="tooltipText"
    :draggable="!isDisabled"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="inventory-tile-serving__emoji">{{ emoji }}</div>
    <div class="inventory-tile-serving__name">{{ name }}</div>
    <div class="inventory-tile-serving__servings">
      {{ servingsRemaining }}/{{ maxServings }} servings
    </div>
    <span v-if="instanceCount && instanceCount > 1" class="inventory-tile-serving__count">×{{ instanceCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  itemId: string
  name: string
  emoji?: string
  servingsRemaining: number
  maxServings: number
  instanceCount?: number
  isDisabled?: boolean
  tooltipMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  isDisabled: false,
  tooltipMessage: ''
})

const emit = defineEmits<{
  'dragstart': [itemId: string, event: DragEvent]
  'dragend': [event: DragEvent]
  'touchstart': [itemId: string, event: TouchEvent]
  'touchmove': [itemId: string, event: TouchEvent]
  'touchend': [itemId: string, event: TouchEvent]
}>()

const depletionPercentage = computed(() => {
  if (props.maxServings === 0) return 100
  return Math.round((1 - props.servingsRemaining / props.maxServings) * 100)
})

const depletionClass = computed(() => {
  const percentage = depletionPercentage.value
  if (percentage === 0) return 'inventory-tile-serving--fresh'
  if (percentage <= 25) return 'inventory-tile-serving--mostly-full'
  if (percentage <= 50) return 'inventory-tile-serving--half'
  if (percentage <= 75) return 'inventory-tile-serving--low'
  return 'inventory-tile-serving--depleted'
})

const tooltipText = computed(() => {
  if (props.isDisabled && props.tooltipMessage) {
    return props.tooltipMessage
  }
  return `${props.name} - ${props.servingsRemaining} of ${props.maxServings} servings remaining (${100 - depletionPercentage.value}% fresh)`
})

function handleDragStart(event: DragEvent) {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }
  const dragData = {
    itemId: props.itemId,
    isServingBased: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'

  emit('dragstart', props.itemId, event)
}

function handleDragEnd(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'

  emit('dragend', event)
}

function handleTouchStart(event: TouchEvent) {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'

  emit('touchstart', props.itemId, event)
}

function handleTouchMove(event: TouchEvent) {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }

  // Prevent scrolling while dragging
  event.preventDefault()

  emit('touchmove', props.itemId, event)
}

function handleTouchEnd(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'

  emit('touchend', props.itemId, event)
}
</script>

<style>
.inventory-tile-serving {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s ease;
}

.inventory-tile-serving:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.inventory-tile-serving:active {
  cursor: grabbing;
}

.inventory-tile-serving__emoji {
  font-size: var(--font-size-2xl);
  line-height: 1;
}

.inventory-tile-serving__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
  inline-size: 100%;
}

.inventory-tile-serving__servings {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-align: center;
}

/* Depletion color indicators */
.inventory-tile-serving--fresh {
  border-color: var(--color-success);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(34, 197, 94, 0.05) 100%);
}

.inventory-tile-serving--fresh .inventory-tile-serving__servings {
  color: var(--color-success);
}

.inventory-tile-serving--mostly-full {
  border-color: var(--color-info);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.inventory-tile-serving--mostly-full .inventory-tile-serving__servings {
  color: var(--color-info);
}

.inventory-tile-serving--half {
  border-color: var(--color-warning);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(251, 191, 36, 0.05) 100%);
}

.inventory-tile-serving--half .inventory-tile-serving__servings {
  color: var(--color-warning);
}

.inventory-tile-serving--low {
  border-color: var(--color-danger);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.inventory-tile-serving--low .inventory-tile-serving__servings {
  color: var(--color-danger);
}

.inventory-tile-serving--depleted {
  border-color: var(--color-text-muted);
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(128, 128, 128, 0.05) 100%);
  opacity: 0.6;
}

.inventory-tile-serving--depleted .inventory-tile-serving__servings {
  color: var(--color-text-muted);
}

.inventory-tile-serving--depleted .inventory-tile-serving__emoji {
  filter: grayscale(50%);
}

.inventory-tile-serving__count {
  position: absolute;
  inset-block-start: var(--space-1);
  inset-inline-end: var(--space-1);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  line-height: 1;
  box-shadow: var(--shadow-sm);
}

/* Disabled state */
.inventory-tile-serving--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  filter: grayscale(70%);
}

.inventory-tile-serving--disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}
</style>
