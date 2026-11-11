---
name: delegate
description: Use before handing work to a subagent - a reading, or a unit the approved plan marked parallel: whether the mode allows it, the prompt, and how to check what comes back.
---

# Delegating to a subagent

A subagent saves your window (a reading) or your clock (parallel units). It does not save
tokens, and **it never decides for you**.

## References

| The delegation is | Read |
|---|---|
| A reading: surveying, searching the repository, researching the web | `references/reading.md` |
| Units the approved plan marked parallel | `references/units.md` |

## Steps

1. **Read the mode** — `delegation` in `Plan/state.json`; absent or invalid is `ask`:

   | Mode | Readings | Parallel units |
   |---|---|---|
   | `auto` | delegated | delegated |
   | `ask` | ask first (one permission question, no `QT` id, no log) | delegated: approving the plan was the yes |
   | `off` | never | run one after another |

   Only the user changes the mode; when asked, write that key and nothing else.
2. **Check the host**: no subagents, or the named agent not installed → do the work here.
3. **Write the prompt** as the reference says: the subagent saw none of this conversation.
4. **Check what comes back** before stating it, building on it or marking anything done.

The plan, the state, questions, decisions, approvals, and anything that leaves the working
copy (push, tag, deploy, message) always stay yours.

## Done when

The mode allowed it; the prompt carried everything its reference asks; nothing returned was
used before you checked it.
