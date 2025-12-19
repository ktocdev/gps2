<template>
  <div
    class="side-panel-3d"
    :class="[
      `side-panel-3d--${side}`,
      `side-panel-3d--${color}`,
      { 'side-panel-3d--collapsed': !isOpen }
    ]"
  >
    <!-- Tab button - visible when collapsed -->
    <button
      class="side-panel-3d__tab"
      @click="$emit('toggle')"
      :title="`Open ${title}`"
    >
      {{ icon }}
    </button>

    <!-- Panel Body -->
    <div class="side-panel-3d__body">
      <div class="side-panel-3d__header">
        <span class="side-panel-3d__title">{{ icon }} {{ title }}</span>
        <slot name="header-extra"></slot>
        <button class="side-panel-3d__close" @click="$emit('toggle')" title="Close">
          {{ side === 'left' ? '◀' : '▶' }}
        </button>
      </div>
      <div class="side-panel-3d__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  side: 'left' | 'right'
  color: 'yellow' | 'violet' | 'pink' | 'green'
  title: string
  icon: string
}

defineProps<Props>()

defineEmits<{
  toggle: []
}>()
</script>

<style>
/* Side Panel 3D - Base overlay panel component */
.side-panel-3d {
  position: absolute;
  inset-block-start: 0;
  block-size: 100%;
  z-index: 20;
  pointer-events: none;
}

/* Side positioning */
.side-panel-3d--left {
  inset-inline-start: 0;
}

.side-panel-3d--right {
  inset-inline-end: 0;
}

/* Tab button - visible when collapsed */
.side-panel-3d__tab {
  position: absolute;
  inset-block-start: 0;
  block-size: 40px;
  padding: 0 var(--spacing-sm);
  border: none;
  border-radius: 0;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.3s ease;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

/* Tab positioning by side */
.side-panel-3d--left .side-panel-3d__tab {
  inset-inline-start: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.side-panel-3d--right .side-panel-3d__tab {
  inset-inline-end: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

/* Hide tab when panel is expanded */
.side-panel-3d:not(.side-panel-3d--collapsed) .side-panel-3d__tab {
  opacity: 0;
  pointer-events: none;
}

/* Panel Body */
.side-panel-3d__body {
  position: absolute;
  inset-block-start: 0;
  block-size: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(0);
  transition: transform 0.3s ease;
  pointer-events: auto;
}

/* Body positioning and sizing by side */
.side-panel-3d--left .side-panel-3d__body {
  inset-inline-start: 0;
  inline-size: 320px;
  background-color: var(--color-bg-primary);
  border-inline-end: 1px solid var(--color-border);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
}

.side-panel-3d--right .side-panel-3d__body {
  inset-inline-end: 0;
  inline-size: 280px;
  background-color: var(--color-bg-primary);
  border-inline-start: 1px solid var(--color-border);
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

/* Collapsed state transforms */
.side-panel-3d--collapsed.side-panel-3d--left .side-panel-3d__body {
  transform: translateX(-100%);
  box-shadow: none;
}

.side-panel-3d--collapsed.side-panel-3d--right .side-panel-3d__body {
  transform: translateX(100%);
  box-shadow: none;
}

/* Header */
.side-panel-3d__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: white;
  flex-shrink: 0;
}

.side-panel-3d__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.side-panel-3d__close {
  margin-inline-start: auto;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.side-panel-3d__close:hover {
  opacity: 1;
}

/* Hide close button when collapsed */
.side-panel-3d--collapsed .side-panel-3d__close {
  opacity: 0;
  pointer-events: none;
}

/* Content */
.side-panel-3d__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

/* Color variants - Yellow */
.side-panel-3d--yellow .side-panel-3d__tab {
  background-color: var(--color-accent-yellow-500);
  color: var(--color-neutral-900);
}

.side-panel-3d--yellow .side-panel-3d__tab:hover {
  background-color: var(--color-accent-yellow-600);
}

.side-panel-3d--yellow .side-panel-3d__header {
  background-color: var(--color-accent-yellow-500);
  color: var(--color-neutral-900);
}

/* Color variants - Violet */
.side-panel-3d--violet .side-panel-3d__tab {
  background-color: var(--color-accent-violet-500);
  color: white;
}

.side-panel-3d--violet .side-panel-3d__tab:hover {
  background-color: var(--color-accent-violet-600);
}

.side-panel-3d--violet .side-panel-3d__header {
  background-color: var(--color-accent-violet-500);
}

/* Color variants - Pink */
.side-panel-3d--pink .side-panel-3d__tab {
  background-color: var(--color-accent-pink-500);
  color: white;
}

.side-panel-3d--pink .side-panel-3d__tab:hover {
  background-color: var(--color-accent-pink-600);
}

.side-panel-3d--pink .side-panel-3d__header {
  background-color: var(--color-accent-pink-500);
}

/* Color variants - Green */
.side-panel-3d--green .side-panel-3d__tab {
  background-color: var(--color-accent-green-500);
  color: white;
}

.side-panel-3d--green .side-panel-3d__tab:hover {
  background-color: var(--color-accent-green-600);
}

.side-panel-3d--green .side-panel-3d__header {
  background-color: var(--color-accent-green-500);
}
</style>
