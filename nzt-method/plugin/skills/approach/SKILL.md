---
name: approach
description: Settles how a work is made once what it must do is agreed, for any work in any domain - what it is made with, how it is organised so it can be maintained, how it is checked, its conventions, third parties and delivery, and then the tools to work with all that - asking the person each choice with concrete options and writing Docs/How/how.md. Use after the define skill hands over a new planned work, when a part or unit needs a choice of how that is missing, when the person asks what it will be built or done with, or wants to change a technology, supplier or method already chosen.
---

# approach

Settles **how** the work is made once **what** it must do is agreed, and writes it in
`how.md`. It never changes what the work must do (that is the `define` skill), never
plans the units (that is the `plan` skill) and never installs a tool (that is the `tools`
skill).

The shared references named here (`references/folder.md`, `references/questions.md`,
`references/glossary.md`, `references/packages.md`) live in the `nzt` skill's folder.

## Steps

1. **Read what is agreed:** `Docs/General/definition.md` (and the part's, for a part),
   `Docs/How/how.md` and `questions.md` if they exist, the agent's tools file, and the
   packages in use.
2. **Read the evidence:** what already exists in the folder (files, a project, earlier
   choices) and what the person already has (installed programs, accounts, a supplier
   they use).
3. **Walk the seven topics** with `references/decisions.md` and mark each one as answered,
   read from what exists, not applicable (with its reason), or to ask.
4. **Find the options** of each topic to ask with `references/decisions.md`, deduced from
   the base and from a package in use.
5. **Write the questions** in the how log with `references/questions.md`, each with what it
   blocks, before asking any.
6. **Ask in rounds** in the order of `references/decisions.md`, apart from any question
   about what the work must do, and record each answer.
7. **Tell the person** in one line each topic that does not apply, and why.
8. **Write `how.md`** with `references/how-file.md`, starting from `assets/how.md`:
   `Docs/How/how.md`, or the part's own when only that part decides it.
9. **Load the `tools` skill** with what was chosen, even when nothing seems missing: it
   asks the person which tools to work with.
10. **Hand off** to the `plan` skill, or back to the unit that needed the choice.

## Done when

Each of the seven topics was answered by the person, read from what exists, or told to
them as not applicable; `how.md` says what was chosen, why and what it implies; the
person was asked about the agent's tools; and what the work must do was not changed here.

## References

| File | Read it when |
|---|---|
| `references/decisions.md` | the topics are walked, their options found and asked |
| `references/how-file.md` and `assets/how.md` | `how.md` is written or updated |
