---
name: nzt-ship
description: Use when work leaves the working copy - commits, branches, pull requests, changelog, versioning, CI, releasing or deploying to an environment, store or channel, monitoring a release, rolling back.
---

# Ship — getting it out

Moves work from the working copy to where other people see it: a repository, an environment,
a store, a publishing channel. Everything here is harder to undo, so it asks first. **A
release is finished when it is verified where it landed, not when the command returns.**

**Owns** version control actions, changelog and versioning, CI, releases, rollback, and the
instrumentation that makes a release observable. **Does not own** the work (`nzt-build`) or
its evidence (`nzt-verify`); ship never fixes what verification found.

## References

| The unit is | Read |
|---|---|
| Commits, branches, pull requests, changelog, tags | `references/vcs.md` |
| Releasing or deploying to an environment, or rolling back | `references/release.md` |
| The CI pipeline and its gates | `references/pipeline.md` |
| Health checks, logs, metrics and alerts for a release | `references/observability.md` |

## Steps

1. Read `Docs/Operations/deployment.md` and the repository's own rules (contribution guide,
   commit convention, branch naming, hooks, required checks). **Repository rules win.**
2. Load the pack skills `tech.md` lists for the component: they add how this technology
   ships (containers, migrations, its pipeline).
3. **The authorisation names the environment.** Nothing touches a shared environment without
   it (`release.md`).
4. Do one release-facing action — one pull request, pipeline change, release or rollback.
5. Verify it where it landed, and say plainly what left and where.

## Where it lands

- Environments with their authoriser, pipeline, artifacts, migration strategy, exposure,
  rollback thresholds, where it is observed, secrets by key name →
  `Docs/Operations/deployment.md`, mandatory from the first release to a shared environment.
- One append-only entry per release and rollback, newest on top → `Docs/Operations/releases.md`.
- Pipeline definitions → where the provider requires them.

## Rules

- **Never skip hooks, checks or signing** to make something pass.
- **Secrets by key name, never value**, anywhere.

## Done when

The action is verified where it landed — the release observed for its window against its
thresholds, the pipeline run, the instrumentation seen arriving. What was only written is
reported as **not verified**.
