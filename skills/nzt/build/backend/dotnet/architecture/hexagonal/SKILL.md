---
name: nzt-build-backend-dotnet-architecture-hexagonal
description: Use when the backend stack selects hexagonal architecture and code is added or moved, or its structure is needed - a core that knows no adapter, one project per adapter, and a composition root that shows the whole wiring.
---

# Hexagonal architecture

**What the model is for:** the unit of organisation is **the adapter**. Everything the
product knows how to do sits in one project that does not know who asks it or where anything
is stored, and **every way in or out is a project of its own**, replaceable without the core
noticing.

**This skill decides projects and folders, and names each folder by the role it holds —
nothing else does.**

Load `nzt-build-backend-dotnet` before applying this.

## The projects

| Project | References |
|---|---|
| `Core` | nothing |
| `Adapter.<Motive>` — one per adapter | `Core` |
| `CompositionRoot` | `Core` and every adapter it wires |
| `Adapter.Api` | `Core` and `CompositionRoot` — it is the host |

**`Core` and `CompositionRoot` carry no prefix and no component name.** Everything else is
`Adapter.` plus what it adapts to. **One motive, one project** — two external systems are two
adapters, never one project holding both.

**No adapter references another adapter**, and that is not a rule to remember: no adapter's
`.csproj` names another, so the compiler settles it. Two adapters that seem to need each
other are talking through `Core`, or one of them is in the wrong project.

**`Adapter.Api` is the host**: the only executable, the one with `Program.cs`. It references
`CompositionRoot` to get the wiring, **which is exactly why `CompositionRoot` never
references it back** — that reference would close a cycle.

## The tree

Each line is a **role**: what belongs there, never what it is called.

```
Core/                          at its root, its registration file
  Contracts/                   every contract with the outside
    Results/                   the result type every use case returns
    Persistence/               the data access interfaces
      Repositories/            one interface per aggregate — only with the
                               pattern in use
      UnitOfWork/              the transaction boundary interface — only with
                               the pattern in use
    Integrations/<System>/     the interface of one external system
  Domain/
    Entities/<AggregatePlural>/  the whole aggregate: root and child entities
      Enums/                     the enums only this aggregate uses
    Common/                      what several aggregates share, with its Enums/
  Features/<AggregatePlural>/  the aggregate's one mapping file, shared by its
                               operations and never copied into them
    <Operation>/               all that only this operation uses: the use case,
                               its interface, its validator and its DTOs

Adapter.Persistence/           at its root, its registration file, the
                               persistence handle and the transaction boundary
  Configurations/              the per-entity mapping, one file per entity
  Migrations/                  the generated schema history, if the tooling
                               produces one — never hand-written
  Repositories/<AggregatePlural>/  what implements that aggregate's interface —
                                   only with the pattern in use

Adapter.<System>/              at its root, its registration file and what talks
                               to that system, implementing its contract

Adapter.Api/                   at its root, Program.cs — the only executable
  Controllers/ | Endpoints/    the endpoint class of each feature, flat — the
                               folder is named after the model in use
  Results/                     the HTTP translation of a result, and the
                               response filter if there is one
  Exceptions/
    Handlers/                  the global exception handler — never exception
                               classes of the project's own

CompositionRoot/               at its root, the one file that wires the system
```

**A catalogue of roles, not folders to create up front.** A folder exists when something
fills it. **Folder names are plurals**, except `<Operation>/`.

## `Core` keeps every contract in one place

`Contracts/` holds what `Core` declares and does not implement. **There is no split by
direction**: a contract is a contract, and the project that implements it already answers
which way it points.

**The use case's interface is the exception, and it stays beside its class.** The two are
edited together every time a method changes, and moving it to `Contracts/` would buy a
symmetry and cost a second place to open.

**Nothing but DTOs and the result type crosses out of `Core` towards the Api.** An entity
named in `Adapter.Api` means a mapping was skipped — adapters on the other side do name
entities, because mapping them is their job.

**The transaction boundary has no folder where it is implemented**: it sits at the root of
`Adapter.Persistence/`, beside the handle. Its *interface* does get one.

**The global exception handler is the one declared crossing.** It lives in `Adapter.Api`
and names the ORM's exception types, which belong to the persistence adapter's technology:
the host is the only place that answers for every failure. **Nothing else in `Adapter.Api`
names them**, and the handler references no type of another adapter's own.

**The feature level holds the aggregate's single `<Entity>MappingExtensions`**, with the
mapping to every operation's DTOs — never a copy in each operation folder.

## Dependency injection

**Every project registers itself, and `CompositionRoot` calls them.**

- **Each adapter exposes exactly one public method**, `AddAdapter<Motive>`, from a
  registration file at its own root.
- **`Core` does the same with `AddCore()`**, one private method per feature.
- **`CompositionRoot` has one file with one public method** that calls `AddCore()` and then
  every adapter's. **Not one file per adapter**: the reason the project exists is that a
  single method shows the whole wiring, and reading it tells you which adapters this
  deployment has.
- **`Program.cs` calls that one method** and, beyond it, only what is purely HTTP. **If
  `Program.cs` names a type from another adapter, the wiring is in the wrong project.**

An adapter that needs settings takes them as a parameter of its own method and reads them
itself. Registrations are written out, **never discovered by scanning the assembly**: a
missing registration has to fail at startup, not at the first request.

## With direct persistence, the handle is reached through an interface

The handle lives in `Adapter.Persistence` and the use case may not name it, so
**`Core/Contracts/Persistence/` declares an interface over it**, exposing exactly what the
use cases call and nothing more. The adapter implements it on the handle itself.

It is the **only** interface over a persistence handle in the system: **without it the
reference would turn around and `Core` would know an adapter.** It is not an extension point.

## Closing checklist

- [ ] `Core` and `CompositionRoot` named plainly, everything else `Adapter.<Motive>`, one
      motive per project.
- [ ] `Core` references nothing, no adapter references another, and `CompositionRoot` does not
      reference `Adapter.Api`.
- [ ] `Program.cs` only in `Adapter.Api`.
- [ ] Every folder name is a plural except the operation folder, and no folder that nothing
      fills.
- [ ] Every contract in `Core/Contracts/` — except the use case's interface, beside its class.
- [ ] One folder per operation, with the aggregate's single mapping file one level up and no
      copy of it in any operation folder.
- [ ] The global exception handler in `Adapter.Api/Exceptions/Handlers/`, the only file there
      naming the ORM's exception types, with no exception classes of the project's own.
- [ ] The persistence handle and the transaction boundary at the root of `Adapter.Persistence`.
- [ ] No entity named anywhere in `Adapter.Api`.
- [ ] One public registration method per project, the composition root calling them all, and
      `Program.cs` calling only it plus what is purely HTTP.
- [ ] With direct persistence, one interface over the handle in `Core/Contracts/Persistence/`.
