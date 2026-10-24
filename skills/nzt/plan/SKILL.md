---
name: nzt-plan
description: Use when a plan has to be built, approved, changed, executed or resumed, and whenever Plan/state.json is read or written - its schema and rules live here.
---

# Planning and execution

## The state file

`Plan/state.json` at the project root is plan and state together: no separate plan file,
never a log, progress lives in the artifacts. Write it from this section, never from memory.

```json
{
  "version": 1,
  "updated": "2026-09-16T14:22:00Z",
  "goal": "one line: what this run is for",
  "phases": [{ "name": "build", "status": "doing", "units": [
    { "id": 4, "do": "one line", "status": "doing", "detail": "where you stopped" }] }],
  "approved": true, "delegation": "ask",
  "autonomy": { "units": [4, 5], "keep_stops": [5] },
  "waiting_on": "what you are blocked on, or null",
  "notes": ["at most 3 short items"]
}
```

- `status` is `todo`, `doing`, `done` or `dropped`. At most one unit is `doing`. Every entry, one line.
- `phases` are the phases `nzt` chose, in run order, named `analysis`, `architecture`, `ux`,
  `build`, `verify` or `ship` and no other, with the same statuses and **at most one `doing`**:
  that one is the current phase, a skipped one is not listed. **Each unit lives in its phase's
  `units`**, in run order, ids unique in the file; the next unit is the first `todo` of the
  phase `doing`. **When a phase's last unit ends, that same write marks it `done` and the
  next one `doing`**; one with empty `units` stays `todo`, one the user drops is `dropped`.
- **A plan cut into slices** has `version` 2 and `slices` (`id`, `name`, `status`, `phases`)
  in place of `phases`: each is walked end to end under the rules above, one `doing` at most;
  `cadence` (`delivery`, `upfront`, `just-in-time`; absent `upfront`) says how; the method
  is in `references/slices.md`.
- `approved` is the lock on the main stop: without `true`, nothing executes.
- `autonomy` records the batch the user selected: which units run without stopping, and
  which stops are kept anyway. **Absent or empty means accompanied.** `delegation` is the
  project's subagent mode, `auto`, `ask` or `off`; absent is `ask`, and only the user sets it.
- Never write the file while you are inside a unit. Rewrite the plan when the user changes
  it. **A new run rewrites the file** with its own goal, phases and units, ids counting on
  from the last run, `delegation` kept; inside a run, nothing `done` or `dropped` is deleted.
- **Write it for a session that has none of this conversation**: a decision taken out loud,
  where a unit actually stopped, what it is waiting on — if resuming needs it, it goes in
  the file. Context gets cleared; what is not here is gone.

## Cutting the work into units

A unit is the smallest piece that can be delivered and reviewed on its own. Cut so that:

- It produces **one** artifact, or changes one module, or covers one story.
- It can be reviewed without reading the other units.
- It fits comfortably in the remaining context.
- Its `do` line fits on one line. If it needs a paragraph, it is more than one unit.

Typical units, one each: a product document, a glossary, a feature spec, a story, a
feature's technical design, a screen, a story implemented, a story's test set, a release,
a feature closed. Never bundle "write the 4 specs" into one unit: four specs are four
units.

**A row is a step, not a file.** Which artifacts a step produces is decided when that step
is produced: the plan says what it delivers, not which files will end up existing.

## Building the plan

1. Take the phases chosen by `nzt`, or choose them if the work is small and obvious. **A
   product, a feature of several stories, or work to deliver early is cut into slices**:
   read `references/slices.md` in this skill's folder before cutting.
2. Turn each phase into its units, in dependency order. **Verify's units go after the
   slice's last build unit, never between two**, unless the user asks for it.
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

**Accompanied is the default.** Offer autonomy once, with the plan, and not again:

- Not answering is accompanied, not a pending question. Approving does not select autonomy.
- *"Continue"* advances the next agreed stretch. It does not change mode.
- A step that touches an environment other people share runs autonomously **only if the
  selection named that environment**.

## Executing

One unit per turn:

1. Take the first `todo` unit of the current phase, in the current slice if any. Set it `doing`.
2. Load the skill that unit needs, per the routing table in your instructions.
3. Do the unit, and mark progress where that phase marks it.
4. Set it to `done`, update `updated`, advance the phase or slice it closed, write.
5. Report, then stop.

**A direct request or an approved plan authorises its ordinary steps.** Do not ask again
for each file or each repair: a new door opens for new scope or a material decision, not
for every step.

**Departing from an agreed plan is an explicit proposal** — *"the plan said X, I propose Y
because Z"* — never a silent substitution.

## Questions

Three places, three treatments:

| Where it comes up | What you do |
|---|---|
| Clarifying what the user wants | It is a step of the plan; its questions belong there |
| While producing an artifact | Pause what depends on it, write it where that work records questions, continue with what is independent |
| While executing: a missing piece, a missing contract | Resolve it and continue the same unit |

- **Check that it is a decision before asking.** A missing entry in a document is not a
  missing decision: consult the stack, the evidence, and the authorisation already given. A
  defect in your own change is repaired and verified, not asked about.
- **Bring a proposal with the question**: the options, what each one leads to, and which one
  you recommend. **Record what the user chose, never your recommendation.**
- Ask with a concrete scenario — people, data, a sequence of actions — not an abstract
  category, whenever the case allows it.
- **Short rounds of three to five questions**, ordered by how much work each one unblocks,
  each saying what depends on it. The round limits what you ask, not what you record.
- **A written question has two exits: an answer, or an explicit `[TO-DEFINE]` that takes it
  out of scope. Assuming is not one of them.** Reduced scope is recorded, and never
  reported as complete.

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
- **Every report ends saying where the context stands**, as the kernel requires. Advising to
  clear fires at its thresholds or for a concrete benefit you name, only after persisting;
  finishing a unit alone does not justify it; a reset is no completion gate nor verification.

## Stopping early

Stop before the next unit and say so when:

- The context is getting heavy or the session is close to compacting.
- The unit turned out to be bigger than one unit. Re-cut it and show the new units.
- You found something that changes the plan: a wrong assumption, a blocker, a dependency
  nobody saw. Set `waiting_on` and stop. Do not work around it silently.

## Resuming

Read the state. The `doing` unit is where you are; its `detail` says where it stopped.
Confirm in one line what you are resuming, then continue.

Reconcile the state with the user's current decisions, the artifacts it references and the
changes around them. **Evidence settles what happened; it is not authority to rewrite what
was agreed.** Reconstruct what is missing from evidence, ask only about the decisions that
are still unclear, and do not redo finished work without a reason.

## Rules

- Never do two units in one turn without explicit authorisation for that batch.
- Never leave a unit `doing` at the end of a turn without a `detail` line.
- **A feature is closed by the user's acceptance, and closing it is a unit**: read
  `references/close.md` in this skill's folder, which sweeps its markers, brings its documents
  current and writes its history entry. A feature with markers left in its spec is not done.
- The plan serves the work. If it stops describing reality, fix the plan; do not follow it
  off a cliff.
