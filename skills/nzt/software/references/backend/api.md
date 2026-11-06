# Backend API — the endpoint layer

What holds whichever endpoint model `tech.md` names. Where endpoints live is the
architecture's.

## The endpoint binds, calls, returns

| It never | Where it lives |
|---|---|
| validates input, holds business logic, touches persistence | the use case |
| maps entity to DTO | the aggregate's mapping file |
| chooses a status code, catches business errors | the Result |

A body with more than the call and the return holds something that belongs elsewhere.

## Rules

1. **Only the endpoint model `tech.md` names**; a second is never added beside it.
2. **A feature's endpoints are declared together**, with the route prefix and authentication
   declared once on the group.
3. **Routes are declared, never composed**: no conditionals choosing a path, no loops.
4. **One named handler per use case**, declaring the dependencies it uses where the model
   allows. A handler choosing which use case to call is an unwritten use case.
5. **Binding is always explicit**:

   | Source | For |
   |---|---|
   | body | the input DTO of `POST`/`PUT`/`PATCH` — one per endpoint, never on a `GET` |
   | route | what identifies the resource (`{orderId}`) |
   | query string | filters, paging, sorting |
   | container | the use case and other services |
   | header | transport metadata (correlation id, language) — never authentication |
   | form | uploads and multipart — never JSON |

6. **Result to HTTP**, whichever option `tech.md` selected:
   - the status is the Result's on both branches;
   - success sends the payload as it is, no `{ data }` envelope unless the Result itself is
     the contract;
   - failure sends its errors in the project's error shape, with no free-text summary;
   - **one place translates use-case Results**, never the endpoint, never a second copy;
   - host failures (authentication, routing) keep their handling; unexpected exceptions go to
     the global handler (`errors.md`), never forced into a Result;
   - when the Result is the response contract, its status is applied **once, globally**, or
     every failure goes out as `200`.
7. **Existing public status codes and bodies are the contract**: changed only when
   authorised.
8. **Authentication is required by default on the group**; a public endpoint says so on
   purpose.
9. **No named policies or role strings unless adopted.** Resource access is `security.md`'s.
10. **No versioning** — route segment, header or package — unless `tech.md` decides it.

## Done when

Every rule holds for the endpoints you wrote.
