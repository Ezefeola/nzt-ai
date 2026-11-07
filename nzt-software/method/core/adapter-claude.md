## Host: Claude Code

- **This skill is NZT's kernel.** It stays in context once loaded. If the conversation was
  compacted and these rules are no longer in front of you, load `nzt` again first.
- Wherever NZT says to load `nzt` — starting, resuming, an unclear phase — it is already
  loaded: read `references/entry.md` in this skill's folder and follow it.
- NZT skills live in `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/`
  (personal). Load one with the Skill tool, using the name from the routing table.
- The user can invoke any skill directly as `/<name>`.
- The question tool is `AskUserQuestion`: 1–4 questions a call, 2–4 options each, Other added.
- A skill's content stays in context once loaded.
- Plan mode and its approval prompt do not replace `Plan/state.json`; the plan has to
  survive the session and stay editable by the user.
- Clearing the session is `/clear`. With no usage signal, point the user at `/context`,
  which prints it.
