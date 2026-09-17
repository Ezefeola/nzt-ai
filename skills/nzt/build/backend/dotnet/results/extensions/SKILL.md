---
name: nzt-build-backend-dotnet-results-extensions
description: Use when the stack selects result-extensions and a Result has to become an HTTP response - the payload bare on success, ProblemDetails on failure, and one place that does the translation.
---

# Result to HTTP — the extension

**The `Result` never leaves the process.** What goes out is the payload on success and a
`ProblemDetails` on failure.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-results-pattern` before
applying this.

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
- **`Extensions["errors"]` carries the errors as they came.** It is the only thing that says
  what went wrong.
- **No `Detail`.** The `Result` has no free-text description to put there, and a summary
  written here would be a second version of the same failure, drifting from the errors it is
  supposed to summarise.
- **Success carries no envelope.** The payload travels as it is: no `{ data }`, no wrapper
  invented on top.

## One place, and only one

**This extension owns the translation of failed use-case Results.** Not the endpoint, not a
middleware, not a second copy for the one case that felt different.

Host-level failures — authentication, routing, an unexpected exception — keep the project's
centralised handling, and **this rule does not forbid their own `ProblemDetails`**. What it
forbids is a use-case `Result` being translated in two places, because the two stop agreeing
and nobody notices until a client depends on the difference.

**Existing public status codes and bodies are preserved** unless changing them is explicitly
authorised: they are the contract.

## Closing checklist

- [ ] This extension is the single translation of use-case Results into HTTP, with host-level
      handling kept separate.
- [ ] `Status` comes from the `Result` on both branches.
- [ ] `Title` is the fixed sentence, the specifics are in `Extensions["errors"]`, and no
      `Detail` was added.
- [ ] Success returns the payload with no envelope.
- [ ] Every endpoint translates through this extension — none by hand.
