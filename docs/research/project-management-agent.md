# Continuous Project Management Agent Blueprint

_Date:_ 2025-10-08  
_Prepared for:_ FrozenFigma maintainers

## 1. Purpose
Articulate the design and operating model of the always-on project management agent that continuously steers FrozenFigma. The agent enforces alignment with `docs/architecture.md`, the feature matrix, and the technical-debt ledger by watching every code and project-management event, taking deterministic actions, and escalating when human judgement is required.

## 2. Alignment with Architecture & Vision
- The agent is part of the **validation/persistence loop** described in the architecture document. It treats FrozenFigma’s plan as the source of truth and ensures all repo activity matches that plan.
- Every change (PR, issue, documentation update) is evaluated against the architecture’s milestones, feature priorities, and validation gates.
- The agent uses the same **atomic turn** philosophy as the core product: apply a plan, validate (`lint → types → unit → smoke`), and either commit or roll back.

## 3. Responsibilities
1. **Pull Request Oversight**
   - Run the full validation gate (`npm run gate`) and markdown lint.
   - Check PR content against architecture milestones and feature matrix; flag deviations, missing tests, or undocumented features.
   - Suggest labels, reviewers, and follow-up tasks; block or escalate when quality gates fail.

2. **Issue & Backlog Management**
   - Auto-label and prioritize issues using deterministic rules (with optional LLM hints).
   - Close obsolete tickets, open new ones when gaps exist between plan and implementation.
   - Keep the roadmap (milestones, Projects boards) in sync with the latest plan and progress.

3. **Documentation & Status Hygiene**
   - Ensure `docs/index.md`, status snapshots, and technical-debt reports reflect the latest gate results and plan updates.
   - Generate and publish turn summaries and weekly status digests.

4. **Milestones & Feature Matrix Enforcement**
   - Track progress for each milestone and update exit criteria status.
   - Maintain the feature matrix as a living artifact—linking features to issues, PRs, and owners.

5. **Alerting & Escalation**
   - Surface blockers (failed gates, overdue milestones, unresolved high-priority issues) via GitHub comments, dashboards, or chat notifications.
   - Pause automation and request human review when governance rules are exceeded.

## 4. Operating Model
- **Triggers**: Every PR event, issue event, milestone change, scheduled audit (e.g., nightly), and manual workflow dispatch.
- **Decision Loop**:
  1. Gather relevant artifacts (plan, docs, issues, CI status).
  2. Generate a structured management plan (actions + rationale).
  3. Apply actions atomically (labels, milestones, docs).
  4. Validate via gates and policy checks.
  5. Report success or escalate with detailed diagnostics.
- **Execution Environment**: GitHub Actions or an orchestrated agent runtime with access to the repo’s automation scripts and secrets.

## 5. Interaction with Contributors & Maintainers
- PR authors receive automated feedback (checklist comments, required fixes).
- Maintainers can approve or override the agent’s recommendations via labels or comment triggers (e.g., `/agent override`).
- The agent respects code ownership rules and does not merge without explicit approval.

## 6. Automation Surfaces
- **GitHub**: issues, PRs, labels, milestones, Projects v2 boards, check suites.
- **Documentation**: Markdown files in `docs/`, generated status reports, technical-debt ledger.
- **CI & Quality Gates**: `npm run gate`, coverage reports, smoke tests.
- **Optional Integrations**: Slack/Teams webhooks, calendar reminders, or external dashboards (future).

## 7. Configuration & Secrets
- All automation scripts and policies live in `docs/research/automation/` and under version control.
- Secrets (GitHub token, optional LLM key, chat webhooks) are stored in GitHub Actions Secrets with least-privilege scopes.
- Flags such as `AGENT_ENABLED`, `AGENT_DRY_RUN`, and `AGENT_NOTIFY_CHANNEL` control runtime behavior.

## 8. Governance & Safeguards
- **Transparency**: Every automated action logs inputs, decisions, and outputs; artifacts are archived under `docs/status/`.
- **Audit Trail**: Signed JSON reports per run, including lists of modified issues/milestones/docs.
- **Human Override**: Maintainers can pause automation via repository secrets, workflow inputs, or a dedicated “pause” issue label.
- **Security**: No secrets are sent to external LLMs unless explicitly allowed; sensitive data is redacted.
- **Policy Compliance**: Destructive actions (closing issues, moving milestones) require dual review or explicit maintainer opt-in.

## 9. Continuous Improvement Backlog
- Expand detectors for architectural drift (e.g., new features without feature-matrix entries).
- Enrich documentation sync (auto-linking PRs in status snapshots, maintaining a changelog).
- Add heuristics or local LLM assistance for classifying ambiguous issues while retaining human approval.
- Integrate performance metrics (gate run time, backlog churn) into dashboards for long-term health tracking.

## 10. Operational Runbook (Summary)
1. **Daily/Nightly Run**: Full audit of issues, milestones, docs, and CI results.
2. **Per-PR Run**: Gate enforcement, plan alignment check, feedback comment, optional status label update.
3. **Weekly Digest**: Autogenerated summary of progress vs. milestones, blockers, and recommended focus areas.
4. **Manual Trigger**: Maintainers can run `/agent full-audit` for ad-hoc reviews.

---
_Maintain this blueprint in `docs/research/project-management-agent.md` and update it whenever governance rules, integrations, or operating procedures change._
