<template>
  <div
    class="hay-rack"
    :class="fullnessClass"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <span class="hay-rack__emoji">🌾</span>

    <div v-if="hayServings.length > 0" class="hay-rack__contents">
      <span
        v-for="(serving, index) in hayServings"
        :key="`${serving.instanceId}`"
        class="hay-rack__hay-item"
        :class="`hay-rack__hay-item--count-${hayServings.length} hay-rack__hay-item--index-${index}`"
        title="Hay serving (drag to remove)"
        draggable="true"
        @dragstart="handleHayDragStart($event, serving, index)"
        @dragend="handleHayDragEnd"
      >
        🌾
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '../../stores/suppliesStore'

interface HayServing {
  itemId: string
  instanceId: string
}

interface Props {
  hayRackItemId: string
  hayServings: HayServing[]
  capacity: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-hay': [hayItemId: string]
  'remove-hay': [servingIndex: number]
}>()

const suppliesStore = useSuppliesStore()

const isDragOver = ref(false)

const fullnessClass = computed(() => {
  const count = props.hayServings.length
  if (count === 0) return 'hay-rack--empty'
  if (count === 1) return 'hay-rack--quarter'
  if (count === 2) return 'hay-rack--half'
  if (count === 3) return 'hay-rack--three-quarters'
  return 'hay-rack--full'
})

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // Check capacity - show not-allowed cursor if full
  if (props.hayServings.length >= props.capacity) {
    event.dataTransfer!.dropEffect = 'none'
    isDragOver.value = false
    return
  }

  // Check if dragged item is hay by looking for custom MIME type
  const isHay = event.dataTransfer?.types.includes('application/x-item-category-hay')

  if (!isHay) {
    // Not hay - show not-allowed cursor
    event.dataTransfer!.dropEffect = 'none'
    isDragOver.value = false
    return
  }

  // Valid hay item with capacity - allow drop
  isDragOver.value = true
  event.dataTransfer!.dropEffect = 'move'
}

function handleDragLeave(event: DragEvent) {
  event.stopPropagation()
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false

  // Check if we have capacity
  if (props.hayServings.length >= props.capacity) {
    console.warn(`Hay rack is full (${props.capacity} servings max)`)
    return
  }

  // Get the dragged item ID
  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const itemId = data.itemId

    // Validate that this is a hay item
    const item = suppliesStore.getItemById(itemId)
    if (!item || item.category !== 'hay') {
      console.warn(`Cannot add ${item?.name || itemId} to hay rack - only hay is allowed`)
      return
    }

    // Emit event to add hay to rack
    emit('add-hay', itemId)
  } catch (error) {
    console.error('Failed to parse drag data:', error)
  }
}

function handleHayDragStart(event: DragEvent, serving: HayServing, index: number) {
  // Stop propagation to prevent rack from being dragged
  event.stopPropagation()

  const dragData = {
    itemId: serving.itemId,
    hayRackItemId: props.hayRackItemId,
    servingIndex: index,
    isFromHayRack: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'
}

function handleHayDragEnd(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'
}
</script>

<style>
.hay-rack {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  transition: filter 0.3s ease;
}

.hay-rack__emoji {
  font-size: 3rem;
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: filter 0.3s ease;
}

/* Fullness color shifts: white → gold */
.hay-rack--empty .hay-rack__emoji {
  filter: brightness(2) saturate(0);
}

.hay-rack--quarter .hay-rack__emoji {
  filter: brightness(1.6) saturate(0.3);
}

.hay-rack--half .hay-rack__emoji {
  filter: brightness(1.3) saturate(0.6);
}

.hay-rack--three-quarters .hay-rack__emoji {
  filter: brightness(1.1) saturate(0.85);
}

.hay-rack--full .hay-rack__emoji {
  filter: brightness(1) saturate(1);
}

.hay-rack__contents {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  z-index: 2;
  pointer-events: none;
}

.hay-rack__hay-item {
  position: absolute;
  line-height: 1;
  cursor: grab;
  pointer-events: all;
  transition: transform 0.2s ease;
}

.hay-rack__hay-item:hover {
  transform: scale(1.1);
}

.hay-rack__hay-item:active {
  cursor: grabbing;
}

/* 1 hay serving: centered, full size */
.hay-rack__hay-item--count-1 {
  font-size: var(--font-size-xl);
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-1:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

/* 2 hay servings: half size, left and right */
.hay-rack__hay-item--count-2 {
  font-size: var(--font-size-lg);
  inset-block-start: 50%;
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-0 {
  inset-inline-start: 35%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-0:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-1 {
  inset-inline-start: 65%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-1:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

/* 3 hay servings: smaller size, left, center, right */
.hay-rack__hay-item--count-3 {
  font-size: var(--font-size-base);
  inset-block-start: 50%;
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-0 {
  inset-inline-start: 25%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-0:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-1 {
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-1:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-2 {
  inset-inline-start: 75%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-2:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

/* 4 hay servings: smallest size, grid layout */
.hay-rack__hay-item--count-4 {
  font-size: var(--font-size-sm);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-0 {
  inset-inline-start: 30%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-0:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-1 {
  inset-inline-start: 70%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-1:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-2 {
  inset-inline-start: 30%;
  inset-block-start: 60%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-2:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-3 {
  inset-inline-start: 70%;
  inset-block-start: 60%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-3:hover {
  transform: translate(-50%, -50%) scale(1.1);
}
</style>
