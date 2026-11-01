# Minimal API endpoints

Builds on `../nzt-backend/references/api.md` and `api.md` here — read them first. An endpoint is
a function reachable over HTTP: route, verb and handler in one declaration. **This project has no
controllers; never add one.**

## Rules

1. **One `static class` per feature** whose only public member is a
   `Map<Feature>Endpoints` extension on `IEndpointRouteBuilder`.
2. **The group carries the prefix and `RequireAuthorization()`**, never repeated per route.
3. **Every handler is a named `private static` method** in that class — never a lambda with a
   body inside `MapPost`, which grows until it holds business logic.
4. **Dependencies are handler parameters**, never fields: the use case `[FromServices]`, every
   parameter with its attribute, the `CancellationToken` passed to the use case.
5. The body binds, calls once and translates the `Result` as the Result to HTTP axis says.

```csharp
public static class OrdersEndpoints
{
    public static void MapOrdersEndpoints(this IEndpointRouteBuilder builder)
    {
        RouteGroupBuilder group = builder
            .MapGroup("/orders")
            .RequireAuthorization();

        group.MapPost("/", CreateOrderAsync);
    }

    private static async Task<IResult> CreateOrderAsync(
        [FromBody] CreateOrderRequestDto request,
        [FromServices] ICreateOrder useCase,
        CancellationToken cancellationToken)
    {
        Result<CreateOrderResponseDto> result = await useCase.ExecuteAsync(request, cancellationToken);
        return result.ToHttpResult();
    }
}
```

## Done when

One endpoints class per feature with group-level prefix and authorisation, named static
handlers, and no controller in the project.
