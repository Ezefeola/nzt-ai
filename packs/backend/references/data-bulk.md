# Data operations by criteria — update and delete as one statement

One statement in the database: nothing materialised or tracked. The filter is the query and
can navigate relationships; an update takes a value or an expression over the row
(`price * 1.1`). **A delete has no undo: the filter is its whole safety.**

## Use it when

The operation changes or removes rows **selected by a criterion and needs nothing about each
row** — expiring by date, deactivating a set, purging.

**Never when**: the entity's logic must run (invariants, transitions — the normal case with
DDD); the previous values are needed (report, archive, event); it is one row already loaded;
the project marks instead of deleting (that is an update).

## Rules

1. **The affected-row count answers *did anything match?*** Use it where it matters.
2. **Concurrency checks do not run**: put the expected token in the predicate and compare the
   affected count with the expected one; the operation turns a mismatch into its Result. No
   blind retry.
3. **It executes immediately, outside the save**, and separate calls are not grouped. Writes
   that must land together take the explicit transaction of `data-writes.md`.
4. **Never bulk-change what this operation already loaded**: what is in memory goes stale.
5. **Save hooks and fields filled on save do not run**: set those fields in the statement.
6. **An update writes one table**, from the row or a constant. Another table is another call
   in the same transaction; a hard-to-read subquery means load and update normally.
7. **On delete, the deployed foreign key decides the children** — cascade removes them
   unseen, restrict fails the statement: read the delete behaviour in the mapping **and** the
   deployed schema first. Restricted children follow the domain —
   reject, reassign, or delete only when that is part of the authorised operation.
8. **Very large deletes**: one filtered statement first; batches only when measured locks, log
   growth or timeouts justify them and partial progress is acceptable (each batch commits on
   its own). A batch loop keeps:
   - a stable scope with its tenant and domain filters;
   - a positive size and deterministic key selection verified on this provider;
   - a cutoff frozen once, the cancellation, a stop when nothing matches and a bound;
   - **never an increasing offset over rows being deleted**.

   Stopped halfway, report how far.

## Done when

Every rule holds, and the filter matches exactly the intended rows.
