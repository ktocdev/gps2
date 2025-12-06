<template>
  <div class="manual-control-debug">
    <h3>🎮 Manual Control Debug</h3>

    <div class="control-stats panel">
      <h4>Control State</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Active:</span>
          <span class="stat-value" :class="{ 'stat-value--active': manualControl.isControlActive.value }">
            {{ manualControl.isControlActive.value ? '✅ Yes' : '❌ No' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Controlled Guinea Pig:</span>
          <span class="stat-value">{{ controlledGuineaPigName || 'None' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Time Remaining:</span>
          <span class="stat-value">{{ manualControl.timeRemaining.value }}s</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Target Position:</span>
          <span class="stat-value">{{ targetPositionText }}</span>
        </div>
      </div>
    </div>

    <div class="control-actions panel">
      <h4>Test Actions</h4>

      <div v-if="guineaPigStore.activeGuineaPigs.length === 0" class="no-guinea-pigs">
        <p>No active guinea pigs to control</p>
      </div>

      <div v-else class="guinea-pig-controls">
        <div v-for="gp in guineaPigStore.activeGuineaPigs" :key="gp.id" class="guinea-pig-control-row">
          <span class="guinea-pig-name">{{ gp.name }}</span>
          <Button
            v-if="!manualControl.isControlled(gp.id)"
            @click="takeControl(gp.id)"
            variant="primary"
            size="sm"
          >
            Take Control
          </Button>
          <Button
            v-else
            @click="releaseControl()"
            variant="secondary"
            size="sm"
          >
            Release
          </Button>
          <span v-if="manualControl.isControlled(gp.id)" class="control-badge">🎯 Controlled</span>
        </div>
      </div>

      <div v-if="manualControl.isControlActive.value" class="test-movements">
        <h5>Test Movement Commands</h5>
        <div class="button-group">
          <Button @click="setRandomTarget" variant="tertiary" size="sm">
            🎲 Random Target
          </Button>
          <Button @click="clearTarget" variant="tertiary" size="sm">
            ❌ Clear Target
          </Button>
        </div>
      </div>
    </div>

    <div class="control-settings panel">
      <h4>Settings</h4>
      <div class="setting-item">
        <label>Auto-release timeout (seconds):</label>
        <input
          type="number"
          v-model.number="timeoutSeconds"
          min="5"
          max="300"
          @change="updateTimeout"
        >
      </div>
      <div class="setting-item">
        <label>Stress threshold for release:</label>
        <SliderField
          :model-value="80"
          :min="0"
          :max="100"
          :step="5"
          disabled
          suffix="%"
          @update:model-value="() => {}"
        />
        <span class="setting-note">Fixed at 80% (not configurable)</span>
      </div>
    </div>

    <div class="control-log panel">
      <h4>Activity Log</h4>
      <div class="log-entries">
        <div v-for="(entry, index) in activityLog" :key="index" class="log-entry">
          <span class="log-time">{{ entry.time }}</span>
          <span class="log-message">{{ entry.message }}</span>
        </div>
        <div v-if="activityLog.length === 0" class="no-logs">
          No activity yet
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useManualControl } from '../../../composables/game/useManualControl'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import Button from '../../basic/Button.vue'
import SliderField from '../../basic/SliderField.vue'

const manualControl = useManualControl()
const guineaPigStore = useGuineaPigStore()

// Settings
const timeoutSeconds = ref(30)

// Activity log
const activityLog = ref<Array<{ time: string; message: string }>>([])

// Computed
const controlledGuineaPigName = computed(() => {
  const id = manualControl.controlledGuineaPigId.value
  if (!id) return null
  const gp = guineaPigStore.getGuineaPig(id)
  return gp?.name || 'Unknown'
})

const targetPositionText = computed(() => {
  const target = manualControl.getTargetPosition()
  if (!target) return 'None'
  return `(${Math.round(target.x)}, ${Math.round(target.y)})`
})

// Methods
function takeControl(guineaPigId: string) {
  manualControl.takeControl(guineaPigId)
  guineaPigStore.setManualControl(guineaPigId, true)
  logActivity(`Took control of ${guineaPigStore.getGuineaPig(guineaPigId)?.name}`)
}

function releaseControl() {
  const gpName = controlledGuineaPigName.value
  const gpId = manualControl.controlledGuineaPigId.value

  if (gpId) {
    guineaPigStore.setManualControl(gpId, false)
  }

  manualControl.releaseControl()
  logActivity(`Released control of ${gpName}`)
}

function setRandomTarget() {
  const x = Math.random() * 600
  const y = Math.random() * 480
  manualControl.setTarget(x, y)

  const gpId = manualControl.controlledGuineaPigId.value
  if (gpId) {
    guineaPigStore.setManualControlTarget(gpId, { x, y })
  }

  logActivity(`Set target to (${Math.round(x)}, ${Math.round(y)})`)
}

function clearTarget() {
  manualControl.clearTargets()

  const gpId = manualControl.controlledGuineaPigId.value
  if (gpId) {
    guineaPigStore.setManualControlTarget(gpId, null)
  }

  logActivity('Cleared all targets')
}

function updateTimeout() {
  manualControl.setAutoReleaseTimeout(timeoutSeconds.value * 1000)
  logActivity(`Updated timeout to ${timeoutSeconds.value} seconds`)
}

function logActivity(message: string) {
  const time = new Date().toLocaleTimeString()
  activityLog.value.unshift({ time, message })

  // Keep only last 10 entries
  if (activityLog.value.length > 10) {
    activityLog.value.pop()
  }
}

// Watch for auto-release
watch(manualControl.isControlActive, (active, wasActive) => {
  if (!active && wasActive) {
    logActivity('Auto-released control')
  }
})

// Update timer
let timerInterval: number | null = null

onMounted(() => {
  timerInterval = window.setInterval(() => {
    // Force reactivity update for time remaining
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style>
.manual-control-debug {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.control-stats,
.control-actions,
.control-settings,
.control-log {
  background: var(--color-surface-elevated);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-block-start: var(--space-3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.stat-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: var(--font-weight-semibold);
}

.stat-value--active {
  color: var(--color-success);
}

.guinea-pig-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-block-start: var(--space-3);
}

.guinea-pig-control-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.guinea-pig-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.control-badge {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.test-movements {
  margin-block-start: var(--space-4);
  padding-block-start: var(--space-4);
  border-block-start: 1px solid var(--color-border);
}

.test-movements h5 {
  margin-block-end: var(--space-3);
  color: var(--color-text-secondary);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-block-end: var(--space-3);
}

.setting-item label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.setting-item input {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.setting-note {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.log-entries {
  max-block-size: 200px;
  overflow-y: auto;
  margin-block-start: var(--space-3);
}

.log-entry {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2);
  border-block-end: 1px solid var(--color-border-subtle);
}

.log-time {
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.log-message {
  color: var(--color-text-primary);
}

.no-logs,
.no-guinea-pigs {
  text-align: center;
  color: var(--color-text-tertiary);
  padding: var(--space-4);
}
</style>