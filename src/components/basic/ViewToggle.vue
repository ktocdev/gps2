<template>
  <div class="view-toggle">
    <button
      class="view-toggle__button"
      :class="{ 'view-toggle__button--active': modelValue === 'card' }"
      @click="$emit('update:modelValue', 'card')"
      :aria-label="'Card view'"
      :aria-pressed="modelValue === 'card'"
    >
      <span class="view-toggle__icon">▦</span>
      <span class="view-toggle__label">Cards</span>
    </button>
    <button
      class="view-toggle__button"
      :class="{ 'view-toggle__button--active': modelValue === 'list' }"
      @click="$emit('update:modelValue', 'list')"
      :aria-label="'List view'"
      :aria-pressed="modelValue === 'list'"
    >
      <span class="view-toggle__icon">☰</span>
      <span class="view-toggle__label">List</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: 'card' | 'list'
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: 'card' | 'list']
}>()
</script>

<style>
.view-toggle {
  display: inline-flex;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}

.view-toggle__button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.view-toggle__button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.view-toggle__button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.view-toggle__button--active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.view-toggle__icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.view-toggle__label {
  line-height: 1;
}

/* Hide labels on small screens */
@media (max-width: 640px) {
  .view-toggle__label {
    display: none;
  }

  .view-toggle__button {
    padding: var(--space-2);
  }
}
</style>
