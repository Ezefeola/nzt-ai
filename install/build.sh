#!/usr/bin/env bash
# Builds CLAUDE.md and AGENTS.md from core/kernel.md plus each host adapter,
# validates the skill tree, and assembles dist/plugin/ — the flattened plugin
# that `claude plugin eval` runs against (see specs/nzt-core.md, D23).
# Usage: install/build.sh [out-dir]   (default: <repo>/dist)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="${1:-$root/dist}"
mkdir -p "$out"

status=0

# --- instruction files -------------------------------------------------------

build() {
  local file="$1" adapter="$2" path="$out/$1" lines
  {
    echo "<!-- nzt:start -->"
    cat "$root/core/kernel.md"
    echo
    cat "$root/core/$adapter"
    echo "<!-- nzt:end -->"
  } > "$path"

  lines="$(wc -l < "$path" | tr -d ' ')"
  printf '%-10s %4s lines\n' "$file" "$lines"
  if [ "$lines" -gt 200 ]; then
    echo "WARNING: $file is over the 200-line budget ($lines lines)." >&2
    status=1
  fi
}

build CLAUDE.md adapter-claude.md
build AGENTS.md adapter-codex.md

# --- skill tree --------------------------------------------------------------

plugin="$out/plugin"
rm -rf "$plugin"
mkdir -p "$plugin/.claude-plugin" "$plugin/skills"

listing=0

# check_skill <SKILL.md> <label> <expected name>: the frontmatter, the 200-line budget,
# and each reference's budget, contents list and row (D50). Adds to $listing.
check_skill() {
  local file="$1" rel="$2" expected="$3" front name desc lines dir
  front="$(sed -n '1,/^---$/!d;p' "$file")"
  name="$(printf '%s' "$front" | sed -n 's/^name:[[:space:]]*//p' | head -1)"
  desc="$(printf '%s' "$front" | sed -n 's/^description:[[:space:]]*//p' | head -1)"
  lines="$(wc -l < "$file" | tr -d ' ')"

  listing=$((listing + ${#name} + ${#desc}))
  printf '%-46s %4s lines  %4s chars\n' "$expected" "$lines" "${#desc}"

  if [ "$name" != "$expected" ]; then
    echo "WARNING: $rel : frontmatter name is '$name', path derives '$expected'." >&2
    status=1
  fi
  if [ -z "$desc" ]; then
    echo "WARNING: $rel : missing description." >&2
    status=1
  fi
  if [ "${#desc}" -gt 250 ]; then
    echo "WARNING: $rel : description is ${#desc} chars, over the 250-char limit." >&2
    status=1
  fi
  if [ "$lines" -gt 200 ]; then
    echo "WARNING: $rel : over the 200-line budget ($lines lines)." >&2
    status=1
  fi

  # references: the same 200-line budget, a contents list past 100 lines, and a row
  # in this skill's table — a reference without a row is read by nobody.
  dir="$(dirname "$file")/references"
  [ -d "$dir" ] || return 0
  while IFS= read -r ref; do
    local rname rlines reached index
    rname="$(basename "$ref")"
    rlines="$(wc -l < "$ref" | tr -d ' ')"
    printf '  %-44s %4s lines\n' "references/$rname" "$rlines"
    if [ "$rlines" -gt 200 ]; then
      echo "WARNING: $rel/references/$rname : over the 200-line budget ($rlines lines)." >&2
      status=1
    fi
    if [ "$rlines" -gt 100 ] && ! grep -q '^## Contents' "$ref"; then
      echo "WARNING: $rel/references/$rname : over 100 lines and no '## Contents'." >&2
      status=1
    fi
    # a row in the skill, or in an index reference the skill has a row for (D58)
    reached=0
    if grep -qF "references/$rname" "$file"; then
      reached=1
    else
      for index in "$dir"/*.md; do
        if [ "$index" != "$ref" ] && grep -qF "references/$(basename "$index")" "$file" \
           && grep -qF "references/$rname" "$index"; then
          reached=1
          break
        fi
      done
    fi
    if [ "$reached" -eq 0 ]; then
      echo "WARNING: $rel/references/$rname : no row in the skill's table." >&2
      status=1
    fi
  done < <(find "$dir" -maxdepth 1 -name '*.md' | sort)
}

if [ -d "$root/skills" ]; then
  echo
  count=0
  while IFS= read -r file; do
    count=$((count + 1))
    rel="${file#"$root"/skills/}"
    rel="${rel%/SKILL.md}"
    expected="${rel//\//-}"
    check_skill "$file" "$rel" "$expected"

    # flattened copy, exactly as the installer lays it out (9.1): the skill's own
    # files, plus sibling asset folders — never a child skill's folder.
    src="$(dirname "$file")"
    mkdir -p "$plugin/skills/$expected"
    find "$src" -mindepth 1 -maxdepth 1 -type f -exec cp {} "$plugin/skills/$expected/" ';'
    while IFS= read -r dir; do
      if [ -z "$(find "$dir" -name SKILL.md -print -quit)" ]; then
        cp -R "$dir" "$plugin/skills/$expected/"
      fi
    done < <(find "$src" -mindepth 1 -maxdepth 1 -type d)
  done < <(find "$root/skills" -name SKILL.md | sort)

  echo
  echo "$count skills, ~$listing chars of skill listing (Codex floor: 8000)"
  if [ "$listing" -gt 8000 ]; then
    echo "WARNING: skill listing is over the 8000-char floor. See R1 in specs/nzt-core.md." >&2
  fi
fi

# --- packs -------------------------------------------------------------------
# What `nzt-ai project` installs per project (D88): a pack.json with a description and
# requires that exist, and, when it brings a skill, the same rules as the global ones.
# Their listing is not added to the global one: a project carries only the packs it chose.

if [ -d "$root/packs" ]; then
  echo
  packs=0
  global_listing=$listing
  listing=0
  while IFS= read -r folder; do
    packs=$((packs + 1))
    pack="$(basename "$folder")"
    json="$folder/pack.json"
    if [ ! -f "$json" ]; then
      echo "WARNING: packs/$pack : no pack.json." >&2
      status=1
      continue
    fi
    if ! grep -qE '"description"[[:space:]]*:[[:space:]]*"[^"]+' "$json"; then
      echo "WARNING: packs/$pack : pack.json has no description." >&2
      status=1
    fi
    while IFS= read -r required; do
      if [ -n "$required" ] && [ ! -d "$root/packs/$required" ]; then
        echo "WARNING: packs/$pack : requires '$required', which is not a pack." >&2
        status=1
      fi
    done < <(sed -n 's/.*"requires"[[:space:]]*:[[:space:]]*\[\(.*\)\].*/\1/p' "$json" | tr ',' '\n' | tr -d '" ')
    if [ -f "$folder/SKILL.md" ]; then
      check_skill "$folder/SKILL.md" "packs/$pack" "nzt-$pack"
    elif ! grep -q '"mcp"' "$json"; then
      echo "WARNING: packs/$pack : brings neither a skill nor an MCP server." >&2
      status=1
    fi
  done < <(find "$root/packs" -mindepth 1 -maxdepth 1 -type d | sort)

  echo
  echo "$packs packs, ~$listing chars of skill listing if every one is installed"
  listing=$global_listing
fi

# --- plugin for `claude plugin eval` -----------------------------------------

cat > "$plugin/.claude-plugin/plugin.json" <<'JSON'
{
  "name": "nzt",
  "description": "NZT: the skill set under evaluation. Built output — edit skills/ in the repo, not here.",
  "version": "4.0.0",
  "license": "MIT",
  "author": { "name": "NZT" }
}
JSON

if [ -d "$root/evals" ]; then
  cp -R "$root/evals" "$plugin/evals"
  rm -rf "$plugin/evals/results"
  mkdir -p "$plugin/evals/_fixtures"
  cp "$out/CLAUDE.md" "$plugin/evals/_fixtures/CLAUDE.md"
  # the packs, for fixtures that seed a project with its pack skills (_fixtures/packs.sh)
  cp -R "$root/packs" "$plugin/evals/_fixtures/packs"

  cases=0
  while IFS= read -r case; do
    cases=$((cases + 1))
    rel="${case#"$plugin"/evals/}"
    for key in '^schema_version:' '^name:' '^ *prompt:' '^graders:'; do
      if ! grep -qE "$key" "$case"; then
        echo "WARNING: evals/$rel : no key matching '$key'." >&2
        status=1
      fi
    done
    script="$(sed -n 's/^ *scaffold_script:[[:space:]]*//p' "$case" | head -1)"
    if [ -n "$script" ] && [ ! -f "$(dirname "$case")/$script" ]; then
      echo "WARNING: evals/$rel : scaffold_script '$script' is missing." >&2
      status=1
    fi
  done < <(find "$plugin/evals" -name case.yaml | sort)

  echo "plugin -> $plugin  ($cases eval cases, kernel fixture refreshed)"
fi

echo "-> $out"
exit $status
