---
name: nzt-build-backend-dotnet-ef-core-queries
description: Use when reading data with EF Core - project to the response DTO inside the query, ask for exactly what the response needs, and keep the IQueryable inside the method that built it.
---

# EF Core queries — reading

This is **reading**. Two rules frame everything below:

> **Ask the database for exactly what the response needs — no more columns, no more rows, no
> more round trips.**
>
> **The `IQueryable` never leaves the method that built it** — the use case with direct
> persistence, the repository method where there is one. It is built, executed and
> materialised in the same place; what comes back out is a DTO or an entity.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-ef-core` before applying this.

## Project to the DTO inside the query

**The default is `Select` to the response DTO as part of the query**, so the database returns
only the columns the response carries: no `Include`, no entities materialised, nothing to
untrack because there is nothing tracked.

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

Note what the projection does for free: **a related field comes through the navigation without
`Include`**, and **a count comes back as a number instead of loading the collection**. That is
where a read is won.

Prefer an explicit projection over handing a whole entity to a mapping helper in the final
`Select`: the helper can run on the client and materialise more than intended. It is an
efficiency convention, not a ban — inspect which columns the projection actually needs.

## When loading the entity is the right call instead

Projection is the default, **not a prohibition**. Loading entities is justified when the read
genuinely cannot be expressed as one projected query — a result composed in memory from two
queries, or a case where the entity's data decides what to read next. **The bar is *the query
cannot express it*, not *this is more comfortable*.**

Then: load with `AsNoTracking()`, `Include` only what will be used, and map at the end.

**Sibling collection joins multiply rows**: 10 lines and 5 shipments on one order can come back
as 50. Nested `ThenInclude` chains are not automatically the same cross product. Consider
`AsSplitQuery()` when the duplication warrants it, weighing extra round trips, buffering and
consistency across separate reads — per query, not because two collections exist. If a
consistent snapshot is required, choose the query or isolation strategy the provider offers;
do not wrap every read in a transaction by default.

## Optional filters chain onto the query

A listing whose filters may or may not arrive is built step by step and executed once:

```csharp
IQueryable<Order> query = dbContext.Orders.AsNoTracking();

if (request.Status is not null)
{
    query = query.Where(order => order.Status == request.Status);
}
```

This is the readability convention, and it is not justified by claiming that `(filter == null
|| column == filter)` always plans badly: simplification and index use depend on the provider,
the parameters and the database. **A performance claim is settled with the generated SQL, the
actual plan and representative data**, never with the C# shape.

Keep filtering, ordering and paging **on the server, in that order**. Moving a filter after
`Take` changes what it means. Materialise only once the server-side work is done.

## The operator for the intent, and what each one costs

| Intent | Use | Not |
|---|---|---|
| Does it exist? | `AnyAsync` | `CountAsync() > 0`, or fetching the row to check for null |
| Get one by a unique key | `FirstOrDefaultAsync` | `SingleOrDefaultAsync`, which fetches a second row to prove there is none |
| Get one, absence is an error | `FirstOrDefaultAsync` + a failed `Result` | throwing from `FirstAsync` |
| How many? | `CountAsync` | materialising the list and counting it |
| A single value | `SumAsync`, `MaxAsync`, `MinAsync`… | bringing rows back to aggregate in memory |

`SingleOrDefaultAsync` earns its extra row only where duplicates are genuinely possible and
finding them matters — with a unique index in place, `First` is the honest one.

## Client evaluation is deliberate or it is a bug

From EF Core 3.0 on, a non-translatable helper may still run on the client **in the final
projection**; the same helper in a filter throws a translation exception unless the provider
translates it. **Never insert `AsEnumerable` or `ToListAsync` to make a translation failure go
away** — that moves the whole table into memory to run one comparison. When client computation
is genuinely necessary, select only its inputs and bound the result before materialising.

## Raw SQL

**LINQ is the normal path.** Raw SQL — `FromSql`, `SqlQuery`, `ExecuteSqlAsync` — is written
**only when LINQ cannot express the query**: an engine function EF does not translate, a CTE, a
window function. Forbidding it outright is worse: it pushes people to fetch extra rows and
filter in memory.

**Always parameterised.** The interpolated forms (`FromSql($"…{value}")`) parameterise the
holes; **string concatenation never appears in a query**, and neither does a value pasted into
the text.

## Closing checklist

- [ ] The query projects to its response DTO, with `AsNoTracking()`, and no `Include` where a
      projection would do.
- [ ] Any entity load is justified by the query being unable to express the read; single
      versus split query accounts for duplication, round trips and read consistency.
- [ ] Optional filters chain; filter, order and page ran on the server, in that order.
- [ ] The operator matches the intent: `AnyAsync` for existence, `FirstOrDefaultAsync` over
      `SingleOrDefaultAsync`, aggregates in the database.
- [ ] No materialisation added to hide a translation failure.
- [ ] Raw SQL only where LINQ cannot express it, and always parameterised.
- [ ] The `IQueryable` did not leave the method that built it.
