---
name: nzt-build-backend-dotnet-ef-core-writes
description: Use when an operation stages entity changes and saves them - insert, update and delete on tracked entities, one SaveChangesAsync at the end, and the write conflicts worth recognising.
---

# EF Core writes — staging and saving

A write is **changes staged on tracked entities and saved once**. What the save cannot express
set-based — many rows by criteria — belongs to `nzt-build-backend-dotnet-ef-core-bulk`.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-ef-core` before applying this.

## One entity at a time

- **Insert:** `Add`, or `AddRange` for several, as a readability convention. Neither is a
  database bulk insert, and neither runs `DetectChanges`.
- **Update:** load it **tracked**, change the properties, save. **`Update` is not called on an
  entity that is already tracked** — it marks every property as modified and writes columns the
  operation never touched.
- **Delete:** `Remove` on the loaded entity.

**Nothing is loaded that is not going to be used.** Loading an entity to check that it exists,
to count its children, or only to delete it pays a full materialisation for an answer the
database could have given directly — that is a query, or a bulk statement.

## One `SaveChangesAsync`, at the end

**Accumulate the changes and save once.** With a transaction-capable provider and the default
automatic transaction, that save is atomic; **do not add a manual transaction or turn that
default off**. The guarantee covers that save — not earlier reads, not external side effects.

An explicit transaction is written **only when a use case cannot avoid two writes that must
land together**: it needs a database-generated id before it can build the next step, or it
mixes a bulk call with tracked changes. That is the exception, it is visible, and it is worth a
comment saying why.

When it is needed it is **an `await using` and a commit**, over whatever the persistence axis
puts in front of the context:

```csharp
await using IDbContextTransaction transaction =
    await dbContext.Database.BeginTransactionAsync(cancellationToken);

await dbContext.Orders.Where(…).ExecuteUpdateAsync(…, cancellationToken);
await dbContext.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(cancellationToken);
```

An uncommitted relational transaction **rolls back when `await using` disposes it**. Do not add
a catch just to call `RollbackAsync`, log and rethrow: that is three lines whose only effect is
to make the failure path longer. Unexpected failures propagate to centralised handling. **Never
commit after a failure, and never commit each step on its own** — a later failure would leave
half the work done.

## Recognise the known write conflict, hide nothing else

The uniqueness pre-check (`AnyAsync`) and the unique index both stay: the check gives the
caller a real message, the index is what makes the rule true. **A competing write can still
pass the check**, so the violation is recognised at save and turned into the operation's
agreed `Result`.

- **Use the provider's documented codes and the constraint identity.** A generic duplicate code
  alone may not say *which* rule failed, and **matching on the message text breaks the day the
  server is installed in another language**. Where identification stays ambiguous, keep the
  technical error rather than guessing.
- **With direct persistence**, catch at the save boundary in the use case and keep the provider
  recognition in a focused classifier that does not query and does not wrap the context.
- **With a unit of work**, the recognition lives in its persistence implementation and comes
  out as a typed conflict; **the use case still owns the business `Result`.**

**Not every `DbUpdateException` is a duplicate.** Connection failures, other constraints,
cancellation and unknown errors keep their own handling. A uniqueness violation is
provider-specific and is **not** `DbUpdateConcurrencyException`; optimistic concurrency and
idempotency are their own policy, decided per operation.

## Closing checklist

- [ ] Entities to modify were loaded tracked, with no redundant `Update` call, and read-only
      queries carried `AsNoTracking()`.
- [ ] Nothing was loaded without a use; many rows by criteria went to a bulk statement.
- [ ] One `SaveChangesAsync` at the end, with the token, and no manual transaction around it.
- [ ] An explicit transaction exists only for an unavoidable multi-write, commits only after
      success, and is disposed on failure without a catch that only rethrows.
- [ ] The uniqueness pre-check and the index are both in place, and the known violation is
      recognised by code and constraint, never by message text.
- [ ] Unknown failures kept their meaning and reached centralised handling.
