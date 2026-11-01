# DDD entities and aggregates on .NET

Builds on `../nzt-ddd/references/ddd.md` — read it first. Mapping is `ef-core-domain.md`.

## Rules

1. **The id is `int` or `Guid`** (unless typed ids); entities are `sealed`, properties have
   **private setters**, collections are exposed read-only. Without outward navigations, an
   `Include` cannot walk into another aggregate.
2. **`Rules` and `Errors` are nested static classes** — `const` values, messages `const` or
   `static readonly` citing them.
3. **One constructor: private, empty, assigning nothing** — it stops outside construction and is
   what EF materialises with. A constructor listing every field is a second place to change and
   an unreadable call site.
4. **`Create` is static, validates, then builds with an object initializer** (the private
   setters are reachable inside the type), returning `(IReadOnlyList<string> Errors, T? Entity)`.
   The use case checks the entity for `null` — so no `!`.
5. **A mutating method returns `IReadOnlyList<string>`**, empty when it worked.
6. **Layout**: constructor · `Rules` · `Errors` · every property · `Create` · behaviour.

```csharp
public sealed class StaffAccount
{
    private StaffAccount() { }

    public static class Rules { /* … */ }
    public static class Errors { /* … */ }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public StaffAccountStatus Status { get; private set; }

    public static (IReadOnlyList<string> Errors, StaffAccount? Account) Create(string name)
    {
        // validate into errors, then:
        StaffAccount account = new()
        {
            Id = Guid.CreateVersion7(),
            Name = name.Trim(),
            Status = StaffAccountStatus.Active
        };
        return ([], account);
    }

    public IReadOnlyList<string> Deactivate() { /* … */ }
}

// in the use case
(IReadOnlyList<string> errors, StaffAccount? account) = StaffAccount.Create(request.Name);
if (account is null)
{
    return Result<CreateStaffAccountResponseDto>.Failure(HttpStatusCode.BadRequest, errors);
}
```

## Done when

Entities are `sealed` with private setters and an empty private constructor, `Create` returns
`(errors, entity?)` checked for `null`, methods return their errors, and the layout holds.
