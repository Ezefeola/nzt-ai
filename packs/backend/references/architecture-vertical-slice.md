# Backend vertical slice

The unit of organisation is **the operation**: a change touches one folder and removing it
deletes the folder. Read `architecture.md` first.

## The tree

One build unit, inside the component's root (under `src/` when the project uses one), beside
its tests and `Docs/`.

```
<Component>/                       the build unit: manifest and entry point
  Contracts/Results/               the result type and its translation to the transport
  Domain/
    Entities/<AggregatePlural>/    root and child entities, with Enums/
    Common/                        what several aggregates share
  Features/                        its registration file at the root
    <AggregatePlural>/             the feature's endpoint class and the aggregate's mapping
      <Operation>/                 use case, interface, validator, DTOs
  Exceptions/Handlers/             the global exception handler
  Integrations/<System>/           what talks to that system
  Persistence/                     registration, handle, transaction boundary
    Configurations/  Migrations/
    Repositories/<AggregatePlural>/  interface and implementation together — only with the pattern
```

## Rules

1. **One build unit**, never domain, application or infrastructure modules: they guard the
   layers and leave unguarded the boundary that breaks here, one operation reaching into
   another.
2. **A feature is its aggregate in plural** (`Order` → `Features/Orders/`): one name for the
   folder, the endpoint class and the route.
3. **One endpoint class per feature**, whichever endpoint model.
4. **No slice reaches into another**: a file in an operation folder never references another
   operation or feature. The feature level is shared on purpose.
5. **Shared code goes to `Domain/`, `Persistence/` or `Contracts/`; what fits none is written
   twice** — a shared helper makes the slice unremovable.
6. **A repository's interface stays beside its implementation**, not in `Domain/`.
7. **`Integrations/` sits at the root**: two operations can call the same system.
8. **The entry point makes two calls**: `Features/`'s registration and `Persistence/`'s.

## Done when

Every rule holds for the slices you touched.
