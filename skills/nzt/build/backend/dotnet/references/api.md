# The API layer

What holds **whichever endpoint model the project uses**. How each one is written is in its
own skill — minimal APIs or controllers — and the endpoints axis of the stack says which one
this project has.

## The endpoint decides nothing

It binds the request, calls the use case, returns what it got back. That is the whole job.

| The endpoint never | Where it lives |
|---|---|
| Validates the input | The use case |
| Maps entity to DTO | `<Entity>MappingExtensions` |
| Chooses a status code | The `Result` the use case returned |
| Holds business logic | The use case |
| Catches business errors | The `Result` carries them |
| Touches persistence | The use case |

**The status code is the one the use case decided.** That is what makes the same operation
answer the same way from HTTP, from a job and from a test, and what stops the same rule from
being `400` in one endpoint and `409` in the next.

## Every parameter says where it comes from

**Binding is always explicit.** Inference works until somebody changes a parameter's name or
type and the binding silently moves — **a bug that compiles, deploys, and shows up as an
empty field.**

| Attribute | When |
|---|---|
| `[FromBody]` | The input DTO of a `POST`, `PUT` or `PATCH`. **One per endpoint**: the body is read once |
| `[FromRoute]` | A value in the URL that **identifies the resource** — `{orderId}` |
| `[FromQuery]` | What **modifies the query without identifying the resource**: filters, paging, sorting |
| `[FromServices]` | The use case, and anything else from the container |
| `[FromHeader]` | Transport metadata the endpoint genuinely needs — correlation id, language. **Never for authentication** |
| `[FromForm]` | Uploads and `multipart` forms. **Never for JSON** |

The `CancellationToken` is the exception: no attribute, always taken, always passed down.

**A `GET` never takes a `[FromBody]`.** A query that needs more input than the URL can carry
is a conversation about the contract, not a body smuggled into a `GET`.

## Validation does not happen here

Not in the endpoint, not in a filter, not in an attribute. **The use case validates**, and a
failed validation comes back as a failed `Result` like any other.

The endpoint's only input concern is **binding**: the request arrives as its `RequestDto` and
goes straight to the use case.

## How the Result reaches HTTP

The **Result to HTTP** axis of the stack decides it, and **the two options do not produce the
same response** — that is part of the contract the client sees, not an internal preference.
Load the guidance for the one this project uses. **Nothing is hand-rolled at the endpoint**
either way.

## Authorisation

**`[Authorize]` on its own** — no named policies, no per-endpoint role strings — declared on
the group or the controller, **so that adding an endpoint does not mean remembering to
protect it.** An endpoint that must be public says so with `[AllowAnonymous]`, on purpose.

This is the project's convention, not a framework limitation. **Protecting the endpoint does
not establish access to the resource it returns**: that is resource authorisation, and it has
its own skill.

## No versioning

No version segment in the route, no version header, no versioning package. **Do not add one
on your own**: if a project needs it, that is a stack decision, not something invented here.

## Closing checklist

- [ ] The endpoint **binds, calls, returns** — no validation, mapping, business logic,
      `try/catch` for business errors or data access.
- [ ] No status code chosen in the endpoint: it comes from the `Result`.
- [ ] Every parameter carries its binding attribute, and none is inferred.
- [ ] At most one `[FromBody]`, and none on a `GET`.
- [ ] The use case arrives as `[FromServices]`, and the token is taken and passed down.
- [ ] `[Authorize]` at the group or controller level; public endpoints marked
      `[AllowAnonymous]` deliberately.
- [ ] No versioning added, and the endpoint model is the one the stack declares, with no
      mixing of the two.
