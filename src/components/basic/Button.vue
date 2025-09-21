<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const base = 'button'
  const variant = `button--${props.variant}`
  const size = `button--${props.size}`
  const fullWidth = props.fullWidth ? 'button--full-width' : ''
  const disabled = props.disabled ? 'button--disabled' : ''

  return [base, variant, size, fullWidth, disabled].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style>
/* Button Component - BEM Methodology */

/* Base Button Styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-decoration: none;
  border: 1px solid transparent;
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  line-height: var(--line-height-tight);
}

.button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled,
.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Button Variants */

/* Primary Variant (Pink) */
.button--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--primary:active:not(:disabled) {
  background-color: var(--color-primary-active);
  border-color: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary Variant (Light Green) */
.button--secondary {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
  border-color: var(--color-secondary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--secondary:active:not(:disabled) {
  background-color: var(--color-secondary-active);
  border-color: var(--color-secondary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Tertiary Variant (Neutral/Outline) */
.button--tertiary {
  background-color: transparent;
  border-color: var(--color-border-medium);
  color: var(--color-text-primary);
}

.button--tertiary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.button--tertiary:active:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  transform: translateY(0);
}

/* Danger Variant */
.button--danger {
  background-color: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.button--danger:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--danger:active:not(:disabled) {
  background-color: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Warning Variant - Orange */
.button--warning {
  background-color: #ea580c; /* Orange with good contrast */
  border-color: #ea580c;
  color: white;
}

.button--warning:hover:not(:disabled) {
  background-color: #c2410c; /* Darker orange on hover */
  border-color: #c2410c;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--warning:active:not(:disabled) {
  background-color: #9a3412; /* Darkest orange on active */
  border-color: #9a3412;
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Button Sizes */

/* Small Size - Mobile First */
.button--sm {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  font-size: var(--font-size-sm);
  min-block-size: 40px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-base);
  border-start-end-radius: var(--radius-base);
  border-end-start-radius: var(--radius-base);
  border-end-end-radius: var(--radius-base);
}

/* Medium Size (Default) - Mobile First */
.button--md {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  font-size: var(--font-size-base);
  min-block-size: 44px; /* iOS minimum touch target */
}

/* Large Size - Mobile First */
.button--lg {
  padding-block: var(--space-4);
  padding-inline: var(--space-6);
  font-size: var(--font-size-lg);
  min-block-size: 48px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
}

/* Button Modifiers */

/* Full Width */
.button--full-width {
  inline-size: 100%;
}

/* Enhanced styling for larger screens */
@media (min-width: 641px) {
  /* Add any larger screen enhancements here if needed */
}

/* Focus visible for better accessibility */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .button {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button:hover:not(:disabled) {
    transform: none;
  }

  .button:active:not(:disabled) {
    transform: none;
  }
}</style>