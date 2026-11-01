# Hexagonal architecture on .NET

Builds on `../nzt-backend/references/architecture-hexagonal.md` — read it first.

## Rules

1. **Each unit is a project**: `Core`, one `Adapter.<Motive>` per adapter, `CompositionRoot`,
   `Adapter.Api`. No adapter's `.csproj` names another, so the compiler enforces it.
2. **`Adapter.Api` holds `Program.cs`**, the only executable, and `Results/` with a result's
   HTTP translation and the response filter if any.
3. The aggregate's mapping file is its `<Entity>MappingExtensions`.
4. **Registration**: each adapter exposes one public `AddAdapter<Motive>`, `Core` exposes
   `AddCore()` with a private method per feature, `CompositionRoot`'s one method calls
   `AddCore()` then every adapter's, and `Program.cs` calls that plus what is purely HTTP. Never
   assembly scanning.

## Done when

`Program.cs` lives only in `Adapter.Api` and names no adapter type, and every project registers
itself through one public method.
