# EF Core — what holds for every operation

**Read `../nzt-build/references/data-access.md` first.** It holds the handle's lifetime, one
per operation, the connection string, nothing inside a loop, no lazy loading, cancellation
and verifying what the provider decides. This file holds only what is EF Core.

These are the rules that do not change with the operation. **Load this together with the
operation's skill**, never instead of it: the query, the write, the mapping and the migration
each have their own.

## Tracking: the default stays, `AsNoTracking` is written

EF's default is kept, so **anything that says nothing is tracked**, and **every query that
materialises entities only to read them carries `AsNoTracking()`**. EF tracks entity instances
in the result, nothing else.

- **Load entities to show or export → `AsNoTracking()`.** No snapshot, no change detection, no
  identity resolution.
- **Project to a DTO, count, check existence or aggregate → nothing.** No entity comes out, so
  there is nothing to track, and the marker is noise that reads as if something were.
- **A projection that hands the entity to a client-side method → it is tracked.**
  `Select(order => new { Url = Format(order) })` materialises `order` and tracks it. Pass the
  columns the method needs instead of the entity; if it cannot, the query carries
  `AsNoTracking()`.
- **Read to modify and save → nothing.** Tracking is exactly the mechanism that makes the
  update persist.

Turning tracking off globally was considered and rejected. With it, a query without a marker
does not track, and **an update that looks correct simply does not save**. The failure mode of
the convention kept here is a wasted snapshot; the failure mode of the other one is lost data.

## The context is the handle

- **Registered scoped, injected, and never held after the operation ends.** No context in a
  field of a singleton: the tracker keeps growing.
- **One context per operation.** Not a second `DbContext` to get around a tracking conflict.

## In EF Core terms

**The tell is always the same: an `await` on the context inside a `foreach`.** The query per
item goes to `nzt-build-backend-dotnet-ef-core-queries`, the `SaveChangesAsync` per item to
`nzt-build-backend-dotnet-ef-core-writes`, and the update or delete by criteria to
`nzt-build-backend-dotnet-ef-core-bulk`. No lazy-loading proxies.

Every call is async — `ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`,
`ExecuteUpdateAsync` — and passes the `CancellationToken` it received. Translation, the
generated SQL and the plan differ by provider and by EF Core version.

## Closing checklist

- [ ] Every read-only query carries `AsNoTracking()`, and nothing turns tracking off globally.
- [ ] The context is scoped, not held past its operation, and the operation uses one.
- [ ] No `await` on the context inside a loop, and no `SaveChangesAsync` in one.
- [ ] Every call is async and passes the `CancellationToken`.
