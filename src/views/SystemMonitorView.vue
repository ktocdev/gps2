<template>
  <div class="system-monitor-view">
    <SystemMonitor />
  </div>
</template>

<script setup lang="ts">
import SystemMonitor from '../components/debug/SystemMonitor.vue'
</script>

<style>
.system-monitor-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}
</style>