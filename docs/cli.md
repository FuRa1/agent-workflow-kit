# CLI MVP

Run from this repository using Node 22+; no npm install is needed:

```text
node bin/workflow-kit.mjs --help
node bin/workflow-kit.mjs list
node bin/workflow-kit.mjs workflow design-implementation
node bin/workflow-kit.mjs init quick-mvp --project <target> --host both
node bin/workflow-kit.mjs init quick-mvp --project <target> --host both --apply
node bin/workflow-kit.mjs add commit-hook --project <target> --apply
node bin/workflow-kit.mjs doctor --project <target> --json
node bin/workflow-kit.mjs update --project <target> --dry-run
```

Replace target with an existing project directory. Without --project the working
directory is used. An init preview does not write anything. --apply authorizes
the displayed operation's writes; agents still ask before invoking it for users.
--apply and --dry-run together are rejected. There is no --force override.
Output is JSON (except help/version); --json is accepted for explicit intent.
Exit 0 means the operation/inspection succeeded; 1 means error or conflict.

## Installed files

- .agents/skills/ for Codex, .claude/skills/ for Claude, both for --host both.
  Default host is codex. Each receives complete independent skill folders.
- .workflow-kit/project.json: editable preset/host/skills/packageManager and
  verifyScripts. Unknown custom fields are preserved.
- .workflow-kit/POLICY.md: managed preset guidance read by installed skills.
- .workflow-kit/lock.json: package version and installed file SHA-256 hashes.
- .workflow-kit/.gitignore: ignores the short-lived installer guard.
- design-polish.project.json: editable template created only if missing.

No modification of AGENTS.md, CLAUDE.md, package.json, dependencies, CI or hooks.
Detection reads package scripts and package-manager metadata; it never executes
them. The design adapter needs reference/capture/state configuration by an agent
or developer before actual UI work. Skills are not automatically run by init.

## Ownership and updates

Preview reports create/update/unchanged/conflict. Any conflict aborts before
planned file writes. Managed files update only if their current hash matches
the recorded hash. Identical pre-existing files can be adopted without rewriting
them. Custom config and the design adapter are not replaced by bundle updates.

update compares against the currently executing package's bundled version; it
does not fetch npm or GitHub. Change the locally installed package first when
using a newer release. Removed skills/files are not deleted automatically.
Preset/host migration and uninstall are not implemented. Do not change those
settings expecting cleanup; old files remain. Added files are not an archive of
user approvals or generated screenshots.

An exclusive install.guard prevents concurrent cooperative installers; symlinked
destination components are rejected. This is not a security sandbox against
malicious concurrent filesystem mutation. Writes are not a multi-file transaction.
If the process crashes, inspect installed files and guard ownership; do not
blindly remove a live guard. Partial installations may require manual reconciliation.
Never delete user files to clear an update conflict.

## Doctor boundaries

doctor checks config, recorded installed hashes and existence of named package
scripts. It never runs tests, validates their quality, launches a browser, checks
a design against pixels or guarantees host skill discovery. Warnings distinguish
incomplete project adapters from broken installation. Non-Node projects work as
skill installations, but command auto-detection is currently package.json-only.

## Local package

```text
npm pack --dry-run
npm pack
```

The package includes its skill resources and docs, with no runtime dependencies.
Name is provisional; availability/ownership on npm has not been checked.
private:true deliberately blocks publication until license and release checks
are settled. Do not use an npm package of the same name assuming it is this code.
