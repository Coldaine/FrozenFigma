# FrozenFigma - Local Functional Mock-Up Builder

A local, self-hosted environment that turns natural-language requests into **functional UI mock-ups** (clickable, stateful controls—no production backend), with guard-railed edit/apply cycles, tests/linters, auto-repair, and rollback.

## Vision

The system is a local, self-hosted, "Figma Make"-equivalent environment that generates and renders functional mock-ups of application user interfaces from natural-language instructions.

A **functional mock-up** means:
- Components are interactive (buttons, sliders, tabs, modals, etc. respond visually and statefully).
- No production backend or real data logic is required.
- Behavior simulates plausible UI interactivity within the mock-up runtime.

The primary goal is to replicate the text-to-UI experience locally, with full control, no subscription, and complete agent transparency.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frozenfigma
```

2. Install dependencies:
```bash
npm install
```

### Development

To start the development server:
```bash
npm run dev
```

This will start the Vite development server. Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

### Building

To create a production build:
```bash
npm run build
```

## Project Structure

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

## Validation Gates

A turn is successful **only if all gates pass**. The gate runner ensures quality and stability:

- **Lint**: Style & syntax correctness (ESLint + Prettier)
- **Types**: Type-safety & interface validation (`tsc --noEmit`)
- **Schema**: Validate UI graph structure (Zod schema parsing)
- **Test**: Unit test correctness (`vitest run`)
- **Smoke**: Headless render sanity (Vitest + Testing-Library)

Run all gates with:
```bash
npm run gate
```

## Technology Stack

- **UI / Renderer**: TypeScript + React 18
- **Desktop shell**: Tauri (Rust) (Phase 2)
- **Styling**: Tailwind + CSS Vars
- **State**: Zustand
- **Schema**: Zod
- **Tests**: Vitest + Testing Library
- **Lint/Format**: ESLint + Prettier
- **Build**: Vite

## Phase 1: Pure Web

This initial implementation is a Pure Web (Vite + React + TypeScript) approach for speed. Phase 2 will add the Tauri wrapper for desktop functionality.

## Features

- Natural language UI generation
- Interactive mock-up components
- Incremental editing with atomic operations
- Visual fidelity with design tokens
- Persistence and export capabilities
- Validation gates for reliability
- Artifact generation (screenshots, diffs, logs)

## Non-Functional Requirements

- **Target latency per turn**: ≤ 2 seconds
- **Cold boot**: ≤ 5 seconds
- **Incremental build**: ≤ 1 second with Vite HMR
- **Default offline operation**: No external API calls unless explicitly enabled by the user
- **Optional LLM**: Integration possible via local providers like Ollama or LM Studio