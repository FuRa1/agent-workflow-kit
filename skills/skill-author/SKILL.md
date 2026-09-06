---
name: skill-author
description: Use when creating or refining a project skill, clarifying its activation boundaries, packaging its references, or designing behavioral evaluations.
---

# Skill author

Read project instructions and .workflow-kit/POLICY.md when present. First identify
the repeated task and 2-3 realistic invocations, intended outcome, exclusions,
available tools, side effects and human decisions. Inspect existing skills before
creating another one. A conventional command may need a script rather than a skill.

Classify reference, focused-task, workflow or stateful-workflow separately from
maturity. Pick the smallest reusable unit. Put name/description in SKILL.md YAML;
keep required routing and invariants there, conditional detail in references/,
output templates in assets/. Keep required resources inside the skill folder.
Project-specific paths belong in an adapter. Avoid loading unrelated references.

Before writing, define behavioral cases including ordinary input, ambiguous
scope, unavailable tools and pressure to skip checks. Evaluate the existing
behavior when a suitable isolated agent is available. If unavailable, distinguish
structural checks from behavioral confidence; label the result experimental.

Write concise instructions stating decisions and evidence, not generic praise
or a full framework copy. Do not require nonexistent tools or models. Retain
upstream licenses for copied material. Ask before publication or dependency
installation. Never invent a license, author identity or passing evaluation.

Validate frontmatter, references, examples, invalid inputs and a clean copy into
a temporary consumer project. Add catalog metadata and scenario cases. Follow
actual observed failures rather than growing a universal prohibition list.
