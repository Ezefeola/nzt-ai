#!/usr/bin/env bash
# Seeds the project of project.sh with F-001 finished: every criterion verified by
# area, an approved change still carrying its markers, and no history file yet.
# It is the state a close has to recognise - accepted work with leftovers.
#
# Sourced by a case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

bash "$here/project.sh" "$ws"

cat > "$ws/Plan/specs/F-001-pedidos/feature.md" <<'MD'
# F-001 — Pedidos

## Alcance
Alta, listado y confirmación de pedidos.

## Reglas de negocio
- **RN-01.** Un pedido confirmado no se puede modificar.
- **RN-02.** El listado de un cliente muestra primero los más recientes.
- **RN-03.** · [remove] · backend ✓
  Se retira que el listado incluya los pedidos anulados.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-012 | Listado de pedidos por cliente | implementada |
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md" <<'MD'
# US-012 — Listado de pedidos por cliente

Como operador quiero ver los pedidos de un cliente para revisar su historial.

## Criterios de aceptación
- [x] **CA-01.** Dado un cliente con pedidos, cuando abro su historial, veo una página de
  20 pedidos ordenados del más reciente al más antiguo. `backend ✓ · frontend ✓ · qa ✓`
- [x] **CA-02.** Dado un cliente sin pedidos, veo el estado vacío con su mensaje.
  `backend ✓ · frontend ✓ · qa ✓`
- [x] **CA-03.** Dado un `pageSize` mayor al máximo del proyecto, la operación responde con
  el error de validación. `backend ✓ · frontend ✓ · qa ✓`
- [x] **CA-04.** · [modify] Dado un cliente con pedidos anulados, cuando abro su historial,
  **no** los veo. `backend ✓ · frontend ✓ · qa ✓`

## Reglas que aplica
- RN-02, RN-03.
MD

mkdir -p "$ws/Plan/specs/F-001-pedidos/testing"
cat > "$ws/Plan/specs/F-001-pedidos/testing/README.md" <<'MD'
# Pruebas — F-001

| Historia | Última ejecución | Resultado | Bugs abiertos |
|---|---|---|---|
| US-012 | 2026-09-16 | pasó | ninguno |

Criterios sin escenario: ninguno.
Automatizado: nada (el stack no adoptó E2E).
MD

cat > "$ws/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-09-16T18:00:00Z",
  "goal": "F-001 Pedidos: listado por cliente",
  "phase": "verify",
  "approved": true,
  "units": [
    { "id": 1, "do": "Implementar US-012", "status": "done" },
    { "id": 2, "do": "Probar US-012", "status": "done" }
  ],
  "waiting_on": null,
  "notes": []
}
JSON
