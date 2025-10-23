<template>
  <div class="autonomy-debug">
    <h4>Autonomy Controls</h4>

    <!-- Per-Guinea Pig Autonomy Controls -->
    <div v-if="hasActiveGuineaPigs" class="guinea-pig-grid">
      <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id" class="guinea-pig-autonomy">
        <div class="panel panel--compact mb-4">
          <div class="panel__header">
            <h5>{{ guineaPig.name }}</h5>
          </div>
          <div class="panel__content">
            <!-- Manual Triggers & Current Status -->
            <div class="autonomy-section mb-4">
              <div class="button-row mb-3">
                <button
                  class="btn btn--sm btn--secondary"
                  :disabled="!isGameActive"
                  @click="triggerBehavior(guineaPig.id, 'eat')"
                >
                  🍽️ Trigger Eat
                </button>
                <button
                  class="btn btn--sm btn--secondary"
                  :disabled="!isGameActive"
                  @click="triggerBehavior(guineaPig.id, 'drink')"
                >
                  💧 Trigger Drink
                </button>
                <button
                  class="btn btn--sm btn--secondary"
                  :disabled="!isGameActive"
                  @click="triggerBehavior(guineaPig.id, 'sleep')"
                >
                  😴 Trigger Sleep
                </button>
                <button
                  class="btn btn--sm btn--secondary"
                  :disabled="!isGameActive"
                  @click="triggerBehavior(guineaPig.id, 'wander')"
                >
                  🚶 Trigger Wander
                </button>
                <button
                  class="btn btn--sm btn--warning"
                  :disabled="!isGameActive || getCurrentGoal(guineaPig.id) === 'none'"
                  @click="cancelBehavior(guineaPig.id)"
                >
                  ❌ Cancel
                </button>
              </div>

              <!-- Current Status -->
              <div class="status-info">
                <div class="status-info__item">
                  <span class="status-info__label">Activity:</span>
                  <span class="status-info__value">{{ getCurrentActivity(guineaPig.id) }}</span>
                </div>
                <div class="status-info__item">
                  <span class="status-info__label">Goal:</span>
                  <span class="status-info__value">{{ getCurrentGoal(guineaPig.id) }}</span>
                </div>
                <div class="status-info__item">
                  <span class="status-info__label">Position:</span>
                  <span class="status-info__value">{{ getPosition(guineaPig.id) }}</span>
                </div>
              </div>
            </div>

            <!-- Behavior Threshold Sliders -->
            <div class="autonomy-section">
              <!-- Hunger Threshold -->
              <div class="threshold-control mb-3">
                <label :for="`${guineaPig.id}-hunger-threshold`">
                  Hunger Behavior Threshold
                </label>
                <div class="threshold-control__info">
                  <span class="threshold-control__value">{{ getHungerThreshold(guineaPig.id) }}%</span>
                  <span class="threshold-control__note">
                    (Will seek food when hunger drops below this)
                  </span>
                </div>
                <SliderField
                  :id="`${guineaPig.id}-hunger-threshold`"
                  :modelValue="getHungerThreshold(guineaPig.id)"
                  :min="10"
                  :max="80"
                  :step="5"
                  prefix=""
                  suffix="%"
                  :show-min-max="true"
                  @update:modelValue="(value: number) => setHungerThreshold(guineaPig.id, value)"
                />
              </div>

              <!-- Thirst Threshold -->
              <div class="threshold-control mb-3">
                <label :for="`${guineaPig.id}-thirst-threshold`">
                  Thirst Behavior Threshold
                </label>
                <div class="threshold-control__info">
                  <span class="threshold-control__value">{{ getThirstThreshold(guineaPig.id) }}%</span>
                  <span class="threshold-control__note">
                    (Will seek water when thirst drops below this)
                  </span>
                </div>
                <SliderField
                  :id="`${guineaPig.id}-thirst-threshold`"
                  :modelValue="getThirstThreshold(guineaPig.id)"
                  :min="10"
                  :max="80"
                  :step="5"
                  prefix=""
                  suffix="%"
                  :show-min-max="true"
                  @update:modelValue="(value: number) => setThirstThreshold(guineaPig.id, value)"
                />
              </div>

              <!-- Energy Threshold -->
              <div class="threshold-control mb-3">
                <label :for="`${guineaPig.id}-energy-threshold`">
                  Sleep Behavior Threshold
                </label>
                <div class="threshold-control__info">
                  <span class="threshold-control__value">{{ getEnergyThreshold(guineaPig.id) }}%</span>
                  <span class="threshold-control__note">
                    (Will sleep when energy drops below this)
                  </span>
                </div>
                <SliderField
                  :id="`${guineaPig.id}-energy-threshold`"
                  :modelValue="getEnergyThreshold(guineaPig.id)"
                  :min="10"
                  :max="80"
                  :step="5"
                  prefix=""
                  suffix="%"
                  :show-min-max="true"
                  @update:modelValue="(value: number) => setEnergyThreshold(guineaPig.id, value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Autonomy Settings (Bottom Section) -->
    <div class="panel panel--compact mb-4">
      <div class="panel__header">
        <h5>Global Autonomy Settings</h5>
      </div>
      <div class="panel__content">
        <div class="global-controls">
          <div class="control-row">
            <label class="control-label">
              <input
                type="checkbox"
                checked
                disabled
                title="AI is always enabled in game loop"
              />
              <span class="control-label__text">Autonomous AI System</span>
            </label>
            <span class="control-description">
              🟢 AI Always Running
            </span>
          </div>

          <div class="control-row mt-3">
            <label :for="'ai-tick-interval'" class="control-label__text">
              Game Loop Interval
            </label>
            <div class="control-info">
              <span class="control-value">{{ gameTimingStore.intervalMs / 1000 }}s</span>
              <span class="control-description">
                (Game loop tick rate - affects all systems)
              </span>
            </div>
            <SliderField
              id="ai-tick-interval"
              :modelValue="gameTimingStore.intervalMs"
              :min="1000"
              :max="10000"
              :step="500"
              prefix=""
              suffix="ms"
              :show-min-max="true"
              @update:modelValue="gameTimingStore.setIntervalMs"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!hasActiveGuineaPigs" class="panel panel--compact panel--warning">
      <div class="panel__content text-center">
        <p>No active guinea pigs. Start a game session to test autonomy behaviors.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useGameTimingStore } from '../../../stores/gameTimingStore'
import { useGameController } from '../../../stores/gameController'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigBehavior } from '../../../composables/game/useGuineaPigBehavior'
import type { BehaviorType } from '../../../composables/game/useGuineaPigBehavior'
import SliderField from '../../basic/SliderField.vue'

const guineaPigStore = useGuineaPigStore()
const gameTimingStore = useGameTimingStore()
const gameController = useGameController()
const habitatConditions = useHabitatConditions()

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)
const isGameActive = computed(() => gameController.isGameActive)

// Cache behavior composables (similar to gameTimingStore pattern)
const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

// Store thresholds per guinea pig (default values)
const behaviorThresholds = ref<Record<string, {
  hunger: number
  thirst: number
  energy: number
}>>({})

// Initialize thresholds for a guinea pig if not present
function ensureThresholds(guineaPigId: string) {
  if (!behaviorThresholds.value[guineaPigId]) {
    behaviorThresholds.value[guineaPigId] = {
      hunger: 30,  // Default: trigger at 30%
      thirst: 25,  // Default: trigger at 25%
      energy: 40   // Default: trigger at 40%
    }
  }
}

// Getters
function getHungerThreshold(guineaPigId: string): number {
  ensureThresholds(guineaPigId)
  return behaviorThresholds.value[guineaPigId].hunger
}

function getThirstThreshold(guineaPigId: string): number {
  ensureThresholds(guineaPigId)
  return behaviorThresholds.value[guineaPigId].thirst
}

function getEnergyThreshold(guineaPigId: string): number {
  ensureThresholds(guineaPigId)
  return behaviorThresholds.value[guineaPigId].energy
}

// Setters
function setHungerThreshold(guineaPigId: string, value: number) {
  ensureThresholds(guineaPigId)
  behaviorThresholds.value[guineaPigId].hunger = value
}

function setThirstThreshold(guineaPigId: string, value: number) {
  ensureThresholds(guineaPigId)
  behaviorThresholds.value[guineaPigId].thirst = value
}

function setEnergyThreshold(guineaPigId: string, value: number) {
  ensureThresholds(guineaPigId)
  behaviorThresholds.value[guineaPigId].energy = value
}

/**
 * Get or create behavior composable for a guinea pig
 */
function getBehaviorComposable(guineaPigId: string) {
  let behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) {
    behavior = useGuineaPigBehavior(guineaPigId)
    behaviorComposables.set(guineaPigId, behavior)
  }
  return behavior
}

/**
 * Cancel current behavior
 */
function cancelBehavior(guineaPigId: string) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  if (behavior.behaviorState.value.currentGoal) {
    console.log(`Canceling ${behavior.behaviorState.value.currentGoal.type} behavior for ${guineaPig.name}`)
    behavior.behaviorState.value.currentGoal = null
    behavior.behaviorState.value.currentActivity = 'idle'
    // Stop any current movement
    behavior.stopMovement()
  }
}

/**
 * Manual behavior triggers - Force execute specific behaviors for testing
 * Temporarily lowers the guinea pig's needs to trigger the behavior
 */
async function triggerBehavior(guineaPigId: string, behaviorType: BehaviorType) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  // Store original need values
  const originalNeeds = { ...guineaPig.needs }

  try {
    // Temporarily lower the relevant need to force behavior selection
    switch (behaviorType) {
      case 'eat':
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', -100) // Drop hunger to near 0
        break
      case 'drink':
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', -100) // Drop thirst to near 0
        break
      case 'sleep':
        guineaPigStore.adjustNeed(guineaPigId, 'energy', -100) // Drop energy to near 0
        break
    }

    // Small delay to ensure need update propagates
    await new Promise(resolve => setTimeout(resolve, 10))

    console.log(`[Manual Trigger] ${guineaPig.name} needs after adjustment:`, {
      hunger: guineaPig.needs.hunger,
      thirst: guineaPig.needs.thirst,
      energy: guineaPig.needs.energy
    })

    // Get custom thresholds if set, with all required fields
    const customThresholds = behaviorThresholds.value[guineaPigId]
    const thresholds = {
      hunger: customThresholds?.hunger ?? 30,
      thirst: customThresholds?.thirst ?? 25,
      energy: customThresholds?.energy ?? 40,
      hygiene: 30,
      shelter: 60,
      chew: 40
    }

    console.log(`[Manual Trigger] Thresholds:`, thresholds)
    console.log(`[Manual Trigger] Checking cooldown for ${behaviorType}:`, behavior.isOnCooldown(behaviorType))

    // Let the AI select the appropriate goal (now that need is low)
    const goal = behavior.selectBehaviorGoal(thresholds)

    console.log(`[Manual Trigger] Selected goal:`, goal)

    // Check if goal matches requested behavior type
    // Note: 'eat' can result in 'eat' or 'eat_hay' depending on what's available
    const isMatchingGoal = goal && (
      goal.type === behaviorType ||
      (behaviorType === 'eat' && goal.type === 'eat_hay') // Accept hay when triggering eat
    )

    if (isMatchingGoal && goal) {
      // Check if already executing a behavior
      if (behavior.behaviorState.value.currentGoal) {
        console.warn(`❌ ${guineaPig.name} is already executing behavior: ${behavior.behaviorState.value.currentGoal.type}`)

        // Restore original needs since behavior didn't execute
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
        guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
        return
      }

      // Execute the behavior
      const success = await behavior.executeBehavior(goal)
      if (success) {
        console.log(`✅ Triggered ${goal.type} behavior for ${guineaPig.name} (requested: ${behaviorType})`)

        // For manual triggers, fully satisfy the need to 100% for testing convenience
        switch (behaviorType) {
          case 'eat':
            guineaPigStore.adjustNeed(guineaPigId, 'hunger', 100 - guineaPig.needs.hunger)
            break
          case 'drink':
            guineaPigStore.adjustNeed(guineaPigId, 'thirst', 100 - guineaPig.needs.thirst)
            break
          case 'sleep':
            guineaPigStore.adjustNeed(guineaPigId, 'energy', 100 - guineaPig.needs.energy)
            break
        }

        console.log(`[Manual Trigger] Needs after manual satisfaction:`, {
          hunger: guineaPig.needs.hunger,
          thirst: guineaPig.needs.thirst,
          energy: guineaPig.needs.energy
        })
      } else {
        console.warn(`❌ Failed to trigger ${goal.type} behavior for ${guineaPig.name} - execution returned false`)
      }
    } else if (goal) {
      console.warn(`❌ Goal created but wrong type. Expected: ${behaviorType}, Got: ${goal.type}`)

      // Restore original needs since behavior didn't execute
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
    } else {
      console.warn(`❌ No goal created. Check: cooldown status, habitat items (bowls/water/etc)`)

      // Restore original needs since behavior didn't execute
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
    }
  } catch (error) {
    console.error(`❌ Error triggering ${behaviorType}:`, error)

    // Restore original needs on error
    guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
    guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
    guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
  }
}

/**
 * Get current activity from behavior state
 */
function getCurrentActivity(guineaPigId: string): string {
  const behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) return 'idle'

  return behavior.behaviorState.value.currentActivity
}

/**
 * Get current goal from behavior state
 */
function getCurrentGoal(guineaPigId: string): string {
  const behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) return 'none'

  const goal = behavior.behaviorState.value.currentGoal
  if (!goal) return 'none'

  return goal.type
}

/**
 * Get guinea pig position
 */
function getPosition(guineaPigId: string): string {
  const pos = habitatConditions.guineaPigPositions.get(guineaPigId)
  if (!pos) return 'unknown'

  return `(${pos.x}, ${pos.y})`
}

// Export controls for use by autonomy system
defineExpose({
  behaviorThresholds,
  getHungerThreshold,
  getThirstThreshold,
  getEnergyThreshold
})
</script>

<style scoped>
.autonomy-debug {
  padding-block: var(--space-4);
}

.autonomy-debug h4 {
  font-size: var(--font-size-2xl);
}

.autonomy-debug h5 {
  font-size: var(--font-size-2xl);
}

.autonomy-debug h6 {
  font-size: var(--font-size-2xl);
}

/* Responsive grid for guinea pig panels */
.guinea-pig-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

/* When there are 2 guinea pigs, show side-by-side */
.guinea-pig-grid:has(> :nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

.guinea-pig-autonomy {
  margin-block-end: var(--space-4);
}

.autonomy-section {
  padding-block: var(--space-3);
  border-block-start: 1px solid var(--color-border-light);
}

.autonomy-section:first-child {
  border-block-start: none;
  padding-block-start: 0;
}

.global-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.control-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.control-label__text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.control-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.control-value {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.control-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.threshold-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.threshold-control label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.threshold-control__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.threshold-control__value {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.threshold-control__note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.btn:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
}

.btn--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
}

.btn--secondary {
  background: var(--color-secondary-bg);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.btn--secondary:hover {
  background: var(--color-secondary);
  color: white;
}

.btn--warning {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.btn--warning:hover {
  background: var(--color-warning);
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background: var(--color-bg-primary);
  border-color: var(--color-border-medium);
}

.btn--secondary:disabled:hover {
  background: var(--color-secondary-bg);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.btn--warning:disabled:hover {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.status-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.status-info__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status-info__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
</style>
