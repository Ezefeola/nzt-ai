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

cat > "$ws/Docs/backend-stack-Pedidos.Api.md" <<'MD'
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
| Tests | xUnit 3 + Testcontainers | 2026-09 |

## Opt-ins
- **Test-first:** no.
- **Automated end-to-end tests:** no.

## Evidence
Versions read on 2026-09-17 from `global.json` and `Directory.Packages.props`.
MD

cat > "$ws/Docs/frontend-stack-Pedidos.Web.md" <<'MD'
# Frontend stack — Pedidos.Web
component: Pedidos.Web · area: frontend

## Adopted
| Axis | Choice | Since |
|---|---|---|
| Framework | Blazor (.NET 10.0.2) | 2026-09 |
| Architecture | vertical-slice | 2026-09 |
| Render mode | auto | 2026-09 |
| Component organisation | code-behind | 2026-09 |
| Prerendering | enabled | 2026-09 |

## Opt-ins
- **Automated end-to-end tests:** no.

## Evidence
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
  pedidos ordenados del más reciente al más antiguo. `backend — · frontend —`
- **CA-02.** Dado un cliente sin pedidos, veo el estado vacío con su mensaje.
  `backend — · frontend —`
- **CA-03.** Dado un `pageSize` mayor al máximo del proyecto, la operación responde con el
  error de validación. `backend — · frontend —`

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
