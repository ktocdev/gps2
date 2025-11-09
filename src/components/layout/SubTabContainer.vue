<template>
  <div :class="containerClasses">
    <nav role="tablist" class="sub-tab-container__nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="getTabClasses(tab.id)"
        :aria-selected="activeTab === tab.id"
        :aria-controls="buttonsOnly ? undefined : `sub-panel-${tab.id}`"
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

    <div v-if="!buttonsOnly" class="sub-tab-container__content">
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
import { ref, computed, watch, onMounted } from 'vue'

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
  align?: 'start' | 'end'
  buttonsOnly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-change', tabId: string, previousTabId: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  align: 'start',
  buttonsOnly: false
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

// Computed classes
const containerClasses = computed(() => {
  return [
    'sub-tab-container',
    {
      'sub-tab-container--buttons-only': props.buttonsOnly
    }
  ]
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

/* Buttons Only Variant - No content wrapper */
.sub-tab-container--buttons-only {
  block-size: auto;
}

/* Navigation - Mobile First */
.sub-tab-container__nav {
  display: flex;
  flex-shrink: 1;
  min-inline-size: 0;
  border-block-end: 2px solid var(--color-border-light);
  gap: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-2);
  overflow-x: auto;
}
/* Custom Scrollbar Styles */
.sub-tab-container__nav::-webkit-scrollbar {
  inline-size: 8px;
  block-size: 8px;
}

.sub-tab-container__nav::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
}

.sub-tab-container__nav::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.sub-tab-container__nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-medium);
}

/* Firefox Scrollbar */
.sub-tab-container__nav {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-bg-tertiary);
}

/* Sub Tab Buttons (Pills Style) - Mobile First */
.sub-tab-container__tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.sub-tab-container__tab:hover:not(.sub-tab-container__tab--disabled) {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}

.sub-tab-container__tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.sub-tab-container__tab--active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.sub-tab-container__tab--active:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.sub-tab-container__tab--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text-muted);
}

/* Tab Content - Mobile First: hide text, show only icon */
.sub-tab-container__tab-icon {
  font-size: var(--font-size-sm);
  line-height: 1;
}

.sub-tab-container__tab-text {
  display: none;
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
  background-color: var(--color-bg-primary);
  color: var(--color-primary);
}

/* Panel Content - Mobile First */
.sub-tab-container__content {
  flex: 1;
  border-block-start: 2px solid var(--color-primary);
  overflow-y: auto;
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

/* Responsive Design - Mobile First */
@container (min-width: 401px) {
  .sub-tab-container__tab-text {
    display: block;
  }
}

@container (min-width: 601px) {
  .sub-tab-container__nav {
    gap: var(--space-2);
  }

  .sub-tab-container__tab {
    padding-inline: var(--space-3);
    font-size: var(--font-size-sm);
  }

  .sub-tab-container__content {
    padding-block: var(--space-4);
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
    padding-block: 0;
  }
}
</style>