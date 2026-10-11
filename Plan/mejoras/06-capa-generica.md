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

## Herramienta de preguntas por host (unidad 61, leído 2026-10-11)

Pregunta: ¿`stack-axes.md` puede mandar a usar la herramienta de preguntas del CLI? Decide si
la regla nombra una herramienta o queda agnóstica del host.

- **documentado** — Claude Code tiene `AskUserQuestion`: "Asks multiple-choice questions to
  gather requirements or clarify ambiguity", sin permiso requerido; se contesta eligiendo una
  opción o escribiendo texto propio (`Other` o notas). Fuente:
  https://code.claude.com/docs/en/tools-reference · leído 2026-10-11.
- **observado** — en esta sesión el esquema de la herramienta acepta 1 a 4 preguntas por
  llamada y 2 a 4 opciones por pregunta, con "Other" agregado solo.
- **documentado (rango 4, issues del repo oficial)** — Codex tiene `request_user_input`, pero
  **solo en Plan Mode**; en el modo por defecto el agente pregunta en texto. El pedido de
  abrirlo fuera de Plan Mode sigue abierto: https://github.com/openai/codex/issues/30150
  (abierto 2026-06-26, duplicado de #29104) · leído 2026-10-11. Plan Mode lo activa el usuario
  (`/plan`); una skill no puede entrar sola.
- **pista (rango 5, sin usar como apoyo)** — un hilo del foro de OpenAI (2026-05-27, respuesta
  2026-06-18) menciona un flag `default_mode_request_user_input` en desarrollo y apagado.
- **inferido** — una regla que nombre `AskUserQuestion` no sirve en Codex, y una que nombre
  `request_user_input` falla en su modo por defecto, que es donde corre NZT.

**Consecuencia para la 62:** `stack-axes.md` queda agnóstico: *la herramienta de preguntas de
opción múltiple del host, si esta sesión la ofrece; si no, una lista con viñetas, la opción
recomendada primero y su costo al lado*. No nombra ninguna herramienta: en Claude Code el
agente la ve en su lista, y en Codex cae en las viñetas. Se reabre si Codex habilita
`request_user_input` fuera de Plan Mode.

## Orden propuesto, sin aprobar

24a (dist + suite completa contra la línea base) antes de la 22 y la 23; 24b (README y §14 de
la spec) al final.
