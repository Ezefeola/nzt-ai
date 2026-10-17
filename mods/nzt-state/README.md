# nzt-state

> Versión **0.5.0** · spec en [`specs/mods/nzt-state/spec.md`](../../specs/mods/nzt-state/spec.md)

Un panel lateral de Claude Code que muestra el plan y el estado de la corrida de NZT,
leídos de `Plan/state.json`, y se actualiza en vivo mientras el agente trabaja.

```

 NZT  Estado
Plan  ● aprobado                         ▄▄████████▄▄
Modo  ⚡ autónomo · 80–82 sin            ██ ▀▀  ▀▀ ██
      frenar · 1 de 3 hechas             ████████████
                                          ▀█▀ ▀▀ ▀█▀
Objetivo Mods de NZT: spec, el              Build
mod en mods/ y el catálogo.

✓ Análisis → ● Build → ○ Verificación

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

## Cómo se usa

```
/nzt-state
```

Abre el panel si lo cerraste; en un proyecto con `Plan/state.json` ya se abre solo al
empezar la sesión. **Un clic** en el título de una sección (Pendientes, Hechas,
Descartadas, Notas para retomar) o en el de una fase dentro de ella la pliega o la despliega.

De arriba hacia abajo muestra:

- Arriba a la derecha, el personaje de la fase en curso, animado, con el nombre de la fase
  debajo. A su izquierda: si el plan está aprobado, en qué modo corre (acompañado, o
  autónomo con la tanda, cuántas unidades lleva hechas y en cuáles frena igual) y el
  objetivo de la corrida, con la etiqueta **Objetivo**. Con menos de 40 columnas útiles no
  entran lado a lado, y el personaje va centrado arriba, con lo demás debajo.
- La línea de fases de la corrida con su estado, el porcentaje de avance
  (hechas sobre todas menos las descartadas) y hace cuánto se actualizó.
- La unidad en curso con su detalle y lo que se está esperando. Si tenés
  [`nzt-questions`](../nzt-questions/README.md) con preguntas sin contestar, debajo dice
  `? n preguntas para contestar` y **Contestar ›** lo abre; si Claude está trabajando, se abre
  al terminar el turno. Sin `nzt-questions`, o sin preguntas, no dice nada.
- Las pendientes, las hechas y las descartadas, agrupadas por fase, y las **notas para retomar**: lo que una sesión nueva necesita saber después de `/clear`. Al abrir el
  panel solo está desplegada la fase en curso.

Avisa cuando el estado rompe el formato del kernel: una unidad con un status que no existe,
más de una unidad en curso, más de una fase en curso, o una tanda que nombra unidades que no están. No lo corrige.

### Fases y personajes

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

Una fase que NZT no conoce usa el cangrejo sin sombrero y un color neutro.

## Dónde aparece

Al costado de la conversación, cuando Claude Code tiene lugar para ponerlo; si no, queda
esperando y `/nzt-state` dice por qué. Se abre solo al empezar la sesión si la carpeta donde
se abrió tiene `Plan/state.json`; en una subcarpeta del proyecto, o en un proyecto sin estado,
no aparece, y abierto con `/nzt-state` dice que no hay estado hasta que el archivo exista.

Un cambio en el estado se ve en 2 segundos como máximo, y en el acto cuando lo escribe el
agente. Lee también los estados escritos con formatos anteriores de NZT. El panel solo lee:
no escribe ni corrige `Plan/state.json`.

En la terminal se dibuja con celdas de color, y se ve completo en terminales de 24 bits
(Windows Terminal, iTerm2, Ghostty, kitty, WezTerm; Terminal.app desde macOS Tahoe). En la
app de escritorio y en VS Code se dibuja como SVG, con los mismos dibujos.

## Idioma

El panel habla **español** (por defecto) o **inglés**. Se elige al instalarlo y se cambia
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
los proyectos.

También viene con NZT: la línea `install-claude-full`, o el instalador con `--mods all`,
instala todos los mods (sección **Mods** del [`README.md`](../../README.md) del repo).

**Para actualizarlo**, la actualización automática viene apagada: se activa una vez en
`/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**, y cada sesión nueva baja la
versión nueva y avisa `Run /reload-plugins`. A mano: `claude plugin update nzt-state@nzt` en
la terminal, o volver a correr el instalador de NZT.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-state@nzt`.

## Desarrollo

```bash
claude plugin validate mods/nzt-state   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-state       # los tests de hooks/*.test.ts
claude --plugin-dir mods/nzt-state      # una sesión con el mod cargado desde la carpeta
```

Para ver el panel con un estado que tiene de todo —fases hechas, en curso, pendientes y
descartadas, con unidades en cada estado— abrí una sesión en `mods/nzt-state/demo/`, que
trae su propio `Plan/state.json` de prueba.

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo.

El chequeo de tipos (`tsc -p mods/nzt-state/tsconfig.json`) necesita los tipos del motor en
`.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta, con
su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-state/spec.md`](../../specs/mods/nzt-state/spec.md),
y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
