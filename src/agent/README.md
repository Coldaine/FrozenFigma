# Agent Subsystem — Overview

This short README describes the agent subsystem, focusing on what is implemented, where to find the code, and the rationale behind major design choices. It intentionally avoids long examples and keeps the explanation focused and actionable.

What the agent implements

- Planner: Converts natural-language prompts into a structured `EditPlan` (a list of atomic commands). See `src/agent/planner`.
- Skeletonizer: A library of reusable skeleton templates (settings panel, tabs, modal, tray, card-grid, form, lens, navigation, data display, inputs, feedback, layout). See `src/agent/skeletons`.
- Patcher/Executor: Applies atomic graph mutations and produces filesystem/AST patches when exporting component code. See `src/agent/patcher`.
- Validator & Gate Runner: Runs lint + types + unit tests + smoke tests to ensure changes are safe. See `src/agent/validator`.
- Repairer: When validation fails, deterministic fixes are proposed and re-applied up to a small retry limit before rollback. See `src/agent/repair`.
- Reporter: Emits structured turn summaries, diffs, and artifact links. See `src/agent/reporter`.

Key data shapes (where to look)

- EditPlan / Command: Defined alongside the planner (search `EditPlan` or `createAddCommand` in `src/schema`). The command model is intentionally simple: add/update/remove/move operations with component IDs and payloads.
- ComponentSpec: Central component description including `id`, `type`, `props`, and `frame` (x/y/w/h/region). See `src/schema` and `src/agent/skeletons/index.ts` for generator inputs and outputs.

Why these decisions were made (brief)

- Atomic commands and checkpoints: Ensures no partial or broken states are left after an agent turn. This design makes repair and rollback tractable.
- Skeleton library: Instead of editing raw nodes for common UIs, the skeletons provide parameterized, human-readable templates that keep planner logic simple.
- Gate-driven validation: Running lint/types/tests/smoke after each planned change catches regression early and supports automatic, deterministic repair.
- Deterministic repair first: Attempting rule-based repairs keeps the agent behavior inspectable and reproducible compared to always invoking a stochastic LLM.

Where to start reading code

- Planner: `src/agent/planner/index.ts`
- Skeletons: `src/agent/skeletons/index.ts` (contains generator functions and JSDoc)
- Patcher: `src/agent/patcher/index.ts`
- Validator: `src/agent/validator/index.ts` and `src/agent/validator/gateRunner.ts`
- Repair: `src/agent/repair/index.ts`
- Reporter: `src/agent/reporter/index.ts`

Notes and suggested minimal follow-ups

- Add a short types-only reference for `EditPlan` and `Command` in `src/agent/types.md` if more clarity is required for contributors.
- If you want, I can add a single small `examples/` JSON `EditPlan` fixture to make it easier to run integration tests—only if you find it useful.

