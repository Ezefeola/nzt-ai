#!/usr/bin/env bash
# Proves that a leaf moved to references/ lost nothing (D50). Each reference is
# compared with the SKILL.md it came from at <base> — the leaf
# skills/<router>/<x>/SKILL.md became skills/<router>/references/<x>.md — and the
# only differences allowed are the mechanical ones:
#   removed: the frontmatter, the R2 line ("Load `nzt-...` before applying this.",
#            "If you did not arrive here from ..."), and blank lines;
#   added:   a "## Contents" block (the heading and its "- " items), and blank lines.
# A "load `nzt-...`" turned into a mention (rule 3) is not accepted automatically:
# the script prints it and fails, and that line is reviewed by hand.
# A reference with no leaf at <base> is new content (D51), reported and skipped.
# Usage: install/check-references.sh [base]   (default: main)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
base="${1:-main}"
cd "$root"

r2='^(Load .* before applying this[.]|If you did not arrive here from .*, load it first[.])$'
status=0
moved=0
fresh=0

while IFS= read -r ref; do
  routerdir="$(dirname "$(dirname "$ref")")"
  leaf="$(basename "$ref" .md)"
  old="$routerdir/$leaf/SKILL.md"

  if ! git cat-file -e "$base:$old" 2>/dev/null; then
    echo "new   $ref (no $old at $base)"
    fresh=$((fresh + 1))
    continue
  fi
  moved=$((moved + 1))

  bad="$(diff --old-line-format='-%L' --new-line-format='+%L' --unchanged-line-format='' \
      <(git show "$base:$old" | tr -d '\r' | awk 'NR==1 && /^---$/ {f=1; next} f && /^---$/ {f=0; next} !f') \
      <(tr -d '\r' < "$ref") \
    | awk -v r2="$r2" '
        /^[-+][[:space:]]*$/ { next }
        /^-/ { line = substr($0, 2); if (line ~ r2) next; print; next }
        /^\+## Contents$/ { inside = 1; next }
        /^\+- / && inside { next }
        /^\+/ { inside = 0; print }
      ' || true)"

  if [ -n "$bad" ]; then
    echo "FAIL  $ref <- $base:$old"
    printf '%s\n' "$bad" | sed 's/^/      /'
    status=1
  else
    echo "ok    $ref <- $base:$old"
  fi
done < <(find skills -path '*/references/*.md' | sort)

echo
echo "$moved moved, $fresh new, base $base"
exit $status
