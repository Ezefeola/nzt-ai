# EF Core queries — reading

Builds on `../nzt-backend/references/data-queries.md` — read it first.

## Rules

1. **A projection takes no `Include` and no `AsNoTracking()`**: a related field comes through
   the navigation, a count through `order.Lines.Count`.
2. **Loading entities**: `AsNoTracking()` and `Include` only what is used. `AsSplitQuery()`
   when sibling-collection duplication warrants it; nested `ThenInclude` chains are not
   automatically the same cross product.
3. **A non-translatable helper runs client-side only in the final projection**; in a filter it
   throws.
4. **Raw SQL** (`FromSql`, `SqlQuery`, `ExecuteSqlAsync`) in the interpolated forms, which
   parameterise the holes.

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

Every rule holds for the reads you wrote.
