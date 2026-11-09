---
name: nzt-plan
description: Turns a planned or sliced piece of work, in any domain, into a plan the person approves once - units in order, what each leaves, its done criterion, who does it, and what can be cut under a fixed deadline - and records it in Plan/state.md. Use after nzt sizes a work as planned or sliced, when the person asks for a plan, or when an existing plan has to change.
---

# nzt-plan

Cuts the work into units and gets the plan approved. It writes no deliverable (that is
`nzt-do`) and never starts the first unit before the plan is approved.

The method's shared references live in the `nzt` skill: `references/state.md`,
`references/messages.md`, `references/documents.md` and `references/glossary.md` there.

## Steps

1. **Read what is settled.** Take the request, size, who does it, packages and folder that
   `nzt` settled. If `Plan/state.md` exists, read it with `nzt`'s `references/state.md`: this
   is a change to that plan, not a new one.
2. **Write the work's done criterion:** a short list of what must be true when the whole
   work is over, from "how will we know it went well?".
3. **Cut the work into units** with `references/slicing.md`, or with the slicing row of a
   package in use. For each unit: what it leaves, its done criterion, and who does it.
4. **Order the units** with `references/slicing.md`, marking the cuttable ones under a fixed
   deadline and the ones that could run as a batch.
5. **Present the plan** in one message written with `nzt`'s `references/messages.md`:
   - the units as a short numbered list, each with what it leaves and who does it;
   - the work's done criterion;
   - the question to approve it, and the offer of a batch if step 4 found one.
6. **Wait for the yes.** If the person changes something, adjust the plan and present it
   again; never start without the yes.
7. **Record the plan:** create or update `Plan/state.md` with `nzt`'s `references/state.md`,
   including in *Decisions* the size and the plan's approval, each with its reason.
8. **Hand off** the first pending unit, or the approved batch, to `nzt-do`.

## Done when

The person approved the plan, `Plan/state.md` holds it, and the first unit (or batch) was
handed to `nzt-do`; or the plan waits on the person's answer.

## References

| Reference | Read it when |
|---|---|
| `references/slicing.md` | the work is cut into units or ordered, or a unit is split, merged or added |
