# EF Core queries — reading

**Read `../nzt-build/references/data-queries.md` first.** It holds projecting inside the
query, when loading the entity is justified, optional filters, the operator for the intent,
materialising to hide a translation failure, raw queries and why the unexecuted query stays
where it was built. This file holds only what is EF Core.

> **The `IQueryable` never leaves the method that built it** — the use case with direct
> persistence, the repository method where there is one.

## Project with `Select`

**The default is `Select` to the response DTO as part of the query**: no `Include`, no entities
materialised, nothing to untrack.

```csharp
List<OrderSummaryResponseDto> orders = await dbContext.Orders
    .AsNoTracking()
    .Where(order => order.CustomerId == request.CustomerId)
    .Select(order => new OrderSummaryResponseDto
    {
        Id = order.Id,
        CustomerName = order.Customer.Name,
        LineCount = order.Lines.Count,
    })
    .ToListAsync(cancellationToken);
```

Here **a related field comes through the navigation without `Include`**, and the count through
`order.Lines.Count`. A mapping helper in the final `Select` can run on the client.

## Loading the entity

When the read cannot be expressed as a projection: load with `AsNoTracking()`, `Include` only
what will be used, and map at the end. Nested `ThenInclude` chains are not automatically the
same cross product as sibling collections. Consider `AsSplitQuery()` when the duplication
warrants it.

## Optional filters

```csharp
IQueryable<Order> query = dbContext.Orders.AsNoTracking();

if (request.Status is not null)
{
    query = query.Where(order => order.Status == request.Status);
}
```

Moving a filter after `Take` changes what it means.

## The operator for the intent, and what each one costs

| Intent | Use | Not |
|---|---|---|
| Does it exist? | `AnyAsync` | `CountAsync() > 0`, or fetching the row to check for null |
| Get one by a unique key | `FirstOrDefaultAsync` | `SingleOrDefaultAsync`, which fetches a second row to prove there is none |
| Get one, absence is an error | `FirstOrDefaultAsync` + a failed `Result` | throwing from `FirstAsync` |
| How many? | `CountAsync` | materialising the list and counting it |
| A single value | `SumAsync`, `MaxAsync`, `MinAsync`… | bringing rows back to aggregate in memory |

## Client evaluation

From EF Core 3.0 on, a non-translatable helper may still run on the client **in the final
projection**; the same helper in a filter throws a translation exception unless the provider
translates it. **Never insert `AsEnumerable` or `ToListAsync` to make a translation failure go
away.**

## Raw SQL

**LINQ is the normal path.** Raw SQL — `FromSql`, `SqlQuery`, `ExecuteSqlAsync` — is written
**only when LINQ cannot express the query**. The interpolated forms (`FromSql($"…{value}")`)
parameterise the holes.

## Closing checklist

- [ ] The query projects to its response DTO, with `AsNoTracking()`, and no `Include` where a
      projection would do.
- [ ] The operator matches the intent: `AnyAsync` for existence, `FirstOrDefaultAsync` over
      `SingleOrDefaultAsync`, aggregates in the database.
- [ ] Raw SQL only where LINQ cannot express it, and always parameterised.
- [ ] The `IQueryable` did not leave the method that built it.
