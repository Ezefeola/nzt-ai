# Use cases on .NET

Builds on `../nzt-backend/references/use-cases.md` — read it first.

## Rules

1. **One public method, `ExecuteAsync`, returning `Result<TResponse>`** (`results-pattern.md`)
   with the `CancellationToken`; its interface in its own file.
2. **Uniqueness uses `AnyAsync`** with the token.
3. A compensating catch ends in `throw;`; nothing catches around `SaveChangesAsync` or a query —
   no `catch … when`.
4. The status is the `HttpStatusCode` in the `Result`; a failed validation is never `ModelState`.
5. Never `HttpContext`, `IActionResult` or `ProblemDetails`; mapping is
   `<Entity>MappingExtensions`.

```csharp
public interface ICreateOrder
{
    Task<Result<CreateOrderResponseDto>> ExecuteAsync(
        CreateOrderRequestDto request,
        CancellationToken cancellationToken);
}
```

## Done when

Every use case exposes one `ExecuteAsync` returning `Result<TResponse>`, checks uniqueness with
`AnyAsync`, and touches nothing from ASP.NET.
