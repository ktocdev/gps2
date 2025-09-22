<template>
  <div
    v-if="isVisible"
    class="save-game-modal"
    @click="handleOverlayClick"
  >
    <div class="save-game-modal__dialog" @click.stop>
      <div class="save-game-modal__header">
        <h2 class="save-game-modal__title">Save Game</h2>
        <button
          class="save-game-modal__close-button"
          @click="$emit('close')"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="save-game-modal__content">
        <!-- Current Game Info -->
        <div
          v-if="currentSlot && !currentSlot.isEmpty"
          class="save-game-modal__current-game"
        >
          <h3 class="save-game-modal__current-title">Current Game</h3>
          <div class="save-game-modal__current-info">
            <span class="save-game-modal__current-name">{{ currentSlot.name }}</span>
            <span class="save-game-modal__current-details">
              {{ currentSlot.guineaPigCount }}/2 guinea pigs
              <span v-if="currentSlot.guineaPigNames.length > 0">
                - {{ currentSlot.guineaPigNames.join(', ') }}
              </span>
            </span>
          </div>
        </div>

        <!-- Save Options -->
        <div class="save-game-modal__options">
          <h3 class="save-game-modal__options-title">Choose Save Location</h3>
          <p class="save-game-modal__description">
            Save your current game progress to a slot. You can overwrite existing saves.
          </p>

          <!-- Quick Save to Current Slot -->
          <div
            v-if="currentSlot && !currentSlot.isEmpty"
            class="save-game-modal__quick-save"
          >
            <button
              class="save-game-modal__quick-save-button"
              @click="handleQuickSave"
              :disabled="isSaving"
            >
              <span class="save-game-modal__quick-save-icon">💾</span>
              <div class="save-game-modal__quick-save-content">
                <div class="save-game-modal__quick-save-title">Quick Save</div>
                <div class="save-game-modal__quick-save-subtitle">
                  Save to {{ currentSlot.name }}
                </div>
              </div>
            </button>
          </div>

          <!-- Save Slots Grid -->
          <div class="save-game-modal__slots">
            <div
              v-for="slot in allSlots"
              :key="slot.id"
              class="save-game-modal__slot"
              :class="{
                'save-game-modal__slot--current': slot.id === currentSlotId,
                'save-game-modal__slot--empty': slot.isEmpty,
                'save-game-modal__slot--selectable': !isSaving
              }"
              @click="handleSlotSelect(slot)"
            >
              <div class="save-game-modal__slot-icon">
                <span v-if="slot.isEmpty">📄</span>
                <span v-else>🐹</span>
                <div
                  v-if="slot.id === currentSlotId"
                  class="save-game-modal__slot-current-indicator"
                >
                  Current
                </div>
              </div>

              <div class="save-game-modal__slot-content">
                <h4 class="save-game-modal__slot-title">{{ slot.name }}</h4>

                <div v-if="slot.isEmpty" class="save-game-modal__slot-empty">
                  <span class="save-game-modal__slot-empty-text">Empty Slot</span>
                  <button
                    class="save-game-modal__slot-action"
                    @click.stop="handleSaveToSlot(slot.id)"
                    :disabled="isSaving"
                  >
                    Save Here
                  </button>
                </div>

                <div v-else class="save-game-modal__slot-occupied">
                  <div class="save-game-modal__slot-metadata">
                    <div class="save-game-modal__slot-guinea-pigs">
                      {{ slot.guineaPigCount }}/2 guinea pigs
                      <span v-if="slot.guineaPigNames.length > 0" class="save-game-modal__slot-names">
                        ({{ slot.guineaPigNames.join(', ') }})
                      </span>
                    </div>
                    <div class="save-game-modal__slot-timestamp">
                      Last saved: {{ formatTimestamp(slot.lastPlayed) }}
                    </div>
                  </div>
                  <button
                    class="save-game-modal__slot-action save-game-modal__slot-action--overwrite"
                    @click.stop="handleOverwriteSlot(slot.id)"
                    :disabled="isSaving"
                  >
                    Overwrite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Name Input for New Slots -->
        <div
          v-if="showNameInput"
          class="save-game-modal__name-input"
        >
          <h3 class="save-game-modal__name-title">Save Game Name</h3>
          <input
            v-model="saveName"
            class="save-game-modal__name-field"
            type="text"
            placeholder="Enter a name for your save game..."
            maxlength="50"
            @keyup.enter="confirmSave"
            ref="nameInput"
          />
          <div class="save-game-modal__name-actions">
            <button
              class="save-game-modal__action-button save-game-modal__action-button--secondary"
              @click="cancelSave"
            >
              Cancel
            </button>
            <button
              class="save-game-modal__action-button save-game-modal__action-button--primary"
              @click="confirmSave"
              :disabled="!saveName.trim() || isSaving"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div v-if="!showNameInput" class="save-game-modal__footer">
        <button
          class="save-game-modal__action-button save-game-modal__action-button--secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>
      </div>

      <!-- Overwrite Confirmation -->
      <div
        v-if="showOverwriteConfirmation"
        class="save-game-modal__overwrite-confirmation"
      >
        <div class="save-game-modal__overwrite-dialog">
          <h3 class="save-game-modal__overwrite-title">Overwrite Save Game?</h3>
          <p class="save-game-modal__overwrite-message">
            Are you sure you want to overwrite "{{ slotToOverwrite?.name }}"?
            This will replace the existing save data.
          </p>
          <div class="save-game-modal__overwrite-actions">
            <button
              class="save-game-modal__action-button save-game-modal__action-button--secondary"
              @click="cancelOverwrite"
            >
              Cancel
            </button>
            <button
              class="save-game-modal__action-button save-game-modal__action-button--primary"
              @click="confirmOverwrite"
              :disabled="isSaving"
            >
              Overwrite
            </button>
          </div>
        </div>
      </div>

      <!-- Saving Status -->
      <div
        v-if="isSaving"
        class="save-game-modal__saving-overlay"
      >
        <div class="save-game-modal__saving-content">
          <div class="save-game-modal__saving-spinner">💾</div>
          <div class="save-game-modal__saving-text">Saving game...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useSaveGameManager } from '../../stores/saveGameManager'
import { useGameController } from '../../stores/gameController'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import type { SaveGameSlot } from '../../stores/saveGameManager'

interface SaveGameModalProps {
  isVisible: boolean
}

interface SaveGameModalEmits {
  close: []
  gameSaved: [slotId: string]
}

defineProps<SaveGameModalProps>()
const emit = defineEmits<SaveGameModalEmits>()

const saveGameManager = useSaveGameManager()
const gameController = useGameController()
const guineaPigStore = useGuineaPigStore()

// Save game data
const allSlots = computed(() => saveGameManager.allSlots)
const currentSlot = computed(() => saveGameManager.currentSlot)
const currentSlotId = computed(() => saveGameManager.metadata.currentSlotId)

// Component state
const isSaving = ref(false)
const showNameInput = ref(false)
const showOverwriteConfirmation = ref(false)
const saveName = ref('')
const selectedSlotId = ref<string | null>(null)
const slotToOverwrite = ref<SaveGameSlot | null>(null)
const nameInput = ref<HTMLInputElement>()

const handleOverlayClick = () => {
  if (!showNameInput.value && !showOverwriteConfirmation.value && !isSaving.value) {
    emit('close')
  }
}

const handleQuickSave = async () => {
  if (!currentSlot.value) return

  await performSave(currentSlot.value.id, currentSlot.value.name)
}

const handleSlotSelect = (slot: SaveGameSlot) => {
  if (isSaving.value) return

  if (slot.isEmpty) {
    handleSaveToSlot(slot.id)
  } else {
    handleOverwriteSlot(slot.id)
  }
}

const handleSaveToSlot = (slotId: string) => {
  selectedSlotId.value = slotId
  saveName.value = `Game ${slotId.replace('slot_', '')}`
  showNameInput.value = true

  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

const handleOverwriteSlot = (slotId: string) => {
  const slot = allSlots.value.find(s => s.id === slotId)
  if (slot && !slot.isEmpty) {
    selectedSlotId.value = slotId
    slotToOverwrite.value = slot
    showOverwriteConfirmation.value = true
  }
}

const confirmSave = async () => {
  if (!selectedSlotId.value || !saveName.value.trim()) return

  await performSave(selectedSlotId.value, saveName.value.trim())
}

const confirmOverwrite = async () => {
  if (!selectedSlotId.value || !slotToOverwrite.value) return

  await performSave(selectedSlotId.value, slotToOverwrite.value.name)
  cancelOverwrite()
}

const performSave = async (slotId: string, gameName: string) => {
  isSaving.value = true

  try {
    // Prepare save data
    const gameData = {
      guineaPigCount: guineaPigStore.guineaPigCount,
      guineaPigNames: guineaPigStore.allGuineaPigs.map(gp => gp.name),
      gameProgress: {
        totalPlayTime: 0, // TODO: Implement actual play time tracking
        achievementsUnlocked: 0, // TODO: Implement achievements
        daysPlayed: Math.max(...guineaPigStore.allGuineaPigs.map(gp => gp.stats.age))
      }
    }

    // Update slot with game data
    const saveSuccess = saveGameManager.saveGameToSlot(slotId, gameData)

    if (saveSuccess) {
      // Update slot name if it's a new save
      const slot = allSlots.value.find(s => s.id === slotId)
      if (slot) {
        slot.name = gameName
      }

      // Switch to the saved slot if it's not current
      if (currentSlotId.value !== slotId) {
        saveGameManager.switchToSlot(slotId)
      }

      // Trigger manual save to ensure persistence
      gameController.saveGame()

      emit('gameSaved', slotId)
      emit('close')
    } else {
      console.error('Failed to save game to slot:', slotId)
    }
  } catch (error) {
    console.error('Error saving game:', error)
  } finally {
    isSaving.value = false
    resetState()
  }
}

const cancelSave = () => {
  resetState()
}

const cancelOverwrite = () => {
  slotToOverwrite.value = null
  showOverwriteConfirmation.value = false
  selectedSlotId.value = null
}

const resetState = () => {
  showNameInput.value = false
  showOverwriteConfirmation.value = false
  saveName.value = ''
  selectedSlotId.value = null
  slotToOverwrite.value = null
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

  // Show date for older saves
  return date.toLocaleDateString()
}
</script>

<style>
.save-game-modal {
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

.save-game-modal__dialog {
  background-color: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.save-game-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 1.5rem;
}

.save-game-modal__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.save-game-modal__close-button:hover {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.save-game-modal__content {
  padding: 0 1.5rem;
}

.save-game-modal__current-game {
  background-color: var(--color-background-accent);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--color-border-accent);
  margin-bottom: 1.5rem;
}

.save-game-modal__current-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__current-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.save-game-modal__current-name {
  font-weight: 600;
  color: var(--color-accent-primary);
}

.save-game-modal__current-details {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.save-game-modal__options-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.save-game-modal__quick-save {
  margin-bottom: 1.5rem;
}

.save-game-modal__quick-save-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--color-accent-primary);
  border-radius: 8px;
  background-color: var(--color-background-accent);
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-game-modal__quick-save-button:hover:not(:disabled) {
  background-color: var(--color-accent-primary);
  transform: translateY(-2px);
}

.save-game-modal__quick-save-button:hover:not(:disabled) .save-game-modal__quick-save-content {
  color: var(--color-text-on-accent);
}

.save-game-modal__quick-save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-game-modal__quick-save-icon {
  font-size: 2rem;
}

.save-game-modal__quick-save-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

.save-game-modal__quick-save-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.save-game-modal__slots {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.save-game-modal__slot {
  border: 2px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.save-game-modal__slot--selectable {
  cursor: pointer;
}

.save-game-modal__slot--selectable:hover {
  border-color: var(--color-border-primary);
  background-color: var(--color-background-secondary);
}

.save-game-modal__slot--current {
  border-color: var(--color-accent-primary);
  background-color: var(--color-background-accent);
}

.save-game-modal__slot {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.save-game-modal__slot-icon {
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 2rem;
}

.save-game-modal__slot-current-indicator {
  padding: 0.125rem 0.375rem;
  background-color: var(--color-accent-primary);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-on-accent);
}

.save-game-modal__slot-content {
  flex: 1;
  min-width: 0;
}

.save-game-modal__slot-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__slot-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.save-game-modal__slot-empty-text {
  color: var(--color-text-muted);
  font-style: italic;
}

.save-game-modal__slot-occupied {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.save-game-modal__slot-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.save-game-modal__slot-guinea-pigs {
  font-weight: 500;
  color: var(--color-text-primary);
}

.save-game-modal__slot-names {
  color: var(--color-accent-primary);
}

.save-game-modal__slot-timestamp {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.save-game-modal__slot-action {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.save-game-modal__slot-action:hover:not(:disabled) {
  background-color: var(--color-background-secondary);
}

.save-game-modal__slot-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-game-modal__slot-action--overwrite {
  background-color: var(--color-warning);
  color: var(--color-text-on-warning);
  border-color: var(--color-warning);
}

.save-game-modal__slot-action--overwrite:hover:not(:disabled) {
  background-color: var(--color-warning-hover);
  border-color: var(--color-warning-hover);
}

/* Name Input Section */
.save-game-modal__name-input {
  background-color: var(--color-background-accent);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border-accent);
}

.save-game-modal__name-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__name-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.save-game-modal__name-field:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb), 0.2);
}

.save-game-modal__name-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-game-modal__footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border-subtle);
  margin-top: 1.5rem;
}

.save-game-modal__action-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-game-modal__action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-game-modal__action-button--secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.save-game-modal__action-button--secondary:hover:not(:disabled) {
  background-color: var(--color-background-tertiary);
}

.save-game-modal__action-button--primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: var(--color-accent-primary);
}

.save-game-modal__action-button--primary:hover:not(:disabled) {
  background-color: var(--color-accent-primary-hover);
  border-color: var(--color-accent-primary-hover);
}

/* Overwrite Confirmation */
.save-game-modal__overwrite-confirmation {
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

.save-game-modal__overwrite-dialog {
  background-color: var(--color-background-primary);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.save-game-modal__overwrite-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.save-game-modal__overwrite-message {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.save-game-modal__overwrite-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Saving Status */
.save-game-modal__saving-overlay {
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

.save-game-modal__saving-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-on-dark);
}

.save-game-modal__saving-spinner {
  font-size: 3rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.save-game-modal__saving-text {
  font-size: 1.125rem;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive design */
@media (max-width: 768px) {
  .save-game-modal {
    padding: 0.5rem;
  }

  .save-game-modal__dialog {
    max-height: 95vh;
  }

  .save-game-modal__header,
  .save-game-modal__content,
  .save-game-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .save-game-modal__slot {
    flex-direction: column;
    text-align: center;
  }

  .save-game-modal__slot-occupied,
  .save-game-modal__slot-empty {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .save-game-modal__name-actions,
  .save-game-modal__footer {
    flex-direction: column-reverse;
  }

  .save-game-modal__action-button {
    width: 100%;
  }
}
</style>