# Architecture & Technical Plan: Local Functional Mock-Up Builder

This document was moved from the repository root `PLANNING.md` and serves as the canonical architecture and technical plan for FrozenFigma.

---

## 1. Vision & Scope

**One-Sentence Goal:** A local, self-hosted environment that turns natural-language requests into **functional UI mock-ups** (clickable, stateful controls—no production backend), with guard-railed edit/apply cycles, tests/linters, auto-repair, and rollback.

### 1.1. Detailed Vision

The system is a local, self-hosted, "Figma Make"-equivalent environment that generates and renders functional mock-ups of application user interfaces from natural-language instructions.

A **functional mock-up** means:
- Components are interactive (buttons, sliders, tabs, modals, etc. respond visually and statefully).
- No production backend or real data logic is required.
- Behavior simulates plausible UI interactivity within the mock-up runtime.

The primary goal is to replicate the text-to-UI experience locally, with full control, no subscription, and complete agent transparency.

---

## 2. System Overview & Core Requirements

### 2.1. System Layers

| Layer | Role | Key Technology |
| :--- | :--- | :--- |
| **Agent Loop** | Parses user intent → generates structured UI edit plan → applies changes → validates → renders → reports | Local LLM or deterministic rule engine |
| **Renderer** | Visualizes the UI graph and enables interaction | React + Vite (web) or React + Tauri (desktop shell) |
| **Graph Model** | Stores canonical component tree + props + layout | JSON / Zod-typed schema |
| **Persistence Layer** | Saves and loads `ui.json`, checkpoints, session logs | Local FS |
| **Toolchain / Gate Runner** | Executes lint, type, build, and smoke tests; performs rollback or auto-repair | Node scripts + Vitest + ESLint + Prettier + tsc |
| **Design System Layer** | Defines tokens, glassmorphism theme, and component skeletons | Tailwind + CSS vars |
| **Interaction Surface** | Command box, palette, Inspector, Library, Console | React UI components |

### 2.2. Core Functional Requirements

- **Prompt–Turn Cycle**: Accept natural-language requests, generate a structured edit plan, apply edits atomically, re-render immediately, and summarize actions.
- **UI Generation**: Support a full range of standard UI elements, populated with plausible defaults. All controls must be visually interactive.
- **Incremental Editing**: Address nodes by name or ID and modify properties without rebuilding unrelated components. Provide undo/rollback and diff inspection.
- **Visual Fidelity**: Respect design tokens (color, radius, spacing, typography) with runtime theme switching (light/dark).
- **Persistence & Export**: Serialize the mock-up to `ui.json` and export generated components as React TSX files.
- **Artifacts & Logging**: Capture a screenshot, diff, and change summary for each turn.

---

## 3. Architecture

### 3.1. Agent Architecture

The agent orchestrates the transformation from natural language to a validated UI state.

- **Planner**: Parses the NL prompt into a normalized intent, then creates an **EditPlan** (a list of granular operations).
- **Skeletonizer**: A library of templates for common UIs (e.g., SettingsPanel, Tabs, Modal, CardGrid, Form) that can be parameterized.
- **Patcher/Executor**: Applies graph-level mutations and, where needed, AST/file patches for exported components. Maintains pre- and post-state checkpoints.
- **Validator**: Runs the validation "gate" (`lint → types → unit → smoke`) and aggregates diagnostics.
- **Repairer**: Consumes diagnostics from the Validator and proposes deterministic fixes, re-running the gate up to N=3 times. If it still fails, it triggers a rollback.
- **Reporter**: Emits a structured turn summary (success/fail, changes, diffs, artifacts, timings).

### 3.2. Data Model & Schema

The system's state is defined by a set of versioned, runtime-validated schemas.

- **Graph**: The canonical source of truth, containing nodes (components), props, layout constraints, and links. The root is `{ nodes: ComponentSpec[]; connections?: Link[]; theme: Tokens }`.
- **Tokens**: Defines the color palette, radius, spacing, and typography. These are runtime-swappable (e.g., for light/dark themes).
- **IDs & Addressability**: All components have stable, unique IDs. A name registry allows for human-readable addressing (e.g., "Settings.sidebar").
- **Schema Validation**: All data structures are validated by Zod before being applied.

#### Zod Sketch: `ComponentSpec`

```ts
import { z } from "zod";

import { z } from "zod";

export const ComponentSpecSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "button", "slider", "toggle", "tabs", "modal", "tray", "card",
    "card-grid", "form", "input", "select", "textarea", "progress",
    "tooltip", "popover", "drawer", "dialog"
  ]),
  props: z.record(z.any()),
  frame: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    region: z.string(), // e.g., 'sidebar', 'main', 'header'
  }),
});
```

### 3.3. UI Structure

The main application window is composed of several key panels.

```
┌─────────────────────────────────────────────┐
│ Command Bar  — prompt input + Run button    │
├──────────────┬──────────────┬───────────────┤
│ Library      │   Canvas     │   Inspector   │
```