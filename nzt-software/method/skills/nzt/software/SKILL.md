---
name: nzt-software
description: Use for the code of a component Docs/Architecture/tech.md declares - its language, framework and practices (C#, .NET, Blazor, DDD, backend, frontend) - before designing, writing, testing or shipping it.
---

# Software rules

The rules for each technology and practice a component declares. Every path below is under
`references/`; each table's columns are those technologies and practices.

## Steps

1. Read the component's areas, technology rows and axis values in
   `Docs/Architecture/tech.md`. A value missing there is a gap in `tech.md`: ask it with
   `references/choosing.md`, never pick one here.
2. Take the columns that apply, by the table below. A column whose condition `tech.md` does
   not meet is never read.
3. Read the axis rows, then the rows the task selects. In each row, read left to right: the
   generic file first, then the file of each technology column that applies.
4. Take versions from the project — `global.json`, `TargetFramework`, the package manifest —
   never from an example.
5. Report any disagreement between `tech.md` and the code: the code wins.

| Column | Applies when `tech.md` declares | What it is |
|---|---|---|
| `code` | any code | the user's rules for any language |
| `backend` | the area `backend`, or `dotnet` applies | services, whatever the technology |
| `frontend` | the area `frontend`, or `blazor` applies | screens, components and forms, whatever the framework; how they look is the design system's |
| `csharp` | *Language* C# | the C# language |
| `ddd` | *Domain model* `ddd` | aggregates, contexts and value objects |
| `dotnet` | *Framework* ASP.NET Core, or a service on .NET | services on .NET |
| `blazor` | *Framework* Blazor | screens on Blazor |

## Code

| The work touches | `code` | `csharp` |
|---|---|---|
| Any code, every time | `code/code.md` | `csharp/rules.md` |
| What an operation receives or returns, or its mapping | `code/dtos.md` | `csharp/dtos.md` |
| A collection read, transformed or checked in memory | `code/collections.md` | `csharp/linq.md` |

## Backend

`tech.md` names one value per axis: never two of one axis. Every architecture value reads
`backend/architecture.md` first. Domain model and persistence are independent: `ddd` does not
imply repositories, `anemic` does not imply direct.

| Axis | Value | `backend` | `dotnet` |
|---|---|---|---|
| Architecture | `vertical-slice` | `backend/architecture-vertical-slice.md` | `dotnet/architecture-vertical-slice.md` |
| | `clean-architecture` | `backend/architecture-clean.md` | `dotnet/architecture-clean.md` |
| | `hexagonal-architecture` | `backend/architecture-hexagonal.md` | `dotnet/architecture-hexagonal.md` |
| Domain model | `ddd` | the *DDD* section | `dotnet/domain-ddd.md` |
| | `anemic` | `backend/domain-anemic.md` | `dotnet/domain-anemic.md` |
| Persistence | `repositories` | `backend/persistence-repositories.md` | `dotnet/persistence-repositories.md` |
| | `direct` | `backend/persistence-direct.md` | — |
| Endpoints (`dotnet`) | `minimal-apis` | `backend/api.md` | `dotnet/api.md`, `dotnet/endpoints-minimal.md` |
| | `controllers` | `backend/api.md` | `dotnet/api.md`, `dotnet/endpoints-controllers.md` |
| Result to HTTP (`dotnet`) | `result-extensions` | `backend/api.md`, *Result to HTTP* | `dotnet/results-extensions.md` |
| | `result-filter` | `backend/api.md`, *Result to HTTP* | `dotnet/results-filter.md` |
| ORM (`dotnet`) | `EF Core` (any version) | — | the *Data access* table |

| The work touches | `backend` | `dotnet` |
|---|---|---|
| The operation and its orchestration | `backend/use-cases.md` | `dotnet/use-cases.md` |
| An operation's inputs and their validator | `backend/validation.md` | `dotnet/validation.md` |
| Anything returning a `Result` | `backend/results.md` | `dotnet/results-pattern.md` |
| An exception that can escape a use case, or the global handler | `backend/errors.md`, `backend/use-cases.md` | `dotnet/exceptions.md` |
| An endpoint, its binding, or how a `Result` reaches HTTP | `backend/api.md`, `backend/results.md` | the *Endpoints* and *Result to HTTP* rows |
| A protected resource, a permission, suspected unauthorised access | `backend/security.md` | — |
| Test projects, doubles, running the suite | `nzt-build`'s `references/tests.md` | `dotnet/testing.md` |

### Data access

| The operation | `backend` | `dotnet` |
|---|---|---|
| Any read or write to a database, every time, before its row | `backend/data-access.md` | — |
| Reading: query shape, projection, execution | `backend/data-queries.md` | `dotnet/ef-core-queries.md` |
| A page of results | `backend/data-queries.md`, `backend/data-pagination.md` | `dotnet/ef-core-queries.md`, `dotnet/ef-core-pagination.md` |
| Staging and saving changes, write conflicts | `backend/data-writes.md` | `dotnet/ef-core-writes.md` |
| Updating or deleting many rows by criteria | `backend/data-writes.md`, `backend/data-bulk.md` | `dotnet/ef-core-bulk.md` |
| The handle's configuration, entity mapping, relationships | `backend/data-mapping.md` | `dotnet/ef-core-mappings.md` |
| Mapping an aggregate or a value object | `backend/data-mapping.md`, *A domain model that protects itself* | `dotnet/ef-core-mappings.md`, `dotnet/ef-core-domain.md` |
| A schema change | `backend/data-migrations.md` | `dotnet/ef-core-migrations.md` |
| An index or a uniqueness rule | `backend/data-indexes.md` | `dotnet/ef-core-indexes.md` |

### Ship (`dotnet`)

With `nzt-ship`. The SDK is the one `global.json` pins (without a pin, the highest
`TargetFramework`'s, and proposing the pin is part of the unit). Nothing is upgraded to get
a pass: that changes `tech.md`, with the user.

| The unit is | `nzt-ship` | `dotnet` |
|---|---|---|
| Packaging the component as a container image | `references/release.md` | `dotnet/ship-containers.md` |
| Getting migrations into an environment | `references/release.md` | `dotnet/ship-migrations.md` |
| Writing or repairing the CI gates | `references/pipeline.md` | `dotnet/ship-pipeline.md` |
| Health checks, telemetry, structured logging | `references/observability.md` | `dotnet/ship-observability.md` |

## Frontend

`tech.md` names one value per axis. Another architecture value is a gap there: never
improvise a layout.

| Axis | Value | `frontend` | `blazor` |
|---|---|---|---|
| Architecture | `vertical-slice` | `frontend/architecture-vertical-slice.md` | `blazor/architecture-vertical-slice.md` |
| Render mode (`blazor`) | `server` | `frontend/rendering.md`, *Interactive on the server* | `blazor/render-server.md` |
| | `webassembly` | `frontend/rendering.md`, *Interactive in the browser* | `blazor/render-webassembly.md` |
| | `auto` | `frontend/rendering.md`, *Either place* | `blazor/render-auto.md` |
| | `static` | `frontend/rendering.md`, *Server-rendered, no interactivity* | `blazor/render-static.md` |
| Component organisation (`blazor`) | `inline` | — | `blazor/components.md`, its `inline` rules |
| | `code-behind` | — | `blazor/components.md`, its `code-behind` rules |

- **Read a render-mode row only when the work changes rendering.** A copy change in an
  established component does not need it.
- **Component organisation unanswered** while the existing components clearly follow one:
  that is the answer, and it goes into `tech.md`.

| The work touches | `frontend` | `blazor` |
|---|---|---|
| A component or screen: inputs, events, loading, the typed client, the three states | `frontend/components.md` | `blazor/components.md` |
| A form, its validation or its submission | `frontend/components.md`, `frontend/forms.md` | `blazor/components.md`, `blazor/forms.md` |
| Prerendered state, initial state transfer, persistent services | `frontend/rendering.md`, *A server pass before the interactive one* | the render-mode file, `blazor/prerendering.md` |
| Lists, grids, repeated components, frequent events — after a measurement | `frontend/components.md`, `frontend/performance.md` | `blazor/performance.md` |

## DDD

The pieces — aggregates, value objects, domain events, typed ids — are answered in `tech.md`:
a piece not `yes` is not built, and adopting it later is the user's change to that line.
Without a DDD line, ask it before modelling.

| The work is | `ddd` | `dotnet` |
|---|---|---|
| The domain model's aggregates: boundaries, roots, references by id | `nzt-architecture`'s `references/domain.md`, `ddd/aggregates.md` | — |
| More than one context, or meaning shared with a third party | `ddd/contexts.md` | — |
| Drawing `bounded-contexts` or `aggregates` | `nzt-architecture`'s `references/diagrams.md`, `ddd/diagrams.md` | — |
| An entity or aggregate in code: rules, creation, changes | `ddd/ddd.md` | `dotnet/domain-ddd.md` |
| A value object in code — **only with *value objects yes*** | `ddd/ddd.md`, `ddd/value-objects.md` | `dotnet/domain-value-objects.md` |

## Done when

Every file read was selected by `tech.md` or by the task, never two of one axis, a
render-mode file only because rendering changed, no DDD piece built without `yes`, the
versions came from the project, and each file's *Done when* holds.
