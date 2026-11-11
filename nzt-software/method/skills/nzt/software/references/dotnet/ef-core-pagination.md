# `PaginateAsync` — a page of a listing

## Rules

1. **One `PaginateAsync` extension over `IQueryable<T>`**: `CountAsync`, then
   `Skip(...).Take(...).ToListAsync(...)`, skipped when the count is zero.
2. **`PagedResponseDto<TItem>` is the shared page**; a paginated use case returns
   `Result<PagedResponseDto<XResponseDto>>`.
3. **`PaginateAsync` does not order**: the query carries its `OrderBy`, ending in
   `ThenBy(x => x.Id)` or another unique column.

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

Every rule holds for the paginated reads you wrote.
