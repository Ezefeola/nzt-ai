---
name: nzt-csharp
description: Use when tech.md lists the csharp pack, before writing or changing C# in any component - the language rules this project holds to, written as prohibitions so they can be checked, plus DTOs and LINQ in C#.
---

# Writing C#

Load `nzt-code` first: its rules hold here too, and this pack adds only what is C#. A
framework pack (`nzt-blazor`…) adds only what differs from these.

## References

| The code touches | Read |
|---|---|
| A DTO or its mapping | `references/dtos.md` |
| A collection read, transformed or checked in memory (database execution is the data pack's) | `references/linq.md` |

Each file names the `nzt-code` file it builds on: read that one first.

## Rules

1. **File-scoped namespaces**, one top-level type per file, **`sealed` by default** —
   unsealing later is free, re-sealing something already inherited is not.
2. **Never a primary constructor** — not for injection, DTOs, records or structs.
   Dependencies are `private readonly` fields set in an explicit constructor.
3. **Never `var`.** Every declaration carries its type, `foreach` and LINQ results included.
4. **Usings explicit**: no `global using` of your own, no `using static`, no alias usings, no
   fully qualified names in the body. `ImplicitUsings` and `Nullable` stay as the SDK ships
   them: these rules govern the code you write, never the `.csproj` defaults.
5. **Never `!`, and zero nullable warnings.** A value that can be null is checked and
   handled; one that cannot says so in its type.
6. **Never `async void`, `.Result`, `.Wait()` or `.GetAwaiter().GetResult()`.** Take a
   `CancellationToken` wherever the caller can give one, and pass it down.
7. **Guard clauses, a `switch` expression or pattern matching** where an `if` chain would
   appear.
8. **`record` for data, with explicit properties, never positional**; `struct` where value
   semantics apply.

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

- [ ] File-scoped namespace, one type, `sealed` unless something inherits.
- [ ] No primary constructors, no `var`.
- [ ] No `global using`, `using static`, alias usings or qualified names; `ImplicitUsings`
      as it came.
- [ ] No `!`, zero nullable warnings.
- [ ] No `async void`, `.Result` or `.Wait()`; tokens taken and passed down.
- [ ] `nzt-code`'s rules hold too.
