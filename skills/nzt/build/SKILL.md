---
name: nzt-build
description: Use when code changes: implementing a story, changing or removing behavior, fixing a defect, touching dependencies or secrets, or restructuring.
---

# Build — writing the code

This phase turns a story into working code, and marks its criteria as it goes.

## Boundaries

**Owns:** source code, the automated tests that ship with it, the project setup it needs,
and the coverage marks on the criteria of the story being implemented.

**Does not own:** deciding what to build (`nzt-discovery`), deciding how it is structured
(`nzt-architecture`), the application-level test plan and its evidence (`nzt-verify`). The
boundary on tests: the ones that travel with the code are yours; the ones derived from an
approved test-plan scenario are `nzt-verify`'s.

## Required guidance

Before writing code, read the stack document of every area you touch, the story with its
criteria, and the feature's business rules. Reuse what is already loaded — the tables below
do not mean load every row. **A small edit in an established place follows the convention
next to it, with no guidance reloaded.**

## Choose the skill

| The unit is | Load |
|---|---|
| Implementing specified behavior | `nzt-build-implement` |
| Repairing a reported defect | `nzt-build-implement` |
| Changing structure without changing behavior | `nzt-build-refactor` |
| Removing a behavior that exists | `nzt-build-remove` |
| Adding, updating or removing a package | `nzt-build-dependencies` |
| Credentials or sensitive configuration | `nzt-build-secrets` |
| Writing the test first, **only if the stack selected TDD** | `nzt-build-tdd` |

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

**One story.** Its criteria, with their area coverage (`backend ✓ · frontend —`), are its
closing list. If a story is too big for one unit, cut it by behavior, never by file or by
area.

Project setup — solution, projects, dependencies, foundations — is **authorised work**
before the first story. Do not invent a story to justify it.

## Where it lands

- Source code and the automated tests that ship with it → wherever this project's own
  structure puts them. Follow it; do not invent a layout.
- Coverage marks → the criteria of the story being implemented, in
  `Plan/specs/<feature>/stories/US-NNN-<slug>.md`. That is the only place progress is read
  from.

## Comment conventions

They apply to every unit of this phase, so they live here and not in a leaf.

- A comment says **why**. What the line already says is noise.
- Explain the non-obvious: a workaround with its cause, an externally imposed constraint, a
  decision that looks wrong and is not. Name its source when it has one (`Q-07`, `QT-03`, a
  bug id).
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
  when the spec contradicts itself while you are building. Markers survive until the
  feature closes; whoever implements does not clean them up.
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

The affected code compiles, the verifications the change justifies were **run**, the
coverage of every verified criterion is marked by area, and anything with no evidence of
execution is reported as **not verified** — never as green. Committing happens only if
asked, and deploying is never an implicit step of implementing.

## Closing checklist

- [ ] Affected code compiles.
- [ ] The checks this change justifies were executed, not just written.
- [ ] Area coverage marked on every criterion actually verified.
- [ ] Everything without execution evidence reported as not verified.
- [ ] Stack document current with what the change adopted.
- [ ] No commented-out code and no comment that is no longer true.
- [ ] Change markers left as they are, for the feature close to sweep.
- [ ] What you did not do, said out loud.
