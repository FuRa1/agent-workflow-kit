# Workflow Kit MVP implementation plan

Goal: turn the starter into a locally runnable, npm-packable CLI plus four skills.
Approved scope: init presets, add skills, doctor, safe updates, workflow discovery,
project configuration and future hook guidance. No publishing or real hook install.

Architecture: dependency-free Node 22 ESM. CLI parses commands, library builds a
file plan, installer compares content hashes and applies only conflict-free plans.
Skills remain standalone. Presets select policies, not lower safety standards.

- [x] Write CLI integration tests using disposable directories: preview is read-only,
  init installs both hosts, repeated init is idempotent, collisions preserve data,
  update preserves manual edits, unknown inputs and symlink escapes are rejected,
  doctor catches missing commands/files, add installs full references, list works.
- [x] Run tests before implementation and record missing-entrypoint failure.
- [x] Implement package/bin, presets, project analysis, file planning and managed lock.
- [x] Add bootstrap/author/hook skills and workflow descriptors; no hook side effects.
- [x] Run tests, syntax checks and npm pack inspection; verify isolated installation.
- [x] Update README and future work with actual limitations and release gates.

Evidence (2026-09-06, Windows, Node 22.16.0): initial suite failed for missing CLI;
installer guard test also failed before its implementation. Final CLI suite has
12 passing tests. Structure/syntax/link checker passed. A real npm archive was
unpacked in a fresh temporary directory; its CLI reported version 0.1.0, passed
the checker, installed into an empty disposable consumer and returned doctor
warnings for the intentionally unconfigured app commands/reference. No real app
was modified. Agent behavioral scenarios remain NOT RUN; see their test documents.

Tests must assert filesystem and process behavior, not just generated sentences.
No commits or external installs are needed. Keep runtime fixtures outside the repo.
