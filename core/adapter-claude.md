## Host: Claude Code

- NZT skills live in `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/`
  (personal). Load one with the Skill tool, using the name from the routing table.
- The user can invoke any skill directly as `/<name>`.
- A skill's content stays in context once loaded. Do not reload a skill you already have.
- Plan mode and its approval prompt do not replace `Plan/state.json`; the plan has to
  survive the session and stay editable by the user.
- Clearing the session is `/clear`, and it is the user who runs it. If this session gives
  you no usage signal, say so and point them at `/context`, which prints it.
