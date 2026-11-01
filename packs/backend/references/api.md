# Backend API — the endpoint layer

What holds whichever endpoint model `tech.md` names — and only that model exists; a second is
never added beside it. Where endpoints live is the architecture's.

## The endpoint binds, calls, returns

| It never | Where it lives |
|---|---|
| validates input, holds business logic, touches persistence | the use case |
| maps entity to DTO | the aggregate's mapping file |
| chooses a status code, catches business errors | the Result |

A body with more than the call and the return holds something that belongs elsewhere.

## Rules

1. **A feature's endpoints are declared together**, with the route prefix and authentication
   declared once on the group.
2. **Routes are declared**, never composed — no conditionals choosing a path, no loops.
3. **Named handlers, one per use case**, each declaring the dependencies it uses where the
   model allows. A handler choosing which use case to call is an unwritten use case.
4. **Binding is always explicit** — inferred binding moves silently when a name changes:

   | Source | For |
   |---|---|
   | body | the input DTO of `POST`/`PUT`/`PATCH` — one per endpoint, never on a `GET` |
   | route | what identifies the resource (`{orderId}`) |
   | query string | filters, paging, sorting |
   | container | the use case and other services |
   | header | transport metadata (correlation id, language) — never authentication |
   | form | uploads and multipart — never JSON |

   The cancellation signal is always taken and passed down.
5. **Result to HTTP**, whichever option `tech.md` selected:
   - the status is the Result's on both branches;
   - success sends the payload as it is — no `{ data }` envelope unless the Result itself is
     the contract; failure sends its errors in the project's error shape, with no free-text
     summary;
   - **one place translates use-case Results**, never the endpoint, never a second copy;
   - host failures (authentication, routing) keep their handling, and unexpected exceptions go
     to the global handler (`errors.md`) — never forced into a Result;
   - when the Result is the response contract, its status is applied **once, globally**, or
     every failure goes out as `200`.
6. **Existing public status codes and bodies are the contract**: changed only when authorised.
7. **Authentication is required by default on the group**; a public endpoint says so on
   purpose. No named policies or role strings unless adopted. Resource access is
   `security.md`'s.
8. **No versioning** — no route segment, header or package — unless `tech.md` decides it.

## Done when

Every endpoint binds explicitly, calls one use case and returns its Result through the single
translation, behind group authentication.
