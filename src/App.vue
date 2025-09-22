<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useSaveGameManager } from './stores/saveGameManager'
import { useGuineaPigStore } from './stores/guineaPigStore'
import { useGameController } from './stores/gameController'

onMounted(() => {
  // Initialize stores in correct order to fix persistence issues

  // 1. Initialize Save Game Manager first (handles slot management)
  const saveGameManager = useSaveGameManager()
  saveGameManager.initializeStore()

  // 2. Initialize Guinea Pig Store (now with slot-specific persistence)
  const guineaPigStore = useGuineaPigStore()
  guineaPigStore.initializeStore()

  // 3. Initialize Game Controller (coordinates with guinea pig store)
  const gameController = useGameController()
  gameController.initializeStore()
})
</script>