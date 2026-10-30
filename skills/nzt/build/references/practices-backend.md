# Backend practices — selection by stack axis

For a backend component with no area router, as `nzt-build` sends it here. `backend-stack.md`
decides every row; paths are relative to `nzt-build`'s folder, and the file is read before
acting on its row.

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read | What it costs, when it is chosen |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/backend-architecture-vertical-slice.md` | one folder per feature, and removing it is deleting the folder; a duplicate between slices is accepted as the cheap problem |
| | `clean-architecture` | `references/backend-architecture-clean.md` | four layers in separate units, every reference pointing inward; one feature touches several units |
| | `hexagonal-architecture` | `references/backend-architecture-hexagonal.md` | a core with every contract, and one unit per adapter, one external system each; more units, every outside dependency isolated |
| Domain model | `ddd` | `references/backend-domain-ddd.md` | entities and aggregates protect their own rules; more modelling up front |
| | `anemic` | `references/backend-domain-anemic.md` | entities carry data, use cases carry the rules; cheap, and a rule two use cases need is duplicated |
| Persistence | `repositories` | `references/backend-persistence-repositories.md` | one per aggregate root with its interface, plus a unit of work; a seam for tests, and a layer on every query |
| | `direct` | `references/backend-persistence-direct.md` | use cases use the data access handle itself; less code, tied to that library |

**Domain model and persistence are independent.** DDD does not imply repositories, and an
anemic model does not imply direct access.

A stack that names none of these is a gap in the stack document: say so and fill it there, do
not pick one here.

## Rows the task selects

| The work touches | Read | Read with |
|---|---|---|
| A DTO or its mapping: what an operation returns or receives | `references/code-dtos.md` | — |
| A collection read, transformed or checked in memory | `references/code-collections.md` | — |
| The operation and its orchestration | `references/backend-use-cases.md` | — |
| The inputs of an operation and their validators | `references/backend-validation.md` | — |
| Anything returning a Result from a use case | `references/backend-results.md` | — |
| An exception that can escape a use case, or the API's error handling | `references/backend-errors.md` | `references/backend-use-cases.md` |
| An endpoint, its binding, or how a Result reaches HTTP | `references/backend-api.md` | `references/backend-results.md` |
| A protected resource, permissions, suspected unauthorised access | `references/backend-security.md` | — |
| A value object, written or changed — **only if the stack's DDD line says *value objects yes*** | `references/backend-domain-value-objects.md` | `references/backend-domain-ddd.md` |

## Data access — when the component reads or writes a database

**Read `references/data-access.md` first, every time, whatever the row**: it carries what holds
for every operation, and no row below repeats it.

| The operation | Read | Read with |
|---|---|---|
| Reading data: query shape, projection, execution | `references/data-queries.md` | — |
| Returning a page of results | `references/data-pagination.md` | `references/data-queries.md` |
| Staging and saving changes, write conflicts | `references/data-writes.md` | — |
| Updating or deleting many rows by criteria | `references/data-bulk.md` | `references/data-writes.md` |
| The handle's configuration, entity mapping, relationships, mapping an aggregate or a value object | `references/data-mapping.md` | — |
| A schema change that needs a migration | `references/data-migrations.md` | — |
| An index, or a uniqueness rule to enforce | `references/data-indexes.md` | — |
