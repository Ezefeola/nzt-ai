# `PaginateAsync` — a page of a listing

**Read `../nzt-build/references/data-pagination.md` first.** It holds the two queries, the
1-based page, the shared page type, where paging goes in the chain, the ordering rule, why page
and size are validated and not corrected, and the cost. This file holds only what is .NET.

It is **an extension over `IQueryable<T>`**, written once:

```csharp
public static async Task<PagedResponseDto<TItem>> PaginateAsync<TItem>(
    this IQueryable<TItem> query,
    int pageNumber,
    int pageSize,
    CancellationToken cancellationToken)
```

`CountAsync` over the query as it arrives, then
`Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(…)`.

## The response

```csharp
public sealed record PagedResponseDto<TItem>
{
    public IReadOnlyList<TItem> Items { get; set; } = [];
    public int TotalCount { get; set; }
}
```

`TotalCount` is **the total matching the filters**, not the size of `Items`. A paginated use
case returns `Result<PagedResponseDto<XResponseDto>>` (`nzt-build-csharp-dtos`).

## Where it goes in the chain

```csharp
PagedResponseDto<OrderSummaryResponseDto> page = await dbContext.Orders
    .Where(order => order.CustomerId == request.CustomerId)
    .OrderByDescending(order => order.CreatedOn)
    .ThenBy(order => order.Id)
    .Select(order => new OrderSummaryResponseDto { /* … */ })
    .PaginateAsync(request.PageNumber, request.PageSize, cancellationToken);
```

> **`PaginateAsync` does not order. Every paginated query carries its own `OrderBy`, and the
> ordering ends in a unique column.**

The method takes a plain `IQueryable<T>`, so nothing enforces this at compile time. The tie
breaker is usually `ThenBy(x => x.Id)`. **`PaginateAsync` trusts its arguments**; the limits are
in `nzt-build-backend-dotnet-validation`.

## Closing checklist

- [ ] The query is filtered, **ordered** and projected to its DTO **before** `PaginateAsync`.
- [ ] The use case returns `Result<PagedResponseDto<TResponse>>`, with no per-feature paging
      wrapper declared.
- [ ] The `CancellationToken` was passed.
