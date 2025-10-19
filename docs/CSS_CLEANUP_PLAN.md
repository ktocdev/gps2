# CSS & Component Cleanup Plan - Phase 5

**Status:** Planning
**Estimated Time:** 12-18 hours
**Goal:** Ensure all components follow GPS2 CSS standards (BEM, logical properties, mobile-first, container queries)

---

## Task 31: CSS Guidelines Compliance Audit (3-4 hours) ✅ COMPLETE

**Objective:** Review all components and document violations of CSS standards

### Audit Checklist
- [x] BEM methodology compliance (`.block__element--modifier`) ✅ Excellent
- [x] Logical properties usage (no `left/right/top/bottom`, `width/height`) ⚠️ 31 files need fixes
- [x] Mobile-first approach (using `min-width` media queries) ⚠️ 8 files use max-width
- [x] No scoped styles (all global) ✅ Perfect
- [x] No semantic HTML for text styling (`<strong>`, `<b>`, `<i>`, `<em>`, `<small>`) ✅ Perfect
- [x] CSS variables from `src/styles/variables.css` ✅ Excellent

### Components Audited
- [x] 47 components across all categories
- [x] 10 views
- [x] All basic, game, layout, and debug components

### Deliverable
- ✅ **CSS_VIOLATIONS_AUDIT.md** created with:
  - Detailed violation inventory (31 files physical props, 27 files border-radius, 8 files media queries)
  - Specific line numbers and examples
  - Priority recommendations
  - Component compliance matrix (85% overall compliance)
  - Automated fix opportunities
  - 4-6 hour fix time estimate

---

## Task 32: Extract Common Patterns (2-3 hours)

**Objective:** Create reusable CSS utilities for repeated patterns

### Patterns to Extract
- [ ] Button styles (primary, secondary, danger, text-only)
- [ ] Card/panel containers
- [ ] Text utilities (labels, headings, muted, accent, small)
- [ ] Spacing utilities (if applicable)
- [ ] Layout patterns (flex, grid)

### Files to Create/Update
- `src/styles/utilities.css` (new)
- Update components to use new utilities

### Deliverable
- Centralized utility classes reducing duplicate CSS

---

## Task 33: Container Query Migration (2-3 hours)

**Objective:** Replace component media queries with container queries where appropriate

### Strategy
1. Identify components that should respond to their container, not viewport
2. Add container-type to parent elements
3. Convert `@media` to `@container`
4. Test responsive behavior

### Candidate Components
- [ ] GuineaPigDisplay.vue
- [ ] WellnessPanel.vue
- [ ] SuppliesView.vue
- [ ] InventoryView.vue
- [ ] ActivityFeed.vue

### Deliverable
- Components responsive to container size, not just viewport

---

## Task 34: Component Reorganization (1-2 hours)

**Objective:** Organize components by function per GPS2 guidelines

### Current Structure
```
src/components/
├── ActivityFeed.vue
├── BasicButton.vue
├── BasicCounter.vue
├── DebugPanel.vue
├── GuineaPigDisplay.vue
├── HabitatView.vue
├── InventoryView.vue
├── NavigationBar.vue
├── SuppliesView.vue
├── TabBar.vue
└── WellnessPanel.vue
```

### Target Structure
```
src/components/
├── basic/
│   ├── BasicButton.vue
│   └── BasicCounter.vue
├── game/
│   ├── ActivityFeed.vue
│   ├── GuineaPigDisplay.vue
│   ├── HabitatView.vue
│   ├── InventoryView.vue
│   ├── SuppliesView.vue
│   └── WellnessPanel.vue
├── layout/
│   ├── NavigationBar.vue
│   └── TabBar.vue
└── debug/
    └── DebugPanel.vue
```

### Steps
1. Create folder structure
2. Move component files with `git mv`
3. Update all imports across codebase
4. Run build to verify

### Deliverable
- Organized component structure with updated imports

---

## Task 35: CSS Variable Consistency (2-3 hours)

**Objective:** Ensure all components use CSS variables consistently

### Audit Points
- [ ] All colors from variables (no hardcoded hex/rgb)
- [ ] Spacing values from variables
- [ ] Typography from variables
- [ ] Border radius from variables
- [ ] Consistent naming conventions

### Files to Review
- `src/styles/variables.css`
- All component styles

### Deliverable
- Consistent theming through CSS variables

---

## Task 36: Accessibility Audit (2-3 hours)

**Objective:** Review and fix accessibility issues per WCAG standards

### Audit Checklist
- [ ] ARIA labels on interactive elements
- [ ] Semantic HTML structure
- [ ] Keyboard navigation support (tab order, focus states)
- [ ] Color contrast ratios (4.5:1 for text)
- [ ] Alt text for images
- [ ] Form labels and error messages
- [ ] Focus indicators visible

### Components Priority
1. NavigationBar.vue / TabBar.vue (navigation)
2. BasicButton.vue (interactive)
3. SuppliesView.vue / InventoryView.vue (complex interactions)
4. GuineaPigDisplay.vue (visual content)

### Deliverable
- Accessibility-compliant components with proper ARIA and keyboard support

---

## Execution Strategy

### Approach
1. **Task 31 first** - Audit everything to understand scope
2. **Tasks 32-33** - Make structural CSS improvements
3. **Task 34** - Reorganize files (one-time disruption)
4. **Tasks 35-36** - Polish and compliance

### Build Verification
- Run `npm run build` after each task
- Verify no regressions in functionality
- Test responsive behavior

### Risk Mitigation
- Work on feature branch
- Commit after each task completion
- Keep changes focused and reversible

---

## Success Criteria

- ✅ Zero CSS guideline violations
- ✅ All components use BEM methodology
- ✅ All components use logical properties
- ✅ Container queries implemented where appropriate
- ✅ Components organized by function
- ✅ Consistent CSS variable usage
- ✅ WCAG AA compliance for accessibility
- ✅ All builds passing
- ✅ No functionality regressions
