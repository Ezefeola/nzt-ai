---
name: nzt-games
description: Use when Docs/Architecture/tech.md lists a games pack - unity - for the component you touch, before preparing, designing, writing, testing or shipping a game.
---

# Games packs

The rules each games pack holds to. Every path below is under `references/`. A part of the
game that is software — a backend, a web — reads `nzt-software` with its own packs.

## Steps

1. Read the component's packs in `Docs/Architecture/tech.md`.
2. Read the rows the task selects for each pack listed.
3. Take versions from `tech.md` and the project — `ProjectSettings/ProjectVersion.txt`, the package
   manifest — never from an example.

| Pack | What it is |
|---|---|
| `unity` | the Unity engine |

## Unity

| The work touches | Read |
|---|---|
| Connecting the agent to the editor, or the editor does not answer | `unity/editor.md` |

## Done when

Every file read was selected by `tech.md` or by the task, the versions came from the
project, and each file's *Done when* holds.
