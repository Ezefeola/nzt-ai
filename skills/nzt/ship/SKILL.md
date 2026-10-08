---
name: nzt-ship
description: Use when work leaves the working copy: commits, branches, pull requests, changelog, versioning, CI, deploying, observability for a release, or rolling back.
---

# Ship — getting it out

This phase moves work out of the working copy into somewhere other people see it.
Everything here is harder to undo than what came before, so it asks before it acts.

**A deployment is finished when it is verified in its environment, not when the command
returns.** That sentence orders the whole phase.

## Boundaries

**Owns:** version control actions, changelog and versioning, CI pipelines, deployment,
rollback, and the instrumentation that makes a release observable.

**Does not own:** the code (`nzt-build`) or the evidence it works (`nzt-verify`). Ship does
not fix what verification found.

## Required guidance

Before any work in this phase, read `Docs/Operations/deployment.md` — it is this phase's operative
memory — and the repository's own rules: contribution guide, commit convention, branch
naming, hooks, required checks. **Repository rules win over this skill.** Reuse what is
already loaded; the tables below do not mean load every row.

## Authorisation

- **The authorisation names the environment.** *"Deploy it"* with no environment is a
  question, not a permission. A batch authorisation covers production **only if the user
  named production in it**: *"run the whole plan"* does not include it.
- **Local and disposable environments need no authorisation beyond the plan.** Otherwise
  every `docker compose up` becomes a stop.
- `Docs/Operations/deployment.md` names **who authorises each environment**, in a column. An
  environment with no named authoriser is a question.
- Deploying unverified work is not proposed as routine. If the user wants it anyway — a
  staging preview, say — **say exactly what is not verified**.
- A rollback to the previous version of the same environment is already covered by the
  deployment's authorisation and is reported as it happens. **The database is the
  exception** and needs its own decision.

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The unit is | Read | Read with |
|---|---|---|
| Commits, branches, pull requests, changelog, tags | `references/vcs.md` | — |
| Deploying to an environment, or rolling back | `references/release.md` | — |
| CI pipeline and its gates | `references/pipeline.md` | — |
| Health checks, logs, metrics, traces and alerts for the release | `references/observability.md` | — |

Wherever a file names `nzt-ship-<name>`, it means `references/<name>.md` in this folder
(`nzt-ship-release` → `references/release.md`): read that file — it is not a skill.
`nzt-ship-backend-dotnet` is the exception: it is a skill, the area router below.

If the component's stack selected one of these areas, load its area router as well — it
adds the technology's reference on top of the row above:

| The area is | Load |
|---|---|
| Backend on .NET | `nzt-ship-backend-dotnet` |

An installed folder is not an authorisation: a technology the stack did not select is never
loaded.

## One unit

One release-facing action: one pull request, one pipeline change, one deployment, one
rollback. Never a chain of them.

## Where it lands

- Environments with their authoriser, pipeline, artifacts, migration strategy, exposure,
  rollback with its agreed thresholds, where it is observed, and secrets **by key name** →
  `Docs/Operations/deployment.md`, mandatory from the first deploy to a shared environment.
- One append-only entry per deploy and per rollback, newest on top → `Docs/Operations/releases.md`
- Pipeline definitions → wherever the provider requires them in this repository

## Rules

- **Readiness is declared before proposing a release**: verified, accepted, migrations
  read, configuration and secrets already present in the destination **before the code that
  reads them**, health checks and telemetry instrumented beforehand, rollback plan written,
  and observation plan (which signals, against which baseline, for how long, at what
  threshold). **A missing point is reported as a risk the user decides on, never skipped in
  silence.**
- **Limit the exposure**, in order of preference: feature flag off → canary or staged
  rollout → blue-green or slot swap → direct replacement. If it is direct replacement, say
  that exposure is total and that reverting means deploying again.
- **Deploy the artifact the pipeline built and verified, by its immutable version.**
  Rebuilding for production produces something nobody tested.
- **Migrations run as their own step, before the new code**, never from each application
  instance at startup in a shared environment. The new schema has to work with the version
  currently running; an incompatible change is split expand → migrate → contract across
  releases. **Reverting a migration can lose data**: a database rollback is its own decision
  with its consequence stated, and a code rollback does not imply it.
- **Verify in the environment**: health responds, the `smoke` scenarios from the test index
  pass run as application tests, errors and latency stay inside the threshold for the whole
  window, and logs arrive with no new error types. *"Deployed"* without this is reported as
  deployed and **not verified**.
- **The project's thresholds win** over any reference value a skill brings.
- **The document names; the pipeline and the platform define.** Do not copy YAML or
  infrastructure into a document: name the file and say what it decides. Secrets appear by
  key name, never by value, whatever the repository's visibility.
- Never skip hooks, checks or signing to make something pass. A failing gate is
  information; suppressing it throws that information away.
- Commit only what the requested work touched; mention the rest and leave it out. Review
  the diff for secrets, local configuration and generated files. **A secret that reached a
  commit is reported as exposed even if a later commit removes it.**
- **Published history is not rewritten**: no force-push, rebase or amend over what others
  may have pulled, unless the user asked for that exact operation. Prefer a reverting commit.
- A forgotten feature flag is technical debt; plan its removal once the release settles.

## Done when

The action is verified where it landed: the deploy observed for its whole window against
its thresholds, the pipeline run — a gate proven by making it fail on purpose, on a
throwaway branch — the instrumentation seen arriving. What only got written is reported as
**not verified**, and `Docs/Operations/releases.md` has its entry.

## Closing checklist

- [ ] The authorisation named this environment.
- [ ] Readiness declared point by point, with every gap reported as a risk.
- [ ] Rollback plan written before going out, with its thresholds.
- [ ] Verified in the environment, for the whole observation window.
- [ ] `Docs/Operations/deployment.md` current; `Docs/Operations/releases.md` has this entry.
- [ ] No secret in a diff, a log, a screenshot or a document — only key names.
- [ ] What was deployed, where, and what changed for users, said plainly.
