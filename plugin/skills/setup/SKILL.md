---
name: setup
description: Installs, updates or removes NZT's kernel block in a CLAUDE.md (global or this project), or shows where it is. Run only when the user types /nzt:setup.
argument-hint: "[status|install|remove] [global|project]"
disable-model-invocation: true
allowed-tools: Bash(bash "${CLAUDE_SKILL_DIR}/scripts/setup.sh" *) Bash(powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_SKILL_DIR}/scripts/setup.ps1" *) PowerShell(powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_SKILL_DIR}/scripts/setup.ps1" *)
---

# NZT setup

Writes NZT's kernel block into a `CLAUDE.md`, updates it, removes it, or says where it is
(specs/nzt-plugin.md). **The script decides; you relay.** Never edit a `CLAUDE.md` yourself,
never skip a stop the script reports, and never write without the user's *Yes* in this run.

Arguments, if any: `$ARGUMENTS` — an action (`status`, `install`, `remove`) and a scope
(`global`, `project`). What they do not say, you ask.

## The command

`<setup>` below is, with the same arguments after it:

- **Windows**: `powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_SKILL_DIR}/scripts/setup.ps1"`
- **macOS and Linux**: `bash "${CLAUDE_SKILL_DIR}/scripts/setup.sh"`

Every call adds `--project-dir "${CLAUDE_PROJECT_DIR}" --data-dir "${CLAUDE_PLUGIN_DATA}"
--plugin-root "${CLAUDE_PLUGIN_ROOT}"`. Exit codes: **0** done, **2** stopped by a rule (the
line `stopped: <rule>: …` says which and why), **1** error.

## Steps

1. **Status.** Run `<setup> status` and tell the user, in their language, where a block is
   (global, this project, or none), its version, the plugin's, and whether `nzt-ai` is
   installed. If the action was `status`, stop here.
2. **Ask** what the arguments left open, with `AskUserQuestion`, one decision per question:
   the action (install or update, remove), and for install the scope — **global**
   (`~/.claude/CLAUDE.md`, every project) or **this project** (its `CLAUDE.md`, shared with
   whoever clones the repo). Remove takes the scope where status found the block.
3. **Simulate.** Run `<setup> install|remove --scope <scope> --dry-run`.
   - Exit 2 with `RN-plugin-aviso-agents`: explain that once `CLAUDE.md` exists Claude stops
     reading this project's `AGENTS.md` unless they change *Project instructions*; ask, with
     **No** first, not marked recommended (QT-108); on *Yes* simulate again adding `--accept-agents-md`.
   - Exit 2 with `RN-plugin-quitar`: show the difference the script printed, say it would be
     lost, ask with **No** first; on *Yes* simulate again adding `--force-edited`.
   - Exit 2 with any other rule (`RN-plugin-instalador-presente`, `RN-plugin-un-solo-nzt`):
     relay what to do, in their words, and **stop**. Nothing is written.
   - `unchanged` or `nothing to remove`: say so and stop.
4. **Confirm.** Show the file and what changes (the `plan:` lines). When a `plan:` line says
   no copy is kept, tell the user that if they want one they make it before answering. Ask
   whether to apply it, with **No** as the first option, not marked recommended: they asked
   for this, and *No* is first only so a hurried Enter writes nothing (QT-108). Anything but
   *Yes* writes nothing.
5. **Apply.** Run the same command without `--dry-run`, keeping any flag the user accepted.
   Report what was written and that it takes effect in the next session.

## Done when

The user saw the status, nothing was written without their *Yes* to the simulated plan, and
every stop the script reported reached them with what to do next.
