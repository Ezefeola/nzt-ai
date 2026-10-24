#!/usr/bin/env bash
set -euo pipefail
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures/story-built.sh" "$PWD"

# The listing exists and its run is closed, so a date filter is an improvement on a screen
# that already exists: standard size (D78), not a new story built from scratch.
mkdir -p "$PWD/Docs/Domain"
cat > "$PWD/Docs/Domain/glossary.md" <<'MD'
# Glossary — Pedidos

## Pedido · `Order`
A purchase a customer confirmed, with its date, total and status.

## Cliente · `Customer`
The person or company the order belongs to.
MD
cat > "$PWD/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-10-20T18:00:00Z",
  "goal": "F-001 Pedidos: listado por cliente",
  "phases": [
    { "name": "build", "status": "done", "units": [
      { "id": 1, "do": "Construir US-012 en Pedidos.Api y Pedidos.Web", "status": "done" } ] },
    { "name": "verify", "status": "done", "units": [
      { "id": 2, "do": "QA de US-012", "status": "done" } ] }
  ],
  "approved": true,
  "waiting_on": null,
  "notes": []
}
JSON
# Its QA ran and passed, so the story reads finished.
sed -i 's/qa —/qa ✓/g' "$PWD/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md"
