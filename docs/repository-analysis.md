# Skills Directory Structure Comparison

Researched 2026-09-06 from primary GitHub pages and specifications.
This analysis examines structural usability, not star ratings or proof of what
each user values about these projects. Branches may change.

| Project | Observed Structure and README | What We Adopt |
| --- | --- | --- |
| Anthropic Skills | skills/, spec/, template/, separate notices; README explains concepts, grouping and usage patterns | Self-contained folders and separation of skill instructions/human README |
| Superpowers | skills/, docs/, tests/, scripts/, hooks/ and host-specific metadata; README describes process and inputs for different systems | Explicit process, verification scenarios, honest environment requirements |
| Vercel Agent Skills | skills/, packages/, scripts/; README lists skills with "Use when" and categories | Task-based catalog with short selection criteria |

Sources: [Anthropic](https://github.com/anthropics/skills),
[Superpowers](https://github.com/obra/superpowers),
[Vercel](https://github.com/vercel-labs/agent-skills).
Minimal folder format and frontmatter:
[Agent Skills specification](https://agentskills.io/specification).

## Design-polish Classification

**Advanced / stateful workflow / design-led implementation / experimental.**
This is our catalog classification, not an official specification level.

- Reference: knowledge/rules without required project changes.
- Focused task: limited operation with a single verifiable result.
- Workflow: multiple dependent stages, tools and verification.
- Stateful workflow: workflow plus versions, checkpoints and human decisions.

Design-polish belongs to the last category: analyzes sources, sometimes builds screens,
renders, fixes, verifies, saves state and waits for human decisions.
Process complexity doesn't imply stability or the need for a separate plugin.

## Structural Decision

One brief SKILL.md points to two required references; templates are nearby
so copying the entire folder doesn't leave references in the source project. Project
paths/commands/galleries are specified by an external JSON adapter. README order:
result and status → catalog → quick start → features → limitations →
structure → verification/license. This is our structural decision based on comparison.

We don't include hooks, marketplace metadata, binaries, full Superpowers or
browser frameworks for a single skill. Plugin installation can be added
later after separate verification of each environment. For now this is a skill collection,
not a marketplace and not a promise to work after window close.

## What Remains Unproven

Portability to other applications, consistent behavior across different systems, recovery
after quota limits and resilience to incorrect/malicious exports require scenario
verification. JSON validation doesn't replace this. Real user images
are not included in this starter.
