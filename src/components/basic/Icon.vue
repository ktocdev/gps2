<template>
  <Icon :icon="iconName" :class="iconClasses" :inline="inline" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

interface Props {
  icon: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  inline: false
})

// Automatically prefix with flowbite if no prefix provided
const iconName = computed(() => {
  return props.icon.includes(':') ? props.icon : `flowbite:${props.icon}`
})

const iconClasses = computed(() => {
  const base = 'icon'
  const size = `icon--${props.size}`
  return [base, size].filter(Boolean).join(' ')
})
</script>

<style>
.icon {
  display: inline-block;
  vertical-align: middle;
}

.icon--xs {
  font-size: 12px;
  inline-size: 12px;
  block-size: 12px;
}

.icon--sm {
  font-size: 16px;
  inline-size: 16px;
  block-size: 16px;
}

.icon--md {
  font-size: 20px;
  inline-size: 20px;
  block-size: 20px;
}

.icon--lg {
  font-size: 24px;
  inline-size: 24px;
  block-size: 24px;
}

.icon--xl {
  font-size: 32px;
  inline-size: 32px;
  block-size: 32px;
}
</style>
