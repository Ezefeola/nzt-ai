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

**The authorisation names the environment**: nothing in this phase touches a shared
environment without it. What it covers — production in a batch, local environments, rollback
and the database — is `references/release.md`'s.

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

Each reference holds the rules of its own work. These hold for every unit of the phase:

- **Never skip hooks, checks or signing to make something pass.** A failing gate is
  information; suppressing it throws that information away.
- **Secrets appear by key name, never by value** — in a diff, a log, a screenshot or a
  document, whatever the repository's visibility.
- **Say plainly what left and where**: what was committed, published or deployed, and what
  changed for users.

## Done when

The unit's reference says its own *Done when*, and it holds: the action is verified where it
landed — the deploy observed for its whole window against its thresholds, the pipeline run,
the instrumentation seen arriving. What only got written is reported as **not verified**.
