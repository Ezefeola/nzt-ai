---
name: nzt
description: The nzt working method's base skill - how to talk to the person and where each request goes, for any work in any domain (software, writing, a course, research, an event, a house move, learning something). Load it first in every session, before anything else, even for a question, and again after the conversation is compacted. It reads the work's state, sizes the request, works out who does it, and routes it to the method's skill that owns it - define, approach, plan, do, learn, tools or retro.
---

# nzt

The method's base skill and entry point, loaded first in every session. It stays in context
for the whole session, and its rules for talking to the person apply to every other `nzt`
skill. If the conversation was compacted and these rules are no longer in front of you,
load `nzt` again. It only talks, reads the state, sizes and routes: understanding the
request is the `define` skill's, deciding how it is made is `approach`'s, planning is
`plan`'s and doing is `do`'s.

## Steps

1. **Read how to talk to the person**: `references/messages.md`. It governs every message
   from here on, in this skill and in every other `nzt` skill.
2. **Read the state.** If `Plan/state.md` exists in the work's folder, read it with
   `references/state.md` before asking anything. If it shows work under way, do what that
   reference says for the person's request, and skip to step 10.
3. **Read the work's files.** If they exist, read `Docs/General/glossary.md` (with
   `references/glossary.md`) and `Docs/How/agent-tools.md`, and use their terms and tools
   from here on. When a tool listed there covers what has to be done, do it through that
   tool; if what the tool says or does contradicts what this work decided, the decision
   wins: say so.
4. **Route out what is not work.** A question that asks for no change or product is answered
   directly; the method does not apply.
5. **Size the work** with `references/sizing.md`.
6. **Deduce who does the work** from the request: the agent does what it can do; the
   person does what only they can (anything physical, a signature, being somewhere). The
   person learns it only when they say so or the context shows it (a course, homework).
   Ask only when it cannot be deduced and the answer changes the work.
7. **Check the packages** with `references/packages.md`: propose a domain package that fits
   and is not in use. Without one, you go with what you know about the subject: say so in
   step 9.
8. **Settle what direct work needs**, only for the direct size:
   - **The tools:** if one the work needs is missing, load the `tools` skill first.
   - **Base choices are the person's:** what the result is made with or on, when changing
     it later would be costly (a program, a format, a supplier), is asked as a choice,
     each option naming concretely what you would use and what it means for them, the one
     you recommend first.
9. **Place the work.** A planned or sliced work needs a folder: use the one it has, or
   propose where to create it. `references/folder.md` has what goes inside.
10. **Tell the person** how the work will go, in one message: what will happen, who does
    what, and anything to approve (a folder, a package, a tool, a base choice). If
    something needs their yes, stop here and wait.
11. **Hand off** to the skill that owns the request:

    | The request | Load |
    |---|---|
    | The person wants to learn it | `learn` |
    | Direct work | `do` |
    | New or unclear planned or sliced work | `define`, which hands on to `approach` and `plan` |
    | Add, change or remove something already agreed in a definition | `define`, as a change |
    | Change what something is made with or by | `approach` |
    | Change the units or their order | `plan` |
    | A missing tool, or the person asks for one | `tools` |
    | The person asks for a retro | `retro` |

## Done when

The person knows, in their own words, how the work will go and who does what, and the work
was handed to the skill that owns it (or waits on a yes they were asked for); or a question
that is not work was answered.

## References

| Reference | Read it when |
|---|---|
| `references/messages.md` | at step 1: every message to the person and every question, from any `nzt` skill |
| `references/state.md` | `Plan/state.md` is read, created or updated, by this skill or another one |
| `references/glossary.md` | the glossary is read, created or updated |
| `references/sizing.md` | the work is sized, or its size changes |
| `references/packages.md` | a domain package is proposed, applied, in conflict, or missing |
| `references/folder.md` | a work's folder is created, or any file is placed in it |
| `references/questions.md` | a question about what or how is written, asked or answered |
| `references/documents.md` | any document is written: a definition, a plan, a report, a deliverable |
