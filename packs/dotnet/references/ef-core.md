# EF Core — what holds for every operation

Builds on `../nzt-backend/references/data-access.md` — read it first, then the operation's file.

## Rules

1. **Tracking stays EF's default; `AsNoTracking()` is written** on every query that materialises
   entities only to read them.
   - Show or export entities → `AsNoTracking()`.
   - Project to a DTO, count, check existence, aggregate → nothing: no entity comes out.
   - A projection handing the entity to a client-side method (`Select(o => new { Url =
     Format(o) })`) tracks it — pass the columns instead, or add `AsNoTracking()`.
   - Read to modify and save → nothing: tracking is what persists the change.

   Never off globally: then an unmarked update silently does not save — lost data instead of a
   wasted snapshot.
2. **The `DbContext` is registered scoped**, one per operation, never in a singleton's field,
   never a second one to dodge a tracking conflict.
3. **An `await` on the context inside a `foreach` is the tell** of N+1, a save per item or a
   loop that should be `ExecuteUpdateAsync` (`ef-core-queries.md`, `-writes.md`, `-bulk.md`). No
   lazy-loading proxies.
4. **Every call is async** (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`,
   `ExecuteUpdateAsync`) and passes the `CancellationToken`. Translation, SQL and plan depend on
   the provider and EF Core version.

## Done when

Read-only entity queries carry `AsNoTracking()`, the context is scoped and single per operation,
and no context call sits in a loop.
