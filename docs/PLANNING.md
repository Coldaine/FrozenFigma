# Technical Plan: Local Functional Mock-Up Builder

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
│ (component   │ (renders     │ (selected     │
│ templates)   │ graph)       │ node props)   │
├──────────────┴──────────────┬───────────────┤
│ Console / Log Panel (turn summaries)        │
└─────────────────────────────────────────────┘
```

- **Library**: Draggable templates and common component skeletons.
- **Canvas**: The main interactive render area for the UI mock-up.
- **Inspector**: An editable property panel (form or raw JSON) for the selected component.
- **Console**: Displays per-turn logs, validation gate reports, and agent status.
- **Command Bar**: The primary input for natural language prompts.

---

## 4. Technical Implementation

### 4.1. Technology Stack

| Layer | Primary | Rationale | Alternatives |
| :--- | :--- | :--- | :--- |
| **UI / Renderer** | **TypeScript + React 18** | Huge ecosystem, HMR speed, Testing Library support | Svelte, Solid, Vue |
| **Desktop shell** | **Tauri (Rust)** (Phase 2) | Lightweight, Wayland-friendly, Rust for future native ops | Electron (Node) |
| **Styling** | **Tailwind + CSS Vars** | Fast utility dev; tokens as CSS vars; easy theming | Vanilla CSS-in-TS, SCSS |
| **State** | **Zustand** | Minimal boilerplate, simple selectors | Redux Toolkit, Jotai |
| **Schema** | **Zod** | Runtime validation + TS inference | JSON Schema + ajv |
| **Tests** | **Vitest + Testing Library** | Speed + DOM testing ergonomics | Jest + RTL |
| **Lint/Format** | **ESLint + Prettier** | Standard DX | Biome |
| **Build** | **Vite** | Fast dev server and build | Turbopack (later) |

### 4.2. Folder Layout

```
src/
  agent/
    planner/           # NL → Intent → EditPlan
    skeletons/         # settings, tabs, modal, tray, lens, card-grid, form
    patcher/           # graph mutations + AST patches (exported code)
    repair/            # diagnostics → fix proposals (deterministic)
    validator/         # gate orchestration + result aggregation
    reporter/          # turn summaries, artifact links
  app/
    view/              # Canvas, Inspector, Library, Console, CommandBar
    state/             # zustand store (graph, selection, session)
    theme/             # CSS var application; light/dark
  schema/              # zod: Graph, Node, ComponentSpec, Tokens, Command
  io/
    persistence/       # ui.json load/save; checkpoints
    artifacts/         # screenshots, logs, diffs
    export/            # TSX component/code emitters, tokens
  tests/
    smoke.test.tsx     # headless sanity
    components/*.test.tsx
```

---

## 5. Tooling, Gates, and Reliability

### 5.1. Validation Gates

A turn is successful **only if all gates pass**. The gate runner ensures quality and stability.

| Gate | Purpose | Default Implementation |
| :--- | :--- | :--- |
| **Lint** | Style & syntax correctness | ESLint + Prettier |
| **Types** | Type-safety & interface validation | `tsc --noEmit` |
| **Schema** | Validate UI graph structure | Zod schema parsing |
| **Test** | Unit test correctness | `vitest run` |
| **Smoke** | Headless render sanity | Vitest + Testing-Library (`render(<App />)` + assert `[data-testid="canvas"]`) |

### 5.2. Reliability & Recovery

- **Atomic Turn Guarantee**: No partial edits are ever applied. On failure, the system rolls back completely.
- **Checkpoints**: Before applying edits, a snapshot of `ui.json` and any touched files is taken.
- **Repair Attempts**: The agent will attempt up to 3 deterministic repairs. If none succeed, it triggers a rollback.
- **Artifact Retention**: The last 5 checkpoints are kept by default (configurable).

---

## 6. Non-Functional Requirements

### 6.1. Performance
- **Target latency per turn**: ≤ 2 seconds.
- **Cold boot**: ≤ 5 seconds.
- **Incremental build**: ≤ 1 second with Vite HMR.

### 6.2. Security & Privacy
- **Default offline operation**: No external API calls unless explicitly enabled by the user.
- **Optional LLM**: Integration is possible via local providers like Ollama or LM Studio.
- **Secrets**: Stored in `.env.local` and ignored by version control.

### 6.3. Extensibility
- **Skeleton Providers**: Register new component generators.
- **Theme Packs**: Drop-in new CSS/Tailwind token sets.
- **Toolchain Plugins**: Swap lint/test tools freely.
- **Export Adapters**: Generate code for multiple frameworks (Vue, Svelte) from one graph.

---

## 7. Project Operations

### 7.1. Developer Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "types": "tsc --noEmit",
    "test": "vitest run",
    "smoke": "vitest run tests/smoke.test.tsx",
    "gate": "npm run lint && npm run types && npm run test && npm run smoke"
  }
}
```

### 7.2. Acceptance Criteria (MVP)

| ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **AC-1** | Add a "Settings menu with 6 sliders and 4 toggles" | Settings panel appears; sliders move; toggles flip; plausible labels are generated. |
| **AC-2** | "Create tabs: General, Display, Network" | Tabs render correctly; clicking a tab switches the active state. |
| **AC-3** | "Open a confirmation modal titled 'Danger'" | A modal appears over the canvas; the close button works; the validation gate passes. |
| **AC-4** | "Increase sidebar padding by 8px" | Padding visually increases; the diff log shows the specific style change. |
| **AC-5** | Save & Load Project | The layout, component state, and theme restore identically. |
| **AC-6** | Gate & Repair Loop | Introduce a type error; the agent should attempt a fix or roll back cleanly. |

### 7.3. Future Enhancements

- Visual regression testing (screenshot diffs).
- A `Guidelines.md` file to bias the agent's naming and style conventions.
- Design import from external sources (e.g., Figma, Penpot).
- Multi-framework export adapters.
- Collaborative session mode.

### 7.4. Definition of Success

1. A user can describe, build, and interact with a complex UI locally without needing an external design tool.
2. Each prompt produces a working visual update that passes all validation gates.
3. The agent **never** leaves the system in a broken or partially-applied state.
4. The entire pipeline is self-contained, reproducible, and extensible.

---