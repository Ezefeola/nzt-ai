# C# language rules

`code/code.md` holds here too; these add only what is C#. A framework (`blazor`) adds only
what differs from these.

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

Every rule holds for the C# you wrote, and `code/code.md`'s too.
