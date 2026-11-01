# 11 — Marco genérico, packs por proyecto y `nzt-ai project`

> Run `marco-generico` · rama `refactor-marco-generico` (desde `main`; avance en `060f691`) ·
> 2026-11-01. El contenido viejo está en `a31db74` (donde abajo dice `HEAD:`, leer `a31db74:`). Documento de traspaso: con esto y `Plan/state.json` se retoma en una sesión limpia.

## Pedido del usuario

1. Refactor de skills, references y assets con buenas prácticas (skill-creator): sin
   redundancia (cada idea en un solo lugar), genéricas, cortas, pasos numerados, sin explicar
   lo obvio. **Sin perder funcionamiento.**
2. Global solo el marco genérico. Lo de una tecnología, arquitectura o reglas propias de código
   (DDD, etc.) se instala **por proyecto**, igual que los MCP (Microsoft Learn, Unity…).
3. El marco sirve para cualquier producto (juego, sistema, documento…). Sin
   `backend-stack.md`/`frontend-stack.md`: un archivo general y corto.
4. Un CLI que haga el setup del proyecto, y que el agente sepa usarlo desde NZT para instalar
   skills y habilitar MCPs.

## Decisiones (del usuario)

| Id | Decisión |
|---|---|
| QT-01 | Packs **medianos**: `code`, `backend`, `frontend`, `ddd`, `csharp`, `dotnet`, `blazor`, `unity` |
| QT-02 | Packs para **Claude Code y Codex** |
| QT-03 | **Sin reglas de migración** desde `<area>-stack.md`: la persona pide armarlo en base a los viejos si quiere |
| QT-04 | El documento técnico se llama **`Docs/Architecture/tech.md`** (no `stack.md`): uno por producto, una sección por componente |

## Lo que quedó hecho

### Estructura
- `packs/<pack>/pack.json` (`description`, `requires`, `mcp`) + `SKILL.md` + `references/`.
  Skill instalada = `nzt-<pack>`. Una skill por pack; `unity` es solo MCP.
- Movido (git mv) desde `skills/nzt/build/{references,backend/dotnet,csharp,frontend/blazor}`,
  `skills/nzt/ship/backend/dotnet` y `architecture/references/{contexts,diagrams-domain}`:
  - `code`: `code.md`, `collections.md`, `dtos.md` (de `code-*.md`)
  - `backend`: `backend-*.md` sin prefijo + `data-*.md`; `SKILL.md` = ex `practices-backend.md`
  - `frontend`: `frontend-*.md` sin prefijo; `SKILL.md` = ex `practices-frontend.md`
  - `ddd`: `ddd.md`, `value-objects.md` (de `backend-domain-*`), `contexts.md`, `diagrams.md`
  - `csharp`, `dotnet` (más `ship-*.md` de ship .NET), `blazor`
- MCP: `microsoft-learn` (http `https://learn.microsoft.com/api/mcp`, en csharp/dotnet/blazor);
  `unity-mcp` (stdio, relay de `com.unity.ai.assistant` en `~/.unity/relay/`, comando por
  plataforma con `{home}`, args `--mcp`). Fuente: docs de Unity `com.unity.ai.assistant@2.17`.

### CLI (`installer/src/Nzt.Cli`) — compila, smoke manual OK
- `Content/PackCatalog.cs` (packs embebidos, `Resolve` con requires), `Project/ProjectTarget.cs`
  (Claude: `.claude/skills` + `.mcp.json`; Codex: `.agents/skills` + `.codex/config.toml`),
  `Project/ProjectFile.cs` (`.nzt/project.json`, versionado, rutas relativas),
  `Project/McpConfig.cs` (merge JSON sin pisar servidores del usuario; bloque TOML delimitado),
  `Project/ProjectInstaller.cs` (reconciliación: add/remove/sync = misma operación; nunca pisa
  un archivo ajeno; huérfanos; editados se conservan), `ProgramProject.cs` (comandos y menú
  "Preparar este proyecto"), `Lint/Linter.RunPacks`, embebido de `packs/` en el `.csproj`.
- Comandos: `nzt-ai project [status] | packs | add <pack>... [--provider claude-code|codex|all] |
  remove <pack>... | sync`, `--dir`, `--dry-run`.

### Contenido global reescrito (corto, pasos numerados, genérico)
- `core/kernel.md`: genérico para cualquier producto; párrafos **References** (cómo leer filas,
  nombres `nzt-<x>`, recompactación — ya no se repite en los routers) y **Packs** (cargar los
  packs que `tech.md` lista; instalado ≠ aplicable).
- `nzt`, `nzt-plan` (+6 refs), `nzt-delegate` (+2), `nzt-architecture` (nueva `tech.md`;
  borradas `stack.md`, `stack-axes.md`, `diagrams-behavior.md`; `diagrams-components.md` →
  `diagrams-draw.md`), `nzt-build` (+8), `nzt-discovery` (+7), `nzt-verify` (+9), `nzt-ship`
  (+4), `nzt-ux` (+6). Agentes `nzt-worker.md/.toml` y `nzt-retro` re-apuntados a `tech.md`.
- `tech.md` (referencia): deriva decisiones por tipo de componente, propone packs con
  `nzt-ai project packs`, instala con `nzt-ai project add`, lee `## Axes` y `## Opt-ins` del
  `SKILL.md` instalado de cada pack, opt-ins núcleo (Test levels, Test-first, End-to-end tool,
  Test data); DDD pasa a opt-in del pack `ddd`.

### Packs: re-apuntado mecánico de referencias (perl) — hecho
`../nzt-build/references/backend-x.md` → `../nzt-backend/references/x.md`, `data-*`,
`frontend-*`, `code-*`, `domain-ddd`/`value-objects` → `nzt-ddd`; pack → global por **nombre**
(`` `nzt-build`'s `references/tests.md` ``) porque los packs viven en el proyecto y las globales
en el usuario; `nzt-build-backend-dotnet-*` → `nzt-dotnet-*`, `nzt-build-csharp*` →
`nzt-csharp*`, `nzt-build-frontend-blazor*` → `nzt-blazor*`, `nzt-ship-backend-dotnet-*` →
`nzt-dotnet-ship-*`; "stack document"/"the stack" → `tech.md`. Borrado
`packs/dotnet/references/ship.md` (su tabla va a la sección Ship del `SKILL.md` de dotnet).

## Pendiente (en orden)

1. ~~**SKILL.md de los packs**~~ — **hecho** (unidad 418): los 7 con frontmatter `nzt-<pack>`,
   `## Axes` (valor exacto, referencia, costo sacado de la referencia), `## Opt-ins` en `ddd`
   (las cuatro piezas con su costo), tabla de referencias y Done when; `ddd/references/aggregates.md`.
   Criterios que quedaron:
   - Cada pack dice qué carga primero ("Load `nzt-code` first"); el kernel *Packs* ahora carga
     también esos, así `tech.md` lista solo el pack de arriba (`dotnet`, no `backend`/`csharp`/`code`).
   - Los routers de tecnología no repiten la columna "Read with — first": cada referencia ya
     abre nombrando su genérica.
   - `csharp` dejó solo lo propio de C#: carpeta≠tipo, magic literals, reflexión y control de
     flujo genérico viven en `nzt-code`'s `code.md`.
   - En `dotnet` el ORM se escribe `EF Core` (con versión cualquiera), como en el `tech.md` viejo.
2. ~~**Reescribir las referencias de los packs**~~ — **hecho** (unidad 419): de 6177 a ~3000
   líneas. Forma: título, una o dos líneas de propósito ("Builds on `../nzt-x/references/y.md` —
   read it first" en los de tecnología), reglas o pasos numerados, ejemplo de código mínimo, y
   un *Done when* de una o dos líneas en lugar de la lista de cierre. `backend/references/architecture.md`
   junta lo común de las tres arquitecturas (el SKILL lo manda leer primero);
   `dotnet/references/domain-ddd-behaviour.md` se fusionó en `domain-ddd.md` (el eval
   `evals/stack/entity-shape` todavía la espera: unidad 422). Nombres viejos tipo
   `nzt-ship-pipeline` pasaron a `` `nzt-ship`'s `references/pipeline.md` ``. Se corrigió el
   ejemplo de `dotnet/testing.md` (usaba `var` y un `Create` que devolvía `Result`).
   Texto original de antes:
   sin redundancia (hoy solo re-apuntadas):
   ~90 archivos; criterio: la regla genérica en `backend/frontend/code`, la de tecnología solo
   lo propio. Ojo con títulos viejos tipo "Load `nzt-…` before applying this".
3. **`nzt-learn` (refs), `nzt-research`, `nzt-retro`**: pasada con el mismo criterio (solo se
   limpió el boilerplate del SKILL de learn).
4. **Comprobaciones** (`installer/tests/Nzt.Cli.Checks`): casos de `project add/remove/sync`,
   conflicto con archivo ajeno, MCP en `.mcp.json` sin pisar uno del usuario, bloque TOML,
   Resolve con requires, `Linter.RunPacks`; revisar las existentes (usan nombres
   `nzt-build-implement` de prueba, `EmbedsEveryReferenceOfTheRepo` cuenta solo `skills/`).
   Limpiar las llaves extra en `Linter.CheckSkill`.
5. **`install/build.sh` / `build.ps1`**: validar también `packs/`; `check-extraction.sh` y
   `check-references.sh` verifican migraciones pasadas y van a fallar con el árbol nuevo:
   borrarlos o adaptarlos (preguntar).
6. **evals**: `evals/stack/*`, `restraint/*`, `_fixtures/project.sh`, `stack-ready.sh`,
   `node-project.sh` siguen con `backend-stack*.md` y `nzt-build-backend-dotnet`: pasar a
   `Docs/Architecture/tech.md` y `nzt-dotnet`/`nzt-blazor`; agregar un caso de setup de packs.
7. **Documentación**: `README.md` (capas, packs, `nzt-ai project`, cifras), `installer/README.md`,
   `specs/nzt-installer.md` (sección project), `specs/nzt-core.md` (decisión D88 con QT-01..04).
8. **Verificar**: `dotnet build`, checks, `nzt-ai lint` (global + packs, 0 problemas), smoke de
   `project add dotnet unity --provider all` en carpeta temporal, `nzt-ai state check`.
9. Versión: proponer 4.0.0 (cambio incompatible: nombres de skills y `tech.md`). Preguntar.

## Sin verificar

- Que Codex lea `url = "…"` para MCP HTTP en `.codex/config.toml` de proyecto (fuentes de
  terceros; solo en proyectos de confianza).
- Que el relay de Unity acepte el comando con ruta absoluta resuelta por `{home}` en Windows.
