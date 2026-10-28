# 08 — Revisión de skills y references

> Run de revisión (unidades 377-386) · empezado 2026-10-28 · Solo lectura: no se tocó ninguna
> skill. Lo que acá se propone se decide en la 386 y se ejecuta en el tramo S2.

## La pregunta y contra qué se mide

**¿Dónde se puede refactorizar sin perder funcionamiento?** Cada hallazgo se mide contra los
cinco criterios que pidió el usuario (2026-10-28):

| # | Criterio | Qué se mira |
|---|---|---|
| C1 | Genérica | No depende de un stack, un host o un caso particular |
| C2 | Sin redundancia | Cada regla tiene **un dueño**; los demás lo citan |
| C3 | Mantenible, pasos simples | Un procedimiento numerado y corto; cambiar una regla toca un archivo |
| C4 | Modular | Un archivo, un propósito; el router rutea, la referencia explica |
| C5 | Liviana en contexto | Lo que se carga siempre es mínimo; lo demás se lee cuando hace falta |

Y contra las reglas que ya rigen: el tope de 200 líneas por archivo (D3, `specs/nzt-core.md`
§10), una referencia nunca manda a leer otra (`04-propuesta.md`, decisión 2) y el run anterior
(`01`-`07`), que no se repite.

Cada hallazgo dice la evidencia, el criterio que afecta, el caso que se rompe, las opciones y
si es **error** (contradice algo verificable, se arregla) o **discutible** (lo decide el
usuario en la 386). Sin campo de severidad: el costo se lee en *Caso*.

---

## 377 · El marco: kernel, `nzt`, `nzt-plan`, `nzt-delegate`, agentes

Leído (fuente del repo, no lo instalado): `core/kernel.md`, `core/adapter-*.md`,
`skills/nzt/SKILL.md`, `skills/nzt/plan/` (SKILL y las 4 references),
`skills/nzt/delegate/` (SKILL y 2 references), `agents/nzt-explorer.md`, `agents/nzt-worker.md`,
y la D78 de la spec. ≈1.450 líneas.

### M1 · El kernel contradice al tamaño "directo" — **error**

- **Evidencia:** `nzt` §4 y D78 (`specs/nzt-core.md:405`, `:2548`): directo es *"sin plan ni
  estado"*. El kernel dice lo contrario en tres lugares: el bucle siempre propone un plan y lo
  escribe en el estado (`core/kernel.md:36-41`); *"Skip the file only for work that is a single
  unit in a project that has no state yet"* (`:74-75`); y la regla dura *"Never skip the state
  update at the end of a unit"* (`:146`).
- **Afecta:** C2, C3. El kernel siempre está en contexto y le gana en peso a un router.
- **Caso:** el proyecto tiene un `Plan/state.json` de un run cerrado y el usuario reporta un
  bug. `nzt` dice que es directo, sin estado; el kernel dice que hay estado y que hay que
  escribirlo y proponer un plan. El agente elige uno u otro según cuál pesó más en ese turno.
- **Opciones:**
  a) El kernel dice el bucle **escalado por tamaño**: directo = entender → hacer → verificar →
     reportar; estándar y completo = el bucle con plan y estado. Y la línea 75 pasa a decir
     *"directo no escribe estado"*. Costo bajo, reescribe ~6 líneas del kernel *(recomendada)*.
  b) Se cambia D78: el directo escribe estado cuando ya existe uno. Contradice la intención de
     D78 (menos ceremonia), así que habría que reabrirla.
- **Termina como:** cambio en el kernel y una línea en D78/§5.1.

### M2 · Las reglas de parar, reanudar y del run nuevo viven en tres lugares — **discutible**

- **Evidencia:**
  - *Orden de cierre de unidad* (punto seguro → estado → reporte → parar): `core/kernel.md:48-50`
    y `nzt-plan` *Stopping and reporting* 1-3.
  - *Acompañado por defecto, tanda cerrada*: `core/kernel.md:50-52` y `nzt-plan` *Approval and
    autonomy*.
  - *Parar por contexto*: `core/kernel.md:53, 62-68` y `nzt-plan` *Stopping early*.
  - *Leer el estado al arrancar, qué hacer con `doing`, con todo `done`, con `approved: false`*:
    `core/kernel.md:72-73`, `nzt` §1, y `nzt-plan` *Resuming* y *A new run rewrites the file*.
- **Afecta:** C2, C3.
- **Caso:** D84 (paralelo) tuvo que tocar el kernel, `CLAUDE.md`/`AGENTS.md`, `nzt-plan`,
  `parallel.md` y `nzt-delegate` para una sola regla (`Plan/state.json` del run anterior, unidad
  375). La próxima regla de parada va a pedir lo mismo, y basta olvidar uno para que diverjan.
- **Opciones:**
  a) **Un dueño por regla**: el kernel se queda con el invariante en una línea (*"cada unidad
     termina en un punto seguro, con el estado escrito antes del reporte; ver `nzt-plan`"*) y
     `nzt-plan` con el procedimiento. `nzt` §1 se reduce a *"leé el estado y seguí `nzt-plan`
     → Resuming"*. Ahorra ~15 líneas del kernel, que se cargan siempre *(recomendada)*.
  b) Dejarlo: la repetición en el kernel es a propósito, para que la regla se cumpla aunque
     `nzt-plan` no se cargue. Es un costo de mantenimiento conocido.
- **A tener en cuenta:** `nzt-worker` corre con `omitClaudeMd: true` (`agents/nzt-worker.md:6`):
  no ve el kernel. Las reglas que sólo queden en el kernel no le llegan al worker; las que
  necesita ya están en su archivo de agente.

### M3 · Clasificar está repartido en cuatro tablas que se pisan — **discutible**

- **Evidencia:** `nzt` clasifica con §3 (situación del terreno), los bullets de §3 (tipo de
  pedido en un proyecto existente), §4 (tamaño) y §5 (fases). *"Small change"* y *"Reported bug"*
  aparecen en los bullets de §3 y otra vez como *Direct* en §4, con efectos redactados distinto:
  §3 dice *"write only the spec for what you touch"*, §4 dice *"No plan and no state"*.
  `slices.md` (*When*) y `proposal.md` (*Standard work*) repiten qué hace cada tamaño.
- **Afecta:** C3, C2.
- **Caso:** un cambio chico en un proyecto existente sin NZT: §3 dice escribir la spec de lo que
  se toca; §4 lo hace directo. ¿Lleva spec o no? Leído rápido, son dos respuestas.
- **Opciones:**
  a) **Una sola tabla de decisión** en `nzt`: *tipo de pedido × terreno → tamaño, fase de
     inicio, qué documentos*, seguida de la lista de fases. El aprendizaje queda como primera
     fila. `slices.md` y `proposal.md` citan el tamaño en vez de redefinirlo *(recomendada)*.
  b) Dejar las tablas, pero que los bullets de §3 apunten a la fila de §4 en vez de repetir.

### M4 · Dos nombres para la misma fase: "analysis" y "discovery" — **error menor**

- **Evidencia:** el estado sólo acepta `analysis` (`nzt-plan` *The state file*); el router se
  llama `nzt-discovery`; `slices.md` habla de *"the discovery slice"* y *"starting with
  discovery"* (`nzt` §5); el kernel dice *"Functional analysis"* y rutea a `nzt-discovery`.
- **Afecta:** C3. El glosario del propio método tiene dos palabras.
- **Caso:** un plan que diga *"fase discovery"* falla `nzt-ai state check`; uno que diga
  *"tramo de análisis"* no se asocia con el router.
- **Opciones:** a) en el texto, siempre *analysis* para la fase y `nzt-discovery` sólo como
  nombre del router, con una línea en `nzt` que los una *(recomendada)*; b) renombrar la fase en
  el estado a `discovery` — rompe estados existentes y el panel `nzt-state`.

### M5 · `nzt-plan` está en el tope de 200 líneas y mezcla cuatro cosas — **discutible**

- **Evidencia:** `skills/nzt/plan/SKILL.md` = 200 líneas (D3 es tope duro). Contiene el esquema
  del estado, cómo cortar unidades, aprobación y autonomía, ejecución, preguntas, el bloque de
  contradicción, cómo parar y cómo reanudar. El kernel manda a cargarlo **cada vez que se lee o
  escribe el estado** (`core/kernel.md:73-74`).
- **Afecta:** C4, C5. La próxima regla no entra sin sacar otra.
- **Caso:** en una unidad de build que sólo escribe el estado al terminar, se cargan las 200
  líneas, de las que hacen falta las ~30 del esquema y el cierre.
- **Opciones:**
  a) Router chico (cortar, aprobar, ejecutar, parar) y `references/state.md` con el esquema y
     sus reglas, que es lo que se carga al escribir el estado. *Questions* y el bloque de
     contradicción pasan a una referencia compartida (ver M6) *(recomendada)*.
  b) Dejarlo y aceptar que el próximo cambio obliga a recortar.

### M6 · Las reglas de preguntar están en tres lugares con formatos distintos — **discutible**

- **Evidencia:** formato de la pregunta con opciones en `core/kernel.md:19-25`; rondas de 3-5,
  propuesta con la pregunta, registrar lo elegido, dos salidas (`[TO-DEFINE]`) en `nzt-plan`
  *Questions*; log de `QT-NN`, etiquetas de origen y modos (propuestas, juntos, dictado) en
  `nzt-architecture`. Las otras fases (378+) falta leerlas para saber si suman otra versión.
- **Afecta:** C2, C4.
- **Caso:** el kernel dice *"each format lives where it is used"* (`:26`) pero el formato de la
  pregunta vive en el kernel, y las reglas sobre qué preguntar viven en el plan.
- **Opciones:** a) una referencia `questions.md` (en `nzt-plan`) con qué preguntar, cómo y dónde
  queda; el kernel conserva sólo el formato visible; b) dejarlo hasta ver las otras fases.
  **Se decide en la 386**, con lo que salga de 378-385.

### M7 · El texto de ruteo de cada router está escrito tres veces — **discutible**

- **Evidencia:** cada fase se describe en la fila del kernel (`core/kernel.md:83-91`; la fila de
  build tiene ~330 caracteres), en el `description` del frontmatter de su skill y en su sección
  *Owns*. La tabla del kernel se carga siempre; el `description` también entra en el listado de
  skills, que en Claude Code tiene presupuesto (`02-buenas-practicas-skills.md`, B1).
- **Afecta:** C2, C5.
- **Caso:** sumar un tipo de trabajo a una fase pide editar tres textos; si se olvida el del
  kernel, el ruteo instruido no lo conoce.
- **Opciones:** a) filas del kernel de una línea corta (la frase que decide entre fases); el
  detalle de *Owns* queda en el router. Ahorra ~1.000 caracteres siempre cargados; b) dejarlo:
  el detalle en el kernel ayuda a rutear sin cargar el router. **Necesita medir el ruteo** antes
  de recortar, y el usuario descartó los evals: se decide en la 386.

### M8 · Fórmulas repetidas en cada router — **discutible, chico**

- **Evidencia:** *"Paths are relative to this skill's folder. Read the file before acting on the
  row"* en 11-13 archivos; *"Wherever a file names `nzt-<x>`…"* en 9. Las dos ya las dice el
  kernel (`core/kernel.md:93-99`).
- **Afecta:** C2.
- **Pero sostienen algo:** el worker y el explorer no ven el kernel (`omitClaudeMd: true`) y
  cargan routers. Sacar la fórmula de los routers deja al worker sin la regla.
- **Opciones:** a) dejarla en los routers y quitarla del kernel, que ya rutea a ellos; b) dejarla
  en los dos lugares, a sabiendas *(recomendada: son dos líneas y protegen al worker)*.

### M9 · El formato de respuesta del explorador está escrito dos veces — **error menor**

- **Evidencia:** `delegate/references/reading.md:45-62` define el formato de lo que vuelve y
  `agents/nzt-explorer.md` lo vuelve a definir. Para el worker se hizo bien:
  `units.md:75` dice *"The shape of its report is in its agent file"*.
- **Afecta:** C2. Además, el lema de `delegate/SKILL.md:13` está repetido casi igual en
  `reading.md:6`.
- **Opciones:** a) `reading.md` remite al archivo de agente, como `units.md` *(recomendada)*.

### Lo que se revisó y está bien

- `nzt-delegate` está bien partido: router con modo y tabla, una referencia por tipo de
  delegación, el formato del worker en un solo lugar.
- `parallel.md` y `close.md` tienen pasos numerados, alcance claro y *Done when* verificable.
- Los dos agentes son cortos, con permisos acotados y un formato de salida cerrado.
- El kernel ocupa 150 + 11 líneas (≈2.400 tokens estimados): el costo fijo es razonable. Lo
  que pesa es la repetición (M2, M7), no el tamaño.

### Lo que no se pudo medir

- Si recortar las filas del kernel (M7) empeora el ruteo: sin evals, no hay cómo medirlo.
- Que lo instalado esté atrasado respecto del repo es fuera de alcance. Por ejemplo, a la
  `nzt-plan` instalada le falta `parallel.md`, y el kernel instalado tiene la regla de
  delegación vieja. Se va a resolver con el próximo build y la instalación.

### Hallazgo para la 386 (transversal)

- 83 archivos tienen *Closing checklist* (485 ítems) y 7 routers tienen además *Done when*;
  en `nzt-architecture` la checklist repite las *Rules*. Hay que ver en 378-385 si checklist,
  *Done when* y *Rules* se superponen en general.

---

## 378 · `nzt-discovery` y `nzt-research`

Leído: `skills/nzt/discovery/SKILL.md` y sus 7 references, `skills/nzt/research/SKILL.md`.
≈1.150 líneas. Las dos son genéricas (C1): ningún stack ni host, y los ejemplos son siempre el
mismo producto (Pedidos y sus cupones), lo que ayuda.

### D1 · Las *Rules* del router repiten el contenido de `analysis.md` — **discutible**

- **Evidencia:** de los 10 ítems de *Rules* de `discovery/SKILL.md:74-97`, 7 son resúmenes de
  secciones de `references/analysis.md`. Son: append-only (`:79` ↔ `analysis.md:59-67`), preguntar
  en comportamiento y la pregunta de bordes (`:82-84` ↔ `:76-81`), notas técnicas sin id (`:85` ↔
  `:89-93`), objeción descartada (`:91` ↔ `:95-99`), dos alturas (`:76` ↔ `:101-113`) y playback
  (`:96` ↔ `:115-126`). Además, *Done when* del router (`:99-104`) es casi el de `analysis.md:128-136`.
- **Afecta:** C2, C5. El router se carga en cada unidad de análisis, pero esas reglas sirven
  solamente a la entrevista: en una unidad de historia (`write-stories.md`) pesan ~25 líneas que
  no se usan.
- **Caso:** si se cambia cómo se marca una respuesta reemplazada, hay que hacerlo en dos lugares
  que hoy ya no coinciden: el router dice `replaced by Q-07` (`:80`) y la referencia
  `Superseded by Q-09.` (`analysis.md:63`). **Esa diferencia ya es un error menor.**
- **Opciones:** a) *Rules* del router queda con lo que vale para **toda** unidad de la fase: las
  reglas viven en la feature y se citan; el alcance en las dos direcciones; un NFR es un
  resultado; ingeniería inversa nunca declara una regla. Lo de la entrevista queda sólo en
  `analysis.md`, y la checklist del router se recorta a lo transversal *(recomendada)*;
  b) dejarlo y unificar solamente el texto de la respuesta reemplazada.

### D2 · "Producto primera versión + glosario obligatorios" está escrito en cinco lugares — **discutible**

- **Evidencia:** `nzt` §3 (*New feature*) y §4 (*Standard*), `plan/references/proposal.md`
  (*Mandatory*), `discovery/SKILL.md:52-61` (*Mandatory*) y `discovery/references/product.md:137-148`
  (*A first version*).
- **Afecta:** C2, C3.
- **Caso:** D78 tuvo que agregar *"first version"* en todos. Si mañana el glosario deja de ser
  obligatorio en el trabajo estándar, quedan cinco textos para alinear, y `proposal.md` es el que
  arma el plan que el usuario aprueba.
- **Opciones:** a) el dueño es `discovery/SKILL.md` *Mandatory* (qué y cuándo) y `product.md`
  (cómo es la primera versión); `nzt` y `proposal.md` dicen sólo *"los documentos obligatorios
  de cada fase los declara su router"* *(recomendada; encaja con M3)*; b) el dueño es
  `proposal.md`, porque es el que lista documentos.

### D3 · Cuándo se escriben las historias, según la cadencia, está en tres lugares — **discutible, chico**

- **Evidencia:** `plan/references/slices.md` (*Cadence*), `write-spec.md:125-129` (índice) y
  `write-stories.md:112-117` (*When a story is written*). Los tres dicen lo mismo: las reglas y el
  índice antes del primer build, y los criterios según la cadencia.
- **Afecta:** C2.
- **Opciones:** a) el dueño es `slices.md`; las dos references de discovery dicen
  *"cuándo: según la cadencia (`nzt-plan`); las reglas nunca esperan"* en una línea *(recomendada)*.

### D4 · El ejemplo del merge en `change.md` enseña una línea de cobertura sin `qa` — **error**

- **Evidencia:** `change.md:89` (`[remove] · backend —`) y `:97` (`backend — · frontend —`). La
  regla de `write-stories.md:77-80` dice que **`qa` cierra cada línea** y que se escriben todas
  las áreas.
- **Afecta:** la consistencia del formato. Un ejemplo pesa más que una regla en prosa.
- **Caso:** un cambio que se mergea siguiendo el ejemplo deja criterios sin `qa`. Después
  `nzt-verify` no tiene dónde marcar, y `close.md` (*every area and its `qa` marked*) no puede
  cerrar.
- **Opción:** agregar `· qa —` a las dos líneas del ejemplo.

### D5 · El significado de los marcadores está en tres references — **discutible, chico**

- **Evidencia:** qué pasa con un criterio reescrito (vuelve a `[ ]` sólo si cambia lo que se
  observa) en `change.md:100-103` y `write-stories.md:121-123`. Cómo se barren `[modify]` y
  `[remove]` en `plan/references/close.md:46-59`. Son coherentes entre sí.
- **Afecta:** C2. Hoy no se contradicen; es costo de mantenimiento.
- **Opciones:** a) `change.md` es el dueño de los marcadores; `write-stories.md` remite *"un
  criterio cambiado: `nzt-discovery-change`"*. Pero choca con la regla de que una referencia no
  manda a leer otra (`04-propuesta.md`, decisión 2), así que habría que llevarlo a la fila *Read
  with* del router; b) dejarlo *(recomendada: son dos líneas coherentes)*.

### D6 · Tres vocabularios para decir de dónde salió una afirmación — **para la 386**

- **Evidencia:**
  - `nzt-research` usa `documented / observed / inferred / unverified`.
  - `nzt-explorer` y `delegate/reading.md` usan `seen / inferred`.
  - El log de `nzt-architecture` usa `usuario / agente, dentro del alcance / investigado /
    propuesta / [TO-DEFINE]`. Están en castellano dentro de una skill en inglés: es el único lugar
    que fija etiquetas en un idioma.
  - Discovery usa el `origin:` `Q-NN / PRD / reverse`.
- **Afecta:** C1 (las etiquetas en castellano dejan de ser genéricas para un proyecto en otro
  idioma) y C2.
- **Caso:** un proyecto en inglés tiene un log de decisiones con `usuario`, mientras el kernel
  pide escribir los artefactos en el idioma del usuario.
- **A decidir:** si se unifica en un solo vocabulario. Por ejemplo, research y explorer con las
  mismas cuatro etiquetas (`seen` = `observed`). Y si las etiquetas del log se traducen al idioma
  del proyecto. Falta ver 379-385.

### Lo que se revisó y está bien

- Cada reference de discovery tiene un propósito, un archivo de ejemplo, reglas y un *Done when*
  que se puede ensayar. Las fórmulas *"Rehearse it: …"* son una buena convención.
- `analysis.md:72-74` **remite** la disciplina de preguntas a `nzt-plan` en vez de copiarla: es
  el patrón que M2, M6 y D1 proponen generalizar.
- Están bien separados: la regla vive en la spec, las historias la citan por slug y el progreso
  se lee sólo de los criterios. No hay dos fuentes de verdad.
- `nzt-research` es una sola skill de 120 líneas, con pasos claros (decisión → versión → fuente →
  etiqueta → destino). La citan 9 archivos y no tiene redundancia relevante.

---

## 379 · `nzt-architecture`

Leído: `skills/nzt/architecture/SKILL.md` y sus 13 references (los tres archivos que dibujan
diagramas, por títulos y reglas en negrita). ≈1.900 líneas. La calidad de cada documento es
alta: propósito, ejemplo, qué no va y *Done when*. Los problemas están en lo que se repite
entre archivos.

### A1 · `design-product.md` manda a leer otra reference para el formato del log — **error**

- **Evidencia:** `design-product.md:155-156`: *"Its shape is the one
  `nzt-architecture-design-feature` writes out"*. La fila de `design-product` en el router
  (*Read with*: sólo `diagrams.md`) no incluye `design-feature.md`. Eso contradice la regla
  acordada de que **una referencia nunca manda a leer otra; la resuelve la tabla del router**
  (`04-propuesta.md`, decisión 2).
- **Afecta:** C4, y el resultado: el formato del log no está en lo que el agente leyó.
- **Caso:** en la unidad del diseño de producto, el agente escribe
  `architecture-decisions.md` sin haber visto el ejemplo del log, que vive en otra reference.
  Ese log también es donde `stack-axes.md` registra cada eje.
- **Opciones:**
  a) El formato del log (el ejemplo y las etiquetas) sale de `design-feature.md` y va a una
     reference propia, `decisions-log.md`. Esa reference se lee con las tres filas que escriben
     el log: producto, stack y feature. El router se queda con *"el log es append-only, al lado
     del documento"* y la tabla de etiquetas sale de ahí *(recomendada; también achica el router,
     ver A2)*.
  b) Sumar `design-feature.md` al *Read with* de las filas de producto y stack. Así se cargan
     200 líneas para leer 25.

### A2 · El protocolo de preguntas `QT` está escrito cuatro veces — **discutible**

- **Evidencia:**
  - El router lo define (*The questions come before the design*, *How they get resolved…*, *The
    decisions log*: ≈50 líneas).
  - `design-product.md:26-36` y `design-feature.md:188-216, 341-354` lo vuelven a resumir.
  - `stack-axes.md:259-272` lo aplica a los ejes.
  - Las dos references de diseño abren con *"If you did not arrive here from
    `nzt-architecture`, load it first"*, que ya dice el kernel (`core/kernel.md:93-99`).
  - Fuera de la fase, `nzt-plan` *Questions* (M6) y `nzt-discovery` (`analysis.md`) tienen su
    propia versión.
- **Afecta:** C2, C5.
- **Caso:** en una unidad de diseño de feature se leen ≈80 líneas sobre cómo preguntar: router +
  `design-feature.md`. Cambiar las tres clases de pregunta (hecho, detalle, tradeoff) pide tocar
  cuatro archivos.
- **Opciones:** a) el router es el dueño del protocolo y cada reference agrega sólo lo suyo en
  una línea: *"acá, las preguntas salen de las reglas"*. Se borran las aperturas *"load it
  first"* *(recomendada)*; b) un `questions.md` común a todas las fases (M6), que fija las tres
  clases, los modos y el log, y cada router lo cita. Se decide en la 386 junto con M6.

### A3 · El router repite sus propias reglas y repite a sus references — **discutible**

- **Evidencia:** `architecture/SKILL.md` = 200 líneas (el tope de D3).
  - *"Design against the spec, not against the request"* está en *Rules*, `design-product.md:41`
    y `design-feature.md:214`.
  - *"Decide for what is known"* está en *Rules* y es una sección de `design-product.md`.
  - *"Respect what exists"* está en *Rules* y en `design-product.md:45`.
  - *"The stack document is mandatory"* está en *Rules*, en *Where it lands* y en `stack.md:21`.
  - La *Closing checklist* (9 ítems) repite *Rules* y el protocolo, y está después de un *Done
    when* que dice lo mismo en un párrafo.
- **Afecta:** C2, C5. A los 200 líneas, no entra nada nuevo sin sacar otra cosa.
- **Opciones:** a) el router queda con límites, protocolo de preguntas, tabla de references y
  dónde aterriza; cada regla de diseño vive en la reference que la usa; un solo cierre (*Done
  when*) sin checklist duplicada *(recomendada)*; b) sólo sacar la checklist.

### A4 · Los modos y las etiquetas del log están en dos idiomas — **error menor**

- **Evidencia:** el router nombra los modos en inglés, *Proposals / Together / Dictated*, y las
  etiquetas en castellano, `usuario`, `agente, dentro del alcance`, `investigado`, `propuesta`.
  El ejemplo del log (`design-feature.md:266`) escribe *"Modo elegido: **juntos**"*.
- **Afecta:** C1. Es el caso concreto de D6. El kernel dice que los artefactos se escriben en
  el idioma del usuario.
- **Caso:** un proyecto en inglés recibe etiquetas `usuario`; uno en castellano recibe un modo
  que el router llama *Together* y el log *juntos*. Ninguno de los dos sabe qué texto literal
  usar.
- **Opciones:** a) la regla fija **qué significa** cada etiqueta y dice que se escriben en el
  idioma del proyecto, con el ejemplo en un solo idioma *(recomendada)*; b) fijarlas en inglés
  como identificadores, igual que `[TO-DEFINE]`.

### A5 · Los valores de los ejes del stack están copiados de las tablas de build — **discutible**

- **Evidencia:** `stack-axes.md:215-217` dice que sus valores *"are copied from those tables, and
  those tables are the source when they disagree"*. Es decir, son dos copias de los mismos valores,
  y lo reconoce. Las tablas fuente son `build/references/practices-backend.md` y
  `practices-frontend.md`, en *Exclusive axes*. Lo que `stack-axes.md` agrega es la columna *What
  it costs*.
- **Afecta:** C2.
- **Caso:** si se suma un valor de arquitectura a `practices-backend.md`, como `modular-monolith`,
  y no se copia en `stack-axes.md`, no se ofrece cuando se escribe el stack.
- **Opciones:** a) la columna de costo pasa a las tablas de `practices-*` y `stack-axes.md` las
  **lee** (ya cruza a `../nzt-build/` para las de router de área). Así queda con el método de
  preguntar y no con valores *(recomendada; se confirma en la 382, al leer `practices-*`)*;
  b) dejar las dos copias y sumar al *Done when* de build un chequeo de que coinciden.

### A6 · Cuatro archivos quedan justo en 200 líneas, apretados — **para la 386**

- **Evidencia:** en 200 están `architecture/SKILL.md`, `design-feature.md`, `stack.md` y también
  `plan/SKILL.md` (M5). Se ve que están apretados: el índice de `design-feature.md:3-5` está
  comprimido en 3 líneas con `·`, y `stack.md:21` es una sola línea de ~190 caracteres.
- **Afecta:** C3. El tope hace que se recorte la forma en lugar del contenido repetido.
- **Lectura:** no se propone mover D3. Si se sacan las repeticiones de A2 y A3, esos archivos
  bajan solos.

### Lo que se revisó y está bien

- `diagrams.md` ya es el patrón bueno: las convenciones comunes en un archivo y los tres que
  dibujan sólo agregan su límite y sus reglas. Cada documento de diseño repite en ~5 líneas qué
  diagrama gana. Es poco, y sirve para ofrecerlo al armar el plan; se deja.
- `domain.md`, `contexts.md`, `adr.md`, `rfc.md` y `tech-debt.md` tienen cada uno un propósito,
  una tabla de *qué no va acá* y un ejemplo coherente con el resto del set.
- **Genericidad (C1):** el método es agnóstico. Los ejemplos son .NET (`Pedidos.Api`,
  `.NET 10`, EF Core, en `stack.md`), pero las reglas no dependen de eso. Se puede dejar así.

---

## 380 · `nzt-ux`

Leído: `skills/nzt/ux/SKILL.md`, `screen.md`, `mockup.md`, `system.md` y `review.md`
completos, y `manual.md` por títulos y reglas en negrita. ≈780 líneas.

### U1 · UX y verify citan criterios como `CA-NN`, pero los criterios no tienen id — **error**

- **Evidencia:**
  - La plantilla de historia (`discovery/references/write-stories.md:34-44`) escribe los
    criterios como bullets, **sin número**.
  - `plan/references/close.md:116-117` lo dice explícito: *"criteria have no stable
    identifier, so pointing at one creates a dead reference that looks valid"*.
  - Sin embargo, `US-NNN CA-NN` es el origen obligatorio de cada elemento en
    `ux/SKILL.md:81`, aparece 6 veces en `screen.md` y una en `ux/references/review.md:66`.
  - Fuera de la fase también lo usan `verify/references/test-design.md` (3 veces) y
    `verify/references/bug.md` (una).
- **Afecta:** la trazabilidad entre historia, pantalla, prueba y bug, que es lo que estos
  documentos prometen.
- **Caso:** se agrega un criterio arriba en US-002. *"US-002 CA-01"* en la pantalla y en el
  escenario de prueba ahora apunta a otro criterio, y nada lo detecta.
- **Opciones:**
  a) Los criterios llevan un id estable que no se reusa (`CA-01` en el título en negrita de
     cada criterio). Se cambia `write-stories.md` y se corrige `close.md:116`. Lo que ya
     cita `CA-NN` pasa a ser correcto *(recomendada: hay 4 archivos que ya dependen de eso)*.
  b) Se cita el criterio por el texto de su título (`US-002 · "An expired coupon leaves the
     total untouched"`) y se cambian los 4 archivos. Es más frágil: se rompe si se reescribe.

### U2 · *Rules*, *Done when* y checklist del router son de la pantalla, no de la fase — **discutible**

- **Evidencia:** 8 de las 11 *Rules* de `ux/SKILL.md:80-105` repiten `screen.md`: origen,
  regiones, estados, diseño hecho afuera, `update-when`. El *Done when* (`:109-111`) y los 7
  ítems de la checklist (`:115-121`) hablan de *"the story"*, *"primary action"* y *"narrow
  screen"*: sólo valen para una pantalla.
- **Afecta:** C2, C5, y que la fase quede bien definida (C3). Es el mismo patrón que D1 y A3,
  más marcado.
- **Caso:** en una unidad del manual o del sistema de diseño, el agente cierra con una
  checklist que le pide *"una acción primaria"* y *"`update-when` en el frontmatter"*, que no
  aplican. O la ignora, que es peor: aprende que la checklist del router no hay que leerla.
- **Opciones:** a) el router queda con lo que vale para **toda** unidad de UX: *"la historia es
  la autoridad; el diseño nunca introduce comportamiento"*, *"lo que no se puede decidir queda
  pendiente"*, *"el mecanismo es del sistema y el contenido de la historia"*. El *Done when* y la
  checklist de pantalla viven en `screen.md`, que ya los tiene *(recomendada)*; b) dejarlo.

### U3 · El manual fija reglas de tono en castellano rioplatense — **error menor**

- **Evidencia:** `manual.md:70-72`: *"Cargás el pedido"*, y *"Never `simplemente`, `obviamente`,
  `solo tenés que`"*. Son reglas de redacción con las palabras prohibidas de un idioma.
- **Afecta:** C1. El kernel pide escribir en el idioma del usuario, y la misma reference dice
  *"written in the language the person uses the product in"* (`:28`).
- **Caso:** un manual en inglés o en castellano neutro no tiene regla de tono, porque la regla es
  una lista de palabras de una sola variante.
- **Opciones:** a) escribir la regla por **lo que hace** la palabra (*"palabras que minimizan el
  esfuerzo: 'simplemente', 'just', 'obviamente'"*), con ejemplos en dos idiomas como ilustración
  *(recomendada)*; b) dejarla y aceptar que el manual es para proyectos en castellano.

### U4 · Los chequeos de HTML y de accesibilidad están escritos tres veces — **discutible**

- **Evidencia:** *Measure, do not trust* con 320 px, contraste sobre pares reales y orden de
  teclado aparece en `mockup.md:65-76` y `manual.md:126-137`. Los umbrales (4.5:1, 3:1, 24×24,
  foco visible) aparecen en el ejemplo de `system.md:168-171` y en `review.md:49-55`.
- **Afecta:** C2. Si se sube el nivel a WCAG 2.2 AAA o cambia el ancho mínimo, se tocan tres
  archivos.
- **Opciones:** a) los umbrales viven sólo en `review.md`, que es el que verifica. El ejemplo de
  `system.md` los deja como *"los que el producto adoptó"*, y `mockup.md` y `manual.md` dicen
  *"medido como `review.md`"*. Pero eso es una reference que cita otra, así que entra por *Read
  with* en el router *(recomendada)*; b) dejarlo: son 6 líneas y cada archivo queda completo.

### U5 · El prototipo de la entrega 1 se ofrece desde tres lugares — **discutible, chico**

- **Evidencia:** la regla de cuándo y dónde se ofrece el prototipo (en el tramo de discovery,
  cuando la entrega 1 tiene algo que aprender) está en `plan/references/slices.md` (*Delivery
  1*), en `discovery/references/product.md:119-120` y en `ux/references/mockup.md:80-82`.
- **Afecta:** C2.
- **Opción:** el dueño de *cuándo* es `slices.md` y el de *cómo* es `mockup.md`; `product.md`
  sólo dice qué pregunta define la entrega 1 *(recomendada)*.

### U6 · Las preguntas que abre UX no tienen dónde vivir — **para la 386**

- **Evidencia:** UX convierte lo indefinido en *"un `Q-NN`"*, que se lista como pendiente en el
  diseño de pantalla (`ux/SKILL.md:82`, `screen.md:207-208`, `screen.md:200-201`). La serie `Q-NN`
  es del log de análisis (`discovery/references/analysis.md:50-51`: *"assigned once and never
  reused"*). Ninguna reference de UX dice que la pregunta se escribe primero en `analysis.md`.
- **Caso:** la pantalla abre `Q-14` en su sección *Pending*; el `analysis.md` de la feature ya
  tiene una `Q-14` distinta. Hay dos preguntas con el mismo id.
- **A decidir con M6/A2:** quién numera cada serie (`Q`, `QT`) y dónde se escribe la pregunta que
  surge en otra fase.

### Lo que se revisó y está bien

- La separación de responsabilidades es clara: la historia es la autoridad, el mecanismo es del
  sistema de diseño y la pantalla describe regiones, no píxeles. Las references no se pisan.
- `mockup.md` define bien qué lo hace mockup y no código a medio hacer. La sección de prototipo
  es buena: dice qué cambia, cuándo se borra y cuándo se mantiene.
- `review.md` es corta, con una tabla de qué puede probar cada entrada, y la tabla *tipo →
  destino* manda cada hallazgo a su dueño.

---

## 381 · Router `nzt-build` y references de método

Leído: `skills/nzt/build/SKILL.md` y `implement.md`, `tests.md`, `recon.md`, `refactor.md`,
`remove.md`, `tdd.md`, `dependencies.md` y `secrets.md`, completos. ≈1.140 líneas. Todas son
genéricas (C1): ninguna nombra un lenguaje, salvo la tabla de área del router (B5).

### B1 · Las *Rules* del router son `implement.md` otra vez — **discutible, el más grande hasta ahora**

- **Evidencia:** de los 15 ítems de *Rules* de `build/SKILL.md:117-150`, 11 están en
  `implement.md` casi con las mismas palabras. Son:
  - la memoria operativa del stack, que el manifiesto gana y no subir una versión
    (`:119-124` ↔ `implement.md:25-32`);
  - el setup autorizado y el paquete que confirma el usuario (`:81-83` ↔ `:33-36`);
  - los marcadores de cambio (`:128-132` ↔ tabla de `:76-92`);
  - la deuda técnica (`:133-135` ↔ `:127-129`);
  - los artefactos generados, los tres estados de pantalla y el frontend que valida forma
    (`:140-146` ↔ `:96-103`);
  - el componente ajeno (`:142` ↔ `:68-70`);
  - el bug en una unidad (`:139` ↔ `:107-118`).

  El *Done when* y la checklist del router (`:152-169`) repiten el *Closing* de `implement.md`
  (`:131-142`). La regla del manifiesto está además en `dependencies.md:41-44` y en
  `architecture/references/stack.md` (*Versions come from evidence*): **cuatro copias**.
- **Afecta:** C2, C5.
- **Caso:** si se cambia *"el manifiesto gana"* por *"se pregunta cuál gana"*, hay que tocar
  cuatro archivos. Si se olvida uno, el agente que implementa una historia lee las dos reglas
  en la misma carga, porque el router y `implement.md` se leen juntos.
- **Opciones:** a) el router queda con *Boundaries*, *Required guidance*, las tablas, *One
  unit*, *Where it lands* y *Comment conventions*. Este último vale para toda unidad de la fase
  y está bien ahí. Cada regla vive en la reference que la usa, y el cierre en cada reference.
  Baja de ≈170 a ≈110 líneas *(recomendada)*; b) dejar en el router sólo los títulos de las
  reglas, una línea cada uno, con la reference dueña.

### B2 · Implementar una historia carga ≈520 líneas de método antes del stack — **para la 386**

- **Evidencia:** la fila *Implementing* lee el router (169) + `implement.md` (153) +
  `tests.md` (197) = **519 líneas**, y después el router de área y sus references. La fila de
  TDD suma `tdd.md` (75): ≈600. Las tres repiten entre sí *"report what ran"*, *"static
  inspection is not a passing suite"* y *"not covered until QA"*.
- **Afecta:** C5. Es la unidad que más se repite en un run (una por historia).
- **Medido:** las líneas. **Estimado**, no medido: ≈8.000 tokens por unidad sólo de método.
- **Lectura:** con B1 y B3 resueltos baja a ≈400. Partir `tests.md` en *"qué testear y cómo
  se ve un test"* y *"integración y disciplina"* sirve sólo si la mitad no se usa en la
  mayoría de las historias. Hoy, con `Test levels` en unit, la sección de integración (≈25
  líneas) no se usa. Se decide en la 386.

### B3 · El límite build/verify y el *"not covered until QA"* están escritos cinco veces — **discutible**

- **Evidencia:** el límite está en `build/SKILL.md:15-22` (*Boundaries*), `implement.md:56-64`
  (*Marking coverage*) y `tests.md:334-336` (*Where this stops*). El cierre *"not covered until
  QA"* está en el *Done when* y la checklist del router, en el *Closing* y el *Done when* de
  `implement.md`, y en el *Closing* de `tdd.md:283-287`.
- **Afecta:** C2.
- **Opciones:** a) el límite vive en *Boundaries* del router, que se carga siempre en la fase.
  El cierre vive en `implement.md`, y `tdd.md` y `refactor.md` dicen *"el cierre de
  `implement.md`"*. Para eso `implement.md` tiene que estar en su *Read with*: para TDD ya está,
  para refactor no *(recomendada)*.

### B4 · Los marcadores de cambio se explican en cinco lugares — **amplía D5**

- **Evidencia:** `build/SKILL.md:128-132`, `implement.md:76-92`, `remove.md:195-198`,
  `discovery/references/change.md:100-106` y `plan/references/close.md:46-59`. Hoy coinciden.
- **Afecta:** C2.
- **Opción:** el dueño es `change.md`, porque es quien los pone. Las references de build dicen
  una línea, *"un marcador es autorización; nunca lo agregás ni lo borrás"*, que es lo único que
  necesita quien implementa. `close.md` se queda con el barrido. Así quedan tres lugares con
  tres funciones distintas, en vez de cinco copias *(recomendada)*.

### B5 · La tabla de área del router nombra cada tecnología — **discutible**

- **Evidencia:** `build/SKILL.md:57-60` tiene una fila por tecnología (`.NET`, `Blazor`), y
  `:49-52` las vuelve a nombrar en prosa. `ship/SKILL.md` tiene la suya (falta verlo en la 384).
- **Afecta:** C1, C4. Sumar un stack (Node, React) pide editar el router genérico, que es
  justo lo que la capa genérica quiso evitar (`01-diagnostico-marco.md`, H1).
- **Caso:** se agrega `nzt-build-frontend-react` como skill y nadie la carga, porque la tabla
  del router no tiene su fila.
- **Opciones:** a) regla por nombre: *"si existe la skill `nzt-build-<area>-<tecnología>` que
  el stack seleccionó, cargala; si no, `practices-<area>.md`"*, y la tabla queda como ejemplo.
  Es más genérica, pero depende de que el agente vea el listado de skills, y en Claude Code ese
  listado tiene presupuesto (`02`, B1); b) dejar la tabla: es explícita y cuesta una fila por
  stack nuevo *(recomendada mientras haya dos o tres stacks)*.

### B6 · Reglas de frontend en el router genérico de build — **error menor de lugar**

- **Evidencia:** *"Every screen that loads data has three states"* y *"The frontend validates
  shape"* están en las *Rules* del router (`:144-146`) y en `implement.md:96-100`, bajo *"Rules
  that hold whatever the stack is"*. Son reglas del área frontend, y `practices-frontend.md`
  existe para eso. Los estados de pantalla son además una regla de UX (`ux/SKILL.md:92-94`).
- **Afecta:** C4. Una unidad de backend las carga sin usarlas.
- **Opción:** moverlas a `practices-frontend.md` (se confirma en la 382 si ya están ahí) y que el
  router de Blazor las herede como herede el resto.

### Lo que se revisó y está bien

- `recon.md`, `refactor.md`, `remove.md`, `dependencies.md` y `secrets.md` tienen cada uno un
  procedimiento corto y numerado, un límite claro (*"lo que no hace"*) y un *Done when* que se
  puede ensayar. Ahí están los "pasos simples a seguir" que pediste.
- `tests.md` separa bien **el valor** (qué testear) **del orden** (`tdd.md`) y **del cómo**
  (la reference del área). Es el patrón genérico → específico de `07-extraccion.md` funcionando.
- *Comment conventions* en el router está bien puesto: vale para toda unidad de la fase.
- La regla de secretos está dos veces (`implement.md:104-105` y `secrets.md`) **a propósito**:
  es una regla de seguridad que conviene tener a mano en cada historia. Se deja.

---

## 382 · Capa genérica de práctica de `nzt-build`

Leído: `practices-backend.md` y `practices-frontend.md` completos. De las otras 28 references
(`backend-*`, `data-*`, `frontend-*`, `code-*`, ≈2.900 líneas) se midieron los títulos, las
citas entre archivos y los rastros de stack, y se leyeron completas las secciones que parecían
duplicadas. **No se leyeron enteras una por una**: esta unidad buscaba estructura y repetición,
no defectos de contenido.

### Lo primero: la extracción del run anterior funcionó

- **Medido:** en los 30 archivos de la capa hay **cero** apariciones de `.NET`, `C#`, `EF Core`,
  `DbContext`, `ASP.NET`, `Blazor`, `csproj`, `LINQ`, `IQueryable`, `Task<`, `xUnit`,
  `FluentValidation` o `ProblemDetails`. La capa es genérica (C1) en la letra.

### G1 · `practices-*` son un segundo nivel de ruteo dentro de `references/` — **contradicción entre dos decisiones, para la 386**

- **Evidencia:** `practices-backend.md` y `practices-frontend.md` no enseñan nada propio: son
  tablas de *"leé esta reference"*, con su propia columna *Read with* (`practices-backend.md:13-58`).
  El router de build manda a una reference que manda a otras. Eso choca con dos cosas: la
  decisión 2 de `04-propuesta.md` (*"una referencia nunca manda a leer otra; la tabla del router
  lo resuelve"*) y la práctica oficial de que las references estén a un solo nivel de la SKILL.md
  (`02-buenas-practicas-skills.md`, regla de las 100 líneas, S1). Pero el usuario aprobó
  `practices-*` en la decisión 4 del mismo documento.
- **Afecta:** C4. Hay dos maneras de rutear en el mismo set: la del router, y la de un índice
  dentro de references.
- **Caso:** un proyecto Node lee el router de build, después `practices-backend.md` y después,
  por ejemplo, `data-pagination.md`, que tiene a `data-queries.md` en su *Read with*. Son tres
  niveles. Para .NET, en cambio, el router de área es una skill y las references genéricas están
  a un nivel. **El mismo contenido se alcanza con distinta profundidad según el stack.**
- **Opciones:**
  a) Las tablas de `practices-*` pasan al router de build como *"Backend sin router de área"* y
     *"Frontend sin router de área"*, y `practices-*` desaparecen. El router crece ≈45 líneas, y
     con B1 resuelto queda en ≈155 *(recomendada: un solo nivel y una sola manera de rutear)*.
  b) Se registra en la spec que `practices-*` es la excepción a la decisión 2, con la razón:
     no cargar ≈45 líneas de tablas en proyectos .NET que no las usan.

### G2 · Las dos `practices-*` repiten su cabecera y su cierre palabra por palabra — **chico**

- **Evidencia:** la cabecera (`practices-backend.md:3-9` ↔ `practices-frontend.md:3-9`) y
  *Applying a generic reference to a technology* (`:60-69` ↔ `:105-114`) son iguales salvo una
  frase.
- **Afecta:** C2.
- **Opción:** con G1 a), esas líneas van una vez en el router. Con G1 b), igual conviene dejarlas
  en un solo archivo.

### G3 · La guarda del agregado mínimo está explicada dos veces — **chico**

- **Evidencia:** `backend-domain-ddd.md` (*The minimum aggregate*) y `data-mapping.md`
  (*Loading: the minimum aggregate*) explican completa la misma regla: un invariante sobre una
  colección toma el número de la base y no se calcula sobre una carga parcial. Con eje `ddd` y
  una tarea de mapeo, se leen las dos en la misma unidad.
- **Afecta:** C2.
- **Opción:** el dueño de la regla es `backend-domain-ddd.md`; `data-mapping.md` se queda con
  *cómo se carga* (cargar para cambiar, filtrar lo grande, no cargar para leer) y nombra la
  guarda en una línea.

### G4 · Confirma B6: las reglas de frontend ya tienen dueño en la capa genérica

- **Evidencia:** *"Every screen that loads data has three states"* es una sección de
  `frontend-components.md:85-90` y un ítem de su checklist (`:124`). *"The frontend validates
  shape"* abre `frontend-forms.md:18`. Las copias del router de build y de `implement.md` sobran.

### G5 · Confirma A5: los valores de los ejes están en dos lugares

- **Evidencia:** los valores de cada eje están en las tablas de `practices-backend.md:13-21` y
  `practices-frontend.md:85-87`, y otra vez en `stack-axes.md`. Si se aplica G1 a), las tablas
  quedan en el router de build, y `stack-axes.md` las lee de ahí para agregar el costo.

### G6 · Dos convenciones de cierre en el mismo set — **para la 386**

- **Evidencia:** las references de método de build, las de discovery y las de arquitectura
  cierran con *Done when* (*"Rehearse it: …"* + viñetas). Las 28 references de práctica cierran
  con *Closing checklist* (239 ítems `- [ ]`) y sin *Done when*. Los routers tienen las dos.
- **Afecta:** C3. Quien escribe una reference nueva no sabe cuál usar, y el agente no sabe si
  una checklist hay que marcarla y reportarla o es sólo un recordatorio.
- **A decidir:** una convención. Por ejemplo, *Done when* en toda reference de documento o
  procedimiento, y checklist sólo donde son reglas de código que se verifican línea por línea.

### Lo que se revisó y está bien

- **Las secciones repetidas entre alternativas exclusivas no son redundancia.**
  *"With direct persistence, the handle is reached through an interface"* está en
  `backend-architecture-clean.md` y en `-hexagonal.md`, pero el stack elige una sola: nunca se
  leen juntas, y cada una queda completa. Se deja.
- **Las ≈27 citas entre references son de dueño, no de lectura:** *"su excepción llega al
  handler global (`backend-errors.md`)"*. Dicen quién es dueño de qué, sin mandar a leer, y es
  lo que la decisión 2 permite. Las que hacen falta para trabajar ya están en el *Read with* de
  `practices-*`.
- Cada reference de práctica tiene un tema y títulos que ya son reglas: *"Nothing reaches the
  database inside a loop"*, *"Check before saving, never catch the save"*. Es fácil de
  recorrer y de mantener.

---

## 383 · Capa de stack: build .NET, C#, Blazor y ship .NET

Leído: los routers `build/backend/dotnet/SKILL.md`, `build/csharp/SKILL.md` (tabla y títulos),
`build/frontend/blazor/SKILL.md` y `ship/backend/dotnet/SKILL.md`, completos. De las references
se leyeron muestras (`use-cases.md`, `results-pattern.md`, `blazor/components.md`). ≈700 líneas
leídas de ≈2.900.

### Lo que funciona: cada reference .NET es delgada y lee la genérica primero

Cada fila de los routers de stack empareja la reference de la tecnología con la genérica, con
*"first, required"* (`dotnet/SKILL.md:42-100`, `blazor/SKILL.md:49-69`). Las muestras abren con
*"Read `../nzt-build/references/backend-use-cases.md` first … This file holds only what is
.NET"* (`dotnet/references/use-cases.md:3-5`), y tienen 39 líneas contra las 127 de la genérica.
Es exactamente el *"extraer, no copiar"* de `07-extraccion.md`. **No se encontró contenido
genérico copiado en las references de stack que se leyeron.**

### S1 · El eje *organización de componentes* de Blazor no se pregunta al escribir el stack — **error**

- **Evidencia:** `blazor/SKILL.md:29-32` dice que la organización de componentes es un eje del
  stack, con las opciones `inline` o `code-behind`, y que si el stack no lo dice *"it is a
  question, answered once and written in the stack"*. Pero el eje no está en la tabla de ejes
  exclusivos del router (`:45-53`). `stack-axes.md` saca los ejes del router de área **de esa
  tabla** (*"from that router's table"*, `stack-axes.md:255-257`).
- **Afecta:** el resultado. El eje se termina preguntando en medio de una unidad de build, que es
  lo que `stack.md` busca evitar (*"never in the middle of a build unit"*, `:156-157`).
- **Caso:** se escribe el stack de un frontend Blazor y quedan respondidos el modo de render y la
  arquitectura, pero no la organización. En la primera historia, `components.md` necesita saber
  si se usa `@inject` o `[Inject]`, y el agente para a preguntar o sigue al código vecino.
- **Opción:** agregar la fila *Component organisation · `inline` / `code-behind`* a la tabla de
  ejes del router de Blazor. Cuesta una fila.

### S2 · El bloque *"Read the stack first"* y las *"Two escapes"* están copiados en cada router de stack — **discutible**

- **Evidencia:**
  - *"An installed folder is not an authorisation"* está en 5 archivos: los routers de build,
    .NET, Blazor y ship .NET, más `build/SKILL.md:62`.
  - *"The manifest wins"* está en 5: el router de build, `implement.md`, `dependencies.md`, y
    los routers de .NET y Blazor. Con otras palabras, también en `stack.md` y en el router de
    ship .NET.
  - *"Two escapes"* está en los routers de .NET y Blazor, que son iguales palabra por palabra,
    y antes en el router de build y en `implement.md`.
  - *"If you did not arrive here from `nzt-build`, load it first"* está en los cuatro routers de
    stack.
- **Afecta:** C2. Son ≈25 líneas por router de stack, y se cargan junto con el router de build
  que ya las dice.
- **Caso:** un stack nuevo (`nzt-build-frontend-react`) copia el bloque, porque es lo que
  muestran los existentes. Ya hay 5 copias de la misma regla.
- **Opciones:** a) el dueño es el router de build, que siempre se carga antes. Cada router de
  stack conserva solamente la **evidencia propia de su tecnología** en una línea (*"versión:
  `TargetFramework`, `global.json`"*) *(recomendada)*; b) dejarlo: un router de área se puede
  cargar sin el de build si el ruteo falla (R2 de la spec, `specs/nzt-core.md:953`), y la copia
  protege ese caso. Si se elige b), al menos que sea un solo bloque idéntico en todos, y que el
  build lo chequee.

### S3 · Implementar una historia .NET carga ≈1.330 líneas de guía — **para la 386**

- **Medido:** un listado paginado en .NET lee el router de build, `implement.md`, `tests.md`, el
  router de .NET, el de C#, `code-code.md`, `data-access.md`, `ef-core.md`, `ef-core-pagination.md`,
  `data-pagination.md`, `ef-core-queries.md` y `data-queries.md`. Son **1.327 líneas**.
  **Estimado**: ≈20.000 tokens.
- **Lectura:** es el precio aceptado de separar lo genérico de lo específico. El usuario pidió
  que .NET produzca el mismo código que antes (`07-extraccion.md`). Lo que se puede bajar sin
  tocar eso son las repeticiones de método: B1, B3 y S2 suman ≈120 líneas. También se puede
  revisar si la fila de paginación necesita sus cinco *Read with* (`dotnet/SKILL.md:94`).
  `ef-core-queries.md` y `data-queries.md` se leen igual, porque paginar es una consulta.

### S4 · Tres párrafos de "un nombre `nzt-…` es esta ruta" que el kernel ya resuelve — **amplía M8**

- **Evidencia:** `dotnet/SKILL.md:71-80`, `csharp/SKILL.md:25` y `ship/backend/dotnet/SKILL.md:38-39`
  traducen nombres como `nzt-build-tests` a rutas. El kernel ya tiene la regla general (*"its
  router is the longest prefix that is a skill"*, `core/kernel.md:96-98`).
- **Lectura:** es el mismo caso que M8. El worker no ve el kernel, así que la copia lo protege.
  Se decide junto con M8.

### Lo que se revisó y está bien

- Las tablas de los routers de stack son explícitas: cada eje, cada valor, qué se lee y en qué
  orden. Agregar un valor nuevo cuesta una fila.
- *Independent axes* (.NET) y *Three confusions* (Blazor) son advertencias propias de la
  tecnología, cortas y útiles. No repiten nada.
- El router de ship .NET dice bien *lo que no decide* (si se despliega, si existe una migración,
  cuáles son los gates) y nombra al dueño de cada cosa.

---

## 384 · `nzt-verify` y `nzt-ship`

Leído: `verify/SKILL.md` completo; de las 9 references de verify y de `ship/SKILL.md` con sus 4
references, los títulos, las reglas en negrita y búsquedas de las reglas que se repiten.
≈450 líneas leídas de ≈1.670: se paró a leer por estructura porque esta unidad cruzó el 30% de
contexto. Las dos fases son genéricas (C1); la única tabla de tecnología es la de área de ship
(`ship/SKILL.md:63-65`, el mismo caso que B5).

### V1 · Las *Rules* de verify y de ship repiten sus references — **mismo patrón que D1, A3, U2 y B1**

- **Evidencia, verify** (`verify/SKILL.md`, 195 líneas):
  - El vocabulario cerrado `pending/passed/failed/blocked` está en el router (`:140-141`), en
    `test-design.md:109-111` y en `test-run.md:125`.
  - Los dos scripts por escenario están en el router (`:144-146`), en `test-data.md:52`
    (sección propia), en `test-design.md:113` y en `test-run.md:26`.
  - *"Un re-test no pisa el anterior"* está en el router (`:160-161`) y en `test-run.md:127`.
  - Los tres estados del bug están en el router (`:162-164`) y en `bug.md:57` (*Three states, not
    two*).
  - *"A UI scenario is never marked passed on API evidence"* está dos veces en el mismo router
    (`:88-89` y `:153-154`) y en `test-run.md` (*Through the real entry point*).
  - *"The stop that comes first"* (`:92-113`) repite *The plan is approved before anything runs*
    de `test-design.md`.
- **Evidencia, ship:** las *Rules* de `ship/SKILL.md:83-116` son las secciones de `release.md`
  (*Readiness*, *Exposure, least first*, migraciones, *Verify in the environment*) y de `vcs.md`
  (*Never rewrite shared history*). *Authorisation* (`:29-42`) está también como sección de
  `release.md`.
- **Afecta:** C2, C5.
- **Opción:** la misma que en las otras fases. El router queda con lo que vale para **toda**
  unidad de la fase y cada regla vive en la reference que la usa. En verify, *"When it runs"*,
  *"Which component, and with what"* y *"The stop that comes first"* sí valen para toda la fase y
  pueden quedarse en el router, pero sin repetir lo que dicen las references *(recomendada)*.

### V2 · Dos fases preguntan el mecanismo de datos de prueba — **error menor**

- **Evidencia:** `architecture/references/stack.md:127-131` dice que las cinco opt-ins, incluida
  *Test data*, se preguntan **cuando se escribe el stack** (*"the cheap moment"*). `verify/SKILL.md:102-106`
  y `test-data.md:40` dicen que se pregunta **con el plan de prueba** y se registra en el stack.
  Ninguno de los dos dice *"si el stack ya lo responde, se lee y no se pregunta"* en el lugar
  donde se pregunta.
- **Caso:** el stack se escribió con `Test data: SQL scripts, run by the agent against dev`. En la
  primera unidad de verify, el router manda a preguntarlo otra vez con el plan.
- **Opción:** verify dice *"el mecanismo es la opt-in *Test data* del stack: si está, se usa; si
  falta, es un hueco del stack y se pregunta una vez"* *(recomendada)*. O bien `stack.md` deja esa
  opt-in para verify. Pero eso contradice *"every one is answered"*.

### V3 · *"Verify corre después del tramo"* está escrito cuatro veces — **discutible**

- **Evidencia:** está en `nzt` §5 (*Verify*), en `plan/references/slices.md` (*Inside a slice* y
  *When QA fails inside the batch*), en *When it runs* de `verify/SKILL.md:13-22` y en *Boundaries*
  de `build/SKILL.md:20-22`.
- **Afecta:** C2.
- **Opción:** el dueño es `slices.md`, porque es el que corta. El router de verify conserva la
  primera frase como recordatorio y la excepción (*bug y lecturas no necesitan tramo*), que es
  propia de la fase. `nzt` y build citan.

### Lo que se revisó y está bien

- Las references de verify tienen un propósito cada una y cortes claros: diseñar, crear datos,
  correr, explorar, medir, automatizar, leer código, auditar documentos y registrar el bug. La
  tabla *"Which component, and with what"* del router (qué prueba cada blanco y qué no puede
  probar) es de lo más claro del set.
- Las references de ship son cortas (69-150 líneas) y cada una termina en *"Verify it by running
  it / watching it arrive"*: piden evidencia, no una declaración.

---

## 385 · `nzt-learn`

Leído completo: `learn/SKILL.md` y las 7 references (`plan`, `teach`, `train`, `tutor`,
`exercises`, `assess`, `retain`). 951 líneas. Ningún archivo pasa de 177 (D3 se cumple). El
método es genérico (C1); los ejemplos son todos del mismo caso, EF Core (ver *Lo que se revisó
y está bien*).

### L1 · Quién puede dar el veredicto `achieved` está dicho de tres formas distintas — **error**

- **Evidencia:**
  - `train.md:86-88`: *"Training does not hand out verdicts. The objective moves to a verdict
    through `nzt-learn-assess`, on a case nobody practised."*
  - `plan.md:141-143`: los cinco veredictos son los que *"`nzt-learn-assess` says how to earn"*.
  - Pero `tutor.md:26`: la celda `high / right` gana *"`achieved`, if the case was new"*; y
    `tutor.md:85-87`: `solved by the system` pasa a `achieved` *"when they do it alone, on a
    different case"*, sin evaluación. Lo mismo el router (`SKILL.md:102-104`).
  - `teach.md:125-127`: el objetivo *"closes"* cuando produjo en *alone* y lo explicó sin el
    material; no dice si eso es `achieved` o si espera a la evaluación.
- **Afecta:** C2, C3, y la regla central de la rama (*"nothing is credited that they did not do"*).
- **Caso:** la persona entrega EX-04 en *alone*, con un caso nuevo, confianza alta, bien. Según
  `tutor.md` se escribe `achieved`; según `train.md` y `plan.md`, sigue `in progress` hasta una
  evaluación. Dos sesiones del mismo tema escriben estados distintos para la misma evidencia, y
  `retain.md` agenda repasos distintos según cuál pasó.
- **Opciones:**
  a) **Sólo `assess` da veredictos.** La columna de `tutor.md` pasa a decir *"listo para
     evaluar"* en vez de `achieved`; `teach.md` y el router dicen *"cierra la práctica; el
     veredicto lo da `assess`"*. Una evaluación es corta (3-4 tareas), así que no frena
     *(recomendada: es lo que ya dicen dos de las tres fuentes, y "un caso que nadie practicó"
     no lo elige quien corrigió la práctica)*.
  b) Tutor puede dar `achieved` con caso nuevo + explicación sin material, y `assess` queda
     para el cierre del tema. Más rápido; cambian `train.md` y `plan.md`.
- **Termina como:** cambio en `tutor.md`, `teach.md` y `SKILL.md` (o en `train.md` y `plan.md`
  con b).

### L2 · `retain.md` cita como evidencia una carpeta `reviews/` que no existe — **error**

- **Evidencia:** el ejemplo de `retain.md:63` pone como evidencia `reviews/2026-10-02`. *Where it
  lands* (`SKILL.md:71`) lista `lessons/`, `exercises/`, `solutions/`, `assessments/`: no hay
  `reviews/`. Y `retain.md:3-4` dice que produce *"las fechas y las sesiones cortas"*, sin archivo.
- **Afecta:** la regla *"every state names its evidence"* (`plan.md:139-140`): el estado cita un
  artefacto que nadie crea.
- **Caso:** un repaso sale bien; el agente copia el ejemplo, escribe `reviews/2026-10-02` en la
  tabla, y la próxima sesión no encuentra nada que auditar.
- **Opciones:**
  a) El repaso no produce archivo y la evidencia es su línea del log: el ejemplo cita
     *"log 2026-10-02"* *(recomendada: el repaso es corto y el log ya lo registra)*.
  b) Se agrega `reviews/<fecha>.md` a *Where it lands* y a `retain.md`. Un archivo más por
     repaso.

### L3 · `retain.md` no dice en qué escalón entra un objetivo recién logrado — **error menor**

- **Evidencia:** la escalera es *1 día → 3 días → 1 semana → 3 semanas → 2 meses*
  (`retain.md:9`), con reglas para avanzar, volver y saltar, pero no para entrar. El ejemplo de
  `plan.md:118` pone el primer `achieved` (2026-09-25) a 3 semanas (2026-10-16): el cuarto
  escalón.
- **Caso:** dos sesiones agendan el primer repaso de un objetivo recién logrado a 1 día y a 3
  semanas, y `retain.md` no permite decir cuál está mal.
- **Opción:** una línea en `retain.md`: *"un veredicto nuevo entra en el primer escalón"*, y el
  ejemplo de `plan.md` pasa a 2026-09-26 *(recomendada)*. O *"entra en 1 semana"*, diciendo por
  qué la evaluación lo justifica.

### L4 · *Rules*, *Done when* y checklist del router repiten las references — **mismo patrón que D1, A3, U2, B1 y V1**

- **Evidencia:** las 10 *Rules* de `SKILL.md:78-104` tienen dueño en una reference:

  | Regla del router | Dueño |
  |---|---|
  | Medir antes de enseñar · Preguntar sólo lo que sólo ellos saben · Objetivo observable | `plan.md` (*Probe*, *Ask only*, *Objectives*) |
  | Confianza antes de corregir · Escalera de pistas · Si pide la solución, dársela | `tutor.md` |
  | Recuperar, no releer | `teach.md` (*Close with retrieval*) y `retain.md` |
  | La evaluación usa un caso nuevo · No declarar el tema aprendido | `assess.md` |
  | No editar el registro para ser amable | `tutor.md:85-87` y `:108` |

  El *Done when* del router es el *What closes the objective* de `teach.md`; el checklist
  repite `plan.md`, `tutor.md` y el *closing report* de `assess.md`.
- **Reglas del registro escritas en varias references:** *log append-only* en `plan.md:138`,
  `tutor.md:104`, `retain.md:76`; *el estado nombra su evidencia* en `plan.md:139` y
  `tutor.md:106`; *un caso distinto cada vez* en `teach.md:111`, `train.md:41`, `exercises.md:36`,
  `retain.md:39`, `assess.md:15`; *la solución en otro archivo* en `SKILL.md:72-74` y
  `exercises.md:83-95`; *el tema no va en `Plan/state.json`* en `SKILL.md:68`, `plan.md:108` y
  `nzt` §3 y §6.
- **Afecta:** C2, C5. Una diferencia con las otras fases: acá el router lleva la **inversión**
  de la rama (no resolver por la persona), que sí vale en toda unidad. Eso justifica que se
  quede con la inversión y dos o tres reglas transversales, no con las diez.
- **Opción:** el router queda con la inversión, los dos bucles, la tabla de ruteo, *Where it
  lands* y 3 reglas (no resolver, no acreditar lo que no hizo, caso nuevo); las reglas del
  registro tienen un dueño, `plan.md`, que define la forma de `progress.md`, y las demás lo
  citan *(recomendada)*. Ahorra ≈30 líneas del router, que se carga en cada unidad.

### L5 · Párrafo *"`nzt-learn-<name>` es esta ruta"* — **amplía M8 y S4**

- **Evidencia:** `SKILL.md:55-56` repite lo que el kernel ya resuelve (*"its router is the
  longest prefix that is a skill"*).
- **Opción:** la misma que M8/S4, en la 386.

### L6 · Cuatro references tienen índice *Contents* y tres no — **para la 386, junto con G6**

- **Evidencia:** `plan`, `teach`, `tutor` y `exercises` abren con *## Contents* (8-11 líneas);
  `train`, `assess` y `retain` no. Ninguna pasa de 177 líneas.
- **Opción:** una sola convención para todo el set. Con el tope de 200 líneas, el índice cuesta
  más de lo que ahorra; sacarlos ahorra ≈40 líneas.

### Lo que se revisó y está bien

- **Es la rama mejor cortada del set:** cada reference es una unidad con lo que produce (un
  archivo o las filas que deja en `progress.md`), y la forma de `progress.md` tiene un único
  dueño, `plan.md`, que las demás citan para escribir. La tabla de ruteo y sus *Read with*
  coinciden con lo que las references dicen leer.
- El vocabulario cerrado de estados (`plan.md:141-145`) y los cinco veredictos
  (`assess.md:43-49`) son el mismo conjunto, con las mismas palabras.
- `OA-NN` y `EX-NN` siguen la regla de identificadores del resto de NZT: no se renumeran, no se
  reusan.
- **Los ejemplos son todos de EF Core** (`plan.md`, `teach.md`, `exercises.md`, `assess.md`).
  Es un único caso que atraviesa los archivos y los hace coherentes entre sí; está presentado
  como ejemplo, no es una dependencia de stack (C1 se cumple). Si en la 386 se quiere la rama
  sin rastro .NET, es cambiar un caso, no una regla.
- La rama no toca `Plan/state.json` y lo dice; `nzt` §1 y §6 la rutean bien.

---

## 386 · Síntesis

52 hallazgos en 9 unidades: M1-M9, D1-D6, A1-A6, U1-U6, B1-B6, G1-G6, S1-S4, V1-V3 y
L1-L6. **13 son errores** y se arreglan igual: M1, M4, M9, D4, A1, A4, B6, U1, U3, S1, V2,
L1, L2 y L3 (A4 y U3 son el mismo caso). El resto es repetición: el set funciona, pero cada
regla tiene en promedio dos o tres copias, y eso es lo que encarece cambiarla (C2, C3) y
cargarla (C5).

### Lo que se repite entre fases

| # | Patrón | Hallazgos | Qué cuesta |
|---|---|---|---|
| T1 | El router repite sus references en *Rules*, *Done when* y checklist | D1, A3, U2, B1, V1, L4 | ≈30-60 líneas por router que se cargan en cada unidad; dos textos de la misma regla que ya divergen (D1) |
| T2 | Dos convenciones de cierre (*Done when* y *Closing checklist*) y un índice *Contents* sin regla | G6, A3, U2, L6, el transversal de la 377 | Quien escribe no sabe cuál usar; el agente aprende a saltear la checklist que no aplica |
| T3 | Las reglas de preguntar, en cuatro versiones y con series de ids sin dueño | M6, A2, U6, V2 | Ids duplicados (U6); dos fases que preguntan lo mismo (V2) |
| T4 | Kernel, `nzt` y `nzt-plan` dicen las mismas reglas de parar, reanudar, tamaño y documentos | M1, M2, M3, M5, D2, D3, U5, V3 | Una regla nueva toca 4-5 archivos (D84 lo mostró); ya hay una contradicción (M1) |
| T5 | Copias que existen para que el worker y los routers de área no dependan del kernel | M8, S2, S4, L5, las aperturas *"load it first"* de A2 | ≈25 líneas por router de stack, que se leen junto al router de build que ya las dice |
| T6 | Etiquetas y reglas de redacción fijadas en un idioma | D6, A4, U3 | Un proyecto en otro idioma recibe `usuario`, `juntos` o reglas de tono rioplatense |
| T7 | Dos maneras de rutear la capa genérica, y los valores de los ejes copiados | G1, G2, A5, G5, B5 | El mismo contenido a distinta profundidad según el stack; un valor de eje nuevo que no se ofrece |

**Lo que pesa en contexto**, medido en líneas: una historia carga ≈520 líneas de método (B2) y
una historia .NET con paginación, 1.327 (S3). Resolver T1, T3 y T5 baja el método a ≈400. El
resto es el precio, ya aceptado, de separar lo genérico de lo específico. Los tokens son
**estimados** (≈4 caracteres por token), no medidos.

### Lo que no se pudo medir

- Si recortar las filas del kernel (M7) empeora el ruteo: sin evals no hay cómo medirlo, y los
  evals se descartaron.
- 382, 383 y 384 se leyeron por estructura, no completas: los hallazgos son de repetición y de
  ruteo, no de contenido.

### Preguntas

Once son tradeoffs y se te preguntan (QT-01 a QT-11). Veinte son detalles dentro de lo que ya
pediste: cómo se arregla cada error, y cada repetición chica que tiene una sola salida razonable.
Ésos los gobierna el modo que elijas. No hay hechos para investigar: todo sale del propio repo.

**Detalles dentro del alcance**, con lo que se propone para cada uno: M1 a), M4 a), M9 a), D3 a),
D4, D5 b), A1 a), A6 (sin cambio), B3 a), B4 a), B6/G4 (salen del router y de `implement.md`), G3,
S1, S3 (revisar los cinco *Read with* de paginación), U4 a), U5 a), V2 a), V3 a), L2 a) y L3 a).

### Log de decisiones (append-only)

- **QT-01 · Forma del router** (T1). a) El router queda con lo que vale para toda unidad de la
  fase: límites, tabla de references, dónde aterriza y las reglas transversales. Cada regla
  vive en la reference que la usa. Pasa a ser una regla de autoría en `specs/nzt-core.md` §10.
  b) El router conserva un índice de reglas, una línea con su dueño cada una. c) Dejarlo.
  · `propuesta`: a).
- **QT-02 · Convención de cierre** (T2). a) *Done when* en routers y en las references de
  documento o procedimiento; checklist sólo en las references de práctica de código, que se
  verifican línea por línea; ningún router con checklist; sin índice *Contents* en archivos de
  menos de 200 líneas. b) *Done when* en todo, sin checklists. c) Dejarlo. · `propuesta`: a).
- **QT-03 · Dueño de las preguntas** (T3). a) `nzt-plan` es dueño de qué se pregunta, cómo y las
  dos salidas, en una reference propia; `nzt-architecture` conserva las tres clases, los modos y
  el log `QT`. Cada serie de ids la numera el log de la fase que responde: una pregunta de UX
  sobre el negocio se escribe en `analysis.md` como `Q-NN`. b) Un único `questions.md` para todas
  las fases, con las clases y los modos. c) Dejarlo y arreglar sólo U6. · `propuesta`: a).
- **QT-04 · Copias que protegen al worker** (T5). a) Las fórmulas de dos líneas (cómo se
  resuelve un nombre `nzt-…`) se quedan en los routers. Los bloques grandes (*"Read the stack
  first"*, *"Two escapes"*, *"load it first"*) quedan sólo en el router de build y en el archivo
  del worker. b) Todo sale de los routers, y el worker lo recibe en su archivo. c) Dejarlo.
  · `propuesta`: a).
- **QT-05 · Ruteo de la capa genérica** (T7). a) Las tablas de `practices-*` pasan al router de
  build y `practices-*` desaparecen; la columna de costo de `stack-axes.md` pasa a esas tablas y
  `stack-axes.md` las lee; la tabla de stacks del router se deja (B5 b). b) `practices-*` quedan
  como excepción registrada a la decisión 2, y A5 se cubre con un chequeo de coincidencia.
  · `propuesta`: a).
- **QT-06 · Idioma de etiquetas** (T6). a) La regla fija qué significa cada etiqueta y se
  escribe en el idioma del proyecto; un solo vocabulario de procedencia (el de `nzt-research`,
  que el explorer adopta); las reglas de tono, por lo que hace la palabra. b) Identificadores
  fijos en inglés, como `[TO-DEFINE]`. · `propuesta`: a).
- **QT-07 · Kernel y `nzt-plan`** (M2, M5). a) Un dueño por regla: el kernel conserva el
  invariante en una línea y remite; `nzt-plan` queda como router chico, con
  `references/state.md` (esquema y reglas del estado). b) Se parte `nzt-plan`, pero el kernel
  conserva sus copias. c) Dejarlo. · `propuesta`: a).
- **QT-08 · Clasificar** (M3, D2). a) Una sola tabla en `nzt`: tipo de pedido × terreno →
  tamaño, fase de inicio. Los documentos obligatorios los declara cada router, y `slices.md` y
  `proposal.md` citan. b) Los bullets de §3 apuntan a la fila de §4. · `propuesta`: a).
- **QT-09 · Ids de criterios** (U1). a) Los criterios llevan `CA-NN` estable, que no se reusa.
  b) Se citan por el título. · `propuesta`: a).
- **QT-10 · Quién da `achieved`** (L1). a) Sólo `assess`. b) `tutor` también, con caso nuevo.
  · `propuesta`: a).
- **QT-11 · Filas de ruteo del kernel** (M7). a) Dejarlas: sin medición, recortar es apostar.
  b) Recortarlas a una línea. · `propuesta`: a).

**Respuestas (2026-10-28):**

- Modo para los detalles: **propuestas** · `usuario`. Los 20 detalles de arriba se resuelven
  como se propone, y cada uno queda como `agente, dentro del alcance`: podés objetarlo.
- QT-01 → a) · QT-02 → a) · QT-04 → a) · QT-05 → a) · QT-07 → a) · QT-08 → a) · `usuario`.
- QT-03 → a) · `usuario`. Antes de elegir, el usuario preguntó quién es el dueño hoy. La
  respuesta: no hay uno solo. El formato está en el kernel; el cómo, en `nzt-plan`
  *Questions*, que discovery ya cita; architecture tiene su propia versión completa; UX y
  verify no tienen ninguna (U6, V2).
- QT-06 → a) · QT-09 → a) · QT-10 → a) · `usuario`.
- QT-11 → a), dejarlas · `usuario`. El usuario pidió que se le explicara antes. Se explicó que
  son tres textos de la misma fase (fila del kernel, `description`, *Owns*) y que la
  recomendación de no tocarlas es porque el detalle sostiene el ruteo y no se puede medir.
  M7 se cierra sin cambio.

**Corrección (2026-10-28, unidad 387):**

- **QT-12 · QT-02 contradice la regla 14 de §10.** La parte *"sin índice *Contents* en
  archivos de menos de 200 líneas"* choca con la regla 14 (índice en toda reference de más de
  100 líneas, contra la lectura parcial que documenta la guía de Anthropic). Además, **L6
  estaba mal**: las cuatro references de `nzt-learn` con índice tienen más de 100 líneas
  (117-177) y las tres sin índice tienen menos (82-98). Cumplen la regla. Lo encontró el
  agente al escribir la spec. a) Mantener la regla 14: esa parte de QT-02 sale y L6 queda
  descartado. b) Derogarla. → **a) · `usuario`**. QT-02 queda con *Done when* y checklist
  sólo en código, sin tocar los índices.

**Corrección (2026-10-28, unidad 394):**

- **QT-13 · QT-05 a) carga en cada unidad tablas que no usa** (supera la parte de QT-05 sobre
  `practices-*`). El usuario notó que el router de build se lee en toda unidad: con las
  tablas adentro (70 líneas medidas, 50 de backend y 20 de frontend), una unidad .NET pasa de
  268 a 334 líneas (router + `code-code.md`) y una de frontend genérico de 313 a 334, y la de
  backend genérico queda igual (337 → 334). G1 midió cuánto crecía el router, no la carga por
  unidad. a) Volver a `practices-*`, registradas como excepción a la decisión 2: cada área
  carga sólo lo suyo, son cortas (menos de 100 líneas, sin riesgo de lectura parcial) y la
  cabecera repetida de G2 se escribe una vez. b) Convertirlas en skills de área genéricas
  (`nzt-build-backend`, `nzt-build-frontend`): una sola manera de rutear, dos skills más en el
  listado y un nombre que es prefijo del de .NET. c) Dejarlo. · `propuesta`: a).
  → **a) · `usuario`**. La convención de comentarios queda en `code-code.md`, y A5 lleva la
  columna de costo a las tablas de `practices-*`.
