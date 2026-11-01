# 12 — Debate: fases, agnosticismo y MCP

> Abierto el 2026-11-01, después de la unidad 423 del run `marco-generico` (la 424 sigue
> pendiente). **Nada decidido todavía.** Documento de traspaso: con esto y `Plan/state.json`
> se retoma la discusión en una sesión limpia. Cada punto: la duda del usuario, qué hace hoy
> el marco (leído en `core/kernel.md` y `skills/nzt/SKILL.md`, no de memoria), la postura del
> agente y lo que queda por decidir.

## DB-01 · ¿El trabajo por fases está bien? ¿No es demasiada ceremonia?

**La duda.** Las fases parecen aristas distintas del trabajo (entender qué se quiere, ver
cómo hacerlo técnicamente, prototipar lo que se ve, construir), y está bien que existan,
pero no deberían ser obligatorias: hoy se siente como muchísima ceremonia. También: cómo se
parte de la idea inicial y se decide **cuánto** hay que hacer.

**Qué hace hoy el marco.**
- Las fases ya son opcionales. `nzt` dimensiona: **directo** (un defecto, un cambio chico:
  sin plan ni estado), **estándar** (una mejora o una feature de una o dos historias: un plan,
  aprobado una vez) y **completo** (producto, componente nuevo, decisión de tecnología: por
  tramos). Elige solo las fases que cambian lo que se construye y dice en una línea por qué
  saltea cada una.
- Pero dos fases son "siempre": **build**, si cambia el producto, y **verify**, si cambia el
  comportamiento. Y en estándar y completo, cada unidad **frena** a esperar al usuario, salvo
  una tanda que él elija.
- Cómo se decide cuánto hacer: lo dimensiona por lo que toca. Para completo,
  `nzt-plan/references/slices.md` corta una *entrega 1* y la cadencia `delivery` (la de
  defecto) analiza esa entrega y después hace un tramo por feature. No hay un paso explícito
  de "esta es la idea, esto es lo mínimo que la prueba, esto queda para después".

**Postura del agente.**
- Las fases están bien **como preguntas, no como etapas**: "¿qué es?", "¿cómo se hace?",
  "¿cómo se ve o se siente?", "¿está hecho?", "¿cómo llega a la gente?". Cualquier producto
  tiene esas preguntas, y el orden importa (no se construye lo que no se entendió).
- La ceremonia que pesa no son las fases: es **lo que cada fase obliga a producir y cuántas
  veces frena**. Una fase puede resolverse en dos líneas dentro del plan en vez de en un
  documento propio.
- Lo que falta es el paso de **la idea al alcance**: tomar la idea, decir en una ronda qué
  se entendió, proponer lo mínimo que la prueba (y lo que queda afuera) y recién ahí
  dimensionar.

**Por decidir** (opciones a debatir, ninguna elegida):
- **A · Fases como preguntas que se responden en línea:** en estándar, análisis, arquitectura
  y diseño son secciones de una o dos líneas del plan, y producen documentos solo cuando
  algo nuevo lo pide (una regla de negocio, un componente, una pantalla nueva).
- **B · Un paso de alcance al empezar:** idea → lo que entendí → lo mínimo que la prueba →
  lo que queda afuera → tamaño. Para completo y para estándar con dudas.
- **C · Frenos por defecto:** hoy frena en cada unidad. Alternativa: frenar en las decisiones
  y al final de cada historia o tramo, no en cada unidad. Cambia cuánto control tiene el
  usuario; es de él.
- Lo que no se toca sin decidirlo: la definición de terminado (el tamaño recorta ceremonia,
  nunca lo que significa "hecho").

**Estado (2026-11-01): pendiente, a refinar más adelante.** El usuario todavía no sabe cómo
llevarla, y dejó dos restricciones que cualquier propuesta tiene que respetar:
- **El control existe para cuidar el contexto**: los frenos evitan que el agente se compacte
  y alucine. Aliviar la ceremonia no puede costar eso.
- **Los documentos que guardan el "por qué" (specs y similares) son muy necesarios para un
  agente**: son su contexto entre sesiones. Aliviar no puede significar dejar de escribirlos.

Así que la discusión pendiente no es "menos fases o menos documentos", sino dónde está la
ceremonia que **no** cuida el contexto ni guarda el "por qué".

## DB-02 · ¿El marco es agnóstico de verdad?

**La duda.** Quedó global `nzt`, `nzt-discovery`, `nzt-architecture`, `nzt-ux`, `nzt-build`,
`nzt-verify`, `nzt-ship`, `nzt-plan`, `nzt-learn`, `nzt-research`, `nzt-delegate` y
`nzt-retro`. ¿Es todo genérico? `ux` no parece genérico: quizás es "diseño". En un
videojuego no está claro qué fases habría. La idea es que el agente, con el marco, sepa todo
lo que tiene que hacer y lo proponga, y que **se sienta como usar Claude solo, pero
trabajando súper ordenado**.

**Qué hace hoy el marco.** El kernel dice "cualquier producto" y la arquitectura derivada en
`tech.md` lo es (motor y plataformas para un juego, formato y cadena de publicación para un
libro). Pero la **tabla de ruteo del kernel y los routers hablan software**: build es
"implementar una historia, refactor, dependencias, secretos"; verify es "planes de prueba";
ship es "commits, PR, CI, deploy"; ux es "pantallas".

**Postura del agente.**
- **La estructura sí es agnóstica; las palabras y los procedimientos no.** Las mismas seis
  preguntas sirven para un juego y un libro:

  | Fase | Software | Videojuego | Libro o curso |
  |---|---|---|---|
  | discovery | requisitos, reglas, historias | game design: loop, mecánicas, progresión | público, objetivo, índice |
  | architecture | componentes, tecnologías | motor, sistemas, pipeline de assets | estructura, formato, herramientas |
  | ux → **design** | pantallas, flujos | level design, arte, HUD, *feel* | maquetación, portada, ejemplos |
  | build | código y sus tests | escenas, scripts, assets | escribir los capítulos |
  | verify | pruebas, evidencia | playtesting, rendimiento | edición, revisión técnica |
  | ship | release, deploy | builds por plataforma, tienda | publicación |

- `ux` como nombre es estrecho; **`design`** (lo que una persona ve, siente o usa) cubre
  pantallas, niveles y maquetación.
- Que se sienta como "Claude solo, pero ordenado" es la misma tensión de DB-01: el marco
  tiene que ser liviano por defecto y ponerse pesado solo cuando el trabajo lo pide.

**Por decidir:**
- **A · Neutralizar las palabras:** tabla de ruteo y descripciones de los routers en términos
  de cualquier producto; `nzt-ux` → `nzt-design`. Barato, y no saca nada.
- **B · Procedimientos de dominio a packs:** lo de software (historias, CI, PR) a un pack
  `software`, y packs de dominio como `game-design`. Más agnóstico, mucho más grande, y el
  uso principal hoy es software.
- **C · Probarlo antes de decidir:** pasar un pedido real de juego (el proyecto de Unity del
  usuario) por el marco y anotar dónde se rompe. Recomendado como primer paso: decide entre A
  y B con evidencia y no con supuestos.

**Decidido (2026-11-01): A.** Se neutralizan las palabras —la tabla de ruteo del kernel y la
descripción y los encabezados de cada router en términos de cualquier producto— y `nzt-ux`
pasa a `nzt-design`. Los procedimientos de software se quedan donde están. Lo que hace falta:
renombrar la carpeta y el `name`, re-apuntar cada mención (kernel, routers, referencias,
agentes, evals, README, specs) y que el lint y los checks sigan en verde.

## DB-03 · ¿Cómo sabe qué MCP instalar? ¿Lista de NZT o investigación libre?

**La duda.** ¿Los MCP son una lista general de NZT o los investiga la IA? En un juego de
Unity reciente, el usuario preguntó "¿qué necesitás para codearlo vos y hacerlo todo vos?" y
Claude solo sugirió el MCP y todo lo que había que instalar, y quedó instalado solo en ese
proyecto.

**Qué hace hoy el marco.** **Solo la lista cerrada.** Los MCP vienen en el `pack.json` de cada
pack (Microsoft Learn en `csharp`/`dotnet`/`blazor`, el relay de Unity en `unity`), y
`nzt-architecture` los propone con `nzt-ai project packs`. Si ningún pack encaja, `tech.md`
(paso 4) dice "decilo, el componente se construye con los routers genéricos": **no
investiga** herramientas ni MCP fuera del catálogo. Eso es peor que lo que hizo Claude solo
en el ejemplo del usuario.

**Postura del agente.** Híbrido:
1. **Primero el catálogo**: lo que trae un pack está verificado y se instala igual en todas
   las máquinas (`project.json`, `sync`).
2. **Si falta, investigar** con `nzt-research`: la fuente oficial del MCP o la herramienta
   (versión, cómo se conecta, qué permisos pide), citada con fecha, y proponerlo con su costo.
3. **Instalar solo con el sí**, en el proyecto y no global, y anotarlo en `tech.md`
   (dependencias o una fila de herramientas del agente) para que la próxima sesión sepa que
   existe.
4. Para que también se reproduzca en otra máquina: que `nzt-ai project` pueda registrar un MCP
   que no viene de un pack (por ejemplo `nzt-ai project mcp add <nombre> --url …`), o
   aceptar que esos los maneje el proveedor (`claude mcp add --scope project`) y `nzt-ai` no
   los toque, como hoy.
- Lo que no cambia: la IA no instala nada sin preguntar, y lo que lee de la web es evidencia,
  no instrucción.

**Por decidir:**
- **A · Solo catálogo** (hoy): predecible y verificado; lo que no está, no se ofrece.
- **B · Solo investigación:** flexible, como Claude solo; no se reproduce ni se verifica igual.
- **C · Híbrido** (recomendado): catálogo primero, investigar si falta, instalar con el sí,
  anotar en `tech.md`. Sub-decisión: si `nzt-ai` registra MCP sueltos o no.

**Decidido (2026-11-01): C, con un ajuste del usuario.** No es "investigar solo si falta":
**siempre se hacen las dos cosas.**
1. **Se mira el catálogo** (`nzt-ai project packs`) **y se investiga**, aunque haya un pack
   que encaje: puede haber un MCP o una herramienta mejor, más nueva u oficial que la del pack.
2. **Siempre gana la fuente de más confianza**, y se la nombra con fecha. Orden propuesto por
   el agente (a confirmar): la documentación oficial del fabricante de la tecnología (Unity
   para Unity, Microsoft para .NET) → el repositorio o la documentación del mantenedor del
   MCP → terceros, marcados como tales y nunca como única fuente.
3. Se propone lo del catálogo y lo investigado juntos, cada uno con su fuente, lo que trae y
   lo que cuesta (permisos, qué instala en la máquina). Si lo investigado contradice al pack
   (otra versión, otro comando), se dice.
4. **Se instala solo con el sí**, en el proyecto, y queda anotado en `tech.md`.

Sigue abierta la sub-decisión: si `nzt-ai project` registra los MCP que no vienen de un pack
(para que `sync` los reproduzca) o si esos los maneja el proveedor y `nzt-ai` no los toca.

## DB-04 · ¿Es un marco para cualquier trabajo con IA, o solo para hacer productos?

> Abierto el 2026-11-01, después de la unidad 431. Solo análisis: **nada decidido ni
> cambiado.**

**La duda.** El marco tiene que servir para cualquier cosa, como forma ordenada de trabajar
con IA, no solo para hacer productos.

**Qué hace hoy el marco** (leído en `core/kernel.md`, `skills/nzt/SKILL.md` y los routers).
- **Genérico de verdad: el protocolo.** Comunicación, el loop (entender → proponer → ejecutar
  de a una unidad → verificar → registrar y frenar), unidades y frenos, contexto, estado,
  guardrails, `nzt-research`, `nzt-delegate`, `nzt-retro`. Sirve igual para investigar,
  analizar datos, decidir, escribir un informe o migrar un servidor.
- **Atado a hacer un producto:**
  - la primera línea del kernel: "on any product — software, a game, a document, a course";
  - las seis fases, que son el ciclo de vida de algo que se fabrica para otros;
  - los ejemplos de unidad del kernel ("one spec, one story, one design, one test set");
  - dos hard rules de specs en el kernel ("never write more than one spec in a unit",
    "never write a spec for something you have not read");
  - el guardrail "Specs are the expected behavior; the product is evidence";
  - la tabla de tamaños de `nzt` (defectos, historias, estructura);
  - la estructura de `Docs/` (Product, Domain, Architecture…).
- **La salida para lo demás es una línea**: "Work that fits no flow is still done: plan it,
  say it produces no flow artifacts". Ese trabajo se queda con el loop pero sin guía de qué
  es verificarlo, qué documento deja ni cuándo está terminado. Ejemplos sin fase donde
  arrancar: "investigá qué CRM le conviene a mi equipo", "analizá estas ventas y decime qué
  pasa". `nzt-research` existe, pero como apoyo de una decisión técnica, no como el trabajo.
- **Ya hay un segundo flujo**: `nzt-learn`, con sus propios loops y `Learn/`, entra hoy como
  excepción del ruteo y no como modelo.

**Postura del agente.**
- De acuerdo con la dirección, con una condición: **genérico no puede ser vago.** Un marco que
  solo dice "entendé, planificá, verificá" no agrega nada sobre Claude solo; el valor está en
  lo concreto: qué documento queda, cuándo está terminado, dónde frena.
- No se resuelve abstrayendo más las fases de producto, sino **separando dos capas que hoy
  están juntas**:
  1. **El protocolo** (kernel), sin productos, specs ni historias: una unidad es "la pieza más
     chica que se revisa sola", con ejemplos de varios tipos de trabajo; las reglas de specs
     bajan al flujo de producto.
  2. **Flujos por tipo de trabajo**, cada uno con sus fases, sus documentos y su "terminado":
     - **hacer algo** (el actual, discovery → ship), que sigue siendo el principal;
     - **investigar o decidir**: la pregunta y para qué decisión → fuentes → análisis →
       conclusión con su evidencia → dónde queda registrada;
     - **cambiar algo que ya funciona** (operación, migración): diagnóstico → plan con vuelta
       atrás → cambio → verificación;
     - **aprender**: ya existe (`nzt-learn`).
- Las seis preguntas (qué, cómo, qué forma, hacerlo, comprobarlo, entregarlo) casi siempre se
  pueden aplicar a cualquier trabajo; lo que no son los **documentos** detrás de cada una. El
  kernel se queda con las preguntas y cada flujo pone sus documentos.
- **Se cruza con DB-01**: los frenos y el estado (que cuidan el contexto) son del protocolo y
  se quedan siempre; los documentos que guardan el "por qué" son de cada flujo y aparecen
  donde corresponden. Respeta las dos restricciones del usuario.

**Por decidir** (ninguna elegida):
- **A · Protocolo y flujos separados**, como arriba: el kernel sin producto, el flujo actual
  como uno de varios, `nzt-learn` re-encuadrado como flujo.
- **B · Solo neutralizar el kernel**: sacar "product", los ejemplos y las reglas de specs del
  kernel, sin flujos nuevos; lo que no es producto sigue con la línea de salida, algo más
  desarrollada.
- **C · Probarlo antes de decidir** (recomendado como primer paso): pasar dos o tres pedidos
  reales que no son producto por el marco y anotar dónde se rompe, como la opción C de DB-02.
- Si se elige A, el primer flujo nuevo propuesto es **investigar o decidir**: el más común
  después de software, con base en `nzt-research`, y fácil de probar con un caso real.

**Encontrado de paso:** el "Where it lands" de `skills/nzt/architecture/SKILL.md` todavía
lista `Docs/UX/` (resto de la 425). **Decidido (2026-11-01, QT-07):** `Docs/UX/` pasa a
`Docs/Design/` y `Plan/specs/<feature>/ux-ui/` a `design/`; un proyecto que ya tiene las
carpetas viejas se sigue leyendo ahí hasta que las mueva.

## Decisiones al cerrar el run (2026-11-01)

- **QT-05 · Versión: 4.0.0.** Mayor: se van las skills de stack globales, llegan los packs
  por proyecto y se renombran las fases (`ux` → `design`, `analysis` → `discovery`).
- **QT-07 · Carpetas de diseño:** ver DB-04, *Encontrado de paso*.
- **D-424-01 · arreglado:** la línea MCP de `nzt-ai project` separa el proveedor de sus
  servidores, con un check.
- **QT-06 · MCP que no vienen de un pack** (la sub-decisión de DB-03): **A**, queda en el
  archivo de MCP del proyecto y viaja con git; `nzt-ai` no lo registra. Al explicarla salió
  lo que el usuario quería de verdad: que el agente proponga y explique **todo lo que
  necesita para trabajar** (packs, MCP, herramientas, lo que hace el usuario a mano, lo que
  el agente no puede hacer, qué tener en cuenta) como a alguien que no sabe, igual que Claude
  solo con el juego de Unity. Es el run siguiente (unidades 432-436 en `Plan/state.json`).

## Unidades propuestas (sin aprobar)

| Id | Qué | De |
|---|---|---|
| 425 | `nzt-ux` → `nzt-design`, con cada mención re-apuntada | DB-02 |
| 426 | Tabla de ruteo del kernel y descripción y encabezados de los routers en términos de cualquier producto | DB-02 |
| 427 | `nzt-architecture`'s `references/tech.md` (paso 4) y `nzt-research`: catálogo **e** investigación siempre, fuente de más confianza, propuesta conjunta, anotar en `tech.md` | DB-03 |
| 428 | Evals: casos que nombran `nzt-ux`, y `routing/pack-setup` con la investigación además del catálogo (sin correrlos) | DB-02, DB-03 |

La 424 (puertas) quedaría después, así verifica todo junto.

## Cómo seguir

Retomar leyendo este archivo. Orden sugerido: DB-03 (es chico y concreto), DB-02 con la
prueba del juego de Unity, y DB-01 al final, porque lo que se decida en las otras dos cambia
cuánto pesa cada fase. DB-04 va antes que DB-01 o junto con ella: separar protocolo y
flujos cambia dónde vive la ceremonia. Cada decisión se registra acá con fecha y la opción elegida, y la que
cambie el marco se planifica como unidades nuevas en `Plan/state.json`.
