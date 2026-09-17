---
name: nzt-architecture-stack
description: Use when a component's adopted technologies are recorded or updated - one document per component and area. Mandatory before any code is written.
---

# Stack document

Produces `Docs/<area>-stack-<component>.md`: what this component is built with, which
option it took on each axis, and what it opted into. One document per **component and
area** — a component with a backend and a frontend has two.

**No component gets built without one.** A new component gets it when it is designed; an
existing one gets it from evidence before its code is touched.

If you did not arrive here from `nzt-architecture`, load it first.

## What this document is for

Three readers, and each one needs something different from it:

- **The stack documents declare which areas exist in this project.** That list is closed,
  and it is the same list acceptance criteria use to mark coverage (`backend ✓ ·
  frontend —`). An area with no stack document does not exist.
- **The area skills select by axis.** Where a technology offers exclusive alternatives,
  this file says which one was taken, and only that one is ever loaded.
- **Build and verify read the opt-ins.** Whether this component is written test-first, or
  gets automated end-to-end tests, is decided here and nowhere else.

## The file

```markdown
# Backend stack — Pedidos.Api
component: Pedidos.Api · area: backend

## Adopted
| Axis | Choice | Since |
|---|---|---|
| Runtime | .NET 10.0.2 | 2026-09 |
| Language | C# 14 | 2026-09 |
| Architecture | vertical-slice | 2026-09 |
| Domain model | anemic | 2026-09 |
| Persistence | EF Core 10 against PostgreSQL 17 | 2026-09 |
| Endpoints | minimal APIs | 2026-09 |
| Error handling | result pattern | 2026-09 |
| Tests | xUnit 3 + Testcontainers | 2026-09 |

## Opt-ins
- **Test-first:** yes, for business rules. Not for wiring and configuration.
- **Automated end-to-end tests:** no. Revisit when there is a second client.

## Conventions
- One folder per use case, with its request, handler and validator together.
- Every write goes through the use case; no controller touches the DbContext.

## Packages
| Package | Version | Why it is here |
|---|---|---|
| FluentValidation | 12.0.1 | Input validation, wired into the pipeline |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.0 | Postgres provider |

## Planned
- Moving background sending out of the request. Not adopted; nothing depends on it yet.

## Evidence
Versions read on 2026-09-16 from `global.json` and `Directory.Packages.props`.
Undetermined: nothing.
```

## Record the concept, never the skill

`Architecture: vertical-slice`, not the name of the skill that implements it. The concept
survives a rename, it can be read without opening anything, and it is what the next reader
actually needs. This matters more here than elsewhere: skill names in this set come from
the folder tree, so they move.

## One choice per axis

- An axis is a place where the technology offers **exclusive alternatives** — one domain
  model, one endpoint style, one error-handling shape. Write the one that was taken.
- An axis with no decision is an **open decision**, not a blank row. Write it as `QT-NN`
  and say what it blocks.
- Two options coexisting in the code is not two rows: it is one row with the option that
  wins plus a `Planned` line saying the other is being retired.

## Versions come from evidence

- Read them from the project's own files: the SDK pin, the manifest, the lock file, the
  central package versions. **Never from what compiles, what is installed on this machine,
  or what is newest.**
- Say in **Evidence** which files you read and when. A version with no source is a guess
  with a decimal point.
- What you could not determine is written as undetermined, with what would settle it.

## An existing component

Write it from what the code shows, before touching that code.

- Record what is **actually** used, not what the team intended. Two patterns in the
  codebase means the row says which one wins from now on — that is a decision, so it is
  the user's, not yours.
- Anything you infer rather than read is marked as inferred until someone confirms it.

## Adopted is not planned

Only what is in place goes in **Adopted**. Everything else is **Planned**, and stays there
until it exists. A stack document that describes intentions is a document the next phase
will build against and get wrong.

## Keeping it current

The document is part of the change: when a version moves, a package is added or an axis is
re-decided, it is updated in the same unit, never afterwards. A stack that lags the code
sends every reader in the wrong direction and is worse than none.

## Done when

Rehearse it: could someone write code in this component tomorrow, correctly, with only this
file and the specs?

- Its area and component are named at the top.
- Every axis has one choice, or a `QT-NN` saying it is open.
- Every version traces to a file named in **Evidence**.
- The opt-ins are answered explicitly, including the ones that are `no`.
- Nothing in **Adopted** is aspirational, and nothing names a skill.
