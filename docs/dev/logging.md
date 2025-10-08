# Logging & Diagnostics

## Philosophy
All agent actions, validation gates, repairs, and UI changes should be logged for transparency and reproducibility. Logs are retained for the last 5 checkpoints by default.

## What to Log
- **Turn Summaries:** Each agent cycle (prompt → plan → patch → validate → repair → result) emits a structured summary.
- **Validation Gate Results:** Lint, type, test, and smoke gate outcomes.
- **Repair Attempts:** Number, result, and diagnostics for each repair cycle.
- **Diffs & Artifacts:** Changes to the UI graph, exported components, and screenshots.
- **Errors & Rollbacks:** Any failed turn, including rollback details.

## Log Storage
- **Console Panel:** Displays per-turn logs in the UI.
- **Artifacts Folder:** Persistent logs, diffs, and screenshots are stored in `src/io/artifacts/`.
- **Checkpoints:** Snapshots of `ui.json` and touched files before/after each turn.

## Best Practices

- Use structured logging (JSON or similar) for machine-readability.
- Avoid logging sensitive data.
- Ensure logs are accessible for debugging and audit.

## Future State Vision

This is a personal project with agent assistance. The logging philosophy prioritizes:

- **Transparency for agent actions:** Every agent turn is fully logged, including intent, plan, patch, validation, repair attempts, and final result. You can audit what the agent did without being present.
- **No surprises:** Failed turns, rollbacks, and repair cycles are logged with full context, so you always know why something didn't work.
- **Reproducibility:** Logs, diffs, and artifacts are retained for the last 5 checkpoints (configurable), enabling you to trace back through changes and reproduce issues.
- **Machine-readable:** Structured logs (JSON or similar) allow for automated analysis, reporting, and integration with future tooling.
- **Personal robustness:** Since you're working alone with agent assistance, comprehensive logging acts as your safety net—you don't need to review every change manually, but you can always trace what happened.
