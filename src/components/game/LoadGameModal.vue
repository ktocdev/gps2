<template>
  <div
    v-if="isVisible"
    class="load-game-modal"
    @click="handleOverlayClick"
  >
    <div class="load-game-modal__dialog" @click.stop>
      <div class="load-game-modal__header">
        <h2 class="load-game-modal__title">Load Game</h2>
        <button
          class="load-game-modal__close-button"
          @click="$emit('close')"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="load-game-modal__content">
        <!-- Description -->
        <p class="load-game-modal__description">
          Choose a saved game to load, or start a new game in an empty slot.
          You can have up to 3 saved games with 2 guinea pigs each.
        </p>

        <!-- Save Slots Grid -->
        <div class="load-game-modal__slots">
          <SaveGameSlot
            v-for="slot in allSlots"
            :key="slot.id"
            :slot="slot"
            :is-active="slot.id === currentSlotId"
            :is-selectable="true"
            :show-actions="true"
            :show-new-game-button="true"
            :show-delete-button="!slot.isEmpty"
            @load-game="handleLoadGame"
            @new-game="handleNewGame"
            @delete-game="handleDeleteGame"
            @select-slot="handleSelectSlot"
          />
        </div>

        <!-- No Saved Games Message -->
        <div
          v-if="occupiedSlots.length === 0"
          class="load-game-modal__empty-state"
        >
          <div class="load-game-modal__empty-icon">🎮</div>
          <h3 class="load-game-modal__empty-title">No Saved Games</h3>
          <p class="load-game-modal__empty-description">
            You don't have any saved games yet. Click "New Game" on any slot to start your guinea pig adventure!
          </p>
        </div>

        <!-- Current Game Info -->
        <div
          v-if="currentSlot && !currentSlot.isEmpty"
          class="load-game-modal__current-game"
        >
          <h3 class="load-game-modal__current-title">Currently Playing</h3>
          <div class="load-game-modal__current-info">
            <span class="load-game-modal__current-name">{{ currentSlot.name }}</span>
            <span class="load-game-modal__current-details">
              {{ currentSlot.guineaPigCount }}/2 guinea pigs
              <span v-if="currentSlot.guineaPigNames.length > 0">
                - {{ currentSlot.guineaPigNames.join(', ') }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="load-game-modal__footer">
        <button
          class="load-game-modal__action-button load-game-modal__action-button--secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          v-if="!currentSlot || currentSlot.isEmpty"
          class="load-game-modal__action-button load-game-modal__action-button--primary"
          :disabled="occupiedSlots.length === 0"
          @click="handleQuickLoad"
        >
          Load Latest Game
        </button>
      </div>

      <!-- Delete Confirmation -->
      <div
        v-if="showDeleteConfirmation"
        class="load-game-modal__delete-confirmation"
      >
        <div class="load-game-modal__delete-dialog">
          <h3 class="load-game-modal__delete-title">Delete Save Game?</h3>
          <p class="load-game-modal__delete-message">
            Are you sure you want to delete "{{ slotToDelete?.name }}"?
            This action cannot be undone.
          </p>
          <div class="load-game-modal__delete-actions">
            <button
              class="load-game-modal__action-button load-game-modal__action-button--secondary"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              class="load-game-modal__action-button load-game-modal__action-button--danger"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSaveGameManager } from '../../stores/saveGameManager'
import { useGameController } from '../../stores/gameController'
import SaveGameSlot from './SaveGameSlot.vue'
import type { SaveGameSlot as SaveGameSlotType } from '../../stores/saveGameManager'

interface LoadGameModalProps {
  isVisible: boolean
}

interface LoadGameModalEmits {
  close: []
  gameLoaded: [slotId: string]
  newGameStarted: [slotId: string]
}

defineProps<LoadGameModalProps>()
const emit = defineEmits<LoadGameModalEmits>()

const saveGameManager = useSaveGameManager()
const gameController = useGameController()

// Save game data
const allSlots = computed(() => saveGameManager.allSlots)
const occupiedSlots = computed(() => saveGameManager.occupiedSlots)
const currentSlot = computed(() => saveGameManager.currentSlot)
const currentSlotId = computed(() => saveGameManager.metadata.currentSlotId)

// Delete confirmation state
const showDeleteConfirmation = ref(false)
const slotToDelete = ref<SaveGameSlotType | null>(null)

const handleOverlayClick = () => {
  if (!showDeleteConfirmation.value) {
    emit('close')
  }
}

const handleLoadGame = (slotId: string) => {
  // Switch to the selected slot
  const success = saveGameManager.switchToSlot(slotId)

  if (success) {
    // Force reload the game controller to load slot-specific data
    gameController.initializeStore()
    emit('gameLoaded', slotId)
    emit('close')
  } else {
    console.error('Failed to switch to slot:', slotId)
  }
}

const handleNewGame = (slotId: string) => {
  // Create new game in slot
  const gameName = `Game ${slotId.replace('slot_', '')}`
  const created = saveGameManager.createNewGameInSlot(slotId, gameName)

  if (created) {
    // Switch to the new slot
    saveGameManager.switchToSlot(slotId)

    // Reset game state for new game
    gameController.newGame()

    emit('newGameStarted', slotId)
    emit('close')
  } else {
    console.error('Failed to create new game in slot:', slotId)
  }
}

const handleDeleteGame = (slotId: string) => {
  const slot = allSlots.value.find(s => s.id === slotId)
  if (slot && !slot.isEmpty) {
    slotToDelete.value = slot
    showDeleteConfirmation.value = true
  }
}

const handleSelectSlot = (slotId: string) => {
  // For load modal, selecting a slot is the same as loading it
  if (!allSlots.value.find(s => s.id === slotId)?.isEmpty) {
    handleLoadGame(slotId)
  }
}

const handleQuickLoad = () => {
  if (occupiedSlots.value.length === 0) return

  // Load the most recently played game
  const latestSlot = occupiedSlots.value.reduce((latest, slot) =>
    slot.lastPlayed > latest.lastPlayed ? slot : latest
  )

  handleLoadGame(latestSlot.id)
}

const confirmDelete = () => {
  if (slotToDelete.value) {
    const success = saveGameManager.deleteSlot(slotToDelete.value.id)

    if (success) {
      // If we deleted the current slot and there are other slots, reload
      if (currentSlotId.value && occupiedSlots.value.length > 0) {
        gameController.initializeStore()
      }
    }
  }

  cancelDelete()
}

const cancelDelete = () => {
  slotToDelete.value = null
  showDeleteConfirmation.value = false
}
</script>

<style>
.load-game-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.load-game-modal__dialog {
  background-color: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.load-game-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 1.5rem;
}

.load-game-modal__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.load-game-modal__close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.load-game-modal__close-button:hover {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.load-game-modal__content {
  padding: 0 1.5rem;
}

.load-game-modal__description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.load-game-modal__slots {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.load-game-modal__empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.load-game-modal__empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.load-game-modal__empty-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.load-game-modal__empty-description {
  margin: 0;
  line-height: 1.5;
}

.load-game-modal__current-game {
  background-color: var(--color-background-accent);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--color-border-accent);
}

.load-game-modal__current-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.load-game-modal__current-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.load-game-modal__current-name {
  font-weight: 600;
  color: var(--color-accent-primary);
}

.load-game-modal__current-details {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.load-game-modal__footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border-subtle);
  margin-top: 1.5rem;
}

.load-game-modal__action-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-game-modal__action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-game-modal__action-button--secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.load-game-modal__action-button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-tertiary);
}

.load-game-modal__action-button--primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: var(--color-accent-primary);
}

.load-game-modal__action-button--primary:hover:not(:disabled) {
  background-color: var(--color-accent-primary-hover);
  border-color: var(--color-accent-primary-hover);
}

.load-game-modal__action-button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
  border-color: var(--color-danger);
}

.load-game-modal__action-button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
  border-color: var(--color-danger-hover);
}

/* Delete Confirmation Overlay */
.load-game-modal__delete-confirmation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.load-game-modal__delete-dialog {
  background-color: var(--color-background-primary);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.load-game-modal__delete-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.load-game-modal__delete-message {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.load-game-modal__delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Responsive design */
@media (max-width: 768px) {
  .load-game-modal {
    padding: 0.5rem;
  }

  .load-game-modal__dialog {
    max-height: 95vh;
  }

  .load-game-modal__header,
  .load-game-modal__content,
  .load-game-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .load-game-modal__footer {
    flex-direction: column-reverse;
  }

  .load-game-modal__action-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .load-game-modal__delete-actions {
    flex-direction: column-reverse;
  }

  .load-game-modal__delete-actions .load-game-modal__action-button {
    width: 100%;
  }
}
</style>