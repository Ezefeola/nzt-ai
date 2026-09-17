---
name: nzt-ship-backend-dotnet
description: Use when the component being shipped is .NET, before packaging it, changing its CI gates, applying its migrations or instrumenting it: the table that turns the release-facing unit into the one skill to load.
---

# Shipping a .NET backend — selection by unit

This router loads nothing by itself. It turns the release-facing unit into **the one skill**
that unit needs, on top of the generic practice it belongs to.

If you did not arrive here from `nzt-ship`, load it first.

## Read the project first

- **An installed folder is not an authorisation.** This tree is installed in every project. What
  makes it apply is the component's stack document, and nothing else.
- **The SDK is the one the repository pins** in `global.json`. Without a pin, the version
  matching the highest `TargetFramework` — and proposing the pin is part of the unit.
- **Nothing is upgraded to make something pass.** Raising the SDK, the target framework or a
  package version to get a green run is a stack change, and it goes through the stack door with
  the user.
- **Version-dependent behaviour is read from the project**, not from an example here: the
  manifest, `global.json`, the lock files, the pipeline that already runs.

## Choose the skill

| The unit is | Load, with | And |
|---|---|---|
| Packaging the component as a container image | `nzt-ship-release` | `nzt-ship-backend-dotnet-containers` |
| Getting migrations into an environment | `nzt-ship-release` | `nzt-ship-backend-dotnet-migrations` |
| Writing or repairing the CI gates | `nzt-ship-pipeline` | `nzt-ship-backend-dotnet-pipeline` |
| Health checks, telemetry, structured logging | `nzt-ship-observability` | `nzt-ship-backend-dotnet-observability` |

**Reuse what is already loaded**, and load only the row the unit is. A deployment that also
carries a schema change is two rows, and that is the one combination that happens often.

## What this area never decides

- **Whether to deploy, and where.** The authorisation names the environment, and that rule lives
  in `nzt-ship`. Nothing here creates permission to touch an environment.
- **Whether a migration exists.** Generating one is build work
  (`nzt-build-backend-dotnet-ef-core-migrations`); this area only packages and applies what is
  already in the repository.
- **What the pipeline's gates are.** `nzt-ship-pipeline` decides that; these skills give the
  .NET commands and what each one needs to work.

## Closing checklist

- [ ] The row loaded matches the unit, together with its generic practice.
- [ ] The SDK used is the pinned one, and nothing was upgraded to get a pass.
- [ ] The stack or deployment document was updated in this unit if what it declares changed.
