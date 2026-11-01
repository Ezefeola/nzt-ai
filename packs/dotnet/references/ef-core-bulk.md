# Set-based writes — `ExecuteUpdateAsync` and `ExecuteDeleteAsync`

Builds on `../nzt-backend/references/data-bulk.md` — read it first.

## Rules

1. **The filter is a `Where`; `SetProperty` takes a value or an expression over the row**
   (`SetProperty(p => p.Price, p => p.Price * 1.1m)`). The returned `int` is the affected count.
2. **No `DbUpdateConcurrencyException` will come**: the token goes in the `Where`.
3. **They run outside `SaveChangesAsync`** — mixed with it, the transaction of
   `ef-core-writes.md` — and leave the change tracker stale.
4. **Save interceptors and fields the context fills on save do not run**: those fields go in the
   `SetProperty` chain.
5. **EF cascades in memory only for loaded entities**; with `ExecuteDeleteAsync` an
   `ON DELETE CASCADE` foreign key takes children EF never saw.
6. In a batch loop, verify the ordered `Take(n)` shape on this provider; never an increasing
   `Skip` over rows being deleted.

```csharp
int updated = await dbContext.Orders
    .Where(order => order.Status == OrderStatus.Pending && order.DueOn < today)
    .ExecuteUpdateAsync(
        setters => setters
            .SetProperty(order => order.Status, OrderStatus.Expired)
            .SetProperty(order => order.ExpiredOn, now),
        cancellationToken);

int deleted = await dbContext.Notifications
    .Where(notification => notification.ReadOn != null && notification.ReadOn < cutoff)
    .ExecuteDeleteAsync(cancellationToken);
```

## Done when

Save-filled fields are set in the chain, the affected count is used where it matters, and the
token is passed.
