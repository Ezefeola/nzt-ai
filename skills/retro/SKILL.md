---
name: retro
description: Use only when the user asks for a retro of a session: proposals to improve the project and NZT from where the agent stumbled, written to a file outside the repo. Changes nothing else.
---

# Retro — proposals from where a session stumbled

Produces **one Markdown file of proposals** about the environment the agent worked in — the
project's documents and checks, and NZT itself — each tied to a moment where the work
stumbled, for a team to read later.

> **A retro proposes; it never changes anything.** No skill, reference, code, project
> document or `Plan/state.json` is touched; applying a proposal is a new request.

It runs only when the user asks: never offered, not a phase, no router sends you here.

## Steps

1. **Choose the sessions**:

   | The user asked for | Read |
   |---|---|
   | a retro, nothing else said | **this session**, from the conversation |
   | the last N sessions, or one they name | **Claude Code only**: the project's session logs |

   - documented: Claude Code keeps each session in `~/.claude/projects/<project>/<id>.jsonl`,
     in an internal format that changes between versions, deletes them after 30 days by
     default, and **stores whatever a tool read or printed, credentials included**. Source:
     https://code.claude.com/docs/en/claude-directory · read 2026-10-29
   - Each past session is one reading delegated per `nzt-delegate` under the project's mode,
     asking for the moments in words, **never a value copied from the log**; with `off` or
     no subagent, read them yourself, one at a time.
   - unverified: where Codex keeps its sessions — in Codex only the current one is reviewed;
     say so if more were asked.
   - A log that is gone or unreadable is reported as not reviewed, never rebuilt from memory.
2. **Ask for the path before writing**, every time, suggesting one outside any repository:
   `~/nzt-retro/<project>/retro-<YYYY-MM-DD>-<topic>.md`. One question through the host's
   question tool — no `QT` id, no log entry. A path inside a git working copy is warned
   about first (`git add -A` would commit it) and used only if confirmed.
3. **Find the moments** where the work cost more than it should: the user corrected or
   repeated an instruction; a command failed or was retried in another shape; a tool, path,
   version or rule was assumed and was not there; an error only a person caught; guidance
   read that changed nothing, or missing when needed; the same file or search read twice.
   **A proposal with no moment behind it goes to *Discarded***, with one line on why.
4. **Turn each moment into a proposal** with one destination and what would change there:
   - **mechanical** (a program could check it) → a check: a CI gate, a linter rule, a check in
     NZT's build — not a sentence. A repository with no automated checks is itself a finding;
   - **of judgment** → a written rule in the narrowest place that would have been read at
     that moment.

   | Section | Destinations |
   |---|---|
   | For the project | `Docs/Architecture/tech.md`, `Docs/agent-tools.md`, `Docs/` (glossary, architecture), `Docs/Architecture/tech-debt.md`, CI gates and linters, `CLAUDE.md` or `AGENTS.md` |
   | For NZT | the kernel, a router, a reference, a build check, a missing case in `evals/` |

5. **Classify**: category — **navigation**, **automated checks**, **rules** (tech, code
   conventions), **instructions** (guidance that weighs or changes nothing), **tool
   economy**, **missing information**, **environment** (a tool assumed and not installed);
   severity — **high** (repeats, or ended in silent failure or rework), **medium** (cost
   time), **low** (friction).
6. **Write the file** in the user's language. Never a value from a session — no output, file
   content, key, or path carrying a name the user did not choose to share; a secret is named
   by its key. Every proposal starts `proposed`; only the team moves it to `accepted`,
   `discarded` or `done`, never a retro, not even in an earlier file. An empty section is one
   line.

```markdown
# Retro · <project> · <YYYY-MM-DD>

Sessions reviewed: <current | ids or dates> · Host: <Claude Code | Codex>
Not reviewed: <what was asked and could not be read, or "none">

<three lines: what went well, what cost the most, the one proposal to look at first>

## Proposals for the project

### R-01 · <title>
- Severity: high · Category: automated checks · Kind: mechanical
- Moment: <which session, and what happened, in words>
- Destination: <where>
- Proposal: <what would change there>
- Status: proposed

## Proposals for NZT

## Discarded

- <idea> — <why: no moment behind it, or not ours to change>
```

## Done when

Someone who never saw the sessions could decide each proposal from the file alone.
