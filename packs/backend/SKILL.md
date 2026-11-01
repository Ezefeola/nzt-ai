---
name: nzt-backend
description: Use when tech.md lists the backend pack for the component, before writing or changing a service - architecture, domain model, persistence, use cases, validation, errors, results, API, security and data access, whatever the technology.
---

# Backend — what holds in any technology

Load `nzt-code` first. A technology pack (`nzt-dotnet`…) reads the matching file here first
and adds only how it is done there.

## Axes

`tech.md` names one value per axis. Read only that row; never two of the same axis. Every
architecture value reads `references/architecture.md` first.

| Axis | Value | Read | What it costs |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | one folder per feature, removed by deleting it; a duplicate between slices is the accepted cheap problem |
| | `clean-architecture` | `references/architecture-clean.md` | four layers, every reference inward; one feature touches several units |
| | `hexagonal-architecture` | `references/architecture-hexagonal.md` | a core with every contract and one adapter per external system; more units, every dependency isolated |
| Domain model | `ddd` | the `nzt-ddd` pack | entities protect their own rules; more modelling up front |
| | `anemic` | `references/domain-anemic.md` | entities carry data, use cases the rules; a rule two use cases need is duplicated |
| Persistence | `repositories` | `references/persistence-repositories.md` | one per aggregate root plus a unit of work; a seam for tests, a layer on every query |
| | `direct` | `references/persistence-direct.md` | use cases use the data handle itself; less code, tied to that library |

Domain model and persistence are independent: `ddd` does not imply repositories, `anemic`
does not imply direct.

## References

| The work touches | Read | Read with |
|---|---|---|
| The operation and its orchestration | `references/use-cases.md` | — |
| An operation's inputs and their validator | `references/validation.md` | — |
| Anything returning a Result | `references/results.md` | — |
| An exception that can escape a use case, or the global handler | `references/errors.md` | `references/use-cases.md` |
| An endpoint, its binding, or how a Result reaches HTTP | `references/api.md` | `references/results.md` |
| A protected resource, a permission, suspected unauthorised access | `references/security.md` | — |

## Data access

When the component reads or writes a database, read `references/data-access.md` first, every
time: what holds for every operation lives there and no row repeats it.

| The operation | Read | Read with |
|---|---|---|
| Reading: query shape, projection, execution | `references/data-queries.md` | — |
| A page of results | `references/data-pagination.md` | `references/data-queries.md` |
| Staging and saving changes, write conflicts | `references/data-writes.md` | — |
| Updating or deleting many rows by criteria | `references/data-bulk.md` | `references/data-writes.md` |
| The handle's configuration, entity mapping, relationships | `references/data-mapping.md` | — |
| A schema change | `references/data-migrations.md` | — |
| An index or a uniqueness rule | `references/data-indexes.md` | — |

## Steps

1. Read the axes' values in `tech.md`. A missing one is a gap there: say so and settle it
   with the user, never pick it here.
2. Read the axis rows, then the rows the task selects.
3. With a technology pack listed, read its matching file right after each one here.

## Done when

Every file read was selected by `tech.md` or by the task, never two of one axis, and each
file's *Done when* holds.
