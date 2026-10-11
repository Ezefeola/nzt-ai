# The Result pattern on .NET

**Read `../nzt-build/references/backend-results.md` first.** It holds why a Result, its shape
and the reasons for it, building it at each return and who decides the status. This file
holds only the .NET types.

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

## What is .NET in it

- The base's constructor is `private protected`, which is what closes the hierarchy, and the
  generic stays `sealed`.
- **Both live in the same file**, named after the base. They are one concept split by what
  the payload type touches. **This is the exception to one top-level type per file, and it is
  not extended to anything else.**
- `Payload` is `TResponse?` because `Failure` takes none.
- **The status is `HttpStatusCode`**, and no endpoint calls `Ok()`, `NotFound()` or
  `StatusCode(...)` by hand.

## Every return builds its own Result

```csharp
// no
if (account is null) return Rejected();

// yes
if (account is null)
{
    return Result<SignInResponseDto>.Failure(
        HttpStatusCode.Unauthorized,
        [StaffAccount.Errors.SignInIsNotValid]);
}
```

## Reading one

**`IsSuccess` first, always.** Reading `Payload` before checking is exactly what the nullable
warning is telling you — and it is never silenced with a `!`.

## How it reaches HTTP

The stack's *Result to HTTP* axis selects `references/results-extensions.md` or
`references/results-filter.md`, and **the two do not produce the same response**.

## Closing checklist

- [ ] Every use case returns `Result<TResponse>`, and expected failures are not exceptions.
- [ ] The two types are the ones written here: closed base, `sealed` generic, private
      constructors, `Success` and `Failure`, nothing added.
- [ ] `Payload` is read only after `IsSuccess`, and never with a `!`.
