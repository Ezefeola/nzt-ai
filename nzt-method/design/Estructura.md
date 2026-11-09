# Estructura del método

Borrador del 2026-11-08: qué skills y archivos tiene el método, para llevar a la práctica lo
decidido en `Principios.md`, `Paquetes.md`, `Archivos.md` y `Documentos.md`. Todo es
*propuesta de Claude* hasta que figure en **Decididos**. Las skills y sus archivos van en
inglés (A1); este documento de diseño, en español.

**Referencias tomadas:**

- **`nzt-software`:** una skill de entrada corta (la suya tiene 53 líneas) que lee el
  estado, dimensiona y deriva; routers que no hacen el trabajo sino que dicen qué
  referencia leer; referencias de hasta 200 líneas que se leen solo cuando la tarea las
  pide; y pocas entradas en la lista de skills, porque el host carga esa lista en cada
  sesión.
- **`gestionar-skills`:** `SKILL.md` es un índice con pasos numerados y un *Hecho cuando*;
  el detalle va en referencias, todas nombradas desde `SKILL.md` y a un solo nivel; sin
  redundancia entre skills.

## Las skills del núcleo (como quedaron escritas, 2026-11-09)

Lo que sigue es la estructura **escrita y probada** en `plugin/skills/`. El borrador original
(cinco skills con prefijo `<m>`) cambió al escribirlas: `nzt` pasó a ser la skill base,
`learn` se sumó como sexta skill (`Ensenanza.md`) y `teaching.md` se borró.

| Skill | Cuándo se usa | Qué hace | Principios |
|---|---|---|---|
| `nzt` | **Primero en cada sesión**, por su `description`, y otra vez tras compactar | Skill base: lee cómo hablarle a la persona (`messages.md`), el estado, el glosario y las herramientas (si una anotada cubre lo que hay que hacer, se usa); aclara, dimensiona, decide quién hace, revisa herramientas y paquetes, ubica la carpeta, le cuenta a la persona y deriva | 2, 4, 5, 6, 10, 16, 17 |
| `plan` | Trabajo con plan corto o por partes, o un cambio al plan | Corta en unidades, ordena por riesgo, marca recortables y tandas, espera el sí y escribe `Plan/state.md` | 2, 4, 6, 8, 14 |
| `do` | Hay una unidad aprobada, o trabajo al paso | Hace la unidad o guía a la persona, verifica con evidencia, registra y para con reporte; si la persona aprende, pasa la unidad a `learn` | 3, 5, 7, 11, 12 |
| `learn` | La persona quiere aprender algo | Pregunta suelta, lección en la conversación o tema con carpeta; objetivos como unidades, ejercicios, correcciones, evaluación y repasos | `Ensenanza.md` |
| `tools` | Falta una herramienta antes o durante el trabajo, se instala un paquete, o la persona pregunta por una | Propone, investiga en fuentes oficiales con un sí, instala con otro sí en el alcance más chico, comprueba y anota en `Docs/agent-tools.md` (también lo rechazado) | 10 |
| `retro` | **Solo a mano**, cuando la persona la pide | Pregunta dónde guardarla, revisa las últimas 10 sesiones (o las elegidas) y los archivos del trabajo, y deja propuestas con destino (trabajo, método o paquete) sin cambiar nada más | 13 |

Son **seis entradas** en la lista de skills. Instaladas, el host las agrupa bajo el nombre del plugin: `nzt:nzt`, `nzt:plan`, `nzt:do`, `nzt:learn`, `nzt:tools` y `nzt:retro` (M1). Ninguna nombra un host ni una herramienta
(principio 17). Las demás skills no repiten que se cargue `nzt`: lo asegura su
`description` (y, como refuerzo pendiente, un hook de inicio de sesión).

### Las referencias

Cada referencia tiene **una sola dueña**; las compartidas son de `nzt` y las demás skills
las nombran por su ruta.

| Skill | Referencias |
|---|---|
| `nzt` | `messages.md` (cómo se habla y *Asking*), `state.md` (plantilla de `Plan/state.md`: la tabla de unidades lleva *Unit, Leaves, Done when, Who does it, Status, Verdict* y las marcas `(cuttable)` y `(batch)`), `glossary.md`, `starting.md`, `sizing.md`, `packages.md`, `documents.md` |
| `plan` | `slicing.md` |
| `do` | `who-does.md`, `verify.md` |
| `learn` | `plan.md`, `teach.md`, `train.md`, `tutor.md`, `assess.md`, `retain.md`, `exercises.md` |
| `tools` | `agent-tools.md` (plantilla de `Docs/agent-tools.md`) |
| `retro` | `retro-file.md` (plantilla del archivo de retro) |

`documents.md` es referencia y no skill a propósito: como skill competiría con las de
documentos que ya trae el host y se cargaría en trabajos donde no hace falta.

## Cómo se enchufa un paquete

- **Cada paquete es un plugin aparte (PQ3) con una skill**, por ejemplo `nzt-writing`. Su
  `SKILL.md` es un índice con una fila por lo que aporta (`Paquetes.md`, sección 1):
  vocabulario, preguntas de arranque, cómo cortar en unidades, prácticas, criterios de hecho y
  herramientas. Cada fila apunta a una referencia propia; un paquete puede traer solo
  algunas filas.
- **Se activa solo si está en `Docs/agent-tools.md`** (PQ2). `nzt` lo propone al empezar y
  `tools` lo instala; `plan` y `do` leen del paquete solo la fila del paso en que
  están.
- **Para armar un paquete nuevo** (PQ4) se parte de lo que señaló `retro`; es un trabajo
  más, que empieza con `nzt`.

## Dónde vive en el repositorio

Todo dentro de `nzt-method/`:

```
nzt-method/
├── design/                 los documentos de diseño
└── plugin/                 el plugin nzt, para Claude Code y Codex (S4)
    ├── .claude-plugin/plugin.json   el manifiesto de Claude Code
    ├── plugin.json                  el manifiesto portable que lee Codex
    └── skills/
        ├── nzt/SKILL.md, references/, evals/
        ├── plan/…
        ├── do/…
        ├── learn/…
        ├── tools/…
        └── retro/…
```

Los manifiestos se decidieron el 2026-11-09 (*Decididos* → *Manifiestos*).

## Cómo se escriben las skills

Una por vez, con `gestionar-skills` (reglas y auditoría) y `skill-creator` (casos de prueba
y evaluación). Cada skill se prueba con casos de dominios distintos, con y sin la skill,
antes de pasar a la siguiente. Cómo se corren está en `Idea.md` → *Cómo se prueba una
skill*.

## Revisión de responsabilidades (aceptada el 2026-11-08)

Hecha el 2026-11-08, a pedido del usuario, contra la regla de una responsabilidad clara por
skill y las reglas de `gestionar-skills` (sobre todo la 2, sin redundancia, y la 5,
referencias a un solo nivel). *Propuesta de Claude.*

| Skill | Su única responsabilidad | Qué estaba de más | Corrección propuesta |
|---|---|---|---|
| `nzt` | Decidir cómo se encara el trabajo y derivar | Hacía el trabajo al paso (eso es ejecutar) y acordaba el criterio de hecho (eso es proponer) | Solo lee el estado, aclara, dimensiona, revisa herramientas y deriva. Al paso deriva a la skill que ejecuta, en su versión corta |
| `nzt-plan` | Cortar el trabajo en unidades y que se apruebe | Nada | Sin cambios |
| `nzt-do` (antes `nzt-piece`) | Llevar una unidad de entendida a verificada y registrada | Nada grave; "quién hace" y "enseñar" son formas de hacer, no otra responsabilidad | Acuerda el criterio de hecho en su paso *proponer* cuando el trabajo es al paso. Renombrada a `nzt-do` |
| `nzt-tools` | Las herramientas, de la propuesta al registro | Nada | Sin cambios |
| `nzt-retro` | Revisar cómo fue y proponer mejoras | Leía `packages.md` para armar paquetes, que es otra responsabilidad | Solo señala qué podría ser un paquete. **Armar un paquete es un trabajo más**: se encara con `nzt` y se escribe con `gestionar-skills` y `skill-creator` |

**Referencias compartidas.** `state.md` lo usaban tres skills y `documents.md` dos, lo que
rompe "cada idea en un solo lugar" si se copian. *Propuesta:* cada referencia tiene **una
sola dueña**, `nzt`, que es la que el agente carga primero, y las demás la nombran por su
ruta, como `nzt-software` nombra `nzt-build`'s `references/tests.md`.

**Un término por concepto** (regla 9). Antes de escribir hace falta un glosario corto:
trabajo, unidad (o el nombre que se elija), tamaño, parada, veredicto, criterio de hecho,
paquete.

## Preguntas

- **S1. El nombre del método y el prefijo de sus skills.** Hace falta antes de escribir la
  primera skill. **No puede chocar con `nzt-software`**, que ya usa `nzt`, `nzt-plan` y
  `nzt-retro`: si las dos están instaladas, los nombres repetidos se pisan. Algunas
  opciones: `nzt-method`, `nzt-work`, `nzt-core`, o un nombre nuevo.
- **S2.** ¿Las cinco skills y las referencias te cierran, o falta o sobra algo?
- **S3.** ¿Movemos los documentos de diseño a `design/` y el plugin a `plugin/`?
- **S4.** ¿Se publica en Claude Code y en Codex, como `nzt-software`, o en algún host más?

## Decididos

- **S1 (2026-11-08): el método se llama `nzt`,** porque es el método genérico. El prefijo
  `<m>` de este documento es `nzt`: las skills son `nzt`, `nzt-plan`, `nzt-do`,
  `nzt-tools` y `nzt-retro`, y un paquete sería por ejemplo `nzt-writing`. Reemplaza la
  propuesta de `Idea.md` de no usar solo `nzt`.
  - **Choque conocido con `nzt-software`:** hoy ese plugin ya tiene skills llamadas `nzt`,
    `nzt-plan` y `nzt-retro`. **Hasta que se integren, los dos plugins no se instalan
    juntos.** Al integrarlos, `nzt-software` pasaría a ser un paquete y sus skills se
    renombrarían; eso se decide después y no se hace en esta rama (`nzt-software` no se
    modifica).
- **S2 (2026-11-08):** las cinco skills y las referencias quedan así por ahora; se
  readaptan si hace falta al escribirlas.
- **S3 (2026-11-08): ordenado.** Los documentos de diseño se movieron a `design/` y el
  plugin va en `plugin/`. El `README.md` de `nzt-method/` es la puerta de entrada y manda a
  `design/Idea.md`.
- **S4 (2026-11-08):** se publica en Claude Code y en Codex, como `nzt-software`.
- **Responsabilidades (2026-11-08):** el usuario aceptó todas las correcciones de la
  *Revisión de responsabilidades*: `nzt` solo decide y deriva; `nzt-retro` solo señala
  paquetes posibles; cada referencia tiene una sola dueña (`nzt`); hay un glosario del
  método. Las tablas de skills y referencias de arriba se reescriben con esto al escribir
  las skills.
- **Glosario del trabajo y defaults (2026-11-08):** a pedido del usuario, cada trabajo
  mantiene su glosario (principio 15, `Docs/glossary.md`), y cada aporte de un paquete tiene
  un default genérico en el núcleo (`Paquetes.md`, sección 5). Se suman como referencias de
  `nzt`: `glossary.md` (cómo se mantiene el glosario), `starting.md` (preguntas de arranque
  genéricas) y `slicing.md` (cómo se corta un trabajo en unidades sin paquete).

- **`nzt-do` (2026-11-08):** la skill que hace el trabajo se llama `nzt-do` (antes
  `nzt-piece`, que al usuario no le cerraba). Las tablas de arriba ya usan el nombre nuevo.

- **`unit` (2026-11-08):** lo que antes se llamaba "pieza" es una **unidad** en el diseño y
  una **`unit`** en las skills, como en `nzt-software`. Los documentos de diseño ya dicen
  "unidad". Los términos del método están en `Glosario.md`.

- **`nzt-retro` (2026-11-09, decidido por el usuario):** antes de escribirla, Claude miró la
  retro de `nzt-software` (`method/skills/nzt/retro/SKILL.md`) y propuso adaptarla sin hosts
  ni destinos de software: revisa sesiones y los archivos del trabajo (estado, glosario,
  herramientas), cada propuesta sale de un momento donde el trabajo costó más de lo debido,
  y va a uno de tres destinos: **el trabajo**, **el método** o **un paquete** (nuevo, con las
  filas que traería, o uno en uso). Toma de `nzt-software`: sin momento va a *Descartadas*,
  verificación si es mecánico y regla si es de criterio, gravedad, estado `proposed` que
  solo cambia la persona, nada de valores copiados. Decidido:
  - **R1. Dónde se guarda:** se pregunta **siempre** (salvo que la persona ya lo haya dicho),
    sugiriendo `Docs/retros/<fecha>-<tema>.md` en la carpeta del trabajo y avisando si esa
    carpeta es un repositorio compartido.
  - **R2. Qué sesiones:** las **últimas 10** del trabajo, **o las que elija la persona**
    (pueden ser de otros trabajos, para ver qué se repite). Se leen solo si el host las
    guarda y se pueden leer (dónde, en su documentación oficial; la skill no nombra hosts);
    si no, se dice y se revisa la sesión actual más los archivos del trabajo.
  - **R3. Jerga:** la sección *Para el método* del archivo puede nombrar skills y
    referencias, porque la lee quien mantiene el método; el mensaje a la persona sigue sin
    jerga.
  - **R4. Solo a mano:** el agente **nunca la ofrece ni la activa**; la usa la persona
    cuando la pide.

- **Manifiestos (2026-11-09):** el usuario pidió arrancar el pendiente 3. Claude leyó la
  documentación oficial de los dos hosts (*Plugin manifest reference* de Claude Code y
  *Package your plugin* de Codex, leídas el 2026-11-09) y cómo lo arma `nzt-software`
  (`build/build.sh`, D97 y D100 en `Plan/specs/nzt-core/decisions.md`). Hecho, con estos
  defaults de Claude que **falta confirmar con el usuario**:
  - **Dos manifiestos en `plugin/`:** `.claude-plugin/plugin.json` (Claude Code) y
    `plugin.json` en la raíz del plugin (el manifiesto portable que Codex lee primero, con
    `extensions.com.openai.interface`). Mismo nombre `nzt`, versión `0.1.0`, licencia MIT.
    Las skills se descubren solas en `skills/`, sin campo `skills`.
  - **M1. Nombres de las skills (corregido el mismo día):** el default era dejarlas como
    `nzt-plan`…, que instaladas quedaban `nzt:nzt-plan`. El usuario preguntó si convenía
    acortarlas y pidió investigar Codex en vez de suponer. **Comprobado** instalando el
    plugin en un `CODEX_HOME` temporal del scratchpad (`codex plugin marketplace add` con un
    marketplace local y `codex debug prompt-input`): Codex también lista las skills de un
    plugin como `<plugin>:<skill>`, igual que Claude Code (documentado en su *Plugin
    manifest reference*). Su documentación de skills solo dice que dos skills con el mismo
    `name` no se mezclan y aparecen las dos. **Decidido por el usuario: se acortan.** Las
    carpetas y los `name:` pasan a `plan`, `do`, `learn`, `tools` y `retro`; la base sigue
    siendo `nzt`. Instaladas: `nzt:nzt`, `nzt:plan`, `nzt:do`, `nzt:learn`, `nzt:tools`,
    `nzt:retro`, sin choque con otra skill `plan` (queda `plan` u `otro:plan`). Dentro de
    las skills se nombran como "la skill `plan`". Los documentos de diseño anteriores a
    esta fecha conservan los nombres viejos como historial.
  - **M2. Marketplace: decidido por el usuario que lo tiene que tener, pero después**
    (pendiente 4 en `Idea.md`). Por ahora, sin entrada en los marketplaces: `.claude-plugin/marketplace.json` y
    `.agents/plugins/marketplace.json` están en la raíz del repo, fuera de `nzt-method/`, y
    no se tocan sin permiso. Tampoco hay pipeline de release propio todavía.
  - **Verificado:** `claude plugin validate` (Claude Code 2.1.318) → *Validation passed*,
    con un aviso de que falta un ícono. **En Codex** (`codex-cli 0.164.0`, sin comando de
    validación) el plugin se instaló desde un marketplace local en un `CODEX_HOME`
    temporal y sus seis skills aparecen en el prompt; la configuración real de Codex no
    se tocó.
  - **Choque con `nzt-software`, revisado:** con el espacio de nombres del plugin las skills
    ya no se pisan (`nzt:nzt` y `nzt-software:nzt`), pero las dos bases dicen "cargame
    primero en cada sesión"; la regla de no instalar los dos juntos sigue.
