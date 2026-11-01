---
name: nzt-dotnet
description: Use when tech.md lists the dotnet pack, before writing, testing or shipping a .NET service - endpoints, results to HTTP, EF Core, architecture, domain model, persistence, exceptions, tests, containers, migrations, CI and observability.
---

# Backend on .NET

Load `nzt-backend` and `nzt-csharp` first. Each file here names the generic file it builds
on: read that one first. Versions come from the project — `global.json`, `TargetFramework`,
the package manifest — never from an example.

## Axes

`tech.md` names one value per axis; read only that row. The generic axes (Architecture,
Domain model, Persistence) take the values of `nzt-backend`, and their file here follows it.

| Axis | Value | Read | What it costs |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | as in `nzt-backend` |
| | `clean-architecture` | `references/architecture-clean.md` | as in `nzt-backend` |
| | `hexagonal-architecture` | `references/architecture-hexagonal.md` | as in `nzt-backend` |
| Domain model | `ddd` | `references/domain-ddd.md` | as in `nzt-backend` |
| | `anemic` | `references/domain-anemic.md` | as in `nzt-backend` |
| Persistence | `repositories` | `references/persistence-repositories.md` | as in `nzt-backend` |
| | `direct` | `nzt-backend`'s file only | as in `nzt-backend` |
| Endpoints | `minimal-apis` | `references/endpoints-minimal.md` | an endpoint is a function: route, verb and handler in one declaration |
| | `controllers` | `references/endpoints-controllers.md` | a class per feature with attribute routing and the MVC pipeline; more ceremony |
| Result to HTTP | `result-extensions` | `references/results-extensions.md` | the `Result` stays inside: the payload on success, `ProblemDetails` on failure |
| | `result-filter` | `references/results-filter.md` | the `Result` is the response contract, one shape for success and failure |
| ORM | `EF Core` (any version) | the *EF Core* section | the context, its migrations and its tooling |

Whether use cases return `Result` is `nzt-backend`'s; how it reaches HTTP is the axis above.

## References

| The work touches | Read |
|---|---|
| The operation and its orchestration | `references/use-cases.md` |
| An operation's inputs and their validator | `references/validation.md` |
| Anything returning `Result` | `references/results-pattern.md` |
| API wiring: routing, binding, the pipeline | `references/api.md` |
| An exception that can escape a use case, or the global handler | `references/exceptions.md` |
| A value object — **only with *value objects yes*** | `references/domain-value-objects.md` |
| Test projects, doubles, running the suite | `references/testing.md` |

## EF Core

Read `references/ef-core.md` first, every time: what holds for every operation lives there.

| The operation | Read |
|---|---|
| Reading: query shape, projection, execution | `references/ef-core-queries.md` |
| A page of results | `references/ef-core-pagination.md`, after `references/ef-core-queries.md` |
| Staging and saving changes, write conflicts | `references/ef-core-writes.md` |
| Updating or deleting many rows by criteria | `references/ef-core-bulk.md` |
| `DbContext` configuration, entity mapping, relationships | `references/ef-core-mappings.md` |
| Mapping an aggregate or a value object | `references/ef-core-domain.md` |
| A schema change | `references/ef-core-migrations.md` |
| An index or a uniqueness rule | `references/ef-core-indexes.md` |

## Ship

With `nzt-ship`. The SDK is the one `global.json` pins (without a pin, the highest
`TargetFramework`'s, and proposing the pin is part of the unit). Nothing is upgraded to get
a pass: that changes `tech.md`, with the user.

| The unit is | Read | Read with |
|---|---|---|
| Packaging the component as a container image | `references/ship-containers.md` | `nzt-ship`'s `references/release.md` |
| Getting migrations into an environment | `references/ship-migrations.md` | `nzt-ship`'s `references/release.md` |
| Writing or repairing the CI gates | `references/ship-pipeline.md` | `nzt-ship`'s `references/pipeline.md` |
| Health checks, telemetry, structured logging | `references/ship-observability.md` | `nzt-ship`'s `references/observability.md` |

## Done when

Every file read was selected by `tech.md` or by the task, never two of one axis, the
versions used came from the project, and a disagreement with `tech.md` was reported.
