# Continuous integration

Produces the pipeline and its gates: where the method is enforced on every change. **A gate
that can be skipped is a suggestion; one that passes without checking anything is worse than
none.**

## The gates, in order

| Gate | Proves |
|---|---|
| Restore with locked dependencies | the versions the project pinned |
| Format and lint | the diff is about the change |
| Build in release configuration | it builds the way it ships |
| Tests **at the levels `tech.md` enables** | the rules behave, the parts agree |
| Technology checks (from the packs) | e.g. model changes have their migration |
| End-to-end regression, **if `tech.md` names a tool** | approved scenarios still pass |
| Versioned artifact, **built once** | what ships is what was verified |

A test gate exists only for an enabled level. Build once and promote the same artifact,
tagged with the commit SHA and the release version. Every gate runs locally with the
project's own commands.

## Hardening

Minimum declared permissions, widened per job. Third-party actions pinned to the full SHA
(resolved from the real release, never invented) with the version as comment. Federated
identity over long-lived keys. Never interpolate untrusted input (titles, branch names,
messages) into a script. Fork pull requests get no secrets or write permissions.

## Speed

Past ten minutes people route around it: cache, parallelise, skip by changed paths, shard,
move slow suites to a schedule — keeping the fast gates on every change.

## Verify by running it

A pipeline only written is not verified. A new gate is proved by making it fail on purpose on
a throwaway branch. A failure is diagnosed (product, test, environment, pipeline) before it
is fixed; disabling a gate is never a repair and never silent.

## Done when

A change that violates the method would be stopped by it, and the whole pipeline was run.
