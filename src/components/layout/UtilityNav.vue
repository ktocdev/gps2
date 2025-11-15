<template>
  <nav class="utility-nav">
    <button
      @click="toggleGamePause"
      class="utility-nav__button"
      :disabled="!canTogglePause"
      :title="pauseButtonTitle"
    >
      {{ pauseButtonText }}
    </button>
    <button @click="clearAllStorage" class="utility-nav__button utility-nav__button--danger">
      ✨ Clear All Storage
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameController } from '../../stores/gameController'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useGameTimingStore } from '../../stores/gameTimingStore'

const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const habitatConditions = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const gameTimingStore = useGameTimingStore()

const canTogglePause = computed(() => {
  return petStoreManager.activeGameSession !== null
})

const pauseButtonText = computed(() => {
  if (gameController.isPaused) {
    return '▶️ Resume Game'
  }
  return '⏸️ Pause Game'
})

const pauseButtonTitle = computed(() => {
  if (!petStoreManager.activeGameSession) {
    return 'No active game session'
  }
  if (gameController.isPaused) {
    return 'Resume the game'
  }
  return 'Pause the game'
})

const toggleGamePause = () => {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame('manual')
  }
}

const clearAllStorage = () => {
  if (confirm('⚠️ This will clear ALL storage (localStorage + sessionStorage) and reload the page. Continue?')) {
    try {
      // 1. Stop game loop and all timers first to prevent state updates during clearing
      gameTimingStore.stopGameLoop()
      if (gameController.isGameActive) {
        gameController.stopGame()
      }

      // 2. Clear all habitat data and guinea pigs manually
      // This ensures the UI updates before the reload
      habitatConditions.habitatItems = []
      habitatConditions.itemPositions.clear()
      habitatConditions.poops = []
      habitatConditions.guineaPigPositions.clear()
      habitatConditions.bowlContents.clear()
      habitatConditions.hayRackContents.clear()

      // Clear all guinea pigs
      guineaPigStore.activeGuineaPigs.forEach(gp => {
        guineaPigStore.deleteGuineaPig(gp.id)
      })

      // 3. Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      // 4. Small delay to ensure state updates propagate to UI
      setTimeout(() => {
        // 5. Reload the page to reinitialize everything with fresh state
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error clearing storage:', error)
      // Fallback: just clear and reload immediately
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }
}
</script>

<style scoped>
/* Mobile-first: Default mobile layout - stacked vertically */
.utility-nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  justify-content: flex-end;
}

.utility-nav__button {
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

/* Tablet and up: Horizontal layout with larger buttons */
@media (min-width: 769px) {
  .utility-nav {
    flex-direction: row;
    align-items: center;
  }

  .utility-nav__button {
    padding-block: var(--space-2);
    padding-inline: var(--space-3);
    font-size: var(--font-size-sm);
  }
}

.utility-nav__button:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.utility-nav__button:disabled {
  background-color: var(--color-neutral-300);
  color: var(--color-text-muted);
  border-color: var(--color-border-medium);
  cursor: not-allowed;
  opacity: 0.6;
}

.utility-nav__button--danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
}

.utility-nav__button--danger:hover {
  background-color: var(--color-error-hover);
  border-color: var(--color-error-hover);
}

.utility-nav__button--danger:active {
  background-color: var(--color-error-active);
  border-color: var(--color-error-active);
}
</style>
