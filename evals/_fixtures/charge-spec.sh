#!/usr/bin/env bash
# Seeds the project of project.sh with F-002, the card charge at order confirmation,
# specified and not designed: business rules and one story with its criteria. The
# business is decided; the technical questions - who calls the gateway, what happens
# when it is slow or down, what is persisted and when, whether confirming twice is safe -
# are left for the design to derive. Without this spec, asking for the charge's design
# makes the agent stop for analysis (a design never introduces behavior), and the case
# measures that rule instead of the design protocol.
#
# Sourced by a case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

bash "$here/project.sh" "$ws"

cat > "$ws/Docs/product.md" <<'MD'
# Pedidos — producto
Un comercio carga pedidos, los confirma y sigue su estado. Dos componentes:
`Pedidos.Api` (backend) y `Pedidos.Web` (frontend).

## Sistemas externos
- **PagoSur**, la pasarela de pagos del comercio: proveedor externo con API HTTP. Su
  documentación, tal como la publica el proveedor, está en `Docs/integrations/pagosur.md`.
MD

# Where the card token lives is a modelling fact, not a design question: the customer
# already has it.
cat > "$ws/Docs/domain-model.md" <<'MD'
# Domain model — Pedidos

update-when: an entity, a field or a relationship changes.

## Customer
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Name | text, 200 | required |
| CardToken | text, 64 | PagoSur's `card_token` for the customer's saved card; null when there is none |

## Order
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Number | int | required, unique |
| CustomerId | int | the customer who placed it |
| Total | money | 12,2 |
| Status | Pending · Confirmed | RN-01 of F-001: a confirmed order cannot change |
MD

# The provider's documentation, as the workspace's authoritative source: the case has no
# network, and a checkable fact about the gateway has to be researched, never asked.
mkdir -p "$ws/Docs/integrations"
cat > "$ws/Docs/integrations/pagosur.md" <<'MD'
# PagoSur — API de cobros v3 (extracto de la documentación del proveedor)

Copiado de la documentación pública de PagoSur el 2026-09-10.

## Cobrar con una tarjeta guardada
`POST /v3/charges` con `card_token`, `amount` (centavos), `currency` (`ARS`) y
`external_reference` (la referencia del comercio).

- Header `Idempotency-Key` (obligatorio): la misma clave dentro de 24 h devuelve el mismo
  resultado y no vuelve a cobrar.
- Respuesta síncrona: `201` con `status: approved`, o `402` con `status: rejected` y
  `rejection_reason` (`insufficient_funds`, `card_expired`, `card_blocked`, `generic`).
- Tiempo de respuesta: p99 de 4 s. El proveedor recomienda un timeout de cliente de 10 s.
- Un timeout no dice si se cobró: el estado se consulta con
  `GET /v3/charges?external_reference=<ref>`.
- Errores `5xx`: reintentar con la misma `Idempotency-Key`.

## Tarjetas de prueba (sandbox)
- `tok_approved`: aprueba siempre.
- `tok_insufficient`: rechaza con `insufficient_funds`.
MD

mkdir -p "$ws/Plan/specs/F-002-cobro/stories"

cat > "$ws/Plan/specs/F-002-cobro/feature.md" <<'MD'
# F-002 — Cobro con tarjeta al confirmar

## Alcance
Cobrar el pedido con tarjeta, a través de PagoSur, en el momento en que el operador lo
confirma. La tarjeta es la que el cliente ya tiene guardada en PagoSur: el cliente tiene
su `card_token`, y nadie carga datos de tarjeta en Pedidos. Desde F-002, confirmar un
pedido es siempre confirmarlo cobrándolo: la confirmación sin cobro de F-001 deja de
existir.

**Fuera de alcance:** reembolsos, cobros parciales, cuotas y el alta de la tarjeta.

## Reglas de negocio
- **RN-01.** Un pedido queda confirmado sólo si la pasarela aprobó su cobro.
- **RN-02.** Si la pasarela rechaza el cobro, el pedido sigue pendiente y el operador ve el
  motivo del rechazo.
- **RN-03.** Un pedido no se cobra dos veces.
- **RN-04.** El importe que se cobra es el total del pedido en el momento de confirmar.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-020 | Confirmar un pedido cobrándolo con tarjeta | especificada |
MD

cat > "$ws/Plan/specs/F-002-cobro/stories/US-020-confirmar-con-cobro.md" <<'MD'
# US-020 — Confirmar un pedido cobrándolo con tarjeta

Como operador quiero confirmar un pedido cobrándolo con la tarjeta del cliente para que
quede pago y confirmado en un solo paso.

## Criterios de aceptación
- **CA-01.** Dado el pedido 1042 pendiente por $ 18.500 y una tarjeta que la pasarela
  aprueba, cuando lo confirmo, el pedido queda confirmado y pagado por $ 18.500.
  `backend — · frontend — · qa —`
- **CA-02.** Dado el pedido 1043 pendiente y una tarjeta que la pasarela rechaza por
  "fondos insuficientes", cuando lo confirmo, el pedido sigue pendiente y veo "El cobro fue
  rechazado: fondos insuficientes". `backend — · frontend — · qa —`
- **CA-03.** Dado el pedido 1042 ya confirmado y pagado, cuando intento confirmarlo otra
  vez, no se genera un segundo cobro y veo que ya está confirmado.
  `backend — · frontend — · qa —`

## Reglas que aplica
- RN-01, RN-02, RN-03, RN-04 de F-002; RN-01 de F-001.
MD
