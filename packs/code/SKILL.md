---
name: nzt-code
description: Use when tech.md lists the code pack for the component, before writing or changing its code in any language - the user's rules for names, files, members, absence, async, control flow, comments, collections and DTOs.
---

# Code — the user's rules for any language

The rules that hold whatever the language. A language pack (`nzt-csharp`…) adds only what
is its own and reads these first.

## References

| The work touches | Read |
|---|---|
| Any code, every time | `references/code.md` |
| What an operation receives or returns, or its mapping | `references/dtos.md` |
| A collection read, transformed or checked in memory | `references/collections.md` |

## Steps

1. Read `references/code.md`, then the rows the task selects.
2. In a component this project's `Docs/` does not document, follow how that code is written
   and report the difference (`code.md`).
3. Close with each file's checklist.

## Done when

Every checklist of the references read holds for the code you wrote.
