<template>
  <div class="habitat-sidebar habitat-care-sidebar">
    <div class="habitat-sidebar__header">
      <h3>🏠 Habitat Care</h3>
    </div>

    <div class="habitat-care-sidebar__content">
      <!-- Overall Condition -->
      <BlockMessage :variant="getOverallConditionVariant(habitat.overallCondition)" class="overall-condition">
        <div class="overall-condition__content">
          <span class="overall-condition__label">Overall Condition:</span>
          <span class="overall-condition__value">{{ habitat.overallCondition }}%</span>
        </div>
      </BlockMessage>

      <!-- Core Care Actions -->
      <div class="care-section">
        <h4 class="care-section__title">Care Actions</h4>

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

      <!-- Core Conditions -->
      <div class="care-section">
        <h4 class="care-section__title">Core Conditions</h4>

        <!-- Cleanliness -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="cleanliness">Cleanliness</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.cleanliness)">
              {{ habitat.cleanliness.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="cleanliness"
            :model-value="habitat.cleanliness"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('cleanliness', v)"
          />
        </div>

        <!-- Bedding Freshness -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="bedding">Bedding Freshness</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.beddingFreshness)">
              {{ habitat.beddingFreshness.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="bedding"
            :model-value="habitat.beddingFreshness"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('beddingFreshness', v)"
          />
        </div>

        <!-- Water Level -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="water">Water Level</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.waterLevel)">
              {{ habitat.waterLevel.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="water"
            :model-value="habitat.waterLevel"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('waterLevel', v)"
          />
        </div>
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

      <!-- Chew Items -->
      <div v-if="chewItemsList.length > 0" class="care-section">
        <h4 class="care-section__title">Chew Items</h4>
        <div v-for="chew in chewItemsList" :key="chew.itemId" class="condition-item">
          <div class="condition-item__header">
            <label :for="`chew-${chew.itemId}`">
              {{ chew.emoji }} {{ chew.name }}
            </label>
            <span class="condition-item__value" :class="getChewDurabilityClass(chew.durability)">
              {{ chew.durability.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            :id="`chew-${chew.itemId}`"
            :model-value="chew.durability"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => updateChewDurability(chew.itemId, v)"
          />
          <div class="condition-item__metadata">
            🦷 Used {{ chew.usageCount }} times
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHabitatConditions } from '../../../../stores/habitatConditions'
import { useHabitatContainers } from '../../../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../../../stores/suppliesStore'
import { CHEW_DEGRADATION } from '../../../../constants/supplies'
import Button from '../../../basic/Button.vue'
import BlockMessage from '../../../basic/BlockMessage.vue'
import SliderField from '../../../basic/SliderField.vue'

interface Props {
  canFillHayRacks: boolean
  fillHayRacksTooltip: string
  habitatVisualRef: any
}

const props = defineProps<Props>()

defineEmits<{
  'clean-cage': []
  'refill-water': []
  'fill-all-hay-racks': []
  'clear-all-bowls': []
  'clear-all-hay-racks': []
}>()

const habitat = useHabitatConditions()
const suppliesStore = useSuppliesStore()
const { getChewData, setChewDurability } = useHabitatContainers()

// Chew Items Management
const chewItemsList = computed(() => {
  if (!props.habitatVisualRef) return []

  const items = props.habitatVisualRef.placedItems
  if (!items) return []

  const chews = items
    .filter((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      return itemData?.stats?.itemType === 'chew'
    })
    .map((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      const chewData = getChewData(item.itemId)

      return {
        itemId: item.itemId,
        name: itemData?.name || 'Chew Item',
        emoji: itemData?.emoji || '🦷',
        durability: chewData?.durability ?? 100,
        usageCount: chewData?.usageCount ?? 0,
        lastUsedAt: chewData?.lastUsedAt ?? Date.now()
      }
    })

  return chews
})

function updateChewDurability(chewItemId: string, durability: number) {
  setChewDurability(chewItemId, durability)
}

function getChewDurabilityClass(durability: number): string {
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'text-label--danger'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'text-label--warning'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'text-label--muted'
  return 'text-label--success'
}

function getConditionClass(value: number): string {
  if (value >= 75) return 'text-label--success'
  if (value >= 50) return 'text-label--warning'
  return 'text-label--danger'
}

function getOverallConditionVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 75) return 'success'
  if (value >= 50) return 'warning'
  return 'error'
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
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

/* Overall Condition */
.overall-condition {
  margin-block-end: 0;
}

.overall-condition__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-condition__label {
  font-weight: var(--font-weight-semibold);
}

.overall-condition__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

/* Condition Items */
.condition-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.condition-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-item__header label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.condition-item__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.condition-item__metadata {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
