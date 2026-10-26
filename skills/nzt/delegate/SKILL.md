---
name: nzt-delegate
description: Use before handing work to a subagent - a reading, or a unit the approved plan marked parallel: whether the mode allows it, the prompt, and what to do with what comes back.
---

# Delegating to a subagent

Produces work done by a subagent so it does not fill your window — an answer to one
question, or approved units run at the same time — checked by you before anything rests on
it. Any phase can need it, and no router owns it: the kernel's rule on subagents is what
sends you here.

> **A subagent works for you; it never decides for you.**

Delegating does not save tokens: the subagent reads what you would have read, and you read
again what it cites or changed. It saves your window, and running units at once saves time.
Spend it on that and nothing else.

## Read the mode

The mode is `delegation` in `Plan/state.json`:

| Mode | Readings | Units the approved plan marked parallel |
|---|---|---|
| `auto` | Delegated without asking | Delegated |
| `ask` | Before each one, ask: what you will explore and why. No yes, no delegation | Delegated: approving the plan was the yes |
| `off` | Never. Do the reading yourself | Never. They run one after another |

- **No field, no state file, or a value that is not one of the three → `ask`.**
- Only the user changes the mode. You never write it on your own; when they ask you to,
  you write that key and nothing else.
- The `ask` question is a permission, not a project decision: one question through the
  host's question tool — delegate, or read it yourself — with no `QT` id and no log entry.

## What stays yours, whatever the mode

- The plan, the state, every question to the user, every decision and every approval.
- Accepting what comes back. What a subagent reports is its evidence, not yours: it is
  checked before it is stated, built on or marked done.
- Anything that leaves the working copy: a push, a tag, a deploy, a message.

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The delegation is | Read | Read with |
|---|---|---|
| A reading: surveying code, searching the repository, researching on the web | `references/reading.md` | — |
| Units the approved plan marked parallel | `references/units.md` | — |

**If the host has no subagents, or the one a row names is not installed, the work is done
here**: a reading by you, units one after another. The result is the same; only the window
and the clock pay.

## Done when

- The mode allowed it, or the user said yes to it.
- The prompt carried everything its reference asks for, because the subagent saw none of
  this conversation.
- Nothing it returned was stated, built on or marked done before you checked it.
