# Result to HTTP — the filter

**Read `../nzt-build/references/backend-api.md` first** — what holds for every way a Result
reaches HTTP. This file holds the filter.

**The endpoint returns the `Result` and that is what the client receives** — success or
failure, same shape, serialised as it is. **The `Result` is the response contract**, so it is
never converted into `ProblemDetails` and never unwrapped by an extension.

The global handler (`nzt-build-backend-dotnet-exceptions`) answers in this same shape; **do
not force host-level failures into a use-case `Result`**.

## What the filter does, and all it does

**It matches the response's status code to `result.HttpStatusCode`.** Nothing else: it does
not unwrap the payload, does not reshape the body, does not build a `ProblemDetails` and does
not log.

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
globally at startup**. **Never per endpoint.**

The endpoint returns the `Result` and stops there. Everything else
`nzt-build-backend-dotnet-api` says about endpoints still holds.

## Closing checklist

- [ ] The endpoint returns the `Result` as it is; nothing unwraps it.
- [ ] The filter **only** matches the status code — no reshaping, no `ProblemDetails`, no
      logging.
- [ ] It reads the status from the non-generic base, with a single type check.
- [ ] It is registered once, globally, never endpoint by endpoint.
- [ ] No use-case `Result` converted into `ProblemDetails`, and existing host failure
      contracts unchanged.
- [ ] No hand-rolled envelope on top of the `Result`.
