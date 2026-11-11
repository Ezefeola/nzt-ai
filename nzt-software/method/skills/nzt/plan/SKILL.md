---
name: nzt-plan
description: Use when a plan has to be built, approved, changed, executed or resumed, when a feature the user accepted is closed, and whenever Plan/state.json is read or written - its schema lives here.
---

# Plan and execution

Turns the phases `nzt` chose into an approved plan of units, runs it, and keeps
`Plan/state.json` true. **Read `references/state.md` before writing the state.**

## References

| The unit is | Read | Read with |
|---|---|---|
| Showing a plan, new or rewritten | `references/proposal.md` | `references/state.md` |
| Full work, or work to deliver early | `references/slices.md` | `references/proposal.md` |
| Units that can run at the same time | `references/parallel.md` | — |
| Any question to the user, in any phase | `references/questions.md` | — |
| Closing a feature the user accepted | `references/close.md` | — |

## Build the plan

1. Take the phases `nzt` chose. Full work is cut into slices (`references/slices.md`).
2. Cut each phase into units in dependency order. A unit produces **one** artifact or covers
   **one** story, is reviewable alone, and its `do` fits on one line. Four specs are four units.
3. Verify's units go after the slice's last build unit, never between two.
4. Plan only what you can see: the current phase in units, the rest as its shape.
5. Write `goal`, `phases` (or `slices`) and `approved: false`; show the plan
   (`references/proposal.md`), and stop.

## Approve

- `approved: true` only when the user approves in this conversation. Silence or a question
  is not approval. The user may reorder, drop, add or rewrite: keep `done` units and their
  ids, give new ones new ids, ask again.
- **Accompanied is the default**: every unit stops. Offer autonomy once, as a **closed list**
  in `autonomy.units`: the next N units, or up to a checkpoint (end of a phase, a feature's
  acceptance) with every unit named. Silence is accompanied. A step that touches an
  environment other people share runs unattended only if the user named it.

## Execute

1. Take the first `todo` unit of the current phase (and slice). Set it `doing`, write.
2. Load the router the unit needs (kernel routing table) and, for code, `nzt-software`.
3. Do the unit; mark progress where that phase marks it.
4. Set it `done`, advance the phase or slice it closed, update `updated`, write.
5. Run the state check, then report. Chain only into the next unit of the batch.

An approved plan authorises its ordinary steps: do not ask again per file. Departing from it
is an explicit proposal — *the plan said X, I propose Y because Z* — never a substitution.

## State check

After every write of the state, run this skill's script from the project root. Its folder
is the one the host gives when it loads this skill:

- Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File <folder>/scripts/state-check.ps1`
- macOS, Linux: `python3 <folder>/scripts/state-check.py`

Exit 0 passes. Otherwise fix each line it prints and run it again. If the script cannot run
(no interpreter, or macOS offers to install the Command Line Tools), check the state against
`references/state.md` yourself and say in the report that the script did not run.

## Contradictions

When the work contradicts itself or cannot be built as agreed, emit one block — **the
problem · what it blocks · the options with their consequence** —, pause what depends on
it, continue with the rest, and resolve it with the user.

## Stop and report

1. Land on a safe point: nothing half-written, no question sitting on top of it.
2. Write the state. 3. Then report — in that order, so a lost session loses nothing.

| Field | Content |
|---|---|
| Produced | What exists now that did not before |
| Changed | What is different |
| Pending | What is left, including every open `[TO-DEFINE]`, in every report until resolved |
| Next | Copied from the agreed plan, never invented |

Show what the user can try, not which files exist. Stop early, and say why, when the unit
turns out bigger than one (re-cut it), when something changes the plan (set `waiting_on`),
or when the context is heavy.

## Resume

The `doing` unit's `detail` says where it stopped: confirm in one line, then continue.
Reconcile the state with the artifacts it names; evidence settles what happened, never what
was agreed. Ask only what is still unclear.

## Done when

- Nothing ran without approval, nothing chained outside `autonomy.units` or past a batch stop.
- No unit is left `doing` without a `detail` line at the end of a turn.
- The state passes the state check and describes reality; if the plan stopped doing so,
  the plan was fixed, not followed.
