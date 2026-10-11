# Minimal API endpoints

**Read `../nzt-build/references/backend-api.md` first** — what any endpoint does and never
does. This file holds how a minimal API is written.

**What the model is for:** an endpoint is a **function reachable over HTTP**. No class holding
state, no base type, no attribute ceremony — the route, the verb and the handler are one
declaration.

**This project has no controllers, and you do not add one.**

## A group per feature, and the routes in it

```csharp
public static class OrdersEndpoints
{
    public static void MapOrdersEndpoints(this IEndpointRouteBuilder builder)
    {
        RouteGroupBuilder group = builder
            .MapGroup("/orders")
            .RequireAuthorization();

        group.MapPost("/", CreateOrderAsync);
        group.MapGet("/{orderId}", GetOrderAsync);
    }
}
```

- **One `static class` per feature**, with **one extension method on `IEndpointRouteBuilder`**
  named `Map<Feature>Endpoints`. It is the only public member: registration is the class's
  whole API.
- **The group carries what is common to its routes** — the prefix and the authorisation
  requirement — so that adding a route does not mean remembering them.
- **A route is a route.** No conditional choosing a path, no routes registered in a loop.

## The handler is a named static method, never an inline lambda

```csharp
private static async Task<IResult> CreateOrderAsync(
    [FromBody] CreateOrderRequestDto request,
    [FromServices] ICreateOrder useCase,
    CancellationToken cancellationToken)
{
    Result<CreateOrderResponseDto> result = await useCase.ExecuteAsync(request, cancellationToken);
    return result.ToHttpResult();
}
```

**A lambda with a body inside `MapPost` cannot be read, cannot be named, and grows until
somebody puts business logic in it.** The method is `private static`, named after what it
does, and lives in the same class as its group.

## Dependencies arrive as parameters

Minimal APIs inject **per handler**, not per class: what the handler needs is a parameter, and
nothing is stored in a field. **That is the point of the model** — each endpoint declares
exactly what it uses, and an unused dependency is visible instead of hiding in a constructor.

The use case arrives as `[FromServices]`, and **every other parameter carries its binding
attribute too**; which one is in `nzt-build-backend-dotnet-api`, written once because the
rules are the same for both endpoint models. The `CancellationToken` is a parameter like the
rest — the one that takes no attribute — and it is passed to the use case.

## What never goes inside a handler

Binding, one call, the return — the generic list holds. **No data access**: a handler never
touches persistence, and the mapping is `<Entity>MappingExtensions`'s.

## Closing checklist

- [ ] One `static class` per feature with a single `Map<Feature>Endpoints` extension.
- [ ] Prefix and authorisation on the **group**, not repeated per route.
- [ ] Every handler is a named `private static` method — no inline lambda with a body.
- [ ] Dependencies and the token arrive as handler parameters, the use case as
      `[FromServices]`, every parameter with its binding attribute.
- [ ] The body binds, calls once and returns.
- [ ] **No controller anywhere in this project.**
- [ ] The `Result` is translated the way the Result-to-HTTP axis says.
