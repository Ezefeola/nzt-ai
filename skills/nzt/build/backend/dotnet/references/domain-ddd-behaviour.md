# DDD entities on .NET: creating and changing

## Creating: `Create` returns errors and a nullable entity

**The constructor is private, empty, and the only way in is a static `Create`.**

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

The private setters are reachable there because that code is inside the type.

```csharp
public static (IReadOnlyList<string> Errors, Order? Order) Create(/* … */)
```

The use case checks the entity:

```csharp
(IReadOnlyList<string> errors, Order? order) = Order.Create(/* … */);
if (order is null)
{
    return Result<CreateOrderResponseDto>.Failure(HttpStatusCode.BadRequest, errors);
}
```

Checking for null keeps the compiler happy about nullability, so **no `!` is ever needed**.

## Changing

A mutating method **returns `IReadOnlyList<string>`** — empty means it worked. The input's
shape is checked by `<Operation>Validator`, before anything.

## Closing checklist

- [ ] The id is `int` or `Guid` unless typed ids are; the entity is `sealed`, with private
      setters and read-only collections.
- [ ] **Empty** private constructor, static `Create` returning `(errors, entity?)` and
      building with an object initializer, and the use case checks the entity for null.
- [ ] The file follows the order — constructor, `Rules`, `Errors`, **every property
      together**, `Create`, behaviour — and no member was appended at the end.
