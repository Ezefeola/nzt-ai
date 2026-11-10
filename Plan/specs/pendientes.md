# Pendientes después de la V5

Rama `pendientes-post-v5`, sacada de `main` (= `v5.0.0`, `fcdbb4f`) el 2026-11-07.
Ideas para atacar **de a una**, cada una en su rama cuando le toque. Nada de esto está decidido:
cuando el usuario decide un punto, pasa a `Plan/specs/nzt-core/decisions.md` como D-NN.

`revision-post-v5` se descarta: el alcance creció demasiado para revisarlo de una vez. Lo que
sirva de ahí se trae por partes.

## 1 · NZT trabaja con cualquier plugin o MCP, en cualquier fase

**Hecho en esta rama: D96** (`Plan/specs/nzt-core/decisions.md`, unidades 497–507). Sin packs, sin
`nzt-games` y sin `nzt-ai project`; el kernel tiene *Agent tools*, `nzt-research` tiene
`references/tools.md` y `tech.md` declara solo tecnologías y prácticas. Lo que sigue es lo que
se planteó antes de hacerlo.

**Qué quiere el usuario.** Que NZT deje usar cualquier herramienta del agente (MCP, plugin, o
ambos) y que el agente **ofrezca** la que necesita para trabajar mejor, en **cualquier fase**:
investigar, diseñar, construir, verificar, publicar. Es genérico: sirve para cualquier producto
y cualquier tecnología, no solo para software.

**Qué hay hoy en `main`.** Recomendar herramientas vive solo en el paso 4 de
`nzt-software/method/skills/nzt/architecture/references/tech.md` (*Prepare the work*, D89): atado a elegir
tecnologías y a los packs, y en un archivo que nace después de discovery. Ninguna skill dice
cuándo consultar la herramienta instalada ni qué gana si contradice una regla de NZT.

**Lo que ya se diseñó en `revision-post-v5`** (D96, commit `724284b`), a retomar:

- **El kernel tiene el *cuándo*.** Una sección *Agent tools*:
  - `Docs/agent-tools.md` lista los MCP y plugins del proyecto y para qué sirve cada uno.
  - Una herramienta dice cómo funciona una tecnología, hace el trabajo en ella (un editor, un
    canvas de diseño), o ambas. Si una fila cubre el trabajo de la unidad, se hace **a través
    de la herramienta**, no por fuera.
  - NZT y `Docs/` dicen lo que el proyecto decidió. Si una herramienta dice o hace otra cosa por
    defecto, gana la decisión, y se avisa. Lo que hizo una herramienta se comprueba como
    cualquier trabajo.
  - Una necesidad que se va a repetir y no tiene fila → se propone una herramienta. Una
    rechazada no se vuelve a proponer.
  - El guardrail de verificar en la fuente pasa a ser: *la herramienta que lista
    `Docs/agent-tools.md`; si no hay, `nzt-research`*.
- **`nzt-research`'s `references/tools.md` tiene el *cómo*:** mirar lo instalado (proyecto y
  usuario), investigar, proponer, instalar **en el proyecto** (lo global se propone pasarlo),
  registrar con *Use it for* y *Not for*, comprobar que responde, anotar los rechazos en
  *Declined*.
- **`Docs/agent-tools.md` se indexa por para qué sirve, no por fase.**

**Lo que se dejó afuera de D96 al traerlo:** que `tech.md` deje de nombrar packs (filas de
*Decision*) y el kernel más corto. Son cambios aparte; si se quieren, van como su propio punto.

**Lo que se vio en evals, ya resuelto:** el agente ofrecía `--scope user` como alternativa;
`tools.md` (paso 5) dice ahora que se instala en el proyecto, nunca global ni a nivel usuario.

## 2 · Revisar la estructura de carpetas del repositorio

**Hecho en esta rama: D98** (`Plan/specs/nzt-core/decisions.md`, unidades 516–524, tramo S3). Todo el
producto pasa a `nzt-software/` (`method/`, `evals/`, `mods/`, `build/`, `cli/` —borrado en
D100—, `release/`, `presentation/`), las specs a `Plan/specs/`, y `Plan/mejoras/` se borró. La raíz queda con el
marketplace, `.github/`, `Plan/`, el README índice y la licencia. El build sigue armando el mismo
plugin.

**Los dos puntos que dejó abiertos están hechos: D99** (unidades 525–529, tramo S4). La spec
fundacional está en `Plan/specs/nzt-core/` en tres archivos (eran cuatro; `temper-v3.md` se
borró después), y nzt-software publica sus
releases con `--latest`; un producto futuro usa tags `<producto>-vX.Y.Z` y `--latest=false`.

## 3 · Una sola forma de instalar: como plugin, en Claude Code y en Codex

**Hecho en esta rama: D100** (`Plan/specs/nzt-core/decisions.md`, unidades 530–535, tramo S5).
Se borró el CLI `nzt-ai` (`nzt-software/cli/`), con sus comandos de una línea y sus binarios
(QT-121). nzt-software se instala como plugin desde el marketplace del repo: en Claude Code
desde `.claude-plugin/marketplace.json`, en Codex desde `.agents/plugins/marketplace.json`. Un
solo adaptador (`adapter-plugin.md`), la versión en `nzt-software/VERSION`, y el release sin
assets. Quien tenía `nzt-ai` lo desinstala antes (notas de la v6.0.0).

**Queda abierto:** que en Codex `nzt-software:nzt` cargue primero no se probó en una sesión
(536 descartada por el usuario).

**La landing está hecha** en el repo `nzt-ai-landing`, rama `instalacion-plugin` (commit
`ed9c260`): explica solo la instalación como plugin. Falta mergearla, junto con el PR de esta
rama a `main`.

## 4 · Reglas de código genéricas, sin references por tecnología

**Sin decidir** (2026-11-10). El usuario quiere que `nzt-software:software` tenga solo las
reglas genéricas de código, sin `dotnet/`, `csharp/` ni `blazor/`, sin perder cómo sale hoy el
código y sin perder las preguntas de patrones (`choosing.md`). Análisis, evidencia de una
prueba de `nzt-method` y plan con medición (todas las references, solo genéricas con las
reglas subidas, solo genéricas como están) en `Plan/specs/reglas-genericas.md`.

## 5 · Dos plugins y los mods divididos por plugin

**Hecho el 2026-11-10, sin commit todavía** (decisiones del usuario; cuando se cierre, pasa a
`nzt-core/decisions.md` como D-NN):

- **Dos plugins en el marketplace `nzt`:** `nzt` (el método genérico, `nzt-method/`, rama
  `plugin-nzt`, tags `nzt-vX.Y.Z`) y `nzt-software` (rama `plugin-nzt-software`, tags
  `vX.Y.Z`). Detalle de `nzt` en `nzt-method/design/Idea.md`, pendiente 4.
- **Mods en `mods/`, en la raíz del repo**, fuera de `nzt-software/`. Un mod que solo sirve con
  un plugin lleva su nombre de prefijo: `nzt-state` pasa a **`nzt-software-state`** (carpeta,
  `plugin.json`, comando `/nzt-software-state`, spec en `Plan/specs/mods/nzt-software-state/`).
  Los generales quedan `nzt-*`. **`nzt-look` queda general** aunque su banda use las marcas
  30/40 del kernel de nzt-software. Regla en `Plan/specs/nzt-mods.md` sección 3. Los cuatro
  mods validan y pasan sus tests (64, 95, 142 y 230) y el build de nzt-software anda.
- **Quien ya tenía `nzt-state`** lo desinstala e instala `nzt-software-state`. Mover `mods/`
  fuera de `nzt-software/` hace que un cambio en un mod ya no corra las puertas de
  `nzt-software-release.yml` (tampoco probaban los mods).
- **Landing** (repo `nzt-ai-landing`, rama `instalacion-plugin`, sin commit): página nueva
  *Instalar nzt, el método genérico* (es y en), las de nzt-software la nombran, mods en dos
  grupos, `nzt-hub` fuera (retirado en M6) y búsqueda en las docs con Pagefind.

## Otras notas guardadas

- Hacer el núcleo genérico para cualquier producto quedó descartado por ahora, por complejo;
  el punto 1 es la parte que el usuario quiere conservar.
- `nzt-games` se borró en D96 (QT-114): NZT queda para software. Un juego futuro sería otro
  plugin entero, como `nzt-software`.
- **Hecho en esta rama: D97** (unidades 509–515, tramo S2). El plugin se llama
  `nzt-software` y dentro de él las skills y subagentes van sin prefijo
  (`nzt-software:build`); en el repo siguen siendo `nzt-<x>`. Versión 6.0.0, sin publicar.
  Desde D100 Codex también usa el plugin y `nzt-ai` ya no existe.
