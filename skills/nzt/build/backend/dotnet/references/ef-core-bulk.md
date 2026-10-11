# Set-based writes — `ExecuteUpdateAsync` and `ExecuteDeleteAsync`

**Read `../nzt-build/references/data-bulk.md` first.** It holds when a statement by criteria is
the right tool and when it must not be used, that it executes immediately and leaves memory
stale, what does not run, what an update cannot do, the cascade of the deployed foreign key and
very large deletes. This file holds only what is EF Core.

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

- **`SetProperty` takes a value or an expression over the row itself** —
  `SetProperty(p => p.Price, p => p.Price * 1.1m)`.
- The filter is a `Where`.

## `ExecuteDeleteAsync`

```csharp
int deleted = await dbContext.Notifications
    .Where(notification => notification.ReadOn != null && notification.ReadOn < cutoff)
    .ExecuteDeleteAsync(cancellationToken);
```

## In EF Core terms

- Concurrency: do not wait for a `DbUpdateConcurrencyException` that will not come.
- They execute outside `SaveChangesAsync`; the transaction is the exception
  `nzt-build-backend-dotnet-ef-core-writes` allows. **They leave the change tracker stale.**
- Save interceptors and the fields the context fills in on save do not run: those fields go in
  the `SetProperty` chain explicitly.
- When entities are loaded and removed, **EF cascades in memory**; with `ExecuteDeleteAsync`,
  an FK with `ON DELETE CASCADE` takes the children and **EF never saw them**.
- In a batch loop, the ordered `Take(n)` shape is verified against this provider and version.
  **Never page with an increasing `Skip` over rows being deleted.**

## Closing checklist

- [ ] Fields the project fills on save are set explicitly in the `SetProperty` chain.
- [ ] The rows-affected result is used where the operation needs to know, and the
      `CancellationToken` is passed.
