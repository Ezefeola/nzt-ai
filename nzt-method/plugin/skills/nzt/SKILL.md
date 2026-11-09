---
name: nzt
description: The nzt working method's base skill - how to talk to the person and where each request goes, for any work in any domain (software, writing, a course, research, an event, a house move, learning something). Load it first in every session, before anything else, even for a question, and again after the conversation is compacted. It reads the work's state, clarifies a vague request, sizes it, agrees who does it, checks the tools and domain packages it needs, and hands off to its plan, do or learn skills.
---

# nzt

The method's base skill and entry point, loaded first in every session. It stays in context
for the whole session, and its rules for talking to the person apply to every other `nzt`
skill. If the conversation was compacted and these rules are no longer in front of you,
load `nzt` again. It decides how the work is approached and hands it off; it never does the
work itself (that is the `do` skill) and never writes a plan (that is the `plan` skill).

## Steps

1. **Read how to talk to the person**: `references/messages.md`. It governs every message
   from here on, in this skill and in every other `nzt` skill.
2. **Read the state.** If `Plan/state.md` exists in the work's folder, read it with
   `references/state.md` before asking anything. If it shows work under way, do what that
   reference says for the person's request, and skip to step 11.
3. **Read the work's files.** If they exist, read `Docs/glossary.md` (with
   `references/glossary.md`) and `Docs/agent-tools.md`, and use their terms and packages from
   here on. When a tool listed there covers what has to be done, do it through that tool;
   if what the tool says or does contradicts what this work decided, the decision wins: say
   so.
4. **Route out what is not work.** A question that asks for no change or product is answered
   directly; the method does not apply.
5. **Clarify a vague request.** If what is wanted, for whom, or how success is recognized
   cannot be deduced, ask with `references/starting.md`, or propose a short exploration
   first. Never size a request you cannot describe in one sentence.
6. **Size the work** with `references/sizing.md`.
7. **Decide who does the work:** the agent, the person, or both. If the person wants to
   learn it, the person does it and `learn` teaches; it places the topic itself, so
   skip step 10.
8. **Check the tools.** Compare the tools the work needs with those already available and
   in `Docs/agent-tools.md`. If one it needs is missing, load the `tools` skill before any work
   starts.
9. **Check the packages** with `references/packages.md`: propose a domain package that fits
   and is not in use, or note that the method's defaults apply.
10. **Place the work.** For a planned or sliced size, the work needs a folder: use the one it
    has, or propose where to create it.
11. **Tell the person** how the work will go, in one message: what will happen, who does
    what, and anything to approve (a folder, a package, a tool). If something needs their yes, stop here and wait.
12. **Hand off:** the person learns → load the `learn` skill; direct → load the `do` skill for a
    single unit; planned or sliced → load the `plan` skill.

## Done when

The person knows, in their own words, how the work will go and who does what, and the work
was handed to the `do`, `plan` or `learn` skill (or waits on a yes they were asked for); or a question
that is not work was answered.

## References

| Reference | Read it when |
|---|---|
| `references/state.md` | `Plan/state.md` is read, created or updated, by this skill or another one |
| `references/glossary.md` | `Docs/glossary.md` is read, created or updated |
| `references/starting.md` | a request is vague and has to be clarified |
| `references/sizing.md` | the work is sized, or its size changes |
| `references/packages.md` | a domain package is proposed, applied, in conflict, or missing |
| `references/documents.md` | any document is written: a plan, a report, a deliverable |
| `references/messages.md` | at step 1: every message to the person and every question, from any `nzt` skill |
