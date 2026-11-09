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
  conviven. Observación del usuario (2026-11-09): si se apoya en él, `nzt-software` tendrá
  que quitar lo que el genérico ya hace y quedarse con el saber de software como paquete. Se decide **después** de tener el método genérico; la idea del usuario es que
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
- **2026-11-08:** debatida la enseñanza. El usuario aceptó E1–E5 (`Ensenanza.md`):
  `nzt-learn` en el núcleo, un solo `Plan/state.md` por tema con los objetivos como
  unidades, `nzt` y `nzt-do` derivan a ella, `teaching.md` se borra, y se adapta la de
  `nzt-software` con ejemplos de varios dominios y sin jerga. **Próximo paso:** escribir
  `nzt-learn` con `gestionar-skills` y `skill-creator`, ajustar `nzt` y `nzt-do`, y
  probarla con y sin la skill.
- **2026-11-08:** escrita **`nzt-learn`** (`plugin/skills/nzt-learn/`: `SKILL.md` y 7
  referencias), auditada con `gestionar-skills`. `nzt` y `nzt-do` derivan a ella;
  `teaching.md` borrada. Cinco casos en `nzt-learn/evals/`. Iteración 1: 89% con skill, 85%
  sin; corregidos dos problemas (lección en la conversación y práctica con fecha).
  Iteración 2: **96% con skill, 79% sin**. Detalle y lo que queda en charla en
  `Ensenanza.md`. Sin commit. **Próximo paso:** que el usuario decida lo de *En charla* en
  `Ensenanza.md`, commit, y seguir con `nzt-tools`.
- **2026-11-08:** decididos E6 (repasos vencidos directo, con opción de saltear) y E7
  (criterio de BUSCARV ajustado), en `Ensenanza.md`. **Pedido nuevo del usuario:** las
  preguntas del método se hacen con la herramienta de preguntas del host
  (`AskUserQuestion` en Claude Code; en Codex, la que ofrezca), como regla general siempre
  presente. Claude propone dónde ubicarla y cómo escribirla; **en charla**. Sin commit.
- **2026-11-08, aclaraciones del usuario:** (1) el plugin instalado nombra **solo** la
  herramienta de su host: el de Claude Code no menciona Codex y viceversa; (2) le parece
  que alcanza con que `nzt` lea `messages.md`, sin que cada skill lo nombre. Claude propuso
  un archivo por host que el build copia al plugin de cada uno, y que `nzt` sea el núcleo
  que las demás cargan si no está en contexto. **En charla**, sin escribir.
- **2026-11-09, decisiones del usuario:** `nzt` es la skill base, siempre presente, y todo
  se carga desde ella (no `AGENTS.md` ni `CLAUDE.md`, como en `nzt-software`); se descarta
  un archivo por host, y la regla de preguntas se escribe genérica, sin nombrar hosts ni
  herramientas. Hecho: `nzt/SKILL.md` (paso 1 nuevo: leer `messages.md`; pasos
  renumerados a 12), `messages.md` → *Asking*, y `nzt-plan`, `nzt-do` y `nzt-learn` cargan
  `nzt` si falta y ya no nombran `messages.md`. Principio 17 en `Principios.md`. Sin commit.
- **2026-11-09, prueba (iteración 4, solo con skill):** (1) entrada directa por
  `nzt-learn` con el caso de italiano: cargó `nzt` y `messages.md` antes de responder,
  mandó las dos pruebas en el mensaje y una sola decisión (qué situaciones del viaje) con la
  herramienta de preguntas, la recomendada primero. Visto: al cargar `nzt` desde otra skill
  no corrió sus pasos de herramientas y paquetes, y esta vez no preguntó por la carpeta. (2)
  Mudanza por `nzt`: la carpeta fue a la herramienta de preguntas ("Sí, creala
  (recomendado)") y lo abierto (supuestos, presupuesto) quedó en el mensaje. Ninguna nombró
  un host. **Próximo paso:** decidir si `nzt` cargada desde otra skill corre sus pasos
  completos; commit; seguir con `nzt-tools`.
- **2026-11-09, aclaración del usuario:** `nzt` no la carga otra skill: tiene que ser la
  **primera skill cargada en cada sesión**, siempre. Claude miró cómo lo logra
  `nzt-software`: sin hooks, con la `description` de su skill `nzt` ("Load it first in every
  session, before anything else, even for a question, and again after the conversation is
  compacted") y un caso de prueba que lo verifica (`evals/routing/kernel-loaded`). Propuesta
  en charla: lo mismo acá, más que las demás skills, si arrancan sin `nzt`, la carguen y
  sigan desde su paso 1; y un hook de inicio de sesión en el plugin como refuerzo, para
  evaluar al armar los manifiestos.
- **2026-11-09, decidido:** puntos 1 y 3 sí; el 2 no: las demás skills **no** repiten que
  se cargue `nzt`. Hecho: la `description` de `nzt` dice que se carga primero en cada
  sesión, antes que nada, incluso para una pregunta, y otra vez tras compactar; quitado el
  resguardo de `nzt-plan`, `nzt-do` y `nzt-learn`; caso `nzt/evals/kernel-loaded`. El hook
  de inicio de sesión queda para cuando se armen los manifiestos. Sin commit.
- **2026-11-09:** antes de escribir `nzt-tools`, Claude resumió el diseño y cómo lo hace
  `nzt-software` (`research/references/tools.md`, kernel *Agent tools*) y propuso la skill:
  `SKILL.md` con los pasos del principio 10 y la referencia `agent-tools.md` (plantilla),
  genérica (sin comandos ni hosts), tomando de `nzt-software` el orden de fuentes, "si no se
  repite, no hay herramienta", las claves nunca en la conversación y "si está anotada, se
  usa". El usuario aceptó lo recomendado en T1–T5 (`Archivos.md` → *Decididos*).
  **Próximo paso:** escribir `nzt-tools`, ajustar el paso 3 de `nzt` (T4) y probarla.
- **2026-11-09:** escrita **`nzt-tools`** (`plugin/skills/nzt-tools/`: `SKILL.md` de 9 pasos
  y `references/agent-tools.md` con la plantilla y 4 reglas), auditada con
  `gestionar-skills` (dos pasadas; se quitó lo que repetía `messages.md`). `nzt/SKILL.md`
  paso 3 suma T4. Cuatro casos en `nzt-tools/evals/`: novela en documentos en la nube
  (pregunta antes de investigar), conector ya rechazado (no se reofrece), planillas de Excel
  (pidió buscar: investiga en fuentes oficiales y no instala sin otro sí) y cumpleaños (no
  hace falta nada). Iteración 1: **100% con skill (17/17), 77,5% sin**. Sin skill: no dice
  que no llega a los documentos y manda a activar un conector sin preguntar; investiga en
  directorios de terceros, sin qué tocan ni alcance. Los casos del rechazo y del cumpleaños
  no discriminan (pasan igual sin skill). Se repitió el detalle de los títulos en inglés
  (cumpleaños: *What I'm assuming*): `messages.md` ahora dice que los títulos van en el
  idioma de la persona. Sin commit.
- **2026-11-09:** el usuario dio por buena `nzt-tools` y pidió seguir. Para `nzt-retro`
  Claude propuso la adaptación de la retro de `nzt-software`; decididos R1–R4
  (`Estructura.md` → *Decididos*): preguntar siempre dónde se guarda, últimas 10 sesiones o
  las que elija la persona, la sección del método puede nombrar skills, y solo a mano.
  **Próximo paso:** escribir `nzt-retro` y probarla. Sin commit.
- **2026-11-09:** escrita **`nzt-retro`** (`plugin/skills/nzt-retro/`: `SKILL.md` de 8 pasos
  y `references/retro-file.md` con la plantilla y 7 reglas), auditada con
  `gestionar-skills` (la gravedad pasó a la referencia para que el paso 5 sea una sola
  acción). Cuatro casos en `nzt-retro/evals/`: retro de la mudanza con lugar dado, retro sin
  lugar (pregunta dónde), newsletter en su tercera edición (señala un paquete) y "¿cómo
  venimos?" (es estado, no retro). Iteración 1: **100% con skill (16/16), 86,6% sin**. Sin
  skill: escribe "qué cambiamos" como reglas ya decididas, sin destino ni estado
  `proposed`, y propone la guía sin atar cada aporte a su momento. Pedir el lugar y "¿cómo
  venimos?" no discriminan. Ajustes: el paso 1 decía "antes de leer nada" y chocaba con
  `nzt`, que lee el estado primero → "antes de revisar nada"; una respuesta escribió "No
  checked:" en inglés → `messages.md` aclara que esas marcas van en el idioma de la
  persona. Iteración 2 (mudanza, solo con skill): 7/7, marcas en español ("No
  verificado:"), solo se agregó la retro. Mostró un hueco: si la persona ya dio el lugar,
  no se avisaba de carpeta compartida → el paso 1 avisa en los dos casos. Sin commit.

- **2026-11-09:** commit `1c5e9ce` con `nzt-tools` y `nzt-retro`, y push. Pendiente 3
  hecho: `Estructura.md` reescrita con las seis skills como quedaron, sus referencias y el
  árbol del plugin; manifiestos `plugin/.claude-plugin/plugin.json` y `plugin/plugin.json`
  (portable, para Codex). `claude plugin validate` pasa (solo avisa que falta ícono); en
  Codex no se pudo validar. Defaults a confirmar: M1 (nombres de skills sin cambiar,
  `nzt:nzt-plan`…) y M2 (sin entrada en los marketplaces de la raíz, que están fuera de
  `nzt-method/`). Detalle en `Estructura.md` → *Decididos* → *Manifiestos*. Sin commit.
- **2026-11-09:** M1 corregido. El usuario pidió investigar Codex: instalado el plugin en
  un `CODEX_HOME` temporal, Codex lista las skills como `nzt:nzt-plan`, igual que Claude
  Code. Decidido acortar los nombres: carpetas y `name:` pasan a `plan`, `do`, `learn`,
  `tools` y `retro` (base `nzt`), con todas las menciones entre skills y en los casos
  actualizadas ("la skill `plan`"). Comprobado: `claude plugin validate` pasa y Codex lista
  `nzt:nzt`, `nzt:plan`, `nzt:do`, `nzt:learn`, `nzt:tools`, `nzt:retro`. Los casos no se
  volvieron a correr (solo cambió cómo se nombran). Sin commit.
- **2026-11-09:** commit `f9c045d` y push. El usuario confirmó que el marketplace queda
  pendiente (4) y dejó pendientes 5 y 6. A su pedido, carpeta de prueba manual fuera del
  repo, en el escritorio: `nzt-prueba/` con `CASOS.md` (cómo abrir una sesión con el
  plugin en Claude Code con `--plugin-dir` y en Codex con un marketplace local, y 7 casos
  acotados, uno por carpeta). Comprobado: Codex no acepta una ruta absoluta en un
  marketplace local; funciona con `./nzt`, un enlace (junction) a `nzt-method/plugin`, y
  guarda una copia al instalar.
- **2026-11-09:** el usuario borró `nzt-prueba/` tras probar los casos (está en la
  papelera). Para probarlo en la app de escritorio quedó `nzt-prueba/claude-marketplace/`
  (marketplace local `nzt-local`, enlace `./nzt` a `nzt-method/plugin`). Comprobado con un
  `CLAUDE_CONFIG_DIR` temporal: valida, se instala con `--scope local` (queda en
  `.claude/settings.local.json` de la carpeta, apagado fuera de ella) y lista las 6 skills;
  (después se comprobó que lo lee de su carpeta: los cambios entran en la sesión siguiente). El nombre `nzt` choca
  con `nzt@nzt` de `nzt-software` (apagado a nivel usuario); `nzt-state` y `nzt-look`
  siguen activos y se apagan por carpeta. No verificado dentro de la app. Sin commit.
- **2026-11-09:** a pedido del usuario, marketplace `nzt-local` agregado a su configuración
  real y plugin instalado con `--scope local` en `Escritorio/nzt-proyecto/` (vacía, para
  probarlo en un proyecto nuevo desde la app), con `nzt-state` y `nzt-look` apagados ahí.
  Comprobado: activo solo en esa carpeta; fuera de ella todo sigue como estaba.
- **2026-11-09, primera prueba real (app, `nzt-proyecto`, "quiero hacer una aplicación para
  cargar una lista de tareas"):** cargó `nzt` primero (pendiente 5 visto en la app), aclaró
  con 4 preguntas en el diálogo, lo tomó como trabajo directo, hizo un `index.html` con
  guardado en el navegador, lo verificó en el navegador y cerró bien en español. Hallazgos
  del usuario: (a) le chocó la pregunta "¿la hago yo o querés aprender?" (paso 7 de `nzt`
  se leyó como "preguntar siempre"); (b) eligió la tecnología sin consultarla. Visto en el
  registro: saltó el paso 9 (no leyó `packages.md` ni dijo que iba con lo que sabe, cuya
  regla ya pide ofrecer las prácticas como propuesta); el recuadro final del host salió en
  inglés. El usuario aceptó P1–P3 (ver `Estructura.md`, *Decididos*); aplicadas en `nzt`
  con casos nuevos `app-base-choices`, `spreadsheet-no-learn-question` y `learn-signal`.
  Probado contra la versión anterior (copia en el scratchpad), con `direct-software-bug` y
  `person-does-house-move` como regresión: nueva 26/26, anterior 87% (preguntó "¿la hago
  yo o querés aprender?", no dijo que iba con lo que sabe y armó la planilla antes de
  preguntar en qué programa). Ajuste en una segunda vuelta: la primera versión preguntaba
  la plataforma pero sin nombrar tecnologías; ahora cada opción nombra en concreto qué se
  usaría y qué implica (HTML + JavaScript, React Native, Electron; almacenamiento local,
  archivo, Firebase), y el criterio del caso lo exige. Sin commit. Comprobado con
  `claude plugin update`: un plugin de un marketplace local se lee de su carpeta ("nothing
  to update"), así que los cambios entran solos en la sesión siguiente de `nzt-proyecto`.
- **2026-11-09, segunda prueba real y rediseño:** en la app, el agente mezcló qué y cómo,
  el usuario corrigió la tecnología dos veces, no quedó nada escrito ni propuso
  herramientas. Decidido con el usuario y escrito en `Trabajo-por-etapas.md`: skills nuevas
  `define` (qué, entrevista, preguntas `Q-NN`, definiciones, `change.md`) y `approach`
  (cómo, preguntas `H-NN`, `how.md`, herramientas vía `tools`); `nzt` solo habla, lee el
  estado, dimensiona y rutea; `Docs/` en `General/`, `How/`, `Parts/<NN-nombre>/`,
  `Retros/`. Hecho y probado (9 casos, nueva 51/52 tras un ajuste, anterior 72%). Sin
  commit.
- **2026-11-09, tercera prueba real revisada (pendiente 0):** se confirmaron los dos puntos
  del usuario: `approach` se saltó el paso 8 (nunca propuso herramientas) y solo preguntó la
  base, sin estructura ni calidad (todo en `Program.cs`, "sin pruebas" decidido por el
  agente). Decididos D1–D4: herramientas siempre en el cómo y cuando harían mejor el
  trabajo (principio 10 reescrito, reemplaza P3); siete temas del cómo; se pregunta solo lo
  que falta; el genérico pregunta bien sin paquetes. Detalle y propuesta de construcción en
  `Trabajo-por-etapas.md` → *Tercera prueba real*. Sin commit.
### Punto de retomada (2026-11-09)

**Hecho y probado** (en `plugin/skills/`; desde el 2026-11-09 las skills se llaman `nzt`, `define`, `approach`, `plan`, `do`, `learn`, `tools` y `retro`, instaladas `nzt:<skill>`, cada una con casos en su `evals/`):

| Skill | Qué hace | Prueba |
|---|---|---|
| `nzt` | **Skill base:** se carga primero en cada sesión y otra vez tras compactar; solo habla (`messages.md`), lee el estado, dimensiona, deduce quién hace, revisa paquetes, resuelve lo propio del trabajo directo, ubica la carpeta (`folder.md`) y rutea a la skill dueña | casos propios + `new-app-interview`; ver `Trabajo-por-etapas.md` |
| `define` | Qué se quiere: entrevista en lenguaje natural por rondas, preguntas `Q-NN` guardadas, definición general y por parte, cambios con `change.md` | 2 casos + `new-app-interview` (`Trabajo-por-etapas.md`) |
| `approach` | Cómo se hace: decisiones según qué es el trabajo, preguntas `H-NN` aparte con opciones concretas, `how.md`, herramientas vía `tools` | 3 casos (app y cumple) |
| `plan` | Corta en unidades, ordena por riesgo, marca recortables y tirones, espera el sí, anota en `Plan/state.md` | 3 casos, 16/16 con skill, 38% sin |
| `do` | Hace una unidad o guía a la persona, verifica con evidencia, registra y para con reporte; si la persona aprende, pasa la unidad a `learn` | 3 casos (BUSCARV pasó a `learn`) |
| `learn` | Enseña: pregunta suelta, lección en la conversación o tema con carpeta; objetivos como unidades en `Plan/state.md`, ejercicios con la solución aparte, correcciones con pistas, evaluación y repasos espaciados | 5 casos, todos los criterios con skill (iteraciones 2–3), 79% sin |
| `tools` | Nombra la falta, mira lo que ya hay y lo rechazado, pregunta antes de investigar, investiga en fuentes oficiales, propone con la opción de ninguna, instala con otro sí en el alcance más chico, comprueba, anota en `Docs/How/agent-tools.md` y vuelve al trabajo | 4 casos, 17/17 con skill, 77,5% sin |
| `retro` | Solo a pedido: pregunta dónde guardarla, revisa las últimas 10 sesiones (o las que elija la persona) y los archivos del trabajo, convierte cada momento costoso en una propuesta con destino (trabajo, método o paquete), señala paquetes posibles y no cambia nada más | 4 casos, 16/16 con skill, 86,6% sin |

Las referencias compartidas son de `nzt` (`state`, `glossary`, `sizing`, `packages`,
`documents`, `messages`, `folder`, `questions`); `define` tiene `interview`,
`definition-file` y `change-file`; `approach` tiene `decisions` y `how-file`; `plan` tiene `slicing`; `do` tiene `who-does`
y `verify`; `learn` tiene `plan`, `teach`, `train`, `tutor`, `assess`, `retain` y
`exercises`; `tools` tiene `agent-tools`; `retro` tiene `retro-file`. La regla de preguntas (principio 17) está en `messages.md` → *Asking*, genérica:
ninguna skill nombra un host ni una herramienta.

**Pendiente, en orden:**

0. **Lo próximo:** auditoría aplicada y probada (31/34; las 3 fallas son de un caso de
   `plan` anterior a las etapas). Ver `Trabajo-por-etapas.md` → *Regresión de la
   auditoría*. Falta: commit (el usuario lo pide), actualizar los casos de `plan`, y decidir
   cómo se escribe un cambio que saca una parte entera.
1. ~~Escribir `nzt-tools`~~ hecho y aprobado el 2026-11-09, commit `1c5e9ce`.
2. ~~Escribir `nzt-retro`~~ hecho y aprobado el 2026-11-09, commit `1c5e9ce`.
3. ~~Actualizar `Estructura.md` y crear los manifiestos~~ hecho el 2026-11-09; M1
   decidido (nombres cortos).
4. **Marketplace (M2):** el usuario decidió que el plugin `nzt` **tiene que tener
   marketplace**, pero queda para después. Hay que sumar su entrada en
   `.claude-plugin/marketplace.json` (Claude Code) y en `.agents/plugins/marketplace.json`
   (Codex), en la raíz del repo, fuera de `nzt-method/`: pedir permiso antes de tocarlos.
   Decidir de dónde sale (la carpeta `nzt-method/plugin` o una rama propia, como
   `plugin-nzt-software`) y el pipeline de release propio.
5. Correr `nzt/evals/kernel-loaded` con el plugin instalado (necesita el marketplace o
   instalarlo desde la carpeta). El script de disparo de
   `skill-creator` (`scripts.run_eval`) falla en Windows (`WinError 10038`): no sirve para
   medirlo en esta máquina.
6. **Idea para el final:** un hook de inicio de sesión (y tras compactar) en el plugin de
   cada host que haga cargar `nzt`, como refuerzo de la `description`. No descartado; se
   ataca al final, sobre todo si `kernel-loaded` muestra que `nzt` no se carga primero. Va
   en la configuración del plugin, nunca en el texto de las skills.

**Cómo se prueba una skill:** casos en `evals/<caso>/` con el formato de `skill-creator`;
por cada caso, un subagente con las skills (empezando por `nzt/SKILL.md`) y otro sin skill,
cada uno en su carpeta del scratchpad; calificar en `grading.json`;
`py -m scripts.aggregate_benchmark` y `py eval-viewer/generate_review.py --static` desde la
carpeta de `skill-creator` (en esta máquina Python se llama con `py`). Para probar la regla
de preguntas, se le dice al subagente que no puede abrir diálogos y que escriba en una
sección "Question tool" lo que preguntaría con la herramienta. Los resultados del scratchpad
no están en el repo.

**Detalle visto:** el ejemplo de `nzt/references/messages.md` está en inglés y una corrida
escribió primero los títulos en inglés; si se repite, poner el ejemplo en español o aclarar
que los títulos van en el idioma de la persona.

## Primer paso sugerido

*Propuesta de Claude:* antes de escribir el método, investigar BMAD-Method y dos o tres
métodos más en sus fuentes. Después, separar en `nzt-software` lo que es genérico de lo que
es de software, y escribir en esta carpeta los principios del método antes que su
estructura.
