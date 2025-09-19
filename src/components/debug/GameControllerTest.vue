<template>
  <div class="container">
    <h1>Game Controller Store Test</h1>

    <!-- State Information Section -->
    <div class="panel-row mb-8">
      <!-- Current State Display -->
      <div class="panel panel--border-primary">
        <div class="panel__header">
          <h2>Current State</h2>
        </div>
        <div class="panel__content">
          <div class="flex flex-column gap-2">
            <p><span class="text-label">Game State:</span> {{ gameController.gameState.currentState }}</p>
            <p><span class="text-label">Pause Reason:</span> {{ gameController.gameState.pauseReason || 'None' }}</p>
            <p><span class="text-label">Has Guinea Pig:</span> {{ gameController.gameState.hasGuineaPig }}</p>
            <p><span class="text-label">First Time User:</span> {{ gameController.gameState.isFirstTimeUser }}</p>
            <p><span class="text-label">Last Save:</span> {{ new Date(gameController.gameState.lastSaveTimestamp).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Computed Properties -->
      <div class="panel panel--border-secondary">
        <div class="panel__header">
          <h2>Computed States</h2>
        </div>
        <div class="panel__content">
          <div class="flex flex-column gap-2">
            <p><span class="text-label">Is Game Active:</span> {{ gameController.isGameActive }}</p>
            <p><span class="text-label">Is Paused:</span> {{ gameController.isPaused }}</p>
            <p><span class="text-label">Is Manually Paused:</span> {{ gameController.isManuallyPaused }}</p>
            <p><span class="text-label">Is Orientation Paused:</span> {{ gameController.isOrientationPaused }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="panel-row mb-8">
      <!-- State Control Buttons -->
      <div class="panel">
        <div class="panel__header">
          <h2>State Controls</h2>
        </div>
        <div class="panel__content">
          <div class="button-grid">
            <Button @click="gameController.startGame()" variant="primary">Start Game</Button>
            <Button @click="gameController.pauseGame('manual')" variant="secondary">Pause (Manual)</Button>
            <Button @click="gameController.pauseGame('orientation')" variant="tertiary">Pause (Orientation)</Button>
            <Button @click="gameController.resumeGame()" variant="primary">Resume Game</Button>
            <Button @click="gameController.stopGame()" variant="danger">Stop Game</Button>
            <Button @click="gameController.newGame()" variant="tertiary">New Game</Button>
            <Button @click="gameController.setGuineaPigCreated()" variant="secondary">Create Guinea Pig</Button>
          </div>
        </div>
      </div>

      <!-- Save/Load Controls -->
      <div class="panel">
        <div class="panel__header">
          <h2>Save/Load Controls</h2>
        </div>
        <div class="panel__content">
          <div class="flex flex-column gap-3">
            <div class="flex flex-row gap-3 flex-wrap">
              <Button @click="saveGame" variant="primary">Save Game</Button>
              <Button @click="loadGame" variant="secondary">Load Game</Button>
              <Button @click="clearSave" variant="danger">Clear Save Data</Button>
            </div>
          </div>
        </div>
        <div class="panel__footer">
          <div class="flex flex-column gap-1">
            <p><span class="text-label">Save Result:</span> {{ saveResult }}</p>
            <p><span class="text-label">Load Result:</span> {{ loadResult }}</p>
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
            <div class="flex flex-column gap-2 mb-4">
              <p><span class="text-label">Enabled:</span> {{ gameController.settings.autoSave.enabled }}</p>
              <p><span class="text-label">Frequency:</span> {{ gameController.settings.autoSave.frequency }} seconds</p>
            </div>
            <div class="flex flex-column gap-3">
              <Select
                v-model="autoSaveFreq"
                @change="updateAutoSaveFreq"
                :options="autoSaveOptions"
                label="Auto-Save Frequency"
                size="sm"
              />
              <Button @click="gameController.toggleAutoSave()" variant="tertiary" size="sm">
                Toggle Auto-Save
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
            <div class="flex flex-column gap-2 mb-4">
              <p><span class="text-label">Mode:</span> {{ gameController.settings.tutorial.mode }}</p>
              <p><span class="text-label">Global First Time:</span> {{ gameController.settings.tutorial.isGlobalFirstTime }}</p>
            </div>
            <Select
              v-model="tutorialMode"
              @change="updateTutorialMode"
              :options="tutorialOptions"
              label="Tutorial Mode"
              size="sm"
            />
          </div>
        </div>

        <!-- Performance & Error Reporting -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>System Settings</h3>
          </div>
          <div class="panel__content">
            <div class="mb-6">
              <h4>Performance</h4>
              <div class="flex flex-column gap-2 mb-4">
                <p><span class="text-label">Mode:</span> {{ gameController.settings.performance.mode }}</p>
              </div>
              <Select
                v-model="performanceMode"
                @change="updatePerformanceMode"
                :options="performanceOptions"
                label="Performance Mode"
                size="sm"
              />
            </div>

            <div class="flex flex-column gap-3">
              <div>
                <h4>Error Reporting</h4>
                <div class="flex flex-column gap-2 mb-4">
                  <p><span class="text-label">Enabled:</span> {{ gameController.settings.errorReporting.enabled }}</p>
                </div>
              </div>
              <Button @click="gameController.toggleErrorReporting()" variant="tertiary" size="sm">
                Toggle Error Reporting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Store Data -->
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
import { ref, onMounted, computed } from 'vue'
import { useGameController } from '../../stores/gameController'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

const gameController = useGameController()
const saveResult = ref<string>('')
const loadResult = ref<string>('')

// Select options
const autoSaveOptions = [
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 },
  { label: '120 seconds', value: 120 }
]

const tutorialOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Always Show', value: 'always_show' },
  { label: 'Never Show', value: 'never_show' }
]

const performanceOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Reduced', value: 'reduced' }
]

// Computed values for two-way binding
const autoSaveFreq = computed({
  get: () => gameController.settings.autoSave.frequency,
  set: (value: number) => gameController.updateAutoSaveFrequency(value as 30 | 60 | 120)
})

const tutorialMode = computed({
  get: () => gameController.settings.tutorial.mode,
  set: (value: string) => gameController.setTutorialMode(value as 'auto' | 'always_show' | 'never_show')
})

const performanceMode = computed({
  get: () => gameController.settings.performance.mode,
  set: (value: string) => gameController.setPerformanceMode(value as 'standard' | 'reduced')
})

onMounted(() => {
  // Initialize the Game Controller Store
  gameController.initializeStore()
})

const saveGame = () => {
  const result = gameController.saveGame()
  saveResult.value = result ? 'Success' : 'Failed'
}

const loadGame = () => {
  const result = gameController.loadGame()
  loadResult.value = result ? 'Success' : 'Failed'
}

const clearSave = () => {
  localStorage.removeItem('gps2-save')
  localStorage.removeItem('gps2-game-controller')
  saveResult.value = 'Save data cleared'
  loadResult.value = ''
}

const updateAutoSaveFreq = (value: string | number) => {
  if (typeof value === 'number') {
    gameController.updateAutoSaveFrequency(value as 30 | 60 | 120)
  }
}

const updateTutorialMode = (value: string | number) => {
  if (typeof value === 'string') {
    gameController.setTutorialMode(value as 'auto' | 'always_show' | 'never_show')
  }
}

const updatePerformanceMode = (value: string | number) => {
  if (typeof value === 'string') {
    gameController.setPerformanceMode(value as 'standard' | 'reduced')
  }
}
</script>

<style>
/* Button Grid Layout */
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-3);
}

@media (min-width: 640px) {
  .button-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-4);
  }
}

/* Section spacing */
.test-section {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.test-section h2 {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-4);
}

.test-section h3 {
  color: var(--color-secondary);
  margin-top: var(--space-4);
}

/* Status displays */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.status-item {
  background-color: var(--color-bg-primary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.status-item strong {
  color: var(--color-text-primary);
}
</style>