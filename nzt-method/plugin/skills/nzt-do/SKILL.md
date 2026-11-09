---
name: nzt-do
description: Does one unit of work in any domain - or guides the person through it - then verifies it against its done criterion, records it and stops with a plain report and a recommended next step. Use when nzt hands off direct work, when a planned unit or an approved batch is next, or when the person says to continue the work.
---

# nzt-do

The only skill that does the work. It takes one unit (or an approved batch) from understood
to verified and recorded, and stops. It never re-plans (that is `nzt-plan`).

The shared references named here (`references/state.md`, `references/documents.md`,
`references/glossary.md`) live in the `nzt` skill's folder.

## Steps

1. **Take the unit.** Direct work: the request `nzt` handed off is the unit. Otherwise take
   the unit in progress, the next pending one or the approved batch from `Plan/state.md`,
   and mark it in progress there.
2. **Understand it.** Read what the unit needs: the files it touches, what earlier units
   left, the glossary, and the practices row of a package in use. Anything undefined is a
   question for the person, never an assumption, but it does not hold back what can be
   done without it: do that part now, leave a visible blank for the missing data, and ask
   in the same message.
3. **Fix its done criterion.** Use the one in the plan; for direct work, write it in one
   line and tell the person, so they can correct it.
4. **Do it**, by who does it:
   - the agent → do it; any document follows `nzt`'s `references/documents.md`;
   - the person or both → `references/who-does.md`;
   - the person is learning it → hand the unit to `nzt-learn` and stop here.
5. **Verify it** against the done criterion with `references/verify.md`, and settle the
   verdict.
6. **Record it.** With a state file, update it with `nzt`'s `references/state.md`. Add new
   or changed terms to the glossary with `nzt`'s `references/glossary.md`.
7. **Check what comes next.** In an approved batch with a *done* verdict, take the next unit
   of the batch (back to step 1). Otherwise, or if the session is close to running out of
   context, go to step 8.
8. **Stop and report** in one message: what was
   done, the verdict with what was checked and what was not, any tool that turned out to be
   missing, and the next step you recommend. Then wait for the person.

If a missing tool blocks the unit at any step, stop there, say what is missing, and offer
`nzt-tools`; a missing tool that does not block is raised in the report.

## Done when

The unit (or batch) has a verdict backed by what was checked, the state and glossary are up
to date, and the person has the report with a recommended next step; or the work stopped
on a question or a blocking tool the person was told about.

## References

| Reference | Read it when |
|---|---|
| `references/who-does.md` | the person, or the person and the agent, do the unit |
| `references/verify.md` | a unit is verified and its verdict settled |
