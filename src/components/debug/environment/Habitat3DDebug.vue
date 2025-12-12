<template>
  <div class="habitat-3d-debug debug-view__constrained">
    <h2>3D Habitat View</h2>

    <!-- No Active Session Message -->
    <div v-if="!hasActiveSession" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see the 3D habitat.</p>
      </div>
    </div>

    <!-- Wrong View Mode Message -->
    <div v-else-if="is2DMode" class="panel panel--compact panel--info mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">This game was started in 2D mode</p>
        <p class="text-label--small">Visit the 2D Habitat Debug view to see this game session.</p>
      </div>
    </div>

    <div v-else class="panel panel--full-width">
      <div class="panel__content">
        <div class="habitat-3d-debug__info">
          Drag or &lt; &gt; to rotate | Scroll/Z/X for Up/Down | Arrows to pan | Click guinea pig to select
        </div>
        <div class="habitat-3d-debug__canvas-wrapper">
          <canvas ref="canvasRef" @click="handleCanvasClick"></canvas>

          <!-- Floating Action Buttons -->
          <FloatingActionButton
            v-if="selectedGuineaPigId"
            icon="🥕"
            label="Feed"
            variant="primary"
            position="bottom-right"
            :disabled="!selectedGuineaPigId"
            ariaLabel="Feed guinea pig"
            @click="handleFeed"
            style="bottom: 240px;"
          />
          <FloatingActionButton
            v-if="selectedGuineaPigId"
            icon="💧"
            label="Water"
            variant="info"
            position="bottom-right"
            :disabled="!selectedGuineaPigId"
            ariaLabel="Give water to guinea pig"
            @click="handleWater"
            style="bottom: 180px;"
          />
          <FloatingActionButton
            v-if="selectedGuineaPigId"
            icon="🎾"
            label="Play"
            variant="secondary"
            position="bottom-right"
            :disabled="!selectedGuineaPigId"
            ariaLabel="Play with guinea pig"
            @click="handlePlay"
            style="bottom: 120px;"
          />
          <FloatingActionButton
            v-if="selectedGuineaPigId"
            icon="💚"
            label="Pet"
            variant="secondary"
            position="bottom-right"
            :disabled="!selectedGuineaPigId"
            ariaLabel="Pet guinea pig"
            @click="handlePet"
            style="bottom: 60px;"
          />
          <FloatingActionButton
            v-if="selectedGuineaPigId"
            icon="❌"
            label="Deselect"
            variant="danger"
            position="bottom-right"
            :disabled="!selectedGuineaPigId"
            ariaLabel="Deselect guinea pig"
            @click="handleDeselect"
          />

          <!-- Floating Inventory Menu (for bowls and hay racks) -->
          <InventoryItemMenu
            :show="showInventoryMenu"
            :position="menuPosition"
            :title="menuTitle"
            :items="currentMenuItems"
            :empty-message="menuEmptyMessage"
            @close="closeInventoryMenu"
            @select="handleAddItemToContainer"
          />
        </div>

        <!-- Selected Guinea Pig Info -->
        <div v-if="selectedGuineaPig" class="habitat-3d-debug__selection-info">
          <strong>Selected:</strong> {{ selectedGuineaPig.name }}
        </div>
      </div>
    </div>

    <!-- Water Bottle Rotation Debug Row -->
    <div v-if="hasActiveSession" class="habitat-3d-debug__debug-row">
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Water Bottle Rotation Debug</h3>
        </div>
        <div class="panel__content">
          <div class="rotation-debug">
            <SliderField
              v-model="debugRotation"
              label="Rotation (radians)"
              :min="-Math.PI"
              :max="Math.PI"
              :step="0.01"
              :show-value="true"
              :show-min-max="true"
              @change="applyDebugRotation"
            />
            <div class="rotation-debug__input-group">
              <label for="rotation-input" class="rotation-debug__label">Precise Value:</label>
              <input
                id="rotation-input"
                v-model.number="debugRotation"
                type="number"
                class="rotation-debug__input"
                :min="-Math.PI"
                :max="Math.PI"
                :step="0.01"
                @input="applyDebugRotation"
              />
            </div>
            <div class="rotation-debug__presets">
              <button @click="setRotation(0)" class="rotation-debug__preset">0° (Right)</button>
              <button @click="setRotation(Math.PI / 4)" class="rotation-debug__preset">45°</button>
              <button @click="setRotation(Math.PI / 2)" class="rotation-debug__preset">90° (Up)</button>
              <button @click="setRotation(3 * Math.PI / 4)" class="rotation-debug__preset">135°</button>
              <button @click="setRotation(Math.PI)" class="rotation-debug__preset">180° (Left)</button>
              <button @click="setRotation(-Math.PI / 4)" class="rotation-debug__preset">-45°</button>
              <button @click="setRotation(-Math.PI / 2)" class="rotation-debug__preset">-90° (Down)</button>
              <button @click="setRotation(-3 * Math.PI / 4)" class="rotation-debug__preset">-135°</button>
            </div>
            <div class="rotation-debug__info">
              Current rotation: {{ debugRotation.toFixed(3) }} rad ({{ (debugRotation * 180 / Math.PI).toFixed(1) }}°)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { use3DScene } from '../../../composables/use3DScene'
import { use3DCamera } from '../../../composables/use3DCamera'
import { use3DSync } from '../../../composables/use3DSync'
import { use3DItems } from '../../../composables/use3DItems'
import { use3DPoop } from '../../../composables/use3DPoop'
import { use3DHungerBehavior } from '../../../composables/3d/use3DHungerBehavior'
import FloatingActionButton from '../../basic/FloatingActionButton.vue'
import SliderField from '../../basic/SliderField.vue'
import InventoryItemMenu from '../../basic/InventoryItemMenu.vue'
import type { InventoryMenuItem } from '../../basic/InventoryItemMenu.vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useGameController } from '../../../stores/gameController'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGameViewStore } from '../../../stores/gameViewStore'
import { useMovement3DStore } from '../../../stores/movement3DStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useGuineaPigBehavior, type BehaviorType } from '../../../composables/game/useGuineaPigBehavior'
import { GRID_CONFIG, ENVIRONMENT_CONFIG, ANIMATION_CONFIG } from '../../../constants/3d'
import { disposeObject3D } from '../../../utils/three-cleanup'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedGuineaPigId = ref<string | null>(null)
const debugRotation = ref<number>(0)

// Stores
const guineaPigStore = useGuineaPigStore()
const gameController = useGameController()
const habitatConditions = useHabitatConditions()
const petStoreManager = usePetStoreManager()
const gameViewStore = useGameViewStore()
const movement3DStore = useMovement3DStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

// Inventory menu state (for bowls and hay racks)
const selectedContainerId = ref<string | null>(null)
const selectedContainerType = ref<'bowl' | 'hay_rack' | null>(null)
const showInventoryMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })

// Computed
const isGameActive = computed(() => gameController.isGameActive)
const hasActiveSession = computed(() => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0)
const is2DMode = computed(() => gameViewStore.mode === '2d')
const selectedGuineaPig = computed(() => {
  if (!selectedGuineaPigId.value) return null
  return guineaPigStore.activeGuineaPigs.find(gp => gp.id === selectedGuineaPigId.value)
})

// Available food items from inventory for adding to bowl
const availableFoodItems = computed((): InventoryMenuItem[] => {
  const items: InventoryMenuItem[] = []

  // Define the food item IDs we're looking for
  const foodItemIds = ['hay_timothy', 'food_pellets_standard', 'food_green_leaf_lettuce', 'food_carrot']

  for (const itemId of foodItemIds) {
    const quantity = inventoryStore.getItemQuantity(itemId)
    if (quantity > 0) {
      const supplyItem = suppliesStore.getItemById(itemId)
      if (supplyItem) {
        items.push({
          itemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '🍽️',
          quantity
        })
      }
    }
  }

  return items
})

// Available hay items from inventory for adding to hay rack
const availableHayItems = computed((): InventoryMenuItem[] => {
  const items: InventoryMenuItem[] = []

  // Get hay items - check for serving-based quantities
  const hayItemId = 'hay_timothy'
  const totalServings = inventoryStore.getTotalServings(hayItemId)

  if (totalServings > 0) {
    const supplyItem = suppliesStore.getItemById(hayItemId)
    if (supplyItem) {
      items.push({
        itemId: hayItemId,
        name: supplyItem.name,
        emoji: supplyItem.emoji || '🌾',
        quantity: totalServings
      })
    }
  }

  return items
})

// Get items based on selected container type
const currentMenuItems = computed((): InventoryMenuItem[] => {
  if (selectedContainerType.value === 'bowl') {
    return availableFoodItems.value
  } else if (selectedContainerType.value === 'hay_rack') {
    return availableHayItems.value
  }
  return []
})

// Get menu title based on container type
const menuTitle = computed(() => {
  if (selectedContainerType.value === 'bowl') {
    return 'Add Food'
  } else if (selectedContainerType.value === 'hay_rack') {
    return 'Add Hay'
  }
  return 'Add Item'
})

// Get empty message based on container type
const menuEmptyMessage = computed(() => {
  if (selectedContainerType.value === 'bowl') {
    return 'No food in inventory'
  } else if (selectedContainerType.value === 'hay_rack') {
    return 'No hay in inventory'
  }
  return 'No items available'
})

// Behavior composables registry (for manual user interactions)
const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

// 3D Hunger behavior composables registry (for autonomous behavior)
const hungerBehaviors = new Map<string, ReturnType<typeof use3DHungerBehavior>>()

/**
 * Get or create behavior composable for a guinea pig
 */
function getBehaviorComposable(guineaPigId: string) {
  let behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) {
    behavior = useGuineaPigBehavior(guineaPigId)
    behaviorComposables.set(guineaPigId, behavior)
  }
  return behavior
}

/**
 * Initialize guinea pigs in movement3DStore and start hunger behaviors
 */
function initializeGuineaPigBehaviors() {
  // Watch for active guinea pigs
  watch(
    () => guineaPigStore.activeGuineaPigs,
    (activeGuineaPigs, oldGuineaPigs) => {
      // Only run if in 3D mode
      if (gameViewStore.mode !== '3d') return

      // Sync obstacles from habitat items
      movement3DStore.syncObstaclesFromHabitat()

      // Initialize new guinea pigs
      for (const gp of activeGuineaPigs) {
        if (!movement3DStore.getGuineaPigState(gp.id)) {
          // Initialize position at random location within bounds
          const startPos = {
            x: (Math.random() - 0.5) * 20, // -10 to 10
            y: 0,
            z: (Math.random() - 0.5) * 14  // -7 to 7
          }

          // Make sure position is valid (not in obstacle)
          const validPos = movement3DStore.clampToBounds(startPos)

          movement3DStore.initializeGuineaPig(gp.id, validPos)

          // Create and start hunger behavior
          const hungerBehavior = use3DHungerBehavior(gp.id)
          hungerBehaviors.set(gp.id, hungerBehavior)
          hungerBehavior.start()

          console.log(`[Habitat3D] Initialized guinea pig ${gp.id} with hunger behavior`)
        }
      }

      // Cleanup removed guinea pigs
      const oldIds = (oldGuineaPigs || []).map(gp => gp.id)
      const newIds = activeGuineaPigs.map(gp => gp.id)

      for (const oldId of oldIds) {
        if (!newIds.includes(oldId)) {
          // Stop and remove hunger behavior
          const behavior = hungerBehaviors.get(oldId)
          if (behavior) {
            behavior.stop()
            hungerBehaviors.delete(oldId)
          }

          // Remove from movement store
          movement3DStore.removeGuineaPig(oldId)

          console.log(`[Habitat3D] Removed guinea pig ${oldId}`)
        }
      }
    },
    { immediate: true }
  )
}

// Initialize 3D scene
const { scene, camera, worldGroup, initRenderer, handleResize, cleanup: cleanupScene, getRenderer } = use3DScene(canvasRef)

// Camera controls cleanup function
let cleanupCamera: (() => void) | null = null
let updateCameraPosition: (() => void) | null = null
let animationId: number | null = null

// Guinea pig models registry (from use3DSync)
let guineaPigModels: Map<string, THREE.Group> | null = null
let cleanupSync: (() => void) | null = null

// Items and poop cleanup
let cleanupItems: (() => void) | null = null
let cleanupPoop: (() => void) | null = null
let handlePoopClick: ((clickedObject: THREE.Object3D) => string | null) | null = null

// Selection ring
let selectionRing: THREE.Mesh | null = null

// Environment objects that need disposal
let environmentObjects: THREE.Object3D[] = []
let beddingTexture: THREE.CanvasTexture | null = null

// Water bottle rotation debug functions
let itemModels: Map<string, THREE.Group> | null = null

/**
 * Apply debug rotation to all water bottles in the scene
 */
function applyDebugRotation() {
  if (!itemModels) return

  itemModels.forEach((model, itemId) => {
    if (itemId.includes('water') && itemId.includes('bottle')) {
      model.rotation.y = debugRotation.value
    }
  })
}

/**
 * Set rotation to a specific value and apply it
 */
function setRotation(radians: number) {
  debugRotation.value = radians
  applyDebugRotation()
}

onMounted(() => {
  if (!canvasRef.value) return

  // Initialize renderer
  const renderer = initRenderer()
  if (!renderer) return

  // Setup camera controls
  const cameraControls = use3DCamera(camera, worldGroup, canvasRef.value)
  updateCameraPosition = cameraControls.updateCameraPosition
  cleanupCamera = cameraControls.cleanup

  // Setup position sync with 3D movement mode
  const syncResult = use3DSync(worldGroup, { use3DMovement: true })
  guineaPigModels = syncResult.guineaPigModels
  cleanupSync = syncResult.cleanup

  // Initialize guinea pigs and start hunger behaviors when they become active
  initializeGuineaPigBehaviors()

  // Setup habitat items
  const itemsResult = use3DItems(worldGroup)
  itemModels = itemsResult.itemModels
  cleanupItems = itemsResult.cleanup

  // Setup poop pellets
  const poopResult = use3DPoop(worldGroup)
  cleanupPoop = poopResult.cleanup
  handlePoopClick = poopResult.handlePoopClick

  // Add basic environment
  addEnvironment()

  // Create selection ring
  createSelectionRing()

  // Add window resize listener
  window.addEventListener('resize', handleResize)

  // Start animation loop
  animate()
})

onUnmounted(() => {
  // Stop animation loop
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  // Cleanup sync watchers and guinea pig models
  if (cleanupSync) {
    cleanupSync()
  }

  // Cleanup items
  if (cleanupItems) {
    cleanupItems()
  }

  // Cleanup poop
  if (cleanupPoop) {
    cleanupPoop()
  }

  // Cleanup camera controls
  if (cleanupCamera) {
    cleanupCamera()
  }

  // Dispose selection ring
  if (selectionRing) {
    disposeObject3D(selectionRing)
    selectionRing = null
  }

  // Dispose environment objects
  environmentObjects.forEach(obj => {
    disposeObject3D(obj)
  })
  environmentObjects = []

  // Dispose bedding texture
  if (beddingTexture) {
    beddingTexture.dispose()
    beddingTexture = null
  }

  // Clear behavior composables
  behaviorComposables.clear()

  // Stop and clear all hunger behaviors
  hungerBehaviors.forEach(behavior => behavior.stop())
  hungerBehaviors.clear()

  // Clear movement3D store
  movement3DStore.clearAllGuineaPigs()

  // Cleanup scene and renderer
  cleanupScene()

  // Remove resize listener
  window.removeEventListener('resize', handleResize)
})

// Animation loop
function animate() {
  animationId = requestAnimationFrame(animate)

  // Update camera position based on keyboard input
  if (updateCameraPosition) {
    updateCameraPosition()
  }

  // Update selection ring position
  updateSelectionRing()

  // Render the scene
  const renderer = getRenderer()
  if (renderer) {
    renderer.render(scene, camera)
  }
}

// Create selection ring
function createSelectionRing() {
  const ringGeometry = new THREE.RingGeometry(
    ANIMATION_CONFIG.SELECTION_RING.INNER_RADIUS,
    ANIMATION_CONFIG.SELECTION_RING.OUTER_RADIUS,
    32
  )
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: ANIMATION_CONFIG.SELECTION_RING.COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: ANIMATION_CONFIG.SELECTION_RING.OPACITY
  })
  selectionRing = new THREE.Mesh(ringGeometry, ringMaterial)
  selectionRing.rotation.x = -Math.PI / 2 // Rotate to be horizontal
  selectionRing.position.y = ANIMATION_CONFIG.SELECTION_RING.Y_OFFSET
  selectionRing.visible = false
  worldGroup.add(selectionRing)
}

// Update selection ring position
function updateSelectionRing() {
  if (!selectionRing || !selectedGuineaPigId.value || !guineaPigModels) return

  const selectedModel = guineaPigModels.get(selectedGuineaPigId.value)
  if (selectedModel) {
    selectionRing.position.x = selectedModel.position.x
    selectionRing.position.z = selectedModel.position.z
    selectionRing.visible = true

    // Pulse animation
    const time = Date.now() * ANIMATION_CONFIG.SELECTION_RING.PULSE_SPEED
    const pulseAmount = ANIMATION_CONFIG.SELECTION_RING.PULSE_AMPLITUDE
    selectionRing.scale.set(1 + Math.sin(time) * pulseAmount, 1, 1 + Math.sin(time) * pulseAmount)
  } else {
    selectionRing.visible = false
  }
}

// Handle canvas click for guinea pig selection, poop removal, and food bowl interaction
function handleCanvasClick(event: MouseEvent) {
  if (!canvasRef.value || !guineaPigModels) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Create raycaster
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // Check all objects in the scene
  const intersects = raycaster.intersectObjects(worldGroup.children, true)

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object

    // Priority 1: Check if poop was clicked
    if (handlePoopClick) {
      const poopId = handlePoopClick(clickedObject)
      if (poopId) {
        habitatConditions.removePoop(poopId)
        console.log('Removed poop:', poopId)
        return
      }
    }

    // Priority 2: Check if food bowl or hay rack was clicked
    if (itemModels) {
      let clickedContainerId: string | null = null
      let clickedContainerType: 'bowl' | 'hay_rack' | null = null

      itemModels.forEach((model, itemId) => {
        // Check if clicked object is part of this item model
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            const item = suppliesStore.getItemById(itemId)
            // Check if this item is a food bowl
            if (item?.stats?.itemType === 'food_bowl') {
              clickedContainerId = itemId
              clickedContainerType = 'bowl'
            }
            // Check if this item is a hay rack
            else if (item?.stats?.itemType === 'hay_rack' || (itemId.includes('hay') && itemId.includes('rack'))) {
              clickedContainerId = itemId
              clickedContainerType = 'hay_rack'
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedContainerId && clickedContainerType) {
        // Show inventory menu for this container
        selectedContainerId.value = clickedContainerId
        selectedContainerType.value = clickedContainerType
        showInventoryMenu.value = true
        menuPosition.value = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
        console.log(`Clicked ${clickedContainerType}:`, clickedContainerId)
        return
      }
    }

    // Priority 3: Check if guinea pig was clicked
    let clickedModel: THREE.Group | null = null

    guineaPigModels.forEach((model, id) => {
      if (clickedObject.parent === model || clickedObject.parent?.parent === model) {
        clickedModel = model
        selectedGuineaPigId.value = id
      }
    })

    if (clickedModel) {
      console.log('Selected guinea pig:', selectedGuineaPigId.value)
    }
  }

  // Close inventory menu if clicked elsewhere and menu is open
  if (showInventoryMenu.value && !selectedContainerId.value) {
    closeInventoryMenu()
  }
}

// Close the inventory menu
function closeInventoryMenu() {
  showInventoryMenu.value = false
  selectedContainerId.value = null
  selectedContainerType.value = null
}

// Handle adding an item to the selected container
function handleAddItemToContainer(itemId: string) {
  if (!selectedContainerId.value || !selectedContainerType.value) return

  let success = false

  if (selectedContainerType.value === 'bowl') {
    success = habitatConditions.addFoodToBowl(selectedContainerId.value, itemId)
    if (success) {
      console.log(`Added ${itemId} to bowl ${selectedContainerId.value}`)
    } else {
      console.warn(`Failed to add ${itemId} to bowl`)
    }
  } else if (selectedContainerType.value === 'hay_rack') {
    success = habitatConditions.addHayToRack(selectedContainerId.value, itemId)
    if (success) {
      console.log(`Added ${itemId} to hay rack ${selectedContainerId.value}`)
    } else {
      console.warn(`Failed to add ${itemId} to hay rack`)
    }
  }

  // Close menu after adding
  closeInventoryMenu()
}

// Action button handlers
async function handleFeed() {
  if (!selectedGuineaPigId.value || !isGameActive.value) return
  await triggerBehavior(selectedGuineaPigId.value, 'eat')
}

async function handleWater() {
  if (!selectedGuineaPigId.value || !isGameActive.value) return
  await triggerBehavior(selectedGuineaPigId.value, 'drink')
}

async function handlePlay() {
  if (!selectedGuineaPigId.value || !isGameActive.value) return
  await triggerBehavior(selectedGuineaPigId.value, 'play')
}

async function handlePet() {
  if (!selectedGuineaPigId.value || !isGameActive.value) return
  await triggerBehavior(selectedGuineaPigId.value, 'groom')
}

function handleDeselect() {
  selectedGuineaPigId.value = null
}

/**
 * Trigger a specific behavior for a guinea pig (adapted from AutonomyDebug)
 */
async function triggerBehavior(guineaPigId: string, behaviorType: BehaviorType) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  // Store original need values
  const originalNeeds = { ...guineaPig.needs }

  try {
    // Set the appropriate need to 0 to force this behavior
    const needMap: Partial<Record<BehaviorType, keyof typeof guineaPig.needs>> = {
      eat: 'hunger',
      eat_hay: 'hunger',
      drink: 'thirst',
      sleep: 'energy',
      seek_shelter: 'shelter',
      groom: 'hygiene',
      chew: 'nails',
      play: 'play',
      socialize: 'social',
    }

    const needKey = needMap[behaviorType]
    if (needKey) {
      guineaPig.needs[needKey] = 0
    }

    // Get behavior thresholds (use defaults for now)
    const thresholds = {
      hunger: 40,
      thirst: 40,
      energy: 40,
      shelter: 30,
      hygiene: 30,
      chew: 30,
      play: 30,
      social: 30,
    }

    // Let the AI select the appropriate goal (now that need is low)
    const goal = behavior.selectBehaviorGoal(thresholds)

    // Check if goal matches requested behavior type
    const isMatchingGoal = goal && (
      goal.type === behaviorType ||
      (behaviorType === 'eat' && goal.type === 'eat_hay')
    )

    if (isMatchingGoal && goal) {
      // Execute the behavior
      const success = await behavior.executeBehavior(goal)

      if (success) {
        console.log(`✅ Triggered ${goal.type} behavior`)
      }

      // Restore needs to 100% after behavior completes
      Object.keys(originalNeeds).forEach((key) => {
        const needKey = key as keyof typeof originalNeeds
        guineaPig.needs[needKey] = 100
      })
    } else {
      console.warn(`❌ Could not trigger ${behaviorType} - goal not selected`)

      // Restore original needs
      Object.keys(originalNeeds).forEach((key) => {
        const needKey = key as keyof typeof originalNeeds
        guineaPig.needs[needKey] = originalNeeds[needKey]
      })
    }
  } catch (error) {
    console.error(`Error executing behavior ${behaviorType}:`, error)

    // Restore original needs on error
    Object.keys(originalNeeds).forEach((key) => {
      const needKey = key as keyof typeof originalNeeds
      guineaPig.needs[needKey] = originalNeeds[needKey]
    })
  }
}

// Add basic environment (floor)
function addEnvironment() {
  // Create bedding texture
  beddingTexture = createBeddingTexture()

  // Floor dimensions from grid config
  const floorWidth = GRID_CONFIG.WIDTH
  const floorDepth = GRID_CONFIG.DEPTH

  // Floor
  const floorGeo = new THREE.PlaneGeometry(floorWidth, floorDepth)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: beddingTexture,
    roughness: 1.0,
    metalness: 0.0,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2 // Rotate to horizontal
  floor.receiveShadow = true
  worldGroup.add(floor)
  environmentObjects.push(floor)

  // Walls
  const wallHeight = ENVIRONMENT_CONFIG.WALL_HEIGHT
  const wallThickness = ENVIRONMENT_CONFIG.WALL_THICKNESS

  const wallGeoH = new THREE.BoxGeometry(floorWidth + wallThickness * 2, wallHeight, wallThickness)
  const wallGeoV = new THREE.BoxGeometry(wallThickness, wallHeight, floorDepth)

  const wall1 = new THREE.Mesh(wallGeoH, floorMat)
  wall1.position.set(0, wallHeight / 2, -floorDepth / 2 - wallThickness / 2)
  wall1.receiveShadow = true
  worldGroup.add(wall1)
  environmentObjects.push(wall1)

  const wall2 = new THREE.Mesh(wallGeoH, floorMat)
  wall2.position.set(0, wallHeight / 2, floorDepth / 2 + wallThickness / 2)
  wall2.receiveShadow = true
  worldGroup.add(wall2)
  environmentObjects.push(wall2)

  const wall3 = new THREE.Mesh(wallGeoV, floorMat)
  wall3.position.set(-floorWidth / 2 - wallThickness / 2, wallHeight / 2, 0)
  wall3.receiveShadow = true
  worldGroup.add(wall3)
  environmentObjects.push(wall3)

  const wall4 = new THREE.Mesh(wallGeoV, floorMat)
  wall4.position.set(floorWidth / 2 + wallThickness / 2, wallHeight / 2, 0)
  wall4.receiveShadow = true
  worldGroup.add(wall4)
  environmentObjects.push(wall4)
}

// Create bedding texture
function createBeddingTexture(): THREE.CanvasTexture {
  const size = ENVIRONMENT_CONFIG.BEDDING_TEXTURE_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base color
  ctx.fillStyle = '#fdfbf7'
  ctx.fillRect(0, 0, size, size)

  // Add bedding pieces
  for (let i = 0; i < ENVIRONMENT_CONFIG.BEDDING_PIECES; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 15 + Math.random() * 25
    const h = 15 + Math.random() * 25
    const rotation = Math.random() * Math.PI
    const val = 230 + Math.floor(Math.random() * 25)

    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.moveTo(-w / 2, -h / 2)
    ctx.lineTo(w / 2, -h / 2 + Math.random() * 5)
    ctx.lineTo(w / 2, h / 2)
    ctx.lineTo(-w / 2 + Math.random() * 5, h / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  return texture
}
</script>

<style>
.habitat-3d-debug__info {
  text-align: center;
  padding-block-end: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.habitat-3d-debug__canvas-wrapper {
  position: relative;
  inline-size: 100%;
  block-size: 70vh;
  background-color: var(--color-bg-canvas);
  overflow: hidden;
}

.habitat-3d-debug__canvas-wrapper canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  cursor: pointer;
}

.habitat-3d-debug__selection-info {
  margin-block-start: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--color-text-primary);
}

/* Mobile-first: Debug row - default 1 column */
.habitat-3d-debug__debug-row {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
  margin-block-start: var(--space-4);
}

/* Tablet and up: 2 columns */
@media (min-width: 768px) {
  .habitat-3d-debug__debug-row {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop and up: 3 columns */
@media (min-width: 1200px) {
  .habitat-3d-debug__debug-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.rotation-debug {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.rotation-debug__input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.rotation-debug__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.rotation-debug__input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
}

.rotation-debug__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.1);
}

.rotation-debug__presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-xs);
}

.rotation-debug__preset {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rotation-debug__preset:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.rotation-debug__preset:active {
  transform: scale(0.98);
}

.rotation-debug__info {
  padding: var(--spacing-sm);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  font-family: var(--font-family-mono);
}
</style>
