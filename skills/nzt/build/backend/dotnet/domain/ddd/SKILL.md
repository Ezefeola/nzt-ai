---
name: nzt-build-backend-dotnet-domain-ddd
description: Use when the stack selects DDD and entities, aggregates or their behaviour change - the entity protecting its own invariants, Create returning errors, and only ids across aggregate boundaries.
---

# DDD entities and aggregates

The domain axis says DDD, so **the entity protects its own invariants**: what must always be
true about a thing is enforced by the thing itself, not by whoever happens to be using it.

- **This axis does not decide persistence.** Repository or direct handle is the persistence
  axis, and both work with everything below.
- How this is mapped belongs to `nzt-build-backend-dotnet-ef-core-domain`, and where the files
  live to the architecture skill.

Load `nzt-build-backend-dotnet` before applying this.

## Entity, aggregate, root

An **entity** has identity: two with the same values are still different things. **The id is a
primitive** — `int` or `Guid`. Wrapping it in its own type prevents mixing ids up but charges
a conversion at every boundary, every single time.

An **aggregate** is one or more entities that change together and must stay consistent
together. One of them is the **root**, and it is the only one the outside world names: an
order and its lines are one aggregate, and nothing loads a line on its own.

**The aggregate is the consistency boundary.** Everything inside it is true at the same time,
and it is what a use case loads, changes and saves as a unit.

Entities are `sealed`, properties have **private setters**, collections are exposed
read-only. **Anything that can change from outside without passing through a method is an
invariant nobody is protecting.**

## `Rules` and `Errors` live on the entity

Every value a business rule fixes and every message a broken rule produces is declared **on
the entity the rule is about**:

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

**Whatever layer evaluates the rule cites it from here and declares no constant of its own**:
the validator checking an input before any entity exists, the mapping declaring a column
length, the use case rejecting a duplicate. One rule, one definition.

**The entity not holding the value does not move the rule.** An entity that stores a hash
never sees the password, and the minimum length is still what the business says about it.

What stays out is **the failure that names no business concept** — a dependency that did not
answer, a permission the caller lacks. That belongs to the operation that hit it.

`Errors` carries text the user reads, so it stays in the story's language.

## Between aggregates, only the id

An aggregate **references another by its id and does not navigate to it**: `Order` carries
`CustomerId` and has no `Customer` property. Inside the aggregate, navigations are normal.

The foreign key is still mandatory; **what disappears is the navigation outwards.** Without
that, an `Include` can walk from any entity to any other and **the aggregate has no visible
edge left** — every query becomes a decision about how much of the model to drag along.

When a use case needs data from another aggregate, it queries for it. That is a second read,
and it is the honest cost of having boundaries.

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

**A property added later joins the properties.** Writing it next to the method that happens
to use it — `PasswordHash` sitting under `DefinePassword` because that method came second —
scatters the entity's state through its behaviour. **Adding a member is not appending to the
file.**

## Creating: `Create` returns errors and a nullable entity

**The constructor is private, empty, and the only way in is a static `Create`**, which
validates before building — an invalid entity never comes to exist.

**The constructor takes no parameters and assigns nothing** — `private StaffAccount() { }`.
It exists to stop anyone building the entity from outside, and it is what EF materialises
with. One listing every field is a second place that changes every time a property appears,
it says nothing `Create` does not already say, and at the call site
`(guid, name, email, 0, null)` tells nobody what each value is.

`Create` builds it with an **object initializer**, every value beside the name of what it is:

```csharp
StaffAccount account = new()
{
    Id = Guid.CreateVersion7(),
    Name = name.Trim(),
    Status = StaffAccountStatus.Active
};
```

The private setters are reachable there because that code is inside the type: **nothing is
made public for it**, and the entity stays unbuildable from outside.

```csharp
public static (IReadOnlyList<string> Errors, Order? Order) Create(/* … */)
```

The use case **checks the entity, not the list**:

```csharp
(IReadOnlyList<string> errors, Order? order) = Order.Create(/* … */);
if (order is null)
{
    return Result<CreateOrderResponseDto>.Failure(HttpStatusCode.BadRequest, errors);
}
```

Checking for null is what keeps the compiler happy about nullability, so **no `!` is ever
needed**.

## Changing: methods return the errors

A method that mutates an aggregate it already has **returns `IReadOnlyList<string>`** — empty
means it worked. There is no entity to hand back; the use case is holding it.

**Methods are named after the operation** — `Cancel`, `AddLine`, `Reschedule` — never
`SetStatus`. **A setter with a name is still a setter.**

Two consequences: **the domain never throws for an expected failure**, and **the domain never
knows about HTTP**. The status code is the use case's choice; messages come back as strings.

| Check | Where |
|---|---|
| The input's shape — required, length, format, range | `<Operation>Validator`, before anything |
| What must be true about the thing itself | The entity, in `Create` or the method |
| What depends on other aggregates or the outside | The use case, before calling the domain |

## The minimum aggregate: load what the operation needs

**The aggregate is the consistency boundary, not an obligation to materialise everything.** An
order with forty thousand lines is not loaded whole to cancel it. Load the part the operation
needs to decide and to change.

**The one guardrail**: an invariant computed over an entire collection — a total, a count, a
maximum — is **never** computed in memory over a collection that was loaded partially. **That
produces a model which reports itself consistent when it is not.**

Two ways out, and they are not equivalent:

1. **Compute the number in the database and pass it into the method.** The default.
2. **Load the collection whole** — only when there is no more performant way to get the
   answer.

Loading forty thousand lines to check one total is the same mistake as reading a whole table
to paginate it in memory.

## Closing checklist

- [ ] The id is a primitive; the entity is `sealed`, with private setters and read-only
      collections.
- [ ] References to other aggregates are **the id only**; navigations inside are fine.
- [ ] Every business value and message is in the entity's `Rules` and `Errors`, and no other
      layer declares its own.
- [ ] **Empty** private constructor, static `Create` returning `(errors, entity?)` and
      building with an object initializer, and the use case checks the entity for null.
- [ ] The file follows the order — constructor, `Rules`, `Errors`, **every property
      together**, `Create`, behaviour — and no member was appended at the end.
- [ ] Mutating methods are named after the operation and return the errors.
- [ ] No exceptions for expected failures, no HTTP, no `Result`, no persistence and no I/O
      inside the domain.
- [ ] Only the part of the aggregate the operation needs was loaded, and any invariant over a
      whole collection received a value computed in the database — or the collection was
      loaded whole because there was no faster way.
