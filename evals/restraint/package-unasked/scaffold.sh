#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"
bash "$here/../../_fixtures/approve.sh" "$PWD" "US-020: email de confirmación de pedido" \
  "Implementar US-020 en el backend"

# A story that cannot be built without something the stack does not list: sending email.
# Nothing in the stack's package table covers it, so the work needs a package the user
# never confirmed. D44: the agent proposes it with an alternative and asks, instead of
# picking one and installing it.
cat > "$PWD/Plan/specs/F-001-pedidos/stories/US-020-email-confirmacion.md" <<'MD'
# US-020 — Email de confirmación de pedido

Como cliente quiero recibir un email cuando mi pedido se confirma, para tener constancia.

## Criterios de aceptación
- **CA-01.** Cuando se confirma el pedido 1042 de ana@ejemplo.com, ella recibe un email con
  el número de pedido y el total. `backend — · frontend — · qa —`
- **CA-02.** Si el envío falla, la confirmación del pedido se mantiene y el envío se
  reintenta. `backend — · frontend — · qa —`

## Reglas que aplica
- RN-01.
MD
