<template>
  <div class="habitat-3d-debug debug-view__constrained" :class="{ 'habitat-3d-debug--fullscreen': isFullscreen }">
    <!-- Fullscreen header (only visible in fullscreen mode) -->
    <div v-if="isFullscreen" class="habitat-3d-debug__fullscreen-header">
      <h2 class="habitat-3d-debug__title">3D Habitat</h2>
      <div class="habitat-3d-debug__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause()"
        >
          {{ gameController.isPaused ? '▶️ Resume Game' : '⏸️ Pause Game' }}
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          Exit Fullscreen
        </button>
      </div>
    </div>

    <!-- Normal header (hidden in fullscreen mode) -->
    <div v-if="!isFullscreen" class="habitat-3d-debug__header">
      <h2>3D Habitat View</h2>
      <div v-if="hasActiveSession && !is2DMode" class="habitat-3d-debug__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause()"
        >
          {{ gameController.isPaused ? '▶️ Resume' : '⏸️ Pause' }}
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          ⛶ Enter Fullscreen
        </button>
      </div>
    </div>

    <!-- No Active Session Message -->
    <div v-if="!hasActiveSession" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see the 3D habitat.</p>
      </div>
    </div>

    <!-- Wrong View Mode Message -->
    <div v-else-if="is2DMode" class="panel panel--compact panel--info mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">This game was started in 2D mode</p>
        <p class="text-label--small">Visit the 2D Habitat Debug view to see this game session.</p>
      </div>
    </div>

    <!-- Game View (production game component) -->
    <div v-else class="panel panel--full-width">
      <div class="panel__content">
        <GameView
          :is-fullscreen="isFullscreen"
          @toggle-fullscreen="toggleFullscreen"
          @toggle-pause="handleTogglePause"
        />
      </div>
    </div>

    <!-- Needs Panel (debug only - below 3D canvas) -->
    <div v-if="hasActiveSession && !is2DMode && !isFullscreen" class="habitat-3d-debug__needs-row">
      <NeedsPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import GameView from '../../game/GameView.vue'
import NeedsPanel from './NeedsPanel.vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGameViewStore } from '../../../stores/gameViewStore'
import { useGameController } from '../../../stores/gameController'

// Stores
const guineaPigStore = useGuineaPigStore()
const petStoreManager = usePetStoreManager()
const gameViewStore = useGameViewStore()
const gameController = useGameController()

// State
const isFullscreen = ref(false)

// Computed
const hasActiveSession = computed(() => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0)
const is2DMode = computed(() => gameViewStore.mode === '2d')

/**
 * Toggle fullscreen mode - hides debug header/nav for immersive view
 */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.body.classList.add('habitat-fullscreen')
  } else {
    document.body.classList.remove('habitat-fullscreen')
  }
}

/**
 * Handle pause toggle from GameView
 */
function handleTogglePause(silent?: boolean) {
  togglePause(silent)
}

/**
 * Toggle game pause state
 */
function togglePause(silent = false) {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame(silent ? 'silent' : 'manual')
  }
}

// Cleanup fullscreen mode on unmount
onUnmounted(() => {
  if (isFullscreen.value) {
    document.body.classList.remove('habitat-fullscreen')
  }
})
</script>

<style>
/* Debug wrapper styles - kept separate from GameView */

/* Header row (debug-specific) */
.habitat-3d-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--spacing-md);
}

.habitat-3d-debug__header h2 {
  margin: 0;
}

.habitat-3d-debug__header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Fullscreen mode header */
.habitat-3d-debug__fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--spacing-sm);
  padding-inline: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.habitat-3d-debug__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Needs row (debug-only, below game view) */
.habitat-3d-debug__needs-row {
  margin-block-start: var(--spacing-md);
  max-inline-size: 400px;
}

/* Fullscreen mode adjustments */
.habitat-3d-debug--fullscreen {
  max-inline-size: none;
  background-color: #111;
}

/* Landscape mobile optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .habitat-3d-debug__fullscreen-header {
    padding-block: var(--spacing-xs);
    padding-inline: var(--spacing-sm);
  }

  .habitat-3d-debug__title {
    font-size: var(--font-size-md);
  }

  .habitat-3d-debug__header-actions .utility-nav__button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}
</style>
