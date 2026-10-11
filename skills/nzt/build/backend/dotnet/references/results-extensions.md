# Result to HTTP — the extension

**Read `../nzt-build/references/backend-api.md` first** — what holds for every way a Result
reaches HTTP. This file holds the extension.

**The `Result` never leaves the process.** What goes out is the payload on success and a
`ProblemDetails` on failure.

## The extension

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

Under minimal APIs the same extension returns `IResult` and is named `ToHttpResult`. **Same
body, same output** — only the framework type changes.

## What goes out

| | Body | Status |
|---|---|---|
| Success | The payload, bare | `result.HttpStatusCode` |
| Failure | `ProblemDetails`, errors in `Extensions["errors"]` | `result.HttpStatusCode` |

- **`Status` is the `Result`'s**, on both branches, never one chosen here.
- **`Title` is the fixed sentence.** It is not a place to describe the failure.
- **`Extensions["errors"]` carries the errors as they came.**
- **No `Detail`.** The `Result` has no free-text description to put there.

**This extension owns the translation of failed use-case Results.** Host-level failures and
the global handler (`nzt-build-backend-dotnet-exceptions`) keep their own `ProblemDetails`.

## Closing checklist

- [ ] This extension is the single translation of use-case Results into HTTP, with host-level
      handling kept separate.
- [ ] `Status` comes from the `Result` on both branches.
- [ ] `Title` is the fixed sentence, the specifics are in `Extensions["errors"]`, and no
      `Detail` was added.
- [ ] Success returns the payload with no envelope.
- [ ] Every endpoint translates through this extension — none by hand.
