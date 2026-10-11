# Backend vertical slice

## Contents
- No unit per layer
- The tree
- `Features/` — the slice
- No slice reaches into another slice
- Two placements that look wrong and are not
- Registration
- Closing checklist

**What the model is for:** the unit of organisation is **the operation**, not the technical
role. Everything one operation needs sits in one folder, so changing an operation touches one
place and removing it is a deleted folder.

**This reference decides folders, units and where every file goes — nothing else does.** What
each file *is* and what it is called comes from its own reference.

## No unit per layer

A component is **one unit of the build** — no domain, application or infrastructure module of
its own.

Splitting into layer units puts the boundary back on the horizontal layer, **which is what this
architecture exists to avoid**: the tooling enforces *"the domain may not see the database"*
while nothing enforces *"this operation may not reach into that one"* — the boundary that
actually breaks.

## The tree

Each line is a **role**: what belongs there, never what it is called.

```
<Component>/                   at its root, the project manifest and the entry point
  Contracts/                   what crosses the boundary out of the application
    Results/                   the result type and its translation to the transport
  Domain/
    Entities/<AggregatePlural>/  the whole aggregate: root and child entities
      Enums/                     the enums only this aggregate uses
    Common/                      what several aggregates share, with its Enums/
  Features/                    at its root, the registration file of the folder
    <AggregatePlural>/         the endpoint class of the feature, and the
                               aggregate's one mapping file, shared by its
                               operations and never copied into them
      <Operation>/             all that only this operation uses: the use case,
                               its interface, its validator and its DTOs
  Exceptions/
    Handlers/                  the global exception handler — never exception
                               classes of the project's own
  Integrations/<System>/       what talks to that system
  Persistence/                 at its root, the registration file of the folder,
                               the persistence handle and the transaction
                               boundary
    Configurations/            the per-entity mapping, one file per entity
    Migrations/                the generated schema history, if the tooling
                               produces one — never hand-written
    Repositories/<AggregatePlural>/  that aggregate's interface and its
                                     implementation, together — only with the
                                     pattern in use
```

**This is a catalogue of roles, not folders to create up front.** A folder exists when
something fills it: no external system, no `Integrations/`; nothing shared between
aggregates, no `Common/`. **An empty folder invites something unrelated into it.**

**Folder names are plurals** — the form that never collides with the type name beside it. The
**only** exception is `<Operation>/`, named after the use case it holds.

**The endpoint model changes the *file* at the feature level, not the layout.** Either model
is one endpoint class per feature, with every operation of the feature inside it.

**The transaction boundary gets no folder of its own**: it belongs to no single aggregate and
a folder named after it would collide with the class, so it sits at the root of
`Persistence/`, beside the handle.

## `Features/` — the slice

**A feature is the aggregate its operations belong to, in plural**: `Order` →
`Features/Orders/`. One name governs the folder, the endpoint class and the route.

The two levels hold different kinds of thing, **and the split is the point**: what the
feature owns — the endpoint class, the aggregate's mapping — serves every operation, while
the operation folder holds **only what would disappear with that operation**.

## No slice reaches into another slice

A file inside an operation folder **never references anything under another operation or
another feature**. What is genuinely shared lives in `Domain/`, `Persistence/` or
`Contracts/` — and **what belongs in none of those is written twice**.

**The feature level is not another slice.** What sits there — the endpoint class and the
aggregate's mapping file — is shared by the feature's operations on purpose: **one mapping
file per aggregate, holding the mapping to every operation's DTOs, never a copy in each
operation folder.** The rule above is about helpers between operations, not about these two.

**The duplicate is the cheap problem.** The shared helper between two slices is the expensive
one: the second caller always needs one more column, the first gets an optional parameter,
and the slice stops being removable.

## Two placements that look wrong and are not

- **A repository's interface is not exiled to `Domain/`.** It sits with its implementation:
  in a single unit, moving it elsewhere buys a convention and no guarantee, and the two
  files are edited together every time a method is added.
- **`Integrations/` sits at the root**, for the opposite reason to a slice: two operations can
  call the same system, and the call belongs to neither of them.

## Registration

**One registration file per root folder**, each with one public entry, and the entry point
calls the public entry of each. `Persistence/` does the same for the handle and the
repositories, so the entry point is two calls.

**One private method per feature, never one per operation**, and **registrations are written
out — never discovered by scanning the code**: a missing registration has to fail at
startup, not at the first request.

Without this, the entry point is the one file every new operation would have to touch.

## Closing checklist

- [ ] One build unit for the component, no layer units.
- [ ] Every folder name is a plural except the operation folder, and none matches a type name.
- [ ] No folder that nothing fills.
- [ ] The feature folder is the aggregate in plural, holding the endpoint class and the
      aggregate's single mapping file, with no copy in any operation folder.
- [ ] One folder per operation, holding only what that operation uses.
- [ ] **No reference from one slice to another**; shared goes up, otherwise it is duplicated.
- [ ] Aggregate children and their enums inside the aggregate folder.
- [ ] The persistence handle and the transaction boundary at the root of `Persistence/`, and
      nothing there that classifies provider errors.
- [ ] The global exception handler in `Exceptions/Handlers/`, and no exception classes of the
      project's own beside it.
- [ ] One registration file per root folder, one private method per feature, and the entry
      point calling only the public ones.
