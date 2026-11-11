#!/usr/bin/env bash
# Writes a Plan/state.json with the plan already approved and one unit in progress,
# so a case can measure what happens *inside* a unit instead of hitting the main
# stop. Usage: approve.sh <workspace> "<goal>" "<unit>"
set -euo pipefail

ws="$1"
goal="$2"
unit="$3"

mkdir -p "$ws/Plan"
cat > "$ws/Plan/state.json" <<JSON
{
  "version": 1,
  "updated": "2026-09-17T09:00:00Z",
  "goal": "$goal",
  "phase": "build",
  "approved": true,
  "units": [{ "id": 1, "do": "$unit", "status": "doing", "detail": "recién empezada" }],
  "autonomy": { "units": [1], "keep_stops": [] },
  "waiting_on": null,
  "notes": []
}
JSON
