---
name: nzt-build-backend-dotnet-use-cases
description: Use when adding or changing a .NET operation and its orchestration - one class per operation with a single ExecuteAsync, returning Result, deciding its own status code and checking uniqueness before it writes.
---

# Use cases — one operation of the system

A use case is **one operation, written once and reachable from anywhere**: an endpoint, a
job, a test. Everything the operation decides — including its status code — is decided here.

Load `nzt-build-backend-dotnet` before applying this.

## The shape

```csharp
public interface ICreateOrder
{
    Task<Result<CreateOrderResponseDto>> ExecuteAsync(
        CreateOrderRequestDto request,
        CancellationToken cancellationToken);
}
```

- **The name is the operation and nothing else**: `CreateOrder`, `CancelOrder`. **No
  `UseCase` suffix**, and no `Handler`, `Service` or `Manager`. **If the name needs an *and*,
  there are two use cases.**
- **One public method, `ExecuteAsync`.** A second public entry point is a second use case
  sharing a class.
- **It always returns `Result<TResponse>`**, and its input and output are its own DTOs.
- **Interface and class are two files.** The interface is what gets registered and what the
  endpoint asks for.

Where those files live is the architecture skill's business, never this one's.

## Validate before you touch anything

Call the operation's validator first in `ExecuteAsync` — before queries, writes or external
calls. **A failed validation is a failed `Result` like any other**: never an exception, never
`ModelState`, never something the endpoint has to interpret.

For a failure the use case decides itself: if it names a business concept, its message was
already written on that concept's entity. What the use case owns is what names none — a
dependency that did not answer, a permission the caller lacks.

## What the validator cannot answer

**A rule that needs the database is not the validator's job**: it validates the shape of the
input, never the state of the world.

Uniqueness is the case that always comes up. *There is no other one of these* is checked **in
`ExecuteAsync`, after validation and before anything is written**, and a value already taken
fails right there with the message that lives on its entity.

- **The check is mandatory**, with `AnyAsync` and the `CancellationToken` — directly under
  direct persistence, or as a repository method returning a boolean when repositories were
  selected. **Never load the entity or count all matches to find out whether one exists.**
- The predicate matches the rule as the constraint defines it: its scope or tenant,
  normalisation, null semantics, active or deleted rows. **On an update it excludes the
  record being updated.** Account for query filters, so they do not hide rows the unique
  constraint still covers.
- **Two requests can both pass the check**, so the database constraint stays. An identified
  violation of it returns **the same failure as the pre-check**, with the same message and
  status. **An unknown write error is never classified as a duplicate** — recognising the
  provider's error belongs to the persistence boundary, and it does not choose the business
  response.

## The status code is decided here

`HttpStatusCode` inside `Result` is an accepted dependency: jobs and tests consume the same
`Result` with no HTTP request in sight. Do not invent a transport-independent variant.

**There is no fixed table.** The operation knows what happened and picks accordingly — what
was not found, what conflicted, what the caller may not do.

What the choice is not free from is the rest of the project: **if an equivalent failure
already answers `404` somewhere, this one answers `404` too.** The code is part of the
contract, and two operations disagreeing about the same kind of failure is a bug no compiler
will catch.

## What a use case never does

| It does not | Who does |
|---|---|
| Build HTTP responses — `IActionResult`, `ProblemDetails`, headers | The endpoint skill |
| Throw for an expected failure | Nobody: it returns a failed `Result` |
| Reach persistence its own way | The persistence axis of the stack |
| Map entity to DTO by hand | `<Entity>MappingExtensions` |
| Read `HttpContext` | Who is calling arrives as an injected dependency |

**A caller's identity is never taken from what the client asserted.** It arrives as trusted
server-supplied data, and a protected resource has its own guidance.

## Closing checklist

- [ ] One class per operation, named after the operation, **with no suffix**, its interface
      in its own file, and a single `ExecuteAsync`.
- [ ] The interface is what is registered and what the endpoint injects.
- [ ] Returns `Result<TResponse>`, always.
- [ ] Validation runs before any query, write or external call, and its failure is a failed
      `Result`.
- [ ] Uniqueness is checked with `AnyAsync` through the selected persistence, outside the
      validator, with the token, and the predicate excludes self on updates.
- [ ] A known concurrent uniqueness violation returns the same `Result` as the pre-check, and
      unrelated errors are not converted into it.
- [ ] The status code is set here and matches how the project already answers that kind of
      failure.
- [ ] No `HttpContext`, no ASP.NET response types, no hand-written mapping, no exceptions for
      expected failures.
