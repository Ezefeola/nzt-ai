# `PaginateAsync` — a page of a listing

Builds on `../nzt-backend/references/data-pagination.md` — read it first, with
`ef-core-queries.md`.

## Rules

1. **One extension over `IQueryable<T>`**, written once: `CountAsync` on the query as it arrives,
   then `Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(...)`, skipped when the
   count is zero.
2. **`PagedResponseDto<TItem>`** is the shared page; a paginated use case returns
   `Result<PagedResponseDto<XResponseDto>>`. `TotalCount` counts the filtered set.
3. **`PaginateAsync` does not order**: the query carries its `OrderBy`, ending in a unique column
   — usually `ThenBy(x => x.Id)`. The compiler cannot check it.
4. It trusts its arguments; the limits are the validator's (`validation.md`).

```csharp
public static async Task<PagedResponseDto<TItem>> PaginateAsync<TItem>(
    this IQueryable<TItem> query,
    int pageNumber,
    int pageSize,
    CancellationToken cancellationToken)

public sealed record PagedResponseDto<TItem>
{
    public IReadOnlyList<TItem> Items { get; set; } = [];
    public int TotalCount { get; set; }
}

PagedResponseDto<OrderSummaryResponseDto> page = await dbContext.Orders
    .Where(order => order.CustomerId == request.CustomerId)
    .OrderByDescending(order => order.CreatedOn)
    .ThenBy(order => order.Id)
    .Select(order => new OrderSummaryResponseDto { /* … */ })
    .PaginateAsync(request.PageNumber, request.PageSize, cancellationToken);
```

## Done when

Each paginated query is filtered, ordered with a unique tie-breaker and projected before
`PaginateAsync`, and returns the shared page type.
