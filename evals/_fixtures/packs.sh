#!/usr/bin/env bash
# Installs packs into the workspace as project skills, the way `nzt-ai project add` lays
# them out for Claude Code: packs/<pack>/ becomes .claude/skills/nzt-<pack>/, and every
# pack a pack requires comes with it. The packs are the ones install/build.* copied next
# to this script, so a stale build seeds stale packs.
# Usage: packs.sh <workspace> <pack>...
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="$1"
shift

install_pack() {
  local pack="$1" src="$here/packs/$1" dest="$ws/.claude/skills/nzt-$1" required
  [ -d "$dest" ] && return 0
  if [ ! -f "$src/pack.json" ]; then
    echo "packs.sh: no pack '$pack' in $here/packs - run install/build.sh" >&2
    exit 1
  fi
  for required in $(sed -n 's/.*"requires"[[:space:]]*:[[:space:]]*\[\(.*\)\].*/\1/p' "$src/pack.json" | tr ',"' '  '); do
    install_pack "$required"
  done
  [ -f "$src/SKILL.md" ] || return 0
  mkdir -p "$dest"
  cp "$src/SKILL.md" "$dest/"
  [ -d "$src/references" ] && cp -R "$src/references" "$dest/"
  return 0
}

for pack in "$@"; do
  install_pack "$pack"
done
