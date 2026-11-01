# Observability in ASP.NET Core

With `nzt-ship`'s `references/observability.md`, which decides what must be observable. Most of
it is already emitted.

## Rules

1. **`AddHealthChecks()` with separate `MapHealthChecks` endpoints**, by tag and predicate:
   readiness runs the dependency checks, **liveness none** — or a database blip restarts a healthy
   process.
2. **.NET emits through `ILogger`, `Meter` and `ActivitySource`; OpenTelemetry collects**
   (`OpenTelemetry.Instrumentation.AspNetCore`, `.Http`, `OpenTelemetry.Exporter.OpenTelemetryProtocol`),
   with the OTLP endpoint in the standard environment variables, not code. Aspire service
   defaults may already do it — check first. New packages are a dependency change recorded in
   `tech.md`.
3. **Message templates with named placeholders**, never interpolation in the log call. Nothing
   sensitive in a template or its arguments (`nzt-build`'s `references/secrets.md`).

## Done when

Readiness and liveness are separate, telemetry flows through OpenTelemetry with configured OTLP,
and every log call is a template without sensitive values.
