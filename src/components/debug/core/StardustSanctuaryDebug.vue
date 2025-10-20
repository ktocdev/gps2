<template>
  <div class="sanctuary-debug">
    <h2>
      Stardust Sanctuary
      <InfoButton
        message="Reach 85% friendship with a guinea pig to unlock Stardust Sanctuary. Guinea pigs in the Sanctuary have their friendship frozen at 100% wellness and can be brought back as companions at any time."
        position="bottom"
      />
    </h2>
    <div class="panel-row">
    <!-- Active Guinea Pigs Section -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Active Guinea Pigs ({{ activeGuineaPigs.length }}/2)</h3>
      </div>
      <div class="panel__content">
        <div v-if="activeGuineaPigs.length === 0" class="panel panel--compact panel--warning">
          <div class="panel__content text-center">
            <p>No active guinea pigs. Start a game session from the Pet Store tab to test Stardust Sanctuary.</p>
          </div>
        </div>
        <div v-else class="sanctuary-debug__guinea-pig-list">
          <div
            v-for="guineaPig in activeGuineaPigs"
            :key="guineaPig.id"
            class="sanctuary-debug__guinea-pig-card"
          >
            <div class="sanctuary-debug__guinea-pig-header">
              <h4>{{ guineaPig.name }}</h4>
              <Badge variant="info" size="sm">ACTIVE</Badge>
            </div>
            <div class="sanctuary-debug__guinea-pig-info">
              <span>{{ guineaPig.breed }} • {{ guineaPig.gender }}</span>
            </div>
            <FriendshipProgress
              :friendship="guineaPig.friendship"
              :threshold="85"
              :show-message="true"
            />
            <div class="sanctuary-debug__actions">
              <Button
                @click="handleMoveToSanctuary(guineaPig.id)"
                :disabled="guineaPig.friendship < 85"
                full-width
                size="sm"
                :tooltip="guineaPig.friendship < 85 ? `Need ${Math.ceil(85 - guineaPig.friendship)}% more friendship` : 'Move to Stardust Sanctuary'"
              >
                ✨ Move to Sanctuary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stardust Sanctuary Section -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Stardust Sanctuary ({{ petStoreManager.sanctuaryCount }}/{{ petStoreManager.maxSanctuarySlots }})</h3>
      </div>
      <div class="panel__content">
        <div v-if="petStoreManager.sanctuaryCount === 0" class="panel panel--compact panel--warning">
          <div class="panel__content text-center">
            <p>No guinea pigs in Stardust Sanctuary yet. Build friendship to 85% to unlock!</p>
          </div>
        </div>
        <div v-else class="sanctuary-debug__guinea-pig-list">
          <div
            v-for="guineaPig in petStoreManager.sanctuaryGuineaPigs"
            :key="guineaPig.id"
            class="sanctuary-debug__guinea-pig-card sanctuary-debug__guinea-pig-card--sanctuary"
          >
            <div class="sanctuary-debug__guinea-pig-header">
              <h4>{{ guineaPig.name }}</h4>
              <Badge variant="success" size="sm">SANCTUARY</Badge>
            </div>
            <div class="sanctuary-debug__guinea-pig-info">
              <span>{{ guineaPig.breed }} • {{ guineaPig.gender }}</span>
            </div>
            <div class="sanctuary-debug__friendship-frozen">
              <span class="sanctuary-debug__friendship-value">💖 {{ Math.round(guineaPig.friendship) }}%</span>
              <span class="sanctuary-debug__friendship-label">Friendship Frozen</span>
            </div>
            <div class="sanctuary-debug__actions">
              <Button
                @click="handleMoveFromSanctuary(guineaPig.id)"
                :disabled="activeGuineaPigs.length >= 2"
                full-width
                size="sm"
                variant="secondary"
                :tooltip="activeGuineaPigs.length >= 2 ? 'Deactivate a guinea pig first' : 'Activate from Sanctuary'"
              >
                💚 Activate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sanctuary Slots Section -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Sanctuary Capacity</h3>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Slots:</span>
            <span class="stat-value">{{ petStoreManager.maxSanctuarySlots }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Used Slots:</span>
            <span class="stat-value">{{ petStoreManager.sanctuaryCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Available Slots:</span>
            <span class="stat-value">{{ petStoreManager.availableSanctuarySlots }}</span>
          </div>
        </div>
        <BlockMessage variant="info" class="mt-4">
          <p>Guinea pigs in Stardust Sanctuary:</p>
          <ul>
            <li>✨ Have their friendship frozen at current level</li>
            <li>💯 Have all needs reset to 100%</li>
            <li>💚 Can be reactivated at any time</li>
            <li>🔒 Are permanently adopted (never returned)</li>
          </ul>
        </BlockMessage>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import FriendshipProgress from '../../game/ui/FriendshipProgress.vue'
import Button from '../../basic/Button.vue'
import Badge from '../../basic/Badge.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import InfoButton from '../../basic/InfoButton.vue'

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()

const activeGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs
})

const handleMoveToSanctuary = (guineaPigId: string) => {
  petStoreManager.moveToSanctuary(guineaPigId)
}

const handleMoveFromSanctuary = (guineaPigId: string) => {
  petStoreManager.moveFromSanctuary(guineaPigId)
}
</script>

<style>
.sanctuary-debug__guinea-pig-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sanctuary-debug__guinea-pig-card {
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.sanctuary-debug__guinea-pig-card--sanctuary {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: var(--color-primary);
}

.sanctuary-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sanctuary-debug__guinea-pig-header h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.sanctuary-debug__guinea-pig-info {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.sanctuary-debug__friendship-frozen {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.sanctuary-debug__friendship-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-success);
}

.sanctuary-debug__friendship-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.sanctuary-debug__actions {
  display: flex;
  gap: var(--space-2);
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
