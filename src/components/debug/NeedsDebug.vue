<template>
  <div class="needs-debug">
    <!-- Needs System Overview -->
    <div class="mb-8">
      <h2>Needs System Debug</h2>
      <div class="panel-row">
        <!-- System Controls -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>System Controls</h3>
          </div>
          <div class="panel__content">
            <fieldset class=" mb-6">
              <legend class="sr-only">Needs processing controls</legend>
              <div class="controls-grid">
                <div class="button-with-badge">
                  <Button
                    @click="toggleNeedsProcessing"
                    :variant="needsController.processingEnabled ? 'secondary' : 'primary'"
                    full-width
                    :disabled="gameController.isPaused"
                    class="needs-processing-button"
                  >
                    {{ needsController.processingEnabled ? 'Pause' : 'Resume' }} Needs Processing
                  </Button>
                  <Badge v-if="gameController.isPaused" variant="warning" size="sm" class="button-with-badge__badge">
                    Paused by Game
                  </Badge>
                </div>

                <Button
                  @click="forceNeedsUpdate"
                  variant="tertiary"
                  full-width
                  :disabled="!hasActiveGuineaPigs"
                  class="needs-processing-button"
                >
                  Force Needs Update
                </Button>
              </div>
            </fieldset>

            <hr class="divider">

            <SliderField
              v-model="decayRateMultiplier"
              label="Decay Rate Multiplier"
              :min="0"
              :max="5"
              :step="0.1"
              prefix=""
              suffix="x"
              class="mt-6 mb-6"
              @update:modelValue="updateDecayRate"
            />

            <hr class="divider">

            <div class="mt-6">
              <label for="auto-decay-toggle" class="form-label">
                <input
                  id="auto-decay-toggle"
                  type="checkbox"
                  v-model="autoDecayEnabled"
                  @change="toggleAutoDecay"
                  class="mr-2"
                >
                Auto Decay Enabled
              </label>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>System Status</h3>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Processing:</span>
                <span class="stat-value" :class="needsController.processingEnabled ? 'text--success' : 'text--error'">
                  {{ needsController.processingEnabled ? 'Active' : 'Paused' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Current Wellness:</span>
                <span class="stat-value">{{ needsController.currentWellness.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Penalty Active:</span>
                <span class="stat-value" :class="needsController.isPenaltyActive ? 'text--error' : 'text--success'">
                  {{ needsController.isPenaltyActive ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Penalty Rate:</span>
                <span class="stat-value">{{ needsController.currentPenaltyRate.toFixed(2) }}/tick</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Update:</span>
                <span class="stat-value">{{ formatTimestamp(needsController.lastBatchUpdate) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Update Interval:</span>
                <span class="stat-value">{{ needsController.updateIntervalMs / 1000 }}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Individual Guinea Pig Needs -->
    <div v-if="hasActiveGuineaPigs">
      <h3>Individual Guinea Pig Needs</h3>
      <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id" class="mb-6">
        <div class="panel">
          <div class="panel__header">
            <h4>{{ guineaPig.name }} ({{ guineaPig.breed }})</h4>
          </div>
          <div class="panel__content">
            <div class="guinea-pig-layout">
              <!-- Needs Section -->
              <section class="guinea-pig-layout__needs">
                <h5 class="section-title">Needs</h5>
                <div class="needs-compact-grid">
                  <div v-for="need in allNeeds" :key="need" class="need-control need-control--compact" :data-need-type="need" :data-need-urgency="getNeedUrgency((guineaPig.needs as any)[need])">
                    <label :for="`${guineaPig.id}-${need}`" class="need-label">
                      {{ formatNeedName(need) }}
                    </label>
                    <SliderField
                      :id="`${guineaPig.id}-${need}`"
                      :modelValue="(guineaPig.needs as any)[need]"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                    />
                    <span class="need-value">
                      {{ ((guineaPig.needs as any)[need]).toFixed(0) }}%
                    </span>
                  </div>
                </div>
              </section>

              <!-- Actions & Stats Sidebar -->
              <aside class="guinea-pig-layout__sidebar">
                <!-- Quick Actions -->
                <section class="sidebar-section">
                  <h5 class="section-title">Quick Actions</h5>
                  <div class="quick-actions-grid">
                    <Button @click="() => feedGuineaPig(guineaPig.id, 'pellets')" variant="tertiary" size="sm">
                      Feed Pellets
                    </Button>
                    <Button @click="() => feedGuineaPig(guineaPig.id, 'vegetables')" variant="tertiary" size="sm">
                      Feed Vegetables
                    </Button>
                    <Button @click="() => giveWater(guineaPig.id)" variant="tertiary" size="sm">
                      Give Water
                    </Button>
                    <Button @click="() => cleanGuineaPig(guineaPig.id)" variant="tertiary" size="sm">
                      Clean
                    </Button>
                    <Button @click="() => playWithGuineaPig(guineaPig.id)" variant="tertiary" size="sm">
                      Play
                    </Button>
                    <Button @click="() => provideChewToy(guineaPig.id)" variant="tertiary" size="sm">
                      Chew Toy
                    </Button>
                    <Button @click="() => trimNails(guineaPig.id)" variant="tertiary" size="sm">
                      Trim Nails
                    </Button>
                    <Button @click="() => sootheToSleep(guineaPig.id)" variant="tertiary" size="sm">
                      Soothe to Sleep
                    </Button>
                  </div>
                </section>

                <!-- Stats & Wellness -->
                <section class="sidebar-section">
                  <h5 class="section-title">Stats & Wellness</h5>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-label">Friendship:</span>
                      <span class="stat-value">{{ guineaPig.friendship.toFixed(1) }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Wellness:</span>
                      <span class="stat-value" :class="getWellnessStatusClass(calculateWellness(guineaPig.id))">
                        {{ calculateWellness(guineaPig.id).toFixed(1) }}%
                      </span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Last Interaction:</span>
                      <span class="stat-value">{{ formatTimestamp(guineaPig.lastInteraction) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Total Interactions:</span>
                      <span class="stat-value">{{ guineaPig.totalInteractions }}</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--warning">
      <div class="panel__content text-center">
        <p>No active guinea pigs. Start a game session from the Pet Store tab to test needs system.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useNeedsController } from '../../stores/needsController'
import { useGameController } from '../../stores/gameController'
import Button from '../basic/Button.vue'
import SliderField from '../basic/SliderField.vue'
import Badge from '../basic/Badge.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()
const gameController = useGameController()

// Reactive data
const decayRateMultiplier = ref(guineaPigStore.settings.needsDecayRate)
const autoDecayEnabled = ref(guineaPigStore.settings.autoNeedsDecay)

// Computed properties
const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// All needs in a single array for compact display
const allNeeds = ['hunger', 'thirst', 'energy', 'happiness', 'social', 'cleanliness', 'shelter', 'chew', 'nails', 'health']

// System controls
const toggleNeedsProcessing = () => {
  if (needsController.processingEnabled) {
    needsController.pauseProcessing()
  } else {
    needsController.resumeProcessing()
  }
}

const forceNeedsUpdate = () => {
  needsController.processBatchUpdate()
}

const updateDecayRate = (value: number) => {
  guineaPigStore.settings.needsDecayRate = value
}

const toggleAutoDecay = () => {
  guineaPigStore.settings.autoNeedsDecay = autoDecayEnabled.value
}

// Need manipulation
const adjustNeed = (guineaPigId: string, needType: string, value: number) => {
  // Set the need to the exact value (not adjust by amount)
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  const currentValue = guineaPig.needs[needType as keyof typeof guineaPig.needs] || 0
  const adjustment = value - currentValue
  guineaPigStore.adjustNeed(guineaPigId, needType as any, adjustment)
}

// Quick actions
const feedGuineaPig = (guineaPigId: string, foodType: 'pellets' | 'vegetables') => {
  guineaPigStore.feedGuineaPig(guineaPigId, foodType)
}

const giveWater = (guineaPigId: string) => {
  guineaPigStore.giveWater(guineaPigId)
}

const cleanGuineaPig = (guineaPigId: string) => {
  guineaPigStore.cleanGuineaPig(guineaPigId)
}

const playWithGuineaPig = (guineaPigId: string) => {
  guineaPigStore.playWithGuineaPig(guineaPigId)
}

const provideChewToy = (guineaPigId: string) => {
  guineaPigStore.provideChewToy(guineaPigId)
}

const trimNails = (guineaPigId: string) => {
  guineaPigStore.trimNails(guineaPigId)
}

const sootheToSleep = (guineaPigId: string) => {
  guineaPigStore.sootheToSleep(guineaPigId)
}

// Wellness calculation
const calculateWellness = (guineaPigId: string): number => {
  return needsController.calculateWellness(guineaPigId)
}

// Utility functions
const formatNeedName = (need: string): string => {
  return need.charAt(0).toUpperCase() + need.slice(1)
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}

const getWellnessStatusClass = (value: number): string => {
  if (value >= 75) return 'text--success'  // High wellness is good
  if (value >= 55) return 'text--warning'
  if (value >= 45) return 'text--error'
  return 'text--critical'  // Low wellness is critical
}

const getNeedUrgency = (value: number): string => {
  // Value represents satisfaction level: 100 = full/satisfied, 0 = empty/critical
  if (value >= 90) return 'satisfied'  // 90-100: Fully satisfied (green)
  if (value >= 70) return 'good'       // 70-89: Good (slate gray)
  if (value >= 50) return 'medium'     // 50-69: Getting low (yellow)
  return 'critical'  // 0-49: Critical/empty (red)
}
</script>

<style scoped>
.needs-debug {
  max-inline-size: 100%;
}

/* Mobile-first: Stack vertically */
.guinea-pig-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.guinea-pig-layout__needs {
  flex: 1;
}

.guinea-pig-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tablet and up: Side-by-side layout */
@media (min-width: 768px) {
  .guinea-pig-layout {
    flex-direction: row;
    gap: var(--space-6);
  }

  .guinea-pig-layout__needs {
    flex: 2;
  }

  .guinea-pig-layout__sidebar {
    flex: 1;
    min-inline-size: 300px;
  }
}

.needs-compact-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.need-control {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.need-control--compact {
  padding: 0.5rem;
  gap: 0.375rem;
}

/* Need-specific colors using data attributes */
.need-control[data-need-type="hunger"] {
  border-inline-start: 3px solid var(--color-need-hunger);
}
.need-control[data-need-type="thirst"] {
  border-inline-start: 3px solid var(--color-need-thirst);
}
.need-control[data-need-type="happiness"] {
  border-inline-start: 3px solid var(--color-need-happiness);
}
.need-control[data-need-type="cleanliness"] {
  border-inline-start: 3px solid var(--color-need-cleanliness);
}
.need-control[data-need-type="health"] {
  border-inline-start: 3px solid var(--color-need-health);
}
.need-control[data-need-type="energy"] {
  border-inline-start: 3px solid var(--color-need-energy);
}
.need-control[data-need-type="social"] {
  border-inline-start: 3px solid var(--color-need-social);
}
.need-control[data-need-type="nails"] {
  border-inline-start: 3px solid var(--color-need-nails);
}
.need-control[data-need-type="chew"] {
  border-inline-start: 3px solid var(--color-need-chew);
}
.need-control[data-need-type="shelter"] {
  border-inline-start: 3px solid var(--color-need-shelter);
}

/* Urgency-based backgrounds */
.need-control[data-need-urgency="satisfied"] {
  background-color: var(--color-success-bg);
}
.need-control[data-need-urgency="good"] {
  background-color: rgba(100, 116, 139, 0.1); /* Slate gray tint */
}
.need-control[data-need-urgency="medium"] {
  background-color: var(--color-warning-bg);
}
.need-control[data-need-urgency="critical"] {
  background-color: var(--color-error-bg);
}

.need-label {
  grid-column: 1 / -1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-block-end: 0.25rem;
}

.need-control--compact .need-label {
  font-size: 0.75rem;
  margin-block-end: 0.125rem;
}

.need-value {
  font-weight: 600;
  font-size: 0.875rem;
  min-inline-size: 3rem;
  text-align: end;
}

.need-control--compact .need-value {
  font-size: 0.75rem;
  min-inline-size: 2.5rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
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

.text--critical {
  color: var(--color-error);
  font-weight: 600;
}

.needs-processing-button {
  white-space: normal;
}
</style>