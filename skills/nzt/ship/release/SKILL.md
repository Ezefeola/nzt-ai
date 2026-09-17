---
name: nzt-ship-release
description: Use when something is deployed or rolled back: the authorisation that names the environment, the readiness list, limited exposure, and verification there.
---

# Release

Produces a deployment that is **verified in its environment**, its entry in
`Docs/releases.md`, and `Docs/deployment.md` kept current.

**A deployment ends when it is verified in its environment, not when the command returns.**
Everything below follows from that sentence.

If you did not arrive here from `nzt-ship`, load it first.

## The operating memory

`Docs/deployment.md` is to this phase what the stack document is to build: read it before
any work here, and maintain it when an environment, the pipeline, the artifact, the
migration strategy, the way of exposing or reverting, or where things are observed changes.

```markdown
## Environments
| Environment | Who authorises | How it is exposed | Where it is observed |
|---|---|---|---|
| local | nobody — it is disposable | — | — |
| staging | the team | direct replacement | the platform's logs |
| production | **the user, by name** | slot swap | dashboard + error alerts |

## Thresholds
Errors above 1% over the base rate, or p95 above 800 ms, trigger rollback.
```

- **An environment with no named authoriser is a question**, not a default.
- The document **names**; the pipeline and the platform define. Do not copy YAML or
  infrastructure into it, and **name secrets by key, never by value**, whatever the
  repository's visibility.
- **The project's thresholds win** over any reference value a skill brings. Agree them with
  the user the first time they are written.

## Authorisation names the environment

- *"Deploy"* with no environment **is a question, not a permission**.
- A batch authorisation covers production **only if the user named production in it**.
  *"Run the whole plan without stopping"* does not.
- **Local and disposable environments need no extra authorisation** beyond the plan.
  Otherwise every container start becomes a stop.
- Deploying unverified work is not proposed as routine. If the user wants it anyway — a
  preview in staging — **say exactly what is not verified**, and let them decide.

## Readiness, before proposing

Each point declared, not assumed:

- Verified by tests, and **accepted** by the user.
- Migrations read, and their compatibility understood.
- **Configuration and secrets already present in the destination**, before the code that
  reads them.
- Health checks and telemetry already instrumented.
- **Rollback plan written.**
- **The user's manual current for what this release changes**, if the product has one. It
  reaches the person before the feature does, and a manual describing the previous version
  generates the support call the manual existed to prevent.
- **Observation plan**: which signals, against which baseline, for how long, with which
  threshold.

**A missing point is reported as a risk for the user to decide — never skipped quietly.**

## The proposal

Short, fixed, readable in ten seconds:

```markdown
**Release 1.4.0** (`a1b2c3d`) → production
- Migrations: one, additive. Works with 1.3.x still running.
- Exposure: slot swap, behind the `coupons` flag, off.
- Observed: error rate and p95 for 30 min against today's baseline.
- Rollback if: errors above 1% or p95 above 800 ms.
- Smoke: E-01, E-02 from the checkout test index.
```

## Exposure, least first

1. **Feature flag, off.** Deploy and enable separately.
2. **Canary or staged rollout.**
3. **Blue-green or slot swap.**
4. **Direct replacement** — and when it is this one, **say that exposure is total and that
   reverting means deploying again.**

Deploy **the artifact the pipeline built and verified**, by its immutable version.
Rebuilding for production produces something nobody tested.

## The database is where rollback breaks

- **Migrations run as their own step, before the new code**, and never from each
  application instance at startup in a shared environment.
- **The new schema has to work with the version that is running**, so code can go back
  without touching data.
- An incompatible change is split across releases — **expand → migrate → contract**: add the
  new shape, write to both and read from the new, backfill, and only in a later release
  remove the old one.
- **Reverting a migration can lose data.** That is its own decision, with its consequence
  stated. **A code rollback does not imply it.**

## Verify in the environment

- Health responds.
- The `smoke` scenarios from the test index pass, **run as application tests**, not assumed.
- Errors and latency stay inside the threshold for the **whole** observation window, not
  just at the first minute.
- Logs arrive, with no new error types.

*"Deployed"* without this is reported as **deployed and not verified**.

## Rolling back

Returning to the previous version of the same environment is **part of the deployment's
authorisation**: do it, then report it immediately. It is not a new question.

The database is the exception and needs its own decision.

## The log

`Docs/releases.md` is a log, not a spec: **new entries go on top, nothing is rewritten**,
and it carries no `update-when`. A rollback gets its own entry with its cause.

```markdown
## 1.4.0 · production · 2026-09-18 · verified
Coupons at checkout. One additive migration. Observed 30 min: errors 0.2%, p95 610 ms.
```

A forgotten feature flag is technical debt: plan its removal once the release is stable.

## Done when

Rehearse it: could the user tell, from the record alone, what is running, what it took, and
how to get back?

- The authorisation named this environment.
- Every readiness point is declared, and the missing ones were decided by the user.
- The artifact deployed is the one that was built and verified.
- Verification ran in the environment, for the whole window.
- `Docs/releases.md` has its entry, and `Docs/deployment.md` matches what was actually done.
