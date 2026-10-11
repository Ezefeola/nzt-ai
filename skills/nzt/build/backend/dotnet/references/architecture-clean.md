# Clean architecture on .NET

**Read `../nzt-build/references/backend-architecture-clean.md` first.** It holds the
architecture: the four layers, the tree of roles and the rules it does not show. This file
holds only what is .NET.

## The layer is a project

On .NET **the layer is a project** — so what each layer may know is **enforced by the
compiler**, not by review. That is the boundary the stack document records for this
architecture.

| Project | References |
|---|---|
| `<Component>.Domain` | nothing |
| `<Component>.Application` | `Domain` |
| `<Component>.Infrastructure` | `Application` |
| `<Component>.Api` | `Application`, `Infrastructure` |

**`Program.cs` is the only file in `Api` that may name a type from `Infrastructure`** — it is
the entry point, and the composition root lives there.

## The tree on .NET

The generic tree, with the layer folders and these roles filled the .NET way:

```
<Component>.Domain/
<Component>.Application/       at its root, the registration file of the layer
<Component>.Infrastructure/    at its root, the registration file of the layer
<Component>.Api/               at its root, Program.cs — the composition root
  Results/                     the HTTP translation of a result, and the
                               response filter if there is one
```

- **The HTTP translation of a result is in `Api`**, never in `Application`: it depends on
  ASP.NET Core.
- The transaction boundary's interface gets a folder because the `I` prefix means there is
  no collision.
- The aggregate's single mapping file is its `<Entity>MappingExtensions`.

## Dependency injection

**One registration file per project**, at its root, each with one public method —
`AddApplication()`, `AddInfrastructure()` — with private methods per feature inside.
`Program.cs` is two calls. **Never discovered by scanning the assembly.**

## With direct persistence

The interface over the handle carries **the handle's type name with the usual `I` prefix**.

## Closing checklist

- [ ] Four projects, references **pointing inward**, and `Api` naming `Infrastructure` only in
      `Program.cs`.
- [ ] No entity named anywhere in `Api`, and the result's HTTP translation in `Api/Results/`.
- [ ] One registration file per project, one private method per feature.
