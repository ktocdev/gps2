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
            'grid-cell--drop-target': isDragOver && isHoverCell(cell) && (draggedItemId ? canPlaceAt(cell.x, cell.y) : true),
            'grid-cell--drop-invalid': isDragOver && isHoverCell(cell) && draggedItemId && !canPlaceAt(cell.x, cell.y)
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
          :draggable="canDragItem(item)"
          :title="getBowlLockTooltip(item)"
          @dragstart="handlePlacedItemDragStart($event, item)"
          @dragend="handlePlacedItemDragEnd"
          @click="selectItem(item.instanceId)"
        >
          <FoodBowl
            v-if="isBowl(item.itemId)"
            :bowl-item-id="item.itemId"
            :bowl-emoji="item.emoji"
            :capacity="getBowlCapacity(item.itemId)"
            :foods="getBowlContents(item.itemId)"
            @add-food="(foodId) => handleAddFoodToBowl(item.itemId, foodId)"
          />
          <HayRack
            v-else-if="isHayRack(item.itemId)"
            :hay-rack-item-id="item.itemId"
            :hay-servings="getHayRackContents(item.itemId)"
            :freshness="getHayRackFreshness(item.itemId)"
            :capacity="4"
            @add-hay="(hayId) => handleAddHayToRack(item.itemId, hayId)"
          />
          <WaterBottle
            v-else-if="isWaterBottle(item.itemId)"
            :water-level="habitatConditions.waterLevel"
            :bottle-emoji="item.emoji"
          />
          <span
            v-else
            class="grid-item__emoji"
          >
            {{ item.emoji }}
          </span>

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
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import type { SuppliesItem } from '../../../types/supplies'
import FoodBowl from './FoodBowl.vue'
import HayRack from './HayRack.vue'
import WaterBottle from './WaterBottle.vue'

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

// Sync poops from habitat conditions store
const subgridItems = computed(() => {
  const items: SubgridItem[] = []

  // Add poops from store
  habitatConditions.poops.forEach(poop => {
    // Convert grid coordinates to subgrid coordinates (x4 scale)
    items.push({
      id: poop.id,
      type: 'poop',
      position: { x: poop.x, y: poop.y },
      timestamp: poop.timestamp
    })
  })

  return items
})

const poopCount = computed(() => habitatConditions.poops.length)

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

  habitatConditions.addPoop(randomX, randomY)
}

function clearAllPoop() {
  // Remove all poops by cleaning the cage
  habitatConditions.cleanCage()
}

function handleSubgridItemClick(item: SubgridItem) {
  if (item.type === 'poop') {
    habitatConditions.removePoop(item.id)
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

  // For food items dragged from bowls, we need to set draggedItemId
  // so canPlaceAt() doesn't reject them
  const itemData = event.dataTransfer?.types.includes('text/plain')
  if (itemData && !draggedItemId.value) {
    try {
      // Try to peek at the drag data to set draggedItemId for validation
      // Note: getData() only works in drop event, but we can check types
      // For now, allow all drops when draggedItemId is not set (food from bowls)
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Set drop effect based on validity
  // Allow drops for food items from bowls (when draggedItemId is not set)
  const isValidDrop = draggedItemId.value ? canPlaceAt(cell.x, cell.y) : true

  if (isValidDrop) {
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

  // If dropping food on a bowl, add it to the bowl
  if (isFood(itemId) && !isRepos) {
    // Find bowl that covers this cell position
    const bowlAtPosition = placedItems.value.find(item => {
      if (!isBowl(item.itemId)) return false

      // Check if the drop cell is within the bowl's occupied area
      const isWithinBowlX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
      const isWithinBowlY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

      return isWithinBowlX && isWithinBowlY
    })

    if (bowlAtPosition) {
      // Add food to bowl
      handleAddFoodToBowl(bowlAtPosition.itemId, itemId)

      // Reset drag state
      draggedItemId.value = null
      draggedItemSize.value = { width: 1, height: 1 }
      return
    }
  }

  // If dropping hay on a hay rack, add it to the rack
  if (isHay(itemId) && !isRepos) {
    // Find hay rack that covers this cell position
    const hayRackAtPosition = placedItems.value.find(item => {
      if (!isHayRack(item.itemId)) return false

      // Check if the drop cell is within the hay rack's occupied area
      const isWithinRackX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
      const isWithinRackY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

      return isWithinRackX && isWithinRackY
    })

    if (hayRackAtPosition) {
      // Add hay to rack
      handleAddHayToRack(hayRackAtPosition.itemId, itemId)

      // Reset drag state
      draggedItemId.value = null
      draggedItemSize.value = { width: 1, height: 1 }
      return
    }
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

  // Food items can only be placed in bowls (not directly on habitat floor)
  if (isFood(draggedItemId.value)) {
    // Check if there's a bowl at this position
    const bowlAtPosition = placedItems.value.find(item => {
      if (!isBowl(item.itemId)) return false

      // Check if the hover cell (x, y) is within the bowl's occupied area
      const isWithinBowlX = x >= item.position.x && x < item.position.x + item.size.width
      const isWithinBowlY = y >= item.position.y && y < item.position.y + item.size.height

      return isWithinBowlX && isWithinBowlY
    })
    return bowlAtPosition !== undefined
  }

  // Hay items can only be placed in hay racks (not directly on habitat floor)
  if (isHay(draggedItemId.value)) {
    // Check if there's a hay rack at this position
    const hayRackAtPosition = placedItems.value.find(item => {
      if (!isHayRack(item.itemId)) return false

      // Check if the hover cell (x, y) is within the hay rack's occupied area
      const isWithinRackX = x >= item.position.x && x < item.position.x + item.size.width
      const isWithinRackY = y >= item.position.y && y < item.position.y + item.size.height

      return isWithinRackX && isWithinRackY
    })
    return hayRackAtPosition !== undefined
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

// Bowl helper functions
function isBowl(itemId: string): boolean {
  return itemId.includes('bowl') || itemId.includes('dish')
}

function isFood(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'food'
}

function getBowlCapacity(itemId: string): number {
  const item = suppliesStore.getItemById(itemId)
  return item?.stats?.foodCapacity || 2
}

function getBowlContents(itemId: string) {
  return habitatConditions.getBowlContents(itemId)
}

function canDragItem(_item: any): boolean {
  // All items can be dragged (bowls and hay racks can be moved even with contents)
  return true
}

function getBowlLockTooltip(item: any): string {
  // Show helpful metadata tooltips
  if (isBowl(item.itemId)) {
    const contents = getBowlContents(item.itemId)
    const capacity = getBowlCapacity(item.itemId)
    if (contents.length > 0) {
      const foodNames = contents.map((f: any) => f.name).join(', ')
      return `${item.name}\nContents: ${foodNames}\nCapacity: ${contents.length}/${capacity}`
    }
    return `${item.name}\nEmpty bowl\nCapacity: ${capacity} servings`
  }
  if (isHayRack(item.itemId)) {
    const contents = getHayRackContents(item.itemId)
    const freshness = getHayRackFreshness(item.itemId)
    if (contents.length > 0) {
      return `${item.name}\nHay servings: ${contents.length}/4\nFreshness: ${freshness.toFixed(0)}%`
    }
    return `${item.name}\nEmpty hay rack\nCapacity: 4 servings`
  }
  return item.name
}

function handleAddFoodToBowl(bowlItemId: string, foodItemId: string) {
  const success = habitatConditions.addFoodToBowl(bowlItemId, foodItemId)
  if (success) {
    console.log(`Added food ${foodItemId} to bowl ${bowlItemId}`)
  }
}

// Hay rack helper functions
function isHayRack(itemId: string): boolean {
  return itemId.includes('hay_rack')
}

function isHay(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'hay'
}

function getHayRackContents(itemId: string) {
  return habitatConditions.getHayRackContents(itemId)
}

function getHayRackFreshness(itemId: string): number {
  return habitatConditions.getHayRackFreshness(itemId)
}

function handleAddHayToRack(hayRackItemId: string, hayItemId: string) {
  const success = habitatConditions.addHayToRack(hayRackItemId, hayItemId)
  if (success) {
    console.log(`Added hay ${hayItemId} to rack ${hayRackItemId}`)
  }
}

// Water bottle helper function
function isWaterBottle(itemId: string): boolean {
  return itemId.includes('water_bottle')
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

.grid-item__emoji--bowl {
  font-size: 3rem;
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
