# EF Core queries — reading

Builds on `../nzt-backend/references/data-queries.md` — read it first. **The `IQueryable` never
leaves the method that built it.**

## Rules

1. **`Select` to the response DTO** by default: no `Include`, no `AsNoTracking()` (no entity in
   the result). A related field comes through the navigation and a count through
   `order.Lines.Count`. A mapping helper in the final `Select` may run client-side, and tracks
   the entity if it receives it.
2. **Loading entities** (when no projection can express the read): `AsNoTracking()`, `Include`
   only what is used, mapped at the end. `AsSplitQuery()` when sibling-collection duplication
   warrants it; nested `ThenInclude` chains are not automatically the same cross product.
3. **Optional filters** chain on an `IQueryable<T>` variable, each under its `if`.
4. **Operators**: `AnyAsync` for existence; `FirstOrDefaultAsync` by unique key, never
   `SingleOrDefaultAsync`; `FirstOrDefaultAsync` plus a failed `Result` when absence is an error,
   never `FirstAsync`; `CountAsync`; `SumAsync`/`MaxAsync`/`MinAsync` in the database.
5. **A non-translatable helper runs client-side only in the final projection**; in a filter it
   throws. Never add `AsEnumerable` or `ToListAsync` to silence that.
6. **Raw SQL** (`FromSql`, `SqlQuery`, `ExecuteSqlAsync`) only when LINQ cannot express it, with
   the interpolated forms that parameterise the holes.

```csharp
List<OrderSummaryResponseDto> orders = await dbContext.Orders
    .Where(order => order.CustomerId == request.CustomerId)
    .Select(order => new OrderSummaryResponseDto
    {
        Id = order.Id,
        CustomerName = order.Customer.Name,
        LineCount = order.Lines.Count,
    })
    .ToListAsync(cancellationToken);
```

## Done when

Reads project with `Select` or load untracked with only the `Include`s used, operators match the
intent, and no `IQueryable` leaves its method.
