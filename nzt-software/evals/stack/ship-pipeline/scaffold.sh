#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/project.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "CI de Pedidos.Api" \
  "Workflow de CI con los gates de Pedidos.Api"
