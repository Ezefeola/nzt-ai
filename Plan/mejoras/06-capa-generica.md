# 06 — Capa genérica: lo que pidió el usuario antes de las unidades 22 y 23

Anotado el 2026-10-07, al cerrar la 21. Son pedidos del usuario, todavía sin diseño ni
plan de unidades. Las 22 y 23 de `Plan/state.json` quedan más grandes que lo escrito en
`04-propuesta.md` y se recortan en unidades cuando se retomen.

## Dónde estamos

- La migración de hojas a `references/` está terminada (unidades 7, 9-21). NZT funciona con la
  estructura nueva; cada router se midió con su eval sin regresión, pero la suite completa
  contra la línea base no se corrió todavía (unidad 24).
- La 22 y la 23 no son parte de esa migración: agregan contenido para stacks que no son .NET.

## Pedidos del usuario

1. **Sacar lo general de lo .NET.** Revisar skills y references de .NET y Blazor y llevar a la
   capa genérica lo que es práctica de cualquier lenguaje. Base: G1-G26 de `03-inventario.md`.
   Lo específico de .NET queda donde está.
2. **Stack genérico sin perder lo de hoy.** El documento de stack sigue funcionando como hoy,
   pero no se arma pensando solo en .NET. Si se elige .NET, conserva sus preguntas
   específicas (por ejemplo, con EF Core: contexto directo o repositorios). Con otra
   tecnología, pregunta los ejes genéricos y no inventa qué significa cada uno.
3. **Preguntas más amigables.** Las opciones de cada eje se ofrecen en un formato fácil de
   responder: bullets, o la herramienta de preguntas del CLI si existe. En Claude Code es
   `AskUserQuestion`; en Codex no está verificado si hay una equivalente (nzt-research
   antes de diseñarlo).

## Orden propuesto, sin aprobar

24a (dist + suite completa contra la línea base) antes de la 22 y la 23; 24b (README y §14 de
la spec) al final.
