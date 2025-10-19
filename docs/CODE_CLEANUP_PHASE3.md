# Phase 3 Stores Code Quality Analysis & Cleanup Plan

**Created:** October 19, 2025
**Scope:** suppliesStore.ts, inventoryStore.ts, habitatConditions.ts
**Total Lines Analyzed:** 3,865 lines
**Issues Identified:** 30 issues (4 Critical, 8 High Priority, 12 Medium, 6 Low)

---

## Executive Summary

Phase 3 stores are **functionally complete** but have significant maintainability issues:

- **2,330 lines of inline item data** making suppliesStore.ts nearly unmaintainable
- **Extensive code duplication** in filters, purchase logic, and instance management
- **Missing utilities** for constants, error handling, and logging
- **Tight coupling** between concerns (bowl logic in habitat, poop tracking in conditions)

**Potential Impact:**
- **-2,695 lines** of code reduction (-70% of total)
- **Significantly improved maintainability**
- **Better testability** through separation of concerns
- **Type safety improvements**

---

## Critical Issues (Must Fix)

### 1. Massive Inline Data File ⚠️ CRITICAL
**File:** suppliesStore.ts (Lines 111-2441)
**Problem:** 2,330 lines of inline item definitions
**Impact:** Unmaintainable, merge conflicts, impossible to version control items separately

**Solution:** Extract to JSON files
```
src/data/supplies/
├── bedding.json
├── hay.json
├── food/
│   ├── greens.json
│   ├── herbs.json
│   ├── vegetables.json
│   ├── fruits.json
│   ├── pellets.json
│   └── treats.json
└── habitat/
    ├── hideaways.json
    ├── toys.json
    ├── chews.json
    ├── bowls_bottles.json
    └── enrichment.json
```

Create `src/utils/catalogLoader.ts` to load and validate items.

**Estimated Time:** 8-12 hours
**Lines Saved:** -2,330 lines
**Reduces file from:** 2,662 → ~330 lines

---

### 2. Repeated Filter Patterns ⚠️ CRITICAL
**File:** suppliesStore.ts (Lines 34-100)
**Problem:** 16 nearly identical category/subcategory getters

**Current:**
```typescript
allBedding: (state) => state.catalog.filter(item => item.category === 'bedding')
allHay: (state) => state.catalog.filter(item => item.category === 'hay')
greens: (state) => state.catalog.filter(item => item.subCategory === 'greens')
// ... 13 more identical patterns
```

**Solution:**
```typescript
itemsByCategory: (state) => (category: string) =>
  state.catalog.filter(item => item.category === category)

itemsBySubCategory: (state) => (subCategory: string) =>
  state.catalog.filter(item => item.subCategory === subCategory)
```

**Estimated Time:** 1-2 hours
**Lines Saved:** -60 lines

---

### 3. Hardcoded Magic Numbers ⚠️ CRITICAL
**Files:** All three stores
**Problem:** Magic numbers scattered without named constants

**Examples:**
- `Math.random() * 4) + 2` - poop cleanliness reduction
- `20` - hay handfuls per bag
- `4` - hay rack capacity
- `100` - history snapshot limit
- `40`, `20` - alert thresholds

**Solution:** Create `src/constants/supplies.ts`
```typescript
export const QUALITY_ORDER = {
  cheap: 1,
  average: 2,
  premium: 3
} as const

export const HABITAT_CONSTANTS = {
  HAY_HANDFULS_PER_BAG: 20,
  HAY_RACK_MAX_CAPACITY: 4,
  POOP_CLEANLINESS_MIN: 2,
  POOP_CLEANLINESS_MAX: 5,
  CONDITION_HISTORY_MAX: 100,
  WARNING_THRESHOLD: 40,
  CRITICAL_THRESHOLD: 20
} as const
```

**Estimated Time:** 2-3 hours
**Impact:** Prevents bugs, enables easy tuning

---

### 4. Missing Map Serialization Validation ⚠️ CRITICAL
**File:** habitatConditions.ts (Lines 682-710)
**Problem:** Map deserialization will break if data is corrupted

**Current:**
```typescript
if (parsed.itemPositions && Array.isArray(parsed.itemPositions)) {
  parsed.itemPositions = new Map(parsed.itemPositions)
}
// Silent failure if not an array
```

**Solution:** Create `src/utils/mapSerialization.ts`
```typescript
export function safeDeserializeMap<K, V>(
  value: unknown,
  fallback: Map<K, V> = new Map()
): Map<K, V> {
  if (!value || !Array.isArray(value)) return fallback
  try {
    return new Map(value as [K, V][])
  } catch {
    return fallback
  }
}
```

**Estimated Time:** 1 hour
**Impact:** Prevents store corruption

---

## High Priority Issues (Should Fix)

### 5. Duplicate Purchase Logic
**File:** suppliesStore.ts (Lines 2544-2660)
**Problem:** `purchaseItem` and `purchaseMultipleItems` have 90% duplicate code

**Solution:** Refactor `purchaseItem` to call `purchaseMultipleItems`:
```typescript
purchaseItem(itemId: string, quantity: number = 1): PurchaseResult {
  return this.purchaseMultipleItems([{ itemId, quantity }])
}
```

**Estimated Time:** 2-3 hours
**Lines Saved:** ~50 lines

---

### 6. Repeated Instance Filter Patterns
**File:** inventoryStore.ts (Lines 72-142)
**Problem:** Five getters with nearly identical filter logic

**Solution:** Generic instance counter
```typescript
getInstanceCount() {
  return (itemId: string, predicate?: (inst: ItemInstance) => boolean): number => {
    const inventoryItem = this.itemsById.get(itemId)
    if (!inventoryItem) return 0
    return predicate
      ? inventoryItem.instances.filter(predicate).length
      : inventoryItem.instances.length
  }
}
```

**Estimated Time:** 1-2 hours
**Lines Saved:** ~40 lines

---

### 7. Inconsistent Error Handling
**Files:** All stores
**Problem:** Mix of `console.warn`, `return false`, and result objects

**Solution:** Create `src/utils/storeErrors.ts`
```typescript
export type StoreError = {
  code: string
  message: string
  context?: Record<string, unknown>
}

export function createError(code: string, message: string, context?): StoreError {
  return { code, message, context }
}

export function logError(error: StoreError): void {
  console.warn(`[${error.code}] ${error.message}`, error.context)
}
```

**Estimated Time:** 3-4 hours
**Impact:** Consistent debugging, better error tracking

---

### 8. Bowl/Hay Rack Logic Should Be Extracted
**File:** habitatConditions.ts (Lines 409-594)
**Problem:** 185 lines of container logic violates single responsibility

**Solution:** Create `src/composables/useHabitatContainers.ts`
```typescript
export function useHabitatContainers() {
  const bowlContents = ref<Map<string, FoodItem[]>>(new Map())
  const hayRackContents = ref<Map<string, HayServing[]>>(new Map())

  function addFoodToBowl(bowlItemId: string, foodItemId: string): boolean { }
  function addHayToRack(hayRackItemId: string, hayItemId: string): boolean { }

  return { bowlContents, hayRackContents, addFoodToBowl, addHayToRack }
}
```

**Estimated Time:** 3-4 hours
**Lines Saved:** -185 lines from habitat store
**Impact:** Better separation of concerns

---

### 9. Sorting Logic Hardcoded
**File:** suppliesStore.ts (Lines 2508-2538)
**Problem:** Quality/tier order hardcoded in sorting method

**Solution:** Extract to `src/utils/suppliesSorting.ts` using constants

**Estimated Time:** 1 hour

---

### 10. Poop Management Should Be Separate
**File:** habitatConditions.ts (Lines 152-180)
**Problem:** Poop tracking tightly coupled with habitat conditions

**Solution:** Extract to `src/composables/usePoopTracking.ts`

**Estimated Time:** 2-3 hours
**Impact:** Cleaner separation, more testable

---

### 11. Instance ID Not Guaranteed Unique
**File:** inventoryStore.ts (Lines 16-18)
**Problem:** `Date.now() + Math.random()` could theoretically collide

**Solution:**
```typescript
function generateInstanceId(): string {
  return `instance_${crypto.randomUUID()}`
}
```

**Estimated Time:** 5 minutes
**Impact:** Eliminates collision risk

---

### 12. Serving System Logic Duplicated
**Files:** inventoryStore.ts, habitatConditions.ts
**Problem:** Serving checks scattered across files

**Solution:** Create `src/utils/servingSystem.ts`
```typescript
export function hasServingSystem(item: SuppliesItem): boolean {
  return item.stats?.servings !== undefined && item.stats.servings > 0
}

export function getServingCount(item: SuppliesItem): number {
  return item.stats?.servings || 0
}
```

**Estimated Time:** 1 hour

---

## Medium Priority Issues

### 13. Long Method: filterItems
**File:** suppliesStore.ts (Lines 2459-2506)
**Problem:** 48-line method with 9 sequential filters

**Solution:** Extract individual filter methods
**Estimated Time:** 1-2 hours

---

### 14. Repeated Map Access Patterns
**File:** habitatConditions.ts (Lines 410-594)
**Problem:** Repeated pattern of get → check → update

**Solution:** Create `src/utils/mapHelpers.ts`
```typescript
export function updateMapValue<K, V>(
  map: Map<K, V>,
  key: K,
  updater: (current: V | undefined) => V
): void {
  map.set(key, updater(map.get(key)))
}
```

**Estimated Time:** 1 hour

---

### 15. Condition Update Too Generic
**File:** habitatConditions.ts (Lines 312-331)
**Problem:** String matching for condition names (error-prone)

**Solution:** Use typed enum or const type
**Estimated Time:** 30 minutes

---

### 16. Snapshot History Management
**File:** habitatConditions.ts (Lines 295-310)
**Problem:** Manual array limit management

**Solution:** Create circular buffer utility
**Estimated Time:** 30 minutes

---

### 17. Mark/Unmark Logic Duplicated
**File:** inventoryStore.ts (Lines 296-339)
**Problem:** Three methods with nearly identical logic

**Solution:** Generic marker helper
**Estimated Time:** 1-2 hours
**Lines Saved:** ~30 lines

---

### 18. Alert System Not Implemented
**File:** habitatConditions.ts (Lines 88-93)
**Problem:** Alert state exists but no logic to populate it

**Solution:** Implement `checkAndUpdateAlerts()` method
**Estimated Time:** 2-3 hours

---

### 19. Consumption Rates Not Used
**File:** habitatConditions.ts (Lines 81-85)
**Problem:** State exists but never updated

**Solution:** Implement rate tracking or remove dead code
**Estimated Time:** 1-2 hours

---

### 20. Position Storage Needs Validation
**File:** habitatConditions.ts (Lines 98-99, 354-381)
**Problem:** No validation when setting positions

**Solution:** Create `src/utils/gridHelpers.ts` with validation
**Estimated Time:** 1 hour

---

### 21. Long Action: purchaseItem
**File:** suppliesStore.ts (Lines 2544-2595)
**Problem:** 52-line method mixing validation, currency, and inventory

**Solution:** Break into smaller actions
**Estimated Time:** 2-3 hours

---

### 22. Console Logging Inconsistent
**Files:** All stores
**Problem:** Mix of emoji prefixes, no log levels

**Solution:** Create `src/utils/logger.ts`
**Estimated Time:** 1-2 hours

---

### 23. Starter Habitat Init Too Specific
**File:** habitatConditions.ts (Lines 596-625)
**Problem:** Hardcoded positions

**Solution:** Load from `src/data/starter-habitat.json`
**Estimated Time:** 1 hour

---

### 24. Sell Back Logic Duplicated
**File:** inventoryStore.ts (Lines 221-290)
**Problem:** Similar to purchase logic

**Solution:** Extract common transaction pattern
**Estimated Time:** 2-3 hours

---

## Low Priority Issues

### 25. Performance: Multiple Filter Passes
**Solution:** Single-pass filter
**Estimated Time:** 1 hour

### 26. Missing Memoization
**Status:** Already handled by Pinia

### 27. Inventory Could Use Index
**Solution:** Add Map index for O(1) lookup
**Estimated Time:** 2-3 hours

### 28. Type Safety for Item Stats
**Solution:** Discriminated unions
**Estimated Time:** 8-12 hours (hard)

### 29. Bowl Contents Validation
**Solution:** Add food type compatibility check
**Estimated Time:** 1 hour

### 30. Dead Code: maxSlots
**Solution:** Remove or implement
**Estimated Time:** 15 minutes

---

## Implementation Plan

### Phase 1: Critical Fixes (High Impact, Low Risk)
**Estimated Time:** 4-6 hours
**Priority:** IMMEDIATE

1. ✅ Issue #11: Fix instance ID generation (5 min)
2. ✅ Issue #3: Create constants file (2-3 hours)
3. ✅ Issue #4: Add Map serialization validation (1 hour)
4. ✅ Issue #2: Generic filter getters (1-2 hours)

**Impact:** Prevents critical bugs, improves code quality immediately

---

### Phase 2: Major Refactors (High Impact, Medium Risk)
**Estimated Time:** 15-20 hours
**Priority:** HIGH

5. ✅ Issue #1: Extract items to JSON files (8-12 hours)
6. ✅ Issue #5: Deduplicate purchase logic (2-3 hours)
7. ✅ Issue #6: Generic instance counter (1-2 hours)
8. ✅ Issue #8: Extract bowl/hay rack composable (3-4 hours)

**Impact:** Massive maintainability improvement, -2,500 lines

---

### Phase 3: Polish & Utilities (Medium Impact)
**Estimated Time:** 15-20 hours
**Priority:** MEDIUM

9. ✅ Issue #7: Standardize error handling (3-4 hours)
10. ✅ Issue #10: Extract poop tracking (2-3 hours)
11. ✅ Issue #12: Serving system utility (1 hour)
12. ✅ Issues #13-24: Medium priority refactors (10-15 hours)

**Impact:** Better organization, easier testing

---

### Phase 4: Optimization (Low Impact)
**Estimated Time:** 10-15 hours
**Priority:** LOW

13. ✅ Issues #25-30: Performance and cleanup

**Impact:** Performance improvements, dead code removal

---

## Total Effort Estimate

- **Phase 1 (Critical):** 4-6 hours → **80% of bug prevention**
- **Phase 2 (Major Refactors):** 15-20 hours → **70% of maintainability improvement**
- **Phase 3 (Polish):** 15-20 hours → **Remaining quality improvements**
- **Phase 4 (Optimization):** 10-15 hours → **Performance tuning**

**Total:** 44-61 hours for complete cleanup

**Recommended:** Complete Phase 1 immediately, Phase 2 before Phase 4 development

---

## Files to Create

### Utilities
- `src/utils/catalogLoader.ts` - Load items from JSON
- `src/constants/supplies.ts` - All magic number constants
- `src/utils/mapSerialization.ts` - Safe Map helpers
- `src/utils/storeErrors.ts` - Consistent error handling
- `src/utils/servingSystem.ts` - Serving logic helpers
- `src/utils/mapHelpers.ts` - Map manipulation utilities
- `src/utils/gridHelpers.ts` - Grid validation
- `src/utils/logger.ts` - Consistent logging
- `src/utils/suppliesSorting.ts` - Sorting utilities
- `src/utils/circularBuffer.ts` - Limited array helper

### Composables
- `src/composables/useHabitatContainers.ts` - Bowl/hay rack logic
- `src/composables/usePoopTracking.ts` - Poop management

### Data Files
- `src/data/supplies/*.json` - All 13 item catalog files
- `src/data/starter-habitat.json` - Starter configuration

---

## Success Metrics

### Code Quality
- ✅ Reduce suppliesStore.ts from 2,662 → ~330 lines
- ✅ Eliminate all magic numbers
- ✅ Consistent error handling across all stores
- ✅ All utilities have unit tests

### Maintainability
- ✅ Item changes don't require touching store code
- ✅ No code duplication in critical paths
- ✅ Clear separation of concerns

### Type Safety
- ✅ No loose string matching for conditions
- ✅ UUID-based instance IDs prevent collisions
- ✅ Safe deserialization prevents store corruption

---

## Risk Assessment

### Low Risk (Can do anytime)
- Constants extraction
- Instance ID fix
- Map serialization
- Generic filters
- Logging utility

### Medium Risk (Needs testing)
- Extracting items to JSON
- Bowl/hay rack composable
- Poop tracking composable
- Purchase logic refactor

### High Risk (Major refactor)
- Type safety improvements (discriminated unions)
- Index-based inventory lookup
- Transaction pattern extraction

**Recommendation:** Start with Low Risk items in Phase 1 to build confidence
