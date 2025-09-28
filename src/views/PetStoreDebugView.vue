<template>
  <div class="pet-store-debug-view">
    <PetStoreDebug />
  </div>
</template>

<script setup lang="ts">
import PetStoreDebug from '../components/debug/PetStoreDebug.vue'
</script>

<style>
.pet-store-debug-view {
  padding: var(--space-4);
  max-width: 1400px;
  margin: 0 auto;
}
</style>