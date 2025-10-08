# Testing Philosophy & Practices

## Philosophy
- **No mocks.** All tests should run against live, real code and state. Substantial span and integration coverage are preferred over isolated unit tests.
- **Gate-Driven:** All code changes must pass the full validation gate: lint, types, unit, and smoke tests.
- **Atomicity:** No partial state is allowed; failed tests trigger rollback.

## Test Types
- **Unit Tests:** Validate individual functions/components with real data.
- **Smoke Tests:** Headless sanity checks (see `tests/smoke.test.tsx`).
- **Integration Tests:** Prefer tests that span multiple modules and simulate real user flows.
- **Theme & Token Tests:** Ensure theme switching and token application work as expected.

## Coverage
- All acceptance criteria (AC-1 to AC-6) must be covered by live tests.
- Avoid brittle, over-mocked tests. Favor realistic scenarios and end-to-end flows.

## Running Tests
- Use `npm run test` for all tests.
- Use `npm run smoke` for headless sanity.
- Use `npm run gate` to run the full validation pipeline.

## Best Practices

- Write tests that reflect real user interactions and system states.
- Prefer integration and smoke tests over isolated mocks.
- Ensure tests are fast, reliable, and reproducible.

## Future State Vision

This is a personal project with agent assistance. The testing and CI philosophy prioritizes:

- **Robustness without review overhead:** CI and automated gates provide confidence that changes work correctly, even when you don't have time to manually review every agent-driven edit.
- **Agent-friendly validation:** The atomic turn guarantee ensures agents never leave the system in a broken state. All changes pass the full gate or roll back cleanly.
- **Live, realistic tests:** No mocks means tests verify real behavior, reducing false positives and increasing confidence in agent-generated code.
- **Extensible validation:** As the project evolves, add visual regression tests, E2E scenarios, and artifact uploads to CI without changing the core philosophy.
- **Traceability:** Every test run, gate result, and rollback is logged for audit and debugging, making it easy to understand what happened when you weren't watching.
