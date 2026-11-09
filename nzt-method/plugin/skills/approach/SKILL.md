---
name: approach
description: Decides how a work is made, in any domain - the technologies, materials, suppliers, places or methods each part is made with - asking the person each choice apart from what the work must do, with concrete options and what each implies; records it in how.md and then proposes the tools that would help the agent work with what was chosen. Use after define for a new planned work, when a part needs choices of its own, when the person asks what it will be built or done with, or wants to change a technology, supplier or method already chosen.
---

# approach

Settles **how** the work is made once **what** it must do is agreed, and writes it in
`how.md`. It never changes what the work must do (that is the `define` skill) and never
plans the units (that is the `plan` skill).

The shared references named here (`references/folder.md`, `references/questions.md`,
`references/glossary.md`, `references/packages.md`) live in the `nzt` skill's folder.

## Steps

1. **Read what is agreed:** `Docs/General/definition.md` (and the part's, for a part),
   `Docs/How/how.md` and `questions.md` if they exist, the agent's tools file, and the
   packages in use.
2. **Read the evidence:** what already exists in the folder (files, a project, earlier
   choices) and what the person already has (installed programs, accounts, a supplier
   they use). Evidence answers; ask only what it cannot settle.
3. **Find the decisions** this work or part needs with `references/decisions.md`, from what
   it is, and the decisions a package in use adds. If it has none, say so in one line and go
   to step 8.
4. **Research the facts** a choice depends on (versions, prices, availability, limits) in
   official sources. A fact is never asked.
5. **Write the questions** in the how log with `references/questions.md`, each with what it
   blocks, before asking any.
6. **Ask the decisions** in one round, ordered by what depends on what (the base before
   what is built on it), apart from any question about what the work must do. Each option
   names concretely what would be used and what it means for the person (cost, effort,
   what they can and cannot do later); the one you recommend first. Record the answers.
7. **Write `how.md`** with `references/how-file.md`: `Docs/How/how.md`, or the part's own
   when only that part decides it.
8. **Prepare the tools:** for what was chosen, name what you will have to do with it
   (write it, run it, read its documentation, check its result, reach a supplier) and load
   the `tools` skill for the needs a tool would do better. If none, say so in one line.
9. **Hand off** to the `plan` skill, or back to the unit that needed the choice.

## Done when

Every decision the work needs has a choice the person made, or is an open question they
know about; `how.md` says what was chosen, why and what it implies; the tools for working
with it were proposed or ruled out; and what the work must do was not changed here.

## References

| Reference | Read it when |
|---|---|
| `references/decisions.md` | the decisions a work or part needs are worked out and asked |
| `references/how-file.md` | `how.md` is written or updated |
