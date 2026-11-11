# Exceptions on .NET — one global handler

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

## Rules

1. **One `GlobalExceptionHandler`** — no exception filter, no middleware with its own
   `try/catch`.
2. **No `SqlException.Number`, no matching on `Message`.**
3. **`DbUpdateConcurrencyException` first**: it derives from `DbUpdateException`.
4. **The shape follows the Result to HTTP axis**: the code above is `result-extensions`. Under
   `result-filter` the handler writes a failed `Result` with `WriteAsJsonAsync`, and the
   Development detail is a second entry in `Errors`.
5. **Registration**, with diagnostics not suppressed — from .NET 10 the middleware stops logging
   handled exceptions without it; with it, the exception is logged once and the handler does
   not log. Before .NET 10 the option does not exist (check `TargetFramework`):

   ```csharp
   builder.Services.AddProblemDetails();
   builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

   app.UseExceptionHandler(new ExceptionHandlerOptions
   {
       SuppressDiagnosticsCallback = _ => false
   });
   ```

## Done when

Every rule holds, and the handler is the code above or its `result-filter` form.
