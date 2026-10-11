# Backend clean architecture

## Contents
- Four layers, and every reference points inward
- The tree
- The rules the tree does not show
- Registration
- With direct persistence, the handle is reached through an interface
- Closing checklist

**What the model is for:** the unit of organisation is **the layer, and the boundary between
layers is the strongest one the stack offers** — so what each layer may know is enforced by
the tooling, not by review. Which mechanism that is gets written in the component's stack
document; a boundary that only a folder name holds is a convention, and is recorded as one.

**This reference decides layers and folders, and names each folder by the role it holds —
nothing else does.** What fills a role, and what each file is called, comes from its own
reference.

## Four layers, and every reference points inward

| Layer | References |
|---|---|
| `Domain` | nothing |
| `Application` | `Domain` |
| `Infrastructure` | `Application` |
| `Api` | `Application`, `Infrastructure` |

**`Infrastructure` referencing `Application` is the whole point**: the contract is declared by
the layer that **needs** it and implemented by the layer that knows **how**. The arrow the
naive layout would draw — `Application → Infrastructure` — is the one that never exists.

**`Api` is the composition root**, and that is the only reason it sees `Infrastructure`:
something has to name the repository class to register it. **The entry point is the only file
in `Api` that may name a type from `Infrastructure`** — anywhere else, that reference is being
abused.

## The tree

Each line is a **role**: what belongs there, never what it is called. The layer folders carry
the component's name the way the stack records it.

```
Domain/
  Entities/<AggregatePlural>/  the whole aggregate: root and child entities
    Enums/                     the enums only this aggregate uses
  Common/                      what several aggregates share, with its own Enums/

Application/                   at its root, the registration file of the layer
  Contracts/                   what the layer declares and does not implement
    Results/                   the result type every use case returns
    Persistence/               the data access interfaces
      Repositories/            one interface per aggregate — only with the
                               pattern in use
      UnitOfWork/              the transaction boundary interface — only with
                               the pattern in use
    Integrations/<System>/     the interface of one external system
  Features/<AggregatePlural>/  the aggregate's one mapping file, shared by its
                               operations and never copied into them
    <Operation>/               all that only this operation uses: the use case,
                               its interface, its validator and its DTOs

Infrastructure/                at its root, the registration file of the layer
  Persistence/                 at its root, the persistence handle and the
                               transaction boundary
    Configurations/            the per-entity mapping, one file per entity
    Migrations/                the generated schema history, if the tooling
                               produces one — never hand-written
    Repositories/<AggregatePlural>/  what implements that aggregate's
                                     interface — only with the pattern in use
  Integrations/<System>/       what talks to that system, implementing its
                               contract

Api/                           at its root, the entry point — the composition root
  Controllers/ | Endpoints/    the endpoint class of each feature, flat — the
                               folder is named after the model in use
  Results/                     the translation of a result to the transport
  Exceptions/
    Handlers/                  the global exception handler — never exception
                               classes of the project's own
```

**This is a catalogue of roles, not folders to create up front.** A folder exists when
something fills it. **An empty folder invites something unrelated into it.**

**Folder names are plurals**, the form that never collides with the type name beside it. The
**only** exception is `<Operation>/`.

`Persistence/` and `Integrations/` appear on both sides and mean different things: in
`Application` the folder holds interfaces, in `Infrastructure` what implements them.

## The rules the tree does not show

- **A pattern the project does not use has no folder on either side.** Without repositories
  there is no `Repositories/` under `Contracts/` and none under `Infrastructure/`. **The two
  sides always appear and disappear together.**
- **The transaction boundary has no folder where it is implemented**: it belongs to no single
  aggregate and would collide with the class, so it sits at the root of
  `Infrastructure/Persistence/`. Its *interface* does get one — the interface's name does not
  collide.
- **The interfaces are in `Application`, not `Domain`.** The consumer declares the contract,
  and the model has no reason to know that anything is ever stored.
- **Nothing but DTOs and the result type crosses out of `Application`.** An entity named
  anywhere in `Api` means a mapping was skipped.
- **The translation of a result to the transport is in `Api`**, never in `Application`: it
  depends on the web framework, and the layer that runs the operation must not know it is
  reached over HTTP.
- **The global exception handler is in `Api`**, and it is the one file there besides the
  entry point that may name the ORM's exception types: the host is the only place that sees
  the whole system.
- **One folder per operation, nothing shared inside it.** What two operations of a feature
  share sits one level up — the aggregate's single mapping file, never a copy per operation;
  what two features share sits in `Domain` or `Contracts`.

## Registration

**One registration file per layer**, at its root, each with one public entry and **private
methods per feature** inside. The entry point is two calls.

Registrations are written out, **never discovered by scanning the code**: a missing
registration has to fail at startup, not at the first request.

## With direct persistence, the handle is reached through an interface

The handle lives in `Infrastructure` and the use case may not name it, so
**`Application/Contracts/Persistence/` declares an interface over it**, exposing exactly what
the use cases call and nothing more. `Infrastructure` implements it on the handle itself.

It is the **only** interface over a persistence handle in the system, and it exists for one
reason: **without it the reference of the whole layer would turn around.** It is not an
extension point — nothing else will ever implement it.

## Closing checklist

- [ ] Four layers, references **pointing inward**, held by the mechanism the stack document
      records, and `Api` naming `Infrastructure` only in the entry point.
- [ ] Every folder name is a plural except the operation folder.
- [ ] `Domain` holds entities and enums only — no DTO, no result type, no persistence
      contract.
- [ ] Interfaces in `Application/Contracts/`, implementations in `Infrastructure/`, and an
      unused pattern with **no folder on either side**.
- [ ] One folder per operation, with the aggregate's single mapping file one level up and no
      copy of it in any operation folder.
- [ ] The global exception handler in `Api/Exceptions/Handlers/`, with no exception classes of
      the project's own beside it.
- [ ] The persistence handle and the transaction boundary at the root of
      `Infrastructure/Persistence/`.
- [ ] No entity named anywhere in `Api`, and the result's translation in `Api/Results/`.
- [ ] One registration file per layer, one private method per feature.
- [ ] With direct persistence, the handle reached through one interface in
      `Contracts/Persistence/` — and no other interface over it anywhere.
