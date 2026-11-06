# EF Core writes — staging and saving

## Rules

1. **Insert with `Add`/`AddRange`**, no `DetectChanges`.
2. **Update a tracked entity by changing its properties — never `Update`**, which writes
   every column.
3. **Delete with `Remove`.**
4. **An explicit transaction is `await using` plus a commit**: disposal rolls back, so no
   catch for `RollbackAsync`.
5. **No `catch (DbUpdateException)` or `DbUpdateConcurrencyException`** around
   `SaveChangesAsync`.

```csharp
await using IDbContextTransaction transaction =
    await dbContext.Database.BeginTransactionAsync(cancellationToken);

await dbContext.Orders.Where(…).ExecuteUpdateAsync(…, cancellationToken);
await dbContext.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(cancellationToken);
```

## Done when

Every rule holds for the writes you wrote.
