# NZT — Estado de la construcción

> Esta spec está en tres archivos (D99): [README.md](README.md) (§1–11 y Fuentes, el
> diseño vigente) · [decisions.md](decisions.md) (§12, riesgos y decisiones D-NN) ·
> [build-status.md](build-status.md) (§14). Los números de sección son los de siempre; la §13,
> la revisión contra Temper v3, se retiró y queda en la historia de git (commit `f04b062`).

## 14. Estado de la construcción

> Punto de retomada. Si empezás una sesión nueva, leé esto.

> **Estado actual (2026-11-01), rama `refactor-marco-generico`.** D88: global queda solo el
> marco —12 skills, 60 referencias—, y lo de una tecnología o una arquitectura son 8 packs
> por proyecto (75 referencias) que instala `nzt-ai project`, con sus MCP. El documento
> técnico es `Docs/Architecture/tech.md`. D89: antes de trabajar el agente prepara el
> trabajo con el usuario (`references/tech.md`, paso 4), el diseño vive en `Docs/Design/` y la
> versión es **4.0.0, sin tag ni release** hasta que el usuario la pruebe en local. D90:
> skills, referencias y packs reescritos sin redundancia, con `skill-creator`. El bloque
> de abajo, del 2026-10-11, es historia: sus cuentas y su capa de stack ya no valen.

> **Estado al 2026-10-11, rama `capa-generica`.** Lo que sigue a este bloque es la
> historia de la construcción hasta v1.0.0 y antes de D50: sus cuentas (111 skills, hojas
> como skills) ya no valen. El plan en curso y dónde quedó viven en `Plan/state.json`.
>
> - **El set son 15 skills y 131 referencias** (D50, D71): las hojas pasaron a `references/` de su
>   router; el listado ocupa ~2.700 caracteres, bajo el piso de 8.000 de Codex.
>   `install/check-references.sh` probó cada movimiento; el build mide referencias (200
>   líneas, `## Contents` pasadas las 100, fila en la tabla o en un índice).
> - **El kernel dice cómo se lee una referencia** (D52, D54): *Read with* antes de la primera
>   respuesta, nombres viejos por prefijo más largo, y releer tras una compactación.
> - **Docs/ por carpeta de tema y stack dentro de su componente** (D56, D57); glosario y
>   `product.md` obligatorios.
> - **v1.0.0 publicada el 2026-10-08** con todo lo anterior. Lo que sigue (D58, D59) está solo
>   en esta rama.
> - **Capa genérica terminada (D58, unidades 42-59):** 30 referencias en
>   `nzt-build/references/` (`backend-*`, `data-*`, `code-*`, `frontend-*`) con el principio
>   de cada práctica sin nombrar tecnologías, y los índices `practices-backend.md` y
>   `practices-frontend.md` para un stack sin router de área. Las referencias .NET y Blazor
>   quedaron con el cómo en su tecnología y leen la genérica primero (*Read with*, obligatoria).
>   `install/check-extraction.sh` probó cada recorte contra `main`: 0 reglas perdidas, las
>   reescritas revisadas a mano en `Plan/mejoras/extraccion/*.reviewed`.
> - **Ejes del stack (D59):** `nzt-architecture/references/stack-axes.md`, con las opciones
>   copiadas de las tablas de build, los ejes del router de área sumados, y la pregunta con la
>   herramienta del host o en viñetas.
> - **Carpeta del componente (D60):** es su raíz (solution o manifiesto, `src/`, `tests/`),
>   nunca la de un proyecto de build; con un solo componente, la raíz del repo.
> - **Fases en el estado (D61, 2026-10-13):** `Plan/state.json` lleva `phases`, ordenado y
>   con estado por fase; `phase` desaparece. **D62:** cada fase lleva sus `units` y una
>   corrida nueva reescribe el estado con lo suyo, con los ids siguiendo.
>   `architecture.md` es obligatorio desde el primer stack, con la columna de carpeta.
> - **Mods (D63, 2026-10-13):** capa aparte, opcional y solo de Claude Code, en `mods/`,
>   especificada en `specs/nzt-mods.md`; cada mod con su spec en `specs/mods/`. El primero
>   es el panel `nzt-state`. **El instalador los ofrece en Claude Code** (2026-10-17):
>   Todo NZT, solo el método o solo los mods, y la línea `install-claude-full`
>   (`specs/nzt-installer.md` sección 11, M3 de `specs/nzt-mods.md`).
> - **Evals:** la última suite completa es la 24a (2026-10-07, juez sonnet: routing 0.97,
>   stack 0.89, restraint 0.90; `Plan/mejoras/05-linea-base.md`). Lo posterior (D56-D59) se
>   probó sobre el texto, sin evals, por decisión del usuario; los fixtures siguen con las
>   rutas viejas de `Docs/`.
> - **Pendiente:** que el usuario pruebe la rama instalada, el PR a `main` (lo arma el
>   usuario) y la versión nueva después de esa prueba.

**Dónde estamos, en una línea:** **el roadmap está construido entero — 111 skills, la suite
de evals y el instalador —, el repo está en GitHub, y el primer eval corrió y pasó.** La
revisión contra Temper terminó (ocho fases, 22 tensiones), su fase de aplicación también, la
capa de stack se cerró con sus tres áreas, y **la segunda pasada (13.12) cerró los seis
huecos que la primera no había mirado** con D25–D31: el cierre de feature, el modelo de
dominio, los diagramas, el cambio a una feature viva, las cuatro lecturas de la rama
`analyze-*` y los documentos sin destino. **D32 cerró además la única que esa pasada había
dejado abierta** —el criterio genérico de tests, hoy `nzt-build-tests`— y **D33–D35 son lo
que el usuario sumó después**: elegir el componente a probar con el chequeo de qué se puede
probar, `nzt-verify-performance` y el RFC a pedido. **D36 a D40 son las últimas, y las
cinco salieron de usar el set**: los datos de prueba, con `nzt-verify-test-data` —mecanismo
acordado una vez con el usuario y guardado en el opt-in `Test data` del stack, y un setup y
un teardown por escenario, escritos antes de correr—, y el **manual del usuario final**, con
`nzt-ux-manual`: hoja de UX, a pedido, **armado al final de lo que se entrega** y solo sobre
comportamiento verificado. **D38 y D39 son las primeras que no agregan una skill sino que
corrigen contenido** —igual que **D40**, que es la primera que toca el kernel desde el
recorte de 13.10—, y las tres reglas de código salieron de leer lo que NZT generó en un
proyecto real: el constructor privado vacío, el orden de los miembros, y el `Result` armado
en cada return en vez de escondido en un método privado. **D40 sale de la misma corrida, pero
es de método y no de código**: el estado escrito para contexto cero, y el cierre de cada
corrida diciendo cómo viene el contexto y si conviene limpiar, recomendándolo **desde el 20%
consumido y fuerte pasado el 40%**. **D41 es la última, y sale de la misma clase de
hallazgo**: usar el set mostró que arquitectura decidía sola lo que tenía que preguntar, así
que vuelve de Temper v3 lo que NZT había perdido —derivar los `QT-NN` antes de proponer,
resolverlos por tipo, el modo elegido por feature y el log de decisiones aparte—. Es la
primera que **revierte una decisión anterior**: supera la parte de D27 que había ahorrado ese
archivo. **D42 es la última, y es del mismo linaje**: usar el set mostró que build armaba
integración, motor real y contenedores sin que nadie los hubiera pedido, así que **qué
niveles de test se escriben pasa a ser un opt-in del stack —unit incluido— y un campo
ausente no habilita ninguno**, con el eje `Tests` reducido al framework. **D43 es la última,
y sale de la misma corrida**: con los niveles apagados, implement buscaba su evidencia
escribiendo guiones manuales en medio de la construcción, así que **verify pasa a ser QA,
una fase que corre después de implementar el incremento**, y el criterio gana una marca
`qa` que solo pone verify: `backend ✓ · frontend ✓ · qa —`. **D44 surge**, de leer
el stack que ese proyecto generó: **ningún paquete entra sin confirmación del usuario**, el
stack vuelve a ser una ficha liviana de cinco bloques, y **hasta dónde llega DDD** —value
objects, domain events, ids tipados— pasa a ser un opt-in donde lo no escrito no se usa.
**D45** son los DTOs hijos exclusivos del padre, con nombres simples, las propiedades antes
de los tipos anidados y una excepción explícita al orden general de C#. **D46 no es de
contenido sino de distribución**: NZT se instala con una línea por proveedor
—`irm | iex` o `curl | sh`— que baja de GitHub Releases un binario self-contained, verifica
su hash, instala NZT en Claude Code o en Codex y borra el binario. Queda pendiente del usuario hacer público el repositorio. **D47**:
los diseños de una feature dejan de compartir `design/` y pasan a `tech-design/` —diseño
técnico y su log— y `ux-ui/` —pantallas y mockups—. **D48 y D49 son las últimas, y salen de
leer el código que NZT generó en FarmaPedia**: D48 saca de los casos de uso los
`catch … when` y los clasificadores de errores del proveedor, y agrega la skill 111,
`nzt-build-backend-dotnet-exceptions` —un único `GlobalExceptionHandler` en
`Exceptions/Handlers/` que reconoce solo por tipo—; D49 deja un solo
`<Entity>MappingExtensions` por entidad a nivel feature y saca de `vertical-slice` la
contradicción que hacía copiarlo en cada operación.

**No queda ninguna decisión abierta**: I1 (D18), I2 e I3 (D24) e I4 (D25 de la numeración de
riesgos) están cerradas, y la última decisión de contenido la cerró D49 (el `SaveChangesAsync`
que devuelve `Result` se evaluó y quedó descartado dentro de D48). Lo que puede reabrir una es la medición de la fase 9, y con el catálogo
en 111 skills **esa medición pasó a ser lo más urgente del roadmap**.

**Lo que falta, en orden, al 2026-09-17:**

1. ✅ **Instalado de verdad.** El usuario lo corrió el 2026-09-17: **Claude Code, 111
   archivos** —las skills más el bloque de instrucciones—, manifiesto en
   `%LOCALAPPDATA%\nzt\manifests\claude-code.json`. **Codex sigue sin instalar**, y eso es
   exactamente lo que bloquea el punto 2. Reinstalar después de cada tanda es la misma
   operación: lo nuevo se crea y lo que no cambió queda igual.
2. **Medir R1 en Codex** (fase 9). Era el tercer punto y subió: el listado está en 20.765
   caracteres, 2,6× el piso de 8.000, y **lo que no está verificado es si una skill omitida
   del listado se puede seleccionar igual por nombre** (C2). De eso depende si el catálogo
   puede seguir creciendo o si hay que empezar a fusionar hojas.
3. **Correr el resto de los evals.** Corrió `kernel-loaded` y pasó; faltan 19 casos.
   **Conviene empezar por el grupo `stack`** (`--tag stack`), que son los cuatro de ejes
   excluyentes y donde vive el riesgo real del set — `routing` ya demostró que el andamio
   anda. Los tres casos nuevos de 13.12 (`close-feature`, `diagram-offered`, `no-diagram`)
   y los de D36 y D37 (`test-data`, `manual`) **nunca se corrieron**: su primera corrida es
   de calibración.
   Presupuesto abajo.
4. **Nada pendiente de escritura.** La deuda de la convención de comentarios de `nzt-build`
   —la única que quedaba— **se saldó en la segunda pasada** (13.12, último párrafo).

**El repositorio ya es un repositorio.** `git` inicializado, remoto
`https://github.com/Ezefeola/nzt-ai.git`, rama `main`, primer commit con 146 archivos.
`dist/`, `evals/results/` y los `bin/obj` quedan afuera por `.gitignore`; un `.gitattributes`
fuerza LF en todo menos los `.ps1`, que es lo que evita que el checkout ensucie diffs y
hashes. **El `README.md` de la raíz existe** y explica para qué sirve NZT y qué aporta, no
qué contiene.

**El instalador (fase 10) está construido**: `installer/src/Nzt.Cli`, consola .NET 10, sin
dependencias, con el contenido embebido. **Instala global y sin plugins** (D24): bloque
delimitado en `~/.claude/CLAUDE.md` y `$CODEX_HOME/AGENTS.md`, y las skills aplanadas —hoy
110— en `~/.claude/skills` y `~/.agents/skills`. El contenido entra por glob del `.csproj`,
así que una skill nueva no le toca una línea de código al instalador. `dotnet run --project installer/tests/Nzt.Cli.Checks`
da **PASS: 47 installer checks** contra destinos temporales — incluida la que compara byte a
byte el bloque del CLI contra el `dist/CLAUDE.md` del build, que es lo que mantiene a raya a
I2. **Y ya se instaló de verdad**: Claude Code, 111 archivos, el 2026-09-17.

**El menú es de cuatro acciones** (pedido del usuario, tomado del instalador de Temper v3):
instalar, desinstalar, **verificar el contenido** y ver estado, en un bucle hasta salir.
Primero la acción y después el destino; las dos que escriben imprimen la simulación completa
y recién ahí preguntan, con `No` por defecto; desinstalar aclara su alcance —solo lo del
manifiesto— **antes** de simular. Se hizo **sin agregar dependencias**: Temper usa
Spectre.Console y acá el ejecutable sigue siendo un artefacto sin paquetes, así que el menú
es `Console` y opciones numeradas. Dos detalles que valen su línea: sin entrada —una tubería
cerrada— el menú **sale en vez de girar sobre un `ReadLine` que ya devolvió `null`**, y
*verificar* lista skill por skill con sus líneas y sus chars de description, que es lo que
hace verificable la palabra; el `lint` no interactivo se queda con el resumen, que es lo que
sirve en CI. La opción del menú traducida a proveedor tiene sus propias comprobaciones: son
las cuatro que llevaron los checks de 43 a 47.

**La fase 6, en concreto.** `evals/` tiene **20 casos en tres grupos** contra
`dist/plugin/`, el set aplanado como plugin que ahora arma el build (D23, hechos de
plataforma en C6):

- **`routing/` (10)** — sub-disparo: un pedido dicho como lo dice un usuario llega al router
  de fase correcto, y los frenos del kernel aguantan. Incluye `kernel-loaded`, el caso de
  humo que prueba que el `CLAUDE.md` sembrado llegó a la corrida —**si ese falla, ningún
  otro resultado significa nada**— y `learn`, que es la decisión de ruteo más difícil del
  set: tema técnico adentro de un proyecto .NET, y la única señal que lo cambia todo es
  *aprender*. Los dos de 13.12: **`close-feature`**, que siembra una feature aceptada con
  sus marcadores puestos (fixture `feature-done.sh`) y mide que el cierre los reconozca sin
  ofrecer borrar el test de la ausencia, y **`diagram-offered`**, que mide la regla que hace
  usables a los diagramas: se ofrecen diciendo qué muestran, no se dibujan de prepo. **El de
  D36 es `test-data`**, y es el único caso del set que mide un modo de falla observado dos
  veces: se pide probar contra una base vacía, y lo que se mide es que los datos se creen en
  vez de frenarse, que el mecanismo se pregunte y que cada escenario tenga su limpieza
  acotada a lo que creó — con `blocked` y el borrado ancho como las dos formas de fallar. **El
  de D37 es `manual`**: se pide *algo lindo e interactivo* para los operadores sobre la
  feature ya verificada, y mide lo que separa un manual de una documentación —capítulos que
  son tareas dichas como las diría la persona, un HTML que abre solo— con el recorrido
  módulo por módulo y el capítulo sobre algo no verificado como las dos formas de fallar.
- **`stack/` (6)** — los ejes excluyentes: el documento de stack elige uno y solo esa hoja
  carga. `endpoint-axis` dice *controller* en el pedido con `minimal-apis` en el stack;
  `not-dotnet` es *una carpeta instalada no es una autorización* vuelto medición. **Los dos
  nuevos miden convenciones sobre el código emitido**, que es lo que ningún otro grupo hace:
  `entity-shape` (D38) el constructor privado vacío —con un regex sobre la firma— y el orden
  de los miembros, con la propiedad escrita abajo del método que la usa como la forma
  concreta de fallar; y `result-inline` (D39) pide **tres fallas distintas a propósito**,
  porque es ahí donde el modelo colapsa los returns en un `Rejected()` privado.
- **`restraint/` (4)** — sobre-disparo: una pregunta, un cambio de una palabra, un repo que
  no es nuestro y **un pedido que no gana ningún diagrama** no tienen que cargar nada. Van
  con `arm: both` para que también puntúen en el arm sin el set; `no-diagram` suma un grader
  de regex contra `flowchart`/`sequenceDiagram` en la respuesta, porque el modo de falla del
  catálogo nuevo es dibujar sin que nadie lo haya pedido.

**La primera corrida se hizo el 2026-09-17** — `kernel-loaded`, 3 corridas, sin arm de
ablación, 247s, **US$ 0,94** — y contestó las dos preguntas que bloqueaban todo lo demás:

- ✅ **El `CLAUDE.md` sembrado llega a la sesión hija.** El agente disparó el punto de
  entrada, leyó el proyecto y **propuso en vez de ejecutar**, que es conducta del kernel y no
  del modelo suelto. El andamio del scaffold funciona en Windows.
- ✅ **El nombre de skill se resuelve adentro del plugin.** El grader acepta las dos formas,
  así que **cuál de las dos usó sigue sin saberse** y no hace falta saberlo: resuelve.
- **Score 0,83.** Dos corridas 1,00 y una 0,50, y la que falló no falló por NZT: **se quedó
  sin turnos** (`max_turns: 14`), y sin mensaje final los dos graders que miran la respuesta
  caen solos. **Era un defecto de calibración de los casos, no del set**: los 13 subieron sus
  topes de turnos (a 25-35, salvo los de restraint, que se quedan bajos a propósito) y de
  tiempo. **Reconfirmado después del arreglo: `kernel-loaded` da 1,00** (1 corrida, 119s,
  US$ 0,30), sin tocar el techo de turnos.

**Lo que eso deja medido para planificar:** una corrida de un caso son ~US$ 0,31. Los 20
casos a 3 corridas **con** arm de ablación son **~US$ 38**; con `--ablation none`, la mitad.
Conviene correr por grupo (`--tag`) y no la suite entera de una.

De las 44 unidades del catálogo original — 35 del modo construcción, 8 de la rama profesor,
más la hoja que sumó D9 — hay **37 escritas**, y **no queda ninguna pendiente en los pasos 1
a 4**.

**Los dos modos están completos.** El de construcción, con sus seis ramas (`nzt-discovery`,
`nzt-architecture`, `nzt-build`, `nzt-ux`, `nzt-verify`, `nzt-ship`). El profesor, con su
router y sus siete hojas: `plan` (D12), `teach` (D13), `tutor` (D14), `exercises`, `train`
(D15), `assess` y `retain`. **45 skills instalables.**

**Después de las hojas se hizo la pasada de compresión (D17)**: las 45 descriptions bajaron
de 231 a ~140 chars de promedio y el listado pasó de 10.435 a **7.219 chars**, debajo del
piso de 8.000 de Codex, sin tocar el cuerpo de ninguna skill. I3 quedó cerrada (D16).

**La capa de stack (fase 7) está completa: 46 skills, y el set quedó en 91.** Son las tres
compartidas de C#, el área de backend .NET (router + 27 hojas, D19), el área de Blazor
(router + 9 hojas, D21) y el área de ship .NET (router + 4 hojas, D22). **Ninguna skill del
set nombra hoy una skill que no exista** — se verifica cruzando las referencias `nzt-*` del
árbol contra los paths. El orden en que se escribieron, por dependencia:

1. ✅ **Las compartidas de C#**: `nzt-build-csharp`, `-linq`, `-dtos`.
2. ✅ **El núcleo de una operación**: `use-cases`, `validation`, `results-pattern`, `api`.
3. ✅ **Los ejes excluyentes**, cada uno con sus alternativas: `endpoints` (2),
   `architecture` (3), `domain-ddd` / `domain-anemic` + `domain-value-objects`,
   `persistence` (2), `results-extensions` / `results-filter`. **Las tres de arquitectura son
   las más grandes de la capa** (138-143 líneas) porque cada una lleva su árbol de roles
   entero, que es el contenido que no se puede resumir sin volverlo inútil.
4. ✅ **EF Core**: la hoja común y sus ocho — `queries`, `pagination`, `writes`, `bulk`,
   `mappings`, `domain`, `migrations`, `indexes`. La común quedó chica a propósito (76
   líneas): lo que vale para toda operación —tracking, vida del contexto, nada adentro de un
   loop— y nada más; cada hoja la nombra en su línea de carga (D20).
5. ✅ **`testing`** y **`security`**.
6. ✅ El área de **Blazor** (D21) y **`nzt-ship-backend-dotnet`** con sus cuatro hojas (D22).

**La segunda pasada sumó 17 skills y el set quedó en 108** (13.12, decisiones D25–D35). En
el orden en que se escribieron, que es por dependencia: las cuatro de diagramas primero
—catálogo y después las tres que dibujan—, porque los dos documentos nuevos las citan;
después `domain` y `contexts`, que son los destinos que faltaban; `tech-debt` y `review`;
`plan-close`, que necesita nombrar todo lo anterior en su tabla de barrido;
`discovery-change`, que cierra el ciclo de los marcadores con el cierre; `build-recon`,
`verify-review`, `verify-audit`, `research` y, al final, `build-tests` (D32). **Los enganches
se hicieron en la misma tanda** y son lo que evita que quede otra referencia colgada: el
kernel nombra `nzt-research` en su guardrail de evidencia externa, `nzt-plan` nombra el
cierre en sus reglas y en sus unidades típicas, los routers de arquitectura, discovery, build
y verify listan sus hojas nuevas, `implement` y `remove` dicen quién pone y quién barre cada
marcador, el glosario apunta a `domain-model.md` con nombre, `design-product` y
`design-feature` ganaron `INT-NN`, su sección `Decided` y el puntero a los diagramas, y
**`nzt-build-tests` quedó nombrada en los cuatro lugares que la necesitan**: el router de
build (fila y línea de límite), `implement` en el paso donde un cambio gana su test, `tdd`
con el corte orden/valor, y la hoja de área de .NET en su línea de carga doble (D20). **Ninguna skill del set nombra
hoy una skill que no exista**, verificado igual que antes: cruzando las referencias `nzt-*`
contra los paths del árbol.

**Lo que sigue**, en el orden en que conviene hacerlo:

1. **Instalar** — `dotnet run --project installer/src/Nzt.Cli`, elegir la acción y después el
   destino. El menú tiene cuatro: instalar, desinstalar, verificar el contenido y ver estado,
   y las dos que escriben muestran la simulación antes de preguntar.
2. **Correr los evals** (fase 6) — `bash install/build.sh` y después
   `claude plugin eval dist/plugin --scaffold --case kernel-loaded --ablation none`: tres
   corridas y alcanza para saber si el andamio funciona.
3. **Medir R1 en Codex** (fase 9) — necesita Codex CLI con el set instalado, que después del
   paso 1 ya está.

**Los tres los corre el usuario**: el primero le escribe en el HOME —y el de Claude Code ya
lo corrió—, el segundo le consume cuota de modelo y el tercero necesita el otro CLI. El set
ya se puede usar tal como está.

**Cómo se porta una hoja de la capa de stack.**

**La fuente está instalada en esta máquina**: `~/.claude/skills/<nombre-temper>/SKILL.md`
(el repo, además, en `../temper-ai-v3`). Se lee la de Temper y se porta; no se inventa
contenido técnico nuevo.

**Lo que cambia al portar, y se aplicó igual en las 43 hojas de stack:**

1. **Se corta `## When to use`** (regla 11) y el párrafo de *Required guidance*, que queda
   como una línea: *Load `nzt-build-backend-dotnet` before applying this* — nombrando todo lo
   que hace falta, no solo el router (D20).
2. **Los ejes se nombran como los nombra el router de área, en inglés**: `Arquitectura:` →
   *architecture axis*, `Persistencia:` → *persistence axis*, `Resultado HTTP` → *Result to
   HTTP axis*. Las skills citadas se renombran a sus nombres NZT (D19).
3. **Se conserva lo caro: los árboles de roles, los ejemplos de código y las razones con su
   modo de falla** (13.4 #9). Lo que se recorta es prosa de andamiaje, nunca una razón: la
   razón es lo único que impide que la próxima sesión "mejore" la convención.
4. Destinos NZT: `Docs/glossary.md`, `Docs/<área>-stack-<componente>.md`.
5. **El checklist de cierre es la lista de prohibiciones en imperativo** (13.4 #8).
6. Los ejemplos de mensajes al usuario **quedan en español**: son texto de la historia, y
   eso es exactamente lo que la convención de idioma dice.

**De dónde salieron las últimas 11 del backend** (`development-backend-dotnet-` omitido en la
columna de origen). Queda acá porque es el registro de las dos uniones de D19 y de lo que se
dejó afuera:

| NZT | Origen en Temper |
|---|---|
| `…-ef-core` | `orm-ef-core` — **sin su tabla de selección**, que ya vive en el router de área |
| `…-ef-core-queries` | `orm-ef-core-queries` |
| `…-ef-core-pagination` | `orm-ef-core-pagination` |
| `…-ef-core-writes` | `orm-ef-core-writes` — sin su tabla de *Related work* |
| `…-ef-core-bulk` | `orm-ef-core-bulk-update` **+** `orm-ef-core-bulk-delete` (D19) |
| `…-ef-core-mappings` | `orm-ef-core-mappings` |
| `…-ef-core-domain` | `orm-ef-core-ddd` **+** `orm-ef-core-value-objects` (D19) |
| `…-ef-core-migrations` | `orm-ef-core-migrations` |
| `…-ef-core-indexes` | `orm-ef-core-indexes` |
| `…-testing` | `testing` |
| `…-security` | `security-resource-authorization` |

**Tres cosas que esta tanda tuvo que resolver y conviene no volver a discutir:**

- **La hoja común de EF Core se quedó con lo transversal y nada más**: tracking con su modo
  de falla, la vida del contexto, *nada adentro de un loop* y *el hecho del proveedor se
  verifica*. El N+1 que Temper tiene en `queries` subió acá, porque el mismo error aparece
  en un write y en un bulk; `queries` lo nombra y sigue.
- **Dónde termina una migración.** Generar no autoriza aplicar: base local o descartable
  entra en el plan, **un entorno compartido es `nzt-ship-release`** y nombra el entorno. Es
  la regla de autorización de `nzt-ship`, aplicada, no una nueva.
- **La hoja de `testing` es solo la práctica .NET.** Lo que hace valioso a un test no vive
  ahí: la disciplina test-first está en `nzt-build-tdd`, cómo un criterio se convierte en
  casos, en `nzt-verify-test-design`, y **el criterio genérico está en `nzt-build-tests`**,
  que la hoja de área nombra en su línea de carga. *(Cuando se escribió esto, esa hoja no
  existía y el hueco quedó registrado como decidido; lo cerró D32.)*

**El área de Blazor salió de `development-frontend-blazor*`** (9 skills en Temper → router +
9 hojas acá, D21) **y la de ship de `ship-dotnet-*`** (4 en Temper → router + 4 hojas, D22).
Lo que esas dos áreas dejaron escrito, además de sus decisiones:

- **El router de área no lleva contenido técnico.** El de Temper para Blazor traía nombres de
  archivo, usings y la regla de no bloquear; acá eso bajó a `components` —y lo de bloquear,
  también a `render-webassembly`, que es donde muerde— y el router quedó siendo lo que son
  todos: leer el stack, la tabla de ejes, la tabla por tarea y los dos escapes.
- **`AuthorizeView` esconde, no autoriza.** Quedó dicho en el router de Blazor y apuntando a
  `nzt-build-backend-dotnet-security`: es la confusión que cruza las dos áreas.
- **El eje de render se carga solo si el trabajo toca el render.** Un cambio de copy adentro
  de un componente establecido no carga ninguna de las cuatro.

**Antes de escribir una hoja, leé D3, D4 y la regla 11 de la sección 10.** Condicionan cómo
se escribe cada una: techo de 200 sin excepción y sin `references/`, y **ninguna hoja lleva
sección de *cuándo usarla***.

**Forma de la hoja, fijada por la primera (`nzt-discovery-analysis`) y sostenida en las 66
siguientes:** abre con qué produce y dónde aterriza, después la línea de R2 (*si no venís
del router, cargalo* — que **nombra todo lo que hay que cargar, no solo el router**: D20), y
recién ahí el procedimiento. No repite las reglas del router ni la
disciplina que ya vive en `nzt-plan`: la nombra y sigue. Lleva **un archivo de ejemplo
completo** cuando produce un documento, porque la forma se copia mejor de lo que se
describe. Las reglas se escriben con su modo de falla al lado (13.4 #9): la razón es lo que
impide que la próxima sesión "mejore" la convención con buenos argumentos. Cierra con
*Done when* en forma de ensayo verificable, no de checklist de tareas.

**Rutina de cada unidad, para repetir:** escribir la hoja → `bash install/build.sh` (valida
nombre↔path, ≤200 líneas, ≤250 chars de description y el presupuesto de R1) → actualizar
esta sección 14 → reportar. Si la hoja obliga a decidir algo que la spec no tenía, la
decisión se registra en *Decisiones cerradas* con su número y se aplica al router que
corresponda **en la misma unidad**. Así salieron D5 a D15.

**Construido y validado por el build:**

```
core/kernel.md + adapters      → dist/CLAUDE.md, dist/AGENTS.md (183 líneas)
core/kernel.md                 → 170 líneas: recorte de 13.10, guardrails de T20, y D40
install/build.ps1 / build.sh   → generan y validan (nombre↔path, ≤200 líneas, ≤250 chars
                                 de description, presupuesto R1)
skills/nzt/                    → nzt (81), nzt-plan (194, el más grande del set)
skills/nzt/{discovery,architecture,ux,build,verify,ship}/  → 6 routers de fase
                                 (91, 97, 96, 130, 111, 125 líneas) — crecieron un poco al
                                 escribir sus hojas: destinos con nombre y filas que faltaban
skills/nzt/discovery/*/          → las 6 hojas de discovery, rama completa:
                                 analysis (132), write-spec (139), write-stories (115),
                                 product (125), glossary (97), reverse (93)
skills/nzt/architecture/*/       → las 4 hojas de architecture, rama completa:
                                 design-product (128), stack (133, la de D9),
                                 design-feature (140), adr (103)
skills/nzt/build/*/              → las 6 hojas de build, rama completa:
                                 implement (130, incluye el arreglo de bug),
                                 refactor (78), remove (83), dependencies (85),
                                 secrets (76), tdd (78)
skills/nzt/ux/*/                 → las 4 hojas de ux, rama completa:
                                 screen (140), system (110, dos documentos: D11),
                                 mockup (91), review (102)
skills/nzt/verify/*/             → las 5 hojas de verify, rama completa:
                                 test-design (111), test-run (110), explore (82),
                                 automate (81), bug (96)
skills/nzt/ship/*/               → las 4 hojas de ship, rama completa:
                                 vcs (76), release (140), pipeline (76),
                                 observability (83)
skills/nzt/learn/                → nzt-learn (111) — router de la rama profesor
skills/nzt/learn/plan/           → plan (174, la más grande de las hojas: escribe dos
                                 archivos, currícula y progress.md — D12)
skills/nzt/learn/teach/          → teach (139, con el desvanecido de tres pasos y D13)
skills/nzt/learn/tutor/          → tutor (115, la matriz de calibración y la escalera)
skills/nzt/learn/exercises/      → exercises (124, consigna y solución separadas: 13.8 #35)
skills/nzt/learn/train/          → train (101, el segundo loop — D15)
skills/nzt/learn/assess/         → assess (105, los cinco veredictos y el reporte de cierre)
skills/nzt/learn/retain/         → retain (89, la escalera de intervalos)
45 skills · ~7.219 chars de listado  ← núcleo completo, bajo el piso de 8.000 (D17)

capa de stack (fase 7, en curso):
skills/nzt/build/backend/dotnet/ → nzt-build-backend-dotnet (111) — router de área, D19
skills/nzt/build/csharp/         → las 3 compartidas: csharp (174), linq (162), dtos (114)
skills/nzt/build/backend/dotnet/ → las 27 hojas, área completa:
                                   operación: use-cases (108), validation (90),
                                     results-pattern (127), api (92)
                                   endpoints: minimal (95), controllers (90)
                                   architecture: vertical-slice (139), clean (138),
                                     hexagonal (143)
                                   domain: ddd (154), anemic (114), value-objects (113)
                                   persistence: repositories (125), direct (74)
                                   results a HTTP: extensions (86), filter (66)
                                   EF Core: ef-core (76, la común), queries (126),
                                     pagination (106), writes (87), bulk (148),
                                     mappings (84), domain (136), migrations (104),
                                     indexes (111)
                                   testing (122) · security (92)
skills/nzt/build/frontend/blazor/ → nzt-build-frontend-blazor (95) — router de área, D21
                                   + sus 9 hojas: components (155), forms (85),
                                     architecture/vertical-slice (117),
                                     render/{server (65), webassembly (62), auto (80),
                                     static (71)}, prerendering (62), performance (108)
skills/nzt/ship/backend/dotnet/  → nzt-ship-backend-dotnet (51) — router de área, D22
                                   + sus 4 hojas: containers (92), migrations (89),
                                     pipeline (62), observability (52)
91 skills · ~17.634 chars de listado  ← arriba del piso; con C2 eso es degradación, no corte,
                                        y los 11 routers son lo que debe sobrevivir

segunda pasada (13.12, D25–D35): +17 skills, ninguna de stack
108 skills · 20.467 chars de listado  ← 2,6× el piso
D36: +1 (nzt-verify-test-data) · D37: +1 (nzt-ux-manual)
110 skills · 20.765 chars de listado  ← 2,6× el piso
D48: +1 (nzt-build-backend-dotnet-exceptions)
111 skills · ~21.035 chars de listado  ← el número de hoy, 2,6× el piso
```

**Modo de trabajo acordado (opción B):** primero se revisa **todo** contra Temper v3 fase
por fase, se acuerda, y **recién al final se aplica** a las skills ya escritas. No se
escriben hojas nuevas hasta terminar la revisión. **La revisión terminó**, así que a partir
de ahora sí se escribe.

**Revisión contra Temper — orden y estado:**

| # | Fase | Estado |
|---|---|---|
| 1 | Arquitectura | ✅ 13.1 |
| 2 | Discovery | ✅ 13.2 + tensiones en 13.3 |
| 3 | Build (.NET / Blazor, ~50 skills) | ✅ 13.4 + T4–T6 en 13.3 |
| 4 | Verify | ✅ 13.5 + T7–T10 en 13.3 |
| 5 | UX | ✅ 13.6 + T11–T13 en 13.3 |
| 6 | Ship | ✅ 13.7 + T14–T16 en 13.3 |
| 7 | Profesor | ✅ 13.8 + T17–T19 en 13.3 |
| 8 | Plan y estado | ✅ 13.9 + T20–T22 en 13.3 · recorte del kernel en 13.10 |

**La revisión está cerrada.** Las ocho fases revisadas, 22 tensiones acordadas. Lo que
sigue es la **fase de aplicación**, que es trabajo de escritura, no de decisión.

**Decisiones tomadas y su estado de aplicación:**

- **T1, T2, T3** — **aplicadas a los routers.** `nzt-discovery` lista `analysis` y
  `write-stories`, su unidad es una historia, y `nzt-architecture` toma como suyo el
  documento de stack que declara las áreas. Sus hojas están escritas.
- **T4, T5, T6** — **aplicadas a `nzt-build`.** Lista `remove`, `dependencies`, `secrets` y
  `tdd`, tiene la convención de comentarios escrita en el propio router, su fila por área
  (`nzt-build-backend-dotnet`, `nzt-build-frontend-blazor`) y la unidad = historia. Sus hojas
  están escritas.
- **T7, T8, T9, T10** — **aplicadas a `nzt-verify`.** Lista `explore` y `automate`, tiene el
  freno de aprobación del plan, el vocabulario cerrado de estado, el bug de tres estados, la
  generación de datos de prueba con su corte de `bloqueado`, y el índice, `evidence/` y
  `bugs/` en *Where it lands*. Sus hojas están escritas.
- **T11, T12, T13** — **aplicadas a `nzt-ux`.** Sin `flow`, con `mockup` (a pedido) y
  `system`, y con el origen obligatorio por elemento, el corte mecanismo/contenido y el
  reparto de accesibilidad. Sus hojas están escritas.
- **T14, T15, T16** — **aplicadas a `nzt-ship`.** Lista `pipeline` y `observability`, su
  fila por área, la autorización que nombra el entorno con su mitad de entornos locales, y
  `deployment.md` / `releases.md` en *Where it lands*. Sus hojas están escritas.
- **T17, T18, T19** — **aplicadas a la rama profesor**, que se escribió directamente con
  ellas. T17: `train` y `exercises` son hojas distintas, y la regla de la solución en otro
  archivo vive en `exercises`. T18: el estado del tema es `Learn/<tema>/progress.md`, sin
  entrada en `Plan/state.json`, y `nzt` reconoce un pedido de aprendizaje antes de
  clasificar. T19: pedir la solución se concede sin reproche y se registra como
  `solved by the system`, que D14 extendió al escalón 4 de la escalera de pistas.
- **T20, T21, T22** — adoptadas (13.3) y **aplicadas al kernel**. Los diez guardrails, la
  fila `nzt-learn`, `autonomy` en el esquema y las cuatro reglas de autonomía entraron; el
  recorte de 13.10 se ejecutó entero. El kernel quedó en **150 líneas** (161 el archivo
  construido), 50 debajo del techo. El catálogo se queda en 35. **T21 quedó completa en el
  paso 3**: los cuatro campos del reporte y el orden del freno viven en `nzt-plan`, sin hoja
  nueva.

**R1: cruzado, medido y revertido.** Con `nzt-ship-release` el listado había pasado el piso
de 8.000 **dentro del modo construcción**, y con la rama profesor terminada llegó a
**10.435 chars con 45 skills**. La pasada de compresión de D17 —las 45 descriptions, de 231
a ~140 chars de promedio, sin tocar el cuerpo de ninguna skill— lo dejó en **7.219**, y el
build volvió a pasar sin warning.

Lo que eso cambia y lo que no:

- **Cambia** que el núcleo instalado solo —el caso de un proyecto que no es .NET, y el del
  modo profesor— entra en Codex incluso sin contexto conocido.
- **No cambia** que el catálogo completo no entra: ya no es proyección — **el set completo
  medía 17.634 chars con 91 skills** (12), 2,2× el piso, y **hoy mide 20.765 con 110**
  (13.12 + D36 + D37), 2,6×. La mitigación sigue siendo la de 12 y lo que queda por decidir es I4.
- **No cambia** que la fase 9 es la que decide. El piso de 8.000 es el caso sin contexto
  conocido; el presupuesto real de 2% hay que medirlo en Codex, y esa medición **la tiene
  que correr el usuario**, porque requiere Codex CLI instalado con el set copiado.
- **Deja una regla que había que sostener y no se sostuvo:** cada skill nueva se escribe con
  la densidad de D17. **Medido con la capa entera: va en ~189 de promedio, no en ~140 — es
  I4**, y son ~2.250 chars de diferencia sobre el listado.

**Decisiones todavía abiertas:**

- ~~**I1**: alcance por proyecto para la capa de stack~~: **cerrada — se instala todo
  global, sin flag** (D18). A la densidad de D17, 50 skills de stack son ~8.800 chars y dejan
  el catálogo en ~16.000; 25 lo dejan en ~11.600. Con el modo de falla verificado en C2 eso
  **no es un corte**, sino hojas que Codex puede dejar sin listar. **Cuántas skills tiene la
  capa de stack deja de ser una pregunta de presupuesto duro y vuelve a ser una de cohesión**
  — con una condición: que la fase 9 confirme que un router puede cargar una hoja no listada.
- **I2**: duplicación entre `install/build.*` y el instalador .NET.
- ~~**I4 · La densidad de las descriptions de la capa de stack**~~: **cerrada — se acepta
  ~190 y no se comprime ahora** (D25). El dato que la cierra es de aritmética: comprimir las
  46 a ~140 lleva el listado de **17.634 a ~15.400**, y el piso son **8.000**. Es 2,2× contra
  1,9×: **el catálogo no entra ni antes ni después**, así que la pasada no cambia ningún
  resultado, sólo gasta 46 ediciones sobre skills que ya están escritas. **Lo que sí lo
  decide es la fase 9**: el piso de 8.000 es el caso sin contexto conocido, y el presupuesto
  real es 2% del contexto — con una ventana grande entra todo y la pregunta desaparece, con
  una chica ni comprimido alcanza. **Se reabre sólo si la fase 9 lo vuelve vinculante.**
  Mientras tanto **D17 sigue vigente para lo que se escriba nuevo**: apuntar a ~130 en una
  hoja cuesta lo mismo que apuntar a ~190 cuando se escribe de cero, y es deuda que no se
  acumula. Decidido por el usuario, que delegó el ajuste. Es **D25**.

  El detalle medido, para no volver a medirlo: **46 skills de stack a ~189 chars de
  description promedio (8.716 en total)** contra **45 del núcleo a ~143 (6.307)**. La capa
  entera nació así —backend ~190, Blazor ~188, ship ~180—, no es una desviación de una tanda,
  y explica la diferencia entre el listado real (**17.634 con 91 skills**) y lo que D17
  proyectaba (~15.000 con ~95).
- ~~**I3. `## When to skip this phase` en los routers**~~: **cerrada por el usuario — la
  sección se queda en `nzt-architecture` y `nzt-ux`.** Es D16.
- ~~Fila `nzt-learn` en la tabla de ruteo del kernel~~: **cerrada**, y su consecuencia
  **saldada**: el router y sus siete hojas existen, así que la fila del kernel apunta a una
  rama completa y ninguna tabla manda a la nada.

**La fase de aplicación**, en orden de dependencia:

1. ✅ **El kernel.** Aplicado: el recorte de 13.10 completo, los diez guardrails de 13.9
   #31–#40, la fila `nzt-learn`, `autonomy` en el esquema y las cuatro reglas de T22. **150
   líneas**, 161 el archivo construido. Cada línea sacada tiene su destino escrito, no solo
   nombrado: la tabla de clasificación estaba ya en `nzt` §3; el corte de unidades y el
   freno temprano, en `nzt-plan`; el árbol de artefactos se repartió en los bloques *Where
   it lands* de los seis routers de fase, y por eso esta unidad tuvo que escribir los dos
   que faltaban (`nzt-build` y `nzt-ship`); el acuerdo de artefactos de 6.1 bajó a
   `nzt-plan` como sección propia. El inicio de sesión quedó como una línea dentro de
   *Estado*.
2. ✅ **Los routers.** Los seis de fase reescritos enteros — *Required guidance* con su
   línea de reuso, *Done when*, checklist de cierre, la fila por área en `nzt-build` y
   `nzt-ship`, y la deuda de cada revisión aplicada — más `nzt`, que ahora reconoce un
   pedido de aprendizaje (T18). Entre 81 y 130 líneas cada uno, todos bajo el techo. El
   séptimo, `nzt-learn`, se escribió con su rama en el paso 4. **Los routers se retocaron al
   escribir sus hojas**, siempre por la misma razón: un destino que estaba nombrado pero sin
   archivo (`Docs/architecture.md`, `Docs/product.md`, `design/design.md`) o una fila que
   faltaba en la tabla (el arreglo de defecto en `nzt-build`).
3. ✅ **`nzt-plan`.** Recibió todo lo que salía del kernel y lo que 13.9 le sumaba: acuerdo
   de artefactos, presentación del plan (markdown sin bloque de código, el *por qué* por
   paso, las tres declaraciones), aprobación y autonomía, la disciplina de preguntas con sus
   tres lugares y las dos salidas de una pregunta escrita, el bloque de conflicto, el orden
   del freno y los cuatro campos del reporte (T21), y la reconciliación al retomar. Salió en
   **194 líneas** y la segunda pasada le sumó 4 (el cierre como unidad y como regla, D25):
   **198, con 2 de margen bajo el techo de D3.** Es el archivo más grande del set y el único
   que ya no tiene lugar. Lo próximo que quiera entrar ahí no sube el techo ni se va a
   `references/` (D4): o se comprime, o significa que `nzt-plan` está haciendo dos trabajos —
   y el candidato natural a salir es el bloque de preguntas, que es lo más autónomo.
4. ✅ **Las hojas**, de a una por unidad, con el catálogo en 36 más 8 de la rama
   profesor. **Escritas 37 de 44: los dos modos están completos.** Las seis ramas:
   `nzt-discovery` (`analysis`, `write-spec`, `write-stories`, `product`, `glossary`,
   `reverse`), `nzt-architecture` (`design-product`, `stack`, `design-feature`, `adr`),
   `nzt-build` (`implement`, `refactor`, `remove`, `dependencies`, `secrets`, `tdd`),
   `nzt-ux` (`screen`, `system`, `mockup`, `review`), `nzt-verify` (`test-design`,
   `test-run`, `explore`, `automate`, `bug`) y `nzt-ship` (`vcs`, `release`, `pipeline`,
   `observability`).

   **Y la rama profesor, cerrada**, con la deuda de 13.8 (40 puntos) y T17–T19 aplicada —
   es la más dictada de todas porque se revisó **antes** de escribir:
   ✅ `nzt-learn` (router) → ✅ `plan` → ✅ `teach` → ✅ `tutor` → ✅ `exercises` →
   ✅ `train` → ✅ `assess` → ✅ `retain`. Ese orden no fue arbitrario: `plan` produce los
   `OA-NN` que todas las demás citan, `teach` y `tutor` son el par que se usa junto,
   `exercises` es lo que los dos escriben, y `assess` y `retain` leen lo que los anteriores
   dejaron en `progress.md`. Después, la capa de stack (fase 7 del roadmap).

   **Lo que `plan` y `teach` dejaron fijado y las que siguen tienen que respetar** (además
   de D12 y D13): el vocabulario cerrado de estados (`not started`, `in progress` + los
   cinco veredictos), las tres secciones de `progress.md` con la bitácora append-only, que
   cada estado nombre su evidencia, y **el desvanecido de tres pasos** — *solved · faded ·
   alone*, un ejercicio por paso y un caso distinto cada vez. `tutor` sumó la matriz
   confianza × resultado y la escalera de cuatro escalones con su registro (D14).
   **`exercises` escribe las consignas de esos tres pasos** — una por paso, con su *Done
   when* visible, y la serie de entrenamiento con una consigna por serie y un caso por
   repetición; `train` se las pide y no las escribe. El reparto que quedó, y que hay que
   sostener si alguna de las ocho se toca: **`train` no reparte veredictos** (registra la
   sesión y su estabilización; el veredicto sale de `assess`, sobre un caso que nadie
   practicó), **`assess` no enseña mientras mide** (anota el hueco, termina, y la re-enseñanza
   es después con `teach`), y **`retain` es lo que hace que los tres estados frágiles cuesten
   algo en el calendario** — `high / wrong`, `solved by the system` y `not achieved`
   re-enseñado saltan al intervalo más corto.

   **El arreglo de un defecto no tiene hoja propia**: vive en `implement`, con su fila en
   el router, porque es comportamiento especificado que falta (13.4 #15). Cada hoja se
   escribe con las reglas de autoría de la sección 10 — con la 11 incluida — y con la deuda
   que su fase dejó registrada en 13.2 a 13.8.

La deuda de los routers quedó saldada en el paso 2: `nzt-build` tiene setup autorizado
(13.4 #14), unidad = historia (T6), fila por área (T5), comentarios (T4) y cierre medible
(13.4 #19); `nzt-verify` tiene el freno de aprobación del plan (13.5 #6), el vocabulario de
estado (#8), el bug de tres estados (#19) y **la generación de datos de prueba (#31 y
#32)** — el único punto de toda la revisión que sale de usar Temper y no de leerlo: el
agente frenó por falta de datos que él mismo podía crear.

**Deuda que dejó el paso 2 — saldada el 2026-09-17.** La convención de comentarios del
router `nzt-build` era el único contenido que la revisión mandó escribir sin dictar, y se
contrastó contra `development-comment-conventions` en la segunda pasada: le faltaban
*arreglar el nombre en lugar de comentarlo* y *la spec no viaja al código*, y la línea que
invitaba a citar un `Q-NN` o un `QT-NN` adentro de un comentario se reemplazó por la regla
correcta — solo se nombra una fuente que no se mueve (13.12, último párrafo). **No queda
contenido pendiente de escritura en el set.**
