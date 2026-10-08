#!/usr/bin/env bash
set -euo pipefail
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures/story-specified.sh" "$PWD"

# The plan that builds US-012 is already approved, so the request is the next unit of an
# agreed plan and its route is nzt-build. Without it the work spans build and verify, and
# the set rightly plans and stops in nzt-plan instead.
cat > "$PWD/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-09-16T18:00:00Z",
  "goal": "F-001 Pedidos: listado por cliente",
  "phase": "build",
  "approved": true,
  "units": [
    { "id": 1, "do": "Implementar US-012 en Pedidos.Api y Pedidos.Web", "status": "todo" },
    { "id": 2, "do": "Probar US-012", "status": "todo" }
  ],
  "waiting_on": null,
  "notes": []
}
JSON
