# EF Core writes — staging and saving

A write is **changes staged on tracked entities and saved once**. What the save cannot express
set-based — many rows by criteria — belongs to `nzt-build-backend-dotnet-ef-core-bulk`.

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
to make the failure path longer. Unexpected failures propagate to the global handler. **Never
commit after a failure, and never commit each step on its own** — a later failure would leave
half the work done.

## Check before saving, never catch the save

**What the save could reject is checked before it, and fails as a `Result`**: a value already
taken with `AnyAsync`, a stale version against the one the client sent, dependants before a
delete. The constraint in the database stays — it is what makes the rule true.

**`SaveChangesAsync` is not wrapped in a `try/catch`.** A competing write can still pass the
check; when it does, the exception propagates to the global handler
(`nzt-build-backend-dotnet-exceptions`), which answers with a clear message by exception type.

- **No `catch (DbUpdateException) when (…)`** to turn the race into the pre-check's `Result`.
- **No classifier of provider errors**: no error numbers, no constraint names, no matching on
  the message text.
- **`DbUpdateConcurrencyException` is not caught either.** With a concurrency token, the
  version is compared before saving; the token only catches the race, and the race goes to
  the handler.

Idempotency is its own policy, decided per operation.

## Closing checklist

- [ ] Entities to modify were loaded tracked, with no redundant `Update` call, and read-only
      queries carried `AsNoTracking()`.
- [ ] Nothing was loaded without a use; many rows by criteria went to a bulk statement.
- [ ] One `SaveChangesAsync` at the end, with the token, and no manual transaction around it.
- [ ] An explicit transaction exists only for an unavoidable multi-write, commits only after
      success, and is disposed on failure without a catch that only rethrows.
- [ ] What the save could reject was checked before it and failed as a `Result`, with the
      database constraint still in place.
- [ ] `SaveChangesAsync` is not inside a `try/catch`; races and unknown failures reach the
      global handler, and nothing classifies provider errors.
