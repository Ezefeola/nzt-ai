# Estructura del método (en debate)

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

## Las skills del núcleo

`<m>` es el prefijo del método, que todavía no tiene nombre (ver S1).

| Skill | Cuándo se usa | Qué hace | Principios |
|---|---|---|---|
| `<m>` | Al empezar o retomar un trabajo | Lee `Plan/state.md` si existe y sigue desde ahí. Si no, aclara lo difuso, elige el tamaño, acuerda "hecho" y quién hace, revisa herramientas y paquetes, y hace el trabajo al paso o pasa a `<m>-plan` | 2, 4, 5, 6, 10 |
| `<m>-plan` | El trabajo es con plan corto o por partes | Escribe el plan: unidades, quién hace cada una, criterio de hecho, lo recortable si hay tiempo fijo. Lo presenta, espera el sí y crea o actualiza `Plan/state.md` | 2, 4, 6, 8, 14 |
| `<m>-do` | Hay una unidad aprobada para hacer | Corre el loop de una unidad (entender → proponer → hacer → verificar → registrar) y termina en la parada con veredicto y el próximo paso recomendado | 3, 5, 7, 11, 12 |
| `<m>-tools` | Antes de empezar, si falta algo; o en una parada, si apareció una falta | Propone, investiga en fuentes oficiales con un sí, instala con otro sí, comprueba y registra en `Docs/agent-tools.md`, incluidas las rechazadas | 10 |
| `<m>-retro` | Solo cuando la persona la pide | Revisa cómo fue el trabajo, deja propuestas de mejora sin cambiar nada y señala lo que se repite y merece un paquete | 13 |

Son **cinco entradas** en la lista de skills. Lo demás va como referencias.

### Las referencias

Cada una se lee solo en el momento que la necesita, y la nombra la skill que la usa:

| Referencia | De la skill | Se lee cuando |
|---|---|---|
| `state.md` | `<m>`, `<m>-plan`, `<m>-do` | se crea o actualiza `Plan/state.md`: la plantilla y sus reglas (`Archivos.md`) |
| `sizing.md` | `<m>` | hay que elegir el tamaño o aclarar un pedido difuso |
| `who-does.md` | `<m>-do` | la unidad la hace la persona o los dos: cómo prepara, guía y verifica el agente |
| `teaching.md` | `<m>-do` | la persona quiere aprender: el agente enseña sin hacerlo por ella |
| `verify.md` | `<m>-do` | se verifica contra el criterio de hecho y se arma el veredicto |
| `documents.md` | `<m>-plan`, `<m>-do` | la unidad produce un documento: el default de `Documentos.md` |
| `agent-tools.md` | `<m>-tools` | se crea o actualiza `Docs/agent-tools.md`: la plantilla |
| `packages.md` | `<m>`, `<m>-retro` | hay que proponer un paquete o armar uno nuevo |

`documents.md` es referencia y no skill a propósito: como skill competiría con las de
documentos que ya trae el host y se cargaría en trabajos donde no hace falta.

## Cómo se enchufa un paquete

- **Cada paquete es un plugin aparte (PQ3) con una skill**, por ejemplo `<m>-writing`. Su
  `SKILL.md` es un índice con una fila por lo que aporta (`Paquetes.md`, sección 1):
  vocabulario, preguntas de arranque, cómo cortar en unidades, prácticas, criterios de hecho y
  herramientas. Cada fila apunta a una referencia propia; un paquete puede traer solo
  algunas filas.
- **Se activa solo si está en `Docs/agent-tools.md`** (PQ2). `<m>` lo propone al empezar;
  `<m>-plan` y `<m>-do` leen del paquete solo la fila del paso en que están.
- **Para armar un paquete nuevo** (PQ4) se parte de lo que señaló `<m>-retro` y se escribe
  con `gestionar-skills` y `skill-creator`.

## Dónde vive en el repositorio

Todo dentro de `nzt-method/`:

```
nzt-method/
├── design/                 los documentos de diseño de hoy (Idea.md, Principios.md, …)
└── plugin/
    ├── .claude-plugin/     el manifiesto de Claude Code
    ├── .codex-plugin/      el de Codex, si se publica también ahí (S4)
    └── skills/
        ├── <m>/SKILL.md, references/
        ├── <m>-plan/…
        ├── <m>-do/…
        ├── <m>-tools/…
        └── <m>-retro/…
```

Mover los documentos de diseño a `design/` es opcional. Su ventaja es que el plugin y su
diseño no se mezclan. Si se mueven, se ajusta *Cómo retomar* en `Idea.md`.

## Cómo se escriben las skills

Una por vez, con `gestionar-skills` (reglas y auditoría) y `skill-creator` (casos de prueba
y evaluación). Cada skill se prueba con al menos tres trabajos reales de dominios distintos
(por ejemplo: un cambio de software, un documento, una mudanza) antes de pasar a la
siguiente. Orden propuesto: `<m>`, `<m>-plan`, `<m>-do`, `<m>-tools`, `<m>-retro`.

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
