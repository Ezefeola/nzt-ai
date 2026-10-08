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
levels cannot reach is reported as *not covered until QA*, and QA runs after the increment
is built.

## Required guidance

Before writing code, read the stack document of every area you touch, the story with its
criteria, and the feature's business rules. Reuse what is already loaded — the tables below
do not mean load every row. **A small edit in an established place follows the convention
next to it, with no guidance reloaded.**

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

If the component's stack selected one of these areas, load its area router — it is
the only thing that knows that technology's leaves:

| The area is | Load |
|---|---|
| Backend on .NET | `nzt-build-backend-dotnet` |
| Frontend on Blazor | `nzt-build-frontend-blazor` |

**An installed folder is not an authorisation.** A technology the stack did not select is
never loaded. If no area applies to this component, read the neighbouring code and follow the
conventions already there. Never impose another project's conventions on this one.

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

## Comment conventions

They apply to every unit of this phase, so they live here and not in a leaf.

- A comment says **why**. What the line already says is noise, and it goes stale: the line
  changes, the comment stays, and the file carries two answers with nothing to say which
  one runs.
- **What a comment usually tries to fix is a name.** A variable, a method or a type that
  said too little. Fix the name instead.
- Explain the non-obvious: a workaround with its cause, an externally imposed constraint, a
  decision that looks wrong and is not. Name its source when the source is a record that
  does not move — an ADR, a defect id, a provider's issue.
- **The spec does not travel into the code.** No rule slug, no story id, no requirement
  text in a comment. Traceability lives in the specs, where each rule has one original that
  changes in one place; a rule quoted in the code is a **second original** that drifts the
  first time the rule is edited, with nothing pointing at it to say so. The code implements
  the rule; it does not cite it.
- Never leave commented-out code. Version control already keeps it; a commented block is a
  question nobody can answer.
- No change logs, author names or dates in comments. That is the repository's job.
- Follow the comment style and language of the code around you, even if it is not the one
  you would choose.
- A comment that stops being true is fixed or deleted in the same unit as the code.

## Rules

- **The stack is the operative memory.** Read it before choosing a technology or a pattern.
  A missing technical fact is checked in the manifest, the configuration or the code — you
  never invent a different stack because a skill is missing. When the stack document and
  the manifest disagree, **the manifest wins** and the discrepancy is reported. Do not
  raise a version to make an example compile: that is a stack change and goes through that
  door.
- Keep the stack current with the change, in the same unit that makes it true.
- **Do not write code no spec asks for** — outside authorised setup. If you find something
  that should exist and does not, say so and let the plan decide.
- **Change markers have fixed meaning**: `[modify]` replaces the old behavior instead of
  adding a parallel path, `[remove]` takes it out, and `[SPEC-CONFLICT]` is what you emit
  when the spec contradicts itself while you are building. The first two are put there by
  the change reference of `nzt-discovery`, when the user approved the change; they survive
  until the close of `nzt-plan` sweeps them, and whoever implements does not clean them up.
- **Technical work you find and do not do is reported, and it becomes an entry in
  `Docs/tech-debt.md` when the user decides to defer it** — never a comment in the code and
  never a silent omission.
- A refactor changes structure and nothing else. If behavior changed, it was not a
  refactor: it needs its own spec and its own verification. A refactor still needs the
  existing behavior verified, and the technical documents kept current.
- A reported bug includes investigation, fix and regression verification, in one unit.
- **Generated artifacts are generated by their command, never by hand.** If the command
  does not run, the artifact is not written.
- **Foreign component escape**: in code this project does not document, write it the way
  that code is written and move your own conventions aside.
- Every screen that loads data has three states from its first version: loading, empty and
  error.
- The frontend validates shape; business rules are validated where they live.
- Read before writing. The existing code is the specification of how this project does
  things.
- Never claim it works because it compiles. Static inspection is not an executed test.
- Report what you did not do: skipped edge cases, deferred error handling, stubs.

## Done when

The affected code compiles, the tests the stack enables were **run**, every criterion built
has its area marked, and what those tests cannot reach is reported as **not covered until
QA** — never as green. Committing happens only if
asked, and deploying is never an implicit step of implementing.

## Closing checklist

- [ ] Affected code compiles.
- [ ] The tests the stack enables for this change were executed, not just written.
- [ ] Area coverage marked on every criterion built; `qa` left to `nzt-verify`.
- [ ] What those tests cannot reach reported as not covered until QA, with no test plan
      or manual script written for it here.
- [ ] Stack document current with what the change adopted.
- [ ] No commented-out code and no comment that is no longer true.
- [ ] Change markers left as they are, for the feature close to sweep.
- [ ] What you did not do, said out loud.
