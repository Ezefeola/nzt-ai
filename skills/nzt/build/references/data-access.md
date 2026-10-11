# Data access — what holds for every operation

These are the rules that do not change with the operation. They hold together with the
operation's own guidance, never instead of it: the query, the write, the mapping and the
migration each have their own.

**The persistence handle is whatever the stack's data access line names** — the context,
session or connection the library gives you to read and write with. The stack document says
what it is called and how it is configured.

## The handle lives exactly as long as its operation

- **Created for the operation, injected, and never held after the operation ends.** No handle
  in a long-lived object shared across requests, no handle captured by a background task that
  outlives the request: whatever it tracks keeps growing and two operations start seeing each
  other's data.
- **One handle per operation.** A second instance opened to get around a conflict hides the
  conflict instead of fixing it — the two then disagree about the same row.
- **The connection string lives in configuration**, never in code and never in a committed
  file. `secrets.md` says where.

## Nothing reaches the database inside a loop

**The tell is always the same: a database call inside a loop over items.** It never shows up
with ten rows in development, and it is the single most common reason a listing that worked
becomes a timeout in production.

- A query per item is **N+1**: ask for everything in one query instead, projected — that is
  the data queries guidance.
- A save per item is **one transaction per row**: stage every change and save once — that is
  the data writes guidance.
- An update or a delete over many rows by criteria is **one statement**, not a loop over
  loaded entities — that is the guidance on operations by criteria.

**Lazy loading is not used**: no proxies, no navigation that quietly queries when touched.
What an operation needs, it asks for. Lazy loading is N+1 with no visible call to spot.

## Every database call is non-blocking and cancellable

Where the language offers asynchronous I/O, **every database call uses it and passes the
cancellation signal it received**. A blocking call holds a thread for the length of a round
trip, and one without the cancellation keeps working for a caller that is already gone.

## What the provider decides is verified, not assumed

Translation, the generated query, the plan and the behaviour of concurrency tokens differ by
provider and by library version. **A claim about any of them is checked against the project's
provider and version** — the manifest, the generated query, the actual plan — and never argued
from the shape of the code alone.

## Closing checklist

- [ ] The handle is created per operation, not held past it, and the operation uses one.
- [ ] The connection string comes from configuration.
- [ ] No database call inside a loop over items, and no save in one.
- [ ] Lazy loading is off; what is needed was asked for.
- [ ] Every call is non-blocking where the language allows it and passes the cancellation.
- [ ] Any provider- or version-dependent claim was checked against this project.
