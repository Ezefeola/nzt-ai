#!/usr/bin/env bash
# Proves that a leaf moved to references/ lost nothing (D50). Each reference is
# compared with the SKILL.md it came from at <base> — the leaf
# skills/<router>/<x>/SKILL.md became skills/<router>/references/<x>.md — and the
# only differences allowed are the mechanical ones:
#   removed: the frontmatter, the R2 line ("Load `nzt-...` before applying this.",
#            "If you did not arrive here from ..."), also wrapped as "Load `nzt-...`
#            ... before" + "applying this.", and blank lines;
#   added:   a "## Contents" block (the heading and its "- " items), and blank lines.
# A line removed and added back with the same text is diff alignment and cancels out.
# A leaf nested under a sub-router (<router>/diagrams/behavior/SKILL.md) is found for
# references/diagrams-behavior.md by trying each dash as the folder separator.
# A "load `nzt-...`" turned into a mention (rule 3) is not accepted automatically:
# the script prints it and fails, and that line is reviewed by hand.
# A leaf split in two (references/<x>.md + references/<x>-<part>.md) is compared against
# the parts concatenated; the part's own "# " title is the only line it may add.
# A reference with no leaf at <base> is new content (D51), reported and skipped.
# Usage: install/check-references.sh [base]   (default: main)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
base="${1:-main}"
cd "$root"

r2='^(Load .* before applying this[.]|Load `nzt-.* (before|and)|applying this[.]|`nzt-[^`]*` before applying this[.]|If you did not arrive here from .*, load it first[.])$'
status=0
moved=0
fresh=0

# Prints the leaf at <base> that references/<leaf>.md came from, or nothing.
old_leaf() {
  local routerdir="$1" leaf="$2" old rest head=""
  old="$routerdir/$leaf/SKILL.md"
  # A leaf that was nested under a sub-router (diagrams/behavior/SKILL.md) became
  # diagrams-behavior.md: try each dash as the folder separator, first match wins.
  rest="$leaf"
  while ! git cat-file -e "$base:$old" 2>/dev/null && [[ "$rest" == *-* ]]; do
    head="${head:+$head-}${rest%%-*}"
    rest="${rest#*-}"
    old="$routerdir/$head/$rest/SKILL.md"
  done
  if git cat-file -e "$base:$old" 2>/dev/null; then echo "$old"; fi
}

# A leaf over 200 lines once it has its Contents is split (rule 3): references/<leaf>.md
# keeps the start and references/<leaf>-<part>.md continues it, with a "# " title of its
# own. A part has no leaf of its own at <base>; it is checked together with <leaf>.md,
# whose leaf is compared against the parts concatenated, each part without its title.
parts_of() {
  local routerdir="$1" leaf="$2" f
  for f in "$routerdir/references/$leaf"-*.md; do
    [ -e "$f" ] || continue
    [ -z "$(old_leaf "$routerdir" "$(basename "$f" .md)")" ] && echo "$f"
  done
  return 0
}

while IFS= read -r ref; do
  routerdir="$(dirname "$(dirname "$ref")")"
  leaf="$(basename "$ref" .md)"
  old="$(old_leaf "$routerdir" "$leaf")"

  if [ -z "$old" ]; then
    owner=""
    p="$leaf"
    while [[ "$p" == *-* ]]; do
      p="${p%-*}"
      if [ -f "$routerdir/references/$p.md" ] && [ -n "$(old_leaf "$routerdir" "$p")" ]; then
        owner="$p"
        break
      fi
    done
    if [ -n "$owner" ]; then
      echo "part  $ref (continues references/$owner.md, checked with it)"
    else
      echo "new   $ref (no leaf for it at $base)"
      fresh=$((fresh + 1))
    fi
    continue
  fi
  moved=$((moved + 1))
  parts="$(parts_of "$routerdir" "$leaf")"

  bad="$(diff --old-line-format='-%L' --new-line-format='+%L' --unchanged-line-format='' \
      <(git show "$base:$old" | tr -d '\r' | awk 'NR==1 && /^---$/ {f=1; next} f && /^---$/ {f=0; next} !f') \
      <(tr -d '\r' < "$ref"; for part in $parts; do tr -d '\r' < "$part" | awk 'NR==1 && /^# / {next} 1'; done) \
    | awk -v r2="$r2" '
        /^[-+][[:space:]]*$/ { next }
        /^-/ { line = substr($0, 2); if (line ~ r2) next; print; next }
        /^\+## Contents$/ { inside = 1; next }
        /^\+- / && inside { next }
        /^\+/ { inside = 0; print }
      ' \
    | awk '
        # The same line removed and added back is diff alignment, not a change: inserting
        # the Contents block can make diff pair a line as -X/+X. Cancel identical pairs;
        # any text that differs still shows.
        { kind = substr($0, 1, 1); text = substr($0, 2); line[++n] = $0
          if (kind == "-") rem[text]++; else add[text]++ }
        END {
          for (i = 1; i <= n; i++) {
            kind = substr(line[i], 1, 1); text = substr(line[i], 2)
            pairs = (rem[text] < add[text]) ? rem[text] : add[text]
            if (kind == "-" && dropped_rem[text] < pairs) { dropped_rem[text]++; continue }
            if (kind == "+" && dropped_add[text] < pairs) { dropped_add[text]++; continue }
            print line[i]
          }
        }
      ' || true)"

  if [ -n "$bad" ]; then
    echo "FAIL  $ref <- $base:$old"
    printf '%s\n' "$bad" | sed 's/^/      /'
    status=1
  else
    echo "ok    $ref${parts:+ + $(echo $parts | xargs -n1 basename | paste -sd' ')} <- $base:$old"
  fi
done < <(find skills -path '*/references/*.md' | sort)

echo
echo "$moved moved, $fresh new, base $base"
exit $status
