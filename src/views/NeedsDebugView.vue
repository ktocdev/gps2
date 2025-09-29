<template>
  <div class="needs-debug-view">
    <NeedsDebug />
  </div>
</template>

<script setup lang="ts">
import NeedsDebug from '../components/debug/NeedsDebug.vue'
</script>

<style scoped>
.needs-debug-view {
  container-type: inline-size;
  min-block-size: 100%;
  padding: 1rem;
}

@container (min-width: 768px) {
  .needs-debug-view {
    padding: 2rem;
  }
}
</style>