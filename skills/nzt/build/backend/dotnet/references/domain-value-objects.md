# Value objects on .NET

**Read `../nzt-build/references/backend-domain-value-objects.md` first.** It holds when a
value earns one, its shape, where it lives in the model and where the file goes. This file
holds only what is .NET.

The mapping belongs to `nzt-build-backend-dotnet-ef-core-domain`.

## How it is written

**A `sealed record`, immutable, with an empty private constructor and a static `Create`**
that validates first:

```csharp
public sealed record DateRange
{
    private DateRange() { }

    public static class Errors { /* … */ }

    public DateOnly Start { get; init; }
    public DateOnly End { get; init; }

    public static (IReadOnlyList<string> Errors, DateRange? Range) Create(
        DateOnly start,
        DateOnly end)
    {
        // validate, then:
        DateRange range = new() { Start = start, End = end };
    }
}
```

- **`record` for equality by value**: two `DateRange` with the same dates compare equal
  without writing `Equals`.
- **The constructor is empty and takes no parameters**, like the aggregate's.
- **Properties are `init`, never settable afterwards.** `init` is what lets the object
  initializer fill it while keeping it immutable to everyone outside `Create`.
- **No public constructor and no `Create` that skips validation.**

The caller **checks the value for null**, never the error list, so no `!` is needed.

## Where the file goes

```
Entities/
  Orders/
    Order.cs
    OrderLine.cs
    ValueObjects/
      DeliveryWindow.cs      <- only Orders uses it
Common/
  ValueObjects/
    Money.cs                 <- Orders and Invoices use it
```

A folder named after a type collides with it as a namespace segment.

## Closing checklist

- [ ] `sealed record`, `init` properties, immutable: modifying means creating another.
- [ ] **Empty** private constructor, static `Create` returning `(errors, value?)` and
      building with an object initializer, and no other way in.
- [ ] The caller checks the value for null, not the error list.
