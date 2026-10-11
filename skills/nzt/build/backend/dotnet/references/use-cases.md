# Use cases on .NET

**Read `../nzt-build/references/backend-use-cases.md` first.** It holds what a use case is,
when it validates, the uniqueness check, the two allowed `try/catch` and who decides the
status. This file holds only what is .NET.

## The shape

```csharp
public interface ICreateOrder
{
    Task<Result<CreateOrderResponseDto>> ExecuteAsync(
        CreateOrderRequestDto request,
        CancellationToken cancellationToken);
}
```

- **One public method, `ExecuteAsync`.**
- **It always returns `Result<TResponse>`** (`references/results-pattern.md`).
- A failed validation is never `ModelState`.

## The .NET names of the generic rules

- **The uniqueness check uses `AnyAsync` with the `CancellationToken`.**
- The compensating catch ends in `throw;`.
- **Never around `SaveChangesAsync` or a query** — no `catch … when`.
- The status is the `HttpStatusCode` inside `Result`.
- A use case never builds `IActionResult` or `ProblemDetails`, never maps by hand —
  `<Entity>MappingExtensions` does — and **never reads `HttpContext`**.

## Closing checklist

- [ ] One class per operation, named after the operation, **with no suffix**, its interface
      in its own file, and a single `ExecuteAsync`.
- [ ] Returns `Result<TResponse>`, always.
- [ ] Uniqueness is checked with `AnyAsync` through the selected persistence, outside the
      validator, with the token, and the predicate excludes self on updates.
- [ ] No `HttpContext`, no ASP.NET response types, no hand-written mapping, no exceptions for
      expected failures.
