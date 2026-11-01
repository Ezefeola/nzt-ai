# The API layer on .NET

Builds on `../nzt-backend/references/api.md` — read it first. The endpoint model is
`endpoints-minimal.md` or `endpoints-controllers.md`; Result to HTTP is `results-extensions.md`
or `results-filter.md` — they answer differently.

## Rules

1. **Every parameter carries its attribute**: `[FromBody]` (one, never on a `GET`),
   `[FromRoute]`, `[FromQuery]`, `[FromServices]` (the use case), `[FromHeader]` (never
   authentication), `[FromForm]` (never JSON). The `CancellationToken` takes none and is always
   passed down.
2. **Validation is never `ModelState`**; mapping is `<Entity>MappingExtensions`; no `Ok()`,
   `NotFound()` or `StatusCode(...)` chosen by hand.
3. **`[Authorize]` alone** on the group or controller — no named policies or role strings; a
   public endpoint says `[AllowAnonymous]`.

## Done when

Every parameter has its binding attribute, the use case comes from `[FromServices]`, and
`[Authorize]` sits at the group or controller.
