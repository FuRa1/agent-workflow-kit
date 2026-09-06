---
name: design-polish
description: Implement, recompose or polish existing-app screens from design exports, gallery targets, screenshots or instructions when repeatable visual comparison and human review are needed.
metadata:
  version: "0.2.0"
  category: "design-led-implementation"
  complexity: "advanced"
  maturity: "experimental"
---

# Design polish

Read project instructions and .workflow-kit/POLICY.md when present. Preset policy
does not override explicit user scope or this skill's preflight approval gate.

Read [workflow](references/workflow.md) before taking task actions, and the
[record contract](references/records.md) before reading or writing run records.
Read each once per run. Resolve those paths relative to this skill, not the
consumer project. Resolve the project adapter relative to the project.

Accept a design file, image/attachment, pasted instructions, gallery target and
optional pages/layout/minutes/runs. Read design-polish.project.json at the
consumer root (or the explicitly supplied adapter). Missing or ambiguous
configuration is a preflight question, not license to invent paths or commands.
Use [adapter example](assets/project.example.json) as the shape.

Always analyse versions and existing evidence first, then ask whether to start.
Only approval starts implementation and the duration budget. Iteration is default
for every target; target names never mean loop modes. runs=1 requests one pass.
Default maximum is 60 minutes, with five varied passes as a coverage target,
not a requirement to fabricate edits. Explicit runs is a maximum. Validate
positive finite minutes and positive integer runs.

Both minutes and runs are ceilings, never quotas. Stop early when a pass closes
no findings. Skip unchanged approved cases before capturing anything, and spend
captures, image inspections and quality gates only where they decide something.
Never trade away a capture, a re-verification of a changed case, or a recorded
exit code to save effort.

Run in the active coding-agent session, using the project's browser and quality
tooling. No scheduler or background worker is supplied. A separate worker needs
explicit authorization and a safe ownership mechanism.

Follow the user's language for reports. Preserve project rules, local changes,
data privacy and human approval. Never commit, push, deploy or change domain
rules solely because this skill was invoked. This skill does not require any
other installed skill: use available project procedures when applicable.

## Updates

Update with `workflow-kit update design-polish`. Version checks, conflict
resolution and rollback are CLI behavior; see `docs/cli.md`. `--all` updates
only skills already installed in the project.
