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
            <fieldset>
              <legend class="sr-only">Needs processing controls</legend>
              <div class="controls-grid">
                <Button
                  @click="toggleNeedsProcessing"
                  :variant="needsController.processingEnabled ? 'secondary' : 'primary'"
                  full-width
                >
                  {{ needsController.processingEnabled ? 'Pause' : 'Resume' }} Needs Processing
                </Button>

                <Button
                  @click="forceNeedsUpdate"
                  variant="tertiary"
                  full-width
                  :disabled="!hasActiveGuineaPigs"
                >
                  Force Needs Update
                </Button>
              </div>
            </fieldset>

            <div class="mt-4">
              <label for="decay-rate-slider" class="form-label">Decay Rate Multiplier</label>
              <Slider
                id="decay-rate-slider"
                v-model="decayRateMultiplier"
                :min="0"
                :max="5"
                :step="0.1"
                prefix=""
                suffix="x"
                @update:modelValue="updateDecayRate"
              />
            </div>

            <div class="mt-4">
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
            <div class="needs-grid">
              <!-- Critical Physical Needs (40% weight) -->
              <fieldset class="needs-group">
                <legend>Critical Physical (40% weight)</legend>
                <div class="needs-group-grid">
                  <div v-for="need in criticalPhysicalNeeds" :key="need" class="need-control">
                    <label :for="`${guineaPig.id}-${need}`" class="need-label">
                      {{ formatNeedName(need) }}
                    </label>
                    <Slider
                      :id="`${guineaPig.id}-${need}`"
                      :modelValue="(guineaPig.needs as any)[need]"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                    />
                    <span class="need-value" :class="getNeedStatusClass((guineaPig.needs as any)[need])">
                      {{ ((guineaPig.needs as any)[need]).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </fieldset>

              <!-- External Environment Needs (25% weight) -->
              <fieldset class="needs-group">
                <legend>External Environment (25% weight)</legend>
                <div class="needs-group-grid">
                  <div v-for="need in externalEnvironmentNeeds" :key="need" class="need-control">
                    <label :for="`${guineaPig.id}-${need}`" class="need-label">
                      {{ formatNeedName(need) }}
                    </label>
                    <Slider
                      :id="`${guineaPig.id}-${need}`"
                      :modelValue="(guineaPig.needs as any)[need]"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                    />
                    <span class="need-value" :class="getNeedStatusClass((guineaPig.needs as any)[need])">
                      {{ ((guineaPig.needs as any)[need]).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </fieldset>

              <!-- Maintenance Needs (20% weight) -->
              <fieldset class="needs-group">
                <legend>Maintenance (20% weight)</legend>
                <div class="needs-group-grid">
                  <div v-for="need in maintenanceNeeds" :key="need" class="need-control">
                    <label :for="`${guineaPig.id}-${need}`" class="need-label">
                      {{ formatNeedName(need) }}
                    </label>
                    <Slider
                      :id="`${guineaPig.id}-${need}`"
                      :modelValue="(guineaPig.needs as any)[need]"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                    />
                    <span class="need-value" :class="getNeedStatusClass((guineaPig.needs as any)[need])">
                      {{ ((guineaPig.needs as any)[need]).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </fieldset>

              <!-- Happiness Need (15% weight) -->
              <fieldset class="needs-group">
                <legend>Happiness (15% weight)</legend>
                <div class="needs-group-grid">
                  <div class="need-control">
                    <label :for="`${guineaPig.id}-happiness`" class="need-label">
                      Happiness
                    </label>
                    <Slider
                      :id="`${guineaPig.id}-happiness`"
                      :modelValue="guineaPig.needs.happiness"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(value: number) => adjustNeed(guineaPig.id, 'happiness', value)"
                    />
                    <span class="need-value" :class="getNeedStatusClass(guineaPig.needs.happiness)">
                      {{ guineaPig.needs.happiness.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </fieldset>
            </div>

            <hr class="divider" />

            <!-- Quick Actions -->
            <fieldset>
              <legend>Quick Actions</legend>
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
                <Button @click="() => allowRest(guineaPig.id)" variant="tertiary" size="sm">
                  Allow Rest
                </Button>
              </div>
            </fieldset>

            <hr class="divider" />

            <!-- Guinea Pig Stats -->
            <div class="guinea-pig-stats">
              <h5>Stats & Wellness</h5>
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
import Button from '../basic/Button.vue'
import Slider from '../basic/Slider.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()

// Reactive data
const decayRateMultiplier = ref(guineaPigStore.settings.needsDecayRate)
const autoDecayEnabled = ref(guineaPigStore.settings.autoNeedsDecay)

// Computed properties
const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Need categories for organized display
const criticalPhysicalNeeds = ['hunger', 'thirst', 'energy']
const externalEnvironmentNeeds = ['social', 'cleanliness', 'shelter']
const maintenanceNeeds = ['chew', 'nails', 'health']

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

const allowRest = (guineaPigId: string) => {
  guineaPigStore.allowRest(guineaPigId)
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

const getNeedStatusClass = (value: number): string => {
  if (value <= 25) return 'text--success'  // Low need is good
  if (value <= 50) return 'text--warning'
  if (value <= 75) return 'text--error'
  return 'text--critical'  // High need is critical
}

const getWellnessStatusClass = (value: number): string => {
  if (value >= 75) return 'text--success'  // High wellness is good
  if (value >= 55) return 'text--warning'
  if (value >= 45) return 'text--error'
  return 'text--critical'  // Low wellness is critical
}
</script>

<style scoped>
.needs-debug {
  max-inline-size: 100%;
}

.needs-grid {
  display: grid;
  gap: 1.5rem;
}

.needs-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin: 0;
}

.needs-group legend {
  font-weight: 600;
  color: var(--color-text-primary);
  padding-inline: 0.5rem;
}

.needs-group-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.need-control {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

.need-label {
  grid-column: 1 / -1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-block-end: 0.25rem;
}

.need-value {
  font-weight: 600;
  font-size: 0.875rem;
  min-inline-size: 3rem;
  text-align: end;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.guinea-pig-stats h5 {
  margin-block-end: 0.75rem;
  color: var(--color-text-primary);
}

.divider {
  border: none;
  border-block-start: 1px solid var(--color-border);
  margin-block: 1.5rem;
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

@container (max-width: 600px) {
  .needs-group-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>