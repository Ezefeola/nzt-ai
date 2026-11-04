#!/usr/bin/env bash
# /nzt:setup's worker (specs/nzt-plugin.md, "Los scripts"). Same interface as setup.ps1:
#
#   setup.sh status|install|remove [--scope global|project] [--project-dir <dir>]
#            [--data-dir <dir>] [--plugin-root <dir>] [--claude-dir <dir>]
#            [--manifest-dir <dir>] [--dry-run] [--accept-agents-md] [--force-edited]
#
# Exit codes: 0 done, 2 stopped by a rule (the message names it), 1 error.
# The stopping rules live here, not in the skill: the model only relays them.
# Written for bash 3.2 (macOS) and Git Bash: no associative arrays, no GNU-only flags.
set -u

die() { echo "error: $*" >&2; exit 1; }
stop() { echo "stopped: $1: $2"; exit 2; }

action="${1:-}"
[ $# -gt 0 ] && shift

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scope=""
project_dir="$PWD"
data_dir=""
plugin_root="$(cd "$script_dir/../../.." && pwd)"
claude_dir="$HOME/.claude"
manifest_dir=""
dry_run=0
accept_agents=0
force_edited=0

while [ $# -gt 0 ]; do
  case "$1" in
    --scope|--project-dir|--data-dir|--plugin-root|--claude-dir|--manifest-dir)
      [ $# -ge 2 ] || die "$1 needs a value"
      case "$1" in
        --scope) scope="$2" ;;
        --project-dir) project_dir="$2" ;;
        --data-dir) data_dir="$2" ;;
        --plugin-root) plugin_root="$2" ;;
        --claude-dir) claude_dir="$2" ;;
        --manifest-dir) manifest_dir="$2" ;;
      esac
      shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    --accept-agents-md) accept_agents=1; shift ;;
    --force-edited) force_edited=1; shift ;;
    *) die "unknown argument '$1'" ;;
  esac
done

case "$action" in
  status|install|remove) ;;
  *) die "usage: setup.sh status|install|remove [--scope global|project] ..." ;;
esac

# nzt-ai keeps its manifest outside the provider folder (specs/nzt-installer.md, section 5).
if [ -z "$manifest_dir" ]; then
  if [ -n "${LOCALAPPDATA:-}" ]; then
    manifest_dir="$LOCALAPPDATA/nzt/manifests"
    command -v cygpath >/dev/null 2>&1 && manifest_dir="$(cygpath -u "$manifest_dir")"
  else
    manifest_dir="$HOME/.local/share/nzt/manifests"
  fi
fi

[ -d "$project_dir" ] || die "project dir '$project_dir' does not exist"
project_dir="$(cd "$project_dir" && pwd)"
[ -d "$claude_dir" ] && claude_dir="$(cd "$claude_dir" && pwd)"

global_file="$claude_dir/CLAUDE.md"
project_file="$project_dir/CLAUDE.md"
nzt_ai_manifest="$manifest_dir/claude-code.json"
plugin_block="$plugin_root/kernel/CLAUDE.md"

[ -f "$plugin_block" ] || die "no kernel/CLAUDE.md under plugin root '$plugin_root'"
plugin_version="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
  "$plugin_root/.claude-plugin/plugin.json" 2>/dev/null | head -1)"
[ -n "$plugin_version" ] || die "no version in $plugin_root/.claude-plugin/plugin.json"

# --- reading a file ------------------------------------------------------------

# block_kind <file>: none | other | plugin <version>. "other" is a NZT block the plugin did
# not write: nzt-ai's, or one pasted by hand.
block_kind() {
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
       END { if (!found) print "none" }' "$1"
}

# block_lines <file>: "<start> <end>" line numbers of the first block, or nothing.
block_lines() {
  awk '{ sub(/\r$/, "") }
       !s && $0 == "<!-- nzt:start -->" { s = NR; next }
       s && $0 == "<!-- nzt:end -->" { print s " " NR; exit }' "$1"
}

# block_text <file>: the block itself, with LF line endings.
block_text() {
  local range
  range="$(block_lines "$1")"
  [ -n "$range" ] || return 0
  sed -n "${range% *},${range#* }p" "$1" | tr -d '\r'
}

sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum | cut -d' ' -f1
  else shasum -a 256 | cut -d' ' -f1; fi
}

# Byte-exact passes use head, tail, tr and read: Git Bash's awk, grep and sed drop the CR
# of a CRLF line, so they only ever see a file, never write one back.
uses_crlf() { [ -f "$1" ] && [ -n "$(tr -cd '\r' < "$1" | head -c 1)" ]; }

# emit_block <crlf 0|1>: the plugin's block in the target file's line endings.
emit_block() {
  local line
  if [ "$1" = 1 ]; then
    while IFS= read -r line || [ -n "$line" ]; do printf '%s\r\n' "$line"; done < "$plugin_block"
  else
    cat "$plugin_block"
  fi
}

# --- what the setup wrote: ${CLAUDE_PLUGIN_DATA}/written.json -------------------
# One line per file, so a shell can read it: "<path>": {"version", "hash", "date"}.

written_file() { echo "$data_dir/written.json"; }

recorded_hash() {
  local f
  f="$(written_file)"
  [ -f "$f" ] || return 0
  grep -F "\"$1\": " "$f" | head -1 | sed -n 's/.*"hash": "\([^"]*\)".*/\1/p'
}

# set_record <path> <hash|""> : replaces the line of <path>; an empty hash removes it.
set_record() {
  local f tmp
  f="$(written_file)"
  tmp="$f.tmp"
  mkdir -p "$data_dir"
  {
    [ -f "$f" ] && grep -F '": {"version": ' "$f" | grep -vF "\"$1\": " | sed 's/,[[:space:]]*$//'
    if [ -n "$2" ]; then
      printf '  "%s": {"version": "%s", "hash": "%s", "date": "%s"}\n' \
        "$1" "$plugin_version" "$2" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    fi
  } > "$tmp.lines"
  {
    echo "{"
    awk 'NR > 1 { print prev "," } { prev = $0 } END { if (NR) print prev }' "$tmp.lines"
    echo "}"
  } > "$tmp"
  rm -f "$tmp.lines"
  mv "$tmp" "$f"
}

# --- status --------------------------------------------------------------------

describe() {
  local kind
  kind="$(block_kind "$1")"
  case "$kind" in
    other) echo "other (a NZT block the plugin did not write) at $1" ;;
    *) echo "$kind at $1" ;;
  esac
}

if [ "$action" = status ]; then
  echo "plugin: $plugin_version"
  echo "global: $(describe "$global_file")"
  echo "project: $(describe "$project_file")"
  if [ -f "$nzt_ai_manifest" ]; then
    echo "nzt-ai: installed ($nzt_ai_manifest)"
  else
    echo "nzt-ai: not installed"
  fi
  exit 0
fi

# --- install and remove --------------------------------------------------------

case "$scope" in
  global) target="$global_file"; other_file="$project_file"; other_scope=project ;;
  project) target="$project_file"; other_file="$global_file"; other_scope=global ;;
  *) die "--scope must be global or project" ;;
esac
[ -n "$data_dir" ] || die "--data-dir is required for $action"

nzt_ai_hint="NZT is installed with nzt-ai. Uninstall it first with 'nzt-ai uninstall --provider claude-code', then run /nzt:setup again"
kind="$(block_kind "$target")"

if [ "$kind" = other ]; then
  stop RN-plugin-instalador-presente "$target has a NZT block the plugin did not write (nzt-ai, or pasted by hand). $nzt_ai_hint, or remove that block by hand"
fi

# atomic_write <target> <content-file>: a temporary file next to it, then a rename.
atomic_write() {
  local tmp="$1.nzt-tmp.$$"
  mkdir -p "$(dirname "$1")"
  cat "$2" > "$tmp" && mv "$tmp" "$1" || { rm -f "$tmp"; die "could not write $1"; }
}

# No copy is kept (QT-107): the simulation says so, so whoever wants one makes it first.
no_copy_note() {
  echo "plan: no copy of $target is kept; to keep one, copy it yourself before applying"
}

# edited_check <verb>: stops when the block in the file is not the one the setup wrote.
edited_check() {
  local current recorded
  current="$(block_text "$target" | sha)"
  recorded="$(recorded_hash "$target")"
  if [ "$current" != "$recorded" ] && [ "$force_edited" = 0 ]; then
    echo "stopped: RN-plugin-quitar: the block in $target is not the one the setup wrote (edited by hand, or written before the plugin was reinstalled). Run again with --force-edited to $1 it anyway. Difference with the plugin's block $plugin_version (- plugin, + file):"
    block_text "$target" > "$work.cur"
    diff -u "$plugin_block" "$work.cur" | sed '1,2d'
    exit 2
  fi
}

work="$(mktemp "${TMPDIR:-/tmp}/nzt-setup.XXXXXX")" || die "no temporary file"
trap 'rm -f "$work" "$work.cur" "$work.after"' EXIT

if [ "$action" = install ]; then
  if [ -f "$nzt_ai_manifest" ]; then
    stop RN-plugin-instalador-presente "$nzt_ai_hint ($nzt_ai_manifest)"
  fi
  other_kind="$(block_kind "$other_file")"
  case "$other_kind" in
    other) stop RN-plugin-instalador-presente "$other_file has a NZT block the plugin did not write. $nzt_ai_hint, or remove that block by hand" ;;
    plugin*) stop RN-plugin-un-solo-nzt "there is already a $other_scope NZT block in $other_file; with both, Claude loads the kernel twice. Remove it with /nzt:setup first" ;;
  esac
  if [ "$scope" = project ] && [ ! -f "$target" ] && [ -f "$project_dir/AGENTS.md" ] && [ "$accept_agents" = 0 ]; then
    stop RN-plugin-aviso-agents "$project_dir has AGENTS.md and no CLAUDE.md: once CLAUDE.md exists, Claude stops reading AGENTS.md unless the user changes 'Project instructions'. Run again with --accept-agents-md to create it"
  fi

  new_hash="$(tr -d '\r' < "$plugin_block" | sha)"
  existed=0; [ -f "$target" ] && existed=1
  case "$kind" in
    none)
      if [ -f "$target" ]; then
        plan="add the block ($plugin_version) on top of $target; the rest stays below as it is"
        crlf=0; uses_crlf "$target" && crlf=1
        { emit_block "$crlf"; if [ "$crlf" = 1 ]; then printf '\r\n'; else echo; fi; cat "$target"; } > "$work"
      else
        plan="create $target with the block ($plugin_version)"
        emit_block 0 > "$work"
      fi ;;
    plugin*)
      old="${kind#plugin }"
      if [ "$(block_text "$target" | sha)" = "$new_hash" ]; then
        echo "unchanged: $target already has the block $plugin_version"
        [ "$dry_run" = 1 ] || set_record "$target" "$new_hash"
        exit 0
      fi
      edited_check replace
      plan="replace the block $old with $plugin_version in $target; the rest stays as it is"
      range="$(block_lines "$target")"
      crlf=0; uses_crlf "$target" && crlf=1
      { head -n "$(( ${range% *} - 1 ))" "$target"; emit_block "$crlf"; tail -n "+$(( ${range#* } + 1 ))" "$target"; } > "$work"
      ;;
  esac

  if [ "$dry_run" = 1 ]; then
    echo "plan: $plan"
    [ "$existed" = 1 ] && no_copy_note
    exit 0
  fi
  atomic_write "$target" "$work"
  set_record "$target" "$new_hash"
  echo "done: $plan"
  echo "It takes effect in the next session."
  exit 0
fi

# remove
if [ "$kind" = none ]; then
  echo "nothing to remove: $target has no NZT block"
  exit 0
fi
edited_check remove
range="$(block_lines "$target")"
[ -n "$range" ] || die "$target has a start marker and no end marker"
# What follows the block, without the blank line install put after it.
tail -n "+$(( ${range#* } + 1 ))" "$target" > "$work.after"
if [ -s "$work.after" ] && [ -z "$(head -n 1 "$work.after" | tr -d '\r\n')" ]; then
  tail -n +2 "$work.after" > "$work.cur" && mv "$work.cur" "$work.after"
fi
{ head -n "$(( ${range% *} - 1 ))" "$target"; cat "$work.after"; } > "$work"

if [ ! -s "$work" ]; then
  plan="remove the block from $target, which leaves it empty: delete the file"
else
  plan="remove the block from $target; the rest stays as it is"
fi
if [ "$dry_run" = 1 ]; then
  echo "plan: $plan"
  no_copy_note
  exit 0
fi
if [ -s "$work" ]; then atomic_write "$target" "$work"; else rm -f "$target"; fi
set_record "$target" ""
echo "done: $plan"
echo "It takes effect in the next session."
exit 0
