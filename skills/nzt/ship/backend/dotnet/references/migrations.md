---
name: nzt-ship-backend-dotnet-migrations
description: Use when EF Core migrations have to reach a deployed environment - which artifact, built in CI from the same commit, applied once before the new version with a deployment identity.
---

# Getting migrations into an environment

**Generating a migration is build work** (`nzt-build-backend-dotnet-ef-core-migrations`), which
already separates generating from applying. This is what happens after: turning migrations into
a deployment artifact and applying it to an environment, **under the authorisation rules of the
release** — the one that names the environment.

Load `nzt-ship-backend-dotnet` and `nzt-ship-release` before applying this.

## Choose the artifact

| Strategy | Use it when | What it costs |
|---|---|---|
| **Migration bundle** | the deployment is automated | one executable built in CI; runs without the SDK, the EF tools or the source, and uses EF's migration lock |
| **Idempotent SQL script** | a person or a DBA has to read or approve the SQL, or it runs through a database tool | `--idempotent` applies only what is missing; **not supported by every provider**, SQLite included |
| `dotnet ef database update` | local development and disposable test databases | needs the SDK and the source — **never the production path** |
| `Migrate()` at startup | only if the user accepts its trade-offs on a simple, single-instance app | the app identity needs schema permissions and there is no review step; **propose a separate job instead** |

**The adopted strategy is recorded in the deployment document.**

## Build it in CI

Generate the artifact in the pipeline, **from the same commit as the application artifact**, and
**set the environment explicitly**: design-time tooling defaults to `Development` and will
happily load development configuration.

```bash
ASPNETCORE_ENVIRONMENT=Production dotnet ef migrations bundle \
  --project src/Pedidos.Infrastructure --startup-project src/Pedidos.Api \
  --self-contained --target-runtime linux-x64 --output artifacts/efbundle

dotnet ef migrations script --idempotent \
  --project src/Pedidos.Infrastructure --startup-project src/Pedidos.Api \
  --output artifacts/migrations.sql
```

**Gate the model with `dotnet ef migrations has-pending-model-changes`** before any environment,
and **read the generated SQL of every release that alters or drops a column or a table**: a
rename can come out as drop and add, and that is data gone on the day it runs.

## Apply it

- **One job, before the new application version**, once the database is healthy. **The platform
  must not restart the job after it succeeded.**
- **Never from the entrypoint of every replica**, and **never install the SDK or run `dotnet ef`
  in the application image.**
- The connection comes from the deployment system's **secret store**, passed with `--connection`
  or configuration — never committed, never embedded in the bundle, **never pasted into the
  conversation**.
- **Use a deployment identity with schema permissions.** The application's runtime identity keeps
  only the data permissions it needs: an app that can drop a table will, eventually.
- **The migration stays compatible with the application version still running**, so the code can
  roll back on its own. A breaking change goes expand → migrate → contract across releases.

```bash
ASPNETCORE_ENVIRONMENT=Production ./efbundle --connection "$DEPLOYMENT_CONNECTION_STRING"
```

## Rolling the schema back

A bundle or `database update` can target an earlier migration, running the `Down` of every newer
one; a script can be generated from a newer migration to an older one. **Both can lose data.**

**A schema rollback is its own decision, proposed with its consequence** — the release's own
rollback authorisation does not cover it. Prefer a forward fix, and **test the `Down` path on a
copy before relying on it**. Seeding configured with `UseSeeding` runs after a downgrade too, and
has to tolerate the older schema.

## Verify

Check that the job's output lists the migrations applied, query the migrations history table of
the target, and run the application's readiness check against it. For a script, **keep the
executed file with the release record.**

## Closing checklist

- [ ] The strategy fits the environment and is written in the deployment document.
- [ ] The artifact was built in CI, from the application's commit, with an explicit environment
      and a pending-changes gate.
- [ ] Destructive SQL was read before it reached any environment.
- [ ] It ran once, before the app, with a deployment identity and a connection from the secret
      store.
- [ ] The running version stays compatible, and no schema rollback was assumed safe.
- [ ] The applied migrations were confirmed in the target, and the evidence kept with the release.
