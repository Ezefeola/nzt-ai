# EF Core writes — staging and saving

**Read `../nzt-build/references/data-writes.md` first.** It holds loading only what is used, one
save at the end, when an explicit transaction is justified and how it closes, and checking
before saving instead of catching the save. This file holds only what is EF Core.

A write is **changes staged on tracked entities and saved once**. Many rows by criteria belong
to `nzt-build-backend-dotnet-ef-core-bulk`.

## One entity at a time

- **Insert:** `Add`, or `AddRange` for several. Neither is a database bulk insert, and neither
  runs `DetectChanges`.
- **Update:** load it **tracked**, change the properties, save. **`Update` is not called on an
  entity that is already tracked** — it marks every property as modified and writes columns the
  operation never touched.
- **Delete:** `Remove` on the loaded entity.

## One `SaveChangesAsync`, at the end

With the default automatic transaction, that save is atomic. When an explicit transaction is
needed it is **an `await using` and a commit**, over whatever the persistence axis puts in
front of the context:

```csharp
await using IDbContextTransaction transaction =
    await dbContext.Database.BeginTransactionAsync(cancellationToken);

await dbContext.Orders.Where(…).ExecuteUpdateAsync(…, cancellationToken);
await dbContext.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(cancellationToken);
```

An uncommitted relational transaction **rolls back when `await using` disposes it**. Do not add
a catch just to call `RollbackAsync`.

## Never catch the save

**`SaveChangesAsync` is not wrapped in a `try/catch`.** The race goes to
`nzt-build-backend-dotnet-exceptions`. The value already taken is checked with `AnyAsync`.

- **No `catch (DbUpdateException) when (…)`** to turn the race into the pre-check's `Result`.
- **`DbUpdateConcurrencyException` is not caught either.**

## Closing checklist

- [ ] Entities to modify were loaded tracked, with no redundant `Update` call, and read-only
      queries carried `AsNoTracking()`.
- [ ] One `SaveChangesAsync` at the end, with the token, and no manual transaction around it.
- [ ] `SaveChangesAsync` is not inside a `try/catch`; races and unknown failures reach the
      global handler, and nothing classifies provider errors.
