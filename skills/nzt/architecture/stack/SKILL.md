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
- **Build and verify read the opt-ins.** Which levels of test ship with the code, whether
  it is written test-first, whether there is an end-to-end tool and how application tests
  get their data, is decided here and nowhere else. The opt-in is the user's answer,
  written once so no phase asks it again. The list is below, and it is closed.

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
| Tests | xUnit 3 | 2026-09 |

## Opt-ins
- **Test levels:** unit yes · integration against the real engine: yes · ephemeral
  containers: yes, Testcontainers · in-process API: no. Revisit the API one when the
  contract stops changing every week.
- **Test-first:** yes, for business rules. Not for wiring and configuration.
- **Automated end-to-end tests:** no. Revisit when there is a second client.
- **Test data:** SQL scripts, run by the agent against `dev`. Setup and teardown per
  scenario.

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
- An axis with no decision is an **open decision**, not a blank row. It is asked the way it
  always was; what changed is where the answer is kept — as `QT-NN` in
  `Docs/architecture-decisions.md`, saying what it blocks, with the row here citing its id.
- Two options coexisting in the code is not two rows: it is one row with the option that
  wins plus a `Planned` line saying the other is being retired.
- **The `Tests` axis is the framework and nothing else.** Whether tests are written, and
  how deep they go, is an opt-in — a runner and a container runtime are not the same
  decision, and writing them in one row is how the second one gets adopted without ever
  having been asked.

## The opt-ins

Four, and the list is closed. **Every one is answered, including the ones that are `no`.**

| Opt-in | What it settles | Read by |
|---|---|---|
| **Test levels** | which levels of automated test ship with the code | `nzt-build-tests` and its area leaf |
| **Test-first** | whether the test comes before the code, and for what | `nzt-build-tdd` |
| **Test data** | how an application test gets the data it needs | `nzt-verify-test-data`, which has the mechanisms |
| **Automated end-to-end tests** | the tool, named, or `no` | `nzt-verify-automate` |

**Test levels** is one line with every level answered: *unit · integration against the real
engine · ephemeral containers · in-process API*. End-to-end is not one of them — it is its
own opt-in, because it is derived from approved scenarios and belongs to verify.

- **A level that is not written is not enabled, and that includes unit.** A test project
  already in the repository is not a decision to write tests, the same way an installed
  tool was never a decision to use it. Build says in one line what is left uncovered and
  goes on: **it never stops over this**.
- **Ask them when this document is written** — once per component and area, which is the
  cheap moment. Ask with what each level costs: a container runtime on every machine and
  on CI, and minutes on every run. It is a tradeoff, so it is asked in every mode.
- **An existing component gets this document from evidence before its code is touched**, so
  that is where its levels are answered too — never in the middle of a build unit.
- A level adopted later is a change to this document, in the unit that adopts it.

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
- The four opt-ins are answered explicitly, including the ones that are `no`, and **Test
  levels** answers every level it lists — unit among them.
- The `Tests` axis names a framework, not the test infrastructure.
- Nothing in **Adopted** is aspirational, and nothing names a skill.
