# NZT — Instalador

> Estado: **construido** (v0.1.0) · `installer/src/Nzt.Cli` · Runbook en
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

    1) Instalar
    2) Desinstalar
    3) Verificar el contenido
    4) Ver estado
    5) Salir

  Opción:
```

- **El menú es un bucle**: verificar y ver estado no son el final de nada, así que vuelve a
  preguntar hasta que se elige salir.
- **Instalar y desinstalar preguntan el destino** —Claude Code, Codex, todos, o volver—,
  imprimen la simulación completa y piden confirmación con **`No` por defecto**. Volver no
  elige ningún proveedor, y ningún proveedor significa que no se escribe nada.
- **Desinstalar dice antes de simular qué alcance tiene**: solo lo que instaló este CLI,
  según su manifiesto.
- **Verificar el contenido** lista skill por skill —líneas y chars de description—, después
  los problemas y el total del listado contra el piso de Codex. Es el mismo lint del modo no
  interactivo, con el detalle que hace verificable la palabra *verificar*.
- **Sin entrada —una tubería cerrada, no una terminal— el menú sale en vez de girar**, que es
  el modo de falla de un bucle sobre `ReadLine`.

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
│  ├─ Nzt.Cli.csproj              # net10.0, console, sin dependencias externas
│  ├─ Program.cs                  # menú, argumentos y reporte
│  ├─ Content/                    # catálogo embebido y frontmatter
│  ├─ Providers/Provider.cs       # un destino por proveedor
│  ├─ Install/                    # Installer, InstructionBlock, Manifest
│  └─ Lint/Linter.cs
└─ tests/Nzt.Cli.Checks/          # comprobaciones con destinos temporales
```

- **El contenido se embebe al compilar** (`core/**/*.md` y `skills/**/SKILL.md`): el
  ejecutable *es* el set, y su versión es la versión del set.
- **Sin dependencias de paquetes.** Temper usa Spectre.Console; acá la salida es lo bastante
  simple como para no pagar una dependencia que después hay que mantener.
- Multiplataforma: las rutas salen de `Environment.SpecialFolder.UserProfile`, nunca de
  concatenar strings.
- Distribución: se usa desde el repo con .NET 10. Un binario self-contained es una opción, no
  una necesidad todavía.

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
