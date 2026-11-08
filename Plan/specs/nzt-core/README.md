# NZT — Spec fundacional

> Estado: borrador para aprobación · Fecha: 2026-09-16 · Owner: Eze

> **Rutas desde D98 (2026-11-07).** Esta spec vive en `Plan/specs/nzt-core/`, en tres archivos (D99). Las decisiones
> anteriores citan las rutas de su momento: `specs/` es `Plan/specs/`; `core/`, `skills/` y
> `agents/` están en `nzt-software/method/`; `evals/`, `mods/` y `presentation/` en
> `nzt-software/`; `install/build.*` es `nzt-software/build/`; `installer/` es
> `nzt-software/cli/`, con `install/install.*` y `variants.sh` en `nzt-software/cli/install/`;
> `.github/releases/` y `.github/plugin-README.md` están en `nzt-software/release/`; `dist/` es
> `nzt-software/dist/`. La estructura actual está en la sección 9.

## 1. Concepto

En *Limitless* (2011), Eddie Morra es un escritor bloqueado y fracasado hasta que toma
NZT‑48: la pastilla no le agrega conocimiento nuevo, le da **acceso total a lo que ya
sabe** y la capacidad de ordenarlo, conectarlo y ejecutarlo a velocidad extrema. Pasa de
improvisar a operar con método. Las consecuencias malas de la película vienen de tomarla
**sin estructura ni control**.

NZT (este proyecto) es esa pastilla para agentes de código. **No agrega conocimiento al
modelo ni lo limita**: le da una forma de trabajar —método, memoria y frenos— para que
rinda al máximo de forma consistente. El agente sigue siendo el agente; NZT es la
disciplina.

Metáfora operativa que guía todas las decisiones de diseño:

| Película | NZT (proyecto) |
|---|---|
| Acceso total a lo que ya sabés | No restringimos el conocimiento del modelo |
| Claridad y método instantáneos | Flujo Spec Driven Development siempre disponible |
| El crash por tomarla sin control | Puntos de freno, estado persistido, revisión humana |
| Eddie al final: la perfecciona y le saca los efectos secundarios | v1 apunta a estructura sin rigidez |

## 2. Objetivo

Un set de **skills instalables** que, al instalarse en un proyecto o en la máquina, hace
que Claude Code y Codex CLI trabajen con una conducta estructurada estilo Spec Driven
Development, **sin agentes ni subagentes**, aumentando agilidad, calidad y consistencia.
*(Así fue v1. D70/D71 sumaron un explorador de solo lectura, y D84 un worker para las
unidades que el plan aprobado marca en paralelo; las decisiones siguen en el hilo principal.)*

El set tiene dos modos: **construir** software con método (secciones 4 a 8) y **enseñar**
una habilidad a la persona en lugar de reemplazarla (sección 4.6).

### Criterios de éxito

1. Instalado en un proyecto nuevo: el agente entiende el pedido, propone un plan y ejecuta
   por unidades con frenos, sin que el usuario tenga que recordarle el método.
2. Instalado en un proyecto legacy sin specs: el agente puede arrancar igual desde donde
   está, y puede hacer ingeniería inversa por módulos generando specs que reflejen el código.
3. El agente carga **solo** las skills que necesita para la tarea en curso.
4. Una sesión interrumpida se retoma desde `Plan/state.json` sin perder el hilo.
5. Mismo comportamiento observable en Claude Code y en Codex CLI.

### Fuera de alcance (v1)

- Agentes, subagentes, personas o teams.
- Proveedores fuera de Claude Code y Codex CLI (Cursor, Gemini CLI, Copilot: v2).
- Stacks fuera de .NET 10 y Blazor. La capa de stack de v1 cubre solo esos dos (4.5); el
  núcleo metodológico es agnóstico y no puede depender de ellos.
- Automatizaciones por hooks o MCP **en el núcleo**. Los mods de Claude Code son una capa
  aparte y opcional que el método no necesita (D63, `specs/nzt-mods.md`).

## 3. Restricciones de plataforma (investigadas)

Decisiones de diseño que no son opinión, salen de cómo funciona cada herramienta:

| Tema | Claude Code | Codex CLI |
|---|---|---|
| Archivo siempre cargado | `CLAUDE.md` (raíz o `.claude/`) | `AGENTS.md` (raíz, y `~/.codex/AGENTS.md`) |
| Merge | root → cwd, concatenado | root → cwd, el más cercano pisa |
| Límite | objetivo < 200 líneas (adherencia cae) | cap duro 32 KiB combinados |
| Skills | `.claude/skills/<n>/SKILL.md`, `~/.claude/skills/` | `.agents/skills/<n>/SKILL.md`, `~/.agents/skills/` |
| Invocación explícita | `/skill-name` | `$skill` |
| Presupuesto del listado de skills | listado ≤ 1% de la ventana de contexto; al pasarse, quita las descriptions de las skills menos usadas; `description` + `when_to_use` truncadas a 1536 chars (releído 2026-10-03) | listado total ≤ 8000 chars o 2% del contexto |
| Archivos de soporte | se leen solo cuando la SKILL.md los enlaza y la tarea los pide; no cuentan en el listado | `references/`, `scripts/`, `assets/`, ídem |
| Compactación | re-adjunta cada skill invocada (primeros 5.000 tokens, 25.000 en total); un archivo leído no se re-adjunta | sin verificar |
| Tamaño de SKILL.md | recomendado < 500 líneas | ídem |
| Frontmatter portable | `name`, `description` (+ `license`, `compatibility`, `allowed-tools`) | `name`, `description` |
| Tool de preguntas (D64) | `AskUserQuestion`: 1-4 preguntas, 2-4 opciones, siempre disponible (2.1.302, leído 2026-10-17) | `request_user_input`: solo en modo Plan o con el flag `default_mode_request_user_input`, en desarrollo y apagado (0.154.0, observado 2026-10-17) |

Consecuencias directas:

- **C1.** El frontmatter de las skills NZT usa **solo `name` y `description`**. Nada de
  `context: fork`, `model`, `allowed-tools`, `disable-model-invocation`: rompen portabilidad.
- **C2.** El listado completo de skills NZT debe entrar en **8000 caracteres**, o 2% del
  contexto cuando Codex lo conoce. **El modo de falla está verificado en la fuente**
  (2026-09-16): al pasarse, Codex **primero acorta las descriptions** y después **omite
  skills del listado inicial con un warning**; una skill seleccionada igual carga su
  `SKILL.md` completo. No es un corte duro: es degradación en dos pasos.
  **Y eso le pega distinto a NZT que a un set convencional.** Como el ruteo está instruido
  —la tabla del kernel vive en `AGENTS.md`, que **no cuenta en este presupuesto**, y cada
  router nombra sus hojas—, lo que tiene que sobrevivir en el listado son los **11 routers**
  (`nzt`, los seis de fase, `nzt-learn` y los tres de área): las hojas las nombra su router,
  no el listado. Lo que **no** está verificado es si una skill omitida del listado se puede
  seleccionar igual por nombre; esa es la pregunta concreta de la fase 9.
  **Desde D50 la pregunta pierde peso**: el listado son 15 skills y unos 2.700 chars (D71), debajo
  del piso de 8.000. Y **el presupuesto ya no es solo de Codex**: Claude Code lo topea al 1 %
  del contexto (fila de arriba, releída el 2026-10-03).
- **C3.** `CLAUDE.md` y `AGENTS.md` ≤ 200 líneas cada uno, y comparten una fuente única
  para no divergir.
- **C4.** Las rutas de skills difieren por proveedor ⇒ hace falta un instalador que copie
  (en Windows los symlinks piden admin, así que **copiamos**, no linkeamos).
- **C5.** Ningún proveedor soporta skills anidadas: son carpetas planas dentro de
  `skills/`. El repo sí las anida y el instalador aplana el path a un nombre (sección 9.1).
  **Matiz leído el 2026-09-17**: la doc de Claude Code dice que **un plugin sí admite
  subcarpetas de skills** y que adentro de un plugin la skill se llama `plugin:skill`. No se
  verificó hasta qué profundidad ni con qué nombre quedan las de NZT, y **la decisión de
  aplanar no depende de eso**: `nzt-ai` instala skills planas (D24), y el plugin de D91 usa
  sus propios nombres `nzt:…` (C7).
- **C6.** **Hay un harness de evals oficial: `claude plugin eval`** (leído y probado el
  2026-09-17 con la v2.1.274; pide ≥ 2.1.269). Lo que fija el diseño de la fase 6:
  **(1)** el target tiene que ser **un plugin** —carpeta con `.claude-plugin/plugin.json`—,
  no un `skills/` suelto; **(2)** cada corrida arranca en un **workspace vacío**, así que el
  `CLAUDE.md` de NZT no está salvo que el caso lo siembre con `context.scaffold_script`, y
  sin él se mide matching de descriptions en vez del ruteo instruido (R2); **(3)** trae
  **arm de ablación** (con y sin el set, con su Δ) y graders `tool_used: Skill`, que es
  literalmente *disparó o no disparó*, con `min: 0, max: 0` para *no tiene que disparar*;
  **(4)** los graders de skill no puntúan en el arm sin plugin —serían un cero garantizado—,
  salvo que se marquen `arm: both`, que es lo que usan los casos de sobre-disparo.
- **C7.** **Lo que un plugin de Claude Code puede hacer para traer NZT** (leído el
  2026-11-03, Claude Code 2.1.312; unidad 461). *Documentado*:
  **(1)** un `CLAUDE.md` en la raíz del plugin **no se carga** como contexto, y
  `claude plugin validate` avisa si lo encuentra; las instrucciones del plugin van en skills;
  **(2)** cada componente lleva el nombre del plugin delante (`nzt:nzt-build`), y una skill
  del plugin **no choca** con una suelta del mismo nombre en `~/.claude/skills/` o en el
  proyecto: cargan las dos;
  **(3)** en el contenido de una skill de plugin se reemplazan `${CLAUDE_PLUGIN_ROOT}`,
  `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_SKILL_DIR}` y `${CLAUDE_PROJECT_DIR}`, también en
  `allowed-tools`; con la misma ruta en los dos lugares la skill corre su script **sin pedir
  permiso**;
  **(4)** `disable-model-invocation: true` hace que el modelo no cargue la skill solo; queda
  para `/nombre`;
  **(5)** un hook `SessionStart` de plugin corre en `startup`, `resume`, `clear` y `compact`;
  `additionalContext` tiene un tope de **10.000 caracteres por string**, sin forma de
  subirlo; lo que lo pasa se guarda en un archivo y al modelo le llega una vista previa de
  2.000; con `allowManagedHooksOnly` los hooks de plugins no corren;
  **(6)** el `settings.json` de un plugin solo aplica `agent` y `subagentStatusLine`; un
  output style con `force-for-plugin: true` se aplica solo y pisa el `outputStyle` del
  usuario.
  *Medido*: `dist/CLAUDE.md` tiene 7.946 caracteres. Fuentes:
  [plugins-reference](https://code.claude.com/docs/en/plugins-reference),
  [plugins/components](https://code.claude.com/docs/en/plugins/components),
  [skills](https://code.claude.com/docs/en/skills),
  [hooks](https://code.claude.com/docs/en/hooks),
  [output-styles](https://code.claude.com/docs/en/output-styles).
- **C8.** **Lo que un plugin de Codex puede hacer para traer NZT** (leído el 2026-11-03;
  Codex CLI instalado: 0.164.0; las páginas no dicen versión mínima; unidad 461).
  *Documentado*: **(1)** los plugins andan en Codex CLI y en la app de escritorio de
  ChatGPT, **no en la extensión del IDE**; en la CLI se instalan con `/plugins` desde un
  marketplace (`codex plugin marketplace add owner/repo`) y se usan desde una sesión nueva;
  **(2)** un plugin trae skills, servidores MCP, assets, extensiones del navegador y hooks,
  y **ninguna página dice que traiga `AGENTS.md` ni instrucciones siempre cargadas**;
  **(3)** los hooks del plugin, `SessionStart` incluido, son para plugins de escritorio
  instalados a mano, y **no se confía en ellos solo por instalar**: Codex los saltea hasta
  que el usuario los revisa; reciben `PLUGIN_ROOT` y `PLUGIN_DATA`;
  **(4)** `policy.allow_implicit_invocation: false` en `agents/openai.yaml` evita que Codex
  dispare la skill solo, y `$skill` la sigue invocando; **(5)** las skills de usuario viven
  en `~/.agents/skills`, y dos skills con el mismo `name` no se fusionan: aparecen las dos.
  *Sin verificar*: **(6)** cómo una skill de plugin llega a un script suyo; la doc solo dice
  que `scripts/` es "código ejecutable", sin variable ni regla de rutas. Se resuelve con una
  prueba contra Codex 0.164.0. **(7)** El nombre con que se invoca una skill de plugin: la
  doc dice que el nombre del plugin es su espacio de nombres, sin dar la sintaxis.
  *Inferido de (3)*: en Codex el aviso de versión no puede depender de un hook; lo tiene que
  dar la propia skill de setup o el bloque del kernel. Fuentes:
  [build plugins](https://developers.openai.com/codex/plugins/build/),
  [plugins](https://learn.chatgpt.com/docs/plugins) y
  [build skills](https://learn.chatgpt.com/docs/build-skills) (las dos últimas son la
  redirección 308 de `developers.openai.com/codex/plugins` y `/codex/skills`).

## 4. Arquitectura del set

Tres capas, con carga progresiva (progressive disclosure):

```
Capa 0 — Kernel        CLAUDE.md / AGENTS.md            siempre en contexto   ≤200 líneas
Capa 1 — Routers       nzt, nzt-<fase>, routers de área  se cargan por fase    ≤200 líneas
Capa 2 — Hojas         <router>/references/<hoja>.md     se leen por tarea     ≤200 líneas
```

**Desde D50 las hojas no son skills: son archivos de referencia de su router**, y la tabla
del router es lo único que las nombra. El listado de skills queda en las 15 que son routers
o que nombra el kernel (`nzt-delegate` se sumó con D71). Hasta D50 las hojas eran skills y `references/` estaba declarada y
sin uso (D4, derogada).

### 4.1 Kernel (Capa 0)

Lo mínimo que el agente necesita **siempre**. Contiene:

1. **El bucle de trabajo** (sección 5).
2. **El disparador del estado**: `Plan/state.json` se lee al empezar, y leerlo o escribirlo
   carga `nzt-plan`, que tiene su esquema y sus reglas (sección 7, D74).
3. **La regla de frenos** (sección 6).
4. **La tabla de ruteo**: qué router cargar según la intención detectada. Esto es lo que
   evita depender solo del `description` de cada skill.
5. **Las reglas duras**: nunca hacer todo de una, nunca escribir más de una spec por vez,
   nunca ejecutar un plan sin aprobación.
6. **La comunicación**: el idioma del usuario (D2) y los principios de toda respuesta; los
   formatos viven en sus skills (D74).

El kernel **no** explica cómo se escribe una spec ni cómo se diseña una arquitectura. Eso
vive en las skills.

### 4.2 Routers (Capa 1)

Un router es una skill "padre" que agrupa una fase, explica cuándo aplica, y **nombra
explícitamente** las hojas que puede cargar. Sirve para dos cosas: dar contexto de fase y
hacer la selección determinista en vez de dejarla al matching de descripciones.

| Router | Cuándo entra |
|---|---|
| `nzt` | Arranque, retomar sesión, o cuando no está claro en qué fase estamos |
| `nzt-discovery` | Entender el pedido, resolver ambigüedades, escribir specs |
| `nzt-architecture` | Decidir cómo se resuelve: componentes, stack, diseño técnico |
| `nzt-ux` | Diseño de pantallas, flujos, sistema visual |
| `nzt-build` | Implementar contra specs y marcar avance |
| `nzt-verify` | Diseñar y ejecutar pruebas, registrar evidencia |
| `nzt-ship` | Versionado, CI/CD, release |

### 4.3 Hojas (Capa 2)

Procedimientos concretos. Catálogo tentativo de v1 (se cierra en la fase de
implementación, con el presupuesto de C2 como techo). En el repo viven anidados; el
nombre de la skill sale del path (sección 9.1):

> **Desde D50 este árbol se lee con una regla de traducción**: una hoja `nzt-<router>-<x>` es
> el archivo `references/<x>.md` de la carpeta de su router (`nzt-build-implement` →
> `skills/nzt/build/references/implement.md`). Los nombres se conservan para trazabilidad;
> lo que deja de existir es la entrada en el listado.

```
skills/nzt/                      nzt
├─ plan/                         nzt-plan
│  └─ close/                     nzt-plan-close             → cierre de feature (D25)
├─ research/                     nzt-research               → evidencia externa (D31)
├─ delegate/                     nzt-delegate               → lectura en nzt-explorer (D71)
├─ retro/                        nzt-retro                  → propuestas sobre el entorno, a pedido (D87)
├─ discovery/                    nzt-discovery          (análisis funcional)
│  ├─ analysis/                  nzt-discovery-analysis     → análisis append-only (T2)
│  ├─ product/                   nzt-discovery-product      → Docs/Product/ (D57)
│  ├─ glossary/                  nzt-discovery-glossary     → Docs/Domain/ (D57)
│  ├─ write-spec/                nzt-discovery-write-spec   → Plan/specs/ (feature)
│  ├─ write-stories/             nzt-discovery-write-stories → Plan/specs/ (historias, T1)
│  ├─ change/                    nzt-discovery-change       → cambio a feature viva (D28)
│  └─ reverse/                   nzt-discovery-reverse
├─ architecture/                 nzt-architecture
│  ├─ design-product/            nzt-architecture-design-product
│  ├─ stack/                     nzt-architecture-stack     → documento de stack (D9)
│  ├─ stack-axes/                nzt-architecture-stack-axes → ejes, opciones y cómo se preguntan (D59)
│  ├─ design-feature/            nzt-architecture-design-feature
│  ├─ decisions-log/             nzt-architecture-decisions-log → log QT append-only (D85)
│  ├─ domain/                    nzt-architecture-domain    → domain-model.md (D26)
│  ├─ contexts/                  nzt-architecture-contexts  → context-map.md (D26)
│  ├─ tech-debt/                 nzt-architecture-tech-debt → tech-debt.md (D29)
│  ├─ review/                    nzt-architecture-review    → mejoras con evidencia (D30)
│  ├─ diagrams/                  nzt-architecture-diagrams  → catálogo y reglas (D27)
│  │  ├─ components/             nzt-architecture-diagrams-components
│  │  ├─ domain/                 nzt-architecture-diagrams-domain
│  │  └─ behavior/               nzt-architecture-diagrams-behavior
│  ├─ adr/                       nzt-architecture-adr
│  └─ rfc/                       nzt-architecture-rfc       → a pedido (D35)
├─ ux/                           nzt-ux
│  ├─ screen/                    nzt-ux-screen       (incluye navegación, T11)
│  ├─ mockup/                    nzt-ux-mockup       → HTML, a pedido (T12)
│  ├─ manual/                    nzt-ux-manual       → manual del usuario final (D37)
│  ├─ system/                    nzt-ux-system       → Docs/UX/ + visual (T13)
│  ├─ generic/                   nzt-ux-generic      → contra el aspecto por defecto (D86)
│  └─ review/                    nzt-ux-review
├─ build/                        nzt-build                 (leer el stack primero, D85)
│  ├─ recon/                     nzt-build-recon           → relevamiento de impacto (D30)
│  ├─ implement/                 nzt-build-implement
│  ├─ refactor/                  nzt-build-refactor
│  ├─ remove/                    nzt-build-remove           → barrido de eliminación (T4)
│  ├─ dependencies/              nzt-build-dependencies     (T4)
│  ├─ secrets/                   nzt-build-secrets          (T4)
│  ├─ tests/                     nzt-build-tests            → criterio + niveles (D32, D42)
│  └─ tdd/                       nzt-build-tdd              → opt-in del stack (T4)
├─ verify/                       nzt-verify
│  ├─ test-design/               nzt-verify-test-design
│  ├─ test-data/                 nzt-verify-test-data   → setup y teardown por caso (D36)
│  ├─ test-run/                  nzt-verify-test-run    (incluye la ejecución, T7)
│  ├─ explore/                   nzt-verify-explore     → exploratoria por cartas (T7)
│  ├─ performance/               nzt-verify-performance → tiempo que espera el usuario (D34)
│  ├─ automate/                  nzt-verify-automate    → E2E, opt-in del stack (T8)
│  ├─ review/                    nzt-verify-review      → defectos leyendo código (D30)
│  ├─ audit/                     nzt-verify-audit       → documentos vs código (D30)
│  └─ bug/                       nzt-verify-bug
├─ ship/                         nzt-ship
│  ├─ vcs/                       nzt-ship-vcs
│  ├─ release/                   nzt-ship-release   (escribe deployment.md, T16)
│  ├─ pipeline/                  nzt-ship-pipeline  → compuertas de CI (T15)
│  └─ observability/             nzt-ship-observability  (T15)
└─ learn/                        nzt-learn              → modo profesor, sección 4.6
```

### 4.4 El análisis funcional es una fase, no un preámbulo

`nzt-discovery` es el analista funcional del set. Antes de decidir cómo se construye algo,
alguien tiene que definir **qué** es y **para quién**. Ese trabajo produce artefactos, no
una charla:

| Skill | Produce | Dónde |
|---|---|---|
| `nzt-discovery-clarify` | preguntas y ambigüedades resueltas | (entrada de las demás) |
| `nzt-discovery-product` | objetivos, usuarios, módulos, alcance y no‑alcance — obligatorio (D56) | `Docs/Product/` |
| `nzt-discovery-glossary` | vocabulario del dominio, su significado y su nombre en código — obligatorio y al día (D56) | `Docs/Domain/` |
| `nzt-discovery-write-spec` | spec de feature: reglas de negocio y criterios de aceptación | `Plan/specs/<feature>/` |
| `nzt-discovery-reverse` | specs derivadas de código existente | `Plan/specs/<feature>/` |

División con arquitectura: **discovery define el problema en lenguaje de negocio,
architecture define la solución en lenguaje técnico.** El glosario y las reglas son de
discovery; el modelo de entidades, los agregados y las decisiones de persistencia son de
architecture.

Cuando el plan arranca un producto nuevo, su **primera fase siempre es análisis**, y sus
unidades son los artefactos de esta tabla, de a uno con freno entre medio.

### 4.5 Capa de stack

Además de la metodología, el set incluye skills atadas a un stack concreto: **.NET 10**
para backend y **Blazor** para frontend. **El eje tecnología cruza fases** (T14): hay un
*cómo se escribe el código en .NET* y también un *cómo se despliega .NET*. Por eso la capa
se organiza **por fase y área**, y cada router de fase lista solo sus propias áreas:

```
skills/nzt/build/
├─ backend/dotnet/               nzt-build-backend-dotnet        ← router de área
│  └─ ...                        nzt-build-backend-dotnet-*
└─ frontend/blazor/              nzt-build-frontend-blazor       ← router de área
   └─ ...                        nzt-build-frontend-blazor-*

skills/nzt/ship/
└─ backend/dotnet/               nzt-ship-backend-dotnet         ← router de área
   └─ ...                        nzt-ship-backend-dotnet-*       (pipeline, contenedor,
                                                                  migraciones, telemetría)
```

Reglas de esta capa:

- **La metodología no depende del stack.** Nada en el kernel ni en los routers de fase
  puede asumir .NET o Blazor. Un proyecto en otro stack usa NZT igual, sin esta capa.
- **Cada área tiene su router, y el router de fase solo lista los routers de área** (T3
  define las áreas, T5 esta forma, T14 su alcance). El router de área es el único que
  conoce las hojas de su tecnología, y **selecciona por eje del stack**: lista juntas las
  alternativas excluyentes y carga solo la que el stack eligió (13.4 #1). Una carpeta
  instalada que el stack no seleccionó no se carga nunca.
- **Se instala global, como todo el resto del set** (D18). No hay instalación por proyecto
  ni flag que la seleccione: un proyecto que no es .NET tiene igual las skills de .NET en el
  listado. **Lo que impide que se carguen no es la instalación sino el documento de stack**:
  las áreas que un proyecto tiene son las que declara su stack (T3, D9), y *una carpeta
  instalada no es una autorización*. Esa línea ya vive en `nzt-build` y `nzt-ship`, y con
  instalación global pasa a ser el único filtro que hay.
- **El costo lo paga R1, no el ruteo**, y por eso el **tamaño de esta capa es una decisión de
  presupuesto** y no solo de cohesión: cada skill acá se paga en cada proyecto, incluso en
  los que nunca la van a usar. **Desde D50 un área cuesta una sola entrada** —su router—, y
  sus hojas son referencias que no se pagan hasta leerse.
- **Debajo de esta capa hay una capa genérica (D58)**: `nzt-build` lleva el principio de cada
  práctica de backend, datos, código y frontend, extraído de las referencias de área, y
  `nzt-architecture` los ejes del documento de stack en `stack-axes.md`, con las opciones
  copiadas de las tablas de build y los ejes propios de cada router de área sumados (D59). Un
  componente sin router de área para su tecnología lee la capa genérica a través de
  `practices-backend.md` o `practices-frontend.md`. Uno con router de área la lee como
  *Read with* obligatoria, antes de la referencia que dice cómo se hace en su tecnología.
- El contenido base sale del set de skills que ya tiene el usuario; se porta y se adapta
  a las convenciones de autoría de la sección 10, no se copia tal cual.

### 4.6 Modo profesor

> Rama **construida**: router y siete hojas, con las decisiones D12 a D15. Lo que sigue
> describe su diseño; el estado de construcción está en la sección 14.

NZT tiene **dos modos**, no uno. El modo construcción produce software. El modo profesor
produce **habilidad en la persona**. Que la IA sepa hacer algo no le da esa habilidad a
quien la usa; peor, se la disimula. Ver el problema resuelto genera una sensación de
dominio que no sobrevive al primer intento de hacerlo solo. El modo profesor existe
específicamente para atacar esa falsa sensación.

**La inversión que define el modo:** en construcción, el agente produce el trabajo. En
profesor, el agente **no puede producirlo**; lo produce la persona y el agente la lleva
hasta ahí. Un agente que resuelve el ejercicio "para mostrar cómo se hace" acaba de
destruir el propósito de la sesión.

El bucle de la sección 5 se mantiene íntegro — entender, proponer, ejecutar por unidades,
verificar, registrar — y mapea bien: entender es medir de dónde parte la persona, el plan
es el currículum, las unidades son lecciones y ejercicios, verificar es evaluar si la
persona **ejecuta** la habilidad, registrar es el progreso y los repasos pendientes.

```
skills/nzt/learn/                nzt-learn               (router)
├─ plan/                         nzt-learn-plan          objetivos, nivel real de partida, currículum
├─ teach/                        nzt-learn-teach         explicar para aplicar sin ayuda
├─ train/                        nzt-learn-train         segundo loop: práctica deliberada (T17)
├─ tutor/                        nzt-learn-tutor         corregir y desbloquear sin resolver
├─ assess/                       nzt-learn-assess        medir habilidad real, no sensación
├─ retain/                       nzt-learn-retain        repaso espaciado contra el olvido
└─ exercises/                    nzt-learn-exercises     consigna y solución, separadas (T17)
```

**Un track, dos loops** (13.8 #1): enseñar y entrenar comparten diagnóstico, objetivos,
corrección, evaluación y repasos, y difieren solo en el medio — `teach` arranca de no saber
y cierra cuando lo aplica sin ayuda una vez; `train` arranca de ya hacerlo y cierra cuando
el rendimiento se estabiliza. Se pasa de uno al otro dentro del mismo tema.

Principios que estas skills deben respetar (son los que separan enseñar de explicar):

1. **Medir antes de enseñar.** El punto de partida real casi nunca es el que la persona
   dice ni el que el agente asume.
2. **La persona produce, el agente corrige.** Si hay que escribir código, lo escribe la
   persona; el agente revisa, señala y pregunta. **Y si la persona pide la solución, se le
   da** — sin negociación y sin reproche — **pero el objetivo se anota como no adquirido y
   vuelve a repaso** (T19). Nada se le niega a la persona, y nada se le acredita que no
   haya hecho: la disciplina se hace cumplir en el registro, no negándole algo al usuario.
3. **Recuperación, no relectura.** Se aprende generando la respuesta, no reconociéndola.
4. **Calibración explícita.** Distinguir "lo reconozco" de "lo puedo hacer" es el
   antídoto directo contra la falsa sensación de saber. Se mide preguntando antes de
   evaluar y comparando la predicción con el resultado.
5. **Transferencia.** La evaluación usa un caso nuevo, no el que se enseñó. Resolver el
   ejemplo practicado no prueba nada.
6. **El olvido es el default.** Sin repaso espaciado, lo aprendido se pierde; `retain`
   existe porque una lección sin seguimiento es tiempo invertido a pérdida.

Artefactos: un tema vive **entero** en `Learn/<tema>/` — currículum, lecciones, consignas,
soluciones, evaluaciones, progreso y calendario de repasos. **Su estado de continuación es
`progress.md` y no hay entrada en `Plan/state.json`** (T18): el estado de un tema es por
objetivo y con fechas de repaso, no por unidad de trabajo, y mezclar los dos junta ciclos
de vida distintos. **La solución de un ejercicio vive en otro archivo y se escribe después
de la entrega**: es una regla sobre ubicación de archivos porque ese es el único lugar
donde se hace cumplir (13.8 #35).

Ajustes pendientes al kernel y al router raíz, **cuando la rama exista**: agregar la fila
`nzt-learn` a la tabla de ruteo — una fila que apunta a una skill inexistente es una
instrucción rota — y que la clasificación de `nzt` reconozca un pedido de aprendizaje y
derive a `nzt-learn`, que lee `Learn/*/progress.md` en lugar del estado (T18).

## 5. El bucle de trabajo

Este es el corazón de NZT. Cinco pasos, siempre en este orden, sobre **cualquier** pedido:

1. **Entender** — Interpretar el pedido y su intención real. Preguntar poco: solo lo que
   cambia materialmente el resultado si se asume mal. Lo demás se asume explícitamente y
   se declara. Si el proyecto ya tiene specs/estado, leerlos antes de preguntar nada.
2. **Proponer** — Devolver un plan: qué se va a hacer, en qué unidades, dónde están los
   frenos. El plan es un artefacto persistido —vive en `Plan/state.json`, sección 7— no un
   párrafo del chat, y el usuario puede modificarlo libremente antes de ejecutarlo.
3. **Ejecutar por unidades** — Una unidad por vez (ver sección 6), marcando el avance en
   la spec correspondiente a medida que se completa.
4. **Verificar** — Probar lo construido y **registrar** la evidencia (sección 8).
5. **Actualizar estado** — Escribir `Plan/state.json` al terminar cada unidad, siempre.

### 5.1 Punto de entrada adaptativo

NZT **no** asume que todo proyecto empieza de cero ni que hay que recorrer el pipeline
completo. Al arrancar, el agente clasifica la situación y entra donde corresponde:

| Situación | Entrada |
|---|---|
| Proyecto nuevo | Discovery → Architecture → (UX) → Build → Verify → Ship |
| Proyecto con specs NZT y estado | Leer `Plan/state.json` y continuar desde ahí |
| Proyecto existente sin specs, cambio chico | Trabajar directo, generando solo la spec del módulo tocado |
| Proyecto existente sin specs, se quiere adoptar SDD | `nzt-reverse`: ingeniería inversa por módulos |
| Bug puntual | Verify → Build → Verify, sin ceremonia |

**Regla anti‑rigidez:** el plan se ajusta al pedido, no al revés. Un cambio de una línea no
dispara PRD, arquitectura ni UX. El agente debe poder justificar por qué salteó una fase.
**Desde D78 la regla tiene forma**: `nzt` dimensiona todo pedido como **directo** (sin plan ni
estado), **estándar** (plan de `phases`, sin tramos, aprobado una vez) o **completo** (tramos).

### 5.2 Ingeniería inversa

`nzt-reverse` recorre el código **de a módulos** para no saturar el contexto: un módulo por
unidad, una spec por módulo, actualizando estado entre medio. Las specs generadas describen
lo que el código **hace hoy** (comportamiento observado), no lo que debería hacer; las
diferencias detectadas se anotan como hallazgos, no se "arreglan" sobre la marcha.

## 6. Puntos de freno

La regla que evita que el agente se coma el contexto y que el usuario pierda control.

**Unidad de trabajo** = la pieza más chica que se puede entregar y revisar sola:
una spec, un módulo en ingeniería inversa, una historia, un set de pruebas de una spec.

Al terminar cada unidad, el agente **obligatoriamente**:

1. Actualiza `Plan/state.json`.
2. Reporta en 3–5 líneas qué hizo y qué sigue.
3. **Para y espera**, salvo dentro de una tanda que el usuario eligió (D79).

Reglas específicas:

- Las specs se escriben **de a una**. Nunca un lote.
- El plan se aprueba antes de ejecutarse. Modificarlo es siempre una opción del usuario.
- **Acompañado es el default.** El agente puede encadenar unidades sin frenar **solo** si
  el usuario eligió una tanda para esa corrida. La autonomía **se ofrece una sola vez, al
  presentar el plan**, y desde D79 en dos formas, las dos **una lista cerrada de unidades**
  por id, nunca abierta: **las próximas N unidades**, o **hasta un hito** —el cierre de una
  fase de análisis, arquitectura o UX, un freno propio de una fase, la aceptación—, ofrecida
  siempre, con cada unidad hasta el hito nombrada por id. Una unidad
  que se corta después entra a la tanda solo si el usuario la suma. **Toda tanda frena igual**
  ante un fallo, una contradicción, una pregunta que traba y **pasado el 40% de contexto**, al
  terminar la unidad en curso, le queden unidades o no. Y de ahí en más (T22): **no responder
  es acompañado**; **aprobar el plan no selecciona autonomía**; **"continuemos" avanza el
  siguiente tramo acordado y no cambia de modo**; y **lo seleccionado se registra en el
  estado**, donde vacío o ausente significa acompañado. Un despliegue a un entorno compartido
  se corre autónomo solo si la selección nombró ese entorno (13.7 #1).
- **El orden del freno importa**: punto seguro → escribir el estado → recién entonces
  reportar. Un reporte escrito primero y persistido después se pierde si la sesión termina
  entre los dos (13.9 #18).
- Si la sesión se está por compactar o el contexto está cargado, el agente frena antes,
  deja el estado prolijo y lo dice.

### 6.1 Acuerdo de artefactos

Nada se produce sin acordarse. El plan **lista los documentos que va a generar** y el
usuario los conserva o los descarta línea por línea. Tres categorías:

| Categoría | Comportamiento |
|---|---|
| **Obligatorio** | No se ofrece: se declara. Sin él, el trabajo no puede continuar |
| **Ofrecido** | Aparece como línea del plan; el usuario lo baja si quiere |
| **A pedido** | No aparece salvo que el usuario lo pida |

Reglas del acuerdo:

- Al ofrecer un documento, decir **qué se pierde si se descarta**. "¿Querés el ADR?" no es
  una pregunta respondible; "sin el ADR esta decisión se rediscute en tres meses sin saber
  qué se evaluó" sí lo es.
- **Obligatorio hoy: el documento de stack por componente y área** (backend, frontend).
  Ningún componente se construye sin su stack: uno nuevo lo obtiene al diseñarlo, y uno
  existente sin stack lo obtiene desde evidencia antes de que se toque su código. Es la
  única forma de que el agente sepa con qué se construye este proyecto en vez de improvisar
  convenciones.
- **Obligatorios también: la definición de producto y el glosario** (D56). Un producto
  nuevo los produce en Análisis, antes de la primera spec; uno existente que no los tiene
  los obtiene cuando una feature entra a Análisis. **En trabajo estándar o en un producto
  existente, la definición de producto es una primera versión que crece con cada feature**
  (D82). **El glosario se mantiene al día en la
  misma unidad que introduce o cambia un término** —spec, historia, cambio o cierre—, y un
  término que build necesita y no está es una entrada de glosario que escribe discovery, no
  un nombre que se pregunta o se inventa a mitad del código.
- **No preguntar lo verificable.** Una versión, una capacidad del framework, el estado de
  mantenimiento de un paquete: eso se comprueba, no se consulta. Al usuario se le
  consultan tradeoffs y cambios materiales, no hechos.
- **No re-preguntar lo ya decidido.** Si el stack ya responde algo, se lee; no se abre un
  cuestionario sobre elecciones que el proyecto ya tomó.

## 7. Plan y estado: un solo archivo

`Plan/state.json` en la raíz del proyecto. **El plan vive acá adentro**, no en un `.md`
aparte: dos archivos que describen lo mismo se desincronizan, y el agente terminaría
gastando trabajo en mantener la coherencia entre ambos. Un archivo, una verdad. Su esquema y
sus reglas los dice `nzt-plan` en `references/state.md`, que su `SKILL.md` manda leer antes de
escribirlo (D85; hasta entonces vivían en el cuerpo); el kernel solo dice que leerlo
o escribirlo carga `nzt-plan` (D74).

```json
{
  "version": 1,
  "updated": "2026-09-16T14:22:00Z",
  "goal": "Autenticación con refresh token",
  "phases": [
    { "name": "analysis", "status": "done", "units": [
      { "id": 1, "do": "Spec de login", "status": "done" } ] },
    { "name": "build", "status": "doing", "units": [
      { "id": 2, "do": "Implementar login", "status": "doing", "detail": "falta refresh token" } ] },
    { "name": "verify", "status": "todo", "units": [
      { "id": 3, "do": "Pruebas de Plan/specs/auth/testing/login.md", "status": "todo" } ] }
  ],
  "approved": true,
  "autonomy": { "units": [2, 3], "keep_stops": [3] },
  "waiting_on": "aprobación para seguir con la spec de registro",
  "notes": ["El proyecto no tiene CI todavía"]
}
```

- Se escribe al **terminar cada unidad**, no durante.
- `status`: `todo`, `doing`, `done`, `dropped`. Como máximo una unidad en `doing`.
- `phases` son las fases que `nzt` eligió para esta corrida, **en el orden en que corren**,
  cada una con `name` (`analysis`, `architecture`, `ux`, `build`, `verify`, `ship`) y
  `status`, con los mismos cuatro valores que las unidades. Como máximo una en `doing`: es
  la fase actual, y no hay otro campo que la repita (D61). Una fase salteada no entra al
  array; su porqué va en el plan. Al escribir el plan, la primera fase queda en `doing`, y
  si el usuario cambia el plan, `phases` se reescribe.
- **Cada unidad vive dentro de su fase**, en `units` de esa fase, en el orden en que se
  ejecuta; no hay una lista de unidades aparte (D62). Una fase sin unidades todavía lleva
  `units` vacío. Los ids son únicos en todo el archivo, y la unidad que se ejecuta es la
  primera `todo` de la fase en `doing`.
- **Una corrida nueva reescribe el estado**: con todas las unidades en `done` o `dropped`,
  el pedido siguiente arranca su `goal`, sus `phases` y sus unidades, y lo de la corrida
  anterior sale del archivo. Lo que queda de ella está en git y, si cerró una feature, en
  `Docs/Product/history.md`. Los ids siguen la numeración, nunca vuelven a 1. Dentro de
  una corrida, una unidad `done` o `dropped` no se borra.
- **Cuando termina la última unidad de una fase, en la misma escritura del estado**, esa
  fase pasa a `done` y la siguiente a `doing`. Una fase que todavía no tiene unidades
  (el plan solo dibuja la forma de lo que viene) queda en `todo`; una que el usuario saca
  del plan, en `dropped`. Con la última unidad del plan terminada, todas quedan `done` o
  `dropped`.
- `approved` es el candado del freno principal: sin `true`, no se ejecuta nada.
- `notes` son, como mucho, tres frases cortas con lo que una sesión nueva necesita para
  retomar y que no es de ninguna unidad: un dato ya verificado, una restricción del entorno,
  una advertencia (commits sin push, un archivo que no se borra sin el ok del usuario). No
  son un log. El panel `nzt-state` las muestra como **Notas para retomar** (usuario,
  2026-10-15).
- `autonomy` registra la tanda autorizada (T22, D79): qué unidades se corren sin frenar y qué
  frenos se conservan igual. **Ausente o vacío significa acompañado**, que es el default.
  Se escribe cuando el usuario la selecciona, no cuando aprueba el plan, y siempre es una
  lista cerrada de ids.
- `delegation` es el modo de delegación del proyecto: `auto`, `ask` u `off` (D71). Ausente
  significa `ask`. Es la única clave que una corrida nueva conserva, y solo la cambia el
  usuario.
- **Grupos en paralelo (D84):** una unidad puede llevar `group` (el id de su grupo, `P1`…) y
  `model` (`small` o `main`; ausente es `main`, y sin `group` no va). Un grupo vive en una
  fase; varias unidades en `doing` solo si son del mismo grupo; con algún grupo, la raíz
  lleva `work_branch`. El método está en `nzt-plan` (`references/parallel.md`), y `state
  check` lo valida.
- Al retomar, el estado se reconcilia con las decisiones actuales del usuario y con lo que
  hay en disco. **La evidencia manda sobre los hechos; no sobre los acuerdos**: el disco
  corrige qué se hizo, no qué se había acordado hacer (13.9 #25).
- Todo en una línea. Si una unidad necesita un párrafo, es más de una unidad.
- **Se escribe para una sesión que no tiene nada de esta conversación** (D40). La prueba es
  literal: si retomar necesitara algo que solo existe en el chat —una decisión dicha en voz
  alta, dónde frenó de verdad una unidad, qué la traba—, va al archivo. El contexto se
  limpia; lo que no está acá, se perdió.
- Al arrancar una sesión, si existe, se lee **antes** de preguntar nada.
- El usuario lo edita a mano cuando quiere: reordenar, sacar unidades, cambiar el alcance.
- Se omite solo para trabajo de una sola unidad en un proyecto que todavía no tiene estado.

### Tramos (v2, D72 y D73)

Cuando el plan trabaja por tramos, la raíz lleva `slices` en lugar de `phases`, y cada
tramo lleva sus propias fases, cada una exactamente como una fase de v1:

```json
{
  "version": 2,
  "goal": "Cupones en el checkout — entrega 1",
  "cadence": "delivery",
  "slices": [
    { "id": "S1", "name": "Análisis de la entrega 1", "status": "done", "phases": [
      { "name": "analysis", "status": "done", "units": [
        { "id": 1, "do": "Spec F-003 con alcance, reglas e índice", "status": "done" },
        { "id": 2, "do": "US-001 Aplicar cupón", "status": "done" },
        { "id": 3, "do": "US-002 Cupón rechazado", "status": "done" } ] } ] },
    { "id": "S2", "name": "F-003 Cupones", "status": "doing", "phases": [
      { "name": "architecture", "status": "done", "units": [
        { "id": 4, "do": "Diseño técnico de F-003", "status": "done" } ] },
      { "name": "build", "status": "doing", "units": [
        { "id": 5, "do": "Construir US-001", "status": "done" },
        { "id": 6, "do": "Construir US-002", "status": "doing", "detail": "falta el cupón ya usado" } ] },
      { "name": "verify", "status": "todo", "units": [
        { "id": 7, "do": "QA de US-001 y US-002", "status": "todo" } ] } ] },
    { "id": "S3", "name": "Release de la entrega 1", "status": "todo", "phases": [
      { "name": "ship", "status": "todo", "units": [] } ] }
  ],
  "approved": true,
  "autonomy": { "units": [6, 7] },
  "waiting_on": null,
  "notes": []
}
```

- **Un estado con `phases` en la raíz es v1** y vale todo lo anterior: es un plan de un
  solo tramo. Con `slices`, `version` es `2`, y `phases` no aparece en la raíz.
- Un tramo tiene `id` (texto, único: `S1`, `S2`…), `name`, `status` con los cuatro valores,
  y `phases`. **Dentro de cada tramo valen las reglas de fases de arriba**: nombres de D69,
  en orden, sin repetir, a lo sumo una `doing`, y la que cierra pasa la siguiente a `doing`.
  Los ids de unidad son únicos en todo el archivo.
- A lo sumo un tramo en `doing`; la unidad en curso está en la fase `doing` de ese tramo.
  Cuando cierra la última fase de un tramo, en la misma escritura el tramo pasa a `done` y
  el siguiente a `doing`, con su primera fase en `doing`.
- **Qué es un tramo lo corta el plan** (D72, QT-01): por defecto una feature con sus fases;
  una historia o un par cuando conviene feedback más rápido. Lo de toda la corrida —el
  producto, el release— va en su propio tramo.
- `cadence`: `delivery`, `upfront` o `just-in-time` (D72), y dice cómo se cortaron los
  tramos: con `delivery`, el primer tramo es el análisis de la entrega y los siguientes no
  lo repiten. Ausente es `upfront`. Es del plan: una corrida nueva lo vuelve a decidir.
- Si el QA de un tramo falla, su unidad queda `done`, verify sigue `doing`, `waiting_on`
  nombra el tramo y el bug, y el lote frena. Autorizado el arreglo, `build` del tramo se
  reabre con esa unidad y verify vuelve a `todo` con una corrida nueva: el único caso en
  que una fase `done` vuelve atrás.

## 8. Artefactos en el proyecto destino

Tres lugares, separados por vida útil y por dueño: lo que es del producto vive en `Docs/`
de la raíz, ordenado por carpeta; lo que es de un componente vive en `Docs/` dentro del
componente; lo que es de una feature vive con su spec en `Plan/` (D57).

```
<proyecto>/
├─ Docs/                       # lo que sobrevive a cualquier feature (D57)
│  ├─ Product/
│  │  ├─ product.md            # de discovery, obligatorio, nombre fijo (D7, D56)
│  │  ├─ analysis.md           # entrevista de producto, append-only (D5)
│  │  └─ history.md            # log append-only de ciclos cerrados (D25)
│  ├─ Domain/
│  │  ├─ glossary.md           # de discovery, obligatorio y al día (D7, D56)
│  │  ├─ domain-model.md       # entidades, campos, agregados, su diagrama (D26)
│  │  └─ context-map.md        # contextos, dependencias y eventos — si hay más de uno (D26)
│  ├─ Architecture/
│  │  ├─ architecture.md       # componentes con su carpeta, límites, sistemas externos con su INT-NN (D10, D57)
│  │  ├─ architecture-decisions.md # log append-only de los QT-NN de producto (D41)
│  │  ├─ adr/ADR-NNN-<slug>.md # una decisión por archivo
│  │  ├─ rfc/RFC-NNN-<slug>.md # propuesta en discusión, a pedido (D35)
│  │  └─ tech-debt.md          # trabajo técnico diferido, con su impacto (D29)
│  ├─ Design/                  # antes UX/: un proyecto que ya la tiene la sigue usando (D89)
│  │  ├─ design-system.md · ui-components.md   # de nzt-design (D11, D89); marca y voz (D76)
│  │  └─ prototype/<slug>.html                 # prototipo conservado y mantenido, si el usuario lo eligió (D76)
│  ├─ Operations/
│  │  ├─ deployment.md         # entornos con su autorizador, pipeline, rollback (T16)
│  │  └─ releases.md           # log append-only de despliegues y rollbacks (T16)
│  └─ Manual/
│     ├─ <audiencia>.html      # el manual del usuario final, a pedido (D37)
│     └─ assets/               # sus imágenes, sacadas de la evidencia de verify
├─ <carpeta del componente>/   # su raíz, la que architecture.md declara, p. ej. Pedidos.Api/ (D60);
│  │                           # con un solo componente es la raíz del repo y este Docs/ es el de arriba
│  ├─ src/ · tests/            # sus proyectos de build y sus tests, adentro de la raíz
│  └─ Docs/Architecture/
│     └─ <área>-stack.md       # backend-stack.md, frontend-stack.md: obligatorio (6.1, D57)
└─ Plan/
   ├─ state.json               # plan + estado, actualizado por unidad
   ├─ prototype/<slug>.html    # prototipo de la entrega 1: al registrar lo aprendido, se borra o pasa a Docs/Design/prototype/ (D72, D76, D89)
   └─ specs/
      └─ F-NNN-<slug>/       # "<feature>" en el resto del documento (D6)
         ├─ spec.md            # transversal: alcance, reglas, NFR, índice de historias
         ├─ analysis.md        # entrevista append-only con sus Q-NN
         ├─ change.md          # propuesta de cambio, temporal: se fusiona y se borra (D28)
         ├─ stories/
         │  └─ US-NNN-<slug>.md  # criterios + cobertura por área y qa (D43)
         ├─ tech-design/       # diseño técnico de esta feature, ofrecido (D41, D47)
         │  ├─ design.md       # el presente: flujos, datos, fallos, contratos
         │  └─ decisions.md    # log append-only de sus QT-NN (D41)
         ├─ design/            # diseños de pantalla de esta feature; antes ux-ui/ (D47, D89)
         │  ├─ screen-<slug>.md    # una pantalla por archivo
         │  └─ screen-<slug>.html  # su mockup, a pedido
         └─ testing/
            ├─ README.md       # índice: última ejecución, bugs abiertos, huecos (T9)
            ├─ <historia>.md   # pruebas: casos, datos, esperado, obtenido
            ├─ performance.md  # medición que no es de una sola historia (D34)
            ├─ data/           # por historia: setup y teardown de cada escenario (D36)
            ├─ evidencias/     # por ejecución, referenciada desde la tabla
            └─ bugs/
               └─ BUG-NNN-<slug>.md   # un archivo por defecto (T10)
```

- **El avance se lee de los criterios de las historias, en un solo lugar** (T1). El índice
  de historias de `spec.md` **no lleva checkboxes**: sería una segunda fuente de verdad.
- Un criterio pasa a completo cuando todas sus áreas están verificadas **y** el usuario
  aprueba. Las áreas del proyecto son las que declaran sus documentos de stack (T3).
- **Cada criterio lleva un `CA-NN`** numerado dentro de su historia, que no se reusa ni se
  renumera; pantallas, escenarios y bugs lo citan como `US-NNN CA-NN` (D85).
- `analysis.md` es append‑only: las respuestas superadas se marcan, no se editan (13.2).
  Hay uno por altitud: el de producto en `Docs/Product/` y el de cada feature junto a su
  spec (D5).
- **Los datos de cada escenario son dos archivos, no una improvisación**: `data/<historia>/`
  lleva un script que los prepara y otro que borra exactamente lo que ese preparó, escritos
  con el plan y aprobados con él (D36). El mecanismo —API, SQL que corre el agente, SQL que
  corre la persona— lo elige el usuario una vez y vive en el opt-in `Test data` del
  documento de stack, no acá.
- Cada historia tiene su archivo de pruebas en `testing/`, escrito **antes** de ejecutarlas
  (casos + datos + resultado esperado) y completado **después** (resultado obtenido). Un
  reensayo **agrega** una ejecución fechada; nunca pisa la anterior (13.5 #17).
- El bug lo abre y lo cierra verify aunque lo arregle build, con tres estados: `pendiente`,
  `corregido pendiente de verificación`, `verificado` (T10).
- `tech-design/` es **ofrecido** por feature, con el criterio de D41; `design/` se crea con
  la primera pantalla que se diseña; `testing/` se crea cuando aporta. **Diseño técnico y
  diseño de pantalla nunca comparten carpeta** (D47). `README.md` de `testing/` es obligatorio desde la segunda historia con pruebas
  (T9).
- El inventario exacto de `Docs/` (nombres de archivo y cuándo se crea cada uno) lo define
  el router `nzt-architecture` en la fase 4, no el kernel. **Excepción: los documentos de
  diseño** — design system e inventario de componentes compartidos — los define y mantiene
  `nzt-design` (T13, D89). **Las carpetas las fija D57 y valen para todas las fases**: cada
  documento va en la carpeta de su tema, sin importar qué fase lo escribe.
- **El stack vive dentro de su componente**: `<carpeta>/Docs/Architecture/<área>-stack.md`,
  donde `<carpeta>` es la que `Docs/Architecture/architecture.md` declara para ese
  componente: **su raíz, la que contiene todo lo suyo (solution o manifiesto, `src/`,
  `tests/`), nunca la carpeta de un proyecto de build; con un solo componente, la raíz del
  repo** (D60). `architecture.md` es obligatorio desde el primer stack. Se escribe al diseñar el componente, aunque la carpeta todavía no exista: la
  ruta la fija arquitectura en ese mismo momento, y el resto del set encuentra el stack a
  partir de ella (D57).
- **Un documento del producto fuera de este orden se propone reordenar, nunca se mueve
  solo** (D57): el agente lo nombra, dice a dónde iría y espera la aprobación del usuario.
  Mientras tanto lo lee donde está.
- **Los dos logs append-only del proyecto son `Docs/Product/history.md` y
  `Docs/Operations/releases.md`**, y
  no se pisan: el primero es qué cambió el producto y por qué, una entrada por ciclo
  cerrado (D25); el segundo, qué se desplegó y cuándo (T16). Ninguno de los dos lleva
  checkboxes, y ninguno reemplaza al presente, que siempre vive en la spec.
- **`tech-debt.md` es el único documento con estado abierto/resuelto**, y aun así sin
  checkboxes: una entrada se mueve de sección (D29).
- **El manual del usuario final es el único artefacto que lee alguien de afuera del equipo**,
  vive en `Docs/Manual/`, es **a pedido** y **se arma al final de lo que se entrega, no
  mientras se construye**; desde que existe, cada cierre de feature lo pone al día como a
  cualquier otro documento (D37).
- **Los `QT-NN` tienen archivo propio y append-only: el log de decisiones técnicas** —
  `Docs/Architecture/architecture-decisions.md` a nivel producto, `tech-design/decisions.md`
  por feature—.
  El diseño es el presente y se reescribe; el log es la conversación que lo produjo y no se
  pisa: una respuesta superada se marca, nunca se edita. Los `QT-NN` del stack van al log de
  producto (D41, que supera esa parte de D27).

## 9. Estructura de este repositorio

Desde D98 la raíz tiene solo lo que vale para todo el repo o no se puede mover; cada producto
vive en su carpeta. Hoy hay uno, `nzt-software/`.

```
nzt-ai/
├─ .claude-plugin/
│  └─ marketplace.json          # Claude Code lo lee de acá: el plugin nzt-software y sus mods
├─ .github/workflows/
│  └─ nzt-software-release.yml  # puertas y release de nzt-software (D46); el único con --latest (D99)
├─ Plan/
│  ├─ state.json                # el estado NZT del trabajo en este repo
│  └─ specs/
│     ├─ nzt-core/              # esta spec: README.md (§1–11), decisions.md (§12), build-status.md (§14)
│     ├─ nzt-installer.md       # el instalador
│     ├─ nzt-plugin.md          # el plugin de Claude Code
│     ├─ nzt-mods.md            # qué es un mod y qué trae cada uno (D63)
│     ├─ mods/<mod>/            # la spec de cada mod (spec.md) y su mockup (mockup.html)
│     └─ testing/, nzt-brand.md, pendientes.md
├─ nzt-software/
│  ├─ method/
│  │  ├─ core/                  # kernel.md, skill-nzt.md y un adapter por host
│  │  ├─ skills/nzt/            # árbol anidado por cohesión (ver 4.3)
│  │  │  ├─ SKILL.md
│  │  │  ├─ <fase>/SKILL.md ... # cada carpeta con SKILL.md es una skill
│  │  │  └─ <fase>/references/  # las hojas de ese router (D50)
│  │  └─ agents/                # nzt-explorer y nzt-worker: .md para Claude Code, .toml para Codex
│  ├─ evals/                    # suite de disparo (D23): README, _fixtures/, <grupo>/<caso>/
│  ├─ mods/<mod>/               # los mods de Claude Code, opcionales (D63)
│  ├─ build/
│  │  └─ build.ps1 / build.sh   # loop de desarrollo: genera dist/ y valida el árbol
│  ├─ cli/                      # nzt-ai, el que instala de verdad (D24)
│  │  ├─ src/Nzt.Cli/           # consola .NET 10, contenido embebido
│  │  ├─ tests/Nzt.Cli.Checks/  # comprobaciones con destinos temporales
│  │  └─ install/               # install.ps1 / install.sh y variants.sh: los comandos de una línea
│  ├─ release/
│  │  ├─ plugin-README.md       # el README de la rama del plugin
│  │  └─ notes/vX.Y.Z.md        # las notas de cada release
│  ├─ presentation/             # el deck HTML de NZT
│  ├─ dist/                     # salida del build, ignorada: plugin/, claude-code/, codex/
│  └─ README.md                 # la guía de nzt-software
├─ README.md                    # índice: qué productos hay
└─ LICENSE
```

### 9.1 Anidado en el repo, plano en el proveedor

Claude Code y Codex **no soportan anidamiento**: cada skill es una carpeta directa dentro
de `skills/`. En este repo sí anidamos, porque el árbol expresa la relación router → hoja
y mantiene la cohesión. El instalador aplana:

- **Nombre de la skill** = path relativo a `skills/`, con `/` reemplazado por `-`.
  `skills/nzt/discovery/write-spec/` → `nzt-discovery-write-spec`.
- **Toda carpeta con un `SKILL.md` es una skill.** Las carpetas sin `SKILL.md` son
  agrupación pura y no generan nada.
- El `name` del frontmatter debe coincidir con el nombre derivado del path. El build lo
  valida y falla si no coincide: evita que el árbol y los nombres se desincronicen.
- Los archivos hermanos (`references/`, `assets/`) se copian dentro de la carpeta aplanada,
  manteniendo sus rutas relativas intactas.
- **`references/` es donde viven las hojas** (D50). El build les aplica el mismo tope de 200
  líneas que a una SKILL.md, y falla si una referencia no tiene fila en la tabla de su router.
- Instaladas, todas las skills son carpetas hermanas, así que un router lee la referencia de
  otro por ruta relativa: `../nzt-build/references/tests.md`.

### 9.2 Build e instalación

1. El build genera `CLAUDE.md` (kernel + adapter-claude) y `AGENTS.md` (kernel +
   adapter-codex). Ambos ≤ 200 líneas.
2. El instalador copia `skills/` **entero y global** (D18), al destino del proveedor elegido:
   - Claude Code: `~/.claude/skills/`
   - Codex CLI: `~/.agents/skills/`

   Los destinos por proyecto (`.claude/skills/`, `.agents/skills/`) existen en las dos
   plataformas y NZT **no los usa**: no hay instalación parcial ni capa opcional.
3. Escribe/parchea el archivo de instrucciones **global** de cada proveedor
   (`~/.claude/CLAUDE.md`, `$CODEX_HOME/AGENTS.md`), respetando el contenido previo: el
   bloque delimitado por `<!-- nzt:start -->` / `<!-- nzt:end -->` es lo único que NZT toca.
4. Un manifiesto por proveedor registra lo copiado, con hashes, para poder actualizar o
   desinstalar sin residuos y sin pisar lo que el usuario editó.

Lo hace el CLI de `installer/` (D24). El plugin de `dist/` existe sólo para que
`claude plugin eval` tenga un target (D23) y no se instala. En Claude Code hay además un
plugin para instalar, con el kernel dentro de la skill `nzt:nzt` (D91, D92, `specs/nzt-plugin.md`).

## 10. Reglas de autoría de las skills

Derivadas de las buenas prácticas publicadas por Anthropic y OpenAI:

1. **Un trabajo por skill.** Si necesita dos títulos, son dos skills.
2. **`description` = cuándo usarla, no qué es.** Empieza con "Use when…", es específica y
   levemente insistente (los modelos tienden a sub‑disparar las skills). ≤ 250 chars, y
   **apuntando a ~130 en una hoja y ~170 en un router** (D17). El techo es el límite, no el
   objetivo: la description es el disparador, no el resumen de la skill, y cada char que
   sobra se paga en el presupuesto de R1 multiplicado por todo el catálogo.
3. **Conciseness.** ≤ 200 líneas por archivo, **sin excepción** (D3), sea SKILL.md o
   referencia. Uno más largo deja de ser legible, que es el punto. Si no entra, **es más de
   un trabajo: se parte en dos hojas** (regla 1), que desde D50 son dos referencias, no dos
   skills.
4. **Instrucciones, no narrativa.** Decir qué hacer; no explicar por qué en tres párrafos.
5. **Frontmatter portable** (C1): solo `name` y `description`.
6. **Sin dependencias de agentes**: ninguna skill puede asumir subagentes ni forks. La
   única que los nombra es `nzt-delegate` (D71), y sin subagentes o sin `nzt-explorer`
   instalado manda a leer en la conversación principal: el trabajo es el mismo. **Desde
   D84** también los nombra la referencia de grupos de `nzt-plan`, y sin subagentes o sin
   `nzt-worker` el plan corre igual, una unidad tras otra.
7. **Grados de libertad**: prescribir el procedimiento, no el criterio técnico. NZT dice
   *cómo trabajar*, el modelo decide *qué construir*.
8. **El nombre lo dicta el path** (9.1). Todo cuelga de `skills/nzt/`, así que el prefijo
   `nzt-` sale solo y no colisiona con otras skills instaladas. Ubicar una skill en el
   árbol es una decisión de diseño: define su nombre y de qué router depende.
9. **Todo en inglés** (D2): `name`, `description`, cuerpo y referencias. Ninguna skill
   repite la regla de idioma de respuesta; esa vive sola en el kernel. **Desde D85**, una
   etiqueta que un artefacto escribe (el origen de una decisión, un modo, una regla de tono)
   se fija por **lo que significa**, y se escribe en el idioma del proyecto. Los
   identificadores (`[TO-DEFINE]`, `Q-NN`, `CA-NN`, los estados) no se traducen.
10. **Anti‑patrón a evitar:** el kernel convertido en manual. Todo lo que no se necesite en
   *toda* sesión, baja a una skill.
11. **Una hoja no lleva sección de *cuándo usarla*.** Quién decide cargarla es el ruteo —
   la tabla del kernel y la tabla de hojas de su router — y ese ruteo está **instruido, no
   librado al matching de `description`**. Una sección *when to use* dentro del cuerpo solo
   se puede leer cuando la skill ya está cargada, o sea cuando la decisión que explicaba ya
   se tomó. La hoja abre con **qué produce y cómo se hace**. Desde D50 tampoco lleva la línea
   de R2: una referencia solo se alcanza desde la tabla de su router.
12. **Referencias a un solo nivel** (D50). Una referencia **nunca manda a leer otra**: la
   nombra como mención, y es la tabla del router —columna *Read with*— la que dice qué se lee
   junto con qué. Si lo que hace falta es de otra skill, el router lo lee por su ruta.
13. **El archivo se llama como la hoja sin el prefijo de su router**
   (`nzt-build-backend-dotnet-ef-core-queries` → `build/backend/dotnet/references/ef-core-queries.md`),
   y **toda referencia tiene una fila en la tabla de su router**. Una referencia sin fila no
   la carga nadie. **La única excepción son las dos referencias índice de D58**
   (`practices-backend.md`, `practices-frontend.md`), que tienen las filas de la capa
   genérica para un stack sin router de área. D85 intentó pasarlas al router de build y lo
   revirtió (QT-13): el router se carga en toda unidad, y así cada área carga sólo su índice.
   Fuera de esas dos, ninguna referencia manda a leer otra. El build
   lo comprueba así (`build.sh` y `build.ps1`, vistos fallar con una referencia huérfana en
   la unidad 44).
14. **Una referencia de más de 100 líneas abre con `## Contents`**, la lista de sus
   secciones. Protege contra la lectura parcial (`head -100`) que documenta la guía de
   Anthropic. **Si con el índice pasa de 200, se parte** (la regla 3, no subir el techo):
   `<x>.md` sigue con el principio y `<x>-<parte>.md` lo continúa con un título propio, y la
   fila del router lee las dos. El script de migración compara la hoja vieja contra las
   partes juntas. Primer caso: `domain-ddd` (200 en `main`, 203 con índice), decidido por el
   usuario en la unidad 19.
15. **Una práctica vive en un solo nivel (D58).** Si vale fuera de la tecnología, está en
   la referencia genérica; si no, está en la de área. Nunca en las dos. **El vínculo va en una
   sola dirección**: la de área abre diciendo qué genérica presupone, y **la genérica no nombra
   ninguna tecnología ni referencia de área**, como el dominio no conoce la infraestructura.
   Si la nombrara, cada tecnología nueva obligaría a editar todas las genéricas, y el agente
   que la lee sin router de área recibiría un vínculo a algo que su stack no seleccionó. Qué
   referencias implementan un principio se encuentra por grep del nombre de la genérica.
   Decidido por el usuario el 2026-10-11, tras la unidad 54. Así, cambiar un principio no deja
   una copia vieja en otro lado. Recortar una
   referencia de área para extraer algo exige el chequeo de no-pérdida de D58 antes de dar la
   unidad por terminada.
16. **El disparador de una hoja vive en la cadena instruida, nunca en una descripción**
   (D53). Al mover una hoja, lo que su `description` decía que la disparaba tiene que estar
   cubierto en los tres eslabones: la fila del kernel que lleva a su router, el *hand off*
   de `nzt` cuando la petición entra por el punto de entrada, y la fila de la tabla del
   router que lleva a la referencia; si falta, se amplía el texto de esos eslabones. La descripción del
   router no se agranda para cubrirlo.
17. **Lo más genérica posible (D83).** Una skill o referencia se escribe para cualquier
   proyecto, stack y proveedor. Lo que solo vale para una tecnología, un host o un caso baja
   a la capa de stack, al adaptador o a un ejemplo marcado como tal; nunca al cuerpo de la
   regla. Antes de escribir algo específico, preguntarse si la versión genérica alcanza.
18. **Sin contenido redundante (D83).** Cada regla, formato o paso se dice en un solo
   archivo; los demás lo nombran por su ruta o su nombre, no lo copian ni lo parafrasean.
   Generaliza la regla 15 (entre niveles) y D65 (dentro del kernel) a todo el set. Si dos
   archivos necesitan lo mismo, se elige el dueño y el otro apunta.
19. **Fácil de mantener, con pasos simples (D83).** Un procedimiento son pasos numerados
   cortos, una acción verificable por paso, en el orden en que se hacen; sin pasos que
   escondan dos decisiones. Cambiar una regla debe tocar un solo archivo, y quien la lea por
   primera vez debe poder seguirla sin leer otra cosa que lo que su fila de ruteo carga.
20. **El router lleva lo que vale para toda unidad de su fase (D85).** Límites, tabla de
   referencias, dónde aterriza y las reglas transversales de la fase. Una regla que usa una
   sola referencia vive en esa referencia, y el router no la resume ni la repite en *Rules*,
   *Done when* o checklist. Es la regla 18 aplicada al router, que se carga en cada unidad.
21. **Un solo cierre por archivo (D85).** Routers y referencias de documento o de
   procedimiento cierran con *Done when*; la *Closing checklist* queda sólo en las
   referencias de práctica de código, cuyas reglas se verifican línea por línea. Ningún router
   lleva checklist. El índice de la regla 14 no cambia.
22. **Las copias que protegen a quien no ve el kernel son contadas (D85).** `nzt-worker` y
   `nzt-explorer` corren sin el kernel (`omitClaudeMd`). Por eso las dos líneas que resuelven
   un nombre `nzt-…` a su ruta se repiten en cada router que las usa, a propósito. Los bloques
   más largos (leer el stack primero, los dos escapes, cargar el router padre) viven en el
   router de build y en el archivo del worker, y los routers de área no los copian.
23. **Un dueño por regla entre el kernel y las skills (D85).** El kernel enuncia el
   invariante en una línea y nombra a la skill que tiene el procedimiento. Las reglas de
   parar, reconciliar el estado al reanudar, el esquema del estado y cómo preguntar viven en
   `nzt-plan` (el kernel conserva el formato visible de la pregunta y los frenos de toda
   tanda, que protegen el contexto); qué significa cada caso del estado al arrancar, el
   tamaño y la clasificación, en `nzt`; los documentos obligatorios de cada fase, en su
   router.
24. **Un pack lleva elecciones y errores, no documentación (QT-95).** Una regla de pack es
   lo que el usuario elige entre opciones válidas (method syntax, `[]`, `get; set;`) o un
   error que el agente comete sin ella. Lo que dice la documentación de la tecnología —qué
   hace un operador, qué API existe— sale: el agente lo sabe o lo consulta (`nzt-research`,
   el MCP del pack). Una regla que solo traduce una genérica a su API tampoco va.

## 11. Roadmap

| Fase | Entregable | Freno |
|---|---|---|
| 1 | Esta spec aprobada | ✅ |
| 2 | `core/kernel.md` + adapters + `CLAUDE.md`/`AGENTS.md` generados | ✅ |
| 3 | Router raíz `nzt` + `nzt-plan` (mínimo funcional end‑to‑end) | ✅ |
| 4 | Routers de fase (7) | ✅ |
| 5 | Hojas del modo construcción, de a una por unidad | ✅ |
| 6 | Evals: casos de disparo por skill, medición de sub/sobre‑disparo | suite escrita · **primera corrida hecha** (`kernel-loaded`) · falta el resto |
| 7 | Capa de stack: .NET 10 + Blazor, portada del set existente (4.5) | ✅ |
| 8 | Rama profesor: `nzt-learn` + 7 hojas (4.6) | ✅ |
| 9 | Medición de R1 con el catálogo completo en Codex | — |
| 10 | Instalador .NET 10 → `specs/nzt-installer.md` | ✅ construido · falta la instalación real |

Mientras tanto la instalación es manual, o con `install/build.*` + copia. El instalador
llega último a propósito: automatizar un catálogo que todavía cambia de forma es trabajo
que se tira.

> Esta spec está en tres archivos (D99): [README.md](README.md) (§1–11 y Fuentes, el
> diseño vigente) · [decisions.md](decisions.md) (§12, riesgos y decisiones D-NN) ·
> [build-status.md](build-status.md) (§14). Los números de sección son los de siempre; la §13,
> la revisión contra Temper v3, se retiró y queda en la historia de git (commit `f04b062`).

## Fuentes

- [Limitless (2011) — Plot, IMDb](https://www.imdb.com/title/tt1219289/plotsummary/)
- [Agent Skills authoring best practices — Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Extend Claude with skills — Claude Code Docs](https://code.claude.com/docs/en/skills)
- [How Claude remembers your project (CLAUDE.md) — Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Build skills — OpenAI / Codex](https://learn.chatgpt.com/docs/build-skills)
  (releída el 2026-09-16 por el modo de falla del presupuesto: *"this list uses at most 2%
  of the model's context window, or 8,000 characters when the context window is unknown"*,
  y al pasarse acorta descriptions primero y después omite skills con un warning — C2)
- [Test plugins with evals — Claude Code Docs](https://code.claude.com/docs/en/plugin-evals)
  (leída el 2026-09-17, y contrastada con `claude plugin eval --help` en la v2.1.274: es la
  evidencia de C6 y de D23 — formato de caso, graders, arm de ablación y workspace vacío)
- [Plugins reference — skills-directory plugins — Claude Code Docs](https://code.claude.com/docs/en/plugins-reference#skills-directory-plugins)
  (leída el 2026-09-17: el manifest obligatorio, el nombre `plugin:skill` y el matiz de C5
  sobre subcarpetas de skills adentro de un plugin)
- [Custom instructions with AGENTS.md — OpenAI / Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Agent Skills — Gemini CLI docs](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md)
  (verificada en esta ronda junto con las dos primeras: los tres proveedores implementan la
  carga en capas y las carpetas de apoyo; es la evidencia detrás de D4)
