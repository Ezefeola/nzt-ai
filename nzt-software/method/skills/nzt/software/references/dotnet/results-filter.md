# Result to HTTP — the filter

**The `Result` is the response contract**: the client receives it as it is, success or
failure, and the global handler (`exceptions.md`) answers in the same shape.

## Rules

1. **The filter only sets the response status to `result.HttpStatusCode`** — no unwrapping,
   reshaping, `ProblemDetails` or logging.
2. **It reads the non-generic base with one type check**:

   ```csharp
   if (context.Result is ObjectResult objectResult && objectResult.Value is Result result)
   {
       objectResult.StatusCode = (int)result.HttpStatusCode;
   }
   ```

3. **Registered once, globally**: an `IEndpointFilter` under minimal APIs, a result filter
   under controllers.

## Done when

Every rule holds, and endpoints return the `Result` untouched.
