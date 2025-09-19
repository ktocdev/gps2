<template>
  <div class="game-controller-view">
    <GameControllerTest />
  </div>
</template>

<script setup lang="ts">
import GameControllerTest from '../components/debug/GameControllerTest.vue'
</script>

<style>
.game-controller-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}
</style>