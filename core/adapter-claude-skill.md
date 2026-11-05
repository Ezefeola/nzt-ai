## Host: Claude Code (plugin)

- **This skill is NZT's kernel.** It stays in context once loaded. If the conversation was
  compacted and these rules are no longer in front of you, load `nzt:nzt` again first.
- Wherever NZT says to load `nzt` — starting, resuming, an unclear phase — it is already
  loaded: read `references/entry.md` in this skill's folder and follow it.
- NZT's skills and subagents come from the plugin, named `nzt:<name>`. Wherever NZT names a
  skill or subagent `nzt-<x>`, load `nzt:nzt-<x>`; a pack skill installed in the project has
  no plugin twin and keeps its own name.
- Load a skill with the Skill tool. The user invokes one as `/nzt:<name>`.
- The question tool is `AskUserQuestion`: 1–4 questions a call, 2–4 options each, Other added.
- A skill's content stays in context once loaded.
- Plan mode and its approval prompt do not replace `Plan/state.json`; the plan has to
  survive the session and stay editable by the user.
- Clearing the session is `/clear`. With no usage signal, point the user at `/context`,
  which prints it.
