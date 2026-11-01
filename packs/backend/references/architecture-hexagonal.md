# Backend hexagonal architecture

The unit of organisation is **the adapter**: the core knows neither who asks nor where
anything is stored, and every way in or out is a unit of its own. `tech.md` records the
boundary mechanism. Read `architecture.md` first.

## The units

| Unit | References |
|---|---|
| `Core` | nothing |
| `Adapter.<Motive>`, one per adapter | `Core` |
| `CompositionRoot` | `Core` and every adapter it wires |
| `Adapter.Api` — the host, the only executable | `Core`, `CompositionRoot` |

## The tree

```
Core/                              its registration file at the root
  Contracts/
    Results/
    Persistence/                   Repositories/, UnitOfWork/ — with the pattern
    Integrations/<System>/
  Domain/Entities/<AggregatePlural>/  Domain/Common/
  Features/<AggregatePlural>/      the aggregate's mapping
    <Operation>/
Adapter.Persistence/               registration, handle, transaction boundary
  Configurations/  Migrations/  Repositories/<AggregatePlural>/
Adapter.<System>/                  registration and what talks to that system
Adapter.Api/                       the entry point
  Controllers/ | Endpoints/  Results/  Exceptions/Handlers/
CompositionRoot/                   the one file that wires the system
```

## Rules

1. **`Core` and `CompositionRoot` carry no prefix or component name**; every other unit is
   `Adapter.` plus what it adapts to.
2. **One motive, one unit**: two systems are two adapters.
3. **No adapter references another**; they talk through `Core`.
4. **`CompositionRoot` never references `Adapter.Api`**: that would close a cycle.
5. **Every contract with the outside is in `Core/Contracts/`**, with no split by direction.
   Exception: the use case's interface stays beside its class.
6. **Adapters other than `Adapter.Api` do name entities**: mapping them is their job.
7. **The global exception handler is the one declared crossing**: it names the data library's
   exception types; nothing else in `Adapter.Api` names them, nor another adapter's type.
8. **Each unit registers itself**: one public entry per adapter and for `Core`.
9. **`CompositionRoot` is one file with one public method** calling `Core`'s and every
   adapter's registration. An adapter's settings are a parameter of its own method.
10. **The entry point calls that method** plus what is purely HTTP.
11. **With direct persistence**, `Core/Contracts/Persistence/` declares one interface over the
    handle with exactly what the use cases call, implemented in `Adapter.Persistence`. It is
    the only one.

## Done when

Every rule holds, and the entry point names no adapter type beyond what `CompositionRoot`
wires.
