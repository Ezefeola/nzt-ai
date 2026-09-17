## Host: Codex CLI

- NZT skills live in `.agents/skills/<name>/SKILL.md` (project) or `~/.agents/skills/`
  (personal). Load one by reading its `SKILL.md`, using the name from the routing table.
- The user can invoke any skill directly as `$<name>`.
- A skill you have read stays in the conversation. Do not read the same `SKILL.md` twice.
- Instruction files merge from the repository root down to the working directory, so
  guidance closer to the working directory wins over this file.
- Clearing means the user starting a fresh session; you never do it, and the only thing
  that carries over is `Plan/state.json`.
