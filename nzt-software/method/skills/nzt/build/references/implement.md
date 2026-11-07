# Implement a story

Produces working product for **one story** and the area marks on its criteria. The criteria
are the definition of done.

## Steps

1. Read the feature design, if any. Work landing on something nobody can describe gets
   `recon.md` first.
2. Take the criteria in order. Implement each **where the design says the rule is
   enforced**; if it does not say and the answer is structural, raise the gap and do the rest.
   **A rule lives in one place.**
3. A dependency `tech.md` does not list is confirmed first (`dependencies.md`): pause what
   depends on it, build the rest. Create a folder only when something fills it.
4. Check it: build or render what is affected; behavior that changed earns its tests at the
   levels `tech.md` enables (`tests.md`), and they are run.
5. **Mark your area** on each criterion you built, as `nzt-discovery`'s `write-stories.md`
   defines the marks: a failing test is not `✓`. A `[modify]` criterion replaces the old
   behavior, never adds a parallel path.

## When the spec contradicts itself

Write `[SPEC-CONFLICT]` where you found it, pause what depends on it, build the rest. It is
resolved with the user and never swept.

## Repairing a reported defect

One unit, whole:

1. Investigate until you can **name the cause** — a fix on the symptom moves the defect.
2. Fix it where the cause is.
3. Reproduce the original case and show it now behaves; run what else covers that code.
4. Mark the violated criterion's area; its `qa` waits for `nzt-verify`'s re-run.

The defect file is `nzt-verify`'s to open and close. A defect you introduced yourself is
fixed and verified in the same unit without asking.

## Done when

The user could try the story from your report: the enabled tests ran, every criterion is
built or listed as not done, nothing under `testing/` was written, and every marker and
`[SPEC-CONFLICT]` is still there for the close.
