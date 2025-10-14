<template>
  <BaseDialog
    :model-value="modelValue"
    size="md"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-escape="closeOnEscape"
    @update:model-value="handleDialogClose"
  >
    <div
      class="adoption-confirm-dialog__modal"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="adoption-confirm-dialog__header">
        <h3 :id="titleId" class="adoption-confirm-dialog__title">
          Ready to adopt {{ guineaPigName }}?
        </h3>
      </div>

      <div class="adoption-confirm-dialog__content">
        <p class="adoption-confirm-dialog__message">
          This is a permanent commitment. You'll care for {{ guineaPigName }} and build a lasting friendship. Once adopted, they're yours forever!
        </p>

        <div v-if="observed" class="adoption-confirm-dialog__observed-note">
          <span class="adoption-confirm-dialog__checkmark">✓</span>
          You've observed {{ guineaPigName }}
        </div>

        <div v-else class="adoption-confirm-dialog__unobserved-note">
          <span class="adoption-confirm-dialog__info-icon">ℹ️</span>
          Consider using Observe to learn more about {{ guineaPigName }}'s personality first
        </div>
      </div>

      <div class="adoption-confirm-dialog__footer">
        <Button
          @click="handleCancel"
          variant="tertiary"
          size="md"
        >
          Cancel
        </Button>
        <Button
          @click="handleConfirm"
          variant="primary"
          size="md"
        >
          Confirm Adoption
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
import Button from '../Button.vue'

interface Props {
  modelValue: boolean
  guineaPigName: string
  observed?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()

// Generate unique ID for aria-labelledby
const titleId = `adoption-confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleDialogClose(value: boolean) {
  if (!value) {
    emit('cancel')
  }
  emit('update:modelValue', value)
}
</script>

<style>
/* Adoption Confirm Dialog Component - Extends base Dialog */

/* Modal container - inherits sizing from Dialog component */
.adoption-confirm-dialog__modal {
  /* Base Dialog handles all positioning, backdrop, and animations */
}

/* Header */
.adoption-confirm-dialog__header {
  padding-block-start: var(--space-6);
  padding-block-end: var(--space-4);
  padding-inline: var(--space-6);
  border-block-end: 1px solid var(--color-border-light);
}

.adoption-confirm-dialog__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

/* Content */
.adoption-confirm-dialog__content {
  padding: var(--space-6);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.adoption-confirm-dialog__message {
  margin: 0;
  font-size: var(--font-size-base);
  margin-block-end: var(--space-4);
}

/* Observed/Unobserved Notes */
.adoption-confirm-dialog__observed-note,
.adoption-confirm-dialog__unobserved-note {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.adoption-confirm-dialog__observed-note {
  background-color: var(--color-success-bg);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.adoption-confirm-dialog__unobserved-note {
  background-color: var(--color-info-50);
  border: 1px solid var(--color-info-600);
  color: var(--color-info-700);
}

.adoption-confirm-dialog__checkmark,
.adoption-confirm-dialog__info-icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

/* Footer */
.adoption-confirm-dialog__footer {
  padding-block-start: var(--space-4);
  padding-block-end: var(--space-6);
  padding-inline: var(--space-6);
  border-block-start: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .adoption-confirm-dialog__header,
  .adoption-confirm-dialog__content,
  .adoption-confirm-dialog__footer {
    padding-inline: var(--space-4);
  }

  .adoption-confirm-dialog__header {
    padding-block-start: var(--space-5);
    padding-block-end: var(--space-3);
  }

  .adoption-confirm-dialog__content {
    padding-block: var(--space-5);
  }

  .adoption-confirm-dialog__footer {
    padding-block-start: var(--space-3);
    padding-block-end: var(--space-5);
    flex-direction: column-reverse;
  }

  .adoption-confirm-dialog__footer .button {
    inline-size: 100%;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .adoption-confirm-dialog__header,
  .adoption-confirm-dialog__footer {
    border-width: 2px;
  }

  .adoption-confirm-dialog__observed-note,
  .adoption-confirm-dialog__unobserved-note {
    border-width: 2px;
  }
}
</style>
