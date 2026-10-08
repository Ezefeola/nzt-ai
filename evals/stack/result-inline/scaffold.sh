#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/stack-ready.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "US-013: confirmar un pedido" \
  "Escribir el caso de uso que confirma un pedido"
