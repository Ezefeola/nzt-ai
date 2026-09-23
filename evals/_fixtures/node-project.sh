#!/usr/bin/env bash
# Seeds a workspace that is NOT a .NET project: the kernel is installed, the whole
# stack layer is installed too, and nothing in it may fire. This is *an installed
# folder is not an authorisation* turned into a measurement.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

cp "$here/CLAUDE.md" "$ws/CLAUDE.md"

mkdir -p "$ws/Docs" "$ws/src/orders"

cat > "$ws/Docs/backend-stack-orders-api.md" <<'MD'
# Backend stack — orders-api
component: orders-api · area: backend

| Axis | Choice | When |
|---|---|---|
| Runtime | Node.js 24 | — |
| Language | TypeScript 5.9 | — |
| Database | PostgreSQL 17 | — |
| Framework | Fastify 5 | every HTTP endpoint |
| Persistence | Prisma 6 | every access to PostgreSQL |
| Tests | node:test | — |

## Packages
| Package | What for | When to use it |
|---|---|---|
| fastify 5.2.0 | HTTP server | every endpoint |
| @prisma/client 6.3.0 | database client | every query |

Versions read on 2026-09-17 from `package.json`.
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
