# Result to HTTP — the filter

Builds on `../nzt-backend/references/api.md`, *Result to HTTP* — read it first. **The `Result` is
the response contract**: the endpoint returns it and the client receives it as it is, success or
failure — never converted to `ProblemDetails` or unwrapped. The global handler (`exceptions.md`)
answers in the same shape, without forcing host failures into a use-case `Result`.

## Rules

1. **The filter only sets the response status to `result.HttpStatusCode`** — no unwrapping,
   reshaping, `ProblemDetails` or logging.
2. **It reads the non-generic base with one type check** — the payload type is gone at that
   point, and the base exists for exactly this:

   ```csharp
   if (context.Result is ObjectResult objectResult && objectResult.Value is Result result)
   {
       objectResult.StatusCode = (int)result.HttpStatusCode;
   }
   ```

3. **Registered once, globally**: an `IEndpointFilter` under minimal APIs, a result filter under
   controllers — never per endpoint.

## Done when

Endpoints return the `Result` untouched, and one global filter sets the status from the base.
