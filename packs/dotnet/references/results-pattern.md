# The Result pattern on .NET

Builds on `../nzt-backend/references/results.md` — read it first.

**Write these types exactly like this**, never as a starting point to adapt:

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

## Rules

1. `private protected` closes the hierarchy; the generic is `sealed`.
2. **Both types in one file, named after the base** — the only exception to one type per file.
3. Each return builds its own: `return Result<SignInResponseDto>.Failure(HttpStatusCode.Unauthorized, [StaffAccount.Errors.SignInIsNotValid]);`
   — never a private `Rejected()`.
4. **`IsSuccess` before `Payload`**, never silenced with `!`.

## Done when

The types are exactly these, every return builds its own, and `Payload` is read only after
`IsSuccess`.
