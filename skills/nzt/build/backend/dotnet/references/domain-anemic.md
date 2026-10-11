# Anemic domain model on .NET

**Read `../nzt-build/references/backend-domain-anemic.md` first.** It holds what the entity
is and is not, where the rules live, and why a shared rule is duplicated. This file holds only
what is .NET.

## The entity on .NET

A `sealed` class with **public `get; set;` properties**, its id, its foreign keys and its
navigations.

- **No extension methods giving it behaviour by the back door.**
- The rules run in `ExecuteAsync` or in a private method of the use case class.

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

## Closing checklist

- [ ] Entities are `sealed` with public `get; set;` properties, keys and navigations, and
      **no methods, no factories, no validation**.
- [ ] No extension method adds behaviour to an entity.
