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

**Pendiente de D96, ya visto:** en evals, el agente ofreció `--scope user` como alternativa;
`tools.md` tiene que decir que nunca se ofrece alcance de usuario.

## 2 · Revisar la estructura de carpetas del repositorio

**Hecho en esta rama: D98** (`Plan/specs/nzt-core/decisions.md`, unidades 516–524, tramo S3). Todo el
producto pasa a `nzt-software/` (`method/`, `evals/`, `mods/`, `build/`, `cli/`, `release/`,
`presentation/`), las specs a `Plan/specs/`, y `Plan/mejoras/` se borró. La raíz queda con el
marketplace, `.github/`, `Plan/`, el README índice y la licencia. El build sigue armando el mismo
plugin.

**Los dos puntos que dejó abiertos están hechos: D99** (unidades 525–529, tramo S4). La spec
fundacional está en `Plan/specs/nzt-core/` en cuatro archivos, y nzt-software publica sus
releases con `--latest`; un producto futuro usa tags `<producto>-vX.Y.Z` y `--latest=false`.

## 3 · Una sola forma de instalar: como plugin, en Claude Code y en Codex

**Hecho en esta rama: D100** (`Plan/specs/nzt-core/decisions.md`, unidades 530–535, tramo S5).
Se borró el CLI `nzt-ai` (`nzt-software/cli/`), con sus comandos de una línea y sus binarios
(QT-121). nzt-software se instala como plugin desde el marketplace del repo: en Claude Code
desde `.claude-plugin/marketplace.json`, en Codex desde `.agents/plugins/marketplace.json`. Un
solo adaptador (`adapter-plugin.md`), la versión en `nzt-software/VERSION`, y el release sin
assets. Quien tenía `nzt-ai` lo desinstala antes (notas de la v6.0.0).

**Queda abierto:** que en Codex `nzt-software:nzt` cargue primero no se probó en una sesión
(536 descartada por el usuario). Después: la landing (repo `nzt-ai-landing`) tiene que explicar
solo la instalación como plugin.

## Otras notas guardadas

- Hacer el núcleo genérico para cualquier producto quedó descartado por ahora, por complejo;
  el punto 1 es la parte que el usuario quiere conservar.
- `nzt-games` se borró en D96 (QT-114): NZT queda para software. Un juego futuro sería otro
  plugin entero, como `nzt-software`.
- **Hecho en esta rama: D97** (unidades 509–515, tramo S2). El plugin se llama
  `nzt-software` y dentro de él las skills y subagentes van sin prefijo
  (`nzt-software:build`); en el repo siguen siendo `nzt-<x>`. Versión 6.0.0, sin publicar.
  Desde D100 Codex también usa el plugin y `nzt-ai` ya no existe.
