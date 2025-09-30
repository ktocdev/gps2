<template>
  <div v-if="modelValue" class="confirm-dialog">
    <div
      class="confirm-dialog__backdrop"
      @click="handleBackdropClick"
    ></div>

    <div
      class="confirm-dialog__modal"
      :class="modalSizeClass"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="confirm-dialog__header">
        <h3 :id="titleId" class="confirm-dialog__title">{{ title }}</h3>
      </div>

      <div class="confirm-dialog__content">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </div>

      <div class="confirm-dialog__footer">
        <Button
          @click="handleCancel"
          variant="tertiary"
          :size="buttonSize"
        >
          {{ cancelText }}
        </Button>
        <Button
          @click="handleConfirm"
          :variant="confirmVariant"
          :size="buttonSize"
        >
          {{ confirmText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import Button from './Button.vue'

interface Props {
  modelValue: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true
})

const emit = defineEmits<Emits>()

// Generate unique ID for aria-labelledby
const titleId = `confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`

const modalSizeClass = computed(() => `confirm-dialog__modal--${props.size}`)

const confirmVariant = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'primary'
  }
})

const buttonSize = computed(() => props.size)

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    handleCancel()
  }
}

function handleEscape(event: KeyboardEvent) {
  if (props.closeOnEscape && event.key === 'Escape' && props.modelValue) {
    handleCancel()
  }
}

// Body scroll lock when dialog is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Add escape key listener
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style>
/* Confirm Dialog Component - BEM Methodology */

/* Root wrapper */
.confirm-dialog {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  inset-block-end: 0;
  inset-inline-end: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

/* Backdrop overlay */
.confirm-dialog__backdrop {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  inset-block-end: 0;
  inset-inline-end: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-modal-backdrop);
  animation: fadeIn var(--transition-fast);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal container */
.confirm-dialog__modal {
  position: relative;
  z-index: var(--z-index-modal);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-inline-size: 100%;
  max-block-size: calc(100vh - var(--space-8));
  overflow-y: auto;
  animation: slideUp var(--transition-normal);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(var(--space-4));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Size modifiers */
.confirm-dialog__modal--sm {
  inline-size: 100%;
  max-inline-size: 400px;
}

.confirm-dialog__modal--md {
  inline-size: 100%;
  max-inline-size: 500px;
}

.confirm-dialog__modal--lg {
  inline-size: 100%;
  max-inline-size: 600px;
}

/* Header */
.confirm-dialog__header {
  padding-block-start: var(--space-6);
  padding-block-end: var(--space-4);
  padding-inline: var(--space-6);
  border-block-end: 1px solid var(--color-border-light);
}

.confirm-dialog__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

/* Content */
.confirm-dialog__content {
  padding: var(--space-6);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.confirm-dialog__content p {
  margin: 0;
}

.confirm-dialog__content p:not(:last-child) {
  margin-block-end: var(--space-4);
}

/* Footer */
.confirm-dialog__footer {
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
  .confirm-dialog {
    padding: var(--space-2);
  }

  .confirm-dialog__modal {
    max-block-size: calc(100vh - var(--space-4));
  }

  .confirm-dialog__header,
  .confirm-dialog__content,
  .confirm-dialog__footer {
    padding-inline: var(--space-4);
  }

  .confirm-dialog__header {
    padding-block-start: var(--space-5);
    padding-block-end: var(--space-3);
  }

  .confirm-dialog__content {
    padding-block: var(--space-5);
  }

  .confirm-dialog__footer {
    padding-block-start: var(--space-3);
    padding-block-end: var(--space-5);
    flex-direction: column-reverse;
  }

  .confirm-dialog__footer .button {
    inline-size: 100%;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .confirm-dialog__backdrop,
  .confirm-dialog__modal {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .confirm-dialog__modal {
    border-width: 2px;
  }

  .confirm-dialog__header,
  .confirm-dialog__footer {
    border-width: 2px;
  }
}
</style>