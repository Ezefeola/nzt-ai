---
name: nzt-build-backend-dotnet
description: Use when the component's stack selects C# and .NET for the backend, before writing or changing its code: the table that turns each stack axis into the one skill to load.
---

# Backend on .NET — selection by stack axis

This router loads nothing by itself. It reads the component's stack document and turns each
axis into **the one reference** that axis selected. Paths are relative to this skill's folder.
**Read the file before acting on the row** — the row is not the guidance, the file is.

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
table is a selection, not an order to read every line.** A real task reads three or four.

## Exclusive axes — read only what the stack selected

The stack names the concept; this table turns it into a reference. Never read two rows of
the same axis.

| Axis | The stack says | Read | Read with |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | — |
| | `clean-architecture` | `references/architecture-clean.md` | — |
| | `hexagonal-architecture` | `references/architecture-hexagonal.md` | — |
| Endpoints | `minimal-apis` | `references/endpoints-minimal.md` | `references/api.md` |
| | `controllers` | `references/endpoints-controllers.md` | `references/api.md` |
| Domain model | `ddd` | `references/domain-ddd.md` | `references/domain-ddd-behaviour.md` — the same guidance, split at 200 lines |
| | `anemic` | `references/domain-anemic.md` | — |
| Persistence | `repositories` | `references/persistence-repositories.md` | — |
| | `direct` | `references/persistence-direct.md` | — |
| Result to HTTP | `result-extensions` | `references/results-extensions.md` | `references/results-pattern.md` |
| | `result-filter` | `references/results-filter.md` | `references/results-pattern.md` |

**A stack that names the old skill instead of the concept resolves by that reference's
documented meaning.** A stack that names neither is a gap in the stack document: say so and
fill it there, do not pick one here.

## Rows the task selects

| The work touches | Read | Read with |
|---|---|---|
| The operation and its orchestration | `references/use-cases.md` | — |
| The inputs of an operation and their validators | `references/validation.md` | — |
| Anything returning `Result` from a use case | `references/results-pattern.md` | — |
| API wiring: routing, model binding, pipeline | `references/api.md` | — |
| An exception that can escape a use case, or the API's error handling | `references/exceptions.md` | `references/use-cases.md` |
| A value object, written or changed — **only if the stack's DDD line says *value objects yes*** | `references/domain-value-objects.md` | — |
| A protected resource, permissions, suspected unauthorised access | `references/security.md` | — |
| Test projects, doubles, running the suite | `references/testing.md` | `../nzt-build/references/tests.md` |

Wherever a file names `nzt-build-backend-dotnet-<name>` and this folder has
`references/<name>.md`, that is what it means
(`nzt-build-backend-dotnet-domain-ddd` → `references/domain-ddd.md`): read that file — it is
not a skill.

Wherever a file here names `nzt-build-tests`, `nzt-build-dependencies` or
`nzt-build-secrets`, it means `../nzt-build/references/<name>.md`
(`nzt-build-tests` → `../nzt-build/references/tests.md`): read that file — it is not a
skill. If `nzt-build` already had you read it in this session, do not read it again. Likewise
`nzt-build-csharp-<name>` means `../nzt-build-csharp/references/<name>.md`.

## EF Core

Only when the stack selected EF Core as the ORM. **Read `references/ef-core.md` first, every
time, whatever the row**: it carries the rules that hold for all of it — tracking, the
context's lifetime, what never happens in a loop — and no row below repeats them. Then read
the row's file **and every file in its *Read with* column**; a row read alone is half the
guidance.

| The operation | Read | Read with — also required |
|---|---|---|
| Reading data: query shape, projection, execution | `references/ef-core-queries.md` | `references/ef-core.md` |
| Returning a page of results | `references/ef-core-pagination.md` | `references/ef-core.md`, `references/ef-core-queries.md` |
| Staging and saving changes, write conflicts | `references/ef-core-writes.md` | `references/ef-core.md` |
| Updating or deleting many rows by criteria | `references/ef-core-bulk.md` | `references/ef-core.md` |
| DbContext configuration, entity mapping, relationships | `references/ef-core-mappings.md` | `references/ef-core.md` |
| Mapping an aggregate or a value object | `references/ef-core-domain.md` | `references/ef-core.md` |
| A schema change that needs a migration | `references/ef-core-migrations.md` | `references/ef-core.md` |
| An index, or a uniqueness rule to enforce | `references/ef-core-indexes.md` | `references/ef-core.md` |

## Two escapes, and they are not the same

- **A small edit in an established place follows the convention next to it**, without
  reloading guidance. The scale rule of the kernel applies inside a phase too.
- **Code this project does not document is written the way that code is written.** This set
  is installed globally and will see repositories that are not its own: **your conventions
  step aside there**, and the difference is reported rather than applied.

## Independent axes

Getting these wrong reads references that contradict each other:

- **Domain model and persistence are independent.** DDD does not imply repositories, and an
  anemic model does not imply direct access.
- **The Result pattern and how a Result reaches HTTP are two decisions.** The first is
  whether use cases return `Result`; the second is what translates it, and only the second
  is an exclusive axis.
- **Validation and the domain are not alternatives.** Input validation runs before the use
  case; an invariant lives in the model. A rule pushed to the wrong one of the two is
  enforced twice or never.

## Closing checklist

- [ ] Every row read was selected by the stack document, not by preference.
- [ ] No two rows of the same axis were read.
- [ ] Versions used came from the manifest, and any disagreement with the stack was reported.
- [ ] The stack document was updated in this unit if the work changed what it declares.
