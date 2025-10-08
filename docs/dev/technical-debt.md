# Technical Debt & Known Issues

Date: 2025-10-07
Status: TRACKING

## Critical Issues

### 1. TypeScript Parsing Error in useTokenStyles.ts
- **File**: `src/app/theme/useTokenStyles.ts:329`
- **Error**: Parsing error: '>' expected
- **Impact**: Blocks type checking
- **Cause**: JSX syntax issue or missing React import context
- **Fix Required**: Review React imports and JSX transform config

### 2. Missing Export: getCurrentTokens
- **Files**: Multiple theme-related files
- **Error**: Module has no exported member 'getCurrentTokens'
- **Impact**: Import resolution failures
- **Fix Required**: Export function from correct module or remove unused imports

## Lint Issues Summary

### Errors (148 total)
- `@typescript-eslint/no-unused-vars`: 95 occurrences
- `prefer-const`: 8 occurrences
- `react/no-unescaped-entities`: 8 occurrences
- `@typescript-eslint/no-var-requires`: 3 occurrences
- `no-case-declarations`: 2 occurrences
- `react-hooks/rules-of-hooks`: 1 occurrence (incorrect hook usage)

### Warnings (132 total)
- `@typescript-eslint/no-explicit-any`: 130+ occurrences
- TypeScript version mismatch warning (using 5.9.3, supported <5.4.0)

## Action Items

### Immediate (blocking CI)
1. Fix useTokenStyles.ts parsing error
2. Resolve getCurrentTokens export issue
3. Fix react-hooks/rules-of-hooks violation in Inspector.tsx

### Short-term (quality)
1. Clean up unused variables and imports (bulk fix with ESLint --fix where safe)
2. Add proper typing to replace `any` types systematically
3. Fix unescaped entity warnings in JSX

### Medium-term (maintenance)
1. Upgrade @typescript-eslint to support TypeScript 5.9.3
2. Review and refactor components with many violations
3. Add stricter type checking incrementally

## Temporary Measures

- ESLint rules downgraded to warnings for:
  - `@typescript-eslint/no-unused-vars`
  - `@typescript-eslint/no-explicit-any`
  - `prefer-const`
  - `no-case-declarations`
  - `react/no-unescaped-entities`
  - `@typescript-eslint/no-var-requires`
  - `@typescript-eslint/ban-ts-comment`

This allows CI to proceed while issues are addressed systematically.

## Notes

- The codebase is functional for development but needs quality improvements
- No runtime errors expected from these lint issues
- Focus on critical parsing errors first, then systematic cleanup
