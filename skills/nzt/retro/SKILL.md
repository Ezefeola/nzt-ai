---
name: nzt-retro
description: Use only when the user asks for a retro of a session: proposals to improve the project and NZT from where the agent stumbled, written to a file outside the repo. Changes nothing else.
---

# Reviewing a session for improvements

Produces **one Markdown file of proposals** about the environment the agent worked in — the
project's documents and checks, and NZT itself — each one tied to a moment of a session
where the work stumbled. It is meant to be read by a team, later, at a moment chosen for it.

> **A retro proposes; it never changes anything.**

No skill, reference, code, project document or `Plan/state.json` is touched, and the file is
the only thing written. Applying a proposal is a new request, sized and planned like any
other.

**It runs only when the user asks for it.** It is never offered — not when a run closes, not
when clearing is recommended — and it is not a phase: no router sends you here.

## Which sessions

| The user asked for | What is read |
|---|---|
| A retro, with nothing else said | **This session**, from the conversation itself |
| The last N sessions, or one they name | **Claude Code only**: the project's session logs, one per subagent reading |

- documented: Claude Code keeps each session in `~/.claude/projects/<project>/<id>.jsonl`,
  in an internal format that changes between versions, deletes them after 30 days by
  default, and **stores whatever a tool read or printed, credentials included**. Source:
  https://code.claude.com/docs/en/claude-directory · read 2026-10-29
- Each past session is a reading delegated per `nzt-delegate`, under the project's mode: the
  prompt asks for the moments below, in words, **never a value copied from the log**. With
  `off`, or no subagent, read them yourself, one at a time.
- unverified: where Codex keeps its sessions. In Codex, only the current one is reviewed;
  say so if more were asked.
- A log that is gone, or whose format you cannot read, is reported as not reviewed. It is
  never reconstructed from memory.

## Where the file goes

**Ask for the path every time, before writing**, with one suggestion outside any repository:
`~/nzt-retro/<project>/retro-<YYYY-MM-DD>-<topic>.md`.

- It is a question about where to write, not a project decision: one question through the
  host's question tool, no `QT` id and no log entry.
- **If the chosen path is inside a git working copy**, say so before writing — a `git add -A`
  would commit it — and write there only if the user confirms.
- The file is written in the user's language.

## Finding the moments

Go through the session looking for where the work cost more than it should have:

- the user corrected the agent, or repeated an instruction;
- a command failed, or was retried with a different shape;
- the agent assumed a tool, a path, a version or a rule that was not there;
- a check was missing, so an error was only caught by a person;
- guidance was read and changed nothing, or was missing when it was needed;
- the same file or search was read twice, or context was spent on nothing.

**A proposal with no moment behind it is discarded**, however sensible it sounds: generic
advice is what the session did not teach. List it under *Discarded* with one line on why.

## Turning a moment into a proposal

| The error was | Its destination is |
|---|---|
| **Mechanical** — a rule a program could check | **A check**: a CI gate, a linter rule, `nzt-ai lint`. Not a sentence |
| **Of judgment** — needs reading the situation | **A written rule**, in the narrowest place that would have been read at that moment |

**A repository with no automated checks is a finding in itself**, tied to the moment a check
would have caught.

Destinations, by section:

| Section | Where a proposal can land |
|---|---|
| For the project | its stack document, `Docs/` (glossary, architecture), `Docs/Architecture/tech-debt.md`, its CI gates and linters, its `CLAUDE.md` or `AGENTS.md` |
| For NZT | the kernel, a router, a reference, a `nzt-ai` check, or a missing case in `evals/` |

A proposal names one destination and what would change there. It does not write the change.

## Categories and severity

Categories: **navigation** (finding where things are), **automated checks**, **rules**
(stack, code conventions), **instructions** (guidance that weighs or changes nothing),
**tool economy**, **missing information**, and **environment** — a tool the agent assumed
and was not installed.

| Severity | Means |
|---|---|
| high | it repeats, or ended in a silent failure or rework |
| medium | it cost time |
| low | friction |

## The file

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

### R-02 · …

## Discarded

- <idea> — <why: no moment behind it, or not ours to change>
```

- **Never a value copied from a session**: no command output, no file content, no key, no
  path that carries a name the user did not choose to share. A secret is named by its key,
  never its value.
- Every proposal starts as `Status: proposed`. The team moves it to `accepted`, `discarded`
  or `done`; a retro never changes a status, not even in an earlier retro's file.
- One section empty is said in one line, not filled to look balanced.

## Done when

Rehearse it: could someone who never saw these sessions decide on each proposal from the
file alone?

- The path was asked, and a path inside a repository was confirmed.
- Every proposal names its moment, its kind, one destination and a severity; nothing
  generic survived outside *Discarded*.
- No value from a session is in the file, and what could not be reviewed is said in it.
- Nothing but the file was written.
