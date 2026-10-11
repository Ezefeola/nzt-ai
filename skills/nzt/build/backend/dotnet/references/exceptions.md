# Exceptions on .NET — one global handler

## Contents
- What is .NET in it
- The handler
- Registration
- Closing checklist

**Read `../nzt-build/references/backend-errors.md` first.** It holds what reaches the handler
and what never does, recognising by type, the order of the arms, the response's shape and
what a user never sees. This file holds only what is .NET.

## What is .NET in it

- **The handler is a single `GlobalExceptionHandler`.** No exception filter, no middleware
  with its own `try/catch`.
- The pre-checks are `AnyAsync` on the same scope as the unique index, and on the dependants
  before deleting (`references/use-cases.md`). **No `catch … when`.**
- The handler distinguishes failures **only by the .NET type of the exception**: no
  `SqlException.Number`, **no matching on `Message`**.

## The handler

```csharp
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandler(
        IProblemDetailsService problemDetailsService,
        IHostEnvironment environment)
    {
        _problemDetailsService = problemDetailsService;
        _environment = environment;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        (int status, string error) = exception switch
        {
            DbUpdateConcurrencyException => (StatusCodes.Status412PreconditionFailed,
                "Someone changed this while you were editing it. Reload to see the current version."),
            DbUpdateException => (StatusCodes.Status500InternalServerError,
                "The change could not be saved. Reload and try again."),
            _ => (StatusCodes.Status500InternalServerError,
                "Something went wrong. Try again in a moment.")
        };

        ProblemDetails problemDetails = new()
        {
            Status = status,
            Title = "One or more errors occurred."
        };
        problemDetails.Extensions["errors"] = new[] { error };

        if (_environment.IsDevelopment())
        {
            problemDetails.Extensions["exception"] = (exception.InnerException ?? exception).Message;
        }

        httpContext.Response.StatusCode = status;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }
}
```

- **One class.** One `switch` over the type, read top to bottom.
- **The most specific type first**: `DbUpdateConcurrencyException` derives from
  `DbUpdateException`, so the order of the arms is part of the rule.
- **The shape follows the *Result to HTTP* axis.** The code above is `result-extensions`: the
  fixed `Title`, the message in `Extensions["errors"]`. Under `result-filter` the handler
  writes a failed `Result` with `WriteAsJsonAsync` instead, and the Development detail goes as
  a second entry in `Errors`.
- The detail field is `exception`, **only in Development**.
- **The messages above are the base, not the final text.**

## Registration

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

app.UseExceptionHandler(new ExceptionHandlerOptions
{
    SuppressDiagnosticsCallback = _ => false
});
```

**`SuppressDiagnosticsCallback = _ => false` is required.** From .NET 10 the middleware stops
logging exceptions a handler marked as handled; without this line every race and every bug
this handler answers disappears from the log. With it, the middleware logs the whole
exception once — **the handler does not log a second time.**

On a target framework older than .NET 10 the option does not exist and the middleware
already logs: check `TargetFramework` before writing the line.

## Closing checklist

- [ ] One `GlobalExceptionHandler`, recognising failures by type only, most specific first.
- [ ] `AddProblemDetails`, `AddExceptionHandler` and `UseExceptionHandler` registered, with
      diagnostics not suppressed on .NET 10 or later.
- [ ] The message texts are the project's agreed ones, not the base ones from here.
