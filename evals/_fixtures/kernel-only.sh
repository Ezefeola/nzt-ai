#!/usr/bin/env bash
# Seeds only the kernel: an empty project where NZT is fully installed and in
# context. Used by the restraint cases, where the point is that a request which
# needs nothing must load nothing.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

cp "$here/CLAUDE.md" "$ws/CLAUDE.md"
