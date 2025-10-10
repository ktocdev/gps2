<template>
  <div class="feeding-debug">
    <h2>Feeding System Debug</h2>

    <!-- Individual Guinea Pig Feeding -->
    <div v-if="hasActiveGuineaPigs">
      <h3>Individual Guinea Pig Feeding</h3>
      <div class="guinea-pigs-grid">
        <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id" class="panel panel--compact">
          <div class="panel__header">
            <h4>{{ guineaPig.name }} ({{ guineaPig.breed }})</h4>
          </div>
          <div class="panel__content">
            <!-- Hunger Status -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Current Hunger:</span>
                <span class="stat-value" :class="getHungerStatusClass(guineaPig.needs.hunger)">
                  {{ guineaPig.needs.hunger.toFixed(1) }}%
                </span>
              </div>
            </div>

            <hr class="divider">

            <!-- Food Selection -->
            <div class="form-group">
              <label :for="`food-select-${guineaPig.id}`" class="form-label">Food Type:</label>
              <Select
                :id="`food-select-${guineaPig.id}`"
                :modelValue="selectedFoodTypes[guineaPig.id] || ''"
                @update:modelValue="(value: string | number) => selectedFoodTypes[guineaPig.id] = String(value)"
                :options="foodOptions"
                placeholder="Select food..."
                size="md"
                :disabled="gameController.isPaused || !needsController.processingEnabled"
              />
            </div>

            <!-- Consumption Limits (System 2.5) -->
            <div v-if="selectedFoodTypes[guineaPig.id] && selectedFoodTypes[guineaPig.id] !== 'hay'" class="consumption-info">
              <span class="consumption-label">Servings Remaining:</span>
              <span class="consumption-value">
                {{ getRemainingServings(guineaPig.id, selectedFoodTypes[guineaPig.id] as any) }} /
                {{ getLimit(guineaPig.id, selectedFoodTypes[guineaPig.id] as any) }}
              </span>
            </div>
            <div v-else-if="selectedFoodTypes[guineaPig.id] === 'hay'" class="consumption-info">
              <span class="consumption-label">Servings Remaining:</span>
              <span class="consumption-value text--success">Unlimited ∞</span>
            </div>

            <!-- Feed Button -->
            <Button
              @click="feedGuineaPig(guineaPig.id)"
              variant="primary"
              size="md"
              full-width
              :disabled="isFeedDisabled(guineaPig.id)"
              :title="getFeedTooltip(guineaPig.id)"
              class="feed-button"
            >
              Feed {{ selectedFoodTypes[guineaPig.id] ? formatPreferenceName(selectedFoodTypes[guineaPig.id]) : 'Food' }}
            </Button>

            <hr class="divider">

            <!-- Fulfill Session Hunger Button -->
            <Button
              @click="fulfillSessionHunger(guineaPig.id)"
              variant="secondary"
              size="md"
              full-width
              :disabled="gameController.isPaused || !needsController.processingEnabled || guineaPig.needs.hunger >= 100"
              :title="getFullfillHungerTooltip(guineaPig.needs.hunger)"
              class="fulfill-button"
            >
              Fulfill Session Hunger (Reset Limits)
            </Button>

            <!-- Preferences Display (Phase 2.5 - System 2) -->
            <div class="preferences-display">
              <h5 class="preferences-title">Food Preferences</h5>
              <div class="preferences-grid">
                <div class="preference-item">
                  <span class="preference-label">Favorites:</span>
                  <span class="preference-value">{{ formatFoodList(guineaPig.preferences.favoriteFood) }}</span>
                </div>
                <div class="preference-item">
                  <span class="preference-label">Dislikes:</span>
                  <span class="preference-value">{{ formatFoodList(guineaPig.preferences.dislikedFood) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--warning">
      <div class="panel__content text-center">
        <p>No active guinea pigs. Start a game session from the Pet Store tab to test feeding system.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuineaPigStore, type FoodType } from '../../stores/guineaPigStore'
import { useNeedsController } from '../../stores/needsController'
import { useGameController } from '../../stores/gameController'
import { usePetStoreManager } from '../../stores/petStoreManager'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()
const gameController = useGameController()
const petStoreManager = usePetStoreManager()

// Reactive data
const selectedFoodTypes = ref<Record<string, string>>({}) // guineaPigId -> selected food type

// Computed properties
const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Food options for dropdowns
const foodOptions = computed(() => {
  const options = [
    { label: '--- Fruits ---', value: '', disabled: true },
    ...petStoreManager.fruits.map(f => ({
      label: formatPreferenceName(f),
      value: f
    })),
    { label: '--- Vegetables ---', value: '', disabled: true },
    ...petStoreManager.vegetables.map(v => ({
      label: formatPreferenceName(v),
      value: v
    })),
    { label: '--- Pellets ---', value: 'pellets' },
    { label: '--- Treats ---', value: 'treats' },
    { label: '--- Hay ---', value: '', disabled: true },
    ...petStoreManager.hayTypes.map(h => ({
      label: formatPreferenceName(h),
      value: h
    }))
  ]
  return options
})

// System 2.5: Get remaining servings for a food type
const getRemainingServings = (guineaPigId: string, foodType: FoodType): number => {
  return guineaPigStore.getRemainingServings(guineaPigId, foodType)
}

// System 2.5: Get limit for a food type
const getLimit = (guineaPigId: string, foodType: FoodType): number => {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig || foodType === 'hay') return 0

  const limit = guineaPig.consumptionLimits[foodType as keyof typeof guineaPig.consumptionLimits]
  return limit ? limit.limit : 0
}

// Feed guinea pig
const feedGuineaPig = (guineaPigId: string) => {
  const selectedFood = selectedFoodTypes.value[guineaPigId]
  if (!selectedFood) return

  // Map hay types to 'hay' category, and fruit/veg items to 'fruit'/'vegetables' categories
  let foodType: FoodType = selectedFood as FoodType

  // Check if it's a hay type
  if (petStoreManager.hayTypes.includes(selectedFood)) {
    foodType = 'hay'
  }
  // Check if it's a fruit
  else if (petStoreManager.fruits.includes(selectedFood)) {
    foodType = 'fruit'
  }
  // Check if it's a vegetable
  else if (petStoreManager.vegetables.includes(selectedFood)) {
    foodType = 'vegetables'
  }

  guineaPigStore.feedGuineaPig(guineaPigId, foodType)
}

// Fulfill session hunger (resets consumption limits)
const fulfillSessionHunger = (guineaPigId: string) => {
  guineaPigStore.adjustNeed(guineaPigId, 'hunger', 100)
}

// Check if feed button should be disabled
const isFeedDisabled = (guineaPigId: string): boolean => {
  if (gameController.isPaused || !needsController.processingEnabled) return true

  const selectedFood = selectedFoodTypes.value[guineaPigId]
  if (!selectedFood) return true

  // Map to food type category
  let foodType: FoodType = selectedFood as FoodType
  if (petStoreManager.hayTypes.includes(selectedFood)) {
    foodType = 'hay'
  } else if (petStoreManager.fruits.includes(selectedFood)) {
    foodType = 'fruit'
  } else if (petStoreManager.vegetables.includes(selectedFood)) {
    foodType = 'vegetables'
  }

  // Check consumption limit
  const canConsume = guineaPigStore.checkConsumptionLimit(guineaPigId, foodType)
  return !canConsume
}

// Get tooltip for feed button
const getFeedTooltip = (guineaPigId: string): string => {
  if (gameController.isPaused) {
    return 'Action disabled - Game Paused'
  }
  if (!needsController.processingEnabled) {
    return 'Action disabled - Needs Processing Paused'
  }

  const selectedFood = selectedFoodTypes.value[guineaPigId]
  if (!selectedFood) {
    return 'Select a food type first'
  }

  // Map to food type category
  let foodType: FoodType = selectedFood as FoodType
  if (petStoreManager.hayTypes.includes(selectedFood)) {
    foodType = 'hay'
  } else if (petStoreManager.fruits.includes(selectedFood)) {
    foodType = 'fruit'
  } else if (petStoreManager.vegetables.includes(selectedFood)) {
    foodType = 'vegetables'
  }

  const canConsume = guineaPigStore.checkConsumptionLimit(guineaPigId, foodType)
  if (!canConsume) {
    return `Consumption limit reached for ${foodType}. Fulfill hunger to reset limits.`
  }

  return ''
}

// Get tooltip for fulfill hunger button
const getFullfillHungerTooltip = (hungerValue: number): string => {
  if (gameController.isPaused) {
    return 'Action disabled - Game Paused'
  }
  if (!needsController.processingEnabled) {
    return 'Action disabled - Needs Processing Paused'
  }
  if (hungerValue >= 100) {
    return 'Hunger already at 100%'
  }
  return 'Sets hunger to 100% and resets consumption limits for new hunger cycle'
}

// Utility functions
const formatPreferenceName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatFoodList = (foods: string[]): string => {
  if (foods.length === 0) return 'None'
  return foods.map(f => formatPreferenceName(f)).join(', ')
}

const getHungerStatusClass = (value: number): string => {
  if (value >= 75) return 'text--success'
  if (value >= 50) return 'text--warning'
  return 'text--error'
}
</script>

<style scoped>
.feeding-debug {
  max-inline-size: 100%;
}

.guinea-pigs-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .guinea-pigs-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

.stats-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 1fr;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.divider {
  margin-block: var(--space-4);
  border: none;
  border-block-start: 1px solid var(--color-border-light);
}

.form-group {
  margin-block-end: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-block-end: var(--space-2);
}

.consumption-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-info-bg);
  border-radius: var(--radius-sm);
  margin-block-end: var(--space-3);
  border-inline-start: 3px solid var(--color-info);
}

.consumption-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.consumption-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feed-button {
  margin-block-end: var(--space-3);
}

.fulfill-button {
  margin-block-end: var(--space-4);
}

.preferences-display {
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.preferences-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preferences-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.preference-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.preference-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.preference-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-align: end;
}

.text-center {
  text-align: center;
}

.text--success {
  color: var(--color-success);
}

.text--warning {
  color: var(--color-warning);
}

.text--error {
  color: var(--color-error);
}
</style>
