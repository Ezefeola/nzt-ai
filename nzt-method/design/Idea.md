# Idea: un método de trabajo genérico

Anotado el 2026-11-08, en la rama `metodo-generico`. Es una exploración: puede terminar
descartada. Lo que sigue es lo que pidió el usuario. Lo marcado como *propuesta de Claude* no
está decidido.

## Qué se quiere

Un **método de trabajo genérico**, **no atado a nada**: ni a software ni a ningún dominio,
herramienta o tipo de producto. Tiene que servir para trabajar en **cualquier cosa**
(software, un juego, un documento, un curso, una investigación, una mudanza) y lograr tres
cosas:

1. **Mantener el contexto.** El trabajo se puede retomar en otra sesión sin explicarlo otra
   vez.
2. **Trabajo ágil.** Nada es obligatorio. El método permite ajustar en cada momento qué se
   hace y cuánto proceso lleva: no es una cascada de fases que hay que recorrer enteras.
3. **Trabajo de calidad.** Lo hecho se puede revisar, se verifica y se reporta lo que pasó de
   verdad.

Y tiene que **poder apoyarse en plugins, MCPs o ambos**, y en las herramientas que tenga el
agente, **cuando el trabajo las necesite** o el agente lo considere útil. No como requisito.

**Cómo se apoya en herramientas** (aclarado por el usuario el 2026-11-08): el agente **no
instala ni usa un plugin o MCP de una**. Se fija qué necesitaría el trabajo para hacerse de
manera excelente y **se lo consulta a la persona**, por ejemplo preguntándole si quiere que
investigue si hace falta algún plugin, MCP o ambos para lo que pidió. La forma exacta (cuándo
preguntar, cuánto investigar, qué mostrar, dónde se registra) **está por debatir**.

## De dónde viene

- **`nzt-software`** (`../../nzt-software/README.md`) define su forma de trabajo al principio
  del README: las fases DISCOVERY → ARCHITECTURE → DESIGN → BUILD → VERIFY → SHIP, y en cada
  unidad el loop Entender → Proponer → Ejecutar → Verificar → Registrar, con el estado en
  `Plan/state.json`. **La idea es tomar esa forma, pero genérica:** las fases y sus nombres
  son de software; lo que se quiere es lo que queda debajo de ellas, y que ninguna sea
  obligatoria.
- **BMAD-Method** y métodos parecidos: según el usuario, ninguno es genérico. Antes de
  diseñar hay que comprobarlo en sus fuentes oficiales y ver qué toman de bueno y dónde se
  atan a un dominio.
- **Lo que ya se decidió en `nzt-software` y probablemente sirva** (*propuesta de Claude*):
  la regla de herramientas de D96 (*Agent tools*: cualquier MCP o plugin en cualquier fase,
  registrado por para qué sirve), las paradas al final de cada unidad, el estado persistido,
  y decir qué se comprobó en vez de qué se cree.

## Reglas para este trabajo

- **Todo va dentro de `nzt-method/`**: specs, ideas, decisiones, borradores. Fuera de esta
  carpeta no se toca nada.
- **Se trabaja sin NZT**, solo con Claude: sin `Plan/state.json`, sin unidades ni routers de
  NZT. El usuario lo desactiva para estas sesiones.
- **Vive en el monorepo `nzt-ai`** y se despliega por su cuenta: su pipeline corre solo si se
  tocó su carpeta, como pasa hoy con `nzt-software`.
- **No se mergea** a `pendientes-post-v5` ni a `main` mientras sea exploración.
- **`nzt-software` se puede mirar como referencia, pero no se modifica.**
- **Al escribir las skills del método** se usan las skills `gestionar-skills` y
  `skill-creator` (pedido del usuario, 2026-11-08).

## Preguntas abiertas

- ~~**El nombre:** `nzt-method` es provisorio.~~ Decidido: **`nzt`** (S1 en
  `Estructura.md`). La carpeta del repositorio sigue siendo `nzt-method/`.
- **La relación con `nzt-software`:** lo reemplaza, `nzt-software` se apoya en él, o
  conviven. Se decide **después** de tener el método genérico; la idea del usuario es que
  los dominios (software y otros) lleguen como paquetes.
- **Qué es lo mínimo** que tiene que tener el método para mantener el contexto sin volverse
  burocracia en un trabajo chico.
- **Cómo se adapta a un dominio** sin nombrarlo: quién aporta el vocabulario y las
  prácticas de cada tipo de trabajo (el usuario, un plugin, un MCP, el propio agente).
- **En qué hosts corre:** Claude Code y Codex como `nzt-software`, o también otros.
- **Cómo propone herramientas:** en qué momento pregunta (al empezar un trabajo, cuando
  aparece un hueco, o ambos), qué muestra al proponer, qué pasa con lo que la persona
  rechaza, y dónde queda registrado lo instalado.

## Cómo retomar

Si se limpia el contexto, una sesión nueva retoma así:

1. Leer este archivo (`nzt-method/design/Idea.md`) y `../README.md`. Lo de `nzt-method/`
   es la única fuente: no hay `Plan/state.json` ni NZT activo. Los documentos de diseño
   están en `design/` y el plugin, cuando exista, en `plugin/`. Según el estado, seguir con
   `Principios.md`
   (principios y sus decisiones), `Paquetes.md` (paquetes de dominio), `Archivos.md`
   (archivos de estado y de herramientas), `Documentos.md` (default de documentos),
   `Estructura.md` (skills y archivos del método), `Glosario.md` (términos del método, en
   español e inglés) e
   `Investigacion.md` (métodos parecidos revisados).
2. Mirar **Estado actual** (abajo) y los últimos commits de la rama `metodo-generico`.
3. Seguir desde el próximo paso, sin decidir nada que figure como abierto sin consultarlo.

## Estado actual

- **2026-11-08:** leídos `Idea.md`, `README.md` y el principio de
  `../../nzt-software/README.md`. Sumada la aclaración sobre cómo se proponen las herramientas.
  Claude propuso el primer paso y el usuario aprobó empezar por investigar.
- **2026-11-08:** hecha la investigación de BMAD-Method, Spec Kit, Agent OS y Shape Up en
  `Investigacion.md`: se confirma que ninguno es genérico, y al final hay ideas para tomar.
- **2026-11-08, decisión del usuario:** el método genérico se hace **aparte y primero**.
  `nzt-software` **no se modifica**, pero **se puede mirar como referencia**, igual que los
  métodos de `Investigacion.md`; no es una base a desmontar. Después se verá si se integra
  con paquetes por dominio (software y otros).
  **Próximo paso:** debatir con el usuario los principios del método genérico, partiendo de
  las conclusiones de `Investigacion.md`, antes de escribir su estructura.
- **2026-11-08:** empezó el debate. Borrador en `Principios.md`: 11 principios propuestos y
  5 preguntas (P1–P5). **Próximo paso:** recoger las respuestas del usuario y pasar lo
  aceptado a **Decididos** en ese archivo.
- **2026-11-08:** decididas P2 (un solo archivo de estado) y P3 (proponer herramientas solo
  si falta algo). P1, P4 y P5 siguen **En charla** en `Principios.md`. Los 11 principios
  todavía no fueron revisados uno por uno.
- **2026-11-08:** decididas P1 (tres tamaños), P4 (criterio de hecho siempre, en proporción)
  y P5 (diseñar los paquetes ya). Borrador de paquetes en `Paquetes.md` con 4 preguntas
  (PQ1–PQ4). **Próximo paso:** las respuestas del usuario a PQ1–PQ4; después revisar los 11
  principios uno por uno.
- **2026-11-08:** decididas PQ1, PQ2 (paquetes en el archivo de herramientas del agente, no
  en el estado) y PQ4 (se arman con el agente, ayudados por una retro). En charla en
  `Paquetes.md`: PQ3 y si los documentos tienen forma genérica o dependen de paquetes.
- **2026-11-08:** decididas PQ3 (cada paquete es un plugin aparte) y que el núcleo trae un
  default genérico para escribir cualquier documento. Quedan abiertos: el nombre y el lugar
  del archivo de estado y del de herramientas, y qué dice el default de documentos.
  **Próximo paso:** revisar con el usuario los 11 principios de `Principios.md` uno por uno.
- **2026-11-08:** commit `c6fc8ea`. Claude probó los 11 principios contra ocho trabajos
  distintos y anotó en `Principios.md` → *Revisión* lo que pasa sin cambios, 5 huecos
  (R1–R5) y 4 principios que podrían faltar (R6–R9). **Próximo paso:** que el usuario
  decida R1–R9; después reescribir los principios con lo decidido.
- **2026-11-08:** el usuario aceptó R1–R9. `Principios.md` quedó reescrito con **14
  principios aceptados**, lo abierto y el historial de decisiones. **Próximo paso:** definir
  lo abierto (nombre y lugar del archivo de estado y del de herramientas, y el default
  genérico de documentos) y después la estructura del método (qué skills y archivos tiene),
  usando `gestionar-skills` y `skill-creator` al escribir las skills.
- **2026-11-08:** borradores de lo abierto: `Archivos.md` (dónde van y qué tienen
  `estado.md` y `herramientas.md`, preguntas A1–A3), `Documentos.md` (el default genérico,
  preguntas D1–D2) y, en `Principios.md` → *Abierto*, la propuesta de herramientas en medio
  del trabajo. **Próximo paso:** las respuestas del usuario; después, la estructura del
  método.
- **2026-11-08:** decididos A1 (archivos y skills del método en inglés), A2, A3 (sin carpeta
  del método) y D2 (Markdown). Pendientes: dónde van los archivos sin carpeta del método
  (`Archivos.md`), qué regla falta o sobra en D1 (`Documentos.md`) y la propuesta de
  herramientas en medio del trabajo (`Principios.md` → *Abierto*).
- **2026-11-08:** decididos el lugar de los archivos (`Plan/state.md` y
  `Docs/agent-tools.md`), D1 (sin cambios) y las herramientas antes y durante el trabajo
  (principio 10). **No queda nada abierto en principios, paquetes, archivos ni documentos.**
  **Próximo paso:** proponer la estructura del método (qué skills y archivos tiene, en
  inglés), usando `gestionar-skills` y `skill-creator` al escribir las skills.
- **2026-11-08:** commit `cf48147`. Borrador de la estructura en `Estructura.md`: cinco
  skills del núcleo, sus referencias, cómo se enchufa un paquete y dónde vive el plugin,
  con preguntas S1–S4 (S1, el nombre, hace falta antes de escribir la primera skill y no
  puede chocar con las de `nzt-software`). **Próximo paso:** las respuestas del usuario.
- **2026-11-08:** decididos S1–S4 (`Estructura.md`): el método se llama **`nzt`**; las cinco
  skills quedan por ahora; Claude Code y Codex. Ordenada la carpeta: diseño en `design/`,
  plugin en `plugin/`. Queda anotado el choque de nombres con `nzt-software` (no instalar
  los dos juntos hasta integrarlos). **Próximo paso:** escribir la primera skill, `nzt`, en
  `plugin/skills/nzt/`, con `gestionar-skills` y `skill-creator`, y probarla con trabajos
  de al menos tres dominios.
- **2026-11-08:** antes de escribir, el usuario pidió revisar responsabilidades. Anotada en
  `Estructura.md` → *Revisión de responsabilidades*: correcciones a `nzt` y `nzt-retro`,
  una sola dueña por referencia y un glosario. En charla: esas correcciones, qué es
  `nzt-writing` (solo un ejemplo de paquete) y el nombre de `nzt-piece`, que al usuario no le
  cierra. **Próximo paso:** sus respuestas; recién después escribir skills.
- **2026-11-08:** el usuario aceptó las correcciones de responsabilidades. A su pedido se
  sumó el **glosario de cada trabajo** (principio 15, `Docs/glossary.md`) y quedó explícito
  que **cada aporte de un paquete tiene un default genérico en el núcleo** (`Paquetes.md`,
  sección 5), para que el método funcione sin ningún paquete. Ahora son 15 principios.
  Sigue en charla el nombre de `nzt-piece` (`Estructura.md` → *En charla*). La
  reorganización a `design/` está en stage, sin commit.
- **2026-11-08:** `nzt-piece` pasa a llamarse **`nzt-do`**. Las skills del núcleo son
  `nzt`, `nzt-plan`, `nzt-do`, `nzt-tools` y `nzt-retro`. Queda en charla si "unidad" se
  dice `piece` o `unit` en inglés. **Próximo paso:** eso, el glosario del método y escribir
  la skill `nzt` con `gestionar-skills` y `skill-creator`.
- **2026-11-08:** "pieza" pasa a ser **unidad** (`unit` en inglés), y los documentos de
  diseño ya lo dicen así. Escrito el glosario del método en `Glosario.md`; quedan como
  *propuesta* los nombres en inglés de los tamaños (`direct`, `planned`, `sliced`) y de
  "recortable" (`cuttable`). **Próximo paso:** escribir la skill `nzt` en
  `plugin/skills/nzt/` con `gestionar-skills` y `skill-creator`.
- **2026-11-08:** commit `98596e4`. Escrita la skill **`nzt`** en
  `plugin/skills/nzt/`: `SKILL.md` (10 pasos: leer estado, leer glosario y herramientas,
  descartar lo que no es trabajo, aclarar, dimensionar, quién hace, herramientas, paquetes,
  ubicar la carpeta, derivar) y seis referencias de las que es dueña (`state.md`,
  `glossary.md`, `starting.md`, `sizing.md`, `packages.md`, `documents.md`). Auditada con
  las reglas de `gestionar-skills` (dos pasadas, sin hallazgos abiertos). Escritos 4 casos
  de prueba en `evals/` con el formato de `skill-creator`: bug de software (direct), curso
  vago (aclarar), mudanza (lo hace la persona) y retomar desde `Plan/state.md`. **Sin
  correr todavía.** **Próximo paso:** que el usuario apruebe los casos y correrlos con y sin
  la skill.
- **2026-11-08:** corridos los 4 casos con y sin la skill (iteración 1, resultados en el
  scratchpad de la sesión, fuera del repo). Con skill 100% de los criterios, sin skill 44%.
  Problemas encontrados para corregir en la iteración 2: (1) las respuestas muestran a la
  persona la jerga del método (nombres de skills, "tamaño directo", "paquete del método");
  (2) los tamaños se traducen distinto cada vez; (3) la regla "gana la carpeta, corregí el
  estado" hizo que el agente reescribiera `Plan/state.md` porque faltaban archivos, cuando
  debería avisar y preguntar. **Próximo paso:** la devolución del usuario sobre el visor y
  la iteración 2. La skill y los casos no tienen commit.
- **2026-11-08:** el usuario pidió que el agente hable de forma amigable: bullets, resumido
  y marcando lo que hizo. Sumado el **principio 16** y la referencia
  `plugin/skills/nzt/references/messages.md` (forma del mensaje: línea de apertura, *qué
  hice / qué encontré / qué supongo / qué necesito*, sin jerga del método, tabla para decir
  los tamaños con palabras). `SKILL.md` de `nzt` ahora tiene 11 pasos (el 10 es *Tell the
  person*). `state.md`: si estado y carpeta no coinciden, avisa y pregunta antes de tocar el
  estado. **Próximo paso:** sumar a los casos los criterios de lenguaje amigable y de no
  tocar el estado sin preguntar, y correr la iteración 2 (solo con skill; la base sin skill
  se reutiliza de la iteración 1). Sin commit.
- **2026-11-08:** iteración 2 corrida: con skill 100% (26 criterios), sin skill 46%. Los tres
  problemas quedaron resueltos: sin jerga del método, los tamaños dichos como lo que va a
  pasar, y `Plan/state.md` intacto con una pregunta a la persona. **Skill `nzt` lista para
  revisión del usuario.** **Próximo paso:** la devolución del usuario, commit de la skill y
  sus casos, y seguir con `nzt-plan`.
- **2026-11-08:** commit `b5f0140` con la skill `nzt`. Escrita **`nzt-plan`**
  (`plugin/skills/nzt-plan/`: 8 pasos y `references/slicing.md`), auditada con
  `gestionar-skills`. La tabla de unidades de `nzt/references/state.md` suma las columnas
  *Leaves* y *Done when* y las marcas `(cuttable)` y `(batch)`. Tres casos en
  `nzt-plan/evals/` (cumpleaños con plan corto, mudanza con fecha fija, cambiar un plan
  existente) **corriéndose** (iteración 1, en el scratchpad). Sin commit.
- **2026-11-08:** `nzt-plan` iteración 1: con skill 100% (16 criterios), sin skill 38%. La
  prueba mostró un hueco en `nzt`: con trabajo en curso, un pedido que cambia el plan no
  tenía camino. Corregido en `nzt/SKILL.md` paso 1 y `nzt/references/state.md` (*Reading
  it*: cambio de plan → `nzt-plan`; pedido ajeno → trabajo nuevo). **Próximo paso:** commit
  de `nzt-plan`, y después escribir **`nzt-do`** (referencias propias: `who-does.md`,
  `teaching.md`, `verify.md`), luego `nzt-tools` y `nzt-retro`.
- **2026-11-08:** commit `53d6f21` con `nzt-plan`. Escrita **`nzt-do`**
  (`plugin/skills/nzt-do/`: 8 pasos; referencias `who-does.md`, `teaching.md`,
  `verify.md`), auditada con `gestionar-skills`. Tres casos en `nzt-do/evals/` (corregir
  ortografía, reservar el flete que hace la persona, enseñar BUSCARV) **corriéndose**
  (iteración 1, en el scratchpad). Sin commit.
- **2026-11-08:** `nzt-do` iteración 1: con skill 89%, sin skill 75%. Ortografía 6/6 y
  BUSCARV 5/5, pero **el flete salió 4/6, peor que sin skill (5/6)**: la regla "lo
  indefinido se pregunta" lo dejó solo haciendo preguntas, sin preparar el mensaje para los
  fletes, y no pidió la confirmación como evidencia. Corregido: `nzt-do` paso 2 (hacer ya lo
  que no depende del dato, con huecos visibles, y preguntar en el mismo mensaje);
  `who-does.md` (preparar ahora con huecos; decir desde el principio qué evidencia cierra la
  unidad). También `nzt/references/documents.md` regla 7: estado y fecha solo en los
  documentos del método, no en textos propios de la persona (salió en el caso de la carta).
  **Próximo paso:** iteración 2 de `nzt-do` (al menos el caso del flete), commit, y seguir
  con `nzt-tools` y `nzt-retro`.
- **2026-11-08:** commit `bd3e794` con `nzt-do` y **push** de `metodo-generico` a `origin`.
  Iteración 2 del caso del flete: **6/6** (antes 4/6): dejó `Flete.md` con huecos, mensaje
  para pedir presupuestos, tabla para comparar y pasos; dijo qué confirmación cierra la
  parte y la pidió. Salió un hueco más y se corrigió: en `nzt/references/state.md`, un plan
  aprobado con la próxima unidad pendiente → empezarla con `nzt-do`.

### Punto de retomada (2026-11-08)

**Hecho y probado** (en `plugin/skills/`, cada una con casos en su `evals/`):

| Skill | Qué hace | Prueba |
|---|---|---|
| `nzt` | Entrada: lee el estado, aclara, dimensiona, quién hace, herramientas, paquetes, carpeta, le cuenta a la persona y deriva | 4 casos, 26/26 con skill, 46% sin |
| `nzt-plan` | Corta en unidades (qué deja, cuándo está lista, quién la hace), ordena por riesgo, marca recortables y tirones, espera el sí, anota en `Plan/state.md` | 3 casos, 16/16 con skill, 38% sin |
| `nzt-do` | Hace una unidad (o guía, o enseña), verifica con evidencia, registra y para con reporte | 3 casos; tras corregir el flete, todos los criterios con skill |

Las referencias compartidas son de `nzt` (`state`, `glossary`, `starting`, `sizing`,
`packages`, `documents`, `messages`); `nzt-plan` tiene `slicing`; `nzt-do` tiene `who-does`,
`teaching` y `verify`.

**Pendiente, en orden:**

1. **Debatir la enseñanza.** El usuario quiere que enseñar sea una skill aparte, partiendo de
   `nzt-learn` de `nzt-software` (currículo, lecciones, ejercicios con soluciones aparte,
   evaluación, repasos espaciados), y no una referencia de `nzt-do` (`teaching.md`). Dijo
   también que hay que quitarla de `nzt-software`: **en esta rama `nzt-software` no se
   modifica**, así que eso queda para cuando se integren; acá solo se diseña la skill
   genérica. Preguntas abiertas: si es `nzt-learn` en el núcleo o un paquete; cómo la elige
   `nzt` (hoy el paso 6 manda a `nzt-do` a enseñar); qué pasa con `teaching.md`.
2. Escribir **`nzt-tools`** (proponer, investigar en fuentes oficiales con un sí, instalar con
   otro sí, comprobar, registrar en `Docs/agent-tools.md` con rechazadas; plantilla
   `agent-tools.md`).
3. Escribir **`nzt-retro`** (solo a pedido; propone mejoras sin cambiar nada; señala qué
   merece un paquete).
4. Actualizar `design/Estructura.md` con lo que cambió al escribir las skills (columnas de
   unidades, `messages.md`, enseñanza), y crear los manifiestos del plugin (Claude Code y
   Codex) en `plugin/`.

**Cómo se prueba una skill** (lo que se hizo hasta ahora): casos en `evals/<caso>/` con el
formato de `skill-creator`; por cada caso, un subagente con las skills (empezando por
`nzt/SKILL.md`) y otro sin skill, cada uno en su carpeta del scratchpad; calificar en
`grading.json`; `py -m scripts.aggregate_benchmark` y
`py eval-viewer/generate_review.py --static` desde la carpeta de `skill-creator` (en esta
máquina Python se llama con `py`). Los resultados del scratchpad no están en el repo.

**Detalle visto:** el ejemplo de `nzt/references/messages.md` está en inglés y una corrida
escribió primero los títulos en inglés; si se repite, poner el ejemplo en español o aclarar
que los títulos van en el idioma de la persona.

## Primer paso sugerido

*Propuesta de Claude:* antes de escribir el método, investigar BMAD-Method y dos o tres
métodos más en sus fuentes. Después, separar en `nzt-software` lo que es genérico de lo que
es de software, y escribir en esta carpeta los principios del método antes que su
estructura.
