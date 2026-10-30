---
name: nzt-plan
description: Use when a plan has to be built, approved, changed, executed or resumed, and whenever Plan/state.json is read or written - its schema and rules live here.
---

# Planning and execution

## The state file

`Plan/state.json` at the project root is plan and state together. **Read
`references/state.md` in this skill's folder before writing it**: its schema and rules
are there, and it is never written from memory.

## Cutting the work into units

A unit is the smallest piece that can be delivered and reviewed on its own. Cut so that:

- It produces **one** artifact, or changes one module, or covers one story.
- It can be reviewed without reading the other units.
- It fits comfortably in the remaining context.
- Its `do` line fits on one line. If it needs a paragraph, it is more than one unit.

Typical units, one each: a product document, a glossary, a feature spec, a story, a feature's
technical design, a screen, a story implemented, a story's test set, a release, a feature
closed. Never bundle "write the 4 specs" into one unit: four specs are four units.

**A row is a step, not a file.** Which artifacts a step produces is decided when that step
is produced: the plan says what it delivers, not which files will end up existing.

## Building the plan

1. Take the phases chosen by `nzt`, or choose them if the work is small and obvious. **A
   product, a feature of several stories, or work to deliver early is cut into slices**:
   read `references/slices.md` in this skill's folder before cutting.
2. Turn each phase into its units, in dependency order. **Verify's units go after the
   slice's last build unit, never between two**, unless the user asks for it — a plan with
   `phases` is a plan of one slice. Units that depend on none of each other: read
   `references/parallel.md` before marking a group.
3. Write `goal`, `phases` or `slices` (the first `doing`) and `approved: false`.
4. Show the plan in the reply, as `references/proposal.md` in this skill's folder says —
   the table, its declarations and the documents it lists — and ask for approval. Stop.

Keep the plan to what you can see. Fifteen units written before the first spec exists is
guesswork: plan the phase you are in and the shape of the rest.

**Clarifying what the user wants is a step of the plan, not a prerequisite for it.** Its
questions start when that step starts. The plan message carries the plan and the autonomy
offer, and no definition questions.

## Approval and autonomy

Set `approved: true` only when the user approves it in this conversation. Silence is not
approval. A question about the plan is not approval.

The user can change anything: reorder units, drop them, add them, change the goal. Rewrite
the plan and keep asking until they approve: `done` units keep id and status, new get new ids.

**Accompanied is the default**: every unit stops. Offer autonomy once, with the plan, as a
**closed list of units** in `autonomy.units`, never open-ended: **the next N units**, or
**up to a checkpoint** — the end of an analysis, architecture or UX phase, a phase's own
stop, a feature's acceptance —, always offered, with every unit up to it named by id. A
unit cut later joins a batch only if the user adds it. Not answering is
accompanied, approving selects no autonomy, and *"continue"* advances the next agreed
stretch without changing mode. A step that touches an environment other people share runs
without stopping **only if the user named that environment**.

## Executing

1. Take the first `todo` unit of the current phase, in the current slice if any. Set it `doing`.
2. Load the skill that unit needs, per the routing table in your instructions.
3. Do the unit, and mark progress where that phase marks it.
4. Set it to `done`, update `updated`, advance the phase or slice it closed, write.
5. Report. Take the next unit only if the batch lists it and no batch stop is due; else stop.

**A direct request or an approved plan authorises its ordinary steps.** Do not ask again
for each file or each repair: a new door opens for new scope or a material decision, not
for every step.

**Departing from an agreed plan is an explicit proposal** — *"the plan said X, I propose Y
because Z"* — never a silent substitution.

## Questions

Before asking the user anything, read `references/questions.md` in this skill's folder:
when a question is asked, how, which log it is written in, and its two exits. It holds for
every phase.

## When the work contradicts itself

When a spec contradicts itself, or cannot be built the way it was agreed, emit a block with
a fixed shape — **the problem · what it blocks · the options with their consequence** —
pause what depends on it, and continue with the rest of the authorised work. It is resolved
with the user, never by silently picking one.

## Stopping and reporting

The order matters:

1. **Land on a safe point.** Everything produced is complete and saved: no half-written
   artifact, no open question sitting on top of it.
2. **Write the state.**
3. **Then report.** A report written first and persisted afterwards is lost if the session
   ends between the two.

The report has four fields, in 3–5 lines:

| Field | What goes in it |
|---|---|
| Produced | What now exists that did not before |
| Changed | What is different from before |
| Pending | What is left, including every open `[TO-DEFINE]` |
| Next | **Copied from the agreed plan**, never invented |

- **Show what the user can try, not which files exist.**
- Every open `[TO-DEFINE]` appears in **every** report until it is resolved.
- Finishing early does not cancel an agreed stop, and a progress report does not create a
  new approval gate or end the task.
- **The report that crosses a context mark says so**, as the kernel requires: advising to
  clear fires there or for a concrete benefit you name, after persisting, never as a gate.

## Stopping early

Stop before the next unit and say so when:

- The context is getting heavy or the session is close to compacting.
- The unit turned out to be bigger than one unit. Re-cut it and show the new units.
- You found something that changes the plan: a wrong assumption, a blocker, a dependency
  nobody saw. Set `waiting_on` and stop. Do not work around it silently.

## Resuming

What each case of the state means at the start of a session is `nzt`'s first step. The
`doing` unit's `detail` says where it stopped: confirm in one line what you are resuming,
then continue.

Reconcile the state with the user's current decisions, the artifacts it references and the
changes around them. **Evidence settles what happened; it is not authority to rewrite what
was agreed.** Reconstruct what is missing from evidence, ask only about the decisions that
are still unclear, and do not redo finished work without a reason.

## Rules

- Never chain into a unit `autonomy.units` does not list, nor past the kernel's batch stops.
- Never leave a unit `doing` at the end of a turn without a `detail` line.
- **A feature is closed by the user's acceptance, and closing it is a unit**: read
  `references/close.md` in this skill's folder, which sweeps its markers, brings its documents
  current and writes its history entry. A feature with markers left in its spec is not done.
- The plan serves the work. If it stops describing reality, fix the plan; do not follow it
  off a cliff.
