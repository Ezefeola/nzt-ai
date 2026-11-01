# Result to HTTP — the extension

Builds on `../nzt-backend/references/api.md`, *Result to HTTP* — read it first. **The `Result`
never leaves the process**: the payload goes out on success, a `ProblemDetails` on failure.

```csharp
public static class ResultExtensions
{
    public static IActionResult ToActionResult<TResponse>(this Result<TResponse> result)
    {
        if (result.IsSuccess)
        {
            return new ObjectResult(result.Payload)
            {
                StatusCode = (int)result.HttpStatusCode
            };
        }

        ProblemDetails problemDetails = new()
        {
            Status = (int)result.HttpStatusCode,
            Title = "One or more errors occurred."
        };

        problemDetails.Extensions["errors"] = result.Errors;

        return new ObjectResult(problemDetails)
        {
            StatusCode = (int)result.HttpStatusCode
        };
    }
}
```

## Rules

1. Under minimal APIs the same body returns `IResult` as `ToHttpResult` — same output.
2. **`Status` is the `Result`'s** on both branches; **`Title` is the fixed sentence**; the errors
   go as they came in `Extensions["errors"]`; **no `Detail`**; success carries the bare payload.
3. **It is the only translation of use-case Results**; host failures and the global handler
   (`exceptions.md`) keep their own `ProblemDetails`.

## Done when

Every endpoint translates through this extension, and its output matches the rules above.
