#!/usr/bin/env bash
# The same cases against setup.sh and setup.ps1 (specs/nzt-plugin.md, "Los scripts").
# Each case runs in its own sandbox: a fake plugin root, home .claude dir, project, data
# dir and nzt-ai manifest dir. Nothing outside the sandbox is read or written.
#
# Usage: plugin/tests/setup.test.sh [sh|pwsh|powershell ...]
#   default: sh, plus pwsh and powershell (Windows PowerShell 5.1) when they are installed.
set -u

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scripts="$here/../skills/setup/scripts"

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

# --- sandbox -------------------------------------------------------------------

make_plugin() { # <dir> <version>
  mkdir -p "$1/.claude-plugin" "$1/kernel"
  printf '{\n  "name": "nzt",\n  "version": "%s"\n}\n' "$2" > "$1/.claude-plugin/plugin.json"
  printf '<!-- nzt:start -->\n<!-- nzt:plugin %s -->\n# NZT\n\nkernel text\n<!-- nzt:end -->\n' "$2" > "$1/kernel/CLAUDE.md"
}

new_sandbox() {
  box="$(mktemp -d "${TMPDIR:-/tmp}/nzt-setup-test.XXXXXX")"
  make_plugin "$box/plugin1" 1.0.0
  make_plugin "$box/plugin2" 2.0.0
  mkdir -p "$box/project" "$box/data"
  claude="$box/home/.claude"
  manifests="$box/manifests"
  root="$box/plugin1"
}

# run <action> [args...]: sets $out and $rc.
run() {
  local action="$1"; shift
  local base=(--claude-dir "$claude" --project-dir "$box/project" --data-dir "$box/data"
              --plugin-root "$root" --manifest-dir "$manifests")
  if [ "$impl" = sh ]; then
    out="$(bash "$scripts/setup.sh" "$action" "${base[@]}" "$@" 2>&1)"; rc=$?
  else
    local converted=() expect_path=0 arg
    for arg in "${base[@]}" "$@"; do
      if [ "$expect_path" = 1 ]; then converted+=("$(winpath "$arg")"); expect_path=0
      else
        converted+=("$arg")
        case "$arg" in --claude-dir|--project-dir|--data-dir|--plugin-root|--manifest-dir) expect_path=1 ;; esac
      fi
    done
    out="$("$impl" -NoProfile -ExecutionPolicy Bypass -File "$(winpath "$scripts/setup.ps1")" "$action" "${converted[@]}" 2>&1)"; rc=$?
  fi
}

# --- assertions ----------------------------------------------------------------

case_ok=1
check() { # <description> <command...>
  local what="$1"; shift
  if ! "$@"; then
    case_ok=0
    echo "    FAIL: $what"
    echo "$out" | sed 's/^/      | /'
  fi
}
rc_is() { [ "$rc" = "$1" ]; }
says() { printf '%s' "$out" | grep -qF -- "$1"; }
same_file() { cmp -s "$1" "$2"; }
absent() { [ ! -e "$1" ]; }
present() { [ -e "$1" ]; }
has_line() { grep -qxF -- "$2" <(tr -d '\r' < "$1"); }
lacks_line() { ! has_line "$1" "$2"; }
has_crlf() { [ -n "$(tr -cd '\r' < "$1" | head -c 1)" ]; }

t() { # <name> <function>
  new_sandbox
  case_ok=1
  "$2"
  if [ "$case_ok" = 1 ]; then pass=$((pass + 1)); echo "  ok   $1"
  else fail=$((fail + 1)); failed_names="$failed_names\n  [$impl] $1"; echo "  FAIL $1"; fi
  rm -rf "$box"
}

# --- cases ---------------------------------------------------------------------

c_status_empty() {
  run status
  check "exit 0" rc_is 0
  check "plugin version" says "plugin: 1.0.0"
  check "no global block" says "global: none"
  check "no project block" says "project: none"
  check "no nzt-ai" says "nzt-ai: not installed"
  check "writes nothing" absent "$claude"
}

c_dry_run_writes_nothing() {
  run install --scope global --dry-run
  check "exit 0" rc_is 0
  check "plans the creation" says "plan: create"
  check "no file" absent "$claude/CLAUDE.md"
  check "no record" absent "$box/data/written.json"
}

c_install_global_new() {
  run install --scope global
  check "exit 0" rc_is 0
  check "file is the block" same_file "$claude/CLAUDE.md" "$root/kernel/CLAUDE.md"
  check "record written" present "$box/data/written.json"
  check "no copy" absent "$claude/CLAUDE.md.nzt-backup"
  run status
  check "status sees it" says "global: plugin 1.0.0"
}

c_install_twice_is_unchanged() {
  run install --scope global
  cp "$claude/CLAUDE.md" "$box/before"
  run install --scope global
  check "exit 0" rc_is 0
  check "says unchanged" says "unchanged"
  check "same file" same_file "$claude/CLAUDE.md" "$box/before"
}

c_existing_file_roundtrip() {
  mkdir -p "$claude"
  printf '# Mine\n\nmy rules\n' > "$claude/CLAUDE.md"
  cp "$claude/CLAUDE.md" "$box/original"
  run install --scope global --dry-run
  check "simulation says no copy is kept" says "no copy of"
  run install --scope global
  check "exit 0" rc_is 0
  { cat "$root/kernel/CLAUDE.md"; echo; cat "$box/original"; } > "$box/expected"
  check "block on top, the rest below" same_file "$claude/CLAUDE.md" "$box/expected"
  check "no copy" absent "$claude/CLAUDE.md.nzt-backup"
  root="$box/plugin2"
  run install --scope global
  check "update exit 0" rc_is 0
  run remove --scope global --dry-run
  check "remove simulation says no copy is kept" says "no copy of"
  run remove --scope global
  check "remove exit 0" rc_is 0
  check "file as it was" same_file "$claude/CLAUDE.md" "$box/original"
}

c_crlf_roundtrip() {
  mkdir -p "$claude"
  printf '# Mine\r\n\r\nmy rules\r\n' > "$claude/CLAUDE.md"
  cp "$claude/CLAUDE.md" "$box/original"
  run install --scope global
  check "exit 0" rc_is 0
  check "block written with CRLF" test "$(head -n 1 "$claude/CLAUDE.md" | od -An -c | tr -d ' \n')" = '<!--nzt:start-->\r\n'
  run remove --scope global
  check "file as it was, byte for byte" same_file "$claude/CLAUDE.md" "$box/original"
}

c_no_final_newline_roundtrip() {
  mkdir -p "$claude"
  printf '# Mine\nlast line' > "$claude/CLAUDE.md"
  cp "$claude/CLAUDE.md" "$box/original"
  run install --scope global
  run remove --scope global
  check "file as it was, byte for byte" same_file "$claude/CLAUDE.md" "$box/original"
}

c_update_in_place() {
  mkdir -p "$claude"
  printf 'above\n' > "$claude/CLAUDE.md"
  run install --scope global
  printf 'below\n' >> "$claude/CLAUDE.md"
  root="$box/plugin2"
  run install --scope global --dry-run
  check "plans the replacement" says "replace the block 1.0.0 with 2.0.0"
  run install --scope global
  check "exit 0" rc_is 0
  check "new version line" has_line "$claude/CLAUDE.md" "<!-- nzt:plugin 2.0.0 -->"
  check "old version gone" lacks_line "$claude/CLAUDE.md" "<!-- nzt:plugin 1.0.0 -->"
  check "text below kept" has_line "$claude/CLAUDE.md" "below"
  check "text above kept" has_line "$claude/CLAUDE.md" "above"
}

c_nzt_ai_manifest_stops() {
  mkdir -p "$manifests"
  echo '{}' > "$manifests/claude-code.json"
  run status
  check "status sees nzt-ai" says "nzt-ai: installed"
  run install --scope global
  check "exit 2" rc_is 2
  check "names the rule" says "RN-plugin-instalador-presente"
  check "says how to uninstall" says "nzt-ai uninstall --provider claude-code"
  check "writes nothing" absent "$claude/CLAUDE.md"
}

c_foreign_block_stops() {
  mkdir -p "$claude"
  printf '<!-- nzt:start -->\n# NZT\n<!-- nzt:end -->\n' > "$claude/CLAUDE.md"
  cp "$claude/CLAUDE.md" "$box/original"
  run install --scope global
  check "same scope: exit 2" rc_is 2
  check "same scope: rule" says "RN-plugin-instalador-presente"
  run install --scope project
  check "other scope: exit 2" rc_is 2
  check "other scope: rule" says "RN-plugin-instalador-presente"
  run remove --scope global
  check "remove: exit 2" rc_is 2
  check "untouched" same_file "$claude/CLAUDE.md" "$box/original"
  check "no project file" absent "$box/project/CLAUDE.md"
}

c_one_nzt_only() {
  run install --scope global
  run install --scope project
  check "project after global: exit 2" rc_is 2
  check "project after global: rule" says "RN-plugin-un-solo-nzt"
  check "no project file" absent "$box/project/CLAUDE.md"
  run remove --scope global
  run install --scope project
  check "project alone: exit 0" rc_is 0
  run install --scope global
  check "global after project: exit 2" rc_is 2
  check "global after project: rule" says "RN-plugin-un-solo-nzt"
}

c_agents_md_needs_acceptance() {
  echo '# agents' > "$box/project/AGENTS.md"
  run install --scope project
  check "exit 2" rc_is 2
  check "names the rule" says "RN-plugin-aviso-agents"
  check "no CLAUDE.md" absent "$box/project/CLAUDE.md"
  run install --scope project --accept-agents-md
  check "accepted: exit 0" rc_is 0
  check "accepted: created" present "$box/project/CLAUDE.md"
}

c_project_no_copy() {
  printf '# Team\n' > "$box/project/CLAUDE.md"
  run install --scope project
  check "exit 0" rc_is 0
  check "no copy in the project" absent "$box/project/CLAUDE.md.nzt-backup"
  check "no copy in the data dir" absent "$box/data/backups"
}

c_edited_block_asks() {
  run install --scope global
  sed 's/kernel text/kernel text, edited/' "$claude/CLAUDE.md" > "$box/edited" && cp "$box/edited" "$claude/CLAUDE.md"
  run remove --scope global
  check "exit 2" rc_is 2
  check "names the rule" says "RN-plugin-quitar"
  check "shows the difference" says "kernel text, edited"
  check "untouched" same_file "$claude/CLAUDE.md" "$box/edited"
  run remove --scope global --force-edited
  check "forced: exit 0" rc_is 0
  check "forced: block gone, file deleted" absent "$claude/CLAUDE.md"
}

c_edited_block_update_asks() {
  run install --scope global
  sed 's/kernel text/kernel text, edited/' "$claude/CLAUDE.md" > "$box/edited" && cp "$box/edited" "$claude/CLAUDE.md"
  root="$box/plugin2"
  run install --scope global
  check "exit 2" rc_is 2
  check "untouched" same_file "$claude/CLAUDE.md" "$box/edited"
}

c_remove_twice() {
  run install --scope global
  run remove --scope global
  run remove --scope global
  check "exit 0" rc_is 0
  check "says there is nothing" says "nothing to remove"
}

c_lost_record() {
  run install --scope global
  rm -rf "$box/data"
  run remove --scope global
  check "without record: exit 2" rc_is 2
  run install --scope global
  check "reinstall same version: unchanged" says "unchanged"
  run remove --scope global
  check "record restored: exit 0" rc_is 0
}

c_bad_arguments() {
  run install
  check "no scope: exit 1" rc_is 1
  run frobnicate
  check "unknown action: exit 1" rc_is 1
}

cases="c_status_empty c_dry_run_writes_nothing c_install_global_new c_install_twice_is_unchanged
c_existing_file_roundtrip c_crlf_roundtrip c_no_final_newline_roundtrip c_update_in_place
c_nzt_ai_manifest_stops c_foreign_block_stops c_one_nzt_only c_agents_md_needs_acceptance
c_project_no_copy c_edited_block_asks c_edited_block_update_asks c_remove_twice
c_lost_record c_bad_arguments"

for impl in $impls; do
  echo "== $impl"
  for c in $cases; do t "${c#c_}" "$c"; done
done

echo
echo "$pass passed, $fail failed"
[ "$fail" = 0 ] || { printf "failed:$failed_names\n"; exit 1; }
