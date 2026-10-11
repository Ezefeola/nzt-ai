# Backend API — the endpoint layer

## Contents
- The endpoint decides nothing
- The shape of an endpoint
- Every parameter says where it comes from
- How the Result reaches HTTP
- Authorisation
- No versioning
- Closing checklist

What holds **whichever endpoint model the project uses**. The endpoints axis of the stack says
which one this project has, and **only that one exists in it** — a second model is never
added beside it.

## The endpoint decides nothing

It binds the request, calls the use case, returns what it got back. That is the whole job.

| The endpoint never | Where it lives |
|---|---|
| Validates the input | The use case |
| Maps entity to DTO | The aggregate's mapping file |
| Chooses a status code | The Result the use case returned |
| Holds business logic | The use case |
| Catches business errors | The Result carries them |
| Touches persistence | The use case |

**The status code is the one the use case decided.** That is what makes the same operation
answer the same way from HTTP, from a job and from a test, and what stops the same rule from
being `400` in one endpoint and `409` in the next.

**If the body has more than the call and the return, something that belongs somewhere else
ended up here.**

## The shape of an endpoint

- **The endpoints of one feature are declared together**, and what is common to them — the
  route prefix, the authorisation requirement — is declared once for the group, so that adding
  a route does not mean remembering them.
- **A route is a route.** No conditional choosing a path, no routes registered in a loop. The
  route is declared, never composed in code.
- **The handler is named**, after what it does. An anonymous handler with a body cannot be
  read, cannot be named, and grows until somebody puts business logic in it.
- **Dependencies are declared per handler**, where the model allows it: each endpoint declares
  exactly what it uses, and an unused dependency is visible instead of hiding in a shared
  constructor.
- **One handler per use case.** A handler that decides *which* use case to call is a use case
  that was never written.

Folders, units and layout belong to the architecture reference; this one says how an endpoint
is written, never where it is put.

## Every parameter says where it comes from

**Binding is always explicit.** Inference works until somebody changes a parameter's name or
type and the binding silently moves — **a bug that compiles, deploys, and shows up as an
empty field.**

| Source | When |
|---|---|
| Body | The input DTO of a `POST`, `PUT` or `PATCH`. **One per endpoint**: the body is read once |
| Route | A value in the URL that **identifies the resource** — `{orderId}` |
| Query string | What **modifies the query without identifying the resource**: filters, paging, sorting |
| The container | The use case, and anything else injected |
| Header | Transport metadata the endpoint genuinely needs — correlation id, language. **Never for authentication** |
| Form | Uploads and `multipart` forms. **Never for JSON** |

The cancellation signal, where the language has one, is always taken and always passed down.

**A `GET` never takes a body.** A query that needs more input than the URL can carry is a
conversation about the contract, not a body smuggled into a `GET`.

Validation does not happen here either — not in the endpoint, not in a filter, not in an
annotation. **The use case validates**, and the request arrives as its request DTO and goes
straight to it.

## How the Result reaches HTTP

The **Result to HTTP** axis of the stack decides it, and **the options do not produce the same
response** — that is part of the contract the client sees, not an internal preference.
**Nothing is hand-rolled at the endpoint** either way. What holds for every option:

- **The status is the Result's, on both branches**, never one chosen in the translation.
- **On success the payload travels as it is**: no `{ data }`, no envelope invented on top —
  unless the Result itself is the agreed response contract.
- **On failure the errors go out as they came**, in the project's error shape, and they are
  the only thing that says what went wrong. **No free-text summary beside them**: it would be
  a second version of the same failure, drifting from the errors it summarises.
- **One place, and only one, translates use-case Results.** Not the endpoint, not a second copy
  for the case that felt different. Two translations stop agreeing, and nobody notices until a
  client depends on the difference.
- **Host-level failures keep their own handling** — authentication, routing — and an
  unexpected exception goes to the global handler (`backend-errors.md`). **None of them is
  forced into a use-case Result.**
- **If the Result is the response contract**, something still has to set the response's
  status from it — otherwise every failure goes out as `200` and a client that checks the
  status sees success. **That is registered once, globally, never endpoint by endpoint**: what
  has to be remembered will be missing on the endpoint somebody adds next month.

**Existing public status codes and bodies are preserved** unless changing them is explicitly
authorised: they are the contract.

## Authorisation

**Authentication is required by default**, declared on the group, **so that adding an endpoint
does not mean remembering to protect it.** An endpoint that must be public says so, on
purpose. No named policies or per-endpoint role strings unless the project adopted them.

**Protecting the endpoint does not establish access to the resource it returns**: that is
resource authorisation, and it has its own guidance (`backend-security.md`).

## No versioning

No version segment in the route, no version header, no versioning package. **Do not add one
on your own**: if a project needs it, that is a stack decision, not something invented here.

## Closing checklist

- [ ] The endpoint **binds, calls, returns** — no validation, mapping, business logic,
      `try/catch` for business errors or data access.
- [ ] No status code chosen in the endpoint: it comes from the Result.
- [ ] Every parameter says where it comes from, and none is inferred.
- [ ] At most one body, and none on a `GET`.
- [ ] Handlers named, one per use case, and the cancellation signal passed down.
- [ ] One translation of use-case Results, status from the Result on both branches, no
      envelope and no free-text summary invented.
- [ ] Authentication required at the group; public endpoints marked deliberately.
- [ ] No versioning added, and only the endpoint model the stack declares.
