---
name: nzt-build-backend-dotnet-domain-value-objects
description: Use when the project uses value objects and one is written or changed - what earns one, the sealed record with a private constructor and Create, and where the file goes.
---

# Value objects

A value object is **a value that has rules**: an email, an amount with its currency, a date
range, a tax id. It has no identity and no life of its own — **two with the same content are
the same thing.**

Only in projects whose domain axis is DDD **and whose stack says *value objects yes*** in its
DDD line. Without it, none is written. The mapping belongs to
`nzt-build-backend-dotnet-ef-core-domain`.

Load `nzt-build-backend-dotnet` before applying this.

## When something earns one

Two questions:

1. **Does the value have rules that must hold everywhere it appears?** An email that has to be
   well formed, a range whose end cannot precede its start, an amount that cannot be negative.
2. **Do two of them with the same content mean the same thing?** If yes, it is a value. If it
   needs to be told apart from an identical one, it is an entity.

**What does not earn one**: a plain string with no rule, or a value whose only rule is
*required* — that one is the validator's job, once, at the entry point.

What it buys is that **the rule is checked in one place and cannot be skipped**. A `string
email` is validated wherever someone remembers to; an `Email` is valid because it exists.

## How it is written

**A `sealed record`, immutable, with an empty private constructor and a static `Create`**
that validates first — the same shape, and the same order, as an aggregate:

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

- **`record` for equality by value**, which is the whole point: two `DateRange` with the same
  dates compare equal without writing `Equals`.
- **The constructor is empty and takes no parameters**, like the aggregate's: one place
  assigns the values, and that place is `Create`, by name.
- **Properties are `init`, never settable afterwards.** A value object is never modified —
  **changing it is creating another one** and assigning it. `init` is what lets the object
  initializer fill it while keeping it immutable to everyone outside `Create`.
- **No public constructor and no `Create` that skips validation**, or an invalid instance
  exists and the type stops being a guarantee.
- **Members in one order**: constructor, `Rules` and `Errors` if it has them, every property
  together, `Create`, then its behaviour. A property added later joins the properties.

The caller **checks the value for null**, never the error list, so no `!` is needed.

## Where they live in the model

A value object is **a property of an entity**, and it may hold others. It is not loaded on its
own, not queried on its own, and has no id.

Behaviour about the value goes **inside** it — `range.Overlaps(other)`, `money.Add(other)` —
returning new values, never mutating. That behaviour is the reason the concept exists rather
than being three loose fields.

**They do not cross to the outside**: a DTO carries the plain fields and the conversion
happens at the edge of the use case. **Exposing a value object in a contract makes an internal
decision part of the API.**

## Where the file goes

Decided by **how many aggregates use it**:

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

**The folder is `ValueObjects/`, plural, always** — a folder named after a type collides with
it as a namespace segment.

Where the domain's root sits is the architecture skill's business; what is fixed here is the
shape inside it. And a value object **moves to the shared folder the moment a second aggregate
uses it** — it is never copied.

## Closing checklist

- [ ] It has rules of its own and equality by content — otherwise it is an entity or a plain
      field.
- [ ] It lives in a `ValueObjects/` folder: inside its aggregate if only that one uses it, in
      the shared area if more than one does.
- [ ] `sealed record`, `init` properties, immutable: modifying means creating another.
- [ ] **Empty** private constructor, static `Create` returning `(errors, value?)` and
      building with an object initializer, and no other way in.
- [ ] Members in order, with every property together.
- [ ] The caller checks the value for null, not the error list.
- [ ] Its behaviour lives inside it and returns new values.
- [ ] It has no id, is not queried on its own, and does not appear in a DTO.
