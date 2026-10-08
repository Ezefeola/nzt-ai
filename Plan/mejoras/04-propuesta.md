# 04 — Propuesta: árbol destino y reglas

> Unidad 4 del run `marco-trabajo-mejoras` · 2026-10-03 · Propuesta: nada se ejecuta hasta que el usuario decida.

## Decidido por el usuario (2026-10-03, respuesta: "ok perfecto se ve bien")

1. **Alcance B**: todas las hojas pasan a referencias; quedan 14 skills.
2. **Citas (a)**: una referencia nunca manda a leer otra; la tabla del router lo resuelve.
3. **Reglas de orden** de la decisión 3, tal como están.
4. **Capa genérica** con `practices-backend.md` y `practices-frontend.md`, **incluida la opcional
   `stack-axes.md`**. Se interpretó el "se ve bien" como aprobación de la opcional también.
5. **Mitigación de compactación**: la línea nueva en el kernel.

## Lo que ya estaba decidido (por el usuario, 2026-10-03)

- Las hojas pasan a archivos de referencia de su router; D4 se reemplaza.
- No se pierde ni comportamiento ni contenido de código.
- **El agente trabaja solo con skills, nunca con comandos `/`.** Que una hoja deje de ser
  invocable como comando no es una pérdida.

## Verificación: cómo encuentra el agente una referencia

| Afirmación | Etiqueta | Fuente |
|---|---|---|
| Al cargar una skill, Claude Code muestra su carpeta (`Base directory for this skill: C:\Users\ezefe\.claude\skills\nzt-plan`) | observed | esta sesión, al cargar `nzt`, `nzt-plan` y `nzt-research` |
| Claude Code lee archivos de soporte enlazados desde la SKILL.md, y existe `${CLAUDE_SKILL_DIR}` | documented | code.claude.com/docs/en/skills · leído 2026-10-03 |
| Codex lista cada skill con su ruta y soporta la carpeta `references/` | documented | learn.chatgpt.com/docs/build-skills · leído 2026-10-03 |
| Instaladas, todas las skills de NZT son carpetas hermanas (`~/.claude/skills/nzt-*`), así que `../nzt-build/references/tests.md` resuelve desde cualquiera | inferred | rutas observadas en esta sesión + aplanado de §9.1 |
| `install/build.*` ya copia las subcarpetas sin SKILL.md junto a la skill | observed | `install/build.ps1`, líneas 88-96 |
| El build no aplica el tope de 200 líneas a las referencias | observed | ídem: solo mide SKILL.md |
| Codex abre la referencia en la práctica | **unverified** | no hay Codex en esta máquina; queda para la fase 9 |

### Un costo nuevo que hay que cubrir: la compactación

- **documented (S2):** al compactar, Claude Code **vuelve a adjuntar las skills invocadas**
  (los primeros 5.000 tokens de cada una).
- **inferred:** una referencia leída con Read es un resultado de herramienta, y **eso no se
  vuelve a adjuntar**. Después de una compactación, la guía de la hoja ya no está.
- **Mitigación propuesta:** una línea en el kernel: *"una referencia leída no sobrevive a una
  compactación; antes de seguir, volvé a leer las que la unidad en curso usa"*. Hoy el kernel
  dice *"no recargues una skill que ya tenés"*; para referencias la regla tiene que ser la
  inversa.

## Decisión 1 · Alcance — **la más importante**

| | A · Solo capa de stack | B · Todas las hojas (recomendada) |
|---|---|---|
| Skills en el listado | 68 | **14** |
| Caracteres del listado | ~11.500 | **2.564** (medido sobre los 14 que quedan) |
| R1 en Codex (piso 8.000) | sigue | **desaparece** |
| Agregar un stack nuevo (Node, Python) | 1 router de área + N hojas al listado | 1 router de área; las hojas no suman |
| Archivos a mover | 43 | 97 |
| Riesgo de compactación | solo en hojas de stack | en todas las hojas, mitigado por la línea del kernel |

**Por qué B:** la razón que dejaba al grupo D como skill era doble, y una ya cayó (los
comandos). La otra, las citas entre fases, se resuelve con rutas entre skills hermanas (tabla
de arriba). B es la forma que escala: un stack nuevo cuesta una entrada en el listado, no
treinta. **Lo que se paga:** mover 97 archivos en vez de 43 y reescribir los graders de casi
todos los evals.

Las 14 skills que quedan con B: `nzt`, `nzt-plan`, `nzt-research`, los 6 routers de fase,
`nzt-learn` y los 4 routers de área (`build-backend-dotnet`, `build-frontend-blazor`,
`build-csharp`, `ship-backend-dotnet`). `nzt-research` queda como skill porque lo nombra el
guardrail del kernel.

## Decisión 2 · Citas entre referencias

Recomendada **(a): una referencia nunca manda a leer otra.** Si una hoja hoy cita a otra:
- **misma skill:** la cita queda como mención, y la tabla del router dice qué se lee junto con
  qué (columna *Read with*);
- **otra skill:** la tabla del router la lee directo por su ruta
  (`../nzt-build-backend-dotnet/references/security.md`). Sigue siendo un solo nivel desde una
  SKILL.md.

`ef-core` y `diagrams`, que hoy son sub-routers, pasan a ser la **referencia base** que su
tabla manda leer junto con la específica.

## Decisión 3 · Reglas de orden (para que quede prolijo)

1. **Carpeta `references/`**, que es el nombre que usa el estándar en Codex y el que ya usa la
   spec en §4.
2. **El archivo se llama como la skill vieja sin el prefijo de su router:**
   `nzt-build-backend-dotnet-ef-core-queries` → `nzt-build-backend-dotnet/references/ef-core-queries.md`.
   El mapeo es 1 a 1 y se puede verificar con un script.
3. **Tope de 200 líneas también por referencia**, verificado por el build, que hoy no lo mide.
4. **Las referencias de más de 100 líneas abren con `## Contents`.** Es lo único que se
   *agrega* al texto; protege contra la lectura parcial (S1).
5. **La tabla del router es el único índice**: una fila por referencia, con *cuándo* y *Read
   with*. Ninguna referencia queda sin fila (así no se repite lo de `linq`).
6. **En el repo**, la referencia vive en la carpeta del router: `skills/nzt/build/references/`,
   `skills/nzt/build/backend/dotnet/references/`. El build no la toma como skill porque no es
   `SKILL.md`.

## Decisión 4 · Capa genérica (tus puntos 1 y 3)

**Propuesta liviana: dos referencias en `nzt-build`**, más una opcional:

| Archivo | Contenido | Cuándo se lee |
|---|---|---|
| `nzt-build/references/practices-backend.md` | G1–G18: una línea por práctica con su porqué, sin código ni librerías | componente de backend sin router de área para su tecnología |
| `nzt-build/references/practices-frontend.md` | G19–G23, en la misma forma | ídem, frontend |
| *opcional* `nzt-architecture/references/stack-axes.md` | ejes del documento de stack con opciones genéricas (H3), para que en Node el agente no invente qué significa "Persistence" | al escribir el stack de un componente que no es .NET |

- Las referencias de .NET **no se tocan** (se mueven tal cual). La genérica es el principio;
  la de .NET es *cómo se hace en .NET*.
- **Riesgo de deriva (R3):** la misma práctica escrita en dos lugares. Se mitiga con una regla
  en §10: *cambiar una práctica en una referencia de área obliga a revisar su línea genérica*,
  y cada línea G cita la referencia de .NET que la implementa.

## Cómo se garantiza que no se pierde nada

Cada hoja se mueve con **cuatro cambios mecánicos y nada más**:
1. se quita el frontmatter;
2. se quita la línea de R2 (*"If you did not arrive here from X, load it first"*), que deja
   de tener sentido;
3. un *"load `nzt-…`"* que apunta a otra hoja pasa a mención, según la decisión 2;
4. se agrega `## Contents` si pasa de 100 líneas.

Un script compara cada SKILL.md vieja con su referencia y **falla si cambió cualquier otra
línea**. A eso se suma la comparación de evals de antes y después (unidades 6 y 7).

## Lo que cambia en el resto del plan

- Unidad 5 (spec): una decisión nueva que reemplaza a D4; §3 y §12 corregidas por B1;
  §4, §9.1 y §10 según estas decisiones; D20 queda obsoleta.
- Unidad 7 (piloto): `ship-backend-dotnet`, igual que antes. Se suma el script de diff y el
  tope de líneas en el build.
- Si se elige B, la unidad 8 se corta por router: un router por unidad.
