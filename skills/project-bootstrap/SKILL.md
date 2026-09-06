---
name: project-bootstrap
description: Use when initializing or adapting agent workflows in an existing project, selecting quick-mvp or enterprise policies, or inspecting missing workflow configuration.
---

# Project bootstrap

Read the project's instructions, .workflow-kit/POLICY.md and project.json when
present. This skill configures agent guidance, not the product itself.

Inspect stack, package scripts, workspace boundaries, existing skills/hooks,
owners, quality gates and available browser tooling. Do not execute discovered
scripts just to find out what they do. Report conflicting package managers.

Recommend quick-mvp for short bounded iteration or enterprise for coordinated
cross-package work. Team size alone is not an authority model. Both preserve
testing, privacy and user approval. Never weaken quality as token optimization.

Use the installed workflow-kit binary (or the user-provided CLI path). If absent,
report that and offer manual configuration; do not download an arbitrary package
with a matching name. Preview init <preset> --host <codex|claude|both> --project
<root>. Show file changes, conflicts and unconfigured items; ask before --apply.

After approval apply only that plan, run doctor, and explain warnings. Fill the
design-polish adapter from actual project data: commands, tokens, references,
states and screenshot locations. A null template is not a configured pipeline.
Do not replace AGENTS.md, CLAUDE.md, project hooks or CI. Propose scoped additions
only when the user requests integration. Preset migration is manual in this MVP.

Report installed skills, policy, checks and remaining setup. Installing guidance
does not authorize those skills to edit the application immediately.
