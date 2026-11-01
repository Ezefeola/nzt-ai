# Repositories and unit of work on .NET

Builds on `../nzt-backend/references/persistence-repositories.md` — read it first.

## Rules

1. **`IOrderRepository` / `OrderRepository`, never a generic `IRepository<T>`**; methods named
   after the domain, never `Get(Expression<...>)`, and **none returns `IQueryable`**.
2. **`GetByIdAsync` returns the aggregate tracked**: changing it is enough, with no `Update`.
   `Add` and `Remove` are synchronous — they only stage. No repository calls
   `SaveChangesAsync`.
3. **`IUnitOfWork` exposes the repositories and the one `SaveChangesAsync`**; registered scoped,
   like the context. The use case's constructor takes it and nothing else from persistence.
4. When two writes cannot be one save, one `BeginTransactionAsync` returns the transaction
   `ef-core-writes.md` defines, committed by the use case with `await using`.

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

No generic repository or `IQueryable` return, no save outside `IUnitOfWork`, and every use case
injects only `IUnitOfWork`.
