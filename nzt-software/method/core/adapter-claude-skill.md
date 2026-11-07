## Host: Claude Code (plugin)

- **This skill is NZT's kernel.** It stays in context once loaded. If the conversation was
  compacted and these rules are no longer in front of you, load `nzt-software:nzt` again first.
- Wherever NZT says to load `nzt` — starting, resuming, an unclear phase — it is already
  loaded: read `references/entry.md` in this skill's folder and follow it.
- NZT's skills and subagents come from the plugin `nzt-software`, without their `nzt-`
  prefix. Wherever NZT names a skill or subagent `nzt-<x>`, load `nzt-software:<x>`
  (`nzt-build` is `nzt-software:build`, `nzt-explorer` is `nzt-software:explorer`); a
  reference name like `nzt-verify-performance` is read in `nzt-software:verify`.
- Load a skill with the Skill tool. The user invokes one as `/nzt-software:<name>`.
- The question tool is `AskUserQuestion`: 1–4 questions a call, 2–4 options each, Other added.
- A skill's content stays in context once loaded.
- Plan mode and its approval prompt do not replace `Plan/state.json`; the plan has to
  survive the session and stay editable by the user.
- Clearing the session is `/clear`. With no usage signal, point the user at `/context`,
  which prints it.
