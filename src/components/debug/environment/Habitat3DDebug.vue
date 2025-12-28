<template>
  <div class="habitat-3d-debug debug-view__constrained" :class="{ 'habitat-3d-debug--fullscreen': isFullscreen }">
    <!-- Fullscreen header (only visible in fullscreen mode) -->
    <div v-if="isFullscreen" class="habitat-3d-debug__fullscreen-header">
      <h2 class="habitat-3d-debug__title">3D Habitat</h2>
      <div class="habitat-3d-debug__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause"
        >
          {{ gameController.isPaused ? '▶️ Resume Game' : '⏸️ Pause Game' }}
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          Exit Fullscreen
        </button>
      </div>
    </div>

    <!-- Normal header (hidden in fullscreen mode) -->
    <div v-if="!isFullscreen" class="game-view__header">
      <h2>3D Habitat View</h2>
      <div v-if="hasActiveSession && !is2DMode" class="game-view__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause"
        >
          {{ gameController.isPaused ? '▶️ Resume' : '⏸️ Pause' }}
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          ⛶ Enter Fullscreen
        </button>
      </div>
    </div>

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
        <div class="habitat-3d-debug__canvas-wrapper">
          <!-- Activity Feed Panel (overlay with integrated tab) -->
          <SidePanel3D
            :is-open="showActivityFeed"
            side="left"
            color="yellow"
            title="Activity Log"
            icon="📝"
            @toggle="toggleActivityFeed"
          >
            <div v-if="activityMessages.length === 0" class="activity-feed-panel__empty">
              💭 No activity yet...
            </div>
            <div v-else class="activity-feed-panel__messages">
              <div
                v-for="msg in activityMessages.slice(0, 50)"
                :key="msg.id"
                class="activity-feed-panel__message"
                :class="`activity-feed-panel__message--${msg.category}`"
              >
                <span class="activity-feed-panel__emoji">{{ msg.emoji || '📝' }}</span>
                <span class="activity-feed-panel__text">{{ msg.message }}</span>
                <span class="activity-feed-panel__time">{{ formatTime(msg.timestamp) }}</span>
              </div>
            </div>
          </SidePanel3D>

          <!-- Inventory Panel (overlay on right side) -->
          <Inventory3DPanel
            :is-open="showInventory"
            @toggle="toggleInventory"
            @select-item="handleInventorySelect"
            @deselect-item="handleInventoryDeselect"
          />

            <canvas
              ref="canvasRef"
              :class="{ 'habitat-3d-debug__canvas--placing': placementMode }"
              @click="handleCanvasClick"
              @mousemove="handleCanvasMouseMove"
            ></canvas>

            <!-- Guinea Pig Info Menu (replaces floating action buttons) -->
            <GuineaPigInfoMenu
              v-if="selectedGuineaPigId && selectedGuineaPig"
              :guinea-pig="selectedGuineaPig"
              :position="guineaPigMenuPosition"
              :is-controlled="controlledGuineaPigId === selectedGuineaPigId"
              :time-remaining="controlTimeRemaining"
              @close="handleDeselect"
              @take-control="handleTakeControl"
              @release-control="releaseControl"
            />

            <!-- Container Contents Menu (shows what's in bowl/rack) -->
            <ContainerContentsMenu
              :show="showContainerMenu"
              :position="menuPosition"
              :container-type="selectedContainerType || 'bowl'"
              :foods="currentBowlContents"
              :bowl-capacity="currentBowlCapacity"
              :hay-servings="currentHayServings"
              :hay-capacity="4"
              :freshness="currentHayFreshness"
              @close="closeContainerMenu"
              @fill="handleContainerFill"
              @clear="handleContainerClear"
              @remove-food="handleRemoveFood"
            />

            <!-- Floating Inventory Menu (for adding items to containers) -->
            <InventoryItemMenu
              :show="showInventoryMenu"
              :position="menuPosition"
              :title="menuTitle"
              :items="currentMenuItems"
              :empty-message="menuEmptyMessage"
              @close="closeInventoryMenu"
              @select="handleAddItemToContainer"
            />

            <!-- Water Bottle Menu -->
            <WaterBottleMenu
              v-if="showWaterBottleMenu"
              :water-level="habitatConditions.waterLevel"
              :position="waterBottleMenuPosition"
              @close="closeWaterBottleMenu"
              @refill="handleRefillWater"
            />

            <!-- Clean Cage Dialog -->
            <CleanCageDialog
              v-model="showCleanCageDialog"
              :dirtiness="habitatDirtiness"
              :bedding-needed="beddingNeeded"
              :bedding-available="beddingAvailable"
              @confirm="handleCleanCageConfirm"
            />

            <!-- Hay Management Dialog -->
            <HayManagementDialog v-model="showHayManagementDialog" />

            <!-- Action Result Dialog (water refill, quick clean, etc.) -->
            <ActionResultDialog
              v-model="showActionResultDialog"
              :icon="actionResultIcon"
              :title="actionResultTitle"
              :message="actionResultMessage"
              :stats="actionResultStats"
            />

            <!-- Right FABs - Actions -->
          <div class="game-fab-container">
            <!-- Guinea Pigs FAB -->
            <div class="game-fab-row">
              <button
                class="game-fab game-fab--pink"
                :class="{ 'game-fab--active': activePanel === 'guinea-pigs' }"
                @click="togglePanel('guinea-pigs')"
                title="Guinea Pigs"
              >
                🐹
              </button>
            </div>

            <!-- Habitat Care FAB with subactions -->
            <div class="game-fab-row">
              <div
                v-if="activePanel === 'habitat-care'"
                class="game-fab-subactions"
              >
                <button class="game-fab-sub game-fab-sub--green" @click="fabFillHay" title="Fill All Hay Racks">🌾</button>
                <button class="game-fab-sub game-fab-sub--green" @click="fabRefillWater" title="Refill Water">💧</button>
                <button class="game-fab-sub game-fab-sub--green" @click="fabQuickClean" title="Quick Clean">🧹</button>
                <button class="game-fab-sub game-fab-sub--green" @click="fabCleanHabitat" title="Clean Habitat">🧽</button>
              </div>
              <button
                class="game-fab game-fab--green"
                :class="{ 'game-fab--active': activePanel === 'habitat-care' }"
                @click="togglePanel('habitat-care')"
                title="Habitat Care"
              >
                🏠
              </button>
            </div>

          </div>

          <!-- Left FAB - Help -->
          <div class="game-fab-container game-fab-container--left">
            <div class="game-fab-row">
              <button
                class="game-fab game-fab--cyan"
                :class="{ 'game-fab--active': showHelp }"
                @click="showHelp = !showHelp"
                title="Help & Controls"
              >
                ❓
              </button>
            </div>
          </div>

          <!-- Help Dialog -->
          <HelpDialog v-model="showHelp" />
        </div>

      </div>
    </div>

    <!-- Needs Panel (below 3D canvas) -->
    <div v-if="hasActiveSession && !is2DMode" class="habitat-3d-debug__needs-row">
      <NeedsPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { use3DScene } from '../../../composables/use3DScene'
import { use3DCamera } from '../../../composables/use3DCamera'
import { use3DSync } from '../../../composables/use3DSync'
import { updateGuineaPigAnimation } from '../../../composables/use3DGuineaPig'
import { use3DItems } from '../../../composables/use3DItems'
import { use3DPoop } from '../../../composables/use3DPoop'
import { use3DBehavior } from '../../../composables/3d/use3DBehavior'
import { use3DMovement } from '../../../composables/3d/use3DMovement'
import {
  updateWaterBottleLevel,
  startWaterBottleBubbles,
  stopWaterBottleBubbles,
  updateWaterBottleBubbles
} from '../../../composables/3d-models/containers/water-bottles'
import GuineaPigInfoMenu from '../../game/GuineaPigInfoMenu.vue'
import WaterBottleMenu from '../../game/WaterBottleMenu.vue'
import InventoryItemMenu from '../../basic/InventoryItemMenu.vue'
import ContainerContentsMenu from '../../basic/ContainerContentsMenu.vue'
import CleanCageDialog from '../../game/dialogs/CleanCageDialog.vue'
import HayManagementDialog from '../../game/dialogs/HayManagementDialog.vue'
import ActionResultDialog, { type ActionStat } from '../../game/dialogs/ActionResultDialog.vue'
import HelpDialog from '../../game/dialogs/HelpDialog.vue'
import NeedsPanel from './NeedsPanel.vue'
import Inventory3DPanel from '../../game/Inventory3DPanel.vue'
import SidePanel3D from '../../game/SidePanel3D.vue'
import type { InventoryMenuItem } from '../../basic/InventoryItemMenu.vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGameViewStore } from '../../../stores/gameViewStore'
import { useMovement3DStore } from '../../../stores/movement3DStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useGameController } from '../../../stores/gameController'
import { useLoggingStore } from '../../../stores/loggingStore'
import { GRID_CONFIG, ENVIRONMENT_CONFIG, ANIMATION_CONFIG, CLOUD_CONFIG } from '../../../constants/3d'
import { CONSUMPTION } from '../../../constants/supplies'
import { disposeObject3D } from '../../../utils/three-cleanup'
import { worldToGrid } from '../../../composables/3d-models/shared/utils'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedGuineaPigId = ref<string | null>(null)
const guineaPigMenuPosition = ref({ x: 0, y: 0 })

// Fullscreen mode state
const isFullscreen = ref(false)

// Floating Action Button panel state
const activePanel = ref<string | null>(null)

// Activity Feed panel state
const showActivityFeed = ref(false)

// Inventory panel state
const showInventory = ref(false)

// Help panel state
const showHelp = ref(false)

// Placement mode state
const placementMode = ref<{
  itemId: string
  itemName: string
  isWaterBottle: boolean
} | null>(null)
let placementPreview: THREE.Group | null = null
let isPlacementValid = false

// Take Control mode state
const controlledGuineaPigId = ref<string | null>(null)
const CONTROL_AUTO_RELEASE_MS = 30000 // 30 seconds
let controlReleaseTimer: number | null = null
let controlCountdownInterval: number | null = null
const controlTimeRemaining = ref(0) // seconds remaining

// Stores
const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditions()
const petStoreManager = usePetStoreManager()
const loggingStore = useLoggingStore()
const gameViewStore = useGameViewStore()
const movement3DStore = useMovement3DStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const gameController = useGameController()

// Container menu state (for bowls and hay racks)
const selectedContainerId = ref<string | null>(null)
const selectedContainerType = ref<'bowl' | 'hay_rack' | null>(null)
const showContainerMenu = ref(false)
const showInventoryMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })

// Computed
const hasActiveSession = computed(() => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0)
const is2DMode = computed(() => gameViewStore.mode === '2d')
const selectedGuineaPig = computed(() => {
  if (!selectedGuineaPigId.value) return null
  return guineaPigStore.activeGuineaPigs.find(gp => gp.id === selectedGuineaPigId.value)
})

// Activity Feed computed properties (reversed so newest messages appear first)
const activityMessages = computed(() => [...loggingStore.activityMessages].reverse())

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

// Container contents computed properties
const currentBowlContents = computed(() => {
  if (!selectedContainerId.value || selectedContainerType.value !== 'bowl') {
    return []
  }
  return habitatConditions.getBowlContents(selectedContainerId.value)
})

const currentBowlCapacity = computed(() => {
  if (!selectedContainerId.value) return 3
  const bowlItem = suppliesStore.getItemById(selectedContainerId.value)
  return bowlItem?.stats?.foodCapacity || 3
})

const currentHayServings = computed(() => {
  if (!selectedContainerId.value || selectedContainerType.value !== 'hay_rack') {
    return 0
  }
  return habitatConditions.getHayRackContents(selectedContainerId.value).length
})

const currentHayFreshness = computed(() => {
  if (!selectedContainerId.value || selectedContainerType.value !== 'hay_rack') {
    return 100
  }
  return habitatConditions.getHayRackFreshness(selectedContainerId.value)
})

// Unified 3D behavior composables registry (for autonomous behavior)
const behaviors = new Map<string, ReturnType<typeof use3DBehavior>>()

// Water bottle menu state
const showWaterBottleMenu = ref(false)
const waterBottleMenuPosition = ref({ x: 0, y: 0 })

// Clean cage dialog state
const showCleanCageDialog = ref(false)

// Hay management dialog state
const showHayManagementDialog = ref(false)

// Action result dialog state (for water refill, quick clean, etc.)
const showActionResultDialog = ref(false)
const actionResultIcon = ref('')
const actionResultTitle = ref('')
const actionResultMessage = ref('')
const actionResultStats = ref<ActionStat[]>([])

// Computed properties for clean cage dialog
const habitatDirtiness = computed(() => habitatConditions.dirtiness)
const beddingNeeded = computed(() => habitatConditions.calculateBeddingNeeded())
const beddingAvailable = computed(() => habitatConditions.getTotalBeddingAvailable())

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

          // Create and start unified behavior
          const behavior = use3DBehavior(gp.id)
          behaviors.set(gp.id, behavior)

          // Hook up bubble animation to drinking events
          behavior.onDrinkingStart(() => {
            const waterBottleModel = findWaterBottleModel()
            if (waterBottleModel) {
              startWaterBottleBubbles(waterBottleModel)
            }
          })
          behavior.onDrinkingEnd(() => {
            const waterBottleModel = findWaterBottleModel()
            if (waterBottleModel) {
              stopWaterBottleBubbles(waterBottleModel)
            }
          })

          // Shelter event logging (movement handled by behavior system)
          behavior.onShelteringStart(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} settled in shelter`)
          })
          behavior.onShelteringEnd(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} exited shelter`)
          })

          // Sleep event logging
          behavior.onSleepingStart(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} fell asleep`)
          })
          behavior.onSleepingEnd(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} woke up`)
          })

          // Groom event logging
          behavior.onGroomingStart(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} started grooming`)
          })
          behavior.onGroomingEnd(() => {
            console.log(`[Habitat3D] Guinea pig ${gp.id} finished grooming`)
          })

          behavior.start()

          console.log(`[Habitat3D] Initialized guinea pig ${gp.id} with unified behavior`)
        }
      }

      // Cleanup removed guinea pigs
      const oldIds = (oldGuineaPigs || []).map(gp => gp.id)
      const newIds = activeGuineaPigs.map(gp => gp.id)

      for (const oldId of oldIds) {
        if (!newIds.includes(oldId)) {
          // Stop and remove behavior
          const behavior = behaviors.get(oldId)
          if (behavior) {
            behavior.stop()
            behaviors.delete(oldId)
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
let lastAnimationTime: number = 0

// Guinea pig models registry (from use3DSync)
let guineaPigModels: Map<string, THREE.Group> | null = null
let cleanupSync: (() => void) | null = null

// Items and poop cleanup
let cleanupItems: (() => void) | null = null
let cleanupPoop: (() => void) | null = null
let handlePoopClick: ((clickedObject: THREE.Object3D) => string | null) | null = null

// Selection ring
let selectionRing: THREE.Mesh | null = null
const SELECTION_RING_COLOR_DEFAULT = 0x00ff00 // Green
const SELECTION_RING_COLOR_CONTROLLED = 0x0088ff // Blue

// Control mode movement controller
let controlMovement: ReturnType<typeof use3DMovement> | null = null

// Environment objects that need disposal
let environmentObjects: THREE.Object3D[] = []
let beddingTexture: THREE.CanvasTexture | null = null

// Cloud objects (added to scene, not worldGroup, so they don't rotate)
let cloudObjects: THREE.Group[] = []

// Item models registry
let itemModels: Map<string, THREE.Group> | null = null

// Physics composable
let physics3D: ReturnType<typeof import('../../../composables/3d/use3DPhysics').use3DPhysics> | null = null

onMounted(() => {
  if (!canvasRef.value) return

  // Initialize renderer
  const renderer = initRenderer()
  if (!renderer) return

  // Setup camera controls
  // Disable arrow keys for camera when in Take Control mode (arrows control guinea pig instead)
  const cameraControls = use3DCamera(camera, worldGroup, canvasRef.value, {
    disableArrowKeys: () => !!controlledGuineaPigId.value
  })
  updateCameraPosition = cameraControls.updateCameraPosition
  cleanupCamera = cameraControls.cleanup

  // Setup position sync with 3D movement mode
  const syncResult = use3DSync(worldGroup, { use3DMovement: true })
  guineaPigModels = syncResult.guineaPigModels
  cleanupSync = syncResult.cleanup

  // Initialize guinea pigs and start hunger behaviors when they become active
  initializeGuineaPigBehaviors()

  // Setup habitat items (includes physics for ball/stick)
  const itemsResult = use3DItems(worldGroup)
  itemModels = itemsResult.itemModels
  physics3D = itemsResult.physics3D
  cleanupItems = itemsResult.cleanup

  // Setup poop pellets
  const poopResult = use3DPoop(worldGroup)
  cleanupPoop = poopResult.cleanup
  handlePoopClick = poopResult.handlePoopClick

  // Add basic environment
  addEnvironment()

  // Create clouds in the sky
  createClouds()

  // Create selection ring
  createSelectionRing()

  // Add window resize listener
  window.addEventListener('resize', handleResize)

  // Add keyboard listener for escape to release control
  window.addEventListener('keydown', handleKeyDown)

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

  // Dispose cloud objects
  cloudObjects.forEach(cloud => {
    worldGroup.remove(cloud)
    disposeObject3D(cloud)
  })
  cloudObjects = []

  // Stop and clear all behaviors
  behaviors.forEach(behavior => behavior.stop())
  behaviors.clear()

  // Cleanup control mode
  if (controlMovement) {
    controlMovement.cleanup()
    controlMovement = null
  }
  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
    controlReleaseTimer = null
  }
  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
    controlCountdownInterval = null
  }
  controlledGuineaPigId.value = null
  controlTimeRemaining.value = 0

  // Cleanup placement mode
  if (placementPreview) {
    worldGroup.remove(placementPreview)
    disposeObject3D(placementPreview)
    placementPreview = null
  }
  placementMode.value = null

  // Cleanup fullscreen mode
  if (isFullscreen.value) {
    document.body.classList.remove('habitat-fullscreen')
  }

  // Clear movement3D store
  movement3DStore.clearAllGuineaPigs()

  // Cleanup scene and renderer
  cleanupScene()

  // Remove event listeners
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

/**
 * Find the water bottle model in the scene
 */
function findWaterBottleModel(): THREE.Group | null {
  if (!itemModels) return null

  for (const [itemId, model] of itemModels.entries()) {
    const item = suppliesStore.getItemById(itemId)
    if (item?.stats?.itemType === 'water_bottle') {
      return model
    }
  }
  return null
}

// Animation loop
function animate(currentTime: number = 0) {
  animationId = requestAnimationFrame(animate)

  // Calculate delta time in seconds
  const deltaTime = lastAnimationTime ? (currentTime - lastAnimationTime) / 1000 : 0.016
  lastAnimationTime = currentTime

  // Update camera position based on keyboard input
  if (updateCameraPosition) {
    updateCameraPosition()
  }

  // Update guinea pig animations (blinking, walking, breathing, sleeping, grooming)
  if (guineaPigModels) {
    guineaPigModels.forEach((model, guineaPigId) => {
      // Get movement state from store to determine if walking
      const state = movement3DStore.getGuineaPigState(guineaPigId)
      const isMoving = state?.isMoving ?? false

      // Check activity state from behavior
      const behavior = behaviors.get(guineaPigId)
      const isSleeping = behavior?.currentActivity.value === 'sleeping'
      const isGrooming = behavior?.currentActivity.value === 'grooming'

      updateGuineaPigAnimation(model, isMoving, deltaTime, gameController.isPaused, isSleeping, isGrooming)
    })
  }

  // Update cloud positions (drift slowly) - only when not paused
  if (!gameController.isPaused) {
    updateClouds(deltaTime)
  }

  // Update physics for items (ball, stick) - only when not paused
  if (!gameController.isPaused && physics3D) {
    physics3D.updatePhysics(deltaTime)
  }

  // Update water bottle water level and bubbles
  const waterBottleModel = findWaterBottleModel()
  if (waterBottleModel) {
    updateWaterBottleLevel(waterBottleModel, habitatConditions.waterLevel)
    // Only animate bubbles when not paused
    if (!gameController.isPaused) {
      updateWaterBottleBubbles(waterBottleModel, deltaTime)
    }
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
  if (!selectionRing || !guineaPigModels) return

  // Show ring on selected guinea pig, or controlled guinea pig if none selected
  const targetId = selectedGuineaPigId.value || controlledGuineaPigId.value
  if (!targetId) {
    selectionRing.visible = false
    return
  }

  const targetModel = guineaPigModels.get(targetId)
  if (targetModel) {
    selectionRing.position.x = targetModel.position.x
    selectionRing.position.z = targetModel.position.z
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

  // Priority 0: Placement mode - place item
  if (placementMode.value) {
    if (isPlacementValid) {
      placeItem()
    }
    // If invalid, just ignore the click (stay in placement mode)
    return
  }

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
    // Priority 1: Check ALL intersections for poop (allows clicking poop inside shelters)
    if (handlePoopClick) {
      for (const intersection of intersects) {
        const poopId = handlePoopClick(intersection.object)
        if (poopId) {
          habitatConditions.removePoop(poopId)
          console.log('Removed poop:', poopId)
          return
        }
      }
    }

    const clickedObject = intersects[0].object

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
        // If in container fill mode, try to add the selected item to the container
        if (containerFillMode.value) {
          const { itemId, category } = containerFillMode.value
          let success = false

          // Validate container type matches item category
          if (clickedContainerType === 'bowl') {
            // Bowls accept both food and hay
            success = habitatConditions.addFoodToBowl(clickedContainerId, itemId)
          } else if (clickedContainerType === 'hay_rack' && category === 'hay') {
            // Hay racks only accept hay
            success = habitatConditions.addHayToRack(clickedContainerId, itemId)
          }

          if (success) {
            console.log(`Added ${itemId} to ${clickedContainerType} ${clickedContainerId}`)

            // Check if there are still servings remaining
            const remainingServings = inventoryStore.getTotalServings(itemId)
            if (remainingServings <= 0) {
              // No more servings, exit container fill mode
              exitContainerFillMode()
            }
            // Otherwise stay in container fill mode so user can continue adding
            return
          }

          // If add failed, exit container fill mode and show the popover
          exitContainerFillMode()
          console.log(`Could not add ${itemId} to ${clickedContainerType}, showing popover instead`)
        }

        // Show container contents menu (shows what's in the container)
        selectedContainerId.value = clickedContainerId
        selectedContainerType.value = clickedContainerType
        showContainerMenu.value = true
        // Use viewport coordinates (for Floating UI)
        menuPosition.value = {
          x: event.clientX,
          y: event.clientY
        }
        console.log(`Clicked ${clickedContainerType}:`, clickedContainerId)
        return
      }

      // Check if water bottle was clicked
      let clickedWaterBottle = false
      itemModels.forEach((model, itemId) => {
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            const item = suppliesStore.getItemById(itemId)
            if (item?.stats?.itemType === 'water_bottle') {
              clickedWaterBottle = true
              showWaterBottleMenu.value = true
              // Use viewport coordinates (for Floating UI)
              waterBottleMenuPosition.value = {
                x: event.clientX,
                y: event.clientY
              }
              console.log('Clicked water bottle:', itemId)
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedWaterBottle) {
        return
      }

      // Priority 2.5: Check if physics item (ball/stick) was clicked
      if (physics3D) {
        let clickedPhysicsItem = false
        itemModels.forEach((model, itemId) => {
          if (clickedPhysicsItem) return // Already handled
          let current: THREE.Object3D | null = clickedObject
          while (current) {
            if (current === model && physics3D!.hasPhysics(itemId)) {
              // Push the physics item in the ray direction
              physics3D!.handleClick(itemId, raycaster.ray.direction)
              clickedPhysicsItem = true
              console.log('Pushed physics item:', itemId)
              break
            }
            current = current.parent
          }
        })

        if (clickedPhysicsItem) {
          return
        }
      }
    }

    // Priority 3: Check if guinea pig was clicked
    let clickedModel: THREE.Group | null = null

    guineaPigModels.forEach((model, id) => {
      if (clickedObject.parent === model || clickedObject.parent?.parent === model) {
        clickedModel = model
        selectedGuineaPigId.value = id
        // Set menu position using viewport coordinates (for Floating UI)
        guineaPigMenuPosition.value = {
          x: event.clientX,
          y: event.clientY
        }
      }
    })

    if (clickedModel) {
      // If we clicked a different guinea pig while controlling one, release control
      if (controlledGuineaPigId.value && selectedGuineaPigId.value !== controlledGuineaPigId.value) {
        releaseControl()
      }
      console.log('Selected guinea pig:', selectedGuineaPigId.value)
      return
    }

    // If in control mode, check if we clicked on the floor
    if (controlledGuineaPigId.value && controlMovement) {
      // Find intersection with floor (y = 0 plane)
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const worldIntersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(floorPlane, worldIntersection)

      if (worldIntersection) {
        // Convert from worldGroup local space - need to account for worldGroup position
        const targetPos = {
          x: worldIntersection.x,
          y: 0,
          z: worldIntersection.z
        }

        // Check if target is within bounds
        if (movement3DStore.isInBounds(targetPos)) {
          console.log(`[Habitat3D] Control mode: Moving to (${targetPos.x.toFixed(1)}, ${targetPos.z.toFixed(1)})`)
          controlMovement.moveTo(targetPos)
          return
        } else {
          console.log('[Habitat3D] Control mode: Target out of bounds')
        }
      }
    }
  }

  // Clicked on empty space - deselect guinea pig and close menus
  selectedGuineaPigId.value = null
  if (showContainerMenu.value) {
    closeContainerMenu()
  }
  if (showInventoryMenu.value) {
    closeInventoryMenu()
  }
  if (showWaterBottleMenu.value) {
    closeWaterBottleMenu()
  }
}

// Close the container contents menu
function closeContainerMenu() {
  showContainerMenu.value = false
  selectedContainerId.value = null
  selectedContainerType.value = null
}

// Handle fill button - for hay racks, fill directly; for bowls, show inventory menu
function handleContainerFill() {
  if (!selectedContainerId.value || !selectedContainerType.value) return

  if (selectedContainerType.value === 'hay_rack') {
    // Fill hay rack directly to capacity (or as much as available)
    const rackId = selectedContainerId.value
    const hayItemId = getFirstAvailableHayItemId()

    if (!hayItemId) {
      console.log('[Habitat3D] No hay available in inventory')
      return
    }

    // Fill until rack is full or we run out of hay
    let added = 0
    const maxCapacity = CONSUMPTION.HAY_RACK_MAX_CAPACITY
    const currentServings = habitatConditions.getHayRackContents(rackId).length
    const slotsToFill = maxCapacity - currentServings

    for (let i = 0; i < slotsToFill; i++) {
      if (habitatConditions.addHayToRack(rackId, hayItemId)) {
        added++
      } else {
        break // No more hay available
      }
    }

    if (added > 0) {
      console.log(`[Habitat3D] Filled hay rack with ${added} servings`)
      loggingStore.addPlayerAction(
        `Filled hay rack with ${added} serving${added > 1 ? 's' : ''}`,
        '🌾'
      )
    }
    // Don't close the menu - let user see the updated state
  } else {
    // For food bowls, show inventory menu to select food type
    showContainerMenu.value = false
    showInventoryMenu.value = true
  }
}

// Get first available hay item ID from inventory
function getFirstAvailableHayItemId(): string | null {
  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (supplyItem?.category === 'hay') {
      const servings = inventoryStore.getTotalServings(invItem.itemId)
      if (servings > 0) {
        return invItem.itemId
      }
    }
  }
  return null
}

// Handle clear button - empty the container
function handleContainerClear() {
  if (!selectedContainerId.value || !selectedContainerType.value) return

  if (selectedContainerType.value === 'bowl') {
    habitatConditions.clearBowl(selectedContainerId.value)
    console.log(`[Habitat3D] Cleared bowl ${selectedContainerId.value}`)
    loggingStore.addPlayerAction('Cleared food bowl', '🥗')
  } else if (selectedContainerType.value === 'hay_rack') {
    habitatConditions.clearHayRack(selectedContainerId.value)
    console.log(`[Habitat3D] Cleared hay rack ${selectedContainerId.value}`)
    loggingStore.addPlayerAction('Cleared hay rack', '🌾')
  }

  closeContainerMenu()
}

// Handle removing individual food item from bowl
function handleRemoveFood(foodIndex: number) {
  if (!selectedContainerId.value || selectedContainerType.value !== 'bowl') return

  const success = habitatConditions.removeFoodFromBowl(selectedContainerId.value, foodIndex)
  if (success) {
    console.log(`[Habitat3D] Removed food at index ${foodIndex} from bowl ${selectedContainerId.value}`)
  }
}

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
      const supplyItem = suppliesStore.getItemById(itemId)
      const foodName = supplyItem?.name || 'food'
      const emoji = supplyItem?.emoji || '🥗'
      loggingStore.addPlayerAction(`Added ${foodName} to food bowl`, emoji)
    } else {
      console.warn(`Failed to add ${itemId} to bowl`)
    }
  } else if (selectedContainerType.value === 'hay_rack') {
    success = habitatConditions.addHayToRack(selectedContainerId.value, itemId)
    if (success) {
      console.log(`Added ${itemId} to hay rack ${selectedContainerId.value}`)
      loggingStore.addPlayerAction('Added hay to hay rack', '🌾')
    } else {
      console.warn(`Failed to add ${itemId} to hay rack`)
    }
  }

  // Close menu after adding
  closeInventoryMenu()
}

// Water bottle menu handlers
function closeWaterBottleMenu() {
  showWaterBottleMenu.value = false
}

function handleRefillWater() {
  const previousLevel = habitatConditions.waterLevel
  habitatConditions.refillWater()
  const amountFilled = 100 - previousLevel
  console.log('[Habitat3D] Water bottle refilled')
  closeWaterBottleMenu()

  // Log player action
  if (amountFilled >= 1) {
    loggingStore.addPlayerAction(`Refilled water bottle (+${amountFilled.toFixed(0)}%)`, '💧')
  }

  // Show result dialog
  actionResultIcon.value = '💧'
  actionResultTitle.value = 'Water Refilled!'
  actionResultMessage.value = amountFilled < 1
    ? 'The water bottle was already full!'
    : ''
  actionResultStats.value = amountFilled >= 1
    ? [
        { label: 'Water Added', value: `${amountFilled.toFixed(0)}%` },
        { label: 'Water Level', value: '100%' }
      ]
    : [{ label: 'Water Level', value: '100%' }]
  showActionResultDialog.value = true
}

// Guinea pig menu handlers
function handleDeselect() {
  selectedGuineaPigId.value = null
}

function handleTakeControl() {
  if (!selectedGuineaPigId.value) return

  const gpId = selectedGuineaPigId.value

  // If already controlling a different guinea pig, release it first
  if (controlledGuineaPigId.value && controlledGuineaPigId.value !== gpId) {
    releaseControl()
  }

  // Enter control mode
  controlledGuineaPigId.value = gpId

  // Pause the autonomous behavior
  const behavior = behaviors.get(gpId)
  if (behavior) {
    behavior.pause()
    console.log(`[Habitat3D] Paused behavior for ${gpId}`)
  }

  // Create movement controller for manual control
  controlMovement = use3DMovement(gpId)

  // Update selection ring color to blue
  updateSelectionRingColor(SELECTION_RING_COLOR_CONTROLLED)

  // Start countdown timer display
  controlTimeRemaining.value = Math.floor(CONTROL_AUTO_RELEASE_MS / 1000)

  // Start countdown interval (updates every second)
  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
  }
  controlCountdownInterval = window.setInterval(() => {
    controlTimeRemaining.value = Math.max(0, controlTimeRemaining.value - 1)
  }, 1000)

  // Start auto-release timer
  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
  }
  controlReleaseTimer = window.setTimeout(() => {
    console.log('[Habitat3D] Auto-releasing control after 30 seconds')
    releaseControl()
  }, CONTROL_AUTO_RELEASE_MS)

  console.log(`[Habitat3D] Took control of guinea pig: ${gpId}`)
}

function releaseControl() {
  if (!controlledGuineaPigId.value) return

  const gpId = controlledGuineaPigId.value

  // Cleanup movement controller
  if (controlMovement) {
    controlMovement.cleanup()
    controlMovement = null
  }

  // Resume autonomous behavior
  const behavior = behaviors.get(gpId)
  if (behavior) {
    behavior.resume()
    console.log(`[Habitat3D] Resumed behavior for ${gpId}`)
  }

  // Clear control state
  controlledGuineaPigId.value = null
  controlTimeRemaining.value = 0

  // Clear auto-release timer
  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
    controlReleaseTimer = null
  }

  // Clear countdown interval
  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
    controlCountdownInterval = null
  }

  // Reset selection ring color to green
  updateSelectionRingColor(SELECTION_RING_COLOR_DEFAULT)

  console.log(`[Habitat3D] Released control of guinea pig: ${gpId}`)
}

function updateSelectionRingColor(color: number) {
  if (selectionRing) {
    const material = selectionRing.material as THREE.MeshBasicMaterial
    material.color.setHex(color)
  }
}

// Movement distance for keyboard-controlled guinea pig
const KEYBOARD_MOVE_DISTANCE = 3.0

function handleKeyDown(event: KeyboardEvent) {
  // Escape priority order:
  // 1. Close inventory if open (but keep placement/container mode active)
  // 2. Cancel placement mode if active
  // 3. Cancel container fill mode if active
  // 4. Release control mode
  // 5. Exit fullscreen
  if (event.key === 'Escape') {
    if (showInventory.value) {
      showInventory.value = false
    } else if (placementMode.value) {
      exitPlacementMode()
    } else if (containerFillMode.value) {
      exitContainerFillMode()
    } else if (controlledGuineaPigId.value) {
      releaseControl()
    } else if (isFullscreen.value) {
      toggleFullscreen()
    }
    return
  }

  // Arrow keys control guinea pig when in Take Control mode
  if (controlledGuineaPigId.value && controlMovement) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    if (arrowKeys.includes(event.key)) {
      event.preventDefault()

      // Get current guinea pig position
      const state = movement3DStore.getGuineaPigState(controlledGuineaPigId.value)
      if (!state) return

      // Calculate target position based on arrow key
      let targetX = state.worldPosition.x
      let targetZ = state.worldPosition.z

      switch (event.key) {
        case 'ArrowUp':
          targetZ -= KEYBOARD_MOVE_DISTANCE
          break
        case 'ArrowDown':
          targetZ += KEYBOARD_MOVE_DISTANCE
          break
        case 'ArrowLeft':
          targetX -= KEYBOARD_MOVE_DISTANCE
          break
        case 'ArrowRight':
          targetX += KEYBOARD_MOVE_DISTANCE
          break
      }

      const targetPos = { x: targetX, y: 0, z: targetZ }

      // Check bounds and move
      if (movement3DStore.isInBounds(targetPos)) {
        controlMovement.moveTo(targetPos)
      }
    }
  }
}

/**
 * Toggle fullscreen mode - hides debug header/nav for immersive view
 */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value

  // Add/remove body class to hide debug-view header and nav
  if (isFullscreen.value) {
    document.body.classList.add('habitat-fullscreen')
  } else {
    document.body.classList.remove('habitat-fullscreen')
  }
}

/**
 * Toggle floating action button panel
 */
function togglePanel(panelId: string) {
  if (activePanel.value === panelId) {
    activePanel.value = null
    console.log(`[Habitat3D] Closed panel: ${panelId}`)
  } else {
    activePanel.value = panelId
    console.log(`[Habitat3D] Opened panel: ${panelId}`)
  }
}

/**
 * Habitat Care FAB subaction handlers
 * Note: Subactions stay open after clicking - user closes by clicking main FAB again
 */
function fabCleanHabitat() {
  // Show clean cage dialog with bedding selection
  showCleanCageDialog.value = true
}

function handleCleanCageConfirm(beddingType: string) {
  const result = habitatConditions.cleanCage(beddingType)
  if (result.success) {
    console.log(`[Habitat3D] Clean habitat: ${result.message}`)
    loggingStore.addPlayerAction(result.message, '🧹')
  } else {
    console.warn(`[Habitat3D] Clean habitat failed: ${result.message}`)
  }
}

function fabQuickClean() {
  const result = habitatConditions.quickClean()
  console.log(`[Habitat3D] Quick clean: ${result.message}`)

  // Log player action
  if (result.success) {
    loggingStore.addPlayerAction(result.message, '🧽')
  }

  // Show result dialog
  actionResultIcon.value = '🧹'
  actionResultTitle.value = 'Quick Clean Complete!'
  actionResultMessage.value = result.poopsRemoved === 0
    ? 'The habitat was already clean!'
    : ''
  actionResultStats.value = result.poopsRemoved > 0
    ? [
        { label: 'Poops Removed', value: result.poopsRemoved },
        { label: 'Cleanliness Boost', value: `+${Math.min(20, result.poopsRemoved * 5)}%` }
      ]
    : []
  showActionResultDialog.value = true
}

function fabRefillWater() {
  const previousLevel = habitatConditions.waterLevel
  habitatConditions.refillWater()
  const amountFilled = 100 - previousLevel
  console.log('[Habitat3D] Water refilled')

  // Log player action
  if (amountFilled >= 1) {
    loggingStore.addPlayerAction(`Refilled water bottle (+${amountFilled.toFixed(0)}%)`, '💧')
  }

  // Show result dialog
  actionResultIcon.value = '💧'
  actionResultTitle.value = 'Water Refilled!'
  actionResultMessage.value = amountFilled < 1
    ? 'The water bottle was already full!'
    : ''
  actionResultStats.value = amountFilled >= 1
    ? [
        { label: 'Water Added', value: `${amountFilled.toFixed(0)}%` },
        { label: 'Water Level', value: '100%' }
      ]
    : [{ label: 'Water Level', value: '100%' }]
  showActionResultDialog.value = true
}

function fabFillHay() {
  // Show hay management dialog instead of directly filling
  showHayManagementDialog.value = true
}

/**
 * Activity Feed panel handlers
 */
function toggleActivityFeed() {
  showActivityFeed.value = !showActivityFeed.value
}

/**
 * Inventory panel handlers
 */
function toggleInventory() {
  showInventory.value = !showInventory.value
}

function handleInventorySelect(itemId: string) {
  console.log(`[Habitat3D] Selected inventory item: ${itemId}`)
  const supplyItem = suppliesStore.getItemById(itemId)
  if (!supplyItem) return

  if (supplyItem.category === 'habitat_item') {
    // Habitat items are placed directly in the habitat
    enterPlacementMode(itemId)
  } else if (supplyItem.category === 'food' || supplyItem.category === 'hay') {
    // Food/hay items enter container fill mode - user clicks on bowl/rack to add
    enterContainerFillMode(itemId, supplyItem.category)
  }
}

function handleInventoryDeselect() {
  // Exit container fill mode when item is deselected in inventory
  if (containerFillMode.value) {
    exitContainerFillMode()
  }
  // Also exit placement mode if active
  if (placementMode.value) {
    exitPlacementMode()
  }
}

// Container fill mode state
const containerFillMode = ref<{ itemId: string; category: string } | null>(null)

function enterContainerFillMode(itemId: string, category: string) {
  // Exit any existing modes
  if (placementMode.value) {
    exitPlacementMode()
  }
  containerFillMode.value = { itemId, category }
  console.log(`[Habitat3D] Entered container fill mode for ${category}: ${itemId}`)
}

function exitContainerFillMode() {
  containerFillMode.value = null
  console.log('[Habitat3D] Exited container fill mode')
}

/**
 * Enter placement mode for an item
 */
function enterPlacementMode(itemId: string) {
  const supplyItem = suppliesStore.getItemById(itemId)
  if (!supplyItem) return

  // Exit any existing placement mode
  if (placementMode.value) {
    exitPlacementMode()
  }

  const isWaterBottle = itemId.includes('water') && itemId.includes('bottle')
  placementMode.value = {
    itemId,
    itemName: supplyItem.name,
    isWaterBottle
  }

  // Create ghost preview - simple box placeholder for now
  const previewGeometry = new THREE.BoxGeometry(2, 1.5, 2)
  const previewMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.5,
    emissive: 0x00ff00,
    emissiveIntensity: 0.3
  })
  const previewMesh = new THREE.Mesh(previewGeometry, previewMaterial)
  previewMesh.position.y = 0.75 // Half height above ground

  placementPreview = new THREE.Group()
  placementPreview.add(previewMesh)
  placementPreview.visible = false
  worldGroup.add(placementPreview)

  console.log(`[Habitat3D] Entered placement mode for: ${supplyItem.name}`)
}

/**
 * Exit placement mode and clean up preview
 */
function exitPlacementMode() {
  if (placementPreview) {
    worldGroup.remove(placementPreview)
    disposeObject3D(placementPreview)
    placementPreview = null
  }
  placementMode.value = null
  isPlacementValid = false
  console.log('[Habitat3D] Exited placement mode')
}

/**
 * Validate if a position is valid for placement
 */
function isValidPlacement(
  worldX: number,
  worldZ: number,
  mode: { itemId: string; isWaterBottle: boolean }
): boolean {
  const halfWidth = GRID_CONFIG.WIDTH / 2
  const halfDepth = GRID_CONFIG.DEPTH / 2
  const margin = 2.0 // Keep items away from edge (except water bottles)

  // Check if within bounds
  const inBoundsX = worldX >= -halfWidth + margin && worldX <= halfWidth - margin
  const inBoundsZ = worldZ >= -halfDepth + margin && worldZ <= halfDepth - margin

  // Water bottles: must be on edge
  if (mode.isWaterBottle) {
    const onLeftRight = Math.abs(worldX) > halfWidth - margin
    const onTopBottom = Math.abs(worldZ) > halfDepth - margin
    if (!onLeftRight && !onTopBottom) {
      return false // Water bottles must be on edges
    }
    // Water bottles can be outside normal bounds (on edges)
  } else {
    // Regular items must be within bounds
    if (!inBoundsX || !inBoundsZ) {
      return false
    }
  }

  // Check overlap with existing items (grid cell level)
  const gridPos = worldToGrid(worldX, worldZ)
  for (const [, pos] of habitatConditions.itemPositions) {
    if (pos.x === gridPos.x && pos.y === gridPos.y) {
      return false // Cell occupied
    }
  }

  return true
}

/**
 * Update the preview mesh color based on validity
 */
function updatePreviewColor(valid: boolean) {
  if (!placementPreview) return

  const color = valid ? 0x00ff00 : 0xff0000 // Green or red
  placementPreview.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.emissive.setHex(color)
    }
  })
}

/**
 * Handle mouse move for placement preview
 */
function handleCanvasMouseMove(event: MouseEvent) {
  if (!placementMode.value || !placementPreview || !canvasRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  // Normalize mouse position
  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Raycast to floor
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const intersection = new THREE.Vector3()
  raycaster.ray.intersectPlane(floorPlane, intersection)

  if (intersection) {
    // Free placement - use exact world coordinates
    placementPreview.position.set(intersection.x, 0, intersection.z)
    placementPreview.visible = true

    // Validate and update preview color
    isPlacementValid = isValidPlacement(intersection.x, intersection.z, placementMode.value)
    updatePreviewColor(isPlacementValid)
  }
}

/**
 * Place the current item at the preview position
 */
function placeItem() {
  if (!placementMode.value || !placementPreview || !isPlacementValid) return

  const position = {
    x: placementPreview.position.x,
    z: placementPreview.position.z
  }

  // Convert to grid coords for storage
  const gridPos = worldToGrid(position.x, position.z)

  // Add item to habitat
  habitatConditions.addItemToHabitat(placementMode.value.itemId, gridPos)
  console.log(`[Habitat3D] Placed ${placementMode.value.itemName} at grid (${gridPos.x}, ${gridPos.y})`)

  // Check if more of this item available
  const placedCount = inventoryStore.getPlacedCount(placementMode.value.itemId) + 1
  const totalQuantity = inventoryStore.getItemQuantity(placementMode.value.itemId)
  const remaining = totalQuantity - placedCount

  if (remaining <= 0) {
    exitPlacementMode()
  }
  // Otherwise stay in placement mode for more placements
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

/**
 * Toggle game pause state
 */
function togglePause() {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame('manual')
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

// Create a single cloud from multiple sphere "puffs" (matching demo style)
function createCloud(): THREE.Group {
  const cloud = new THREE.Group()

  // Cloud material - MeshBasicMaterial like the demo (no lighting effects)
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: CLOUD_CONFIG.COLOR,
    transparent: true,
    opacity: CLOUD_CONFIG.OPACITY,
  })

  // Random number of puffs for fluffy variety
  const puffCount = CLOUD_CONFIG.PUFF_COUNT_MIN +
    Math.floor(Math.random() * (CLOUD_CONFIG.PUFF_COUNT_MAX - CLOUD_CONFIG.PUFF_COUNT_MIN))

  // Puff geometry - low poly spheres for soft cloud appearance
  const puffGeo = new THREE.SphereGeometry(CLOUD_CONFIG.PUFF_RADIUS, 12, 10)

  // Create the puffs in a fluffy cluster
  for (let i = 0; i < puffCount; i++) {
    const puff = new THREE.Mesh(puffGeo, cloudMaterial)

    // Position puffs spread out for fluffiness
    puff.position.set(
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_X,
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_Y,
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_Z
    )

    // Random scale for variety
    const scale = CLOUD_CONFIG.PUFF_SCALE_MIN +
      Math.random() * (CLOUD_CONFIG.PUFF_SCALE_MAX - CLOUD_CONFIG.PUFF_SCALE_MIN)
    // Squash vertically slightly for natural cloud shape
    puff.scale.set(scale, scale * 0.7, scale)

    cloud.add(puff)
  }

  return cloud
}

// Create all clouds and position them in the sky (two layers like demo)
function createClouds() {
  const highLayer = CLOUD_CONFIG.HIGH_LAYER
  const lowLayer = CLOUD_CONFIG.LOW_LAYER
  const totalClouds = highLayer.COUNT + lowLayer.COUNT

  console.log(`[Habitat3D] Creating ${totalClouds} clouds (${highLayer.COUNT} high, ${lowLayer.COUNT} low)...`)

  // High layer clouds - further out and higher up
  for (let i = 0; i < highLayer.COUNT; i++) {
    const cloud = createCloud()

    const angle = Math.random() * Math.PI * 2
    const distance = highLayer.MIN_DISTANCE +
      Math.random() * (highLayer.MAX_DISTANCE - highLayer.MIN_DISTANCE)
    const height = highLayer.MIN_HEIGHT +
      Math.random() * (highLayer.MAX_HEIGHT - highLayer.MIN_HEIGHT)

    cloud.position.set(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance
    )

    // Face the center (like demo)
    cloud.lookAt(0, height, 0)

    // Store for animation
    cloud.userData.angle = angle
    cloud.userData.distance = distance
    cloud.userData.height = height
    cloud.userData.driftOffset = Math.random() * Math.PI * 2

    worldGroup.add(cloud)
    cloudObjects.push(cloud)
  }

  // Low layer clouds - closer and lower (more visible)
  for (let i = 0; i < lowLayer.COUNT; i++) {
    const cloud = createCloud()

    const angle = Math.random() * Math.PI * 2
    const distance = lowLayer.MIN_DISTANCE +
      Math.random() * (lowLayer.MAX_DISTANCE - lowLayer.MIN_DISTANCE)
    const height = lowLayer.MIN_HEIGHT +
      Math.random() * (lowLayer.MAX_HEIGHT - lowLayer.MIN_HEIGHT)

    cloud.position.set(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance
    )

    // Scale down low layer clouds (like demo)
    cloud.scale.setScalar(lowLayer.SCALE)

    // Face the center (like demo)
    cloud.lookAt(0, height, 0)

    // Store for animation
    cloud.userData.angle = angle
    cloud.userData.distance = distance
    cloud.userData.height = height
    cloud.userData.driftOffset = Math.random() * Math.PI * 2

    worldGroup.add(cloud)
    cloudObjects.push(cloud)
  }

  console.log(`[Habitat3D] ${cloudObjects.length} clouds created and added to worldGroup`)
}

// Update cloud positions - drift slowly around the sky
function updateClouds(deltaTime: number) {
  cloudObjects.forEach(cloud => {
    // Slowly rotate around the scene
    cloud.userData.angle += deltaTime * CLOUD_CONFIG.DRIFT_SPEED * 0.02

    // Add gentle bobbing motion
    const bob = Math.sin(cloud.userData.angle * 2 + cloud.userData.driftOffset) * 0.5

    // Update position
    cloud.position.x = Math.cos(cloud.userData.angle) * cloud.userData.distance
    cloud.position.z = Math.sin(cloud.userData.angle) * cloud.userData.distance
    cloud.position.y = cloud.userData.height + bob
  })
}
</script>

<style>

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

.habitat-3d-debug__needs-row {
  margin-block-start: var(--spacing-md);
  max-inline-size: 400px;
}

/* Normal header row (title + actions) */
.game-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--spacing-md);
}

.game-view__header h2 {
  margin: 0;
}

.game-view__header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Fullscreen mode header */
.habitat-3d-debug__fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--spacing-sm);
  padding-inline: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.habitat-3d-debug__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.habitat-3d-debug__header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Fullscreen mode adjustments */
.habitat-3d-debug--fullscreen {
  max-inline-size: none;
  background-color: #111; /* Dark background for letterboxing */
}

.habitat-3d-debug--fullscreen .habitat-3d-debug__canvas-wrapper {
  /* Constrain aspect ratio to prevent distortion on wide monitors */
  /* Using 16:10 aspect ratio (similar to habitat grid 14:10) */
  --fullscreen-height: calc(100vh - 80px);
  --aspect-ratio: calc(16 / 10);
  block-size: var(--fullscreen-height);
  max-inline-size: calc(var(--fullscreen-height) * var(--aspect-ratio));
  margin-inline: auto; /* Center horizontally */
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.habitat-3d-debug--fullscreen .habitat-3d-debug__needs-row {
  display: none;
}

/* Floating Action Buttons container */
.game-fab-container {
  position: absolute;
  inset-inline-end: var(--spacing-md);
  inset-block-end: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  z-index: 10;
}

.game-fab-container--left {
  inset-inline-end: auto;
  inset-inline-start: var(--spacing-md);
}

/* Individual FAB button */
.game-fab {
  inline-size: 48px;
  block-size: 48px;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.game-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.game-fab--active {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

/* Candy color palette - using CSS variables */
.game-fab--pink {
  background-color: var(--color-accent-pink-500);
}

.game-fab--violet {
  background-color: var(--color-accent-violet-500);
}

.game-fab--green {
  background-color: var(--color-accent-green-500);
}

.game-fab--orange {
  background-color: var(--color-warning-400);
}

.game-fab--yellow {
  background-color: var(--color-accent-yellow-500);
}

.game-fab--cyan {
  background-color: var(--color-need-thirst);
}

/* FAB row - contains main FAB + subactions */
.game-fab-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
}

/* Subactions container */
.game-fab-subactions {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-xs);
  animation: fab-slide-in 0.2s ease-out;
}

/* Subaction button (smaller) */
.game-fab-sub {
  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.game-fab-sub:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

/* Subaction colors (lighter shades) */
.game-fab-sub--green {
  background-color: var(--color-accent-green-400);
}

.game-fab-sub--pink {
  background-color: var(--color-accent-pink-400);
}

.game-fab-sub--violet {
  background-color: var(--color-accent-violet-400);
}

@keyframes fab-slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Activity Feed Panel - Content styles only (structure from SidePanel3D) */
.activity-feed-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.activity-feed-panel__messages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.activity-feed-panel__message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  font-size: var(--font-size-xs);
  border-inline-start: 3px solid var(--color-neutral-400);
}

.activity-feed-panel__message--player_action {
  border-inline-start-color: var(--color-primary);
}

.activity-feed-panel__message--guinea_pig_reaction {
  border-inline-start-color: var(--color-secondary);
}

.activity-feed-panel__message--autonomous_behavior {
  border-inline-start-color: var(--color-info);
}

.activity-feed-panel__message--environmental {
  border-inline-start-color: var(--color-warning);
}

.activity-feed-panel__message--achievement {
  border-inline-start-color: var(--color-accent-pink-500);
  background-color: var(--color-accent-pink-50);
}

.activity-feed-panel__emoji {
  flex-shrink: 0;
}

.activity-feed-panel__text {
  flex: 1;
  color: var(--color-text-primary);
}

.activity-feed-panel__time {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* Placement mode styles */
.habitat-3d-debug__canvas--placing {
  cursor: crosshair !important;
}

</style>
