<template>
  <div class="habitat-visual">
    <div class="habitat-visual__header">
      <h3>Habitat Layout ({{ habitatSize }} - {{ gridWidth }}x{{ gridHeight }})</h3>
      <div class="habitat-visual__stats">
        <span>{{ placedItemsCount }} items placed</span>
        <span>{{ occupiedCells }}/{{ totalCells }} cells occupied</span>
        <span v-if="poopCount > 0">💩 {{ poopCount }} poops</span>
      </div>
    </div>

    <div class="habitat-visual__container">
      <div
        class="habitat-visual__grid"
        :style="gridStyle"
      >
        <div
          v-for="cell in gridCells"
          :key="`cell-${cell.x}-${cell.y}`"
          class="grid-cell"
          :class="{
            'grid-cell--occupied': cell.occupied,
            'grid-cell--accessible': cell.accessible,
            'grid-cell--drop-target': isDragOver && isHoverCell(cell) && canPlaceAt(cell.x, cell.y),
            'grid-cell--drop-invalid': isDragOver && isHoverCell(cell) && !canPlaceAt(cell.x, cell.y)
          }"
          :style="{
            gridColumn: cell.x + 1,
            gridRow: cell.y + 1
          }"
          @dragover.prevent="handleDragOver($event, cell)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, cell)"
        />

        <div
          v-for="item in sortedPlacedItems"
          :key="item.instanceId"
          class="grid-item"
          :class="{
            'grid-item--dragging': draggedPlacedItemId === item.itemId
          }"
          :style="{
            gridColumn: `${item.position.x + 1} / span ${item.size.width}`,
            gridRow: `${item.position.y + 1} / span ${item.size.height}`,
            zIndex: item.zIndex
          }"
          draggable="true"
          @dragstart="handlePlacedItemDragStart($event, item)"
          @dragend="handlePlacedItemDragEnd"
          @click="selectItem(item.instanceId)"
        >
          <span class="grid-item__emoji">{{ item.emoji }}</span>
          <span class="grid-item__name">{{ item.name }}</span>

          <span v-if="getStackCount(item.position) > 1" class="grid-item__stack">
            ×{{ getStackCount(item.position) }}
          </span>
        </div>
      </div>

      <div
        v-if="subgridItems.length > 0"
        class="habitat-visual__subgrid"
        :style="subgridStyle"
      >
        <div
          v-for="item in subgridItems"
          :key="item.id"
          class="subgrid-item"
          :class="`subgrid-item--${item.type}`"
          :style="{
            gridColumn: `${item.position.x + 1}`,
            gridRow: `${item.position.y + 1}`
          }"
          @click="handleSubgridItemClick(item)"
        >
          {{ getSubgridEmoji(item.type) }}
        </div>
      </div>

      <div class="habitat-visual__guinea-pigs">
        <!-- Guinea pigs will be rendered here in Phase 3 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useSuppliesStore } from '../../stores/suppliesStore'
import type { SuppliesItem } from '../../types/supplies'

interface Props {
  habitatSize?: 'small' | 'medium' | 'large'
  showGrid?: boolean
  readOnly?: boolean
  highlightCells?: boolean
  showSubgrid?: boolean
}

interface GridCell {
  x: number
  y: number
  occupied: boolean
  itemId: string | null
  accessible: boolean
}

interface SubgridItem {
  id: string
  type: 'poop' | 'hay' | 'crumb' | 'footprint'
  position: { x: number; y: number }
  timestamp: number
}

const props = withDefaults(defineProps<Props>(), {
  habitatSize: 'medium',
  showGrid: true,
  readOnly: false,
  highlightCells: true,
  showSubgrid: false
})

const habitatConditions = useHabitatConditions()
const suppliesStore = useSuppliesStore()

const HABITAT_SIZES = {
  small: { width: 10, height: 8, cellSize: 60 },
  medium: { width: 14, height: 10, cellSize: 60 },
  large: { width: 18, height: 12, cellSize: 60 }
}

const gridWidth = computed(() => HABITAT_SIZES[props.habitatSize].width)
const gridHeight = computed(() => HABITAT_SIZES[props.habitatSize].height)
const cellSize = computed(() => HABITAT_SIZES[props.habitatSize].cellSize)
const totalCells = computed(() => gridWidth.value * gridHeight.value)

const subgridWidth = computed(() => gridWidth.value * 4)
const subgridHeight = computed(() => gridHeight.value * 4)
const subcellSize = computed(() => cellSize.value / 4)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridWidth.value}, ${cellSize.value}px)`,
  gridTemplateRows: `repeat(${gridHeight.value}, ${cellSize.value}px)`
}))

const subgridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${subgridWidth.value}, ${subcellSize.value}px)`,
  gridTemplateRows: `repeat(${subgridHeight.value}, ${subcellSize.value}px)`
}))

const gridCells = ref<GridCell[]>([])
const subgridItems = ref<SubgridItem[]>([])
const poopCount = computed(() => subgridItems.value.filter(i => i.type === 'poop').length)

// Drag-and-drop state
const isDragOver = ref(false)
const draggedItemId = ref<string | null>(null)
const draggedItemSize = ref<{ width: number; height: number }>({ width: 1, height: 1 })
const hoverCell = ref<{ x: number; y: number } | null>(null)
const draggedPlacedItemId = ref<string | null>(null)
const isRepositioning = ref(false)

function initializeGrid() {
  gridCells.value = []
  for (let y = 0; y < gridHeight.value; y++) {
    for (let x = 0; x < gridWidth.value; x++) {
      gridCells.value.push({
        x,
        y,
        occupied: false,
        itemId: null,
        accessible: true
      })
    }
  }
}

function getItemSize(item: SuppliesItem | undefined): { width: number; height: number } {
  if (!item) return { width: 1, height: 1 }

  const size = item.stats?.size
  if (size === 'small') return { width: 1, height: 1 }
  if (size === 'medium') return { width: 2, height: 1 }
  if (size === 'large') return { width: 2, height: 2 }

  return { width: 1, height: 1 }
}

const placedItems = computed(() => {
  return habitatConditions.habitatItems.map((itemId, index) => {
    const item = suppliesStore.getItemById(itemId)
    const size = getItemSize(item)

    // Get stored position or default to auto-layout
    const storedPosition = habitatConditions.itemPositions.get(itemId)
    const position = storedPosition || {
      x: (index * 2) % gridWidth.value,
      y: Math.floor((index * 2) / gridWidth.value)
    }

    return {
      itemId,
      instanceId: `${itemId}-${index}`,
      position,
      size,
      zIndex: 0,
      name: item?.name || 'Unknown',
      emoji: item?.emoji || '📦'
    }
  })
})

const sortedPlacedItems = computed(() => {
  return [...placedItems.value].sort((a, b) => a.zIndex - b.zIndex)
})

const placedItemsCount = computed(() => placedItems.value.length)

const occupiedCells = computed(() => {
  return gridCells.value.filter(cell => cell.occupied).length
})

function updateGridCells() {
  gridCells.value.forEach(cell => {
    cell.occupied = false
    cell.itemId = null
  })

  placedItems.value.forEach(item => {
    const { x, y } = item.position
    const { width, height } = item.size

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const targetX = x + dx
        const targetY = y + dy

        if (targetX < gridWidth.value && targetY < gridHeight.value) {
          const cellIndex = targetY * gridWidth.value + targetX
          if (cellIndex < gridCells.value.length) {
            gridCells.value[cellIndex].occupied = true
            gridCells.value[cellIndex].itemId = item.itemId
          }
        }
      }
    }
  })
}

function getStackCount(position: { x: number; y: number }): number {
  return placedItems.value.filter(
    item => item.position.x === position.x && item.position.y === position.y
  ).length
}

function selectItem(instanceId: string) {
  console.log('Selected item:', instanceId)
}

function addTestPoop() {
  const randomX = Math.floor(Math.random() * subgridWidth.value)
  const randomY = Math.floor(Math.random() * subgridHeight.value)

  subgridItems.value.push({
    id: `poop-${Date.now()}-${Math.random()}`,
    type: 'poop',
    position: { x: randomX, y: randomY },
    timestamp: Date.now()
  })
}

function clearAllPoop() {
  subgridItems.value = subgridItems.value.filter(item => item.type !== 'poop')
}

function handleSubgridItemClick(item: SubgridItem) {
  if (item.type === 'poop') {
    const index = subgridItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      subgridItems.value.splice(index, 1)
    }
  }
}

function getSubgridEmoji(type: string): string {
  switch (type) {
    case 'poop': return '💩'
    case 'hay': return '🌾'
    case 'crumb': return '🟤'
    case 'footprint': return '👣'
    default: return '·'
  }
}

// Methods to be called from parent
function setDraggedItem(itemId: string, size: { width: number; height: number }) {
  draggedItemId.value = itemId
  draggedItemSize.value = size
}

function clearDraggedItem() {
  draggedItemId.value = null
  draggedItemSize.value = { width: 1, height: 1 }
  isDragOver.value = false
  hoverCell.value = null
}

// Handlers for dragging placed items
function handlePlacedItemDragStart(event: DragEvent, item: any) {
  if (props.readOnly) return

  draggedPlacedItemId.value = item.itemId
  draggedItemId.value = item.itemId
  draggedItemSize.value = item.size
  isRepositioning.value = true

  const dragData = {
    itemId: item.itemId,
    size: item.size,
    isRepositioning: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'
}

function handlePlacedItemDragEnd(event: DragEvent) {
  draggedPlacedItemId.value = null
  isRepositioning.value = false

  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'
}

// Drag-and-drop handlers
function handleDragOver(event: DragEvent, cell: GridCell) {
  if (props.readOnly) return

  event.preventDefault()
  isDragOver.value = true
  hoverCell.value = { x: cell.x, y: cell.y }

  // Set drop effect based on validity
  if (canPlaceAt(cell.x, cell.y)) {
    event.dataTransfer!.dropEffect = 'move'
  } else {
    event.dataTransfer!.dropEffect = 'none'
  }
}

function handleDragLeave() {
  isDragOver.value = false
  hoverCell.value = null
}

function handleDrop(event: DragEvent, cell: GridCell) {
  if (props.readOnly) return

  event.preventDefault()
  isDragOver.value = false
  hoverCell.value = null

  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  let itemId: string
  let isRepos = false
  try {
    const data = JSON.parse(itemData)
    itemId = data.itemId
    isRepos = data.isRepositioning || false
  } catch {
    itemId = itemData
  }

  if (!canPlaceAt(cell.x, cell.y)) {
    console.warn('Cannot place item at this location')
    return
  }

  if (isRepos) {
    // Repositioning existing item
    repositionItemAt(itemId, cell.x, cell.y)
  } else {
    // Adding new item from inventory
    placeItemAt(itemId, cell.x, cell.y)
  }

  // Reset drag state
  draggedItemId.value = null
  draggedItemSize.value = { width: 1, height: 1 }
  draggedPlacedItemId.value = null
  isRepositioning.value = false
}

function isHoverCell(cell: GridCell): boolean {
  if (!hoverCell.value) return false
  return cell.x === hoverCell.value.x && cell.y === hoverCell.value.y
}

function canPlaceAt(x: number, y: number): boolean {
  if (!draggedItemId.value) return false

  const size = draggedItemSize.value

  // Check bounds
  if (x + size.width > gridWidth.value || y + size.height > gridHeight.value) {
    return false
  }

  // Water bottles can only be on edges (left, right, top, or bottom)
  if (draggedItemId.value.includes('water_bottle')) {
    const isLeftEdge = x === 0
    const isRightEdge = x === gridWidth.value - size.width
    const isTopEdge = y === 0
    const isBottomEdge = y === gridHeight.value - size.height

    if (!isLeftEdge && !isRightEdge && !isTopEdge && !isBottomEdge) {
      return false
    }
  }

  // With stacking anarchy, we allow placement anywhere within bounds
  // No collision detection needed for Phase 2
  return true
}

function placeItemAt(itemId: string, x: number, y: number) {
  // Add item to habitat from inventory with position
  const success = habitatConditions.addItemToHabitat(itemId, { x, y })

  if (success) {
    console.log(`Placed ${itemId} at (${x}, ${y})`)
    updateGridCells()
  } else {
    console.warn(`Failed to place ${itemId} at (${x}, ${y})`)
  }
}

function repositionItemAt(itemId: string, x: number, y: number) {
  // Update the position of an already-placed item
  habitatConditions.itemPositions.set(itemId, { x, y })
  console.log(`Repositioned ${itemId} to (${x}, ${y})`)
  updateGridCells()
}

onMounted(() => {
  // Initialize supplies catalog if not already loaded
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }

  initializeGrid()
  updateGridCells()
})

watch(
  () => habitatConditions.habitatItems,
  () => updateGridCells(),
  { deep: true }
)

// Expose functions for parent component
defineExpose({
  addTestPoop,
  clearAllPoop,
  poopCount,
  setDraggedItem,
  clearDraggedItem
})
</script>

<style>
.habitat-visual {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.habitat-visual__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.habitat-visual__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.habitat-visual__stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.habitat-visual__container {
  position: relative;
  inline-size: fit-content;
  margin-inline: auto;
}

.habitat-visual__grid {
  display: grid;
  gap: 1px;
  background: linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%);
  border: 3px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  box-shadow: var(--shadow-lg);
}

.grid-cell {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(160, 82, 45, 0.2);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all 0.2s ease;
}

.grid-cell--occupied {
  background: rgba(255, 255, 255, 0.5);
}

.grid-cell--accessible {
  cursor: default;
}

.grid-cell--drop-target {
  background: rgba(16, 185, 129, 0.3);
  border-color: var(--color-success);
  border-width: 2px;
  box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.3);
}

.grid-cell--drop-invalid {
  background: rgba(239, 68, 68, 0.3);
  border-color: var(--color-error);
  border-width: 2px;
  cursor: not-allowed;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.grid-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.grid-item:active {
  cursor: grabbing;
}

.grid-item--dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.grid-item__emoji {
  font-size: var(--font-size-2xl);
  line-height: 1;
}

.grid-item__name {
  font-size: var(--font-size-xs);
  text-align: center;
  font-weight: var(--font-weight-medium);
  max-inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-item__stack {
  position: absolute;
  inset-block-start: var(--space-1);
  inset-inline-end: var(--space-1);
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  line-height: 1;
}

.habitat-visual__subgrid {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  display: grid;
  pointer-events: none;
}

.subgrid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  pointer-events: all;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.subgrid-item:hover {
  transform: scale(1.3);
}

.subgrid-item--poop {
  opacity: 0.9;
}

.habitat-visual__guinea-pigs {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}
</style>
