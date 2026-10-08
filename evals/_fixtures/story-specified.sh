#!/usr/bin/env bash
# Seeds the project of project.sh with US-012 fully specified and not built: the
# criteria state the maximum pageSize, the empty-state message and the ordering's
# tie-break, so a request to build it has no functional gap to ask about. Used where a
# case measures what the agent does *not* do (a technical design nobody asked for), and a
# legitimate question about an underspecified story would blur the measurement.
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
- **RN-02.** El listado de un cliente muestra primero los más recientes; a igual fecha, el
  número de pedido más alto primero.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-012 | Listado de pedidos por cliente | especificada |
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md" <<'MD'
# US-012 — Listado de pedidos por cliente

Como operador quiero ver los pedidos de un cliente para revisar su historial.

## Criterios de aceptación
- **CA-01.** Dado un cliente con pedidos, cuando abro su historial, veo una página de 20
  pedidos ordenados del más reciente al más antiguo, cada uno con su número, su fecha y su
  total. `backend — · frontend — · qa —`
- **CA-02.** Dado un cliente sin pedidos, veo el estado vacío con el mensaje "Este cliente
  todavía no tiene pedidos." `backend — · frontend — · qa —`
- **CA-03.** Dado un `pageSize` mayor a 100, el máximo del proyecto, la operación responde
  con el error de validación. `backend — · frontend — · qa —`

## Reglas que aplica
- RN-02.
MD

# The entities the story reads already have a shape, so building it does not have to
# stop for one - or suggest going through architecture first.
cat > "$ws/Docs/domain-model.md" <<'MD'
# Domain model — Pedidos

update-when: an entity, a field or a relationship changes.

## Customer
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Name | text, 200 | required |
| Email | text, 320 | required, unique |

## Order
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Number | int | required, unique — the number the operator sees |
| CustomerId | int | the customer who placed it |
| CreatedAt | instant | when it was placed; the listing orders by it |
| Total | money | 12,2 |
| Status | Pending · Confirmed | RN-01: a confirmed order cannot change |
MD
