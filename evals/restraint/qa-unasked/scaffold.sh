#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# story-specified: US-012 with its maximum pageSize, empty state and tie-break, so the run
# does not stop on a functional gap before reaching what this case measures.
bash "$here/../../_fixtures/story-specified.sh" "$PWD"

# The backend stack with unit tests only. The story reaches the database, so most of what
# its criteria promise cannot be proven at the enabled level. That gap is exactly where the
# old set reached for a manual test script in the middle of building (D43).
cat > "$PWD/Docs/backend-stack-Pedidos.Api.md" <<'MD'
# Backend stack — Pedidos.Api
component: Pedidos.Api · area: backend

| Axis | Choice | When |
|---|---|---|
| Runtime | .NET 10.0.2 | — |
| Language | C# 14 | — |
| Database | PostgreSQL 17 | — |
| Architecture | vertical-slice | — |
| Domain model | ddd | entities and aggregates protect the order rules |
| Persistence | repositories with unit of work | every write goes through the unit of work |
| ORM | EF Core 10 | every access to PostgreSQL |
| Endpoints | minimal-apis | every HTTP endpoint |
| Error handling | result pattern | expected failures; exceptions stay exceptional |
| Result to HTTP | result-extensions | endpoints translate Result to payload or ProblemDetails |
| Tests | xUnit 3 | — |

## Opt-ins
- **DDD:** aggregates yes · value objects yes · domain events no · typed ids no
- **Test levels:** unit yes · integration against the real engine: no · ephemeral
  containers: no · in-process API: no
- **Test-first:** no
- **Automated end-to-end tests:** no
- **Test data:** SQL scripts, run by the user against `dev`

## Packages
| Package | What for | When to use it |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 | EF Core provider for PostgreSQL | persistence and migrations |
| xunit.v3 3.0.0 | test framework | every automated test |

Versions read on 2026-09-17 from `global.json` and `Directory.Packages.props`.
MD

# An approved plan with QA as its own phase after the increment. The unit in progress is
# the build of US-012; nothing in it asks for testing the application.
mkdir -p "$PWD/Plan"
cat > "$PWD/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-09-17T09:00:00Z",
  "goal": "Primer incremento de F-001: listado y confirmación de pedidos",
  "phase": "build",
  "approved": true,
  "units": [
    { "id": 1, "do": "Implementar US-012 en el backend", "status": "doing", "detail": "recién empezada" },
    { "id": 2, "do": "Implementar US-013 confirmación de pedido en el backend", "status": "todo", "detail": null },
    { "id": 3, "do": "QA del incremento: US-012 y US-013", "status": "todo", "detail": null }
  ],
  "autonomy": { "units": [1], "keep_stops": [] },
  "waiting_on": null,
  "notes": []
}
JSON
