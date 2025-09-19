<template>
  <div class="logging-system-view">
    <LoggingSystemTest />
  </div>
</template>

<script setup lang="ts">
import LoggingSystemTest from '../components/debug/LoggingSystemTest.vue'
</script>

<style>
.logging-system-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}
</style>