---
name: design-polish
description: Implement, recompose or polish existing-app screens from design exports, gallery targets, screenshots or instructions when repeatable visual comparison and human review are needed.
metadata:
  version: "0.1.0"
  category: "design-led-implementation"
  complexity: "advanced"
  maturity: "experimental"
---

# Design polish

Read project instructions and .workflow-kit/POLICY.md when present. Preset policy
does not override explicit user scope or this skill's preflight approval gate.

Read [workflow](references/workflow.md) and [record contract](references/records.md)
fully before taking task actions. Resolve those paths relative to this skill,
not the consumer project. Resolve the project adapter relative to the project.

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

Run in the active coding-agent session, using the project's browser and quality
tooling. No scheduler or background worker is supplied. A separate worker needs
explicit authorization and a safe ownership mechanism.

Follow the user's language for reports. Preserve project rules, local changes,
data privacy and human approval. Never commit, push, deploy or change domain
rules solely because this skill was invoked. This skill does not require any
other installed skill: use available project procedures when applicable.

## Update Capabilities

This skill supports automatic updates with the following features:
- Automatic version checking for skill files
- Package dependency change detection
- Smart conflict resolution between user modifications and bundled files
- Migration guidance for breaking changes
- Rollback support for failed updates
- Preview of changes before applying updates

Use `workflow-kit update design-polish` to update this skill when new versions are available.

**Note**: When using `workflow-kit update --all`, only skills that are currently installed and used in your project will be updated. New skills will not be automatically installed.
