<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useGuineaPigStore } from './stores/guineaPigStore'
import { useGameController } from './stores/gameController'

onMounted(() => {
  // Initialize stores in correct order

  // 1. Initialize Guinea Pig Store
  const guineaPigStore = useGuineaPigStore()
  guineaPigStore.initializeStore()

  // 2. Initialize Game Controller
  const gameController = useGameController()
  gameController.initializeStore()
})
</script>