<template>
  <BaseDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm">
    <div class="clean-cage-dialog">
      <div class="clean-cage-dialog__header">
        <h2 class="clean-cage-dialog__title">Clean Habitat</h2>
      </div>

      <div class="clean-cage-dialog__content">
        <div class="bedding-info">
          <div class="bedding-info__row">
            <span class="bedding-info__label">Habitat Dirtiness:</span>
            <span class="bedding-info__value">{{ dirtiness.toFixed(2) }}%</span>
          </div>

          <div class="bedding-info__row">
            <span class="bedding-info__label">Bedding Needed:</span>
            <span class="bedding-info__value">{{ beddingNeeded.toFixed(1) }} bags</span>
          </div>
        </div>

        <div class="bedding-selection">
          <label class="bedding-selection__label">Bedding Type:</label>
          <Select
            v-model="selectedBeddingType"
            :options="beddingOptions"
            placeholder="Select bedding type"
            size="sm"
          />
        </div>

        <div class="bedding-info">
          <div class="bedding-info__row">
            <span class="bedding-info__label">Selected Bedding Available:</span>
            <span class="bedding-info__value" :class="{ 'text-warning': selectedBeddingAvailable < beddingNeeded }">
              {{ selectedBeddingAvailable.toFixed(1) }} bags
            </span>
          </div>
        </div>

        <BlockMessage v-if="selectedBeddingAvailable === 0" variant="warning">
          ⚠️ No {{ selectedBeddingLabel }} bedding available! Select a different type or purchase bedding from the shop.
        </BlockMessage>

        <BlockMessage v-else-if="selectedBeddingAvailable < beddingNeeded" variant="warning">
          ⚠️ Not enough bedding for full clean. Will use all {{ selectedBeddingAvailable.toFixed(1) }} bags for partial clean.
        </BlockMessage>

        <BlockMessage v-else variant="success">
          ✅ Enough bedding available for full clean!
        </BlockMessage>
      </div>

      <div class="clean-cage-dialog__footer">
        <Button @click="$emit('update:modelValue', false)" variant="tertiary" size="md">
          Cancel
        </Button>
        <Button
          @click="handleConfirm"
          variant="primary"
          size="md"
          :disabled="selectedBeddingAvailable === 0"
        >
          {{ selectedBeddingAvailable >= beddingNeeded ? 'Clean Habitat' : 'Partial Clean' }}
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import Select from '../../basic/Select.vue'
import { useInventoryStore } from '../../../stores/inventoryStore'

interface Props {
  modelValue: boolean
  dirtiness: number
  beddingNeeded: number
  beddingAvailable: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [beddingType: string]
}>()

const inventoryStore = useInventoryStore()

// Bedding selection
const selectedBeddingType = ref<string>('average')

const beddingOptions = computed(() => [
  {
    value: 'cheap',
    label: `Cheap (${inventoryStore.getItemQuantity('bedding_cheap')} bags)`,
    disabled: !inventoryStore.hasItem('bedding_cheap')
  },
  {
    value: 'average',
    label: `Average (${inventoryStore.getItemQuantity('bedding_average')} bags)`,
    disabled: !inventoryStore.hasItem('bedding_average')
  },
  {
    value: 'premium',
    label: `Premium (${inventoryStore.getItemQuantity('bedding_premium')} bags)`,
    disabled: !inventoryStore.hasItem('bedding_premium')
  }
])

const selectedBeddingAvailable = computed(() => {
  const itemId = `bedding_${selectedBeddingType.value}`
  return inventoryStore.getItemQuantity(itemId)
})

const selectedBeddingLabel = computed(() => {
  return selectedBeddingType.value.charAt(0).toUpperCase() + selectedBeddingType.value.slice(1)
})

function handleConfirm() {
  emit('confirm', selectedBeddingType.value)
  emit('update:modelValue', false)
}
</script>

<style>
.clean-cage-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.clean-cage-dialog__header {
  text-align: center;
}

.clean-cage-dialog__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.clean-cage-dialog__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bedding-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bedding-selection__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.bedding-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.bedding-info__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bedding-info__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.bedding-info__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.bedding-info__value.text-warning {
  color: var(--color-warning);
}

.clean-cage-dialog__footer {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
</style>
