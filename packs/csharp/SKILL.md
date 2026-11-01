---
name: nzt-csharp
description: Use when tech.md lists the csharp pack, before writing or changing C# in any component - the language rules this project holds to, written as prohibitions so they can be checked, plus DTOs and LINQ in C#.
---

# Writing C#

Load `nzt-code` first: its rules hold here, and these add only what is C#. A framework pack
(`nzt-blazor`…) adds only what differs from these.

## References

| The code touches | Read |
|---|---|
| A DTO or its mapping | `references/dtos.md` |
| A collection read, transformed or checked in memory (database execution is the data pack's) | `references/linq.md` |

Each file names the `nzt-code` file it builds on: read that one first.

## Rules

1. **File-scoped namespaces.**
2. **`sealed` by default**: unsealing later is free, re-sealing something inherited is not.
3. **Never a primary constructor**, in any type. Dependencies are `private readonly` fields
   set in an explicit constructor.
4. **Never `var`**, `foreach` and LINQ results included.
5. **Explicit usings**: no `global using` of your own, no `using static`, no alias usings, no
   fully qualified names in the body.
6. **`ImplicitUsings` and `Nullable` stay as the SDK ships them** in the `.csproj`.
7. **Never `!`.**
8. **Never `async void`, `.Result`, `.Wait()` or `.GetAwaiter().GetResult()`.**
9. **Data is a `record`**; a `struct` only where value semantics apply.

```csharp
// no
public sealed class CreateOrder(IOrderStore store) { }
var customer = await FindAsync(id, ct)!;

// yes
public sealed class CreateOrder
{
    private readonly IOrderStore _store;

    public CreateOrder(IOrderStore store)
    {
        _store = store;
    }
}

Customer? customer = await FindAsync(id, ct);
if (customer is null) return CustomerNotFound(id);
```

## Done when

Every rule holds for the C# you wrote, and `nzt-code`'s too.
