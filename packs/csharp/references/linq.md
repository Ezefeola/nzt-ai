# LINQ

Builds on `../nzt-code/references/collections.md` — read it first. In memory only: a query a
database runs is its data pack's (`nzt-dotnet`'s EF Core files).

## Rules

1. **Method syntax always**, joins and groupings included.
2. **Only operators that ship with .NET.** An `Async` suffix does not make something a
   persistence API.
3. **`Count`/`Length` on a materialised collection, `Any()` on a lazy `IEnumerable<T>`.**
4. **`OfType<T>()` to drop nulls**, never a `!` after a null filter:

   ```csharp
   List<Order> found = ids.Select(FindOrder).OfType<Order>().ToList();
   ```

5. **An empty sequence is `[]` or `Enumerable.Empty<T>()`.**

## Done when

Every rule holds for the LINQ you wrote.
