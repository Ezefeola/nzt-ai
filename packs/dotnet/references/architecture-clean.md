# Clean architecture on .NET

Builds on `../nzt-backend/references/architecture-clean.md` — read it first.

## Rules

1. **Each layer is a project**, so the compiler enforces the references — the mechanism
   `tech.md` records:

   | Project | References |
   |---|---|
   | `<Component>.Domain` | nothing |
   | `<Component>.Application` | `Domain` |
   | `<Component>.Infrastructure` | `Application` |
   | `<Component>.Api` | `Application`, `Infrastructure` |

2. **`Program.cs` is the composition root** and the only file in `Api` naming an
   `Infrastructure` type.
3. **`Api/Results/`** holds a result's HTTP translation and the response filter if any — it
   depends on ASP.NET Core, so never in `Application`.
4. The transaction boundary's interface gets its folder (the `I` prefix avoids the collision);
   with direct persistence the interface over the handle is the handle's name with `I`.
5. The aggregate's mapping file is its `<Entity>MappingExtensions`.
6. **One registration file per project** with one public method (`AddApplication()`,
   `AddInfrastructure()`) and a private one per feature; `Program.cs` makes two calls. Never
   assembly scanning.

## Done when

Four projects referencing inward, `Infrastructure` named in `Api` only by `Program.cs`, and one
registration method per project.
