#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/project.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "F-001: confirmación de pedidos" \
  "Escribir el caso de uso que confirma un pedido"
