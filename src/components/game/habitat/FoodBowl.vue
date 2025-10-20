<template>
  <div class="food-bowl" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
    <span class="food-bowl__emoji">{{ bowlEmoji }}</span>

    <div v-if="foods.length > 0" class="food-bowl__contents">
      <span
        v-for="(food, index) in foods"
        :key="`${food.itemId}-${index}`"
        class="food-bowl__food-item"
        :class="`food-bowl__food-item--count-${foods.length} food-bowl__food-item--index-${index}`"
        :title="`${food.name}\nServing ${index + 1} of ${foods.length}`"
      >
        {{ food.emoji }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FoodItem {
  itemId: string
  emoji: string
  name: string
}

interface Props {
  bowlItemId: string
  bowlEmoji: string
  capacity: number
  foods: FoodItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-food': [foodItemId: string]
}>()

const isDragOver = ref(false)

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // Only show drop target if dragging food and bowl has capacity
  if (props.foods.length < props.capacity) {
    isDragOver.value = true
    event.dataTransfer!.dropEffect = 'move'
  } else {
    event.dataTransfer!.dropEffect = 'none'
  }
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
  if (props.foods.length >= props.capacity) {
    console.warn(`Bowl is full (${props.capacity} items max)`)
    return
  }

  // Get the dragged food item ID
  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const foodItemId = data.itemId

    // Emit event to add food to bowl
    emit('add-food', foodItemId)
  } catch (error) {
    console.error('Failed to parse drag data:', error)
  }
}
</script>

<style>
.food-bowl {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
}

.food-bowl__emoji {
  font-size: 3rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.food-bowl__contents {
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

.food-bowl__food-item {
  position: absolute;
  line-height: 1;
  pointer-events: all;
  cursor: help;
  transition: filter 0.2s ease;
}

.food-bowl__food-item:hover {
  filter: brightness(1.2);
}

/* 1 food item: centered, full size */
.food-bowl__food-item--count-1 {
  font-size: var(--font-size-xl);
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

/* 2 food items: half size, left and right */
.food-bowl__food-item--count-2 {
  font-size: var(--font-size-lg);
  inset-block-start: 50%;
}

.food-bowl__food-item--count-2.food-bowl__food-item--index-0 {
  inset-inline-start: 30%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-2.food-bowl__food-item--index-1 {
  inset-inline-start: 70%;
  transform: translate(-50%, -50%);
}

/* 3 food items: smaller size, left, center, right */
.food-bowl__food-item--count-3 {
  font-size: var(--font-size-base);
  inset-block-start: 50%;
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-0 {
  inset-inline-start: 25%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-1 {
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-2 {
  inset-inline-start: 75%;
  transform: translate(-50%, -50%);
}
</style>
