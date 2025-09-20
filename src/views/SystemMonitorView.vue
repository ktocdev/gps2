<template>
  <div class="system-monitor-view">
    <div class="panel-grid">
      <!-- System Messages Panel -->
      <div class="panel panel--primary">
        <div class="panel__header">
          <h3>System Messages</h3>
        </div>
        <div class="panel__content">
          <!-- Filter controls -->
          <div class="filter-controls">
            <div class="button-group">
              <Button
                @click="setLevelFilter('all')"
                :variant="levelFilter === 'all' ? 'primary' : 'secondary'"
                size="sm"
              >
                All
              </Button>
              <Button
                @click="setLevelFilter('error')"
                :variant="levelFilter === 'error' ? 'danger' : 'secondary'"
                size="sm"
              >
                ❌ Errors
              </Button>
              <Button
                @click="setLevelFilter('warn')"
                :variant="levelFilter === 'warn' ? 'warning' : 'secondary'"
                size="sm"
              >
                ⚠️ Warnings
              </Button>
              <Button
                @click="setLevelFilter('info')"
                :variant="levelFilter === 'info' ? 'primary' : 'secondary'"
                size="sm"
              >
                ℹ️ Info
              </Button>
              <Button
                @click="setLevelFilter('debug')"
                :variant="levelFilter === 'debug' ? 'tertiary' : 'secondary'"
                size="sm"
              >
                🔧 Debug
              </Button>
            </div>
            <div class="search-input">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search messages..."
                class="input"
              />
            </div>
          </div>

          <!-- Messages display -->
          <div class="messages-container">
            <div
              v-for="message in filteredSystemMessages"
              :key="message.id"
              :class="['message-item', `message-item--${message.level}`]"
            >
              <div class="message-header">
                <span class="message-emoji">{{ message.emoji }}</span>
                <span class="message-level">{{ message.level.toUpperCase() }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-content">{{ message.message }}</div>
              <div v-if="message.metadata" class="message-metadata">
                <pre>{{ JSON.stringify(message.metadata, null, 2) }}</pre>
              </div>
            </div>
            <div v-if="filteredSystemMessages.length === 0" class="no-messages">
              No system messages found matching current filters
            </div>
          </div>
        </div>
      </div>

      <!-- Error Analysis Panel -->
      <div class="panel panel--secondary">
        <div class="panel__header">
          <h3>Error Analysis</h3>
        </div>
        <div class="panel__content">
          <!-- Error frequency -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Error Frequency</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Errors:</span>
                  <span class="stat-value stat-value--error">{{ errorsByLevel.error?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Warnings:</span>
                  <span class="stat-value stat-value--warning">{{ errorsByLevel.warn?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Info Messages:</span>
                  <span class="stat-value">{{ errorsByLevel.info?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Debug Messages:</span>
                  <span class="stat-value stat-value--muted">{{ errorsByLevel.debug?.length || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent critical errors -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Recent Critical</h4>
            </div>
            <div class="panel__content">
              <div v-if="recentCriticalErrors.length > 0" class="critical-errors">
                <div
                  v-for="error in recentCriticalErrors"
                  :key="error.id"
                  class="critical-error-item"
                >
                  <span class="error-time">{{ formatTime(error.timestamp) }}</span>
                  <span class="error-message">{{ error.message }}</span>
                </div>
              </div>
              <div v-else class="no-errors">
                ✅ No recent critical errors
              </div>
            </div>
          </div>

          <!-- System health -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>System Health</h4>
            </div>
            <div class="panel__content">
              <div class="health-indicator">
                <div :class="['health-score', `health-score--${systemHealthLevel}`]">
                  {{ systemHealthScore }}%
                </div>
                <div class="health-description">{{ systemHealthDescription }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics Panel -->
      <div class="panel panel--muted">
        <div class="panel__header">
          <h3>Performance Metrics</h3>
        </div>
        <div class="panel__content">
          <!-- Message processing stats -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Message Processing</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total System Messages:</span>
                  <span class="stat-value">{{ systemMessages.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Messages/Hour:</span>
                  <span class="stat-value">{{ messagesPerHour }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Memory Usage:</span>
                  <span class="stat-value">{{ memoryUsage }}KB</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Retention Period:</span>
                  <span class="stat-value">{{ loggingStore.state.settings.messageRetentionHours }}h</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance alerts -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Performance Alerts</h4>
            </div>
            <div class="panel__content">
              <div v-if="performanceAlerts.length > 0" class="alerts-list">
                <div
                  v-for="(alert, index) in performanceAlerts"
                  :key="index"
                  :class="['alert-item', `alert-item--${alert.level}`]"
                >
                  {{ alert.message }}
                </div>
              </div>
              <div v-else class="no-alerts">
                ✅ No performance issues detected
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Developer Tools Panel -->
      <div class="panel panel--border-secondary">
        <div class="panel__header">
          <h3>Developer Tools</h3>
        </div>
        <div class="panel__content">
          <!-- Export functionality -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Export System Logs</h4>
            </div>
            <div class="panel__content">
              <div class="button-group">
                <Button @click="exportJSON" variant="primary" size="sm">📄 Export JSON</Button>
                <Button @click="exportCSV" variant="secondary" size="sm">📊 Export CSV</Button>
                <Button @click="copyToClipboard" variant="tertiary" size="sm">📋 Copy to Clipboard</Button>
              </div>
            </div>
          </div>

          <!-- System diagnostics -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>System Diagnostics</h4>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Logging Enabled:</span>
                  <span :class="['stat-value', loggingStore.state.isLoggingEnabled ? 'text-success' : 'text-error']">
                    {{ loggingStore.state.isLoggingEnabled ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Debug Messages:</span>
                  <span :class="['stat-value', loggingStore.state.settings.showDebugMessages ? 'text-success' : 'text-muted']">
                    {{ loggingStore.state.settings.showDebugMessages ? 'Visible' : 'Hidden' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Max Messages:</span>
                  <span class="stat-value">{{ loggingStore.state.settings.maxMessages }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Activity Feed:</span>
                  <span :class="['stat-value', loggingStore.state.settings.enableActivityFeed ? 'text-success' : 'text-error']">
                    {{ loggingStore.state.settings.enableActivityFeed ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuration tools -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h4>Quick Actions</h4>
            </div>
            <div class="panel__content">
              <div class="button-group">
                <Button @click="clearSystemMessages" variant="danger" size="sm">🗑️ Clear System Messages</Button>
                <Button @click="toggleDebugMessages" variant="secondary" size="sm">
                  {{ loggingStore.state.settings.showDebugMessages ? '🔇' : '🔊' }}
                  Debug Messages
                </Button>
                <Button @click="testErrorGeneration" variant="warning" size="sm">⚠️ Test Error</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoggingStore, type LogLevel } from '../stores/loggingStore'
import Button from '../components/basic/Button.vue'

const loggingStore = useLoggingStore()

// Filter state
const levelFilter = ref<LogLevel | 'all'>('all')
const searchTerm = ref('')

// Computed properties for system messages
const systemMessages = computed(() =>
  loggingStore.state.messages.filter(msg => msg.category === 'system')
)

const errorsByLevel = computed(() => {
  const grouped: Record<LogLevel, typeof systemMessages.value> = {
    debug: [],
    info: [],
    warn: [],
    error: []
  }

  systemMessages.value.forEach(msg => {
    grouped[msg.level].push(msg)
  })

  return grouped
})

const filteredSystemMessages = computed(() => {
  let filtered = systemMessages.value

  // Filter by level
  if (levelFilter.value !== 'all') {
    filtered = filtered.filter(msg => msg.level === levelFilter.value)
  }

  // Filter by search term
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(msg =>
      msg.message.toLowerCase().includes(term) ||
      msg.level.toLowerCase().includes(term)
    )
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => b.timestamp - a.timestamp)
})

const recentCriticalErrors = computed(() => {
  const cutoffTime = Date.now() - (2 * 60 * 60 * 1000) // Last 2 hours
  return systemMessages.value
    .filter(msg =>
      (msg.level === 'error' || msg.level === 'warn') &&
      msg.timestamp > cutoffTime
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
})

const systemHealthScore = computed(() => {
  const totalMessages = systemMessages.value.length
  if (totalMessages === 0) return 100

  const errorCount = errorsByLevel.value.error.length
  const warnCount = errorsByLevel.value.warn.length

  // Calculate health score (100 - percentage of errors/warnings)
  const problemMessages = errorCount * 2 + warnCount // Errors count double
  const healthScore = Math.max(0, 100 - Math.round((problemMessages / totalMessages) * 100))

  return healthScore
})

const systemHealthLevel = computed(() => {
  const score = systemHealthScore.value
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
})

const systemHealthDescription = computed(() => {
  const score = systemHealthScore.value
  if (score >= 90) return 'System running smoothly'
  if (score >= 75) return 'Minor issues detected'
  if (score >= 50) return 'Several issues need attention'
  return 'Critical issues detected'
})

const messagesPerHour = computed(() => {
  const hourAgo = Date.now() - (60 * 60 * 1000)
  const recentSystemMessages = systemMessages.value.filter(msg => msg.timestamp > hourAgo)
  return recentSystemMessages.length
})

const memoryUsage = computed(() => {
  // Rough estimate of memory usage for system messages
  const messageSize = JSON.stringify(systemMessages.value).length
  return Math.round(messageSize / 1024)
})

const performanceAlerts = computed(() => {
  const alerts: Array<{level: 'info' | 'warning' | 'error', message: string}> = []

  if (systemMessages.value.length > 150) {
    alerts.push({
      level: 'warning',
      message: 'High number of system messages - consider cleanup'
    })
  }

  if (errorsByLevel.value.error.length > 10) {
    alerts.push({
      level: 'error',
      message: 'Multiple errors detected - review immediately'
    })
  }

  if (messagesPerHour.value > 100) {
    alerts.push({
      level: 'warning',
      message: 'High message generation rate'
    })
  }

  return alerts
})

// Methods
const setLevelFilter = (level: LogLevel | 'all') => {
  levelFilter.value = level
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const exportJSON = () => {
  const data = JSON.stringify(systemMessages.value, null, 2)
  downloadFile(data, 'system-messages.json', 'application/json')
}

const exportCSV = () => {
  const headers = ['Timestamp', 'Level', 'Message', 'Metadata']
  const rows = systemMessages.value.map(msg => [
    new Date(msg.timestamp).toISOString(),
    msg.level,
    msg.message.replace(/"/g, '""'), // Escape quotes
    JSON.stringify(msg.metadata || {}).replace(/"/g, '""')
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csv, 'system-messages.csv', 'text/csv')
}

const copyToClipboard = async () => {
  const data = JSON.stringify(systemMessages.value, null, 2)
  try {
    await navigator.clipboard.writeText(data)
    loggingStore.logInfo('System messages copied to clipboard')
  } catch (error) {
    loggingStore.logError('Failed to copy to clipboard', { error })
  }
}

const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  loggingStore.logInfo(`Exported ${filename}`)
}

const clearSystemMessages = () => {
  // Remove only system messages
  loggingStore.state.messages = loggingStore.state.messages.filter(msg => msg.category !== 'system')
  loggingStore.logInfo('System messages cleared')
}

const toggleDebugMessages = () => {
  loggingStore.toggleDebugMessages()
}

const testErrorGeneration = () => {
  loggingStore.logError('Test error generated for debugging purposes', {
    test: true,
    timestamp: Date.now(),
    source: 'SystemMonitor'
  })
  loggingStore.logWarn('Test warning generated for debugging purposes', {
    test: true,
    timestamp: Date.now(),
    source: 'SystemMonitor'
  })
}
</script>

<style>
.system-monitor-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-block-end: var(--space-4);
}

.search-input {
  display: flex;
  flex-direction: column;
}

.search-input .input {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  transition: border-color var(--transition-fast);
}

.search-input .input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.messages-container {
  max-block-size: 400px;
  overflow-y: auto;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
}

.message-item {
  padding: var(--space-3);
  border-block-end: 1px solid var(--color-border-light);
}

.message-item:last-child {
  border-block-end: none;
}

.message-item--error {
  border-inline-start: 4px solid var(--color-error);
  background-color: rgba(239, 68, 68, 0.05);
}

.message-item--warn {
  border-inline-start: 4px solid var(--color-warning);
  background-color: rgba(245, 158, 11, 0.05);
}

.message-item--info {
  border-inline-start: 4px solid var(--color-primary);
  background-color: rgba(236, 72, 153, 0.05);
}

.message-item--debug {
  border-inline-start: 4px solid var(--color-text-muted);
  background-color: rgba(107, 114, 128, 0.05);
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-end: var(--space-1);
  font-size: var(--font-size-sm);
}

.message-emoji {
  font-size: var(--font-size-base);
}

.message-level {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.message-time {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-inline-start: auto;
}

.message-content {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.message-metadata {
  margin-block-start: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.message-metadata pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-messages {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
}

.stat-item:nth-child(odd) {
  background-color: var(--color-bg-tertiary);
}

.stat-item:nth-child(even) {
  background-color: var(--color-bg-secondary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.stat-value--error {
  color: var(--color-error);
}

.stat-value--warning {
  color: var(--color-warning);
}

.stat-value--muted {
  color: var(--color-text-muted);
}

.critical-errors {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.critical-error-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.no-errors, .no-alerts {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-success);
  font-size: var(--font-size-sm);
}

.health-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.health-score {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  padding: var(--space-2);
  border-radius: var(--radius-full);
  inline-size: 90px;
  block-size: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-score--excellent {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 2px solid var(--color-success);
}

.health-score--good {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 2px solid rgba(34, 197, 94, 0.5);
}

.health-score--fair {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border: 2px solid var(--color-warning);
}

.health-score--poor {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border: 2px solid var(--color-error);
}

.health-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.alert-item {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.alert-item--info {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.alert-item--warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.alert-item--error {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.text-success {
  color: var(--color-success) !important;
}

.text-error {
  color: var(--color-error) !important;
}

.text-muted {
  color: var(--color-text-muted) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-controls {
    gap: var(--space-2);
  }

  .health-score {
    inline-size: 60px;
    block-size: 60px;
    font-size: var(--font-size-2xl);
  }
}
</style>