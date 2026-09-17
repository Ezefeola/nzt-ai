---
name: nzt-build-backend-dotnet-domain-anemic
description: Use when the stack selects an anemic domain model and that model changes - entities that are data, rules that live in the use case, and the duplication that choice accepts on purpose.
---

# Anemic domain model

The domain axis says anemic, so **entities are data and the rules live in the use case**.
**This is a decision, not an omission**: the project has one place where anything is decided,
and it is the use case.

Where the files live is the architecture skill's business; the mapping is the ORM's.

Load `nzt-build-backend-dotnet` before applying this.

## The entity

A `sealed` class with **public `get; set;` properties**, its id, its foreign keys and its
navigations. Nothing else.

- **No methods.** Not even a small one that "just computes" something.
- **No private setters and no factory.** It is built and assigned like the data it is.
- **No validation inside it.** Whether the value is acceptable is decided before it arrives.
- **No extension methods giving it behaviour by the back door.** That is a rich model with
  extra steps, and it is exactly what this axis chose against.

Collections are initialised where they are declared, and relationships follow the ORM's
general rule: foreign key plus navigation.

## `Rules` and `Errors` still live on the entity

The logic runs in the use case, but **what the business fixed does not get copied into it**:

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

**This is not behaviour moving to the entity**: these are constants, the entity still has no
methods, and the checks still run in the use case — reading `Order.Rules.X` and returning
`Order.Errors.Y` instead of declaring their own.

It is what makes the duplication below survivable: **the logic is written twice, the value and
the message exist once.**

**The entity not holding the value does not move the rule.** An entity that stores a hash
never sees the password, and the minimum length is still what the business says about it.
What stays out is the failure naming no business concept — that belongs to the operation.

`Errors` carries text the user reads, so it stays in the story's language.

## The rules live in the use case

The use case validates its input in its validator, reads what it needs, **decides**, writes
and returns a `Result`. Everything the spec calls a business rule happens in `ExecuteAsync` or
in a private method of that class.

This holds together because **the use case is the whole operation**: reading it top to bottom
shows everything that happens, with no behaviour hidden in a type it touches.

## A rule two use cases need is duplicated

**Each use case carries its own copy.** Not a shared class, not a static helper, not a domain
service.

That is the deliberate trade: **each use case stays independent and readable on its own**, and
no change to one can break the other. The cost is real and worth naming — the same rule lives
in two places and someone has to change both.

**Nothing in the code links the two copies**, and that is on purpose: a link is a shared
class, which is what this axis rejects. So the copies stay correct only while **the rule they
implement is written down outside the code**, where changing it can name every place that
implements it.

**A rule that exists only as these two copies is the one that ends up half-updated.** So when
duplicating, the rule has to be one that was **stated**, not one inferred while writing the
second copy. **A rule with no stated source is a gap to report**, never something to paper
over with a shared helper.

## What does not happen here

- **No half-migration to a rich model.** One entity with methods "because this one was
  complex" gives a project with two models and no rule about which is which. If the project
  should be DDD, that is a stack change, taken once for the whole project, never inside one
  operation.
- **No anemic service layer either.** The use case is the layer; an `OrderService` wrapping it
  adds a name and no decision.
- **No rules in the mapper.** A mapper transforms data and decides nothing.

## Closing checklist

- [ ] Every business value and message is in the entity's `Rules` and `Errors`, and the use
      case cites them rather than declaring its own.
- [ ] Entities are `sealed` with public `get; set;` properties, keys and navigations, and
      **no methods, no factories, no validation**.
- [ ] No extension method adds behaviour to an entity.
- [ ] Every business rule of the operation is in the use case, and input validation in its
      validator.
- [ ] A rule shared with another use case was duplicated on purpose and **has a stated
      source**.
- [ ] No service layer wrapping the use case, and no rules in the mapper.
