## Host: Claude Code (plugin)

- **This block needs the `nzt` plugin.** If no skill `nzt:nzt` is available, do not apply
  NZT: say once in the session that this block in `CLAUDE.md` comes from the `nzt` plugin,
  which is missing or disabled — install it with `/plugin install nzt@nzt`, or remove the
  block between the `nzt:start` and `nzt:end` markers — and work without the method.
- NZT's skills and subagents come from the plugin, named `nzt:<name>`. Wherever NZT names a
  skill or subagent `nzt-<x>` (or `nzt`), load `nzt:nzt-<x>`; a pack skill installed in the
  project has no plugin twin and keeps its own name.
- Load a skill with the Skill tool. The user invokes one as `/nzt:<name>`; `/nzt:setup`
  installs, updates or removes this block.
- The question tool is `AskUserQuestion`: 1–4 questions a call, 2–4 options each, Other added.
- A skill's content stays in context once loaded.
- Plan mode and its approval prompt do not replace `Plan/state.json`; the plan has to
  survive the session and stay editable by the user.
- Clearing the session is `/clear`. With no usage signal, point the user at `/context`,
  which prints it.
