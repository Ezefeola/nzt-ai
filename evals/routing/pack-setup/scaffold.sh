#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"

# A fresh clone: tech.md lists dotnet, ddd and blazor, and none of them is installed - the
# project skills and .nzt/ are not in the repository yet.
rm -rf "$PWD/.claude" "$PWD/.nzt"
