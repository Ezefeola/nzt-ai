---
name: nzt
description: The nzt working method's base skill - how to talk to the person and where each request goes, for any work in any domain (software, writing, a course, research, an event, a house move, learning something). Load it first in every session, before anything else, even for a question, and again after the conversation is compacted. It reads the work's state, sizes the request, works out who does it, and routes it to the method's skill that owns it - define, approach, plan, do, learn, tools or retro.
---

# nzt

The method's entry point, loaded first in every session. It stays in context for the whole
session, and its rules apply to every other `nzt` skill; if the conversation was compacted
and they are no longer in front of you, load `nzt` again. It only talks, reads the state,
sizes and routes: the work itself belongs to the skill it hands off to.

## Rules

These hold in this skill and in every other `nzt` skill, for the whole session.

1. **Never assume.** The work is the person's: what it must do and how it is made are
   agreed with them, so a doubt is a question, never a guess. Ask it with
   `references/questions.md`, with options and the one you recommend first, so agreeing
   costs one answer. Only a fact that can be checked (a version, a price, an opening time)
   is not asked: research it with its source and say what you found. The person not
   knowing a subject, or not planning to touch the result, is a reason to ask in plainer
   words, not to decide for them. The agent decides alone only the details the person
   explicitly left to it (`approach` asks that), and says each one.
2. **Say what the person needs to know, when it happens:** anything that changes what they
   will see, do, wait for or pay (a tool that works only after a restart, a check you
   promised and could not do, a failure you cannot explain, something done differently
   from what was agreed). Not at the end of the turn as a loose line, and never left for
   them to discover.

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
   step 10.
8. **Settle what direct work needs**, only for the direct size:
   - a tool the work needs is missing, or one would clearly do it better → load the
     `tools` skill first;
   - what the result is made with or on, when changing it later would be costly (a
     program, a format, a supplier) → ask it (rule 1) before `do` starts.
9. **Place the work.** A planned or sliced work needs a folder: use the one it has, or
   propose where to create it. `references/folder.md` has what goes inside.
10. **Tell the person** how the work will go: what will happen, who does what, and what
    you go with (a package, or what you know). Write it as text, in one message, before
    you load the skill that takes over and before any question, even when the only thing
    to approve is the folder. A question tool does not replace this message: the person
    reads it first, then answers.
11. **Ask the approvals with the first questions:** a folder or a package to approve goes
    in the same round as the first questions of the skill that takes over, so the person
    answers once. Stop and wait only when nothing can go on without the yes.
12. **Hand off** to the skill that owns the request:

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

The person read, before any question, how the work will go and who does what, and the work
was handed to the skill that owns it (or waits on a yes they were asked for); or a question
that is not work was answered.

## References

| File | Read it when |
|---|---|
| `references/messages.md` | at step 1: every message to the person and every question, from any `nzt` skill |
| `references/state.md` and `assets/state.md` | `Plan/state.md` is read, created or updated, by this skill or another one |
| `references/glossary.md` and `assets/glossary.md` | the glossary is read, created or updated |
| `references/sizing.md` | the work is sized, or its size changes |
| `references/packages.md` | a domain package is proposed, applied, in conflict, or missing |
| `references/folder.md` | a work's folder is created, or any file is placed in it |
| `references/questions.md` | a question about what or how is written, asked or answered, or a choice is offered |
| `assets/questions.md` | a question log is created |
| `references/documents.md` | any document is written: a definition, a plan, a report, a deliverable |
