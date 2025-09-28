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
        <div class="pet-store-debug__settings">
          <div class="pet-store-debug__setting">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="petStoreManager.settings.allowUnlimitedRefresh"
              />
              <span>Allow Unlimited Refresh (Debug)</span>
            </label>
          </div>
          <Slider
            v-model="petStoreManager.settings.endGamePenalty"
            :min="0"
            :max="500"
            :step="10"
            label="End Game Penalty"
            size="sm"
          />
        </div>
      </div>
      <div class="panel__footer" style="margin-block-start: var(--space-4);">
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
            :class="{ 'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id }"
            @click="selectedGuineaPig = guineaPig"
          >
            <div class="pet-store-debug__guinea-pig-header">
              <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
              <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
            </div>
            <div class="pet-store-debug__guinea-pig-details">
              <span>{{ guineaPig.gender }}</span>
              <span>{{ guineaPig.appearance.furColor }}</span>
              <span>{{ guineaPig.appearance.furPattern }}</span>
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
          <div class="panel__header">
            <h4>Basic Info</h4>
          </div>
          <label class="form-field-inline">
            Name:
            <input
              type="text"
              v-model="selectedGuineaPig.name"
              class="input"
            />
          </label>
          <label class="form-field-inline">
            Gender:
            <select v-model="selectedGuineaPig.gender" class="input">
              <option value="male">Neutered Boar</option>
              <option value="female">Sow</option>
            </select>
          </label>
          <label class="form-field-inline">
            Breed:
            <select v-model="selectedGuineaPig.breed" class="input">
              <option v-if="!breedOptions.includes(selectedGuineaPig.breed)" :value="selectedGuineaPig.breed">{{ capitalize(selectedGuineaPig.breed) }}</option>
              <option v-for="breed in breedOptions" :key="breed" :value="breed">{{ capitalize(breed) }}</option>
            </select>
          </label>

          <div class="panel__header">
            <h4>Personality</h4>
          </div>
          <Slider
            v-model="selectedGuineaPig.personality.friendliness"
            :min="1"
            :max="10"
            label="Friendliness"
            size="sm"
          />
          <Slider
            v-model="selectedGuineaPig.personality.playfulness"
            :min="1"
            :max="10"
            label="Playfulness"
            size="sm"
          />
          <Slider
            v-model="selectedGuineaPig.personality.curiosity"
            :min="1"
            :max="10"
            label="Curiosity"
            size="sm"
          />
          <Slider
            v-model="selectedGuineaPig.personality.independence"
            :min="1"
            :max="10"
            label="Independence"
            size="sm"
          />

          <div class="panel__header">
            <h4>Appearance</h4>
          </div>
          <label class="form-field-inline">
            Fur Color:
            <select v-model="selectedGuineaPig.appearance.furColor" class="input">
              <option v-if="!furColorOptions.includes(selectedGuineaPig.appearance.furColor)" :value="selectedGuineaPig.appearance.furColor">{{ capitalize(selectedGuineaPig.appearance.furColor) }}</option>
              <option v-for="color in furColorOptions" :key="color" :value="color">{{ capitalize(color) }}</option>
            </select>
          </label>
          <label class="form-field-inline">
            Fur Pattern:
            <select v-model="selectedGuineaPig.appearance.furPattern" class="input">
              <option v-if="!furPatternOptions.includes(selectedGuineaPig.appearance.furPattern)" :value="selectedGuineaPig.appearance.furPattern">{{ capitalize(selectedGuineaPig.appearance.furPattern) }}</option>
              <option v-for="pattern in furPatternOptions" :key="pattern" :value="pattern">{{ capitalize(pattern) }}</option>
            </select>
          </label>
          <label class="form-field-inline">
            Eye Color:
            <select v-model="selectedGuineaPig.appearance.eyeColor" class="input">
              <option v-if="!eyeColorOptions.includes(selectedGuineaPig.appearance.eyeColor)" :value="selectedGuineaPig.appearance.eyeColor">{{ capitalize(selectedGuineaPig.appearance.eyeColor) }}</option>
              <option v-for="eyeColor in eyeColorOptions" :key="eyeColor" :value="eyeColor">{{ capitalize(eyeColor) }}</option>
            </select>
          </label>
          <label class="form-field-inline">
            Size:
            <select v-model="selectedGuineaPig.appearance.size" class="input">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
        </div>
        <p v-else class="pet-store-debug__empty-message">Click a guinea pig to edit</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePetStoreManager } from '../../stores/petStoreManager'
import type { GuineaPig } from '../../stores/guineaPigStore'
import Slider from '../basic/Slider.vue'
import Button from '../basic/Button.vue'

const petStoreManager = usePetStoreManager()
const selectedGuineaPig = ref<GuineaPig | null>(null)

// Dynamic option arrays from pet store manager
const furColorOptions = petStoreManager.furColors
const furPatternOptions = petStoreManager.furPatterns
const breedOptions = petStoreManager.breeds
const eyeColorOptions = petStoreManager.eyeColors

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

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

/* === Settings Section === */
.pet-store-debug__settings {
  margin-block-start: 1rem;
}

.pet-store-debug__setting {
  margin-block-end: 1rem;
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
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
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

.pet-store-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: 0.5rem;
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
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* === Editor Section === */
.pet-store-debug__editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pet-store-debug__empty-message {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  margin-block: 1rem;
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