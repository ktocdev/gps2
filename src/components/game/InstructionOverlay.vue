<script setup lang="ts">
defineProps<{
  message: string
  theme: 'pink' | 'green'
}>()
</script>

<template>
  <div
    class="instruction-overlay"
    :class="`instruction-overlay--${theme}`"
  >
    {{ message }}
  </div>
</template>
