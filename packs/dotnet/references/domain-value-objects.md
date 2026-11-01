# Value objects on .NET

Builds on `../nzt-ddd/references/value-objects.md` — read it first. Mapping is
`ef-core-domain.md`.

## Rules

1. **A `sealed record`** — equality by value without writing `Equals`.
2. **`init` properties**: the object initializer in `Create` fills them, and nobody changes them
   after.
3. **An empty private constructor and a static `Create`** that validates first and returns
   `(IReadOnlyList<string> Errors, T? Value)`; no public constructor. The caller checks the value
   for `null`.
4. **Files**: `Entities/<Aggregate>/ValueObjects/` while one aggregate uses it,
   `Common/ValueObjects/` once two do.

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

Every value object is a `sealed record` with `init` properties, built only through `Create`, in
the right `ValueObjects/` folder.
