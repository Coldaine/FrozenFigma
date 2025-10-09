# FrozenFigma Documentation Index

Welcome to the FrozenFigma documentation. This index provides quick access to all available documentation resources.

## Quick Start

To run FrozenFigma locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run validation gates (lint, types, tests, smoke)
npm run gate
```

## Documentation

### Core System Documentation

- **[Theme System](./theme-documentation.md)** — Comprehensive guide to design tokens, theme presets, customization, and validation
- **[Agent System](../src/agent/README.md)** — Overview of the agent loop, planner, patcher, validator, repairer, and reporter subsystems
- **[Skeleton Library](../src/agent/skeletons/README.md)** — Template library for common UI patterns (settings, tabs, modals, forms, etc.)
- **[State Management](../src/app/state/README.md)** — Zustand store architecture for graph, selection, and session state

### Planning & Architecture

- **[Technical Plan (PLANNING.md)](../PLANNING.md)** — Detailed technical architecture, requirements, and implementation roadmap
- **[Main README](../README.md)** — Project overview, vision, setup instructions, and feature summary

## What FrozenFigma Implements

### Agent Loop

The agent orchestrates the transformation from natural language to validated UI:

1. **Planner** — Parses user intent into a structured EditPlan of granular operations
2. **Skeletonizer** — Templates for common UIs that can be parameterized (settings, tabs, modals, etc.)
3. **Patcher/Executor** — Applies graph mutations and maintains pre/post-state checkpoints
4. **Validator** — Runs validation gates (lint → types → unit → smoke) and aggregates diagnostics
5. **Repairer** — Proposes deterministic fixes from diagnostics, with up to 3 retry attempts and rollback support
6. **Reporter** — Emits structured turn summaries (success/fail, changes, diffs, artifacts, timings)

### Graph Store

- **Schema** — Zod-validated component tree with props, layout, and theme tokens
- **State** — Zustand store managing graph, selection, session, and undo/redo
- **Persistence** — Load/save `ui.json`, checkpoints, and session logs

### Theme System

- **Design Tokens** — Colors, spacing, typography, radius, shadows, transitions
- **Presets** — Light, dark, high-contrast, and custom themes
- **Validation** — Type safety, format checking, accessibility compliance, and responsiveness

### IO & Export

- **Persistence** — JSON serialization for graphs and checkpoints
- **Export** — TSX component code generation and token export
- **Artifacts** — Screenshot capture, diff generation, and structured logs

### Validation & Repair Pipeline

- **Lint Gate** — ESLint + Prettier for style and syntax
- **Type Gate** — TypeScript compiler checks (`tsc --noEmit`)
- **Schema Gate** — Zod validation of graph structure
- **Unit Gate** — Vitest unit tests
- **Smoke Gate** — Headless render sanity checks
- **Auto-Repair** — Deterministic fixes with rollback on failure

### Testing & Gates

All validation gates must pass for a turn to succeed:

```bash
npm run gate  # Run all gates
npm run lint  # Style & syntax
npm run types # Type-safety
npm run test  # Unit tests
npm run smoke # Headless render
```

## Why This Architecture?

- **Transparency** — Every agent action is logged, diffed, and inspectable
- **Reliability** — Multi-gate validation with auto-repair and rollback ensures quality
- **Offline-First** — No external API calls by default; optional LLM integration via local providers
- **Incremental** — Atomic operations allow precise edits without full rebuilds
- **Visual Fidelity** — Design token system supports runtime theme switching and consistent styling

## Contributing

See the main [README](../README.md) for setup instructions. For detailed architecture and planning, refer to [PLANNING.md](../PLANNING.md).
