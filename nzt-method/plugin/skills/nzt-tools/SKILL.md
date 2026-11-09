---
name: nzt-tools
description: Proposes, researches, installs, checks and records a tool the agent works through (a plugin, an MCP server, a program, or a domain package) for any work in any domain, always with the person's yes and never on its own. Use when the work needs something the agent does not have - before the work starts or when a missing tool turns up in the middle of it - when a domain package is to be installed, or when the person asks whether there is a plugin, MCP or tool for what they want.
---

# nzt-tools

Takes a missing tool from "the work needs this" to installed, checked and recorded, or to
a clear "we go on without it". Nothing is installed or used without the person knowing:
the agent proposes, the person decides. When it ends, the work goes back to where it was.

## Steps

1. **Name the need:** what the work has to do that a tool would do better than you can now,
   and whether it will come up again. If you can already do it well, or it is a one-off,
   there is no tool to look for: say so in a line and go back to the work.
2. **Look at what is already there:** `Docs/agent-tools.md` (in use and declined) and the
   tools already available to you. One available that covers the need is used, not
   installed again. One in *Declined* is not offered again unless the person asks for it.
3. **Ask before researching:** say what is missing and what it would change, and ask
   whether to look for a tool. If the person already asked for one, that request is the yes.
4. **Research in official sources,** in this order: the maker of what the tool serves (the
   editor, the service, the device) → the tool's own maintainer (its site, repository and
   documentation) → anyone else, which only leads to one of the first two. Memory is never
   the source. For each candidate find what it does for the work, who makes it, its version
   and last release, how it connects, what it installs on the machine, what it can reach
   (files, accounts, network, keys), what it costs, and what the person does by hand.
5. **Propose in one message,** for someone who knows none of it: the candidates and the
   option of none, each with what it means for the work. Nothing found: say so, and the
   work goes on without it. A refusal is recorded (step 8).
6. **Install on a second yes, at the smallest scope that works:** this work's folder before
   the person's whole setup. Install the way the host does it, read in its official
   documentation. If the host cannot install at that scope, say so and ask before going
   wider. Guide every step the person does by hand; a key or password is never pasted into
   the conversation: say where it goes.
7. **Check that it answers** with one small real use before relying on it. If it only
   answers after a restart or a new session, say so; until it answers, the work goes on
   without it.
8. **Record it** in `Docs/agent-tools.md` with `references/agent-tools.md`: what was
   installed, or what was declined and why. If the work has no folder yet, propose where to
   create it.
9. **Go back to the work:** the step or unit that needed the tool continues, now with it
   or without it.

## Done when

The person knows what the tool does, what it installed and what they did by hand; it
answered, or they know the work goes on without it; and `Docs/agent-tools.md` says so. Or
the person was told no tool is needed, or none was found, and the work went on.

## References

| Reference | Read it when |
|---|---|
| `references/agent-tools.md` | `Docs/agent-tools.md` is created or updated: a tool installed, declined, removed or no longer answering |
