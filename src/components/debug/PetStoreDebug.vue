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
              type="checkbox"
              v-model="petStoreManager.settings.allowUnlimitedRefresh"
            />
            <span>Allow Unlimited Refresh (Debug)</span>
          </label>
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
          <div class="flex flex-col gap-3">
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

          <div class="panel__header">
            <h4>Personality</h4>
          </div>
          <div class="flex flex-col gap-3">
            <Slider
              v-model="selectedGuineaPig.personality.friendliness"
              :min="1"
              :max="10"
              label="Friendliness"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.playfulness"
              :min="1"
              :max="10"
              label="Playfulness"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.curiosity"
              :min="1"
              :max="10"
              label="Curiosity"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
            <Slider
              v-model="selectedGuineaPig.personality.independence"
              :min="1"
              :max="10"
              label="Independence"
              size="sm"
              :disabled="isSelectedGuineaPigActive"
            />
          </div>

          <div class="panel__header">
            <h4>Appearance</h4>
          </div>
          <div class="flex flex-col gap-3">
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