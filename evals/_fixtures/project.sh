#!/usr/bin/env bash
# Seeds the empty eval workspace with a small NZT project: the built kernel as
# CLAUDE.md, the technical document with its packs installed as project skills, one
# feature with one story, and enough source for a request to be about something real.
#
# Sourced by each case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

# The kernel. Without it the routing table is not in context and the run measures
# description matching instead of NZT's instructed routing (R2).
cp "$here/CLAUDE.md" "$ws/CLAUDE.md"

mkdir -p "$ws/Docs/Product" "$ws/Docs/Architecture" "$ws/Plan/specs/F-001-pedidos/stories" \
         "$ws/src/Pedidos.Api/Features/Orders" "$ws/src/Pedidos.Web/Features/Orders"

cat > "$ws/Docs/Product/product.md" <<'MD'
# Pedidos — producto
Un comercio carga pedidos, los confirma y sigue su estado. Dos componentes:
`Pedidos.Api` (backend) y `Pedidos.Web` (frontend).
MD

cat > "$ws/Docs/Architecture/architecture.md" <<'MD'
# Architecture — Pedidos

| Component | Root | Areas | What it does |
|---|---|---|---|
| Pedidos.Api | `src/Pedidos.Api/` | backend | the orders API and its database |
| Pedidos.Web | `src/Pedidos.Web/` | frontend | the operator's screens |
MD

# Both components leave the `Test data` opt-in unanswered on purpose: routing/test-data
# measures that the mechanism gets asked, and an answered opt-in would skip the question.
# Each Test levels line is unique, so a case can rewrite one component's with sed.
cat > "$ws/Docs/Architecture/tech.md" <<'MD'
# Tech — Pedidos

## Pedidos.Api
root: `src/Pedidos.Api/` · areas: backend · packs: dotnet, ddd

| Decision | Choice | When |
|---|---|---|
| Runtime | .NET 10.0.2 | — |
| Language | C# 14 | — |
| Database | PostgreSQL 17 | — |
| Architecture | vertical-slice | — |
| Domain model | ddd | entities and aggregates protect the order rules |
| Persistence | repositories | every write goes through the unit of work |
| ORM | EF Core 10 | every access to PostgreSQL |
| Endpoints | minimal-apis | every HTTP endpoint |
| Result to HTTP | result-extensions | endpoints translate Result to payload or ProblemDetails |
| Test framework | xUnit 3 | — |

Opt-ins
- **Test levels:** unit yes · integration against the real engine yes · ephemeral containers yes · in-process API no
- **Test-first:** no
- **End-to-end tool:** no
- **DDD:** aggregates yes · value objects yes · domain events no · typed ids no

Dependencies
| Dependency | What for | When |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 | EF Core provider for PostgreSQL | persistence and migrations |
| xunit.v3 3.0.0 | test framework | every automated test |
| Testcontainers.PostgreSql 4.6.0 | disposable PostgreSQL for tests | integration tests against the real engine |

Agent tools
| Tool | What for | Source | Installed by |
|---|---|---|---|
| Microsoft Learn MCP | .NET and Azure documentation | Microsoft Learn, read 2026-09-17 | pack dotnet |

Conventions
- Secrets live outside the repository; in development, in user secrets.

Evidence: versions read 2026-09-17 from `global.json` and `Directory.Packages.props`.

## Pedidos.Web
root: `src/Pedidos.Web/` · areas: frontend · packs: blazor

| Decision | Choice | When |
|---|---|---|
| Framework | Blazor (.NET 10.0.2) | — |
| Architecture | vertical-slice | — |
| Render mode | auto | every interactive page |
| Component organisation | code-behind | every component with logic |
| Prerendering | enabled | every page |

Opt-ins
- **Test levels:** unit no · integration against the real engine no · ephemeral containers no · in-process API no
- **Test-first:** no
- **End-to-end tool:** no

Evidence: versions read 2026-09-17 from `global.json`.
MD

# The packs tech.md lists, installed as `nzt-ai project add dotnet ddd blazor` would.
bash "$here/packs.sh" "$ws" dotnet ddd blazor

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
