# Value objects on .NET

Mapping is `ef-core-domain.md`.

## Rules

1. **A `sealed record`.**
2. **`init` properties**, filled by `Create`'s object initializer — unlike a DTO, nobody
   changes them after.
3. **An empty private constructor and a static `Create`** returning
   `(IReadOnlyList<string> Errors, T? Value)`.

```csharp
public sealed record DateRange
{
    private DateRange() { }

    public static class Errors { /* … */ }

    public DateOnly Start { get; init; }
    public DateOnly End { get; init; }

    public static (IReadOnlyList<string> Errors, DateRange? Range) Create(DateOnly start, DateOnly end)
    {
        // validate into errors, then:
        DateRange range = new() { Start = start, End = end };
        return ([], range);
    }
}
```

## Done when

Every rule holds for the value objects you wrote.
