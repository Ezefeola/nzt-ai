# LINQ

## Contents
- This skill is base .NET only
- Existence and counting
- Enumerate once
- Order of operations
- Lookups instead of nested loops
- `OfType<T>` filters by type and drops nulls
- Pick the operator that says what you mean
- Never return null for a sequence
- Closing checklist

Method syntax, always. Query syntax (`from x in xs select x`) is never used, not even for
joins and groupings: one syntax across a codebase means one thing to read.

## This skill is base .NET only

**Everything here ships with .NET.** If an operator needs a package, it does not belong
here, and provider translation is its own assessment — an `Async` suffix alone does not make
something a persistence API.

The distinction is not pedantry: it is what stops an EF Core call from being written where
EF Core is not installed, and what keeps this checklist verifiable on its own.

## Existence and counting

**On a materialised collection — `List<T>`, an array, anything with `Count` or `Length` —
use the property.**

```csharp
// no
if (lines.Any()) { }

// yes
if (lines.Count > 0) { }
```

This is a readability convention, not an allocation claim: modern .NET can answer a
parameterless `Any()` from a count without enumerating.

**On a lazy `IEnumerable<T>` it is the other way round**: `Any()` stops at the first element,
while `Count() > 0` can walk the whole sequence when the count is not directly available.

With a predicate, pass it to the operator instead of filtering first:

| Instead of | Write |
|---|---|
| `items.Where(p).Count()` | `items.Count(p)` |
| `items.Where(p).Any()` | `items.Any(p)` |
| `items.Where(p).FirstOrDefault()` | `items.FirstOrDefault(p)` |

## Enumerate once

**A chain is a recipe, not a result.** Enumerating it twice runs it twice — twice the work,
and with a changing source, twice a different answer.

```csharp
// no — filters twice
IEnumerable<Order> pending = orders.Where(order => order.IsPending);
int count = pending.Count();
Order first = pending.First();

// yes
List<Order> pending = orders.Where(order => order.IsPending).ToList();
int count = pending.Count;
Order first = pending[0];
```

Materialise **once**, when the result is needed more than once. Mid-chain, `ToList()` does
the opposite: it pulls the whole set into memory so the next operator can filter it. **Filter
first, materialise last.**

## Order of operations

Filter before sorting when that preserves the result, and place the projection according to
what the later operators need.

```csharp
// no
List<OrderLineDto> lines = order.Lines
    .OrderBy(line => line.Sku)
    .Where(line => line.Units > 0)
    .Select(line => line.ToOrderLineDto())
    .ToList();

// yes
List<OrderLineDto> lines = order.Lines
    .Where(line => line.Units > 0)
    .OrderBy(line => line.Sku)
    .Select(line => line.ToOrderLineDto())
    .ToList();
```

**Never move a filter across `Take`, `Skip` or a grouping**: there it changes which elements
are selected, and the result is wrong rather than slower. Treat the shape above as useful,
not universal.

## Lookups instead of nested loops

A repeated linear search over m candidates for n items costs O(n × m):

```csharp
// no — one scan of skus per line
foreach (OrderLine line in lines)
{
    if (skus.Any(sku => sku == line.Sku)) { }
}

// yes — one hash lookup per line
HashSet<string> skuSet = skus.ToHashSet();
foreach (OrderLine line in lines)
{
    if (skuSet.Contains(line.Sku)) { }
}
```

`ToDictionary` when the matching element is needed, `ToLookup` when the key can repeat.

## `OfType<T>` filters by type and drops nulls

`OfType<T>()` keeps what **is** a `T` and skips the rest; `Cast<T>()` throws on the first
element that is not one.

Its second use is the one that pays every day — **the non-null elements, typed, without a
single `!`**:

```csharp
// no
List<Order> found = ids.Select(FindOrder).Where(order => order is not null).Select(order => order!).ToList();

// yes
List<Order> found = ids.Select(FindOrder).OfType<Order>().ToList();
```

## Pick the operator that says what you mean

| Intent | Operator |
|---|---|
| The largest or smallest by a key | `MaxBy` / `MinBy`, never `OrderByDescending(...).First()` |
| Exactly one, and more than one is a bug | `SingleOrDefault` |
| The first, and more than one is fine | `FirstOrDefault` |
| Distinct by a field | `DistinctBy` |
| Batches of N | `Chunk` |
| Pair two sequences | `Zip` |
| Sort by the element itself | `Order` / `OrderDescending` |

`Single` and `First` throw on an empty sequence: use them only where empty is genuinely
impossible, and prefer handling the `null`.

## Never return null for a sequence

An empty collection is `[]` or `Enumerable.Empty<T>()`. **A null sequence turns every caller
into a null check that someone will forget.**

## Closing checklist

- [ ] Method syntax everywhere.
- [ ] No operator here needs a package — if it does, it is not this skill.
- [ ] `Count`/`Length` for a materialised collection, `Any()` for a lazy one, predicates
      passed to the operator.
- [ ] No chain enumerated twice, nothing materialised mid-chain.
- [ ] No filter moved across paging or grouping.
- [ ] No search inside a loop where a `HashSet`, `Dictionary` or `Lookup` does it in one pass.
- [ ] `MaxBy`/`MinBy` instead of ordering to take one, `OfType<T>()` instead of `!`.
- [ ] No method returns `null` in place of an empty sequence.
