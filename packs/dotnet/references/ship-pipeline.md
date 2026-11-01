# .NET gates in CI

With `nzt-ship`'s `references/pipeline.md`, which decides which gates exist. This gives their
.NET commands. **Prefer the commands the repository already runs locally** (a script, a
`Makefile`, Cake, Nuke): two definitions of one check drift.

## Rules

1. **Install the SDK `global.json` pins** (`global-json-file` with `actions/setup-dotnet`);
   without a pin, the highest `TargetFramework`'s, proposing the pin. Never raise the SDK or
   target framework to pass.
2. **The gates and what makes each one real**:

   | Gate | Command | Needs |
   |---|---|---|
   | tools | `dotnet tool restore` | `.config/dotnet-tools.json` |
   | restore | `dotnet restore --locked-mode` | `packages.lock.json` (`RestorePackagesWithLockFile`) — **without them it passes and locks nothing** |
   | format | `dotnet format --verify-no-changes --no-restore` | the `.editorconfig`, only where formatting is enforced |
   | build | `dotnet build --no-restore -c Release` | warnings as errors only if already set |
   | unit tests | `dotnet test tests/<X>.UnitTests --no-build -c Release` | the level enabled; the runner's own options |
   | integration tests | `dotnet test tests/<X>.IntegrationTests --no-build -c Release` | the level enabled; a container runtime when that level uses containers |
   | package audit | NuGet audit on restore (`NU1901`–`NU1904`) | the failing severity, agreed and set in build properties |
   | pending model changes | `dotnet ef migrations has-pending-model-changes --project <Infra> --startup-project <Api>` | EF Core |
   | artifact | `dotnet publish -c Release`, an image, a bundle | `ship-containers.md`, `ship-migrations.md` |

3. **A test step exists only for a level `tech.md` enabled** — a step for another breaks the run
   or passes over nothing and is read as proof.
4. **Audit**: .NET 10+ audits transitive packages by default; older targets need
   `NuGetAuditMode` `all`. A vulnerable package is updated as a dependency change
   (`nzt-build`'s `references/dependencies.md`), never silenced.
5. **Publish test results and failure artifacts**; never print configuration or environment dumps.
6. Cache the NuGet folder keyed by lock or project files; the run must pass cold.

## Done when

Every gate whose precondition exists runs on the pinned SDK (or the gap is proposed).
