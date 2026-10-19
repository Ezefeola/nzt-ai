# nzt-files

> Versión **0.2.0** · spec en [`specs/mods/nzt-files/spec.md`](../../specs/mods/nzt-files/spec.md)

Un panel lateral de Claude Code para **recorrer el proyecto como el explorador de VS Code**:
arriba el árbol de carpetas y archivos, abajo el archivo elegido, los dos a la vez. Sirve
para ubicar algo y leerlo sin salir de la conversación y sin pedirle a Claude que lo lea, y
para ver **qué lee y qué escribe Claude** mientras trabaja.

```
╭────────────────────────────────────────────────────────╮
│  NZT  Archivos        ⑂ mods → origin/mods ↑2 · ● 9 · Σ │
│ ⌕ Buscar (s)                                 ↑ ↓ ← →   │
│ ▸ mods/                               19 oct   M:2     │
│ ▸ Plan/                               19 oct   U:1 M:1 │
│ ▾ specs/                              19 oct   M:2     │
│     mockup.html              +212 -96 19 oct   M       │
│     spec.md                  +241 -18 19 oct   M       │
│   README.md                            9 oct           │
│ ────────────────────────────────────────────────────── │
│ specs/mods/nzt-files/spec.md                           │
│ M modificado · Markdown · 31 KB · 412 líneas           │
│ ☑ Markdown  Ampliar  Copiar ruta  Abrir ↗              │
│ Mod · nzt-files — explorador del proyecto              │
│ (el Markdown dibujado, de a bloque)                    │
│ líneas 1–26 de 412 · de a bloque                  ▲ ▼  │
│ ● commit hecho · nzt-files: README de 0.2.0            │
│ [ Cerrar ]                                             │
╰────────────────────────────────────────────────────────╯
```

El panel mide siempre lo mismo: abrir carpetas o elegir otro archivo no lo estira ni mueve
el botón. El mockup completo, con todos sus estados, está en
[`specs/mods/nzt-files/mockup.html`](../../specs/mods/nzt-files/mockup.html).

**Es opcional.** NZT funciona completo sin el panel. Funciona solo en Claude Code, porque
Codex no tiene mods. Las marcas de git necesitan que el proyecto esté en un repositorio; sin
repositorio el árbol se ve igual, sin marcas.

**No ocupa contexto.** El panel no le agrega nada a lo que Claude lee: ni a tus mensajes, ni al
empezar la sesión, ni a los resultados de las herramientas. Mira qué herramienta usa Claude y
sobre qué archivo, y nada más: la herramienta hace lo mismo y devuelve lo mismo que sin el panel.

## Cómo se usa

Se abre solo al costado de la conversación cuando empieza la sesión, si hay lugar (se apaga en
`/config`). `/nzt-files` lo abre o lo cierra.

| Tecla | Hace |
|---|---|
| `j` / `k` (o ↓ / ↑ en el panel) | recorrer las filas del árbol |
| `l` / `h` (o → / ←) | abrir la carpeta o mostrar el archivo / cerrarla o subir a la que la contiene |
| Tab y Enter, o clic | ir a una fila; abrir o cerrar la carpeta, o mostrar el archivo |
| doble clic, `o` o **Abrir ↗** | abrir el archivo con su app (un `.sln`, en Visual Studio) |
| `s` | ir a la búsqueda |
| `c` o **Copiar ruta** | copiar la ruta de la fila desde la carpeta del proyecto |
| `a` o **Ampliar** | el archivo en todo el panel; **← Árbol** vuelve |
| `m` o **☑ Markdown** | ver un Markdown dibujado o como fuente |
| RePág / AvPág, rueda | mover el archivo de a una página / de a una línea |
| `Σ` | cambiar la columna entre tamaño y fecha o edad |
| Escape | vaciar la búsqueda, salir de lo ampliado o cerrar |

**El árbol** empieza en la carpeta del proyecto: primero las carpetas, después los archivos,
por nombre. Solo se oculta `.git`. Cuando no entra, los bordes dicen `↑ n más` y `↓ n más`.
Cada fila lleva a la derecha la **fecha** de su último cambio (o la **edad**, o el **tamaño**:
el de una carpeta se calcula por detrás y dice `…` mientras tanto).

**Lo que hace Claude** se pinta en el árbol: **violeta** lo que lee, **naranja** lo que
escribe, **verde** lo que commitea. El color dura mientras corre la herramienta y se apaga en
unos 3 segundos; si falló o la rechazaste, se va en el momento. Una carpeta cerrada toma el
color de lo que tiene adentro. Con **Seguir a Claude**, el árbol abre las carpetas y se mueve
hasta el archivo. Mencionar `@ruta` en un mensaje también lo deja a la vista.

**Git**, como en VS Code: **M** modificado (con las líneas `+12 -3`), **U** nuevo sin seguir,
**A** nuevo agregado, **D** borrado; una carpeta dice cuántos tiene de cada uno (`U:1 M:2`, o
un **●** si el panel es angosto). El encabezado dice la rama, la remota y `↑n` `↓n`. La fila de
abajo dice la operación de git que corre Claude (`↻ haciendo push…`) y cómo terminó.

**El archivo** muestra su ruta, su marca, su tipo, su tamaño y sus líneas, y el contenido con
número de línea y colores según el lenguaje. Un Markdown se ve **dibujado**, de a bloque, con
la casilla para verlo como fuente. Un binario dice que lo es; uno de más de 5.000 líneas o
1 MB muestra el principio y avisa que sigue; uno de más de 4 MiB dice que Claude Code no deja
a un mod leerlo.

**La búsqueda** filtra el árbol por la ruta, aunque esté en carpetas cerradas (hasta 60
resultados); Enter elige el primero. No entra en `node_modules`, `bin`, `obj`, `dist` ni
`target`.

## Dónde aparece

Claude Code pone el panel **al costado de la conversación** solo en pantalla completa y con
la terminal de 110 columnas o más (al empezar la sesión, de 144); ahí lo abre de 58 columnas y
con todo el alto. Si no, `/nzt-files` lo pone **sobre el prompt**, de 24 filas, y dice por qué.

Mientras está abierto se actualiza solo: cada vez que Claude escribe un archivo o corre un
comando, y cada 3 segundos para lo que cambie por fuera. El panel solo lee: no edita, no
crea, no renombra ni borra nada, ni hace operaciones de git.

## Ajustes

En `/config`, en `nzt-files`, o con `claude plugin configure nzt-files`. Un cambio vale desde ese
momento.

| Ajuste | Opciones |
|---|---|
| Language | `es` (por defecto) o `en` |
| Claude's activity | `read-write` (por defecto), `write`, `read`, `none` |
| Follow Claude | encendido por defecto |
| Open at start | encendido por defecto |
| Column | `date` (por defecto), `age`, `size` |
| Open with | un comando propio, como `code -g {path}`: `{path}` es el archivo, `{dir}` su carpeta; vacío, la app del sistema |
| Icons | `auto` (por defecto), `nerd` (Nerd Font), `unicode` |
| Notices | la línea que dice que las marcas de git aparecen después de `git init` |

Con `auto` los íconos son Unicode simple: un mod no puede saber qué fuente usa la terminal.

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.303 o posterior):

```
/plugin install nzt-files --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos
los proyectos.

También viene con NZT: la línea `install-claude-full`, o el instalador con `--mods all`,
instala todos los mods (sección **Mods** del [`README.md`](../../README.md) del repo).

**Para actualizarlo**, la actualización automática viene apagada: se activa una vez en
`/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**, y cada sesión nueva baja la
versión nueva y avisa `Run /reload-plugins`. A mano: `claude plugin update nzt-files@nzt` en
la terminal, o volver a correr el instalador de NZT.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-files@nzt`.

## Desarrollo

```bash
claude plugin validate mods/nzt-files   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-files       # los tests de hooks/*.test.ts(x)
claude --plugin-dir mods/nzt-files      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo; los demás archivos tienen solo lógica.

El chequeo de tipos (`tsc -p mods/nzt-files/tsconfig.json`) necesita los tipos del motor en
`.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta,
con su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-files/spec.md`](../../specs/mods/nzt-files/spec.md),
con el mockup al lado, y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
