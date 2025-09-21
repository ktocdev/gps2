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
          <h2>Computed States</h2>
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

    <!-- Controls Section -->
    <div class="panel-row mb-8">
      <!-- State Control Buttons -->
      <div class="panel">
        <div class="panel__header">
          <h2>State Controls</h2>
        </div>
        <div class="panel__content">
          <div class="button-grid">
            <Button
              @click="gameController.startGame()"
              variant="primary"
              :disabled="!canStartGame"
              :title="!canStartGame ? 'Requires guinea pig to be created first' : 'Start the game'"
            >
              Start Game
            </Button>
            <Button
              @click="gameController.pauseGame('manual')"
              variant="secondary"
              :disabled="!canPauseGame"
              :title="!canPauseGame ? 'Game must be playing to pause' : 'Pause the game manually'"
            >
              Pause (Manual)
            </Button>
            <Button
              @click="gameController.pauseGame('orientation')"
              variant="tertiary"
              :disabled="!canPauseGame"
              :title="!canPauseGame ? 'Game must be playing to pause' : 'Pause due to orientation change'"
            >
              Pause (Orientation)
            </Button>
            <Button
              @click="gameController.resumeGame()"
              variant="primary"
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
            <Button
              @click="gameController.newGame()"
              variant="tertiary"
              :disabled="!canStartNewGame"
              :title="!canStartNewGame ? 'Game must be stopped to start new' : 'Start a new game'"
            >
              New Game
            </Button>
            <Button
              @click="gameController.setGuineaPigCreated()"
              variant="secondary"
              :disabled="!canCreateGuineaPig"
              :title="!canCreateGuineaPig ? 'Guinea pig already exists' : 'Create guinea pig and start game'"
            >
              Create Guinea Pig & Start
            </Button>
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
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Save Result:</span>
              <span class="stat-value">{{ saveResult }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Load Result:</span>
              <span class="stat-value">{{ loadResult }}</span>
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
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">Enabled:</span>
                <span class="stat-value">{{ gameController.settings.autoSave.enabled }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Frequency:</span>
                <span class="stat-value">{{ gameController.settings.autoSave.frequency }} seconds</span>
              </div>
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
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">Mode:</span>
                <span class="stat-value">{{ gameController.settings.tutorial.mode }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Global First Time:</span>
                <span class="stat-value">{{ gameController.settings.tutorial.isGlobalFirstTime }}</span>
              </div>
            </div>
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
            <div class="mb-6">
              <h4>Performance</h4>
              <div class="stats-grid mb-4">
                <div class="stat-item">
                  <span class="stat-label">Mode:</span>
                  <span class="stat-value">{{ gameController.settings.performance.mode }}</span>
                </div>
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
                <div class="stats-grid mb-4">
                  <div class="stat-item">
                    <span class="stat-label">Enabled:</span>
                    <span class="stat-value">{{ gameController.settings.errorReporting.enabled }}</span>
                  </div>
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

    <!-- Guinea Pig Store Debug -->
    <div class="mb-8">
      <h2>Guinea Pig Store</h2>
      <div class="panel-row">
        <!-- Guinea Pig Collection -->
        <div class="panel panel--border-primary">
          <div class="panel__header">
            <h3>Collection</h3>
          </div>
          <div class="panel__content">
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">Count:</span>
                <span class="stat-value">{{ guineaPigStore.guineaPigCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Has Guinea Pigs:</span>
                <span class="stat-value">{{ guineaPigStore.hasGuineaPigs }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Can Add More:</span>
                <span class="stat-value">{{ guineaPigStore.canAddMoreGuineaPigs }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Guinea Pig:</span>
                <span class="stat-value">{{ guineaPigStore.activeGuineaPig?.name || 'None' }}</span>
              </div>
            </div>

            <!-- Guinea Pig List -->
            <div v-if="guineaPigStore.hasGuineaPigs" class="mb-4">
              <h4>Guinea Pigs:</h4>
              <div class="guinea-pig-list">
                <div
                  v-for="guineaPig in guineaPigStore.allGuineaPigs"
                  :key="guineaPig.id"
                  class="guinea-pig-item"
                  :class="{ 'guinea-pig-item--active': guineaPig.id === guineaPigStore.activeGuineaPig?.id }"
                >
                  <div class="guinea-pig-info">
                    <strong>{{ guineaPig.name }}</strong>
                    <span class="guinea-pig-details">
                      {{ guineaPig.gender }} • {{ guineaPig.breed }} • Level {{ guineaPig.stats.level }}
                    </span>
                  </div>
                  <div class="guinea-pig-actions">
                    <Button
                      @click="setActiveGuineaPig(guineaPig.id)"
                      variant="tertiary"
                      size="sm"
                      :disabled="guineaPig.id === guineaPigStore.activeGuineaPig?.id"
                    >
                      Set Active
                    </Button>
                    <Button
                      @click="deleteGuineaPig(guineaPig.id)"
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Store Actions -->
            <div class="flex flex-column gap-3">
              <Button @click="createTestGuineaPig" variant="primary">
                Create Test Guinea Pig
              </Button>
              <Button @click="clearAllGuineaPigs" variant="danger">
                Clear All Guinea Pigs
              </Button>
            </div>
          </div>
        </div>

        <!-- Active Guinea Pig Details -->
        <div class="panel panel--border-secondary">
          <div class="panel__header">
            <h3>{{ guineaPigStore.activeGuineaPig?.name || 'Guinea Pig' }} Details</h3>
          </div>
          <div class="panel__content">
            <div v-if="guineaPigStore.activeGuineaPig" class="guinea-pig-details-grid">
              <!-- Basic Info -->
              <div class="detail-section">
                <h4>Basic Info</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">ID:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.id.slice(-8) }}...</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Days in Game:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.stats.age }} days</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Weight:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.stats.weight }}g</span>
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="detail-section">
                <h4>Stats</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Wellness:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.stats.wellness }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Overall Mood:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.stats.overallMood }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.stats.level }}</span>
                  </div>
                </div>
              </div>

              <!-- Needs (All 7 Categories) -->
              <div class="detail-section detail-section--wide">
                <h4>Needs (7 Categories)</h4>
                <div class="stats-grid stats-grid--needs">
                  <div class="stat-item">
                    <span class="stat-label">Hunger:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.hunger }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Thirst:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.thirst }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Happiness:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.happiness }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Cleanliness:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.cleanliness }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Health:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.health }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Energy:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.energy }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Social:</span>
                    <span class="stat-value">{{ guineaPigStore.activeGuineaPig.needs.social }}/100</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Placeholder when no guinea pig exists -->
            <div v-else class="guinea-pig-details-grid">
              <!-- Basic Info Placeholder -->
              <div class="detail-section">
                <h4>Basic Info</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">ID:</span>
                    <span class="stat-value stat-value--placeholder">--</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Days in Game:</span>
                    <span class="stat-value stat-value--placeholder">-- days</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Weight:</span>
                    <span class="stat-value stat-value--placeholder">--g</span>
                  </div>
                </div>
              </div>

              <!-- Stats Placeholder -->
              <div class="detail-section">
                <h4>Stats</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Wellness:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Overall Mood:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value stat-value--placeholder">--</span>
                  </div>
                </div>
              </div>

              <!-- Needs Placeholder (All 7 Categories) -->
              <div class="detail-section detail-section--wide">
                <h4>Needs (7 Categories)</h4>
                <div class="stats-grid stats-grid--needs">
                  <div class="stat-item">
                    <span class="stat-label">Hunger:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Thirst:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Happiness:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Cleanliness:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Health:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Energy:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Social:</span>
                    <span class="stat-value stat-value--placeholder">--/100</span>
                  </div>
                </div>
              </div>
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
        <div class="panel panel--accent">
          <div class="panel__header">
            <h3>Guinea Pig Store</h3>
          </div>
          <div class="panel__content">
            <pre>{{ JSON.stringify(guineaPigStore.collection, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameController } from '../../stores/gameController'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

const gameController = useGameController()
const guineaPigStore = useGuineaPigStore()
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

// Button state computations based on valid transitions
const canStartGame = computed(() => {
  const currentState = gameController.gameState.currentState
  const hasGuineaPig = gameController.gameState.hasGuineaPig
  return (currentState === 'intro' || currentState === 'stopped') && hasGuineaPig
})

const canPauseGame = computed(() => {
  const currentState = gameController.gameState.currentState
  const hasGuineaPig = gameController.gameState.hasGuineaPig
  return currentState === 'playing' && hasGuineaPig
})

const canResumeGame = computed(() => {
  const currentState = gameController.gameState.currentState
  const hasGuineaPig = gameController.gameState.hasGuineaPig
  return currentState === 'paused' && hasGuineaPig
})

const canStopGame = computed(() => {
  const currentState = gameController.gameState.currentState
  const hasGuineaPig = gameController.gameState.hasGuineaPig
  return (currentState === 'playing' || currentState === 'paused') && hasGuineaPig
})

const canStartNewGame = computed(() => {
  const currentState = gameController.gameState.currentState
  return currentState === 'stopped' || currentState === 'intro'
})

const canCreateGuineaPig = computed(() => {
  return !gameController.gameState.hasGuineaPig
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
  localStorage.removeItem('gps2-guinea-pig-store')
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

const resetFirstTimeUser = () => {
  gameController.updateSettings({
    tutorial: {
      ...gameController.settings.tutorial,
      isGlobalFirstTime: true
    }
  })
}

// Guinea pig store debug functions
const createTestGuineaPig = () => {
  const testNames = ['Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch']
  const testBreeds = ['american', 'abyssinian', 'peruvian', 'silkie', 'teddy']
  const testGenders = ['male', 'female'] as const

  const randomName = testNames[Math.floor(Math.random() * testNames.length)]
  const randomBreed = testBreeds[Math.floor(Math.random() * testBreeds.length)]
  const randomGender = testGenders[Math.floor(Math.random() * testGenders.length)]

  try {
    const id = gameController.createGuineaPig(randomName, randomGender, randomBreed)
    console.log('Created test guinea pig:', id)
  } catch (error) {
    console.error('Failed to create test guinea pig:', error)
  }
}

const setActiveGuineaPig = (id: string) => {
  guineaPigStore.setActiveGuineaPig(id)
}

const deleteGuineaPig = (id: string) => {
  const guineaPig = guineaPigStore.getGuineaPig(id)
  if (guineaPig && confirm(`Are you sure you want to delete ${guineaPig.name}?`)) {
    guineaPigStore.deleteGuineaPig(id)
  }
}

const clearAllGuineaPigs = () => {
  if (confirm('Are you sure you want to delete all guinea pigs? This cannot be undone.')) {
    // Clear all guinea pigs from the store
    guineaPigStore.collection.guineaPigs = {}
    guineaPigStore.collection.activeGuineaPigId = null
    guineaPigStore.collection.lastUpdated = Date.now()

    // Update game controller state
    gameController.gameState.hasGuineaPig = false
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

/* Guinea Pig Debug Styles */
.guinea-pig-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.guinea-pig-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.guinea-pig-item--active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.guinea-pig-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.guinea-pig-details {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.guinea-pig-actions {
  display: flex;
  gap: var(--space-2);
}

.guinea-pig-details-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .guinea-pig-details-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

.detail-section {
  padding: var(--space-3);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.detail-section h4 {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.detail-section--wide {
  grid-column: 1 / -1;
}

.stats-grid--needs {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

@media (min-width: 768px) {
  .stats-grid--needs {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

/* Placeholder styles */
.stat-value--placeholder {
  color: var(--color-text-muted);
  font-style: italic;
  opacity: 0.7;
}
</style>