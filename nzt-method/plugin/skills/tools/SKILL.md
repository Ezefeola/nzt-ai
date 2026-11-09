---
name: tools
description: Proposes, researches, installs, checks and records the tools the agent works through (a plugin, an MCP server, a program, or a domain package) for any work in any domain, always asking the person and never adding one on its own. Use after approach settles what a work is made with, even when nothing seems missing; whenever a tool would do the work better or something is missing, before or in the middle of the work; when a domain package is to be installed; or when the person asks whether there is a plugin, MCP or tool for what they want.
---

# tools

Takes the agent's tools from "this is what the work needs" to installed, checked and
recorded, or to a clear "we go on without them". Nothing is installed or used without the
person knowing: the agent asks and proposes, the person decides. When it ends, the work
goes back to where it was.

## Steps

1. **Name the needs:** what you will have to do with what the work is made with (write it,
   check its quality, read its documentation, run it and see the result, reach a service
   or a supplier), and for each one whether a tool would do it better than you can now.
2. **Look at what is already there:** `Docs/How/agent-tools.md` (in use and declined) and
   the tools already available to you. One available that covers a need is used, not
   installed again. One in *Declined* is not offered again unless the person asks for it.
3. **Ask which to look for,** in one question: an option per kind of tool that would help
   (the maker's official documentation, a checker for the quality, a connector to a
   service), each with what it would change for the work, and the option of none. Coming
   from `approach`, ask it even when every need seems covered. If the person already asked
   for a tool, that request is the answer.
4. **Research the chosen ones in official sources,** in this order: the maker of what the
   tool serves (the editor, the service, the device) → the tool's own maintainer (its site,
   repository and documentation) → anyone else, which only leads to one of the first two.
   Memory is never the source. For each candidate find what it does for the work, who
   makes it, its version and last release, how it connects, what it installs on the
   machine, what it can reach (files, accounts, network, keys), what it costs, and what
   the person does by hand.
5. **Propose in one message,** for someone who knows none of it: the candidates and the
   option of none, each with what it means for the work. Nothing found: say so, and the
   work goes on without it.
6. **Install on a second yes, at the smallest scope that works:** this work's folder before
   the person's whole setup. Install the way the host does it, read in its official
   documentation. If the host cannot install at that scope, say so and ask before going
   wider. Guide every step the person does by hand; a key or password is never pasted into
   the conversation: say where it goes.
7. **Check that it answers** with one small real use before relying on it. If it only
   answers after a restart or a new session, say so; until it answers, the work goes on
   without it.
8. **Record it** in `Docs/How/agent-tools.md` with `references/agent-tools.md`: what was
   installed, and what was offered and declined, with the reason. If the work has no
   folder yet, propose where to create it.
9. **Go back to the work:** the step or unit that needed the tool continues, now with it
   or without it.

## Done when

The person was asked, and knows what each chosen tool does, what it installed and what
they did by hand; it answered, or they know the work goes on without it; and
`Docs/How/agent-tools.md` says what is in use and what was declined.

## References

| File | Read it when |
|---|---|
| `references/agent-tools.md` and `assets/agent-tools.md` | `Docs/How/agent-tools.md` is created or updated: a tool installed, declined, removed or no longer answering |
