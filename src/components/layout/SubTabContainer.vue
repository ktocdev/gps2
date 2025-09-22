<template>
  <div class="sub-tab-container">
    <nav class="sub-tab-container__nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="getTabClasses(tab.id)"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`sub-panel-${tab.id}`"
        :id="`sub-tab-${tab.id}`"
        role="tab"
        type="button"
        @click="setActiveTab(tab.id)"
      >
        <span v-if="tab.icon" class="sub-tab-container__tab-icon">{{ tab.icon }}</span>
        <span class="sub-tab-container__tab-text">{{ tab.label }}</span>
        <span v-if="tab.badge" class="sub-tab-container__tab-badge">{{ tab.badge }}</span>
      </button>
    </nav>

    <div class="sub-tab-container__content">
      <div
        v-for="tab in tabs"
        :key="`sub-panel-${tab.id}`"
        :class="getPanelClasses(tab.id)"
        :aria-labelledby="`sub-tab-${tab.id}`"
        :id="`sub-panel-${tab.id}`"
        role="tabpanel"
        :hidden="activeTab !== tab.id"
      >
        <slot :name="tab.id" :tab="tab" :active="activeTab === tab.id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

export interface SubTab {
  id: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

interface Props {
  tabs: SubTab[]
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-change', tabId: string, previousTabId: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

// Internal state
const activeTab = ref<string>('')
const previousTab = ref<string | null>(null)

// Initialize active tab
onMounted(() => {
  if (props.modelValue) {
    activeTab.value = props.modelValue
  } else if (props.tabs.length > 0) {
    const firstEnabledTab = props.tabs.find(tab => !tab.disabled)
    if (firstEnabledTab) {
      activeTab.value = firstEnabledTab.id
      emit('update:modelValue', firstEnabledTab.id)
    }
  }
})

// Watch for external model changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== activeTab.value) {
    setActiveTab(newValue)
  }
})

// Watch for tab changes and emit events
watch(activeTab, (newTab, oldTab) => {
  emit('update:modelValue', newTab)
  emit('tab-change', newTab, oldTab || null)
})

// Methods
const setActiveTab = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  if (tab && !tab.disabled) {
    previousTab.value = activeTab.value || null
    activeTab.value = tabId
  }
}

const getTabClasses = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  return [
    'sub-tab-container__tab',
    {
      'sub-tab-container__tab--active': activeTab.value === tabId,
      'sub-tab-container__tab--disabled': tab?.disabled
    }
  ]
}

const getPanelClasses = (tabId: string) => {
  return [
    'sub-tab-container__panel',
    {
      'sub-tab-container__panel--active': activeTab.value === tabId
    }
  ]
}

</script>

<style>
/* Sub Tab Container - Nested Navigation Component */
.sub-tab-container {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  block-size: 100%;
}

/* Navigation */
.sub-tab-container__nav {
  display: flex;
  border-block-end: 2px solid var(--color-border-subtle);
  background-color: var(--color-background-secondary);
  padding-inline: var(--space-4);
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: thin;
}

.sub-tab-container__nav::-webkit-scrollbar {
  block-size: 4px;
}

.sub-tab-container__nav::-webkit-scrollbar-track {
  background: var(--color-background-tertiary);
}

.sub-tab-container__nav::-webkit-scrollbar-thumb {
  background: var(--color-border-primary);
  border-radius: 2px;
}

/* Sub Tab Buttons (Pills Style) */
.sub-tab-container__tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  border: 1px solid transparent;
  border-radius: 16px;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-block: var(--space-2);
}

.sub-tab-container__tab:hover:not(.sub-tab-container__tab--disabled) {
  background-color: var(--color-background-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.sub-tab-container__tab:focus {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

.sub-tab-container__tab--active {
  background-color: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: var(--color-accent-primary);
  font-weight: var(--font-weight-semibold);
}

.sub-tab-container__tab--active:hover {
  background-color: var(--color-accent-primary-hover);
  border-color: var(--color-accent-primary-hover);
}

.sub-tab-container__tab--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text-muted);
}

/* Tab Content */
.sub-tab-container__tab-icon {
  font-size: var(--font-size-sm);
  line-height: 1;
}

.sub-tab-container__tab-text {
  line-height: 1.2;
}

.sub-tab-container__tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 18px;
  block-size: 18px;
  padding-inline: var(--space-1);
  background-color: var(--color-warning);
  color: var(--color-text-on-warning);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: 9px;
  line-height: 1;
}

.sub-tab-container__tab--active .sub-tab-container__tab-badge {
  background-color: var(--color-background-primary);
  color: var(--color-accent-primary);
}

/* Panel Content */
.sub-tab-container__content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  background-color: var(--color-background-primary);
}

.sub-tab-container__panel {
  block-size: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

.sub-tab-container__panel--active {
  opacity: 1;
  visibility: visible;
}

.sub-tab-container__panel[hidden] {
  display: none;
}

/* Responsive Design */
@container (max-width: 600px) {
  .sub-tab-container__nav {
    padding-inline: var(--space-2);
    gap: var(--space-1);
  }

  .sub-tab-container__tab {
    padding-inline: var(--space-2);
    font-size: var(--font-size-xs);
  }

  .sub-tab-container__content {
    padding: var(--space-3);
  }
}

@container (max-width: 400px) {
  .sub-tab-container__tab-text {
    display: none;
  }

  .sub-tab-container__tab {
    padding-inline: var(--space-2);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .sub-tab-container__nav {
    border-block-end-width: 3px;
  }

  .sub-tab-container__tab {
    border-width: 2px;
  }

  .sub-tab-container__tab--active {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .sub-tab-container__tab,
  .sub-tab-container__panel {
    transition: none;
  }
}

/* Print Styles */
@media print {
  .sub-tab-container__nav {
    display: none;
  }

  .sub-tab-container__panel {
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
  }

  .sub-tab-container__content {
    padding: 0;
  }
}
</style>