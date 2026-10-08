# Direct persistence

The persistence axis says direct, which is **the name of a decision, not the absence of one**:
this project has **no repositories and no unit of work, anywhere**.

**The persistence handle is whatever the ORM axis names** — the type the data access package
gives you to read and write with. That skill says what it is called and how to query with it;
**this one says where it goes and what must not be built around it.**

## The shape

The use case takes the handle in a `readonly` field from an explicit constructor, and **every
use case that touches data gets it**. There is no layer in between.

**The concrete type is injected, not an interface over it.** An interface with one member per
entity is a repository with extra steps and no benefit: nothing else can implement it and
still work.

**One exception**: a layered architecture where the handle lives in a project the use case may
not reference. There the architecture skill declares the interface and the ORM skill says what
it exposes.

## What must not appear

- **No repository, no unit of work.** Not *just for this aggregate*, not *because this one is
  complex*. **Half a project wrapped and half not is exactly the inconsistency this axis
  exists to prevent**, and changing it is a stack decision taken once for the whole project.
- **No helper class wrapping the handle** — no `QueryHelper`, no `DataAccess`, no static
  extension over it that runs queries. Same thing under another name.
- **The handle does not leave the use case.** Not to a service, not to a mapper, not to a
  method in another class that queries with it.
- **An unexecuted query does not leave either.** It is built, executed and materialised inside
  the use case; what comes out is a DTO.

- **No classifier of provider errors** — no static helper that inspects a database exception
  to decide what it meant. What the save could reject is checked before it; the rest goes to
  the global handler.

## The use case is the transactional unit

Everything the operation changes is committed **once, at the end**. There is no unit of work
here, so **the use case is the unit of work** — which is precisely why this axis needs no such
type. How the save is written, and the one case that needs an explicit transaction, is the ORM
skill's.

**No `try/catch` around persistence calls, the save included.** A business response comes
from a check before the write, never from catching its failure; whatever escapes reaches the
global handler (`nzt-build-backend-dotnet-exceptions`). Transaction cleanup follows the ORM's
disposal pattern, with no rollback-only catch.

## Where the queries live

**In the use case, written out.** A use case that reads three things has three queries in it,
and **that is the intended shape**: reading it top to bottom shows every hit to the database,
in order, with its filters.

If the same query appears in two use cases, **it is written twice.** Extracting it is how the
helper class from the section above gets born, and **the second caller always ends up needing
one column more.**

## Closing checklist

- [ ] The use case takes the handle in a `readonly` field with an explicit constructor, and no
      interface over it unless the architecture declares one.
- [ ] **No repository, no unit of work, no query helper, no provider-error classifier** — not
      even for one aggregate.
- [ ] No `try/catch` around persistence calls; business failures come from checks before the
      write.
- [ ] Neither the handle nor an unexecuted query leaves the use case.
- [ ] Everything the operation changes is committed once, at the end.
- [ ] A query shared with another use case was written twice rather than extracted.
