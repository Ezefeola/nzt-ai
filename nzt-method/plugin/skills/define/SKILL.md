---
name: define
description: Agrees what a work must achieve and for whom, in any domain (an app, a course, a book, an event, a house move, research) - interviews the person in plain language, keeps every question and answer, writes the work's definition and each part's, and turns a change to what was agreed into a proposal the person approves. Use when nzt hands off new or unclear planned work, when a part is about to be worked on and has no definition or an open question that blocks it, when the person wants to add, change or remove something already agreed, or when they ask for a spec, brief or requirements.
---

# define

Establishes **what** the work must do and **for whom**, in the person's words, and writes
it down. It never decides how it is made (that is the `approach` skill), never plans (that
is the `plan` skill) and never does the work (that is the `do` skill). A definition that
names a technology, a supplier or a material has drifted into how. The mode for details
that `approach` asks never applies here: every doubt about what the work must do is asked.

The shared references named here (`references/folder.md`, `references/questions.md`,
`references/glossary.md`, `references/documents.md`) live in the `nzt` skill's folder, with their templates in its `assets/`.

## Steps

1. **Read what exists:** `Docs/General/definition.md` and `questions.md`, the glossary, and
   the part's folder if the request is about a part (`references/folder.md` has the map).
2. **Name what is being defined:** the whole work (nothing written yet), one part or one
   of its capabilities (the general definition exists), or a change to something already
   agreed. A change goes straight to step 11.
3. **Deduce first:** from the request, the folder and what is written, list what is known
   and what is still missing. Only the missing goes on. If the person asks for the
   definition now, or says everything was said, record what they said as answered
   questions in the log, in their words, and go to step 7: the gaps go in the definition
   under *Open*, never as a reason to hold it and never filled in by you.
4. **Write the questions** in the log with `references/questions.md`, each with what it
   blocks, before asking any.
5. **Interview** with `references/interview.md`: in plain language, never about how it is
   made, in rounds. For the whole work, only what the general definition needs; each
   part's detail waits for that part.
6. **Record each answer** in the log, in the person's words. What is still open stays
   open with what it blocks; the rest goes on.
7. **Play it back** in one message, in three groups: what the person said, in their words;
   what follows from it and you deduced (a done task stops showing as late); and what is
   still open. Behaviour they did not say (a limit, a warning, a block, a rule) is never in
   the first two groups.
8. **Confirm in the same round:** each deduction is accepted or rejected on its own (with
   the question tool, one multiple-choice question with an option per deduction), never
   one yes for all of them; each behaviour they did not say is its own question, with
   your proposal recommended. What the person confirms is recorded as an answer.
9. **Write or update the definitions** with `references/definition-file.md`: the general
   one in `Docs/General/definition.md`; a part's in its own folder, with the index of its
   capabilities; and a file for each capability whose unit is near.
10. **Add each new term to the glossary,** with its English name. Then go to step 13.
11. **Write the change** in one `change.md`, placed as `references/change-file.md` says,
    and ask the person to approve it. Nothing else is touched first.
12. **Apply the approved change** to the definition, with its history, and delete
    `change.md`.
13. **Hand off:** a new work → load the `approach` skill; a part → back to the unit that
    needed it, with the `do` skill; an applied change → the `plan` skill if units must be
    added, changed or dropped, otherwise the `do` skill.

## Done when

The definition could be worked from without asking anything else, or every gap is an open
question in the log that the person knows about; every term it uses is in the glossary;
and a change was approved before it touched the definition.

## References

| File | Read it when |
|---|---|
| `references/interview.md` | questions are prepared or asked |
| `references/definition-file.md`, `assets/definition.md`, `assets/part-definition.md` and `assets/capability.md` | a definition (general, of a part or of a capability) is written or updated |
| `references/change-file.md` and `assets/change.md` | something already agreed is added to, changed or removed |
