#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/node-project.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "Listado de pedidos" \
  "Agregar la paginación al listado de pedidos"
