# DDD entities and aggregates on .NET

**Read `../nzt-build/references/backend-domain-ddd.md` first.** It holds the entity, the
aggregate and its root, `Rules` and `Errors`, the id between aggregates, the layout, creation,
change and the minimum aggregate. This file and `domain-ddd-behaviour.md` hold only what is
.NET.

How this is mapped belongs to `nzt-build-backend-dotnet-ef-core-domain`.

## The entity on .NET

The id is `int` or `Guid`. Entities are `sealed`, properties have **private setters**,
collections are exposed read-only.

Between aggregates, without the navigation outwards, an `Include` cannot walk from one
aggregate into another.

## `Rules` and `Errors`

```csharp
public sealed class Order
{
    public static class Rules
    {
        public const int ReferenceMaximumLength = 32;
        public const int MinimumLineCount = 1;
    }

    public static class Errors
    {
        public const string ReferenceIsRequired = "El pedido necesita una referencia";

        public static readonly string TooFewLines =
            $"El pedido necesita al menos {Rules.MinimumLineCount} línea";
    }
```

## The entity's layout, in this order

```csharp
public sealed class StaffAccount
{
    private StaffAccount() { }                          // 1 · empty, and the only one
    public static class Rules { /* … */ }               // 2
    public static class Errors { /* … */ }              // 3

    public Guid Id { get; private set; }                // 4 · every property, together
    public string Name { get; private set; }
    public string? PasswordHash { get; private set; }

    public static (IReadOnlyList<string> Errors, StaffAccount? Account) Create(/* … */)  // 5
    public void DefinePassword(string passwordHash) { } // 6 · behaviour, after it
}
```

Creating and changing on .NET continue in `domain-ddd-behaviour.md`.
