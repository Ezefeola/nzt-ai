# Backend practices — selection by stack axis

For a backend component whose stack has **no area router** in `nzt-build`'s table. A component
that has one goes there instead: that router reads these same generic references as its
*Read with*, so going through both reads them twice.

`<component folder>/Docs/Architecture/backend-stack.md` decides every row below. Read it first.
Paths are relative to `nzt-build`'s folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read |
|---|---|---|
| Architecture | `vertical-slice` | `references/backend-architecture-vertical-slice.md` |
| | `clean-architecture` | `references/backend-architecture-clean.md` |
| | `hexagonal-architecture` | `references/backend-architecture-hexagonal.md` |
| Domain model | `ddd` | `references/backend-domain-ddd.md` |
| | `anemic` | `references/backend-domain-anemic.md` |
| Persistence | `repositories` | `references/backend-persistence-repositories.md` |
| | `direct` | `references/backend-persistence-direct.md` |

**Domain model and persistence are independent.** DDD does not imply repositories, and an
anemic model does not imply direct access.

A stack that names none of these is a gap in the stack document: say so and fill it there, do
not pick one here.

## Rows the task selects

**Read `references/code-code.md` before writing any code**: the rules of code in any language.

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

## Applying a generic reference to a technology

- **The generic reference says what holds and why; the stack document says how it is done in
  this technology.** Where the reference leaves a mechanism to the stack — the boundary
  between layers, the entry point, how a registration is written — read it there.
- **A mechanism the stack document does not record is a gap in it**, not a free choice. Check
  the project's evidence first — the manifest, the code already there — and when the evidence
  does not settle it, ask once and write the answer in the stack.
- **How the technology behaves is verified in its authoritative source** before it enters the
  code (`nzt-research`). A generic reference names no API on purpose.
