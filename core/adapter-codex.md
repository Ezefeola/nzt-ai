## Host: Codex CLI

- **This skill is NZT's kernel.** It stays in the conversation once read. If the
  conversation was compacted and these rules are no longer in front of you, read this
  skill's `SKILL.md` again first.
- Wherever NZT says to load `nzt` — starting, resuming, an unclear phase — it is already
  loaded: read `references/entry.md` in this skill's folder and follow it.
- NZT skills live in `.agents/skills/<name>/SKILL.md` (project) or `~/.agents/skills/`
  (personal). Load one by reading its `SKILL.md`, using the name from the routing table.
- The user can invoke any skill directly as `$<name>`.
- The question tool is `request_user_input`, only in Plan mode or behind its flag; else the block.
- A skill you have read stays in the conversation.
- The project's `AGENTS.md` files still apply alongside these rules.
- Clearing means starting a fresh session; only `Plan/state.json` carries over.
