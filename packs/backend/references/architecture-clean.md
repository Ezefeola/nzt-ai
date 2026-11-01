# Backend clean architecture

The unit of organisation is **the layer**, separated by the strongest boundary the technology
offers. `tech.md` records the mechanism; a boundary held only by folder names is recorded as
a convention. Read `architecture.md` first.

## Four layers, every reference inward

| Layer | References |
|---|---|
| `Domain` | nothing |
| `Application` | `Domain` |
| `Infrastructure` | `Application` |
| `Api` | `Application`, `Infrastructure` |

## The tree

```
Domain/
  Entities/<AggregatePlural>/      root and child entities, with Enums/
  Common/
Application/                       its registration file at the root
  Contracts/
    Results/                       the result type
    Persistence/                   data access interfaces: Repositories/, UnitOfWork/ — with the pattern
    Integrations/<System>/         one external system's interface
  Features/<AggregatePlural>/      the aggregate's mapping
    <Operation>/
Infrastructure/                    its registration file at the root
  Persistence/                     handle and transaction boundary
    Configurations/  Migrations/  Repositories/<AggregatePlural>/
  Integrations/<System>/           implements its contract
Api/                               the entry point — the composition root
  Controllers/ | Endpoints/        one class per feature, flat, named after the model in use
  Results/                         a result's translation to the transport
  Exceptions/Handlers/
```

## Rules

1. **A contract is declared by the layer that needs it** (`Application/Contracts/`) and
   implemented by the one that knows how (`Infrastructure/`), never in `Domain`.
   `Application → Infrastructure` never exists.
2. **A pattern's two sides appear and disappear together.**
3. **`Domain` holds only entities and enums.**
4. **The transaction boundary's interface gets a folder** (`UnitOfWork/`); its implementation
   sits at the root of `Infrastructure/Persistence/`.
5. **The entry point is the only file in `Api` naming an `Infrastructure` type**, to register
   it.
6. **A result's translation to the transport is in `Api`**: the layer that runs the operation
   does not know it is reached over HTTP.
7. **The global exception handler is in `Api`** and, besides the entry point, the only file
   there that may name the data library's exception types.
8. **With direct persistence**, `Application/Contracts/Persistence/` declares one interface
   over the handle with exactly what the use cases call, implemented in `Infrastructure`. It
   is the only interface over a handle, and exists only so the reference does not turn
   around.

## Done when

Every rule holds, and the references point inward through the mechanism `tech.md` records.
