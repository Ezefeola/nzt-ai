---
name: nzt-build-csharp
description: Use when writing or changing C# in any component, backend or frontend: the language rules this project holds to, written as prohibitions because a prohibition is verifiable and a preference is not.
---

# Writing C#

**Read `../nzt-build/references/code-code.md` first, required.** It holds the rules of code in
any language: English with the glossary's names, one type per file, no folder named after a
type, the member order, absence handled, async, control flow, no magic literals and reflection.
This skill holds only what is C#.

These are **project rules written as prohibitions on purpose**. They hold in every component;
Blazor adds only what differs, in its own guidance. **In a foreign component these rules step
aside**, as `code-code.md` says.

| When the code touches | Read, in this skill's folder, before writing it | Read with |
|---|---|---|
| A DTO or its mapping extensions: what a use case returns, what a typed client sends | `references/dtos.md` | `../nzt-build/references/code-dtos.md` — first, required |
| A collection read, transformed or checked in memory (EF Core execution is the area's) | `references/linq.md` | `../nzt-build/references/code-collections.md` — first, required |

A file naming `nzt-build-csharp-<name>` means `references/<name>.md` here — not a skill.

## Files, types and namespaces

- **File-scoped namespaces**, nothing nested.
- **`sealed` by default.** Unsealing later is free; re-sealing a class that something
  already inherits from is not.
- **A folder name never matches a type name.** The folder becomes part of the namespace and
  the compiler resolves the name to the namespace, which makes the type impossible to
  import.

The domain model's own order: `../nzt-build-backend-dotnet/references/domain-ddd.md`.

## Never a primary constructor

Not for injection, not for DTOs, not for records, not for structs.

```csharp
// no
public sealed class CreateOrder(IOrderStore store) { }

// yes
public sealed class CreateOrder
{
    private readonly IOrderStore _store;

    public CreateOrder(IOrderStore store)
    {
        _store = store;
    }
}
```

## Never `var`

Every declaration carries its type, including `foreach` variables and anything coming out of
a LINQ chain.

```csharp
// no
var total = order.Lines.Sum(line => line.Amount);

// yes
decimal total = order.Lines.Sum(line => line.Amount);
```

The type is the cheapest documentation there is, and the first to go stale in silence.

## Usings: explicit, always

- No `global using` written by you, no `using static`, no alias usings.
- **No fully qualified type names in the body** — a qualified name there is a missing using.

A file has to be readable on its own, and each of these moves that information somewhere
else.

**`ImplicitUsings` and `Nullable` stay as the SDK ships them.** What the SDK imports is the
baseline of the language, identical in every .NET project; the rule above is about what
*this* project adds on top. Turning the defaults off is not a stricter reading of it, it is
a different rule nobody wrote. **These conventions govern the code you write, never the
`.csproj` defaults.**

## Nullability

- **`!` is forbidden.** If a value can be null, validate it and handle it; if it cannot, the
  type should say so.
- **Zero nullable warnings.** A warning here is a `NullReferenceException` that has not
  happened yet.

```csharp
// no
Customer customer = await FindAsync(id, ct)!;

// yes
Customer? customer = await FindAsync(id, ct);
if (customer is null)
{
    return CustomerNotFound(id);
}
```

## Async

- **Never `async void`.** The language allows it for event handlers; there are none here.
- **Take a `CancellationToken` wherever the caller can give one, and pass it down.**
- **Never `.Result`, `.Wait()` or `.GetAwaiter().GetResult()`.** Always `await`.

## Control flow

A `switch` expression or pattern matching where a chain would appear.

```csharp
// no
if (order is not null)
{
    if (order.IsOpen) { ... } else { ... }
}

// yes
if (order is null) return OrderNotFound(id);
if (!order.IsOpen) return OrderClosed(order.Id);
```

## No magic strings, and no magic numbers

A literal that means something gets a name — a `const`, an enum, or a member of a static
class of names.

## Types for data

`record` for data types, **with explicit properties, never positional**, and `struct` where
value semantics apply. Where the file lives and what it is allowed to carry is not decided
here: that is `references/dtos.md`.

## Reflection is exceptional

**Reaching for `GetType()`, `GetProperty` or `GetValue` to read something off an object is
the symptom of a missing abstraction.**

## Closing checklist

- [ ] File-scoped namespace, one top-level type, file named after it, `sealed` unless
      something inherits.
- [ ] No primary constructors; dependencies are `readonly` fields set in a constructor.
- [ ] No `var`.
- [ ] No `global using`, `using static`, alias usings or qualified names in the body, and
      `ImplicitUsings` left as it came.
- [ ] No `!`, and zero nullable warnings.
- [ ] No `async void`, no `.Result`/`.Wait()`; tokens taken and propagated.
