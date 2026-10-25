# Mod · nzt-changes — panel de los cambios del proyecto

> Estado: **aceptado** por el usuario en 0.5.0 el 2026-10-16 ("Acepto nzt-hub y nzt-changes,
> queda todo aprobado") y cerrado (unidad 190). **0.6.0 (unidad 364, 2026-10-25):** la app de
> escritorio, reglas con `[modify]` hasta que el usuario lo vea en la app (H-23, QT-22 y QT-23
> de `specs/mods/revision-escritorio.md`). Código en `mods/nzt-changes/`. Cómo llegó
> hasta acá, en **Historia** al final. · Depende de: `specs/nzt-mods.md` (reglas de todo mod).
> El usuario pidió el mod el 2026-10-14 ("ver los cambios a los archivos realizados", "que no
> sirva solo para código", "debe verse ordenado"), y para la 0.2.0 que se vea "tal cual
> Replay Theater", que siga llamándose como NZT, sin aviso sobre el prompt y con la vista del
> último turno en este mismo mod. Lo que decidió el agente está marcado como tal, con su
> disparador de reapertura.

## Qué resuelve

Al cerrar una unidad de NZT, lo que se revisa es qué cambió: la spec, el estado, el código,
la configuración. Hoy eso se mira fuera de Claude Code, en el editor o con `git diff`, que en
la terminal no se navega. El panel muestra, al costado de la conversación, los cambios uno
por uno con su diff, de dos maneras: **lo que Claude editó en el último turno** y **todo lo
que cambió en el proyecto contra `HEAD`**.

## Origen del diseño

El diseño es el de **Replay Theater**, el mod de ejemplo de Anthropic
(`anthropics/claude-code-playground`, carpeta `claude-code/mods/replay-theater`, licencia
Apache-2.0, leído el 2026-10-14). Se toma su lenguaje visual y su forma de recorrer los
cambios; el código de este mod es propio. Lo que Replay Theater hace y este mod no: el aviso
sobre el prompt al terminar el turno (el usuario no lo quiere) y dibujarse en la banda
cuando no hay lugar para el panel.

## Alcance

**Adentro**
- Un panel lateral, abierto con `/nzt-changes`, que muestra **un cambio por vez**: su
  archivo, qué le pasó, cuántas líneas sumó y sacó, y su diff.
- **Dos vistas** en el mismo panel, y un botón para cada una:
  - **Turno**: las ediciones que Claude hizo en el último turno terminado (Write, Edit y
    NotebookEdit), una por paso, en el orden en que las hizo.
  - **HEAD**: los archivos cambiados del proyecto contra `HEAD`, de cualquier tipo, uno por
    paso, ordenados por carpeta.
- La navegación de Replay Theater: paso `k de n`, **◀ Anterior**, **Siguiente ▶** y
  **Cerrar**, con teclas; en lugar de su tira de números, un **índice** de los cambios.
- Un diff que se ve como los de Claude Code, un resumen de la vista y el tipo de cada archivo.
- Un panel de alto fijo, con el diff desplazable, la regla de dónde están los cambios y el
  índice clickeable (0.4.0).
- En la vista HEAD, el índice agrupado por estado y, dentro de cada estado, por carpeta, con
  grupos que se abren y se cierran (0.5.0).
- El refresco en vivo y los estados vacío, sin repositorio y con error.
- Español e inglés.

**Afuera**
- **Un aviso sobre el prompt** al terminar el turno (usuario, 2026-10-14).
- **Hacer stage, descartar, commitear, deshacer o editar** desde el panel. El panel solo
  lee (`RN-mod-lee-no-escribe` de `specs/nzt-mods.md`).
- **Turnos anteriores al último.** La vista Turno muestra el último turno terminado.
- **Archivos cambiados por un comando** en la vista Turno (un build que regenera `dist/`,
  por ejemplo): aparecen en la vista HEAD. Se ofreció una foto de los archivos al empezar el
  turno para sumarlos a Turno y el usuario no la quiso: "perfecto entonces si ya funciona así"
  (2026-10-14).
- **Un explorador de todo el proyecto**, **comparar contra otra rama** y **Codex**.

## Reglas

### RN-cambios-vistas · origin: usuario 2026-10-14
El panel tiene dos vistas, **Turno** y **HEAD**, y se pasa de una a otra con su botón o su
tecla. Al abrirse muestra Turno si el último turno tiene ediciones, y HEAD si no. Cada vista
recuerda su paso mientras dura la sesión.

### RN-cambios-turno · origin: usuario 2026-10-14; cómo se graba, propuesta del agente
La vista Turno graba cada Write, Edit y NotebookEdit que Claude hace, también dentro de un
subagente, y al terminar un turno de la conversación principal esas ediciones pasan a ser
las del último turno. Un turno sin ediciones no borra el anterior. Cada edición es un paso:
- **Edit**: el diff entre el texto viejo y el nuevo; con "reemplaza todas" lo dice.
- **Write**: el diff entre el archivo como estaba antes y el contenido nuevo; si no existía,
  dice "archivo nuevo".
- **NotebookEdit**: el contenido nuevo de la celda como sumado.
Una edición que la herramienta rechaza también queda grabada: el mod la ve antes de que se
haga. **Se reabre** si eso confunde en la prueba en vivo.

### RN-cambios-fuente · origin: propuesta del agente (unidad 118)
La vista HEAD muestra lo que git ve en la carpeta de la sesión contra `HEAD`: en stage, sin
stage y archivos nuevos sin seguimiento. Lo que ignora `.gitignore` no aparece.

### RN-cambios-todo-tipo · origin: usuario 2026-10-14 (Q-02: "que muestre todos los archivos editados, no solo los de código")
Entra todo archivo editado, no solo código: documentos, datos, configuración, imágenes. Uno
que git considera binario es un paso que dice que no tiene diff de texto.

### RN-cambios-tipo · origin: propuesta del agente aceptada con el mockup 0.3.0 (2026-10-14)
Cada paso muestra en una etiqueta el tipo del archivo, deducido de su extensión: los conocidos
por su nombre (`Markdown`, `JSON`, `YAML`, `TypeScript`, `JavaScript`, `C#`, `HTML`, `CSS`,
`imagen PNG`…), cualquier otra extensión en mayúsculas (`.toml` → `TOML`), y sin etiqueta un
archivo sin extensión.

### RN-cambios-estado · origin: propuesta del agente (unidad 118)
En la vista HEAD cada paso dice qué le pasó al archivo: nuevo, modificado, borrado,
renombrado (`viejo → nuevo`) o en conflicto.

### RN-cambios-orden · origin: usuario 2026-10-14 ("debe verse ordenado", "bien organizado"); por estado, usuario 2026-10-15
Los pasos de la vista HEAD van ordenados **primero por estado**, en el orden de
RN-cambios-grupos; dentro de cada estado, por carpeta: la raíz primero, después las carpetas en
orden alfabético, y dentro de cada una los archivos en orden alfabético. `paso k de n`, Anterior
y Siguiente siguen ese orden. Los de la vista Turno van en el orden en que Claude los editó, con
la ruta completa.

### RN-cambios-grupos · origin: usuario 2026-10-15 ("que en los cambios haya tipos de desplegables… modificados… añadidos… eliminados"; "que no se muestren todos los archivos de una sino agrupados por su carpeta")
En la vista HEAD el índice es un árbol de dos niveles. Arriba, un grupo por estado, en este
orden: **Modificados**, **Nuevos**, **Borrados**, **Renombrados** y **En conflicto**. Dentro de
cada uno, un grupo por carpeta; los archivos de la raíz van directo bajo su estado, sin título
de carpeta. Un grupo sin archivos no aparece. Cada título dice cuántos archivos tiene, y el de
estado lleva la letra del estado en su color. Lo que git informa cae así: modificado y cambio de
tipo (un archivo que pasó a ser enlace) en Modificados; agregado, copiado y sin seguimiento en
Nuevos; borrado en Borrados; renombrado en Renombrados; cualquier combinación de merge sin
resolver en En conflicto. Los ignorados no aparecen (RN-cambios-fuente). *Los nombres "Nuevos"
y "Borrados" en lugar de "añadidos" y "eliminados" son del agente, para que digan lo mismo que la
línea de detalle de cada archivo (RN-cambios-estado); se reabre si el usuario prefiere los suyos.*
La vista Turno no se agrupa: su orden es el de las ediciones (decisión del agente con el plan
aprobado el 2026-10-15).

### RN-cambios-grupos-abrir · origin: usuario 2026-10-15 ("los grupos arrancan cerrados"; Siguiente hacia un grupo cerrado: "que lo abra si")
Al abrir el panel, **todos los grupos están cerrados**: se ven solo los títulos de estado. Un
click en un título, o Tab hasta él y Enter, lo abre o lo cierra; abrir un estado muestra sus
carpetas cerradas y sus archivos de la raíz. Cuando Anterior, Siguiente o un cambio de vista
llevan a un archivo que está dentro de un grupo cerrado, **ese grupo y su carpeta se abren**;
los demás quedan como estaban. El título del estado y de la carpeta donde está el paso actual
van en el acento aunque estén cerrados, para que se sepa dónde se está. Lo abierto se mantiene
cuando la vista se relee (RN-cambios-vivo); al cerrar el panel y volver a abrirlo, todo arranca
cerrado otra vez. *Que el paso actual se marque en su título cerrado es propuesta del agente.*

### RN-cambios-indice · origin: usuario 2026-10-14 (Q-01: "índice"; 0.4.0: "cada file debería poder clickearse"); grupos, usuario 2026-10-15
Encima del archivo actual, un índice con una fila por paso visible: su número, el nombre y
`+n −m` (`bin` si es binario). En HEAD las filas van dentro de sus grupos (RN-cambios-grupos), y
la letra del estado está en el título del grupo y no en cada fila. La fila actual va resaltada,
con `▸` y el nombre en cian. **Cada archivo se
elige**: con un click en su nombre, o con Tab hasta él y Enter, el panel pasa a ese paso. Solo
el nombre es el botón: bajo el puntero Claude Code invierte el botón entero, sin forma de
cambiarlo (tipos 2.1.296, `ButtonProps.hover`), y una fila entera invertida se veía mal
(usuario 2026-10-14: "el hover de cada file es horrible"). El índice ocupa como mucho **4 filas
sobre el prompt y 8 al costado**; si hay más, la rueda sobre el índice lo mueve sin cambiar de
paso, con `↑ n más` y `↓ n más` en los bordes. **Elegir un archivo no mueve el índice** (usuario
2026-10-14: "clickeo el 10 y el listado baja al 10"); con Anterior y Siguiente se corre solo lo
justo para que el actual se vea. Un nombre que no entra se corta con `…`. Los títulos de grupo
ocupan filas del índice como cualquier otra y cuentan para el tope; abrir o cerrar un grupo no
mueve el índice más que lo justo para que el título elegido siga a la vista.

### RN-cambios-alto · origin: usuario 2026-10-14 ("el tamaño debería tener un fijo y un scroll"); las 24 filas, propuesta del agente aceptada con el mockup 0.4.0
El panel mide siempre lo mismo, sea cual sea el paso o la vista: **24 filas sobre el prompt**
(menos si la terminal no las tiene) y **todo el alto que haya al costado**. Lo que no ocupa el
contenido queda vacío. Los botones están siempre en la última fila. Se comprueba con que dos
pasos de diff muy distinto (3 líneas y 300) dibujan el panel del mismo alto.

### RN-cambios-aire · origin: usuario 2026-10-15 ("margen en la sección de t: turno con el contenido de abajo"; "paso k de n" queda donde está y "lo de abajo más abajo"; "el nombre del file un poco separado del modificado y el modificado un poco separado del contenido")
Una fila en blanco separa cada una de estas partes de la siguiente: el encabezado (con `paso k de
n` a la derecha, que no se mueve) de las vistas; las vistas del índice; la ruta del archivo de su
línea de detalle; y la línea de detalle del diff. Las filas en blanco salen del alto del diff, no
del alto del panel (RN-cambios-alto).

### RN-cambios-botones · origin: usuario 2026-10-15 ("la sección de anterior, siguiente y cerrar abajo de todo alineado a la derecha")
Los botones van en la última fila del panel, **alineados a la derecha**, en el mismo orden:
`◀ Anterior`, `Siguiente ▶`, `Cerrar`.

### RN-cambios-resumen · origin: propuesta del agente aceptada con el mockup 0.3.0 (2026-10-14)
A la derecha de las vistas, el resumen de la vista actual: en Turno `n ediciones · m archivos`;
en HEAD `n archivos · +a −r`. Una vista vacía no lo muestra.

### RN-cambios-lineas · origin: propuesta del agente (unidad 118)
Cada paso muestra `+n` y `-m`: las líneas sumadas y sacadas. En la vista HEAD son las de git
contra `HEAD` (un archivo sin seguimiento cuenta todas como sumadas); en la vista Turno, las
del diff de esa edición.

### RN-cambios-claude · origin: propuesta del agente (unidad 118)
En la vista HEAD, un archivo que Claude escribió o editó en esta sesión lo dice en su línea
de detalle. Dura la sesión.

### RN-cambios-diff · origin: usuario 2026-10-14 ("que se vea lo más lindo posible"); forma, la de los diffs de Claude Code
El diff se ve como los diffs de Claude Code: cada línea con su número en el archivo y su
marca, las sumadas sobre fondo verde, las sacadas sobre fondo rojo, el contexto sin fondo, y
el texto coloreado según el lenguaje del archivo (un tipo sin colores se muestra en texto
plano). Alrededor de cada cambio va contexto, y `⋯` donde se salteó. Una línea más ancha que
el panel **sigue en la fila de abajo**: un párrafo de un documento se lee entero.

### RN-cambios-numeros · origin: propuesta del agente (RN-cambios-diff pide el número de línea)
En la vista HEAD los números son los del archivo antes y después. En la vista Turno, los de
la edición en el archivo como estaba antes de hacerla; un archivo nuevo empieza en 1. Si la
edición no se puede ubicar en el archivo (la herramienta la va a rechazar), se numera desde 1.

### RN-cambios-diff-alto · origin: usuario 2026-10-14 ("el tamaño debería tener un fijo y un scroll"); lugar de la fila de posición, usuario 2026-10-15
El diff ocupa todo el alto entre el detalle del archivo y los botones, y **se desplaza
solo él**: con la rueda sobre el diff (una fila por paso de la rueda), y con `k` ▲ y `j` ▼
(media ventana), que también se clickean. El encabezado, las vistas, el índice y los botones no
se mueven. La fila de posición, tenue, va **arriba a la derecha de la parte del archivo, justo
debajo de la línea que la separa del índice** (usuario 2026-10-15: "el número de líneas de un
archivo debe mostrarlo arriba a la derecha, debajo de la línea separadora"), en lugar de encima
de los botones: `líneas a–b de n` y `rueda k: ▲ j: ▼` si el diff no entra; `n líneas` si entra;
con ` · n sin mostrar` si el diff pasa del tope que se guarda. Al cambiar de paso o de vista, el
diff vuelve al principio. Reemplaza el
`… n líneas más`. *Por qué `k` y `j` y no ↑ ↓: en un panel abierto con foco, las flechas
recorren los botones (referencia `plugin-authoring` de Claude Code 2.1.296); hallado al
construir la 0.4.0.*

### RN-cambios-regla · origin: usuario 2026-10-14 ("que se muestre en el scroll la altura a la que están los cambios, como el diff de git en Visual Studio"); colores, propuesta del agente aceptada con el mockup 0.4.0
Cuando el diff no entra entero, a su derecha va una columna con una celda por fila de la
ventana. Cada celda representa un tramo proporcional del diff entero: `▐` verde si en ese tramo
hay líneas sumadas, rojo si hay sacadas, amarillo si hay de las dos, y `│` tenue si es solo
contexto. El tramo que se ve es una barra gris que sigue al scroll y va **debajo** de las
marcas, sin que ellas la tapen: fondo gris bajo la `▐` de color, `█` gris donde no hay cambios
(usuario 2026-10-14: "cuando bajás la tapan los colores… no ves hasta qué punto vas viendo"). Cuando el diff entra entero, la columna no aparece. **No se clickea**: el mockup
aceptado lo proponía, pero el único control que se clickea es un botón, y cada botón entra al
recorrido con Tab (tipos 2.1.296, `ButtonProps`), así que Tab pasaría por unas 30 celdas antes
de llegar a los botones (hallado al construir la 0.4.0).

### RN-cambios-teclas · origin: Replay Theater; mover el diff y Tab, usuario 2026-10-14 (0.4.0); `k` y `j`, motor 2.1.296
Con el panel enfocado: `p` anterior, `n` siguiente, `c` cerrar, `t` vista Turno, `h` vista
HEAD, `k` y `j` mueven el diff media ventana, y Tab y las flechas recorren los títulos de grupo
y las filas del índice que se ven, y los botones (Enter elige, o abre y cierra un grupo). Escape cierra el panel. Al abrirse, el panel toma el teclado y el foco queda en
**Siguiente ▶**. En el primer paso, Anterior no hace nada; en el último, Siguiente tampoco.

### RN-cambios-vivo · origin: propuesta del agente (unidad 118)
La vista HEAD se relee después de cada herramienta de Claude que puede cambiar archivos y
cada 3 segundos mientras el panel está abierto. La vista Turno cambia al terminar cada turno
con ediciones. Si el paso que se estaba mirando desaparece, el panel queda en el paso más
cercano.

### RN-cambios-vacio · origin: propuesta del agente; la pista, usuario 2026-10-14 (Q-03: "ok perfecto")
Vista Turno sin ediciones: "Claude no editó archivos en el último turno." y debajo "h muestra
todo lo que cambió contra HEAD." Vista HEAD sin cambios: "✓ Sin cambios contra HEAD."

### RN-cambios-acento · origin: usuario 2026-10-14 ("no quiero el reborde rosa… siguiendo la estética de NZT")
El borde de la tarjeta, el título y la vista actual van en el color de acento de los mods de
NZT, el mismo de `nzt-state`, que sigue el tema de la persona. El encabezado empieza con la
etiqueta ` NZT ` sobre ese color.

### RN-cambios-ubicacion · origin: propuesta del agente (plan 0.3.0, aprobado 2026-10-14)
El panel pide el ancho de Replay Theater, 58 columnas, cuando se ubica al costado de la
conversación; el alto lo fija RN-cambios-alto. Claude Code lo pone al
costado solo en pantalla completa y con 110 columnas o más; cuando lo pone sobre el prompt,
la respuesta de `/nzt-changes` lo dice con el motivo (no está en pantalla completa, o el ancho
que tiene la terminal).
**[modify] En la app de escritorio (P-02 de `specs/mods/revision-escritorio.md`, usuario
2026-10-24):** la app pone el panel a su costado y `/nzt-changes` no imprime nada: el aviso habla
de una terminal en pantalla completa, que la app no tiene.

### RN-cambios-escritorio · origin: usuario 2026-10-25 (QT-22 y QT-23 de `specs/mods/revision-escritorio.md`); lo demás, por QT-11, QT-12 y H-17 de nzt-files
**[modify]** En la app de escritorio el panel va en su pestaña sin marco, sin la etiqueta ` NZT `,
sin título propio y sin `Cerrar`, porque la pestaña de la app ya los pone; sus botones van sin la
ficha de su tecla, y por eso sin tecla: en la app se usa el mouse. Todo va entero y lo desplaza el
scroll de la app: sin alto fijo (RN-cambios-alto), sin ventanas del índice ni del diff, sin ▲ ▼,
sin fila de posición (RN-cambios-diff-alto) y sin regla de cambios (RN-cambios-regla); la rueda
le llega a la app (usuario 2026-10-25 en nzt-files: *"es todo por scroll"*).
En una sola pestaña (QT-22), de arriba abajo: **Turno** y **HEAD**, la vista actual como botón
principal porque la app no colorea el texto de un botón, con el resumen al lado; `paso k de n`
con **Anterior** y **Siguiente** a su derecha (en la app arriba y no al final, RN-cambios-botones,
para no tener que bajar hasta el final del diff); el índice entero, cada fila tomando el clic en
todo su largo, el título de un grupo con su flecha fija y la fila del paso actual con fondo; y el
paso: el nombre del archivo en negrita y su carpeta debajo, para que una ruta larga no esconda el
nombre, el detalle, y el diff.
El diff va pintado como el de Visual Studio (QT-23): en mono, cada línea con su número (el del
archivo nuevo, o el del viejo en una borrada), la agregada sobre verde y la borrada sobre rojo,
sin `@@` ni `+` `−`; entre dos tramos, una fila `⋯`. El C# lleva los colores de Visual Studio,
los mismos de nzt-files; los demás lenguajes van sin colores de sintaxis, porque el elemento de
código de la app no pinta líneas sueltas. Si el diff pasa lo que la app dibuja de una vez
(100.000 caracteres), muestra sus primeras líneas y dice cuántas quedaron sin dibujar.
En la consola nada de esto cambia.

### RN-cambios-sin-repo · origin: propuesta del agente (unidad 118)
Fuera de un repositorio git, o sin git instalado, la vista HEAD lo dice con el motivo. La
vista Turno funciona igual. Un repositorio sin commits muestra todo como nuevo.

### RN-cambios-error · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si git falla, la vista HEAD muestra el error y la sesión sigue funcionando.

### RN-cambios-diff-grande · origin: tamaño de lo que se graba, propuesta del agente
Un archivo de más de 400 líneas, de un lado o del otro, no se compara línea por línea: se
muestra todo lo viejo como sacado y todo lo nuevo como sumado (el criterio de Replay
Theater).

### RN-cambios-estado-viejo · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md` (hallado en vivo, unidad 128)
La sesión guarda el estado del mod entre recargas. Si lo que encuentra lo escribió una
versión anterior (la 0.1.0 guardaba otra vista), el panel lo completa con valores por
defecto y se dibuja igual: abre en el primer paso.

### RN-cambios-idioma · origin: mismo criterio que RN-panel-idioma de `nzt-state`
El panel habla en español o en inglés según la opción **idioma** del mod (`es` por
defecto). Rutas y diffs se muestran tal cual. Las teclas son las mismas en los dos idiomas.

## Requisitos no funcionales

- Grabar una edición nunca bloquea ni demora la herramienta: si falla, la edición sigue.
- La vista HEAD no redibuja si git devuelve lo mismo.
- Se dibuja en la terminal y en la app de escritorio. Los tests montan el panel en las dos.

## Diseño (0.5.0, unidad 176 — aceptado el 2026-10-16)

Mockup: `specs/mods/nzt-changes/mockup.html`, un estado por hash (`#state=head-5&place=inline`).

**Lo que cambia en la 0.5.0** (pedido del usuario 2026-10-15 al ver la 0.4.1 instalada; plan
aprobado en modo autónomo, sin parada para mirar el mockup):

- **Aire** (RN-cambios-aire): una fila en blanco entre encabezado y vistas, vistas e índice, ruta
  y detalle, detalle y diff. Medido en el mockup a 800 px: la ventana del diff largo (paso 5) tiene
  8 filas sobre el prompt y 20 al costado; con el índice todo cerrado, 10 y 26. Las 4 filas de aire
  las compensa en parte que el índice de HEAD arranca cerrado y ocupa menos que en la 0.4.0.
- **Fila de posición** arriba a la derecha, la primera fila bajo el separador del índice:
  `líneas a–b de n` y `rueda k: ▲ j: ▼`, o `n líneas`. En un paso sin diff (binario, solo
  movido) la fila queda vacía, para que la ruta no cambie de lugar. *Lo vacío, propuesta del
  agente.*
- **Botones a la derecha** en la última fila (RN-cambios-botones).
- **Índice de HEAD en árbol** (RN-cambios-grupos, -grupos-abrir): el título de estado es
  `▸`/`▾`, la letra en su color, el nombre en negrita y la cantidad tenue; el de carpeta va dos
  columnas adentro, tenue, con `▸`/`▾` y su cantidad; los archivos van dos columnas más adentro
  que su título, con `▸` en cian si son el actual. El título del grupo donde está el paso actual
  va en el acento. Solo el nombre del título es el botón (como las filas: Claude Code invierte el
  botón entero). *Glifos, sangría y negrita, propuesta del agente: el `▸` de un grupo cerrado y
  el del archivo actual se distinguen por la sangría, el color y el fondo de la fila; se reabre
  si en vivo se confunden.* La vista Turno sigue con su lista plana sin letra.

Medido en el mockup (Chrome sin ventana, 2026-10-15): a 320 px y a 800 px, sobre el prompt y al
costado, ninguno de los 16 estados tiene scroll horizontal; la tarjeta mide lo mismo en todos
(482 px sobre el prompt, 802 al costado), los botones están a la misma altura y pegados a la
derecha en todos. Recorrido: recién abierto, solo los títulos `Modificados`, `Borrados` y
`Renombrados`, con `Modificados` en el acento; abrir `Modificados` muestra `README.md` y las
tres carpetas cerradas; cerrarlo vuelve a los títulos; Siguiente desde el paso 5 abre `Borrados`
y `presentation/` y deja `Modificados` como estaba. Contraste: no hay pares nuevos (el título en
el acento es el acento sobre el fondo, 5,6; el de carpeta, el tenue sobre el fondo, 5,4).
Teclado: el orden de los elementos es títulos y filas del índice en orden de árbol, ▲ y ▼ (ahora
arriba), Anterior, Siguiente, Cerrar; revisado por el orden de los elementos, no recorrido con
teclado.

**De la 0.4.0** (lo que sigue vale salvo lo de arriba). Es la
tarjeta de la 0.3.0 con tres cambios que el usuario pidió al verla en vivo (2026-10-14:
"dependiendo el cambio se hace muy grande o queda chico… el tamaño debería tener un fijo y un
scroll", "cada file debería poder clickearse").

**Por qué cambiaba de alto.** Sobre el prompt, Claude Code ajusta el marco del panel al árbol
que dibuja el mod (tipos 2.1.296, `Pane.scroll`: "Inline the frame fits the tree"). Un diff de 3
líneas achicaba el panel y uno de 40 lo estiraba, y los botones cambiaban de fila en cada paso.

1. **Alto fijo.** El panel dibuja siempre el mismo alto, rellenando lo que falte: **24 filas
   sobre el prompt** (o menos si la terminal no las tiene) y **todo el alto que haya al
   costado**. *Origen: usuario; las 24 filas, propuesta del agente.* Los botones quedan siempre
   en la última fila.
2. **El diff tiene scroll propio.** Ocupa todo lo que queda entre el detalle del archivo y los
   botones, y se mueve con la rueda sobre él y con `k` ▲ y `j` ▼ (media ventana, también con
   click). Encima de los botones, tenue: `líneas 12–30 de 85` y `rueda k: ▲ j: ▼`; si entra
   entero, `n líneas`. El encabezado, las vistas, el índice y los botones no se mueven. Cambiar
   de paso vuelve el diff al principio. *Origen: usuario; el mecanismo, tipos 2.1.296: la rueda
   llega como `ui.scroll` con la fila bajo el puntero (`UiScrollInput.pointer`); las flechas no,
   porque en un panel con foco recorren los botones (hallado al construir; el mockup decía ↑ ↓).*
   Reemplaza el `… n líneas más` de la 0.3.0.
3. **Cada archivo se clickea.** Cada fila del índice es un botón: un click, o Tab hasta la fila
   y Enter, y el panel salta a ese paso. Bajo el puntero, la fila se ilumina. *Origen: usuario;
   el mecanismo, `ButtonProps` de los tipos 2.1.296.*
4. **El índice tiene alto tope**: 4 filas sobre el prompt y 8 al costado, para dejarle el alto
   al diff. Con más pasos, la rueda sobre el índice lo mueve sin cambiar de paso, y en los
   bordes dice `↑ n más` y `↓ n más`. Al cambiar de paso, el actual queda a la vista.
   *Origen: propuesta del agente (en 0.3.0 eran 8 filas fijas alrededor del actual).*
5. **La regla de cambios.** A la derecha del diff, separada por un espacio, una columna de una
   celda de ancho y una celda por fila de la ventana. Cada celda representa un tramo
   proporcional del diff entero: `▐` verde si en ese tramo hay líneas sumadas, rojo si hay
   sacadas, amarillo si hay de las dos, `│` tenue si es solo contexto. Las celdas del tramo que
   se ve son una barra gris. Solo aparece cuando el diff no entra entero. *Origen: usuario
   2026-10-14 ("que se muestre en el scroll la altura a la que están los cambios, como el diff
   de git en Visual Studio"); los colores y el amarillo, propuesta del agente.* El click en una
   celda que mostraba el mockup no se construyó: ver RN-cambios-regla.

Lo que no cambia de la 0.3.0 (aceptada el 2026-10-14: "lo veo bien") sigue abajo. Sigue siendo la
tarjeta de Replay Theater, con las dos vistas. El usuario la confirmó el 2026-10-14
comparándola con Replay Theater en vivo, y pidió que se vea "lo más lindo posible", que
sirva para todo tipo de archivo y que esté "bien organizado".

**Tarea.** Quien termina un turno o una unidad recorre los cambios uno por uno. **Acción
principal: Siguiente ▶**, que tiene el foco al abrir.

**Acento: el color `claude` del tema**, el de `nzt-state`, en lugar del magenta de Replay
Theater. *Origen: usuario 2026-10-14 ("no quiero el reborde rosa… siguiendo la estética de
NZT").* Al ser un color del tema, sigue el que tenga elegido la persona.

**Una tarjeta** con borde redondeado en el acento, de arriba hacia abajo:
1. **Encabezado**: la etiqueta ` NZT ` (texto invertido sobre el acento, como la de
   `nzt-state`) y `Cambios` en el acento y negrita a la izquierda; `paso k de n` en negrita a
   la derecha (`sin pasos` si la vista está vacía).
2. **Vistas y resumen**: `Turno (t)` y `HEAD (h)`, la actual en el acento y negrita. A la
   derecha, tenue, el resumen de la vista: en Turno `n ediciones · m archivos`; en HEAD
   `n archivos · +a −r`. *Origen: propuesta del agente ("bien organizado").* En un panel
   angosto el resumen se corta con `…` (0.4.0: cada parte ocupa siempre una fila).
3. **Índice** (RN-cambios-indice, RN-cambios-orden), en lugar de la tira de Replay Theater;
   desde 0.4.0, con alto tope, scroll propio y filas clickeables (puntos 3 y 4 de arriba).
4. **Archivo**: la ruta en cian y negrita; si no entra, se corta por el principio.
5. **Detalle**: en Turno, la herramienta y su nota; en HEAD, el estado en su color y
   `● Claude` si lo tocó. Después el **tipo de archivo** en una etiqueta (RN-cambios-tipo) y
   `+n −m`.
6. **Diff con el elemento `Code` del motor** (`format: 'diff'`, `path` del archivo para el
   lenguaje), el mismo que dibuja los diffs de Claude Code: número de línea, marca, fondo verde
   o rojo por línea y colores según el lenguaje. Las líneas largas **siguen debajo** en vez de
   cortarse, así un párrafo de un documento se lee entero. Los saltos entre hunks se marcan con
   `⋯`. Desde 0.4.0 va en una ventana con scroll (punto 2 de arriba) y debajo la fila de
   posición. *Origen: tipos de Claude Code 2.1.296 (`CodeProps`).*
7. **Botones**: `◀ Anterior`, `Siguiente ▶`, `Cerrar`, siempre en la última fila. Sin pasos,
   solo `Cerrar`. En el primer paso, Anterior se ve apagado.

**Estados**, todos en el mockup, cada uno sobre el prompt (24 filas) y al costado (40): los tres
pasos de Turno (Edit de Markdown, archivo nuevo de 38 líneas con scroll, Edit de JSON), los
siete de HEAD (documento con diff corto, JSON, estado, código, diff largo con scroll, binario,
solo movido), HEAD con 42 archivos (índice con scroll), leyendo, Turno vacío, HEAD limpio, sin
repositorio y error de git. Las filas del índice se clickean y llevan a su paso. *Sin permiso*
no aplica.

**Panel angosto**: el resumen y los nombres del índice se cortan con `…`; la ruta se corta por
el principio; el diff sigue debajo y su ventana muestra menos líneas. Medido en el mockup
(Chrome sin ventana, 2026-10-14): a 320 px y a 800 px, sobre el prompt y al costado, ninguno de
los 17 estados tiene scroll horizontal; el panel mide lo mismo en todos (482 px sobre el
prompt, 802 al costado) y la fila de botones está siempre a la misma altura. Sobre el prompt, a
800 px, el diff largo muestra 8 líneas por vez; al costado, 17.

**Contraste**: medido sobre los pares del mockup, todos AA (acento sobre el fondo 5,6; texto de
la etiqueta NZT sobre el acento 6,1; nombre tenue del índice sobre el fondo 5,4; nombre sobre la
fila iluminada 11,5). El número de la fila, tenue, daba 4,4 sobre la fila iluminada y 3,7 sobre
la actual, y se aclaró. Los números de línea sobre fondo verde o rojo daban 3,0 y 3,8, y se
aclararon. En el mod esos colores los pone el motor; se miran en vivo.

**Teclado**: el orden de Tab sigue el del mockup: filas del índice, ▲ y ▼ del diff, Anterior,
Siguiente, Cerrar; cada uno con el foco visible. Se revisó por el orden de los elementos, no
recorriéndolo con teclado. (El mockup todavía mueve su diff con ↑ ↓, como cualquier página
web; en el mod son `k` y `j`.)

## Sin determinar

- **Escritorio:** `$.process` está documentado como "CLI only" (tipos 2.1.296); no se
  verificó si la vista HEAD funciona en la app de escritorio.
- **Cuántas filas ocupa una línea larga en `Code`:** la ventana del diff las estima con el
  ancho del panel y el de los números; si el motor parte distinto, la última línea de la
  ventana puede quedar cortada (el alto del panel no cambia). Se mira en vivo.

## Tests

**0.6.0 (unidad 364, 2026-10-25): 95 tests**, todos pasan, más `claude plugin validate`; `tsc` no
corrió (no hay compilador instalado). Los tres que recorrían las dos superficies con lo de la
consola (el diff en `Code` con `@@`, la ruta entera, la pista con la tecla `h`) quedan en la
consola, y diez nuevos prueban la app: el diff pintado sin `Code` ni `@@` con sus fondos verde y
rojo, el nombre en negrita y la carpeta debajo, el C# con sus colores en mono, el índice entero
con el clic en el extremo derecho de la fila que abre grupos y salta al paso, la vista actual como
botón principal, sin marco, alto, Cerrar, ▲ ▼, regla, fila de posición ni fichas (y la consola
con ellos), el vacío sin tecla en la pista, el comando que no imprime nada y la rueda que sigue a
la app cuando el panel es más alto que el cuerpo. **No cubierto hasta QA:** cómo pinta la app los
fondos con transparencia y la fila `⋯`, si respeta el espacio duro de la sangría, el hover de la
fila del índice sobre la región, y que la rueda le llegue de verdad (el kit no lo prueba).

`claude plugin test mods/nzt-changes` corre 85 tests (0.5.0, unidades 177 y 178; antes 74).
Lo que sumó la 0.5.0: en `turn.test.ts`, el árbol del índice (un título por estado, la raíz y
después las carpetas, lo cerrado oculto, el paso escondido que cuenta como su título, las
claves de cada título, la lista plana de Turno, las filas que quedan afuera); en `git.test.ts`,
el orden por estado y carpeta; en `register.test.tsx`, el índice que abre cerrado y se abre y
cierra por título, el conflicto y el sin seguimiento en sus grupos, el índice largo en ventana,
Siguiente que abre el grupo cerrado y deja los demás, volver a abrir el panel que cierra todo,
el orden de la tarjeta (aire, posición bajo la regla, botones a la derecha) y la vista vacía con
su aire. El detalle de abajo es el de la 0.4.0 y sigue valiendo salvo donde lo reemplaza esto.

- **`hooks/turn.test.ts`, 33**: el diff de líneas, los hunks numerados con una línea de
  contexto y uno por grupo de cambios, el archivo nuevo, los hunks de git renumerados y
  recortados, el corte al alto con su encabezado recontado, la línea donde cae una edición,
  el tope de líneas guardadas, el paso que dejó la 0.2.0 en la sesión, la ventana del diff
  (entera, desde una línea, pasada del final, la fila entre hunks, la línea que se parte), la
  regla (cada tramo, los dos colores juntos, las celdas a la vista), el índice (títulos de
  carpeta, el actual a la vista, el lugar donde lo dejó la persona, el nombre cortado) y los
  caracteres de control.
- **`hooks/kinds.test.ts`, 5**: el tipo por extensión, la imagen, la extensión desconocida en
  mayúsculas, el texto y el archivo sin extensión.
- **`hooks/git.test.ts`, 12**: la lectura de `git status` y `--numstat`, el orden por
  carpeta, el diff de git (binario, movido, recortado) y las rutas de Windows.
- **`hooks/register.test.tsx`, 24**, con git y turnos simulados, en terminal y escritorio:
  el alto del panel igual con un diff de 2 líneas y uno de 60, el diff largo que se mueve con
  ▼ hasta el final con su fila de posición y su regla y vuelve al principio al cambiar de
  paso, el diff que entra sin regla, una fila del índice que lleva a su paso sin mover el
  índice y Siguiente que lo corre una sola fila, y además:
  un turno con ediciones que se recorre con Anterior y Siguiente y su resumen, un Write sobre
  un archivo que existe, una edición numerada donde cae, el tipo en la línea de detalle, la
  etiqueta NZT y que no hay tira, el índice por carpeta en ventana con su resumen, la vista
  HEAD ordenada por carpeta con su renombre, el cambio de vista, el binario, el renombre que
  le pide a git las dos rutas, la marca de Claude, el turno vacío con su pista y el árbol
  limpio, sin repositorio (Turno sigue andando), el repositorio sin commits, el error de git,
  el estado de una versión anterior y el panel en inglés.

**No cubierto por los tests:** git de verdad, las teclas (los tests aprietan los botones por
su clave), la rueda (el kit de tests no tiene cómo girarla: el hook de `ui.scroll` se prueba en
vivo), el refresco cada 3 segundos, cómo dibuja la terminal el elemento `Code` (colores,
números, cortes de línea) y el panel en la app de escritorio. Pasar estos tests no prueba que el módulo cargue en una sesión: la 0.1.0 pasó
los suyos y no cargó (`$` pasado a una función importada). Eso se prueba en vivo.

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba. *Va acá y no en
`Docs/Product/history.md` porque este repo guarda sus documentos en `specs/` (decisión del
agente al cerrar, unidad 140).*

### 2026-10-16 · Índice de HEAD agrupado y desplegable, más aire y botones a la derecha — 0.5.0
Type:     modify
Change:   en la vista HEAD los archivos se agrupan por estado y por carpeta en grupos desplegables; el panel separa más sus partes, la posición del diff va arriba a la derecha y los botones abajo a la derecha.
Reason:   el usuario, el 2026-10-15: "que no se muestren todos los archivos de una sino agrupados por su carpeta", "debe verse ordenado", "margen" entre las partes y "anterior, siguiente y cerrar abajo de todo alineado a la derecha".
Before:   el índice de HEAD listaba todos los archivos en una lista plana; la fila de posición del diff iba sobre los botones y los botones a la izquierda, con las partes pegadas.
Now:      grupos Modificados / Nuevos / Borrados y carpetas dentro, cerrados al abrir; Siguiente abre el grupo del paso al que va; fila en blanco entre las partes; posición arriba a la derecha bajo el separador; botones abajo a la derecha. La vista Turno no se agrupa.
Impact:   RN-cambios-grupos nueva · RN-cambios-grupos-abrir nueva · RN-cambios-aire nueva · RN-cambios-botones nueva · RN-cambios-orden cambiada · RN-cambios-indice cambiada · RN-cambios-diff-alto cambiada
Decision: "Nuevos" y "Borrados" en vez de añadidos y eliminados, y el título del paso actual en acento (propuestas del agente, aceptadas con el mod).

### 2026-10-15 · Aire bajo la pestaña — 0.4.1
Type:     modify
Change:   una fila en blanco entre la pestaña y la tarjeta; la tarjeta mide una fila menos y el diff ve una línea menos.
Reason:   el usuario, al ver los paneles en vivo: "no debe estar tan pegado" a la selección de pestañas.
Impact:   RN-mod-pestaña de `specs/nzt-mods.md` (regla común); RN-cambios-alto cuenta esa fila.
Decision: en los cuatro mods con panel, no solo en `nzt-state` (usuario: "dale que no esten pegados a los tabs").

### 2026-10-14 · Panel de alto fijo, con scroll, índice clickeable y regla de cambios — 0.4.0
Type:     modify
Change:   el panel mide siempre lo mismo y el diff se desplaza dentro de él; el índice se clickea y una regla muestra dónde están los cambios.
Reason:   el usuario lo vio en vivo: "dependiendo el cambio se hace muy grande o queda chico… el tamaño debería tener un fijo y un scroll", "cada file debería poder clickearse", y pidió la regla "como el diff de git en Visual Studio".
Before:   el panel crecía con el diff (todo el alto sobre el prompt), el diff se cortaba con `… n líneas más`, el índice mostraba 8 pasos alrededor del actual y no se clickeaba; la tira de números de Replay Theater ya no existía desde la 0.3.0.
Now:      24 filas sobre el prompt y todo el alto al costado; el diff se mueve con la rueda y con `j`/`k`, con la fila `líneas a–b de n`; el índice tiene tope de 4 u 8 filas, se clickea por el nombre y no salta al elegir; la regla marca los cambios en color y lo que se ve en gris debajo.
Impact:   RN-cambios-alto nueva · RN-cambios-regla nueva · RN-cambios-diff-alto cambiada · RN-cambios-indice cambiada · RN-cambios-teclas cambiada · RN-cambios-ubicacion cambiada
Decision: ↑ ↓ no mueven el diff y la regla no se clickea, por cómo funciona Claude Code 2.1.296 (las flechas recorren los botones de un panel con foco; un botón siempre entra al recorrido con Tab y se invierte bajo el puntero).

### 2026-10-14 · Diff como los de Claude Code, para todo archivo y ordenado — 0.3.0
Type:     modify
Change:   el diff se dibuja con el elemento de diffs de Claude Code; un índice reemplaza la tira de números; resumen, tipo de archivo y acento de NZT.
Reason:   el usuario: "en la app de escritorio se veía mejor… que se vea lo más lindo posible… que no sean solo para código… y que esté bien organizado"; y "no quiero el reborde rosa".
Before:   diff en texto plano recortado; una tira horizontal de números de paso (la de Replay Theater) para saltar entre pasos; borde magenta.
Now:      diff numerado y coloreado por lenguaje; índice por carpeta con letra de estado; resumen de la vista; etiqueta del tipo de archivo; borde y etiqueta ` NZT ` en el color de los mods de NZT.
Impact:   RN-cambios-tira quitada · RN-cambios-indice nueva · RN-cambios-tipo nueva · RN-cambios-resumen nueva · RN-cambios-numeros nueva · RN-cambios-acento nueva · RN-cambios-ubicacion nueva · RN-cambios-diff cambiada · RN-cambios-orden cambiada · RN-cambios-vacio cambiada
Decision: la vista Turno no suma archivos cambiados por comandos (Q-02, usuario: "perfecto entonces si ya funciona así").

### 2026-10-14 · Panel de cambios al estilo Replay Theater — 0.1.0 y 0.2.0
Type:     add
Change:   un panel lateral que recorre, un diff por vez, lo que Claude editó en el último turno o todo lo cambiado contra HEAD.
Reason:   el usuario pidió "ver los cambios a los archivos realizados", "que no sirva solo para código", "debe verse ordenado", y para la 0.2.0 que se vea "tal cual Replay Theater".
Impact:   RN-cambios-vistas, -turno, -fuente, -todo-tipo, -estado, -lineas, -claude, -diff, -teclas, -vivo, -vacio, -sin-repo, -error, -diff-grande, -estado-viejo, -idioma nuevas
