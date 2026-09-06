---
name: commit-hook
description: Use when reviewing or proposing project pre-commit checks and hook-runner configuration, or when explicitly asked to install a local Git hook.
---

# Commit hook planning (MVP: guidance only)

Read project instructions and .workflow-kit/POLICY.md when present. Installation
of this skill does NOT install any hook. The CLI does not install hook runners.

Inspect git root, existing hooks/core.hooksPath, package manager, lint/format/test
scripts, staged-file workflows, CI and supported developer platforms. Do not
change Git configuration during analysis. Preserve worktrees and existing hooks.

Propose a small deterministic pre-commit set, separating cheap staged checks
from full tests/builds. No LLM calls, network requests or automatic code rewriting
in a commit hook. Describe expected runtime, behavior on partial staging, paths
with spaces, filenames beginning with dashes, and recovery from failure.

Do not choose a runner by fashion. If the user asks for a non-Husky tool, research
current official documentation and compare candidates against the project's
languages and OS requirements. No runner or version is preselected by this MVP.

Show dependencies, exact configuration diff and installation commands; ask for
explicit approval before any installation or Git mutation. Do not overwrite
existing hooks or weaken team policy. Include an uninstall/recovery plan.

Future implementation must test a disposable Git repo with clean and failing
commits, partial staging, existing hooks, linked worktrees, Windows/POSIX and
offline execution. Never test experimental hooks on the user's main worktree.
Until that implementation exists, deliver a proposal, not a claim of installation.
