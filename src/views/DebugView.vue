<template>
  <div class="debug-view">
    <div class="debug-view__header">
      <div>
        <h1 class="debug-view__title">GPS2 Debug Dashboard</h1>
        <p class="debug-view__subtitle">Development and testing interface</p>
      </div>
      <UtilityNav />
    </div>

    <!-- Category dropdowns -->
    <div class="debug-view__nav">
      <CategoryDropdown
        v-for="category in tabCategories"
        :key="category.id"
        :category-label="category.label"
        :tabs="category.tabs"
        v-model="activeTab"
      />
    </div>

    <!-- Content panels -->
    <div class="debug-view__content">
      <GameControllerView v-if="activeTab === 'controller'" />
      <PetStoreDebugView v-if="activeTab === 'pet-store'" />
      <StardustSanctuaryDebug v-if="activeTab === 'sanctuary'" />
      <NeedsDebugView v-if="activeTab === 'needs'" />
      <FeedingDebugView v-if="activeTab === 'feeding'" />
      <FriendshipDebug v-if="activeTab === 'friendship'" />
      <PersonalityDebugView v-if="activeTab === 'personality'" />
      <InventoryDebugView v-if="activeTab === 'inventory'" />
      <HabitatDebugView v-if="activeTab === 'habitat'" />
      <LoggingSystemView v-if="activeTab === 'logging'" />
      <SystemMonitorView v-if="activeTab === 'error-tracking'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CategoryDropdown from '../components/layout/CategoryDropdown.vue'
import UtilityNav from '../components/layout/UtilityNav.vue'
import type { Tab } from '../components/layout/TabContainer.vue'
import GameControllerView from './GameControllerView.vue'
import PetStoreDebugView from './PetStoreDebugView.vue'
import InventoryDebugView from './InventoryDebugView.vue'
import NeedsDebugView from './NeedsDebugView.vue'
import PersonalityDebugView from './PersonalityDebugView.vue'
import FeedingDebugView from './FeedingDebugView.vue'
import FriendshipDebug from '../components/debug/FriendshipDebug.vue'
import StardustSanctuaryDebug from '../components/debug/StardustSanctuaryDebug.vue'
import HabitatDebugView from './HabitatDebugView.vue'
import LoggingSystemView from './LoggingSystemView.vue'
import SystemMonitorView from './SystemMonitorView.vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()

// State
const activeTab = ref('controller')

// Category interface
interface TabCategory {
  id: string
  label: string
  tabs: Tab[]
}

// Organized tab categories for dropdown navigation
const tabCategories: TabCategory[] = [
  {
    id: 'core',
    label: 'Core Systems',
    tabs: [
      {
        id: 'controller',
        label: 'Game Controller',
        icon: '🎮',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'pet-store',
        label: 'Pet Adoption',
        icon: '🏪',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'sanctuary',
        label: 'Stardust Sanctuary',
        icon: '✨',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'logging',
        label: 'Activity Feed',
        icon: '📝',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  },
  {
    id: 'gameplay',
    label: 'Gameplay Systems',
    tabs: [
      {
        id: 'needs',
        label: 'Needs System',
        icon: '🍎'
      },
      {
        id: 'feeding',
        label: 'Feeding System',
        icon: '🥕',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'friendship',
        label: 'Friendship',
        icon: '💖',
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
      }
    ]
  },
  {
    id: 'environment',
    label: 'Environment Systems',
    tabs: [
      {
        id: 'habitat',
        label: 'Habitat Debug',
        icon: '🏠',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  },
  {
    id: 'development',
    label: 'Development Tools',
    tabs: [
      {
        id: 'error-tracking',
        label: 'Error Tracking',
        icon: '🐛',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  }
]

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
  container-type: inline-size;
  container-name: debug-view;
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

/* Category dropdowns navigation - Mobile first: inline with wrap */
.debug-view__nav {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-block: var(--space-4);
  padding-inline: var(--space-4);
  background: var(--color-bg-primary);
  border-block-end: 1px solid var(--color-border-light);
}

/* Content area */
.debug-view__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-block: var(--space-6);
  padding-inline: var(--space-6);
}

/* Content area: constrained width for better readability */
.debug-view__content > * {
  max-inline-size: 1440px;
  inline-size: 100%;
  margin-inline: auto;
}

/* Container query: Adjust spacing for medium containers */
@container debug-view (min-width: 481px) {
  .debug-view__nav {
    padding-block: var(--space-5);
    padding-inline: var(--space-5);
  }
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

  .debug-view__content {
    padding-block: var(--space-4);
    padding-inline: var(--space-4);
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

  .debug-view__nav {
    padding-block: var(--space-3);
    padding-inline: var(--space-3);
  }

  .debug-view__content {
    padding-block: var(--space-3);
    padding-inline: var(--space-3);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .debug-view__header {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(34, 197, 94, 0.1));
  }
}
</style>