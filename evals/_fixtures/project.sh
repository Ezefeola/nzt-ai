#!/usr/bin/env bash
# Seeds the empty eval workspace with a small NZT project: the built kernel as
# CLAUDE.md, two stack documents, one feature with one story, and enough source
# for a request to be about something real.
#
# Sourced by each case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

# The kernel. Without it the routing table is not in context and the run measures
# description matching instead of NZT's instructed routing (R2).
cp "$here/CLAUDE.md" "$ws/CLAUDE.md"

mkdir -p "$ws/Docs" "$ws/Plan/specs/F-001-pedidos/stories" \
         "$ws/src/Pedidos.Api/Features/Orders" "$ws/src/Pedidos.Web/Features/Orders"

cat > "$ws/Docs/product.md" <<'MD'
# Pedidos — producto
Un comercio carga pedidos, los confirma y sigue su estado. Dos componentes:
`Pedidos.Api` (backend) y `Pedidos.Web` (frontend).
MD

# Both stacks leave the `Test data` opt-in unanswered on purpose: routing/test-data
# measures that the mechanism gets asked, and an answered opt-in would skip the question.
cat > "$ws/Docs/backend-stack-Pedidos.Api.md" <<'MD'
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
- **Test levels:** unit yes · integration against the real engine: yes · ephemeral
  containers: yes · in-process API: no
- **Test-first:** no
- **Automated end-to-end tests:** no

## Packages
| Package | What for | When to use it |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 | EF Core provider for PostgreSQL | persistence and migrations |
| xunit.v3 3.0.0 | test framework | every automated test |
| Testcontainers.PostgreSql 4.6.0 | disposable PostgreSQL for tests | integration tests against the real engine |

## Conventions
- Secrets live outside the repository; in development, in user secrets.

Versions read on 2026-09-17 from `global.json` and `Directory.Packages.props`.
MD

cat > "$ws/Docs/frontend-stack-Pedidos.Web.md" <<'MD'
# Frontend stack — Pedidos.Web
component: Pedidos.Web · area: frontend

| Axis | Choice | When |
|---|---|---|
| Framework | Blazor (.NET 10.0.2) | — |
| Architecture | vertical-slice | — |
| Render mode | auto | every interactive page |
| Component organisation | code-behind | every component with logic |
| Prerendering | enabled | every page |

## Opt-ins
- **Test levels:** unit no · integration against the real engine: no · ephemeral
  containers: no · in-process API: no
- **Test-first:** no
- **Automated end-to-end tests:** no

Versions read on 2026-09-17 from `global.json`.
MD

cat > "$ws/Plan/specs/F-001-pedidos/feature.md" <<'MD'
# F-001 — Pedidos

## Alcance
Alta, listado y confirmación de pedidos.

## Reglas de negocio
- **RN-01.** Un pedido confirmado no se puede modificar.
- **RN-02.** El listado de un cliente muestra primero los más recientes.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-012 | Listado de pedidos por cliente | pendiente |
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md" <<'MD'
# US-012 — Listado de pedidos por cliente

Como operador quiero ver los pedidos de un cliente para revisar su historial.

## Criterios de aceptación
- **CA-01.** Dado un cliente con pedidos, cuando abro su historial, veo una página de 20
  pedidos ordenados del más reciente al más antiguo. `backend — · frontend — · qa —`
- **CA-02.** Dado un cliente sin pedidos, veo el estado vacío con su mensaje.
  `backend — · frontend — · qa —`
- **CA-03.** Dado un `pageSize` mayor al máximo del proyecto, la operación responde con el
  error de validación. `backend — · frontend — · qa —`

## Reglas que aplica
- RN-02.
MD

cat > "$ws/global.json" <<'MD'
{ "sdk": { "version": "10.0.200", "rollForward": "latestFeature" } }
MD

cat > "$ws/src/Pedidos.Api/Pedidos.Api.csproj" <<'MD'
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
MD

cat > "$ws/src/Pedidos.Api/Features/Orders/GetOrderById.cs" <<'MD'
namespace Pedidos.Api.Features.Orders;

public interface IGetOrderById
{
    Task<Result<GetOrderByIdResponseDto>> ExecuteAsync(
        GetOrderByIdRequestDto request,
        CancellationToken cancellationToken);
}
MD

cat > "$ws/src/Pedidos.Web/Features/Orders/OrderDetail.razor" <<'MD'
@page "/pedidos/{OrderId:int}"

<h1>Pedido @OrderId</h1>
<button class="btn btn-primary" @onclick="SaveAsync">Guardar</button>
MD
