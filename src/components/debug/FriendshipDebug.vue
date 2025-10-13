<template>
  <div class="friendship-debug">
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Friendship Progress</h3>
      </div>
      <div class="panel__content">
        <div v-if="!activeGuineaPig" class="empty-state">
          <p>No active guinea pig. Start a game session to test friendship mechanics.</p>
        </div>
        <div v-else class="friendship-debug__content">
          <div class="friendship-debug__guinea-pig-info">
            <h4>{{ activeGuineaPig.name }}</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Friendship:</span>
                <span class="stat-value">{{ Math.round(activeGuineaPig.friendship) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Wellness:</span>
                <span class="stat-value">{{ Math.round(currentWellness) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Friendliness:</span>
                <span class="stat-value">{{ activeGuineaPig.personality.friendliness }}/10</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Playfulness:</span>
                <span class="stat-value">{{ activeGuineaPig.personality.playfulness }}/10</span>
              </div>
            </div>
          </div>

          <FriendshipProgress
            :friendship="activeGuineaPig.friendship"
            :threshold="85"
            :show-message="true"
          />

          <Details summary="Cooldown Status" variant="bordered" default-open>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Play Cooldown:</span>
                <span class="stat-value">{{ playCooldownStatus }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Social Cooldown:</span>
                <span class="stat-value">{{ socialCooldownStatus }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Calculated Play CD:</span>
                <span class="stat-value">{{ calculatedPlayCooldown }}s</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Calculated Social CD:</span>
                <span class="stat-value">{{ calculatedSocialCooldown }}s</span>
              </div>
            </div>
          </Details>

          <Details summary="Friendship Gains/Losses" variant="bordered">
            <div class="friendship-debug__info-section">
              <h5>Active Gains:</h5>
              <ul>
                <li v-if="currentWellness > 50">✅ Passive gain: +0.1 per tick (wellness &gt; 50%)</li>
                <li v-else>❌ No passive gain (wellness ≤ 50%)</li>
                <li>🍎 Feed (normal): +1</li>
                <li>💖 Feed (favorite): +5</li>
                <li>🎮 Play: +3</li>
                <li>🤗 Socialize: +2</li>
                <li>🛁 Clean: +2</li>
                <li>📊 Need fulfillment: +0.5 to +2</li>
              </ul>

              <h5 class="mt-4">Active Losses:</h5>
              <ul>
                <li v-if="currentWellness < 30" class="text-danger">⚠️ Very poor care: -2 per tick (wellness &lt; 30%)</li>
                <li v-else-if="currentWellness < 50" class="text-warning">⚠️ Poor care: -1 per tick (wellness &lt; 50%)</li>
                <li v-else>✅ No wellness penalty</li>
                <li v-if="criticalNeedsCount > 0" class="text-danger">
                  ⚠️ Critical needs: -{{ (criticalNeedsCount * 0.5).toFixed(1) }} per tick ({{ criticalNeedsCount }} needs &lt; 30%)
                </li>
                <li v-else>✅ No critical needs penalty</li>
              </ul>

              <div class="friendship-debug__net-change mt-4">
                <strong>Net Change per Tick (5s):</strong>
                <span :class="netChangeClass">{{ netChangePerTick >= 0 ? '+' : '' }}{{ netChangePerTick.toFixed(2) }}</span>
              </div>
            </div>
          </Details>

          <Details summary="Debug Controls" variant="bordered">
            <div class="flex flex-col gap-3">
              <SliderField
                v-model="activeGuineaPig.friendship"
                label="Friendship"
                :min="0"
                :max="100"
                :step="1"
              />
              <div class="button-group">
                <Button @click="addFriendship(5)" size="sm">+5 Friendship</Button>
                <Button @click="addFriendship(10)" size="sm">+10 Friendship</Button>
                <Button @click="addFriendship(-5)" variant="danger" size="sm">-5 Friendship</Button>
                <Button @click="addFriendship(-10)" variant="danger" size="sm">-10 Friendship</Button>
              </div>
              <div class="button-group">
                <Button @click="setFriendship(0)" variant="secondary" size="sm">Set to 0%</Button>
                <Button @click="setFriendship(50)" variant="secondary" size="sm">Set to 50%</Button>
                <Button @click="setFriendship(85)" variant="secondary" size="sm">Set to 85%</Button>
                <Button @click="setFriendship(100)" variant="secondary" size="sm">Set to 100%</Button>
              </div>
              <hr class="divider">
              <Button @click="testPlayInteraction" full-width>Test Play Interaction</Button>
              <Button @click="testSocialInteraction" full-width>Test Social Interaction</Button>
            </div>
          </Details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useNeedsController } from '../../stores/needsController'
import FriendshipProgress from '../game/FriendshipProgress.vue'
import Details from '../basic/Details.vue'
import SliderField from '../basic/SliderField.vue'
import Button from '../basic/Button.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()

const activeGuineaPig = computed(() => guineaPigStore.activeGuineaPig)

const currentWellness = computed(() => {
  if (!activeGuineaPig.value) return 0
  return needsController.calculateWellness(activeGuineaPig.value.id)
})

const criticalNeedsCount = computed(() => {
  if (!activeGuineaPig.value) return 0
  return Object.values(activeGuineaPig.value.needs).filter(value => value < 30).length
})

const netChangePerTick = computed(() => {
  let change = 0

  // Passive gain/loss
  if (currentWellness.value > 50) {
    change += 0.1
  } else if (currentWellness.value < 30) {
    change -= 2
  } else if (currentWellness.value < 50) {
    change -= 1
  }

  // Critical needs penalty
  if (criticalNeedsCount.value > 0) {
    change -= 0.5 * criticalNeedsCount.value
  }

  return change
})

const netChangeClass = computed(() => {
  if (netChangePerTick.value > 0) return 'text-success'
  if (netChangePerTick.value < 0) return 'text-danger'
  return 'text-muted'
})

const playCooldownStatus = computed(() => {
  if (!activeGuineaPig.value) return 'N/A'
  const cooldown = guineaPigStore.checkInteractionCooldown(activeGuineaPig.value.id, 'play')
  if (cooldown.onCooldown) {
    return `⏱️ ${cooldown.remainingSeconds}s remaining`
  }
  return '✅ Ready'
})

const socialCooldownStatus = computed(() => {
  if (!activeGuineaPig.value) return 'N/A'
  const cooldown = guineaPigStore.checkInteractionCooldown(activeGuineaPig.value.id, 'social')
  if (cooldown.onCooldown) {
    return `⏱️ ${cooldown.remainingSeconds}s remaining`
  }
  return '✅ Ready'
})

const calculatedPlayCooldown = computed(() => {
  if (!activeGuineaPig.value) return 0
  return guineaPigStore.calculateInteractionCooldown(activeGuineaPig.value, 'play')
})

const calculatedSocialCooldown = computed(() => {
  if (!activeGuineaPig.value) return 0
  return guineaPigStore.calculateInteractionCooldown(activeGuineaPig.value, 'social')
})

const addFriendship = (amount: number) => {
  if (!activeGuineaPig.value) return
  guineaPigStore.adjustFriendship(activeGuineaPig.value.id, amount)
}

const setFriendship = (value: number) => {
  if (!activeGuineaPig.value) return
  activeGuineaPig.value.friendship = value
}

const testPlayInteraction = () => {
  if (!activeGuineaPig.value) return
  guineaPigStore.playWithGuineaPig(activeGuineaPig.value.id, 'general_play')
}

const testSocialInteraction = () => {
  if (!activeGuineaPig.value) return
  guineaPigStore.socializeWithGuineaPig(activeGuineaPig.value.id)
}
</script>

<style>
.friendship-debug__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.friendship-debug__guinea-pig-info h4 {
  margin-block-end: var(--space-3);
  color: var(--color-text);
  font-size: 1.2rem;
}

.friendship-debug__info-section h5 {
  margin-block-end: var(--space-2);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
}

.friendship-debug__info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friendship-debug__info-section li {
  padding-inline-start: var(--space-2);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.friendship-debug__net-change {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.friendship-debug__net-change span {
  font-weight: 700;
  font-size: 1.1rem;
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.text-danger {
  color: var(--color-danger);
}

.text-muted {
  color: var(--color-text-muted);
}

.button-group {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.empty-state {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
}

.mt-4 {
  margin-block-start: var(--space-4);
}
</style>
