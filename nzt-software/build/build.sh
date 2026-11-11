#!/usr/bin/env bash
# Builds the skill nzt of each host from core/skill-nzt.md, core/kernel.md and the host's
# adapter (D95), validates the skill tree, and assembles dist/plugin/ — the flattened plugin
# that `claude plugin eval` runs against (see Plan/specs/nzt-core/decisions.md, D23).
# Usage: nzt-software/build/build.sh [out-dir]   (default: nzt-software/dist)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # nzt-software/ (D98)
method="$root/method"
out="${1:-$root/dist}"
mkdir -p "$out"

status=0

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

  # references in subfolders (`dotnet/`, `ddd/`…): the same budgets, and a row naming
  # `<folder>/<file>` in the skill itself — one level deep, never through an index.
  while IFS= read -r ref; do
    local sub slines
    sub="$(basename "$(dirname "$ref")")/$(basename "$ref")"
    slines="$(wc -l < "$ref" | tr -d ' ')"
    printf '  %-44s %4s lines\n' "references/$sub" "$slines"
    if [ "$slines" -gt 200 ]; then
      echo "WARNING: $rel/references/$sub : over the 200-line budget ($slines lines)." >&2
      status=1
    fi
    if [ "$slines" -gt 100 ] && ! grep -q '^## Contents' "$ref"; then
      echo "WARNING: $rel/references/$sub : over 100 lines and no '## Contents'." >&2
      status=1
    fi
    if ! grep -qF "\`$sub\`" "$file"; then
      echo "WARNING: $rel/references/$sub : no row in the skill's table." >&2
      status=1
    fi
  done < <(find "$dir" -mindepth 2 -maxdepth 2 -name '*.md' | sort)
}

if [ -d "$method/skills" ]; then
  echo
  count=0
  while IFS= read -r file; do
    count=$((count + 1))
    rel="${file#"$method"/skills/}"
    rel="${rel%/SKILL.md}"
    expected="${rel//\//-}"
    check_skill "$file" "$rel" "$expected"

    # flattened copy, as the installer lays it out (9.1): the skill's own files, plus
    # sibling asset folders — never a child skill's folder. In the plugin the skill drops
    # its nzt- prefix, folder and name: (D97): nzt-build is nzt-software:build.
    src="$(dirname "$file")"
    short="${expected#nzt-}"
    mkdir -p "$plugin/skills/$short"
    find "$src" -mindepth 1 -maxdepth 1 -type f -exec cp {} "$plugin/skills/$short/" ';'
    while IFS= read -r dir; do
      if [ -z "$(find "$dir" -name SKILL.md -print -quit)" ]; then
        cp -R "$dir" "$plugin/skills/$short/"
      fi
    done < <(find "$src" -mindepth 1 -maxdepth 1 -type d)
    sed "1,/^---\$/ s/^name:[[:space:]]*$expected\$/name: $short/" "$file" > "$plugin/skills/$short/SKILL.md"
  done < <(find "$method/skills" -name SKILL.md | sort)

  echo
  echo "$count skills, ~$listing chars of skill listing (Codex floor: 8000)"
  if [ "$listing" -gt 8000 ]; then
    echo "WARNING: skill listing is over the 8000-char floor. See R1 in Plan/specs/nzt-core/decisions.md." >&2
  fi
fi

# --- the plugin: manifest, the method inside nzt-software:nzt, subagents (Plan/specs/nzt-plugin.md) ---
# NZT's version lives in nzt-software/VERSION (D100): one number for the plugin and its tag.

version="$(tr -d ' \r\n' < "$root/VERSION" 2>/dev/null || true)"
if [ -z "$version" ]; then
  echo "WARNING: no version in nzt-software/VERSION." >&2
  status=1
fi

cat > "$plugin/.claude-plugin/plugin.json" <<JSON
{
  "name": "nzt-software",
  "description": "NZT for software: a way of working. Its method lives in the nzt skill, which loads first in every session.",
  "version": "$version",
  "license": "MIT",
  "author": { "name": "Ezefeola", "url": "https://github.com/Ezefeola" },
  "repository": "https://github.com/Ezefeola/nzt-ai"
}
JSON

# The method inside the skill nzt, the same way for every host (QT-109, D95): the shared
# frontmatter, the kernel and the host's adapter are the skill's body, and what skills/nzt
# does today becomes its reference entry.md. Its description is what makes it load first
# in every session; nothing else loads it. One adapter serves Claude Code and Codex (D100).
# build_nzt <dest folder> <adapter> <label>
build_nzt() {
  local dest="$1" adapter="$2" label="$3"
  rm -rf "$dest"
  mkdir -p "$dest/references"
  sed '1,/^---$/d' "$method/skills/nzt/SKILL.md" > "$dest/references/entry.md"
  {
    cat "$method/core/skill-nzt.md"
    echo
    cat "$method/core/kernel.md"
    echo
    cat "$method/core/$adapter"
  } > "$dest/SKILL.md"
  check_skill "$dest/SKILL.md" "$label" "nzt"
}
build_nzt "$plugin/skills/nzt" adapter-plugin.md "plugin skills/nzt"
rm -rf "$out/claude-code" "$out/codex" "$out/CLAUDE.md" "$out/AGENTS.md"

# Subagents: Claude Code reads their skills: list, not the model, so the build gives it
# the plugin's names (QT-103), and each drops its nzt- prefix like the skills (D97):
# nzt-explorer is nzt-software:explorer and loads nzt-software:research.
mkdir -p "$plugin/agents"
for agent in "$method"/agents/*.md; do   # Claude Code only: Codex plugins bring no subagents
  short="$(basename "$agent")"
  short="${short#nzt-}"
  sed -e '2,/^---$/ s/^\([[:space:]]*-[[:space:]]*\)nzt-/\1nzt-software:/' \
      -e '2,/^---$/ s/^name:[[:space:]]*nzt-/name: /' "$agent" > "$plugin/agents/$short"
done
echo "plugin $version: skills/nzt with the kernel, $(find "$plugin/agents" -name '*.md' | wc -l | tr -d ' ') subagents"

# --- evals for `claude plugin eval` ------------------------------------------

if [ -d "$root/evals" ]; then
  cp -R "$root/evals" "$plugin/evals"
  rm -rf "$plugin/evals/results"
  mkdir -p "$plugin/evals/_fixtures"

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

  echo "plugin -> $plugin  ($cases eval cases)"
fi

echo "-> $out"
exit $status
