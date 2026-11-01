#!/usr/bin/env bash
# Seeds a workspace that is NOT a .NET project: the kernel is installed, the dotnet and
# blazor packs are installed as project skills too, and tech.md lists neither, so nothing
# in them may fire. This is *an installed pack is not an authorisation* turned into a
# measurement.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

cp "$here/CLAUDE.md" "$ws/CLAUDE.md"
bash "$here/packs.sh" "$ws" dotnet blazor

mkdir -p "$ws/Docs/Architecture" "$ws/src/orders"

cat > "$ws/Docs/Architecture/tech.md" <<'MD'
# Tech — orders-api

## orders-api
root: `./` · areas: backend · packs: —

| Decision | Choice | When |
|---|---|---|
| Runtime | Node.js 24 | — |
| Language | TypeScript 5.9 | — |
| Database | PostgreSQL 17 | — |
| Framework | Fastify 5 | every HTTP endpoint |
| Data access | Prisma 6 | every access to PostgreSQL |
| Test framework | node:test | — |

Opt-ins
- **Test levels:** unit yes · integration against the real engine no
- **Test-first:** no
- **End-to-end tool:** no

Dependencies
| Dependency | What for | When |
|---|---|---|
| fastify 5.2.0 | HTTP server | every endpoint |
| @prisma/client 6.3.0 | database client | every query |

Evidence: versions read 2026-09-17 from `package.json`.
MD

cat > "$ws/package.json" <<'MD'
{
  "name": "orders-api",
  "type": "module",
  "dependencies": { "fastify": "^5.2.0", "@prisma/client": "^6.3.0" }
}
MD

cat > "$ws/src/orders/list-orders.ts" <<'MD'
import type { FastifyInstance } from 'fastify'

export async function listOrders(app: FastifyInstance) {
  app.get('/orders', async (request) => {
    return app.prisma.order.findMany({ where: { customerId: Number(request.query.customerId) } })
  })
}
MD
