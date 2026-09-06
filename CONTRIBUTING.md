# Adding and improving skills

## Version Management

Before committing any changes, update the version in `package.json` using semantic versioning:
- **PATCH** (e.g., 1.2.1): Bug fixes, documentation updates, minor improvements
- **MINOR** (e.g., 1.2.0): New features, new skills, new capabilities
- **MAJOR** (e.g., 2.0.0): Breaking changes, major refactoring

Always bump the version BEFORE creating the commit. This ensures:
- Clear version history tied to specific changes
- Easy tracking of what changed in each release
- Proper dependency management for users

## Skill Development

Keep each skill self-contained under skills/<name>/SKILL.md with name and
description frontmatter. Put substantial conditional guidance in references/
and output templates in assets/. README belongs at repository level.

Add a catalog entry describing purpose, complexity, maturity, dependencies,
side effects and approval boundary. Do not call a skill stable from structure
validation alone. Include realistic cases and observed evaluation results;
report not-run honestly. Reuse existing target-project tools, not global setup.

Change one demonstrated failure at a time. Preserve review records across
versions. Add no secrets, real user inputs, runtime approvals or screenshots
without publication permission. Never bundle third-party skills without
reviewing their licenses and retaining required notices.

For changes to design-polish, check input-only, unchanged-approved, changed-code,
new-screen, interrupted and contradictory-reference cases. Fresh-install it
into an isolated test project. Update referenced templates together.
