# 05 — Línea base de los evals antes de mover nada

> Unidad 6 del run `marco-trabajo-mejoras` · 2026-10-03 · Medición: describe el set de hoy (111 skills), no decide nada.

## Condiciones

- Suite completa: 25 casos en 3 grupos, **3 corridas por caso**, `--ablation none` (solo el brazo con plugin), juez por defecto (haiku).
- Plugin: `dist/plugin` de las skills sin cambios respecto de `main 7b2f37c`. Se reconstruyó una vez a las ~14:00 solo para corregir los 3 `case.yaml` de abajo; las skills eran las mismas.
- Costo total medido: **US$22,34** (routing 8,10 + design-mode 0,91 + stack 3,76 + restraint 7,39 + entity-shape 0,77 + result-inline 1,41). La primera tanda de stack/restraint se cortó por el límite de sesión de la cuenta; esos runs se descartaron y se repitieron.
- Reportes: `evals/results/2026-10-03-baseline-*.html`. En `…-baseline-stack.html` solo valen `blazor-render`, `ef-listado` y `endpoint-axis`; los otros tres de ese archivo son runs cortados por el límite y se reemplazan por sus reportes propios y por `…-baseline-restraint.html` (`stack-not-dotnet` lleva las dos etiquetas).

## Defecto corregido en los casos

`design-mode`, `design-unasked` y `no-diagram` **nunca habían cargado**: usaban `min`/`max` en un grader `regex`, y esas claves solo existen en `tool_used`. Verificado en [code.claude.com/docs/en/plugin-evals](https://code.claude.com/docs/en/plugin-evals) (tabla de graders): `regex` toma `pattern`, `flags`, `match`, `target`; la ausencia es `match: not_contains`. Corregido con el mismo significado: `min: 0, max: 0` → `match: not_contains`; `min: 1` → se quita (el default es "contiene").

## Resultados

| Grupo | Caso | Score | Pass % | Falla repetida |
|---|---|---|---|---|
| routing | kernel-loaded | 1.00 | 100 | — (humo: el kernel llega, los demás resultados valen) |
| routing | learn | 1.00 | 100 | — |
| routing | ship-unnamed-environment | 1.00 | 100 | — |
| routing | diagram-offered | 0.78 | 33 | offers-the-diagram (juez) |
| routing | verify | 0.78 | 33 | scenarios-come-from-criteria (juez, 2 de 3) |
| routing | discovery | 0.67 | 0 | discovery-fired: la skill no se cargó |
| routing | manual | 0.67 | 0 | organised-by-task (juez) |
| routing | build-story | 0.58 | 0 | build-fired: la skill no se cargó |
| routing | design-mode | 0.58 | 0 | derives-then-asks-the-mode (juez, 2 de 3) |
| routing | close-feature | 0.50 | 0 | router-before-leaf: el router nunca se cargó antes de la hoja |
| routing | test-data | 0.33 | 0 | creates-the-data, cleanup-is-planned (juez) |
| stack | ef-listado | 0.83 | 0 | ordering-ends-in-a-unique-column (juez) |
| stack | not-dotnet | 0.83 | 33 | builds-with-the-projects-stack (juez) |
| stack | result-inline | 0.78 | 67 | use-case-leaf-fired: la hoja no se cargó |
| stack | endpoint-axis | 0.75 | 0 | selected-endpoint-leaf-fired: la hoja no se cargó |
| stack | blazor-render | 0.60 | 0 | selected-render-leaf-fired: la hoja no se cargó |
| stack | entity-shape | 0.25 | 0 | ddd-leaf-fired: la hoja no se cargó |
| restraint | trivial | 1.00 | 100 | — |
| restraint | no-diagram | 1.00 | 100 | — |
| restraint | qa-unasked | 0.92 | 67 | leaves-it-for-qa (juez) |
| restraint | foreign-repo | 0.89 | 67 | follows-the-house-style (juez) |
| restraint | design-unasked | 0.75 | 0 | goes-to-build (juez) |
| restraint | package-unasked | 0.75 | 0 | proposes-with-alternative (juez) |
| restraint | small-edit | 0.67 | 0 | stays-the-size-of-the-request (juez) |
| restraint | test-levels-unasked | 0.60 | 0 | no-suite-nobody-enabled (juez) |

Media simple por grupo: routing **0.72**, stack **0.67**, restraint **0.82**.

## Lo que esto dice para la migración (observaciones, no reglas)

1. **Las hojas de stack ya se cargan poco hoy.** En 4 de 6 casos de `stack` la hoja que el stack selecciona no se cargó en ninguna de las 3 corridas. Es el síntoma de R1/H4: hojas en el listado que el agente no alcanza. La migración no parte de un piso alto en este eje.
2. **Restraint es el grupo más sano** y no tiene graders que fallen por cargar skills de más: las fallas son del juez sobre lo que respondió. Es el grupo donde una regresión sería más visible.
3. **Varias fallas del juez se repiten 3 de 3 con el mismo veredicto** (test-data, manual, small-edit, test-levels-unasked…). Según el README son candidatas a calibración del caso, no necesariamente defectos del set. No se tocan en este run: se comparan igual antes y después.

## Graders que la migración obliga a adaptar

Hoy prueban que una **hoja** se cargó como skill (`tool_used: Skill` + nombre de la hoja). Cuando la hoja pase a `references/`, la prueba equivalente es que se **leyó su archivo** (`tool_used: Read` + ruta de la referencia), y los "no debe cargarse" pasan a "no debe leerse". Sin ese cambio fallan o pasan por la razón equivocada:

- `stack/`: los 6 casos (render-auto/server/webassembly/static, ef-core, persistence-direct, endpoints-minimal/controllers, domain-ddd/anemic, use-cases, y los "no debe" de not-dotnet).
- `restraint/`: design-unasked (`nzt-architecture-design*`), no-diagram (`nzt-architecture-diagrams*`), small-edit (`nzt-build-frontend-blazor-*`).
- `routing/`: close-feature (`nzt-plan-close`, y su `tool_order` router → hoja), build-story (`nzt-build-` en `tool_order`).

Los graders sobre routers (`nzt`, `nzt-build`, `nzt-architecture`…) no cambian. **Comparación válida después de la migración:** mismo score por caso con los graders adaptados, leyendo los "leaf-fired" como una referencia que se leyó.

## Piloto D50: `ship-backend-dotnet` (unidad 7)

Caso nuevo `stack/ship-pipeline` (CI de un componente .NET sin lock files), 3 corridas, juez **sonnet** (haiku reprobó respuestas que cumplían las cuatro condiciones; el criterio se reescribió una vez antes de medir).

| | Router del área | Guía de pipeline | Otra fila no leída | Juez | Score |
|---|---|---|---|---|---|
| Antes (hoja como skill) | 1 de 3 | 3 de 3 (`Skill`) | 3 de 3 | 2 de 3 | **0.75** |
| Después (referencia) | 3 de 3 | 3 de 3 (`Read`) | 3 de 3 | 3 de 3 | **1.00** |

- Antes, en 2 de 3 corridas el agente cargó la hoja por su descripción **salteando el router**; después ese atajo no existe y siempre pasó por la tabla.
- 3 corridas por lado: la dirección es clara, el tamaño no es una medición.
- Sin pérdida de contenido: `install/check-references.sh` da `ok` en las 4 referencias contra `main`, y se lo vio fallar con una línea alterada a propósito.
- Listado: 111 → 107 skills, ~21.035 → ~20.211 chars.

## Unidad 9: `nzt-plan` (`close.md`)

Caso `routing/close-feature`, juez haiku (el de su línea base).

| | Router | Lee la guía de cierre | Router antes que la guía | Juez | Score |
|---|---|---|---|---|---|
| Línea base (hoja como skill) | — | 3 de 3 | 0 de 3 | 0 de 3 | **0.50** |
| Primera migración | 1 de 3 | 1 de 3 | 1 de 3 | 0 de 3 | **0.42** |
| Con la descripción corregida (revertido) | 3 de 3 | 3 de 3 | 3 de 3 | 0 de 3 | **0.75** |
| Con la fila del kernel (D53), 6 corridas | 5 de 6 | 5 de 6 | 5 de 6 | 0 de 6 | **0.58 / 0.75** |
| + *hand off* de `nzt` nombra el cierre, 6 corridas | 6 de 6 | 6 de 6 | 6 de 6 | 0 de 6 | **0.75** |

Unidad 25 (diagnóstico por traza): las corridas que fallaban **sí** cargaban `nzt`, veían los marcadores `[remove]`/`[modify]` y saltaban a `nzt-discovery-change` por su descripción. El eslabón faltante era el *hand off* de `nzt`. Con una línea ahí, las 6 trazas hacen `nzt` → `nzt-plan` → `close.md`.

**Hallazgo que la propuesta no previó (H6):** sacar una hoja del listado le saca su disparador. La descripción de `nzt-plan-close` ("the user accepted every story of a feature") era lo que llevaba "cerremos la feature" hasta ahí; sin ella el agente no cargó ninguna skill en 2 de 3 corridas. Primero se corrigió sumando el disparador a la descripción del router (3 de 3); **el usuario lo rechazó**: el ruteo no debe depender de descripciones. Se revirtió y el disparador pasó a la fila del kernel ("…or closing a feature the user accepted"): **5 de 6** corridas por router → `close.md`, en dos tandas (0.58 y 0.75). La que falló no cargó ninguna skill. Quedó como D53 y regla 16 de §10.

El juez falla 3 de 3 antes y después: el agente objeta el cierre con razones que el fixture le da (no hay código, alcance sin historias). Es calibración del caso, no del set.

## Unidad 10: `nzt-learn` (7 hojas)

Caso `routing/learn`, juez haiku (el de su línea base), 3 corridas, sin brazo de ablación. Grader nuevo `curriculum-read` (Read de `nzt-learn/references/plan.md`): la línea base no tenía ninguno sobre hojas.

| | Router | Lee `plan.md` | No va a build | Juez | Score |
|---|---|---|---|---|---|
| Línea base (hojas como skills) | 3 de 3 | — | 3 de 3 | 3 de 3 | **1.00** |
| Después (referencias) | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | **1.00** |

- D53 aplicado antes de medir: la fila del kernel y el *hand off* de `nzt` suman "continuar un tema de `Learn/`" (corrección, evaluación, repaso), que antes cubrían solo las descripciones de `tutor`, `assess` y `retain`. `routing/learn` mide la entrada a un tema nuevo; el retomar lo mide el caso de la unidad 26.

## Unidad 26: caso nuevo `routing/learn-resume`

Tema `Learn/ef-core-lecturas` en curso, EX-03 entregado en `ListOrdersByCustomer.cs` (arregla el N+1 con `Include` y proyección en memoria: medio bien). Pedido: *"Ya terminé el EX-03, lo dejé en ListOrdersByCustomer.cs. ¿Está bien?"* — se lee como revisión de código. Juez sonnet, 3 corridas, sin brazo de ablación.

| | Router | Lee `tutor.md` | Router antes | No va a build/verify | Confianza antes del veredicto (juez) | Score |
|---|---|---|---|---|---|---|
| Con la fila de D53 | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | **1.00** |
| Fila del kernel vieja (prueba de que el caso puede fallar) | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | **1.00** |

- **El caso no discrimina la línea de D53.** Con la fila vieja también llega: alcanzan "Teaching the user a skill", el `Learn/` del workspace y la descripción del router (*"being corrected, assessed"*). La línea se mantiene porque D53 pide ruteo instruido, no porque este caso la pruebe necesaria.
- Lo que sí cubre: que tras D50 un tema en curso llega a `tutor.md` por el router, y que el agente pide la confianza antes de corregir. Es guardia de regresión para la migración.
- Reporte en `evals/results/2026-10-03-learn-resume.html`. US$1.02 las dos tandas.

## Unidad 11: `nzt-discovery` (7 hojas)

Caso `routing/discovery`, juez haiku (el de su línea base), 3 corridas, sin brazo de ablación. Grader nuevo `interview-read` (Read de `nzt-discovery/references/analysis.md`).

| | Carga `nzt-discovery` | Lee `analysis.md` | No va a build | Juez | Score |
|---|---|---|---|---|---|
| Línea base (hojas como skills) | 0 de 3 | — | 3 de 3 | 3 de 3 | **0.67** |
| Después, con la fila de D53 | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | **1.00** |
| Después, fila vieja del kernel | 3 de 3 | 3 de 3 | 3 de 3 | 3 de 3 | **1.00** |

- **La mejora no es de la fila del kernel**: con la fila vieja también da 3 de 3. Las trazas de la línea base no se guardaron (corrió sin `--keep-temp`), así que el 0 de 3 no se puede diagnosticar después; lo que cambió desde entonces es el *hand off* de `nzt` (unidad 25) y un listado con 19 skills menos. Queda como no explicado, no como arreglado.
- La línea de D53 se mantiene (ruteo instruido): suma historias, producto, glosario, cambio a una feature existente y specs desde código, que cubrían las descripciones de las hojas.
- Routers corregidos: `nzt-build` nombraba `nzt-discovery-change` y `nzt-plan-close` (este quedó de la unidad 9); el *hand off* de `nzt` nombraba `nzt-discovery-change`. Las menciones dentro de hojas de build, verify y architecture se dejan: el diff sin pérdidas de esas hojas falla si se tocan; las resuelve la tabla de su router cuando migren.
- Regresión de `close-feature` tras cambiar la redacción del *hand off*: router → `close.md` 3 de 3, juez 1 de 3, **0.83** (venía de 0.75).
- Sin pérdida de contenido: `check-references.sh` 19 de 19 `ok`. Listado: 99 → 92 skills, ~17.810 chars. US$2.64 las tres tandas.

## Unidad 12: `nzt-ux` (5 hojas)

Caso `routing/manual`, 3 corridas, sin brazo de ablación. Grader nuevo `manual-read` (Read de `nzt-ux/references/manual.md`).

| | Carga `nzt-ux` | Lee `manual.md` | Por tarea (juez) | Solo lo verificado (juez) | Score |
|---|---|---|---|---|---|
| Línea base, juez haiku | 3 de 3 | — | 0 de 3 | 3 de 3 | **0.67** |
| Después, juez haiku | 3 de 3 | 3 de 3 | 0 de 3 | 3 de 3 | **0.75** |
| Después, juez sonnet | 3 de 3 | 3 de 3 | 2 de 3 | 3 de 3 | **0.92** |

- El fallo de `organised-by-task` con haiku es del juez: se leyó la respuesta de una corrida reprobada y propone un capítulo por tarea ("Revisar el historial de pedidos de un cliente") en un HTML que abre sin red. Mismo patrón que la línea base; con haiku la comparación es igual a igual (solo cambia el grader nuevo, que pasa).
- Fila del kernel ampliada (D53): maquetas, sistema de diseño y componentes compartidos, revisiones de usabilidad y accesibilidad, que cubrían solo las descripciones de las hojas. No se probó con la fila vieja: el caso mide el manual, que la fila ya nombraba.
- Routers: `nzt-ux` y `nzt-architecture` nombraban `nzt-ux-system`. La mención en `close.md` y en `verify/performance` queda (diff sin pérdidas).
- Sin pérdida de contenido: 24 de 24 `ok`. Listado: 92 → 87 skills, ~17.052 chars. US$2.02 las dos tandas.
- Sin pérdida de contenido: `check-references.sh` da `ok` en las 7. `## Contents` en `exercises`, `plan`, `teach` y `tutor` (más de 100 líneas).
- Listado: 106 → 99 skills, ~18.975 chars.
- Reporte en `evals/results/2026-10-03-learn-d50.html`. US$0.76.
