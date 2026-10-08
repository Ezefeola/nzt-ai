# Minimal API endpoints

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

Binding, one call, the return. That is the whole body:

- No validation — that is the use case's.
- No mapping — `<Entity>MappingExtensions` does it.
- No status code chosen here — it comes from the `Result`.
- No business logic and no `try/catch` for business errors.
- **No data access**: a handler never touches persistence.

**If the body has more than the call and the return, something that belongs somewhere else
ended up here.**

## Where the files live is not decided here

Folders, projects and layout belong to the architecture skill the stack selected. This skill
says **what a minimal API is for and how it is written**, never where it is put.

## Closing checklist

- [ ] One `static class` per feature with a single `Map<Feature>Endpoints` extension.
- [ ] Prefix and authorisation on the **group**, not repeated per route.
- [ ] Every handler is a named `private static` method — no inline lambda with a body.
- [ ] Dependencies and the token arrive as handler parameters, the use case as
      `[FromServices]`, every parameter with its binding attribute.
- [ ] The body binds, calls once and returns.
- [ ] **No controller anywhere in this project.**
- [ ] The `Result` is translated the way the Result-to-HTTP axis says.
