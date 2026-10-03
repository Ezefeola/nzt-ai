---
name: nzt-build-backend-dotnet
description: Use when the component's stack selects C# and .NET for the backend, before writing or changing its code: the table that turns each stack axis into the one skill to load.
---

# Backend on .NET — selection by stack axis

This router loads nothing by itself. It reads the component's stack document and turns each
axis into **the one skill** that axis selected.

If you did not arrive here from `nzt-build`, load it first.

## Read the stack first

`Docs/backend-stack-<component>.md` decides every row below. Read it before loading
anything, and before choosing a technology or a pattern.

- **An installed folder is not an authorisation.** This whole tree is installed in every
  project, including the ones that are not .NET. What makes it apply is the stack document,
  and nothing else.
- **A missing technical fact is checked in the project, not invented**: the manifest, the
  configuration, the code. Never a different stack because a skill was missing.
- **Version-dependent APIs need local evidence** — `TargetFramework`, the package version in
  the manifest, the SDK pin. **When the stack document and the manifest disagree, the
  manifest wins** and the discrepancy is reported. A version is never bumped to make an
  example from a skill compile: that is a stack change and goes through the stack door.

## Required guidance

Load `nzt-build-csharp` before applying any row here. **Reuse what is already loaded: this
table is a selection, not an order to load every line.** A real task loads three or four.

## Exclusive axes — load only what the stack selected

The stack names the concept; this table turns it into a skill. Never load two rows of the
same axis.

| Axis | The stack says | Load |
|---|---|---|
| Architecture | `vertical-slice` | `nzt-build-backend-dotnet-architecture-vertical-slice` |
| | `clean-architecture` | `nzt-build-backend-dotnet-architecture-clean` |
| | `hexagonal-architecture` | `nzt-build-backend-dotnet-architecture-hexagonal` |
| Endpoints | `minimal-apis` | `nzt-build-backend-dotnet-endpoints-minimal` |
| | `controllers` | `nzt-build-backend-dotnet-endpoints-controllers` |
| Domain model | `ddd` | `nzt-build-backend-dotnet-domain-ddd` |
| | `anemic` | `nzt-build-backend-dotnet-domain-anemic` |
| Persistence | `repositories` | `nzt-build-backend-dotnet-persistence-repositories` |
| | `direct` | `nzt-build-backend-dotnet-persistence-direct` |
| Result to HTTP | `result-extensions` | `nzt-build-backend-dotnet-results-extensions` |
| | `result-filter` | `nzt-build-backend-dotnet-results-filter` |

**A stack that names the skill instead of the concept resolves by the skill's documented
meaning.** A stack that names neither is a gap in the stack document: say so and fill it
there, do not pick one here.

## Rows the task selects

| The work touches | Load |
|---|---|
| The operation and its orchestration | `nzt-build-backend-dotnet-use-cases` |
| The inputs of an operation and their validators | `nzt-build-backend-dotnet-validation` |
| Anything returning `Result` from a use case | `nzt-build-backend-dotnet-results-pattern` |
| API wiring: routing, model binding, pipeline | `nzt-build-backend-dotnet-api` |
| An exception that can escape a use case, or the API's error handling | `nzt-build-backend-dotnet-exceptions` |
| A value object, written or changed — **only if the stack's DDD line says *value objects yes*** | `nzt-build-backend-dotnet-domain-value-objects` |
| A protected resource, permissions, suspected unauthorised access | `nzt-build-backend-dotnet-security` |
| Test projects, doubles, running the suite | `nzt-build-backend-dotnet-testing` |

## EF Core

Only when the stack selected EF Core as the ORM. `nzt-build-backend-dotnet-ef-core` carries
the rules that hold for all of it — tracking, the context's lifetime, what never happens in
a loop — and is loaded with any of the rows below.

| The operation | Load |
|---|---|
| Reading data: query shape, projection, execution | `nzt-build-backend-dotnet-ef-core-queries` |
| Returning a page of results | `nzt-build-backend-dotnet-ef-core-pagination` |
| Staging and saving changes, write conflicts | `nzt-build-backend-dotnet-ef-core-writes` |
| Updating or deleting many rows by criteria | `nzt-build-backend-dotnet-ef-core-bulk` |
| DbContext configuration, entity mapping, relationships | `nzt-build-backend-dotnet-ef-core-mappings` |
| Mapping an aggregate or a value object | `nzt-build-backend-dotnet-ef-core-domain` |
| A schema change that needs a migration | `nzt-build-backend-dotnet-ef-core-migrations` |
| An index, or a uniqueness rule to enforce | `nzt-build-backend-dotnet-ef-core-indexes` |

## Two escapes, and they are not the same

- **A small edit in an established place follows the convention next to it**, without
  reloading guidance. The scale rule of the kernel applies inside a phase too.
- **Code this project does not document is written the way that code is written.** This set
  is installed globally and will see repositories that are not its own: **your conventions
  step aside there**, and the difference is reported rather than applied.

## Independent axes

Getting these wrong loads skills that contradict each other:

- **Domain model and persistence are independent.** DDD does not imply repositories, and an
  anemic model does not imply direct access.
- **The Result pattern and how a Result reaches HTTP are two decisions.** The first is
  whether use cases return `Result`; the second is what translates it, and only the second
  is an exclusive axis.
- **Validation and the domain are not alternatives.** Input validation runs before the use
  case; an invariant lives in the model. A rule pushed to the wrong one of the two is
  enforced twice or never.

## Closing checklist

- [ ] Every row loaded was selected by the stack document, not by preference.
- [ ] No two rows of the same axis were loaded.
- [ ] Versions used came from the manifest, and any disagreement with the stack was reported.
- [ ] The stack document was updated in this unit if the work changed what it declares.
