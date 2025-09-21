<template>
  <div class="game-controller-view">
    <GameController />
  </div>
</template>

<script setup lang="ts">
import GameController from '../components/debug/GameController.vue'
</script>

<style>
.game-controller-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}
</style>