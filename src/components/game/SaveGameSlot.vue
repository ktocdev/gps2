<template>
  <div
    class="save-game-slot"
    :class="{
      'save-game-slot--empty': slot.isEmpty,
      'save-game-slot--active': isActive,
      'save-game-slot--selectable': isSelectable
    }"
    @click="handleSlotClick"
  >
    <!-- Empty Slot Display -->
    <div v-if="slot.isEmpty" class="save-game-slot__empty">
      <div class="save-game-slot__icon">
        <span class="save-game-slot__icon-empty">📄</span>
      </div>
      <div class="save-game-slot__content">
        <h3 class="save-game-slot__title">{{ slot.name }}</h3>
        <p class="save-game-slot__subtitle">Empty Slot</p>
        <button
          v-if="showNewGameButton"
          class="save-game-slot__action-button"
          @click.stop="$emit('newGame', slot.id)"
        >
          New Game
        </button>
      </div>
    </div>

    <!-- Occupied Slot Display -->
    <div v-else class="save-game-slot__occupied">
      <div class="save-game-slot__icon">
        <span class="save-game-slot__icon-occupied">🐹</span>
        <div v-if="isActive" class="save-game-slot__active-indicator">
          <span class="save-game-slot__active-text">Active</span>
        </div>
      </div>

      <div class="save-game-slot__content">
        <h3 class="save-game-slot__title">{{ slot.name }}</h3>

        <div class="save-game-slot__metadata">
          <div class="save-game-slot__guinea-pigs">
            <span class="save-game-slot__label">Guinea Pigs:</span>
            <span class="save-game-slot__value">{{ slot.guineaPigCount }}/2</span>
          </div>

          <div v-if="slot.guineaPigNames.length > 0" class="save-game-slot__names">
            <span class="save-game-slot__label">Names:</span>
            <span class="save-game-slot__value">{{ slot.guineaPigNames.join(', ') }}</span>
          </div>

          <div class="save-game-slot__progress">
            <span class="save-game-slot__label">Days Played:</span>
            <span class="save-game-slot__value">{{ slot.gameProgress.daysPlayed }}</span>
          </div>

          <div class="save-game-slot__timestamp">
            <span class="save-game-slot__label">Last Played:</span>
            <span class="save-game-slot__value">{{ formatTimestamp(slot.lastPlayed) }}</span>
          </div>
        </div>

        <div v-if="showActions" class="save-game-slot__actions">
          <button
            class="save-game-slot__action-button save-game-slot__action-button--primary"
            @click.stop="$emit('loadGame', slot.id)"
          >
            Load Game
          </button>
          <button
            v-if="showDeleteButton"
            class="save-game-slot__action-button save-game-slot__action-button--danger"
            @click.stop="$emit('deleteGame', slot.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No Vue composition imports needed for this component
import type { SaveGameSlot } from '../../stores/saveGameManager'

interface SaveGameSlotProps {
  slot: SaveGameSlot
  isActive?: boolean
  isSelectable?: boolean
  showActions?: boolean
  showNewGameButton?: boolean
  showDeleteButton?: boolean
}

interface SaveGameSlotEmits {
  loadGame: [slotId: string]
  newGame: [slotId: string]
  deleteGame: [slotId: string]
  selectSlot: [slotId: string]
}

const props = withDefaults(defineProps<SaveGameSlotProps>(), {
  isActive: false,
  isSelectable: true,
  showActions: true,
  showNewGameButton: true,
  showDeleteButton: true
})

const emit = defineEmits<SaveGameSlotEmits>()

const handleSlotClick = () => {
  if (props.isSelectable) {
    emit('selectSlot', props.slot.id)
  }
}

const formatTimestamp = (timestamp: number): string => {
  if (timestamp === 0) return 'Never'

  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  // Older than 1 week, show date
  return date.toLocaleDateString()
}
</script>

<style>
.save-game-slot {
  border: 2px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1rem;
  background-color: var(--color-background-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.save-game-slot:hover {
  border-color: var(--color-border-primary);
  background-color: var(--color-background-secondary);
}

.save-game-slot--active {
  border-color: var(--color-accent-primary);
  background-color: var(--color-background-accent);
}

.save-game-slot--empty {
  opacity: 0.7;
}

.save-game-slot--empty:hover {
  opacity: 1;
}

.save-game-slot--selectable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.save-game-slot__empty,
.save-game-slot__occupied {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.save-game-slot__icon {
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.save-game-slot__icon-empty,
.save-game-slot__icon-occupied {
  font-size: 2rem;
  line-height: 1;
}

.save-game-slot__active-indicator {
  padding: 0.125rem 0.375rem;
  background-color: var(--color-accent-primary);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.save-game-slot__active-text {
  color: var(--color-text-on-accent);
}

.save-game-slot__content {
  flex: 1;
  min-width: 0;
}

.save-game-slot__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

.save-game-slot__subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-style: italic;
}

.save-game-slot__metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.save-game-slot__guinea-pigs,
.save-game-slot__names,
.save-game-slot__progress,
.save-game-slot__timestamp {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.save-game-slot__label {
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 80px;
}

.save-game-slot__value {
  color: var(--color-text-primary);
}

.save-game-slot__names .save-game-slot__value {
  font-weight: 500;
  color: var(--color-accent-primary);
}

.save-game-slot__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.save-game-slot__action-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-game-slot__action-button:hover {
  background-color: var(--color-background-secondary);
  border-color: var(--color-border-strong);
}

.save-game-slot__action-button--primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: var(--color-accent-primary);
}

.save-game-slot__action-button--primary:hover {
  background-color: var(--color-accent-primary-hover);
  border-color: var(--color-accent-primary-hover);
}

.save-game-slot__action-button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
  border-color: var(--color-danger);
}

.save-game-slot__action-button--danger:hover {
  background-color: var(--color-danger-hover);
  border-color: var(--color-danger-hover);
}

/* Responsive design */
@container (max-width: 480px) {
  .save-game-slot__empty,
  .save-game-slot__occupied {
    flex-direction: column;
    text-align: center;
  }

  .save-game-slot__metadata {
    margin-bottom: 0.75rem;
  }

  .save-game-slot__guinea-pigs,
  .save-game-slot__names,
  .save-game-slot__progress,
  .save-game-slot__timestamp {
    justify-content: space-between;
  }

  .save-game-slot__actions {
    justify-content: center;
  }
}
</style>