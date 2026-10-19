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
> **0.2.0 construida** (unidades 280 a 285, 2026-10-19; analizada en 273 a 278), a probar en
> vivo (286) antes de que el usuario la acepte. El usuario pidió que el panel pinte
> lo que Claude lee y escribe, muestre los Markdown dibujados y sume las funciones acordadas el
> 2026-10-19, sin ocupar contexto ("no quiero que ocupe contexto el mod que hagamos"). Marcas
> `[add]`, `[modify]` y `[remove]` hasta cerrar el cambio.

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
- **Las funciones acordadas el 2026-10-19**, sin ocupar contexto (RN-files-contexto-cero): pintar lo que Claude
  lee, escribe y commitea, y llevar el árbol hasta ahí; ver un Markdown dibujado o como
  fuente, y ampliar el archivo a todo el panel; buscar en el árbol; las líneas cambiadas, la
  rama y lo que Claude hace con git; la columna de fecha, edad o tamaño; abrir un archivo con
  su app; copiar su ruta; abrirse solo al empezar la sesión; los ajustes en `/config`. [add]

**Afuera**
- **Editar, crear, renombrar, mover o borrar** archivos o carpetas. El usuario: "no es
  necesario editar es para navegar de momento" (2026-10-14); además, `RN-mod-lee-no-escribe`
  de `specs/nzt-mods.md`.
- **Abrir el archivo en un editor externo.** El usuario: "no por ahora" (Q-03); queda como
  pendiente para después de esta corrida, en **Sin determinar**. [remove]: entra en 0.2.0 con
  la app de Windows o un comando propio (Q-10).
- **Buscar texto o archivos por nombre dentro del proyecto.** No se pidió; queda para otra
  corrida si se pide. [remove]: entra en 0.2.0, buscar por nombre en el árbol; buscar texto
  adentro de los archivos sigue afuera.
- **Buscar texto adentro de los archivos.** Para eso está Claude. [add]
- **Mostrar los diffs.** Es lo que hace `nzt-changes`; este panel marca qué cambió, no cómo.
- **Pasarle a Claude lo que se está mirando.** El panel es para la persona; Claude no lee lo
  que el panel muestra. 0.2.0 lo confirma: pasarle a Claude, en cada mensaje, el archivo
  elegido ocupa contexto (usuario 2026-10-19). En su lugar, copiar la ruta y pegarla en el
  mensaje cuando la persona quiere. [modify]
- **Hacer operaciones de git desde el panel** (commit, push, cambiar de rama). El panel muestra
  las que hace Claude; no las hace (RN-mod-lee-no-escribe). [add]
- **Lo que solo sirve en otras plataformas**: tomar los colores del escritorio en Linux,
  integrarse con multiplexores de terminal, la vista rápida de macOS y abrir en un editor de
  terminal. En Windows no hacen nada (propuesta del agente, 2026-10-19). [add]

## Reglas

### RN-files-ubicacion · [modify] · origin: propuesta del agente (mismo lugar que `nzt-changes`); abrirse solo, Q-09
El panel se abre solo al costado de la conversación cuando empieza la sesión, salvo que el
ajuste **Abrir al empezar** esté apagado. `/nzt-files` lo abre o lo cierra. Si no hay lugar al
costado, se abre sobre el prompt y `/nzt-files` dice dónde quedó; al empezar la sesión, sin
lugar al costado, no se abre solo.

### RN-files-dividido · [modify] · origin: usuario 2026-10-14 (Q-01: "los dos a la vez"); lo ampliado, Q-07
El panel muestra el árbol arriba y el archivo elegido abajo, al mismo tiempo, salvo mientras
el archivo está ampliado (RN-files-ampliar). El archivo elegido queda marcado en el árbol.
Mientras no se eligió ninguno, la parte de abajo dice "Elegí un archivo del árbol".

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
después verde), aunque esté cerrada. [modify] 0.2.0: donde entra, en lugar del punto lleva
cuántos tiene de cada uno, cada número en su color (`U:2 M:5 D:1`); en un panel angosto
sigue el punto. *Origen: usuario 2026-10-19 (funciones acordadas).*

### RN-files-lineas · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Un archivo modificado lleva, antes de su **M**, cuántas líneas se agregaron en verde y cuántas
se quitaron en rojo contra el último commit (`+12 -3`). En un panel angosto se ven solo las
letras.

### RN-files-rama · [add] · origin: usuario 2026-10-19 (funciones acordadas)
El encabezado dice la rama, la rama remota que sigue y cuántos commits está adelante (`↑2`) y
atrás (`↓1`). Sin rama remota, solo la rama; en un commit suelto, el commit corto; sin
repositorio, `sin git` como hasta ahora.

### RN-files-git-pie · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Cuando Claude corre una operación de git o de GitHub (commit, push, pull, fetch, cambiar de
rama, merge, rebase, stash, reset, tag, un pull request), la última fila del panel dice que la
está haciendo (`haciendo push…`) y después cómo terminó (`push hecho`, o `push falló`).

### RN-files-git-pie-dura · [add] · origin: propuesta del agente (Q-11)
La fila de la operación terminada se va sola a los 45 segundos, o antes si empieza otra.

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

### RN-files-teclas · [modify] · origin: propuesta del agente (lo que funcionó en `nzt-changes` 0.4.0); 0.2.0, propuesta del agente (Q-11)
Las flechas, `j` y `k` recorren las filas del árbol; `l` abre la carpeta de la fila y `h` la
cierra o sube a la carpeta que la contiene; Enter abre o cierra la carpeta, o muestra el
archivo en el visor. El archivo se mueve con Mayús+↑ y Mayús+↓ de a una línea y con RePág y
AvPág de a una página. `s` va a la búsqueda, `c` copia la ruta, `a` amplía, `m` marca o
desmarca la casilla Markdown, `o` abre con la app. Escape, en este orden: vacía la búsqueda, sale de lo
ampliado o cierra el panel.

### RN-files-acento · origin: mismo criterio que RN-cambios-acento de `nzt-changes` (usuario 2026-10-14)
El panel sigue la estética de NZT: el acento y la etiqueta NZT de `nzt-changes`.

### RN-files-idioma · origin: mismo criterio que RN-panel-idioma de `nzt-state`
Los textos del panel están en español (por defecto) o en inglés, según la opción de idioma del
mod, que se elige al instalarlo, como en `nzt-changes`.

### RN-files-contexto-cero · [add] · origin: usuario 2026-10-19 ("no quiero que ocupe contexto el mod que hagamos")
El panel no le agrega nada a lo que Claude lee: ni a los mensajes de la persona, ni al empezar
la sesión, ni a los resultados de las herramientas, ni notas propias. Con el panel abierto o
cerrado, la misma conversación ocupa el mismo contexto.

### RN-files-solo-mira · [add] · origin: usuario 2026-10-19 (lo que se le explicó: "solo mirar, nunca cambiar")
Cuando Claude usa una herramienta, el panel mira cuál es y sobre qué archivo, y nada más: la
herramienta hace lo mismo y devuelve lo mismo que sin el panel. Si el panel no puede seguir lo
que hizo Claude (un error al leer, un comando que no entiende), no lo pinta, y la herramienta
no se entera.

### RN-files-comando-callado · [add] · origin: propuesta del agente (RN-files-contexto-cero: lo que imprime un comando puede quedar en la conversación)
`/nzt-files` no imprime nada cuando abre o cierra el panel al costado. Imprime una línea solo
cuando no puede abrirlo ahí y dice por qué (RN-files-ubicacion).

### RN-files-actividad · [add] · origin: usuario 2026-10-19 ("pinta de un color los archivos cuando Claude los esta leyendo, y de otro cuando esta escribiendo"); colores, Q-08
Cuando Claude lee un archivo del proyecto, su fila se pinta de **violeta**; cuando lo escribe,
de **naranja**; cuando lo commitea, de **verde**. El color aparece cuando la herramienta
empieza y dura mientras corre.

### RN-files-actividad-fundido · [add] · origin: propuesta del agente (Q-11)
Cuando la herramienta termina bien, el color se apaga solo en unos 3 segundos. Si falló o la
persona la rechazó, el color se quita en el momento.

### RN-files-actividad-que · [add] · origin: propuesta del agente (Q-11)
Cuenta como **leer**: abrir un archivo, y los archivos que encontró una búsqueda por contenido
o por nombre (hasta 60 por búsqueda), y los que nombra un comando de la shell que solo lee
(`cat`, `grep`, `rg`, `head`, `Get-Content`, `Select-String` y parecidos). Cuenta como
**escribir**: crear o cambiar un archivo, y los archivos que cambiaron mientras corría un
comando de la shell. Cuenta como **commit**: los archivos de un commit que hizo Claude.

### RN-files-actividad-fuera · [add] · origin: propuesta del agente
Si Claude lee o escribe algo fuera de la carpeta del proyecto, o un comando de la shell que
el panel no reconoce, entonces el árbol no pinta nada: no adivina.

### RN-files-actividad-carpeta · [add] · origin: propuesta del agente (Q-11)
Si el archivo está adentro de una carpeta cerrada, la carpeta toma el color mientras dura el
del archivo.

### RN-files-seguir · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Mientras el ajuste **Seguir a Claude** está encendido (por defecto), cuando Claude lee,
escribe o commitea un archivo el árbol abre las carpetas que lo contienen y se mueve hasta
dejarlo a la vista. Apagado, el árbol se queda donde la persona lo dejó y solo se pinta.

### RN-files-actividad-ajuste · [add] · origin: usuario 2026-10-19 (funciones acordadas)
El ajuste **Actividad de Claude** elige qué se pinta: leer y escribir (por defecto), solo
escribir, solo leer o nada. El verde del commit se ve siempre que se pinte algo.

### RN-files-markdown · [add] · origin: usuario 2026-10-19 ("cuando veamos archivos MD tengamos un botón que sea para verlos en formato MD"; Q-11: "que abra marcado para leer como MD pero que pueda desmarcarse")
Un archivo `.md`, `.markdown` o `.mdx` se muestra **dibujado**, como Claude dibuja una
respuesta: títulos, listas, tablas, bloques de código y links. Arriba lleva la casilla
**☑ Markdown**, marcada al abrirlo; desmarcada (**☐ Markdown**) muestra el archivo como texto
con números de línea, y marcarla lo vuelve a dibujar. Lo elegido vale para todos los Markdown
mientras dura la sesión. Los demás archivos no tienen la casilla.

### RN-files-markdown-bloques · [add] · origin: propuesta del agente (Q-11: cortar por líneas puede partir una tabla)
En la vista dibujada, el archivo avanza y retrocede de a bloque (un título, un párrafo, una
lista, una tabla, un bloque de código), nunca por la mitad de uno: una tabla o un bloque de
código no se ve cortado por arriba. Debajo sigue diciendo qué líneas del archivo se ven.

### RN-files-markdown-grande · [add] · origin: propuesta del agente (Claude Code dibuja hasta 100.000 caracteres de una vez, tipos de `Markdown`)
Si un solo bloque es más grande de lo que Claude Code dibuja de una vez, entonces ese archivo
se muestra como fuente y el visor dice por qué.

### RN-files-ampliar · [add] · origin: usuario 2026-10-19 (Q-07)
Un botón **Ampliar** muestra el archivo en todo el panel, sin el árbol; **← Árbol**, o Escape,
vuelve a como estaba, con las mismas carpetas abiertas y el mismo archivo elegido. Ampliado,
el archivo se recorre igual que abajo.

### RN-files-buscar · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Mientras se escribe en **Buscar**, el árbol muestra los archivos y carpetas cuya ruta desde el
proyecto contiene el texto, sin distinguir mayúsculas, aunque estén en carpetas cerradas,
hasta 60, con las carpetas que los contienen abiertas. Enter elige el primero, vacía la
búsqueda y deja abiertas sus carpetas. Vaciarla vuelve el árbol a como estaba.

### RN-files-buscar-nada · [add] · origin: propuesta del agente
Si nada coincide, entonces el árbol dice `Nada con «texto»` y la búsqueda sigue abierta.

### RN-files-buscar-pesadas · [add] · origin: propuesta del agente (Q-11)
La búsqueda no entra en `.git`, `node_modules`, `bin`, `obj`, `dist` ni `target`. Siguen a la
vista en el árbol (RN-files-ocultos) y se recorren abriéndolas.

### RN-files-copiar · [add] · origin: usuario 2026-10-19 (reemplaza pasarle la selección a Claude: "copiar la ruta y pegarla")
**Copiar ruta** copia al portapapeles la ruta del archivo o carpeta de la fila desde la
carpeta del proyecto; con Mayús, la ruta completa. Un aviso breve dice qué se copió, o que no
se pudo. La ruta no entra en la conversación hasta que la persona la pega.

### RN-files-mencion · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Cuando la persona manda un mensaje que nombra `@ruta` de un archivo del proyecto, el árbol
abre sus carpetas y lo deja a la vista y resaltado. El mensaje llega a Claude igual que sin el
panel (RN-files-contexto-cero).

### RN-files-abrir-app · [add] · origin: usuario 2026-10-19 (Q-10); que lo abra el doble clic y no Enter, propuesta del agente (Enter ya muestra el archivo en el visor)
Un doble clic, o `o`, en un archivo lo abre con la app que el sistema tiene para ese tipo (en
Windows, un `.sln` en Visual Studio). Si el ajuste **Abrir con** tiene un comando, corre ese
comando: `{path}` es el archivo y `{dir}` su carpeta, y sin `{path}` la ruta va al final.

### RN-files-abrir-falla · [add] · origin: propuesta del agente
Si no hay app para ese tipo o el comando no existe, entonces un aviso breve lo dice y el panel
sigue igual.

### RN-files-columna · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Cada fila lleva a la derecha, antes de la marca de git, una columna que el ajuste **Columna**
elige: **fecha** de la última modificación (por defecto), **edad** (`ahora`, `12m`, `3h`,
`5d`; pasada una semana, el día, `9 oct`; pasado un año, también el año) o **tamaño**. El botón
`Σ` del encabezado cambia entre tamaño y la fecha o la edad.

### RN-files-tamaño-carpeta · [add] · origin: usuario 2026-10-19 (funciones acordadas)
En tamaño, una carpeta muestra lo que ocupa todo lo que tiene adentro, calculado por detrás
solo para las filas a la vista; mientras se calcula dice `…`. Cuando Claude escribe adentro, se
vuelve a calcular.

### RN-files-tamaño-falla · [add] · origin: propuesta del agente
Si el tamaño de una carpeta no se puede calcular en 15 segundos o sin permiso, entonces dice
`?` y el resto de la columna sigue.

### RN-files-iconos · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Cada fila lleva un ícono según el tipo de archivo o carpeta. El ajuste **Íconos** elige: los
de Nerd Font si están instalados (por defecto, *auto*), siempre Nerd Font, o solo Unicode
simple.

### RN-files-aviso-sin-git · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Fuera de un repositorio, una línea bajo el encabezado dice que las marcas de git aparecen
después de `git init`. El ajuste **Avisos** la apaga y el árbol gana esa fila.

### RN-files-ajustes · [add] · origin: usuario 2026-10-19 (funciones acordadas)
Los ajustes están en `/config`, en `nzt-files`, junto al idioma: Actividad de Claude, Seguir
a Claude, Abrir al empezar, Columna, Abrir con, Íconos y Avisos. Un cambio vale desde ese
momento, sin reiniciar la sesión.

## Requisitos no funcionales
- Abrir el panel, abrir una carpeta o elegir un archivo se ve en menos de medio segundo en
  un proyecto de 20.000 archivos con `node_modules` (propuesta del agente).
- Abrir el panel no lee el proyecto entero: se lee cada carpeta cuando se abre (propuesta
  del agente; se mide junto con el punto anterior).
- `/context` da la misma cifra después de un mismo turno con el panel abierto y cerrado
  (RN-files-contexto-cero; usuario 2026-10-19). [add]
- Con el panel abierto, ninguna herramienta de Claude tarda más de 50 ms de más que sin él,
  medido sobre un `Read` y un `Edit` en este repositorio (propuesta del agente). [add]

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

## Diseño 0.2.0 (unidad 279) · [add]

Mismo mockup (`specs/mods/nzt-files/mockup.html`), ahora con 25 estados por hash; reemplaza al
de 0.1.0. La tarea y la acción principal no cambian: elegir un archivo del árbol.

**La tarjeta**, de arriba hacia abajo (lo nuevo en negrita):
1. Encabezado: ` NZT ` `Archivos`; a la derecha, tenue, **la rama, la remota y `↑n` `↓n`**
   (RN-files-rama), `● n` cambiados y **el botón `Σ`** (RN-files-columna). Sin repositorio,
   `sin git` y debajo **la línea de aviso** (RN-files-aviso-sin-git).
2. **Buscar**: `⌕ Buscar (s)`; escribiendo, el texto y `×`; las coincidencias subrayadas en
   amarillo en el árbol; sin coincidencias, `Nada con «zzz»` (RN-files-buscar, -buscar-nada).
3. Árbol, 15 filas al costado y 7 sobre el prompt. Cada fila: sangría, `▸`/`▾`, nombre, **las
   líneas `+N -N`**, **la columna** (fecha, edad o tamaño; `…` calculando, `?` sin poder) y la
   marca; **una carpeta con cambios, sus conteos** `U:1 M:1`, y en angosto el `●`
   (RN-files-git, -lineas). **La actividad** pinta el nombre: violeta, naranja o verde mientras
   corre, y se apaga en 3 segundos; una carpeta cerrada toma el color (RN-files-actividad y
   siguientes). Con Seguir a Claude, el árbol se mueve hasta la fila pintada.
4. Separador, ruta y detalle del archivo, como en 0.1.0.
5. **Herramientas del archivo**: `☑ Markdown` (solo en Markdown), `Ampliar a`, `Copiar ruta c`,
   `Abrir ↗ o` (RN-files-markdown, -ampliar, -copiar, -abrir-app).
6. Contenido: código con número de línea, o **Markdown dibujado** que avanza de a bloque
   (`líneas 1–26 de 412 · de a bloque`); si un bloque es enorme, fuente con una línea que dice
   por qué (RN-files-markdown-bloques, -grande). **Ampliado**, el árbol y la búsqueda se van y
   el botón dice `← Árbol`.
7. **La fila de git**: `↑ haciendo push…`, `● commit hecho · mensaje`, `✗ push falló`
   (RN-files-git-pie).
8. `[ Cerrar ]`, siempre en la última fila. **Los avisos breves** (ruta copiada, sin app para
   abrir) flotan sobre las dos últimas filas y no las mueven.

**Angosto**: sin la columna ni `+N -N`; las carpetas, con `●` en lugar de los conteos; el resto
como en 0.1.0. **Íconos**: el mockup dibuja el modo Unicode simple; los de Nerd Font se miran en
vivo.

**Medido** en el mockup (Chrome sin ventana, 2026-10-19): 25 estados × al costado y sobre el
prompt × 320 y 800 px, ninguno con scroll horizontal; la tarjeta mide siempre 802 px al costado y
482 sobre el prompt, y `[ Cerrar ]` está siempre a la misma altura en cada combinación.
**Contraste**, sobre el fondo y sobre la fila elegida: violeta 6,59 y 4,50 (justo AA), naranja
7,69 y 5,25, verde 9,99 y 6,82, `+N` 7,80 y 5,33, `↑n` 9,35 y 6,39. Sobre la fila elegida el rojo
de `-N` daba 4,15 y la columna tenue 3,68: se aclararon (5,88 y 5,73). Teclado: el orden de Tab
sigue al de la tarjeta (Σ, búsqueda, filas, herramientas, contenido, Cerrar); revisado por el
orden de los elementos, no recorrido con teclado.

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

### Q-07 · El visor, ¿sigue debajo del árbol o ocupa todo el panel?
- bloquea: RN-files-dividido (Q-01 decidió "los dos a la vez") y la vista Markdown (unidad 275)
- respuesta: Los dos a la vez, como hoy, más un botón que amplía el archivo a todo el panel y
  ← para volver (opción propuesta por el agente, elegida por el usuario). · 2026-10-19

### Q-08 · ¿De qué color se pinta lo que Claude lee, escribe y commitea?
- bloquea: la actividad de Claude (unidad 274) y el mockup
- respuesta: Leer violeta, escribir naranja, commit verde. · 2026-10-19

### Q-09 · ¿El panel se abre solo al empezar la sesión?
- bloquea: RN-files-ubicacion y los ajustes (unidad 278)
- respuesta: Sí, se abre solo, con un ajuste en `/config` para apagarlo. · 2026-10-19

### Q-10 · Abrir un archivo fuera del panel: ¿con qué?
- bloquea: el pendiente de Q-03 y la navegación (unidad 276)
- respuesta: Con la app que Windows tiene para ese tipo de archivo (un `.sln` en Visual Studio), y
  en `/config` un comando propio que la reemplaza, como `code -g {path}`. · 2026-10-19

### Q-11 · ¿Confirmás las propuestas del agente de las unidades 273 a 278?
- bloquea: que las reglas con origin "propuesta del agente" de 0.2.0 cuenten como acordadas
- respuesta: "ok buenisimas tus propuestas, lo unico el punto 3. quiero que abra marcado para
  leer como MD pero que pueda desmarcarse si se desea [...] por default que se vea en formato
  md": confirmadas las teclas nuevas, doble clic u `o` para abrir con la app, de a bloque en
  Markdown, la búsqueda sin carpetas pesadas y los tiempos; el Markdown, con una casilla
  marcada por defecto (RN-files-markdown). · 2026-10-19

### Q-12 · Lo que la plataforma no deja hacer como dice la spec, ¿se acepta así?
- bloquea: RN-files-teclas, -copiar, -iconos y los avisos breves del Diseño 0.2.0 (hallado al construir, unidades 280 a 285)
- respuesta: "Ok a todas tus propuestas": el archivo se mueve sin Mayús+flechas; se copia solo la
  ruta desde el proyecto; íconos en auto como Unicode; avisos en la fila de git; `j` `k` `h` `l`
  como botones; Cerrar sin tecla. El texto de esas reglas se alinea al cerrar (unidad 287). · 2026-10-19

## Sin determinar
- [remove]: resuelto por Q-10 en 0.2.0 (app de Windows o comando propio).
  **Abrir en el editor que corresponde al proyecto** (Q-03, después de esta corrida): no solo
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
- **0.2.0, para resolver al construir** (unidades 280 a 285; leído en los tipos del motor, no
  probado): [add]
  - El evento de cada herramienta llega antes y después de que corra, con su nombre y sus
    argumentos, y el mod puede devolver el resultado intacto. Falta ver en vivo si llega
    también con las herramientas de los subagentes.
  - El elemento `Markdown` del motor dibuja como una respuesta; es una sola pieza, no dice
    cuántas filas ocupa, y dibuja hasta 100.000 caracteres (RN-files-markdown-bloques, -grande).
  - Tamaños, cambios hechos por la shell y abrir con la app se resuelven sin herramientas de
    Unix (`find`, `du`, `sh`), para que todo ande en Windows.
  - Los ajustes con opciones en `/config` piden una versión de Claude Code más nueva que la
    2.1.275 que hoy pide el README (sin verificar cuál: se confirma con `claude plugin validate`).
  - El código se escribe desde cero en este repositorio; no se copia código de otros proyectos.
- **0.2.0, resuelto al construir** (unidades 280 a 285, tipos y kit de Claude Code 2.1.303):
  - Contexto cero: el hook de herramientas devuelve el mismo resultado que recibió, sin
    `context`; el de mensajes llama primero a `next` y después mira las `@ruta`; `/nzt-files`
    devuelve `{}` (sin línea) al abrir o cerrar al costado; nada en `prompt.compose` ni al
    empezar la sesión. Lo guardan tres tests.
  - Subagentes: los tipos dicen que las herramientas de un subagente levantan su propio evento
    de herramienta, así que se pintan igual. El evento, probado en vivo el 2026-10-19 (V-05);
    el color en el árbol, pendiente de verse con el panel (V-07).
  - Escribir por la shell: el panel compara `git status` y `git diff --numstat` (y la fecha de
    cada archivo cambiado) antes y después del comando. Un archivo que git ignora y cambia no
    se ve. Lo que nombra un comando que solo lee se pinta solo si existe en el proyecto.
  - Abrir con la app, en Windows: `Start-Process` de PowerShell, que no espera a la app; con
    **Abrir con**, el primer término es el programa y el resto sus argumentos. Sin Unix.
  - Ajustes: `/config` recarga el mod con los valores nuevos (tipos 2.1.303); `validate` acepta
    los campos booleanos y con opciones. El README pide ahora 2.1.303, la versión probada.
  - **Lo que la plataforma no deja hacer tal como dice la spec**, aceptado por el usuario tal
    como está abajo (Q-12):
    - **Mayús+↑/↓ no llega a un panel**: un panel recibe Tab, las letras de sus botones y las
      flechas como scroll. El archivo se mueve con la rueda, RePág/AvPág y los botones ▲ ▼.
    - **Copiar con Mayús la ruta completa**: un clic o una tecla de botón no dice si Mayús
      estaba apretada. Se copia la ruta desde el proyecto; la completa no está hecha.
    - **Íconos en auto**: un mod no puede saber qué fuente usa la terminal; auto dibuja
      Unicode simple. Los puntos de código de Nerd Font no se probaron con la fuente.
    - **Los avisos breves** (ruta copiada, no se pudo abrir) no flotan: ocupan 3 segundos la
      fila de git. Un panel no dibuja una capa encima de otra.
    - **`j` `k` `h` `l` son botones** (`↑ ↓ ← →` a la derecha de la búsqueda): un panel solo
      toma una letra como tecla de un botón dibujado. Las flechas del teclado recorren el árbol
      solo si el motor las manda al panel con el árbol entero a la vista: a probar en vivo.
    - **`c` ya no cierra** (RN-files-teclas); Cerrar queda sin tecla, con Escape y el botón.

## Tests

`claude plugin test mods/nzt-files`: **95 tests** en 0.2.0 (2026-10-19), todos pasan: 18 de la
lógica del árbol (`tree.test.ts`), 30 de la lógica nueva (`logic.test.ts`: rama, líneas,
conteos, operaciones de git, qué hace cada herramienta, comandos que solo leen, bloques de
Markdown, búsqueda, rutas, edad y ajustes) y 47 del panel dibujado (`register.test.tsx`: lo de
0.1.0, contexto cero, actividad y su fundido, seguir, git, Markdown, ampliar, búsqueda, teclas,
copiar, abrir con la app, `@ruta`, columna, íconos y abrir al empezar). También pasan
`claude plugin validate` y `tsc` con los tipos de 2.1.303.
**No cubierto hasta QA** (el kit no lo alcanza): que el módulo cargue en una sesión; Escape
(el kit no levanta un cierre de la persona); las flechas del teclado; el doble clic real; el
portapapeles y abrir con la app de verdad; los colores y los íconos en una terminal; `/context`
igual con el panel abierto y cerrado; los 50 ms; los subagentes.
**Prueba en vivo 2026-10-19** (unidad 286, `testing/2026-10-19-en-vivo.md`): pasaron que el
módulo cargue, `/context` igual con y sin el mod, los mismos resultados de herramienta y el
mismo contexto, los 50 ms (+10 ms en `Read`) y que las herramientas de un subagente levanten el
evento. **Bloqueado**, a correr por la persona con el panel a la vista: `/context` con el panel
abierto y cerrado, colores y fundido, Escape, flechas, doble clic, portapapeles, abrir con la
app, íconos y el medio segundo con 20.000 archivos.

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
