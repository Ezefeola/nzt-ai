# Mod · nzt-files — explorador del proyecto

> Estado: **aceptado** por el usuario en 0.1.0 el 2026-10-14 ("Genial se ve bien!", "Sí, lo
> acepto") y cerrado (unidad 146); código en `mods/nzt-files/`, mockup en
> `specs/mods/nzt-files/mockup.html`. Cómo llegó hasta acá, en **Historia** al final · Depende de:
> `specs/nzt-mods.md` (reglas de todo mod).
> El usuario pidió el mod el 2026-10-14: "ver el proyecto desde el CLI, como si fuese un
> visual studio digamos para verlo desde ahí y navegar el mismo y abrir los files", y aclaró
> "no es necesario editar es para navegar de momento". El nombre `nzt-files` es propuesta
> del agente. Lo que decidió el agente está marcado como propuesta: cuenta como acordado
> cuando el usuario lo confirma, con el mockup o antes.

## Qué resuelve

Para mirar cómo está armado el proyecto o leer un archivo mientras se trabaja con Claude,
hoy hay que salir de Claude Code al editor o pedirle a Claude que lo lea, lo que gasta
contexto en algo que solo quería ver la persona. El panel muestra el proyecto como la barra
del explorador de VS Code: carpetas que se abren y cierran, qué cambió desde el último
commit, y debajo el archivo elegido para leer, sin salir de la conversación.

## Alcance

**Adentro**
- Un panel lateral, abierto con `/nzt-files`, con el árbol del proyecto arriba y el archivo
  elegido abajo, los dos a la vez.
- Abrir y cerrar carpetas con un clic, y elegir un archivo con un clic.
- Ver el contenido del archivo con números de línea y scroll propio.
- Marcar en el árbol los archivos cambiados contra el último commit, como VS Code.
- El refresco cuando Claude cambia archivos, y los estados sin repositorio, binario, grande y
  con error.
- Español e inglés.

**Afuera**
- **Editar, crear, renombrar, mover o borrar** archivos o carpetas. El usuario: "no es
  necesario editar es para navegar de momento" (2026-10-14); además, `RN-mod-lee-no-escribe`
  de `specs/nzt-mods.md`.
- **Abrir el archivo en un editor externo.** El usuario: "no por ahora" (Q-03); queda como
  pendiente para después de esta corrida, en **Sin determinar**.
- **Buscar texto o archivos por nombre dentro del proyecto.** No se pidió; queda para otra
  corrida si se pide.
- **Mostrar los diffs.** Es lo que hace `nzt-changes`; este panel marca qué cambió, no cómo.
- **Pasarle a Claude lo que se está mirando.** El panel es para la persona; Claude no lee lo
  que el panel muestra.

## Reglas

### RN-files-ubicacion · origin: propuesta del agente (mismo lugar que `nzt-changes`)
El panel se abre al costado de la conversación con `/nzt-files`, y `/nzt-files` otra vez lo
cierra. Si no hay lugar al costado, se abre sobre el prompt y `/nzt-files` dice dónde quedó.

### RN-files-dividido · origin: usuario 2026-10-14 (Q-01: "los dos a la vez")
El panel muestra el árbol arriba y el archivo elegido abajo, al mismo tiempo. El archivo
elegido queda marcado en el árbol. Mientras no se eligió ninguno, la parte de abajo dice
"Elegí un archivo del árbol".

### RN-files-alto · origin: propuesta del agente (lo que el usuario pidió para `nzt-changes`: "el tamaño debería tener un fijo y un scroll")
El panel tiene siempre el mismo alto, y el árbol y el archivo, cada uno su parte fija de ese
alto. Lo que no entra en cada parte se recorre con su propio scroll; abrir una carpeta o
elegir un archivo nunca cambia el alto ni mueve los botones.

### RN-files-raiz · origin: propuesta del agente
El árbol empieza en la carpeta del proyecto de la sesión, con su primer nivel a la vista.
En cada carpeta van primero las subcarpetas y después los archivos, cada grupo por nombre
sin distinguir mayúsculas.

### RN-files-plegar · origin: usuario 2026-10-14 ("navegar el mismo"); el clic, propuesta del agente
Un clic en una carpeta la abre si estaba cerrada y la cierra si estaba abierta. Las carpetas
abiertas y el archivo elegido se recuerdan mientras dura la sesión, aunque se cierre y se
vuelva a abrir el panel.

### RN-files-ocultos · origin: usuario 2026-10-14 (Q-02: "solo .git")
El árbol oculta solo la carpeta `.git`. Todo lo demás se muestra, también lo que git ignora
(`node_modules`, `bin`, `obj`, `dist`).

### RN-files-visor · origin: usuario 2026-10-14 ("abrir los files"); la forma, propuesta del agente
Un clic en un archivo lo muestra abajo: arriba su ruta, su tamaño y su tipo; después el
contenido con el número de cada línea. Si Claude Code sabe colorear ese tipo de archivo, el
contenido se ve coloreado; si no, en texto plano.

### RN-files-scroll · origin: propuesta del agente (mismo manejo que `nzt-changes`)
El contenido del archivo se recorre con la rueda del mouse y con teclas, y debajo dice en qué
líneas está (`líneas 41–64 de 312`). El árbol se recorre con la rueda cuando no entra.

### RN-files-binario · origin: propuesta del agente
Si el archivo no es texto (una imagen, un `.dll`, un `.zip`), entonces el visor no muestra
su contenido: dice que es binario y su tamaño.

### RN-files-grande · origin: propuesta del agente (Q-05); el tope de 4 MiB, usuario 2026-10-14 (Q-06)
Si el archivo tiene más de 5.000 líneas o pesa más de 1 MB, entonces el visor muestra las
primeras 5.000 líneas, hasta 1 MB, y dice que el archivo sigue y cuánto mide.

### RN-files-muy-grande · origin: usuario 2026-10-14 (Q-06: "vamos con la A")
Si el archivo pesa más de 4 MiB, entonces el visor no muestra su contenido: dice que es más
grande de lo que Claude Code deja leer a un mod, y su tamaño. Claude Code rechaza la lectura
entera de un archivo así (tipos 2.1.296, `$.fs.read`: "Rejects when missing, or over 4 MiB").

### RN-files-git · origin: usuario 2026-10-14 (Q-04: "sí"); letras y colores, los de VS Code
Cada archivo cambiado contra el último commit lleva su marca a la derecha: **M** amarilla si
se modificó, **U** verde si es nuevo y git todavía no lo sigue, **A** verde si es nuevo y ya
está agregado, **D** roja si se borró. Una carpeta que contiene algo cambiado, a cualquier
profundidad, lleva un punto del color de su cambio más fuerte (rojo, después amarillo,
después verde), aunque esté cerrada.

### RN-files-borrado · origin: propuesta del agente (Q-04 aceptó la marca D)
Un archivo borrado desde el último commit sigue en el árbol, tachado y con su **D** roja,
donde estaba. No se puede abrir: elegirlo dice que se borró y que su diff está en
`nzt-changes`.

### RN-files-sin-repo · origin: propuesta del agente
Si el proyecto no es un repositorio git, entonces el árbol se muestra sin marcas y no da
error.

### RN-files-vivo · origin: propuesta del agente
Cuando Claude crea, cambia o borra un archivo, el árbol, las marcas y el archivo abierto se
actualizan solos sin cerrar las carpetas abiertas. Si el archivo abierto deja de existir,
el visor lo dice.

### RN-files-error · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si una carpeta o un archivo no se puede leer (sin permiso, bloqueado por otro programa),
entonces lo dice en su fila o en el visor, y el resto del panel sigue funcionando.

### RN-files-teclas · origin: propuesta del agente (lo que funcionó en `nzt-changes` 0.4.0)
Tab y las flechas recorren las filas del árbol, Enter abre la carpeta o el archivo de la
fila, `k` y `j` mueven el archivo de a una línea y RePág y AvPág de a una página. Escape
cierra el panel.

### RN-files-acento · origin: mismo criterio que RN-cambios-acento de `nzt-changes` (usuario 2026-10-14)
El panel sigue la estética de NZT: el acento y la etiqueta NZT de `nzt-changes`.

### RN-files-idioma · origin: mismo criterio que RN-panel-idioma de `nzt-state`
Los textos del panel están en español (por defecto) o en inglés, según la opción de idioma del
mod, que se elige al instalarlo, como en `nzt-changes`.

## Requisitos no funcionales
- Abrir el panel, abrir una carpeta o elegir un archivo se ve en menos de medio segundo en
  un proyecto de 20.000 archivos con `node_modules` (propuesta del agente).
- Abrir el panel no lee el proyecto entero: se lee cada carpeta cuando se abre (propuesta
  del agente; se mide junto con el punto anterior).

## Diseño (0.1.0, unidad 142)

Mockup: `specs/mods/nzt-files/mockup.html`, un estado por hash (`#state=md&place=dock`). Parte del
mockup aceptado de `nzt-changes` 0.4.0: la misma paleta aproximada, la misma tarjeta, el alto
fijo, el scroll propio y las filas que son botones. Imita el panel en una terminal oscura;
los colores reales los pone el tema de la persona.

**Tarea.** Quien trabaja con Claude quiere ubicar un archivo y leerlo sin salir de la
conversación. **Acción principal: elegir un archivo del árbol**; no hay un botón principal,
la acción es la fila.

**Una tarjeta** con borde redondeado en el acento (RN-files-acento), de arriba hacia abajo:
1. **Encabezado**: la etiqueta ` NZT ` y `Archivos` en el acento a la izquierda; a la
   derecha, tenue, el nombre de la carpeta del proyecto y `● n cambiados` (sin repositorio:
   `sin git`). *Origen: propuesta del agente, como el resumen de `nzt-changes`.*
2. **Árbol** (RN-files-raiz, -plegar, -ocultos, -git), de alto fijo: **15 filas al costado y 7
   sobre el prompt**. Cada fila: sangría de 2 columnas por nivel, `▸` o `▾` en las carpetas,
   el nombre (las carpetas en negrita y con `/`), y a la derecha la marca: la letra en los
   archivos, `●` en las carpetas. El archivo abierto va en la fila resaltada y en cian. Lo
   que no entra se mueve con la rueda sobre el árbol; la primera y la última fila dicen
   `↑ n más` y `↓ n más` cuando hay más. Al elegir un archivo, su fila queda a la vista con
   dos filas de aire arriba. *Origen: las 15 y 7 filas, propuesta del agente.*
3. **Separador.**
4. **Archivo**: la ruta en cian y negrita, cortada por el principio si no entra; debajo, la
   marca de git en palabras (`M modificado`, `U nuevo`, `D borrado`), el tipo en una
   etiqueta, el tamaño y las líneas (RN-files-visor). Los tipos son los de `nzt-changes`.
5. **Contenido** con número de línea y colores según el lenguaje, en una ventana con scroll
   propio que ocupa lo que queda (19 filas al costado, 11 sobre el prompt). Las líneas largas
   siguen debajo. Debajo, tenue: `líneas 1–15 de 344` y `k ▲  j ▼` (también con clic); si
   entra entero, `n líneas` (RN-files-scroll).
6. **Botón**: `[ Cerrar ]`, siempre en la última fila. *Origen: el de `nzt-changes`.*

**Estados**, todos en el mockup, cada uno al costado (40 filas) y sobre el prompt (24): al
abrir (primer nivel, "Elegí un archivo del árbol."), Markdown abierto, código largo con
scroll, JSON modificado, `node_modules` abierto (árbol con `↑` y `↓`), binario, archivo
grande (`61.204 líneas · se ven 5.000`, y abajo `de 5.000 · sigue`), archivo borrado (fila
tachada en rojo; "Se borró desde el último commit." y "Su diff está en /nzt-changes."), el
abierto dejó de existir ("Este archivo ya no existe."), carpeta sin permiso (fila `⚠ no se
pudo leer: permiso denegado` adentro de la carpeta), leyendo ("Leyendo el proyecto…") y sin
repositorio (sin marcas). *Vacío* no aplica: la carpeta del proyecto existe siempre, aunque
esté vacía se ve su nombre. *Sin permiso* sobre el panel entero no aplica: es el de carpeta.

**Panel angosto**: los nombres del árbol se cortan con `…` y la marca no se pierde; la ruta
se corta por el principio; el encabezado se corta por la derecha; el contenido sigue debajo.
Medido en el mockup (Chrome sin ventana, 2026-10-14): a 320 px y a 800 px, al costado y sobre
el prompt, ninguno de los 12 estados tiene scroll horizontal; el panel mide lo mismo en todos
(802 px al costado, 482 sobre el prompt) y el botón está siempre a la misma altura.

**Contraste**, medido sobre los pares del mockup, todos AA: nombre de archivo sobre el fondo
10,4; carpeta 13,9; nombre del archivo abierto sobre su fila 5,1; marca sobre esa fila 5,3;
M 10,1, U 7,8 y D 6,1 sobre el fondo; tenue 5,4; acento 5,6. El nombre tachado sobre la fila
elegida daba 4,15 y se aclaró (5,9). En el mod los colores los pone el tema; se miran en vivo.

**Teclado**: el orden de Tab sigue el del mockup: filas del árbol, contenido, `k` y `j`,
Cerrar. Se revisó por el orden de los elementos, no recorriéndolo con teclado. El mockup
mueve el contenido con las flechas como cualquier página; en el mod son `k`, `j`, RePág y
AvPág (RN-files-teclas).

## Preguntas

### Q-01 · Árbol y archivo: ¿uno por vez o los dos a la vez?
- bloquea: la forma del panel, la navegación y el mockup (unidad 142)
- respuesta: Los dos a la vez: árbol arriba y archivo abajo. · 2026-10-14

### Q-02 · ¿Qué carpetas y archivos se ocultan del árbol?
- bloquea: qué muestra el árbol al abrirse (`node_modules`, `bin`, `obj`, `.git`)
- respuesta: Solo `.git`. · 2026-10-14

### Q-03 · ¿Lleva un botón para abrir el archivo en el editor?
- bloquea: la unidad 144 y la fila de botones del visor
- respuesta: "No por ahora pero anota esto como un pendiente, no quisiera abrirlo en vs code
  unicamente es decir me gustaria como por ejemplo si fuese un proyecto de .net abrirlo en
  visual studio pero anotemos esto para contemplarlo despues de armar lo que estamos
  haciendo". · 2026-10-14

### Q-04 · ¿El árbol marca los archivos cambiados, como VS Code?
- bloquea: si el árbol lee el estado de git y cómo se dibuja cada fila
- respuesta: Sí: M amarilla, U verde, D roja y la carpeta que los contiene. · 2026-10-14

### Q-05 · ¿Confirmás las propuestas del agente de la unidad 141?
- bloquea: que las reglas con origin "propuesta del agente" cuenten como acordadas
- respuesta: "Ok perfecto, continuemos", dicho después del resumen de lo acordado, lo
  propuesto y lo pendiente. Se toma como confirmación; lo que el mockup muestre distinto de
  lo esperado se cambia al verlo. · 2026-10-14

### Q-06 · Un archivo de más de 4 MiB, que Claude Code no deja leer a un mod, ¿qué muestra?
- bloquea: RN-files-grande para esos archivos (hallado en la unidad 143)
- respuesta: "ok vamos con la A": el visor dice que es demasiado grande y su tamaño, sin leer
  el principio con un comando del sistema. · 2026-10-14

## Sin determinar
- **Abrir en el editor que corresponde al proyecto** (Q-03, después de esta corrida): no solo
  VS Code; un proyecto .NET, por ejemplo, en Visual Studio. Falta definir cómo se elige el
  editor y qué pasa si no está instalado.

## Notas técnicas
- Resuelto al construir (unidad 143), con los tipos de Claude Code 2.1.296: el árbol lee cada
  carpeta al abrirla (`$.fs.list`); el visor colorea con el elemento `Code` del motor, que
  numera las líneas (`startLine`); las marcas salen de `git status` leído cada 3 segundos y
  después de cada Write, Edit, NotebookEdit o Bash de Claude; un mod no puede leer más de
  4 MiB de una vez (RN-files-muy-grande).
- **Sin medir:** el requisito de medio segundo con 20.000 archivos. La prueba en vivo fue en
  este repositorio.

## Tests

`claude plugin test mods/nzt-files`: 27 tests (18 de la lógica pura del árbol, las marcas y la
ventana del archivo; 9 del panel dibujado: árbol al abrir, aire bajo la pestaña, abrir y cerrar carpetas, archivo con
detalle, binario, borrado, sin repositorio, carpeta sin permiso, scroll y cierre con el comando).
Pasar estos tests no prueba que el módulo cargue en una sesión; eso se probó en vivo el
2026-10-14.

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba, como en `nzt-changes`.

### 2026-10-15 · Aire bajo la pestaña — 0.1.1
Type:     modify
Change:   una fila en blanco entre la pestaña y la tarjeta; la tarjeta mide una fila menos y sigue llenando el cuerpo.
Reason:   el usuario, al ver los paneles en vivo: "no debe estar tan pegado" a la selección de pestañas.
Impact:   RN-mod-pestaña de `specs/nzt-mods.md` (regla común); RN-files-alto cuenta esa fila.
Decision: en los cuatro mods con panel, no solo en `nzt-state` (usuario: "dale que no esten pegados a los tabs").

### 2026-10-14 · Explorador del proyecto — 0.1.0
Type:     add
Change:   un panel lateral con el árbol del proyecto arriba y el archivo elegido abajo, con marcas de git, solo para leer.
Reason:   el usuario: "ver el proyecto desde el CLI, como si fuese un visual studio digamos para verlo desde ahí y navegar el mismo y abrir los files"; "no es necesario editar es para navegar de momento".
Impact:   RN-files-ubicacion, -dividido, -alto, -raiz, -plegar, -ocultos, -visor, -scroll, -binario, -grande, -muy-grande, -git, -borrado, -sin-repo, -vivo, -error, -teclas, -acento, -idioma nuevas
Decision: árbol y archivo a la vez (Q-01); solo `.git` oculto (Q-02); sin abrir en un editor por ahora (Q-03); un archivo de más de 4 MiB dice que no se puede leer (Q-06).
