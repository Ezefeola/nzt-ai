---
name: nzt-plan
description: Use when a plan has to be built, approved, changed, executed or resumed - work cut into units, recorded in Plan/state.json, run one at a time, with a stop at each boundary.
---

# Planning and execution

The plan is the list of units in `Plan/state.json`. There is no separate plan file. The
schema is in your instructions; do not restate it here.

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

1. Take the phases chosen by `nzt` — or choose them yourself if the work is small and
   obvious.
2. Turn each phase into its units, in dependency order. **Verify's units go after the
   increment's last build unit, never between two**, unless the user asks for it.
3. Write `goal`, `phase`, `units` and `approved: false` to `Plan/state.json`.
4. Show the plan in the reply and ask for approval. Stop.

Keep the plan to what you can see. Fifteen units written before the first spec exists is
guesswork: plan the phase you are in and the shape of the rest.

**Clarifying what the user wants is a step of the plan, not a prerequisite for it.** Its
questions start when that step starts. The plan message carries the plan and the autonomy
offer, and no definition questions.

### How the plan is shown

- **Markdown, never inside a code block**, so the table renders.
- One row per step, saying **what it produces and why**. The *why* is what lets the user
  judge the approach instead of only the order.
- Under the table, three declarations: **where it stops**, **what it leaves out**, and what
  it covers beyond the minimum so the user can drop it. *"I am leaving out coupon
  administration: that is F-009 and you did not ask for it"* is what makes scope reviewable.
- One line for each phase you skipped and why.

## The documents the plan produces

The plan lists the documents it will produce, and the user keeps or drops them line by
line. Three categories:

| Category | Behaviour |
|---|---|
| **Mandatory** | Not offered, declared. Without it the work cannot continue |
| **Offered** | Appears as a line of the plan; the user can drop it |
| **On request** | Does not appear unless the user asks for it |

- When you offer one, say what is lost if it is dropped. "Do you want the ADR?" is not
  answerable; "without the ADR this decision gets re-argued in three months with no record
  of what was weighed" is.
- Mandatory today: the stack document per component and area, written when the component is
  designed or from evidence before its code is touched. **Offered: a feature's design.**
- A document that already exists and that the change affects is kept current as part of the
  work, never offered as optional.
- Do not ask what you can verify — a version, a capability, a package's maintenance state.
  Ask the user about tradeoffs and material changes, and never re-ask what the project
  already decided: if the stack answers it, read it.

## Approval and autonomy

Set `approved: true` only when the user approves it in this conversation. Silence is not
approval. A question about the plan is not approval.

The user can change anything: reorder units, drop them, add them, change the goal. Rewrite
`units` and keep asking until they approve. Units already `done` keep their `id` and their
status; new units get new ids.

**Accompanied is the default.** Offer autonomy once, with the plan, and not again:

- Not answering is accompanied. It is not a pending question.
- Approving the plan does not select autonomy.
- *"Continue"* advances the next agreed stretch. It does not change mode.
- What was selected goes into `autonomy` in the state. Absent or empty means accompanied.
- A step that touches an environment other people share runs autonomously **only if the
  selection named that environment**.

## Executing

One unit per turn:

1. Take the first `todo` unit. Set it to `doing`.
2. Load the skill that unit needs, per the routing table in your instructions.
3. Do the unit, and mark progress where that phase marks it.
4. Set it to `done`, update `updated`, write the file.
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
  clear is a different thing: it fires from 20% consumed — strongly past 40% — or for a
  concrete benefit you name, and only after persisting. Finishing a unit does not justify it
  on its own, and a reset is neither a completion gate nor evidence of verification.

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

- Never execute a plan while `approved` is `false`.
- Never do two units in one turn without explicit authorisation for that batch.
- Never leave a unit `doing` at the end of a turn without a `detail` line.
- Never rewrite history: a unit that was dropped is `dropped`, not deleted.
- **A feature is closed by the user's acceptance, and closing it is a unit**: load
  `nzt-plan-close`, which sweeps its markers, brings its documents current and writes its
  history entry. A feature with markers left in its spec is not done.
- The state holds the continuation and the plan; progress lives in the artifacts. Keep it
  to one line per unit, or it stops being state and becomes a document.
- The plan serves the work. If it stops describing reality, fix the plan; do not follow it
  off a cliff.
