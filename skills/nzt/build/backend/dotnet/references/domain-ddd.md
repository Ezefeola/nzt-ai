# DDD entities and aggregates

## Contents
- Entity, aggregate, root
- `Rules` and `Errors` live on the entity
- Between aggregates, only the id
- The entity's layout, in this order

The domain axis says DDD, so **the entity protects its own invariants**: what must always be
true about a thing is enforced by the thing itself, not by whoever happens to be using it.

- **This axis does not decide persistence.** Repository or direct handle is the persistence
  axis, and both work with everything below.
- How this is mapped belongs to `nzt-build-backend-dotnet-ef-core-domain`, and where the files
  live to the architecture skill.

**The stack's DDD line decides how far this goes** — *aggregates · value objects · domain
events · typed ids*. A piece that is not `yes` is not built, and a missing line builds none:
no value object (the field stays primitive, checked by the entity), no domain event (a
reaction elsewhere is the use case's job), no id wrapper.

## Entity, aggregate, root

An **entity** has identity: two with the same values are still different things. **The id is a
primitive** — `int` or `Guid` — unless the stack says *typed ids yes*: wrapping it charges a
conversion at every boundary, every single time.

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
