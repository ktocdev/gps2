<template>
  <div class="guinea-pig-debug-view">
    <!-- Main Content Grid -->
    <div class="guinea-pig-debug-grid">
      <!-- Top Row: Quick Stats & Actions -->
      <div class="debug-section debug-section--stats">
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>🏠 Collection Overview</h3>
          </div>
          <div class="panel__content">
            <div class="stats-row">
              <div class="stat-card">
                <span class="stat-label">Total Guinea Pigs</span>
                <span class="stat-value stat-value--primary">{{ guineaPigStore.guineaPigCount }}/{{ guineaPigStore.settings.maxGuineaPigs }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Active Guinea Pig</span>
                <span class="stat-value">{{ guineaPigStore.activeGuineaPig?.name || 'None' }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Can Add More</span>
                <span class="stat-value" :class="guineaPigStore.canAddMoreGuineaPigs ? 'stat-value--success' : 'stat-value--warning'">{{ guineaPigStore.canAddMoreGuineaPigs ? 'Yes' : 'No' }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Last Updated</span>
                <span class="stat-value stat-value--muted">{{ formatTimestamp(guineaPigStore.collection.lastUpdated) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Column: Guinea Pig Management -->
      <div class="debug-section debug-section--list">
        <div class="panel">
          <div class="panel__header panel__header--with-action">
            <h3>🐹 Guinea Pig Management</h3>
            <Button @click="createTestGuineaPig" variant="primary" size="sm" :disabled="!guineaPigStore.canAddMoreGuineaPigs">
              ➕ Create Guinea Pig
            </Button>
          </div>
          <div class="panel__content">
            <div v-if="guineaPigStore.hasGuineaPigs" class="guinea-pig-list">
              <div
                v-for="guineaPig in guineaPigStore.allGuineaPigs"
                :key="guineaPig.id"
                class="guinea-pig-card"
                :class="{ 'guinea-pig-card--active': guineaPig.id === guineaPigStore.activeGuineaPig?.id }"
                @click="setActiveGuineaPig(guineaPig.id)"
              >
                <div class="guinea-pig-card__info">
                  <h4 class="guinea-pig-card__name">{{ guineaPig.name }}</h4>
                  <div class="guinea-pig-card__details">
                    <span class="detail-badge">{{ guineaPig.gender }}</span>
                    <span class="detail-badge">{{ guineaPig.breed }}</span>
                    <span class="detail-badge detail-badge--level">Lv.{{ guineaPig.stats.level }}</span>
                  </div>
                  <div class="guinea-pig-card__stats">
                    <div class="mini-stat">
                      <span class="mini-stat__label">Wellness</span>
                      <span class="mini-stat__value">{{ guineaPig.stats.wellness }}/100</span>
                    </div>
                    <div class="mini-stat">
                      <span class="mini-stat__label">Mood</span>
                      <span class="mini-stat__value">{{ guineaPig.stats.overallMood }}/100</span>
                    </div>
                  </div>
                </div>
                <div class="guinea-pig-card__actions">
                  <Button
                    @click.stop="setActiveGuineaPig(guineaPig.id)"
                    variant="tertiary"
                    size="sm"
                    :disabled="guineaPig.id === guineaPigStore.activeGuineaPig?.id"
                  >
                    {{ guineaPig.id === guineaPigStore.activeGuineaPig?.id ? 'Active' : 'Set Active' }}
                  </Button>
                  <Button
                    @click.stop="deleteGuineaPig(guineaPig.id)"
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-state__icon">🐹</span>
              <p class="empty-state__text">No guinea pigs in collection</p>
              <Button @click="createTestGuineaPig" variant="primary">Create Your First Guinea Pig</Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Active Guinea Pig Details -->
      <div class="debug-section debug-section--details">
        <div class="panel" v-if="guineaPigStore.activeGuineaPig">
          <div class="panel__header">
            <h3>📊 {{ guineaPigStore.activeGuineaPig.name }} Details</h3>
          </div>
          <div class="panel__content">
            <div class="detail-grid">
              <div class="detail-group">
                <h4 class="detail-group__title">Basic Info</h4>
                <div class="detail-items">
                  <div class="detail-item">
                    <span class="detail-item__label">ID</span>
                    <span class="detail-item__value">{{ guineaPigStore.activeGuineaPig.id.slice(-8) }}...</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-item__label">Age</span>
                    <span class="detail-item__value">{{ guineaPigStore.activeGuineaPig.stats.age }} days</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-item__label">Weight</span>
                    <span class="detail-item__value">{{ guineaPigStore.activeGuineaPig.stats.weight }}g</span>
                  </div>
                </div>
              </div>

              <div class="detail-group">
                <h4 class="detail-group__title">Core Stats</h4>
                <div class="detail-items">
                  <div class="detail-item">
                    <span class="detail-item__label">Wellness</span>
                    <span class="detail-item__value detail-item__value--progress">{{ guineaPigStore.activeGuineaPig.stats.wellness }}/100</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-item__label">Mood</span>
                    <span class="detail-item__value detail-item__value--progress">{{ guineaPigStore.activeGuineaPig.stats.overallMood }}/100</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-item__label">Level</span>
                    <span class="detail-item__value">{{ guineaPigStore.activeGuineaPig.stats.level }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-group detail-group--wide">
                <h4 class="detail-group__title">Needs Status</h4>
                <div class="needs-grid">
                  <div class="need-item">
                    <span class="need-item__label">🍎 Hunger</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.hunger }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">💧 Thirst</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.thirst }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">😊 Happiness</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.happiness }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">🧼 Cleanliness</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.cleanliness }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">❤️ Health</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.health }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">⚡ Energy</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.energy }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">👥 Social</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.social }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">💅 Nails</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.nails }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">🦷 Chew</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.chew }}/100</span>
                  </div>
                  <div class="need-item">
                    <span class="need-item__label">🏠 Shelter</span>
                    <span class="need-item__value">{{ guineaPigStore.activeGuineaPig.needs.shelter }}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="panel" v-else>
          <div class="panel__header">
            <h3>📊 Guinea Pig Details</h3>
          </div>
          <div class="panel__content">
            <div class="empty-state empty-state--small">
              <span class="empty-state__icon">🐹</span>
              <p class="empty-state__text">No active guinea pig selected</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Left: Creation & Testing -->
      <div class="debug-section debug-section--creation">
        <div class="panel">
          <div class="panel__header">
            <h3>🧪 Validation Testing</h3>
          </div>
          <div class="panel__content">
            <div class="action-groups">
              <div class="action-group">
                <h4 class="action-group__title">Input Validation Tests</h4>
                <div class="button-grid">
                  <Button @click="testValidation('empty')" variant="warning" size="sm">📝 Empty Names</Button>
                  <Button @click="testValidation('invalid_name')" variant="warning" size="sm">❌ Invalid Names</Button>
                  <Button @click="testValidation('future_date')" variant="warning" size="sm">📅 Future Dates</Button>
                  <Button @click="testValidation('too_old')" variant="warning" size="sm">🕰️ Age Limits</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Right: Data Management -->
      <div class="debug-section debug-section--data">
        <div class="panel">
          <div class="panel__header">
            <h3>🔧 Data Management</h3>
          </div>
          <div class="panel__content">
            <div class="action-groups">
              <div class="action-group">
                <h4 class="action-group__title">Store Actions</h4>
                <div class="button-grid">
                  <Button @click="clearAllGuineaPigs" variant="danger" size="sm">🗑️ Clear All</Button>
                </div>
              </div>
              <div class="action-group">
                <h4 class="action-group__title">Data Operations</h4>
                <div class="button-grid">
                  <Button @click="exportGuineaPigData" variant="secondary" size="sm">📤 Export</Button>
                  <Button @click="showImportDialog = true" variant="secondary" size="sm">📥 Import</Button>
                  <Button @click="copyStoreState" variant="tertiary" size="sm">📋 Copy</Button>
                </div>
              </div>
              <div class="action-group">
                <h4 class="action-group__title">System</h4>
                <div class="button-grid">
                  <Button @click="clearLocalStorage" variant="danger" size="sm">🗑️ Clear Storage</Button>
                  <Button @click="resetStoreSettings" variant="warning" size="sm">⚙️ Reset Settings</Button>
                  <Button @click="validateStoreIntegrity" variant="tertiary" size="sm">✅ Validate</Button>
                  <Button @click="navigateToCreation" variant="primary" size="sm">➡️ Creation View</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Dialog (placeholder) -->
    <div v-if="showImportDialog" class="import-dialog-overlay" @click="showImportDialog = false">
      <div class="import-dialog" @click.stop>
        <h4>Import Guinea Pig Data</h4>
        <p>Import functionality will be implemented in the future.</p>
        <Button @click="showImportDialog = false" variant="primary">Close</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/basic/Button.vue'
import { useGuineaPigStore } from '../stores/guineaPigStore'
import { useGameController } from '../stores/gameController'

const router = useRouter()
const guineaPigStore = useGuineaPigStore()
const gameController = useGameController()

// State
const showImportDialog = ref(false)


// Guinea Pig Management Methods
const setActiveGuineaPig = (id: string) => {
  guineaPigStore.setActiveGuineaPig(id)
}

const deleteGuineaPig = (id: string) => {
  const guineaPig = guineaPigStore.getGuineaPig(id)
  if (guineaPig && confirm(`Are you sure you want to delete ${guineaPig.name}?`)) {
    guineaPigStore.deleteGuineaPig(id)
  }
}

const clearAllGuineaPigs = () => {
  if (confirm('Are you sure you want to delete all guinea pigs? This cannot be undone.')) {
    guineaPigStore.collection.guineaPigs = {}
    guineaPigStore.collection.activeGuineaPigId = null
    guineaPigStore.collection.lastUpdated = Date.now()
    gameController.gameState.hasGuineaPig = false
  }
}

// Creation Methods
const createTestGuineaPig = () => {
  if (!guineaPigStore.canAddMoreGuineaPigs) {
    console.warn('Cannot create more guinea pigs - limit reached')
    return
  }

  const names = ['Fluffy', 'Snickers', 'Patches', 'Cocoa', 'Peanut', 'Ginger', 'Pepper', 'Honey']
  const breeds = ['American', 'Peruvian', 'Abyssinian', 'Skinny', 'Texel', 'Silkie']
  const genders: ('male' | 'female')[] = ['male', 'female']

  const name = names[Math.floor(Math.random() * names.length)]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const gender = genders[Math.floor(Math.random() * genders.length)]

  gameController.createGuineaPig(name, gender, breed)
}

// Utility Methods
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}


const testValidation = (type: 'empty' | 'invalid_name' | 'future_date' | 'too_old') => {
  console.log(`Testing validation: ${type}`)
  // This would trigger various validation scenarios
}

// Navigation Methods
const navigateToCreation = () => {
  router.push('/create')
}


// Data Management Methods
const exportGuineaPigData = () => {
  const data = JSON.stringify(guineaPigStore.collection, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'guinea-pig-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

const copyStoreState = () => {
  const data = JSON.stringify(guineaPigStore.collection, null, 2)
  navigator.clipboard.writeText(data).then(() => {
    console.log('Store state copied to clipboard')
  })
}

const clearLocalStorage = () => {
  if (confirm('Clear all local storage data? This will remove all saved game data.')) {
    localStorage.clear()
    console.log('Local storage cleared')
  }
}

const resetStoreSettings = () => {
  if (confirm('Reset store settings to defaults?')) {
    guineaPigStore.settings.maxGuineaPigs = 2
    console.log('Store settings reset')
  }
}

const validateStoreIntegrity = () => {
  console.log('Validating store integrity...')
  const issues = []

  // Check for orphaned active guinea pig references
  if (guineaPigStore.collection.activeGuineaPigId && !guineaPigStore.collection.guineaPigs[guineaPigStore.collection.activeGuineaPigId]) {
    issues.push('Active guinea pig ID references non-existent guinea pig')
  }

  if (issues.length === 0) {
    console.log('✅ Store integrity check passed')
  } else {
    console.warn('⚠️ Store integrity issues found:', issues)
  }
}
</script>

<style>
/* Guinea Pig Debug View - Optimized Grid Layout */
.guinea-pig-debug-view {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  min-block-size: 100vh;
  background-color: var(--color-bg-primary);
}

.guinea-pig-debug-view__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-2);
}

.guinea-pig-debug-view__subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-weight-normal);
}

/* Main Grid Layout */
.guinea-pig-debug-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-6);
  flex: 1;
}

.debug-section--stats {
  grid-column: 1 / -1;
}

.debug-section--list {
  grid-column: 1;
  grid-row: 2 / 4;
}

.debug-section--details {
  grid-column: 2;
  grid-row: 2;
}

.debug-section--creation {
  grid-column: 2;
  grid-row: 3;
}

.debug-section--data {
  grid-column: 1 / -1;
  grid-row: 4;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.stat-value--primary {
  color: var(--color-primary);
}

.stat-value--success {
  color: var(--color-success);
}

.stat-value--warning {
  color: var(--color-warning);
}

.stat-value--muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.stat-card--action {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card--action .stat-label {
  margin-block-end: var(--space-2);
}

/* Guinea Pig Cards */
.guinea-pig-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-block-size: 500px;
  overflow-y: auto;
}

.guinea-pig-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.guinea-pig-card:hover:not(.guinea-pig-card--active) {
  border-color: var(--color-border-dark);
  background-color: var(--color-bg-tertiary);
}

.guinea-pig-card--active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.guinea-pig-card__info {
  flex: 1;
}

.guinea-pig-card__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-2);
}

.guinea-pig-card__details {
  display: flex;
  gap: var(--space-2);
  margin-block-end: var(--space-2);
}

.detail-badge {
  font-size: var(--font-size-xs);
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.detail-badge--level {
  background-color: var(--color-accent-secondary);
  color: var(--color-text-inverse);
}

.guinea-pig-card__stats {
  display: flex;
  gap: var(--space-3);
}

.mini-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mini-stat__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.mini-stat__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.guinea-pig-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-inline-start: var(--space-4);
}

/* Detail Grid */
.detail-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

.detail-group {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.detail-group--wide {
  grid-column: 1 / -1;
}

.detail-group__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-3);
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail-item__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.detail-item__value--progress {
  color: var(--color-primary);
}

/* Needs Grid */
.needs-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.need-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.need-item__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.need-item__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Action Groups */
.action-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action-group__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-2);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
}

.empty-state--small {
  padding: var(--space-4);
}

.empty-state__icon {
  font-size: 3rem;
  opacity: 0.6;
}

.empty-state__text {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

/* Compact Panel */
.panel--compact .panel__content {
  padding: var(--space-3);
}

/* Panel Header with Action */
.panel__header--with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel__header--with-action h3 {
  margin: 0;
}

/* Import Dialog */
.import-dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-dialog {
  background-color: var(--color-bg-primary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-inline-size: 400px;
  inline-size: 90%;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .guinea-pig-debug-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
  }

  .debug-section--stats {
    grid-column: 1;
    grid-row: 1;
  }

  .debug-section--list {
    grid-column: 1;
    grid-row: 2;
  }

  .debug-section--details {
    grid-column: 1;
    grid-row: 3;
  }

  .debug-section--creation {
    grid-column: 1;
    grid-row: 4;
  }

  .debug-section--data {
    grid-column: 1;
    grid-row: 5;
  }

  .guinea-pig-list {
    max-block-size: 300px;
  }
}

@media (max-width: 768px) {
  .guinea-pig-debug-grid {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .stats-row {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .guinea-pig-card {
    flex-direction: column;
    gap: var(--space-3);
  }

  .guinea-pig-card__actions {
    flex-direction: row;
    margin-inline-start: 0;
  }

  .button-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
}
</style>