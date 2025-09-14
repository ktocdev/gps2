# Inventory & Store System - System 13

**Phase 3: Game World & Environment**

## Overview
Comprehensive economic system managing player inventory, store purchases, currency earning, and resource management with preference-based shopping and consumable resource tracking.

## Core System Components

### Player Inventory Management
- **Item storage** for owned but unplaced habitat items
- **Resource inventory** for consumables (bedding, food supplies)
- **Inventory capacity** management with upgrade options
- **Item organization** with categories and sorting options
- **Quick access** to frequently used items and resources

### Store System
- **Purchasable items** with comprehensive currency system
- **Dynamic pricing** with sales, discounts, and seasonal offers
- **Item availability** with stock management and restocking cycles
- **Preview system** allowing item examination before purchase
- **Wishlist functionality** for planned purchases and budget planning

## Currency & Economic System

### Currency Earning Mechanics
- **Guinea pig care rewards** - consistent care provides steady income
- **Achievement bonuses** - milestone completion provides currency rewards
- **Daily login rewards** - encouraging regular play with small currency bonuses
- **Care quality bonuses** - exceptional guinea pig care provides premium rewards
- **Efficiency rewards** - optimal resource management provides economic benefits

### Daily Rewards & Milestones
- **Daily check-in bonuses** with increasing value for consecutive days
- **Weekly milestone rewards** for sustained engagement
- **Care achievement bonuses** for exceptional guinea pig care
- **Preference discovery rewards** for learning guinea pig personality
- **Long-term progression** bonuses for dedicated players

### Economic Balance
- **Sustainable earning** ensuring players can afford essential needs
- **Luxury expense** making premium items meaningful investments
- **Budget pressure** creating strategic spending decisions
- **Economic progression** with increasing earning potential over time

## Item Categories & Inventory

### Essential Item Categories
- **Hay varieties** (8 types) - core nutritional needs with preference variety
- **Vegetables** (12 types) - daily nutrition with individual preferences
- **Fruits** (treats, 10 types) - special rewards and preference discovery
- **Toys/enrichment** - happiness and entertainment items
- **Shelter & comfort** - security and rest items
- **Decorations** - aesthetic customization and themed environments
- **Habitat supplies** - essential maintenance resources (bedding)

### Expanded Food Categories

#### Hay Types (8 Varieties)
Essential daily nutrition with individual guinea pig preferences:
- **Timothy Hay** - Classic high-fiber option, most common preference
- **Orchard Grass** - Sweet flavor with softer texture
- **Meadow Hay** - Mixed grasses providing texture variety
- **Alfalfa Hay** - Rich, high-calcium (young/pregnant guinea pigs)
- **Botanical Hay** - Mixed with herbs and flowers for enrichment
- **Oat Hay** - Sweet flavor with seed heads for texture
- **Bermuda Grass** - Fine texture with mild flavor
- **Western Timothy** - Premium timothy variety with superior quality

#### Vegetables (12 Varieties)
Daily nutrition with preference-based selection:
- **Bell Peppers** - High vitamin C, crunchy texture
- **Carrots** - Sweet flavor, satisfying crunch
- **Leafy Greens** - Essential nutrition, varied textures
- **Cucumber** - High water content, refreshing
- **Cherry Tomatoes** - Sweet and juicy (limited quantity)
- **Broccoli** - Nutritious but strong flavor
- **Celery** - Crunchy texture with mild flavor
- **Zucchini** - Soft texture, mild taste
- **Parsley** - Herb with strong flavor profile
- **Cilantro** - Distinctive herb taste
- **Sweet Potato** - Sweet, dense texture
- **Snap Peas** - Crunchy pods with sweet interior

#### Fruits (10 Varieties - Treats)
Special occasion treats with strong preference effects:
- **Apple** - Classic fruit with varied sweetness
- **Banana** - Soft texture, high sugar content
- **Strawberry** - Sweet and juicy, high vitamin C
- **Blueberry** - Small, sweet, antioxidant-rich
- **Orange** - Citrus flavor, high vitamin C
- **Grape** - Very sweet, small portions only
- **Pear** - Soft, sweet, gentle flavor
- **Melon** - High water content, refreshing
- **Kiwi** - Unique flavor, soft texture
- **Raspberry** - Tart-sweet flavor, small size

### Detailed Happiness Item Categories

#### Entertainment Toys
Mental and physical stimulation items:
- **Chew toys** - Variety of materials and textures for dental health
- **Balls** - Rolling and pushing toys for physical activity
- **Puzzle feeders** - Mental stimulation requiring problem-solving
- **Interactive toys** - Complex engagement requiring guinea pig interaction

#### Comfort & Shelter
Rest and security items:
- **Hideouts** - Security and privacy locations
- **Platforms** - Territory expansion and observation points
- **Soft bedding** - Premium comfort materials
- **Cozy corners** - Specialized rest areas with enhanced comfort

#### Activity Items
Physical exercise and exploration:
- **Tunnels** - Navigation and exploration opportunities
- **Climbing structures** - Multi-level territory expansion
- **Exercise equipment** - Guinea pig-safe activity options
- **Exploration items** - Curiosity and investigation encouragement

#### Novelty Items
Special and seasonal content:
- **Seasonal decorations** - Holiday and themed items
- **Themed accessories** - Coordinated environmental themes
- **Limited-time specials** - Exclusive items creating urgency
- **Community event items** - Shared experience participation

## Preference-Based Shopping

### Discovery-Driven Purchasing
- **Preference learning** through guinea pig observation and reaction
- **Purchase validation** - preferred items provide enhanced value
- **Experimentation encouragement** - multiple options promote discovery
- **Learning rewards** - successful preference identification provides satisfaction

### Strategic Shopping Benefits
- **Informed decisions** based on guinea pig personality
- **Value optimization** - preferred items provide better happiness returns
- **Budget efficiency** - reduced waste on ineffective items
- **Relationship building** - understanding preferences deepens guinea pig bond

### Preference Integration
- **Shopping recommendations** based on discovered preferences
- **Bundle offers** featuring preferred item combinations
- **Seasonal suggestions** aligning with guinea pig preferences
- **Discovery tracking** showing preference learning progress

## Bedding as Consumable Resource

### Resource Management System
- **Various bedding types** with different costs, freshness duration, and comfort levels
- **Consumption tracking** monitoring usage rates and remaining supplies
- **Strategic purchasing** balancing cost vs quality vs longevity
- **Resource planning** anticipating future needs for efficient spending

### Bedding Variety & Economics
- **Basic bedding** - affordable option with standard freshness duration
- **Premium bedding** - enhanced comfort and longer freshness at higher cost
- **Specialty bedding** - unique materials with special properties
- **Bulk purchasing** - economic incentives for larger quantity purchases

### New Player Support
- **Starter bedding supply** provided at game creation
- **Learning buffer** preventing immediate resource pressure
- **Tutorial integration** teaching bedding management fundamentals
- **Gradual transition** to independent resource management

### Maintenance Integration
- **Low bedding alerts** preventing resource shortages
- **Auto-purchase options** for convenient resource management
- **Usage optimization** learning efficient bedding management
- **Emergency purchasing** options for urgent situations

## Advanced Economic Features

### Item Rarity System
- **Common items** - readily available with standard pricing
- **Rare items** - limited availability with premium pricing
- **Premium items** - exceptional quality with luxury pricing
- **Exclusive items** - special access requirements and unique benefits

### Limited-Time Offers
- **Seasonal sales** with discounted pricing on themed items
- **Flash sales** creating urgency and special value opportunities
- **Bundle deals** encouraging complementary item purchases
- **Event specials** tied to community activities and celebrations

### Item Management Features
- **Purchase and placement** - seamless buying to habitat integration
- **Storage management** - inventory organization and capacity optimization
- **Item removal** - relocating items between habitat and storage
- **Sell-back options** - recovering value from unused items

## Technical Implementation

### Inventory System Architecture
```typescript
interface PlayerInventory {
  habitatItems: InventoryItem[]
  consumableResources: ResourceStack[]
  currency: number
  capacity: number
  categories: ItemCategory[]
}

interface InventoryItem {
  itemId: string
  quantity: number
  quality: ItemQuality
  purchaseDate: Date
  effectiveness?: number
}

interface ResourceStack {
  resourceType: string
  quantity: number
  quality: ResourceQuality
  expirationDate?: Date
}
```

### Store System Implementation
- **Dynamic inventory** with real-time stock management
- **Pricing algorithms** supporting discounts, sales, and dynamic pricing
- **Purchase validation** ensuring currency sufficiency and inventory capacity
- **Transaction logging** for economics analysis and player behavior tracking

### Economic Balance Monitoring
- **Earning rate tracking** ensuring sustainable player economy
- **Spending pattern analysis** for pricing optimization
- **Resource consumption monitoring** for balance validation
- **Player progression tracking** for reward system optimization

## Integration Points

### Habitat Item System Connection
- **Seamless item placement** from inventory to habitat grid
- **Storage coordination** managing items between habitat and inventory
- **Effectiveness tracking** influencing future purchase decisions
- **Replacement planning** coordinating item wear with inventory management

### Guinea Pig Preferences Integration
- **Preference-based recommendations** in store interface
- **Purchase validation** showing preference alignment
- **Discovery rewards** for successful preference-based purchases
- **Learning progression** reflected in shopping interface

### Currency & Achievement System
- **Achievement reward distribution** providing currency bonuses
- **Care quality assessment** determining reward levels
- **Progress tracking** for milestone-based rewards
- **Economic progression** supporting long-term engagement

### Activity Feed Integration
- **Purchase announcements** - "You bought a premium tunnel system"
- **Resource alerts** - "Bedding supply is running low"
- **Preference discoveries** - "Guinea pig loves the new timothy hay!"
- **Economic milestones** - "You've earned enough for the deluxe hideout!"

## Gameplay Benefits

### Strategic Economic Gameplay
- **Resource management** skills development
- **Budget planning** and priority setting
- **Long-term progression** goals and achievement
- **Value optimization** through preference learning

### Player Engagement
- **Collection motivation** with item variety and rarity
- **Customization satisfaction** through personal habitat creation
- **Discovery rewards** from preference-based shopping success
- **Progression satisfaction** from economic growth and advancement

### Educational Value
- **Resource management** skills applicable beyond gaming
- **Budget planning** and financial decision-making
- **Priority setting** and value assessment
- **Long-term planning** and goal achievement

## Future Enhancement Opportunities

### Advanced Economic Features
- **Investment systems** with passive income opportunities
- **Trading systems** between players for rare items
- **Market dynamics** with supply and demand pricing
- **Seasonal economies** with changing item availability and pricing

### Expanded Item Systems
- **Crafting mechanics** for custom item creation
- **Item modification** and upgrade systems
- **Community marketplace** for player-created content
- **Subscription services** for regular resource delivery

### Social Economic Features
- **Gift giving** between players
- **Group purchases** for community items
- **Economic competitions** and leaderboards
- **Charity systems** supporting in-game community causes