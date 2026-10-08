#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/stack-ready.sh" "$PWD"
bash "$fixtures/approve.sh" "$PWD" "US-030: alta de cliente" \
  "Escribir la entidad Customer con su alta"
