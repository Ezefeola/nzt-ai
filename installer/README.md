# Instalador de NZT — .NET 10

Versión 5.0.0. Instala NZT **globalmente**, por la misma vía que el plugin (D95): el kernel
dentro de la skill `nzt`, que el proveedor carga primero en toda sesión, y las
skills, con sus referencias, aplanadas en su carpeta de skills de usuario. Los **packs** se
instalan aparte, **en cada proyecto** (sección *Packs por proyecto*). En Claude Code
puede instalar además **los mods**, que sí son plugins (sección *Mods de Claude Code*). El
contenido de `core/`, `skills/`, `packs/` y el catálogo de mods se **embebe al compilar**, así que el
ejecutable es el set: un solo artefacto y nada que resolver en tiempo de ejecución.

## Uso

Desde la raíz del repositorio:

```powershell
dotnet run --project installer/src/Nzt.Cli
dotnet run --project installer/src/Nzt.Cli -- verify
dotnet run --project installer/src/Nzt.Cli -- status
dotnet run --project installer/src/Nzt.Cli -- install --provider claude-code --dry-run
dotnet run --project installer/src/Nzt.Cli -- install --provider claude-code
dotnet run --project installer/src/Nzt.Cli -- install --provider claude-code --mods all
dotnet run --project installer/src/Nzt.Cli -- uninstall --provider claude-code
dotnet run --project installer/src/Nzt.Cli -- project add dotnet --dir ../pedidos --dry-run
```

Sin argumentos abre el menú: **instalar, desinstalar, preparar este proyecto, verificar el
contenido y ver estado**,
en un bucle hasta que elegís salir. **Se navega con ↑ ↓ y se elige con Enter** — no se
escribe nada, ni números ni `s/n`. Primero la acción, después el destino y, si el destino
incluye Claude Code, **qué instalar: Todo NZT, solo el método o solo los mods**. Las dos que
escriben **muestran la simulación y recién ahí preguntan**, con `No` por defecto. Sin una
terminal —una tubería— el menú no abre: te manda a los comandos y sale. En scripts los
identificadores son `claude-code`, `codex` y `all`, y `--mods` es `all`, `none` u `only`.
Un identificador desconocido aborta sin tocar nada.

## Mods de Claude Code

Los mods son plugins de Claude Code que hacen visible lo que produce el método (catálogo en
`specs/nzt-mods.md` sección 5). El instalador los instala **con los comandos de Claude Code,
como lo harías vos**: nunca copia archivos de un mod.

| | Instalar | Desinstalar |
|---|---|---|---|
| Sin `--mods` | solo el método, como siempre | el método y los mods que instaló este CLI |
| `--mods all` | el método y los mods | lo mismo que sin `--mods` |
| `--mods none` | solo el método | solo el método |
| `--mods only` | solo los mods | solo los mods que instaló este CLI |

- **El marketplace `nzt` es uno solo en la máquina.** Si no está, lo agrega desde
  `Ezefeola/nzt-ai` (la rama por defecto, igual que a mano). Si ya está desde otra fuente —una
  carpeta local, un fork— usa ese y el reporte dice de dónde viene. **Nunca lo quita**:
  quitarlo desinstalaría también los mods que instalaste a mano.
- **Los mods que instala quedan anotados** en el campo `mods` del manifiesto de Claude Code.
  Un mod que instalaste a mano se actualiza al instalar, pero sigue siendo tuyo: no se
  desinstala nunca.
- **Volver a instalar actualiza los mods**: refresca el marketplace y corre
  `claude plugin update` en cada uno. La actualización automática no la activa: se activa
  una vez en `/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**.
- **Sin `claude` en la terminal, o con una versión anterior a 2.1.287**, instala el método
  igual, deja los mods afuera sin marcarlo como falla y muestra cómo sumarlos desde la app.
- **Un mod que falla** se nombra con su motivo y el código de salida es 1, pero el método y
  los demás mods quedan instalados.
- `status` lista cada mod: si está instalado, su versión y si lo instaló NZT o vos.

Elegir *solo los mods* con *Todos los proveedores* no instala nada en Codex: Codex no tiene
mods, y el método no se pidió.

## Packs por proyecto

`nzt-ai project` (o `dotnet run --project installer/src/Nzt.Cli -- project …`) instala
packs en un proyecto: la skill `nzt-<pack>` de cada uno, la de los packs que requiere, y sus
MCP. Corre sobre la carpeta actual, o la de `--dir`.

| Comando | Qué hace |
|---|---|
| `project` / `project status` | los packs del proyecto, sus proveedores y qué está editado o falta |
| `project packs` | el catálogo, con lo que trae cada pack y cuáles tiene el proyecto |
| `project add <pack>... [--provider claude-code\|codex\|all]` | los suma a los que ya tiene; sin `--provider`, los del proyecto o Claude Code |
| `project remove <pack>...` | los saca, y con ellos lo que ningún otro pack sigue requiriendo |
| `project sync` | reinstala lo que dice el registro del proyecto: en un clon nuevo, deja lo mismo |

Todos aceptan `--dry-run`. Los tres que escriben son la misma operación: del estado deseado
—packs y proveedores— a lo que hay en disco.

| Proveedor | Skills | MCP | Registro |
|---|---|---|---|
| Claude Code | `.claude/skills/nzt-<pack>/` | `mcpServers` de `.mcp.json` | `.claude/nzt.json` |
| Codex | `.agents/skills/nzt-<pack>/` | un bloque `# nzt:start` … `# nzt:end` en `.codex/config.toml`, que Codex lee solo si el proyecto es de confianza | `.agents/nzt.json` |

- **El registro** (`nzt.json` en la carpeta de cada proveedor, el mismo en las dos) anota los
  packs pedidos (no los requeridos), los proveedores, cada archivo escrito con su hash y los
  MCP que agregó `nzt-ai`. Las rutas son relativas: versionalo. Uno viejo en
  `.nzt/project.json` se lee, y el próximo `add`, `remove` o `sync` lo mueve.
- **Las mismas reglas que la instalación global:** con un archivo que `nzt-ai` no escribió
  no se escribe nada; uno editado se conserva al actualizar y al sacar el pack; lo que sale
  se borra con sus carpetas vacías.
- **Un MCP del usuario no se toca.** Si ya hay uno con ese nombre —en `.mcp.json` o fuera del
  bloque de `config.toml`—, queda como está y no se anota como de `nzt-ai`.
- **Un MCP local** (`unity-mcp`) trae un comando por plataforma con `{home}` resuelto al
  instalar; sin comando para esta plataforma se informa y no se escribe.
- **Los MCP cargan en una sesión nueva.**

## Dónde queda instalado

| Proveedor | Kernel | Skills | Subagentes | Cómo se activa |
|---|---|---|---|---|
| Claude Code | en la skill `~/.claude/skills/nzt/` | `~/.claude/skills/<nombre>/SKILL.md` | `~/.claude/agents/nzt-explorer.md`, `nzt-worker.md` | abrir `claude` en cualquier proyecto |
| Codex | en la skill `~/.agents/skills/nzt/` | `~/.agents/skills/<nombre>/SKILL.md` | `$CODEX_HOME/agents/nzt-explorer.toml`, `nzt-worker.toml` | iniciar `codex` |

Desde D95 el kernel no se escribe en `CLAUDE.md` ni en `AGENTS.md`: va dentro de la skill
`nzt`, igual que en el plugin, y su descripción le pide al modelo cargarla primero.

Son dos, y a los dos los manda `nzt-delegate`: el explorador de solo lectura recibe las lecturas
largas, y el worker, las unidades que el plan aprobado marcó en paralelo (D84). Desinstalar
los saca y deja tus otros agentes.

`CODEX_HOME` es `~/.codex` por defecto. Cambiarlo mueve los subagentes, **no** las skills.

Dos advertencias que el CLI también imprime:

- **Las skills de Codex no van en `~/.codex/skills`.** El scope de usuario documentado es
  `~/.agents/skills`. Si esa otra carpeta existe en la máquina, el instalador lo avisa antes
  de escribir: es el primer lugar a mirar si Codex no ve las skills.
- **Instalar global significa que NZT aplica a todos los proyectos.** Es lo pedido, y es
  tolerable porque el kernel se escala solo hacia abajo y el `CLAUDE.md` o `AGENTS.md` de
  un proyecto sigue aplicando.

No se crea ningún plugin ni otro subagente que los dos de la tabla, y la instalación global
no toca `config.toml`. Instalar skills no garantiza que el modelo siempre seleccione la correcta: eso
es lo que miden los evals.

## Convivencia

NZT es dueño de los archivos de su manifiesto y de nada más. Tu `CLAUDE.md` y tu `AGENTS.md`
no se tocan (D95). Una comprobación verifica que la skill `nzt` que escribe el CLI sea
idéntica byte a byte a la que emite el build en `dist/claude-code/nzt/` y `dist/codex/nzt/`.

- **Una instalación anterior** dejó el kernel en un bloque entre `<!-- nzt:start -->` y
  `<!-- nzt:end -->`. Al actualizar, el bloque se quita y el texto de alrededor queda
  intacto; si era todo el archivo, el archivo se borra. Un bloque editado o roto se conserva
  y se informa.
- **Marcadores sin manifiesto no se tocan**: no se sabe de quién son. Si tenés uno, el kernel
  te llega dos veces hasta que lo saques.

## Protección de archivos

- **Nunca se sobrescribe un archivo que este CLI no escribió.** Con un solo conflicto no se
  escribe nada en ese proveedor: se corta y se explica cuál.
- **Una edición local se conserva.** El manifiesto guarda el último hash *instalado*, no el
  editado, así que reinstalar no convierte una copia tuya en contenido reemplazable.
- **Un rename en el árbol borra la versión vieja** — si no, quedaría instalada compitiendo por
  el ruteo —, salvo que la hayas editado.
- **Al desinstalar** se saca sólo lo que dice el manifiesto; lo editado queda, y el manifiesto
  se borra cuando ya no administra nada.
- Se copia, no se linkea: los symlinks en Windows piden admin.

Los manifiestos son uno por proveedor, en `%LOCALAPPDATA%/nzt/manifests` en Windows o
`~/.local/share/nzt/manifests` en el resto.

## Validación

El instalador **corre el lint antes de escribir** y aborta si el set no valida: name del
frontmatter == nombre derivado del path, `description` presente y ≤ 250 chars, ≤ 200 líneas
por archivo, frontmatter portable (C1) y ningún nombre plano duplicado. Los packs pasan las
mismas reglas en su skill, y además: `description` en `pack.json`, skill o MCP, `requires`
que existen y sin ciclos, cada MCP con `url` o `command` (uno solo) y definido igual en todos
los packs, y ninguna skill de pack con el nombre de una global. También informa el
tamaño del listado contra el piso de 8.000 de Codex (R1).

```powershell
dotnet run --project installer/tests/Nzt.Cli.Checks
```

Usa destinos y manifiestos temporales aislados — **nunca toca el HOME real** — y, para los
mods, un Claude Code falso que responde con el mismo JSON que el real: **nunca toca tus
plugins**. Cubre instalación, idempotencia, convivencia con texto personal, backup, protección
de ediciones, huérfanos, colisiones, simulación, desinstalación, bloque roto, aplanado de
nombres, paridad con el build, las reglas del lint y los mods: catálogo, marketplace, sin
Claude Code, versión vieja, falla parcial, mods instalados a mano, actualizar, desinstalar y
estado; y `project`: requires, agregar, sacar y sincronizar, archivo ajeno, pack desconocido,
ediciones, simulación, MCP del usuario en `.mcp.json` y en `config.toml`, comando por
plataforma, cambio de proveedor y el lint de packs. La validación de esta versión da
`PASS: 240 installer checks`.

Las comprobaciones no ejecutan conversaciones en los CLIs ni miden selección de skills. Eso
es la suite de `evals/`.

## Distribución

**Para el usuario es una línea por proveedor**, y este CLI no le queda instalado (D46,
sección 10 de `specs/nzt-installer.md`):

| | Windows (`irm … \| iex`) | macOS / Linux (`curl -fsSL … \| sh`) |
|---|---|---|---|
| Claude Code | `releases/latest/download/install-claude.ps1` | `releases/latest/download/install-claude.sh` |
| Claude Code, con los mods | `releases/latest/download/install-claude-full.ps1` | `releases/latest/download/install-claude-full.sh` |
| Codex | `releases/latest/download/install-codex.ps1` | `releases/latest/download/install-codex.sh` |

Cada comando baja el binario de la plataforma a una carpeta temporal, verifica su SHA256
contra `SHA256SUMS`, corre `install --provider <id>` sin menú y borra la carpeta. El script
no escribe nada del proveedor: eso lo hace el CLI, con las reglas de siempre, y el CLI se
copia como `nzt-ai` (sección 12 de la spec). Corrido con `dotnet run` no se copia: no es un
binario de un solo archivo.
`NZT_UNINSTALL=1` desinstala —en Claude Code, el método y los mods que instaló este CLI— y
`NZT_DRY_RUN=1` simula; el resto de las variables está en la sección 10.3 de la spec. **El
repositorio tiene que ser público** para que la descarga anónima funcione.

Las seis variantes salen de `install/install.ps1` e `install/install.sh`:
`install/variants.sh <carpeta>` reemplaza la línea marcada `# nzt:provider` por el
proveedor fijo y, en `install-claude-full`, la marcada `# nzt:mods` por `all`. Para probar
una fuente sin generar variantes, `NZT_PROVIDER` y `NZT_MODS` hacen de proveedor y de mods.

**Publicar una versión:**

1. Subir `<Version>` en `Nzt.Cli.csproj`.
2. Commit, y `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. `.github/workflows/release.yml` corre el build, las comprobaciones y el lint, publica
   los seis binarios —`win`, `linux` y `osx`, en `x64` y `arm64`— y crea el release con
   `SHA256SUMS` y los seis comandos. Si el tag no coincide con `<Version>`, falla sin publicar.

Un binario local se arma igual que en CI. Con un RID, el `.csproj` ya lo publica
self-contained, en un solo archivo y comprimido (~38 MB, sin trimming):

```powershell
dotnet publish installer/src/Nzt.Cli/Nzt.Cli.csproj -c Release -r win-x64 -o out
```

No se publica en NuGet.
