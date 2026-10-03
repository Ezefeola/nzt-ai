---
name: nzt-build-backend-dotnet-exceptions
description: Use when an exception can escape a use case, or the API's error handling is set up - one global handler, a clear message per kind of failure, and the whole exception in the log.
---

# Exceptions — one global handler

**An exception that escapes a use case ends in one place**: a single `GlobalExceptionHandler`
that answers with a clear message and leaves the whole exception in the log. Nothing else in
the API catches to translate.

Load `nzt-build-backend-dotnet` before applying this.

## Expected failures never get here

What the operation can anticipate is checked **before** it writes and returned as a failed
`Result`, with the message of its entity — `nzt-build-backend-dotnet-use-cases`:

| The rule | Checked before writing with |
|---|---|
| *There is no other one of these* | `AnyAsync` on the same scope as the unique index |
| *Nobody changed it since it was read* | The version the client sent against the stored one |
| *Nothing still points at it* | `AnyAsync` on the dependants before deleting |

The database constraint stays: it is what keeps the data true. **What reaches this handler
is what no check can prevent** — two requests passing the same check at once, the database
not answering, a bug.

**A use case does not catch to turn a database error into a `Result`.** No
`catch … when`, no classifier of provider errors, no exception types written to be caught in
one place. The rare `try/catch` a use case may hold is defined in
`nzt-build-backend-dotnet-use-cases`, and translating persistence failures is never it.

## Recognised by type, never by code or text

The handler distinguishes failures **only by the .NET type of the exception**.

- **No provider error numbers**, no `SqlException.Number`, no SQLSTATE, no constraint name.
- **No matching on `Message`.** It is not a contract, and the server writes it in its own
  language.
- **No package that classifies provider errors** unless the stack adopted one.

A failure that cannot be told apart by type gets the message of its broader kind. That
message is still clear: it says what happened and what to do, not which constraint fired.

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

- **One class.** One `switch` over the type, read top to bottom. No handler per exception,
  no exception filter, no middleware with its own `try/catch`.
- **The most specific type first**: `DbUpdateConcurrencyException` derives from
  `DbUpdateException`, so the order of the arms is part of the rule.
- **Same shape as a failed `Result`**, whichever way the stack's *Result to HTTP* axis sends
  one out. The code above is `result-extensions`: the fixed `Title`, the message in
  `Extensions["errors"]`. Under `result-filter` the handler writes a failed `Result` with
  `WriteAsJsonAsync` instead, and the Development detail goes as a second entry in `Errors`.
  The client reads one field for every failure, whoever produced it.
- **The status matches the pre-check's.** If the version check answers `412`, the race on
  the same rule answers `412` too.
- **Nothing internal reaches a user**: no stack trace, no SQL, no table or constraint names,
  no exception message. The one exception is the `exception` field, **only in
  Development**, so the developer sees what happened without opening the log.
- **The messages above are the base, not the final text.** The final wording is agreed in
  the project — the spec or the UX system — in the product's language. A new row needs a
  type that tells it apart, never a code or a message.

Where the file lives is the architecture skill's business: it belongs with the host's HTTP
translation, never under `Persistence/`.

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

- [ ] Expected failures are pre-checks returning a `Result`; the database constraint is still
      in place.
- [ ] No use case catches to translate a database error, and nothing in the project
      classifies provider errors.
- [ ] One `GlobalExceptionHandler`, recognising failures by type only, most specific first.
- [ ] Its response has the same shape as a failed `Result`, with the status the pre-check of
      the same rule uses.
- [ ] No internal detail reaches a user; the exception's message only in Development.
- [ ] `AddProblemDetails`, `AddExceptionHandler` and `UseExceptionHandler` registered, with
      diagnostics not suppressed on .NET 10 or later.
- [ ] The message texts are the project's agreed ones, not the base ones from here.
