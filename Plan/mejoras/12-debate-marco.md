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

## Cómo seguir

Retomar leyendo este archivo. Orden sugerido: DB-03 (es chico y concreto), DB-02 con la
prueba del juego de Unity, y DB-01 al final, porque lo que se decida en las otras dos cambia
cuánto pesa cada fase. Cada decisión se registra acá con fecha y la opción elegida, y la que
cambie el marco se planifica como unidades nuevas en `Plan/state.json`.
