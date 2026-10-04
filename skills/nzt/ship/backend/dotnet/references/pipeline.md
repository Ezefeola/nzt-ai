---
name: nzt-ship-backend-dotnet-pipeline
description: Use when writing or repairing the CI gates of a .NET solution - the command each gate runs, what it needs to mean anything, and the gates that pass silently without their precondition.
---

# .NET gates in CI

`nzt-ship-pipeline` decides **which gates exist and what they mean**. This gives the .NET
commands and what each one needs to actually be a gate.

**Prefer the commands the repository already runs locally** — a script, a `Makefile`, a Cake or
Nuke build — over retyping them in CI. Two definitions of the same check drift, and the one in
CI is the one nobody runs before pushing.

Load `nzt-ship-backend-dotnet` and `nzt-ship-pipeline` before applying this.

## The SDK

Install the one pinned in `global.json`; with `actions/setup-dotnet` that is `global-json-file`.
Without a pin, install the version matching the highest `TargetFramework` **and propose pinning
it**. **The SDK and the target framework are never raised to make CI pass** — that is a stack
change, not a fix.

## The gates

| Gate | Command | What it needs to mean anything |
|---|---|---|
| tools | `dotnet tool restore` | a `.config/dotnet-tools.json` manifest for `dotnet-ef` and the rest |
| restore | `dotnet restore --locked-mode` | `packages.lock.json` files, from `RestorePackagesWithLockFile`. **Without them the command still succeeds and locks nothing** — check the files exist, or propose them |
| format | `dotnet format --verify-no-changes --no-restore` | the repository's `.editorconfig`, and only where the project already enforces formatting |
| build | `dotnet build --no-restore -c Release` | warnings as errors only if the project already sets it |
| unit tests | `dotnet test tests/<X>.UnitTests --no-build -c Release` | the level enabled in `Test levels`, and the runner options of the framework in use — the two runners do not take the same arguments |
| integration tests | `dotnet test tests/<X>.IntegrationTests --no-build -c Release` | the level enabled in `Test levels`, plus a container runtime on the runner where that level is containers |
| package audit | NuGet audit during restore, `NU1901`–`NU1904` | the severity that fails the run, set in the build properties and agreed with the user |
| pending model changes | `dotnet ef migrations has-pending-model-changes --project <Infra> --startup-project <Api>` | EF Core; it fails when the model changed and no migration was generated |
| artifact | `dotnet publish -c Release`, a container image, a migration bundle | the container and migration skills of this area |

**The restore row is the one that lies most often**: a locked-mode restore with no lock files is
a gate that always passes. Check, or propose the files.

**A test gate exists for a level the component enabled, and only then.** The `Test levels`
opt-in of its stack says which. A step written for a level nobody adopted either breaks the run
for a project that does not exist, or — worse — passes over an empty one and is read for months
as proof that something was tested. Installing a container runtime on the runner for a suite
that was never enabled is the same mistake, paid for on every run.

NuGet audit runs as part of restore. Projects on .NET 10 or later audit transitive packages by
default; older targets audit direct references unless `NuGetAuditMode` is `all`. **A vulnerable
package found by the gate is updated as a dependency change** (`nzt-build-dependencies`), never
silenced.

## Results and caching

- **Publish test results and failure artifacts** — logs, screenshots of end-to-end runs — so a
  failure can be read without running it again.
- **Never print configuration or environment dumps**: that is how a secret ends up in a public
  log.
- Cache the NuGet global packages folder keyed by the lock or project files. **A cache is an
  optimisation: the run must still pass with it cold.**

## Closing checklist

- [ ] The pinned SDK is installed, and nothing was upgraded to get a pass.
- [ ] Every gate's precondition exists — or the gap is reported and proposed, not papered over.
- [ ] There is a test step for each level the stack enabled, none for a level it did not, and
      the enabled ones are separate steps reporting their real results.
- [ ] Package audit and pending model changes fail the run where they were adopted.
- [ ] Results and failure artifacts are published, with no configuration dump.
- [ ] The pipeline runs the same commands the repository runs locally.
