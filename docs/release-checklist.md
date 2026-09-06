# First Commit and Publication

## Before Public Release

- [ ] Choose a GitHub repository name and owner.
- [ ] Select a license and add LICENSE with proper attribution.
- [ ] Check all staged diffs for private data.
- [ ] Verify clean installation of the entire skill folder.
- [ ] Run tests/design-polish.scenarios.md with independent verification.
- [ ] Record date, environment, result and limitations for each test.
- [ ] Verify README links and commands for your environment.
- [ ] Keep status as experimental until sufficient results are obtained.

## Local Git

The folder can be located inside another project, so before the first git add
make sure that git rev-parse --show-toplevel points exactly to the root of this
starter. In the current Perudo it is excluded from the parent Git.

If you move the folder elsewhere without .git, run git init -b main there.
Then manually verify git status --short and git diff --cached before committing.
Recommended first commit message: feat: initialize workflow skills catalog.
Remote and push are configured by the owner separately; they are not executed by the scaffold.
