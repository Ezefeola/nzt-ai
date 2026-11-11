# A tool for the agent

Produces a tool the agent works through — an MCP server, a plugin, or both — found in
official sources, installed in the project on the user's yes, checked, and its row in
`Docs/agent-tools.md`. Any phase can need one: reading a technology's documentation,
driving an editor or a design canvas, seeing the rendered result, running the product.

## Steps

1. **Name the need**: what the work has to do that a tool would do better, and in which
   phase. A need that will not recur gets no tool.
2. **Look at what is installed first**: `Docs/agent-tools.md`, the project's MCP file
   (`.mcp.json`, `.codex/config.toml`) and the plugins enabled for the project and for the
   user. One installed for the user and not the project is proposed at project scope.
3. **Search the official sources** in the trust order of this skill's step 5 — never from a
   list remembered or written in NZT. For each candidate: what it does for the agent, its
   version and last release, how it connects (a local process or a URL), what it installs on
   the machine, what it can reach (files, network, credentials), its licence or cost, and
   what the user does by hand.
4. **Propose in one round**, written for someone who knows none of it: the candidates and
   the option of none, each with its consequence. Nothing found: say so — the work goes on
   without it.
5. **Install on the user's yes, in the project**, never globally and never at user scope —
   not even offered as an alternative. In Claude Code an MCP server with
   `claude mcp add --scope project` and a plugin with `claude plugin install --scope
   project`; in Codex an entry in the project's `.codex/config.toml`. Paths are absolute: not
   every client expands `~`. Guide each step the user does by hand (a package, approving a
   connection, an account or a key — a key is never pasted into the conversation: name
   where the project keeps it).
6. **Check that it answers** before relying on it. An MCP server loads in a new session: say
   so, and until it answers the work goes on without it.
7. **Write its row** in `Docs/agent-tools.md`.

## The file

```markdown
# Agent tools

| Tool | Kind | Use it for | Not for | Source | Installed |
|---|---|---|---|---|---|
| Microsoft Learn | MCP, URL | .NET and C# documentation of the versions in `tech.md` | what this project decided | Microsoft Learn, read 2026-11-07 | project, `.mcp.json` |

## Declined
- Playwright MCP · 2026-11-07 · the user drives the screen by hand (Q-12)
```

## Rules

1. **Only installed tools get a row**; never their steps or configuration — those live in
   the source.
2. **A declined tool** is written in *Declined* with its date and reason, and is not offered
   again unless the user asks.
3. **Kept current in the same unit** that adds a tool, removes one, or finds it no longer
   answers.

## Done when

The user knows what the tool does, what it installs and what they did by hand; it answered,
or the user knows the work goes on without it; and `Docs/agent-tools.md` says so.
