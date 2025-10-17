# System 14: Habitat UI & Item System - Implementation Plan

**Phase:** 3.14 - Habitat & Environment
**Created:** October 16, 2025
**Status:** Planning Phase 📋

## Overview

Visual habitat interface with drag-and-drop item placement, creating an interactive environment where players can arrange items and see their guinea pigs interact with them in real-time.

**Design Philosophy:**
- **Prioritize experience over full mobile support** - Larger grids and items for better visual clarity
- **Desktop-first approach** - Optimized for larger screens, tablet/mobile as secondary
- **Subgrid system** - Support poop placement, hay particles, and small items without strict grid alignment
- **Stacking anarchy** - Allow any items to stack freely (to start)

## Implementation Approach

This system will be built in **3 phases**:
1. **Phase 1: Visual Habitat Grid** - Basic grid layout with item display (no drag-and-drop yet)
2. **Phase 2: Drag-and-Drop** - Interactive item placement from inventory to habitat
3. **Phase 3: Guinea Pig Integration** - Show guinea pigs in habitat interacting with items

## Habitat Sizes

### Three Habitat Sizes

**Maximum Capacity:** 2 guinea pigs per habitat (game limit)

**Habitat Assignment on Adoption:**
- **1 guinea pig adopted:** Start with Small habitat
- **2 guinea pigs adopted:** Start with Medium habitat
- **Upgrade system:** Player can upgrade habitat once milestone is reached (TBD)

**Small Habitat (Cozy)**
- **Grid:** 10x8 cells (80 total cells)
- **Aspect Ratio:** 5:4
- **Purpose:** Starter habitat for 1 guinea pig (can fit 2 if needed)
- **Visual size:** ~800px x 640px (desktop)
- **Item capacity:** ~6-10 items comfortably

**Medium Habitat (Comfortable)**
- **Grid:** 14x10 cells (140 total cells)
- **Aspect Ratio:** 7:5
- **Purpose:** Starter habitat for 2 guinea pigs with good space
- **Visual size:** ~1120px x 800px (desktop)
- **Item capacity:** ~12-18 items comfortably

**Large Habitat (Spacious)**
- **Grid:** 18x12 cells (216 total cells)
- **Aspect Ratio:** 3:2
- **Purpose:** Premium upgrade for 1-2 guinea pigs with extensive enrichment
- **Visual size:** ~1440px x 960px (desktop)
- **Item capacity:** ~20-30 items comfortably

### Cell Size
- **Base cell size:** 80px x 80px (larger for better visibility)
- **Minimum cell size:** 60px x 60px (on smaller screens if needed)
- Items scale proportionally with cell size

## Subgrid System

### Dual-Layer Grid Architecture

**Main Grid (Item Placement)**
- Primary grid for placing habitat items (bowls, hideaways, toys, etc.)
- Items snap to grid cells
- Collision detection on main grid
- Example: 14x10 cells for medium habitat

**Subgrid (Poop & Particles)**
- Each main grid cell divided into 4x4 subgrid cells (16 subcells per main cell)
- **Small habitat:** 40x32 subcells (1,280 total)
- **Medium habitat:** 56x40 subcells (2,240 total)
- **Large habitat:** 72x48 subcells (3,456 total)
- Used for:
  - **Poop placement** - Random positions within habitat
  - **Hay particles** - Scattered hay around hay rack
  - **Food crumbs** - Small debris near food bowls
  - **Small decorative elements** - Footprints, bedding texture details

**Example Subgrid Positioning:**
```typescript
// Main grid: 14x10 cells (medium habitat)
// Subgrid: 56x40 subcells (14*4 x 10*4)

interface SubgridPosition {
  x: number  // 0-55 (56 subcells wide for medium)
  y: number  // 0-39 (40 subcells tall for medium)
}

interface MainGridPosition {
  x: number  // 0-13 (14 cells wide for medium)
  y: number  // 0-9 (10 cells tall for medium)
}

// Convert main grid to subgrid
function mainToSubgrid(mainPos: MainGridPosition): SubgridPosition {
  return {
    x: mainPos.x * 4,  // Each main cell = 4 subcells
    y: mainPos.y * 4
  }
}

// Place poop at random subgrid position (medium habitat)
function placePoopRandomly() {
  const subgridX = Math.floor(Math.random() * 56)  // 0-55
  const subgridY = Math.floor(Math.random() * 40)  // 0-39
  return { x: subgridX, y: subgridY }
}
```

### Subgrid Rendering

**CSS Grid Approach:**
```css
/* Main habitat grid (medium size shown) */
.habitat-visual__grid {
  display: grid;
  grid-template-columns: repeat(14, 80px);  /* Medium habitat: 14 columns */
  grid-template-rows: repeat(10, 80px);      /* Medium habitat: 10 rows */
  position: relative;
}

/* Subgrid layer (absolute positioned overlay) */
.habitat-visual__subgrid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(56, 20px);  /* 14 * 4 = 56 subcells */
  grid-template-rows: repeat(40, 20px);      /* 10 * 4 = 40 subcells */
  pointer-events: none;  /* Don't interfere with main grid interactions */
}

/* Poop item on subgrid */
.subgrid-item--poop {
  grid-column: span 1;  /* Takes 1 subcell */
  grid-row: span 1;
  font-size: 12px;  /* Smaller emoji */
  pointer-events: all;  /* Can click to clean */
}
```

**Template Structure:**
```vue
<div class="habitat-visual">
  <!-- Main Grid (Items) -->
  <div class="habitat-visual__grid">
    <div v-for="cell in mainGridCells" :key="`main-${cell.x}-${cell.y}`" class="grid-cell">
      <!-- Item rendering -->
    </div>
  </div>

  <!-- Subgrid Layer (Poop & Particles) -->
  <div class="habitat-visual__subgrid">
    <div
      v-for="poop in poopItems"
      :key="poop.id"
      class="subgrid-item subgrid-item--poop"
      :style="{
        gridColumn: `${poop.x + 1}`,
        gridRow: `${poop.y + 1}`
      }"
      @click="cleanPoop(poop.id)"
    >
      💩
    </div>

    <div
      v-for="hay in hayParticles"
      :key="hay.id"
      class="subgrid-item subgrid-item--hay"
      :style="{
        gridColumn: `${hay.x + 1}`,
        gridRow: `${hay.y + 1}`
      }"
    >
      🌾
    </div>
  </div>

  <!-- Guinea Pig Layer (absolute positioned) -->
  <div class="habitat-visual__guinea-pigs">
    <!-- Guinea pig sprites with smooth movement -->
  </div>
</div>
```

## Item Stacking System

### Stacking Anarchy (Initial Implementation)

**Philosophy:** Start simple - allow ANY items to stack on the same grid cell(s) without restrictions.

**Benefits:**
- Faster initial implementation
- Player freedom and creativity
- Discover natural stacking patterns through play
- Can add rules later based on player behavior

**Stacking Rules (Phase 1 - Anarchy):**
- ✅ **Any item can stack on any item** (no restrictions)
- ✅ **Unlimited stack height** (stack as many as you want)
- ✅ **Visual layering** using CSS z-index
- ✅ **Click-through** to select items in stack
- ✅ **Stack indicator** shows number of items at position

**Data Structure:**
```typescript
interface PlacedItem {
  itemId: string
  instanceId: string
  position: { x: number, y: number }
  zIndex: number  // Stacking order (higher = on top)
  size: { width: number, height: number }
}

// Multiple items can have same position with different zIndex
const placedItems = ref<PlacedItem[]>([
  { itemId: 'habitat_igloo', instanceId: 'igloo-1', position: { x: 5, y: 5 }, zIndex: 0, size: { width: 2, height: 1 } },
  { itemId: 'habitat_fleece_bed', instanceId: 'bed-1', position: { x: 5, y: 5 }, zIndex: 1, size: { width: 2, height: 1 } },  // Stacked on igloo
  { itemId: 'habitat_bowl', instanceId: 'bowl-1', position: { x: 5, y: 5 }, zIndex: 2, size: { width: 1, height: 1 } }  // On top of stack
])
```

**Stacking Visual Feedback:**
```vue
<!-- Items at same position render with z-index -->
<div
  v-for="item in placedItems"
  :key="item.instanceId"
  class="grid-item"
  :style="{
    gridColumn: `${item.position.x + 1} / span ${item.size.width}`,
    gridRow: `${item.position.y + 1} / span ${item.size.height}`,
    zIndex: item.zIndex
  }"
>
  <span class="grid-item__emoji">{{ getItemEmoji(item.itemId) }}</span>
  <span class="grid-item__name">{{ getItemName(item.itemId) }}</span>

  <!-- Stack indicator (show if multiple items at this position) -->
  <span v-if="getStackCount(item.position) > 1" class="grid-item__stack-count">
    ×{{ getStackCount(item.position) }}
  </span>
</div>
```

**Stacking Interactions:**
- **Drop on occupied cell:** Item stacks on top (highest zIndex + 1)
- **Click stacked item:** Select top item (can cycle through stack)
- **Remove item:** Other items in stack remain
- **Move item:** Only selected item moves, stack below stays

### Future Stacking Rules (Post-Anarchy)

Once we observe player behavior, we can add logical rules:

**Logical Stacking (Future):**
- Water bottles can stack on hay racks ❌ (makes no sense)
- Bowls can be placed on platforms ✅
- Beds can be placed inside shelters ✅
- Tunnels cannot stack ❌
- Hay rack must be on ground ✅

**Implementation Note:** Start with anarchy, collect data, add rules in Phase 4+

---

## Phase 1: Visual Habitat Grid (Foundation)

### Goal
Create a visual grid-based habitat that displays currently placed items from `habitatConditions.habitatItems`.

### Components to Create

#### 1. `HabitatVisual.vue` - Main Habitat Display
**Location:** `src/components/debug/HabitatVisual.vue`

**Features:**
- Grid-based layout with multiple habitat sizes (small/medium/large)
- Display items currently in `habitatConditions.habitatItems`
- Visual representation using emojis or simple graphics
- Grid cell highlighting for visual feedback
- Subgrid layer for poop and particles
- Stacking support (items can overlap)
- Desktop-optimized (larger grids and cells)

**Props:**
```typescript
interface Props {
  habitatSize?: 'small' | 'medium' | 'large'  // Default: 'medium'
  showGrid?: boolean        // Toggle grid lines on/off
  readOnly?: boolean        // Disable interactions (view-only mode)
  highlightCells?: boolean  // Show hover effects
  showSubgrid?: boolean     // Toggle subgrid visualization (debug)
}
```

**Grid System:**
```typescript
interface GridCell {
  x: number              // Column (0-9 for small, 0-13 for medium, 0-17 for large)
  y: number              // Row (0-7 for small, 0-9 for medium, 0-11 for large)
  occupied: boolean      // Is there an item here?
  itemId: string | null  // ID of item occupying this cell
  accessible: boolean    // Can guinea pig reach this cell?
}

interface PlacedItem {
  itemId: string         // 'habitat_plastic_igloo'
  instanceId: string     // Unique instance from inventory
  position: { x: number, y: number }
  size: { width: number, height: number }  // Grid cells occupied (1x1, 2x1, 2x2, etc.)
  zIndex: number         // Stacking order (0 = bottom, higher = on top)
  rotation: number       // 0, 90, 180, 270 degrees (future)
}

interface SubgridItem {
  id: string             // Unique ID for poop/particle
  type: 'poop' | 'hay' | 'crumb' | 'footprint'
  position: { x: number, y: number }  // Subgrid position
  timestamp: number      // When placed
}
```

**Template Structure:**
```vue
<template>
  <div class="habitat-visual">
    <!-- Habitat Info Header -->
    <div class="habitat-visual__header">
      <h3>Habitat Layout ({{ habitatSize }} - {{ gridWidth }}x{{ gridHeight }})</h3>
      <div class="habitat-visual__stats">
        <span>{{ placedItemsCount }} items placed</span>
        <span>{{ occupiedCells }}/{{ totalCells }} cells occupied</span>
        <span v-if="poopCount > 0">💩 {{ poopCount }} poops</span>
      </div>
    </div>

    <!-- Grid Container (with subgrid overlay) -->
    <div class="habitat-visual__container">
      <!-- Main Grid (Items) -->
      <div
        class="habitat-visual__grid"
        :style="gridStyle"
      >
        <!-- Grid cells (for background/borders only) -->
        <div
          v-for="cell in gridCells"
          :key="`cell-${cell.x}-${cell.y}`"
          class="grid-cell"
          :class="{
            'grid-cell--occupied': cell.occupied,
            'grid-cell--accessible': cell.accessible
          }"
        />

        <!-- Placed Items (can stack on same position) -->
        <div
          v-for="item in sortedPlacedItems"
          :key="item.instanceId"
          class="grid-item"
          :style="{
            gridColumn: `${item.position.x + 1} / span ${item.size.width}`,
            gridRow: `${item.position.y + 1} / span ${item.size.height}`,
            zIndex: item.zIndex
          }"
          @click="selectItem(item.instanceId)"
        >
          <span class="grid-item__emoji">{{ getItemEmoji(item.itemId) }}</span>
          <span class="grid-item__name">{{ getItemName(item.itemId) }}</span>

          <!-- Stack indicator -->
          <span v-if="getStackCount(item.position) > 1" class="grid-item__stack">
            ×{{ getStackCount(item.position) }}
          </span>
        </div>
      </div>

      <!-- Subgrid Layer (Poop & Particles) -->
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

      <!-- Guinea Pig Layer (Phase 3) -->
      <div class="habitat-visual__guinea-pigs">
        <!-- Guinea pigs will be rendered here in Phase 3 -->
      </div>
    </div>

    <!-- Item Legend / Controls -->
    <div class="habitat-visual__controls">
      <button @click="clearAllPoop" v-if="poopCount > 0" size="sm">
        Clear All Poop ({{ poopCount }})
      </button>
      <button @click="addTestPoop" size="sm" variant="secondary">
        Add Test Poop
      </button>
    </div>
  </div>
</template>
```

**Composable Logic:**
```typescript
// Setup stores and refs
const habitatConditions = useHabitatConditions()
const suppliesStore = useSuppliesStore()
const inventoryStore = useInventoryStore()

// Props
const props = withDefaults(defineProps<Props>(), {
  habitatSize: 'medium',
  showGrid: true,
  readOnly: false,
  highlightCells: true,
  showSubgrid: false
})

// Grid configuration based on habitat size
const HABITAT_SIZES = {
  small: { width: 10, height: 8, cellSize: 80 },
  medium: { width: 14, height: 10, cellSize: 80 },
  large: { width: 18, height: 12, cellSize: 80 }
}

const gridWidth = computed(() => HABITAT_SIZES[props.habitatSize].width)
const gridHeight = computed(() => HABITAT_SIZES[props.habitatSize].height)
const cellSize = computed(() => HABITAT_SIZES[props.habitatSize].cellSize)
const totalCells = computed(() => gridWidth.value * gridHeight.value)

// Subgrid dimensions (4x4 subcells per main cell)
const subgridWidth = computed(() => gridWidth.value * 4)
const subgridHeight = computed(() => gridHeight.value * 4)
const subcellSize = computed(() => cellSize.value / 4)

// Dynamic grid styles
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridWidth.value}, ${cellSize.value}px)`,
  gridTemplateRows: `repeat(${gridHeight.value}, ${cellSize.value}px)`
}))

const subgridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${subgridWidth.value}, ${subcellSize.value}px)`,
  gridTemplateRows: `repeat(${subgridHeight.value}, ${subcellSize.value}px)`
}))

// Initialize grid cells
const gridCells = ref<GridCell[]>([])

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

// Subgrid items (poop, hay particles, etc.)
const subgridItems = ref<SubgridItem[]>([])
const poopCount = computed(() => subgridItems.value.filter(i => i.type === 'poop').length)

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
    // Remove poop
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

// Map placed items to grid cells
const placedItems = computed(() => {
  return habitatConditions.habitatItems.map(itemId => {
    const item = suppliesStore.getItemById(itemId)
    // For Phase 1, auto-position items in grid (left-to-right, top-to-bottom)
    const index = habitatConditions.habitatItems.indexOf(itemId)
    return {
      itemId,
      position: { x: index % GRID_WIDTH, y: Math.floor(index / GRID_WIDTH) },
      size: getItemSize(item),
      name: item?.name || 'Unknown',
      emoji: item?.emoji || '📦'
    }
  })
})

// Get item dimensions from stats or defaults
function getItemSize(item: SuppliesItem | undefined): { width: number, height: number } {
  if (!item) return { width: 1, height: 1 }

  const size = item.stats?.size
  if (size === 'small') return { width: 1, height: 1 }
  if (size === 'medium') return { width: 2, height: 1 }
  if (size === 'large') return { width: 2, height: 2 }

  return { width: 1, height: 1 }  // Default
}

// Update grid cells with placed items
function updateGridCells() {
  // Reset all cells
  gridCells.value.forEach(cell => {
    cell.occupied = false
    cell.itemId = null
  })

  // Mark occupied cells
  placedItems.value.forEach(item => {
    const { x, y } = item.position
    const { width, height } = item.size

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const cellIndex = (y + dy) * GRID_WIDTH + (x + dx)
        if (cellIndex < gridCells.value.length) {
          gridCells.value[cellIndex].occupied = true
          gridCells.value[cellIndex].itemId = item.itemId
        }
      }
    }
  })
}

// Remove item from habitat
function removeItem(itemId: string) {
  habitatConditions.removeItemFromHabitat(itemId)
  updateGridCells()
}

// Initialize on mount
onMounted(() => {
  initializeGrid()
  updateGridCells()
})

// Watch for changes to habitat items
watch(
  () => habitatConditions.habitatItems,
  () => updateGridCells(),
  { deep: true }
)
```

**CSS Grid Layout:**
```css
.habitat-visual__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: var(--space-1);
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%);
  border: 3px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.grid-cell {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(160, 82, 45, 0.2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.grid-cell--occupied {
  background: rgba(255, 255, 255, 0.7);
  border-color: var(--color-success);
}

.grid-cell__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.grid-cell__emoji {
  font-size: 1.5rem;
}

.grid-cell__name {
  font-size: 0.6rem;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

#### 2. Update `HabitatDebug.vue`
**Changes:**
- Add `<HabitatVisual />` component to the debug panel
- Place it above the Habitat Items (FPO) panel
- Show visual representation of the habitat

```vue
<template>
  <div class="debug-panel">
    <!-- Existing panels... -->

    <!-- NEW: Visual Habitat -->
    <div class="panel panel--full-width">
      <div class="panel__header">
        <h3>Habitat Visual (FPO)</h3>
      </div>
      <div class="panel__content">
        <HabitatVisual :show-grid="true" />
      </div>
    </div>

    <!-- Existing Habitat Items Panel... -->
  </div>
</template>
```

### Phase 1 Acceptance Criteria
- ✅ Grid displays 8x6 cells with visual borders
- ✅ Items from `habitatConditions.habitatItems` appear in grid
- ✅ Each item shows emoji and name
- ✅ Grid cells marked as occupied/unoccupied
- ✅ Legend shows all placed items with remove buttons
- ✅ Removing item updates grid in real-time
- ✅ Responsive layout scales to container

---

## Phase 2: Drag-and-Drop Item Placement

### Goal
Enable dragging items from inventory into the habitat grid with collision detection and valid placement rules.

### Technical Approach

**Drag-and-Drop Library:** Native HTML5 Drag & Drop API (no external library needed)
- Works well with Vue 3
- Good browser support
- No additional dependencies

### Components to Enhance

#### 1. `HabitatVisual.vue` - Add Drop Zones
**New Features:**
- Drop zone on each grid cell
- Valid/invalid placement visual feedback
- Collision detection (can't place item on occupied cells)
- Snap-to-grid positioning

**Template Updates:**
```vue
<div
  v-for="cell in gridCells"
  :key="`${cell.x}-${cell.y}`"
  class="grid-cell"
  :class="{
    'grid-cell--occupied': cell.occupied,
    'grid-cell--drop-target': isDragOver && canPlaceAt(cell.x, cell.y),
    'grid-cell--drop-invalid': isDragOver && !canPlaceAt(cell.x, cell.y)
  }"
  @dragover.prevent="handleDragOver($event, cell)"
  @dragleave="handleDragLeave"
  @drop="handleDrop($event, cell)"
>
  <!-- Existing cell content -->
</div>
```

**Drag-and-Drop Logic:**
```typescript
// Drag state
const isDragging = ref(false)
const isDragOver = ref(false)
const draggedItemId = ref<string | null>(null)
const draggedItemSize = ref<{ width: number, height: number }>({ width: 1, height: 1 })
const hoverCell = ref<{ x: number, y: number } | null>(null)

// Drag over handler
function handleDragOver(event: DragEvent, cell: GridCell) {
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

// Drag leave handler
function handleDragLeave() {
  isDragOver.value = false
  hoverCell.value = null
}

// Drop handler
function handleDrop(event: DragEvent, cell: GridCell) {
  event.preventDefault()
  isDragOver.value = false

  const itemId = event.dataTransfer!.getData('text/plain')

  if (!itemId || !canPlaceAt(cell.x, cell.y)) {
    return
  }

  // Add item to habitat at this position
  placeItemAt(itemId, cell.x, cell.y)
}

// Check if item can be placed at position
function canPlaceAt(x: number, y: number): boolean {
  if (!draggedItemId.value) return false

  const size = draggedItemSize.value

  // Check bounds
  if (x + size.width > GRID_WIDTH || y + size.height > GRID_HEIGHT) {
    return false
  }

  // Check collision with existing items
  for (let dy = 0; dy < size.height; dy++) {
    for (let dx = 0; dx < size.width; dx++) {
      const cellIndex = (y + dy) * GRID_WIDTH + (x + dx)
      if (gridCells.value[cellIndex]?.occupied) {
        return false
      }
    }
  }

  return true
}

// Place item at position
function placeItemAt(itemId: string, x: number, y: number) {
  // Add to habitat store with position
  const success = habitatConditions.addItemToHabitat(itemId)

  if (success) {
    // Store position in new habitatItemPositions map
    habitatConditions.setItemPosition(itemId, { x, y })
    updateGridCells()
  }
}
```

#### 2. Update `InventoryDebug.vue` - Add Drag Sources
**New Features:**
- Make inventory items draggable
- Visual feedback during drag
- Disable drag for non-habitat items

**Template Updates:**
```vue
<div
  v-for="item in habitatItemsInInventory"
  :key="item.id"
  class="inventory-card"
  :draggable="!item.isPlaced"
  @dragstart="handleDragStart($event, item)"
  @dragend="handleDragEnd"
>
  <!-- Existing card content -->
</div>
```

**Drag Logic:**
```typescript
// Drag start handler
function handleDragStart(event: DragEvent, item: InventoryItem) {
  if (item.isPlaced) {
    event.preventDefault()
    return
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', item.id)

  // Visual feedback
  event.target.classList.add('dragging')
}

// Drag end handler
function handleDragEnd(event: DragEvent) {
  event.target.classList.remove('dragging')
}
```

### Phase 2 Store Updates

#### Update `habitatConditions.ts`
**New State:**
```typescript
// Map of itemId -> grid position
const itemPositions = ref<Map<string, { x: number, y: number }>>(new Map())

function setItemPosition(itemId: string, position: { x: number, y: number }) {
  itemPositions.value.set(itemId, position)
}

function getItemPosition(itemId: string): { x: number, y: number } | null {
  return itemPositions.value.get(itemId) || null
}

function removeItemPosition(itemId: string) {
  itemPositions.value.delete(itemId)
}

// Update removeItemFromHabitat to also remove position
function removeItemFromHabitat(itemId: string): boolean {
  const index = habitatItems.value.indexOf(itemId)
  if (index === -1) {
    console.warn(`Item ${itemId} not found in habitat`)
    return false
  }

  const inventoryStore = useInventoryStore()
  inventoryStore.unmarkAsPlacedInHabitat(itemId, 1)
  habitatItems.value.splice(index, 1)
  removeItemPosition(itemId)  // NEW: Also remove position

  return true
}
```

### Phase 2 Acceptance Criteria
- ✅ Inventory items can be dragged
- ✅ Grid cells show valid/invalid placement feedback during drag
- ✅ Items snap to grid on drop
- ✅ **Stacking works** - Items can be placed on occupied cells (z-index increments)
- ✅ Item position + zIndex persists after placement
- ✅ Stack indicator shows when multiple items at same position
- ✅ Dragging non-habitat items is disabled
- ✅ Items maintain their size (1x1, 2x1, 2x2)

---

## Phase 3: Guinea Pig Integration

### Goal
Show guinea pigs in the habitat and animate them moving between items.

### Features
- Display guinea pig sprites/emojis in habitat grid
- Simple movement animation (move from cell to cell)
- Guinea pig "visits" items (appears near item for a few seconds)
- Activity messages when guinea pig uses items

### Implementation
```typescript
// Guinea pig position in habitat
const guineaPigPositions = ref<Map<string, { x: number, y: number }>>(new Map())

// Initialize guinea pig positions (random starting positions)
function initializeGuineaPigPositions() {
  const guineaPigs = guineaPigStore.allGuineaPigs

  guineaPigs.forEach(gp => {
    // Random unoccupied cell
    const emptyCell = findEmptyCell()
    if (emptyCell) {
      guineaPigPositions.value.set(gp.id, { x: emptyCell.x, y: emptyCell.y })
    }
  })
}

// Simulate guinea pig movement (simple version)
function moveGuineaPigToItem(guineaPigId: string, itemId: string) {
  const itemPosition = habitatConditions.getItemPosition(itemId)
  if (!itemPosition) return

  // Animate guinea pig to item position
  guineaPigPositions.value.set(guineaPigId, itemPosition)

  // Add activity message
  const gp = guineaPigStore.getGuineaPig(guineaPigId)
  const item = suppliesStore.getItemById(itemId)
  activityFeed.addMessage(`${gp.name} explores the ${item.name}`, 'interaction')
}
```

**Template Update:**
```vue
<div
  v-for="cell in gridCells"
  :key="`${cell.x}-${cell.y}`"
  class="grid-cell"
>
  <!-- Item display -->

  <!-- Guinea pig display (if guinea pig is at this cell) -->
  <div
    v-if="getGuineaPigAtCell(cell.x, cell.y)"
    class="grid-cell__guinea-pig"
  >
    🐹
  </div>
</div>
```

### Phase 3 Acceptance Criteria
- ✅ Guinea pigs appear in habitat grid
- ✅ Guinea pigs can move between cells
- ✅ Guinea pigs visit items (appear near items)
- ✅ Activity messages when guinea pig uses items
- ✅ Multiple guinea pigs can be in habitat simultaneously

---

## Integration Points

### Existing Systems
- **Supplies Store** - Item metadata (emoji, name, size, stats)
- **Inventory Store** - Ownership tracking, placed/unplaced state
- **Habitat Conditions** - Items currently in habitat, position tracking
- **Guinea Pig Store** - Guinea pig data for display
- **Activity Feed** - Messages when items are placed/used

### New Dependencies
- **Item Position Persistence** - Save/load item positions
- **Grid Collision System** - Prevent overlapping items
- **Item Size Metadata** - Define which items are 1x1, 2x1, 2x2, etc.

---

## Data Structure Updates

### Item Size Metadata (add to `SuppliesItem.stats`)

Items should specify their grid size:
```typescript
interface SuppliesItem {
  // ... existing fields
  stats?: {
    // ... existing stats
    gridSize?: { width: number, height: number }  // NEW
  }
}

// Examples:
// Small items (water bottle, bowl): { width: 1, height: 1 }
// Medium items (igloo, hideaway): { width: 2, height: 1 }
// Large items (tunnels, beds): { width: 2, height: 2 }
```

### Habitat Item Position (add to `habitatConditions.ts`)
```typescript
interface HabitatItemPlacement {
  itemId: string
  instanceId: string  // From inventory
  position: { x: number, y: number }
  placedAt: number    // Timestamp
}

const itemPlacements = ref<HabitatItemPlacement[]>([])
```

---

## File Structure

### New Files
```
src/components/debug/
  ├── HabitatVisual.vue          # Main visual habitat grid component
  └── (future) GuineaPigSprite.vue  # Guinea pig display component

src/composables/
  └── useHabitatGrid.ts          # Grid logic, collision detection, placement validation

src/styles/
  └── habitat-visual.css         # Habitat visual styles (if needed)
```

### Modified Files
```
src/stores/habitatConditions.ts  # Add item position tracking
src/components/debug/HabitatDebug.vue  # Add HabitatVisual component
src/components/debug/InventoryDebug.vue  # Add drag-and-drop
src/stores/suppliesStore.ts  # Add gridSize to item stats
```

---

## Testing Strategy

### Phase 1 Testing
1. Verify grid renders 8x6 cells correctly
2. Place items via `addItemToHabitat()` and verify they appear
3. Remove items and verify grid updates
4. Test with different screen sizes (responsive)

### Phase 2 Testing
1. Drag item from inventory to habitat
2. Verify collision detection (can't overlap items)
3. Test boundary detection (can't place outside grid)
4. Test different item sizes (1x1, 2x1, 2x2)
5. Verify position persistence (refresh page, items stay)

### Phase 3 Testing
1. Verify guinea pigs appear in habitat
2. Test movement animations
3. Verify multiple guinea pigs display correctly
4. Test item interaction messages

---

## UI/UX Considerations

### Visual Design
- **Grid background:** Bedding-colored gradient (beige/tan)
- **Grid cells:** Subtle borders, wood-colored
- **Items:** Large emoji + small text label
- **Guinea pigs:** Animated emoji or simple sprite

### Drag-and-Drop Feedback
- **Valid drop:** Green highlight on target cell
- **Invalid drop:** Red highlight, cursor shows "not-allowed"
- **Dragging:** Semi-transparent item follows cursor
- **Drop success:** Brief animation (scale bounce)

### Mobile Considerations
- Touch events for drag-and-drop (may require library like `@vueuse/gesture`)
- Larger touch targets for grid cells
- Simplified layout for small screens

---

## Future Enhancements (Post-Phase 3)

### Advanced Features
- **Item rotation** - Rotate items 90° for better placement
- **Multi-select** - Select multiple items to move together
- **Templates** - Save/load habitat layouts
- **Auto-arrange** - Smart placement suggestions
- **Zoom & pan** - For larger habitats

### Guinea Pig AI
- **Autonomous movement** - Guinea pigs walk around habitat
- **Need-based item selection** - Guinea pig seeks water bottle when thirsty
- **Social behaviors** - Multiple guinea pigs interact with each other
- **Path-finding** - Guinea pigs navigate around obstacles

### Visual Polish
- **Bedding texture** - Actual texture instead of gradient
- **Shadows** - Drop shadows for items
- **Animations** - Item placement animations, guinea pig movement
- **Sound effects** - Item placement, guinea pig sounds

---

## Success Metrics

### Phase 1
- Visual habitat grid displays correctly
- Items appear in grid matching `habitatConditions.habitatItems`
- Remove functionality works

### Phase 2
- Drag-and-drop works smoothly
- Collision detection prevents invalid placements
- Item positions persist across sessions

### Phase 3
- Guinea pigs visible in habitat
- Movement animations smooth
- Activity messages display correctly

---

## Timeline Estimate

### Phase 1: Visual Habitat Grid
**Estimated Time:** 2-3 hours
- Component creation: 1 hour
- Grid logic: 1 hour
- CSS styling: 1 hour

### Phase 2: Drag-and-Drop
**Estimated Time:** 3-4 hours
- Drag handlers: 1 hour
- Collision detection: 1 hour
- Position persistence: 1 hour
- Testing & polish: 1 hour

### Phase 3: Guinea Pig Integration
**Estimated Time:** 2-3 hours
- Display logic: 1 hour
- Movement system: 1 hour
- Activity integration: 1 hour

**Total Estimated Time:** 7-10 hours

---

## Next Steps

1. **Implement Phase 1** - Create basic visual habitat grid
2. **Test Phase 1** - Verify grid displays items correctly
3. **Implement Phase 2** - Add drag-and-drop functionality
4. **Test Phase 2** - Verify collision detection and placement
5. **Implement Phase 3** - Add guinea pig display and movement
6. **Polish** - Improve visuals, add animations, optimize performance

---

## Design Decisions Made

### Grid Sizes ✅ **DECIDED**
- **Small:** 10x8 cells (80 cells) - Starter for 1 guinea pig
- **Medium:** 14x10 cells (140 cells) - Starter for 2 guinea pigs
- **Large:** 18x12 cells (216 cells) - Premium upgrade for 1-2 guinea pigs
- **Cell size:** 80px x 80px (desktop-optimized)
- **Max capacity:** 2 guinea pigs per habitat (game limit)
- **Upgrade system:** Unlocked via milestone (TBD)

### Item Sizes ✅ **DECIDED**
- **Small items (1x1):** Bowls, water bottles, small toys
- **Medium items (2x1):** Hideaways, hay racks, platforms
- **Large items (2x2):** Tunnels, beds, multi-level structures
- **Future:** May add 3x1 or 3x2 for extra-large items if needed

### Subgrid System ✅ **DECIDED**
- **4x4 subcells per main cell** (16 subcells per cell)
- **Small habitat:** 40x32 subcells (1,280 total)
- **Medium habitat:** 56x40 subcells (2,240 total)
- **Large habitat:** 72x48 subcells (3,456 total)
- **Use cases:** Poop, hay particles, food crumbs, footprints
- **No strict alignment** - Items placed anywhere on subgrid

### Stacking ✅ **DECIDED**
- **Phase 1-3:** Stacking anarchy (any items can stack)
- **z-index based layering** for visual depth
- **Stack indicators** show item count at position
- **Future:** May add logical stacking rules based on player feedback

### Mobile Support ✅ **DECIDED**
- **Desktop-first approach** prioritizing experience
- **Larger grids and cells** for clarity (80px cells)
- **Tablet:** May scale down cells (60px minimum)
- **Mobile:** Secondary priority, may require simplified view

### Performance Considerations
- 80-216 grid cells + 1,280-3,456 subgrid cells should perform well
- CSS Grid natively handles large layouts efficiently
- Subgrid overlay uses `pointer-events: none` (no interaction cost)
- Max 2 guinea pigs per habitat keeps performance optimal

---

## Documentation References

- [System 14: Habitat Items](system-14-habitat-items.md) - Full feature specification
- [System 13: Habitat Conditions](system-13-habitat-conditions.md) - Environmental system
- [System 12: Inventory Management](system-12-inventory-management.md) - Item ownership
- [System 11: Supplies Store](system-11-supplies-store.md) - Item catalog
