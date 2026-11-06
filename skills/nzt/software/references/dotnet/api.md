# The API layer on .NET

## Rules

1. **Every parameter carries its binding attribute** (`[FromBody]`, `[FromRoute]`,
   `[FromQuery]`, `[FromServices]`, `[FromHeader]`, `[FromForm]`); the `CancellationToken`
   takes none.
2. **The use case comes from `[FromServices]`.**
3. **Validation is never `ModelState`.**
4. **No `Ok()`, `NotFound()` or `StatusCode(...)` chosen by hand.**
5. **`[Authorize]` alone** on the group or controller; a public endpoint says
   `[AllowAnonymous]`.

## Done when

Every rule holds for the endpoints you wrote.
