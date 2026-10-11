# Direct persistence on .NET

**Read `../nzt-build/references/backend-persistence-direct.md` first.** It holds what direct
means, what must not appear around the handle, the use case as the transactional unit and
where queries live. This file holds only what is .NET.

The handle is the type the ORM axis names (`references/ef-core.md`). **The use case takes it
in a `readonly` field from an explicit constructor** — the concrete type, not an interface,
unless the architecture declares one.

- No `QueryHelper`, no `DataAccess`, **no static extension over the handle that runs
  queries**.
- Transaction cleanup follows EF's disposal pattern (`await using`), with no rollback-only
  catch. The global handler is `references/exceptions.md`.

## Closing checklist

- [ ] The use case takes the handle in a `readonly` field with an explicit constructor, and no
      interface over it unless the architecture declares one.
