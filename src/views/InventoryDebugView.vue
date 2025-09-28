<template>
  <div class="inventory-debug-view">
    <InventoryDebug />
  </div>
</template>

<script setup lang="ts">
import InventoryDebug from '../components/debug/InventoryDebug.vue'
</script>

<style>
.inventory-debug-view {
  padding: var(--space-4);
  max-width: 1400px;
  margin: 0 auto;
}
</style>