# LINQ

Builds on `../nzt-code/references/collections.md` — read it first. This file holds only what is
LINQ, in memory: a query a database runs is its data pack's (`nzt-dotnet`'s EF Core files).

## Rules

1. **Method syntax always** — never query syntax, not even for joins or groupings.
2. **Only what ships with .NET.** An operator that needs a package does not belong here, and an
   `Async` suffix does not make something a persistence API.
3. **`Count`/`Length` on a materialised collection** (a readability convention — `Any()` would
   not enumerate either); **`Any()` on a lazy `IEnumerable<T>`**. Predicates go into the
   operator: `items.Count(p)`, `items.Any(p)`, `items.FirstOrDefault(p)`, never after a
   `Where`.
4. **`ToList()` once**, when the result is used more than once; never mid-chain.
5. **Lookups**: `ToHashSet()` for membership, `ToDictionary` for the matching element,
   `ToLookup` when the key repeats.
6. **`OfType<T>()`** keeps what is a `T` (`Cast<T>()` throws) — and gives the non-null elements
   typed, with no `!`:

   ```csharp
   List<Order> found = ids.Select(FindOrder).OfType<Order>().ToList();
   ```

7. **Operators for the intent**: `MaxBy`/`MinBy` (never `OrderByDescending(...).First()`),
   `SingleOrDefault` when two is a bug, `FirstOrDefault` when more is fine, `DistinctBy`,
   `Chunk` for batches, `Zip` to pair, `Order`/`OrderDescending` to sort by the element.
   Prefer handling `null` over `Single`/`First`, which throw on empty.
8. **An empty sequence is `[]` or `Enumerable.Empty<T>()`**, never `null`.

## Done when

Method syntax everywhere, no package operator, `OfType<T>()` instead of `!`, and no search in a
loop that a set or dictionary answers.
