# Use cases on .NET

## Rules

1. **One public method, `ExecuteAsync`, returning `Result<TResponse>`** (`results-pattern.md`).
2. **A compensating catch ends in `throw;`.**
3. **Nothing from ASP.NET Core**: no `HttpContext`, `IActionResult` or `ProblemDetails`. The
   caller arrives through the project's injected caller abstraction.

```csharp
public interface ICreateOrder
{
    Task<Result<CreateOrderResponseDto>> ExecuteAsync(
        CreateOrderRequestDto request,
        CancellationToken cancellationToken);
}
```

## Done when

Every rule holds for the use cases you wrote.
