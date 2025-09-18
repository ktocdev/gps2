<template>
  <div>
    <h1>Game Controller Store Test</h1>

    <!-- Current State Display -->
    <div>
      <h2>Current State</h2>
      <p><strong>Game State:</strong> {{ gameController.gameState.currentState }}</p>
      <p><strong>Pause Reason:</strong> {{ gameController.gameState.pauseReason || 'None' }}</p>
      <p><strong>Has Guinea Pig:</strong> {{ gameController.gameState.hasGuineaPig }}</p>
      <p><strong>First Time User:</strong> {{ gameController.gameState.isFirstTimeUser }}</p>
      <p><strong>Last Save:</strong> {{ new Date(gameController.gameState.lastSaveTimestamp).toLocaleString() }}</p>
    </div>

    <!-- Computed Properties -->
    <div>
      <h2>Computed States</h2>
      <p><strong>Is Game Active:</strong> {{ gameController.isGameActive }}</p>
      <p><strong>Is Paused:</strong> {{ gameController.isPaused }}</p>
      <p><strong>Is Manually Paused:</strong> {{ gameController.isManuallyPaused }}</p>
      <p><strong>Is Orientation Paused:</strong> {{ gameController.isOrientationPaused }}</p>
    </div>

    <!-- State Control Buttons -->
    <div>
      <h2>State Controls</h2>
      <button @click="gameController.startGame()">Start Game</button>
      <button @click="gameController.pauseGame('manual')">Pause (Manual)</button>
      <button @click="gameController.pauseGame('orientation')">Pause (Orientation)</button>
      <button @click="gameController.resumeGame()">Resume Game</button>
      <button @click="gameController.stopGame()">Stop Game</button>
      <button @click="gameController.newGame()">New Game</button>
      <button @click="gameController.setGuineaPigCreated()">Create Guinea Pig</button>
    </div>

    <!-- Save/Load Controls -->
    <div>
      <h2>Save/Load Controls</h2>
      <button @click="saveGame">Save Game</button>
      <button @click="loadGame">Load Game</button>
      <button @click="clearSave">Clear Save Data</button>
      <p><strong>Save Result:</strong> {{ saveResult }}</p>
      <p><strong>Load Result:</strong> {{ loadResult }}</p>
    </div>

    <!-- Settings Display -->
    <div>
      <h2>Current Settings</h2>
      <div>
        <h3>Auto-Save</h3>
        <p><strong>Enabled:</strong> {{ gameController.settings.autoSave.enabled }}</p>
        <p><strong>Frequency:</strong> {{ gameController.settings.autoSave.frequency }} seconds</p>
        <button @click="gameController.toggleAutoSave()">Toggle Auto-Save</button>
        <select @change="updateAutoSaveFreq($event)" :value="gameController.settings.autoSave.frequency">
          <option value="30">30 seconds</option>
          <option value="60">60 seconds</option>
          <option value="120">120 seconds</option>
        </select>
      </div>

      <div>
        <h3>Tutorial</h3>
        <p><strong>Mode:</strong> {{ gameController.settings.tutorial.mode }}</p>
        <p><strong>Global First Time:</strong> {{ gameController.settings.tutorial.isGlobalFirstTime }}</p>
        <select @change="updateTutorialMode($event)" :value="gameController.settings.tutorial.mode">
          <option value="auto">Auto</option>
          <option value="always_show">Always Show</option>
          <option value="never_show">Never Show</option>
        </select>
      </div>

      <div>
        <h3>Performance</h3>
        <p><strong>Mode:</strong> {{ gameController.settings.performance.mode }}</p>
        <select @change="updatePerformanceMode($event)" :value="gameController.settings.performance.mode">
          <option value="standard">Standard</option>
          <option value="reduced">Reduced</option>
        </select>
      </div>

      <div>
        <h3>Error Reporting</h3>
        <p><strong>Enabled:</strong> {{ gameController.settings.errorReporting.enabled }}</p>
        <button @click="gameController.toggleErrorReporting()">Toggle Error Reporting</button>
      </div>
    </div>

    <!-- Raw Store Data -->
    <div>
      <h2>Raw Store Data (Debug)</h2>
      <pre>{{ JSON.stringify(gameController.gameState, null, 2) }}</pre>
      <pre>{{ JSON.stringify(gameController.settings, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()
const saveResult = ref<string>('')
const loadResult = ref<string>('')

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

const updateAutoSaveFreq = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const frequency = parseInt(target.value) as 30 | 60 | 120
  gameController.updateAutoSaveFrequency(frequency)
}

const updateTutorialMode = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const mode = target.value as 'auto' | 'always_show' | 'never_show'
  gameController.setTutorialMode(mode)
}

const updatePerformanceMode = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const mode = target.value as 'standard' | 'reduced'
  gameController.setPerformanceMode(mode)
}
</script>