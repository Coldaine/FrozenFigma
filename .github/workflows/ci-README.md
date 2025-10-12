# CI Workflow - Informational Checks

This workflow provides **informational feedback** on code quality without blocking PRs or failing builds.

## What it does

- **ESLint**: Checks code style and common issues
- **TypeScript**: Verifies type correctness
- **Tests**: Runs unit tests
- **Smoke Tests**: Quick integration checks
- **Build**: Ensures the project compiles

## Philosophy

All checks except the build use `continue-on-error: true`, meaning:
- ✅ Failures show up as warnings, not errors
- ✅ PRs won't be blocked by linting opinions
- ✅ You get useful feedback without strict enforcement
- ✅ The build is the only hard requirement (code must compile)

## Customization

To make any check required (fail the workflow if it fails), remove the `continue-on-error: true` line from that job in `ci.yml`.
