<template>
  <div :class="sliderWrapperClasses">
    <label v-if="label" :for="sliderId" class="slider__label">
      {{ label }}
      <span v-if="showValue" class="slider__value">{{ prefix }}{{ modelValue }}{{ suffix }}</span>
    </label>
    <input
      :id="sliderId"
      type="range"
      :class="sliderClasses"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="handleInput"
    />
    <div v-if="showMinMax" class="slider__range">
      <span class="slider__min">{{ min }}</span>
      <span class="slider__max">{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
  showValue?: boolean
  showMinMax?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefix?: string
  suffix?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
  showMinMax: false,
  size: 'md',
  prefix: '',
  suffix: ''
})

const emit = defineEmits<Emits>()

const instance = getCurrentInstance()
const sliderId = computed(() => `slider-${instance?.uid || Math.random().toString(36).substr(2, 9)}`)

const sliderWrapperClasses = computed(() => {
  const base = 'slider'
  const size = `slider--${props.size}`
  const disabled = props.disabled ? 'slider--disabled' : ''

  return [base, size, disabled].filter(Boolean).join(' ')
})

const sliderClasses = computed(() => {
  return 'slider__input'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)

  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style>
.slider {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
}

.slider__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-block-end: var(--space-2);
  line-height: var(--line-height-tight);
}

.slider__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.slider__input {
  inline-size: 100%;
  block-size: 6px;
  background: transparent;
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
}

.slider__input::-webkit-slider-runnable-track {
  inline-size: 100%;
  block-size: 6px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
}

.slider__input::-moz-range-track {
  inline-size: 100%;
  block-size: 6px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
  border: none;
}

.slider__input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  inline-size: 18px;
  block-size: 18px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-block-start: -6px;
}

.slider__input::-moz-range-thumb {
  inline-size: 18px;
  block-size: 18px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.slider__input::-webkit-slider-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.slider__input::-moz-range-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.slider__input:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
}

.slider__input:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
}

.slider__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider__input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider__input:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

.slider__range {
  display: flex;
  justify-content: space-between;
  margin-block-start: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.slider--sm .slider__input {
  block-size: 4px;
}

.slider--sm .slider__input::-webkit-slider-runnable-track {
  block-size: 4px;
}

.slider--sm .slider__input::-moz-range-track {
  block-size: 4px;
}

.slider--sm .slider__input::-webkit-slider-thumb {
  inline-size: 14px;
  block-size: 14px;
  margin-block-start: -5px;
}

.slider--sm .slider__input::-moz-range-thumb {
  inline-size: 14px;
  block-size: 14px;
}

.slider--lg .slider__input {
  block-size: 8px;
}

.slider--lg .slider__input::-webkit-slider-runnable-track {
  block-size: 8px;
}

.slider--lg .slider__input::-moz-range-track {
  block-size: 8px;
}

.slider--lg .slider__input::-webkit-slider-thumb {
  inline-size: 22px;
  block-size: 22px;
  margin-block-start: -7px;
}

.slider--lg .slider__input::-moz-range-thumb {
  inline-size: 22px;
  block-size: 22px;
}

.slider--disabled .slider__label {
  color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .slider__input,
  .slider__input::-webkit-slider-thumb,
  .slider__input::-moz-range-thumb {
    transition: none;
  }
}
</style>