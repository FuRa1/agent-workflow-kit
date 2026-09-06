# Adding and improving skills

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
