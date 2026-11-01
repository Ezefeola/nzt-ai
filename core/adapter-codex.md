## Host: Codex CLI

- NZT skills live in `.agents/skills/<name>/SKILL.md` (project) or `~/.agents/skills/`
  (personal). Load one by reading its `SKILL.md`, using the name from the routing table.
- The user can invoke any skill directly as `$<name>`.
- The question tool is `request_user_input`, only in Plan mode or behind its flag; else the block.
- A skill you have read stays in the conversation.
- Instruction files merge from the repository root down to the working directory, so
  guidance closer to the working directory wins over this file.
- Clearing means starting a fresh session; only `Plan/state.json` carries over.
