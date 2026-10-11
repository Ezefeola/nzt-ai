# The API layer on .NET

**Read `../nzt-build/references/backend-api.md` first.** It holds what an endpoint does and
never does, explicit binding, how a Result reaches HTTP, authorisation and versioning. This
file holds only what is .NET. How each endpoint model is written is in its own reference —
minimal APIs or controllers.

## The binding attributes

| Attribute | When |
|---|---|
| `[FromBody]` | The input DTO of a `POST`, `PUT` or `PATCH`. **One per endpoint**: the body is read once |
| `[FromRoute]` | A value in the URL that **identifies the resource** — `{orderId}` |
| `[FromQuery]` | What **modifies the query without identifying the resource**: filters, paging, sorting |
| `[FromServices]` | The use case, and anything else from the container |
| `[FromHeader]` | Transport metadata the endpoint genuinely needs. **Never for authentication** |
| `[FromForm]` | Uploads and `multipart` forms. **Never for JSON** |

The `CancellationToken` is the exception: no attribute, always taken, always passed down.

**A `GET` never takes a `[FromBody]`.** Validation is never `ModelState`: a failed validation
comes back as a failed `Result` like any other. The mapping is `<Entity>MappingExtensions`.

## How the Result reaches HTTP

The stack's *Result to HTTP* axis selects `references/results-extensions.md` or
`references/results-filter.md`, and **the two options do not produce the same response**.

## Authorisation

**`[Authorize]` on its own** — no named policies, no per-endpoint role strings — declared on
the group or the controller. An endpoint that must be public says so with `[AllowAnonymous]`.

## Closing checklist

- [ ] No status code chosen in the endpoint: it comes from the `Result`.
- [ ] Every parameter carries its binding attribute, and none is inferred.
- [ ] At most one `[FromBody]`, and none on a `GET`.
- [ ] The use case arrives as `[FromServices]`, and the token is taken and passed down.
- [ ] `[Authorize]` at the group or controller level; public endpoints marked
      `[AllowAnonymous]` deliberately.
- [ ] No versioning added, and the endpoint model is the one the stack declares, with no
      mixing of the two.
