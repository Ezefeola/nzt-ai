# NZT — Instalador

> Estado: **construido** (v0.3.0) · `installer/src/Nzt.Cli` · Runbook en
> `installer/README.md` · Depende de: `specs/nzt-core.md` (secciones 3, 9.1 y 9.2)

## 1. Propósito

Una aplicación de consola en **.NET 10** que instala NZT en la máquina del usuario,
eligiendo a qué proveedor: Claude Code, Codex, o todos los soportados. Se ocupa de las dos
cosas que el repo no puede resolver por sí solo: **aplanar el árbol de skills** al formato
plano que exigen los proveedores, y **escribir el archivo de instrucciones** de cada uno
sin pisar lo que el usuario ya tenía.

**Sin plugins.** Un plugin es un mecanismo de Claude Code que el usuario tendría que
conocer, no existe en Codex, y namespacea las skills (`nzt:nzt-build`) rompiendo los nombres
que nombran las tablas de ruteo. Lo que se instala son **skills sueltas en la carpeta de
usuario** y un bloque en el archivo de instrucciones. El único plugin del repo es
`dist/plugin/`, que existe para que `claude plugin eval` tenga un target (D23) y **no se
instala nunca**.

## 2. Destinos de instalación

Instalación **global** (nivel usuario), que es el caso de uso pedido:

| Proveedor | Instrucciones | Skills |
|---|---|---|
| Claude Code | bloque en `~/.claude/CLAUDE.md` | `~/.claude/skills/<nombre>/` |
| Codex | bloque en `$CODEX_HOME/AGENTS.md` | `~/.agents/skills/<nombre>/` |

Dos advertencias sobre esa tabla:

- **Las skills de Codex no van en `~/.codex/`.** La documentación oficial ubica el scope de
  usuario en `$HOME/.agents/skills` (el estándar abierto que Codex adoptó), no en
  `~/.codex/skills`. Hay guías de terceros que dicen lo contrario. **Implementado así**: el
  instalador escribe en la ruta documentada y, si detecta que `~/.codex/skills` existe en la
  máquina, lo avisa antes de escribir para que el usuario sepa dónde mirar si Codex no las ve.
- **Instalar global significa que NZT aplica a todos los proyectos** de la máquina. Es lo
  pedido y es tolerable porque el kernel se escala solo hacia abajo (un cambio de una línea
  no dispara el método completo), y porque un `CLAUDE.md` de proyecto se lee después del
  global y puede sobrescribir la guía.

## 3. Interfaz

Menú interactivo al arrancar sin argumentos. **Primero se elige la acción, después el
destino**, y las dos que escriben **muestran la simulación y recién ahí preguntan** — el
`--dry-run` no es un modo aparte que haya que acordarse de usar:

```
NZT installer 0.1.0

  ¿Qué querés hacer?
  > Instalar
    Desinstalar
    Verificar el contenido
    Ver estado
    Salir
```

- **No se escribe nada para elegir.** Las listas se recorren con ↑ ↓ y se eligen con Enter.
  Que no haya nada que tipear es lo que hace que **no exista una opción inválida**: la única
  forma de no elegir es elegir *Volver* o *Salir*.
- **El menú es un bucle**: verificar y ver estado no son el final de nada, así que vuelve a
  preguntar hasta que se elige salir.
- **Instalar y desinstalar preguntan el destino** —Claude Code, Codex, todos, o volver—,
  imprimen la simulación completa y piden confirmación con **`No` por defecto**. Volver no
  elige ningún proveedor, y ningún proveedor significa que no se escribe nada.
- **La confirmación también es una lista**, `No` y `Sí`, y `No` va primero porque la opción
  marcada al abrir es la primera: el defecto tiene que ser el que no toca el disco.
- **Desinstalar dice antes de simular qué alcance tiene**: solo lo que instaló este CLI,
  según su manifiesto.
- **Verificar el contenido** lista skill por skill —líneas y chars de description—, después
  los problemas y el total del listado contra el piso de Codex. Es el mismo lint del modo no
  interactivo, con el detalle que hace verificable la palabra *verificar*.
- **Sin terminal —una tubería cerrada— el menú no abre**: dice que hacen falta los comandos y
  sale con 0. Una lista navegable no puede contestarse desde una tubería, y colgarse
  esperando una flecha que no va a llegar es el modo de falla que hay que evitar.

Y modo no interactivo, para poder scriptearlo:

```
nzt install --provider claude-code|codex|all [--dry-run]
nzt uninstall --provider claude-code|codex|all [--dry-run]
nzt status
nzt lint | verify
```

- `--dry-run` imprime exactamente lo que haría, sin tocar el disco.
- `status` informa qué hay instalado, en qué versión, dónde, y **cuántos archivos editó el
  usuario**.
- `lint` —o `verify`, el mismo comando— corre las reglas del set sin instalar nada, en su
  forma resumida: lo que sirve en CI es el conteo y el código de salida, no la tabla.
- `--manifest-dir <ruta>` aísla el manifiesto; es lo que usan las comprobaciones.

## 4. Qué hace, paso a paso

1. **Valida el set antes de tocar nada** (sección 7). Si algo falla, aborta sin escribir.
2. **Arma el bloque de instrucciones** de cada destino: `core/kernel.md` + el adapter del
   proveedor, entre `<!-- nzt:start -->` y `<!-- nzt:end -->`.
3. **Pre-escaneo de conflictos.** Si algún archivo de destino existe y no figura en el
   manifiesto, **no se escribe nada en ese proveedor**.
4. **Escribe las instrucciones respetando lo previo**: bloque ubicado por marcadores y
   reemplazado en su lugar; si el archivo existe sin marcadores, el bloque va arriba y su
   contenido queda abajo; si no existe, se crea.
5. **Aplana y copia las skills**: cada carpeta con `SKILL.md` va a una carpeta plana cuyo
   nombre es el path relativo con `/` → `-`.
6. **Retira los huérfanos**: lo que el manifiesto anterior instaló y ya no está en el set.
7. **Escribe el manifiesto** y **reporta**: creados, actualizados, sin cambios, eliminados,
   conservados, y el tamaño del listado en caracteres (el presupuesto de R1).

## 5. Manifiesto

**Uno por proveedor**, en `%LOCALAPPDATA%/nzt/manifests/<proveedor>.json` (Windows) o
`~/.local/share/nzt/manifests/` en el resto. Vive fuera de la carpeta del proveedor: ahí van
skills e instrucciones, nada de contabilidad.

```json
{
  "provider": "claude-code",
  "nztVersion": "0.1.0",
  "installedAt": "2026-09-17T14:22:00-03:00",
  "files": [
    { "Path": "C:\\Users\\x\\.claude\\CLAUDE.md", "Sha256": "…", "ManagedBlock": true },
    { "Path": "C:\\Users\\x\\.claude\\skills\\nzt\\SKILL.md", "Sha256": "…" }
  ]
}
```

El hash se calcula sobre el contenido **normalizado a `\n`**: un checkout con otro fin de
línea no es una edición del usuario. El del bloque administrado corresponde sólo al bloque.

## 6. Idempotencia y desinstalación

- Reinstalar es actualizar: sobrescribe lo que cambió, deja lo que no.
- Una skill que estaba en el manifiesto y ya no está en el repo **se borra** del destino. Así
  un rename en el árbol no deja la versión vieja instalada y compitiendo por el ruteo.
- `uninstall` borra exactamente lo que dice el manifiesto y quita el bloque entre marcadores,
  dejando intacto el resto del archivo. El manifiesto se elimina cuando ya no administra nada.

## 7. Reglas de seguridad

Son las que evitan que el instalador rompa la configuración del usuario:

- **Nunca borrar ni pisar un archivo que no esté en el manifiesto.** Si aparece algo
  inesperado en una carpeta nuestra, se informa y se corta.
- **Nunca sobrescribir contenido fuera de los marcadores.**
- **Marcadores sin manifiesto son una colisión**, no una instalación previa: no se asume que
  el bloque es nuestro.
- **Un bloque roto o editado se conserva y se informa**, y lo mismo una skill editada: el
  manifiesto guarda el último hash *instalado*, no el editado, así que reinstalar no
  convierte una copia del usuario en contenido reemplazable.
- **Copiar, no linkear.** Los symlinks en Windows requieren admin o modo desarrollador.
- **Backup del archivo de instrucciones** la primera vez que se lo modifica
  (`CLAUDE.md.nzt-backup`), sin pisar un backup previo.

El lint que corre antes de instalar: `name` == nombre derivado del path, `description`
presente y ≤ 250 chars, ≤ 200 líneas por archivo, frontmatter portable (C1) y ningún nombre
plano duplicado.

## 8. Stack y estructura

```
installer/
├─ README.md                      # runbook
├─ src/Nzt.Cli/
│  ├─ Nzt.Cli.csproj              # net10.0, console, una sola dependencia: Spectre.Console
│  ├─ Program.cs                  # menú, argumentos y reporte
│  ├─ Content/                    # catálogo embebido y frontmatter
│  ├─ Providers/Provider.cs       # un destino por proveedor
│  ├─ Install/                    # Installer, InstructionBlock, Manifest
│  └─ Lint/Linter.cs
└─ tests/Nzt.Cli.Checks/          # comprobaciones con destinos temporales
```

- **El contenido se embebe al compilar** (`core/**/*.md` y `skills/**/SKILL.md`): el
  ejecutable *es* el set, y su versión es la versión del set.
- **Una sola dependencia, y es del menú: `Spectre.Console`.** Hasta que el menú se navegó con
  flechas, la salida era lo bastante simple como para no pagar ninguna. Un selector deja de
  serlo —teclas crudas, redibujado, terminales que no lo son—, así que se usa el mismo
  paquete que Temper en vez de escribirlo de nuevo. **Solo los prompts**: el reporte, la
  simulación, `status` y el lint siguen siendo `Console`, sin markup.
- Multiplataforma: las rutas salen de `Environment.SpecialFolder.UserProfile`, nunca de
  concatenar strings.
- Distribución: **un binario self-contained por plataforma, publicado en GitHub Releases** y
  que un comando de una línea por proveedor baja, corre una vez y borra (sección 10, D46). Desde el repo sigue funcionando con
  .NET 10, que es el loop de desarrollo.

## 9. Decisiones

- ~~**I1. Alcance de la capa de stack.**~~ **Cerrada por D18**: todo se instala global,
  incluida la capa de stack. No hay `--project` ni instalación parcial.
- **I2. Duplicación con `install/build.*`.** **Resuelta en la práctica, no eliminada.** Los
  scripts siguen siendo el loop de desarrollo —además arman `dist/` y el plugin de evals, que
  al instalador no le incumben— y el CLI es lo que instala. Lo que evita que diverjan es una
  comprobación: el bloque que escribe el CLI se compara **byte a byte** con el
  `dist/CLAUDE.md` que emitió el build, y si se separan, falla.
- ~~**I3. Versionado.**~~ **Cerrada**: sale del `<Version>` del `.csproj`, que es lo que
  termina en `nztVersion` del manifiesto y en el encabezado del CLI.
- ~~**I5. Distribución sin .NET.**~~ **Cerrada por D46**: un comando de una línea por
  proveedor, que instala NZT directo usando el CLI como herramienta de un solo uso (sección 10).

## 10. Instalación de una línea

El usuario no clona el repo, no instala .NET **y no instala el instalador**. Pega una línea
**por proveedor**, igual que con Codex, y lo que queda en la máquina es NZT en ese proveedor:

| | Windows | macOS / Linux |
|---|---|---|
| Claude Code | `powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.ps1 \| iex"` | `curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.sh \| sh` |
| Codex | `powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.ps1 \| iex"` | `curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.sh \| sh` |

**El CLI es la herramienta, no el producto.** El script lo baja a una carpeta temporal, lo
corre una vez con el proveedor fijo y lo borra. No queda ningún ejecutable, no se toca el
PATH y no se abre el menú: el menú sigue siendo la vía de quien trabaja desde el repo.

**Precondición: el repositorio tiene que ser público.** Un release de un repo privado
devuelve 404 a una descarga anónima, y `irm` no manda credenciales.

### 10.1 Qué publica cada release

Un tag `vX.Y.Z` dispara `.github/workflows/release.yml`, que publica en el release:

| Asset | Qué es |
|---|---|
| `nzt-win-x64.exe`, `nzt-win-arm64.exe` | binario de Windows |
| `nzt-linux-x64`, `nzt-linux-arm64` | binario de Linux |
| `nzt-osx-x64`, `nzt-osx-arm64` | binario de macOS |
| `SHA256SUMS` | el hash de cada binario, formato `sha256sum` |
| `install-claude.ps1`, `install-codex.ps1` | los comandos de Windows, uno por proveedor |
| `install-claude.sh`, `install-codex.sh` | los comandos de macOS y Linux, uno por proveedor |

**Las cuatro variantes salen de dos fuentes.** En el repo están solo `install/install.ps1` e
`install/install.sh`, con una línea marcada `# nzt:provider` que lee el proveedor de
`NZT_PROVIDER`. `install/variants.sh` —el mismo que corre CI— reemplaza esa línea por el
proveedor fijo y falla si la marca no está: la lógica existe una sola vez.

- **El tag tiene que coincidir con el `<Version>` del `.csproj`** (I3). Si no coincide, el
  workflow falla antes de publicar: un binario que se llama 0.2.0 y dice 0.1.0 rompe
  `status` y el manifiesto.
- **Antes de publicar corren las mismas puertas que en local**: `install/build.sh`, las
  comprobaciones del instalador y `nzt verify`. Si una falla, no hay release.
- `releases/latest/download/<asset>` es la URL estable: siempre apunta al último release,
  y los scripts del release N bajan los binarios del release N.
- **Self-contained, un solo archivo, comprimido y sin trimming**: ~38 MB en `win-x64`. Con
  trimming baja a ~12 MB, pero el linker advierte sobre `System.Text.Json` en el manifiesto y
  sobre Spectre.Console, y el menú no tiene comprobación automática que lo cubra. Se reabre
  si el tamaño molesta: manifiesto con `JsonSerializerContext` y el menú probado a mano en el
  binario recortado.

### 10.2 Qué hace el script

El script **no escribe nada del proveedor.** Todo lo que toca `CLAUDE.md`, `AGENTS.md` o las
carpetas de skills lo hace el CLI, con las reglas de la sección 7, así que la línea no
puede saltearse el manifiesto, los marcadores ni el backup.

1. **Detecta la plataforma** y elige el asset. Una combinación sin binario aborta
   diciendo cuál es.
2. **Baja el binario y `SHA256SUMS`** del release pedido, a una carpeta temporal propia.
3. **Verifica el hash.** Si no coincide, aborta sin correr nada.
4. **Corre `install --provider <id>`** con el proveedor de la variante, **sin menú ni
   confirmación**, como el instalador de Codex. Es seguro porque las reglas son del CLI: un
   archivo ajeno corta la instalación sin escribir, y una edición del usuario se conserva.
   Con `NZT_UNINSTALL=1` corre `uninstall` en su lugar.
5. **Borra la carpeta temporal**, haya salido bien o mal. En la máquina queda NZT en el
   proveedor y el manifiesto, nada más.

- **Correr la misma línea otra vez es actualizar.** El manifiesto vive en
  `%LOCALAPPDATA%/nzt/manifests` o `~/.local/share/nzt/manifests` (sección 5), fuera del
  binario, así que un CLI recién bajado reconoce lo que instaló el anterior.
- **Cada corrida baja el binario entero** (~38 MB). Es el precio de no dejar nada instalado;
  lo que lo baja es el trimming de 10.1.
- En `install.sh` el código de salida es el del CLI. `install.ps1` **nunca llama a `exit`**
  —pegado en una consola abierta le cerraría la ventana al usuario— y corre dentro de un
  bloque `& { }` para no dejar variables ni funciones en la sesión; el código del CLI queda
  en `$LASTEXITCODE`. Sus textos van sin tildes por precaución: en PowerShell 7 un asset
  sin charset se decodifica bien (probado), pero en Windows PowerShell 5.1 —el que abre
  `powershell`— **no está verificado** y el riesgo es texto ilegible, no una falla.
- Sin menú no hace falta terminal: `curl | sh` funciona igual en CI o en un contenedor.

### 10.3 Variables

| Variable | Efecto | Por defecto |
|---|---|---|
| `NZT_UNINSTALL` | `1` desinstala NZT de ese proveedor en vez de instalarlo | apagado |
| `NZT_DRY_RUN` | `1` agrega `--dry-run`: muestra qué haría sin escribir | apagado |
| `NZT_VERSION` | tag a instalar, por ejemplo `v0.2.0` | el último release |
| `NZT_DOWNLOAD_BASE` | URL base de los assets, para un espejo o para probar | la del release |
| `NZT_PROVIDER` | solo en las fuentes de `install/`, para probarlas; las variantes lo fijan | — |

En PowerShell una variable se pasa así:
`$env:NZT_UNINSTALL='1'; irm .../install-claude.ps1 | iex`. En shell:
`curl -fsSL .../install-claude.sh | NZT_UNINSTALL=1 sh`.

### 10.4 Lo que no hace

- **No deja el CLI instalado.** Quien quiera `nzt status` o el menú lo corre desde el repo
  con .NET 10 (sección 3).
- **No instala en los dos proveedores a la vez.** Son dos líneas, una por proveedor; correr
  las dos es lo mismo que elegir *Todos* en el menú.
- **No firma los binarios.** Si Windows SmartScreen, un antivirus o Gatekeeper los frenan,
  no está verificado. Firmar es lo que se agrega si pasa.
