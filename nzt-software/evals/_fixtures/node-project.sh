#!/usr/bin/env bash
# Seeds a workspace that is NOT a .NET project: NZT comes from the plugin with nzt-software,
# which carries .NET and Blazor rules, and tech.md declares neither, so none of them may
# fire. The story is specified and the code complete, so the work can be done
# without a question. This is *only what tech.md declares applies* turned into a
# measurement.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

mkdir -p "$ws/prisma" "$ws/Docs/Architecture" "$ws/src/orders" "$ws/src/plugins" "$ws/Plan/specs/F-001-pedidos/stories"

cat > "$ws/Docs/Architecture/tech.md" <<'MD'
# Tech — orders-api

## orders-api
root: `./` · areas: backend

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
| fastify-plugin 5.0.1 | the Prisma decorator | `src/plugins/prisma.ts` |
| @prisma/client 6.3.0 | database client | every query |

Evidence: versions read 2026-09-17 from `package.json`.
MD

cat > "$ws/package.json" <<'MD'
{
  "name": "orders-api",
  "type": "module",
  "dependencies": { "fastify": "^5.2.0", "fastify-plugin": "^5.0.1", "@prisma/client": "^6.3.0" }
}
MD

cat > "$ws/prisma/schema.prisma" <<'MD'
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Order {
  id         Int      @id @default(autoincrement())
  customerId Int
  createdAt  DateTime @default(now())
  total      Decimal  @db.Decimal(12, 2)

  @@index([customerId, createdAt(sort: Desc), id(sort: Desc)])
}
MD

cat > "$ws/src/plugins/prisma.ts" <<'MD'
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (app) => {
  const prisma = new PrismaClient()
  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => prisma.$disconnect())
})
MD

cat > "$ws/src/orders/list-orders.ts" <<'MD'
import type { FastifyInstance } from 'fastify'

type ListOrdersQuery = { customerId: number }

export async function listOrders(app: FastifyInstance) {
  app.get<{ Querystring: ListOrdersQuery }>('/orders', {
    schema: {
      querystring: {
        type: 'object',
        required: ['customerId'],
        properties: { customerId: { type: 'integer', minimum: 1 } },
      },
    },
  }, async (request) => {
    return app.prisma.order.findMany({ where: { customerId: request.query.customerId } })
  })
}
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md" <<'MD'
# US-012 · Listado paginado de pedidos de un cliente

Como cliente quiero ver mis pedidos de a páginas, del más reciente al más antiguo.

## Criterios

- `GET /orders?customerId=&page=&pageSize=`: `page` empieza en 1 y por defecto es 1;
  `pageSize` por defecto es 20 y como máximo 100.
- Orden: `createdAt` descendente y, a igual fecha, `id` descendente.
- Respuesta: `{ items, page, pageSize, total }`; cada item lleva `id`, `createdAt` y `total`.
- `page` o `pageSize` fuera de rango: 400 con el error de validación de Fastify.
- Un cliente sin pedidos: `items` vacío y `total` 0.
MD
