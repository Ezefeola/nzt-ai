# EF Core writes — staging and saving

Builds on `../nzt-backend/references/data-writes.md` — read it first. Many rows by criteria is
`ef-core-bulk.md`.

## Rules

1. **Insert** with `Add`/`AddRange` (no bulk insert, no `DetectChanges`); **update** a tracked
   entity by changing its properties — **never `Update` on a tracked entity**, which writes every
   column; **delete** with `Remove`.
2. **One `SaveChangesAsync` at the end**, atomic under the default transaction.
3. **An explicit transaction is `await using` plus a commit**; disposal rolls back what was not
   committed — no catch for `RollbackAsync`.
4. **`SaveChangesAsync` is never in a `try/catch`**: no `catch (DbUpdateException) when (…)`, no
   catching `DbUpdateConcurrencyException`. Taken values are checked with `AnyAsync`; races reach
   `exceptions.md`.

```csharp
await using IDbContextTransaction transaction =
    await dbContext.Database.BeginTransactionAsync(cancellationToken);

await dbContext.Orders.Where(…).ExecuteUpdateAsync(…, cancellationToken);
await dbContext.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(cancellationToken);
```

## Done when

Updates change tracked entities without `Update`, each operation saves once, and nothing catches
the save.
