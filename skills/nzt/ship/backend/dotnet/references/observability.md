# Observability in ASP.NET Core

`nzt-ship-observability` decides **what has to be observable and why**. This is how ASP.NET Core
provides it — and most of it is already there, waiting to be collected.

## Health checks

Register with `AddHealthChecks()` and **map separate endpoints with `MapHealthChecks`**, using
tags and a predicate so that **readiness runs the dependency checks and liveness runs none**.

One endpoint for both is the failure that takes the whole service down: a database blip makes
liveness fail, the platform restarts a process that was perfectly healthy, and the restart does
not fix the database.

## Telemetry is emitted already

.NET emits logs through `ILogger`, metrics through `Meter` and traces through `ActivitySource`.
**OpenTelemetry collects them** — the `OpenTelemetry.Instrumentation.AspNetCore` and
`OpenTelemetry.Instrumentation.Http` instrumentations with the
`OpenTelemetry.Exporter.OpenTelemetryProtocol` exporter — and **the OTLP endpoint is configured
through the standard OpenTelemetry environment variables**, not in code.

A solution using Aspire already has this in its service defaults: **check before adding it
again.**

**Adding telemetry packages is a dependency change** (`nzt-build-dependencies`) and it is
recorded in the stack.

## Structured logging

**Message templates with named placeholders, never interpolation inside the log call.** An
interpolated message is a unique string per request: the log stops being queryable by anything
except full text, which is exactly what was being paid for.

And nothing sensitive goes into a template or its arguments — a connection string, a token or a
personal identifier in a log is a leak with a long tail (`nzt-build-secrets`).

## Closing checklist

- [ ] Readiness and liveness are separate endpoints, and liveness runs no dependency check.
- [ ] Telemetry is collected through OpenTelemetry with the OTLP endpoint in configuration, and
      nothing was added that the project's defaults already provide.
- [ ] New telemetry packages were recorded in the stack as the dependency change they are.
- [ ] Every log call uses a message template, with no sensitive value in it.
- [ ] The SDK and package versions used came from the project.
