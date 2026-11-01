# Set-based writes — `ExecuteUpdateAsync` and `ExecuteDeleteAsync`

Builds on `../nzt-backend/references/data-bulk.md` — read it first.

## Rules

1. **Fields the context fills on save** (interceptors, audit) go in the `SetProperty` chain.

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

Every rule holds for the statements you wrote.
