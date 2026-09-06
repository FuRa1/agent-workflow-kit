# Future work: instructions for the next contributor

The MVP is a generic installer plus agent instructions, not a product integration.
Do not apply it to Perudo or another real project without a current request.
The tests use disposable directories. Never turn a test into a live installation.

## P0 — before calling this stable

1. Run fresh-agent behavioral evaluations for all four skills. The existing
   design-polish scenarios are not automated agent runs. Record environment,
   model, inputs, observed files and pass/fail, including uncertainty.
2. Add cross-platform CI once hosting/CI policy is approved. Current execution
   evidence is Windows/Node 22; Linux/macOS are not claimed tested.
3. Add a durable recovery journal and process-termination/power-loss tests.
   Per-file staging and in-process rollback now cover injected disk-full failures
   between config and lock writes, partial staging, and rollback failure. These
   do not provide recovery after a crash; empty created directories may remain.
4. Validate configuration with versioned JSON Schemas, including the complete
   design adapter and run/case records. Project and lock v1 schemas are now bundled
   and enforced without dependencies; complete design schemas remain pending.
5. Maintain backward-compatible state migrations. Doctor now checks required
   bundle inventory independently of lock entries and warns about stale paths;
   automatic migration and cleanup remain unimplemented.
6. Choose license, copyright attribution and package scope before public release.

## P1 — useful next increments

- dry-run preset/host migrations with reviewed diffs; no deletion of user files.
- Explicit uninstall with ownership checks, recoverable removal and tests.
- Design evidence index/synchronization helper: deterministic hashes and records;
  keep semantic visual judgments and human acceptance out of automatic scoring.
- Adapter discovery for non-Node stacks and monorepo affected-package checks.
- Named gallery catalogue editor, not assumptions about the word circular.
- Separate agent workflow runner only after lifecycle/approval/ownership design.

## Commit-hook implementation gate

The current skill produces a proposal only. Before adding a backend, research
official documentation for non-Husky candidates, compare platform support,
existing hooks/core.hooksPath, partial staging and runtime overhead. Choose with
the user. Implement in disposable repositories first. No network/LLM calls in
pre-commit, no silent dependency install, no override of existing hooks.

## Token efficiency

Measure useful work and error rate, not just shorter prompts. Cache deterministic
inventory/signature results with invalidation, load only the selected references,
and checkpoint small summaries. Enterprise may require more review, not loading
the whole repo on every turn. MVP may use shorter plans, not weaker correctness.

## Development workflow

Read README, docs/cli.md, SECURITY.md and the affected skills. Start with failing
tests for behavior changes. Run npm test and npm run check. Inspect npm pack
contents and smoke-test a copied/packed installation. Update limitations honestly.
Keep toolkit tests separate from consumer app tests. Do not copy third-party
code/licenses or add global agent settings as an implicit setup step.
