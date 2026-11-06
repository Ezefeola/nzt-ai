#!/usr/bin/env bash
set -euo pipefail
fixtures="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures"
bash "$fixtures/project.sh" "$PWD"
bash "$fixtures/no-kernel.sh" "$PWD"
