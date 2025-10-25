<template>
  <div class="needs-debug debug-view__constrained">
    <h2>Needs System</h2>
    <!-- Individual Guinea Pig Needs -->
    <div v-if="hasActiveGuineaPigs">
      <div class="guinea-pigs-grid mb-6">
        <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id">
        <div class="panel panel--compact panel--overflow-visible">
          <div class="panel__header">
            <h3>{{ guineaPig.name }} ({{ guineaPig.breed }})</h3>
          </div>
          <div class="panel__content">
            <div class="guinea-pig-layout">
              <!-- Needs Section -->
              <section class="guinea-pig-layout__needs">
                <div class="panel panel--compact panel--accent panel--overflow-visible">
                  <div class="panel__header needs-panel-header">
                    <h4>Needs</h4>
                    <Button
                      @click="() => replenishAllNeeds(guineaPig.id)"
                      variant="primary"
                      size="sm"
                      :disabled="gameController.isPaused || !needsController.processingEnabled"
                      :tooltip="gameController.isPaused ? 'Action disabled - Game Paused' : (!needsController.processingEnabled ? 'Action disabled - Needs Processing Paused' : 'Replenish all needs to 100%')"
                      tooltip-position="bottom"
                    >
                      Replenish All Needs
                    </Button>                  </div>
                  <div class="panel__content">
                    <!-- Critical Needs -->
                    <div class="needs-category">
                      <div class="panel panel--compact panel--bordered panel--overflow-visible">
                        <div class="panel__header">
                          <h4>Critical Needs</h4>
                        </div>
                        <div class="panel__content">
                          <div class="needs-list">
                    <div v-for="need in criticalNeeds" :key="need" class="needs-list__item">
                      <NeedRow
                        :id="`${guineaPig.id}-${need}`"
                        :label="formatNeedName(need)"
                        :value="(guineaPig.needs as any)[need]"
                        :needType="need"
                        @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                      />
                      <Button
                        @click="getNeedAction(need, guineaPig.id).handler"
                        variant="tertiary"
                        size="sm"
                        :disabled="isQuickActionDisabled((guineaPig.needs as any)[need])"
                        :tooltip="getQuickActionTooltip((guineaPig.needs as any)[need], formatNeedName(need))"
                        :class="['needs-list__action', `needs-list__action--${need}`]"
                      >
                        {{ getNeedAction(need, guineaPig.id).label }}
                      </Button>
                    </div>
                  </div>
                        </div>
                      </div>
                    </div>

                    <!-- Environmental Needs -->
                    <div class="needs-category">
                      <div class="panel panel--compact panel--bordered panel--overflow-visible">
                        <div class="panel__header">
                          <h4>Environmental Needs</h4>
                        </div>
                        <div class="panel__content">
                          <div class="needs-list">
                    <div v-for="need in environmentalNeeds" :key="need" class="needs-list__item">
                      <NeedRow
                        :id="`${guineaPig.id}-${need}`"
                        :label="formatNeedName(need)"
                        :value="(guineaPig.needs as any)[need]"
                        :needType="need"
                        @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                      />
                      <Button
                        @click="getNeedAction(need, guineaPig.id).handler"
                        variant="tertiary"
                        size="sm"
                        :disabled="isQuickActionDisabled((guineaPig.needs as any)[need])"
                        :tooltip="getQuickActionTooltip((guineaPig.needs as any)[need], formatNeedName(need))"
                        :class="['needs-list__action', `needs-list__action--${need}`]"
                      >
                        {{ getNeedAction(need, guineaPig.id).label }}
                      </Button>
                    </div>
                  </div>
                        </div>
                      </div>
                    </div>

                    <!-- Maintenance Needs -->
                    <div class="needs-category">
                      <div class="panel panel--compact panel--bordered panel--overflow-visible">
                        <div class="panel__header">
                          <h4>Maintenance Needs</h4>
                        </div>
                        <div class="panel__content">
                          <div class="needs-list">
                    <div v-for="need in maintenanceNeeds" :key="need" class="needs-list__item">
                      <NeedRow
                        :id="`${guineaPig.id}-${need}`"
                        :label="formatNeedName(need)"
                        :value="(guineaPig.needs as any)[need]"
                        :needType="need"
                        @update:modelValue="(value: number) => adjustNeed(guineaPig.id, need, value)"
                      />
                      <Button
                        @click="getNeedAction(need, guineaPig.id).handler"
                        variant="tertiary"
                        size="sm"
                        :disabled="isQuickActionDisabled((guineaPig.needs as any)[need])"
                        :tooltip="getQuickActionTooltip((guineaPig.needs as any)[need], formatNeedName(need))"
                        :class="['needs-list__action', `needs-list__action--${need}`]"
                      >
                        {{ getNeedAction(need, guineaPig.id).label }}
                      </Button>
                    </div>
                  </div>
                        </div>
                      </div>
                    </div>
                    <!-- Stats & Wellness -->
                    <div class="needs-category">
                      <div class="panel panel--compact panel--bordered">
                        <div class="panel__header">
                          <h4>Stats & Wellness</h4>
                        </div>
                        <div class="panel__content">
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
              </section>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p>No active guinea pigs. Start a game session from the Pet Store tab to test needs system.</p>
      </div>
    </div>

    <!-- System Controls & Status - Bottom Row -->
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
                  :variant="needsController.processingEnabled ? 'danger' : 'warning'"
                  full-width
                  :disabled="!petStoreManager.activeGameSession || gameController.isPaused"
                  :tooltip="!petStoreManager.activeGameSession ? 'No active session' : (gameController.isPaused ? 'Game is paused - needs processing controlled by game state' : (needsController.processingEnabled
                    ? 'Pause needs processing (will stay paused when game resumes)'
                    : 'Resume needs processing'))"
                  tooltip-position="top"
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
                :disabled="!hasActiveGuineaPigs || gameController.isPaused || !needsController.processingEnabled"
                :tooltip="gameController.isPaused ? 'Action disabled - Game Paused' : (!needsController.processingEnabled ? 'Action disabled - Needs Processing Paused' : (!hasActiveGuineaPigs ? 'No active guinea pigs' : ''))"
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
            class="mt-6"
            @update:modelValue="updateDecayRate"
          />
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
              <span
                v-if="needsController.isPausedManually"
                class="stat-value text--warning"
              >
                Paused (Manual) ⚠️
              </span>
              <span
                v-else-if="!needsController.processingEnabled"
                class="stat-value text--muted"
              >
                Paused (Auto)
              </span>
              <span
                v-else
                class="stat-value text--success"
              >
                Active ✓
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useNeedsController } from '../../../stores/needsController'
import { useGameController } from '../../../stores/gameController'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import Button from '../../basic/Button.vue'
import SliderField from '../../basic/SliderField.vue'
import NeedRow from '../../basic/NeedRow.vue'
import Badge from '../../basic/Badge.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()
const gameController = useGameController()
const petStoreManager = usePetStoreManager()

// Reactive data
const decayRateMultiplier = ref(guineaPigStore.settings.needsDecayRate)

// Computed properties
const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Helper function to check if quick action is disabled
const isQuickActionDisabled = (needValue: number) => {
  return gameController.isPaused || !needsController.processingEnabled || needValue >= 100
}

// Helper function to get quick action tooltip when disabled
const getQuickActionTooltip = (needValue: number, needName?: string) => {
  if (gameController.isPaused) {
    return 'Action disabled - Game Paused'
  }
  if (!needsController.processingEnabled) {
    return 'Action disabled - Needs Processing Paused'
  }
  if (needValue >= 100) {
    return needName ? `${needName} already at 100%` : 'Need already at 100%'
  }
  return ''
}

// All needs organized by category
const criticalNeeds = ['hunger', 'thirst', 'energy', 'shelter'] as const
const environmentalNeeds = ['play', 'social', 'comfort'] as const
const maintenanceNeeds = ['hygiene', 'nails', 'health', 'chew'] as const
const allNeeds = [...criticalNeeds, ...environmentalNeeds, ...maintenanceNeeds] as const

// System controls
const toggleNeedsProcessing = () => {
  if (needsController.processingEnabled) {
    // Pass true to indicate manual pause
    needsController.pauseProcessing(true)
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
const giveWater = (guineaPigId: string) => {
  guineaPigStore.giveWater(guineaPigId)
}

const fulfillHunger = (guineaPigId: string) => {
  guineaPigStore.adjustNeed(guineaPigId, 'hunger', 100)
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

const provideShelter = (guineaPigId: string) => {
  guineaPigStore.provideShelter(guineaPigId)
}

const performHealthCheck = (guineaPigId: string) => {
  guineaPigStore.performHealthCheck(guineaPigId)
}

const sootheToSleep = (guineaPigId: string) => {
  guineaPigStore.sootheToSleep(guineaPigId)
}

const socializeWithGuineaPig = (guineaPigId: string) => {
  guineaPigStore.socializeWithGuineaPig(guineaPigId)
}

const provideBedding = (guineaPigId: string) => {
  guineaPigStore.provideBedding(guineaPigId)
}

const replenishAllNeeds = (guineaPigId: string) => {
  allNeeds.forEach(need => {
    guineaPigStore.adjustNeed(guineaPigId, need, 100)
  })
}

// Helper function to get the action button for each need
const getNeedAction = (need: string, guineaPigId: string) => {
  const actions: Record<string, { label: string; handler: () => void }> = {
    hunger: { label: 'Fulfill Hunger', handler: () => fulfillHunger(guineaPigId) },
    thirst: { label: 'Give Water', handler: () => giveWater(guineaPigId) },
    energy: { label: 'Soothe to Sleep', handler: () => sootheToSleep(guineaPigId) },
    shelter: { label: 'Provide Shelter', handler: () => provideShelter(guineaPigId) },
    play: { label: 'Play Together', handler: () => playWithGuineaPig(guineaPigId) },
    social: { label: 'Socialize', handler: () => socializeWithGuineaPig(guineaPigId) },
    comfort: { label: 'Provide Bedding', handler: () => provideBedding(guineaPigId) },
    hygiene: { label: 'Clean & Groom', handler: () => cleanGuineaPig(guineaPigId) },
    nails: { label: 'Trim Nails', handler: () => trimNails(guineaPigId) },
    health: { label: 'Health Check', handler: () => performHealthCheck(guineaPigId) },
    chew: { label: 'Give Chew Toy', handler: () => provideChewToy(guineaPigId) }
  }

  return actions[need] || { label: 'Action', handler: () => {} }
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
</script>

<style scoped>

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

.needs-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
}

/* Desktop: Side-by-side layout */
@media (min-width: 1800px) {
  .guinea-pig-layout {
    flex-direction: row;
    gap: var(--space-6);
  }

  .guinea-pig-layout__needs {
    flex: 3;
  }

  .guinea-pig-layout__sidebar {
    flex: 1;
    min-inline-size: 300px;
  }
}

/* Needs Category Sections */
.needs-category {
  margin-block-end: var(--space-4);
}

.needs-category:last-child {
  margin-block-end: 0;
}

.needs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.needs-list__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.needs-list__action {
  flex-shrink: 0;
  min-inline-size: 140px;
}

/* Need-specific action button colors */
.needs-list__action--hunger {
  background-color: var(--color-need-hunger);
  color: black;
  border-color: var(--color-need-hunger);
}

.needs-list__action--hunger:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-hunger) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-hunger) 85%, black);
  color: white;
}

.needs-list__action--thirst {
  background-color: var(--color-need-thirst);
  color: white;
  border-color: var(--color-need-thirst);
}

.needs-list__action--thirst:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-thirst) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-thirst) 85%, black);
}

.needs-list__action--energy {
  background-color: var(--color-need-energy);
  color: white;
  border-color: var(--color-need-energy);
}

.needs-list__action--energy:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-energy) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-energy) 85%, black);
  color: white;
}

.needs-list__action--shelter {
  background-color: var(--color-need-shelter);
  color: white;
  border-color: var(--color-need-shelter);
}

.needs-list__action--shelter:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-shelter) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-shelter) 85%, black);
  color: white;
}

.needs-list__action--play {
  background-color: var(--color-need-play);
  color: white;
  border-color: var(--color-need-play);
}

.needs-list__action--play:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-play) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-play) 85%, black);
}

.needs-list__action--social {
  background-color: var(--color-need-social);
  color: white;
  border-color: var(--color-need-social);
}

.needs-list__action--social:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-social) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-social) 85%, black);
}

.needs-list__action--comfort {
  background-color: var(--color-need-comfort);
  color: white;
  border-color: var(--color-need-comfort);
}

.needs-list__action--comfort:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-comfort) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-comfort) 85%, black);
}

.needs-list__action--hygiene {
  background-color: var(--color-need-hygiene);
  color: black;
  border-color: var(--color-need-hygiene);
}

.needs-list__action--hygiene:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-hygiene) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-hygiene) 85%, black);
  color: white;
}

.needs-list__action--nails {
  background-color: var(--color-need-nails);
  color: white;
  border-color: var(--color-need-nails);
}

.needs-list__action--nails:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-nails) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-nails) 85%, black);
}

.needs-list__action--health {
  background-color: var(--color-need-health);
  color: white;
  border-color: var(--color-need-health);
}

.needs-list__action--health:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-health) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-health) 85%, black);
}

.needs-list__action--chew {
  background-color: var(--color-need-chew);
  color: black;
  border-color: var(--color-need-chew);
}

.needs-list__action--chew:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-need-chew) 85%, black);
  border-color: color-mix(in srgb, var(--color-need-chew) 85%, black);
  color: white;
}

/* Need Row - styles now in NeedRow.vue component */

/* Desktop: side-by-side controls */
@media (min-width: 1024px) {
  .needs-list__item {
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
  }

  .need-row {
    flex: 1;
    flex-direction: row;
    align-items: center;
    gap: var(--space-4);
  }

  .need-row__info {
    min-inline-size: 120px;
    flex-shrink: 0;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
}

</style>