---
name: retro
description: Reviews how a piece of work went, in any domain, and writes a file of improvement proposals for the work itself, for the nzt method and for domain packages, each tied to a moment where the work cost more than it should. Use only when the person asks for a retro, a review of how the work or the sessions went, or lessons learned; never offer or start it on your own. It changes nothing but its own file.
---

# retro

Turns the moments where the work stumbled into proposals someone can decide on later. It
runs only when the person asks for it: no other skill offers it or hands off to it.

**A retro proposes; it never changes anything.** No state, glossary, tools file, skill or
product of the work is touched: applying a proposal is a new request.

## Steps

1. **Ask where to save the retro** before reviewing anything, unless the person already
   said: suggest `Docs/retros/<YYYY-MM-DD>-<topic>.md` in the work's folder, and wait for
   the answer. Either way, warn if that place is shared with others (a repository, a shared
   drive), since they will see it.
2. **Choose the sessions:** the last 10 of this work, or the ones the person names, which
   can belong to other works. Past sessions are read only if the host keeps them where you
   can read them; find where in its official documentation. They hold whatever a tool read,
   keys included: read them for moments, in words, and never copy a value. A session
   missing or unreadable is reported as not reviewed, never rebuilt from memory. If none
   can be read, say so and review the current conversation.
3. **Read the work's files:** `Plan/state.md` (decisions, units redone, plan changes),
   `Docs/glossary.md` and `Docs/agent-tools.md` (tools missing or declined). They keep
   what happened in sessions that can no longer be read.
4. **Find the moments** where the work cost more than it should: the person corrected or
   repeated something; something was assumed and was not there; a check failed or a unit
   was redone; a stop came late; the plan changed; a tool was missing; guidance was missing
   when needed, or read and changed nothing; the agent improvised vocabulary, practices or
   done criteria for lack of a package. An idea with no moment behind it goes to
   *Discarded*.
5. **Turn each moment into a proposal** with one destination and what would change there:
   the **work** (its state, glossary, tools, conventions, checklists), the **method** (an
   `nzt` skill or reference) or a **package**. What a check could catch becomes a check (a
   checklist, a template, a program); what needs judgment becomes a rule in the narrowest
   place that would have been read at that moment.
6. **Point out possible packages:** when the same kind of work shows up across the sessions
   reviewed, or the agent improvised what a package would bring, propose one, naming the
   domain and which of its contributions it would bring, each with its moments. A package
   in use that fell short gets a proposal of its own. Never build it: that is a new work.
7. **Write the file** with `references/retro-file.md`.
8. **Tell the person** in one short message what went well, what cost the most and the one
   proposal to look at first, with a link to the file; nothing changed.

## Done when

Someone who never saw the sessions could decide each proposal from the file alone, and
nothing but that file was written.

## References

| Reference | Read it when |
|---|---|
| `references/retro-file.md` | the retro file is written: its template and rules |
