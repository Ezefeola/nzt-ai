# DDD entities and aggregates on .NET

Builds on `../nzt-ddd/references/ddd.md` — read it first. Mapping is `ef-core-domain.md`.

## Rules

1. **The id is `int` or `Guid`**, unless typed ids.
2. **Entities are `sealed`, properties have private setters**, collections are exposed
   read-only.
3. **`Rules` and `Errors` are nested static classes**: `const` values, messages `const` or
   `static readonly` citing them.
4. **One constructor: private, empty, assigning nothing**. EF materialises with it; a
   constructor listing every field is a second place to change.
5. **`Create` is static, validates, then builds with an object initializer**, returning
   `(IReadOnlyList<string> Errors, T? Entity)`. The use case checks the entity for `null`.
6. **A mutating method returns `IReadOnlyList<string>`**, empty when it worked.
7. **Layout**: constructor · `Rules` · `Errors` · properties · `Create` · behaviour.

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

Every rule holds for the entities you wrote.
