<template>
  <div class="water-bottle" :class="fullnessClass">
    <span class="water-bottle__water">💧</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  waterLevel: number // 0-100
  bottleEmoji: string
}

const props = defineProps<Props>()

const fullnessClass = computed(() => {
  const level = props.waterLevel
  console.log('WaterBottle waterLevel:', level)
  if (level === 0) return 'water-bottle--empty'
  if (level <= 25) return 'water-bottle--low'
  if (level <= 50) return 'water-bottle--half'
  if (level <= 75) return 'water-bottle--three-quarters'
  return 'water-bottle--full'
})
</script>

<style>
.water-bottle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
}

.water-bottle__water {
  font-size: 3rem;
  line-height: 1;
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Water opacity based on fullness: fade out as it empties */
.water-bottle--empty .water-bottle__water {
  opacity: 0;
}

.water-bottle--low .water-bottle__water {
  opacity: 0.3;
  filter: brightness(0.8);
}

.water-bottle--half .water-bottle__water {
  opacity: 0.6;
  filter: brightness(0.9);
}

.water-bottle--three-quarters .water-bottle__water {
  opacity: 0.85;
  filter: brightness(1);
}

.water-bottle--full .water-bottle__water {
  opacity: 1;
  filter: brightness(1.1);
}
</style>
