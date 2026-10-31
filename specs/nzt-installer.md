# NZT — Instalador

> Estado: **construido** (v1.1.0) · `installer/src/Nzt.Cli` · Runbook en
> `installer/README.md` · Depende de: `specs/nzt-core.md` (secciones 3, 9.1 y 9.2)
> **[modify]** La sección 13, instalación por proyecto y menú contextual, está especificada
> y sin construir (2026-10-31).

## 1. Propósito

Una aplicación de consola en **.NET 10** que instala NZT en la máquina del usuario,
eligiendo a qué proveedor: Claude Code, Codex, o todos los soportados. Se ocupa de las dos
cosas que el repo no puede resolver por sí solo: **aplanar el árbol de skills** al formato
plano que exigen los proveedores, y **escribir el archivo de instrucciones** de cada uno
sin pisar lo que el usuario ya tenía.

**Sin plugins.** Un plugin es un mecanismo que el usuario tendría que conocer, namespacea
las skills (`nzt:nzt-build`) rompiendo los nombres que nombran las tablas de ruteo, y
**ningún sistema de plugins carga el kernel igual en todos los proveedores**: Codex tiene
plugins, pero ni el de Claude Code ni el de Codex traen un archivo de instrucciones
siempre cargado (D24, revisado el 2026-10-16). Lo que se instala son **skills sueltas en la carpeta de
usuario** y un bloque en el archivo de instrucciones. El único plugin del repo es
`dist/plugin/`, que existe para que `claude plugin eval` tenga un target (D23) y **no se
instala nunca**. Los mods de `mods/` sí son plugins, una capa aparte y opcional (D63): **el
instalador también los instala, actualiza y desinstala en Claude Code, como opción**, y el
método se instala igual sin ellos. Siguen viniendo del marketplace del repo; el instalador
no copia sus archivos (sección 11).

## 2. Destinos de instalación

Instalación **global** (nivel usuario), que es el caso de uso pedido:

**[modify] 2026-10-31:** global es el alcance por defecto, ya no el único. El de proyecto, sus
destinos y por qué no conviven con la global están en la sección 13.

| Proveedor | Instrucciones | Skills | Subagentes (D71, D84) |
|---|---|---|---|
| Claude Code | bloque en `~/.claude/CLAUDE.md` | `~/.claude/skills/<nombre>/` | `~/.claude/agents/nzt-explorer.md`, `nzt-worker.md` |
| Codex | bloque en `$CODEX_HOME/AGENTS.md` | `~/.agents/skills/<nombre>/` | `$CODEX_HOME/agents/nzt-explorer.toml`, `nzt-worker.toml` |

Los subagentes salen de `agents/` del repo, y cada proveedor recibe los de su formato (`.md` o
`.toml`). Cada uno es un archivo más del manifiesto: las mismas reglas de conflicto, edición local,
huérfanos y desinstalación que una skill. Desinstalar saca el archivo y deja la carpeta
`agents/`, que puede tener agentes del usuario.

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
nzt-ai install --provider claude-code|codex|all [--mods all|none|only] [--dry-run]
nzt-ai uninstall --provider claude-code|codex|all [--mods all|none|only] [--dry-run]
nzt-ai status
nzt-ai lint | verify
nzt-ai state check
```

**[modify]** El comando se llama `nzt-ai` (RN-cli-nombre) y suma `state check`
(RN-cli-state-check), sección 12.

**[modify] 2026-10-31:** el menú suma un encabezado con la carpeta y lo instalado, y muestra
solo lo que se puede hacer ahí; los comandos suman `--scope`, `--mode`, `init`, `update`,
`uninstall --all` y `--version`. Sección 13.5 y 13.6.

- `--dry-run` imprime exactamente lo que haría, sin tocar el disco.
- `--mods` es la elección de la sección 11 para Claude Code: `all` el método y los mods,
  `none` solo el método, `only` solo los mods. **Instalar sin `--mods` es `none`**, la línea
  de siempre; **desinstalar sin `--mods` es `all`** (RN-inst-mods-desinstalar). En Codex no
  cambia nada salvo `only`, que en Codex no instala nada.
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
   nombre es el path relativo con `/` → `-`. Su carpeta `references/` viaja adentro, sin
   aplanar (D50): los routers la nombran por ruta relativa. Copia también los subagentes del
   proveedor a su carpeta de agentes (sección 2).
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
  ],
  "mods": ["nzt-state", "nzt-files"]
}
```

`mods` existe solo en el de Claude Code y nombra **los mods que instaló este CLI**: un mod
instalado que no está ahí es del usuario (QT-04 de `specs/nzt-mods.md`). Con solo los mods
instalados, `files` va vacío. El manifiesto se borra cuando no queda ni un archivo ni un mod.

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
│  ├─ Mods/                       # ModCatalog, ClaudePlugins (claude plugin …), ModInstaller
│  └─ Lint/Linter.cs
└─ tests/Nzt.Cli.Checks/          # comprobaciones con destinos temporales y un Claude Code falso
```

- **El contenido se embebe al compilar** (`core/**/*.md`, `skills/**/SKILL.md` y
  `skills/**/references/*.md`): el
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
  **[modify] 2026-10-31:** reabierta por D88: hay `--scope project`, con el set entero
  (sección 13). La instalación parcial sigue sin existir.
- **I2. Duplicación con `install/build.*`.** **Resuelta en la práctica, no eliminada.** Los
  scripts siguen siendo el loop de desarrollo —además arman `dist/` y el plugin de evals, que
  al instalador no le incumben— y el CLI es lo que instala. Lo que evita que diverjan es una
  comprobación: el bloque que escribe el CLI se compara **byte a byte** con el
  `dist/CLAUDE.md` que emitió el build, y si se separan, falla.
- ~~**I3. Versionado.**~~ **Cerrada**: sale del `<Version>` del `.csproj`, que es lo que
  termina en `nztVersion` del manifiesto y en el encabezado del CLI.
- ~~**I5. Distribución sin .NET.**~~ **Cerrada por D46**: un comando de una línea por
  proveedor, que instala NZT directo usando el CLI como herramienta de un solo uso (sección 10).
  **[modify] 2026-10-21:** ya no es de un solo uso; queda instalado como `nzt-ai` (sección 12).

## 10. Instalación de una línea

El usuario no clona el repo, no instala .NET **y no instala el instalador**. Pega una línea
**por proveedor**, igual que con Codex, y lo que queda en la máquina es NZT en ese proveedor:

| | Windows | macOS / Linux |
|---|---|---|
| Claude Code | `powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.ps1 \| iex"` | `curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.sh \| sh` |
| Claude Code, con los mods | `powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.ps1 \| iex"` | `curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.sh \| sh` |
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
| `install-claude-full.ps1`, `install-claude-full.sh` | Claude Code con los mods (RN-inst-linea-completa) |

**Las seis variantes salen de dos fuentes.** En el repo están solo `install/install.ps1` e
`install/install.sh`, con una línea marcada `# nzt:provider` que lee el proveedor de
`NZT_PROVIDER` y otra marcada `# nzt:mods` que lee `NZT_MODS`. `install/variants.sh` —el
mismo que corre CI— reemplaza la primera por el proveedor fijo y, en `install-claude-full`,
la segunda por `all` (QT-09); falla si una marca no está: la lógica existe una sola vez.

**El catálogo de mods viaja embebido**: `.claude-plugin/marketplace.json` entra al ejecutable
como `content/marketplace.json`, así que el instalador ofrece la misma lista que ve quien
instala a mano (RN-inst-mods-cuales).

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
5. **[modify]** **Borra la carpeta temporal**, haya salido bien o mal. En la máquina queda
   NZT en el proveedor, el manifiesto y **`nzt-ai`, que el CLI dejó instalado al correr
   `install`** (RN-cli-queda-instalado).

- **Correr la misma línea otra vez es actualizar.** El manifiesto vive en
  `%LOCALAPPDATA%/nzt/manifests` o `~/.local/share/nzt/manifests` (sección 5), fuera del
  binario, así que un CLI recién bajado reconoce lo que instaló el anterior.
- **Cada corrida baja el binario entero** (~38 MB), y reinstalar reemplaza el `nzt-ai`
  instalado por el de esa versión (RN-cli-actualizar). Lo que baja el tamaño es el trimming
  de 10.1.
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
| `NZT_MODS` | agrega `--mods <valor>` (`all`, `none`, `only`); `install-claude-full` lo fija en `all` | sin `--mods` |

En PowerShell una variable se pasa así:
`$env:NZT_UNINSTALL='1'; irm .../install-claude.ps1 | iex`. En shell:
`curl -fsSL .../install-claude.sh | NZT_UNINSTALL=1 sh`.

### 10.4 Lo que no hace

- ~~**No deja el CLI instalado.**~~ **[modify]** Lo deja, como `nzt-ai`: sección 12.
- **No instala en los dos proveedores a la vez.** Son dos líneas, una por proveedor; correr
  las dos es lo mismo que elegir *Todos* en el menú.
- **No firma los binarios.** Si Windows SmartScreen, un antivirus o Gatekeeper los frenan,
  no está verificado. Firmar es lo que se agrega si pasa.

## 11. Los mods de Claude Code

**Cómo** instala cada mod —el comando, de qué fuente, por qué no activa la actualización
automática, cómo reconoce uno instalado a mano— está en `specs/nzt-mods.md` secciones 6 y 7
(M3).

Origen, el usuario el 2026-10-16: *"Sumar al instalador local la opcion de instalar los mods
en Claude code […] que el instalador al clickear instalar y tocar Claude Code te haga
seleccionar que queres instalar, si los mods de NZT, NZT o todos"*.

### 11.1 Qué se elige

#### RN-inst-que-instalar · origin: usuario 2026-10-16; "solo los mods" sin el método, Q-03
Al instalar en Claude Code se elige qué instalar: **Todo NZT** (el método y los mods), **solo
el método** o **solo los mods**. Todo NZT va primero y es el marcado al abrir. Solo los mods se
permite aunque el método no esté instalado, y la simulación avisa que `nzt-state` muestra el
método y sin él no tiene qué mostrar. (Hasta el 2026-10-17 el aviso nombraba también a
`nzt-context`, retirado: M4 de `specs/nzt-mods.md`.)

#### RN-inst-mods-solo-claude · origin: RN-mod-solo-claude de `specs/nzt-mods.md`
Al elegir solo Codex, la pregunta no aparece. Al elegir Todos los proveedores se hace una sola
vez y vale para Claude Code; para Codex se instala el método y la simulación dice que Codex no
tiene mods. **Solo los mods con Todos los proveedores no instala nada en Codex**: Codex no
tiene mods y el método no se pidió (decisión del agente en la unidad 185, aceptada por el
usuario el 2026-10-17).

#### RN-inst-mods-cuales · origin: propuesta del agente, aceptada 2026-10-16
"Mods" son todos los del catálogo de `specs/nzt-mods.md` sección 5. Elegir uno por uno queda
para la instalación a mano, que sigue existiendo (usuario: *"instalar también de forma manual
debe ser posible"*).

#### RN-inst-mods-simulacion · origin: sección 3 (simular y recién ahí preguntar)
La simulación lista cada mod que se instalaría, actualizaría o dejaría como está, con su
versión, igual que lista las skills.

#### RN-inst-linea-completa · origin: usuario 2026-10-16, Q-01
La línea de Claude Code de hoy sigue instalando solo el método. **Una tercera línea,
`install-claude-full`, instala Todo NZT**, sin menú ni confirmación, como las otras
(sección 10).

### 11.2 Lo que puede salir mal

#### RN-inst-mods-sin-claude · origin: propuesta del agente, aceptada 2026-10-16
Si en la máquina no se puede usar Claude Code desde la terminal, o su versión no alcanza para
mods, el método se instala igual, los mods no, y el reporte dice por qué y muestra los pasos
para instalarlos a mano desde la app. **No cuenta como falla: el código de salida es 0**
(decisión del agente en la unidad 185, aceptada por el usuario el 2026-10-17).

#### RN-inst-mods-falla · origin: propuesta del agente, aceptada 2026-10-16
Si un mod no se puede instalar, el método y los demás mods quedan instalados; el reporte nombra
el que falló y el motivo, y el código de salida lo refleja. Un mod nunca deshace el método.

#### RN-inst-mods-a-mano · origin: usuario 2026-10-16, Q-04
Un mod que el usuario instaló a mano **se actualiza** al instalar NZT, para que el conjunto
quede acorde a la versión de NZT, pero **sigue siendo del usuario**: el instalador no lo
desinstala nunca y no lo instala dos veces.

### 11.3 Desinstalar, actualizar y ver estado

#### RN-inst-mods-desinstalar · origin: propuesta del agente (sección 3: "solo lo que instaló este CLI"); línea, Q-02
Desinstalar en Claude Code pregunta lo mismo que instalar —todo, solo el método, solo los
mods— y quita solo los mods que instaló el instalador. **La línea con `NZT_UNINSTALL=1` quita
el método y esos mods.**

#### RN-inst-mods-actualizar · origin: sección 6 ("reinstalar es actualizar")
Correr la instalación otra vez actualiza también los mods que instaló el instalador.

#### RN-inst-mods-estado · origin: propuesta del agente, aceptada 2026-10-16
Ver estado lista cada mod de NZT en Claude Code: instalado o no, su versión, y si lo instaló el
instalador o el usuario a mano.

### 11.4 Preguntas

#### Q-01 · La línea de Claude Code, ¿instala los mods?
- bloquea: el comportamiento de `install-claude.*`, que no tiene menú
- opciones: A, todo por defecto con `NZT_MODS=0`; B, solo el método con `NZT_MODS=1`; C, una
  tercera línea `install-claude-full`. El agente recomendó C.
- respuesta: **C** · 2026-10-16

#### Q-02 · Desinstalar con la línea, ¿quita también los mods?
- respuesta: **Sí**, los que instaló el instalador (la recomendación del agente) · 2026-10-16

#### Q-03 · "Solo los mods" sin el método instalado, ¿se permite?
- respuesta: **Ok**, con el aviso para `nzt-state` y `nzt-context` · 2026-10-16

#### Q-04 · Un mod instalado a mano, al instalar NZT, ¿se actualiza?
- respuesta: **Sí**, sin dejar de ser del usuario · 2026-10-16

## 12. El CLI instalado: `nzt-ai`

Lo trae el análisis externo de NZT (2026-10-21): nada validaba `Plan/state.json`, y el
usuario eligió que lo valide el CLI (QT-21 de `Plan/state.json`, unidad 305). Hasta acá el
CLI no quedaba en la máquina (D46), así que el agente no tenía qué correr. Pedido del
usuario: *"Habria que hacer que el CLI quede instalado, y que se ejecute mediante el comando
nzt-ai"*.

### 12.1 Instalado

#### RN-cli-nombre · [add] · origin: usuario 2026-10-21
El comando instalado se llama `nzt-ai`, en las tres plataformas. Los assets del release
conservan su nombre (10.1).

#### RN-cli-queda-instalado · [add] · origin: QT-25, QT-23
Instalar —con la línea, el menú o `install`, en cualquier proveedor y con cualquier `--mods`—
deja una copia del CLI que corre como `nzt-ai`: en Windows en `%LOCALAPPDATA%/nzt/bin`, en
macOS y Linux en `~/.local/bin`. Lo hace el CLI, no el script, así que el menú de un binario
del release también lo deja. **Corrido con `dotnet run` desde el repo no lo deja y lo dice**:
no es un binario de un solo archivo, y copiar solo el ejecutable daría un `nzt-ai` que no
arranca. Con `--dry-run` dice dónde lo dejaría y no lo deja. `--bin-dir <ruta>` lo deja en
otra carpeta sin tocar el PATH, como `--manifest-dir`: es lo que usan las comprobaciones.

#### RN-cli-path · [add] · origin: QT-24
En Windows la carpeta se agrega al PATH del usuario, no al de la máquina, y una terminal
nueva ya encuentra `nzt-ai`. En macOS y Linux no se toca ningún archivo del usuario: si la
carpeta no está en el PATH, el reporte lo dice con la línea exacta para agregarla al perfil
del shell. En los dos casos, una terminal ya abierta no lo ve hasta reabrirse, y el reporte lo
dice.

#### RN-cli-actualizar · [add] · origin: sección 6 ("reinstalar es actualizar")
Reinstalar reemplaza el `nzt-ai` instalado por el de la versión que se está instalando.
**[modify] 2026-10-31:** además, `nzt-ai update` se actualiza solo desde el último release
(RN-cli-update).

#### RN-cli-desinstalar · [add] · origin: QT-26
`nzt-ai` y su entrada en el PATH se van cuando, después de desinstalar, no queda ningún
proveedor ni mod instalado por el CLI. Si queda alguno, se queda, porque el agente lo usa.
**[modify] 2026-10-31:** tampoco se va mientras quede un proyecto registrado
(RN-proy-registro).

### 12.2 `nzt-ai state check`

#### RN-cli-state-check · [add] · origin: propuesta del agente sobre QT-21, 2026-10-21
Lee `Plan/state.json` de la carpeta actual y dice si cumple el contrato del estado (hasta D74
en el kernel, desde D74 en `nzt-plan`):

- cada `status` es `todo`, `doing`, `done` o `dropped`, en fases y en unidades;
- cada fase se llama `analysis`, `architecture`, `ux`, `build`, `verify` o `ship` (D69 de
  `specs/nzt-core.md`); un sinónimo como `discovery` también es un problema, aunque el panel
  lo lea;
- a lo sumo una fase `doing`, y a lo sumo una unidad `doing` en todo el archivo;
- los `id` de las unidades no se repiten;
- una unidad `doing` vive en la fase `doing`;
- una fase `done` no tiene unidades `todo` ni `doing`;
- `approved` es `true` o `false`, y las unidades que nombra `autonomy` existen en el plan;
- `delegation`, si está, es `auto`, `ask` u `off` (D71); ausente no es un problema, rige `ask`.

Un estado por tramos (D73 de `specs/nzt-core.md`) lleva `slices` en lugar de `phases`, y
además:

- `slices` exige `version` 2, `version` 2 exige `slices`, y `phases` y `slices` juntos en la
  raíz es un problema;
- `cadence`, si está, es `delivery`, `upfront` o `just-in-time`; ausente rige `upfront`;
- cada tramo tiene un `id` de texto que no se repite, un `status` válido y su lista `phases`;
- dentro de cada tramo valen las reglas de fases de arriba, y además ninguna fase repite
  nombre; los `id` de unidad no se repiten en todo el archivo;
- a lo sumo un tramo `doing`; una fase `doing` solo vive en el tramo `doing`; un tramo
  `done` tiene todas sus fases `done` o `dropped`.

Un estado con `phases` en la raíz se revisa exactamente como antes: una fase repetida en un
v1 no es un problema.

Sin problemas, una línea y código 0. Con problemas, uno por línea, nombrando la unidad o la
fase, y código 1. Sin archivo lo dice y sale con 0: no todo proyecto tiene estado. Un JSON
roto es un problema, con su posición.

### 12.3 Preguntas

#### QT-23 · ¿Dónde queda `nzt-ai`?
- opciones: A, junto al manifiesto (`%LOCALAPPDATA%/nzt/bin`, `~/.local/bin`); B, `~/.nzt/bin`
  en las tres. El agente recomendó A.
- respuesta: **A** · 2026-10-21

#### QT-24 · En macOS y Linux, si la carpeta no está en el PATH, ¿qué hace?
- opciones: A, avisa con la línea exacta y no toca el perfil; B, agrega la línea al perfil.
  El agente recomendó A.
- respuesta: **A** · 2026-10-21

#### QT-25 · ¿Quién deja instalado `nzt-ai`: el CLI o el script?
- opciones: A, el CLI, al instalar; B, solo el script de la línea. El agente recomendó A.
- respuesta: **A** · 2026-10-21

#### QT-26 · Al desinstalar de un proveedor, ¿se va `nzt-ai`?
- opciones: A, cuando no queda nada instalado; B, siempre; C, nunca. El agente recomendó A.
- respuesta: **A** · 2026-10-21

## 13. Instalación por proyecto y menú contextual

> Estado: **especificado, sin construir** (2026-10-31). Reabre D18 (D88 de `specs/nzt-core.md`).

Lo trae el usuario el 2026-10-31. Hoy NZT es global o nada: *"si queres usar un agente solo sin
nzt no podes hacerlo sin desinstalarlo"*, y *"si queres probarlo quizas quieras hacerlo en algo
aislado no en todo"*. Lo pedido es **opt-in**: NZT donde se elige y en ningún otro lado. Pedido
en la misma conversación: que escribir `nzt-ai` abra un menú navegable con estas opciones.

Lo que dice cada proveedor, leído el 2026-10-31, y que decide el diseño:

| | Claude Code | Codex |
|---|---|---|
| Skills de proyecto | `.claude/skills/<nombre>/` | `.agents/skills/<nombre>/`, de la carpeta actual a la raíz del repo |
| Subagentes de proyecto | `.claude/agents/` | `.codex/agents/` |
| Mismo nombre en usuario y proyecto | **gana la de usuario** | no se fusionan: **aparecen las dos** |
| Instrucciones solo del usuario en el proyecto | `CLAUDE.local.md`, leído después de `CLAUDE.md` | no hay: `AGENTS.override.md` **reemplaza** al `AGENTS.md` |
| `AGENTS.md` | lo lee **solo si no hay** `CLAUDE.md` ni `CLAUDE.local.md` | es su archivo |

documented: https://code.claude.com/docs/en/skills, https://code.claude.com/docs/en/memory,
https://learn.chatgpt.com/docs/build-skills,
https://learn.chatgpt.com/docs/agent-configuration/subagents. unverified: si Codex pide
confiar en el proyecto antes de cargar `.codex/agents/`.

### 13.1 Alcance

#### RN-proy-alcance · [add] · origin: usuario 2026-10-31, QP-01
Hay dos alcances: **usuario**, el de las secciones 2 a 12 y el de siempre por defecto, y
**proyecto**. Quien ya instaló global no ve ningún cambio.

#### RN-proy-raiz · [add] · origin: propuesta del agente, aceptada 2026-10-31
El proyecto es la raíz del repo git que contiene la carpeta actual: la primera carpeta hacia
arriba con `.git`, sea carpeta o archivo (un worktree). Fuera de un repo es la carpeta actual,
y el reporte lo dice. **Si la raíz es la carpeta del usuario, se rechaza**: ahí `.claude/` y
`.agents/` son los destinos globales, y el alcance de proyecto pisaría el de usuario.

#### RN-proy-destinos · [add] · origin: tabla de esta sección
En el proyecto, cada proveedor escribe lo mismo que en la sección 2, con otra raíz:

| Proveedor | Instrucciones, *Solo para mí* | Instrucciones, *Compartido* | Skills | Subagentes |
|---|---|---|---|---|
| Claude Code | `CLAUDE.local.md` | `CLAUDE.md` | `.claude/skills/<nombre>/` | `.claude/agents/` |
| Codex | `AGENTS.md` | `AGENTS.md` | `.agents/skills/<nombre>/` | `.codex/agents/` |

El bloque, los marcadores, el aplanado, los conflictos, las ediciones locales y los huérfanos
son los de las secciones 4, 6 y 7, sin cambios. Los adapters ya nombran las dos rutas de
skills: el kernel no cambia.

#### RN-proy-exclusivo · [add] · origin: QP-02
**Un proveedor está instalado global o en proyectos, nunca de las dos formas a la vez.** En
Claude Code la global taparía la del proyecto, y en Codex cada skill aparecería dos veces.

- Instalar en un proyecto con la global de ese proveedor presente: el menú ofrece
  *Desinstalar la global y seguir* o *Volver*, y la desinstalación entra en la misma
  simulación. Por comando, `install --scope project` corta sin escribir y dice que primero hay
  que desinstalar la global. **Nunca se desinstala la global sin preguntar.**
- Instalar global con proyectos registrados de ese proveedor: los lista, avisa que la global
  los taparía y pregunta *Seguir* o *Volver*.
- Un repo *Compartido* abierto por alguien con la global instalada no se puede impedir: el
  menú y `status`, abiertos en ese repo, dicen que la global tapa el proyecto.

#### RN-proy-mods · [add] · origin: propuesta del agente, aceptada 2026-10-31
**Los mods siguen siendo globales.** Instalar en un proyecto no pregunta *Todo NZT / método /
mods*, y `--mods` con `--scope project` es un error que no toca nada. En un proyecto sin NZT un
mod no tiene qué mostrar, así que no hace falta sacarlo.

### 13.2 Los dos modos

#### RN-proy-modos · [add] · origin: propuesta del agente, aceptada 2026-10-31
Instalar en un proyecto elige el modo, y **el defecto es *Solo para mí***, porque el motivo
del pedido es personal:

- **Solo para mí.** Nada aparece en el diff del repo. Lo que el CLI crea —skills, subagentes,
  `CLAUDE.local.md`, `.nzt/`— se anota en el `info/exclude` del repo, el ignore local que git
  no versiona, dentro de un bloque `# nzt:start` / `# nzt:end` que es lo único que el CLI toca
  de ese archivo. No se toca el `.gitignore`.
- **Compartido.** Para commitear: quien clona el repo tiene NZT sin instalar nada, en la
  versión del proyecto. Nada se excluye.

Fuera de un repo no hay qué excluir: el modo no se pregunta y el reporte lo dice.

#### RN-proy-codex-personal · [add] · origin: tabla de esta sección
Codex no tiene instrucciones solo del usuario. En *Solo para mí*, si `AGENTS.md` no existe se
crea y se excluye; si existe y git lo versiona, **el bloque va a aparecer en el diff**: el menú
lo dice antes de simular y ofrece *Seguir igual* o *Volver*. Por comando se escribe, y el
reporte lo dice.

#### RN-proy-agents-md · [add] · origin: tabla de esta sección
Crear el archivo de Claude Code en un repo que solo tiene `AGENTS.md` haría que Claude deje de
leer ese `AGENTS.md`, sin aviso. En ese caso el archivo que se crea lleva `@AGENTS.md` fuera del
bloque, y el reporte lo dice. **Si ese `AGENTS.md` tiene un bloque de NZT** —Codex instalado en
el proyecto—, no se importa: traería el kernel dos veces, con el adapter de Codex. Si además
tiene contenido fuera del bloque, el reporte avisa que Claude Code no lo va a leer (QP-04).

#### RN-proy-worktree · [add] · origin: documentación de `CLAUDE.local.md`
*Solo para mí* existe solo en el worktree donde se instaló, como cualquier archivo excluido.
El `info/exclude` es el del repo, común a todos sus worktrees. El reporte no lo repite: lo
dice el runbook.

### 13.3 Manifiesto y registro

#### RN-proy-manifiesto · [add] · origin: propuesta del agente, aceptada 2026-10-31
El manifiesto de un proyecto vive en el proyecto, en `.nzt/manifests/<proveedor>.json`, con el
formato de la sección 5, el modo, y **rutas relativas a la raíz**: viaja con los archivos, y un
repo *Compartido* clonado en otra carpeta sigue siendo administrable. El de usuario no cambia
de lugar.

#### RN-proy-backup · [add] · origin: sección 7 (backup del archivo de instrucciones)
En un proyecto el backup del archivo de instrucciones va a `.nzt/backup/`, que se excluye en
los dos modos: es del usuario, no del repo.

#### RN-proy-registro · [add] · origin: propuesta del agente, aceptada 2026-10-31
El CLI anota cada proyecto donde instala en `projects.json`, junto a los manifiestos de
usuario: ruta, proveedores, modo y versión. Es un índice, no la verdad: la verdad es el
manifiesto del proyecto. Una entrada cuya carpeta ya no existe, o sin manifiesto, se descarta
al leerlo. Lo usan el menú, `status`, `update` y RN-cli-desinstalar.

#### RN-proy-version · [add] · origin: propuesta del agente, aceptada 2026-10-31
**Instalar nunca baja de versión sin decirlo.** Si el manifiesto de un proyecto es de una
versión más nueva que el CLI —un repo *Compartido* que actualizó otro—, instalar y desinstalar
cortan, y el menú ofrece *Actualizar* primero.

### 13.4 Actualizar

#### RN-cli-update · [add] · origin: propuesta del agente, aceptada 2026-10-31
`nzt-ai update` baja el binario de la plataforma del último release, verifica su SHA256
contra `SHA256SUMS` —lo mismo que el script de la sección 10.2, y con las mismas
`NZT_VERSION` y `NZT_DOWNLOAD_BASE`—, se reemplaza y **corre el binario nuevo** para reinstalar
cada proveedor global y actualizar los mods que instaló, porque el contenido viaja embebido en
el binario. Ya al día, lo dice y sale con 0. Corrido con `dotnet run` no actualiza y lo dice,
como RN-cli-queda-instalado.

#### RN-cli-update-windows · [add] · origin: `CliCommand.Install` (un `nzt-ai` corriendo no se pisa)
En Windows el ejecutable que corre no se puede pisar: se renombra a `nzt-ai.old`, se escribe
el nuevo y el viejo se borra en la siguiente ejecución.

#### RN-cli-update-proyectos · [add] · origin: RN-proy-modos
Los proyectos no se actualizan solos: en *Compartido*, actualizar genera un diff que nadie
pidió. Después de la global, `update` lista los proyectos registrados con su versión y modo, y
pregunta *Todos*, *Elegir* o *Ninguno*. Por comando, `--projects all|none`, y sin la opción es
`none`. Dentro de un proyecto, reinstalar es actualizarlo (sección 6).

### 13.5 El menú

#### RN-menu-contexto · [add] · origin: usuario 2026-10-31, QP-03
`nzt-ai` sin argumentos abre el menú de la sección 3, ahora con **un encabezado que dice dónde
se está y qué hay**:

```
NZT 3.2.0
  Carpeta   C:\...\mi-repo  (repo git)
  Acá       sin NZT
  Global    Claude Code 3.1.0 · Codex no
  Mods      2 instalados

  ¿Qué querés hacer?
  > Instalar en este proyecto
    Instalar global
    Desinstalar
    Actualizar            hay una versión nueva: 3.2.1
    Ver estado
    Verificar el contenido
    Salir
```

#### RN-menu-solo-posible · [add] · origin: sección 3 ("no existe una opción inválida")
**El menú muestra solo lo que se puede hacer ahí.** Es la regla de la sección 3, que no haya
una opción inválida, aplicada al contexto:

- Sin nada instalado no aparece *Desinstalar*.
- Con NZT en el proyecto, *Instalar en este proyecto* pasa a ser *Reinstalar en este
  proyecto*.
- En la carpeta del usuario no aparece *Instalar en este proyecto* (RN-proy-raiz).
- *Actualizar* aparece solo cuando hay una versión nueva, y lo dice en la misma línea. El
  menú la busca al abrir, con un límite de dos segundos; si falla o no llega a tiempo, no
  dice nada y *Actualizar* no aparece (QP-05). `nzt-ai update` funciona igual.

#### RN-menu-flujos · [add] · origin: propuesta del agente, aceptada 2026-10-31
Cada acción es una serie corta de listas, y la última es siempre la simulación con `No`
primero:

- **Instalar en este proyecto**: proveedor (marcado de antemano el que el repo ya usa: `.claude/`
  o `CLAUDE.md` es Claude Code, y `AGENTS.md`, `.agents/` o `.codex/` es Codex) → *Solo para
  mí* o *Compartido* → si hay una global de ese proveedor, RN-proy-exclusivo → simulación.
- **Instalar global**: el flujo de siempre (proveedor → *Todo NZT / método / mods*), más el
  aviso de RN-proy-exclusivo.
- **Desinstalar**: solo lo que existe, entre *De este proyecto*, *Global* y *Todo* —global,
  proyectos registrados, los mods que instaló el CLI y el CLI—.
- **Actualizar**: el CLI y la global, y después los proyectos (RN-cli-update-proyectos).
- **Ver estado**: el encabezado en detalle, y cada proyecto registrado con su versión y modo.

#### RN-menu-init · [add] · origin: propuesta del agente, aceptada 2026-10-31
`nzt-ai init` abre el menú directo en *Instalar en este proyecto*. Sin terminal no abre y
remite a `install --scope project`, como el menú.

### 13.6 Comandos

```
nzt-ai                      el menú
nzt-ai init                 el menú, en "Instalar en este proyecto"
nzt-ai install   --provider <id> [--scope user|project] [--mode personal|shared] [--mods all|none|only] [--dry-run]
nzt-ai uninstall --provider <id> [--scope user|project] [--dry-run]
nzt-ai uninstall --all [--dry-run]
nzt-ai update [--projects all|none] [--dry-run]
nzt-ai status
nzt-ai verify | lint
nzt-ai state check
nzt-ai --version
```

- `--scope` es `user` por defecto; `--mode`, `personal` por defecto, y solo vale con
  `--scope project`. `--scope project` actúa sobre el proyecto de la carpeta actual.
- `uninstall --all` es *Todo* del menú.
- Las comprobaciones siguen sin tocar la máquina real: suman una raíz de proyecto temporal, un
  `--registry-dir` como el `--manifest-dir`, y un release falso por `NZT_DOWNLOAD_BASE`.

### 13.7 Preguntas

#### QP-01 · ¿Para qué es la instalación por proyecto?
- opciones: A, opt-in: NZT donde se elige, para usar el agente sin NZT o probarlo aislado; B,
  para el equipo: commitearlo en el repo. El agente preguntó sin recomendar.
- respuesta: **A** · 2026-10-31. *Compartido* queda como segundo modo (RN-proy-modos).

#### QP-02 · Global y proyecto del mismo proveedor, ¿pueden convivir?
- opciones: A, no: excluyentes, y el CLI ofrece desinstalar la global; B, sí, con aviso. El
  agente recomendó A: en Claude Code gana la de usuario y en Codex se duplican.
- respuesta: **A** · 2026-10-31

#### QP-03 · ¿Cómo se usa el CLI sin acordarse de los comandos?
- respuesta: el usuario, 2026-10-31: *"estaria bueno que escribir nzt-ai abra un menu de
  opciones como una consola digamos navegable con estas opciones"*. Se extiende el menú que ya
  existe (RN-menu-contexto).

#### QP-04 · Claude Code en un proyecto cuyo `AGENTS.md` tiene un bloque de NZT (Codex instalado ahí)
Importar `@AGENTS.md` traería el kernel dos veces, con el adapter de Codex. No importarlo
deja a Claude sin el resto de ese archivo.
- opciones: A, no importar, y si `AGENTS.md` tiene contenido fuera del bloque, el reporte lo
  dice; B, importar igual; C, no permitir Claude Code en el proyecto en ese caso. El agente
  recomendó A: si el `AGENTS.md` lo creó NZT, no se pierde nada.
- respuesta: **A** · 2026-10-31

#### QP-05 · ¿Cuándo busca el menú una versión nueva?
- opciones: A, al abrir, con un límite de dos segundos y sin decir nada si falla; B, solo al
  elegir *Actualizar*. El agente recomendó A: si no, *Actualizar* tendría que aparecer
  siempre.
- respuesta: **A** · 2026-10-31

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba. Va acá y no en
`Docs/Product/history.md` porque este repo guarda sus documentos en `specs/` (como las specs de
los mods).

### 2026-10-17 · El instalador ofrece los mods en Claude Code
Type:     add
Change:   al instalar en Claude Code se elige Todo NZT, solo el método o solo los mods; desinstalar y ver estado cubren los mods, y una tercera línea, `install-claude-full`, instala todo sin preguntar.
Reason:   el usuario, el 2026-10-16: que el instalador "te haga seleccionar que queres instalar, si los mods de NZT, NZT o todos", sin que NZT pase a ser un plugin y sin perder la instalación a mano.
Impact:   RN-inst-que-instalar · RN-inst-mods-solo-claude · RN-inst-mods-cuales · RN-inst-mods-simulacion · RN-inst-linea-completa · RN-inst-mods-sin-claude · RN-inst-mods-falla · RN-inst-mods-a-mano · RN-inst-mods-desinstalar · RN-inst-mods-actualizar · RN-inst-mods-estado, todas nuevas
Decision: los mods se instalan con los comandos de Claude Code desde `main` y sin activar la actualización automática (M3 de `specs/nzt-mods.md`, QT-02 y QT-03).
