<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useGuineaPigStore } from './stores/guineaPigStore'
import { useGameController } from './stores/gameController'
import { usePetStoreManager } from './stores/petStoreManager'
import { usePlayerProgression } from './stores/playerProgression'

onMounted(() => {
  // Initialize stores in correct order

  // 1. Initialize Player Progression (persistent state)
  const playerProgression = usePlayerProgression()
  playerProgression.initializeStore()

  // 2. Initialize Guinea Pig Store
  const guineaPigStore = useGuineaPigStore()
  guineaPigStore.initializeStore()

  // 3. Initialize Pet Store Manager
  const petStoreManager = usePetStoreManager()
  petStoreManager.initializeStore()

  // 4. Initialize Game Controller
  const gameController = useGameController()
  gameController.initializeStore()
})
</script>