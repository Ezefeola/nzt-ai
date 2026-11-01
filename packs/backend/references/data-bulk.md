# Data operations by criteria — update and delete as one statement

## Contents
- What the statement is
- When they are the right tool
- When they must not be used
- The two behaviours that change the operation
- What else does not run
- What an update cannot do
- On delete, the cascade is the database's
- Very large deletes
- Closing checklist

## What the statement is

An update or a delete by criteria turns a query into **one statement in the database**: nothing
is materialised, nothing is tracked, change detection never runs. Where the alternative is
loading N entities to change or remove each one, this skips the materialisation. **It is not a
promise of fewer round trips** — staged writes can be batched by the provider too; the gain is
not paying for the entities.

- **The filter is the query**, written like any other filter, and it can navigate
  relationships.
- **An update takes a value or an expression over the row itself** — price times 1.1 — which is
  what lets an increment happen without reading the current value first.
- **It returns the number of rows affected**, and that number answers *did anything match?*
  without a preceding existence query.

For a delete, **there is no undo and no confirmation step**: the filter is the whole safety of
the operation.

## When they are the right tool

**The operation changes or removes rows selected by a criterion, and needs nothing about each
row individually.** Expiring everything past a date, deactivating a set, reassigning a batch,
purging what was read long ago. The gain grows with the row count, and it is the whole
difference in an operation that would otherwise loop.

## When they must not be used

- **The entity's own logic has to run** — invariants, a state transition, a cascade the model
  owns. The statement **bypasses the model completely**. With a DDD model this is the normal
  case, and the reason the aggregate gets loaded instead.
- **The previous values are needed** — to report what changed, to archive, to publish an event
  carrying them. Nothing was read; they are gone.
- **It is one row and it is already loaded.** Then it is a staged change like any other and
  costs nothing extra.
- **The project does not really delete.** If the row is kept and marked instead, that is an
  update, not a delete.
- **The operation relies on automatic concurrency checks.** They do not run. Where concurrency
  matters, **put the expected token in the predicate** and compare the affected-row count with
  what the operation expected; the operation turns a mismatch into its Result. Do not wait for a
  concurrency failure that will not come, and do not retry blindly over a conflict.

## The two behaviours that change the operation

**1. They execute immediately**, outside the save. They join an existing transaction, but
**separate calls are not grouped into one by themselves**. When several writes must succeed
together — two statements, or one statement plus a staged save — they go inside an explicit
transaction, which is exactly the exception the data writes guidance allows.

**2. They leave what is in memory stale.** An entity loaded before the call keeps its old
values: a later save can overwrite the update, or target a row that no longer exists. **Do not
bulk-update or bulk-delete what this operation has already loaded.**

The safe shape is the simple one: **the statement is the write of that operation**, filtered by
the same criteria a query would use.

## What else does not run

Anything the project hangs off the save — save hooks, the fields filled in on save — **does
not happen here**. If the project maintains such fields, they are set explicitly in the
statement, or those rows come out of the operation with the table's own convention broken, and
nothing reports it.

## What an update cannot do

- **It writes one table.** A single call cannot touch an entity and its related entity; those
  are two calls, and two calls that must land together need the explicit transaction.
- **The value comes from the row itself or from a constant.** Taking it from another entity
  means a subquery inside the expression, and once that gets hard to read, loading and updating
  normally is the better trade.

## On delete, the cascade is the database's

This is the difference that surprises. When entities are loaded and removed, the library may
cascade in memory according to the configured relationships. Here nothing is loaded, so what
happens to the related rows is decided by **the foreign key in the deployed database**:

- The foreign key cascades → the children go too, and **the application never saw them**: no
  entity logic, no chance to stop it.
- The foreign key restricts → **the statement fails** with a foreign key violation.

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
ordered take-n shape verified against this provider and version. **Never page with an
increasing offset over rows being deleted** — the offset moves under the deletion and rows
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
- [ ] Fields the project fills on save are set explicitly in the statement.
- [ ] Mixed with staged changes or another statement, there is an explicit transaction, and
      nothing touched in bulk was already loaded in this operation.
- [ ] For a delete, the deployed foreign keys were read and restricted children are handled the
      way the domain says.
- [ ] Batching, if any, is justified, translates on this provider, keeps its scope and
      terminates, and partial completion is reported.
- [ ] The rows-affected result is used where the operation needs to know, and the cancellation
      is passed.
