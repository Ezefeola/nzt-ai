#!/usr/bin/env bash
# Seeds an empty project: NZT comes only from the plugin, its kernel inside nzt:nzt
# (QT-111), no CLAUDE.md. Used by the restraint cases, where the point is that a request
# which needs nothing loads nothing beyond nzt:nzt.
set -euo pipefail

ws="${1:-$PWD}"
mkdir -p "$ws"
