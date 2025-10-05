<template>
  <div class="game-controller">
    <!-- Pet Store Game Session -->
    <div class="mb-8">
      <h2>Pet Store Game Session</h2>
      <div class="panel-row">
        <!-- Session Controls -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Session Controls</h3>
          </div>
          <div class="panel__content">
            <div class="controls-grid">
              <Button
                @click="handleStartSession"
                variant="primary"
                :disabled="!canStartSession || !!petStoreManager.activeGameSession"
                :title="petStoreManager.activeGameSession ? 'Game session already active' : (!canStartSession ? 'Select 1-2 guinea pigs from pet store' : 'Start game session')"
              >
                {{ petStoreManager.activeGameSession ? 'Game in Session' : 'Start Session' }}
              </Button>
            </div>
            <Button
              @click="handleEndSession"
              variant="secondary"
              full-width
              class="mt-3"
              :disabled="!petStoreManager.activeGameSession"
              :title="!petStoreManager.activeGameSession ? 'No active session' : 'Return guinea pigs to store and end session'"
            >
              Return Guinea Pigs & End Session
            </Button>
          </div>
        </div>

        <!-- Session Status -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Session Status</h3>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Active Session:</span>
                <span class="stat-value">{{ petStoreManager.activeGameSession ? 'Yes' : 'No' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Guinea Pigs:</span>
                <span class="stat-value">{{ guineaPigStore.activeGuineaPigs.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Session Started:</span>
                <span class="stat-value">
                  {{ petStoreManager.activeGameSession
                    ? new Date(petStoreManager.activeGameSession.startedAt).toLocaleString()
                    : 'N/A' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Currency:</span>
                <span class="stat-value">{{ playerProgression.formattedCurrency }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Guinea Pig Selection -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Select Guinea Pigs</h3>
          </div>
          <div class="panel__content">
            <div class="guinea-pig-selection">
              <Select
                v-model="selectedGuineaPig1"
                :options="guineaPigOptions"
                label="Guinea Pig 1"
                placeholder="Select first guinea pig"
                :disabled="!!petStoreManager.activeGameSession"
                size="sm"
              />
              <Select
                v-model="selectedGuineaPig2"
                :options="guineaPig2Options"
                label="Guinea Pig 2 (Optional)"
                placeholder="Select second guinea pig"
                :disabled="!!petStoreManager.activeGameSession"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game State Display -->
    <div class="mb-8">
      <h2>Game State</h2>
      <div class="panel-row">
        <!-- Game State & Controls -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Game State & Controls</h3>
          </div>
          <div class="panel__content">
            <!-- Game Controls -->
            <div class="controls-grid">
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
            </div>

            <!-- Current State Stats -->
            <div class="stats-grid mt-4">
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

        <!-- System Controls -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>System Controls</h3>
          </div>
          <div class="panel__content">
            <!-- Needs Processing Control -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Needs Processing:</span>
                <span v-if="needsController.isPausedManually" class="stat-value text--warning">
                  Paused (Manual) ⚠️
                </span>
                <span v-else-if="!needsController.processingEnabled" class="stat-value text--muted">
                  Paused (Auto)
                </span>
                <span v-else class="stat-value text--success">
                  Active ✓
                </span>
              </div>
            </div>

            <Button
              @click="toggleNeedsProcessing"
              :variant="needsController.processingEnabled ? 'secondary' : 'primary'"
              :disabled="!petStoreManager.activeGameSession || gameController.isPaused"
              :title="!petStoreManager.activeGameSession ? 'No active session' : (gameController.isPaused ? 'Game is paused - needs processing controlled by game state' : '')"
              size="sm"
              full-width
              class="needs-processing-button mt-3"
            >
              {{ needsController.processingEnabled ? 'Pause Needs Processing' : 'Resume Needs Processing' }}
            </Button>

            <!-- Warning: Needs Manually Paused -->
            <div v-if="needsController.isPausedManually" class="panel__subpanel panel__subpanel--warning mt-3">
              <div class="panel__subpanel-content">
                <p class="panel__subpanel-text panel__subpanel-text--warning">
                  ⚠️ Needs manually paused in Needs System
                </p>
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
import { ref, computed, watch } from 'vue'
import { useGameController } from '../../stores/gameController'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useNeedsController } from '../../stores/needsController'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

// Stores
const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()
const playerProgression = usePlayerProgression()
const needsController = useNeedsController()

// Pet Store Session State
const selectedGuineaPig1 = ref<string | number>('')
const selectedGuineaPig2 = ref<string | number>('')

// Restore guinea pig selection from active session
watch([() => petStoreManager.activeGameSession], ([session]) => {
  if (session) {
    // Restore selection from active session
    // Active guinea pigs are always valid because they're stored in guineaPigStore.collection
    const sessionGuineaPigIds = session.guineaPigIds || []

    // Set guinea pig selections directly from session
    // They exist in guineaPigStore.collection even if not in available/favorites
    selectedGuineaPig1.value = sessionGuineaPigIds[0] || ''
    selectedGuineaPig2.value = sessionGuineaPigIds[1] || ''
  } else if (!session) {
    // No active session, clear selections
    selectedGuineaPig1.value = ''
    selectedGuineaPig2.value = ''
  }
}, { immediate: true })

const getGenderEmoji = (gender: 'male' | 'female') => {
  return gender === 'male' ? '♂️' : '♀️'
}

const guineaPigOptions = computed(() => {
  // Combine available, favorite, and active guinea pigs for selection
  const availableAndFavorites = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.favoriteGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndFavorites]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return [
    { label: 'None', value: '' },
    ...allGuineaPigs.map(gp => {
      const isFavorite = petStoreManager.favoriteGuineaPigs.some(f => f.id === gp.id)
      const isActive = activeGuineaPigs.some(a => a.id === gp.id)
      const prefix = isFavorite ? '⭐ ' : isActive ? '🎮 ' : ''
      return {
        label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
        value: gp.id
      }
    })
  ]
})

const guineaPig2Options = computed(() => {
  // Combine available, favorite, and active guinea pigs for selection
  const availableAndFavorites = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.favoriteGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndFavorites]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return [
    { label: 'None', value: '' },
    ...allGuineaPigs
      .filter(gp => gp.id !== selectedGuineaPig1.value)
      .map(gp => {
        const isFavorite = petStoreManager.favoriteGuineaPigs.some(f => f.id === gp.id)
        const isActive = activeGuineaPigs.some(a => a.id === gp.id)
        const prefix = isFavorite ? '⭐ ' : isActive ? '🎮 ' : ''
        return {
          label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
          value: gp.id
        }
      })
  ]
})

const canStartSession = computed(() => {
  return !petStoreManager.activeGameSession && selectedGuineaPig1.value !== ''
})

const handleStartSession = () => {
  const guineaPigIds: string[] = []
  if (selectedGuineaPig1.value && selectedGuineaPig1.value !== '') {
    guineaPigIds.push(String(selectedGuineaPig1.value))
  }
  if (selectedGuineaPig2.value && selectedGuineaPig2.value !== '') {
    guineaPigIds.push(String(selectedGuineaPig2.value))
  }

  if (guineaPigIds.length > 0) {
    petStoreManager.startGameSession(guineaPigIds)
  }
}

const handleEndSession = () => {
  petStoreManager.endGameSession()
  selectedGuineaPig1.value = ''
  selectedGuineaPig2.value = ''
}

// Game Control State
const canPauseGame = computed(() => {
  const hasActiveSession = petStoreManager.activeGameSession !== null
  return gameController.gameState.currentState === 'playing' && hasActiveSession
})

const canResumeGame = computed(() => {
  const hasActiveSession = petStoreManager.activeGameSession !== null
  return gameController.gameState.currentState === 'paused' && hasActiveSession
})

// System Controls
const toggleNeedsProcessing = () => {
  if (needsController.processingEnabled) {
    needsController.pauseProcessing(true) // Manual pause
  } else {
    needsController.resumeProcessing()
  }
}

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

.guinea-pig-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>