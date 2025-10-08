<template>
  <div class="personality-debug">
    <h2>Personality Trait Influences Debug</h2>

    <!-- Active Guinea Pigs Only -->
    <div v-if="hasActiveGuineaPigs">
      <h3>Active Guinea Pigs - Personality Traits</h3>
      <div class="guinea-pigs-grid mb-6">
        <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id">
          <div class="panel">
            <div class="panel__header">
              <h4>{{ guineaPig.name }} ({{ guineaPig.breed }})</h4>
            </div>
            <div class="panel__content">
              <!-- Personality Traits -->
              <div class="panel panel--accent mb-4">
                <div class="panel__header">
                  <h5>Personality Traits</h5>
                </div>
                <div class="panel__content">
                  <!-- Friendliness -->
                  <div class="trait-row mb-3">
                    <div class="trait-row__info">
                      <label :for="`${guineaPig.id}-friendliness`" class="trait-row__label">
                        Friendliness
                      </label>
                      <span class="trait-row__value" :class="getTraitLevelClass(guineaPig.personality.friendliness)">
                        {{ guineaPig.personality.friendliness }} / 10
                        <span class="trait-row__descriptor">{{ getTraitDescriptor(guineaPig.personality.friendliness) }}</span>
                      </span>
                    </div>
                    <SliderField
                      :id="`${guineaPig.id}-friendliness`"
                      :modelValue="guineaPig.personality.friendliness"
                      :min="1"
                      :max="10"
                      :step="1"
                      prefix=""
                      suffix=""
                      :show-min-max="true"
                      @update:modelValue="(value: number) => adjustTrait(guineaPig.id, 'friendliness', value)"
                      class="trait-row__slider"
                    />
                  </div>

                  <!-- Playfulness -->
                  <div class="trait-row mb-3">
                    <div class="trait-row__info">
                      <label :for="`${guineaPig.id}-playfulness`" class="trait-row__label">
                        Playfulness
                      </label>
                      <span class="trait-row__value" :class="getTraitLevelClass(guineaPig.personality.playfulness)">
                        {{ guineaPig.personality.playfulness }} / 10
                        <span class="trait-row__descriptor">{{ getTraitDescriptor(guineaPig.personality.playfulness) }}</span>
                      </span>
                    </div>
                    <SliderField
                      :id="`${guineaPig.id}-playfulness`"
                      :modelValue="guineaPig.personality.playfulness"
                      :min="1"
                      :max="10"
                      :step="1"
                      prefix=""
                      suffix=""
                      :show-min-max="true"
                      @update:modelValue="(value: number) => adjustTrait(guineaPig.id, 'playfulness', value)"
                      class="trait-row__slider"
                    />
                  </div>

                  <!-- Curiosity -->
                  <div class="trait-row mb-3">
                    <div class="trait-row__info">
                      <label :for="`${guineaPig.id}-curiosity`" class="trait-row__label">
                        Curiosity
                      </label>
                      <span class="trait-row__value" :class="getTraitLevelClass(guineaPig.personality.curiosity)">
                        {{ guineaPig.personality.curiosity }} / 10
                        <span class="trait-row__descriptor">{{ getTraitDescriptor(guineaPig.personality.curiosity) }}</span>
                      </span>
                    </div>
                    <SliderField
                      :id="`${guineaPig.id}-curiosity`"
                      :modelValue="guineaPig.personality.curiosity"
                      :min="1"
                      :max="10"
                      :step="1"
                      prefix=""
                      suffix=""
                      :show-min-max="true"
                      @update:modelValue="(value: number) => adjustTrait(guineaPig.id, 'curiosity', value)"
                      class="trait-row__slider"
                    />
                  </div>

                  <!-- Boldness -->
                  <div class="trait-row">
                    <div class="trait-row__info">
                      <label :for="`${guineaPig.id}-boldness`" class="trait-row__label">
                        Boldness
                      </label>
                      <span class="trait-row__value" :class="getTraitLevelClass(guineaPig.personality.boldness)">
                        {{ guineaPig.personality.boldness }} / 10
                        <span class="trait-row__descriptor">{{ getTraitDescriptor(guineaPig.personality.boldness) }}</span>
                      </span>
                    </div>
                    <SliderField
                      :id="`${guineaPig.id}-boldness`"
                      :modelValue="guineaPig.personality.boldness"
                      :min="1"
                      :max="10"
                      :step="1"
                      prefix=""
                      suffix=""
                      :show-min-max="true"
                      @update:modelValue="(value: number) => adjustTrait(guineaPig.id, 'boldness', value)"
                      class="trait-row__slider"
                    />
                  </div>
                </div>
              </div>

              <!-- Decay Rate Preview Calculator -->
              <div class="panel panel--bordered">
                <div class="panel__header">
                  <h5>Need Decay Rate Modifiers</h5>
                </div>
                <div class="panel__content">
                  <div class="decay-preview">
                    <div class="decay-preview__item">
                      <span class="decay-preview__label">Social Need Decay:</span>
                      <span class="decay-preview__value" :class="getDecayModifierClass(getSocialDecayModifier(guineaPig.personality.friendliness))">
                        {{ getSocialDecayModifier(guineaPig.personality.friendliness) }}x
                        <span class="decay-preview__effect">{{ getDecayEffectText(getSocialDecayModifier(guineaPig.personality.friendliness)) }}</span>
                      </span>
                    </div>
                    <div class="decay-preview__item">
                      <span class="decay-preview__label">Play Need Decay:</span>
                      <span class="decay-preview__value" :class="getDecayModifierClass(getPlayDecayModifier(guineaPig.personality.playfulness))">
                        {{ getPlayDecayModifier(guineaPig.personality.playfulness) }}x
                        <span class="decay-preview__effect">{{ getDecayEffectText(getPlayDecayModifier(guineaPig.personality.playfulness)) }}</span>
                      </span>
                    </div>
                    <div class="decay-preview__item">
                      <span class="decay-preview__label">Stimulation Need Decay:</span>
                      <span class="decay-preview__value" :class="getDecayModifierClass(getStimulationDecayModifier(guineaPig.personality.curiosity))">
                        {{ getStimulationDecayModifier(guineaPig.personality.curiosity) }}x
                        <span class="decay-preview__effect">{{ getDecayEffectText(getStimulationDecayModifier(guineaPig.personality.curiosity)) }}</span>
                      </span>
                    </div>
                    <div class="decay-preview__item">
                      <span class="decay-preview__label">Comfort Need Decay:</span>
                      <span class="decay-preview__value" :class="getDecayModifierClass(getBoldnessDecayModifier(guineaPig.personality.boldness))">
                        {{ getBoldnessDecayModifier(guineaPig.personality.boldness) }}x
                        <span class="decay-preview__effect">{{ getDecayEffectText(getBoldnessDecayModifier(guineaPig.personality.boldness)) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Active Guinea Pigs -->
    <div v-else class="panel panel--bordered">
      <div class="panel__content">
        <p class="text-muted">No active guinea pigs. Adopt guinea pigs from the Pet Store to test personality traits.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import SliderField from '../basic/SliderField.vue'

const guineaPigStore = useGuineaPigStore()

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Adjust personality trait
function adjustTrait(guineaPigId: string, trait: 'friendliness' | 'playfulness' | 'curiosity' | 'boldness', value: number) {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (guineaPig) {
    guineaPig.personality[trait] = value
  }
}

// Get trait level descriptor
function getTraitDescriptor(value: number): string {
  if (value <= 3) return 'Low'
  if (value <= 6) return 'Moderate'
  return 'High'
}

// Get trait level class
function getTraitLevelClass(value: number): string {
  if (value <= 3) return 'trait-level--low'
  if (value <= 6) return 'trait-level--moderate'
  return 'trait-level--high'
}

// Decay rate calculators (from System 1 documentation)
function getSocialDecayModifier(friendliness: number): string {
  const modifier = 1 + (friendliness - 5) * 0.04
  return modifier.toFixed(2)
}

function getPlayDecayModifier(playfulness: number): string {
  const modifier = 1 + (playfulness - 5) * 0.06
  return modifier.toFixed(2)
}

function getStimulationDecayModifier(curiosity: number): string {
  const modifier = 1 + (curiosity - 5) * 0.08
  return modifier.toFixed(2)
}

function getBoldnessDecayModifier(boldness: number): string {
  const modifier = 1 - (boldness - 5) * 0.05
  return modifier.toFixed(2)
}

// Get decay modifier class (for visual feedback)
function getDecayModifierClass(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  if (modifierValue < 0.9) return 'decay-modifier--slower'
  if (modifierValue > 1.1) return 'decay-modifier--faster'
  return 'decay-modifier--normal'
}

// Get decay effect text
function getDecayEffectText(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  const percentChange = ((modifierValue - 1) * 100).toFixed(0)

  if (modifierValue < 1) {
    return `(${percentChange}%)`
  } else if (modifierValue > 1) {
    return `(+${percentChange}%)`
  }
  return '(baseline)'
}
</script>

<style scoped>
.personality-debug {
  padding-block-end: var(--spacing-8);
}

.guinea-pigs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 600px), 1fr));
  gap: var(--spacing-6);
}

/* Trait Row */
.trait-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.trait-row__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trait-row__label {
  font-weight: 600;
  font-size: var(--font-size-md);
}

.trait-row__value {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.trait-row__descriptor {
  font-size: var(--font-size-xs);
  font-weight: 400;
  margin-inline-start: var(--spacing-2);
}

/* Trait Level Classes */
.trait-level--low {
  color: var(--color-info);
}

.trait-level--moderate {
  color: var(--color-warning);
}

.trait-level--high {
  color: var(--color-success);
}

.trait-row__slider {
  inline-size: 100%;
}

/* Decay Preview */
.decay-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.decay-preview__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--spacing-2);
  border-block-end: 1px solid var(--color-border);
}

.decay-preview__item:last-child {
  border-block-end: none;
}

.decay-preview__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.decay-preview__value {
  font-size: var(--font-size-md);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.decay-preview__effect {
  font-size: var(--font-size-xs);
  font-weight: 400;
}

/* Decay Modifier Classes */
.decay-modifier--slower {
  color: var(--color-success);
}

.decay-modifier--faster {
  color: var(--color-danger);
}

.decay-modifier--normal {
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 1440px) {
  .guinea-pigs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
