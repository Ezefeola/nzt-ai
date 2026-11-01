# Controller endpoints

Builds on `../nzt-backend/references/api.md` and `api.md` here — read them first. A controller
groups one feature's operations, with attribute routing and the MVC pipeline. **This project has
no minimal API endpoints; never add one.**

## Rules

1. **`[ApiController]` always** (automatic binding and `400` on a malformed body), **`sealed`,
   inheriting `ControllerBase`** — never `Controller`, which brings views.
2. **`[Route]` on the class, a verb attribute per action, `[Authorize]` at class level.**
3. **No constructor and no fields**: each action takes the use case `[FromServices]`, every
   parameter with its attribute, and the `CancellationToken` passed down. Nothing from
   `HttpContext.RequestServices`, no property injection.
4. **One action per use case**; a controller outgrowing its feature is two.
5. The body binds, calls once and translates the `Result` as the Result to HTTP axis says — no
   `Ok()`, `NotFound()` or `StatusCode(...)` by hand.

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

Every controller is a `sealed` `[ApiController]` with class-level route and authorisation, no
constructor, one action per use case, and no minimal API in the project.
