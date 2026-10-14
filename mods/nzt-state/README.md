# nzt-state

Un panel lateral de Claude Code que muestra el plan y el estado de la corrida de NZT,
leídos de `Plan/state.json`, y se actualiza en vivo mientras el agente trabaja.

```
 NZT
Plan  ● aprobado
Modo  ⚡ autónomo · 80–82 sin frenar · 1 de 3 hechas

✓ Análisis → ● Build → ○ Verificación

Mods de NZT: spec, el mod en mods/ y el catálogo.

3 de 5 unidades hechas                         60%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                 actualizado recién
EN CURSO
▶ 81  Docs: README del mod + sección Mods
▾ PENDIENTES · 1
Verificación
○ 82  Verificar: tests, build y links
▸ HECHAS · 3
```

**Es opcional.** NZT funciona completo sin el panel: el estado vive en `Plan/state.json`
igual. Funciona solo en Claude Code, porque Codex no tiene mods.

## Qué muestra

- Si el plan está aprobado y en qué modo corre: acompañado, o autónomo con la tanda, cuántas
  unidades lleva hechas y en cuáles frena igual.
- Las fases de la corrida con su estado, el objetivo y el porcentaje de avance.
- La unidad en curso con su detalle, las pendientes agrupadas por fase y lo que se está
  esperando.
- Las hechas, las descartadas y las notas, en secciones que se pliegan con un clic.

Se abre solo al empezar la sesión en un proyecto que tiene `Plan/state.json`; en los demás
no aparece, y `/nzt-state` lo abre igual. Lee también los estados escritos con formatos
anteriores de NZT, y avisa cuando el estado rompe el formato: una unidad con un status que
no existe, más de una unidad en curso, o una tanda que nombra unidades que no están.

## Fases y personajes

Dentro de **Pendientes**, **Hechas** y **Descartadas** las unidades van agrupadas por fase, y
cada grupo se pliega con un clic: al abrir el panel solo está desplegada la fase en curso.

Cada fase tiene su color y un cangrejo pixelado con su sombrero. El de la fase en curso
camina arriba del panel; los demás aparecen en miniatura en la línea de fases y en los
grupos.

| Fase | Sombrero | Color |
|---|---|---|
| Análisis | birrete | violeta |
| Arquitectura | casco de obra | azul |
| UX | boina | rosa |
| Build | casco con llave, y un martillo chico en alto en la mano derecha | naranja |
| Verificación | gorro de detective con lupa | verde agua |
| Release | galera gris con cinta dorada | dorado |

En la terminal se dibuja con celdas de color, y se ve completo en terminales de 24 bits
(Windows Terminal, iTerm2, Ghostty, kitty, WezTerm; Terminal.app desde macOS Tahoe). En la
app de escritorio y en VS Code se dibuja como SVG, con los mismos dibujos.

## Idioma

El panel habla **español** (por defecto) o **inglés**. Se elige al instalarlo, y se cambia
en el menú de configuración de Claude Code o con:

```bash
claude plugin configure nzt-state
```

Lo que viene del estado —objetivo, unidades, notas— se muestra tal como está escrito.

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.275 o posterior):

```
/plugin install nzt-state --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos
los proyectos. El panel se abre al empezar cada sesión, y con `/nzt-state` se vuelve a
abrir si lo cerraste.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-state`. Para
actualizarlo: `claude plugin update nzt-state`.

## Desarrollo

```bash
claude plugin validate mods/nzt-state   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-state       # los tests de hooks/*.test.ts
claude --plugin-dir mods/nzt-state      # una sesión con el mod cargado desde la carpeta
```

Para ver el panel con un estado que tiene de todo —fases hechas, en curso, pendientes y
descartadas, con unidades en cada estado— abrí una sesión en `mods/nzt-state/demo/`, que
trae su propio `Plan/state.json` de prueba.

El chequeo de tipos (`tsc -p mods/nzt-state/tsconfig.json`) necesita los tipos del motor
en `.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la
carpeta, y git no los sigue.

La spec del comportamiento está en [`specs/mods/nzt-state.md`](../../specs/mods/nzt-state.md),
y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
