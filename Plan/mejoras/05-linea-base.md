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

## Unidad 27: `routing/manual` al máximo, y casos para la fila de ux

**Diagnóstico por traza** (juez sonnet, la corrida reprobada guardada): organizaba por tarea, pero **no decía el formato** (el usuario pidió "interactivo, no un PDF") y se quedaba en preguntas sin proponer el plan. Las 3 trazas hacían `nzt` → `nzt-ux` sin `nzt-plan`, aunque el manual son varias unidades y el *hand off* de `nzt` manda esas a `nzt-plan`, cuya regla es que el mensaje del plan no lleva preguntas de definición. Era una falla del set, no del juez.

1. **Arreglo en el set (router de ux, sección "One unit")**: un pedido de manual es más de una unidad, se carga `nzt-plan` con él, y la primera respuesta es el plan: el archivo (un HTML que abre del disco), los capítulos como tareas del lector y lo que queda afuera; lo que falta preguntar es el primer paso del plan. No se tocó `manual.md` (rompería el diff sin pérdidas contra `main`). Resultado: 5 de 5 trazas `nzt` → `nzt-ux` → `nzt-plan`, 0.90, con dos fallos 2–1 del juez.
2. **Arreglo en el caso (criterio de `organised-by-task`)**: los fallos que quedaban eran respuestas correctas que el juez leía mal: tomaba los pasos del plan (estructura, revisión final) por capítulos. Se agregó qué se juzga ("los capítulos que nombra, no los pasos del plan; un capítulo es válido si hay una sola tarea verificada"), sin cambiar las condiciones de PASS ni FAIL.

| | Juez | Corridas | Score |
|---|---|---|---|
| Antes del arreglo | sonnet | 3 | 0.92 |
| Con el router | sonnet | 5 | 0.90 |
| Con el router y el criterio aclarado | **sonnet** | **6** | **1.00** |
| Ídem | haiku | 3 | 0.83 (reprueba 3–0 lo que sonnet aprueba) |

- **Este caso se mide con sonnet desde acá**: haiku reprueba de forma unánime respuestas correctas, como en el piloto.
- Visto una vez, no repetido en las 6 siguientes: una respuesta dijo "se usó alrededor del 0,2% de la sesión" sin señal que lo respalde (el kernel prohíbe inventar porcentajes). Queda anotado, no medido.

**Casos nuevos para la fila ampliada (D53)**, juez sonnet, 3 corridas cada uno, cada pedido escrito para confundirse con otra fase:

| Caso | Pedido | Se confunde con | Con la fila de D53 | Con la fila vieja |
|---|---|---|---|---|
| `ux-review` | revisar si `OrderDetail.razor` es usable y accesible | revisión de código (verify) | **1.00**, lee `review.md` 3 de 3 | 1.00 |
| `ux-system` | colores, tipografías y componentes comunes | frontend (build) | **1.00**, lee `system.md` 3 de 3 | 1.00 |
| `ux-mockup` | un HTML para ver la pantalla antes de programarla | construirla (build) | **1.00**, lee `mockup.md` 3 de 3 | 1.00 |

- **Tercer router con el mismo resultado** (learn, discovery, ux): la fila ampliada no es la que rutea; alcanzan la fila vieja y la descripción del router. D53 se sostiene como decisión de ruteo instruido, no por evidencia de que haga falta.
- Los tres quedan como guardia de regresión: confirman que cada referencia se alcanza por el router.
- US$12.4 en total (manual: 6 tandas; casos nuevos: 6 tandas).
- Sin pérdida de contenido: `check-references.sh` da `ok` en las 7. `## Contents` en `exercises`, `plan`, `teach` y `tutor` (más de 100 líneas).
- Listado: 106 → 99 skills, ~18.975 chars.
- Reporte en `evals/results/2026-10-03-learn-d50.html`. US$0.76.

## Unidad 13: `nzt-verify` (9 hojas)

Casos `routing/verify` y `routing/test-data`, juez haiku (el de su línea base), 3 corridas, sin brazo de ablación, `--keep-temp`.

| | Carga `nzt-verify` | Lee la referencia (traza) | Juez 1 | Juez 2 | Score |
|---|---|---|---|---|---|
| `verify`, línea base | 3 de 3 | — | criterios 1 de 3 | objetivo 3 de 3 | **0.78** |
| `verify`, después | 3 de 3 | `test-design.md` 2 de 3 | criterios **0 de 3** | objetivo 3 de 3 | **0.67** |
| `test-data`, línea base | 3 de 3 | — | crea datos 0 de 3 | limpieza 0 de 3 | **0.33** |
| `test-data`, después | 3 de 3 | `test-design.md` + `test-data.md` en las trazas leídas | crea datos 2 de 3 | limpieza **0 de 3** | **0.56** |

- **Los graders nuevos (`test-design-read`, `test-data-read`) no se midieron**: la tanda corrió contra un `dist/` construido antes de agregarlos (el build copia los casos). La columna de lectura sale de las trazas, no del grader.
- **Diagnóstico por traza: defecto del caso, no de la migración.** El fixture compartido (`_fixtures/project.sh`) deja la US-012 **sin construir**: los tres criterios en `backend — · frontend —`, y en `src/` solo existe `GetOrderById`. El agente busca el listado, no lo encuentra y aplica la regla del router (*verify corre después de que build terminó el incremento; si no, decílo y pará*): no diseña escenarios, pregunta los huecos de la historia (el máximo de `pageSize` no está escrito) y propone construir primero. En `test-data` igual, aunque ofrece los mecanismos de datos y nombra setup/teardown. El juez reprueba con razón según su criterio (no hay escenarios ni limpieza planificada), pero el caso pide algo que el set manda no hacer.
- La regla del router es anterior a D50 y el fixture no cambió: la línea base medía lo mismo con ruido. Leer `test-design.md` (que dice *"approved before anything runs"*) parece haber hecho la negativa más consistente; no se probó por separado.
- Una corrida de `verify` no leyó ninguna referencia: se detuvo antes de elegir fila, al ver que no había nada construido. Consistente con el diagnóstico.
- Sin pérdida de contenido: `check-references.sh` 33 de 33 `ok`. `## Contents` en `performance`, `test-data`, `test-design` y `test-run`. Read with: `test-design` y `performance` con `test-data`; `test-run` con `test-data` y `bug`; `explore` con `bug`.
- Fila del kernel ampliada (D53): datos de prueba, exploratorias, performance para el usuario, regresión E2E, revisión de código y auditoría de documentos. Router en 184 líneas.
- Listado: 87 → 78 skills, ~15.620 chars. Reportes `evals/results/2026-10-04-route-verify.html` y `…-route-test-data.html`. US$1.71.

## Unidad 28: `routing/verify` y `routing/test-data` al máximo

Pedido del usuario tras la 13: llevar los dos casos a 1.00.

1. **Fixture nuevo `_fixtures/story-built.sh`** (los dos scaffolds lo usan; `project.sh` no se toca, lo usan 20 casos más): US-012 con `backend ✓ · frontend ✓ · qa —`, feature "implementada", código del listado (`ListOrdersByCustomer.cs` con validador de máximo 100, `CustomerOrders.razor` con sus estados) y `Plan/state.json` con "Probar US-012" en `todo`. La historia fija lo que el agente preguntaba en la traza: máximo de `pageSize` 100, texto del estado vacío, desempate del orden (RN-02).
   - Con haiku: verify **0.75**, test-data **0.83**. Por traza: verify preguntaba objetivo y mecanismo **en lugar de** traer el borrador de escenarios (una corrida ni llegó a leer `test-design.md`); test-data dejaba los scripts para después porque no había esquema; un FAIL de haiku en `names-the-target` era de una respuesta correcta.
2. **Arreglo en el set (router de verify, "The stop that comes first")**: *las preguntas viajan con el plan, nunca en su lugar*: la primera respuesta es el borrador, leyendo `test-design.md` y `test-data.md`, escenarios por objetivo con recomendación y setup/teardown hasta donde el código deja; objetivo, mecanismo y huecos se preguntan en esa misma respuesta. Mismo patrón que el manual en la unidad 27. Router en 191 líneas.
3. **Arreglo en el fixture**: `PedidosDbContext` y los mappings de `customers` y `orders` (tablas y columnas), para que los scripts de datos se puedan escribir con el plan.

| Caso | Juez | Corridas válidas | Lee la referencia | Score |
|---|---|---|---|---|
| `verify` | sonnet | 3 | `test-design.md` 3 de 3 | **1.00** |
| `test-data` | sonnet | 3 | `test-data.md` 3 de 3 | **1.00** |

- **Estos dos casos se miden con sonnet desde acá**, como `manual`: el fixture cambió, así que la línea base con haiku ya no es comparable.
- Una tanda se cortó por el límite de sesión de la cuenta (4 corridas con error de ejecución); se descartaron y se repitieron.
- Visto una vez en haiku, no repetido: una respuesta dijo "menos del 1% consumido" sin señal (el kernel prohíbe inventar porcentajes). Segundo caso visto (el primero, en la unidad 27); queda anotado, no medido.
- `restraint/qa-unasked` sigue con `project.sh` (US-012 sin construir), que es lo que mide.
- US$6.4 las cuatro tandas.

## Unidad 14: `nzt-ship` (4 hojas)

- Sin pérdida de contenido: `check-references.sh` 37 de 37 `ok`. `## Contents` en `release` (150 líneas). Ninguna hoja de ship citaba a otra: sin Read with en el router de ship.
- **Router de área `nzt-ship-backend-dotnet`**: su columna Read with nombraba las hojas genéricas como skills; ahora las lee por ruta (`../nzt-ship/references/release.md`, `pipeline.md`, `observability.md`), según la decisión 2 y §4 de la spec (carpetas hermanas instaladas). Si `nzt-ship` ya la hizo leer, no se relee.
- Fila del kernel ampliada (D53): commits, ramas, PR, changelog y tags, pipeline y compuertas, deploy y rollback, y la instrumentación del release.
- Listado: 78 → 74 skills, ~14.995 chars.

| Caso | Juez | Router | Lee la referencia | Juez del caso | Score |
|---|---|---|---|---|---|
| `routing/ship`, línea base | haiku | 3 de 3 | — | 3 de 3 | 1.00 |
| `routing/ship`, después | haiku | 3 de 3 | 2 de 3 (`vcs.md`) | 3 de 3 | **0.89** |
| `stack/ship-pipeline`, piloto | sonnet | 3 de 3 | área 3 de 3 | 3 de 3 | 1.00 |
| `stack/ship-pipeline`, después | sonnet | 3 de 3 | área y genérica 3 de 3 | 2 de 3 | **0.93** |

- **Grader de `routing/ship` corregido**: "subilo" se lee como push o como deploy, y las 6 corridas eligieron push (fila de `vcs.md`), lectura válida que el juez aprueba. El grader pide la referencia de la fila elegida (`vcs.md` o `release.md`), no cuál. Primera tanda con el grader que pedía `release.md`: 0.67.
- **Criterio (d) de `ship-pipeline` aclarado**: el workspace no tiene `DbContext`, y la referencia de .NET dice *"every gate's precondition exists — or the gap is reported and proposed, not papered over"*. Una respuesta dejó el paso comentado con la precondición nombrada y el juez la reprobó 3–0. Ahora cuenta presente-y-desactivado con la precondición y la propuesta; omitido en silencio sigue sin contar.
- **Fallos que quedan, por traza:**
  - `ship` (2 de 6 corridas sin referencia): una vio la US-012 sin construir y respondió solo con las reglas del router, sin elegir fila; otra hizo `Glob vcs.md` en el workspace en vez de leer en la carpeta de la skill. Mismos dos patrones que la corrida de verify sin referencia de la unidad 28: **preguntar antes de leer** y **buscar la referencia en el workspace**. Son transversales a todos los routers: van a la unidad 21 (kernel), no a este router.
  - `ship-pipeline` (1 de 3): la respuesta tiene las cuatro condiciones; juez sonnet 2–1 sin motivo guardado en el reporte. No se repitió en las otras 5 corridas con sonnet: ruido del juez.
- US$3.5 las dos tandas.

## Unidad 15: `nzt-architecture` (10 hojas + `diagrams` y sus 3)

- 13 referencias: el sub-router `diagrams` pasa a `references/diagrams.md` (referencia base) y sus hojas a `diagrams-components.md`, `diagrams-domain.md` y `diagrams-behavior.md` (decisión 3, regla 2). El router lee cada una de dibujo con `diagrams.md` (Read with), y `diagrams.md` sola para decidir y ofrecer.
- **`check-references.sh` extendido**: (1) resuelve hojas anidadas probando cada guion como separador de carpeta (`diagrams-behavior.md` ← `diagrams/behavior/SKILL.md`); (2) cancela pares `-X`/`+X` con el mismo texto, que son alineación del diff al insertar `## Contents` (pasó en `diagrams-behavior`, contenido idéntico byte a byte). Cualquier texto distinto sigue fallando: lo prueba el FAIL de `diagrams.md`.
- **Resultado: 49 `ok` + 1 FAIL revisado a mano** (`diagrams.md`, regla 3): *"load the skill that draws it"* pasa a *"the guidance that draws it … the router's table says which file goes with this one"*, y la columna `Load` a `Drawn by`. Se conserva lo que dice (límite de nodos y convenciones); cambia solo a dónde manda.
- **El párrafo R2 extendido de `design-feature` y `design-product` queda intacto**: además de "cargá el router" dice que el protocolo de preguntas del router es el que corre la hoja, y sigue siendo cierto (el router es skill). Por eso `design-feature` lleva su `## Contents` con 4 secciones por renglón: queda en 200 líneas. `## Contents` en las 11 de más de 100.
- Router en 200 líneas. Fila del kernel ampliada (D53): modelo de dominio y contextos, ADR y RFC, deuda técnica, revisión de una estructura existente y diagramas. Ningún otro router nombraba hojas de architecture. Listado: 74 → 61 skills, ~12.814 chars.
- **Graders**: `design-mode` y `diagram-offered` suman `design-feature-read`. Los negativos de `restraint` (`design-unasked`, `no-diagram`) pasan de Skill a Read con el mismo `max: 0`: con Skill pasarían siempre, porque esas skills ya no existen. `read-the-stack` de `diagram-offered` pasa de `'stack'` a `'Docs[/\\]+\w+-stack-'`: con D50 `'stack'` también se cumplía leyendo `references/stack.md`.

| Caso (juez haiku, 3 corridas) | Línea base | Después | Lee la referencia |
|---|---|---|---|
| `routing/design-mode` | 0.58 | **0.60** | `design-feature.md` 2 de 3 |
| `routing/diagram-offered` | 0.78 | **0.83** | `design-feature.md` 1 de 3 |
| `restraint/design-unasked` | 0.75 | **0.75** | ninguna de diseño, como se pide |
| `restraint/no-diagram` | 1.00 | **1.00** | ninguna de diagramas, como se pide |

- **Sin regresiones contra la línea base.** Los fallos son los de antes, y por traza son **defectos de los casos**, el mismo patrón que la unidad 28:
  - `design-mode` y `diagram-offered` piden diseñar el cobro con tarjeta, pero su scaffold (`project.sh`) no tiene ninguna regla ni historia de cobro. Las corridas que no leen `design-feature.md` paran antes de elegir fila: *"lo que pedís no figura en la spec; si lo diseño estaría inventando reglas"*. Es lo que manda el set. `questions-have-ids` (QT-0) falla 3 de 3, como en la línea base.
  - `design-unasked` va a build sin diseño (correcto), pero en la misma respuesta pregunta los huecos funcionales de la US-012 de `project.sh` (máximo de `pageSize`, mensaje vacío); el juez haiku lo lee como "ronda de preguntas técnicas" 3–0.
- US$3.0.

## Unidad 30: la nota de nombres viejos, como instrucción

Pedido del usuario: la nota *"The references, and other phases, still name these by their old skill names … those are this table's rows, never skills to load"* contaba la historia de la migración y no decía de dónde leer. **No se podía sacar**: las referencias siguen nombrando `nzt-<router>-<x>` (no se tocan, para que el diff sin pérdidas pruebe que no se perdió nada), y sin traducción el agente intenta cargar una skill que ya no existe. Se reescribió en los 6 routers como instrucción:

> Wherever a file names `nzt-architecture-<name>`, it means `references/<name>.md` in this folder (`nzt-architecture-adr` → `references/adr.md`): read that file — it is not a skill.

En ship se agrega que `nzt-ship-backend-dotnet` sí es skill (su router de área). **Queda para la unidad 21**: un nombre de *otro* router (una referencia de architecture que nombra `nzt-verify-bug`) no lo cubre la nota de un router; va como regla general en el kernel.

## Unidad 29: los casos de architecture al máximo

Pedido del usuario tras la 15. Cuatro tandas con juez sonnet (una más se cortó por el límite semanal de la cuenta y se descartó).

**Arreglos en los casos** (fixtures nuevos; `project.sh` no se toca):
- `_fixtures/charge-spec.sh` para `design-mode` y `diagram-offered`: F-002, cobro con tarjeta especificado y sin diseñar (RN-01..04, US-020 con tres criterios), la pasarela con nombre (PagoSur) y su documentación en `Docs/integrations/pagosur.md` —la fuente que el agente investiga, porque el caso no tiene red—, la tarjeta tokenizada en el cliente (`Docs/domain-model.md`), y que F-002 reemplaza la confirmación sin cobro de F-001. Cada uno de esos datos lo pidió el agente en una traza. `read-the-feature` pasa de `F-001-pedidos` a `F-002-cobro`.
- `_fixtures/story-specified.sh` para `design-unasked`: US-012 sin huecos (máximo 100, mensaje vacío, desempate, columnas) y `Docs/domain-model.md`.
- Criterios aclarados, sin cambiar PASS ni FAIL: en `design-unasked`, una pregunta sobre un hueco de la historia o el alcance, o frenar por la aprobación del plan, no es la ronda de diseño; en `design-mode`, decir que un dato de la pasarela no se pudo verificar sin red y pedir acceso a la fuente no es preguntar el dato.

**Arreglos en el set (router de architecture, sigue en 200 líneas):**
- Filas de `design-feature` y `design-product` con Read with `references/diagrams.md`, y el párrafo de diagramas dice que se lee **antes de mostrar el plan**: el diagrama se ofrece mientras se planifica el documento. Antes, ninguna corrida leía `diagrams.md` y ofrecían el diagrama sin decir qué se pierde (la regla está en `diagrams.md`). Las dos hojas nombraban `nzt-architecture-diagrams` como la que decide y ofrece: la fila hace explícito lo que antes era una carga de skill.
- `QT-NN` con su forma (`QT-01`, `QT-02`…) y **toda respuesta nombra cada pregunta por su id**: una corrida usó `QT-A`, otras listaban sin id.
- El modo gobierna los detalles, así que **no reciben respuesta, ni sugerida, hasta que se elige**: una corrida proponía las respuestas antes del modo y el juez la reprobó con razón.

| Caso | Línea base (haiku) | Unidad 15 (haiku) | Final (sonnet) | Lee la referencia |
|---|---|---|---|---|
| `routing/design-mode` | 0.58 | 0.60 | **1.00** | `design-feature.md` 3 de 3 |
| `routing/diagram-offered` | 0.78 | 0.83 | **1.00** | `design-feature.md` 3 de 3 |
| `restraint/design-unasked` | 0.75 | 0.75 | **1.00** | ninguna de diseño, como se pide |
| `restraint/no-diagram` | 1.00 | 1.00 | **1.00** | ninguna de diagramas, como se pide |

- Estos cuatro casos se miden con sonnet desde acá: los fixtures cambiaron.
- Costo: ~US$16 las cinco tandas.

## Unidad 16: `nzt-build` (8 hojas propias)

- Sin pérdida de contenido: `check-references.sh` 58 `ok` + el FAIL ya revisado de `diagrams.md`. `## Contents` en `implement` (153 líneas) y `tests` (186). Router en 159 líneas, tabla Read / Read with: `implement` (historia y defecto) con `tests.md`; `tdd` con `tests.md` e `implement.md`. La nota de nombres viejos aclara que los routers de área y `nzt-build-csharp` sí son skills.
- **Citas de otros routers a estas guías**: la hoja `testing` de .NET dice *"Load `nzt-build-backend-dotnet` and `nzt-build-tests`"*, y las referencias de ship .NET nombran `nzt-build-dependencies` y `nzt-build-secrets`. Los dos routers de área llevan ahora la nota *"means `../nzt-build/references/<name>.md`: read that file — it is not a skill"*, como ship en la unidad 14. El router de verify ya no nombra `nzt-build-tests`. Las menciones dentro de referencias de otros routers (`architecture/stack.md`, `discovery/change.md`, `verify/review.md`) no se tocan (diff sin pérdidas): siguen para la regla general del kernel en la unidad 21.
- Fila del kernel ampliada (D53): historia, defecto, relevamiento, refactor, quitar comportamiento, paquetes, secretos y tests que viajan con el código, test-first si el stack lo eligió.
- Listado: 61 → 53 skills, ~11.490 chars.
- **Grader de `routing/build-story`**: `router-before-leaf` pasa de Skill `nzt-build-` a Read `references/implement.md` (con Skill también lo cumplía `nzt-build-backend-dotnet`), y se suma `implement-read`. Los `build-fired` de restraint miden el router y no cambian.

| Caso (juez haiku, 3 corridas) | Línea base | Después | Lee la referencia |
|---|---|---|---|
| `routing/build-story` | 0.58 (4 graders) | **0.47** (5 graders) | `implement.md` 0 de 3 |
| `restraint/package-unasked` | 0.75 | **0.83** | `dependencies.md` 0 de 3 |
| `restraint/qa-unasked` | 0.92 | **0.92** | `implement.md` 3 de 3 |
| `restraint/test-levels-unasked` | 0.60 | **0.87** | `implement.md` y `tests.md` 3 de 3 |
| `restraint/design-unasked` | 0.75 | 0.75 | se mide con sonnet desde la 29 (1.00): con haiku no compara |

- **`build-story`, diagnóstico por traza (el 0 de 3 de la línea base que quedó abierto en la unidad 25)**: defecto del caso, no de la migración. En 2 de 3 corridas, `nzt` → `nzt-plan`: no hay `Plan/state.json` y la historia toca backend, frontend y verify, que es trabajo de más de una unidad; el set manda planificar y parar, y lo hace. Así, `build-fired` no se puede cumplir en el primer turno. En la tercera corrida carga `nzt-build`, pero pregunta los huecos de la US-012 de `project.sh` (máximo de `pageSize`, texto del estado vacío) sin leer `implement.md`: es el patrón *preguntar antes de leer* anotado para la unidad 21, sumado al mismo hueco de fixture que `story-specified.sh` cerró en la 29. La restricción que el caso mide (nada se ejecuta sin plan aprobado) se cumple 3 de 3.
- **`package-unasked`**: el router basta para la restricción, pero ninguna corrida lee `dependencies.md` (mismo patrón). `qa-unasked` no lee `tests.md` pese al Read with de `implement`.
- US$4.7 las dos tandas (la primera de restraint no corrió: el glob con llaves no matchea).

## Unidad 31: `routing/build-story` con plan aprobado

Aprobada por el usuario tras la 16. Juez sonnet, 3 corridas por tanda.

- **Scaffold**: `story-specified.sh` (US-012 sin huecos, modelo de dominio) y un `Plan/state.json` aprobado con "Implementar US-012" en `todo` y "Probar US-012" después, escrito en el scaffold del caso (el fixture compartido no se toca). Con el plan aprobado, la ruta correcta es `nzt-build`, y el caso deja de medir el freno principal: sin plan, `nzt` → `nzt-plan` y para (3 de 3 por traza en la 16). Descripción y `expected_outcome` reescritos en ese sentido.
- **`allowed_tools` suma `Write` y `Edit`**: solo lectura, con el plan aprobado el agente para en *"no tengo herramientas de escritura"* antes de llegar a la referencia (2 de 3 en la primera tanda). El runner solo los da con `--allow-tools Write Edit`; sin ese permiso el caso corre de solo lectura (anotado en el caso).

| Tanda | Router | Lee `implement.md` | Juez | Score |
|---|---|---|---|---|
| Unidad 16 (haiku, `project.sh`, sin plan) | 1 de 3 | 0 de 3 | 3 de 3 | 0.47 |
| Fixture nuevo, solo lectura | 2 de 3 | 1 de 3 | 3 de 3 | 0.67 |
| Fixture nuevo, solo lectura (sin permiso del runner) | 3 de 3 | 1 de 3 | 3 de 3 | 0.73 |
| Fixture nuevo, `--allow-tools Write Edit` | 3 de 3 | 2 de 3 | 3 de 3 | **0.87** |

- **El fallo que queda, por traza**: carga `nzt-build`, lee historia, stack y código, y frena con dos bloqueos reales del fixture (`project.sh` no tiene `Program.cs`, `DbContext` ni `.csproj` de Web, y sin Bash no puede compilar ni generar la migración); propone una unidad de setup y lo deja en `waiting_on`. Es correcto según el set, pero responde **sin leer la referencia de la fila**: el patrón de la unidad 21. Llevarlo a 1.00 por el caso pediría un proyecto que compile y Bash; se remide después de la 21.
- Se mide con sonnet y `--allow-tools Write Edit` desde acá. US$3.2 las tres tandas.

## Unidad 17: `nzt-build-csharp` (`dtos`, `linq`)

- Sin pérdida de contenido: `check-references.sh` 60 `ok` + el FAIL revisado de `diagrams.md`. `## Contents` en las dos (139 y 166 líneas). **`linq` gana fila** (era huérfana: ningún router la mandaba a leer). El router queda en 199 líneas: tabla de dos filas y la nota de nombres viejos en una línea.
- El router de Blazor manda a `../nzt-build-csharp/references/dtos.md` en lugar de cargar `nzt-build-csharp-dtos`; la nota del router .NET suma `nzt-build-csharp-<name>` (la hoja `ef-core-pagination` lo nombra). Sin fila nueva en el kernel: llegar a C# es la fila de build → router de área → `nzt-build-csharp`, que sigue siendo skill.
- Grader nuevo en `stack/ef-listado`: `dtos-read`. Listado: 53 → 51 skills, ~11.066 chars.

| Caso (juez haiku, 3 corridas) | Línea base | Después | Lee la referencia |
|---|---|---|---|
| `blazor-render` | 0.60 | **0.73** | `dtos.md` 2 de 3 |
| `ef-listado` | 0.83 (5 graders) | **0.67** (6) | `dtos.md` 1 de 3 |
| `endpoint-axis` | 0.75 | **0.67** | no llega al área (igual que la línea base) |
| `entity-shape` | 0.25 | **0.25** | no llega al área (igual) |
| `not-dotnet` | 0.83 | **0.75** | ninguna de C#, como se pide |
| `result-inline` | 0.78 | **0.67** | `dtos.md` 2 de 3 |
| `ship-pipeline` | — | — | cortado por el límite de sesión; no vale |

- **Diagnóstico por traza: sin regresión atribuible al cambio.** En toda corrida que llega a un router de área se carga `nzt-build-csharp`, y donde escribe DTOs lee `dtos.md`. Las caídas son corridas que **frenan sin mostrar código** por huecos de `project.sh`, el patrón de las unidades 28, 29 y 31: en `ef-listado`, máximo de `pageSize` sin definir, sin entidad `Order` y caso de solo lectura (las dos corridas sin código son las mismas que no leen `dtos.md` ni escriben `AsNoTracking`); en `result-inline`, no hay spec de "confirmar pedido" y una corrida aplica *no escribo código que ninguna spec pida*, que es lo que manda el set. `ordering-ends-in-a-unique-column` y `builds-with-the-projects-stack` fallan 3 de 3 como en la línea base.
- Los casos de stack heredan los huecos de `project.sh`; llevarlos al máximo pide fixtures como `story-specified.sh` con `Write`/`Edit`. Queda propuesto, sin aprobar.
- US$7.9 (se corrieron los 7 casos de stack: todos cargan `nzt-build-csharp`).

## Unidad 32: los casos de stack sin los huecos de `project.sh`

Aprobada por el usuario tras la 17. Fixture nuevo `_fixtures/stack-ready.sh` sobre `story-specified.sh`, para `ef-listado`, `result-inline`, `endpoint-axis`, `entity-shape` y `blazor-render`. Cada operación que piden tiene historia con códigos de estado: US-010 alta de pedido, US-013 confirmar (RN-03, sin líneas no se confirma) y F-003 / US-030 alta de cliente. El modelo de dominio tiene cada campo (Customer.Status, OrderLine), y el manifiesto coincide con el stack (`Directory.Packages.props`, paquetes en los `.csproj`, `Pedidos.Web.Client`, proyecto de tests, `.slnx`). El `goal` de cada `approve.sh` nombra la historia. `not-dotnet` (Node) y `ship-pipeline` (mide que falte el `DbContext`) no cambian.

**Desvío de lo acordado**: los casos quedan de solo lectura. Sus graders regex leen el último mensaje (*"Mostrame el código"*), y con Write el código puede quedar en disco y no en la respuesta. Con los huecos cerrados, el borrador en el chat alcanzó.

| Caso (juez sonnet, 3 corridas) | Línea base (haiku) | Unidad 17 (haiku) | `stack-ready` (sonnet) |
|---|---|---|---|
| `ef-listado` | 0.83 | 0.67 | **1.00** — `dtos.md` 3 de 3, hojas de EF 3 de 3 |
| `entity-shape` | 0.25 | 0.25 | **0.92** — la hoja DDD 3 de 3 (antes 0 de 3) |
| `blazor-render` | 0.60 | 0.73 | **0.93** — `render-auto` 3 de 3 |
| `result-inline` | 0.78 | 0.67 | **0.67** — juez 0 de 3 |
| `endpoint-axis` | 0.75 | 0.67 | **0.50** — no llega al área |

Los huecos de `project.sh` eran el techo: con historias y manifiesto completos, las hojas de stack que en la línea base "no se cargaban" se cargan 3 de 3. **Los dos que quedan no son de fixture: el caso choca con el set** (decisión del usuario, sin tomar):

- **`result-inline`** (3 de 3, el mismo código): `Order.Confirm` devuelve la lista de errores y el caso de uso hace `if (errors.Count > 0) return …Failure(…)`: **es el patrón de la hoja DDD** para un método que cambia un agregado ("Changing: methods return the errors"; el null-check es solo para `Create`). Lo que la hoja no cubre lo forzó el fixture: la US-013 de `stack-ready.sh` da a las dos fallas de `Confirm` códigos distintos (409 ya confirmado, 422 sin líneas), y para separarlos el agente inventa `errors.Contains(AlreadyConfirmed)` antes del `Count > 0`. Opciones: (a) fixture con un solo código para las fallas de `Confirm` y criterio del juez ajustado (404 + un return por la lista); (b) la hoja dice qué hacer cuando los errores de un método llevan códigos distintos. Recomendado (a): el hueco lo creó el fixture, no un proyecto real.
- **`endpoint-axis`** (3 de 3): pide *"agregá el controller"* y el stack dice minimal APIs. El agente objeta, ofrece las dos opciones y **pregunta sin escribir nada**, y ni siquiera llega al router de área. El kernel lo sostiene: contradecir una restricción acordada es un *error* que no se construye hasta resolverlo (aunque *"independent work continues"*, y no avanza con el caso de uso). Además la unidad dice "exponer" una operación que no existe. Opciones: (a) el caso acepta objetar y avanzar con lo que no depende (caso de uso, dominio) y lo mide así; (b) el kernel o el router de build distinguen la palabra coloquial ("controller" por "endpoint") de un pedido de cambiar el stack: seguir el stack y decirlo en una línea.
- US$10 las cinco tandas.

**Decisiones del usuario (2026-10-06) y su resultado:**

- **`result-inline`, opción (a)**: en `stack-ready.sh` las dos fallas de `Confirm` dan 409, y el criterio del juez sigue la hoja DDD (404 en el null-check, 409 en el `return` de la lista de errores que devuelve `Confirm`; sigue fallando con cualquier helper). Ninguna skill tocada. Sonnet, 3 corridas: **1.00** (una tanda anterior se cortó por el límite de sesión y se descartó).
- **`endpoint-axis`, opción (b) elegida, no aplicada**: el usuario pidió además *no perder ni cambiar comportamiento*. Medido el mismo caso con `stack-ready.sh` contra el plugin de `main` (7b2f37c, worktree aparte): **0.50, las mismas dos fallas 3 de 3, el mismo tipo de respuesta** (objeta "controller", ofrece minimal o cambiar el stack, pregunta sin escribir código). El refactor no perdió nada: así funcionaba el set. La (b) sería comportamiento nuevo; queda para que el usuario la confirme sabiendo eso. **Decidido por el usuario tras la 18: se deja como está** (sin la b; el caso queda en 0.50 igual que `main`).

## Unidad 18: nzt-build-frontend-blazor a `references/`

Eran **9 hojas, no 11** como decía la fila del plan: `architecture-vertical-slice`, `components`, `forms`, `performance`, `prerendering` y las cuatro `render-*`. `check-references.sh`: 69 ok (más `diagrams.md`, ya revisado en la 15); `## Contents` en las tres que pasan de 100 líneas (vertical-slice, components, performance). 42 skills en `dist/`.

- **Router**: tablas con columnas Read / Read with. Los modos de render se leen con `components.md` (cada hoja dice *"everything in components still applies"*), `static` además con `forms.md` cuando la página postea, `forms.md` con `components.md`, y `prerendering.md` con la referencia del modo que eligió el stack — eso reemplaza su línea R2, que nombraba *"the render mode's skill"*. Nota de nombres viejos como en los otros routers.
- **Tres "load" que quedan en las referencias**: `render-auto`, `render-server` y `render-webassembly` dicen *"load `nzt-build-frontend-blazor-prerendering`"* partido en dos líneas, por eso el script no los marcó. No se tocaron: los cubre la nota del router (*"read that file — it is not a skill"*). `performance.md` nombra `nzt-verify-performance`, que ya es referencia de otro router: es el caso de la regla cruzada de la unidad 21.
- **Kernel**: sin cambio; la fila de build ya nombra el área y el router de área tiene las filas (D53). Descripción del router intacta (D53), aunque todavía dice *"skill to load"*.
- **Graders**: `stack/blazor-render` pasa de Skill a Read (render-auto leída, las otras tres sin leer) y suma `components-read`, que su `expected_outcome` ya pedía; `restraint/small-edit` pasa a *ninguna referencia de Blazor leída*.

| Caso (3 corridas) | Antes | Unidad 18 |
|---|---|---|
| `blazor-render` (sonnet, `stack-ready`) | 0.93 (unidad 32) | **1.00** — render-auto y components 3 de 3, ningún otro modo |
| `small-edit` (haiku) | 0.67 (línea base) | **0.67** — ninguna referencia leída 3 de 3; la misma falla del juez (caso de solo lectura, no puede editar) |

US$2.45 las dos tandas (blazor-render 2.02, small-edit 0.43).

## Unidad 19: nzt-build-backend-dotnet sin ef-core a `references/`

19 hojas: `api`, `exceptions`, `security`, `testing`, `use-cases`, `validation` y las de eje (`architecture-*`, `domain-*`, `endpoints-*`, `persistence-*`, `results-*`). `check-references.sh`: 88 ok (más `diagrams.md`). `dist/`: **23 skills, ~4.600 caracteres de listado: bajo el piso de Codex, sin el WARNING de R1**.

- **Router**: tablas Read / Read with. `endpoints-*` con `api.md`, `results-extensions` y `results-filter` con `results-pattern.md` (eso decía su R2), `exceptions` con `use-cases.md`, `testing` con `../nzt-build/references/tests.md`. Nota de nombres viejos: solo los que tienen archivo en `references/`; los de EF Core siguen siendo skills hasta la 20.
- **Citas desde otras skills, por ruta (decisión 2)**: `nzt-build-csharp` → `../nzt-build-backend-dotnet/references/domain-ddd.md`; `nzt-build-frontend-blazor` → `.../references/security.md`. Las hojas de EF Core (todavía skills) nombran `exceptions`, `validation` y `domain-value-objects`: las cubre la nota del router.
- **R2 partido en dos líneas** (`results-extensions`, `results-filter`): se sacó, y `check-references.sh` reconoce ahora esa forma (`Load \`nzt-… before` + `applying this.`). **`testing.md` conserva su R2** porque trae contenido (*"the criteria that decide what is worth testing… live there"*); lo cubre la nota del router, como los "load" de la 18.
- **`domain-ddd.md` partida (opción a, elegida por el usuario)**: en `main` medía exactamente 200; con `## Contents` daba 203, y chocaban el tope de 200 (D3, regla 3) y el índice obligatorio (regla 4). Se cortó antes de `## Creating`: `domain-ddd.md` (107, con índice: entidad, `Rules`/`Errors`, entre agregados, orden del archivo) y `domain-ddd-behaviour.md` (93: `Create`, cambios, agregado mínimo, checklist). Lo único agregado es el título de la segunda. La fila `ddd` del router lee las dos. `check-references.sh` compara la hoja vieja contra las partes juntas (*part* / *ok … + …*); visto fallar cambiando una palabra de la segunda parte. Regla en la spec, §10 regla 14. Build sin WARNING.
- **Graders**: Skill → Read en `entity-shape` (ddd leída, anemic no), `ef-listado` (persistence-direct no), `result-inline` (use-cases), `endpoint-axis` (minimal sí, controllers no). `not-dotnet` sigue con Skill sobre el router de área, que sigue siendo skill.

| Caso (3 corridas) | Antes | Unidad 19 |
|---|---|---|
| `entity-shape` (sonnet, `stack-ready`) | 0.92 (unidad 32) | **0.92**: `domain-ddd.md` 3 de 3, una falla del juez en forma y orden |
| `ef-listado` (sonnet) | 1.00 | **1.00** |
| `result-inline` (sonnet) | 1.00 | **1.00**: `use-cases.md` 3 de 3 |
| `endpoint-axis` (sonnet) | 0.50 (igual que `main`) | **0.42**: misma respuesta (objeta y pregunta sin escribir). La diferencia: en una corrida el regex `no-controller-class` encontró `OrdersController : ControllerBase` **en la explicación**, no en código. Ruido del regex, no regresión |
| `not-dotnet` (haiku) | 0.83 (línea base) | **0.92** |

US$9.33 las cinco tandas.

Después del corte de `domain-ddd` (grader nuevo `ddd-second-part-read`; una primera tanda se cortó por el límite de sesión y se descartó):

| Caso (sonnet, 3 corridas) | Antes del corte | Con las dos partes |
|---|---|---|
| `entity-shape` | 0.92 | **0.87**: las dos partes leídas 3 de 3. Fallas del juez en forma y orden en 2 corridas (votos FAIL×3 y 2 a 1), con el `Customer` conforme a la guía: constructor vacío, `Rules`, `Errors`, propiedades juntas, `Create` con inicializador. Ruido del juez, no del corte |
| `result-inline` | 1.00 | **1.00** |

US$6.36 las dos tandas.

## Unidad 20: EF Core a `references/` de nzt-build-backend-dotnet

`ef-core` (la base) y sus 8 hojas → `references/ef-core.md` y `references/ef-core-<x>.md`, movidas con `git mv` y editadas solo con Edit (frontmatter, R2, `## Contents` en bulk, domain, indexes y queries). `check-references.sh`: **97 ok** (más `diagrams.md`); la regex de R2 suma la forma partida de `ef-core-pagination` (*"Load …, … and"* + *"`…` before applying this."*). **`dist/`: 14 skills, ~2.540 caracteres de listado: el objetivo de la migración (alcance B).**

- **Router**: la sección EF Core lee la base con cualquier fila (columna *Read with*); `ef-core-pagination` además con `ef-core-queries` (eso decía su R2). Se sacó la frase *"the EF Core names below are still skills"*.
- **Cita desde otro router, por ruta**: `nzt-ship-backend-dotnet` → `../nzt-build-backend-dotnet/references/ef-core-migrations.md`. La referencia `ship/.../migrations.md` todavía nombra `nzt-build-backend-dotnet-ef-core-migrations`: es la regla cruzada de la unidad 21.
- **Grader**: `stack/ef-listado` pasa de "alguna hoja de EF disparada" a tres lecturas: la base, `ef-core-pagination` y `ef-core-queries`.

| `ef-listado` (sonnet, 3 corridas) | Resultado |
|---|---|
| Unidad 32 (Skill, cualquier hoja de EF) | 1.00 |
| Migrado, primera tanda | **0.85**: el código pasa todo; `ef-core.md` sin leer en 2 corridas, `ef-core-queries.md` en 1 |
| Repetida con `--keep-temp` | **0.85**. Por traza: las 3 leen la fila (`ef-core-pagination.md`) y 2 se saltean su *Read with* |
| Arreglo en el router (D53: texto de la sección, nunca la descripción): *"Read `references/ef-core.md` first, every time, whatever the row"* y la columna pasa a *"Read with — also required"* | **1.00**: base, queries y pagination leídas 3 de 3 |

Lo visto entra en la unidad 21: **la columna *Read with* se saltea si el router no dice que es obligatoria.** Los demás routers usan la misma columna sin esa frase. US$6.58 las tres tandas.

## Unidad 21: el kernel aprende a leer referencias (D52 + D54)

`core/kernel.md`, sección Routing: la primera línea pide el router aunque se sepa qué guía hay adentro; *"Routers name the leaf skills…"* pasa a un párrafo sobre referencias: desde la carpeta de la skill y nunca buscadas en el workspace, **fila más toda su *Read with* antes de la primera respuesta, aunque sea una pregunta**, un nombre `nzt-<x>` que no es skill se resuelve por el prefijo más largo que sí lo es (cubre las citas cruzadas que quedaron dentro de las referencias: `nzt-verify-performance` en Blazor, `ef-core-migrations` en ship), y **la línea de compactación (D52)**. Kernel 177 líneas, `CLAUDE.md` 190 (techo 200). Spec: D54.

| Caso (3 corridas, `--keep-temp`) | Antes | Unidad 21 | Traza |
|---|---|---|---|
| `routing/ship` (haiku) | 0.89 (unidad 14) | **1.00** | — |
| `routing/build-story` (sonnet, `--allow-tools Write Edit`) | 0.87 (unidad 31) | **0.93** | — |
| `restraint/package-unasked` (haiku) | 0.83 (unidad 16) | **0.83** | `dependencies.md` 0 de 3, igual: la unidad es implementar US-020 y la fila elegida es `implement`; la fila de paquetes no se elige. No es *Read with* |
| `restraint/qa-unasked` (haiku) | 0.92 (unidad 16) | **0.67** | `tests.md` (*Read with* de `implement`) **3 de 3, antes 0 de 3** |

**`qa-unasked` no es regresión del kernel**, medido así: con juez sonnet da 0.50, y **con el kernel anterior** (copia de `dist/plugin` con las dos líneas viejas, mismo plugin) **0.58**, las mismas dos fallas por unanimidad. Las respuestas se frenan por huecos de `project.sh` (máximo de `pageSize` sin definir, `dotnet-ef` fuera del stack) en un caso de solo lectura, y dicen en una línea que orden y paginado quedan *"sin cubrir hasta QA"*, que es lo que el criterio pide; el juez las reprueba igual. Es el patrón de las unidades 28, 31 y 32 (fixture con huecos): **propuesto, sin aprobar**: `qa-unasked` sobre `story-specified.sh` + `--allow-tools Write Edit`, y revisar el criterio. US$7.1 las seis tandas.

## Unidad 34: la fila de Análisis nombra las historias (D55)

Pedido del usuario tras probar NZT instalado: en un producto nuevo, el plan puso en Análisis solo "la spec F-001" y las historias volvieron después como cambio de plan. `nzt-plan`, *How the plan is shown*: *"Analysis produces the spec and its stories."* (misma línea, el router sigue en 200). Caso nuevo `routing/plan-stories` (directorio vacío con `kernel-only.sh`, juez sonnet, `--ablation none`; Write/Edit no concedidos, igual muestra el plan).

| Versión de `nzt-plan` | Historias en la fila de Análisis | Score |
|---|---|---|
| Sin la línea (la de `main`) | 2 de 4 corridas válidas (otras 2 cortadas por límite de sesión) | 0.67 en la tanda completa |
| Con la línea | **3 de 3** | **1.00** |

El caso discrimina. US$1.77 en total.

## Unidad 37: `restraint/qa-unasked` sin huecos de fixture

Aprobada por el usuario el 2026-10-07. Scaffold sobre `story-specified.sh` (stack propio de solo tests unitarios encima), `Write`/`Edit` en el caso (`--allow-tools Write Edit`), `max_turns` 40. Juez sonnet, `--ablation none`.

| Tanda | Score | Qué mostró la respuesta |
|---|---|---|
| Fixture nuevo, criterios viejos | 0.67 | `no-application-tests` 0 de 3 por unanimidad, pero **ninguna corrida diseña tests de aplicación**: sin shell, piden al usuario `dotnet build` y los tests unitarios, y el juez lo lee como "verificar a mano" |
| Criterio 1 aclarado (compilar y correr los unitarios es build) | 0.75 | `no-application-tests` 3 de 3; `leaves-it-for-qa` 0 de 3: dos dicen "sin cubrir hasta QA" y el juez lee el freno por falta de shell como "esperar a QA" |
| Criterio 2 aclarado (frenar sin shell o por una pieza faltante no es esperar a QA) | **0.83** | Las 2 fallas son legítimas: frenan antes de construir y no dicen qué queda sin probar |

**Sin regresión de NZT y caso sano**: 0.67 haiku / 0.50 sonnet antes → 0.83 sonnet. Lo que queda es el fixture: `project.sh` trae un `Pedidos.Api` esqueleto (`GetOrderById.cs` que no compila, sin paquetes, sin `Directory.Packages.props`), y el agente frena por eso antes de hablar de cobertura. Palanca posible, no aplicada: una base como la de `stack-ready.sh` con un manifiesto de solo tests unitarios (la de `stack-ready` trae Testcontainers, que contradice este stack). US$7.92 las tres tandas. Los temporales de la primera tanda (`--keep-temp`) no se pudieron borrar desde la sesión.

## Unidad 35 (24a): suite completa contra la línea base

Aprobada por el usuario el 2026-10-07, corrida en autónomo. `bash install/build.sh` (14 skills, ~2.540 chars, sin WARNING) y `check-references.sh` 97 ok. Suite completa, **31 casos × 3 corridas**, `--ablation none`, **juez sonnet**, `--allow-tools Write Edit` (solo llega a los casos que lo declaran en `allowed_tools`), `-j 2`.

**Corridas invalidadas por el límite de sesión de la cuenta:** la primera tanda de stack (21 de 21 corridas con `exit 1: You've hit your session limit`, descartada y repetida) y, en la repetición, una corrida de `result-inline` y otra de `ship-pipeline`; esos dos casos se repitieron enteros. En la tabla vale la tanda sin errores de cada caso.

Reportes: `evals/results/2026-10-07-u35-routing.*`, `2026-10-07-u35-stack.*`, `2026-10-08-u35-stack-rerun.*` (ship-pipeline), `2026-10-08-u35-result-inline.*`, `2026-10-08-u35-restraint.*`.

| Grupo | Caso | Línea base (haiku) | Unidad 35 (sonnet) | Falla que queda |
|---|---|---|---|---|
| routing | kernel-loaded | 1.00 | **1.00** | — |
| routing | learn | 1.00 | **1.00** | — |
| routing | ship-unnamed-environment | 1.00 | **1.00** | — |
| routing | diagram-offered | 0.78 | **1.00** | — |
| routing | verify | 0.78 | **1.00** | — |
| routing | discovery | 0.67 | **1.00** | — |
| routing | manual | 0.67 | **1.00** | — |
| routing | build-story | 0.58 | **0.93** | juez 2 a 1 en una corrida |
| routing | design-mode | 0.58 | **1.00** | — |
| routing | close-feature | 0.50 | **0.83** | `sweeps-and-records` 2 de 3: objeta cerrar porque el fixture no tiene el código de US-012 (la misma calibración vista desde la unidad 9) |
| routing | test-data | 0.33 | **0.92** | `creates-the-data` 1 de 3 (3-0). La respuesta crea los datos con SQL más su limpieza y pregunta quién los corre; lo probable es que el juez lea como "achicar el plan" la línea que deja afuera la parte de pantalla |
| routing | learn-resume · plan-stories · ux-mockup · ux-review · ux-system | (casos nuevos) | **1.00** cada uno | — |
| stack | ef-listado | 0.83 | **1.00** | — |
| stack | not-dotnet | 0.83 | **1.00** | — (medido dos veces: en el tag stack y en el tag restraint) |
| stack | result-inline | 0.78 | **1.00** | — |
| stack | endpoint-axis | 0.75 | **0.50** | Igual que `main` desde la unidad 32 (objeta y pregunta, no escribe): no es regresión de la migración |
| stack | blazor-render | 0.60 | **0.89** | `no-http-client-in-the-component` 2 de 3: **ruido del regex**: `HttpClient` aparece en la explicación de cómo registrar el cliente tipado, no en el componente (el juez aprobó el componente 3 de 3) |
| stack | entity-shape | 0.25 | **0.93** | juez en forma y orden, 1 de 3 (como en la unidad 19) |
| stack | ship-pipeline | (0.75, piloto) | **0.87** | `gates-that-hold` 2 de 3: **criterio (d) más estricto que la guía**. Las respuestas dejan afuera el gate de EF y lo dicen, con la precondición que falta y cómo agregarla; `pipeline.md` pide *"the gap is reported and proposed, not papered over"*, y el criterio exige el paso presente y deshabilitado. En la tanda invalidada había dado 3 de 3 |
| restraint | trivial | 1.00 | **1.00** | — |
| restraint | no-diagram | 1.00 | **1.00** | — |
| restraint | design-unasked | 0.75 | **1.00** | — |
| restraint | small-edit | 0.67 | **1.00** | — |
| restraint | qa-unasked | 0.92 | **0.83** | Igual que la unidad 37 (sonnet): base esqueleto de `project.sh` |
| restraint | foreign-repo | 0.89 | **0.78** | `follows-the-house-style` 2 de 3: `foreign-repo.sh` no trae `Invoice` ni `BillingContext`; el agente propone el método en el estilo del archivo, pregunta los campos antes de escribir y objeta una vez copiar el `NotFoundException` del vecino |
| restraint | package-unasked | 0.75 | **0.75** | `proposes-with-alternative` 3 de 3: frena por los huecos de `project.sh` (no hay confirmación de pedido, ni `DbContext`, ni `Result`) y nombra SMTP o SendGrid sin decir qué compromete cada uno |
| restraint | test-levels-unasked | 0.60 | **0.80** | `says-what-is-uncovered` 3 de 3: dice lo que el criterio pide (ningún nivel, sin cubrir hasta QA, el opt-in `Test levels`), pero frena por los huecos de `project.sh` y eso dispara la cláusula de FAIL |

**Medias** (casos de la línea base, igual a igual): routing **0.72 → 0.97**, stack **0.67 → 0.89**, restraint **0.82 → 0.90**. Contando los casos nuevos: routing 0.98 (16), stack 0.88 (7).

**Lectura (observaciones, no reglas):**

1. **Ningún caso queda por debajo de su línea base por causa del set.** Los tres que bajan o empatan (`endpoint-axis`, `foreign-repo`, `qa-unasked`) se explican por la traza: `endpoint-axis` da lo mismo que `main`, y los otros dos frenan por fixtures incompletos.
2. **Los graders de ruteo pasan en todos los casos**: ningún `*-fired` ni `*-read` falló en las tandas válidas. Las fallas que quedan son todas del juez o de un regex, sobre la respuesta.
3. **El patrón que más se repite es el fixture `project.sh` con huecos**: `package-unasked`, `test-levels-unasked` y `qa-unasked`, más `foreign-repo.sh` con la misma forma.
4. Comparación con dos jueces distintos: la línea base fue haiku y esta tanda es sonnet, que en este set reprueba menos respuestas correctas (unidades 7, 27 y 28). Los graders deterministas (`tool_used`, `tool_order`, `regex`) no dependen del juez y son los que sostienen la mejora de ruteo.

**Costo:** US$46.21 en total (routing 16.70, stack 17.61 + 0.48 de la tanda invalidada, repeticiones 1.11 + 2.91, restraint 7.40).
