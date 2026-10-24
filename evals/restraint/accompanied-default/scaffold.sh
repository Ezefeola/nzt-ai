#!/usr/bin/env bash
set -euo pipefail
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures/project.sh" "$PWD"

# The plan is approved and no batch was selected: accompanied, the default (D79). Two units
# that read code and need no answer from the user, so the only stop is the kernel's.
cat > "$PWD/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-10-24T18:00:00Z",
  "goal": "Adoptar NZT en el detalle de pedido: specs desde el código",
  "phases": [
    { "name": "analysis", "status": "doing", "units": [
      { "id": 1, "do": "Ingeniería inversa del detalle de pedido en Pedidos.Api", "status": "todo" },
      { "id": 2, "do": "Ingeniería inversa del detalle de pedido en Pedidos.Web", "status": "todo" } ] }
  ],
  "approved": true,
  "waiting_on": null,
  "notes": []
}
JSON
