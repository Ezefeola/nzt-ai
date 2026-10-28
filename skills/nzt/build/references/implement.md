# Implement a story

## Contents
- Before writing code
- The work
- Marking coverage
- When the spec contradicts itself
- Repairing a reported defect
- Done when

Produces working code for **one story**, and the area marks on that story's criteria.
The criteria are the definition of done; nothing else is.

## Before writing code

Read the story and the rules it cites, the feature design if it has one, and the stack
document of the component and area you are touching. Reuse what is already loaded. **When
the change lands on code nobody can describe from memory, the survey comes first**:
`nzt-build-recon`, and its risks are what the plan cuts the work by.

- **A package the stack does not list is never installed without the user's confirmation**
  — `nzt-build-dependencies` asks it. Pause what depends on it and build the rest.
- A folder exists when something fills it. An empty folder created "for later" is an
  invitation to put anything in it.

## The work

1. Take the story's criteria in order. They say what has to be observable when you are
   done.
2. Implement each one **where the design says the rule is enforced**. If the design does
   not say, and the answer is structural, that is a design gap: raise it, do the rest.
   **A rule is enforced in one place**: duplicating it gives you two rules that drift apart
   with nothing tying them together.
3. Check what you changed. Compile what is affected. **Behavior that changed earns its
   automated tests at the levels the stack enables** — `nzt-build-tests` says which and what
   makes them worth keeping — and those tests are run.
4. Mark the area on the criteria you built.
5. Report what exists now, what is left, and what is not covered until QA.

**Never print a secret and never ask the user to paste one into the chat.** Check that it is
present and name the key. `nzt-build-secrets` has the rest.

## Marking coverage

The coverage line lives on each criterion in
`Plan/specs/<feature>/stories/US-NNN-<slug>.md`. **That is the only place progress is read
from.**

- Mark your area `✓` when it is built: **it compiles and the tests the stack enables for it
  pass**. A failing test is not a `✓`.
- What those tests cannot reach — a rule that only shows through the API, a row only a real
  engine confirms, a screen nobody drove — is listed as *not covered until QA*, and you keep
  building.
- `qa` is not yours, and neither is `[x]`: `nzt-verify` marks `qa`, and only the user
  accepts.
- A `[modify]` on a criterion means **replace** the old behavior, never add a parallel path
  beside it.

## When the spec contradicts itself

Emit `[SPEC-CONFLICT]` where you found it, pause what depends on it, and keep building the
rest. It is resolved with the user, never by picking one reading quietly, and it is never
swept: the feature's close waits for its answer.

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
are the one who fixed it. Report the fix and let that phase move its state. A defect you
introduced yourself is repaired and verified in the same unit, without asking.

## Done when

Rehearse it: could the user try this story right now, from what you are about to report?

- What is affected compiles, and the tests the stack enables were **run**: their result is
  what you report.
- Every criterion is implemented, or explicitly listed as not done.
- Every criterion you built has its area marked, and none with a failing test.
- What those tests cannot reach is named as not covered until QA — a list, never a test
  plan, and nothing under `testing/` was written.
- No rule is enforced in two places by accident.
- Every marker in the spec, and every `[SPEC-CONFLICT]` you emitted, is still there for
  whoever closes the feature.
