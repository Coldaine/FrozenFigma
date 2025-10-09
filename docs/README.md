# FrozenFigma — Documentation Index

This short index points to the primary documentation already in the repository and summarizes what is implemented and why. It is intended for contributors who want a fast orientation without unnecessary examples.

Why this file exists

- Provide a single place to find the authoritative docs that explain what was implemented and the rationale behind key design choices.
- Keep onboarding friction low: the codebase already contains focused READMEs; this file links them and highlights gaps to avoid duplication.

What is implemented (concise)

- Agent loop (prompt → plan → apply → validate → report): implemented to enable reproducible, atomic UI edit turns.
- Skeleton library: a templated set of UI patterns (settings, tabs, modal, tray, card-grid, form, lens, navigation, data display, inputs, feedback, layouts) used by the agent to generate UI fragments.
- State store: a Zustand-based graph store with selection/session slices, history/undo, checkpoints, and local persistence.
- Theme & tokens: CSS variable token system, theme manager, presets, validation and token inheritance support.
- IO & export: save/load of `ui.json`, artifact paths, and TSX export scaffolding (exporter/artefacts areas implemented).
- Patch & validation pipeline: validator + repairer + gate runner to ensure edits pass lint/types/tests/smoke or are rolled back.
- Tests & gates: Vitest unit tests, a smoke test, linting and type-check gates; `npm run gate` enforces all checks.

Where to read more (core docs)

- Project overview and run instructions: `README.md` (root)
- Architecture & technical plan: `PLANNING.md` (root)
- Theme system: `docs/theme-documentation.md`
- Skeletons library: `src/agent/skeletons/README.md`
- State store: `src/app/state/README.md`

Key code locations (quick map)

- Agent & generation: `src/agent/` (planner, skeletons, patcher, repair, validator, reporter)
- Store & app state: `src/app/state/` (store.ts and slices)
- Theme & tokens: `src/app/theme/` (themeManager.ts, themeUtils.ts)
- IO & export: `src/io/` (persistence, artifacts, export)
- Renderer & UI: `src/app/view/` (Canvas, Inspector, Library, Console)
- Schema: `src/schema/` (Zod types and factory helpers)
- Tests: `tests/` (unit + smoke)

How to run (minimum)

Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Run the full validation gate locally:

```bash
npm run gate
```

Run tests only:

```bash
npm run test
```

Why these docs were added (short)

- Reduce the friction of discovery: contributors should not need to guess where major subsystems live.
- Emphasize design intent: knowing "what" and "why" makes code changes safer and reviewable.
- Keep docs minimal: this index links to existing deep docs (theme, skeletons, state) rather than duplicating content.

Recommended next docs (optional)

- `src/agent/README.md` (agent internals) — created alongside this index.
- Short `CONTRIBUTING.md` and `DEVELOPER.md` (CI expectations + commit/gate guidance).

If you'd like, I can add `CONTRIBUTING.md` and a short `DEVELOPER.md` next. Otherwise this index is ready.
