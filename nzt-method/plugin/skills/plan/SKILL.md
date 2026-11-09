---
name: plan
description: Turns a planned or sliced piece of work, in any domain, into a plan the person approves once - units in order, the part each belongs to, what each leaves, its done criterion, who does it, and what can be cut under a fixed deadline - and records it in Plan/state.md. Use after define and approach have settled what the work is and how it is made, when the person asks for a plan, or when the units or their order have to change.
---

# plan

Cuts the work into units and gets the plan approved. It writes no deliverable (that is
`do`) and never starts the first unit before the plan is approved.

The shared references named here (`references/state.md`, `references/documents.md`,
`references/glossary.md`) live in the `nzt` skill's folder, with their templates in its `assets/`.

## Steps

1. **Read what is settled:** the size, who does it, packages and folder that `nzt`
   settled; `Docs/General/definition.md` (its parts, limits and done criterion) and
   `Docs/How/how.md`. If `Plan/state.md` exists, read it with `nzt`'s `references/state.md`:
   this is a change to that plan, not a new one.
2. **Take the work's done criterion** from the definition's *Done when*; if it has none,
   write a short list from "how will we know it went well?" and show it with the plan.
3. **Cut the work into units** with `references/slicing.md`, or with the slicing row of a
   package in use. For each unit: the part it belongs to, what it leaves, its done criterion, and who does
   it. A part not yet defined starts with its definition, done by the `define` skill when
   its unit comes.
4. **Order the units** with `references/slicing.md`, marking the cuttable ones under a fixed
   deadline and the ones that could run as a batch.
5. **Present the plan** in one message:
   - the units as a short numbered list, each with what it leaves and who does it;
   - the work's done criterion;
   - the question to approve it, and the offer of a batch if step 4 found one.
6. **Wait for the yes.** If the person changes something, adjust the plan and present it
   again; never start without the yes.
7. **Record the plan:** create or update `Plan/state.md` with `nzt`'s `references/state.md`,
   including in *Decisions* the size and the plan's approval, each with its reason.
8. **Hand off** the first pending unit, or the approved batch, to the `do` skill.

## Done when

The person approved the plan, `Plan/state.md` holds it, and the first unit (or batch) was
handed to the `do` skill; or the plan waits on the person's answer.

## References

| Reference | Read it when |
|---|---|
| `references/slicing.md` | the work is cut into units or ordered, or a unit is split, merged or added |
