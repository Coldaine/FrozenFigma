Perfect—here’s a crisp “next phase” plan you can execute immediately. It’s broken into bite-sized PRs with acceptance criteria, owners, and concrete artifacts. I kept it laser-aligned to your status and the Architecture Bible.

---

# Next Phase Plan (M0 → M2)

## Overview

* **Goal:** Stand up the Graph-as-source-of-truth, edit cycle, and gate/rollback loop with one usable skeleton (SettingsPanel).
* **Output:** `ui.json` persisted + Zod schemas + gate runner + smoke test + first Planner→EditPlan→Patcher flow + exporter v0.

---

## PR-01: Introduce Zod Schemas + Types (Graph / ComponentSpec / Command)

**Why:** Unblock everything else; schemas drive Planner, Patcher, validation, and gate errors.

**Scope**

* `src/schema/graph.ts` — `GraphV1` (versioned), `ComponentSpec`, `Frame`, `Tokens`.
* `src/schema/command.ts` — discriminated union: `ADD | UPDATE | REMOVE | MOVE | SET_TOKENS`.
* `src/schema/index.ts` — exports + type helpers.

**Acceptance**

* Unit tests verifying:

  * Valid sample graph passes.
  * Bad `type` or missing required props fails with helpful errors.
  * Commands parse and narrow types correctly.

**Artifacts**

* `src/schema/*`
* `tests/schema/graph.spec.ts`
* `tests/schema/command.spec.ts`

---

## PR-02: Persistence + Checkpointing (ui.json + session logs)

**Why:** Establish the single source of truth and enable rollback.

**Scope**

* `src/io/persistence/ui.ts` — `loadGraph()`, `saveGraph()`, `checkpoint({ turnId })`.
* `src/io/persistence/session.ts` — append JSONL logs per turn (`/artifacts/sessions/<date>.jsonl`).
* Git-ignored `/artifacts/` dir.

**Acceptance**

* `loadGraph()` creates default empty graph on first run.
* `checkpoint()` writes `artifacts/checkpoints/<turnId>/ui.json`.
* Round-trip test: write/read graph equals deep-equal.

**Artifacts**

* `src/io/persistence/*`
* `tests/persistence/roundtrip.spec.ts`

---

## PR-03: Minimal Store + App Wiring (Zustand, Canvas, Inspector stubs)

**Why:** Render a real canvas and enable smoke tests.

**Scope**

* `src/app/state/store.ts` — graph state, selection, turn metadata.
* `src/app/view/Canvas.tsx` — renders nodes; `data-testid="canvas"`.
* `src/app/view/Inspector.tsx` — shows selected node props JSON.
* `src/App.tsx` — integrates store, Canvas, Inspector, CommandBar stub.

**Acceptance**

* App boots and renders empty canvas.
* Selecting a node (hardcoded for now) shows props in Inspector.

**Artifacts**

* `src/app/state/*`, `src/app/view/*`, `src/App.tsx`

---

## PR-04: Gate Runner + Smoke Test + Scripts

**Why:** Atomic turn guarantees.

**Scope**

* `tests/smoke.test.tsx` — headless render `<App />`, assert `canvas` + minimal node presence when provided.
* `scripts/gate.mjs` — run `lint → types → test → smoke`, write `artifacts/gate.json` (exit codes, durations, excerpts).
* `package.json` — add:

  ```json
  {
    "scripts": {
      "lint": "eslint \"src/**/*.{ts,tsx}\"",
      "types": "tsc --noEmit",
      "test": "vitest run",
      "smoke": "vitest run tests/smoke.test.tsx",
      "gate": "node scripts/gate.mjs",
      "dev": "vite",
      "build": "vite build"
    }
  }
  ```

**Acceptance**

* `npm run gate` exits non-zero on failure and produces `artifacts/gate.json`.
* CI job runs `gate` and uploads `/artifacts` on failure.

**Artifacts**

* `tests/smoke.test.tsx`, `scripts/gate.mjs`, `package.json` updates

---

## PR-05: Skeleton Library v0 — SettingsPanel

**Why:** First functional mock-up component that proves end-to-end.

**Scope**

* `src/agent/skeletons/settings.ts` — generator: `{ sliders: number; toggles: number; labels?: string[] }`.
* `src/components/SettingsPanel.tsx` — interactive sliders/toggles with plausible defaults.
* Tokens applied for colors/radius; test IDs for smoke.

**Acceptance**

* Generating a SettingsPanel spec renders interactive UI.
* Unit test mounts component and simulates slider/toggle interactions.

**Artifacts**

* `src/agent/skeletons/settings.ts`
* `src/components/SettingsPanel.tsx`
* `tests/components/SettingsPanel.spec.tsx`

---

## PR-06: Planner (Deterministic) + EditPlan + Patcher (ADD only)

**Why:** The first prompt → plan → apply cycle.

**Scope**

* `src/agent/planner/rules.ts` — simple patterns:

  * “settings with {N} sliders and {M} toggles”
  * fallback defaults if numbers missing
* `src/agent/patcher/apply.ts` — apply `ADD` to Graph, assign stable IDs, default frames, ensure uniqueness.
* `src/app/view/CommandBar.tsx` — submit prompt → run turn → update store/logs.

**Acceptance**

* Typing “add settings with 6 sliders and 4 toggles” creates a node and renders it.
* Store writes a session entry with `EditPlan`.

**Artifacts**

* `src/agent/planner/*`, `src/agent/patcher/*`, `src/app/view/CommandBar.tsx`

---

## PR-07: Atomic Turn + Rollback + (Retry Skeleton)

**Why:** Guarantee “never leave broken”.

**Scope**

* `src/agent/validator/gate.ts` — programmatic API to run `gate` sub-steps and parse results.
* `src/agent/repair/index.ts` — v0: eslint `--fix` fallback; missing prop defaults for SettingsPanel.
* Turn runner:

  * pre-turn checkpoint
  * apply edits
  * run gate
  * if fail → attempt ≤3 repairs (lint fix, add defaults)
  * if still fail → rollback; mark “TurnFailed”

**Acceptance**

* Introduce a deliberate type error → repair fixes it or rollback happens.
* Logs show repair attempts and outcome.

**Artifacts**

* `src/agent/validator/*`, `src/agent/repair/*`, updates to the turn runner

---

## PR-08: Exporter v0 (TSX) + Round-Trip Test

**Why:** Prove we can emit real components for later use.

**Scope**

* `src/io/export/react.ts` — emit `exported/SettingsPanel.tsx` from a `ComponentSpec`.
* Fixture test: import exported file into a blank test harness and mount successfully.

**Acceptance**

* Running `npm run export` produces TSX; test mounts without errors.

**Artifacts**

* `src/io/export/*`, `tests/export/react-export.spec.tsx`, script `"export": "node scripts/export.mjs"`

---

# Risk Register & Mitigations (Focused)

1. **Schema churn slows dev**
   *Mitigate:* lock `GraphV1` for M0-M2; add migrations only post-M2.

2. **Flaky smoke on CI**
   *Mitigate:* minimal assertions; increase timeouts; run smoke after build only.

3. **Planner ambiguity**
   *Mitigate:* strict patterns for M1; show “did you mean…?” suggestions on parse miss.

4. **Rollback races**
   *Mitigate:* checkpoint before any FS changes; apply edits in-memory, write on gate pass.

5. **Token inconsistency**
   *Mitigate:* single CSS var source; unit test for token presence.

---

# Owning Roles (suggested)

* **Schema/Persistence Lead:** sets `src/schema/*`, `io/persistence/*` (PR-01/02).
* **Runtime/UI Lead:** Canvas/Inspector/CommandBar + smoke (PR-03/04).
* **Agent Lead:** Planner/Patcher/Validator/Repair (PR-05/06/07).
* **Exporter Lead:** React exporter + tests (PR-08).

(One person can hold multiple roles if you’re solo—this just clarifies focus areas.)

---

# Exit Criteria for this Phase (M2)

* ✅ `ui.json` exists, validated by Zod, persisted and checkpointed.
* ✅ Prompt “settings with 6 sliders and 4 toggles” produces a rendered, interactive panel.
* ✅ `npm run gate` runs lint/types/test/smoke; artifacts written.
* ✅ On an injected type error, the system auto-repairs or cleanly rolls back.
* ✅ Exporter emits `SettingsPanel.tsx` and a test mounts it successfully.

---

If you want, I can turn **PR-01** and **PR-04** into copy-pasteable file patches (schemas + gate runner + smoke test + scripts) so you can open the first two PRs immediately.
