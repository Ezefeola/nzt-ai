# Instalador · mods de Claude Code en esta máquina — 2026-10-16

Unidad 188, sobre `specs/nzt-installer.md` sección 11 y `specs/nzt-mods.md` sección 6 (M3,
QT-04, QT-07, QT-08). Escenarios acordados en el plan: simulación, instalar todo, estado,
desinstalar.

**Con qué se corrió:** `dotnet run --project installer/src/Nzt.Cli` desde la rama
`installer-mods` (sin commitear), contra el Claude Code real de esta máquina (2.1.301, Windows 11).
- **Estado de partida:** NZT 1.1.0 instalado en Claude Code; marketplace `nzt` registrado
  **desde la carpeta local** del repo (el caso de QT-08); `nzt-state`, `nzt-context`,
  `nzt-changes` y `nzt-files` instalados a mano; `nzt-hub` sin instalar.
- **Datos:** ninguno creado. El manifiesto de Claude Code se copió antes de empezar
  (`%TEMP%/nzt188/manifest-antes.json`, fuera del repo).
- **Estado final:** igual al de partida en los mods; el método queda en 1.2.0 (el de la rama),
  que es lo que hace instalar.

| # | Escenario | Esperado | Resultado |
|---|---|---|---|
| I-01 | `install --provider claude-code --mods all --dry-run` | Lista el método y cada mod con lo que pasaría; usa el `nzt` de la carpeta y lo dice; los 4 a mano figuran como tales; `nzt-hub` "se instala"; no toca nada | **passed** |
| I-02 | `install --provider claude-code --mods all --yes` | Método actualizado (1.1.0 → 1.2.0); `nzt-hub` instalado; los 4 a mano actualizados si hay versión nueva, sin pasar a ser de NZT; el reporte dice cómo activar la actualización automática; exit 0 | **passed** |
| I-03 | `status` después de I-02 | Versión 1.2.0; cada mod con versión; `nzt-hub` "lo instaló NZT", los otros "instalado a mano" | **passed** |
| I-04 | Manifiesto después de I-02 | `"mods": ["nzt-hub"]` y nada más | **passed** |
| I-05 | `uninstall --provider claude-code --dry-run` (todo) | Saca los 146 archivos del método y solo `nzt-hub`; los 4 a mano "se quedan"; el marketplace queda | **passed** (solo simulado: correrlo sacaba el método de esta máquina) |
| I-06 | `uninstall --provider claude-code --mods only --yes` | Desinstala `nzt-hub`; los 4 a mano se quedan; el método queda; exit 0 | **passed** |
| I-07 | `status` y `claude plugin marketplace list` después de I-06 | `nzt-hub` "no instalado", los 4 a mano siguen, método 1.2.0; marketplace `nzt` desde la carpeta sigue registrado | **passed** |

Salidas reales, resumidas (I-02 y I-06):

```
  mods           marketplace nzt (C:\Users\ezefe\OneDrive\Escritorio\General\Projects\AI\nzt-ai)
  nzt-state      al día, 0.4.0 · instalado a mano
  nzt-context    al día, 0.2.0 · instalado a mano
  nzt-changes    al día, 0.5.0 · instalado a mano
  nzt-files      al día, 0.1.1 · instalado a mano
  nzt-hub        instalado, 0.1.0
  Abrí una sesión nueva de Claude Code, o corré /reload-plugins, para ver los mods.
  Para que se actualicen solos: /plugin → Marketplaces → nzt → Enable auto-update.
```

```
  mods           solo los que instaló este CLI; el marketplace nzt queda
  nzt-state      0.4.0, instalado a mano: se queda
  ...
  nzt-hub        desinstalado
```

## Lo que queda sin probar

- **Las líneas de una línea** (`install-claude-full.ps1` / `.sh`, y `install-claude` con
  `NZT_UNINSTALL=1` sacando los mods): no existen hasta la próxima release. Se prueban al publicarla.
- **Marketplace registrado desde GitHub** (`Ezefeola/nzt-ai`, el caso de un usuario nuevo): esta
  máquina tiene el de la carpeta y no se reemplazó, a propósito (QT-08). Lo cubren los checks con
  `FakeClaude`, no una corrida real.
- **Sin `claude` o con versión < 2.1.287** (RN-inst-mods-sin-claude): cubierto por los checks, no
  en esta máquina.
- **Un mod que se actualiza de verdad**: ninguno tenía versión nueva, todos dieron "al día".
- **Que los mods carguen en una sesión** después de instalar: no se abrió una sesión nueva.
- La desinstalación completa (I-05) solo se simuló.
