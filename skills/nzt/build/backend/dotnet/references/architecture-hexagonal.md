# Hexagonal architecture on .NET

**Read `../nzt-build/references/backend-architecture-hexagonal.md` first.** It holds the
architecture: the units, the tree of roles, where contracts live and how the wiring is
composed. This file holds only what is .NET.

## Each unit is a project

On .NET every unit of the generic table is a project: `Core`, one `Adapter.<Motive>` per
adapter, `CompositionRoot` and `Adapter.Api`.

**No adapter references another adapter, and that is not a rule to remember**: no adapter's
`.csproj` names another, so the compiler settles it.

`Adapter.Api` holds `Program.cs`, the entry point:

```
Adapter.Api/                   at its root, Program.cs — the only executable
  Results/                     the HTTP translation of a result, and the
                               response filter if there is one
```

The aggregate's single mapping file is its `<Entity>MappingExtensions`.

## Dependency injection

- **Each adapter exposes exactly one public method**, `AddAdapter<Motive>`, from a
  registration file at its own root.
- **`Core` does the same with `AddCore()`**, one private method per feature.
- `CompositionRoot`'s one public method calls `AddCore()` and then every adapter's.
- **`Program.cs` calls that one method** and, beyond it, only what is purely HTTP. **If
  `Program.cs` names a type from another adapter, the wiring is in the wrong project.**

Registrations are never discovered by scanning the assembly.

## Closing checklist

- [ ] `Program.cs` only in `Adapter.Api`.
- [ ] One public registration method per project, the composition root calling them all, and
      `Program.cs` calling only it plus what is purely HTTP.
