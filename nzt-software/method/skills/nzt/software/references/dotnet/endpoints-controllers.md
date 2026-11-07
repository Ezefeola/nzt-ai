# Controller endpoints

## Rules

1. **`[ApiController]` always**, **`sealed`, inheriting `ControllerBase`** — never
   `Controller`, which brings views.
2. **`[Route]` on the class, a verb attribute per action.**
3. **No constructor and no fields**: each action takes its dependencies as parameters. Nothing
   from `HttpContext.RequestServices`, no property injection.

```csharp
[ApiController]
[Route("orders")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateAsync(
        [FromBody] CreateOrderRequestDto request,
        [FromServices] ICreateOrder useCase,
        CancellationToken cancellationToken)
    {
        Result<CreateOrderResponseDto> result = await useCase.ExecuteAsync(request, cancellationToken);
        return result.ToActionResult();
    }
}
```

## Done when

Every rule holds for the controllers you wrote.
