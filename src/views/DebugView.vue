<template>
  <div class="debug-view">
    <div class="debug-view__header">
      <div>
        <h1 class="debug-view__title">GPS2 Debug Dashboard</h1>
        <p class="debug-view__subtitle">Development and testing interface</p>
      </div>
      <UtilityNav />
    </div>

    <TabContainer
      :tabs="debugTabs"
      v-model="activeTab"
      class="debug-view__tabs"
      @tab-change="onTabChange"
    >
      <template #controller>
        <GameControllerView />
      </template>

      <template #pet-store>
        <PetStoreDebugView />
      </template>

      <template #inventory>
        <InventoryDebugView />
      </template>

      <template #needs>
        <NeedsDebugView />
      </template>

      <template #personality>
        <PersonalityDebugView />
      </template>

      <template #feeding>
        <FeedingDebugView />
      </template>

      <template #logging>
        <LoggingSystemView />
      </template>

      <template #error-tracking>
        <SystemMonitorView />
      </template>
    </TabContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TabContainer, { type Tab } from '../components/layout/TabContainer.vue'
import UtilityNav from '../components/layout/UtilityNav.vue'
import GameControllerView from './GameControllerView.vue'
import PetStoreDebugView from './PetStoreDebugView.vue'
import InventoryDebugView from './InventoryDebugView.vue'
import NeedsDebugView from './NeedsDebugView.vue'
import PersonalityDebugView from './PersonalityDebugView.vue'
import FeedingDebugView from './FeedingDebugView.vue'
import LoggingSystemView from './LoggingSystemView.vue'
import SystemMonitorView from './SystemMonitorView.vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()

// State
const activeTab = ref('controller')

// Debug tabs configuration
const debugTabs: Tab[] = [
  {
    id: 'controller',
    label: 'Game Controller',
    icon: '🎮',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'pet-store',
    label: 'Pet Store',
    icon: '🏪',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'needs',
    label: 'Needs System',
    icon: '🍎',
  },
  {
    id: 'feeding',
    label: 'Feeding System',
    icon: '🥕',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'personality',
    label: 'Personality',
    icon: '🎭',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '🎒',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'logging',
    label: 'Logging System',
    icon: '📝',
    panelClass: 'tab-container__panel--constrained'
  },
  {
    id: 'error-tracking',
    label: 'Error Tracking',
    icon: '🐛',
    panelClass: 'tab-container__panel--constrained'
  }
]

// Methods
const onTabChange = (tabId: string, previousTabId: string | null) => {
  console.log(`Tab changed from ${previousTabId || 'none'} to ${tabId}`)
}


// Page lifecycle management for automatic pause
onMounted(() => {
  // Auto-pause game when entering debug panel
  // User must manually resume if they want the game to run
  gameController.pauseGame('navigation')
})

onUnmounted(() => {
  // Auto-pause when leaving debug panel if game is active
  if (gameController.isGameActive) {
    gameController.pauseGame('navigation')
  }
})
</script>

<style>
/* Debug View Styles */
.debug-view {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  min-block-size: 100vh;
  background-color: var(--color-bg-primary);
}

.debug-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-6);
  padding-inline: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary-bg), var(--color-secondary-bg));
  border-block-end: 1px solid var(--color-border-light);
}

.debug-view__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-2);
}

.debug-view__subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-weight-normal);
}

.debug-view__tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .debug-view__header {
    flex-direction: column;
    align-items: flex-start;
    padding-block: var(--space-4);
    padding-inline: var(--space-4);
  }

  .debug-view__title {
    font-size: var(--font-size-3xl);
  }

  .debug-view__subtitle {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .debug-view__header {
    padding-block: var(--space-3);
    padding-inline: var(--space-3);
  }

  .debug-view__title {
    font-size: var(--font-size-2xl);
  }

  .debug-view__subtitle {
    font-size: var(--font-size-sm);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .debug-view__header {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(34, 197, 94, 0.1));
  }
}
</style>