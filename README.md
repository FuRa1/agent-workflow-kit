# Agent Workflow Skills

A personal catalog of skills for coding workflows: from small checks to long-running
processes with artifacts, work resumption and human review.

**MVP 1.0.0 · experimental · published.**
Working dependency-free CLI and four skills. This is a standalone toolkit:
nothing is installed to your application just from its presence in the folder.

## Catalog

| Skill | Category | Complexity | Status | User Deliverable |
| --- | --- | --- | --- | --- |
| [design-polish](skills/design-polish/SKILL.md) | Design-led implementation | Advanced, stateful workflow | Experimental | Implemented/polished screen, comparisons, journal and remaining issues list |
| [project-bootstrap](skills/project-bootstrap/SKILL.md) | Project setup | Workflow | Experimental | Project analysis, preset and installation plan |
| [skill-author](skills/skill-author/SKILL.md) | Authoring | Workflow | Experimental | New skill, boundaries and verification scenarios |
| [commit-hook](skills/commit-hook/SKILL.md) | Developer tooling | Planning workflow | Experimental | Hook proposals; actual installation not yet implemented |

Machine-readable catalog: [catalog.json](catalog.json).
Classification and repository comparison: [docs/repository-analysis.md](docs/repository-analysis.md).

## Quick Start

### CLI: Preview First

Node 22+, no dependency installation. From this starter's root:

```text
node bin/workflow-kit.mjs init quick-mvp --project <project-folder> --host both
node bin/workflow-kit.mjs init enterprise --project <project-folder> --host both
```

These are alternative presets, not sequential steps. After reviewing the plan
repeat your chosen command with `--apply`. No records by default.

```text
node bin/workflow-kit.mjs doctor --project <project-folder>
node bin/workflow-kit.mjs add commit-hook --project <project-folder> --apply
node bin/workflow-kit.mjs update --project <project-folder> --dry-run
node bin/workflow-kit.mjs list
node bin/workflow-kit.mjs workflow design-implementation
```

`workflow` displays the contract, it doesn't run anything. `add commit-hook`
installs instructions, **not a Git hook**. Full [CLI contract](docs/cli.md).

### Installation for Any Workflow System

The skills in this toolkit are designed to work with any AI system. To install a skill:

1. **Copy the skill folder** to your system's skills directory:
   ```text
   cp -r skills/design-polish your-system/skills/
   ```
   Ensure you copy the **entire** folder including `SKILL.md`, references, and assets.

2. **Configure your project** by creating a configuration file based on the
   [template](skills/design-polish/assets/project.example.json):
   - Copy the example to your project root
   - Update paths, commands and settings for your environment
   - Null and empty arrays mean "not configured"

3. **Invoke the skill** through your workflow system:
   - Provide the SKILL.md file path to your system
   - Pass your design files, screenshots or specifications
   - Your system will analyze requirements and ask for approval

4. **Execution flow**:
   - System performs initial analysis and requests confirmation
   - After approval, executes configured passes
   - Results are saved to the configured output directory

## Supported References and Input Formats

The design-polish skill accepts various input formats for design references:

- **Design HTML exports** (`.html` files) - Full web page designs
- **Screenshot images** (`.png`, `.jpg`) - Static screenshots of UI elements  
- **Figma design files** (`.fig` or exported assets) - Vector design files
- **Design system files** (`.dcx`, `.dc.html` or exported content) - Design system formats
- **Design documentation** (`.md`, `.txt`) - Text-based design specifications
- **HTML files with embedded designs** - Self-contained design documents

Example messages (these are not shell commands):

```text
/design-polish designs/mobile.dc.html minutes=60 runs=5
$design-polish designs/updated-screen.png pages=checkout
Use design-polish: implement the selected page from the attached design.
```

Gallery-target names are configured by the project. For example, `circular` might select
a circular layout; this is **not** a loop toggle. Iterations are enabled by default;
`runs=1` explicitly limits the task to a single pass.

## Parameters and Options

The workflow supports various parameters for customization:

- `minutes=N` - Set maximum runtime in minutes (default: 60)
- `runs=N` - Set number of passes (default: 5 varied passes)  
- `pages=page1,page2` - Specify which pages to process
- `layout=desktop|mobile|tablet` - Target layout dimensions
- `states=hover,focus` - Interaction states to test

## What design-polish Does

- Accepts design, updated images and text requirements.
- Selects the needed panel from multi-page exports.
- Distinguishes polish, recompose and implementation on existing scaffold.
- Verifies hashes of design, code, shared tokens and capture configuration.
- Shows previous screenshots and approvals before re-running.
- Captures actual reference/before/after, documents unresolved points.
- Saves "viewed" and "approved" separately.

Percentage = share of verified-closed identified discrepancies, **not pixel similarity**.
Configuration coverage is shown separately. Historical images don't prove
current application state.

## Requirements and Boundaries

Requires workflow with file access, editing, shell and real browser
rendering/image viewing. The skill doesn't include a browser engine, scheduler,
its own server, project dependencies or mandatory plugin subscription.
It uses the target project's tools. Unavailable checks become
blockers, not fake success. After session close, work is not guaranteed.

Without explicit request: no commit/push/deploy, no product rule changes,
no benchmark modifications for comparison or user material publication.

## Structure

```text
bin/                         # npm executable
lib/                         # planner, installer, doctor
presets/                     # quick-mvp, enterprise
workflows/                   # stage contracts for workflow
scripts/check.mjs            # structure, links, syntax
skills/project-bootstrap/
skills/skill-author/
skills/commit-hook/
skills/design-polish/
  SKILL.md
  references/workflow.md
  references/records.md
  assets/project.example.json
  assets/run.example.json
  assets/review-entry.md
docs/
  repository-analysis.md
  release-checklist.md
examples/perudo.project.json
tests/design-polish.scenarios.md
catalog.json
CONTRIBUTING.md
SECURITY.md
LICENSE-DECISION.md
```

## Verification and Publication

```text
npm test
npm run check
npm pack --dry-run
```

CLI integration tests create temporary consumer projects and clean up only
their fixtures. They don't apply settings to the actual project. Next steps plan:
[future-work.md](docs/future-work.md). package.json is currently `private: true`.

First run through the [scenarios](tests/design-polish.scenarios.md) on a temporary
test project. Portability and behavioral reliability don't follow from
correct JSON. CLI and fault-injection tests are verified, structure/syntax/links and execution
from npm archive in a separate temporary consumer project. Independent behavioral
scenarios are not yet executed; for setup-skills they are listed
[separately](tests/setup-skills.scenarios.md).

[First commit and release checklist](docs/release-checklist.md).
License not yet selected: [LICENSE-DECISION.md](LICENSE-DECISION.md).
Repository cannot yet be advertised as a licensed open-source package.

## Updating the Workflow Kit

To update your workflow kit installation to the latest version:

1. **Check for available updates**:
   ```bash
   workflow-kit update --check
   ```

2. **Update specific skills**:
   ```bash
   # Update design-polish skill only
   workflow-kit update design-polish
   
   # Update all currently installed skills
   workflow-kit update --all
   ```

3. **Preview changes before applying**:
   ```bash
   workflow-kit update --dry-run
   ```

The update mechanism automatically handles:
- Version compatibility checking
- Package dependency change detection
- Conflict resolution between user modifications and bundled files
- Migration guidance for breaking changes
- Rollback support for failed updates

Note: The `--all` flag only updates skills that are already installed and used in your project. It will not install new skills that aren't currently configured.
