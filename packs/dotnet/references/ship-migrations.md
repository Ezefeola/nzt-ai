# Getting migrations into an environment

With `nzt-ship`'s `references/release.md`, whose authorisation names the environment. Generating
is build work (`ef-core-migrations.md`); this is packaging and applying.

## Steps

1. **Choose the artifact** and record it in the deployment document:

   | Strategy | When | Cost |
   |---|---|---|
   | migration bundle | automated deployment | one executable built in CI, no SDK or source needed, uses EF's migration lock |
   | idempotent SQL script | a person or DBA reads or approves it | `--idempotent` applies only what is missing; not every provider supports it (SQLite does not) |
   | `dotnet ef database update` | local and disposable databases | needs SDK and source — never production |
   | `Migrate()` at startup | only if the user accepts it on a simple single-instance app | app identity with schema rights, no review — propose a separate job |

2. **Build it in CI from the application's commit, with the environment set explicitly**
   (design-time defaults to `Development`). Gate with
   `dotnet ef migrations has-pending-model-changes`, and **read the SQL of every release that
   alters or drops a column or table**.

   ```bash
   ASPNETCORE_ENVIRONMENT=Production dotnet ef migrations bundle \
     --project src/Pedidos.Infrastructure --startup-project src/Pedidos.Api \
     --self-contained --target-runtime linux-x64 --output artifacts/efbundle
   ```

3. **Apply in one job, before the new version**, once the database is healthy, never restarted
   after success — never from each replica's entrypoint, never `dotnet ef` in the app image:

   ```bash
   ASPNETCORE_ENVIRONMENT=Production ./efbundle --connection "$DEPLOYMENT_CONNECTION_STRING"
   ```

   The connection comes from the secret store — never committed, embedded or pasted into the
   conversation. **A deployment identity holds schema rights**; the runtime identity only data
   rights.
4. **Verify**: the job lists what it applied, the target's history table agrees, readiness
   passes. Keep an executed script with the release record.

## Rules

1. **The migration stays compatible with the version still running**; a breaking change goes
   expand → migrate → contract across releases.
2. **A schema rollback is its own decision**, proposed with its consequence — the release's
   rollback authorisation does not cover it. Targeting an earlier migration runs every newer
   `Down` and can lose data: prefer a forward fix, test `Down` on a copy first. `UseSeeding` runs
   after a downgrade too and must tolerate the older schema.

## Done when

The strategy is recorded, the artifact came from CI with a pending-changes gate, destructive SQL
was read, it ran once before the app with a deployment identity, and the applied migrations were
confirmed in the target.
