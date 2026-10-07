---
name: nzt-build-backend-dotnet-ef-core-pagination
description: Use when a read returns a page of results - one PaginateAsync extension written once, called after the projection, over a query that always ends its ordering in a unique column.
---

# `PaginateAsync` — a page of a listing

Paging is the same three steps in every listing — count, skip, take — so it is written
**once**, as an extension over `IQueryable<T>`, and every paginated read calls it.

```csharp
public static async Task<PagedResponseDto<TItem>> PaginateAsync<TItem>(
    this IQueryable<TItem> query,
    int pageNumber,
    int pageSize,
    CancellationToken cancellationToken)
```

It runs **two queries**: `CountAsync` over the query as it arrives — same filters, no paging —
and then the page itself, `Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(…)`.
If the count comes back zero the second query is not run and the items come back empty.
**`pageNumber` is 1-based**: page 1 is the first page, there is no page 0.

Load `nzt-build-backend-dotnet`, `nzt-build-backend-dotnet-ef-core` and
`nzt-build-backend-dotnet-ef-core-queries` before applying this.

## The response

```csharp
public sealed record PagedResponseDto<TItem>
{
    public IReadOnlyList<TItem> Items { get; set; } = [];
    public int TotalCount { get; set; }
}
```

`TotalCount` is **the total matching the filters**, not the size of `Items` — it is what lets a
client say how many pages there are.

This generic type is **the one shared response DTO in the project**: everything else is one DTO
per use case (`nzt-build-csharp-dtos`), and a paginated use case returns
`Result<PagedResponseDto<XResponseDto>>` instead of declaring its own paging wrapper.

## Where it goes in the chain

**After the projection.** Filter → order → `Select` to the DTO → `PaginateAsync`. So `TItem` is
the response DTO, and both the count and the page are computed over the projected query.

```csharp
PagedResponseDto<OrderSummaryResponseDto> page = await dbContext.Orders
    .AsNoTracking()
    .Where(order => order.CustomerId == request.CustomerId)
    .OrderByDescending(order => order.CreatedOn)
    .ThenBy(order => order.Id)
    .Select(order => new OrderSummaryResponseDto { /* … */ })
    .PaginateAsync(request.PageNumber, request.PageSize, cancellationToken);
```

**Never call it on a query that materialised first**: paging over an already-fetched list pays
for every row and then throws most of them away.

## The ordering rule

> **`PaginateAsync` does not order. Every paginated query carries its own `OrderBy`, and the
> ordering ends in a unique column.**

The method takes a plain `IQueryable<T>`, so nothing enforces this at compile time — it is on
whoever writes the query, and it is the one mistake that matters here.

Without an order the database may return rows in any order it likes, and `Skip`/`Take` then
hands out pages that **overlap and skip rows**: the same record appears on pages 2 and 3 while
another is never seen. **With twenty rows in development it looks perfect**, because small
tables tend to come back in insertion order; it breaks in production, intermittently, and reads
like a data problem rather than a query problem.

Ordering by a non-unique column fails the same way at the page boundary: ten orders share a
date and the tie is broken differently on each query. **So the ordering ends in something
unique** — usually `ThenBy(x => x.Id)`.

## Page and size are validated, not corrected

**`PaginateAsync` trusts its arguments.** It does not clamp, default or fix anything.

The limits belong to the operation's validator (`nzt-build-backend-dotnet-validation`), which
the use case runs first: `pageNumber` at least 1, `pageSize` at least 1 and **under a maximum
the project sets**. A request outside those bounds comes back as a failed `Result` saying so.

That is deliberate: **a `pageSize` of 10000 silently served as 100 leaves the caller believing
it got everything**, and the bug surfaces as missing data somewhere else entirely.

## Cost

Two round trips per page, and on a large table the count is the expensive one — it applies the
whole filter to produce a number nobody reads row by row. That is the accepted trade for being
able to say *page 3 of 47*, and it is why the items query is skipped when the count is zero.

## Closing checklist

- [ ] The query is filtered, **ordered** and projected to its DTO **before** `PaginateAsync`.
- [ ] The ordering exists and **ends in a unique column**.
- [ ] `pageNumber` is 1-based, and both values are validated in the operation's validator — the
      method corrects nothing.
- [ ] The use case returns `Result<PagedResponseDto<TResponse>>`, with no per-feature paging
      wrapper declared.
- [ ] Nothing was materialised before the call.
- [ ] The `CancellationToken` was passed.
