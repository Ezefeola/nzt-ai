#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"

# Pedidos.Api in the shape D42 leaves behind: the test framework is named
# and nothing else, and no `Test levels` opt-in was ever written. An absent opt-in
# enables no level, unit included. The story reaches the database, so a set that still
# has the old unconditional rule will build an integration suite nobody asked for.
sed -i -e '/^- \*\*Test levels:\*\* unit yes/d' -e '/Testcontainers.PostgreSql/d' "$PWD/Docs/Architecture/tech.md"
