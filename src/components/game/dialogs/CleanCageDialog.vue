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
            <span class="bedding-info__value">{{ dirtiness }}%</span>
          </div>

          <div class="bedding-info__row">
            <span class="bedding-info__label">Bedding Needed:</span>
            <span class="bedding-info__value">{{ beddingNeeded.toFixed(1) }} bags</span>
          </div>

          <div class="bedding-info__row">
            <span class="bedding-info__label">Bedding Available:</span>
            <span class="bedding-info__value" :class="{ 'text-warning': beddingAvailable < beddingNeeded }">
              {{ beddingAvailable.toFixed(1) }} bags
            </span>
          </div>
        </div>

        <BlockMessage v-if="beddingAvailable === 0" variant="warning">
          ⚠️ No bedding available! Purchase bedding from the shop.
        </BlockMessage>

        <BlockMessage v-else-if="beddingAvailable < beddingNeeded" variant="warning">
          ⚠️ Not enough bedding for full clean. Will use all {{ beddingAvailable.toFixed(1) }} bags for partial clean.
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
          :disabled="beddingAvailable === 0"
        >
          {{ beddingAvailable >= beddingNeeded ? 'Clean Habitat' : 'Partial Clean' }}
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'
import BlockMessage from '../../basic/BlockMessage.vue'

interface Props {
  modelValue: boolean
  dirtiness: number
  beddingNeeded: number
  beddingAvailable: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

function handleConfirm() {
  emit('confirm')
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

.text-warning {
  color: var(--color-warning) !important;
}

.clean-cage-dialog__footer {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
</style>
