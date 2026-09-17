# Instalador de NZT — .NET 10

Versión 0.1.0. Instala NZT **globalmente**, sin plugins: el kernel como bloque en el archivo
de instrucciones que el proveedor ya lee en toda sesión, y las 91 skills aplanadas en su
carpeta de skills de usuario. El contenido de `core/` y `skills/` se **embebe al compilar**,
así que el ejecutable es el set: un solo artefacto y nada que resolver en tiempo de
ejecución.

## Uso

Desde la raíz del repositorio:

```powershell
dotnet run --project installer/src/Nzt.Cli
dotnet run --project installer/src/Nzt.Cli -- lint
dotnet run --project installer/src/Nzt.Cli -- status
dotnet run --project installer/src/Nzt.Cli -- install --provider claude-code --dry-run
dotnet run --project installer/src/Nzt.Cli -- install --provider claude-code
dotnet run --project installer/src/Nzt.Cli -- uninstall --provider claude-code
```

Sin argumentos abre el menú, **muestra la simulación y recién ahí pregunta**. En scripts los
identificadores son `claude-code`, `codex` y `all`. Un identificador desconocido aborta sin
tocar nada.

## Dónde queda instalado

| Proveedor | Instrucciones | Skills | Cómo se activa |
|---|---|---|---|
| Claude Code | bloque en `~/.claude/CLAUDE.md` | `~/.claude/skills/<nombre>/SKILL.md` | abrir `claude` en cualquier proyecto |
| Codex | bloque en `$CODEX_HOME/AGENTS.md` | `~/.agents/skills/<nombre>/SKILL.md` | iniciar `codex` |

`CODEX_HOME` es `~/.codex` por defecto. Cambiarlo mueve las instrucciones, **no** las skills.

Dos advertencias que el CLI también imprime:

- **Las skills de Codex no van en `~/.codex/skills`.** El scope de usuario documentado es
  `~/.agents/skills`. Si esa otra carpeta existe en la máquina, el instalador lo avisa antes
  de escribir: es el primer lugar a mirar si Codex no ve las skills.
- **Instalar global significa que NZT aplica a todos los proyectos.** Es lo pedido, y es
  tolerable porque el kernel se escala solo hacia abajo y un `CLAUDE.md` de proyecto se lee
  después del global.

No se crea ningún plugin, ningún subagente y no se toca `config.toml`. Instalar skills no
garantiza que el modelo siempre seleccione la correcta: eso es lo que miden los evals.

## Convivencia

NZT es dueño de un bloque y de nada más:

```markdown
<!-- nzt:start -->
... kernel + adapter del proveedor ...
<!-- nzt:end -->
```

Son **los mismos marcadores que emite `install/build.*`**, y una comprobación verifica que el
bloque que escribe el CLI sea idéntico byte a byte al `dist/CLAUDE.md` del build.

- El bloque se agrega **arriba** del contenido personal existente; al actualizar se reemplaza
  en su lugar y el texto de alrededor queda intacto.
- La primera vez que se toca un archivo de instrucciones que ya existía se guarda
  `CLAUDE.md.nzt-backup`. No se pisa un backup previo.
- **Marcadores presentes sin manifiesto son una colisión**: el instalador no asume que son
  suyos, corta antes de escribir y lo informa.
- Un bloque editado o roto se conserva y se informa, tantas reinstalaciones como haga falta.

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
por archivo, frontmatter portable (C1) y ningún nombre plano duplicado. También informa el
tamaño del listado contra el piso de 8.000 de Codex (R1).

```powershell
dotnet run --project installer/tests/Nzt.Cli.Checks
```

Usa destinos y manifiestos temporales aislados — **nunca toca el HOME real**. Cubre
instalación, idempotencia, convivencia con texto personal, backup, protección de ediciones,
huérfanos, colisiones, simulación, desinstalación, bloque roto, aplanado de nombres, paridad
con el build y las reglas del lint. La validación de esta versión da `PASS: 43 installer
checks`.

Las comprobaciones no ejecutan conversaciones en los CLIs ni miden selección de skills. Eso
es la suite de `evals/`.

## Distribución

Se usa desde el repositorio con .NET 10. No se publica en NuGet. Se puede publicar un binario
self-contained para distribuirlo sin el SDK:

```powershell
dotnet publish installer/src/Nzt.Cli -c Release -r win-x64 --self-contained -p:PublishSingleFile=true
```
