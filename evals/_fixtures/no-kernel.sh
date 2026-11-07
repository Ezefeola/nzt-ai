#!/usr/bin/env bash
# Removes the workspace's CLAUDE.md, for the skill/ cases (QT-109): the plugin carries the
# kernel inside nzt-software:nzt, so a CLAUDE.md with the kernel would measure the old product. Run
# after another fixture.
set -euo pipefail
ws="${1:-$PWD}"
rm -f "$ws/CLAUDE.md"
