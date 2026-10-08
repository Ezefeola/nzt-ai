# Implement a story

## Contents
- Before writing code
- The work
- Marking coverage
- Write it the way this code is written
- Change markers
- Rules that hold whatever the stack is
- Repairing a reported defect
- Do not build what nobody asked for
- Closing
- Done when

Produces working code for **one story**, and the area marks on that story's criteria.
The criteria are the definition of done; nothing else is.

## Before writing code

Read the story and the rules it cites, the feature design if it has one, and the stack
document of the component and area you are touching. Reuse what is already loaded. **When
the change lands on code nobody can describe from memory, the survey comes first**:
`nzt-build-recon`, and its risks are what the plan cuts the work by.

- **The stack is the operating memory.** It is read before choosing a technology or a
  pattern, so the repository does not get rediscovered on every task. A missing technical
  fact is checked in the manifest, the configuration or the code — **never replaced by
  inventing a different stack because a skill is missing.**
- **When the stack document and the manifest disagree, the manifest wins**, and the
  discrepancy is reported. Versions are not inferred from what compiles or from what is
  newest, and **a version is never raised to make an example compile**: that is a stack
  change and goes through the stack's own door.
- Project setup — solution, projects, the dependencies the stack lists, foundations — is
  **authorised work** before the first story. Do not invent a story to justify it.
- **A package the stack does not list is never installed without the user's confirmation**
  — `nzt-build-dependencies` asks it. Pause what depends on it and build the rest.

## The work

1. Take the story's criteria in order. They say what has to be observable when you are
   done.
2. Implement each one **where the design says the rule is enforced**. If the design does
   not say, and the answer is structural, that is a design gap: raise it, do the rest.
3. Check what you changed. Compile what is affected. **Behavior that changed earns its
   automated tests at the levels the stack enables** — `nzt-build-tests` says which and what
   makes them worth keeping — and those tests are run.
4. Mark the area on the criteria you built.
5. Report what exists now, what is left, and what is not covered until QA.

## Marking coverage

The coverage line lives on each criterion in
`Plan/specs/<feature>/stories/US-NNN-<slug>.md`. **That is the only place progress is read
from.**

- Mark your area `✓` when it is built: **it compiles and the tests the stack enables for it
  pass**. A failing test is not a `✓`.
- **What those tests cannot reach is not yours to prove.** A rule that only shows through
  the API, a row that only a real engine confirms, a screen nobody drove: report it as
  *not covered until QA* and keep building. **Never write a test plan, a manual script or
  test data to get evidence for it** — that is `nzt-verify`, and it runs once the increment
  is built, against the whole of it.
- `qa` is not yours, and neither is `[x]`: `nzt-verify` marks `qa`, and only the user
  accepts.

## Write it the way this code is written

- **In code this project does not document, follow the code that is there.** Naming,
  layout, error handling, test style: match the neighbours. Your conventions step aside —
  reformatting somebody else's project while passing through is not part of the task.
- A small edit in an established place follows the convention beside it. Do not reload the
  whole guidance stack for a one-line change.
- A folder exists when something fills it. An empty folder created "for later" is an
  invitation to put anything in it.

## Change markers

They have fixed meanings, and they survive until the feature is closed — whoever
implements does not clear them, and `nzt-plan-close` is what sweeps them:

| Marker | What it means |
|---|---|
| `[modify]` | **Replace** the old behavior, not add a parallel path beside it |
| `[remove]` | Take it out. The sweep is `nzt-build-remove`'s job |
| `[SPEC-CONFLICT]` | The spec contradicts itself and you found it while building |

The first two arrive with an approved change — `nzt-discovery-change` put them there — so a
marker is authorisation, not a suggestion. **You never add one yourself**: if the spec
should change, that goes through discovery.

On `[SPEC-CONFLICT]`: emit it, pause what depends on it, keep building the rest. It is
resolved with the user, never by picking one reading quietly.

## Rules that hold whatever the stack is

- **Any screen that loads data has three states from its first version: loading, empty and
  error.** The one that only draws the happy path gets the other two later, under pressure,
  from someone who was fixing something else.
- **The frontend validates shape; business rules are enforced where they live.**
  Duplicating a rule gives you two rules that drift apart with nothing tying them together.
- **Generated artifacts are generated by their command, never written by hand** — a
  migration is the usual case. If the command does not run, the artifact is not written.
  A hand-written generated file is a lie nobody audits again.
- **Never print a secret and never ask the user to paste one into the chat.** Check that it
  is present and name the key. `nzt-build-secrets` has the rest.

## Repairing a reported defect

A defect is specified behavior that is not there, so it is built here — in **one unit**,
whole:

1. **Investigate until you can name the cause.** A fix applied to the symptom moves the
   defect; it does not remove it.
2. Fix it where the cause is, not where it surfaced.
3. **Verify the regression**: reproduce the original case and show it now behaves, and run
   what else that code covers.
4. Mark the area of the criterion the defect violated, if the story has one. Its `qa`
   waits for `nzt-verify`'s re-run.

The bug file itself belongs to `nzt-verify`: it opens it and it closes it, even when you
are the one who fixed it. Report the fix and let that phase move its state.

## Do not build what nobody asked for

- No criterion, no code — except authorised setup, and repairs to your own change.
- A defect you introduced is repaired and verified in the same unit, without asking.
- Something you find outside the scope is **reported, not implemented**. If the user decides
  to leave it, it becomes an entry in `Docs/Architecture/tech-debt.md`; undecided, it stays in the report
  and nowhere else.

## Closing

Measurable, in this order:

1. What is affected compiles.
2. The tests the stack enables have been run, and their result is what you report.
3. The area marked on every criterion that is built and whose tests pass.
4. What those tests cannot reach is named as not covered until QA — a list, never a test
   plan.

- **Do not commit unless the user asked.** `nzt-ship-vcs` owns that.
- **Deploying is never an implicit step of implementing.**

## Done when

Rehearse it: could the user try this story right now, from what you are about to report?

- Every criterion is implemented, or explicitly listed as not done.
- Every criterion you built has its area marked, and none with a failing test.
- No rule is enforced in two places by accident.
- Every marker you emitted is still in the file for whoever closes the feature.
- The report says what ran, what failed and what is left for QA — and nothing under
  `testing/` was written.
