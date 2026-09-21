#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"

# The backend stack in the shape D42 leaves behind: the Tests axis names the framework
# and nothing else, and no `Test levels` opt-in was ever written. An absent opt-in
# enables no level, unit included. The story reaches the database, so a set that still
# has the old unconditional rule will build an integration suite nobody asked for.
cat > "$PWD/Docs/backend-stack-Pedidos.Api.md" <<'MD'
# Backend stack — Pedidos.Api
component: Pedidos.Api · area: backend

## Adopted
| Axis | Choice | Since |
|---|---|---|
| Runtime | .NET 10.0.2 | 2026-09 |
| Language | C# 14 | 2026-09 |
| Architecture | vertical-slice | 2026-09 |
| Domain model | ddd | 2026-09 |
| Persistence | repositories with unit of work | 2026-09 |
| ORM | EF Core 10 against PostgreSQL 17 | 2026-09 |
| Endpoints | minimal-apis | 2026-09 |
| Error handling | result pattern | 2026-09 |
| Result to HTTP | result-extensions | 2026-09 |
| Tests | xUnit 3 | 2026-09 |

## Opt-ins
- **Test-first:** no.
- **Automated end-to-end tests:** no.

## Evidence
Versions read on 2026-09-17 from `global.json` and `Directory.Packages.props`.
MD
