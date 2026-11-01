# Result to HTTP — the extension

Builds on `../nzt-backend/references/api.md`, *Result to HTTP* — read it first. **The `Result`
never leaves the process**: the payload goes out on success, a `ProblemDetails` on failure.
Write it exactly like this:

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

1. **Under minimal APIs** the same body returns `IResult` as `ToHttpResult`.

## Done when

Every endpoint translates through this extension, written as above.
