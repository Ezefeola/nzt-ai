# nzt-changes

> Versión **0.6.0** · spec en [`specs/mods/nzt-changes/spec.md`](../../specs/mods/nzt-changes/spec.md)

Un panel lateral de Claude Code para recorrer los cambios **un diff por vez**, con el diseño
de [Replay Theater](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/replay-theater),
el mod de ejemplo de Anthropic. Tiene dos vistas:

- **Turno**: lo que Claude editó en el último turno (Write, Edit y NotebookEdit), en el
  orden en que lo hizo.
- **HEAD**: todo lo que cambió en el proyecto contra `HEAD`, lo haya hecho quien sea y sea
  el archivo que sea (specs, Markdown, JSON, código, imágenes), agrupado por lo que le pasó
  a cada archivo y por carpeta, en grupos que se abren y se cierran.

```
╭────────────────────────────────────────────────────────╮
│  NZT  Cambios                              paso 4 de 7 │
│                                                        │
│ Turno (t)  HEAD (h)         7 archivos · +139 -20      │
│                                                        │
│ ▾ M Modificados 4                                      │
│      1 README.md                                 +1 -0 │
│   ▸ Plan/ 1                                            │
│   ▾ mods/nzt-changes/hooks/ 2                          │
│     ▸  4 register.tsx                          +41 -12 │
│ ▸ A Nuevos 1                                           │
│ ────────────────────────────────────────────────────── │
│                   líneas 1–6 de 53   rueda k: ▲ j: ▼   │
│ mods/nzt-changes/hooks/register.tsx                    │
│                                                        │
│ modificado · ● Claude · TypeScript  +41 -12            │
│                                                        │
│ 282    await update($, view, …)                      █ │
│ 283 -  const opened = await $.ui.open({ id: PANE })  ▐ │
│ 283 +  const opened = await $.ui.open({              ▐ │
│ 284 +    id: PANE, rows: INLINE_ROWS, columns: 58,   █ │
│            [ ◀ Anterior ]  [ Siguiente ▶ ]  [ Cerrar ] │
╰────────────────────────────────────────────────────────╯
```

El panel mide siempre lo mismo, sea el diff de 3 líneas o de 300, y los botones no se
mueven. El diff se dibuja como los de Claude Code (número de línea, fondo verde o rojo y
colores según el lenguaje) en una ventana que se desplaza sola; a su derecha, una regla
marca dónde están los cambios del diff entero (verde sumadas, rojo sacadas, amarillo las dos)
y en gris lo que se ve. El mockup completo, con todos sus estados, está en
[`specs/mods/nzt-changes/mockup.html`](../../specs/mods/nzt-changes/mockup.html).

**Es opcional.** NZT funciona completo sin el panel. Funciona solo en Claude Code, porque
Codex no tiene mods. La vista HEAD necesita que el proyecto esté en un repositorio git; la
vista Turno no.

## Cómo se usa

```
/nzt-changes
```

Abre el panel en la vista Turno si el último turno tuvo ediciones, y en HEAD si no. Con el
panel enfocado:

| Tecla | Hace |
|---|---|
| `n` | siguiente cambio |
| `p` | cambio anterior |
| `t` | vista Turno |
| `h` | vista HEAD |
| `j` / `k` | mover el diff media ventana abajo / arriba (también la rueda sobre el diff) |
| Tab y Enter | ir a un archivo o a un grupo del índice, o a un botón; Enter en un grupo lo abre o lo cierra |
| `c` o Escape | cerrar |

Arriba, un índice de los cambios. En HEAD es un árbol: un grupo por lo que le pasó a cada
archivo (**Modificados**, **Nuevos**, **Borrados**, **Renombrados**, **En conflicto**; solo los
que tienen archivos) y dentro, una carpeta por grupo. Al abrir el panel todos los grupos están
cerrados, y el del cambio que estás mirando va en el color de NZT. **Un click en un grupo lo
abre o lo cierra**; Anterior y Siguiente abren el grupo del archivo al que van. En Turno, una
lista en el orden en que Claude editó. **Cada archivo se clickea** y lleva a ese cambio. El
índice ocupa hasta 4 filas sobre el prompt y 8 al costado; con más, la rueda sobre él lo
mueve. Al lado de las vistas, el resumen: cuántas ediciones o archivos y cuántas líneas.

Cada cambio muestra el archivo, qué le pasó (en Turno: la herramienta; en HEAD: nuevo,
modificado, borrado, renombrado o en conflicto, y `● Claude` si lo tocó Claude en la
sesión), su tipo (Markdown, JSON, TypeScript, imagen…), las líneas sumadas y sacadas, y el
diff con una línea de contexto alrededor de cada cambio y los números de línea del archivo.
Arriba a la derecha, bajo la línea que separa el índice, qué líneas se ven (`líneas 12–30 de
85`). Los botones van abajo a la derecha.

## Dónde aparece

Claude Code pone el panel **al costado de la conversación** solo en pantalla completa y con
la terminal de 110 columnas o más; ahí lo abre de 58 columnas, como Replay Theater, y con
todo el alto. Si no, lo pone **sobre el prompt**, de 24 filas, y `/nzt-changes` dice por qué.

En la **app de escritorio** el panel va en su pestaña, sin marco ni Cerrar, y lo desplaza el
scroll de la app: arriba Turno y HEAD, el paso y Anterior / Siguiente; después el índice entero,
donde un clic en cualquier parte de la fila abre un grupo o salta a ese paso; y debajo el diff
del paso, pintado como el de Visual Studio: cada línea con su número, la agregada sobre verde y
la borrada sobre rojo, y el C# con sus colores. En la app los botones no tienen tecla: se usa el
mouse.

La vista HEAD se actualiza sola mientras el panel está abierto. La vista Turno cambia al
terminar cada turno en el que Claude editó algo. El panel solo lee: no hace stage, no
descarta ni commitea nada, y no muestra ningún aviso sobre el prompt.

## Idioma

El panel habla **español** (por defecto) o **inglés**. Se elige al instalarlo y se cambia
en el menú de configuración de Claude Code o con:

```bash
claude plugin configure nzt-changes
```

Las teclas son las mismas en los dos idiomas.

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.275 o posterior):

```
/plugin install nzt-changes --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos
los proyectos.

También viene con NZT: la línea `install-claude-full`, o el instalador con `--mods all`,
instala todos los mods (sección **Mods** del [`README.md`](../../README.md) del repo).

**Para actualizarlo**, la actualización automática viene apagada: se activa una vez en
`/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**, y cada sesión nueva baja la
versión nueva y avisa `Run /reload-plugins`. A mano: `claude plugin update nzt-changes@nzt`
en la terminal, o volver a correr el instalador de NZT.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-changes@nzt`.

## Desarrollo

```bash
claude plugin validate mods/nzt-changes   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-changes       # los tests de hooks/*.test.ts(x)
claude --plugin-dir mods/nzt-changes      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo.

El chequeo de tipos (`tsc -p mods/nzt-changes/tsconfig.json`) necesita los tipos del motor
en `.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta,
con su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-changes/spec.md`](../../specs/mods/nzt-changes/spec.md),
con el mockup al lado, y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
