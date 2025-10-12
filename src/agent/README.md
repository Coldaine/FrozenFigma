# Agent Subsystem

The agent subsystem orchestrates the transformation from natural language user intents into validated UI changes. It coordinates multiple specialized modules to parse, apply, validate, repair, and report on graph mutations.

## Architecture Overview

The agent follows a structured pipeline:

```
User Intent → Planner → Patcher → Validator → Repairer (if needed) → Reporter → Result
```

Each turn executes this pipeline atomically, maintaining pre- and post-state checkpoints for rollback if needed.

## Core Modules

### Planner (`planner/`)

**Purpose:** Parse natural language prompts into structured, executable operations.

**Key Responsibilities:**

- Parse user intent into normalized commands
- Generate an `EditPlan` — a list of granular graph operations
- Map high-level requests (e.g., "add a settings panel") to specific skeleton templates
- Resolve component references by ID or human-readable name

**Key Types:**

```typescript
interface EditPlan {
  operations: Operation[];
  description: string;
}

interface Operation {
  type: 'add' | 'update' | 'remove' | 'move';
  target?: string; // Component ID or name
  params?: Record<string, any>;
}
```

### Skeletonizer (`skeletons/`)

**Purpose:** Provide pre-built templates for common UI patterns.

**Available Templates:**

- Settings Panel
- Tabs
- Modal
- Tray
- Card Grid
- Form
- Lens
- Navigation
- Data Display
- Input Patterns
- Feedback Patterns
- Layout Patterns

Each skeleton is parameterizable (labels, counts, positions, feature flags) and generates a subtree of `ComponentSpec` nodes ready to be inserted into the graph.

**Documentation:** See [skeletons/README.md](./skeletons/README.md)

### Patcher/Executor (`patcher/`)

**Purpose:** Apply graph-level mutations and maintain state checkpoints.

**Key Responsibilities:**

- Execute operations from the EditPlan against the current graph
- Perform atomic add/update/remove/move operations on nodes
- Validate operation preconditions (e.g., target exists for update)
- Maintain pre-state checkpoint for rollback
- Return a `PatchResult` with success status, updated graph, or errors

**Key Types:**

```typescript
interface PatchResult {
  success: boolean;
  graph: Graph;
  errors: string[];
  changes: {
    added: number;
    updated: number;
    removed: number;
    moved: number;
  };
}
```

### Validator (`validator/`)

**Purpose:** Run the validation "gate" and aggregate diagnostics.

**Validation Gates (executed sequentially):**

1. **Lint** — ESLint + Prettier for style and syntax
2. **Types** — TypeScript compiler checks (`tsc --noEmit`)
3. **Schema** — Zod validation of graph structure
4. **Unit** — Vitest unit tests
5. **Smoke** — Headless render sanity checks

**Key Types:**

```typescript
interface ValidationGateResult {
  passed: boolean;
  diagnostics: Diagnostic[];
  summary: {
    lintPassed: boolean;
    typesPassed: boolean;
    schemaPassed: boolean;
    testsPassed: boolean;
    smokePassed: boolean;
  };
}

interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: 'lint' | 'types' | 'schema' | 'unit' | 'smoke';
  file?: string;
  line?: number;
}
```

A turn is considered successful **only if all gates pass**.

### Repairer (`repair/`)

**Purpose:** Consume diagnostics and propose deterministic fixes.

**Key Responsibilities:**

- Analyze validation diagnostics
- Generate fix proposals (e.g., fix import paths, add missing props, correct types)
- Apply fixes and re-run validation (up to `maxRepairAttempts`, default 3)
- Trigger rollback if all repair attempts fail and `enableRollback` is true
- Track repair metrics (attempts, successes, failures, rollbacks)

**Key Types:**

```typescript
interface RepairResult {
  success: boolean;
  graph: Graph;
  appliedFixes: string[];
  remainingIssues?: string[];
}

interface RepairConfig {
  maxRepairAttempts: number; // Default: 3
  maxRollbackDepth: number; // Default: 3
  enableRollback: boolean; // Default: true
  timeout: number; // Default: 10000ms
  retryDelay: number; // Default: 100ms
  verbose: boolean; // Default: false
}
```

**Deterministic Repair Strategy:**
The repairer does **not** use an LLM. It applies rule-based transformations:

- Add missing imports
- Fix malformed syntax patterns
- Correct schema violations
- Adjust props to match expected types

### Reporter (`reporter/`)

**Purpose:** Emit structured turn summaries and artifacts.

**Key Responsibilities:**

- Summarize changes (added, updated, removed, moved)
- Generate diff between pre- and post-state
- Capture artifacts (screenshots, logs, structured JSON)
- Report timings for each pipeline stage
- Include repair metrics if auto-repair was used

**Key Types:**

```typescript
interface TurnSummary {
  success: boolean;
  commandsProcessed: number;
  changes: {
    added: number;
    updated: number;
    removed: number;
    moved: number;
  };
  description: string;
  repairMetrics?: {
    repairAttempts: number;
    successfulRepairs: number;
    failedRepairs: number;
    rollbackCount: number;
  };
}
```

## Agent Orchestrator

The `AgentOrchestrator` class (in `index.ts`) coordinates all modules:

```typescript
interface AgentConfig {
  verbose?: boolean;
  enableAutoRepair?: boolean;
  maxRepairAttempts?: number;
  enableRollback?: boolean;
  maxRollbackDepth?: number;
  repairTimeout?: number;
  retryDelay?: number;
}

interface AgentResult {
  success: boolean;
  graph: Graph;
  summary: TurnSummary;
  diagnostics?: Diagnostic[];
  validation?: ValidationGateResult;
}
```

**Usage:**

```typescript
const agent = new AgentOrchestrator({
  verbose: true,
  enableAutoRepair: true,
  maxRepairAttempts: 3,
});

const result = await agent.executeTurn('Add a settings panel', currentGraph);
if (result.success) {
  // Apply result.graph
} else {
  // Handle failure, inspect diagnostics
}
```

## Key Data Shapes

### Graph

The canonical UI state:

```typescript
interface Graph {
  nodes: ComponentSpec[];
  connections?: Link[];
  theme: Tokens;
}
```

### ComponentSpec

A single UI component:

```typescript
interface ComponentSpec {
  id: string; // UUID
  type: string; // 'button', 'slider', 'tabs', etc.
  props: Record<string, any>;
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
    region: string; // 'sidebar', 'main', 'header', etc.
  };
}
```

### EditPlan & Command

The planner's output:

```typescript
interface EditPlan {
  operations: Operation[];
  description: string;
}

interface Command {
  type: 'add' | 'update' | 'remove' | 'move';
  target?: string;
  params?: Record<string, any>;
}
```

## Design Rationale

### Why Separate Modules?

- **Modularity** — Each subsystem has a clear, testable contract
- **Replaceability** — Swap planner implementations (e.g., rule-based → LLM-based) without touching patcher or validator
- **Debuggability** — Intermediate outputs (EditPlan, PatchResult, ValidationGateResult) are inspectable at each stage

### Why Multi-Gate Validation?

- **Quality Assurance** — Catching errors early prevents invalid state from propagating
- **Fail-Fast** — If lint fails, don't bother running type-check or tests
- **Comprehensive Coverage** — Lint ensures style, types ensure correctness, schema ensures structure, tests ensure behavior, smoke ensures render-ability

### Why Auto-Repair?

- **Resilience** — Minor issues (missing imports, typos) shouldn't block the user
- **Transparency** — Applied fixes are logged and inspectable
- **Deterministic** — Rule-based repairs are predictable and auditable (no black-box LLM fixes)

### Why Rollback?

- **Safety** — If all repairs fail, revert to last known-good state
- **No Partial State** — Users never see a half-broken graph
- **Undo-Friendly** — Rollback aligns with undo/redo semantics in the UI

## Testing

Each module has its own test suite:

```bash
npm run test              # Run all unit tests
npm run test planner      # Test planner only
npm run test patcher      # Test patcher only
npm run test validator    # Test validator only
npm run test repair       # Test repair only
```

Integration tests for the full agent pipeline are in `tests/agent.test.ts`.

## Future Enhancements

- **LLM-Assisted Planner** — Optional local LLM for more flexible intent parsing
- **Incremental Validation** — Only re-validate changed nodes, not the entire graph
- **Parallel Gate Execution** — Run lint + types + schema in parallel for faster feedback
- **Fine-Grained Repair** — More sophisticated fix strategies (e.g., suggest alternative component types)

## Related Documentation

- **[Main Docs Index](../../docs/README.md)** — Full documentation index
- **[Skeleton Library](./skeletons/README.md)** — Available UI templates
- **[PLANNING.md](../../PLANNING.md)** — Detailed architecture and requirements
