<template>
  <div class="panel-grid">
    <!-- Test Controls Panel -->
    <div class="panel panel--primary">
      <div class="panel__header">
        <h3>Guinea Pig Creation Test Controls</h3>
      </div>
      <div class="panel__content">
        <!-- Quick Creation Testing -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Quick Creation Tests</h4>
          </div>
          <div class="panel__content">
            <div class="button-group">
              <Button @click="createTestPig('young')" variant="primary" size="sm">🐹 Young Pig</Button>
              <Button @click="createTestPig('adult')" variant="secondary" size="sm">🐹 Adult Pig</Button>
              <Button @click="createTestPig('senior')" variant="tertiary" size="sm">🐹 Senior Pig</Button>
              <Button @click="createTestPig('random')" variant="secondary" size="sm">🎲 Random Pig</Button>
            </div>
          </div>
        </div>

        <!-- Form Validation Testing -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Validation Testing</h4>
          </div>
          <div class="panel__content">
            <div class="button-group">
              <Button @click="testValidation('empty')" variant="warning" size="sm">✖ Empty Form</Button>
              <Button @click="testValidation('invalid_name')" variant="warning" size="sm">✖ Invalid Name</Button>
              <Button @click="testValidation('future_date')" variant="warning" size="sm">✖ Future Date</Button>
              <Button @click="testValidation('too_old')" variant="warning" size="sm">✖ Too Old</Button>
            </div>
          </div>
        </div>

        <!-- Navigation Testing -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Navigation & State Testing</h4>
          </div>
          <div class="panel__content">
            <div class="button-group">
              <Button @click="navigateToCreation" variant="primary" size="sm">➡️ Go to Creation</Button>
              <Button @click="resetGameState" variant="danger" size="sm">🔄 Reset Game State</Button>
              <Button @click="toggleTutorialMode" variant="tertiary" size="sm">📚 Toggle Tutorial</Button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Statistics Panel -->
    <div class="panel panel--secondary">
      <div class="panel__header">
        <h3>Creation Statistics</h3>
      </div>
      <div class="panel__content">
        <!-- Current Game State -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Current Game State</h4>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Game State:</span>
                <span class="stat-value">{{ gameController.gameState.currentState }}</span>
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
                <span class="stat-label">Tutorial Mode:</span>
                <span class="stat-value">{{ gameController.settings.tutorial.mode }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Statistics -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Test Statistics</h4>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Pigs Created:</span>
                <span class="stat-value">{{ testStats.pigsCreated }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Validation Tests:</span>
                <span class="stat-value">{{ testStats.validationTests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Test Type:</span>
                <span class="stat-value">{{ testStats.lastTestType || 'None' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Preferences Inspector -->
    <div class="panel panel--muted">
      <div class="panel__header">
        <h3>Last Generated Preferences (Debug Only)</h3>
      </div>
      <div class="panel__content">
        <div v-if="lastGeneratedPreferences">
          <!-- Food Preferences -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Food Preferences</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Preferred Hay:</span>
                  <span class="stat-value text-success">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.hay.preferred) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Hay:</span>
                  <span class="stat-value text-error">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.hay.disliked) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Vegetable:</span>
                  <span class="stat-value text-success">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.vegetables.preferred) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Vegetable:</span>
                  <span class="stat-value text-error">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.vegetables.disliked) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Fruit:</span>
                  <span class="stat-value text-success">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.fruits.preferred) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Fruit:</span>
                  <span class="stat-value text-error">{{ formatPreferenceName(lastGeneratedPreferences.foodPreferences.fruits.disliked) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Preferences -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Activity Preferences</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Preferred Interactions:</span>
                  <span class="stat-value text-success">{{ lastGeneratedPreferences.activityPreferences.interactions.map(formatPreferenceName).join(', ') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Toys:</span>
                  <span class="stat-value text-success">{{ lastGeneratedPreferences.activityPreferences.toys.map(formatPreferenceName).join(', ') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Environments:</span>
                  <span class="stat-value text-success">{{ lastGeneratedPreferences.activityPreferences.environments.map(formatPreferenceName).join(', ') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Interactions:</span>
                  <span class="stat-value text-error">{{ lastGeneratedPreferences.dislikedActivities.interactions.map(formatPreferenceName).join(', ') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Toys:</span>
                  <span class="stat-value text-error">{{ lastGeneratedPreferences.dislikedActivities.toys.map(formatPreferenceName).join(', ') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Environments:</span>
                  <span class="stat-value text-error">{{ lastGeneratedPreferences.dislikedActivities.environments.map(formatPreferenceName).join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="preferences-placeholder">
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Food Preferences</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Preferred Hay:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Hay:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Vegetable:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Vegetable:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Fruit:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Fruit:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Activity Preferences</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Preferred Interactions:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Toys:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Preferred Environments:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Interactions:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Toys:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Disliked Environments:</span>
                  <span class="stat-value text-muted">Not generated yet</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Test Output Log -->
    <div class="panel panel--debug">
      <div class="panel__header">
        <h3>Test Output Log</h3>
        <Button @click="clearTestLog" variant="tertiary" size="sm">🗑️ Clear</Button>
      </div>
      <div class="panel__content">
        <div class="test-log" ref="testLogContainer">
          <div
            v-for="(logEntry, index) in testLog"
            :key="index"
            class="test-log-entry"
            :class="`test-log-entry--${logEntry.type}`"
          >
            <span class="test-log-timestamp">{{ logEntry.timestamp }}</span>
            <span class="test-log-message">{{ logEntry.message }}</span>
          </div>
          <div v-if="testLog.length === 0" class="test-log-empty">
            No test output yet. Run some tests to see results here.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameController } from '../../stores/gameController'
import { useLoggingStore } from '../../stores/loggingStore'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

// Store instances
const gameController = useGameController()
const loggingStore = useLoggingStore()
const router = useRouter()

// Test state
const lastGeneratedPreferences = ref<any>(null)
const testLogContainer = ref<HTMLElement>()

// Test statistics
const testStats = ref({
  pigsCreated: 0,
  validationTests: 0,
  lastTestType: ''
})

// Test log
interface TestLogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const testLog = ref<TestLogEntry[]>([])

// Utility functions
const addToTestLog = (message: string, type: TestLogEntry['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  testLog.value.push({ timestamp, message, type })

  nextTick(() => {
    if (testLogContainer.value) {
      testLogContainer.value.scrollTop = testLogContainer.value.scrollHeight
    }
  })
}

const formatPreferenceName = (name: string): string => {
  return name.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const clearTestLog = () => {
  testLog.value = []
  addToTestLog('Test log cleared', 'info')
}

// Generate random name helper (shared with main component)
const generateRandomName = () => {
  const names = [
    'Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch', 'Cinnamon',
    'Pepper', 'Sugar', 'Honey', 'Mocha', 'Caramel', 'Biscuit',
    'Mochi', 'Truffle', 'Cookie', 'Marshmallow', 'Nugget', 'Pickles'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

// Preference generation (fixed to prevent duplicates)
const generateHiddenPreferences = () => {
  const hayTypes = ['timothy', 'orchard_grass', 'meadow_hay', 'alfalfa', 'oat_hay', 'botanical_hay', 'western_timothy', 'eastern_timothy']
  const vegetables = ['bell_pepper', 'carrot', 'cucumber', 'leafy_greens', 'broccoli', 'celery', 'tomato', 'zucchini', 'cauliflower', 'peas', 'corn', 'parsley']
  const fruits = ['apple', 'banana', 'strawberry', 'blueberry', 'grape', 'orange', 'pear', 'watermelon', 'cantaloupe', 'kiwi']

  const interactions = ['gentle_petting', 'brushing', 'holding', 'talking', 'singing', 'hand_feeding', 'lap_time', 'floor_time']
  const toys = ['tunnels', 'chew_toys', 'balls', 'hideouts', 'climbing_structures', 'foraging_toys', 'puzzle_feeders', 'bells']
  const environments = ['quiet_spaces', 'social_areas', 'elevated_spots', 'ground_level', 'covered_areas', 'open_spaces']

  const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5)

  // Shuffle each array once to prevent duplicates
  const shuffledHay = shuffleArray(hayTypes)
  const shuffledVegetables = shuffleArray(vegetables)
  const shuffledFruits = shuffleArray(fruits)
  const shuffledInteractions = shuffleArray(interactions)
  const shuffledToys = shuffleArray(toys)
  const shuffledEnvironments = shuffleArray(environments)

  return {
    foodPreferences: {
      hay: {
        preferred: shuffledHay[0],
        disliked: shuffledHay[1]
      },
      vegetables: {
        preferred: shuffledVegetables[0],
        disliked: shuffledVegetables[1]
      },
      fruits: {
        preferred: shuffledFruits[0],
        disliked: shuffledFruits[1]
      }
    },
    activityPreferences: {
      interactions: shuffledInteractions.slice(0, 3), // First 3 interactions
      toys: shuffledToys.slice(0, 2), // First 2 toys
      environments: shuffledEnvironments.slice(0, 2) // First 2 environments
    },
    dislikedActivities: {
      interactions: shuffledInteractions.slice(3, 5), // Next 2 interactions (no overlap)
      toys: shuffledToys.slice(2, 3), // Next 1 toy (no overlap)
      environments: shuffledEnvironments.slice(2, 3) // Next 1 environment (no overlap)
    }
  }
}

// Test functions
const createTestPig = (type: 'young' | 'adult' | 'senior' | 'random') => {
  const coatTypes = ['american', 'abyssinian', 'peruvian', 'silkie', 'teddy', 'rex']

  let age: number
  const name = generateRandomName() // Use real guinea pig names

  switch (type) {
    case 'young':
      age = Math.floor(Math.random() * 180) + 30 // 1-6 months
      break
    case 'adult':
      age = Math.floor(Math.random() * 365) + 365 // 1-2 years
      break
    case 'senior':
      age = Math.floor(Math.random() * 1095) + 1095 // 3-6 years
      break
    case 'random':
    default:
      age = Math.floor(Math.random() * 2190) + 30 // 1 month - 6 years
      break
  }

  const today = new Date()
  const birthdate = new Date(today.getTime() - (age * 24 * 60 * 60 * 1000))
  const gender = Math.random() > 0.5 ? 'sow' : 'boar'
  const coatType = coatTypes[Math.floor(Math.random() * coatTypes.length)]

  const preferences = generateHiddenPreferences()
  lastGeneratedPreferences.value = preferences

  // Simulate guinea pig creation
  gameController.setGuineaPigCreated()

  // Only transition to playing if not already playing
  if (gameController.gameState.currentState !== 'playing') {
    gameController.setState('playing')
  }

  testStats.value.pigsCreated++
  testStats.value.lastTestType = `Create ${type} pig`

  addToTestLog(`Created ${type} guinea pig: ${name} (${gender}, ${coatType}, ${age} days old)`, 'success')
  loggingStore.addPlayerAction(`Debug: Created test guinea pig "${name}"`, '🧪', {
    type,
    name,
    gender,
    coatType,
    age,
    preferences: 'generated'
  })
}

const testValidation = (type: 'empty' | 'invalid_name' | 'future_date' | 'too_old') => {
  testStats.value.validationTests++
  testStats.value.lastTestType = `Validation: ${type}`

  switch (type) {
    case 'empty':
      addToTestLog('Testing empty form validation - should show required field errors', 'warning')
      break
    case 'invalid_name':
      addToTestLog('Testing invalid name "@#$%!" - should show character validation error', 'warning')
      break
    case 'future_date':
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      addToTestLog(`Testing future birthdate ${futureDate.toISOString().split('T')[0]} - should show date error`, 'warning')
      break
    case 'too_old':
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 10)
      addToTestLog(`Testing too old birthdate ${oldDate.toISOString().split('T')[0]} - should show age error`, 'warning')
      break
  }

  loggingStore.addPlayerAction(`Debug: Tested ${type} validation`, '🧪', { validationType: type })
}

const navigateToCreation = () => {
  router.push('/create')
  addToTestLog('Navigated to guinea pig creation page', 'info')
  loggingStore.addPlayerAction('Debug: Navigated to creation page', '🧪', { action: 'navigation' })
}

const resetGameState = () => {
  gameController.newGame()
  testStats.value.pigsCreated = 0
  addToTestLog('Game state reset to intro mode', 'info')
  loggingStore.addPlayerAction('Debug: Game state reset', '🧪', { action: 'reset' })
}

const toggleTutorialMode = () => {
  const currentMode = gameController.settings.tutorial.mode
  const modes = ['auto', 'always_show', 'never_show']
  const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length]

  gameController.setTutorialMode(nextMode as any)
  addToTestLog(`Tutorial mode changed from ${currentMode} to ${nextMode}`, 'info')
  loggingStore.addPlayerAction(`Debug: Tutorial mode set to ${nextMode}`, '🧪', {
    previousMode: currentMode,
    newMode: nextMode
  })
}


// Initialize
addToTestLog('Guinea Pig Creation Debug Panel initialized', 'info')
</script>

<style>
/* Test log styles */
.test-log {
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
}

.test-log-entry {
  display: flex;
  gap: var(--space-2);
  margin-block-end: var(--space-1);
  padding-block: var(--space-1);
  border-radius: var(--radius-xs);
}

.test-log-entry--info {
  background-color: rgba(59, 130, 246, 0.1);
}

.test-log-entry--success {
  background-color: rgba(34, 197, 94, 0.1);
}

.test-log-entry--warning {
  background-color: rgba(245, 158, 11, 0.1);
}

.test-log-entry--error {
  background-color: rgba(239, 68, 68, 0.1);
}

.test-log-timestamp {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.test-log-message {
  color: var(--color-text-primary);
}

.test-log-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
  padding: var(--space-4);
}

/* Preferences placeholder styles */
.placeholder-message {
  text-align: center;
  padding: var(--space-4);
  margin-block-start: var(--space-3);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  border: 1px dashed var(--color-border-light);
}

.placeholder-message p {
  margin: 0;
  font-style: italic;
}
</style>