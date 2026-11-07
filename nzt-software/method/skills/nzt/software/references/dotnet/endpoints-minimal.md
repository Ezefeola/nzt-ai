# Minimal API endpoints

## Rules

1. **One `static class` per feature** whose only public member is a `Map<Feature>Endpoints`
   extension on `IEndpointRouteBuilder`.
2. **Every handler is a named `private static` method** in that class, never a lambda with a
   body inside `MapPost`.
3. **Dependencies are handler parameters**, never fields.

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

Every rule holds for the endpoints you wrote.
