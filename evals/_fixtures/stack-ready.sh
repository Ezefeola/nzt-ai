#!/usr/bin/env bash
# Seeds the project of story-specified.sh with what the .NET and Blazor stack cases kept
# stopping on: every operation they ask for has its story with status codes, the domain
# model has every field they touch, and the manifest agrees with the stack document
# (Directory.Packages.props exists, the projects reference what the stack lists). What is
# left - Result, DbContext, entities - is setup the stack authorises, not a gap to ask about.
#
# Sourced by a case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

bash "$here/story-specified.sh" "$ws"

mkdir -p "$ws/Plan/specs/F-003-clientes/stories" "$ws/src/Pedidos.Web.Client" \
  "$ws/tests/Pedidos.Api.Tests"

cat > "$ws/Plan/specs/F-001-pedidos/feature.md" <<'MD'
# F-001 — Pedidos

## Alcance
Alta, listado y confirmación de pedidos.

## Reglas de negocio
- **RN-01.** Un pedido confirmado no se puede modificar ni volver a confirmar.
- **RN-02.** El listado de un cliente muestra primero los más recientes; a igual fecha, el
  número de pedido más alto primero.
- **RN-03.** Un pedido sin líneas no se puede confirmar.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-010 | Alta de pedido | especificada |
| US-012 | Listado de pedidos por cliente | especificada |
| US-013 | Confirmar un pedido | especificada |
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-010-alta-pedido.md" <<'MD'
# US-010 — Alta de pedido

Como operador quiero dar de alta un pedido para un cliente.

## Contrato
`POST /orders` con `customerId` y `lines` (cada una con `productCode`, `quantity` y
`unitPrice`).

## Criterios de aceptación
- **CA-01.** Dado un cliente que existe y al menos una línea válida, se crea el pedido en
  estado `Pending` con el siguiente número, y la respuesta es 201 con su id y su número.
  `backend — · frontend — · qa —`
- **CA-02.** Dado un `customerId` que no existe, la respuesta es 404.
  `backend — · frontend — · qa —`
- **CA-03.** Dado un pedido sin líneas, o una línea con `quantity` menor a 1 o `unitPrice`
  negativo, la respuesta es 400 con el error de validación. `backend — · frontend — · qa —`
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-013-confirmar-pedido.md" <<'MD'
# US-013 — Confirmar un pedido

Como operador quiero confirmar un pedido para que no se modifique más.

## Contrato
`POST /orders/{id}/confirm`, sin cuerpo.

## Criterios de aceptación
- **CA-01.** Dado un pedido `Pending` con líneas, queda `Confirmed` y la respuesta es 204.
  `backend — · frontend — · qa —`
- **CA-02.** Dado un id que no existe, la respuesta es 404 con el mensaje "El pedido no
  existe.". `backend — · frontend — · qa —`
- **CA-03.** Dado un pedido ya `Confirmed`, la respuesta es 409 con el mensaje "El pedido ya
  está confirmado." (RN-01). `backend — · frontend — · qa —`
- **CA-04.** Dado un pedido sin líneas, la respuesta es 409 con el mensaje "El pedido no
  tiene líneas." (RN-03). `backend — · frontend — · qa —`

## Reglas que aplica
- RN-01, RN-03.
MD

cat > "$ws/Plan/specs/F-003-clientes/feature.md" <<'MD'
# F-003 — Clientes

## Alcance
Alta de clientes.

## Reglas de negocio
- **RN-01.** El email de un cliente es único.
- **RN-02.** Un cliente nace `Active`; solo un cliente `Active` puede tener pedidos nuevos.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-030 | Alta de cliente | especificada |
MD

cat > "$ws/Plan/specs/F-003-clientes/stories/US-030-alta-cliente.md" <<'MD'
# US-030 — Alta de cliente

Como operador quiero dar de alta un cliente con su nombre y su email.

## Contrato
`POST /customers` con `name` y `email`.

## Criterios de aceptación
- **CA-01.** Dado un nombre de hasta 200 caracteres y un email válido que nadie usa, se crea
  el cliente en estado `Active` y la respuesta es 201 con su id. `backend — · frontend — · qa —`
- **CA-02.** Dado un email que ya usa otro cliente, la respuesta es 409 con el mensaje "Ya
  existe un cliente con ese email." (RN-01). `backend — · frontend — · qa —`
- **CA-03.** Dado un nombre vacío o un email con formato inválido, la respuesta es 400 con
  el error de validación. `backend — · frontend — · qa —`

## Reglas que aplica
- RN-01, RN-02.
MD

cat > "$ws/Docs/domain-model.md" <<'MD'
# Domain model — Pedidos

update-when: an entity, a field or a relationship changes.

## Customer (aggregate root)
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Name | text, 200 | required |
| Email | text, 320 | required, unique |
| Status | Active · Inactive | born Active |

## Order (aggregate root)
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| Number | int | required, unique — the number the operator sees |
| CustomerId | int | the customer who placed it; only the id crosses the aggregate |
| CreatedAt | instant | when it was placed; the listing orders by it |
| Total | money | 12,2 — the sum of its lines |
| Status | Pending · Confirmed | RN-01: a confirmed order cannot change |
| Lines | OrderLine, 0..n | part of the Order aggregate |

## OrderLine (inside Order)
| Field | Type | Notes |
|---|---|---|
| Id | int | identity |
| ProductCode | text, 50 | required |
| Quantity | int | at least 1 |
| UnitPrice | money | 12,2, not negative |
MD

cat > "$ws/Directory.Packages.props" <<'XML'
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.2" />
    <PackageVersion Include="xunit.v3" Version="3.0.0" />
    <PackageVersion Include="Testcontainers.PostgreSql" Version="4.6.0" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.14.1" />
  </ItemGroup>
</Project>
XML

cat > "$ws/Pedidos.slnx" <<'XML'
<Solution>
  <Project Path="src/Pedidos.Api/Pedidos.Api.csproj" />
  <Project Path="src/Pedidos.Web/Pedidos.Web.csproj" />
  <Project Path="src/Pedidos.Web.Client/Pedidos.Web.Client.csproj" />
  <Project Path="tests/Pedidos.Api.Tests/Pedidos.Api.Tests.csproj" />
</Solution>
XML

cat > "$ws/src/Pedidos.Api/Pedidos.Api.csproj" <<'XML'
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" PrivateAssets="all" />
  </ItemGroup>
</Project>
XML

cat > "$ws/src/Pedidos.Web/Pedidos.Web.csproj" <<'XML'
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../Pedidos.Web.Client/Pedidos.Web.Client.csproj" />
  </ItemGroup>
</Project>
XML

cat > "$ws/src/Pedidos.Web.Client/Pedidos.Web.Client.csproj" <<'XML'
<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
XML

cat > "$ws/tests/Pedidos.Api.Tests/Pedidos.Api.Tests.csproj" <<'XML'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <OutputType>Exe</OutputType>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="xunit.v3" />
    <PackageReference Include="Testcontainers.PostgreSql" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../../src/Pedidos.Api/Pedidos.Api.csproj" />
  </ItemGroup>
</Project>
XML

# The stack lists Microsoft.EntityFrameworkCore.Design (migrations) and the test SDK too,
# so the manifest and the stack document say the same thing.
sed -i 's/^| Testcontainers.PostgreSql 4.6.0 |.*$/&\n| Microsoft.EntityFrameworkCore.Design 10.0.2 | migrations tooling | generating migrations |\n| Microsoft.NET.Test.Sdk 17.14.1 | test host | every test project |/' \
  "$ws/Docs/backend-stack-Pedidos.Api.md"
