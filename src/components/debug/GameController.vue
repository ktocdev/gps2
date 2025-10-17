<template>
  <div class="game-controller">
    <h2>Game Controller</h2>
    <!-- Pet Store Game Session -->
    <div class="mb-8">
      <div class="panel-row panel-row--grid-3 mb-4">
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
                {{ petStoreManager.activeGameSession ? 'Game in Session' : 'Adopt Guinea Pig(s)' }}
              </Button>
            </div>

            <!-- Needs Processing Control -->
            <div class="stats-grid mt-4">
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
            <h3>{{ petStoreManager.activeGameSession ? 'Active Guinea Pigs' : 'Select Guinea Pigs' }}</h3>
          </div>
          <div class="panel__content">
            <div class="guinea-pig-selection">
              <template v-if="petStoreManager.activeGameSession">
                <div class="form-field">
                  <label class="form-field__label">Guinea Pig 1</label>
                  <input
                    type="text"
                    :value="getGuineaPigName(selectedGuineaPig1)"
                    readonly
                    class="form-field__input form-field__input--readonly"
                  />
                </div>
                <div v-if="selectedGuineaPig2" class="form-field">
                  <label class="form-field__label">Guinea Pig 2</label>
                  <input
                    type="text"
                    :value="getGuineaPigName(selectedGuineaPig2)"
                    readonly
                    class="form-field__input form-field__input--readonly"
                  />
                </div>
              </template>
              <template v-else>
                <Select
                  v-model="selectedGuineaPig1"
                  :options="guineaPigOptions"
                  label="Guinea Pig 1"
                  placeholder="Select first guinea pig"
                  size="sm"
                />
                <Select
                  v-model="selectedGuineaPig2"
                  :options="guineaPig2Options"
                  label="Guinea Pig 2 (Optional)"
                  placeholder="Select second guinea pig"
                  size="sm"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-row panel-row--grid-3">
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
                <span class="stat-label">Is Orientation Paused:</span>
                <span class="stat-value">{{ gameController.isOrientationPaused }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings -->
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

        <!-- Tutorial -->
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
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">First Time User:</span>
                  <span class="stat-value">{{ gameController.gameState.isFirstTimeUser }}</span>
                </div>
              </div>
              <Button @click="resetFirstTimeUser" variant="tertiary" size="sm">
                Reset First Time User
              </Button>
            </div>
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
    // They exist in guineaPigStore.collection even if not in available/sanctuary
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

const getGuineaPigName = (id: string | number) => {
  if (!id) return ''
  const gp = guineaPigStore.collection.guineaPigs[String(id)]
  if (!gp) return 'Unknown'
  const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
  const prefix = isInSanctuary ? '✨ ' : '🎮 '
  return `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`
}

const guineaPigOptions = computed(() => {
  // Combine available, sanctuary, and active guinea pigs for selection
  const availableAndSanctuary = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.sanctuaryGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndSanctuary]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return allGuineaPigs.map(gp => {
    const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
    const isActive = activeGuineaPigs.some(a => a.id === gp.id)
    const prefix = isInSanctuary ? '✨ ' : isActive ? '🎮 ' : ''
    return {
      label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
      value: gp.id
    }
  })
})

const guineaPig2Options = computed(() => {
  // Combine available, sanctuary, and active guinea pigs for selection
  const availableAndSanctuary = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.sanctuaryGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndSanctuary]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return allGuineaPigs
    .filter(gp => gp.id !== selectedGuineaPig1.value)
    .map(gp => {
      const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
      const isActive = activeGuineaPigs.some(a => a.id === gp.id)
      const prefix = isInSanctuary ? '✨ ' : isActive ? '🎮 ' : ''
      return {
        label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
        value: gp.id
      }
    })
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
const tutorialOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'always_show', label: 'Always Show' },
  { value: 'never_show', label: 'Never Show' }
]

const performanceOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'reduced', label: 'Reduced' }
]

const tutorialMode = computed({
  get: () => gameController.settings.tutorial.mode,
  set: (value: string) => gameController.setTutorialMode(value as 'auto' | 'always_show' | 'never_show')
})

const performanceMode = computed({
  get: () => gameController.settings.performance.mode,
  set: (value: string) => gameController.setPerformanceMode(value as 'standard' | 'reduced')
})

// Settings Methods
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
  max-inline-size: 100%;
}

.guinea-pig-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>