# Agent Workflow Skills

A personal catalog of skills for coding workflows: from small checks to long-running
processes with artifacts, work resumption and human review.

**v1.5.0 · experimental · published.**
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

## Setup Design-Polish (2 Steps)

### Step 1: Install Toolkit

```bash
npm install agent-workflow-ui-kit
```

### Step 2: Install Design-Polish Skill

```bash
npx workflow-kit add design-polish
```

**What it does**:
- Copies design-polish skill files to `.claude/skills/design-polish/`
- Analyzes your project structure
- Creates `design-polish.project.json` with auto-detected paths
- Configures build commands and test scripts
- Sets up output directories

---

## Using Design-Polish

Once installed, tell your workflow system:

```
I want to implement a new checkout screen from this design file: designs/checkout-v2.html
```

**What happens**:
1. System reads the design file
2. Analyzes your current implementation
3. Asks for approval before making changes
4. Implements the design iteratively
5. Runs tests after each change
6. Shows before/after comparisons
7. Documents what was changed and what remains

---

## Command Reference

Direct CLI usage (optional):

```bash
npx workflow-kit add design-polish          # Install skill
npx workflow-kit update design-polish       # Update to latest version
npx workflow-kit doctor                     # Check health of installation
npx workflow-kit list                       # See available skills
```

## Using Design-Polish: Complete Example

Once installed, design-polish can be used to implement and polish screens. Here's how:

### Step 1: Prepare Your Input

Gather the design reference and specify scope:

```
I have a new checkout flow design in designs/checkout-v2.figma. 
The current implementation is at pages/checkout/ directory.
Please implement the new design with these constraints:
- Mobile and desktop layouts
- Support for hover and loading states
- Must preserve existing form validation
- Test with npm run test:checkout
```

### Step 2: System Analysis

The system will:
- Analyze your current implementation
- Compare against the design reference
- Check build configuration and test scripts
- Identify which components need changes
- Request approval to start work

### Step 3: Approval and Execution

After your approval, it will:
- Create reference screenshots from the design
- Build your app and capture current state
- Compare current vs. target visually
- Implement coherent changes iteratively
- Run quality verification (tests, linting, etc.)
- Document all changes with before/after comparisons

### Step 4: Review Results

You'll receive:
- Implementation status and completion percentage
- Before/after screenshots for each component
- Test results and any failures
- List of unresolved issues (if any)
- Recommendations for follow-up work

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
