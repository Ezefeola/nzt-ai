---
name: nzt-build-backend-dotnet-ef-core
description: Use when the stack selects EF Core and an operation reaches the database - tracking, the context's lifetime and what never happens inside a loop, loaded with whichever EF Core operation applies.
---

# EF Core — what holds for every operation

These are the rules that do not change with the operation. **Load this together with the
operation's skill**, never instead of it: the query, the write, the mapping and the migration
each have their own.

Load `nzt-build-backend-dotnet` before applying this.

## Tracking: the default stays, `AsNoTracking` is written

EF's default is kept, so **anything that says nothing is tracked**, and **every query that
only reads carries `AsNoTracking()`**.

- **Read to show, export or count → `AsNoTracking()`.** No snapshot, no change detection, no
  identity resolution.
- **Read to modify and save → nothing.** Tracking is exactly the mechanism that makes the
  update persist.

Turning tracking off globally was considered and rejected. With it, a query without a marker
does not track, and **an update that looks correct simply does not save**. The failure mode of
the convention kept here is a wasted snapshot; the failure mode of the other one is lost data.

## The context lives exactly as long as its operation

- **Registered scoped, injected, and never held after the operation ends.** No context in a
  field of a singleton, no context captured by a background task that outlives the request:
  the tracker keeps growing and two operations start seeing each other's entities.
- **One context per operation.** A second instance opened to get around a tracking conflict
  hides the conflict instead of fixing it — the two contexts then disagree about the same row.
- **The connection string lives in configuration**, never in code and never in a committed
  file. `nzt-build-secrets` says where.

## Nothing reaches the database inside a loop

**The tell is always the same: an `await` on the context inside a `foreach`.** It never shows
up with ten rows in development, and it is the single most common reason a listing that
worked becomes a timeout in production.

- A query per item is **N+1**: ask for everything in one query instead, projected — that is
  `nzt-build-backend-dotnet-ef-core-queries`.
- A `SaveChangesAsync` per item is **one transaction per row**: stage every change and save
  once — that is `nzt-build-backend-dotnet-ef-core-writes`.
- An update or a delete over many rows by criteria is **one statement**, not a loop over
  loaded entities — that is `nzt-build-backend-dotnet-ef-core-bulk`.

**Lazy loading is not used**: no proxies, no navigation that quietly queries when touched.
What an operation needs, it asks for. Lazy loading is N+1 with no `await` to spot.

## Every database call is async and carries the token

`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`, `ExecuteUpdateAsync` — all of them,
all passing the `CancellationToken` they received. A synchronous EF call blocks a thread for
the length of a round trip, and one without the token keeps working for a caller that is
already gone.

## What the provider decides is verified, not assumed

Translation, the generated SQL, the plan and the behaviour of concurrency tokens differ by
provider and by EF Core version. **A claim about any of them is checked against the project's
provider and version** — the manifest, the generated SQL, the actual plan — and never argued
from the shape of the C# alone.

## Closing checklist

- [ ] Every read-only query carries `AsNoTracking()`, and nothing turns tracking off globally.
- [ ] The context is scoped, not held past its operation, and the operation uses one.
- [ ] The connection string comes from configuration.
- [ ] No `await` on the context inside a loop, and no `SaveChangesAsync` in one.
- [ ] Lazy loading is off; what is needed was asked for.
- [ ] Every call is async and passes the `CancellationToken`.
- [ ] Any provider- or version-dependent claim was checked against this project.
