# Release

Produces a release **verified where it landed** — an environment, a store, a channel — its
entry in `Docs/Operations/releases.md`, and `Docs/Operations/deployment.md` kept current.

## The operating memory

`deployment.md` is to this phase what `tech.md` is to build: read it first, update it when an
environment, pipeline, artifact, migration strategy, exposure, rollback or observation changes.

```markdown
## Environments
| Environment | Who authorises | How it is exposed | Where it is observed |
|---|---|---|---|
| local | nobody — disposable | — | — |
| staging | the team | direct replacement | the platform's logs |
| production | **the user, by name** | slot swap | dashboard + error alerts |

## Thresholds
Errors above 1% over the base rate, or p95 above 800 ms, trigger rollback.
```

An environment without a named authoriser is a question. The document names; the pipeline and
platform define — no copied YAML, secrets by key. The project's thresholds win; agree them
the first time.

## Steps

1. **Authorisation names the environment.** *"Deploy"* alone is a question. A batch covers
   production only if the user named production. Local and disposable environments need no
   extra authorisation. Releasing unverified work (a staging preview) is the user's call, told
   exactly what is not verified.
2. **Declare readiness**, every point: verified and **accepted**; migrations read and
   compatible; configuration and secrets already in the destination; health and telemetry
   instrumented; rollback plan written; the user manual current for what changes, if there
   is one; an observation plan (signals, baseline, window, threshold). A missing point is a
   risk the user decides.
3. **Propose it**, readable in ten seconds:

   ```markdown
   **Release 1.4.0** (`a1b2c3d`) → production
   - Migrations: one, additive. Works with 1.3.x still running.
   - Exposure: slot swap, behind the `coupons` flag, off.
   - Observed: error rate and p95 for 30 min against today's baseline.
   - Rollback if: errors above 1% or p95 above 800 ms.
   - Smoke: E-01, E-02 from the checkout test index.
   ```

4. **Expose least first**: flag off → canary or staged rollout → blue-green or slot swap →
   direct replacement (say exposure is total and reverting means releasing again). Release
   **the artifact the pipeline built and verified**, by its immutable version.
5. **Data changes**: migrations run as their own step before the new version, never from
   each instance at startup in a shared environment; the new schema works with the running
   version; incompatible changes go **expand → migrate → contract** across releases.
   Reverting a migration can lose data: its own decision; a rollback does not imply it.
6. **Verify where it landed**: health responds, the `smoke` scenarios pass as real runs,
   errors and latency stay inside thresholds for the **whole** window, logs arrive without new
   error types. Otherwise it is *released and not verified*.
7. **Roll back** to the previous version of the same environment when a threshold breaks —
   covered by the release's authorisation; report it at once. Data excepted.
8. **Log it**, newest on top, never rewritten; a rollback gets its own entry with its cause:

   ```markdown
   ## 1.4.0 · production · 2026-09-18 · verified
   Coupons at checkout. One additive migration. Observed 30 min: errors 0.2%, p95 610 ms.
   ```

   A flag left behind is debt: plan its removal once stable.

## Done when

The user could tell from the record what is running, what it took and how to get back.
