<template>
  <div class="game-controller">
    <!-- Game State Display -->
    <div class="mb-8">
      <h2>Game State</h2>
      <div class="panel-row">
        <!-- Game Controls -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Game Controls</h3>
          </div>
          <div class="panel__content">
            <div class="controls-grid">
              <Button
                @click="gameController.startGame()"
                variant="primary"
                :disabled="!canStartGame"
                :title="!canStartGame ? 'Need guinea pig to start game' : 'Start the game'"
              >
                Start Game
              </Button>
              <Button
                @click="gameController.pauseGame('manual')"
                variant="secondary"
                :disabled="!canPauseGame"
                :title="!canPauseGame ? 'Game must be active to pause' : 'Pause the game'"
              >
                Pause Game
              </Button>
              <Button
                @click="gameController.resumeGame()"
                variant="secondary"
                :disabled="!canResumeGame"
                :title="!canResumeGame ? 'Game must be paused to resume' : 'Resume the game'"
              >
                Resume Game
              </Button>
              <Button
                @click="gameController.stopGame()"
                variant="danger"
                :disabled="!canStopGame"
                :title="!canStopGame ? 'Game must be active to stop' : 'Stop the game'"
              >
                Stop Game
              </Button>
            </div>
          </div>
        </div>

        <!-- Current State -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Current State</h3>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Game State:</span>
                <span class="stat-value">{{ gameController.gameState.currentState }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Pause Reason:</span>
                <span class="stat-value">{{ gameController.gameState.pauseReason || 'None' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Has Guinea Pig:</span>
                <span class="stat-value">{{ gameController.gameState.hasGuineaPig }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">First Time User:</span>
                <span class="stat-value">{{ gameController.gameState.isFirstTimeUser }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Save:</span>
                <span class="stat-value">{{ new Date(gameController.gameState.lastSaveTimestamp).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Computed Properties -->
        <div class="panel panel--border-secondary">
          <div class="panel__header">
            <h3>Computed Properties</h3>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Is Game Active:</span>
                <span class="stat-value">{{ gameController.isGameActive }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Is Paused:</span>
                <span class="stat-value">{{ gameController.isPaused }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Is Manually Paused:</span>
                <span class="stat-value">{{ gameController.isManuallyPaused }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Is Orientation Paused:</span>
                <span class="stat-value">{{ gameController.isOrientationPaused }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Display -->
    <div class="mb-8">
      <h2>Current Settings</h2>
      <div class="panel-row">
        <!-- Auto-Save Settings -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Auto-Save</h3>
          </div>
          <div class="panel__content">
            <div class="flex flex-column gap-3">
              <Select
                v-model="autoSaveFreq"
                @change="updateAutoSaveFreq"
                :options="autoSaveOptions"
                label="Auto-Save Frequency"
                size="sm"
              />
              <Button @click="gameController.toggleAutoSave()" variant="tertiary" size="sm">
                {{ gameController.settings.autoSave.enabled ? 'Disable' : 'Enable' }} Auto-Save
              </Button>
            </div>
          </div>
        </div>

        <!-- Tutorial Settings -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Tutorial</h3>
          </div>
          <div class="panel__content">
            <div class="flex flex-column gap-3">
              <Select
                v-model="tutorialMode"
                @change="updateTutorialMode"
                :options="tutorialOptions"
                label="Tutorial Mode"
                size="sm"
              />
              <Button @click="resetFirstTimeUser" variant="tertiary" size="sm">
                Reset First Time User
              </Button>
            </div>
          </div>
        </div>

        <!-- Performance & Error Reporting -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>System Settings</h3>
          </div>
          <div class="panel__content">
            <div class="flex flex-column gap-3">
              <Select
                v-model="performanceMode"
                @change="updatePerformanceMode"
                :options="performanceOptions"
                label="Performance Mode"
                size="sm"
              />
              <Button @click="gameController.toggleErrorReporting()" variant="tertiary" size="sm">
                {{ gameController.settings.errorReporting.enabled ? 'Disable' : 'Enable' }} Error Reporting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Store Data (Debug) -->
    <div class="mb-8">
      <h2>Raw Store Data (Debug)</h2>
      <div class="panel-row">
        <div class="panel panel--accent">
          <div class="panel__header">
            <h3>Game State</h3>
          </div>
          <div class="panel__content">
            <pre>{{ JSON.stringify(gameController.gameState, null, 2) }}</pre>
          </div>
        </div>
        <div class="panel panel--accent">
          <div class="panel__header">
            <h3>Settings</h3>
          </div>
          <div class="panel__content">
            <pre>{{ JSON.stringify(gameController.settings, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameController } from '../../stores/gameController'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

// Stores
const gameController = useGameController()

// Game Control State
const canStartGame = computed(() => {
  const currentState = gameController.gameState.currentState
  const hasGuineaPig = gameController.gameState.hasGuineaPig
  return (currentState === 'intro' || currentState === 'stopped') && hasGuineaPig
})

const canPauseGame = computed(() => {
  return gameController.gameState.currentState === 'playing'
})

const canResumeGame = computed(() => {
  return gameController.gameState.currentState === 'paused'
})

const canStopGame = computed(() => {
  const currentState = gameController.gameState.currentState
  return currentState === 'playing' || currentState === 'paused'
})

// Settings Management
const autoSaveOptions = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' }
]

const tutorialOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'always_show', label: 'Always Show' },
  { value: 'never_show', label: 'Never Show' }
]

const performanceOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'reduced', label: 'Reduced' }
]

const autoSaveFreq = computed({
  get: () => gameController.settings.autoSave.frequency,
  set: (value: number) => gameController.updateAutoSaveFrequency(value as 30 | 60 | 120)
})

const autoSaveFreqDisplay = computed(() => {
  const seconds = gameController.settings.autoSave.frequency
  if (seconds < 60) return `${seconds} seconds`
  const minutes = seconds / 60
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
})

const tutorialMode = computed({
  get: () => gameController.settings.tutorial.mode,
  set: (value: string) => gameController.setTutorialMode(value as 'auto' | 'always_show' | 'never_show')
})

const performanceMode = computed({
  get: () => gameController.settings.performance.mode,
  set: (value: string) => gameController.setPerformanceMode(value as 'standard' | 'reduced')
})

// Settings Methods
const updateAutoSaveFreq = () => {
  // Reactive value already updated through computed setter
}

const updateTutorialMode = () => {
  // Reactive value already updated through computed setter
}

const updatePerformanceMode = () => {
  // Reactive value already updated through computed setter
}

const resetFirstTimeUser = () => {
  gameController.updateSettings({
    tutorial: {
      ...gameController.settings.tutorial,
      isGlobalFirstTime: true
    }
  })
}

</script>

<style>
/* Game Controller Styles */
.game-controller {
  padding: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

.panel-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.gap-3 {
  gap: var(--space-3);
}

.mb-4 {
  margin-bottom: var(--space-4);
}

.mb-6 {
  margin-bottom: var(--space-6);
}

.mb-8 {
  margin-bottom: var(--space-8);
}

pre {
  background-color: var(--color-background-tertiary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

h2 {
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
}

h3 {
  margin: 0;
  color: var(--color-text-primary);
}

h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}
</style>