# Code Bloat & Refactoring Analysis Guide

## 🎯 Purpose
This guide helps systematically review the FrozenFigma codebase for code bloat, duplication, and refactoring opportunities.

---

## 📊 Codebase Overview

### Size Metrics
- **Total TS/TSX files**: ~132 files
- **Total lines of code**: ~29,043 lines
- **Largest files** (potential refactoring targets):
  1. `src/agent/skeletons/index.ts` - **2,756 lines** ⚠️
  2. `src/app/theme/themeUtils.ts` - **1,300 lines** ⚠️
  3. `src/app/themeUtils.ts` - **1,300 lines** ⚠️ (DUPLICATE PATH!)
  4. `src/agent/repair/index.ts` - **1,101 lines**
  5. `src/schema/index.ts` - **953 lines**
  6. `src/io/export/index.ts` - **943 lines**
  7. `src/agent/tokenModifier.ts` - **855 lines**
  8. `src/agent/skeletons/tokenAwareSkeleton.ts` - **848 lines**

---

## 🔍 Analysis Checklist

### Phase 1: File Duplication & Organization

#### ❗ Critical Issue Detected
```
src/app/themeUtils.ts (1,300 lines)
src/app/theme/themeUtils.ts (1,300 lines)
```

**Questions to Answer:**
- [ ] Are these files identical or variations?
- [ ] Why do they exist in two locations?
- [ ] Which one is the source of truth?
- [ ] Can we consolidate or clearly differentiate them?

**Investigation Commands:**
```bash
# Compare the two themeUtils files
diff src/app/themeUtils.ts src/app/theme/themeUtils.ts

# Find which files import from each
grep -r "from.*themeUtils" src/

# Check git history to understand why duplication exists
git log --oneline --follow -- src/app/themeUtils.ts
git log --oneline --follow -- src/app/theme/themeUtils.ts
```

### Phase 2: Large File Analysis

For each large file (>500 lines), evaluate:

#### `src/agent/skeletons/index.ts` (2,756 lines)
**Red Flags:**
- Almost 3x larger than any other file
- Likely contains multiple responsibilities

**Questions:**
- [ ] How many skeleton generators does it contain?
- [ ] Are there repeated patterns that could be abstracted?
- [ ] Can it be split into separate files per skeleton type?
- [ ] Is there a factory pattern hiding in there?

**Investigation:**
```bash
# Count exported functions/constants
grep -c "^export " src/agent/skeletons/index.ts

# Find function definitions
grep "^export function\|^function\|^const.*= " src/agent/skeletons/index.ts | wc -l

# Look for repeated patterns
grep -o "skeleton.*{" src/agent/skeletons/index.ts | sort | uniq -c
```

#### `src/app/theme/themeUtils.ts` (1,300 lines)
**Red Flags from grep:**
- Multiple `validateSemantic*Tokens` functions (colors, spacing, typography, radius, shadow, transition)
- Multiple `create*ThemeTokens` functions (default, dark, high-contrast)
- Repetitive validation patterns

**Questions:**
- [ ] Can validation functions share a common abstraction?
- [ ] Are theme creation functions using a template pattern?
- [ ] Could token validation be schema-driven instead of function-driven?

**Refactoring Opportunities:**
1. **Extract validation framework**:
   ```typescript
   // Instead of 6 separate validateSemantic*Tokens functions
   // Create a generic validator with schemas
   const tokenSchemas = {
     colors: colorTokenSchema,
     spacing: spacingTokenSchema,
     // etc.
   };
   ```

2. **Theme factory pattern**:
   ```typescript
   // Instead of createDefaultTokens, createDarkThemeTokens, createHighContrastTokens
   // Use a theme configuration approach
   const themes = {
     default: defaultThemeConfig,
     dark: darkThemeConfig,
     highContrast: highContrastThemeConfig
   };
   ```

#### `src/io/export/index.ts` (943 lines)
**Questions:**
- [ ] How many export formats does it support?
- [ ] Is there duplication between export strategies?
- [ ] Can we use a strategy pattern for different formats?

**Investigation:**
```bash
# Find export-related functions
grep "export function.*export" src/io/export/index.ts -i

# Look for format-specific code
grep -E "(TSX|JSX|Vue|Svelte)" src/io/export/index.ts
```

#### `src/agent/repair/index.ts` (1,101 lines)
**Questions:**
- [ ] How many repair strategies exist?
- [ ] Is there a common repair pattern?
- [ ] Can repairs be plugin-based?

---

### Phase 3: Code Duplication Patterns

#### Repetitive Code Patterns to Find:

1. **Repeated validation logic:**
```bash
grep -r "if (!.*|| typeof.*!== 'object')" src/ | wc -l
grep -r "return { success: false, errors:" src/ | wc -l
```

2. **Similar function signatures:**
```bash
# Find all validation functions
grep -r "validate.*:.*{ success: boolean" src/
```

3. **Repeated type guards:**
```bash
grep -r "function is.*value is" src/
```

4. **Copy-paste component patterns:**
```bash
# Find similar component structures
find src/app/view/components -name "*.tsx" -exec wc -l {} \; | sort -n
```

---

### Phase 4: Architectural Concerns

#### Module Cohesion Analysis

**Questions for each major module:**

**Agent Module** (`src/agent/`):
- [ ] Is the separation between skeletons/repair/planner/validator clear?
- [ ] Are there circular dependencies?
- [ ] Should validators be plugins?

```bash
# Check imports between agent submodules
grep -r "from.*agent" src/agent/ | grep -v node_modules
```

**Theme Module** (`src/app/theme/`):
- [ ] Too many files doing similar things?
- [ ] Is token conversion/validation/management properly separated?
- [ ] Are there clear interfaces between subsystems?

```bash
# Count theme-related files
ls src/app/theme/*.ts | wc -l

# Find interconnections
grep -r "from.*theme" src/app/theme/
```

**IO Module** (`src/io/`):
- [ ] Are export/import/persistence clearly separated?
- [ ] Too much responsibility in export/index.ts?
- [ ] Can we extract export strategies?

---

### Phase 5: Specific Refactoring Opportunities

#### 🎯 High-Impact Refactorings (Ranked)

##### 1. **CRITICAL: Resolve themeUtils duplication**
- **Impact**: High (1,300 lines x2 = 2,600 lines of potential waste)
- **Effort**: Medium
- **Files**: `src/app/themeUtils.ts` + `src/app/theme/themeUtils.ts`

##### 2. **Split agent/skeletons/index.ts**
- **Impact**: Very High (2,756 lines → multiple focused files)
- **Effort**: High
- **Strategy**: 
  - One file per skeleton type
  - Shared utilities in `skeletons/shared/`
  - Index file as re-export hub

##### 3. **Extract validation framework from themeUtils**
- **Impact**: High (reduce ~400 lines of repetitive validation)
- **Effort**: Medium
- **Pattern**: Schema-driven validation instead of function-per-type

##### 4. **Refactor export/index.ts into strategy pattern**
- **Impact**: Medium-High (943 lines → format-specific strategies)
- **Effort**: Medium
- **Structure**:
  ```
  src/io/export/
    ├── index.ts (orchestrator)
    ├── strategies/
    │   ├── tsx.ts
    │   ├── jsx.ts
    │   ├── vue.ts
    │   └── svelte.ts
    └── shared/
        └── utils.ts
  ```

##### 5. **Schema-driven component specs**
- **Impact**: Medium (reduce boilerplate in schema/index.ts)
- **Effort**: Medium
- **Approach**: Generate component schemas from config

---

## 🔬 Deep-Dive Analysis Scripts

### Find All Duplicate Functions
```bash
# Extract all function names
find src -name "*.ts" -o -name "*.tsx" | \
  xargs grep -h "^export function\|^function" | \
  sed 's/(.*//' | sort | uniq -d
```

### Measure Code Complexity
```bash
# Install complexity tools if needed
npx complexity-report src/agent/skeletons/index.ts
```

### Find Long Functions
```bash
# Functions longer than 50 lines
find src -name "*.ts" -exec grep -A 50 "^function\|^export function" {} \; | \
  grep -B 50 "^}" | wc -l
```

### Identify God Objects
```bash
# Files with too many exports
for file in $(find src -name "*.ts" -o -name "*.tsx"); do
  count=$(grep -c "^export " "$file")
  if [ $count -gt 20 ]; then
    echo "$count exports in $file"
  fi
done
```

---

## 💡 Refactoring Strategies by Pattern

### Pattern 1: Large Validation Functions
**Before:**
```typescript
function validateSemanticColorTokens(colors: unknown) { ... }
function validateSemanticSpacingTokens(spacing: unknown) { ... }
function validateSemanticTypographyTokens(typography: unknown) { ... }
```

**After:**
```typescript
const tokenValidators = {
  colors: createValidator(colorSchema),
  spacing: createValidator(spacingSchema),
  typography: createValidator(typographySchema)
};
```

### Pattern 2: Theme Creation Functions
**Before:**
```typescript
function createDefaultTokens() { return { colors: {...}, spacing: {...} }; }
function createDarkThemeTokens() { return { colors: {...}, spacing: {...} }; }
```

**After:**
```typescript
const themeDefinitions = {
  default: { colors: {...}, spacing: {...} },
  dark: { colors: {...}, spacing: {...} }
};
const createTheme = (name: keyof typeof themeDefinitions) => themeDefinitions[name];
```

### Pattern 3: Skeleton Generators
**Before:**
```typescript
// All 2,756 lines in one file
export function createButtonSkeleton() { ... }
export function createFormSkeleton() { ... }
// ... 50+ more functions
```

**After:**
```typescript
// src/agent/skeletons/index.ts
export * from './button';
export * from './form';
// ... etc

// src/agent/skeletons/button.ts
export function createButtonSkeleton() { ... }
```

---

## ✅ Refactoring Checklist Template

For each refactoring:

- [ ] **Identify**: What code is duplicated/bloated?
- [ ] **Measure**: How many lines can be saved?
- [ ] **Design**: What pattern solves it?
- [ ] **Validate**: Do tests still pass?
- [ ] **Document**: Update docs and comments
- [ ] **Review**: Does it improve readability?

---

## 🚀 Recommended Next Steps

1. **Immediate (This Week)**:
   - [ ] Investigate and resolve `themeUtils.ts` duplication
   - [ ] Document why it exists or consolidate

2. **Short-term (This Sprint)**:
   - [ ] Split `agent/skeletons/index.ts` into per-component files
   - [ ] Extract shared validation framework from `themeUtils.ts`

3. **Medium-term (Next Sprint)**:
   - [ ] Refactor `export/index.ts` with strategy pattern
   - [ ] Review and simplify `repair/index.ts`

4. **Long-term (Next Quarter)**:
   - [ ] Implement plugin architecture for validators
   - [ ] Schema-driven component generation
   - [ ] Automated complexity monitoring in CI

---

## 📝 Notes

- All refactorings should maintain current test coverage
- Run full gate suite after each refactoring: `npm run lint && npm run types && npm test`
- Consider creating feature flags for major architectural changes
- Document architectural decisions in ADR format

---

**Generated**: November 11, 2025
**Status**: Ready for Review
**Next Review**: After completing immediate tasks
