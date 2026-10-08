# DDD entities: creating, changing and loading

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

Checking for null keeps the compiler happy about nullability, so **no `!` is ever needed**.

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

## Closing checklist

- [ ] Only the DDD pieces the stack says `yes` to; the id is a primitive unless typed ids
      are; the entity is `sealed`, with private setters and read-only collections.
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
