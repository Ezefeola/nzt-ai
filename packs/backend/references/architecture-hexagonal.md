# Backend hexagonal architecture

The unit of organisation is **the adapter**: what the product knows how to do sits in one
unit that knows neither who asks nor where anything is stored, and **every way in or out is
a unit of its own**, replaceable without the core noticing. `tech.md` records the boundary
mechanism. Read `architecture.md` first.

## The units

| Unit | References |
|---|---|
| `Core` | nothing |
| `Adapter.<Motive>`, one per adapter | `Core` |
| `CompositionRoot` | `Core` and every adapter it wires |
| `Adapter.Api` — the host, the only executable | `Core`, `CompositionRoot` |

1. **`Core` and `CompositionRoot` carry no prefix or component name**; everything else is
   `Adapter.` plus what it adapts to. **One motive, one unit**: two systems are two adapters.
2. **No adapter references another** — they talk through `Core`. `CompositionRoot` never
   references `Adapter.Api`: that would close a cycle.

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

1. **Every contract with the outside is in `Core/Contracts/`**, with no split by direction —
   except the use case's interface, which stays beside its class: the two change together.
2. **Nothing but DTOs and the result type crosses toward `Adapter.Api`.** Adapters on the
   other side do name entities: mapping them is their job.
3. **The global exception handler is the one declared crossing**: it names the ORM's
   exception types, and nothing else in `Adapter.Api` does, nor any other adapter's own type.
4. **Each unit registers itself**: one public entry per adapter and for `Core`.
   `CompositionRoot` has **one file with one public method** calling `Core`'s and every
   adapter's — reading it tells which adapters this deployment has. The entry point calls
   that method plus what is purely HTTP; an adapter's settings are a parameter of its own
   method.
5. **With direct persistence**, `Core/Contracts/Persistence/` declares one interface over the
   handle with exactly what the use cases call, implemented in `Adapter.Persistence`. It is
   the only one, and exists so `Core` never knows an adapter.

## Done when

`Core` references nothing, no adapter references another, and the entry point names no
adapter type beyond what `CompositionRoot` wires.
