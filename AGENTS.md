# Workflow Kit contributor instructions

This is an independent toolkit repository, even when nested inside another
checkout. Scope work to this directory. Do not install skills, presets or hooks
into its parent application unless the user explicitly asks for that operation.

Read README.md, docs/cli.md and docs/future-work.md. Check this repository's git
root/status before editing; never stage the enclosing application's work.

Use Node 22 ESM and the built-in test runner. No runtime dependencies currently.
Write failing filesystem/process tests before CLI behavior changes. Test only
disposable consumer directories, never the actual surrounding app. Validate with
npm test, npm run check and npm pack --dry-run. No parent-app build is needed for
toolkit-only changes. Preserve preview-by-default and conflict-before-write.

Skill evaluation and CLI tests are separate evidence. Do not call agent behavior
validated because Node tests pass. Keep experimental labels until independently
tested. CLI workflow descriptors are instructions, not a running agent service.

No hook installation, package publication, Git commits or remote creation without
an explicit request. private:true and UNLICENSED are deliberate release gates.
