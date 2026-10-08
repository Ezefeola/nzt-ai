# Set-based writes — `ExecuteUpdateAsync` and `ExecuteDeleteAsync`

## Contents
- `ExecuteUpdateAsync`
- `ExecuteDeleteAsync`
- When they are the right tool
- When they must not be used
- The two behaviours that change the use case
- What else does not run
- What an update cannot do
- On delete, the cascade is the database's, not EF's
- Very large deletes
- Closing checklist

Both turn a query into **one statement in the database**: nothing is materialised, nothing is
tracked, change detection never runs. Where the alternative is loading N entities to change or
remove each one, this skips the materialisation. **It is not a promise of fewer round trips** —
tracked writes can be batched by the provider too; the gain is not paying for the entities.

## `ExecuteUpdateAsync`

```csharp
int updated = await dbContext.Orders
    .Where(order => order.Status == OrderStatus.Pending && order.DueOn < today)
    .ExecuteUpdateAsync(
        setters => setters
            .SetProperty(order => order.Status, OrderStatus.Expired)
            .SetProperty(order => order.ExpiredOn, now),
        cancellationToken);
```

- **The filter is the query**, written like any other `Where`, and it can navigate
  relationships.
- **`SetProperty` takes a value or an expression over the row itself** —
  `SetProperty(p => p.Price, p => p.Price * 1.1m)` — which is what lets an increment happen
  without reading the current value first.
- **It returns the number of rows affected**, and that number answers *did anything match?*
  without a preceding existence query.

## `ExecuteDeleteAsync`

```csharp
int deleted = await dbContext.Notifications
    .Where(notification => notification.ReadOn != null && notification.ReadOn < cutoff)
    .ExecuteDeleteAsync(cancellationToken);
```

Same filter, same returned count. **There is no undo and no confirmation step**: the filter is
the whole safety of the operation.

## When they are the right tool

**The operation changes or removes rows selected by a criterion, and needs nothing about each
row individually.** Expiring everything past a date, deactivating a set, reassigning a batch,
purging what was read long ago. The gain grows with the row count, and it is the whole
difference in a use case that would otherwise loop.

## When they must not be used

- **The entity's own logic has to run** — invariants, a state transition, a cascade the model
  owns. The statement **bypasses the model completely**. With a DDD model this is the normal
  case, and the reason the aggregate gets loaded instead.
- **The previous values are needed** — to report what changed, to archive, to publish an event
  carrying them. Nothing was read; they are gone.
- **It is one row and it is already loaded.** Then it is a tracked change like any other and
  costs nothing extra.
- **The project does not really delete.** If the row is kept and marked instead, that is an
  update, not a delete.
- **The operation relies on automatic concurrency checks.** They do not run. Where concurrency
  matters, **put the expected token in the predicate** and compare the affected-row count with
  what the operation expected; the use case turns a mismatch into its `Result`. Do not wait for
  a `DbUpdateConcurrencyException` that will not come, and do not retry blindly over a conflict.

## The two behaviours that change the use case

**1. They execute immediately**, outside `SaveChangesAsync`. They join an existing transaction,
but **separate calls are not grouped into one by themselves**. When several writes must succeed
together — two statements, or one statement plus a tracked save — they go inside an explicit
transaction, which is exactly the exception `nzt-build-backend-dotnet-ef-core-writes` allows.

**2. They leave the change tracker stale.** An entity loaded before the call keeps its old
values in memory: a later save can overwrite the update, or target a row that no longer exists.
**Do not bulk-update or bulk-delete what this use case has already loaded.**

The safe shape is the simple one: **the bulk call is the write of that use case**, filtered by
the same criteria a query would use.

## What else does not run

Anything the project hangs off `SaveChanges` — save interceptors, the fields the context fills
in on save — **does not happen here**. If the project maintains such fields, they go in the
`SetProperty` chain explicitly, or those rows come out of the operation with the table's own
convention broken, and nothing reports it.

## What an update cannot do

- **It writes one table.** A single call cannot touch an entity and its related entity; those
  are two calls, and two calls that must land together need the explicit transaction.
- **The value comes from the row itself or from a constant.** Taking it from another entity
  means a subquery inside the expression, and once that gets hard to read, loading and updating
  normally is the better trade.

## On delete, the cascade is the database's, not EF's

This is the difference that surprises. When entities are loaded and removed, **EF cascades in
memory** according to the configured relationships. Here nothing is loaded, so what happens to
the related rows is decided by **the foreign key in the deployed database**:

- The FK is `ON DELETE CASCADE` → the children go too, and **EF never saw them**: no entity
  logic, no chance to stop it.
- The FK restricts → **the statement fails** with a foreign key violation.

If children restrict the delete, follow what the domain intends: reject the operation, reassign
them, or delete them **only when that deletion is part of the authorised operation**. A
constraint failure is not an authorisation to remove children, and related writes that must
succeed together need the transaction.

**Before writing one of these against a table others point at, read the delete behaviour in
both the entity configuration and the deployed schema.** The actual foreign key is what runs,
and the two can have drifted apart.

## Very large deletes

**Start with one filtered statement.** Batches are considered when measured lock duration, log
growth or timeouts justify them — neither strategy is universally faster — and only once
**partial progress is confirmed acceptable**, because separate batches commit separately.
Wrapping every batch in one transaction gives none of that independence and holds the locks
until the end.

A batch loop needs a stable scope, a positive batch size, deterministic key selection, and the
ordered `Take(n)` shape verified against this provider and version. **Never page with an
increasing `Skip` over rows being deleted** — the offset moves under the deletion and rows
survive silently. Every batch keeps the tenant and domain filters, the time cutoff is frozen
once, cancellation is passed to every call, the loop stops when nothing matches, and the work
is bounded when concurrent arrivals could keep it running. **If it stops halfway, the report
says how far it got.**

## Closing checklist

- [ ] The operation changes **rows by criterion**, not one loaded entity.
- [ ] No entity logic, previous value or archived copy was bypassed, and the project really
      deletes these rows rather than marking them.
- [ ] Required concurrency is in the predicate and checked against the affected-row count.
- [ ] The filter matches exactly the rows intended.
- [ ] Fields the project fills on save are set explicitly in the `SetProperty` chain.
- [ ] Mixed with tracked changes or another statement, there is an explicit transaction, and
      nothing touched in bulk was already loaded in this use case.
- [ ] For a delete, the deployed foreign keys were read and restricted children are handled the
      way the domain says.
- [ ] Batching, if any, is justified, translates on this provider, keeps its scope and
      terminates, and partial completion is reported.
- [ ] The rows-affected result is used where the operation needs to know, and the
      `CancellationToken` is passed.
