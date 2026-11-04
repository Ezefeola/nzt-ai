#!/usr/bin/env bash
# The same cases against hooks/check.sh and hooks/check.ps1 (RN-plugin-aviso-version,
# RN-plugin-dos-bloques). Each case runs in its own sandbox; nothing outside it is read.
#
# Usage: plugin/tests/check.test.sh [sh|pwsh|powershell ...]
#   default: sh, plus pwsh and powershell (Windows PowerShell 5.1) when they are installed.
set -u

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
hooks="$here/../hooks"

impls="$*"
if [ -z "$impls" ]; then
  impls="sh"
  command -v pwsh >/dev/null 2>&1 && impls="$impls pwsh"
  command -v powershell >/dev/null 2>&1 && impls="$impls powershell"
fi

pass=0
fail=0
failed_names=""

winpath() { if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else echo "$1"; fi; }

new_sandbox() {
  box="$(mktemp -d "${TMPDIR:-/tmp}/nzt-check-test.XXXXXX")"
  mkdir -p "$box/plugin/.claude-plugin" "$box/home/.claude" "$box/project"
  printf '{\n  "name": "nzt",\n  "version": "2.0.0"\n}\n' > "$box/plugin/.claude-plugin/plugin.json"
}

block() { # <file> <plugin version | other>
  if [ "$2" = other ]; then
    printf '<!-- nzt:start -->\n# NZT\n<!-- nzt:end -->\n' > "$1"
  else
    printf 'mine\n\n<!-- nzt:start -->\n<!-- nzt:plugin %s -->\n# NZT\n<!-- nzt:end -->\n' "$2" > "$1"
  fi
}

# run: sets $out and $rc.
run() {
  if [ "$impl" = sh ]; then
    out="$(sh "$hooks/check.sh" --claude-dir "$box/home/.claude" --project-dir "$box/project" --plugin-root "$box/plugin" 2>&1)"; rc=$?
  else
    out="$("$impl" -NoProfile -ExecutionPolicy Bypass -File "$(winpath "$hooks/check.ps1")" \
      --claude-dir "$(winpath "$box/home/.claude")" --project-dir "$(winpath "$box/project")" \
      --plugin-root "$(winpath "$box/plugin")" 2>&1)"; rc=$?
  fi
}

case_ok=1
check() {
  local what="$1"; shift
  if ! "$@"; then
    case_ok=0
    echo "    FAIL: $what"
    echo "$out" | sed 's/^/      | /'
  fi
}
rc_is() { [ "$rc" = "$1" ]; }
silent() { [ -z "$out" ]; }
says() { printf '%s' "$out" | grep -qF -- "$1"; }
not_says() { ! says "$1"; }
valid_json() {
  # the hook's stdout must parse, or Claude Code drops it
  if command -v pwsh >/dev/null 2>&1; then
    printf '%s' "$out" | pwsh -NoProfile -Command '$null = [Console]::In.ReadToEnd() | ConvertFrom-Json' >/dev/null 2>&1
  elif command -v python3 >/dev/null 2>&1; then
    printf '%s' "$out" | python3 -c 'import json,sys; json.load(sys.stdin)'
  else
    says '"hookEventName": "SessionStart"' || says '"hookEventName":"SessionStart"'
  fi
}

t() {
  new_sandbox
  case_ok=1
  "$2"
  if [ "$case_ok" = 1 ]; then pass=$((pass + 1)); echo "  ok   $1"
  else fail=$((fail + 1)); failed_names="$failed_names\n  [$impl] $1"; echo "  FAIL $1"; fi
  rm -rf "$box"
}

c_no_blocks_silent() {
  run
  check "exit 0" rc_is 0
  check "says nothing" silent
}

c_current_global_silent() {
  block "$box/home/.claude/CLAUDE.md" 2.0.0
  run
  check "exit 0" rc_is 0
  check "says nothing" silent
}

c_old_global_warns() {
  block "$box/home/.claude/CLAUDE.md" 1.0.0
  run
  check "exit 0" rc_is 0
  check "valid JSON" valid_json
  check "user line" says "systemMessage"
  check "Claude's line" says "additionalContext"
  check "block version" says "version 1.0.0"
  check "plugin version" says "plugin is 2.0.0"
  check "points to setup" says "/nzt:setup"
}

c_old_project_warns() {
  block "$box/project/CLAUDE.md" 1.0.0
  run
  check "valid JSON" valid_json
  check "block version" says "version 1.0.0"
}

c_crlf_block_read() {
  block "$box/home/.claude/CLAUDE.md" 1.0.0
  while IFS= read -r l; do printf '%s\r\n' "$l"; done < "$box/home/.claude/CLAUDE.md" > "$box/crlf"
  cp "$box/crlf" "$box/home/.claude/CLAUDE.md"
  check "fixture has CRLF" test -n "$(tr -cd '\r' < "$box/home/.claude/CLAUDE.md" | head -c 1)"
  run
  check "block version" says "version 1.0.0"
}

c_nzt_ai_block_silent() {
  block "$box/home/.claude/CLAUDE.md" other
  run
  check "exit 0" rc_is 0
  check "says nothing" silent
}

c_two_blocks_warn() {
  block "$box/home/.claude/CLAUDE.md" 2.0.0
  block "$box/project/CLAUDE.md" 2.0.0
  run
  check "valid JSON" valid_json
  check "two blocks" says "two NZT blocks"
  check "project applies" says "Apply only the project"
  check "no version line" not_says "plugin is 2.0.0"
}

c_two_blocks_old_project() {
  block "$box/home/.claude/CLAUDE.md" 2.0.0
  block "$box/project/CLAUDE.md" 1.0.0
  run
  check "valid JSON" valid_json
  check "two blocks" says "two NZT blocks"
  check "version of the one that applies" says "version 1.0.0"
}

c_two_blocks_old_global_only() {
  block "$box/home/.claude/CLAUDE.md" 1.0.0
  block "$box/project/CLAUDE.md" 2.0.0
  run
  check "two blocks" says "two NZT blocks"
  check "the global one does not apply: no version line" not_says "version 1.0.0"
}

c_no_manifest_silent() {
  rm -rf "$box/plugin/.claude-plugin"
  block "$box/home/.claude/CLAUDE.md" 1.0.0
  run
  check "exit 0" rc_is 0
  check "says nothing" silent
}

c_never_writes() {
  block "$box/home/.claude/CLAUDE.md" 1.0.0
  block "$box/project/CLAUDE.md" 1.0.0
  ( cd "$box" && find . -type f -exec cksum {} + | sort ) > "$box.before"
  run
  ( cd "$box" && find . -type f -exec cksum {} + | sort ) > "$box.after"
  check "no file changed" cmp -s "$box.before" "$box.after"
  rm -f "$box.before" "$box.after"
}

cases="c_no_blocks_silent c_current_global_silent c_old_global_warns c_old_project_warns
c_crlf_block_read c_nzt_ai_block_silent c_two_blocks_warn c_two_blocks_old_project
c_two_blocks_old_global_only c_no_manifest_silent c_never_writes"

for impl in $impls; do
  echo "== $impl"
  for c in $cases; do t "${c#c_}" "$c"; done
done

echo
echo "$pass passed, $fail failed"
[ "$fail" = 0 ] || { printf "failed:$failed_names\n"; exit 1; }
