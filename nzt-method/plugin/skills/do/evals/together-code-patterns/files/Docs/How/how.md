# How — Gastos de la casa
Updated: 2026-11-10

## All of it
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Hecho con | Python 3.12, ya instalado | Lo tengo (H-02) | Nada que instalar |
| Base | Dónde se guardan | Un archivo expenses.json al lado del programa | Simple, se copia para respaldo (H-03) | |
| Structure | Forma | Un solo programa de terminal, en la carpeta expenses/ | Es chico (H-04) | |
| Quality | Cómo se comprueba | Pruebas automáticas con pytest de cada criterio | Elegido así (H-05) | Hay que instalar pytest para correrlas |
| Dependencies | De terceros | Solo pytest, para las pruebas | (H-06) | |

## Conventions
- Código en inglés; mensajes en pantalla en español (H-07).

## Not applicable
- Delivery: lo corro yo con `python -m expenses` (H-08).
