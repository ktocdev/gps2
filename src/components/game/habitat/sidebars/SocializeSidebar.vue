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

        <!-- System 21: Bond Status -->
        <div v-if="companionBonds.length > 0" class="interaction-section">
          <h4 class="interaction-section__title">🤝 Companion Bonds</h4>
          <div v-for="bondInfo in companionBonds" :key="bondInfo.bond.id" class="bond-status">
            <div class="bond-status__header">
              <span class="bond-partner-name">{{ bondInfo.partnerName }}</span>
              <span class="bond-tier" :class="`bond-tier--${bondInfo.bond.bondingTier}`">
                {{ formatTier(bondInfo.bond.bondingTier) }}
              </span>
            </div>
            <div class="bond-progress">
              <div class="bond-progress__bar">
                <div
                  class="bond-progress__fill"
                  :style="{ width: bondInfo.bond.bondingLevel + '%' }"
                ></div>
              </div>
              <span class="bond-progress__label">{{ Math.round(bondInfo.bond.bondingLevel) }}%</span>
            </div>
            <div class="bond-stats">
              <span class="bond-stat">💕 {{ bondInfo.bond.totalInteractions }} interactions</span>
              <span class="bond-stat">⏱️ {{ bondInfo.bond.proximityTime.toFixed(1) }}h together</span>
            </div>
          </div>
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

          <Button
            @click="$emit('gentle-wipe')"
            variant="tertiary"
            size="sm"
            full-width
          >
            🧼 Gentle Wipe
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
import { computed } from 'vue'
import Button from '../../../basic/Button.vue'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import type { GuineaPig } from '../../../../stores/guineaPigStore'

interface Props {
  selectedGuineaPig?: GuineaPig | null
}

const props = defineProps<Props>()

defineEmits<{
  'pet': []
  'hold': []
  'hand-feed': []
  'gentle-wipe': []
  'talk-to': []
  'sing-to': []
  'call-name': []
  'peek-a-boo': []
  'wave-hand': []
  'show-toy': []
}>()

const guineaPigStore = useGuineaPigStore()

// System 21: Get bonds for selected guinea pig
const companionBonds = computed(() => {
  if (!props.selectedGuineaPig) return []

  const allBonds = guineaPigStore.getAllBonds()
  return allBonds
    .filter(bond =>
      bond.guineaPig1Id === props.selectedGuineaPig!.id ||
      bond.guineaPig2Id === props.selectedGuineaPig!.id
    )
    .map(bond => {
      const partnerId = bond.guineaPig1Id === props.selectedGuineaPig!.id
        ? bond.guineaPig2Id
        : bond.guineaPig1Id
      const partner = guineaPigStore.getGuineaPig(partnerId)
      return {
        bond,
        partnerName: partner?.name || 'Unknown'
      }
    })
})

function formatTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}
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

/* System 21: Bond Status Styles */
.bond-status {
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.bond-status__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-2);
}

.bond-partner-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.bond-tier {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.bond-tier--neutral {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.bond-tier--friends {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
}

.bond-tier--bonded {
  background: var(--color-pink-100);
  color: var(--color-pink-700);
}

.bond-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block-end: var(--space-2);
}

.bond-progress__bar {
  flex: 1;
  block-size: 6px;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bond-progress__fill {
  block-size: 100%;
  background: linear-gradient(90deg, var(--color-blue-500), var(--color-pink-500));
  transition: inline-size 0.3s ease;
}

.bond-progress__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-inline-size: 40px;
  text-align: end;
}

.bond-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.bond-stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
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
