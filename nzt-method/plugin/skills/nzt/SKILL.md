---
name: nzt
description: Starts or resumes any work in any domain (software, writing, a course, research, an event, a house move, learning something). Reads the work's state, clarifies a vague request, sizes it, agrees who does it, checks the tools and domain packages it needs, and hands off to nzt-plan or nzt-do. Use at the start of any task or session, when resuming earlier work, or whenever it is unclear how to approach a request.
---

# nzt

The method's entry point. It decides how the work is approached and hands it off; it never
does the work itself (that is `nzt-do`) and never writes a plan (that is `nzt-plan`).

## Steps

1. **Read the state.** If `Plan/state.md` exists in the work's folder, read it with
   `references/state.md` before asking anything. If it shows work under way, continue from
   its *Next step*: skip to step 10.
2. **Read the work's files.** If they exist, read `Docs/glossary.md` (with
   `references/glossary.md`) and `Docs/agent-tools.md`, and use their terms and packages from
   here on.
3. **Route out what is not work.** A question that asks for no change or product is answered
   directly; the method does not apply.
4. **Clarify a vague request.** If what is wanted, for whom, or how success is recognized
   cannot be deduced, ask with `references/starting.md` in a message written with
   `references/messages.md`, or propose a short exploration first. Never size a request you cannot describe in one sentence.
5. **Size the work** with `references/sizing.md`.
6. **Decide who does the work:** the agent, the person, or both. If the person wants to
   learn it, the person does it and `nzt-do` teaches.
7. **Check the tools.** Compare the tools the work needs with those already available and
   in `Docs/agent-tools.md`. If one it needs is missing, load `nzt-tools` before any work
   starts.
8. **Check the packages** with `references/packages.md`: propose a domain package that fits
   and is not in use, or note that the method's defaults apply.
9. **Place the work.** For a planned or sliced size, the work needs a folder: use the one it
   has, or propose where to create it.
10. **Tell the person** how the work will go, in one message written with
    `references/messages.md`: what will happen, who does what, and anything to approve
    (a folder, a package, a tool). If something needs their yes, stop here and wait.
11. **Hand off:** direct → load `nzt-do` for a single unit; planned or sliced → load
    `nzt-plan`.

## Done when

The person knows, in their own words, how the work will go and who does what, and the work
was handed to `nzt-do` or `nzt-plan` (or waits on a yes they were asked for); or a question
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
| `references/messages.md` | any message is written to the person, by this skill or another one |
