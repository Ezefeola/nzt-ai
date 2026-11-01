# Backend vertical slice

The unit of organisation is **the operation**: everything it needs sits in one folder, so a
change touches one place and removing it deletes a folder. Read `architecture.md` first.

## The tree

One build unit — no domain, application or infrastructure module. Layer units would enforce
*"the domain may not see the database"* and leave unguarded *"this operation may not reach
into that one"*, the boundary that breaks. The unit sits inside the component's root (under
`src/` when the project uses one), beside its tests and `Docs/`.

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

1. **A feature is its aggregate in plural** (`Order` → `Features/Orders/`): one name for the
   folder, the endpoint class and the route. Either endpoint model is one class per feature.
2. **No slice reaches into another.** A file in an operation folder never references another
   operation or feature. Shared goes to `Domain/`, `Persistence/` or `Contracts/`; what fits
   none is **written twice** — the duplicate is the cheap problem, the shared helper the
   expensive one (the slice stops being removable). The feature level is shared on purpose.
3. **A repository's interface stays beside its implementation**, not in `Domain/`: in one
   unit that buys a convention and no guarantee.
4. **`Integrations/` sits at the root**: two operations can call the same system.
5. The entry point makes two calls: `Features/`'s registration and `Persistence/`'s.

## Done when

One build unit, no reference between slices, and the feature folder holding the endpoint
class and the single mapping file.
