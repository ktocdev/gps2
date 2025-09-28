<template>
  <div class="pet-store-debug">
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Pet Store Settings</h3>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Can Refresh:</span>
            <span class="stat-value">{{ petStoreManager.canRefreshPetStore ? 'Yes' : 'No' }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-4 mt-4">
          <label class="checkbox-label">
            <input
              class="mt-4 mb-2"
              type="checkbox"
              v-model="petStoreManager.settings.allowUnlimitedRefresh"
            />
            <span>Allow Unlimited Refresh (Debug)</span>
          </label>
          <hr class="divider">
          <Slider
            v-model="petStoreManager.settings.endGamePenalty"
            :min="0"
            :max="500"
            :step="10"
            class="mt-2 mb-6"
            label="End Game Penalty"
            size="sm"
            prefix="$"
          />
        </div>
      </div>

      <div class="panel__footer mt-4">
        <Button
          @click="handleRefresh"
          :disabled="!petStoreManager.canRefreshPetStore"
          full-width
        >
          Refresh Pet Store
        </Button>
      </div>
    </div>

    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Available Guinea Pigs ({{ petStoreManager.availableGuineaPigs.length }})</h3>
      </div>
      <div class="panel__content">
        <div class="pet-store-debug__guinea-pig-list">
          <div
            v-for="guineaPig in petStoreManager.availableGuineaPigs"
            :key="guineaPig.id"
            class="pet-store-debug__guinea-pig-item"
            :class="{
              'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id,
              'pet-store-debug__guinea-pig-item--active': isGuineaPigActive(guineaPig.id)
            }"
            @click="selectedGuineaPig = guineaPig"
          >
            <div class="pet-store-debug__guinea-pig-header">
              <div class="pet-store-debug__guinea-pig-name-wrapper">
                <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
                <Badge v-if="isGuineaPigActive(guineaPig.id)" variant="success" size="sm">ACTIVE</Badge>
              </div>
              <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
            </div>
            <div class="pet-store-debug__guinea-pig-details">
              <Badge variant="secondary" size="sm">{{ guineaPig.gender }}</Badge>
              <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furColor }}</Badge>
              <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furPattern }}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Guinea Pig Editor</h3>
      </div>
      <div class="panel__content">
        <div v-if="selectedGuineaPig" class="pet-store-debug__editor">
          <div v-if="isSelectedGuineaPigActive" class="pet-store-debug__warning">
            ⚠️ Cannot edit active guinea pig in game session
          </div>
          <div class="panel__header">
            <h4>Basic Info</h4>
          </div>
          <div class="flex flex-col gap-3 mb-4">
            <label class="form-field-inline">
              Name:
              <input
                type="text"
                v-model="selectedGuineaPig.name"
                class="input"
                :disabled="isSelectedGuineaPigActive"
              />
            </label>
            <label class="form-field-inline">
              Gender:
              <select v-model="selectedGuineaPig.gender" class="input" :disabled="isSelectedGuineaPigActive">
                <option value="male">Neutered Boar</option>
                <option value="female">Sow</option>
              </select>
            </label>
            <label class="form-field-inline">
              Breed:
              <select v-model="selectedGuineaPig.breed" class="input" :disabled="isSelectedGuineaPigActive">
                <option v-if="!breedOptions.includes(selectedGuineaPig.breed)" :value="selectedGuineaPig.breed">{{ capitalize(selectedGuineaPig.breed) }}</option>
                <option v-for="breed in breedOptions" :key="breed" :value="breed">{{ capitalize(breed) }}</option>
              </select>
            </label>
          </div>
          <hr class="divider">

          <div class="panel__header">
            <h4>Personality</h4>
          </div>
          <div class="flex flex-col gap-3 mb-4">
            <Slider
              v-model="selectedGuineaPig.personality.friendliness"
              :min="1"
              :max="10"
              class="mb-2"
              label="Friendliness"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.playfulness"
              :min="1"
              :max="10"
              class="mb-2"
              label="Playfulness"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.curiosity"
              :min="1"
              :max="10"
              class="mb-2"
              label="Curiosity"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.independence"
              :min="1"
              :max="10"
              class="mb-2"
              label="Independence"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
          </div>
          <hr class="divider">

          <div class="panel__header">
            <h4>Appearance</h4>
          </div>
          <div class="flex flex-col gap-3 mb-4">
            <label class="form-field-inline">
              Fur Color:
              <select v-model="selectedGuineaPig.appearance.furColor" class="input" :disabled="isSelectedGuineaPigActive">
                <option v-if="!furColorOptions.includes(selectedGuineaPig.appearance.furColor)" :value="selectedGuineaPig.appearance.furColor">{{ capitalize(selectedGuineaPig.appearance.furColor) }}</option>
                <option v-for="color in furColorOptions" :key="color" :value="color">{{ capitalize(color) }}</option>
              </select>
            </label>
            <label class="form-field-inline">
              Fur Pattern:
              <select v-model="selectedGuineaPig.appearance.furPattern" class="input" :disabled="isSelectedGuineaPigActive">
                <option v-if="!furPatternOptions.includes(selectedGuineaPig.appearance.furPattern)" :value="selectedGuineaPig.appearance.furPattern">{{ capitalize(selectedGuineaPig.appearance.furPattern) }}</option>
                <option v-for="pattern in furPatternOptions" :key="pattern" :value="pattern">{{ capitalize(pattern) }}</option>
              </select>
            </label>
            <label class="form-field-inline">
              Eye Color:
              <select v-model="selectedGuineaPig.appearance.eyeColor" class="input" :disabled="isSelectedGuineaPigActive">
                <option v-if="!eyeColorOptions.includes(selectedGuineaPig.appearance.eyeColor)" :value="selectedGuineaPig.appearance.eyeColor">{{ capitalize(selectedGuineaPig.appearance.eyeColor) }}</option>
                <option v-for="eyeColor in eyeColorOptions" :key="eyeColor" :value="eyeColor">{{ capitalize(eyeColor) }}</option>
              </select>
            </label>
            <label class="form-field-inline">
              Size:
              <select v-model="selectedGuineaPig.appearance.size" class="input" :disabled="isSelectedGuineaPigActive">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>
          </div>
          <hr class="divider">

          <div class="panel__header">
            <h4>Preferences (Likes & Dislikes)</h4>
          </div>
          <div class="flex flex-col gap-3 mb-2">
            <!-- Food Preferences -->
            <div class="form-field-block">
              <!-- Vegetables -->
              <fieldset class="preference-row">
                <legend class="preference-row__label">Vegetables</legend>
                <div class="preference-row__controls">
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Likes</span>
                    <div class="preference-row__selects">
                      <select v-model="vegFavorite1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First liked vegetable">
                        <option value="">None</option>
                        <option v-for="veg in vegetableOptions" :key="veg" :value="veg">
                          {{ formatPreferenceName(veg) }}
                        </option>
                      </select>
                      <select v-model="vegFavorite2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second liked vegetable">
                        <option value="">None</option>
                        <option v-for="veg in vegetableOptions" :key="veg" :value="veg">
                          {{ formatPreferenceName(veg) }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
                    <div class="preference-row__selects">
                      <select v-model="vegDislike1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First disliked vegetable">
                        <option value="">None</option>
                        <option v-for="veg in vegetableOptions" :key="veg" :value="veg">
                          {{ formatPreferenceName(veg) }}
                        </option>
                      </select>
                      <select v-model="vegDislike2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second disliked vegetable">
                        <option value="">None</option>
                        <option v-for="veg in vegetableOptions" :key="veg" :value="veg">
                          {{ formatPreferenceName(veg) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
              <hr class="divider">

              <!-- Fruits -->
              <fieldset class="preference-row">
                <legend class="preference-row__label">Fruits</legend>
                <div class="preference-row__controls">
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Likes</span>
                    <div class="preference-row__selects">
                      <select v-model="fruitFavorite1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First liked fruit">
                        <option value="">None</option>
                        <option v-for="fruit in fruitOptions" :key="fruit" :value="fruit">
                          {{ formatPreferenceName(fruit) }}
                        </option>
                      </select>
                      <select v-model="fruitFavorite2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second liked fruit">
                        <option value="">None</option>
                        <option v-for="fruit in fruitOptions" :key="fruit" :value="fruit">
                          {{ formatPreferenceName(fruit) }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
                    <div class="preference-row__selects">
                      <select v-model="fruitDislike1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First disliked fruit">
                        <option value="">None</option>
                        <option v-for="fruit in fruitOptions" :key="fruit" :value="fruit">
                          {{ formatPreferenceName(fruit) }}
                        </option>
                      </select>
                      <select v-model="fruitDislike2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second disliked fruit">
                        <option value="">None</option>
                        <option v-for="fruit in fruitOptions" :key="fruit" :value="fruit">
                          {{ formatPreferenceName(fruit) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
              <hr class="divider">

              <!-- Hay Types -->
              <fieldset class="preference-row">
                <legend class="preference-row__label">Hay Types</legend>
                <div class="preference-row__controls">
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Likes</span>
                    <div class="preference-row__selects">
                      <select v-model="hayFavorite1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First liked hay type">
                        <option value="">None</option>
                        <option v-for="hay in hayOptions" :key="hay" :value="hay">
                          {{ formatPreferenceName(hay) }}
                        </option>
                      </select>
                      <select v-model="hayFavorite2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second liked hay type">
                        <option value="">None</option>
                        <option v-for="hay in hayOptions" :key="hay" :value="hay">
                          {{ formatPreferenceName(hay) }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
                    <div class="preference-row__selects">
                      <select v-model="hayDislike1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First disliked hay type">
                        <option value="">None</option>
                        <option v-for="hay in hayOptions" :key="hay" :value="hay">
                          {{ formatPreferenceName(hay) }}
                        </option>
                      </select>
                      <select v-model="hayDislike2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second disliked hay type">
                        <option value="">None</option>
                        <option v-for="hay in hayOptions" :key="hay" :value="hay">
                          {{ formatPreferenceName(hay) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            <hr class="divider">

            <!-- Activity Preferences -->
            <div class="form-field-block">
              <fieldset class="preference-row">
                <legend class="preference-row__label">Activities</legend>
                <div class="preference-row__controls">
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Likes</span>
                    <div class="preference-row__selects">
                      <select v-model="activityFavorite1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First liked activity">
                        <option value="">None</option>
                        <option v-for="activity in activityOptions" :key="activity" :value="activity">
                          {{ formatPreferenceName(activity) }}
                        </option>
                      </select>
                      <select v-model="activityFavorite2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second liked activity">
                        <option value="">None</option>
                        <option v-for="activity in activityOptions" :key="activity" :value="activity">
                          {{ formatPreferenceName(activity) }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
                    <div class="preference-row__selects">
                      <select v-model="activityDislike1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First disliked activity">
                        <option value="">None</option>
                        <option v-for="activity in activityOptions" :key="activity" :value="activity">
                          {{ formatPreferenceName(activity) }}
                        </option>
                      </select>
                      <select v-model="activityDislike2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second disliked activity">
                        <option value="">None</option>
                        <option v-for="activity in activityOptions" :key="activity" :value="activity">
                          {{ formatPreferenceName(activity) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            <hr class="divider">

            <!-- Habitat Preferences -->
            <div class="form-field-block">
              <fieldset class="preference-row">
                <legend class="preference-row__label">Habitat</legend>
                <div class="preference-row__controls">
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Likes</span>
                    <div class="preference-row__selects">
                      <select v-model="habitatFavorite1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First liked habitat feature">
                        <option value="">None</option>
                        <option v-for="habitat in habitatOptions" :key="habitat" :value="habitat">
                          {{ formatPreferenceName(habitat) }}
                        </option>
                      </select>
                      <select v-model="habitatFavorite2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second liked habitat feature">
                        <option value="">None</option>
                        <option v-for="habitat in habitatOptions" :key="habitat" :value="habitat">
                          {{ formatPreferenceName(habitat) }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="preference-row__group">
                    <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
                    <div class="preference-row__selects">
                      <select v-model="habitatDislike1" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="First disliked habitat feature">
                        <option value="">None</option>
                        <option v-for="habitat in habitatOptions" :key="habitat" :value="habitat">
                          {{ formatPreferenceName(habitat) }}
                        </option>
                      </select>
                      <select v-model="habitatDislike2" class="input input--sm" :disabled="isSelectedGuineaPigActive" aria-label="Second disliked habitat feature">
                        <option value="">None</option>
                        <option v-for="habitat in habitatOptions" :key="habitat" :value="habitat">
                          {{ formatPreferenceName(habitat) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
        <p v-else class="pet-store-debug__empty-message">Click a guinea pig to edit</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePetStoreManager } from '../../stores/petStoreManager'
import type { GuineaPig } from '../../stores/guineaPigStore'
import Slider from '../basic/Slider.vue'
import Button from '../basic/Button.vue'
import Badge from '../basic/Badge.vue'

const petStoreManager = usePetStoreManager()
const selectedGuineaPig = ref<GuineaPig | null>(null)

const isGuineaPigActive = (guineaPigId: string): boolean => {
  return petStoreManager.activeGameSession?.guineaPigIds.includes(guineaPigId) ?? false
}

const isSelectedGuineaPigActive = computed(() => {
  if (!selectedGuineaPig.value) return false
  return isGuineaPigActive(selectedGuineaPig.value.id)
})

// Dynamic option arrays from pet store manager
const furColorOptions = petStoreManager.furColors
const furPatternOptions = petStoreManager.furPatterns
const breedOptions = petStoreManager.breeds
const eyeColorOptions = petStoreManager.eyeColors

// Preference option arrays
const vegetableOptions = petStoreManager.vegetables
const fruitOptions = petStoreManager.fruits
const hayOptions = petStoreManager.hayTypes
const activityOptions = petStoreManager.activities
const habitatOptions = petStoreManager.habitatFeatures

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

// Helper function for formatting preference names (snake_case → Title Case)
const formatPreferenceName = (name: string) => {
  return name.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Preference select refs (for v-model binding)
const vegFavorite1 = ref('')
const vegFavorite2 = ref('')
const vegDislike1 = ref('')
const vegDislike2 = ref('')

const fruitFavorite1 = ref('')
const fruitFavorite2 = ref('')
const fruitDislike1 = ref('')
const fruitDislike2 = ref('')

const hayFavorite1 = ref('')
const hayFavorite2 = ref('')
const hayDislike1 = ref('')
const hayDislike2 = ref('')

const activityFavorite1 = ref('')
const activityFavorite2 = ref('')
const activityDislike1 = ref('')
const activityDislike2 = ref('')

const habitatFavorite1 = ref('')
const habitatFavorite2 = ref('')
const habitatDislike1 = ref('')
const habitatDislike2 = ref('')

// Helper function to extract category-specific preferences
const getPreferencesForCategory = (allPreferences: string[], category: string[]): string[] => {
  return allPreferences.filter(item => category.includes(item))
}

// Sync preference selects with guinea pig data
watch(() => selectedGuineaPig.value, (gp) => {
  if (!gp) {
    // Clear all selects
    vegFavorite1.value = ''
    vegFavorite2.value = ''
    vegDislike1.value = ''
    vegDislike2.value = ''
    fruitFavorite1.value = ''
    fruitFavorite2.value = ''
    fruitDislike1.value = ''
    fruitDislike2.value = ''
    hayFavorite1.value = ''
    hayFavorite2.value = ''
    hayDislike1.value = ''
    hayDislike2.value = ''
    activityFavorite1.value = ''
    activityFavorite2.value = ''
    activityDislike1.value = ''
    activityDislike2.value = ''
    habitatFavorite1.value = ''
    habitatFavorite2.value = ''
    habitatDislike1.value = ''
    habitatDislike2.value = ''
    return
  }

  // Extract category-specific preferences (with fallbacks for missing fields)
  const vegFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], vegetableOptions)
  const vegDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], vegetableOptions)
  const fruitFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], fruitOptions)
  const fruitDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], fruitOptions)
  const hayFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], hayOptions)
  const hayDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], hayOptions)

  // Populate selects
  vegFavorite1.value = vegFavorites[0] || ''
  vegFavorite2.value = vegFavorites[1] || ''
  vegDislike1.value = vegDislikes[0] || ''
  vegDislike2.value = vegDislikes[1] || ''

  fruitFavorite1.value = fruitFavorites[0] || ''
  fruitFavorite2.value = fruitFavorites[1] || ''
  fruitDislike1.value = fruitDislikes[0] || ''
  fruitDislike2.value = fruitDislikes[1] || ''

  hayFavorite1.value = hayFavorites[0] || ''
  hayFavorite2.value = hayFavorites[1] || ''
  hayDislike1.value = hayDislikes[0] || ''
  hayDislike2.value = hayDislikes[1] || ''

  activityFavorite1.value = (gp.preferences.favoriteActivity || [])[0] || ''
  activityFavorite2.value = (gp.preferences.favoriteActivity || [])[1] || ''
  activityDislike1.value = (gp.preferences.dislikedActivity || [])[0] || ''
  activityDislike2.value = (gp.preferences.dislikedActivity || [])[1] || ''

  habitatFavorite1.value = (gp.preferences.habitatPreference || [])[0] || ''
  habitatFavorite2.value = (gp.preferences.habitatPreference || [])[1] || ''
  habitatDislike1.value = (gp.preferences.dislikedHabitat || [])[0] || ''
  habitatDislike2.value = (gp.preferences.dislikedHabitat || [])[1] || ''
}, { immediate: true })

// Watch selects and update guinea pig preferences
watch([vegFavorite1, vegFavorite2, fruitFavorite1, fruitFavorite2, hayFavorite1, hayFavorite2], () => {
  if (!selectedGuineaPig.value) return
  const favorites = [
    vegFavorite1.value,
    vegFavorite2.value,
    fruitFavorite1.value,
    fruitFavorite2.value,
    hayFavorite1.value,
    hayFavorite2.value
  ].filter(v => v !== '')
  selectedGuineaPig.value.preferences.favoriteFood = favorites
})

watch([vegDislike1, vegDislike2, fruitDislike1, fruitDislike2, hayDislike1, hayDislike2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize dislikedFood if it doesn't exist (for old guinea pigs)
  if (!selectedGuineaPig.value.preferences.dislikedFood) {
    selectedGuineaPig.value.preferences.dislikedFood = []
  }

  const dislikes = [
    vegDislike1.value,
    vegDislike2.value,
    fruitDislike1.value,
    fruitDislike2.value,
    hayDislike1.value,
    hayDislike2.value
  ].filter(v => v !== '')
  selectedGuineaPig.value.preferences.dislikedFood = dislikes
})

watch([activityFavorite1, activityFavorite2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize favoriteActivity if it doesn't exist
  if (!selectedGuineaPig.value.preferences.favoriteActivity) {
    selectedGuineaPig.value.preferences.favoriteActivity = []
  }

  selectedGuineaPig.value.preferences.favoriteActivity = [
    activityFavorite1.value,
    activityFavorite2.value
  ].filter(v => v !== '')
})

watch([activityDislike1, activityDislike2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize dislikedActivity if it doesn't exist (for old guinea pigs)
  if (!selectedGuineaPig.value.preferences.dislikedActivity) {
    selectedGuineaPig.value.preferences.dislikedActivity = []
  }

  selectedGuineaPig.value.preferences.dislikedActivity = [
    activityDislike1.value,
    activityDislike2.value
  ].filter(v => v !== '')
})

watch([habitatFavorite1, habitatFavorite2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize habitatPreference if it doesn't exist
  if (!selectedGuineaPig.value.preferences.habitatPreference) {
    selectedGuineaPig.value.preferences.habitatPreference = []
  }

  selectedGuineaPig.value.preferences.habitatPreference = [
    habitatFavorite1.value,
    habitatFavorite2.value
  ].filter(v => v !== '')
})

watch([habitatDislike1, habitatDislike2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize dislikedHabitat if it doesn't exist (for old guinea pigs)
  if (!selectedGuineaPig.value.preferences.dislikedHabitat) {
    selectedGuineaPig.value.preferences.dislikedHabitat = []
  }

  selectedGuineaPig.value.preferences.dislikedHabitat = [
    habitatDislike1.value,
    habitatDislike2.value
  ].filter(v => v !== '')
})

// Auto-select first guinea pig when available or maintain selection after refresh
watch(() => petStoreManager.availableGuineaPigs, (guineaPigs) => {
  if (guineaPigs.length > 0) {
    // If we have a selected guinea pig, try to find it in the new list by ID
    if (selectedGuineaPig.value) {
      const foundGuineaPig = guineaPigs.find(gp => gp.id === selectedGuineaPig.value!.id)
      if (foundGuineaPig) {
        selectedGuineaPig.value = foundGuineaPig
      } else {
        // If the previously selected guinea pig is not found, select the first one
        selectedGuineaPig.value = guineaPigs[0]
      }
    } else {
      // No guinea pig selected, select the first one
      selectedGuineaPig.value = guineaPigs[0]
    }
  }
}, { immediate: true })

const handleRefresh = () => {
  petStoreManager.refreshPetStore()
  // The watcher will handle re-selecting the guinea pig after refresh
}
</script>

<style>
/* === Base Layout === */
.pet-store-debug {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding-block: 1rem;
}

/* === Guinea Pig List Section === */
.pet-store-debug__guinea-pig-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.pet-store-debug__guinea-pig-item {
  padding-block: 0.75rem;
  padding-inline: 1rem;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pet-store-debug__guinea-pig-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pet-store-debug__guinea-pig-item--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.pet-store-debug__guinea-pig-item--active {
  border-inline-start: 4px solid var(--color-success);
  padding-inline-start: calc(1rem - 3px);
}

.pet-store-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-block-end: 0.5rem;
}

.pet-store-debug__guinea-pig-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pet-store-debug__guinea-pig-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
}

.pet-store-debug__guinea-pig-breed {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.pet-store-debug__guinea-pig-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* === Editor Warning === */
.pet-store-debug__warning {
  padding: var(--space-3);
  background-color: var(--color-warning-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-base);
  margin-block-end: var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* === Editor Section === */
.pet-store-debug__editor {
  display: flex;
  flex-direction: column;
}

.pet-store-debug__editor .panel__header:not(:first-child) {
  margin-block-start: var(--space-6);
}

/* === Disabled Form Controls === */
.pet-store-debug__editor .input:disabled,
.pet-store-debug__editor select:disabled {
  background-color: var(--color-neutral-600);
  color: var(--color-neutral-200);
  border-color: var(--color-neutral-500);
  cursor: not-allowed;
  opacity: 0.9;
}

.pet-store-debug__empty-message {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  margin-block: 1rem;
}

/* === Preference Row Layout === */
/* Preference row layout - category on top, likes/dislikes below */
.preference-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-block: var(--space-2);
  border: none;
  padding-inline: 0;
  margin-inline: 0;
  min-inline-size: 0;
}

.preference-row__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  padding-inline: 0;
  margin-block-end: 0;
}

.preference-row__controls {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.preference-row__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.preference-row__group-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preference-row__selects {
  display: flex;
  gap: var(--space-2);
}

/* === Responsive Layout === */
@media (min-width: 768px) {
  .pet-store-debug {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .pet-store-debug {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>