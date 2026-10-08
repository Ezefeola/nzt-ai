#!/usr/bin/env bash
# The project of project.sh with one screen designed and not built: the order history of
# US-012. A mockup is drawn from a screen design, so the design has to exist.
set -euo pipefail
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../_fixtures/project.sh" "$PWD"

mkdir -p "$PWD/Plan/specs/F-001-pedidos/ux-ui"
cat > "$PWD/Plan/specs/F-001-pedidos/ux-ui/screen-historial.md" <<'MD'
---
update-when: cambia US-012 o el design system
---
# Pantalla · Historial de pedidos del cliente

## Task
El operador abre el historial de un cliente para revisar sus pedidos. Acción primaria:
abrir un pedido.

## Regions
1. Cabecera: nombre del cliente.
2. Lista de pedidos, del más reciente al más antiguo, 20 por página (US-012 CA-01).
3. Paginado.

## Elements
| Elemento | Origen |
|---|---|
| Fila: fecha, número, total | US-012 CA-01 |
| Paginado | US-012 CA-01 |

## States
- Cargando: esqueleto de 5 filas (design system).
- Vacío: el mensaje de CA-02, todavía sin texto fijado (Q-01).
- Error: no aplica en esta historia; la cubre la convención del design system.
- Muchos: 20 por página.

## Narrow screen
Cada fila pasa a tarjeta; el total queda a la derecha del número.

## Navigation
- Llega desde: la ficha del cliente.
- Abrir un pedido lleva a `screen-detalle.md` (sin diseñar).

## Pending
- Q-01: texto del estado vacío.
MD
