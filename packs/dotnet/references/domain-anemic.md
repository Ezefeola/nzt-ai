# Anemic domain model on .NET

Builds on `../nzt-backend/references/domain-anemic.md` — read it first.

## Rules

1. **A `sealed` class with public `get; set;` properties**, its id, foreign keys and
   navigations — no extension methods adding behaviour.
2. **`Rules` and `Errors` are nested static classes**: `const` values, and `const` or
   `static readonly` messages citing them.
3. The rules run in the use case's `ExecuteAsync` or a private method of it.

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

    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
}
```

## Done when

Entities are `sealed` with public properties and nested `Rules`/`Errors`, and nothing adds them
behaviour.
