<template>
  <div class="panel-grid panel-grid--padded">
    <!-- Welcome Panel -->
    <div class="panel panel--primary">
      <div class="panel__header">
        <h2>Welcome to Guinea Pig Simulator! 🐹</h2>
      </div>
      <div class="panel__content">
        <p>Create your new guinea pig companion and begin your journey of care, friendship, and discovery.</p>
        <p v-if="showTutorialHints" class="text-label text-label--muted">
          Your guinea pig will have unique preferences that you'll discover through caring interactions.
        </p>
      </div>
    </div>

    <!-- Creation Form Panel -->
    <div class="panel panel--secondary">
      <div class="panel__header">
        <h3>Customize Your Guinea Pig</h3>
      </div>
      <div class="panel__content">
        <!-- Name Input -->
        <div class="form-group">
          <label for="guinea-pig-name">Name</label>
          <input
            id="guinea-pig-name"
            v-model="formData.name"
            type="text"
            class="input"
            :class="{ 'input--error': nameError }"
            placeholder="Enter your guinea pig's name..."
            maxlength="20"
            @input="validateName"
          />
          <div v-if="nameError" class="text-error">{{ nameError }}</div>
        </div>

        <!-- Gender Selection -->
        <div class="form-group">
          <label for="gender-selection">Gender</label>
          <div
            id="gender-selection"
            class="button-group--segmented"
            role="group"
            aria-labelledby="gender-selection"
          >
            <Button
              @click="formData.gender = 'female'"
              variant="segmented"
              :selected="formData.gender === 'female'"
              size="sm"
            >
              🐹 Sow (Female)
            </Button>
            <Button
              @click="formData.gender = 'male'"
              variant="segmented"
              :selected="formData.gender === 'male'"
              size="sm"
            >
              🐹 Boar (Male)
            </Button>
          </div>
        </div>

        <!-- Coat Type Selection -->
        <div class="form-group">
          <Select
            v-model="formData.coatType"
            :options="coatTypeOptions"
            label="Coat Type"
          />
        </div>

        <!-- Birthdate Selection -->
        <div class="form-group">
          <label for="guinea-pig-birthdate">Birthdate</label>
          <input
            id="guinea-pig-birthdate"
            v-model="formData.birthdate"
            type="date"
            class="input"
            :class="{ 'input--error': birthdateError }"
            :max="maxDate"
            :min="minDate"
            @input="validateBirthdate"
          />
          <div v-if="birthdateError" class="text-error">{{ birthdateError }}</div>
          <div v-if="formData.birthdate && !birthdateError" class="text-label text-label--muted">
            Age: {{ calculateAge(formData.birthdate) }}
          </div>
        </div>

        <!-- Random Generation -->
        <div class="form-group--action">
          <Button @click="setRandomProperties" variant="tertiary" size="md">
            🎲 Generate New Random Properties
          </Button>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div v-if="isFormValid" class="panel panel--muted">
      <div class="panel__header">
        <h3>Preview</h3>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Name:</span>
            <span class="stat-value">{{ formData.name }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Gender:</span>
            <span class="stat-value">{{ formData.gender === 'female' ? 'Sow (Female)' : 'Boar (Male)' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Coat:</span>
            <span class="stat-value">{{ getCoatTypeLabel(formData.coatType) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Age:</span>
            <span class="stat-value">{{ calculateAge(formData.birthdate) }}</span>
          </div>
        </div>

        <div class="button-group" style="margin-block-start: var(--space-4);">
          <Button
            @click="createGuineaPig"
            variant="primary"
            size="lg"
            :disabled="!canStartGame"
            :title="!canStartGame ? 'Add name to start game' : 'Start the game with your new guinea pig'"
          >
            🚀 Start Game
          </Button>
        </div>
      </div>
    </div>

    <!-- Tutorial Tips Panel -->
    <div v-if="showTutorialHints" class="panel panel--compact">
      <div class="panel__header">
        <h4>Getting Started Tips</h4>
      </div>
      <div class="panel__content">
        <ul>
          <li>Watch the needs bars and respond when they get low</li>
          <li>Interact with your guinea pig regularly to build friendship</li>
          <li>Keep the habitat clean and well-maintained</li>
          <li>Discover your guinea pig's unique preferences through experimentation</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameController } from '../../stores/gameController'
import { useLoggingStore } from '../../stores/loggingStore'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

// Store instances
const gameController = useGameController()
const loggingStore = useLoggingStore()
const router = useRouter()

// Form data interface
interface GuineaPigFormData {
  name: string
  gender: 'female' | 'male' // Updated to match store interface
  coatType: string
  birthdate: string
}

// Form state
const formData = ref<GuineaPigFormData>({
  name: '',
  gender: 'female',
  coatType: 'american',
  birthdate: ''
})

// Validation errors
const nameError = ref('')
const birthdateError = ref('')

// Coat type options
const coatTypeOptions = [
  { label: 'American (Short-haired)', value: 'american' },
  { label: 'Abyssinian (Rosettes)', value: 'abyssinian' },
  { label: 'Peruvian (Long-haired)', value: 'peruvian' },
  { label: 'Silkie (Long, smooth)', value: 'silkie' },
  { label: 'Teddy (Dense, coarse)', value: 'teddy' },
  { label: 'Rex (Curly)', value: 'rex' },
  { label: 'Coronet (Long with crown)', value: 'coronet' },
  { label: 'Texel (Long, curly)', value: 'texel' }
]

// Date constraints
const today = new Date()
const maxDate = today.toISOString().split('T')[0] // Today
const minDate = new Date(today.getTime() - (365 * 8 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // 8 years ago

// Computed properties
const showTutorialHints = computed(() => {
  const tutorialMode = gameController.settings.tutorial.mode
  return tutorialMode === 'always_show' ||
         (tutorialMode === 'auto' && gameController.settings.tutorial.isGlobalFirstTime)
})

const isFormValid = computed(() => {
  return formData.value.gender &&
         formData.value.coatType &&
         formData.value.birthdate &&
         !nameError.value &&
         !birthdateError.value
})

const canStartGame = computed(() => {
  return formData.value.name.trim() && isFormValid.value
})

// Validation functions
const validateName = () => {
  const name = formData.value.name.trim()
  if (name.length === 0) {
    nameError.value = '' // No error for empty name, we'll auto-generate
  } else if (name.length < 2) {
    nameError.value = 'Name must be at least 2 characters'
  } else if (name.length > 20) {
    nameError.value = 'Name must be 20 characters or less'
  } else if (!/^[a-zA-Z0-9\s\-']+$/.test(name)) {
    nameError.value = 'Name contains invalid characters'
  } else {
    nameError.value = ''
  }
}

const validateBirthdate = () => {
  const date = new Date(formData.value.birthdate)
  const min = new Date(minDate)
  const max = new Date(maxDate)

  if (date < min) {
    birthdateError.value = 'Guinea pig cannot be older than 8 years'
  } else if (date > max) {
    birthdateError.value = 'Birthdate cannot be in the future'
  } else {
    birthdateError.value = ''
  }
}

// Utility functions
const calculateAge = (birthdate: string): string => {
  if (!birthdate) return ''

  const birth = new Date(birthdate)
  const today = new Date()
  const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

  if (ageInDays < 30) {
    return `${ageInDays} days old`
  } else if (ageInDays < 365) {
    const months = Math.floor(ageInDays / 30)
    return `${months} month${months > 1 ? 's' : ''} old`
  } else {
    const years = Math.floor(ageInDays / 365)
    const remainingMonths = Math.floor((ageInDays % 365) / 30)
    if (remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} old`
    } else {
      return `${years} year${years > 1 ? 's' : ''} old`
    }
  }
}

const getCoatTypeLabel = (value: string): string => {
  const option = coatTypeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const generateRandomData = (logAction: boolean = false) => {
  formData.value.name = generateRandomName()
  formData.value.gender = Math.random() > 0.5 ? 'female' : 'male'
  formData.value.coatType = coatTypeOptions[Math.floor(Math.random() * coatTypeOptions.length)].value

  // Random birthdate (1 month to 2 years old)
  const minAge = 30 // 1 month in days
  const maxAge = 730 // 2 years in days
  const randomAge = Math.floor(Math.random() * (maxAge - minAge)) + minAge
  const birthdate = new Date(today.getTime() - (randomAge * 24 * 60 * 60 * 1000))
  formData.value.birthdate = birthdate.toISOString().split('T')[0]

  // Validate the generated data
  validateName()
  validateBirthdate()

  if (logAction) {
    loggingStore.addPlayerAction('Generated new random guinea pig properties 🎲', '🎲', {
      name: formData.value.name,
      gender: formData.value.gender,
      coatType: formData.value.coatType,
      age: calculateAge(formData.value.birthdate)
    })
  }
}

const setRandomProperties = () => {
  generateRandomData(true)
}


// Generate random name helper
const generateRandomName = () => {
  const names = [
    'Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch', 'Cinnamon',
    'Pepper', 'Sugar', 'Honey', 'Mocha', 'Caramel', 'Biscuit',
    'Mochi', 'Truffle', 'Cookie', 'Marshmallow', 'Nugget', 'Pickles'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

// Guinea pig creation
const createGuineaPig = () => {
  // Auto-generate name if none provided
  if (!formData.value.name.trim()) {
    formData.value.name = generateRandomName()
    validateName()

    loggingStore.addPlayerAction(
      `Auto-generated name "${formData.value.name}" for your guinea pig! 🎲`,
      '✨',
      { autoGenerated: true, name: formData.value.name }
    )
  }

  if (!isFormValid.value) return

  try {
    // Create guinea pig using the integrated store method
    const guineaPigId = gameController.createGuineaPig(
      formData.value.name,
      formData.value.gender,
      formData.value.coatType
    )

    // Log creation event
    loggingStore.addAchievement(
      `Welcome ${formData.value.name}! Your guinea pig adventure begins! 🐹`,
      '🎉',
      {
        guineaPigId,
        guineaPig: {
          name: formData.value.name,
          gender: formData.value.gender,
          breed: formData.value.coatType,
          age: calculateAge(formData.value.birthdate)
        },
        isFirstTimeUser: gameController.gameState.isFirstTimeUser
      }
    )

    // Welcome messages based on tutorial settings
    if (showTutorialHints.value) {
      setTimeout(() => {
        loggingStore.addGuineaPigReaction(
          `${formData.value.name} looks around curiously at their new home`,
          '👀',
          { firstMeeting: true, guineaPigId }
        )
      }, 500)

      setTimeout(() => {
        loggingStore.addPlayerAction(
          'Try interacting with your guinea pig to start building friendship!',
          '💡',
          { tutorial: true }
        )
      }, 1500)
    } else {
      setTimeout(() => {
        loggingStore.addGuineaPigReaction(
          `${formData.value.name} is ready to be cared for!`,
          '🐹',
          { greeting: true, guineaPigId }
        )
      }, 500)
    }

    // Navigate to main game
    router.push('/home')

  } catch (error) {
    console.error('Failed to create guinea pig:', error)
    loggingStore.logError(`Failed to create guinea pig: ${error}`, {
      formData: formData.value,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// Initialize form
onMounted(() => {
  // Auto-populate form with random data
  generateRandomData(false)

  loggingStore.addPlayerAction('Guinea pig creation started with pre-filled data', '🐹', {
    tutorialMode: gameController.settings.tutorial.mode,
    isFirstTime: gameController.settings.tutorial.isGlobalFirstTime,
    prePopulated: true
  })
})
</script>