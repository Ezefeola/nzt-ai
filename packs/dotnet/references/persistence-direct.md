# Direct persistence on .NET

Builds on `../nzt-backend/references/persistence-direct.md` — read it first.

## Rules

1. **The use case takes the `DbContext` (`ef-core.md`) in a `readonly` field from an explicit
   constructor** — the concrete type, unless the architecture declares an interface.
2. No `QueryHelper`, `DataAccess` class or static extension over the context that runs queries.
3. A transaction is disposed with `await using`, with no rollback-only catch; the global handler
   is `exceptions.md`.

## Done when

Each use case holds the concrete context in a `readonly` field, and nothing wraps it.
