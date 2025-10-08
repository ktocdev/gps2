<template>
  <div class="personality-debug-view">
    <PersonalityDebug />
  </div>
</template>

<script setup lang="ts">
import PersonalityDebug from '../components/debug/PersonalityDebug.vue'
</script>

<style scoped>
.personality-debug-view {
  padding: var(--spacing-6);
}

@media (max-width: 768px) {
  .personality-debug-view {
    padding: var(--spacing-4);
  }
}
</style>
