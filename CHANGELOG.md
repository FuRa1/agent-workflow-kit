# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-09-06

### Changed
- design-polish 0.1.0 -> 0.2.0: reworked for token efficiency without relaxing
  verification fidelity.
- Added a cost-discipline section to the workflow: read each file once per run,
  hash each input once, resolve skip decisions before any capture, cap image
  inspections per case/pass, re-render only affected cases, run quality gates
  once per coherent slice, and append record/report deltas instead of rewriting.
- Minutes and runs are now stated as ceilings rather than quotas; a pass that
  closes no findings ends the run, and the case queue is ordered
  changed -> new -> uncovered -> blocked.
- Failed hypotheses carry forward within a run so retries cannot repeat them.

### Removed
- `skills/design-polish/references/efficiency-optimizations.md` and
  `references/update-mechanism.md`. Neither was referenced by SKILL.md, the CLI
  or the README file tree; update behavior is documented in `docs/cli.md`.
- Non-actionable "Optimization Note" and "Update Capability" blocks from
  `references/workflow.md` and `references/records.md`.

### Notes
- Consuming projects keep the previous files until `workflow-kit update
  design-polish` is run.
- Two pre-existing test failures (`add requires init`, `local npm archive`) are
  unchanged by this release.

## [1.0.0] - 2026-09-06

### Added
- Initial release of the agent-workflow-kit
- CLI tool with commands: init, add, doctor, update, list, workflow
- Four skills: design-polish, project-bootstrap, skill-author, commit-hook
- Presets for quick-mvp and enterprise configurations
- Complete documentation and examples

### Changed
- Updated version to 1.0.0
- Made package public for npm publishing
- Switched license from UNLICENSED to MIT

### Fixed
- All existing tests pass
- Proper file structure validation
- CLI integration tests completed

## [0.1.0] - 2026-09-06

### Added
- Initial experimental version of the workflow kit
- Basic CLI functionality
- Core skill implementations
- Project setup and testing infrastructure

[1.0.0]: https://github.com/yourusername/agent-workflow-kit/compare/v0.1.0...v1.0.0