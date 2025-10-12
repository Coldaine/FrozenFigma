This workflow runs the project's validation gate and a strict Markdown linter for docs.

Notes:
- Local markdown linting is intentionally lenient to avoid distracting the developer during edits.
- The CI runs `.markdownlint-ci.json` with stricter rules to enforce documentation quality on PRs.

To update markdown rules locally, edit `.markdownlint.json`.
To update CI markdown rules, edit `.markdownlint-ci.json`.
