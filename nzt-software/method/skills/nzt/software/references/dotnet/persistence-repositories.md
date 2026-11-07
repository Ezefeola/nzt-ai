# Repositories and unit of work on .NET

## Rules

1. **`IOrderRepository` / `OrderRepository`**, never a generic `IRepository<T>`, a
   `Get(Expression<...>)` or an `IQueryable` return.
2. **`GetByIdAsync` returns the aggregate tracked**: changing it is enough, with no `Update`.
3. **`Add` and `Remove` are synchronous.**
4. **`IUnitOfWork` exposes the repositories and the one `SaveChangesAsync`**, registered scoped
   like the context.
5. **When two writes cannot be one save**, `BeginTransactionAsync` returns the transaction of
   `ef-core-writes.md`.

```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<PagedResponseDto<OrderSummaryResponseDto>> SearchAsync(
        SearchOrdersRequestDto request,
        CancellationToken cancellationToken);

    void Add(Order order);
    void Remove(Order order);
}

public interface IUnitOfWork
{
    IOrderRepository Orders { get; }
    ICustomerRepository Customers { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
```

## Done when

Every rule holds for the repositories you wrote.
