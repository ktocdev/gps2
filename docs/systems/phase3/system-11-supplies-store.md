# System 11: Supplies Store

**Phase:** 3.11 - Habitat & Environment
**Status:** Planning Complete - Ready for Implementation
**Created:** October 15, 2025
**Dependencies:** Player Progression (currency), Habitat Conditions (bedding/hay metadata)

---

## Overview

Create a retail pet store-inspired debug panel that's **compact, engaging, and translatable to game UI**. The panel will showcase all purchasable items (bedding, hay, food, habitat items) with a shopping experience that mimics a real pet store.

### Catalog Summary

**Total Items:** 104+ unique purchasable items

**Departments:**
- **Bedding** (3 items): Cheap, Average, Premium
- **Hay** (8 varieties): Timothy, Orchard Grass, Alfalfa, Meadow, Oat, Botanical, Wheat, Mixed
- **Food** (25+ items):
  - Fresh Greens (5)
  - Fresh Herbs (4)
  - Vegetables (5-7)
  - Fruits (5-6)
  - Pellets (3 tiers: Cheap, Standard, Fortified)
  - Premium Treats (3 with visual effects & badge unlocks)
- **Habitat Items** (64+ items):
  - Hideaways (13): Basic, Tunnels, Premium, Beds
  - Toys (11): Rolling, Interactive, Premium
  - Chews (12): Natural Wood, Shaped, Premium
  - Bowls & Bottles (12): Water bottles, Food bowls, Hay racks
  - Enrichment (16): Platforms, Exploration, Sensory, Premium

## Design Philosophy

- **Retail pet store aesthetic**: Organized by department/category like a real store
- **Compact & scannable**: Card-based item displays with key info visible
- **Reusable components**: Leverage existing Button, Badge, Select, Panel components
- **Function-based organization**: Group by item type (Bedding Department, Hay Aisle, Food Section, Habitat Items)
- **Game-ready patterns**: All UI patterns translate directly to the actual store view

---

## Component Structure

### 1. Store Catalog Panel (Main Container)

```
SuppliesStoreDebug.vue
├── Store Header (name, currency display, free mode toggle)
├── Department Navigation (tabs or filter: All, Bedding, Hay, Food, Habitat Items)
├── Item Grid (responsive: 1 col mobile → 2-3 cols desktop)
│   └── Store Item Cards
├── Shopping Cart Panel (selected items, total cost, purchase action)
└── Inventory Integration Panel (shows current inventory after purchase)
```

### 2. Store Item Card (Reusable Component)

**New Component**: `StoreItemCard.vue`

Features:
- Item image/emoji representation
- Item name & description
- Price badge (prominent, top-right corner)
- Stats preview (absorbency, decay rate, nutrition, etc.)
- Quality/rarity badges
- Stock status indicator
- "Add to Cart" / "Quick Buy" buttons
- Compact mode for mobile, expanded on desktop

---

## Department Sections (Organized by Function)

### Bedding Department

**Items:** 3 quality tiers
- Cheap Bedding
- Average Bedding (with "Best Value" badge)
- Premium Bedding

**Display Stats:**
- Absorbency %
- Decay rate %
- Color options

**Visual Features:**
- Price comparison display
- Quality tier badges

---

### Hay Aisle

**Items:** 8 hay varieties
- Timothy Hay (with "Most Popular" badge)
- Orchard Grass
- Alfalfa
- Meadow Hay
- Oat Hay
- Botanical Hay
- Wheat Hay
- Mixed Hay

**Display Stats:**
- Nutritional profile
- Fiber content
- Flavor notes

**Features:**
- Bulk buy options (1 bag, 3 bags, 5 bags with discount)

---

### Food Section

#### Fresh Greens (5 items)
- Green Leaf Lettuce
- Romaine Lettuce
- Red Leaf Lettuce
- Spinach
- Kale

**Display:** Fiber content, vitamin profile, freshness indicator

#### Fresh Herbs (4 items)
- Dill
- Cilantro
- Parsley
- Mint

**Display:** Aromatic strength, flavor profile, digestion benefit

#### Fresh Vegetables (5-7 items)
- Carrot
- Bell Pepper (Red/Yellow/Orange)
- Cucumber
- Celery
- Zucchini

**Display:** Crunch factor, vitamin content, serving size

#### Fresh Fruits (5-6 items)
- Apple
- Strawberry
- Blueberry
- Banana
- Melon

**Display:** Sugar content, portion size, treat value

#### Pellets (3 varieties - price tiered)
- **Cheap Pellets** (budget, lower nutrition)
- **Standard Pellets** (balanced nutrition)
- **Fortified Pellets** (premium, enhanced nutrition)

**Display:** Nutritional completeness, daily recommended amount, price comparison

#### Premium Treats 🌟 (3 specialty items)

**Pumpkin Spice Treat** ($15-20)
- Visual Effect: Orange glow on guinea pig
- Badge Unlock: "Pumpkin Spice Fan" 🎃
- Need Boost: +15 Play, +10 Stimulation
- Duration: 2-4 hours of glow effect

**Tie-Dye Treat** ($18-25)
- Visual Effect: Rainbow/multi-color glow on guinea pig
- Badge Unlock: "Groovy Guinea" 🌈
- Need Boost: +20 Stimulation, +10 Comfort
- Duration: 3-5 hours of color-changing effect

**Island Treat** ($12-18)
- Visual Effect: Tropical blue/teal glow on guinea pig
- Badge Unlock: "Island Vibes" 🌺
- Need Boost: +15 Comfort, +10 Play
- Duration: 2-3 hours of glow effect

**Display:** Need boosts, visual effect duration, badge unlock, premium pricing

---

### Habitat Items

#### Hideaways (Comfort Boost)
**Basic Hideaways** ($8-15)
- **Plastic Igloo** - Classic dome hideaway, easy to clean
- **Wooden Hideout** - Natural wood, chewable edges
- **Seagrass Tent** - Sturdy triangular hideaway made of woven seagrass

**Tunnel Hideaways** ($12-20)
- **Straight Tunnel** - Basic tube for running through
- **Curved Tunnel** - L-shaped corner tunnel
- **Multi-Exit Tunnel** - T-junction tunnel with 3 exits

**Premium Hideaways** ($18-30)
- **Castle Hideout** - Multi-level hideaway with turrets
- **Log Cabin** - Rustic wooden cabin with windows
- **Cuddle Cup** - Soft hanging bed/hideaway combo

**Beds** ($15-28)
- **Fleece Bed** - Soft fleece cushion bed, washable
- **Pillow Bed** - Plush pillow-style bed with raised edges
- **Faux Fur Bed** - Luxurious faux fur lined bed
- **Banana Bed** - Fun banana-shaped bed with cushioned interior

**Affects:** Comfort need
**Display:** Durability, comfort boost (+5 to +25), size (small/medium/large), washability

---

#### Toys (Play Boost)
**Rolling Toys** ($5-12)
- **Willow Ball** - Natural woven ball, rollable and chewable
- **Rattan Ball** - Durable rattan sphere with bell inside
- **Activity Ball** - Plastic ball with treat dispensing holes
- **Rolling Tunnel Ball** - Hollow ball guinea pig can push around

**Interactive Toys** ($8-18)
- **Treat Maze** - Puzzle toy requiring problem-solving
- **Foraging Mat** - Textured mat for hiding food
- **Hanging Toy** - Suspended toy with dangling chewables
- **Push Toy** - Small cart guinea pig can push

**Premium Toys** ($15-25)
- **Activity Center** - Multi-feature toy with tunnels, ramps, bells
- **Digging Box** - Safe digging area with soft fill material
- **Obstacle Course Kit** - Modular pieces for custom courses

**Affects:** Play need (+8 to +25)
**Display:** Durability, play boost, interactive rating

---

#### Chews (Play + Stimulation Boost)
**Natural Wood Chews** ($3-8)
- **Apple Wood Sticks** - Sweet flavored chew sticks (3-pack)
- **Willow Sticks** - Classic willow branches (5-pack)
- **Pear Wood Block** - Chunky block for aggressive chewing
- **Hazelnut Branch** - Natural branch with bark

**Shaped Chews** ($5-12)
- **Grass Woven Ball** - Edible woven ball
- **Timothy Hay Cake** - Compressed hay circle
- **Carrot Chew Toy** - Carrot-shaped wooden chew
- **Corn Husk Toy** - Natural corn husk bundle

**Premium Chews** ($8-15)
- **Chew Stick Kabob** - Variety wood sticks on metal holder
- **Edible Hideaway** - Fully edible grass hut
- **Lava Ledge** - Chewable pumice stone for teeth trimming
- **Loofah Chew** - Natural loofah for chewing and tossing

**Affects:** Play (+5 to +15), Stimulation (+5 to +12)
**Display:** Durability, dental benefit, chew satisfaction

---

#### Bowls & Bottles (Essential + Need Boost)
**Water Bottles** (Essential)
- **Basic Bottle** (Included with habitat) - 8oz standard bottle
- **Large Capacity Bottle** ($8-12) - 16oz for multiple guinea pigs or longer periods
- **Wellness Bottle** ($15-22) - 12oz with vitamin C preservation, +5 Wellness boost
- **Refreshing Bottle** ($18-25) - 12oz with cooling technology, +8 Comfort boost, +5 Wellness boost

**Food Bowls**
- **Basic Ceramic Bowl** ($5-8) - Heavy ceramic, tip-resistant
- **Corner Bowl** ($8-12) - Space-saving corner design
- **Elevated Bowl** ($10-15) - Raised platform for easier eating, +3 Comfort
- **Divided Bowl** ($12-18) - Two compartments for pellets + veggies

**Hay Racks**
- **Basic Hay Rack** ($6-10) - Simple wire rack
- **Corner Hay Rack** ($10-14) - Corner-mounted space saver
- **Hay Ball** ($8-15) - Hanging sphere keeps hay clean
- **Premium Hay Feeder** ($15-22) - Enclosed feeder with minimal waste

**Affects:**
- Wellness Bottle: +5 Wellness
- Refreshing Bottle: +8 Comfort, +5 Wellness
- Elevated Bowl: +3 Comfort
**Display:** Capacity, tip-resistance, need boosts, cleanliness rating

---

#### Enrichment (Stimulation Boost)
**Platforms & Levels** ($10-20)
- **Basic Platform** - Single level wooden platform
- **Corner Ramp** - Space-saving corner platform with ramp
- **Multi-Level Platform** - Two-tier platform system
- **Bridge Platform** - Connecting bridge between two areas

**Exploration Items** ($12-25)
- **Tube System** - Modular connecting tubes (3-piece set)
- **Peek-a-Boo Tunnel** - Tunnel with viewing windows
- **Maze Kit** - Reconfigurable maze walls (6-piece)
- **Observation Deck** - Elevated viewing platform

**Sensory Enrichment** ($8-18)
- **Texture Board** - Board with various textures to explore
- **Scent Garden Box** - Safe herbs planted in box for exploration
- **Crinkle Mat** - Noisy crinkly mat for sensory play
- **Mirror Toy** - Safe acrylic mirror for curiosity

**Premium Enrichment** ($20-40)
- **Adventure Playground** - Multi-feature complex with tunnels, ramps, platforms
- **Foraging Wall** - Vertical wall with pockets for hiding food
- **Climbing Frame** - Safe low-height climbing structure
- **Sensory Course** - Complete course with textures, sounds, obstacles

**Affects:** Stimulation need (+10 to +30)
**Display:** Durability, stimulation boost, complexity rating, space required

---

## UI Patterns & Styling

### Panel Layout

- Use existing `panel--compact` with `panel-row` grid system
- Mobile: single column stack
- Desktop: 2-3 column grid for item cards

### Item Card Styling

```css
.store-item-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  hover: lift shadow (like HabitatDebug panels);
  min-width: 280px;
  layout: grid;
}

/* Premium Treats - Special styling */
.store-item-card--premium {
  border: 2px solid var(--color-primary);
  background: gradient accent;
  hover: shimmer/glow effect;
}
```

### Price Display

- Component: Badge (variant="primary")
- Premium treats: Badge variant="warning" (gold/highlight color)
- Position: top-right of card
- Format: "$XX.XX"

### Stats Grid

- Reuse existing `.stats-grid` pattern from HabitatDebug
- 2-column responsive layout
- Format: Icon + Label + Value

### Action Buttons

- **Primary:** "Add to Cart" (multiple items, batch purchase)
- **Secondary:** "Quick Buy" (instant purchase, bypass cart)
- **Tertiary:** "View Details" (expand stats)

---

## Shopping Cart Feature

- Floating cart badge (shows item count)
- Expandable cart panel (collapsible Details component)
- Line items with quantity adjusters (+/-)
- Running total calculation
- "Purchase All" button
- Clear cart action

---

## Debug-Specific Features

1. **Free Store Mode Toggle**: Bypass currency checks (like freeResourcesEnabled in HabitatDebug)
2. **Instant Restock**: Reset all items to full stock
3. **Price Adjuster**: Slider to test pricing (50% - 200% of base price)
4. **Availability Testing**: Toggle seasonal/limited items
5. **Add Currency**: Quick currency add buttons ($100, $500, $1000)
6. **Test Visual Effects**: Button to preview treat glow effects on guinea pigs
7. **Test Badge Unlock**: Preview badge system for premium treats

---

## Integration Points

### Files to Create

- `src/stores/suppliesStore.ts` - Main catalog and pricing logic
- `src/types/supplies.ts` - TypeScript interfaces for all item types
- `src/components/debug/SuppliesStoreDebug.vue` - Debug panel
- `src/components/game/StoreItemCard.vue` - Reusable item card (game + debug)

### Files to Reference

- `src/stores/playerProgression.ts` - Currency integration, badge system
- `src/stores/habitatConditions.ts` - Bedding/hay metadata (will be consumed)
- `src/stores/guineaPigStore.ts` - Visual effects (glow/color) integration
- `src/components/debug/HabitatDebug.vue` - Layout/organization patterns

---

## Reusable Components

### Existing Components (No Changes Required)

- Button
- Badge
- Select
- Panel
- CheckboxField

### New Components to Create

- **StoreItemCard**: Item display card (game + debug)
- **ShoppingCart**: Cart UI (could be game feature later)
- **PriceTag**: Specialized Badge for pricing
- **StockIndicator**: Badge showing "In Stock", "Low Stock", "Sold Out"

---

## Data Structure

### SuppliesItem Interface

```typescript
interface SuppliesItem {
  id: string
  name: string
  description: string
  category: 'bedding' | 'hay' | 'food' | 'habitat_item'
  subCategory?:
    // Food subcategories
    | 'greens' | 'herbs' | 'vegetables' | 'fruits' | 'pellets' | 'treats'
    // Habitat item subcategories
    | 'hideaways' | 'toys' | 'chews' | 'bowls_bottles' | 'enrichment'
  basePrice: number
  currency: 'dollars'

  // Stats (category-dependent)
  stats?: {
    // Bedding stats
    absorbency?: number
    decayRate?: number

    // Food stats
    nutrition?: number
    hungerSatisfaction?: number
    servingSize?: string
    shelfLife?: string

    // Habitat item stats
    durability?: number
    playBoost?: number         // Affects Play need (toys, chews)
    stimulationBoost?: number  // Affects Stimulation need (chews, enrichment)
    comfortBoost?: number      // Affects Comfort need (hideaways, bottles, bowls)
    wellnessBoost?: number     // Affects Wellness need (wellness bottle, refreshing bottle)

    // Bowls & Bottles specific
    capacity?: string          // e.g., "8oz", "16oz", "12oz"
    tipResistance?: boolean
    cleanlinessRating?: number // 1-10 scale

    // Chews specific
    dentalBenefit?: number     // 1-10 scale
    chewSatisfaction?: number  // 1-10 scale

    // Toys & Enrichment specific
    interactiveRating?: number // 1-10 scale
    complexityRating?: number  // 1-10 scale
    spaceRequired?: 'small' | 'medium' | 'large'

    // Hideaways specific
    size?: 'small' | 'medium' | 'large'
  }

  // Premium treat effects
  visualEffect?: {
    type: 'glow' | 'color_shift'
    color: string | string[] // Single color or gradient
    duration: number // Duration in minutes
  }

  badgeUnlock?: {
    id: string
    name: string
    emoji: string
  }

  // Availability
  availability: 'always' | 'seasonal' | 'limited'
  stockQuantity?: number
  isEssential?: boolean // True for basic bottle (included with habitat)

  // Metadata
  emoji?: string
  quality?: 'cheap' | 'average' | 'premium'
  tier?: 'basic' | 'standard' | 'premium' // For items with quality tiers
  tags?: string[] // ['popular', 'best-value', 'new', 'fresh', 'special', 'included']
}
```

---

## Implementation Order

1. ✅ **Phase 1**: Create documentation (this file)
2. **Phase 2**: Create `suppliesStore.ts` with full item catalog
   - All bedding types (3)
   - All hay varieties (8)
   - All food items:
     - Greens (5)
     - Herbs (4)
     - Vegetables (5-7)
     - Fruits (5-6)
     - Pellets (3 tiers)
     - Premium Treats (3)
   - All habitat items:
     - **Hideaways** (13 items): Basic hideaways (3), Tunnel hideaways (3), Premium hideaways (3), Beds (4)
     - **Toys** (11 items): Rolling toys (4), Interactive toys (4), Premium toys (3)
     - **Chews** (12 items): Natural wood chews (4), Shaped chews (4), Premium chews (4)
     - **Bowls & Bottles** (12 items): Water bottles (4), Food bowls (4), Hay racks (4)
     - **Enrichment** (16 items): Platforms (4), Exploration (4), Sensory (4), Premium (4)
3. **Phase 3**: Create `supplies.ts` TypeScript interfaces
4. **Phase 4**: Build `StoreItemCard.vue` component with all display patterns (standard + premium styling)
5. **Phase 5**: Create `SuppliesStoreDebug.vue` with department organization
6. **Phase 6**: Implement shopping cart and purchase flow
7. **Phase 7**: Add debug-specific controls (free mode, price testing, visual effect preview)
8. **Phase 8**: Connect to `inventoryStore.ts` for purchase integration (Phase 3.12)
9. **Phase 9**: Implement visual effects system for premium treats (glow, color shift)

---

## Success Criteria

- ✅ All item categories represented (bedding, hay, 6 food subcategories, 5 habitat item subcategories)
- ✅ Food section properly organized: Greens, Herbs, Vegetables, Fruits, Pellets (3 tiers), Premium Treats
- ✅ Habitat items properly separated: Hideaways, Toys, Chews, Bowls & Bottles, Enrichment
- ✅ Pellets department has 3 quality tiers: Cheap, Standard, Fortified
- ✅ Premium treats have special visual styling and higher prices ($12-25 range)
- ✅ Premium treats unlock badges and visual effects (glow, color shift)
- ✅ Habitat items map to correct needs:
  - Hideaways → Comfort
  - Toys → Play
  - Chews → Play + Stimulation
  - Bowls & Bottles → Essential items (some with Wellness/Comfort boosts)
  - Enrichment → Stimulation
- ✅ Water bottles include variety: Basic (included), Large Capacity, Wellness (+5 Wellness), Refreshing (+8 Comfort, +5 Wellness)
- ✅ Comprehensive catalog with 64+ unique habitat items across 5 subcategories
- ✅ Hideaways include 4 bed types: Fleece Bed, Pillow Bed, Faux Fur Bed, Banana Bed
- ✅ Compact, scannable card layout responsive on mobile
- ✅ Reusable StoreItemCard component works for both debug + game
- ✅ Shopping cart allows batch purchases
- ✅ Debug controls (free mode, price testing, visual effect preview) functional
- ✅ Integrates with playerProgression currency and badge system
- ✅ Visual aesthetic matches "retail pet store" theme
- ✅ Organized by function (departments/categories)

---

## Testing Strategy

### Manual Testing

1. Test all department filters (All, Bedding, Hay, Food, Habitat Items)
2. Verify item card display for each category
3. Test shopping cart add/remove/quantity adjust
4. Test purchase flow with sufficient/insufficient currency
5. Test free store mode toggle
6. Test price adjuster (50%-200% range)
7. Test visual effect preview for premium treats
8. Test badge unlock preview

### Integration Testing

1. Verify currency deduction from playerProgression
2. Verify inventory updates after purchase
3. Verify bedding/hay integration with habitatConditions
4. Verify premium treat visual effects on guinea pigs
5. Verify badge unlocks in playerProgression

---

## Documentation Links

- [Phase 3 Overview](../../DEVELOPMENT_PHASES.md#phase-3-game-world--environment-systems-11-15)
- [System Integration Map](../../SYSTEM_INTEGRATION.md)
- [Habitat Conditions Store](system-11-habitat-conditions.md)
- [Inventory Management System](inventory-store-system.md)
