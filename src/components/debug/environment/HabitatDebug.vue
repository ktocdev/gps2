<template>
  <div class="habitat-debug debug-view__constrained">
    <h2>
      Habitat Conditions
      <InfoButton
        message="Manage habitat conditions, interact with guinea pigs, and view their needs. Use the sidebar buttons to access inventory, care actions, activity feed, and socialization options."
        position="bottom"
      />
    </h2>

    <div v-if="hasActiveGuineaPigs" class="habitat-debug__content">
    <!-- Visual Habitat with Sidebar -->
    <div class="panel panel--full-width">
      <div class="panel__header">
        <h3>Habitat Visual</h3>
        <div class="sidebar-toggle">
          <Button
            @click="activeSidebar = 'inventory'"
            variant="tertiary"
            size="sm"
            :class="{ 'button--active': activeSidebar === 'inventory' }"
          >
            🎒 Inventory
          </Button>
          <Button
            @click="activeSidebar = 'care'"
            variant="tertiary"
            size="sm"
            :class="{ 'button--active': activeSidebar === 'care' }"
          >
            🧹 Care Actions
          </Button>
          <Button
            @click="activeSidebar = 'activity'"
            variant="tertiary"
            size="sm"
            :class="{ 'button--active': activeSidebar === 'activity' }"
          >
            📜 Activity Feed
          </Button>
          <Button
            @click="activeSidebar = 'socialize'"
            variant="tertiary"
            size="sm"
            :class="{ 'button--active': activeSidebar === 'socialize' }"
          >
            🤝 Socialize
          </Button>
        </div>
      </div>
      <div class="panel__content">
        <div class="habitat-layout">
          <div class="habitat-layout__main">
            <HabitatVisual ref="habitatVisualRef" :show-grid="true" habitat-size="medium" />
          </div>
          <InventorySidebar
            v-if="activeSidebar === 'inventory'"
            :habitat-visual-ref="habitatVisualRef"
          />
          <HabitatCareSidebar
            v-else-if="activeSidebar === 'care'"
            :can-refresh-bedding="canRefreshBedding"
            :selected-bedding-type="selectedBeddingType"
            :bedding-options="beddingOptions"
            :poop-count="habitatVisualRef?.poopCount || 0"
            :has-water-available="hasWaterAvailable"
            @update:selected-bedding-type="selectedBeddingType = String($event)"
            @clean-cage="handleCleanCage"
            @refill-water="habitat.refillWater"
            @refresh-bedding="handleRefreshBedding"
            @clear-all-bowls="clearAllBowls"
            @clear-all-hay-racks="clearAllHayRacks"
            @add-test-poop="addTestPoop"
            @clear-all-poop="clearAllPoop"
            @clear-water="clearWater"
            @test-water-consumption="testWaterConsumption"
          />
          <div v-else-if="activeSidebar === 'activity'" class="activity-feed-sidebar">
            <ActivityFeed
              :max-messages="100"
              :show-header="true"
              :auto-scroll="true"
              height="600px"
              :compact="false"
              :categories="['player_action', 'guinea_pig_reaction', 'autonomous_behavior', 'environmental', 'achievement']"
              title="Activity Log"
            />
          </div>
          <SocializeSidebar
            v-else-if="activeSidebar === 'socialize'"
            :selected-guinea-pig="selectedGuineaPig"
            @pet="handleInteraction('pet')"
            @hold="handleInteraction('hold')"
            @hand-feed="handleHandFeed"
            @gentle-wipe="handleInteraction('gentle-wipe')"
            @talk-to="handleInteraction('talk-to')"
            @sing-to="handleInteraction('sing-to')"
            @call-name="handleInteraction('call-name')"
            @peek-a-boo="handleInteraction('peek-a-boo')"
            @wave-hand="handleInteraction('wave-hand')"
            @show-toy="handleInteraction('show-toy')"
          />
        </div>
      </div>
    </div>

    <!-- Habitat Conditions & Test Controls Row -->
    <div class="habitat-debug__conditions-row">
      <!-- System 19: Autonomy Debug Panel -->
      <AutonomyDebug />

      <!-- Needs Panel -->
      <NeedsPanel />

      <!-- Habitat Conditions Panel -->
      <div class="panel panel--compact panel--accent">
        <div class="panel__header">
          <h3>Habitat Conditions</h3>
          <div class="condition-summary">
            <span class="condition-summary__label">Overall Condition:</span>
            <span class="condition-summary__value" :class="getConditionClass(habitat.overallCondition)">
              {{ habitat.overallCondition }}%
            </span>
          </div>
        </div>
        <div class="panel__content">
          <!-- Core Conditions Section -->
          <div class="conditions-section">
            <h4>Core Conditions</h4>
            <div class="conditions-grid">
              <!-- Cleanliness -->
              <div class="condition-item">
                <div class="condition-item__header">
                  <label for="cleanliness">Cleanliness</label>
                  <span class="condition-item__value" :class="getConditionClass(habitat.cleanliness)">
                    {{ habitat.cleanliness.toFixed(0) }}%
                  </span>
                </div>
                <SliderField
                  id="cleanliness"
                  :modelValue="habitat.cleanliness"
                  :min="0"
                  :max="100"
                  :step="1"
                  prefix=""
                  suffix="%"
                  @update:modelValue="(v: number) => habitat.updateCondition('cleanliness', v)"
                />
              </div>

              <!-- Bedding Freshness -->
              <div class="condition-item">
                <div class="condition-item__header">
                  <label for="bedding">Bedding Freshness</label>
                  <span class="condition-item__value" :class="getConditionClass(habitat.beddingFreshness)">
                    {{ habitat.beddingFreshness.toFixed(0) }}%
                  </span>
                </div>
                <SliderField
                  id="bedding"
                  :modelValue="habitat.beddingFreshness"
                  :min="0"
                  :max="100"
                  :step="1"
                  prefix=""
                  suffix="%"
                  @update:modelValue="(v: number) => habitat.updateCondition('beddingFreshness', v)"
                />
              </div>

              <!-- Water Level -->
              <div class="condition-item">
                <div class="condition-item__header">
                  <label for="water">Water Level</label>
                  <span class="condition-item__value" :class="getConditionClass(habitat.waterLevel)">
                    {{ habitat.waterLevel.toFixed(0) }}%
                  </span>
                </div>
                <SliderField
                  id="water"
                  :modelValue="habitat.waterLevel"
                  :min="0"
                  :max="100"
                  :step="1"
                  prefix=""
                  suffix="%"
                  @update:modelValue="(v: number) => habitat.updateCondition('waterLevel', v)"
                />
              </div>
            </div>
          </div>

          <hr class="divider" />

          <!-- Hay Racks Section -->
          <div v-if="hayRacks.length > 0" class="conditions-section">
            <h4>Hay Racks</h4>
            <div class="container-items-grid">
              <div v-for="rack in hayRacks" :key="rack.itemId" class="container-item">
                <div class="container-item__header">
                  <label :for="`hay-rack-${rack.itemId}`">{{ rack.name }}</label>
                  <span class="container-item__value" :class="getConditionClass(rack.freshness)">
                    {{ rack.freshness.toFixed(0) }}%
                  </span>
                </div>
                <SliderField
                  :id="`hay-rack-${rack.itemId}`"
                  :modelValue="rack.freshness"
                  :min="0"
                  :max="100"
                  :step="1"
                  prefix=""
                  suffix="%"
                  :disabled="rack.servingCount === 0"
                  @update:modelValue="(v: number) => updateHayRackFreshness(rack.itemId, v)"
                />
                <div class="container-item__info">
                  Servings: {{ rack.servingCount }} / {{ rack.capacity }}
                </div>
              </div>
            </div>
          </div>

          <hr v-if="hayRacks.length > 0" class="divider" />

          <!-- Food Containers Section -->
          <div v-if="foodBowls.length > 0" class="conditions-section">
            <h4>Food Containers</h4>
            <div class="food-bowls-list">
              <div v-for="bowl in foodBowls" :key="bowl.bowlId" class="panel panel--compact">
                <div class="panel__header">
                  <h5>{{ bowl.bowlName }}</h5>
                  <span class="food-bowl-container__count">{{ bowl.foods.length }}/{{ bowl.capacity }}</span>
                </div>
                <div v-if="bowl.foods.length === 0" class="food-bowl-container__empty">
                  No food in bowl
                </div>
                <div v-else class="food-items-list">
                  <div v-for="(food, foodIndex) in bowl.foods" :key="`${bowl.bowlId}-${foodIndex}`" class="food-item">
                    <div class="food-item__header">
                      <label :for="`food-${bowl.bowlId}-${foodIndex}`">
                        <span class="food-item__emoji">{{ food.emoji }}</span>
                        {{ food.name }}
                      </label>
                      <span class="food-item__value" :class="getConditionClass(food.freshness)">
                        {{ food.freshness.toFixed(0) }}%
                      </span>
                    </div>
                    <SliderField
                      :id="`food-${bowl.bowlId}-${foodIndex}`"
                      :modelValue="food.freshness"
                      :min="0"
                      :max="100"
                      :step="1"
                      prefix=""
                      suffix="%"
                      @update:modelValue="(v: number) => updateFoodFreshness(bowl.bowlId, foodIndex, v)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr v-if="chewItemsList.length > 0" class="divider" />

          <!-- Chew Items Section -->
          <div v-if="chewItemsList.length > 0" class="conditions-section">
            <h4>Chew Items</h4>
            <div class="chew-items-list">
              <div v-for="chew in chewItemsList" :key="chew.itemId" class="chew-item-debug">
                <div class="chew-item-debug__header">
                  <label :for="`chew-${chew.itemId}`">
                    <span class="chew-item-debug__emoji">{{ chew.emoji }}</span>
                    {{ chew.name }}
                  </label>
                  <span class="chew-item-debug__value" :class="getChewDurabilityClass(chew.durability)">
                    {{ chew.durability.toFixed(0) }}%
                  </span>
                </div>
                <SliderField
                  :id="`chew-${chew.itemId}`"
                  :modelValue="chew.durability"
                  :min="0"
                  :max="100"
                  :step="1"
                  prefix=""
                  suffix="%"
                  @update:modelValue="(v: number) => updateChewDurability(chew.itemId, v)"
                />
                <div class="chew-item-debug__metadata">
                  <span class="chew-item-debug__usage">🦷 Used {{ chew.usageCount }} times</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System 19: Poop Debug Panel -->
      <div class="panel panel--compact panel--accent">
        <div class="panel__header">
          <h3>💩 Poop System</h3>
        </div>
        <div class="panel__content">
          <PoopDebug />
        </div>
      </div>

      <!-- Decay Speed Panel -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Decay Speed</h3>
        </div>
        <div class="panel__content">
          <!-- Habitat Decay -->
          <div class="decay-speed-control mb-4">
            <div class="decay-speed-control__header">
              <label for="habitat-decay-speed">Habitat</label>
              <span class="decay-speed-control__value">{{ habitat.decaySpeedMultiplier }}x</span>
            </div>
            <SliderField
              id="habitat-decay-speed"
              :modelValue="habitat.decaySpeedMultiplier"
              :min="1"
              :max="60"
              :step="1"
              prefix=""
              suffix="x"
              @update:modelValue="(v: number) => habitat.setDecaySpeed(v)"
            />
            <div class="decay-speed-presets">
              <Button
                @click="habitat.setDecaySpeed(6)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 6 }"
              >
                Relaxed (6x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(12)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 12 }"
              >
                Normal (12x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(24)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 24 }"
              >
                Fast (24x)
              </Button>
            </div>
          </div>

          <!-- Needs Decay -->
          <div class="decay-speed-control">
            <div class="decay-speed-control__header">
              <label for="needs-decay-speed">Needs</label>
              <span class="decay-speed-control__value">{{ guineaPigStore.settings.needsDecayRate.toFixed(1) }}x</span>
            </div>
            <SliderField
              id="needs-decay-speed"
              :modelValue="guineaPigStore.settings.needsDecayRate"
              :min="0"
              :max="2"
              :step="0.05"
              prefix=""
              suffix="x"
              @update:modelValue="(v: number) => guineaPigStore.setNeedsDecayRate(v)"
            />
            <div class="decay-speed-presets">
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0 }"
              >
                Paused (0x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.1 }"
              >
                Very Slow (0.1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.5)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.5 }"
              >
                Slow (0.5x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 1 }"
              >
                Normal (1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(2)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 2 }"
              >
                Fast (2x)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see habitat data.</p>
      </div>
    </div>

    <!-- Clean Cage Dialog -->
    <CleanCageDialog
      v-model="showCleanCageDialog"
      :dirtiness="habitat.dirtiness"
      :bedding-needed="habitat.calculateBeddingNeeded()"
      :bedding-available="habitat.getTotalBeddingAvailable()"
      @confirm="confirmCleanCage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useHabitatContainers } from '../../../composables/useHabitatContainers'
import { useLoggingStore } from '../../../stores/loggingStore'
import { useBehaviorStateStore } from '../../../stores/behaviorStateStore'
import { CONSUMPTION, CHEW_DEGRADATION } from '../../../constants/supplies'
import { getInteractionEffect, getInteractionName, getInteractionEmoji } from '../../../utils/interactionEffects'
import Button from '../../basic/Button.vue'
import InfoButton from '../../basic/InfoButton.vue'
import SliderField from '../../basic/SliderField.vue'
import HabitatVisual from '../../game/habitat/HabitatVisual.vue'
import InventorySidebar from '../../game/habitat/sidebars/InventorySidebar.vue'
import HabitatCareSidebar from '../../game/habitat/sidebars/HabitatCareSidebar.vue'
import ActivityFeed from '../../game/ui/ActivityFeed.vue'
import SocializeSidebar from '../../game/habitat/sidebars/SocializeSidebar.vue'
import AutonomyDebug from './AutonomyDebug.vue'
import NeedsPanel from './NeedsPanel.vue'
import PoopDebug from './PoopDebug.vue'
import CleanCageDialog from '../../game/dialogs/CleanCageDialog.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const loggingStore = useLoggingStore()
const behaviorStateStore = useBehaviorStateStore()
const {
  getHayRackContents,
  getHayRackFreshness,
  setHayRackFreshness,
  getBowlContents,
  setFoodFreshness,
  getChewData,
  setChewDurability
} = useHabitatContainers()

// Ref to HabitatVisual component
const habitatVisualRef = ref<InstanceType<typeof HabitatVisual> | null>(null)

// Active sidebar state
const activeSidebar = ref<'inventory' | 'care' | 'activity' | 'socialize'>('inventory')

// Clean cage dialog state
const showCleanCageDialog = ref(false)

// Initialize supplies catalog on mount
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }

  // System 16 Phase 1 Test - Log item type metadata
  console.log('=== System 16: Phase 1 - Item Type Metadata Test ===')
  console.log('Water bottles:', suppliesStore.getItemsByType('water_bottle').map(i => i.name))
  console.log('Food bowls:', suppliesStore.getItemsByType('food_bowl').map(i => i.name))
  console.log('Hay racks:', suppliesStore.getItemsByType('hay_rack').map(i => i.name))
  console.log('Beds:', suppliesStore.getItemsByType('bed').map(i => i.name))
  console.log('Shelters:', suppliesStore.getItemsByType('shelter').map(i => i.name))
  console.log('Hideaways:', suppliesStore.getItemsByType('hideaway').map(i => i.name))
  console.log('Tunnels:', suppliesStore.getItemsByType('tunnel').map(i => i.name))

  // Test getItemsForNeed (using actual implemented needs)
  console.log('\n=== Items by Need (Critical) ===')
  console.log('Thirst:', suppliesStore.getItemsForNeed('thirst').map(i => i.name))
  console.log('Hunger:', suppliesStore.getItemsForNeed('hunger').map(i => i.name))
  console.log('Energy:', suppliesStore.getItemsForNeed('energy').map(i => i.name))
  console.log('Shelter:', suppliesStore.getItemsForNeed('shelter').map(i => i.name))

  console.log('\n=== Items by Need (Environmental) ===')
  console.log('Play:', suppliesStore.getItemsForNeed('play').map(i => i.name))
  console.log('Social:', suppliesStore.getItemsForNeed('social').map(i => i.name))
  console.log('Comfort:', suppliesStore.getItemsForNeed('comfort').map(i => i.name))

  // Test individual item lookup
  const basicBottle = 'habitat_basic_water_bottle'
  console.log(`\n${basicBottle} type:`, suppliesStore.getItemType(basicBottle))
  console.log(`${basicBottle} satisfies thirst:`, suppliesStore.itemSatisfiesNeed(basicBottle, 'thirst'))
  console.log('==============================================')
})

// Test control handlers
function addTestPoop() {
  habitatVisualRef.value?.addTestPoop()
}

function clearAllPoop() {
  habitatVisualRef.value?.clearAllPoop()
}

function clearAllBowls() {
  habitat.clearAllBowls()
}

function clearAllHayRacks() {
  habitat.clearAllHayRacks()
}

function clearWater() {
  habitat.waterLevel = 0
}

// System 16: Phase 2 - Water Consumption Test
function testWaterConsumption() {
  const beforeLevel = habitat.waterLevel
  const success = habitat.consumeWater()
  const afterLevel = habitat.waterLevel

  if (success) {
    console.log(`✅ Water consumption test successful! ${beforeLevel.toFixed(0)}% → ${afterLevel.toFixed(0)}% (consumed ${(beforeLevel - afterLevel).toFixed(0)} units)`)
    console.log('💧 Visual opacity should update automatically via reactive waterLevel binding')
  } else {
    console.log('❌ Water consumption test failed')
  }
}

const hasWaterAvailable = computed(() => {
  return habitat.hasWaterAvailable()
})

const hasActiveGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs.length > 0
})

// Selected guinea pig for interactions (based on user click in habitat)
const selectedGuineaPig = computed(() => {
  if (!guineaPigStore.selectedGuineaPigId) return null
  return guineaPigStore.getGuineaPig(guineaPigStore.selectedGuineaPigId)
})

// Bedding selection
const selectedBeddingType = ref<string>('average')
const beddingOptions = computed(() => [
  { value: 'cheap', label: `Cheap (${inventoryStore.getItemQuantity('bedding_cheap')})`, disabled: !inventoryStore.hasItem('bedding_cheap') },
  { value: 'average', label: `Average (${inventoryStore.getItemQuantity('bedding_average')})`, disabled: !inventoryStore.hasItem('bedding_average') },
  { value: 'premium', label: `Premium (${inventoryStore.getItemQuantity('bedding_premium')})`, disabled: !inventoryStore.hasItem('bedding_premium') }
])

// Map quality to item IDs
const beddingItemIds: Record<'cheap' | 'average' | 'premium', string> = {
  cheap: 'bedding_cheap',
  average: 'bedding_average',
  premium: 'bedding_premium'
}

const canRefreshBedding = computed(() => {
  const itemId = beddingItemIds[selectedBeddingType.value as 'cheap' | 'average' | 'premium']
  return inventoryStore.hasItem(itemId)
})

function handleRefreshBedding() {
  // Use the selected bedding type from the dropdown
  const itemId = beddingItemIds[selectedBeddingType.value as 'cheap' | 'average' | 'premium']
  const success = habitat.refreshBedding(itemId)
  if (!success) {
    console.warn(`Not enough ${selectedBeddingType.value} bedding in inventory`)
  }
}

function handleCleanCage() {
  // Show confirmation dialog with bedding info
  showCleanCageDialog.value = true
}

function confirmCleanCage() {
  const result = habitat.cleanCage()
  if (result.success) {
    loggingStore.addPlayerAction(result.message, '🧹')
  } else {
    console.warn(result.message)
  }
}

function getConditionClass(value: number): string {
  if (value >= 80) return 'condition-value--good'
  if (value >= 40) return 'condition-value--warning'
  return 'condition-value--critical'
}

// Handle social interactions
function handleInteraction(interactionType: string) {
  if (!selectedGuineaPig.value) {
    console.warn('No guinea pig selected for interaction')
    return
  }

  const guineaPig = selectedGuineaPig.value
  const effect = getInteractionEffect(interactionType)

  if (!effect) {
    console.warn(`No effect data found for interaction: ${interactionType}`)
    return
  }

  // System 23: Trigger wiggle animation for player interaction
  behaviorStateStore.triggerPlayerInteraction(guineaPig.id, 1500)

  // Apply need impacts
  Object.entries(effect.needsImpact).forEach(([need, value]) => {
    if (value && value > 0) {
      guineaPigStore.satisfyNeed(guineaPig.id, need as any, value)
    }
  })

  // Apply friendship gain
  if (effect.friendshipGain > 0) {
    guineaPigStore.adjustFriendship(guineaPig.id, effect.friendshipGain)
  }

  // Log to activity feed
  const emoji = getInteractionEmoji(interactionType)
  const interactionName = getInteractionName(interactionType)
  loggingStore.addPlayerAction(
    `${emoji} ${interactionName} - ${guineaPig.name} enjoyed the interaction!`,
    emoji
  )

  console.log(`🤝 ${interactionName}: ${guineaPig.name} | Friendship +${effect.friendshipGain} | Needs:`, effect.needsImpact)
}

// Handle hand-feed with food selection
function handleHandFeed(foodId: string) {
  if (!selectedGuineaPig.value) {
    console.warn('No guinea pig selected for hand-feed')
    return
  }

  const guineaPig = selectedGuineaPig.value
  const foodItem = suppliesStore.getItemById(foodId)

  if (!foodItem) {
    console.warn(`Food item ${foodId} not found`)
    return
  }

  // Get hand-feed interaction effect
  const effect = getInteractionEffect('hand-feed')
  if (!effect) {
    console.warn('No effect data found for hand-feed interaction')
    return
  }

  // System 23: Trigger wiggle animation for player interaction
  behaviorStateStore.triggerPlayerInteraction(guineaPig.id, 1500)

  // Apply need impacts (hunger from food + social from hand-feeding)
  Object.entries(effect.needsImpact).forEach(([need, value]) => {
    if (value && value > 0) {
      guineaPigStore.satisfyNeed(guineaPig.id, need as any, value)
    }
  })

  // Apply friendship gain
  if (effect.friendshipGain > 0) {
    guineaPigStore.adjustFriendship(guineaPig.id, effect.friendshipGain)
  }

  // Log to activity feed with food name
  loggingStore.addPlayerAction(
    `🥕 Hand Fed ${foodItem.name} - ${guineaPig.name} enjoyed it!`,
    '🥕'
  )

  console.log(`🥕 Hand Fed ${foodItem.name}: ${guineaPig.name} | Friendship +${effect.friendshipGain} | Needs:`, effect.needsImpact)
}

// Hay Racks Management
const hayRacks = computed(() => {
  if (!habitatVisualRef.value) return []

  const items = habitatVisualRef.value.placedItems
  if (!items) return []

  const racks = items
    .filter((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      // Check if this is a hay rack (has hay rack in the name or is specifically a hay rack type)
      return itemData?.name?.toLowerCase().includes('hay rack')
    })
    .map((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      const servings = getHayRackContents(item.itemId)
      const freshness = getHayRackFreshness(item.itemId)
      const capacity = CONSUMPTION.HAY_RACK_MAX_CAPACITY

      return {
        itemId: item.itemId,
        name: itemData?.name || 'Hay Rack',
        freshness,
        servingCount: servings.length,
        capacity
      }
    })

  return racks
})

function updateHayRackFreshness(hayRackItemId: string, freshness: number) {
  setHayRackFreshness(hayRackItemId, freshness)
}

// Food Bowls Management
const foodBowls = computed(() => {
  if (!habitatVisualRef.value) return []

  const items = habitatVisualRef.value.placedItems
  if (!items) return []

  const bowls = items
    .filter((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      // Check if this is a food bowl
      return itemData?.subCategory === 'bowls_bottles' && itemData?.stats?.foodCapacity
    })
    .map((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      const contents = getBowlContents(item.itemId)
      const capacity = itemData?.stats?.foodCapacity || CONSUMPTION.DEFAULT_FOOD_CAPACITY

      return {
        bowlId: item.itemId,
        bowlName: itemData?.name || 'Food Bowl',
        capacity,
        foods: contents
      }
    })

  return bowls
})

function updateFoodFreshness(bowlId: string, foodIndex: number, freshness: number) {
  setFoodFreshness(bowlId, foodIndex, freshness)
}

// Chew Items Management
const chewItemsList = computed(() => {
  if (!habitatVisualRef.value) return []

  const items = habitatVisualRef.value.placedItems
  if (!items) return []

  const chews = items
    .filter((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      // Check if this is a chew item (itemType 'chew')
      return itemData?.stats?.itemType === 'chew'
    })
    .map((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      const chewData = getChewData(item.itemId)

      return {
        itemId: item.itemId,
        name: itemData?.name || 'Chew Item',
        emoji: itemData?.emoji || '🦷',
        durability: chewData?.durability ?? 100,
        usageCount: chewData?.usageCount ?? 0,
        lastUsedAt: chewData?.lastUsedAt ?? Date.now()
      }
    })

  return chews
})

function updateChewDurability(chewItemId: string, durability: number) {
  setChewDurability(chewItemId, durability)
}

function getChewDurabilityClass(durability: number): string {
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'text-label--danger'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'text-label--warning'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'text-label--muted'
  return 'text-label--success'
}
</script>

<style>
.habitat-debug__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.sidebar-toggle {
  display: flex;
  gap: var(--space-2);
}

.condition-summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 2px solid var(--color-success);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.condition-summary__label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.condition-summary__value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Dynamic border color based on condition */
.condition-summary:has(.condition-value--warning) {
  border-color: var(--color-warning);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
}

.condition-summary:has(.condition-value--critical) {
  border-color: var(--color-error);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.condition-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.condition-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-item__header label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.condition-item__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.condition-value--good {
  color: var(--color-success);
}

.condition-value--warning {
  color: var(--color-warning);
}

.condition-value--critical {
  color: var(--color-error);
}

.condition-item__action {
  margin-block-start: var(--space-2);
}

/* Habitat Layout with Sidebar */
.habitat-layout {
  display: flex;
  gap: var(--space-4);
  align-items: stretch;
}

.habitat-layout__main {
  flex: 1;
  min-inline-size: 0;
}

/* Mobile: Stack layout vertically */
@media (max-width: 768px) {
  .habitat-layout {
    flex-direction: column;
  }
}

/* Habitat Conditions & Test Controls Row */
.habitat-debug__conditions-row {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

/* Desktop: 3 columns - equal width for all panels */
@media (min-width: 1200px) {
  .habitat-debug__conditions-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* Tablet: 2 columns - stack panels */
@media (min-width: 768px) and (max-width: 1199px) {
  .habitat-debug__conditions-row {
    grid-template-columns: 1fr 1fr;
  }
}

.decay-speed-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.decay-speed-control__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.decay-speed-control__header label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.decay-speed-control__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.decay-speed-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.button--active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Shared container items grid */
.container-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-3);
}

.container-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.container-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container-item__header label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.container-item__value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.container-item__info {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

/* Food Containers Panel */
.food-bowls-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}

/* Food bowl container now uses .panel .panel--compact utility */

/* Custom header layout for food bowl panels */
.food-bowls-list .panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-bowls-list .panel__header h5 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.food-bowl-container__count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.food-bowl-container__empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
  padding-block: var(--space-3);
}

.food-items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.food-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.food-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-item__header label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.food-item__emoji {
  font-size: var(--font-size-base);
}

.food-item__value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

/* Chew Items Panel */
.chew-items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-3);
}

.chew-item-debug {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.chew-item-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chew-item-debug__header label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chew-item-debug__emoji {
  font-size: var(--font-size-lg);
}

.chew-item-debug__value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.chew-item-debug__metadata {
  display: flex;
  justify-content: center;
  padding-block-start: var(--space-1);
}

.chew-item-debug__usage {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Activity Feed Sidebar */
.activity-feed-sidebar {
  inline-size: 360px;
  block-size: 100%;
  display: flex;
  flex-direction: column;
  border-inline-start: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

/* Mobile: Full width layout for activity feed sidebar */
@media (max-width: 768px) {
  .activity-feed-sidebar {
    inline-size: 100%;
    max-block-size: 300px;
    border-inline-start: none;
    border-block-start: 1px solid var(--color-border);
  }
}
</style>
