# Local evidence and human decisions

Paths come from the adapter. Default run root: .design-polish/. Keep all runtime
data in the consuming project, not inside this installed skill.

Each run has immutable inputs/captures, preflight.md, run.json and report.md.
Use UTC ISO times and filesystem-safe timestamp IDs. Use the bundled
[run example](../assets/run.example.json) as the required record shape; null
means unknown, not zero/success. All fields must be preserved when updating.

A signature stores sorted input and dependency paths with SHA-256 content hashes
and configuration dimensions. Include uncommitted contents and missing files.
An approval applies to that signature AND exact screenshot set. Shared tokens
invalidate dependent pages. Reconcile old evidence only with actual provenance.

Each case includes target, layout, source panel, configuration, signature,
status, captures and findings. Each finding has stable id, expected, actual,
source, status (open/closed/blocked), attempts, verification and nextFix.
Allowed case statuses: not-run/running/verified/blocked/interrupted.
Source identity is path plus panel label, not a globally unique numeric index.

Append readable ledger entries using
[review template](../assets/review-entry.md). Never overwrite previous images
or approvals. Screenshot names include run, target, layout, revision, pass,
configuration and reference/before/after/compare. Existing tooling names may be
retained if run.json records exact paths. Historical-before and current-before
must be distinguished.

Resolution percent = rounded 100 * verifiedClosed / totalIdentified, counting
unique findings per target/layout/revision. Blocked findings remain in the
denominator. Zero identified findings means null, not 100. Show fraction and
checked/planned coverage beside percentage. Changed versions require rechecking;
new findings can lower the percentage. No percentage means user approval.

The human ledger, not JSON metrics, owns reviewed and accepted checkboxes.
Only the user or their explicit scoped instruction can mark them. Viewed is not
accepted. An ambiguous OK does not approve all cases. Preserve comments verbatim.
Unknown review dates remain null; observation date may be recorded separately.
Changed evidence creates a fresh unchecked entry without clearing old history.

Catalogue entries contain source/page/layout mapping, capture route/fixture,
latest verified run, lastPolishedAt and lastSyncedAt. Update lastSyncedAt only
after checking signatures; update lastPolishedAt only after actual verified work.
Do not backfill old timestamps or approvals from vague historical claims.

A report contains metadata, coverage, fixes, open/blocking findings, not-run
cases, command/exit-code results and nextCase. Every blocker contains reproduction,
expected/actual, source, screenshots, attempts and a concrete acceptance check.
Runtime logs and private input files are not release assets.
