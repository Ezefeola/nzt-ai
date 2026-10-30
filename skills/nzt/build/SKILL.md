---
name: nzt-build
description: Use when code changes: implementing a story, changing or removing behavior, fixing a defect, touching dependencies or secrets, or restructuring.
---

# Build — writing the code

This phase turns a story into working code, and marks its criteria's areas as it goes.

## Boundaries

**Owns:** source code, the automated tests that ship with it, the project setup it needs,
and the coverage marks on the criteria of the story being implemented.

**Does not own:** deciding what to build (`nzt-discovery`), deciding how it is structured
(`nzt-architecture`), the application-level test plan and its evidence (`nzt-verify`). The
boundary on tests: the ones that travel with the code are yours — `references/tests.md` says
what makes one worth keeping, whatever the stack — and the ones derived from an
approved test-plan scenario are `nzt-verify`'s. **Build never designs, scripts or runs
application tests**: no test plan, no manual script, no test data. What the stack's test
levels cannot reach is reported as *not covered until QA*, and QA runs once the slice is
built in every area, before the next slice starts.

## Required guidance

Before writing code, read the story with its criteria, the feature's business rules and the
glossary. Reuse what is already loaded — the tables below do not mean load every row. **A
domain term with no glossary entry stops the code that names it**: `nzt-discovery` writes the
entry first.

## Read the stack first

`<component folder>/Docs/Architecture/<area>-stack.md` of every area you touch — the folder
`Docs/Architecture/architecture.md` names — decides every table below. It is the operative
memory: read it before loading anything or choosing a technology or a pattern.

- **An installed folder is not an authorisation.** Every technology in this set is installed
  in every project; what makes one apply is the stack document, and nothing else.
- **A missing technical fact is checked in the project, not invented**: the manifest, the
  configuration, the code already there. Never invent a different stack because a skill is
  missing.
- **When the stack document and the manifest disagree, the manifest wins**, and the
  discrepancy is reported. A version is never raised to make an example compile: that is a
  stack change, and it goes through the stack's own door.
- **A mechanism the stack does not record is a gap in it**, not a free choice. When the
  evidence does not settle it, ask once and write the answer in the stack.
- Keep the stack current with the change, in the same unit that makes it true.

## Two escapes, and they are not the same

- **A small edit in an established place follows the convention next to it**, with no
  guidance reloaded.
- **Code this project does not document is written the way that code is written.** Your
  conventions step aside there, and the difference is reported rather than applied.

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The unit is | Read | Read with |
|---|---|---|
| Surveying existing code the change will run into, before changing it | `references/recon.md` | — |
| Implementing specified behavior: a story and its criteria | `references/implement.md` | `references/tests.md` |
| Repairing a reported defect | `references/implement.md` | `references/tests.md` |
| Changing structure without changing behavior | `references/refactor.md` | — |
| Removing a behavior that exists | `references/remove.md` | — |
| Adding, updating or removing a package | `references/dependencies.md` | — |
| Credentials or sensitive configuration | `references/secrets.md` | — |
| Writing the automated tests that ship with the change | `references/tests.md` | — |
| Writing the test first, **only if the stack selected TDD** | `references/tdd.md` | `references/tests.md`, `references/implement.md` |

Wherever a file names `nzt-build-<name>`, it means `references/<name>.md` in this folder
(`nzt-build-tests` → `references/tests.md`): read that file — it is not a skill. The area
routers below, `nzt-build-backend-dotnet` and `nzt-build-frontend-blazor`, and
`nzt-build-csharp` are skills.

## The area's practices

If the component's stack selected one of these technologies, load its area router after this
one — it is the only thing that knows that technology's leaves, and it reads the generic
references below as its own *Read with*:

| The area is | Load |
|---|---|
| Backend on .NET | `nzt-build-backend-dotnet` |
| Frontend on Blazor | `nzt-build-frontend-blazor` |

With no area router, the practices are the generic references, chosen by the same stack
axes from the index of the component's area — read only that one:

| The component is | Read |
|---|---|
| A backend with no area router | `references/practices-backend.md` |
| A frontend with no area router | `references/practices-frontend.md` |

**Read `references/code-code.md` before writing any code**, whatever the path: the rules of
code in any language. **Writing what a person sees — a new screen, a page, a component's
look — also reads `../nzt-ux/references/generic.md` first**, with or without a UX phase
before it: its visual plan before the markup, its pass on the rendered result after. **The generic reference says what holds and why; the stack document
says how it is done in this technology**, and how the technology behaves is verified in its
authoritative source before it enters the code (`nzt-research`). A generic reference names no
API on purpose.

## One unit

**One story.** Its criteria, with their area coverage (`backend ✓ · frontend — · qa —`), are
its closing list — the areas, never `qa`, which is `nzt-verify`'s. If a story is too big for
one unit, cut it by behavior, never by file or by area.

Project setup — solution, projects, the dependencies the stack lists, foundations — is
**authorised work** before the first story. Do not invent a story to justify it. **A package
the stack does not list is not setup**: the user confirms it first (`references/dependencies.md`).

## Where it lands

- Source code and the automated tests that ship with it → wherever this project's own
  structure puts them. Follow it; do not invent a layout.
- Coverage marks → the criteria of the story being implemented, in
  `Plan/specs/<feature>/stories/US-NNN-<slug>.md`. That is the only place progress is read
  from.

## Rules

Each reference holds the rules of its own work. These hold for every unit of the phase:

- **Read before writing.** The existing code is the specification of how this project does
  things.
- **Do not write code no spec asks for**, outside authorised setup and repairs to your own
  change. What should exist and does not is said, and the plan decides.
- **Technical work you find and do not do is reported, and it becomes an entry in
  `Docs/Architecture/tech-debt.md` when the user decides to defer it** — never a comment in
  the code and never a silent omission.
- **A change marker is authorisation, put there by `nzt-discovery` when the user approved the
  change.** You never add one and never clear one: the feature's close sweeps them.
- **Generated artifacts are generated by their command, never by hand** — a migration is the
  usual case. If the command does not run, the artifact is not written.
- **Never claim it works because it compiles**, and report what you did not do: skipped edge
  cases, deferred error handling, stubs.
- **Do not commit unless the user asked** (`nzt-ship`), and deploying is never an implicit
  step of building.

## Done when

The unit's reference says its own *Done when*, and it holds. What the tests the stack enables
cannot reach is reported as **not covered until QA** — never as green.
