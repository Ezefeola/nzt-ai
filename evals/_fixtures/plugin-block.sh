#!/usr/bin/env bash
# Swaps the workspace's CLAUDE.md for the block /nzt:setup writes (the plugin's adapter,
# with the nzt:plugin line), after another fixture seeded the rest. Without an argument
# list, seeds only the block. Used by the plugin/ cases (specs/nzt-plugin.md).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

cp "$here/CLAUDE.plugin.md" "$ws/CLAUDE.md"
