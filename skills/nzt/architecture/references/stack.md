# Stack document

## Contents
- What this document is for
- The file
- What does not go here
- Record the concept, never the skill
- One choice per axis
- The opt-ins
- Packages are the user's
- Versions come from evidence
- An existing component
- Keeping it current
- Done when

Produces `<component folder>/Docs/Architecture/<area>-stack.md`: what this component is built with, which
option it took on each axis, what it opted into, and which packages it uses. One document
per **component and area** — a component with a backend and a frontend has two.

**No component gets built without one.** A new component gets it when it is designed; an
existing one gets it from evidence before its code is touched.

## What this document is for

**A technical card, read in a minute.** Every phase opens it before touching code, so it
carries what the agent needs to write this component correctly and nothing else. Three
readers:

- **The stack documents declare which areas exist in this project.** That list is closed,
  and it is the same list acceptance criteria use to mark coverage (`backend ✓ ·
  frontend — · qa —`). An area with no stack document does not exist, and `qa` is never
  one: it is verify's mark, and it closes every line.
- **The area skills select by axis.** Where a technology offers exclusive alternatives,
  this file says which one was taken, and only that one is ever loaded.
- **Every phase reads the opt-ins.** How deep the domain model goes, which levels of test
  ship with the code, whether it is test-first, whether there is an end-to-end tool and how
  application tests get their data. The opt-in is the user's answer, written once so no
  phase asks it again.

## The file

Five blocks, in this order, and no others:

```markdown
# Backend stack — Pedidos.Api
component: Pedidos.Api · area: backend

| Axis | Choice | When |
|---|---|---|
| Runtime | .NET 10 | — |
| Language | C# 14 | — |
| Database | PostgreSQL 17 | — |
| Architecture | vertical-slice | — |
| Domain model | ddd | entities and aggregates protect the order rules |
| ORM | EF Core 10 | every access to PostgreSQL |
| Persistence | direct | use cases reach the DbContext; no repositories |
| Endpoints | minimal APIs | every HTTP endpoint |
| Error handling | result pattern | expected failures; exceptions stay exceptional |
| Tests | xUnit 3 | — |

## Opt-ins
- **DDD:** aggregates yes · value objects yes · domain events no · typed ids no
- **Test levels:** unit yes · integration against the real engine: yes · ephemeral
  containers: yes · in-process API: no
- **Test-first:** yes, for business rules
- **Automated end-to-end tests:** no
- **Test data:** SQL scripts, run by the agent against `dev`

## Packages
| Package | What for | When to use it |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 | EF Core provider for PostgreSQL | persistence and migrations |
| MailKit 4.18.0 | SMTP client | delivering queued emails |

## Conventions
- Secrets live outside the repository; in development, in user secrets.
- A request without a session answers `401`, never a redirect.

Versions read on 2026-09-16 from `global.json` and `Directory.Packages.props`.
```

- **The axis table** has one row per axis. *When* says where the choice applies, in a few
  words, or `—` when it applies everywhere.
- **The package table** lists every package the project references directly, with its
  version beside the name. *What for* is what it does; *when to use it* is which code
  reaches for it. Transitive packages are not listed.
- **A convention is one line.** It records what the agent cannot deduce from the axes, the
  packages or the code: a rule this project holds to. Two lines is a decision, and it goes
  to the decision log.
- **Evidence is one line**: which files the versions were read from, and when. What could
  not be determined is written as undetermined in that line, with what would settle it.
- A `Planned` block appears only when something is on its way, one line each.

## What does not go here

| It is | It goes to |
|---|---|
| Source URLs, support dates, what was checked in a registry | the decision log, `Docs/Architecture/architecture-decisions.md`, beside the `QT-NN` it backs |
| Why something was chosen, the history of a change | the decision log |
| The folder and project structure | the leaf skill of the architecture chosen — it already defines it |
| How a feature uses a package | the feature's design |

If it needs a paragraph, it is not a stack entry. **A stack that reads like an architecture
document gets skimmed, and a skimmed stack is one nobody follows.**

## Record the concept, never the skill

`Architecture: vertical-slice`, not the name of the skill that implements it. The concept
survives a rename, it can be read without opening anything, and it is what the next reader
actually needs. Skill names in this set come from the folder tree, so they move.

## One choice per axis

- An axis is a place where the technology offers **exclusive alternatives** — one domain
  model, one endpoint style, one error-handling shape. Write the one that was taken.
- An axis with no decision is an **open decision**, not a blank row: it is recorded as
  `QT-NN` in `Docs/Architecture/architecture-decisions.md`, saying what it blocks, and the row cites it.
- Two options coexisting in the code is one row with the option that wins, plus a `Planned`
  line saying the other is being retired.
- **The `Tests` axis is the framework and nothing else.** Whether tests are written, and how
  deep they go, is an opt-in.

## The opt-ins

Five, and the list is closed. **Every one is answered, including the ones that are `no`**,
and **what is not written is not enabled**. Ask them when this document is written — once
per component and area, which is the cheap moment — each with what it costs, in every mode.

| Opt-in | What it settles | Read by |
|---|---|---|
| **DDD** | which DDD pieces this model uses — only when the domain axis is `ddd` | `nzt-architecture-domain` and the area's domain leaves |
| **Test levels** | which levels of automated test ship with the code | `nzt-build-tests` and its area leaf |
| **Test-first** | whether the test comes before the code, and for what | `nzt-build-tdd` |
| **Test data** | how an application test gets the data it needs | `nzt-verify-test-data` |
| **Automated end-to-end tests** | the tool, named, or `no` | `nzt-verify-automate` |

**DDD** answers four pieces: *aggregates · value objects · domain events · typed ids*.
Choosing DDD is not choosing all of it: a value object per rule-bearing field, events
between aggregates and a type per id each cost code on every change. A piece that is not
`yes` is not built — no value object, no event, no id wrapper — and adopting one later is a
change to this line, the user's.

**Test levels** is one line with every level answered: *unit · integration against the real
engine · ephemeral containers · in-process API*. End-to-end is its own opt-in, because it is
derived from approved scenarios and belongs to verify.

- **A level that is not written is not enabled, and that includes unit.** A test project
  already in the repository is not a decision to write tests, the same way an installed tool
  was never a decision to use it. Build says in one line what is left for QA and goes on.
- Ask the levels with what each costs: a container runtime on every machine and on CI, and
  minutes on every run.
- **An existing component gets this document from evidence before its code is touched**, so
  that is where its opt-ins are answered too — never in the middle of a build unit.

## Packages are the user's

**A package enters this table only after the user confirmed it** — when the component is
designed, or when a build unit needs one (`nzt-build-dependencies`). A package in the
manifest and not in this table is a decision nobody made.

## Versions come from evidence

- Read them from the project's own files: the SDK pin, the manifest, the lock file, the
  central package versions. **Never from what compiles, what is installed on this machine,
  or what is newest.**
- A version with no source is a guess with a decimal point.

## An existing component

Write it from what the code shows, before touching that code.

- Record what is **actually** used, not what the team intended. Two patterns in the
  codebase means the row says which one wins from now on — that is a decision, so it is
  the user's, not yours.
- Anything you infer rather than read is marked as inferred until someone confirms it.

## Keeping it current

The document is part of the change: when a version moves, a package is added or an axis is
re-decided, it is updated in the same unit, never afterwards. Only what is in place is in
the tables; a stack that lags the code, or describes intentions, sends every reader in the
wrong direction.

## Done when

Rehearse it: could someone write code in this component tomorrow, correctly, with only this
file and the specs — after reading it in a minute?

- Its area and component are named at the top, and it has only the five blocks.
- Every axis has one choice, or a `QT-NN` saying it is open.
- The five opt-ins are answered explicitly, including the ones that are `no`; **DDD**
  answers its four pieces when the domain axis is `ddd`, and **Test levels** every level.
- Every direct package has its row, with version, what for and when, and every one was
  confirmed by the user.
- Every convention is one line, and no source URL, history or folder tree is in the file.
- The evidence line names the files the versions came from.
