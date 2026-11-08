# Investigación: métodos parecidos

Hecha el 2026-11-08 para responder lo que pide `Idea.md`: ver si BMAD-Method y métodos
parecidos son genéricos de verdad, qué toman de bueno y dónde se atan a un dominio. Lo que
sigue es lo que dicen las fuentes oficiales; cuando algo sale de una copia o de un tercero,
se aclara. Las conclusiones del final son *propuesta de Claude*.

## BMAD-Method

**Fuentes:** el README del repositorio oficial (`github.com/bmad-code-org/BMAD-METHOD`) y
la página oficial *Choose a planning path* (`docs.bmad-method.org`). Versión estable v6.12;
la v7 está en alfa en `main`, con cambios que rompen compatibilidad y salida anunciada para
mediados de noviembre de 2026.

**Qué es.** Un método para llevar una idea o un cambio hasta software funcionando. Su loop
tiene cuatro pasos: aclarar, planificar, construir y verificar, aprender y ajustar. Aprender
vuelve a planificar. Se entra por cualquier punto: una idea vaga empieza por aclarar, un
cambio chico va directo a construir.

**Cómo se dimensiona.** El proceso crece según el trabajo, en cuatro caminos:

| Camino | Qué lleva |
|---|---|
| Trivial | Nada: no hace falta BMAD |
| Una sesión | Directo a `bmad-build` |
| Tamaño épica | La épica se corta en historias, un build por historia, verificación de la épica y retro |
| Tamaño proyecto | Documentos compartidos de producto, UX y arquitectura primero, después épicas |

**Cómo mantiene el contexto.** Con archivos, no con memoria. Cada documento vive en su
carpeta `<tipo>-<slug>/` dentro de la iniciativa activa (por defecto `_bmad-output`), y al
lado tiene un `.memlog.md`. El orden de las historias está en `tickets.toml` y los planes de
build quedan junto a la épica. Las versiones anteriores usaban `sprint-status.yaml` y
`project-context.md` (esto último sale de guías de terceros, no de la página oficial).

**Roles.** Agentes con nombre y especialidad: analista (Mary), PM (John), PO (Sofia), UX,
arquitectura, desarrollo, testing. Puede haber discusiones entre varios agentes.

**¿Es genérico?** No. El núcleo es para software y lo dice así. Lo demás llega como
**módulos** aparte: Creative Intelligence Suite (pensamiento creativo, design thinking,
narrativa), Game Dev Studio (juegos en Unity, Unreal, Godot, Phaser) y BMad Builder (para
armar skills, workflows y agentes). En la v4 se llamaban *expansion packs* y el README decía
que el framework servía para cualquier dominio; había uno de escritura creativa con agentes
de trama y de personajes (esto sale de copias de la v4, no del repositorio oficial actual).
**El diseño es "núcleo de software + paquetes por dominio"**, no un núcleo genérico.

**Herramientas y MCPs.** Ninguna de las dos páginas los menciona. Se instala por npm, por
Skills CLI o como plugin de Claude Code y de Codex.

**Qué tiene de bueno.** Se entra por cualquier punto; el proceso se dimensiona solo; el
contexto vive en archivos con un registro por documento; un comando recomienda el próximo
paso; hay retro al cerrar una épica.

**Dónde se ata.** Las palabras de base (PRD, épica, historia, build, arquitectura, UX) y los
roles con nombre son de software. Para otro dominio hace falta otro módulo con otros agentes.

## GitHub Spec Kit

**Fuente:** el README del repositorio oficial (`github.com/github/spec-kit`).

**Qué es.** Una caja de herramientas para agentes de código: procesos, plantillas y
resultados documentados. Trae tres procesos listos:

- **Spec-Driven Development:** `constitution` → `specify` → `plan` → `tasks` → `implement`
  → `converge`, repitiendo los dos últimos hasta que `converge` diga `Converged`. Hay pasos
  opcionales de aclaración, checklist y análisis de consistencia.
- **Arreglo de bugs:** evaluar, arreglar, probar; termina en `verified`, `partial` o
  `failed`.
- **Evaluación de ideas:** intake, investigación, definición, forma, decisión; termina en
  `go`, `needs-clarification` o `kill`. **No necesita código.**

**Cómo mantiene el contexto.** En `.specify/`: `memory/`, `bugs/<slug>/`,
`assessments/<slug>/`. Las incógnitas se resuelven editando los Markdown existentes, no
volviendo a correr las etapas.

**Qué es obligatorio.** Casi nada: dice que los procesos son "entradas independientes, no
fases obligatorias". Se usa uno, se combinan o se arma uno propio.

**Herramientas.** No menciona MCPs. Tiene un sistema de extensión amplio: integraciones con
cada agente, extensiones (comandos, *quality gates*, procesos, conexión con servicios
externos), *hooks* antes y después de cada comando, *presets* que cambian plantillas y
**terminología**, workflows, bundles y catálogos. Avisa que lo del catálogo no está auditado
y que hay que revisar el código antes de instalar.

**Qué tiene de bueno.** Los procesos como piezas sueltas; cada uno termina en un **veredicto
explícito** (`verified`/`partial`/`failed`, `go`/`kill`); la *constitution* como reglas del
proyecto; los presets que cambian el vocabulario, que es justo el problema de adaptarse a un
dominio sin nombrarlo.

**Dónde se ata.** Los tres procesos son de software, salvo el de ideas. Las extensiones son
para agentes de código.

## Agent OS (Builder Methods)

**Fuentes:** `buildermethods.com/agent-os` (v3) y la documentación de la v2. Partes vienen
de los resultados de búsqueda y de una reseña de terceros (CodeMySpec), que se marca como
opinión.

**Qué es.** En la v3, una capa liviana que descubre los estándares de un código existente,
los documenta y los inyecta en el contexto del agente cuando hacen falta. Todo es Markdown en
`agent-os/`, así que cualquier agente lo lee.

**Capas de contexto (v2):** estándares (cómo se construye), producto (qué y para qué:
misión, roadmap, stack) y specs (qué se construye después: requisitos, referencias visuales,
detalle técnico, tareas y **criterios de verificación**). El loop es descubrir → inyectar →
construir → refinar.

**Qué cambió en la v3.** Dejó de escribir specs: usa el *Plan Mode* del agente y solo agrega
`/shape-spec`, que hace preguntas atadas a los estándares y a la misión y guarda el plan.
Según la reseña, ahora es sobre todo una capa de estándares.

**Herramientas.** No menciona MCPs.

**Qué tiene de bueno.** Separar el contexto en "cómo se hace", "qué y para qué" y "qué
sigue"; inyectar solo lo que la tarea necesita; **apoyarse en lo que el agente ya trae**
(Plan Mode) en vez de duplicarlo.

**Dónde se ata.** Todo es sobre código: estándares sacados del código, stack técnico.

## Shape Up (Basecamp)

**Fuente:** el libro oficial en `basecamp.com/shapeup` (introducción e índice; el detalle de
los capítulos sale del glosario y los títulos).

**Qué es.** Un método de producto para equipos, **no para agentes**. Se incluye porque sus
ideas de fondo no dependen de la herramienta.

**Ideas centrales.** Ciclos de seis semanas con dos de enfriamiento; **dar forma** antes de
comprometerse (resolver los agujeros de antes); **apetito** en vez de estimación (cuánto vale
la idea, no cuánto tarda); **tiempo fijo, alcance variable**, con lo prescindible marcado
para recortar; un **cortacircuitos** (lo que no termina no se extiende solo); el **gráfico de
colina** (cuesta arriba quedan incógnitas, cuesta abajo solo falta hacer).

**Qué es de software y qué es general.** Lo de software: Basecamp como herramienta, equipos
de diseño y programación, bocetos de interfaz. Lo general: apetito, tiempo fijo con alcance
variable, apostar a algo acotado, cortacircuitos, sacar el riesgo antes de comprometerse. El
propio libro separa "verdades básicas" de "prácticas específicas".

## Comparación

| | BMAD | Spec Kit | Agent OS | Shape Up | `nzt-software` |
|---|---|---|---|---|---|
| Núcleo genérico | No: software + módulos | No, salvo evaluar ideas | No | Ideas sí, prácticas no | No |
| Nada obligatorio | Sí: se entra por cualquier punto | Sí: procesos sueltos | Sí | No: ciclo fijo | Tres tamaños |
| Contexto entre sesiones | Archivos + `.memlog.md` + `tickets.toml` | `.specify/` | `agent-os/` | No aplica | `Plan/state.json` |
| Verificación explícita | Verificar la épica | Veredicto por proceso | Criterios en la spec (v2) | No aplica | Verify + reportar lo que pasó |
| Adaptación a un dominio | Módulo con agentes propios | Presets de terminología | No | No | Reglas de `nzt-software` |
| Herramientas / MCPs | No dice | Extensiones; revisar antes de instalar | No dice | No aplica | Propone con fuente, instala con un sí |

## Conclusiones (*propuesta de Claude*)

1. **Lo que dijo el usuario se confirma:** ninguno es genérico. BMAD es el que más se acerca,
   pero por suma de módulos con agentes de cada dominio, no por un núcleo que no nombre
   ninguno. Hay espacio para lo que se busca.
2. **Lo que se repite en todos** y parece ser el núcleo de verdad: dimensionar el proceso al
   trabajo; guardar el contexto en archivos legibles, no en memoria; separar "qué y para qué"
   de "cómo se hace" y de "qué sigue"; terminar cada pieza en un veredicto o una parada.
3. **Ideas para tomar:**
   - de BMAD, **entrar por cualquier punto** y que el método **recomiende el próximo paso**;
   - de Spec Kit, **procesos sueltos** en vez de fases, el **veredicto explícito** al final
     de cada uno, y que el **vocabulario de un dominio sea una capa intercambiable**;
   - de Agent OS, **inyectar solo lo que la tarea necesita** y **no duplicar lo que el
     agente ya trae** (Plan Mode, tareas, memoria);
   - de Shape Up, **apetito** (cuánto vale esto) y **tiempo fijo con alcance variable**,
     que sirven para cualquier dominio y le dan al "ágil" algo concreto.
4. **Sobre herramientas, ninguno resuelve lo que pidió el usuario.** BMAD y Agent OS no
   hablan de MCPs; Spec Kit tiene extensiones pero las elige la persona. Que el agente
   **detecte qué le falta al trabajo y pregunte antes de investigar** sería propio de este
   método. Lo más cercano es lo que ya hace `nzt-software` (D96), con la pregunta previa que
   pidió el usuario.
5. **Riesgo a evitar, visto en BMAD:** los roles con nombre (analista, PM, PO) y los
   documentos de software (PRD, épica) son lo que lo ata. Un método genérico no debería
   traer roles ni tipos de documento fijos: que los proponga el agente según el trabajo, o
   que lleguen de una capa de dominio.

## Fuentes

- BMAD-Method, repositorio oficial: <https://github.com/bmad-code-org/BMAD-METHOD>
- BMAD-Method, *Choose a planning path*: <https://docs.bmad-method.org/plan/choose-a-planning-path/>
- BMAD v4 README (copia en npm, no oficial): <https://cdn.jsdelivr.net/npm/@ptnglobal/bmad-method@4.43.1/README.md>
- GitHub Spec Kit: <https://github.com/github/spec-kit>
- Agent OS: <https://buildermethods.com/agent-os> y <https://buildermethods.com/agent-os/v2>
- Reseña de Agent OS (terceros): <https://codemyspec.com/blog/agent-os-review>
- Shape Up: <https://basecamp.com/shapeup/0.3-chapter-01>
