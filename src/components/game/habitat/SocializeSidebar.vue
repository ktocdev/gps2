<template>
  <div class="socialize-sidebar">
    <div class="socialize-sidebar__header">
      <h3>Socialize</h3>
    </div>

    <div class="socialize-sidebar__content">
      <!-- Guinea Pig Selection Info -->
      <div v-if="!selectedGuineaPig" class="socialize-sidebar__no-selection">
        <p>👆 Click a guinea pig in the habitat to interact with them</p>
      </div>

      <template v-else>
        <div class="socialize-sidebar__guinea-pig-name">
          Interacting with: <strong>{{ selectedGuineaPig.name }}</strong>
        </div>

        <!-- Basic Interactions -->
        <div class="interaction-section">
          <h4 class="interaction-section__title">Basic Interactions</h4>

          <Button
            @click="$emit('pet')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🫳 Pet
          </Button>

          <Button
            @click="$emit('hold')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🤲 Hold
          </Button>

          <Button
            @click="$emit('hand-feed')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🥕 Hand Feed
          </Button>
        </div>

        <!-- Communication -->
        <div class="interaction-section">
          <h4 class="interaction-section__title">Communication</h4>

          <Button
            @click="$emit('talk-to')"
            variant="tertiary"
            size="sm"
            full-width
          >
            💬 Talk To
          </Button>

          <Button
            @click="$emit('sing-to')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🎵 Sing To
          </Button>

          <Button
            @click="$emit('call-name')"
            variant="tertiary"
            size="sm"
            full-width
          >
            📣 Call Name
          </Button>
        </div>

        <!-- Play -->
        <div class="interaction-section">
          <h4 class="interaction-section__title">Play</h4>

          <Button
            @click="$emit('peek-a-boo')"
            variant="tertiary"
            size="sm"
            full-width
          >
            👀 Peek-a-Boo
          </Button>

          <Button
            @click="$emit('wave-hand')"
            variant="tertiary"
            size="sm"
            full-width
          >
            👋 Wave Hand
          </Button>

          <Button
            @click="$emit('show-toy')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🧸 Show Toy
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../../basic/Button.vue'
import type { GuineaPig } from '../../../stores/guineaPigStore'

interface Props {
  selectedGuineaPig?: GuineaPig | null
}

defineProps<Props>()

defineEmits<{
  'pet': []
  'hold': []
  'hand-feed': []
  'talk-to': []
  'sing-to': []
  'call-name': []
  'peek-a-boo': []
  'wave-hand': []
  'show-toy': []
}>()
</script>

<style>
.socialize-sidebar {
  display: flex;
  flex-direction: column;
  inline-size: 240px;
  block-size: 100%;
  background-color: var(--color-bg-secondary);
  border-inline-start: 1px solid var(--color-border);
  overflow-y: auto;
}

.socialize-sidebar__header {
  padding: var(--space-4);
  border-block-end: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.socialize-sidebar__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.socialize-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.socialize-sidebar__no-selection {
  text-align: center;
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.socialize-sidebar__guinea-pig-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  text-align: center;
  margin-block-end: var(--space-2);
}

.interaction-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.interaction-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
  margin-block-end: var(--space-1);
}

/* Mobile: Full width layout */
@media (max-width: 768px) {
  .socialize-sidebar {
    inline-size: 100%;
    max-block-size: 300px;
    border-inline-start: none;
    border-block-start: 1px solid var(--color-border);
  }
}
</style>
