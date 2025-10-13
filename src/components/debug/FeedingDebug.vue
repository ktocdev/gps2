<template>
  <div class="feeding-debug">
    <!-- Individual Guinea Pig Feeding -->
    <div v-if="hasActiveGuineaPigs">
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

            <!-- Food Category Selection -->
            <div class="food-categories-grid">
              <!-- Fruits -->
              <div class="form-group">
                <label :for="`fruit-select-${guineaPig.id}`" class="form-label">
                  Fruits ({{ getRemainingServings(guineaPig.id, 'fruit') }}/{{ getLimit(guineaPig.id, 'fruit') }} remaining)
                </label>
                <Select
                  :id="`fruit-select-${guineaPig.id}`"
                  :modelValue="selectedFoodTypes[guineaPig.id]?.fruit || ''"
                  @update:modelValue="(value: string | number) => updateSelectedFood(guineaPig.id, 'fruit', String(value))"
                  :options="fruitOptions"
                  placeholder="Select fruit..."
                  size="sm"
                  :disabled="gameController.isPaused || !needsController.processingEnabled"
                />
              </div>

              <!-- Vegetables -->
              <div class="form-group">
                <label :for="`vegetable-select-${guineaPig.id}`" class="form-label">
                  Vegetables ({{ getRemainingServings(guineaPig.id, 'vegetables') }}/{{ getLimit(guineaPig.id, 'vegetables') }} remaining)
                </label>
                <Select
                  :id="`vegetable-select-${guineaPig.id}`"
                  :modelValue="selectedFoodTypes[guineaPig.id]?.vegetables || ''"
                  @update:modelValue="(value: string | number) => updateSelectedFood(guineaPig.id, 'vegetables', String(value))"
                  :options="vegetableOptions"
                  placeholder="Select vegetable..."
                  size="sm"
                  :disabled="gameController.isPaused || !needsController.processingEnabled"
                />
              </div>

              <!-- Pellets -->
              <div class="form-group">
                <label :for="`pellet-select-${guineaPig.id}`" class="form-label">
                  Pellets ({{ getRemainingServings(guineaPig.id, 'pellets') }}/{{ getLimit(guineaPig.id, 'pellets') }} remaining)
                </label>
                <Select
                  :id="`pellet-select-${guineaPig.id}`"
                  :modelValue="selectedFoodTypes[guineaPig.id]?.pellets || ''"
                  @update:modelValue="(value: string | number) => updateSelectedFood(guineaPig.id, 'pellets', String(value))"
                  :options="pelletOptions"
                  placeholder="Select pellets..."
                  size="sm"
                  :disabled="gameController.isPaused || !needsController.processingEnabled"
                />
              </div>

              <!-- Treats -->
              <div class="form-group">
                <label :for="`treat-select-${guineaPig.id}`" class="form-label">
                  Treats ({{ getRemainingServings(guineaPig.id, 'treats') }}/{{ getLimit(guineaPig.id, 'treats') }} remaining)
                </label>
                <Select
                  :id="`treat-select-${guineaPig.id}`"
                  :modelValue="selectedFoodTypes[guineaPig.id]?.treats || ''"
                  @update:modelValue="(value: string | number) => updateSelectedFood(guineaPig.id, 'treats', String(value))"
                  :options="treatOptions"
                  placeholder="Select treat..."
                  size="sm"
                  :disabled="gameController.isPaused || !needsController.processingEnabled"
                />
              </div>

              <!-- Hay -->
              <div class="form-group">
                <label :for="`hay-select-${guineaPig.id}`" class="form-label">
                  Hay (Unlimited ∞)
                </label>
                <Select
                  :id="`hay-select-${guineaPig.id}`"
                  :modelValue="selectedFoodTypes[guineaPig.id]?.hay || ''"
                  @update:modelValue="(value: string | number) => updateSelectedFood(guineaPig.id, 'hay', String(value))"
                  :options="hayOptions"
                  placeholder="Select hay..."
                  size="sm"
                  :disabled="gameController.isPaused || !needsController.processingEnabled"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <Button
                @click="feedGuineaPig(guineaPig.id)"
                variant="primary"
                size="md"
                :disabled="isFeedDisabled(guineaPig.id)"
                :title="getFeedTooltip(guineaPig.id)"
                class="action-buttons__feed"
              >
                Feed {{ getSelectedFoodLabel(guineaPig.id) }}
              </Button>

              <Button
                @click="fulfillSessionHunger(guineaPig.id)"
                variant="secondary"
                size="md"
                :disabled="gameController.isPaused || !needsController.processingEnabled || guineaPig.needs.hunger >= 100"
                :title="getFullfillHungerTooltip(guineaPig.needs.hunger)"
                class="action-buttons__fulfill"
              >
                Fulfill Session Hunger (Reset Limits)
              </Button>
            </div>

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

// Reactive data - Track selected food per category per guinea pig
const selectedFoodTypes = ref<Record<string, {
  fruit?: string
  vegetables?: string
  pellets?: string
  treats?: string
  hay?: string
}>>({})

// Computed properties
const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Food category options
const fruitOptions = computed(() => {
  return petStoreManager.fruits.map(f => ({
    label: formatPreferenceName(f),
    value: f
  }))
})

const vegetableOptions = computed(() => {
  return petStoreManager.vegetables.map(v => ({
    label: formatPreferenceName(v),
    value: v
  }))
})

const pelletOptions = computed(() => {
  return [{ label: 'Pellets', value: 'pellets' }]
})

const treatOptions = computed(() => {
  return [{ label: 'Treats', value: 'treats' }]
})

const hayOptions = computed(() => {
  return petStoreManager.hayTypes.map(h => ({
    label: formatPreferenceName(h),
    value: h
  }))
})

// Update selected food for a specific category
const updateSelectedFood = (guineaPigId: string, category: string, value: string) => {
  // Clear all other category selections when a new one is selected
  // This ensures only one food item is selected at a time across all categories
  selectedFoodTypes.value[guineaPigId] = {
    [category]: value
  } as any
}

// Get the currently selected food item across all categories
const getSelectedFood = (guineaPigId: string): { category: FoodType, item: string } | null => {
  const selections = selectedFoodTypes.value[guineaPigId]
  if (!selections) return null

  // Check each category for a selection
  if (selections.fruit) return { category: 'fruit', item: selections.fruit }
  if (selections.vegetables) return { category: 'vegetables', item: selections.vegetables }
  if (selections.pellets) return { category: 'pellets', item: selections.pellets }
  if (selections.treats) return { category: 'treats', item: selections.treats }
  if (selections.hay) return { category: 'hay', item: selections.hay }

  return null
}

// Get label for feed button
const getSelectedFoodLabel = (guineaPigId: string): string => {
  const selected = getSelectedFood(guineaPigId)
  return selected ? formatPreferenceName(selected.item) : 'Food'
}

// System 2.5: Get remaining servings for a food type category
const getRemainingServings = (guineaPigId: string, foodType: FoodType | string): number => {
  return guineaPigStore.getRemainingServings(guineaPigId, foodType as FoodType)
}

// System 2.5: Get limit for a food type category
const getLimit = (guineaPigId: string, foodType: FoodType | string): number => {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig || foodType === 'hay') return 0

  const limit = guineaPig.consumptionLimits[foodType as keyof typeof guineaPig.consumptionLimits]
  return limit ? limit.limit : 0
}

// Feed guinea pig
const feedGuineaPig = (guineaPigId: string) => {
  const selected = getSelectedFood(guineaPigId)
  if (!selected) return

  guineaPigStore.feedGuineaPig(guineaPigId, selected.category)
}

// Fulfill session hunger (resets consumption limits)
const fulfillSessionHunger = (guineaPigId: string) => {
  guineaPigStore.adjustNeed(guineaPigId, 'hunger', 100)
}

// Check if feed button should be disabled
const isFeedDisabled = (guineaPigId: string): boolean => {
  if (gameController.isPaused || !needsController.processingEnabled) return true

  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (guineaPig && guineaPig.needs.hunger >= 100) return true

  const selected = getSelectedFood(guineaPigId)
  if (!selected) return true

  const canConsume = guineaPigStore.checkConsumptionLimit(guineaPigId, selected.category)
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

  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (guineaPig && guineaPig.needs.hunger >= 100) {
    return 'Hunger already at 100%'
  }

  const selected = getSelectedFood(guineaPigId)
  if (!selected) {
    return 'Select a food item from any category first'
  }

  const canConsume = guineaPigStore.checkConsumptionLimit(guineaPigId, selected.category)
  if (!canConsume) {
    return `Consumption limit reached for ${selected.category}. Fulfill hunger to reset limits.`
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

.food-categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  margin-block-end: var(--space-4);
}

@media (min-width: 1024px) {
  .food-categories-grid {
    grid-template-columns: 1fr 1fr;
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-block-end: var(--space-4);
}

@media (min-width: 1024px) {
  .action-buttons {
    flex-direction: row;
  }
}

.action-buttons__feed,
.action-buttons__fulfill {
  flex: 1;
  white-space: break-spaces;
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
