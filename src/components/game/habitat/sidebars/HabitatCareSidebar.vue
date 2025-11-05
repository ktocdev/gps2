<template>
  <div class="habitat-care-sidebar">
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
          🧹 Clean Cage
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
          @click="$emit('refresh-bedding')"
          variant="tertiary"
          size="sm"
          full-width
          :disabled="!canRefreshBedding"
        >
          🛏️ Refresh Bedding
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

      <!-- Bedding Selection -->
      <div class="care-section">
        <h4 class="care-section__title">Bedding Type</h4>
        <Select
          :modelValue="selectedBeddingType"
          @update:modelValue="$emit('update:selectedBeddingType', $event)"
          :options="beddingOptions"
          placeholder="Select bedding type"
        />
      </div>

      <!-- Container Management -->
      <div class="care-section">
        <h4 class="care-section__title">Containers</h4>

        <Button
          @click="$emit('clear-all-bowls')"
          variant="warning"
          size="sm"
          full-width
        >
          🗑️ Clear All Bowls
        </Button>

        <Button
          @click="$emit('clear-all-hay-racks')"
          variant="warning"
          size="sm"
          full-width
        >
          🗑️ Clear All Hay Racks
        </Button>
      </div>

      <!-- Test Actions -->
      <div class="care-section">
        <h4 class="care-section__title">Test Actions</h4>

        <Button
          @click="$emit('add-test-poop')"
          variant="secondary"
          size="sm"
          full-width
        >
          💩 Add Test Poop
        </Button>

        <Button
          @click="$emit('clear-all-poop')"
          variant="primary"
          size="sm"
          full-width
          :disabled="poopCount === 0"
        >
          🧹 Clear All Poop{{ poopCount > 0 ? ` (${poopCount})` : '' }}
        </Button>

        <Button
          @click="$emit('clear-water')"
          variant="warning"
          size="sm"
          full-width
        >
          💧 Clear Water
        </Button>

        <Button
          @click="$emit('test-water-consumption')"
          variant="tertiary"
          size="sm"
          full-width
          :disabled="!hasWaterAvailable"
        >
          💧 Test Water Consumption
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../../../basic/Button.vue'
import Select from '../../../basic/Select.vue'

interface Props {
  canRefreshBedding: boolean
  canFillHayRacks: boolean
  fillHayRacksTooltip: string
  selectedBeddingType: string
  beddingOptions: Array<{ value: string; label: string; disabled?: boolean }>
  poopCount: number
  hasWaterAvailable: boolean
}

defineProps<Props>()

defineEmits<{
  'clean-cage': []
  'refill-water': []
  'refresh-bedding': []
  'fill-all-hay-racks': []
  'update:selectedBeddingType': [value: string | number]
  'clear-all-bowls': []
  'clear-all-hay-racks': []
  'add-test-poop': []
  'clear-all-poop': []
  'clear-water': []
  'test-water-consumption': []
}>()
</script>

<style>
.habitat-care-sidebar {
  display: flex;
  flex-direction: column;
  inline-size: 240px;
  block-size: 100%;
  background-color: var(--color-bg-secondary);
  border-inline-start: 1px solid var(--color-border);
  overflow-y: auto;
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

/* Mobile: Full width layout */
@media (max-width: 768px) {
  .habitat-care-sidebar {
    inline-size: 100%;
    max-block-size: 300px;
    border-inline-start: none;
    border-block-start: 1px solid var(--color-border);
  }
}
</style>
