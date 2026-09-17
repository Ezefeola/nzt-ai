#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/project.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "F-001: alta de clientes" \
  "Escribir la entidad Customer con su alta"
