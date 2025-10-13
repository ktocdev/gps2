<template>
  <div v-if="isOpen" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog" @click.stop>
      <div class="dialog__header">
        <h3 class="dialog__title">{{ title }}</h3>
      </div>

      <div class="dialog__content">
        <BlockMessage v-if="sessionType === 'mixed'" type="warning">
          <p class="mb-3">
            <strong>Mixed Session Detected:</strong> You have both favorited and non-favorited guinea pigs in this session.
          </p>
          <p class="mb-3">
            <strong>Favorited guinea pigs</strong> ({{ favoritedNames.join(', ') }}) will return safely to your favorites collection.
          </p>
          <p class="mb-3">
            <strong>Non-favorited guinea pigs</strong> ({{ nonFavoritedNames.join(', ') }}) will be permanently rehomed to other families and you won't see them again.
          </p>
          <p>
            Would you like to favorite {{ nonFavoritedNames.join(' & ') }} before ending this session? This will save them to your collection!
          </p>
        </BlockMessage>

        <BlockMessage v-else-if="sessionType === 'all_favorited'" type="success">
          <p>
            All guinea pigs in this session are favorites! They will return safely to your favorites collection.
          </p>
          <p class="mt-2">
            <strong>Cost:</strong> $0 (Free!)
          </p>
        </BlockMessage>

        <BlockMessage v-else-if="sessionType === 'none_favorited'" type="danger">
          <p class="mb-3">
            <strong>Warning:</strong> None of the guinea pigs in this session are favorited.
          </p>
          <p class="mb-3">
            <strong>{{ guineaPigNames.join(' & ') }}</strong> will be permanently rehomed to other families and you won't see them again.
          </p>
          <p>
            <strong>Cost:</strong> $100 rescue fee
          </p>
          <p class="mt-3 text-label--muted">
            Consider favoriting guinea pigs during your session to build your collection and avoid rescue fees!
          </p>
        </BlockMessage>
      </div>

      <div class="dialog__actions">
        <Button
          v-if="sessionType === 'mixed'"
          variant="primary"
          @click="handleFavoriteNonFavorites"
        >
          Favorite {{ nonFavoritedNames.join(' & ') }} First
        </Button>

        <Button
          :variant="sessionType === 'none_favorited' ? 'danger' : 'secondary'"
          @click="handleConfirmEnd"
        >
          {{ confirmButtonText }}
        </Button>

        <Button
          variant="tertiary"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BlockMessage from '../basic/BlockMessage.vue'
import Button from '../basic/Button.vue'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { useGuineaPigStore } from '../../stores/guineaPigStore'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  favoriteNonFavorites: []
}>()

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()

const sessionType = computed(() => {
  if (!petStoreManager.activeGameSession) return 'none_favorited'

  const { guineaPigIds, wasFromFavorites } = petStoreManager.activeGameSession
  const favoriteCount = guineaPigIds.filter(id => wasFromFavorites[id]).length
  const nonFavoriteCount = guineaPigIds.length - favoriteCount

  if (nonFavoriteCount === 0) return 'all_favorited'
  if (favoriteCount === 0) return 'none_favorited'
  return 'mixed'
})

const guineaPigNames = computed(() => {
  if (!petStoreManager.activeGameSession) return []
  return petStoreManager.activeGameSession.guineaPigIds.map(id => {
    const gp = guineaPigStore.getGuineaPig(id)
    return gp?.name || 'Unknown'
  })
})

const favoritedNames = computed(() => {
  if (!petStoreManager.activeGameSession) return []
  const { guineaPigIds, wasFromFavorites } = petStoreManager.activeGameSession
  return guineaPigIds
    .filter(id => wasFromFavorites[id])
    .map(id => {
      const gp = guineaPigStore.getGuineaPig(id)
      return gp?.name || 'Unknown'
    })
})

const nonFavoritedNames = computed(() => {
  if (!petStoreManager.activeGameSession) return []
  const { guineaPigIds, wasFromFavorites } = petStoreManager.activeGameSession
  return guineaPigIds
    .filter(id => !wasFromFavorites[id])
    .map(id => {
      const gp = guineaPigStore.getGuineaPig(id)
      return gp?.name || 'Unknown'
    })
})

const title = computed(() => {
  if (sessionType.value === 'mixed') return 'End Session - Action Required'
  if (sessionType.value === 'all_favorited') return 'End Session - All Favorites'
  return 'End Session - Warning'
})

const confirmButtonText = computed(() => {
  if (sessionType.value === 'mixed') return 'End Without Favoriting ($50)'
  if (sessionType.value === 'all_favorited') return 'End Session (Free)'
  return 'End Session & Rehome ($100)'
})

function handleOverlayClick() {
  emit('cancel')
}

function handleConfirmEnd() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

function handleFavoriteNonFavorites() {
  emit('favoriteNonFavorites')
}
</script>

<style>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.dialog {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--color-border);
  max-inline-size: 600px;
  inline-size: 100%;
  max-block-size: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dialog__header {
  padding: var(--spacing-4);
  border-block-end: 1px solid var(--color-border);
}

.dialog__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog__content {
  padding: var(--spacing-4);
}

.dialog__actions {
  padding: var(--spacing-4);
  border-block-start: 1px solid var(--color-border);
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .dialog__actions {
    flex-direction: column;
  }

  .dialog__actions button {
    inline-size: 100%;
  }
}
</style>
