---
name: nzt-build-backend-dotnet-endpoints-controllers
description: Use when the stack selects controllers and an ASP.NET Core endpoint is written or changed - one controller per feature, no constructor, and every action declaring what it needs.
---

# Controller endpoints

**What the model is for:** a controller is a **class that groups the operations of one
feature**, with routing declared as attributes and the MVC pipeline — binding, filters,
conventions — around it.

**This project has no minimal API endpoints, and you do not add one.**

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-api` before applying this.

## One controller per feature

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

- **`[ApiController]` always.** It is what makes binding and the `400` on a malformed body
  automatic; without it the class is a half-configured controller.
- **`sealed`, inheriting `ControllerBase`** — never `Controller`, which drags in view support
  this API does not use.
- **`[Route]` on the class, verb attributes on the actions.** The route is declared, never
  composed in code.
- **`[Authorize]` at class level**, so adding an action does not mean remembering to protect
  it.

## No constructor: the use case arrives as `[FromServices]`

The controller holds **no state and no fields**, so it has no constructor. Each action
declares what it needs, and the ones that do not need it do not carry it. **An unused
dependency becomes visible instead of sitting in a constructor shared by eight actions.**

Every parameter carries its binding attribute — which one is in
`nzt-build-backend-dotnet-api`, the same for both endpoint models. **Nothing is resolved from
`HttpContext.RequestServices`, and there is no property injection.** The `CancellationToken`
is an action parameter, always, and it is passed to the use case.

## One action per use case

An action maps to exactly one use case. **A controller that grows past its feature is two
controllers, and an action that decides *which* use case to call is a use case that was never
written.**

## What never goes inside an action

Binding, one call, the return:

- No validation — that is the use case's.
- No mapping — `<Entity>MappingExtensions` does it.
- No status code chosen here: **no `Ok()`, `NotFound()`, `BadRequest()` or `StatusCode(...)`
  by hand**. It comes from the `Result`.
- No business logic and no `try/catch` for business errors.
- **No data access**, and nothing read from `HttpContext` beyond what the framework bound.

**If the body has more than the call and the return, something that belongs somewhere else
ended up here.**

## Where the files live is not decided here

Folders, projects and layout belong to the architecture skill the stack selected. This skill
says **what a controller is for and how it is written**, never where it is put.

## Closing checklist

- [ ] `[ApiController]`, `sealed`, inheriting `ControllerBase`.
- [ ] `[Route]` on the class, verb attribute on every action, `[Authorize]` at class level.
- [ ] **No constructor and no fields**: the use case arrives per action as `[FromServices]`.
- [ ] Every parameter carries its binding attribute; the token is an action parameter and is
      passed down.
- [ ] One action per use case, and the body binds, calls once and returns.
- [ ] **No minimal API endpoint anywhere in this project.**
- [ ] The `Result` is translated the way the Result-to-HTTP axis says.
