<template>
  <div class="debug-view">
    <div class="debug-view__header">
      <h1 class="debug-view__title">GPS2 Debug Dashboard</h1>
      <p class="debug-view__subtitle">Development and testing interface</p>
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
import GameControllerView from './GameControllerView.vue'
import PetStoreDebugView from './PetStoreDebugView.vue'
import InventoryDebugView from './InventoryDebugView.vue'
import NeedsDebugView from './NeedsDebugView.vue'
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
  },
  {
    id: 'pet-store',
    label: 'Pet Store',
    icon: '🏪',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '🎒',
  },
  {
    id: 'needs',
    label: 'Needs System',
    icon: '🍎',
  },
  {
    id: 'logging',
    label: 'Logging System',
    icon: '📝',
  },
  {
    id: 'error-tracking',
    label: 'Error Tracking',
    icon: '🐛',
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