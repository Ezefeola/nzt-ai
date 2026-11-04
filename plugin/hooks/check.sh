#!/bin/sh
# SessionStart check (specs/nzt-plugin.md: RN-plugin-aviso-version, RN-plugin-dos-bloques).
# Same behavior as check.ps1. Reads the NZT blocks of ~/.claude/CLAUDE.md and the project's
# CLAUDE.md and prints, only when there is something to say, the hook's JSON: a line for the
# user (systemMessage) and the same for Claude (additionalContext). Never writes, and always
# exits 0: a failing check must not get in the way of the session.
#
#   check.sh [--claude-dir <dir>] [--project-dir <dir>] [--plugin-root <dir>]
# Defaults: ~/.claude, $CLAUDE_PROJECT_DIR (or the current dir), the folder above this one.

claude_dir="$HOME/.claude"
project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
plugin_root="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"

while [ $# -gt 1 ]; do
  case "$1" in
    --claude-dir) claude_dir="$2" ;;
    --project-dir) project_dir="$2" ;;
    --plugin-root) plugin_root="$2" ;;
  esac
  shift 2
done

plugin_version="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
  "$plugin_root/.claude-plugin/plugin.json" 2>/dev/null | head -1)"
[ -n "$plugin_version" ] || exit 0

# kind <file>: none | other | plugin <version>
kind() {
  [ -f "$1" ] || { echo none; return; }
  awk '{ sub(/\r$/, "") }
       !inb && $0 == "<!-- nzt:start -->" { inb = 1; next }
       inb {
         found = 1
         if ($0 ~ /^<!-- nzt:plugin [^ ]+ -->$/) {
           v = $0; sub(/^<!-- nzt:plugin /, "", v); sub(/ -->$/, "", v); print "plugin " v
         } else print "other"
         exit
       }
       END { if (!found) print "none" }' "$1" 2>/dev/null || echo none
}

global_file="$claude_dir/CLAUDE.md"
project_file="$project_dir/CLAUDE.md"
global_kind="$(kind "$global_file")"
project_kind="$(kind "$project_file")"

user=""
model=""

# Two blocks: the project's applies, because the team versioned it (QT-102).
applies="$global_kind"
applies_file="$global_file"
if [ "$project_kind" != none ]; then
  applies="$project_kind"
  applies_file="$project_file"
fi
if [ "$global_kind" != none ] && [ "$project_kind" != none ]; then
  user="NZT: two NZT blocks are loaded, $global_file and $project_file; only the project's applies. Remove one with /nzt:setup."
  model="Two NZT kernel blocks are loaded: $global_file and $project_file. Apply only the project's block ($project_file) and ignore the one in $global_file."
fi

case "$applies" in
  plugin*)
    version="${applies#plugin }"
    if [ "$version" != "$plugin_version" ]; then
      line="NZT: the block in $applies_file is version $version and the plugin is $plugin_version. Run /nzt:setup to update it."
      user="${user:+$user }$line"
      model="${model:+$model }$line Tell the user once."
    fi ;;
esac

[ -n "$user" ] || exit 0

json() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
printf '{"systemMessage": "%s", "hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "%s"}}\n' \
  "$(json "$user")" "$(json "$model")"
exit 0
