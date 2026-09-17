---
name: nzt-build-backend-dotnet-results-filter
description: Use when the stack selects result-filter and a Result reaches HTTP with its status matched by a filter - the endpoint returns the Result as it is, and one global filter sets the status code.
---

# Result to HTTP — the filter

**The endpoint returns the `Result` and that is what the client receives** — success or
failure, same shape, serialised as it is. **The `Result` is the response contract**, so it is
never converted into `ProblemDetails` and never unwrapped by an extension.

Host-level failures keep the project's centralised handling; **do not force them into a
use-case `Result`**.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-results-pattern` before
applying this.

## What the filter does, and all it does

**It matches the response's status code to `result.HttpStatusCode`.** Nothing else: it does
not unwrap the payload, does not reshape the body, does not build a `ProblemDetails` and does
not log.

Without it every response goes out as `200` with a `Result` inside saying otherwise — **a
client that checks the status code sees success on a failure, and nothing in the codebase
looks wrong.** That mismatch is the only reason this filter exists.

## How it reads the status code

At that point the payload type is gone: what the filter holds is an `object`. It asks for the
**non-generic base** the Result pattern declares, which carries the status code precisely so
that this code has a type to ask.

```csharp
if (context.Result is ObjectResult objectResult && objectResult.Value is Result result)
{
    objectResult.StatusCode = (int)result.HttpStatusCode;
}
```

**One type check, and nothing inspected at runtime.** If reading the status code seems to
need more than this, **the base type is what is missing** — not a way around it.

## It is registered once

An `IEndpointFilter` under minimal APIs, a result filter under controllers, **registered
globally at startup**.

**Never per endpoint.** A filter that has to be remembered is a filter that will be missing on
the endpoint somebody adds next month, and that endpoint will answer `200` on failures.

## What this means for the endpoint

It returns the `Result` and stops there: no translation, no status code, no envelope.
Everything else `nzt-build-backend-dotnet-api` says about endpoints still holds.

## Closing checklist

- [ ] The endpoint returns the `Result` as it is; nothing unwraps it.
- [ ] The filter **only** matches the status code — no reshaping, no `ProblemDetails`, no
      logging.
- [ ] It reads the status from the non-generic base, with a single type check.
- [ ] It is registered once, globally, never endpoint by endpoint.
- [ ] No use-case `Result` converted into `ProblemDetails`, and existing host failure
      contracts unchanged.
- [ ] No hand-rolled envelope on top of the `Result`.
