#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/stack-ready.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "US-012: listado de pedidos por cliente" \
  "Escribir la lectura paginada del listado de pedidos"
