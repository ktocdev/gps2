<template>
  <div class="habitat-sidebar habitat-care-sidebar">
    <div class="habitat-care-sidebar__header">
      <h3>Habitat Care</h3>
    </div>

    <div class="habitat-care-sidebar__content">
      <!-- Core Care Actions -->
      <div class="care-section">
        <h4 class="care-section__title">Core Care</h4>

        <Button
          @click="$emit('clean-cage')"
          variant="tertiary"
          size="sm"
          full-width
        >
          🧹 Clean Habitat
        </Button>

        <Button
          @click="$emit('refill-water')"
          variant="tertiary"
          size="sm"
          full-width
        >
          💧 Refill Water
        </Button>

        <Button
          @click="$emit('fill-all-hay-racks')"
          variant="tertiary"
          size="sm"
          full-width
          :disabled="!canFillHayRacks"
          :title="fillHayRacksTooltip"
        >
          🌾 Fill All Hay Racks
        </Button>
      </div>

      <!-- Container Management -->
      <div class="care-section">
        <h4 class="care-section__title">Containers</h4>

        <div class="container-buttons">
          <Button
            @click="$emit('clear-all-bowls')"
            variant="warning"
            size="sm"
          >
            🗑️ Clear All Bowls
          </Button>

          <Button
            @click="$emit('clear-all-hay-racks')"
            variant="warning"
            size="sm"
          >
            🗑️ Clear All Hay Racks
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../../../basic/Button.vue'

interface Props {
  canFillHayRacks: boolean
  fillHayRacksTooltip: string
}

defineProps<Props>()

defineEmits<{
  'clean-cage': []
  'refill-water': []
  'fill-all-hay-racks': []
  'clear-all-bowls': []
  'clear-all-hay-racks': []
}>()
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.habitat-care-sidebar {
}

.habitat-care-sidebar__header {
  padding: var(--space-4);
  border-block-end: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.habitat-care-sidebar__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.habitat-care-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.care-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.care-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
  margin-block-end: var(--space-1);
}

.container-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
