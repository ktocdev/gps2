<template>
  <div
    class="guinea-pig-info-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="guinea-pig-info-menu__header">
      <span class="guinea-pig-info-menu__name">{{ guineaPig.name }}</span>
      <button class="guinea-pig-info-menu__close" @click="$emit('close')">×</button>
    </div>

    <div class="guinea-pig-info-menu__info">
      <Badge size="sm">{{ guineaPig.breed }}</Badge>
      <Badge size="sm">{{ genderDisplay }}</Badge>
      <Badge size="sm">{{ furColorDisplay }}</Badge>
      <Badge size="sm">{{ furPatternDisplay }}</Badge>
    </div>

    <div class="guinea-pig-info-menu__needs">
      <div
        v-for="need in needsList"
        :key="need.key"
        class="guinea-pig-info-menu__need"
      >
        <span class="guinea-pig-info-menu__need-label">{{ need.label }}</span>
        <div class="guinea-pig-info-menu__need-bar">
          <div
            class="guinea-pig-info-menu__need-fill"
            :class="getNeedColorClass(need.value)"
            :style="{ width: need.value + '%' }"
          ></div>
        </div>
        <span class="guinea-pig-info-menu__need-value">{{ Math.round(need.value) }}</span>
      </div>
    </div>

    <div class="guinea-pig-info-menu__actions">
      <button
        class="guinea-pig-info-menu__action guinea-pig-info-menu__action--primary"
        @click="$emit('take-control')"
      >
        Take Control
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '../basic/Badge.vue'
import type { GuineaPig } from '../../stores/guineaPigStore'

const props = defineProps<{
  guineaPig: GuineaPig
  position: { x: number; y: number }
}>()

defineEmits<{
  close: []
  'take-control': []
}>()

const genderDisplay = computed(() => {
  return props.guineaPig.gender === 'male' ? 'Male' : 'Female'
})

const furColorDisplay = computed(() => {
  const color = props.guineaPig.appearance.furColor
  // Capitalize first letter of each word
  return color.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const furPatternDisplay = computed(() => {
  const pattern = props.guineaPig.appearance.furPattern
  // Capitalize first letter of each word
  return pattern.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

// Define which needs to display and their labels
// Organized by category: Critical > Environmental > Maintenance
const needsList = computed(() => [
  // Critical Needs
  { key: 'hunger', label: 'Hunger', value: props.guineaPig.needs.hunger },
  { key: 'thirst', label: 'Thirst', value: props.guineaPig.needs.thirst },
  { key: 'energy', label: 'Energy', value: props.guineaPig.needs.energy },
  { key: 'shelter', label: 'Shelter', value: props.guineaPig.needs.shelter },
  // Environmental Needs
  { key: 'play', label: 'Play', value: props.guineaPig.needs.play },
  { key: 'social', label: 'Social', value: props.guineaPig.needs.social },
  { key: 'comfort', label: 'Comfort', value: props.guineaPig.needs.comfort },
  // Maintenance Needs
  { key: 'hygiene', label: 'Hygiene', value: props.guineaPig.needs.hygiene },
  { key: 'nails', label: 'Nails', value: props.guineaPig.needs.nails },
  { key: 'health', label: 'Health', value: props.guineaPig.needs.health },
  { key: 'chew', label: 'Chew', value: props.guineaPig.needs.chew },
])

/**
 * Get color class based on need value
 * Matches NeedRow thresholds: Green (60-100) → Grey (40-59) → Yellow (30-39) → Red (0-29)
 */
function getNeedColorClass(value: number): string {
  if (value >= 60) return 'guinea-pig-info-menu__need-fill--satisfied'
  if (value >= 40) return 'guinea-pig-info-menu__need-fill--good'
  if (value >= 30) return 'guinea-pig-info-menu__need-fill--medium'
  return 'guinea-pig-info-menu__need-fill--critical'
}
</script>

<style>
.guinea-pig-info-menu {
  position: absolute;
  z-index: 100;
  min-inline-size: 220px;
  max-inline-size: 280px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: translate(-50%, 10px);
}

.guinea-pig-info-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.guinea-pig-info-menu__name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.guinea-pig-info-menu__close {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.guinea-pig-info-menu__close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.guinea-pig-info-menu__info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-end: 1px solid var(--color-border-light);
}

.guinea-pig-info-menu__needs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  max-block-size: 200px;
  overflow-y: auto;
}

.guinea-pig-info-menu__need {
  display: grid;
  grid-template-columns: 60px 1fr 30px;
  align-items: center;
  gap: var(--spacing-xs);
}

.guinea-pig-info-menu__need-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.guinea-pig-info-menu__need-bar {
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.guinea-pig-info-menu__need-fill {
  block-size: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
}

.guinea-pig-info-menu__need-fill--satisfied {
  background-color: var(--color-success);
}

.guinea-pig-info-menu__need-fill--good {
  background-color: var(--color-text-muted);
}

.guinea-pig-info-menu__need-fill--medium {
  background-color: var(--color-warning);
}

.guinea-pig-info-menu__need-fill--critical {
  background-color: var(--color-danger);
}

.guinea-pig-info-menu__need-value {
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  color: var(--color-text-muted);
  text-align: end;
}

.guinea-pig-info-menu__actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-start: 1px solid var(--color-border-light);
}

.guinea-pig-info-menu__action {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.guinea-pig-info-menu__action--primary {
  background-color: var(--color-primary);
  color: white;
}

.guinea-pig-info-menu__action--primary:hover {
  background-color: var(--color-primary-dark);
}

.guinea-pig-info-menu__action--primary:active {
  transform: scale(0.98);
}
</style>
