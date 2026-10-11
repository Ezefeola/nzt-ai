# Repositories and unit of work on .NET

**Read `../nzt-build/references/backend-persistence-repositories.md` first.** It holds one
repository per root, results instead of queries, reads through it, what it does not do, the
unit of work as the single door and the only save. This file holds only what is .NET.

## The repository

`IOrderRepository` / `OrderRepository`, **never a generic `IRepository<T>`**:

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
```

`GetPendingForCustomerAsync`, `SearchAsync` — **never `Get(Expression<...>)`**, which is
`IQueryable` with an extra step. **No method returns an `IQueryable`.**

**A repository that calls `SaveChangesAsync` breaks the transaction.** Loading through
`GetByIdAsync` returns the aggregate **tracked**: changing it is enough, with no `Update`
call. `Add` and `Remove` are synchronous — they only stage.

## The unit of work

```csharp
public interface IUnitOfWork
{
    IOrderRepository Orders { get; }
    ICustomerRepository Customers { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
```

- The constructor of a use case takes `IUnitOfWork` and nothing else from persistence.
- It is registered scoped, like the handle.
- **`SaveChangesAsync` lives here and nowhere else.**
- The transaction, when two writes cannot be one save, is one method,
  `BeginTransactionAsync`, returning the handle `references/ef-core-writes.md` defines, which
  the use case commits with `await using`.

## Closing checklist

- [ ] One repository per aggregate root, its interface declaring only what is used, with no
      generic `IRepository<T>`.
- [ ] Methods named after the domain, none returning `IQueryable`.
- [ ] No repository saves, decides, or exposes the handle, and every async method takes the
      token.
- [ ] The use case injects `IUnitOfWork` only, and repositories are properties of it sharing
      one handle.
- [ ] `SaveChangesAsync` exists only here, is called once at the end, and catches nothing.
