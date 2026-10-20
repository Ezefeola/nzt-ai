# Preguntas · regla del kernel, nzt-questions, nzt-hub y nzt-state — 2026-10-17

Unidad 210, sobre D64 de `specs/nzt-core.md`, `specs/mods/nzt-questions/spec.md`, el cambio
0.2.0 de `specs/mods/nzt-hub/spec.md` y RN-panel-preguntas de `specs/mods/nzt-state/spec.md`.

> **Corrido y cerrado** el 2026-10-17: todos los escenarios pasaron (corrida 3 al final).

**Con qué se corre:**
- **V-** (agente, terminal): `claude plugin validate`, `claude plugin test`, `tsc` con el tsconfig
  del scratchpad que dicen los tipos de la 2.1.302, `install/build.sh` e `install/check-references.sh`.
- **L-** (sesión de Claude Code en vivo, **la maneja el usuario**, el agente anota lo que trae):
  el agente no ve los paneles. Hace falta una sesión con `nzt-questions`, `nzt-hub` y `nzt-state`
  cargados desde `mods/`.
- **Datos:** ninguno que crear ni borrar. Las preguntas de L-02 a L-05 las escribe el agente en su
  respuesta, con la forma de D64 (dos con opciones y una sin opciones). El estado de los mods es
  de la sesión y se va con ella.
- **Efectos materiales:** ninguno. L-03 escribe en el prompt **sin mandar**.

## Escenarios

| # | Escenario | Esperado | Origen | Estado |
|---|---|---|---|---|
| V-01 | validate y test de `nzt-questions`, `nzt-hub` y `nzt-state` | validate pasa; 22, 17 y 32 tests verdes | unidades 207-209 | pending |
| V-02 | `tsc` de los tres mods, sin los tests | 0 errores | regla de los mods | pending |
| V-03 | `install/build.sh` | `CLAUDE.md` y `AGENTS.md` ≤ 200 líneas, sin warnings; `dist/CLAUDE.md` trae *Questions* y la línea de `AskUserQuestion`, `dist/AGENTS.md` la de `request_user_input` | C3, D64 | pending |
| V-04 | `install/check-references.sh` y links relativos de los archivos tocados | sin referencias rotas; cada link de los README y specs tocados apunta a un archivo que existe | D50 | pending |
| L-01 | Abrir la sesión con los tres mods | ninguna línea *hooks module did not load* ni *refused* de los tres | memoria de los mods | pending |
| L-02 | Terminar un turno con preguntas, sin el panel abierto | se abre solo al costado (terminal de 144 columnas o más) o avisa una vez si no hay lugar; el índice muestra las 3 con su identificador o su número | RN-preg-apertura, -forma | pending |
| L-03 | Contestar: una opción, *Otra respuesta* en la sin opciones, una nota, saltear una; Revisar; Llevar con algo escrito en el prompt | el mensaje tiene una línea por contestada (`QT-01: A — …`, `3: …`, ` · nota: …`), queda después del borrador y **no se manda**; la salteada no va | RN-preg-mensaje, -borrador, -saltear | pending |
| L-04 | `nzt-state` con preguntas pendientes, antes y después de llevarlas | antes: `? n preguntas para contestar` y **Contestar ›** abre `nzt-questions`; después de llevar todas, el aviso no está | RN-panel-preguntas, QT-05 | pending |
| L-05 | `nzt-hub` | dos grupos con título; Preguntas con su versión y **Abrir ›**; Contexto dice *de NZT*; `n de 5` | RN-hub-grupos, -capa-nzt | pending |
| L-06 | `nzt-hub` angosto, apretar Abrir mientras Claude trabaja | `al terminar el turno` cortado con `…`, nada fuera de la tarjeta | Diseño 0.2.0 | pending |
| L-07 | `/nzt-questions` dos veces | abre y cierra | RN-preg-apertura | pending |

Prioridad: L-01, L-03 y L-04 primero (que cargue, que no mande nada por su cuenta, y la lectura
entre mods, que es lo único sin verificar). L-06 es la de menos riesgo.

## Lo que este plan no cubre

- **Que el agente use la tool de preguntas por la regla del kernel**: es comportamiento del modelo y
  se mide con evals, no acá. Tampoco se reinstala el kernel en `~/.claude/CLAUDE.md`: eso es la 211.
- **Codex**: no tiene mods, y `request_user_input` está detrás de un flag apagado.
- **Un subagente o un turno cortado con preguntas**: cubiertos por test (V-01), no en vivo.
- **La app de escritorio y la del celular.**

## Resultados

Plan aprobado por el usuario el 2026-10-17, por la tool de preguntas. `nzt-questions` se cargó
**copiado** en la carpeta de mods de la sesión (`~/.claude/dev-mods/<sesión>/nzt-questions`), con
la recarga en caliente activada por el usuario; la copia se borra en la 211. `nzt-state` y
`nzt-hub` se leen de `mods/` (el `/reload-plugins` del usuario).

### Corrida 1 · 2026-10-17

| # | Resultado | Evidencia |
|---|---|---|
| V-01 | **passed** | validate ok en los tres; tests 22/22, 17/17 y 32/32 |
| V-02 | **passed** | `tsc` exit 0 en los tres (tsconfig del scratchpad, tipos de la 2.1.302) |
| V-03 | **passed** | build exit 0, sin warnings; `CLAUDE.md` y `AGENTS.md` en 200 líneas; `## Questions` en los dos; línea 194 con `AskUserQuestion` y con `request_user_input` |
| V-04 | **passed** | `check-references.sh` exit 0 (131 referencias, 0 movidas); 24 links relativos en los 10 archivos tocados, ninguno roto |
| L-01 | pending | el mod cargó (el comando respondió) y el usuario no trajo líneas de error; falta confirmarlo |
| L-02 | **passed** | con el panel ya abierto, las 3 preguntas aparecieron y se contestaron; *abrirse solo* no se vio, porque estaba abierto |
| L-03 | **passed**, parcial | en el prompt quedó, sin mandarse: `QT-90: A — Acento de NZT` / `QT-91: A — Una sola vez` / `3: No se`. El usuario contestó las tres, así que no se probaron saltear, la nota ni el borrador |
| L-07 | pending | el usuario abrió `/nzt-questions`: *"Panel de preguntas abierto."*; falta cerrarlo con el mismo comando |

**Hallazgo (usuario):** *"se veia feo las opciones … decia: A Acento de NZT Recomendado y debajo decia
el mismo de los otros mods"*. Es un cambio de diseño, no un defecto contra la spec: el diseño ponía
la explicación debajo. Arreglado en la misma unidad, a pedido del usuario: cada opción va en una
línea corrida (spec, sección Diseño). Validate, 22/22 tests y `tsc` siguen verdes; se re-prueba en
la corrida 2.

### Corrida 2 · 2026-10-17

Las mismas 3 preguntas. Por Q-10, como ya se enviaron, vuelven con su respuesta cargada.

- La sesión cambió de id después de un `/reload-plugins`, y el mod se volvió a copiar a la
  carpeta de mods de la sesión nueva.
- Con la navegación de la 213 probada en vivo, el usuario pidió volver al índice en lista, dejar
  los atajos a la vista y poder saltar entre la lista y las respuestas (Q-15). Hecho en la 213.
- **Defecto encontrado en vivo:** `a` iba a las respuestas, pero la segunda vez no volvía a la
  lista hasta moverse a mano. **Causa:** cuando el mod mueve el foco con `$.ui.focus`, su propio
  hook de `ui.focus` no se entera en la sesión real. **Arreglo:** el mod anota adónde quedó el foco
  cada vez que lo mueve. Hay un test de que `a` alterna, pero **en el arnés de tests pasa también
  sin el arreglo** (ahí el hook sí se entera), así que no reproduce el defecto: se confirma en vivo.
  **Confirmado en vivo por el usuario** el 2026-10-17: *"Perfecto ahora si"*.

| # | Resultado | Evidencia |
|---|---|---|
| Navegación 213 | **passed** | el usuario la probó en vivo: lista, `n`/`p` a la vista, `a` entre la lista y las respuestas |
| L-01, L-04, L-05, L-06, L-07 | pending | sin correr todavía: quedan para la próxima sesión |

### Corrida 3 · 2026-10-17

Sesión nueva, con los tres mods cargados. La corrió el usuario y la cerró con: *"toda la unidad
210 esta perfecto entonces ya valide todo y funciona"*. El agente no vio los paneles: el
resultado es el que trajo el usuario, sin detalle por escenario.

| # | Resultado | Evidencia |
|---|---|---|
| L-01, L-04, L-05, L-06, L-07 | **passed** | confirmado por el usuario |
| L-02, L-03 (lo parcial de la corrida 1) | **passed** | dentro del *"ya valide todo"* del usuario |
