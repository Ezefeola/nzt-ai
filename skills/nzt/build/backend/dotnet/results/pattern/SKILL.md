---
name: nzt-build-backend-dotnet-results-pattern
description: Use when the stack selects the Result pattern and a use case is written - the two types exactly as they are, the status code travelling inside the Result, and expected failures that are never exceptions.
---

# The Result pattern

A use case does not throw for something the business expects. **It returns
`Result<TResponse>`**, and every caller — an endpoint, a job, a test — reads the same answer
in the same shape. Exceptions stay for the exceptional: what nobody planned for and nobody
can handle where it happened.

Load `nzt-build-backend-dotnet` before applying this.

## The implementation

**These are the types. Write them exactly like this** — not as a starting point to adapt.

```csharp
public abstract class Result
{
    private protected Result(
        bool isSuccess,
        HttpStatusCode httpStatusCode,
        IReadOnlyList<string> errors)
    {
        IsSuccess = isSuccess;
        HttpStatusCode = httpStatusCode;
        Errors = errors;
    }

    public bool IsSuccess { get; }

    public HttpStatusCode HttpStatusCode { get; }

    public IReadOnlyList<string> Errors { get; }
}

public sealed class Result<TResponse> : Result
{
    private Result(
        bool isSuccess,
        HttpStatusCode httpStatusCode,
        TResponse? payload,
        IReadOnlyList<string> errors)
        : base(isSuccess, httpStatusCode, errors)
    {
        Payload = payload;
    }

    public TResponse? Payload { get; }

    public static Result<TResponse> Success(HttpStatusCode httpStatusCode, TResponse payload)
    {
        return new Result<TResponse>(true, httpStatusCode, payload, []);
    }

    public static Result<TResponse> Failure(HttpStatusCode httpStatusCode, IReadOnlyList<string> errors)
    {
        return new Result<TResponse>(false, httpStatusCode, default, errors);
    }
}
```

## Why it is shaped like that

- **The base carries what does not depend on the payload**, for the code that receives a
  `Result` without knowing `TResponse` — the HTTP layer. Without it, that code has no type to
  ask and the only way left to read the status is to inspect the object at runtime.
- Its constructor is `private protected`, so **the hierarchy is closed**: the generic is the
  only thing deriving from it, and it stays `sealed`.
- **Both live in the same file**, named after the base. They are one concept split by what
  the payload type touches. **This is the exception to one top-level type per file, and it is
  not extended to anything else.**
- **The constructor is private and there are exactly two ways in.** A `Result` that can only
  be built through `Success` or `Failure` cannot be a failure carrying a payload or a success
  carrying errors: **the impossible states stop being something to remember and become
  something that does not compile.**
- **`Success` always takes a payload.** A success with nothing to return is a use case whose
  `TResponse` should say so.
- **`Failure` takes none**, which is why `Payload` is nullable: on that path there is nothing
  to carry, and the signature is what says it.
- **There is no free-text description.** What a failure has to say, it says in `Errors`. A
  second field summarising the same failure drifts from it the first time somebody fills one
  and forgets the other — and then the API reports two versions of what happened.

## The status code travels inside the Result

The coupling to `HttpStatusCode` is deliberate and agreed. **Do not add a second
transport-independent Result**: a job or a test reads this same object without `HttpContext`
and without building a response.

**The use case decides it; the endpoint never does.** That is the rule the whole HTTP layer
leans on — the same operation answers the same way from HTTP, from a job and from a test, and
the same business rule cannot be a `400` in one endpoint and a `409` in the next. It is also
why no endpoint calls `Ok()`, `NotFound()` or `StatusCode(...)` by hand: there is nothing
left for it to decide.

## Reading one

**`IsSuccess` first, always.** `Payload` is meaningful only on the success branch, and
reading it before checking is exactly what the nullable warning is telling you.

## How it reaches HTTP is not decided here

The **Result to HTTP** axis of the stack names what does it — result extensions or a result
filter — and **the two do not produce the same response**. Load the guidance for the one this
project selected; the other is not your business.

## What never happens

- **No exception thrown to signal an expected failure**, and no `Result` swallowed into an
  exception on the way out.
- **No adapter reassigns a use case's status code.** Authentication, routing and
  unexpected-exception responses stay the host's, and **a `Result` is never fabricated for a
  failure that happened before the use case ran**.
- **No `Result` built through the constructor** — it is private for a reason.
- **No mapper deciding any of this**: a mapper transforms data.

## Closing checklist

- [ ] Every use case returns `Result<TResponse>`, and expected failures are not exceptions.
- [ ] The two types are the ones written here: closed base, `sealed` generic, private
      constructors, `Success` and `Failure`, nothing added.
- [ ] `Failure` never receives a payload; `Success` always does.
- [ ] The status code is set in the use case and nowhere else.
- [ ] `Payload` is read only after `IsSuccess`, and never with a `!`.
