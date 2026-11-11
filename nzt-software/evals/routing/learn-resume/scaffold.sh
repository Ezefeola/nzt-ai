#!/usr/bin/env bash
# The project of project.sh with a learning topic already running: curriculum and progress
# written, EX-03 handed out, and the person's delivery sitting in the source tree. Nothing in
# Plan/state.json mentions it - a topic's state is its progress.md.
set -euo pipefail
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures/project.sh" "$PWD"

topic="$PWD/Learn/ef-core-lecturas"
mkdir -p "$topic/exercises" "$topic/lessons"

cat > "$topic/curriculum.md" <<'MD'
# Currículum — Lecturas con EF Core
topic: ef-core-lecturas · opened: 2026-09-16

## Propósito
Leer y arreglar consultas lentas en el código del equipo. No diseñar esquemas.

## Punto de partida (de las sondas, 2026-09-16)
- Sabe qué hace `Include` en general; no mencionó el join ni las filas duplicadas.
- Paginó bien un listado; no vio el N+1 debajo.

## Acordado
- Dos horas por semana. Conocimiento de trabajo, no profundidad.
- Fuera de alcance: migraciones, escrituras.

## Objetivos
| Id | La persona puede, sin ayuda | Cierra con |
|---|---|---|
| OA-01 | Leer un SQL generado y decir qué LINQ lo produjo | Lee uno que no vio y lo mapea |
| OA-02 | Encontrar el N+1 en código existente y decir cuánto cuesta | Lo encuentra en un archivo de su repositorio |
| OA-03 | Reescribir una lectura como proyección y justificar cada columna | Hace la reescritura sola y defiende las columnas |
MD

cat > "$topic/progress.md" <<'MD'
# Progress — ef-core-lecturas
last session: 2026-09-30

## Objectives
| Id | State | Evidence | Next review |
|---|---|---|---|
| OA-01 | achieved | assessments/2026-09-25.md, caso nuevo, sin material | 2026-10-16 |
| OA-02 | in progress | lessons/OA-02-n-mas-uno.md; EX-03 entregado, sin corregir | — |
| OA-03 | not started | — | — |

## Calibration
| Date | Objective | Confidence | Result |
|---|---|---|---|
| 2026-09-18 | OA-01 | high | wrong |
| 2026-09-25 | OA-01 | high | right |

## Log
- 2026-09-25 · OA-01 · caso nuevo, sin ayuda, lo explicó sin material. Achieved.
- 2026-09-30 · OA-02 · lección dada; EX-03 asignado (paso faded).
MD

cat > "$topic/lessons/OA-02-n-mas-uno.md" <<'MD'
# OA-02 · El N+1, y lo que cuesta

## La idea
Una lista que accede a una navegación por fila dispara una consulta por fila.
MD

cat > "$topic/exercises/EX-03.md" <<'MD'
# EX-03 · Sacar el N+1 del listado de pedidos
objective: OA-02 · step: faded · written: 2026-09-30 · about 20 minutes

## Produce
`ListOrdersByCustomer` reescrito para que la página cueste una sola consulta, y dos o tres
líneas diciendo cuánto costaba antes.

## The case
`src/Pedidos.Api/Features/Orders/ListOrdersByCustomer.cs`. Veinte pedidos por página, y el
nombre del cliente en cada fila.

## Given
- La forma de la reescritura: una sola consulta con una proyección. El `Select` está vacío:
  las columnas las decidís vos.
- **No se da:** qué acceso a propiedad dispara la consulta extra. Ese es el hallazgo.

## Out of scope
Paginado, validación y nombres.

## Done when
- La lectura reescrita emite una sola consulta.
- Cada columna que quedó tiene una razón que podés decir en voz alta.
- Podés decir cuánto costaba la versión anterior, en consultas, para una página de veinte.
MD

# The delivery: the N+1 is gone, but through Include and an in-memory Select - one query
# that still loads every column of both entities. Half right, which is what a correction is for.
cat > "$PWD/src/Pedidos.Api/Features/Orders/ListOrdersByCustomer.cs" <<'MD'
namespace Pedidos.Api.Features.Orders;

public sealed class ListOrdersByCustomer(AppDbContext db) : IListOrdersByCustomer
{
    public async Task<Result<List<OrderRowDto>>> ExecuteAsync(
        ListOrdersByCustomerRequestDto request,
        CancellationToken cancellationToken)
    {
        // EX-03: antes eran 21 consultas (1 + 20, una por order.Customer.Name).
        var orders = await db.Orders
            .Include(o => o.Customer)
            .Where(o => o.CustomerId == request.CustomerId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var rows = orders
            .Select(o => new OrderRowDto(o.Id, o.CreatedAt, o.Total, o.Customer.Name))
            .ToList();

        return Result<List<OrderRowDto>>.Success(rows);
    }
}
MD
