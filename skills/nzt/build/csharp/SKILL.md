---
name: nzt-build-csharp
description: Use when writing or changing C# in any component, backend or frontend: the language rules this project holds to, written as prohibitions because a prohibition is verifiable and a preference is not.
---

# Writing C#

These are **project rules written as prohibitions on purpose**: a prohibition is verifiable
and a preference is not. They hold in every component; Blazor adds only what differs, in its
own guidance.

**In a foreign component — one this project's `Docs/` does not document — you write the way
that code is written and these rules step aside.** This set is installed globally and will
see repositories that are not its own.

Load this before any area skill applies. If you did not arrive here from an area router,
load that router too.

## Everything you write is in English

Type names, members, parameters, locals, files, folders and comments, whatever language the
spec is in. The specs, the glossary and the artifacts in `Plan/` stay in the project's
language: **you are the boundary where the term lands in English code.**

- **The translation is not yours to invent.** `Docs/glossary.md` carries the code name of
  every domain term; if it is there, that is the name. If it is missing, look for the
  established name first and ask before coining one. A translation invented here and a
  different one invented next month are the same term with two names.
- What is not a domain term — a local, a helper, a private method — you name yourself.
- **The one exception is text the user reads**: labels, messages and validation copy come
  from the story, in the story's language, and are never translated.

## Files, types and namespaces

- **File-scoped namespaces**, nothing nested.
- **`sealed` by default.** Unsealing later is free; re-sealing a class that something
  already inherits from is not.
- **One top-level type per file**, and the file is named after it.
- **A folder name never matches a type name.** The folder becomes part of the namespace and
  the compiler resolves the name to the namespace, which makes the type impossible to
  import. For an `Order` type the folder is `Orders`.

## Members in one order, and each group together

Inside a type: **nested types · constants and static fields · instance fields ·
constructors · properties · methods**, public before private. Each group is contiguous.

**A member added later joins its group.** Declaring it beside the method that uses it, or at
the end of the file because that is where the file ended, scatters a type's state through
its behaviour — and it is the most common way this order breaks, because the member is
usually written in the same edit as the method that needed it. **Adding a member is not
appending to the file.**

The domain model fixes its own order on top of this, and inside an entity or a value object
that one wins: `nzt-build-backend-dotnet-domain-ddd`.

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
- **Take a `CancellationToken` wherever the caller can give one, and pass it down** — to the
  next method, the ORM, the HTTP call. A token that stops halfway is the same as no token.
- **Never `.Result`, `.Wait()` or `.GetAwaiter().GetResult()`.** Always `await`.
- If what you call is async, your method is async, all the way up.

## Control flow

**No nested if/else.** Guard clauses and early return, and a `switch` expression or pattern
matching where a chain would appear.

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

Nesting is where the case nobody wrote hides.

## No magic strings, and no magic numbers

A literal that means something gets a name — a `const`, an enum, or a member of a static
class of names. Keys, claims, headers, policies, states and routes, and numbers that mean
something too.

## Types for data

`record` for data types, **with explicit properties, never positional**, and `struct` where
value semantics apply. Where the file lives and what it is allowed to carry is not decided
here: that is `nzt-build-csharp-dtos`.

## Reflection is exceptional

**Reaching for `GetType()`, `GetProperty` or `GetValue` to read something off an object is
the symptom of a missing abstraction.** Give the type the surface the code is asking for.

The cases where reflection is genuinely right are rare, and **you do not decide alone: if
you are not sure yours is one, ask before writing it.** Reflection a package does for you is
not yours.

## Closing checklist

- [ ] Every identifier, file, folder and comment in English, with domain terms taking the
      name `Docs/glossary.md` gives them.
- [ ] User-facing text in the story's language, as the story wrote it.
- [ ] File-scoped namespace, one top-level type, file named after it, `sealed` unless
      something inherits.
- [ ] No folder named after a type.
- [ ] Members in order with each group contiguous, and nothing appended at the end of the
      file.
- [ ] No primary constructors; dependencies are `readonly` fields set in a constructor.
- [ ] No `var`.
- [ ] No `global using`, `using static`, alias usings or qualified names in the body, and
      `ImplicitUsings` left as it came.
- [ ] No `!`, and zero nullable warnings.
- [ ] No `async void`, no `.Result`/`.Wait()`; tokens taken and propagated.
- [ ] No nested if/else, no meaningful literal left unnamed.
- [ ] No hand-written reflection, and a doubtful case was asked rather than decided alone.
