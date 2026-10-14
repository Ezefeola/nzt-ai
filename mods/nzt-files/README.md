# nzt-files

> Versión **0.1.0** · spec en [`specs/mods/nzt-files/spec.md`](../../specs/mods/nzt-files/spec.md)

Un panel lateral de Claude Code para **recorrer el proyecto como el explorador de VS Code**:
arriba el árbol de carpetas y archivos, abajo el archivo elegido, los dos a la vez. Sirve
para ubicar algo y leerlo sin salir de la conversación y sin pedirle a Claude que lo lea.

```
╭────────────────────────────────────────────────────────╮
│  NZT  Archivos                  nzt-ai · ● 22 cambiados│
│ ▸ mods/                                              ● │
│ ▸ Plan/                                              ● │
│ ▾ specs/                                             ● │
│   ▾ mods/                                            ● │
│     ▸ nzt-changes/                                   ● │
│     ▾ nzt-files/                                     ● │
│         mockup.html                                  U │
│         spec.md                                      U │
│   README.md                                          M │
│ ────────────────────────────────────────────────────── │
│ specs/mods/nzt-files/spec.md                           │
│ U nuevo · Markdown · 16 KB · 261 líneas                │
│   1 # Mod · nzt-files — explorador del proyecto        │
│   2                                                    │
│   3 > Estado: aceptado por el usuario en 0.1.0…        │
│ líneas 1–3 de 261                               k ▲ j ▼│
│ [ Cerrar ]                                             │
╰────────────────────────────────────────────────────────╯
```

El panel mide siempre lo mismo: abrir carpetas o elegir otro archivo no lo estira ni mueve
el botón. El mockup completo, con todos sus estados, está en
[`specs/mods/nzt-files/mockup.html`](../../specs/mods/nzt-files/mockup.html).

**Es opcional.** NZT funciona completo sin el panel. Funciona solo en Claude Code, porque
Codex no tiene mods. Las marcas de git necesitan que el proyecto esté en un repositorio; sin
repositorio el árbol se ve igual, sin marcas.

## Cómo se usa

```
/nzt-files
```

Abre el panel; `/nzt-files` otra vez lo cierra. Con el panel enfocado:

| Tecla | Hace |
|---|---|
| Tab y flechas | recorrer las filas del árbol |
| Enter o clic | abrir o cerrar la carpeta, o mostrar el archivo |
| `j` / `k` | mover el archivo una línea abajo / arriba (también la rueda sobre el archivo) |
| RePág / AvPág | mover el archivo de a una página |
| rueda sobre el árbol | mover el árbol cuando no entra |
| `c` o Escape | cerrar |

**El árbol** empieza en la carpeta del proyecto: primero las carpetas, después los archivos,
por nombre. Solo se oculta `.git`; lo que git ignora (`node_modules`, `bin`, `obj`) se ve.
Cuando no entra, los bordes dicen `↑ n más` y `↓ n más`.

**Las marcas de git**, a la derecha, como en VS Code: **M** modificado, **U** nuevo sin
seguir, **A** nuevo agregado, **D** borrado. Una carpeta con cambios adentro lleva un **●**
del color de su cambio más fuerte. Un archivo borrado sigue en su lugar, tachado; elegirlo
dice que su diff está en `/nzt-changes`.

**El archivo** muestra su ruta, su marca, su tipo, su tamaño y sus líneas, y el contenido
con número de línea y colores según el lenguaje. Debajo, qué líneas se ven
(`líneas 41–64 de 312`). Un binario dice que lo es; uno de más de 5.000 líneas o 1 MB
muestra el principio y avisa que sigue; uno de más de 4 MiB dice que Claude Code no deja a
un mod leerlo.

## Dónde aparece

Claude Code pone el panel **al costado de la conversación** solo en pantalla completa y con
la terminal de 110 columnas o más; ahí lo abre de 58 columnas y con todo el alto. Si no, lo
pone **sobre el prompt**, de 24 filas, y `/nzt-files` dice por qué.

Mientras está abierto se actualiza solo: cada vez que Claude escribe un archivo o corre un
comando, y cada 3 segundos para lo que cambie por fuera. El panel solo lee: no edita, no
crea, no renombra ni borra nada, y lo que muestra no entra en la conversación.

## Idioma

El panel habla **español** (por defecto) o **inglés**. Se elige al instalarlo y se cambia
en el menú de configuración de Claude Code o con:

```bash
claude plugin configure nzt-files
```

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.275 o posterior):

```
/plugin install nzt-files --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos
los proyectos.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-files`. Para
actualizarlo: `claude plugin update nzt-files`.

## Desarrollo

```bash
claude plugin validate mods/nzt-files   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-files       # los tests de hooks/*.test.ts(x)
claude --plugin-dir mods/nzt-files      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo.

El chequeo de tipos (`tsc -p mods/nzt-files/tsconfig.json`) necesita los tipos del motor en
`.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta,
con su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-files/spec.md`](../../specs/mods/nzt-files/spec.md),
con el mockup al lado, y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
