# Data operations by criteria — update and delete as one statement

One statement in the database: nothing materialised or tracked, no change detection. The gain
is not paying for the entities (staged writes can batch too). The filter is the query and can
navigate relationships; an update takes a value or an expression over the row (`price * 1.1`);
**the affected-row count answers *did anything match?*** A delete has no undo: the filter is
its whole safety.

## Use it when

The operation changes or removes rows **selected by a criterion and needs nothing about each
row** — expiring by date, deactivating a set, purging.

**Never when**: the entity's logic must run (invariants, transitions — the normal case with
DDD); the previous values are needed (report, archive, event); it is one row already loaded;
the project marks instead of deleting (that is an update).

## Rules

1. **Concurrency checks do not run**: put the expected token in the predicate and compare the
   affected count with the expected one; the operation turns a mismatch into its Result. No
   blind retry.
2. **It executes immediately, outside the save**, and separate calls are not grouped. Several
   writes that must land together (two statements, or one plus a save) take the explicit
   transaction `data-writes.md` allows.
3. **What is in memory goes stale**: never bulk-change what this operation already loaded.
   The statement *is* the operation's write.
4. **Save hooks and fields filled on save do not run**: set those fields in the statement.
5. **An update writes one table**, from the row or a constant. Another table is another call
   (and a transaction); a hard-to-read subquery means load and update normally.
6. **On delete, the deployed foreign key decides the children**: cascade removes them unseen,
   restrict fails the statement. Read the delete behaviour in the mapping **and** the deployed
   schema first. Restricted children follow the domain — reject, reassign, or delete only
   when that is part of the authorised operation.
7. **Very large deletes**: one filtered statement first; batches only when measured locks, log
   growth or timeouts justify them and partial progress is acceptable (each batch commits on
   its own — not all in one transaction). A batch loop keeps a stable scope with its tenant
   and domain filters, a positive size, deterministic key selection verified on this
   provider, a cutoff frozen once, the cancellation, a stop when nothing matches and a bound;
   **never an increasing offset over rows being deleted**. Stopped halfway, report how far.

## Done when

The filter matches exactly the intended rows, nothing bypassed needed the model or the old
values, mixed writes share a transaction, deployed foreign keys were read for a delete, and
the affected count is used where it matters.
