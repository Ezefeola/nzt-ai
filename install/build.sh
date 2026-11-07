#!/usr/bin/env bash
# Builds the skill nzt of each host from core/skill-nzt.md, core/kernel.md and the host's
# adapter (D95), validates the skill tree, and assembles dist/plugin/ — the flattened plugin
# that `claude plugin eval` runs against (see specs/nzt-core.md, D23).
# Usage: install/build.sh [out-dir]   (default: <repo>/dist)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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

# --- the plugin: manifest, the method inside nzt:nzt, subagents (specs/nzt-plugin.md) ---
# NZT's version is the installer's (D24): one number for nzt-ai and the plugin.

version="$(sed -n 's:.*<Version>\(.*\)</Version>.*:\1:p' "$root/installer/src/Nzt.Cli/Nzt.Cli.csproj" | head -1)"
if [ -z "$version" ]; then
  echo "WARNING: no <Version> in installer/src/Nzt.Cli/Nzt.Cli.csproj." >&2
  status=1
fi

cat > "$plugin/.claude-plugin/plugin.json" <<JSON
{
  "name": "nzt",
  "description": "NZT: a way of working for any product. Its method lives in the nzt skill, which loads first in every session.",
  "version": "$version",
  "license": "MIT",
  "author": { "name": "Ezefeola", "url": "https://github.com/Ezefeola" },
  "repository": "https://github.com/Ezefeola/nzt-ai"
}
JSON

# The method inside the skill nzt, the same way for every host (QT-109, D95): the shared
# frontmatter, the kernel and the host's adapter are the skill's body, and what skills/nzt
# does today becomes its reference entry.md. Its description is what makes it load first
# in every session; nothing else loads it. nzt-ai installs the same files, byte for byte.
# build_nzt <dest folder> <adapter> <label>
build_nzt() {
  local dest="$1" adapter="$2" label="$3"
  rm -rf "$dest"
  mkdir -p "$dest/references"
  sed '1,/^---$/d' "$root/skills/nzt/SKILL.md" > "$dest/references/entry.md"
  {
    cat "$root/core/skill-nzt.md"
    echo
    cat "$root/core/kernel.md"
    echo
    cat "$root/core/$adapter"
  } > "$dest/SKILL.md"
  check_skill "$dest/SKILL.md" "$label" "nzt"
}
build_nzt "$plugin/skills/nzt" adapter-claude-skill.md "plugin skills/nzt"
build_nzt "$out/claude-code/nzt" adapter-claude.md "claude-code nzt"
build_nzt "$out/codex/nzt" adapter-codex.md "codex nzt"
rm -f "$out/CLAUDE.md" "$out/AGENTS.md"

# Subagents: Claude Code reads their skills: list, not the model, so the build gives it
# the plugin's names (QT-103).
mkdir -p "$plugin/agents"
for agent in "$root"/agents/*.md; do
  sed '2,/^---$/ s/^\([[:space:]]*-[[:space:]]*\)nzt-/\1nzt:nzt-/' "$agent" > "$plugin/agents/$(basename "$agent")"
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
