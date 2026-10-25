# Mod · nzt-look — temas, banda de uso y conversación redibujada

> Estado: **aceptada por el usuario el 2026-10-19 con nzt-look 0.5.0**: *"así como está
> funcionando va perfecto"*; marcas barridas en el cierre (unidad 272). Queda **una** marca `[add]`,
> la de la fila de una skill en RN-skin-textos-claude: BUG-001 sigue *fixed, pending verification*
> porque nadie miró esa fila en vivo · Cómo llegó acá: **especificada** en la unidad 216
> (2026-10-17); tema `nzt` en la 222 y diseño técnico en la 223; **0.1.0** en las 227 a 239
> (2026-10-18), código en `mods/nzt-look/` · **0.2.0** (241 y 242): modelo y effort en la banda,
> pedido del usuario: *"ver además de los datos del context, limite semanal y diario el modelo que
> esta corriendo actualmente y su effort"* · **Textos (244):** el mod no cambia los textos de Claude
> Code: *"me gusta el cambio de estilo digamos pero no me gusta que se le cambien sus textos"* ·
> **Ajustes de la prueba en vivo (247, Q-11):** spinner con las cifras de Claude Code, pie de
> Claude Code, viñeta, tablas anchas, filas y diffs legibles · **NZT oscuro más apagado y código
> legible (253, Q-03 de la marca):** *"esta como super brillante"*, *"se ve muy blanco el texto"* ·
> **0.3.0 (256 a 262):** banda en dos filas con rótulos y el modelo primero (reemplazada por 0.4.0),
> fila de una skill (BUG-001), filas que se pliegan tocándolas y temas que no cansen la vista ·
> **0.4.0 (263 y 264):** la banda vuelve a una línea, con los rótulos a la izquierda de cada
> medidor, sin la palabra del tramo y con naranja desde el 30 · **0.5.0 (269 y 270, 2026-10-19):**
> el look sigue tras `/clear` (*"cuando limpio contexto se pierde el look elegido"*) y botón que
> lleva NZT oscuro y claro a `/theme` · **0.6.0 (300 a 303, 2026-10-20):** tema `default`, el
> dibujo de Claude Code, por defecto y primero en TEMA · **0.7.0 (D80, 2026-10-24):** las
> marcas siguen al kernel, que pasó a 30/40: dos marcas, amarillo desde el 30 y rojo desde el 40,
> sin naranja; reglas con `[modify]` hasta probarlo en vivo · **0.8.0 (unidad 362,
> 2026-10-24):** la app de escritorio: tablas en grilla de cajas (QT-07), código en una sola
> fuente, en la app la variante elegida (QT-09 de la revisión de escritorio, que corrige la opción A
> de su QT-08) y los temas copiados solos a `/theme` (su QT-08),
> reglas con `[modify]` hasta que el usuario lo vea en la app; la banda, sin botón limpiar
> (`[remove]`, usuario 2026-10-25) ·
> Reemplaza a
> `nzt-context`, ya retirado del repo y del marketplace (M4 de `specs/nzt-mods.md`, unidades 225 y
> 226). Las reglas `RN-ctx-*` que se citan como origen están en su spec, que se lee en el tag
> `nzt-context--v0.2.0` · Depende de: `specs/nzt-mods.md` (reglas de todo mod y
> catálogo), `specs/nzt-brand.md` (la paleta NZT) y la sección **Context** del kernel
> (`core/kernel.md`) · Referencia de alcance: **el mod de referencia** · Lo que el motor
> permite con temas: el spike de la unidad 219 (`specs/testing/2026-10-17-spike-skins.md`).
> El usuario lo pidió el 2026-10-17: reemplazar `nzt-context` por un mod con todo el alcance del mod que se
> tomó de referencia, con sus temas más NZT oscuro y claro, la banda de uso configurable y la
> conversación redibujada, en terminal y escritorio.

## Qué resuelve

`nzt-context` muestra una sola cifra, el contexto, y Claude Code dibuja todo lo demás a su manera:
las llamadas a herramientas, los diffs, la salida de la consola, las tablas y el código. Quien
trabaja con NZT tampoco tiene un aspecto propio de la marca. Este mod junta tres cosas en uno: un
**tema** que cambia los colores de lo que dibuja (y, aparte, los temas NZT de Claude Code), una
**banda de uso** sobre el prompt con contexto, límites del plan y costo, y una **conversación
redibujada** más fácil de leer. Las marcas 30/40 del kernel y la cifra que recibe el agente
siguen estando, como en `nzt-context`.

## Alcance

**Adentro**
- **Temas del mod:** los 15 de la referencia (`noir`, `tokyo-night`, `dracula`, `catppuccin`,
  `rose-pine`, `nord`, `gruvbox`, `kanagawa`, `everforest`, `one-dark`, `solarized`, `night-owl`,
  `ayu`, `github`, `mono`) más **`nzt`**, cada uno en variante oscura y clara.
- **Temas NZT de Claude Code:** NZT oscuro y NZT claro elegibles en `/theme`, para que el borde del
  prompt, el spinner propio y los textos de Claude Code también lleven la marca.
- **La banda de uso** sobre el prompt, con sus partes prendidas o apagadas una por una: contexto con
  las marcas 30/40, límite de 5 horas, límite semanal, costo de la sesión, **modelo y effort de
  la sesión**. El botón para limpiar la sesión (`/clear`) se sacó el 2026-10-25 (RN-skin-limpiar).
- **El panel de opciones** (`/nzt-look`): elegir tema con vista previa, prender y apagar partes,
  repintar un color.
- **La conversación redibujada:** filas de herramientas, diff de las ediciones, consola, tablas,
  bloques de código, diagramas Mermaid, fórmulas, avisos y listas de tareas, salida de comandos,
  spinner, enlaces y archivos, y el contorno del prompt del usuario.
- **Modo calmo, copiar, plegar y desplegar**, como la referencia.
- **Diseñar un tema con Claude:** pedirle "un tema que se sienta como un atardecer" y que el agente
  lo arme y lo aplique.
- **Un tema por carpeta:** fijar un tema a un proyecto y volver al de siempre.
- **La capa NZT:** las marcas 30/40 del kernel en la banda y la línea de contexto al agente con
  cada prompt (lo que hacía `nzt-context`, ya retirado).
- Español e inglés en lo que ve el usuario.

**Afuera**
- **Activar el tema de Claude Code desde el mod.** El motor no lo permite: `/config` solo acepta los
  temas propios de Claude Code y rechaza uno de plugin (spike S-01 y S-02). La persona lo elige una
  vez en `/theme`; el mod dice cómo.
- **El aviso de compactar al 70% de la referencia.** Choca con el kernel, que recomienda limpiar
  desde el 30%; la banda avisa en las marcas del kernel (RN-skin-marcas-kernel).
- **Avisar que hay una versión nueva.** La referencia lo hace una vez por día; en NZT los mods se
  actualizan por el marketplace (`specs/nzt-mods.md` sección 6).
- **Ofrecerles a otros mods el dibujo de markdown** (en la referencia). Ningún mod
  de NZT lo pidió; se suma si alguno lo necesita.
- **Redibujar los subagentes, el modo plan, las tareas y el pedido de permiso.** La referencia los
  deja en el dibujo de Claude Code porque no los puede redibujar fielmente; acá igual.
- **El panel de opciones en el celular.** No tiene campos de entrada; dice que se use la terminal o
  la app de escritorio.
- **Leer artefactos de NZT.** Como `nzt-context`, el mod no lee `Plan/state.json` ni ningún
  documento: es genérico (RN-mod-tipo), y su capa NZT sale de los cortes del kernel.
- **Codex.** Un mod es solo de Claude Code (D63).

## Reglas

### Temas

#### RN-skin-tema-por-defecto · origin: propuesta del agente (unidad 216); usuario 2026-10-20 (QT-20) [modify]
Al instalarlo, el tema del mod es `default`. Se cambia con `/nzt-look <tema>` o en el panel, y la
elección se recuerda entre sesiones. Quien ya había elegido un tema lo conserva. *Origen del
cambio: "por defecto no debe venir con el theme de nzt seleccionado, debe tener el theme por
defecto de claude"; con `nzt` en variante `auto` su consola mostraba la clara y no se leía.*

#### RN-skin-tema-default · origin: usuario 2026-10-20 (QT-20: dibujo de Claude) [add]
`default` es el primer tema de TEMA. Con `default` en vigor, el mod no redibuja la conversación:
filas de herramientas, tarjetas, tablas, código, diagramas, fórmulas, spinner y prompt quedan como
los dibuja Claude Code con su `/theme`, igual que con `/nzt-look off`. La banda, la línea al agente
y el panel siguen, pintados con la paleta de `mono`. Se fija a una carpeta como cualquier otro
tema (RN-skin-por-carpeta), y elegir otro tema vuelve a redibujar. No se repinta: los colores del
panel repintan `mono` y lo guardan como `mi-mono`. Ningún tema propio se puede llamar `default`.

#### RN-skin-tras-clear · origin: usuario 2026-10-19 ("cuando limpio contexto se pierde el look elegido")
Después de `/clear`, `/resume` o `/branch` el look sigue siendo el elegido: tema, variante, partes,
banda, temas propios y el tema fijado a la carpeta. Claude Code sigue el proceso con otra sesión
sin avisarle al mod, así que el mod vuelve a leer lo guardado cuando ve que la sesión cambió.

#### RN-skin-variante · origin: alcance del usuario 2026-10-17 y su pedido de ese día
Cada tema tiene variante oscura y clara, y la variante sigue al tema de Claude Code: con `auto`,
sigue a la terminal o al sistema. Se puede forzar una de las dos con una opción del mod.
**[modify] En la app de escritorio (usuario 2026-10-24, QT-09 de `specs/mods/revision-escritorio.md`, A + B):** la variante sale igual
que en la terminal: manda la elegida en el panel, y con `auto` el tema de Claude Code o el sistema.
La API no le dice al mod si la app está en claro u oscuro, y la app puede estar distinta del
sistema (Windows en claro con la app en oscuro, H-13 de `specs/mods/revision-escritorio.md`), así
que solo la elección de la persona la iguala. El porcentaje del contexto en la banda, mientras no
avisa, va sin color propio, en el de texto de la app. Reemplaza la opción A de su QT-08 (la variante
del sistema en la app), que suponía que la app se ve como el sistema.

#### RN-skin-tema-nzt · origin: usuario 2026-10-17, `specs/nzt-brand.md`
El tema `nzt` usa la paleta y los roles de `specs/nzt-brand.md`, y ese documento manda sobre él.
Los colores de error y aviso y la variante clara salen de sus preguntas Q-01 y Q-02 (cerradas en
la 222). Qué rol toma cada color está en *Diseño · tema nzt*.

#### RN-skin-tema-claude · origin: spike S-01, S-02 y S-04b (unidad 219); usuario 2026-10-19 (opción 1)
NZT oscuro y NZT claro llegan a `/theme` de Claude Code con la paleta de `nzt`. El mod no puede
elegir el tema de Claude Code (observado con 2.1.303: la opción `theme` solo acepta sus 7 temas),
así que el panel tiene un botón que copia los dos a la carpeta de temas de la persona
**[modify] y además los copia solo al empezar cada sesión, sin decir nada** (usuario 2026-10-24,
QT-08: "que los themes se copien solos a /theme"; observado de nuevo con 2.1.310 que el mod no
puede elegirlos)
(`~/.claude/themes/`, o la de `CLAUDE_CONFIG_DIR`), y ella elige uno en `/theme`. Un archivo que ya
está ahí y es distinto no se pisa: el panel lo dice. Elegir NZT oscuro o claro en `/theme` pone el
mod en `nzt` (en la carpeta fijada, si la hay), sin prender ni apagar el dibujo; elegir otro tema de
Claude Code solo cambia la variante (RN-skin-variante). Elegir un tema del mod no cambia el de
Claude Code. El borde del prompt y el spinner de Claude Code solo llevan la marca con NZT oscuro
o claro elegido en `/theme`.

#### RN-skin-no-cansa · origin: usuario 2026-10-18 ("que los colores no sean dañinos a la vista, no muy brillosos")
Ninguna paleta oscura escribe texto más brillante que el texto de alto énfasis de Material, ni un
color tan saturado que vibre sobre el fondo. Los cortes y lo que cambió están en *Temas que no
cansan la vista*.

#### RN-skin-repintar · origin: alcance del usuario 2026-10-17
Repintar un color de un tema del mod lo guarda como un tema propio, `mi-<tema>`, y deja el
original intacto.

#### RN-skin-disenar · origin: alcance del usuario 2026-10-17
Cuando la persona le pide al agente un tema, el agente lo arma y lo aplica mientras ella mira, y
queda guardado como uno propio. Si el tema que armó no se puede leer o le falta un color, el mod
sigue con el anterior y lo dice.

#### RN-skin-por-carpeta · origin: alcance del usuario 2026-10-17
Un tema puede quedar fijo a una carpeta: en esa carpeta manda ese, y en las demás el de siempre.
Soltarlo vuelve al de siempre; hacerlo el de siempre lo aplica en todas.

#### RN-skin-apagado · origin: alcance del usuario 2026-10-17
`/nzt-look off` devuelve todo el dibujo a Claude Code sin desinstalar el mod. **La banda y la línea
al agente no se apagan con eso:** son la capa NZT y tienen su propia opción (RN-skin-banda-partes,
RN-skin-al-agente).

### Banda de uso

#### RN-skin-banda-partes · origin: usuario 2026-10-17 ("banda de uso configurable"); modelo, usuario 2026-10-18
La banda tiene cinco partes, y cada una se prende o se apaga sola: **contexto**, **límite de 5
horas**, **límite semanal**, **costo** y **modelo**. Por defecto están todas
prendidas. La sexta, **botón limpiar**, se sacó (RN-skin-limpiar). Con todas apagadas, la banda no se dibuja.

#### RN-skin-modelo · origin: usuario 2026-10-18 ("el modelo que esta corriendo actualmente y su effort")
La parte modelo muestra el modelo con el que corre la sesión y, al lado, su effort: `Opus 5.5 ·
high`. Es el de la conversación principal, no el de un subagente.
- **El effort se conoce recién con el primer pedido al modelo** de la sesión: antes, la parte
  muestra solo el modelo. Si el modelo no tiene effort, también.
- **Un cambio con `/model` se ve enseguida; uno con `/effort`, en el turno siguiente**, que es
  cuando Claude Code lo usa. Al cambiar de modelo, el effort se deja de mostrar hasta el pedido
  siguiente: el modelo nuevo puede tomar otro, o ninguno. *Propuesta del agente, por lo que da Claude Code (investigado
  2026-10-18): el effort solo llega con cada pedido al modelo.*
- **El modelo no es una cifra de uso:** se muestra también *sin lectura todavía*
  (RN-skin-sin-lectura). *Propuesta del agente.*
- **Si el modelo no se puede leer, la parte no se dibuja** y el resto de la banda sigue
  (RN-skin-no-interrumpe).

#### RN-skin-banda-rotulos · origin: usuario 2026-10-18 ("modelo y effort deben estar al inicio"; después de verlo en dos filas: "debe ir todo en una sola linea y quedar legible")
La banda es una sola línea. El orden es modelo, contexto, límite de 5 horas, límite semanal, costo. Cada parte lleva su rótulo **a la izquierda** de su
medidor: `Contexto`, `Límite 5h`, `Límite semanal`, `Costo` (en inglés `Context`, `5h limit`,
`Weekly limit`, `Cost`). El modelo no lleva rótulo: *"se entiende"*. Ejemplo:
`◇ Opus 5.5 · high  Contexto ▰▰▰▱… 34% 68k/200k  Límite 5h ▰▰▰▱▱▱▱▱ 41% · 2h15  Límite semanal ▰▱▱▱▱▱▱▱ 12% · 4d3h  Costo $1.84`.
- **Sin palabra del tramo** (`mejor limpiar`): el color, el `%` y las marcas dicen el tramo, y el
  agente también lo dice (usuario 2026-10-18). Reemplaza a la palabra de 0.1.0 a 0.3.0.
- **Todo va arriba del prompt.** Debajo, Claude Code le deja a un mod solo sumar texto tenue al final
  de su línea de atajos, y solo en la terminal (verificado 2026-10-18 en los tipos de los mods de
  Claude Code 2.1.302, `PromptHint.tail`). *Decisión del agente, objetable.*
- *"Límite 5h" y no "Límite D":* ese límite es una ventana de 5 horas, no de un día
  (RN-skin-limites). *Objeción del agente, dicha una vez.*
- *Las dos filas de 0.3.0 quedan reemplazadas* por esta línea (0.4.0).

#### RN-skin-marcas-kernel · origin: kernel (Context), RN-ctx-tramos y RN-ctx-marcas de `nzt-context`; D80 [modify]
El contexto se muestra de 0 a 100% con las marcas 30 y 40 a la vista, y su color cambia en esos
cortes: neutro por debajo del 30%, amarillo (aviso) desde el 30% y rojo (error) desde el 40%.
Los cortes son los del kernel y no se configuran. *Hasta 0.6.0 eran tres marcas, 20/30/40, con
naranja desde el 30 (usuario 2026-10-18); D80 llevó el kernel a 30/40 (usuario 2026-10-24).*

#### RN-skin-limites · origin: investigado 2026-10-17 (`$.session.usage()`)
Los límites del plan son los que da la sesión: el de 5 horas y el semanal, cada uno con su
porcentaje y lo que falta para que se renueve. No hay límite diario. Si la cuenta no tiene límites
(una clave de API, por ejemplo), esas dos partes no se dibujan.

#### RN-skin-costo · origin: investigado 2026-10-17 (`$.session.usage()`)
El costo es el de la sesión en dólares, como lo da Claude Code.

#### RN-skin-limpiar · origin: usuario 2026-10-17 ("en vez de tener boton compactar quiero tener boton 'clear' para limpiar la sesion"); reemplaza a RN-skin-compactar
**[remove] Sin botón limpiar (usuario 2026-10-25: *"el boton para limpiar el contexto quitemoslo del mod nzt-look, queda feo no va mas"*).** La persona limpia con `/clear` cuando el kernel lo recomienda; lo que sigue queda hasta el cierre de la feature.
El botón limpiar corre `/clear`. Se resalta desde la marca 30 [modify], que es donde el kernel empieza a
recomendar limpiar. El mod nunca limpia solo: muestra, y la persona decide (kernel, Context). La
banda no tiene botón para compactar.

#### RN-skin-limpiar-confirma · origin: propuesta del agente (Q-07)
**[remove]** con RN-skin-limpiar (usuario 2026-10-25).
Apretar limpiar no limpia enseguida: el botón pasa a pedir confirmación, y solo una segunda
pulsación corre `/clear`. Si no llega en 5 segundos, o la persona escribe, el botón vuelve a como
estaba. Limpiar borra la conversación de la sesión y no se deshace.

#### RN-skin-sin-lectura · origin: RN-ctx-sin-lectura de `nzt-context`, spike S-03
Antes de la primera respuesta del modelo, o justo después de un `/clear`, la sesión no tiene cifras.
La banda dice que no hay lectura todavía y no dibuja un 0% ni un límite vacío.

#### RN-skin-banda-refresco · origin: RN-ctx-refresco y RN-ctx-animaciones de `nzt-context`
La banda se actualiza cada vez que la sesión tiene una cifra nueva, en el mismo paso del turno. Las
animaciones de `nzt-context` se mantienen —la cifra que avanza, el destello durante el turno, la
marca que titila al cruzarla, el latido pasado el 40%— y se apagan con el modo calmo.

#### RN-skin-banda-ancho · origin: RN-ctx-ancho de `nzt-context`; modelo, propuesta del agente 2026-10-18
Si la banda no entra en el ancho, se sacan partes en este orden: los tokens del contexto, las
cuentas regresivas, costo, effort, modelo, límite semanal, límite de 5 horas y, al
final, los rótulos. El contexto con sus marcas y su `%` queda siempre. En una línea, a 120
columnas se van tokens y cuentas regresivas, y quedan costo y modelo (test del 2026-10-25, sin el
botón limpiar; con él, medido el 2026-10-18, se iba también el costo). *Que las cuentas regresivas se vayan antes que el costo es propuesta del
agente.* **[modify] En la app de escritorio (usuario 2026-10-25, QT-10 de
`specs/mods/revision-escritorio.md`):** no se saca nada: van los tokens, la cuenta regresiva al lado
de cada límite (`43% · 2h05`, como en la terminal) y el costo, y si la ventana es angosta la banda
baja a una segunda línea. Recortar por caracteres de terminal escondía en la app lo que entraba (H-14).

#### RN-skin-cede-la-banda · origin: RN-ctx-cede-la-banda de `nzt-context`
Mientras Claude Code muestra una encuesta sobre el prompt, la banda no se dibuja.

### Capa NZT: el agente

#### RN-skin-al-agente · origin: RN-ctx-al-agente y RN-ctx-cruce-en-turno de `nzt-context`
Con cada prompt, el agente recibe, sin que el usuario la vea, una línea con el contexto consumido,
los tokens sobre la ventana y el tramo; y si en mitad de un turno el consumo cruza una marca que el
agente no conoce, se le avisa una vez. Va siempre en inglés y ocupa menos de 40 tokens. Tiene su
opción propia, prendida por defecto, independiente de la banda.

#### RN-skin-pista-diagramas · origin: alcance del usuario 2026-10-17
Mientras los diagramas están prendidos, el agente recibe una nota corta de que acá se dibujan los
bloques Mermaid. Se apaga sola con su opción, y nunca va en una corrida sin interfaz (`claude -p`).

### Conversación redibujada

#### RN-skin-partes · origin: usuario 2026-10-17 (todo el alcance de la referencia)
Cada parte redibujada se prende y se apaga sola: filas de herramientas, diffs, consola, tablas,
código, diagramas, fórmulas, avisos y tareas, salida de comandos, spinner, enlaces, contorno del
prompt, plegado. Lo que dibuja cada una, por superficie, es la tabla *Qué se redibuja*.

#### RN-skin-solo-dibujo · origin: alcance del usuario 2026-10-17
El mod cambia solo cómo se ve. La conversación guardada y lo que lee el modelo quedan iguales.

#### RN-skin-textos-claude · origin: usuario 2026-10-18 (Q-10)
El mod cambia el estilo, no los textos que escribe Claude Code. Donde Claude Code pone una palabra,
el mod pone la misma:
- **la fila de una herramienta** lleva el nombre de la herramienta como Claude Code se lo da al mod
  (`Bash`, `Read`, `Edit`, `Write`, `Grep`, `Glob`, `WebFetch`, el de una herramienta de MCP),
  no un verbo propio;
- **la fila de una skill** dice `Skill` una vez y, como objetivo en tenue, el nombre de la skill
  (`Skill nzt-build`); un objetivo que solo repetiría el nombre de la herramienta no se escribe
  (BUG-001, usuario 2026-10-18: *"por que dice skill skill y no skill y el nombre?"*) [add];
- **las lecturas agrupadas** van con esos mismos nombres y su cantidad: `Read 2 · Grep 1`;
- **el spinner y el pie** dicen la palabra de Claude Code (RN-skin-palabras);
- **una llamada cortada** dice `Interrupted`, como Claude Code.

Lo que el mod suma y Claude Code no escribe —la banda, el panel, el título de un aviso, la
cantidad de herramientas y de líneas del pie, `▾ N más`, `Copiar`— sigue en el idioma del mod
(RN-skin-idioma). Si Claude Code no le da al mod su texto, el mod no inventa uno parecido: usa el
nombre que sí recibe (Q-10).

#### RN-skin-spinner-cifras · origin: usuario 2026-10-18 (Q-11)
El spinner del mod muestra lo mismo que el de Claude Code: la palabra, el tiempo que lleva el turno,
los tokens que generó y el effort, en el orden y la forma en que Claude Code los muestra. El estilo
(el cuadro braille y la banda de luz) es del mod.
- **El tiempo** avanza en vivo desde que empezó el turno.
- **Los tokens** se actualizan cada vez que termina una respuesta del modelo, no letra por letra:
  Claude Code no le pasa al mod la cuenta en vivo. *Propuesta del agente.*
- **El effort** es el de RN-skin-modelo; sin effort, no se muestra.
- **Mientras Claude Code muestra un mensaje propio** en lugar de la palabra, el spinner queda como lo
  dibuja Claude Code.

#### RN-skin-pie-claude · origin: usuario 2026-10-18 (Q-11)
El pie del turno es la línea de Claude Code tal cual, y a continuación lo que suma el mod: `· 6
herramientas · +18 −3`.

#### RN-skin-vineta · origin: usuario 2026-10-18 (Q-11)
Una respuesta que el mod redibuja empieza con la viñeta `●` de Claude Code, igual que una que no
redibuja.

#### RN-skin-tabla-ancha · origin: usuario 2026-10-18 (Q-11)
Una tabla más ancha que la terminal la dibuja igual el mod: las columnas se achican y el texto de
las celdas baja de línea dentro de su celda, sin cortar palabras salvo que una sola no entre. Solo si
ni así entra (cada columna con menos de 6 columnas de ancho), queda el dibujo de Claude Code. *El
mínimo de 6 es propuesta del agente.*

#### RN-skin-filas-legibles · origin: usuario 2026-10-18 (Q-11)
En una fila de herramienta se lee primero el nombre y después lo demás: el nombre va en el color de
su tipo y en negrita, y el comando o la ruta en el tono tenue del tema. Un archivo creado sigue en
*bien* y uno editado en *aviso*.

#### RN-skin-plegar-tocando · origin: usuario 2026-10-18 ("donde dice Edit, o Bash que clickeando ahi se pliegue o despliegue directo")
Una fila de herramienta, y la de lecturas agrupadas, se abre y se cierra tocándola en cualquier
parte de su texto (el nombre, el objetivo), no solo en `▸`. `▸` sigue estando y hace lo mismo. Una
fila que no tiene nada para abrir no reacciona.

#### RN-skin-diff-legible · origin: usuario 2026-10-18 (Q-11, "visualizar lo que cambio de forma legible como leer code")
Una edición se ve como código: en la terminal y en el escritorio, una tarjeta con la ruta, `+N −M`,
las líneas numeradas, `+` y `−` en *bien* y *error* con su fondo, y el resaltado del lenguaje del
archivo (el de RN-skin-partes, código). Un lenguaje que el resaltado no conoce se ve sin resaltar,
con los colores del diff. Con la parte *diffs* apagada, queda el de Claude Code.

#### RN-skin-cae-al-original · origin: alcance del usuario 2026-10-17
Si algo no se puede redibujar fielmente —un lenguaje que el resaltado no conoce, un diagrama que no
entra, un bloque demasiado largo, una lectura de imagen o PDF, un comando en segundo plano—, se ve
como lo dibuja Claude Code. Nunca se pierde contenido por el rediseño.

#### RN-skin-calmo · origin: alcance del usuario 2026-10-17
El modo calmo saca todo movimiento, deja cada herramienta en una línea, pliega la salida de solo
lectura y muestra los fallos siempre enteros. Al apagarlo vuelve lo que la persona tenía.

#### RN-skin-copiar · origin: alcance del usuario 2026-10-17
Cada tarjeta tiene un botón de copiar, y `/nzt-look copy` copia la última respuesta del agente
(`copy code`, su último bloque de código).

#### RN-skin-palabras · origin: alcance del usuario 2026-10-17; por defecto, usuario 2026-10-18 (Q-10)
El spinner y el pie del turno dicen la palabra de Claude Code. Las palabras del tema son una opción
que la persona prende en el panel; por defecto está apagada.

### Para todo el mod

#### RN-skin-no-interrumpe · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si una parte falla, esa parte vuelve al dibujo de Claude Code (o, en la banda, dice que no hay
lectura) y la sesión sigue. Un fallo del mod nunca frena un prompt ni un turno.

#### RN-skin-idioma · origin: RN-ctx-idioma de `nzt-context`
Lo que ve el usuario va en español o en inglés según la opción **idioma**, `es` por defecto. Lo que
recibe el agente va en inglés.

#### RN-skin-comando · origin: propuesta del agente (unidad 216)
El comando es `/nzt-look`, como el nombre del mod (igual que `/nzt-questions`), y no `/skin`: así
convive con la referencia si la persona también lo tiene instalado.

## Qué se redibuja

| Parte | App de escritorio | Terminal |
|---|---|---|
| Filas de herramientas | ícono por tipo, spinner mientras corre, líneas cambiadas, tiempo; `▸` abre la entrada y la respuesta, y también tocar la fila (RN-skin-plegar-tocando); un fallo se abre solo | un nodo en el riel del turno, con el mismo `▸` y la fila tocable |
| Ediciones | tarjeta de diff con `+N −M`, líneas numeradas y resaltado | la misma tarjeta, en celdas (RN-skin-diff-legible) |
| Consola | tarjeta con estado, stderr aparte, salida larga plegada, rutas, números y palabras de error, aviso y éxito en color | tarjeta con el comando, la salida en color, `✓` o `✗ exit N`, stderr en rojo, cada flujo plegado a 8 + 4 líneas |
| Salida de solo lectura (apagada por defecto) | lecturas y búsquedas en una fila; un fallo deja su línea de error | igual |
| Tablas | tarjeta con encabezado y filas alternadas | grilla con banda de encabezado; si es más ancha que la terminal, las celdas bajan de línea (RN-skin-tabla-ancha) |
| Diagramas | bloques Mermaid como tarjeta (los 17 tipos de la referencia) | los mismos, en celdas |
| Fórmulas | tarjeta tipográfica; `$…$` en línea como Unicode | fracciones y límites apilados |
| Salida de comandos | `/cost`, `/context` y salida de plugins: tablas, código y pares `clave: valor` como tarjetas | como grillas |
| Avisos y tareas | `> [!NOTE]` como caja con título; `- [ ]` con tildes y conteo | igual |
| Código | tarjeta con lenguaje, números de línea y resaltado; los bloques de shell conservan el botón Run | enmarcado, con el lenguaje en el marco y resaltado en los colores del tema |
| Spinner | ícono animado por fase | la palabra de Claude Code con una banda de luz, el tiempo, los tokens y el effort (RN-skin-spinner-cifras) |
| Sobre el prompt | la banda de uso | la banda de uso |
| Prompt del usuario | el de Claude Code (copiar, rebobinar y seleccionar siguen) | contorno redondeado, o una marca al inicio |
| Enlaces y archivos | los enlaces de la app; archivos creados en el turno en color *bien* y editados en *aviso* | enlaces clickeables donde la terminal los dibuja; rutas con `:línea`, números y versiones en color |
| Bloques largos | código pasadas 24 líneas, con `▾ N más` | código pasadas 24 líneas, tablas pasadas 14 filas y consola pasadas 8 + 4, con `▾ N más` / `▴ menos` |

Los números (24 líneas, 14 filas, 8 + 4) son los de la referencia y se ajustan al verlo en vivo.

## Diseño · banda y panel (unidad 220)

Mockup `specs/mods/nzt-look/mockup-banda.html`, un estado por hash (`#state=b-high&surf=term`), en
terminal y escritorio. Se revisa cuando cambian las partes de la banda, sus cortes o lo que el panel
deja elegir. Referencia: la referencia, leída en su código (`rows.tsx`, `svg-usage.ts`,
`settings.tsx`). Q-05: la banda va "tal cual".

> **Desde 0.7.0 (D80) las marcas son 30 y 40** [modify]: donde este diseño dice 20/30/40, *desde el
> 20%* o naranja, vale RN-skin-marcas-kernel —neutro bajo el 30, amarillo desde el 30, rojo desde
> el 40— y el botón limpiar es principal desde el 30. El mockup sigue con las tres marcas.

### Banda

**Tarea.** Quien trabaja ve de un vistazo cuánto contexto y cuánto plan lleva gastado, y limpia la
sesión si quiere. **Acción principal: `/clear`**, y solo desde la marca 20. Antes de eso la banda
solo informa y el botón va tenue.

**Una línea (cambio 0.4.0, RN-skin-banda-rotulos):** cada rótulo a la izquierda de su
medidor, sin la palabra del tramo, naranja desde el 30; mockup `mockup-banda.html`, 96 combinaciones
medidas el 2026-10-18 sin scroll ni banda cortada (a 120 columnas: modelo, contexto, 5h, semanal y
botón; en escritorio a 1000 px entra todo). Lo que sigue, de 0.3.0, queda como historia.

**Dos filas (cambio 0.3.0, reemplazado por 0.4.0).** Cada parte es una columna con su
rótulo arriba, tenue, y su medidor abajo; la columna mide lo que el más ancho de los dos. Orden:
**modelo**, contexto, 5h, semanal, costo y el botón contra el borde derecho, en la fila de abajo.
Arriba van la palabra del tramo (junto a `Contexto`) y la cuenta regresiva (junto a cada límite); lo
que sigue describe cada parte y vale con ese reparto. Ejemplo a 120 columnas:

```
Modelo            Contexto · limpiá pronto   Límite 5h · 2h15   Límite semanal · 4d3h   Costo
◇ Opus 5.5 · high ▰▰▰▰▰▱▱▱▱▱▱▱▱ 34% 68k/200k  ▰▰▰▱▱▱▱▱ 41%       ▰▱▱▱▱▱▱▱ 12%            $1.84   0: /clear
```

**Antes (0.1.0 y 0.2.0): una fila, de izquierda a derecha.** Partes separadas por 2 columnas, con el
botón contra el borde derecho:
1. **Contexto** (RN-skin-marcas-kernel):
   - en la terminal, 10 celdas `▰▱` de 10%, con las marcas entre ellas. **Cada marca es una celda más,
     del mismo tamaño que las otras, siempre en el color de su tramo**: `▰` si se alcanzó y `▱` si
     no (usuario 2026-10-17: *"que las marcas de 20, 30 y 40% no sean tan largas ... del mismo tamaño
     que las demás pero con su color respectivo"*). El riel sin llenar va tenue;
   - en el escritorio, un anillo con tres rayas en 20, 30 y 40;
   - **la terminal no dibuja anillos.** El usuario lo preguntó el 2026-10-17. Claude Code dibuja el
     elemento `Svg` como nada en la terminal (comentario de `register.tsx` de la referencia,
     leído ese día; no está en la documentación de Claude Code). Por eso la referencia usa bloques ahí.
     El único "anillo" posible en texto es un glifo de cinco pasos (`○◔◑◕●`), donde no entran las
     marcas;
   - después, el porcentaje (en negrita desde el 20%; desde el 40%, pastilla que late), `contexto ·
     68k/200k` tenue y, desde el 20%, la **palabra del tramo**: `mejor limpiar`, `limpiá pronto`,
     `limpiá ya`. Así el estado no se dice solo con color.
2. **5h** y **7d** (RN-skin-limites): 8 bloques como la referencia, porcentaje y cuenta regresiva
   (`41% 5h · 2h15`). En aviso desde el 80% y en error desde el 95%: los cortes de la referencia para
   los límites; los del kernel son solo para el contexto.
3. **Costo** (RN-skin-costo), `$1.84`, tenue.
4. **Modelo** (RN-skin-modelo): `◇ Opus 5.5 · high`. El nombre corto del modelo, no su id
   (`claude-opus-5-5` se lee `Opus 5.5`; un nombre que no sigue esa forma va tal cual), en el texto
   del tema; `· high` tenue, con la palabra del effort como la nombra Claude Code (`low`, `medium`,
   `high`, `xhigh`, `max`). Sin effort, solo `◇ Opus 5.5`. El `◇` en el acento. Igual en los dos
   idiomas: son nombres. *Lugar, glifo y colores: propuesta del agente.*
5. **`0: /clear`** (RN-skin-limpiar): tenue bajo el 20% y botón principal desde el 20%. La tecla `0`
   con el prompt vacío lo aprieta, como el botón de la referencia. La primera vez pasa a `0 otra vez:
   limpiar`, en error, con `Esc cancela` (RN-skin-limpiar-confirma). Mientras Claude trabaja, no
   está. El texto es el comando, igual en los dos idiomas.

**Colores**, del tema activo: bajo el 20%, el acento del tema; después aviso, error y error en
negrita. Así cambia el color en los 16 temas sin una paleta aparte.

**Angosta** (RN-skin-banda-ancho): se sacan, en orden, los tokens, el costo, el effort, el modelo,
el semanal, el de 5 h y el botón. Si ni así entra, se va la palabra del tramo (desde 0.3.0
el rótulo `Contexto` no ocupa ancho propio: está sobre las celdas). Sin lectura, a lo más
angosto, `sin lectura todavía` pasa a `sin lectura`. Siempre
quedan las celdas, las marcas y el porcentaje, que dicen el tramo sin color. *Sacar los tokens antes
que las partes es propuesta del agente, como RN-ctx-ancho de `nzt-context`.*

**Estados** (todos en el mockup): bajo el 20%; desde el 20, el 30 y el 40; Claude trabajando
(destello en el relleno, sin botón); confirmar limpiar; cruza una marca (titila tres veces); límites casi llenos; sin
lectura todavía (riel gris, marcas apagadas, `sin lectura todavía`, sin botón, con el modelo;
también cuando una parte falla, RN-skin-no-interrumpe); cuenta sin límites (solo contexto,
costo, modelo y botón); modelo sin effort (`◇ Opus 5.5`); partes
apagadas; todas apagadas (no se dibuja); angosta; encuesta sobre el prompt (no se dibuja); modo calmo
(lo mismo, quieto).
- *Cargando* es *sin lectura todavía*. Después de limpiar, la sesión no tiene cifras: *sin lectura
  todavía* (RN-skin-sin-lectura).
- *Vacío* y *sin permiso* no aplican: la banda siempre tiene el contexto, y no lee nada protegido.

### Panel de opciones (`/nzt-look`)

**Tarea.** Elegir cómo se ve la sesión y verlo antes de dejarlo. **No hay acción principal:** cada
elección se aplica al tocarla y la vista previa la muestra en el momento, como en la referencia.

**Dónde:** al costado, como los otros paneles de NZT, en una tarjeta con borde en el acento, alto fijo,
scroll propio y `[ Cerrar ]` en la última fila. Esc cierra. *Propuesta del agente; la referencia no lo
fija en el README.*

**Regiones**, en orden de lectura:
1. Título `◐ Aspecto` (`◐ Look` en inglés) y versión.
2. **Aviso**, solo si el dibujo está apagado (RN-skin-apagado: la banda y la línea al agente
   siguen). Sin aviso de `nzt-context`: se retiró sin él (M4, usuario 2026-10-17).
3. **Tema**: `default` primero, después los 16 temas y los propios, con teclas 1 a 9 y `●` en el
   elegido (RN-skin-tema-por-defecto, RN-skin-tema-default, RN-skin-repintar). Debajo, **variante** `auto · oscura · clara`
   (RN-skin-variante) y **esta carpeta**, con `fijar acá`, o `soltar` y `hacerlo el de siempre` si ya
   está fija (RN-skin-por-carpeta).
4. **Vista previa**: un turno dibujado con el tema elegido (prompt, comando, edición, lecturas
   agrupadas, tabla, pie) y la banda debajo. *La referencia no muestra la banda en la vista previa;
   sumarla es propuesta.*
5. **Banda**: contexto, 5h, semanal, costo, modelo y **línea al agente**
   (RN-skin-banda-partes, RN-skin-al-agente).
6. **Conversación**: una parte por regla de RN-skin-partes, más solo lectura plegada (apagada por
   defecto), desplegar lecturas (apagada), copiar, calmo (RN-skin-calmo) y **palabras**, un selector `claude · mod` como el de la variante, en `claude` por defecto
   (RN-skin-palabras).
7. **Colores**: los 11 colores del tema con su muestra. Al elegir uno aparecen su valor, un campo
   `#rrggbb` y `pintar`. Si el color no es válido, lo dice en error y no cambia nada; si es válido,
   lo guarda como `mi-<tema>` y lo dice en *bien* (RN-skin-repintar).
8. **Tema de Claude Code**: NZT oscuro y claro se eligen en `/theme` (RN-skin-tema-claude).
9. Pie: `O pedile a Claude: "un tema que se sienta como un atardecer". Esc cierra.` (RN-skin-disenar).

**Estados**: panel; repintar; color inválido; guardado como propio; fijado a
esta carpeta; dibujo apagado; angosto (42 columnas: las filas de opciones bajan de línea); celular
(una línea que dice dónde se usa).
- *Vacío* no aplica: siempre hay 16 temas. *Sin permiso* no aplica.
- **Variante clara de dracula, gruvbox, mono, night-owl y nord:** La referencia no la trae y la calcula
  al vuelo (`skin.ts`). El mockup lo marca como pendiente; cómo se calcula lo decide la 223.

**Teclado**: Tab recorre temas, variante, carpeta, partes de la banda, partes de la conversación,
colores, campo y `pintar`, y por último Cerrar. Enter aprieta y Esc cierra. *Contado sobre los
elementos del mockup, no recorrido con teclado.*

### Medido (Chrome sin ventana, 2026-10-17)
- 117 combinaciones: los 15 estados de la banda en terminal y escritorio, y los 9 del panel (hoy 8:
  el de `nzt-context` instalado se quitó después, en la 225), a 320,
  1000 y 1200 px. Ninguna con scroll horizontal ni con la banda cortada. Vuelto a medir con `/clear`
  y las marcas del mismo tamaño. Mientras pide confirmación, a 120 columnas la banda saca el costo y
  el semanal: son 5 segundos.
- El panel mide lo mismo en sus 8 estados de tarjeta, a todos los anchos (802 px).
- A 120 columnas entra la banda entera bajo el 20%; desde el 20% se van solo los tokens.
- **Con el modelo (cambio 0.2.0, medido 2026-10-18)**: 96 combinaciones (16 estados de la
  banda × terminal y escritorio × 320, 1000 y 1200 px), ninguna con scroll ni banda cortada. A 120
  columnas bajo el 20% entra todo menos los tokens, con `◇ Opus 5.5 · high`; **desde el 20% se van
  los tokens, el costo y el effort** y queda `◇ Opus 5.5`; confirmando limpiar se va también el
  modelo y el semanal. En escritorio entra todo a 1000 px. A 320 px quedan celdas, marcas y
  porcentaje, como antes.
- **Con dos filas (cambio 0.3.0, medido 2026-10-18)**: las mismas 96 combinaciones, ninguna
  con scroll ni banda cortada. La banda ocupa 2 filas en la terminal y 52 px en el escritorio. **A 120
  columnas entra todo en todos los tramos**, tokens y effort incluidos: la palabra del tramo y la
  cuenta regresiva ya no suman ancho a la fila de los medidores. Confirmando limpiar se van tokens,
  costo y effort. A 320 px quedan celdas, marcas y porcentaje, y sin lectura `sin lectura`.
- **Contraste** del tema `nzt` oscuro, todos AA:

| Par | Contraste |
|---|---|
| Texto sobre fondo | 18,22 |
| Tenue (provisional) sobre fondo / sobre superficie | 7,68 / 7,17 |
| Acento (contexto bajo el 20%) | 14,25 |
| Aviso (Contraste de la marca) | 16,44 |
| Error (propuesta de Q-01 de la marca) | 8,86 |
| `/clear` principal: Secundario sobre Acento | 8,09 |
| Pastilla del 40%: Fondo sobre error | 8,86 |
| Texto sobre superficie / sobre cebra (vista previa) | 17,01 / 15,61 |

La 222 dejó tenue, superficie y cebra de `nzt` con los mismos valores, y el error de Q-01 de la
marca quedó así. El contraste de los otros 15 temas está en *Diseño · tema nzt*.

## Diseño · conversación (unidad 221)

Mockup `specs/mods/nzt-look/mockup-conversacion.html`, un estado por hash
(`#state=failed&surf=desk`), en terminal y escritorio, con un turno de ejemplo: el mismo de la vista
previa del panel. Se revisa cuando cambia la tabla *Qué se redibuja* o una regla de la conversación.
Referencia: la referencia, leída en su código (`rows.tsx`, `shell-rows.tsx`, `code-rows.tsx`,
`skin.ts`). Q-05 vale también acá: tal cual la referencia.

**Tarea.** Quien trabaja lee el turno de un vistazo: qué hizo Claude, qué cambió, qué falló. **No hay
acción principal**; lo que se aprieta es secundario: `▸` abre una fila, `▾ N más` despliega y
**Copiar** copia (RN-skin-copiar).

**Lo que se dibuja, en el orden del turno:**
1. **Prompt del usuario**:
   - en la terminal, contorno redondeado del ancho de lo escrito;
   - en el escritorio, el de la app, con copiar y rebobinar.
2. **Filas de herramientas**:
   - en la terminal, un nodo por herramienta en un riel `┃` del acento. El glifo del nodo dice el
     estado por la forma: `○` corriendo, `●` bien, `✕` falló, `◌` cortado. Después van el nombre
     de la herramienta como lo da Claude Code (RN-skin-textos-claude),
     el objetivo en el tono tenue (RN-skin-filas-legibles) y, a la derecha, `+N −M` y el
     tiempo. Un archivo editado en el turno va en *aviso*
     y uno creado, en *bien*. Las lecturas y búsquedas seguidas se juntan en una fila
     `Read 2 · Grep 1 ▸`;
   - en el escritorio, un ícono por tipo en lugar del nodo, y `▸` abre la entrada y la respuesta.
3. **Diff** (RN-skin-diff-legible): en la terminal y en el escritorio, tarjeta con la ruta,
   `+N −M` y las líneas numeradas, con fondo de agregado y de borrado y el resaltado del lenguaje.
4. **Consola**: tarjeta con `$ comando`, `✓` o `✗ exit N`, la salida coloreada (palabras de bien,
   error y aviso, y números) y stderr aparte, en error. Si no hay salida, lo dice.
5. **Tablas**:
   - en la terminal, una grilla con banda de encabezado y filas alternadas en *cebra*; más ancha que
     la terminal, las celdas bajan de línea (RN-skin-tabla-ancha);
   - en el escritorio, una tarjeta.
6. **Código**: marco con el lenguaje en el borde y resaltado en los colores del tema; en el escritorio,
   con números de línea.
7. **Spinner** (RN-skin-palabras, RN-skin-spinner-cifras): el cuadro braille y la palabra de Claude
   Code con una banda de luz que la recorre, y después el tiempo, los tokens y el effort como los
   muestra Claude Code.
8. **Pie** (RN-skin-pie-claude): la línea de Claude Code tal cual y lo que suma el mod: `<línea de
   Claude Code> · 6 herramientas · +18 −3`.
9. **Respuesta**: empieza con la viñeta `●` (RN-skin-vineta).

**Estados** (todos en el mockup): turno terminado; Claude trabajando; un comando falló (nodo `✕`,
tarjeta entera, sin plegar); turno cortado (`◌` y `Interrupted`); salida y código largos, plegados (consola 8 + 4,
código 24, tablas 14); plegado abierto; comando sin salida; cae al dibujo de Claude Code (un lenguaje
que el resaltado no conoce, o una parte que falla: RN-skin-cae-al-original); una parte apagada
(tablas); solo lectura plegada; modo calmo; dibujo apagado (`/nzt-look off`: la banda sigue);
angosta.
- *Vacío*, *sin permiso* y *cargando* no aplican: sin turno no hay nada que redibujar, el pedido de
  permiso queda en Claude Code (alcance), y cargando es *Claude trabajando*.

**Angosta** (60 columnas): el objetivo de cada fila se corta con `…` antes que los datos de la
derecha, y las tarjetas toman el ancho que hay. Una tabla que no entra baja el texto de sus celdas
de línea (RN-skin-tabla-ancha).

**Fuera de este mockup:** diagramas, fórmulas, avisos y tareas, salida de comandos y enlaces. Se
dibujan como en la referencia, sin nada propio de NZT, y la tabla *Qué se redibuja* los describe.
Si se quiere verlos antes de construir, es otra unidad.

**Medido** (Chrome sin ventana, 2026-10-17): 52 combinaciones (13 estados, terminal y escritorio,
a 320 y 1000 px). Ninguna tiene scroll horizontal, y ninguna fila, tarjeta ni grilla se sale del
marco. Los pares de color son los mismos de la banda, ya medidos arriba.
- **Con los textos de Claude Code (unidad 245, 2026-10-18)**: las mismas 52 combinaciones, sin
  scroll ni filas fuera del marco y sin ningún texto viejo (`Correr`, `Leer`, `Pensando`, `Listo
  en`). La palabra de Claude Code va marcada pendiente; a 320 px el pie baja de línea.
- **Con los ajustes de Q-11 (unidad 248, 2026-10-18)**: 56 combinaciones (14 estados, con *tabla
  más ancha que la terminal*), sin scroll ni filas fuera del marco. La edición es tarjeta de diff
  resaltada también en la terminal, la respuesta empieza con `●`, y el spinner (con sus cifras) y el
  pie bajan de línea a 320 px. Las cifras y la línea del pie de Claude Code van marcadas pendientes.
- **Con los tonos de lectura y los colores del código (unidad 254, 2026-10-18)**: los dos
  mockups toman los valores de *Tonos de lectura* de `nzt-brand.md`, y el código tiene función, tipo y
  propiedad en su color y el bloque con su fondo. 56 combinaciones medidas en Chrome sin ventana (320
  y 1280 px), sin scroll. El estado *tabla más ancha que la terminal* no estaba en la lista de estados
  del mockup y mostraba *turno terminado*: ya abre. El contraste de cada par está en la marca. El
  mockup de la banda solo cambió de colores, no se volvió a medir el ancho.

## Diseño · tema nzt (unidad 222)

Los valores están en `specs/nzt-brand.md` (*Derivados*), que manda. Acá va **qué rol de la marca
toma cada color**. En la oscura, Texto, Acento, Contraste, Error y Tenue toman su
*tono de lectura* (`nzt-brand.md`, Q-03, unidad 253): la paleta tal cual se veía demasiado
brillante en una conversación larga. Se revisa cuando la marca suma o cambia un rol, o cuando Claude Code cambia su
lista de tokens. Fuente de los tokens: *Create a custom theme* en
<https://code.claude.com/docs/en/terminal-config>, leída el 2026-10-18 (Claude Code 2.1.302).

### Los temas de Claude Code: NZT oscuro y NZT claro

Son dos archivos de tema: `nzt-dark` sobre el preset `dark` y `nzt-light` sobre `light` (los slugs,
QT-03). Cómo
llegan a `/theme` lo decide la 223 (notas técnicas). Cada uno pisa solo los tokens que tienen un rol
en la marca. **El resto cae al preset**, y eso es a propósito (la documentación: *"Tokens not listed
here fall through to the base preset"*).

| Token | Rol de la marca |
|---|---|
| `claude`, `suggestion`, `permission`, `remember`, `success`, `rate_limit_fill` | Acento |
| `promptBorder`, `autoAccept` | El Acento **de la paleta** (`#72f4cd`), no el tono de lectura: es un trazo de una línea, no texto, y es el color del recuadro de la captura del 2026-10-17 que el usuario pidió volver a ver (2026-10-18). `autoAccept` porque en modo auto el borde del prompt toma ese token y no `promptBorder` *(sin verificar en la terminal, solo por el nombre del token: se mira en vivo en la 261)*; la leyenda `auto mode on` sigue avisando el modo. *La decisión de pintar `autoAccept` es del agente, objetable* |
| `claudeShimmer`, `promptBorderShimmer`, `permissionShimmer` | Contraste en la oscura; `#2a8f74` en la clara (un Acento más claro, 3,76:1: es el brillo que pasa, no el texto) |
| `text` | Texto |
| `inverseText` | Texto sobre acción en la clara; Fondo en la oscura (14,25:1 sobre Acento) |
| `inactive` | Tenue |
| `subtle` | Sutil |
| `warning` | Contraste (aviso) |
| `warningShimmer` | `#fff7b0` en la oscura; `#8a7a10` en la clara |
| `error` | Error |
| `diffAdded`, `diffRemoved`, `diffAddedWord`, `diffRemovedWord` | Agregado, Borrado y sus palabras. Con los valores de la 222 casi no se distinguían del fondo (usuario 2026-10-18, Q-11): cada fondo de diff tiene que separarse del Fondo al menos 1,5:1 y dejar el Texto encima en 4,5:1 o más; medidos en la 251 (`nzt-brand.md`, *Derivados*). *Los dos umbrales son propuesta del agente.* |
| `userMessageBackground` | Mensaje |
| `userMessageBackgroundHover` | `#163a35` en la oscura; `#d6ebe3` en la clara (Texto encima: 11,75 y 15,46) |
| `selectionBg` | Secundario en la oscura (Texto encima: 10,35); `#c4ebdd` en la clara (14,93) |
| `composerSidebarBackground` | Fondo |
| `rate_limit_empty` | Secundario en la oscura; `#c9ddd6` en la clara (el relleno, Acento, sobre él: 4,56) |

**Caen al preset, a propósito:**
- `planMode`, `bashBorder`, `fastMode`, `effortUltra` e `ide`. Avisan que se cambió
  de modo, y para eso tienen que verse distintos del borde de siempre, que es Acento. Pintados con
  la marca, el borde del modo plan se confundiría con el del prompt. (`autoAccept` salió de esta
  lista: ver la fila de `promptBorder`.)

**Pestañas del panel (2026-10-18, unidad 266).** Las dibuja el motor, no el mod: *documentado* en
los tipos de la API de la versión 2.1.302 (`Pane`: «its tab's label while more than one pane is
open … Read-only here»; `UiPane.isShown`: «the rest are tabs behind it»). El mod solo pone el
`title`. **No hay regla de estilo para las pestañas**: se ven con el tema de Claude Code, y lo que se
acordó (pastilla llena para lo activo) ya lo hace el recorrido de fases de `nzt-state`, que sí es del
mod. Si el usuario quiere otra cosa en las pestañas, es un pedido a Claude Code. *Sin verificar:* qué
tokens del tema usa el motor para esa fila.
- `merged`, `briefLabelYou`, `briefLabelClaude`, `bashMessageBackgroundColor` y
  `memoryBackgroundColor`. La marca no tiene un rol para ellos.
- `inactiveShimmer`, `diffAddedDimmed` y `diffRemovedDimmed`. Son variantes del preset que acompañan
  bien a sus bases.
- Los ocho colores de subagentes y el arcoíris de `ultrathink`. Sirven para distinguir, y la marca
  tiene cinco colores.

Si en vivo (unidad 224) alguno de esos choca con la marca, se suma a la tabla.

**Claude Code no pinta el fondo de la terminal** (misma página: *"Claude Code does not control the
terminal's own color scheme"*). Los contrastes se midieron contra Fondo, el de la marca. Con NZT
oscuro sobre una terminal de fondo claro, el texto Texto no se lee. Esto no lo resuelve el tema: lo
resuelve elegir la variante que corresponde, y el panel lo dice junto a `/theme`.

### La paleta del mod para `nzt`

Las 15 claves de una paleta de la referencia (`noir.ts`, leído el 2026-10-18), por rol:

| Claves | Rol |
|---|---|
| `fg` | Texto |
| `muted` | Tenue |
| `surface`, `zebra` | Superficie, Cebra |
| `user`, `ok`, `read`, `search`, `web`, `mcp` | Acento |
| `other` | Tenue |
| `write` | Contraste: lo que se escribió es lo que hay que mirar, y por eso va en Resalte |
| `run` | Texto |
| `warn` | Contraste |
| `err` | Error |

En las dos variantes, cada clave toma el valor de su rol en la columna que le corresponde.
**Medido:** con ellos, todo texto del mod pasa 4,5:1 sobre Superficie y Cebra (el peor caso,
Tenue sobre Cebra, da 5,35:1 en la oscura con el tono de lectura y 5,41:1 en la clara).

**El código del tema `nzt`** (unidad 253, Q-03 de la marca): cada parte lleva su color de
*Colores del código* (`nzt-brand.md`) y el bloque, su fondo propio, en la terminal y en el
escritorio. El resaltado de los otros 15 temas sale de sus claves (palabra clave en `user`, cadena en
`ok`, número en `warn`, comentario en `muted`, tipo en `read`, función en `web`, propiedad en
`search`), que en esos temas ya son colores distintos. En `nzt` casi todas esas claves son Acento, y
por eso el código se veía de un solo color. Un tema repintado desde `nzt` (`mi-nzt`) resalta con sus
claves, como los demás.

**Las palabras del tema `nzt`**, solo con la opción prendida (RN-skin-palabras):
- el spinner dice `Pensando`, `Trabajando`, `Armando`, `Midiendo` o `Ajustando`, y en inglés
  `Thinking`, `Working`, `Building`, `Measuring` o `Tuning`;
- el pie dice `Listo` o `Hecho`, y en inglés `Done` o `Finished`.

Ninguna nombra una fase de NZT. Un spinner que dijera `Verificando` mientras el agente lee un archivo
haría creer que el agente está en una fase en la que no está.

### Contraste de los otros 15 temas (medido 2026-10-18)

Los valores son los del mockup de la banda, que copió la referencia. Se midió todo color de
texto de la paleta (`user`, `fg`, `muted`, `ok`, `err`, `warn`, `read`, `write`, `run`) contra
`surface` y `zebra`, en cada variante que trae su paleta.

| Resultado | Temas |
|---|---|
| Pasan 4,5:1 en las dos variantes | `noir`, `github` |
| No pasan en la oscura | los otros 13. El peor es `muted`: `one-dark` 2,16, `solarized` 2,42, `nord` 2,82 |
| No pasan en la clara | todos los que la traen salvo `noir` y `github`. Varios caen bajo 2:1: `ayu` (`user` 1,73), `rose-pine` (`warn` 1,87), `everforest` (`warn` 1,91) |
| Sin variante clara en la referencia | `dracula`, `gruvbox`, `mono`, `night-owl` y `nord`: se miden cuando la 223 defina cómo se calculan |

**Esto choca con el NFR de contraste**, que pide 4,5:1 en los 16 temas y sus dos variantes. Tomar las
paletas tal cual deja tenue ilegible en casi todos los temas oscuros y avisos ilegibles en los claros.
La salida es Q-09.

### Temas que no cansan la vista (cambio 0.3.0, unidades 259 y 260)

Pedido del usuario 2026-10-18: *"Evaluar que los colores no sean dañinos a la vista, no muy
brillosos que no cansen la vista"*, *"va por algunos para evaluarlo"*.

**Criterios**, de la guía de tema oscuro de Material (codelab *Design a dark theme with Material and
Figma*, codelabs.developers.google.com, leído 2026-10-18): *"More saturated colors tend to visually
'vibrate' against darker backgrounds, making them harder to read"*; el texto de alto énfasis va al
87% de blanco sobre `#121212`. Llevado a números (los cortes son **propuesta del agente**):
- **Texto brillante:** un color de texto con más contraste sobre su superficie que `#e0e0e0` sobre
  `#121212` (87% de blanco), **14,19:1**.
- **Color que vibra:** croma (máximo menos mínimo de sus canales) **≥ 0,6**. Un tono "200" de
  Material, el que la guía usa en oscuro, anda por 0,27; un "500", por 0,54.

**Medido sobre las paletas oscuras tal como están escritas** (antes del ajuste a 4,5:1): 10 de 16
temas tenían algo. **Decisión del agente bajo la autonomía que dio el usuario, objetable:** se
ajustan todos los marcados, con el cambio mínimo: el mismo tono y la misma luz con menos saturación
hasta croma 0,58, y el texto oscurecido hasta quedar bajo 14,19:1. Los temas siguen reconocibles. Un
test sostiene los dos cortes en las 16 paletas oscuras. Las claras no se midieron: la guía es solo
para oscuro.

| Tema | Qué cambió (antes → ahora) |
|---|---|
| noir | todo el texto `#ededed` y el acento `#f5f5f5` → `#e2e2e2` (15,60 → 14,10:1) |
| github | texto `#e6edf3` → `#e1e9f1`; escribir `#ffa657` → `#f4a762`; correr y aviso `#d29922` → `#c39431`; web y acento `#58a6ff` → `#62a7f5`; error `#f85149` → `#ea5e57` |
| gruvbox | escribir y aviso `#fe8019` → `#d48443`; mcp y acento `#fabd2f` → `#deb24b`; error `#fb4934` → `#e15d4e` |
| solarized | escribir `#cb4b16` → `#ba5227`; correr y aviso `#b58900` → `#a48011`; web y acento `#268bd2` → `#3489c4`; bien `#859900` → `#839603`; error `#dc322f` → `#cf3f3c` |
| ayu | escribir `#ff8f40` → `#e99356`; correr y aviso `#ffb454` → `#f3b360`; web `#59c2ff` → `#63bff5`; mcp `#39bae6` → `#46b3d9` |
| dracula | mcp y bien `#50fa7b` → `#5cee81`; error `#ff5555` → `#f36161` |
| tokyo-night | escribir `#ff9e64` → `#fb9f68` |
| kanagawa | escribir `#ffa066` → `#fca169` |
| night-owl | error `#ef5350` → `#e95956` |
| mono | error `#ffffff` → `#f7f7f7` |

Sin cambios: nzt (la 253 ya lo había apagado), catppuccin, rose-pine, nord, everforest y one-dark.
Algunos colores de solarized, y el error de dracula, gruvbox y night-owl, quedan bajo 4,5:1 escritos
así (solarized ya estaba bajo antes): el ajuste a 4,5:1 del mod los sube al usarlos (Q-09), y el
test de contraste 16×2 sigue pasando.

## Diseño técnico (0.1.0, unidad 223)

Cómo se resuelve sobre Claude Code 2.1.302. Las decisiones y sus fuentes están en *Preguntas
técnicas*; acá va solo el resultado. **El código se escribe nuevo** (QT-01). La referencia es
la guía de qué hace y cómo se ve, no de dónde sale el código. No hay código de terceros: los
diagramas también se escriben acá (QT-18).

### Piezas

`mods/nzt-look/` con la estructura de todo mod (`specs/nzt-mods.md` sección 3), más `themes/`:

| Pieza | Qué hace | Usa `$` |
|---|---|---|
| `hooks/register.tsx` | todos los hooks, el panel, la banda, `$.store`, `$.session`, `$.command`, `$.ui` | sí: es el único |
| `palette.ts` | el tipo de una paleta (15 claves), `nzt` y los 15 temas | no |
| `contrast.ts` | el contraste WCAG y el ajuste hasta 4,5:1 (QT-05) | no |
| `light.ts` | la variante clara calculada (QT-06) y leer claro u oscuro del tema de Claude Code (QT-03) | no |
| `prefs.ts` | leer y validar lo guardado, con valores por defecto si falta algo o está roto | no |
| `i18n.ts` | los textos en `es` y `en` (QT-14) | no |
| `kernel.ts` | los tramos 30/40 (D80 [modify]), la palabra de cada tramo y la línea al agente (QT-10) | no |
| `band.tsx`, `panel.tsx` | la banda y el panel, como árboles de elementos | no |
| `tools.tsx`, `shell.tsx`, `diff.tsx` | las filas de herramientas, la consola y el diff | no |
| `reply.tsx`, `markdown.ts`, `highlight.ts`, `math.ts`, `mermaid.ts` | la respuesta del agente: tablas, avisos, tareas, enlaces, código, fórmulas y diagramas | no |
| `spinner.tsx` | el spinner, el pie y el contorno del prompt | no |
| `design.ts` | validar un tema que arma el agente | no |
| `themes/nzt-dark.json`, `themes/nzt-light.json` | NZT oscuro y claro para `/theme` (QT-02, QT-03) | — |

Las piezas sin `$` reciben datos y devuelven datos o árboles. **El árbol se arma con los elementos
que `register.tsx` obtiene de `$.ui.resolve(e)` y les pasa.** Por eso se pueden probar solas.

### Hooks

| Hook | Para qué | Reglas |
|---|---|---|
| `session.start` | leer `prefs`, `folders` y `custom`; resolver tema y variante; registrar `/nzt-look` y la herramienta de diseño | RN-skin-tema-por-defecto, -por-carpeta, -comando |
| `classic.SessionStart` (`clear`, `resume`, `fork`) y, de respaldo, `session.append` | si el id de la sesión cambió, leer todo de nuevo (flujo 1); el respaldo cubre los planes Team o Enterprise, donde una protección de Claude Code puede no pasarle `classic.SessionStart` a un mod de usuario | RN-skin-tras-clear |
| `config.set` (`theme`) | recalcular la variante cuando cambia el tema de Claude Code | RN-skin-variante |
| `command.run` (`nzt-look`) | abrir el panel, o `off`, `on`, `<tema>`, `copy`, `copy code` | RN-skin-apagado, -copiar |
| `ui.render` `Pane` | el panel de opciones | sección *Panel de opciones* |
| `ui.render` `AbovePrompt` | la banda; debajo, `next(e)` | RN-skin-banda-*, -cede-la-banda |
| `session.measure`, `turn.start`, `turn.complete` | refrescar las cifras y los tiempos del turno | RN-skin-banda-refresco |
| `turn.step`, `classic.PostModelSwitch` | el modelo y el effort de la sesión | RN-skin-modelo |
| `prompt.submit`, `tool.call` | la línea al agente y el aviso de cruce | RN-skin-al-agente |
| `prompt.compose` | la nota de diagramas, si están prendidos | RN-skin-pista-diagramas |
| `ui.render` `ToolUse`, `ToolGroup`, `ToolResult` | filas, lecturas agrupadas, consola y diff | RN-skin-partes |
| `ui.render` `AssistantMessage`, `CommandOutput` | la respuesta y la salida de comandos | RN-skin-partes |
| `ui.render` `Spinner`, `TurnDuration`, `UserMessage` | spinner, pie y contorno del prompt | RN-skin-palabras, -partes |
| `tool.call` de la herramienta de diseño | validar y aplicar el tema que arma el agente | RN-skin-disenar |
| `ui.fault` | registrar el fallo de una parte | RN-skin-no-interrumpe |

**Todo hook de dibujo empieza igual:** si el dibujo está apagado, la parte está apagada o no se
puede dibujar fielmente, devuelve `next(e)` y queda el dibujo de Claude Code (RN-skin-apagado,
-partes, -cae-al-original).

### Flujos

1. **Arranque.**
   1. `session.start` lee `prefs`, `folders` y `custom` de `$.store`. Lo que no se puede leer toma
      el valor por defecto, y eso queda en el registro de depuración (RN-skin-no-interrumpe).
   2. El tema es el de la carpeta si hay uno fijado ahí; si no, el de siempre; la primera vez,
      `default` (0.6.0; antes `nzt`).
   3. La variante es la forzada si la hay. Si no, sale del nombre del tema de Claude Code, y con
      `auto`, de la terminal o del sistema (QT-03).
   4. La paleta es la del tema en esa variante (la propia, o la calculada si no la trae, QT-06),
      ajustada a 4,5:1 (QT-05). **Se calcula acá y no se guarda.**
   5. Tras `/clear`, `/resume` o `/branch` no hay `session.start` y el estado de la sesión vuelve a
      sus valores iniciales: el primer `classic.SessionStart` o la primera fila de la sesión nueva
      repite 1.1 a 1.4 (RN-skin-tras-clear).
2. **Dibujar una parte.** El hook toma la paleta resuelta y los datos del evento, y llama a la pieza
   que arma el árbol. Si la pieza dice que no puede, o lanza, el hook devuelve `next(e)`
   (RN-skin-cae-al-original).
3. **La banda.**
   1. `session.measure` y `turn.complete` leen `$.session.usage()` y lo dejan en un átomo de la
      sesión. Ese cambio redibuja la banda en el mismo paso (RN-skin-banda-refresco).
   2. `AbovePrompt` arma la banda con las partes prendidas y el ancho que da el evento. Con
      `hasSurvey`, o con todas las partes apagadas, devuelve solo `next(e)`.
   3. Sin porcentaje todavía, dibuja *sin lectura todavía* (RN-skin-sin-lectura).
   4. **Modelo y effort** (RN-skin-modelo) van en otro átomo de la sesión: `session.start` y
      `classic.PostModelSwitch` leen `$.session.model()`; `turn.step` del loop principal (sin
      `agentId`) deja su `model` y su `effort`, y sigue con `next(e)` sin tocarlo. Ningún hook espera
      al otro: lo último que llega gana.
4. **La línea al agente.** Como `nzt-context` 0.2.0 (QT-10): en `prompt.submit`, la línea con el
   contexto, los tokens y el tramo. En `tool.call`, si el tramo de ahora es mayor que el último que
   recibió el agente, un aviso una vez. El último tramo avisado queda en `$.state`.
5. **[remove] Limpiar** (usuario 2026-10-25, RN-skin-limpiar).
   1. La primera pulsación (o `0` con el prompt vacío) pone `confirmando` en `$.state`, con la
      hora. La banda muestra `0 otra vez: limpiar`.
   2. Una segunda pulsación dentro de 5 segundos corre `$.command.run({ command: 'clear' })` desde
      `$.clock.after` (QT-09). Pasados 5 segundos, o con una tecla que no es `0`, se borra
      `confirmando`.
   3. Después de `/clear`, `classic.SessionStart` con `clear` vuelve a leer todo, y la banda dice
      *sin lectura todavía*.
6. **Elegir o repintar.** El panel escribe `prefs` (o `custom` con `mi-<tema>`, o `folders`) en
   `$.store` desde `onPress` y vuelve a resolver la paleta (flujo 1.4). Nunca se escribe mientras
   se dibuja.
7. **Diseñar un tema.** La herramienta del mod recibe los colores que arma el agente. `design.ts`
   valida que estén las 15 claves con valores `#rrggbb`. Si está bien, lo guarda en `custom` y lo
   aplica; si no, sigue el anterior y la herramienta le responde al agente qué faltó
   (RN-skin-disenar).

### Dónde se cumple cada regla

| Regla | Dónde |
|---|---|
| RN-skin-tema-por-defecto, -por-carpeta | flujo 1.2, `prefs.ts` |
| RN-skin-variante | flujo 1.3, `light.ts`, hook `config.set` |
| RN-skin-tema-nzt | `palette.ts` (valores de `specs/nzt-brand.md`) y `themes/` |
| RN-skin-tema-claude | `themes/` (QT-02); el panel dice cómo elegirlos |
| RN-skin-repintar | flujo 6 |
| RN-skin-disenar | flujo 7, `design.ts` |
| RN-skin-apagado | el comienzo de todo hook de dibujo; la banda y la línea al agente no lo miran |
| RN-skin-banda-partes, -limites, -costo, -sin-lectura, -banda-ancho | `band.tsx` |
| RN-skin-marcas-kernel | `kernel.ts` (cortes fijos, no configurables) y `band.tsx` |
| RN-skin-banda-refresco | flujo 3.1; las animaciones, en `band.tsx` con `$.clock` desde `register.tsx` |
| RN-skin-cede-la-banda | flujo 3.2 (`hasSurvey`) |
| RN-skin-limpiar, -limpiar-confirma | [remove] flujo 5 |
| RN-skin-al-agente | flujo 4, `kernel.ts` (inglés, menos de 40 tokens) |
| RN-skin-pista-diagramas | hook `prompt.compose`, solo con diagramas prendidos y con interfaz |
| RN-skin-partes | una opción por parte en `prefs`, mirada al comienzo de su hook |
| RN-skin-solo-dibujo | los hooks de dibujo solo devuelven árboles: no tocan `e.props` ni el texto guardado |
| RN-skin-cae-al-original | flujo 2 |
| RN-skin-calmo | `prefs.calm`: sin `$.clock` de animación, filas en una línea, fallos enteros |
| RN-skin-copiar | `$.ui.copy` desde el botón y desde `/nzt-look copy` |
| RN-skin-palabras | `spinner.tsx`, con las palabras del tema o las de Claude Code |
| RN-skin-no-interrumpe | flujo 1.1, flujo 2 y `ui.fault` |
| RN-skin-idioma | `i18n.ts`; lo del agente es una constante en inglés |
| RN-skin-comando | `$.command.register({ name: 'nzt-look' })` |

### Datos

- **`$.store`, entre sesiones**, declarado en `types/index.d.ts` (QT-12):
  - `prefs`: tema, variante (`auto`, `dark`, `light`), idioma, las 6 partes de la banda, la línea
    al agente, una opción por parte de la conversación, calmo, palabras, solo lectura plegada,
    desplegar lecturas y dibujo prendido o apagado;
  - `folders`: carpeta → tema;
  - `custom`: los temas propios (`mi-<tema>` y los diseñados), cada uno con sus dos paletas.
- **`$.state` y átomos, de la sesión:** las cifras de uso, el último tramo que recibió el agente,
  lo abierto o plegado de cada fila.
- **Lo que se calcula y no se guarda:** la paleta resuelta. Si se guardara la ajustada, un cambio
  de la regla de ajuste no les llegaría a los temas ya guardados.

### Cuando algo falla

- **Una pieza lanza o no entiende lo que recibe:** esa parte queda con el dibujo de Claude Code, y el
  error va al registro de depuración. El turno sigue.
- **`$.store` no se puede leer:** valores por defecto, y la sesión sigue. No se escribe encima hasta
  que la persona cambie algo.
- **`$.session.usage()` falla:** la banda dice *sin lectura todavía*, y la línea al agente no va en
  ese prompt.
- **`/clear` se rechaza:** un aviso con el error; la banda vuelve a su estado normal. Apretar dos
  veces no encola dos `/clear`: mientras corre uno, el botón no está.
- **El tema que arma el agente no es válido:** sigue el anterior y la herramienta dice qué falta.

### Corte para build (propuesta)

Cada uno es una unidad, en este orden, y cada uno cierra con sus tests y con el mod cargado en vivo
sin errores:
1. **Esqueleto:** plugin, `/nzt-look` con `on`, `off` y `<tema>`, `prefs`, `i18n` y el panel vacío.
2. **Paletas:** `nzt` y los 15 temas, la variante clara calculada, el ajuste de contraste con su test
   de 16 × 2, y `themes/` para `/theme`.
3. **Banda y línea al agente:** contexto con marcas, límites, costo, `/clear` con confirmación,
   ancho, sin lectura, animaciones y aviso de cruce.
4. **Panel de opciones:** temas, variante, carpeta, partes, colores y vista previa.
5. **Filas de herramientas:** nodos, lecturas agrupadas, `▸`, solo lectura plegada.
6. **Consola y diff.**
7. **Respuesta del agente:** tablas, avisos, tareas, enlaces, rutas, plegado y copiar.
8. **Código resaltado.**
9. **Fórmulas.**
10. **Diagramas.**
11. **Spinner, pie, contorno del prompt y salida de comandos.**
12. **Diseñar un tema con Claude** y la nota de diagramas.
13. **Salida:** tarjeta Aspecto de `nzt-hub` 0.4.0, catálogo, README y marketplace.

### Lo que cambió al construir

Lo que el motor impuso o lo que el diseño no había fijado, unidad por unidad. Cada punto es del
agente salvo que diga otra cosa; el usuario lo ve en la 224.
- **El idioma es una opción del plugin** (`userConfig.language`), como en los otros mods de NZT, y
  no una clave de `$.store`: así lo cambia `/config` (227).
- **`copiar` es una parte más** de la conversación, porque el panel aprobado (Q-06) lo tiene como
  interruptor (227).
- **La confirmación de limpiar dice `0: otra vez para limpiar`**, no `0 otra vez: limpiar` (Q-06):
  un botón con tecla se dibuja como `0: texto`, y el texto aprobado habría quedado `0: otra vez:
  limpiar` (229).
- **Cancelan la confirmación** los 5 segundos sin segunda pulsación y escribir en el prompt
  (`prompt.change`). Que **Esc** la cancele, como dice el texto aprobado, no está en ningún evento
  documentado: se mira en vivo en la 224 (229).
- **Solo la terminal anima el contexto.** En el escritorio el anillo es un `Svg`, y los módulos de
  superficie que animan no pueden dibujar `Svg` (tipos 2.1.302, `ClientElements`): el anillo se
  redibuja con cada cifra, sin transición (229).
- **El panel no tiene alto fijo:** crece con su contenido y la superficie lo desplaza. `Cerrar`
  queda al final del contenido, no clavado en la última fila (230).
- **El bloque que Claude Code dibuja debajo de una herramienta se reemplaza por el `▸` de la
  fila**, salvo el de la consola y el de las ediciones, que tienen su tarjeta (231).
- **El tiempo de una fila lo mide el mod** desde que la herramienta empieza hasta que termina
  (`tool.call`): Claude Code no lo da. Una llamada hecha antes de cargar el mod no tiene tiempo
  (231).
- **La prosa de la respuesta la sigue dibujando el `Markdown` de Claude Code**; el mod dibuja los
  bloques (tablas, avisos, tareas, código, fórmulas, diagramas). Por eso, en la prosa, las rutas,
  los números y las versiones no llevan el color del tema, y los archivos creados o editados en el
  turno se colorean solo en las filas de herramientas. Los enlaces quedan como los dibuja Claude
  Code, clickeables donde la superficie lo permite (233).
- **Los diagramas son 5 tipos, no los 17 de la referencia:** flujo (`flowchart`/`graph` en TD, BT,
  LR y RL), estados, secuencia, torta y mapa mental. Los otros tipos, un `flowchart` con
  `subgraph`, más de 40 nodos o un dibujo más ancho que la conversación quedan como texto, como lo
  dibuja Claude Code. Es lo que entró escribiéndolo desde cero (QT-01 y QT-18); sumar tipos es una
  versión siguiente (236).
- **En el escritorio el diagrama es la misma tarjeta de texto que en la terminal**, en letra de
  ancho fijo, no un `Svg` (236).
- **Una herramienta de MCP lleva su nombre tal cual** (`mcp__github__create_issue`) y la fila no
  repite nada a la derecha: el objetivo que antes armaba con ese nombre era el mismo texto (246).
- **Las palabras viejas del pref se respetan:** quien ya tenía guardado `palabras tema` sigue con las
  del mod hasta elegir `claude` en el panel; el valor por defecto `claude` vale para quien no guardó
  nada (246).
- **Las cifras del spinner salen como `(12s, 300 tokens, high effort)`**: es la forma del ejemplo de
  los tipos del motor, `(12s, 300 tokens)`, con el effort al final; la de Claude Code se compara en
  vivo (L-20). El tiempo se redibuja de a segundo solo mientras corre un turno del hilo principal, y
  cada cifra aparece cuando se conoce. **En el escritorio el spinner queda sin cifras**, como en el
  mockup (249).
- **La viñeta `●` va solo en la terminal**: en el escritorio la app enmarca la respuesta a su modo
  y no lleva viñeta (249).
- **Con palabras `mod`, el pie es la línea de Claude Code con la palabra del tema en lugar de la
  suya**: el mod le cambia la palabra y Claude Code arma el resto. Un turno sin herramientas ni
  líneas deja la línea de Claude Code sola (249).

## Requisitos no funcionales

- La banda muestra la cifra nueva **en el mismo paso del turno** en que la sesión la tiene.
- La línea al agente ocupa **menos de 40 tokens** por prompt; la nota de diagramas, **menos de 150**.
- Leer las cifras no consume pedidos al modelo.
- Una fila redibujada no se nota más lenta que la de Claude Code. **Sin número todavía:** se mide
  una línea base en la verificación y se decide contra ella (Q-04).
- Todo texto con al menos 4,5:1 de contraste contra su fondo, en los 16 temas y sus dos variantes;
  un estado nunca se dice solo con color (`specs/nzt-brand.md`, Accesibilidad). En los temas que
  no llegan, el mod ajusta el color (Q-09).
- Se dibuja en la terminal y en la app de escritorio. Los tests montan las dos superficies.

## Preguntas

Registro **append-only**. Origen de cada entrada: `usuario`, `agente, dentro del alcance`,
`investigado` (con fuente y fecha) o `propuesta` (sin contestar).

### Q-01 · ¿Se llama `nzt-skins`?
- propuesta: `nzt-skins`, con el comando `/nzt-skins`. Dice lo que es, sigue el prefijo de los mods
  de NZT y no choca con el comando de la referencia.
- depende: el catálogo (217), `nzt-hub` (218) y todo lo que sigue.
- respuesta: sí, `nzt-skins` y `/nzt-skins` · usuario 2026-10-17 ("perfecto todas tus propuestas")
- **superada el 2026-10-18:** el usuario lo renombró (*"que no se llame nzt-skins mejor, que se
  llame nzt-beautifier o algo así, porque trae un set de cosas muy buenas"*). El agente objetó una
  vez `nzt-beautifier` (suena a formateador de código y el comando es largo), y el usuario eligió
  **`nzt-look`**, con el comando `/nzt-look`. La tarjeta y la pestaña dicen **Aspecto** / **Look**
  (RN-mod-pestaña). Los slugs `RN-skin-*` no cambian. · usuario 2026-10-18

### Q-02 · ¿El tema por defecto es `nzt`?
- propuesta: sí (RN-skin-tema-por-defecto). La otra opción es `noir`, el de la referencia.
- respuesta: sí, `nzt` · usuario 2026-10-17
- reabierta 2026-10-20: el usuario pidió que venga con el dibujo de Claude Code; ver QT-20.

### Q-03 · ¿Confirmás las propuestas del agente de esta unidad?
- RN-skin-una-linea (una sola línea al agente si `nzt-context` sigue instalado), RN-skin-comando
  (`/nzt-skins` en lugar de `/skin`), RN-skin-compactar (resaltar desde el 20%, no desde el 70%) y
  el orden en que se sacan partes por ancho (RN-skin-banda-ancho).
- respuesta: confirmadas todas · usuario 2026-10-17
- después, el mismo día: RN-skin-compactar la reemplaza RN-skin-limpiar (`/clear`), y
  RN-skin-una-linea se quita con el retiro de `nzt-context` (M4, unidad 225).

### Q-04 · ¿Qué tan rápido tiene que dibujar una fila?
- propuesta: no fijar un número ahora; medir una línea base en la verificación y decidir con ella.
- respuesta: ok, la propuesta · usuario 2026-10-17

### Q-05 · ¿La banda se ve como la de la referencia?
- investigado (README de la referencia): en la app de escritorio, anillos de contexto y de
  límites del plan con el botón compactar; en la terminal, medidores de bloques con el mismo botón.
- propuesta: sí, ese aspecto, con las marcas 20/30/40 sobre el contexto y los colores por tramo
  del kernel. Se decide en el mockup de la banda (unidad 220), después de que el usuario vea
  la referencia instalada.
- respuesta: "tal cual de momento", después de probar la referencia instalada · usuario
  2026-10-17

### Q-06 · ¿Confirmás los textos y las propuestas del diseño de la banda y el panel (unidad 220)?
- propuesta:
  - palabras del tramo: `mejor limpiar` (20), `limpiá pronto` (30), `limpiá ya` (40);
  - el botón `0: /clear`, con el comando como texto;
  - sacar los tokens antes que las partes;
  - el panel al costado, con la banda en la vista previa;
  - los nombres de los colores en español (acento, texto, tenue, superficie, cebra, bien, error,
    aviso, leer, escribir, correr);
  - los textos del panel: el aviso de dibujo apagado, el de color inválido y
    el de guardado, la línea de `/theme`, el pie y el del celular.
  Todo está subrayado en punteado en el mockup.
- depende: el código de la banda y del panel (build).
- respuesta: "ok", todas · usuario 2026-10-17

### Q-07 · ¿El botón `/clear` pide confirmación?
- contexto: el usuario cambió compactar por limpiar el 2026-10-17. Limpiar borra la conversación y no
  se deshace, y el botón se aprieta con una sola tecla (`0` con el prompt vacío): un `0` escrito por
  error limpiaría la sesión.
- propuesta: sí, una segunda pulsación en 5 segundos (RN-skin-limpiar-confirma). La otra opción es
  limpiar a la primera, que es más rápido y arriesga perder la sesión sin querer.
- respuesta: "si pide confirmacion" · usuario 2026-10-17. RN-skin-limpiar-confirma queda acordada.

### Q-08 · ¿Confirmás los textos y las propuestas del mockup de la conversación (unidad 221)?
- propuesta, subrayado en punteado en el mockup:
  - los nombres de las herramientas en español: `Leer`, `Buscar`, `Editar`, `Correr`;
  - las palabras `Pensando` del spinner y `Listo en 41s · 6 herramientas` del pie; las palabras
    del tema nzt las fija la 222;
  - `sin salida`, `cortado` y `Copiar`;
  - en una terminal angosta, una tabla que no entra cae al dibujo de Claude Code.
- depende: el código de la conversación (build).
- respuesta: "ok", todas · usuario 2026-10-17 · **reemplazada por Q-10** en lo que toca a los textos
  de Claude Code (nombres de herramientas, spinner, pie, `cortado`)

### Q-09 · ¿Qué se hace con los temas de la referencia que no pasan 4,5:1?
- contexto: medido en la 222 (*Contraste de los otros 15 temas*). Solo `noir` y `github` pasan en
  las dos variantes.
- opciones:
  - **ajustar**: el mod aclara (en la oscura) u oscurece (en la clara) cada color de texto que no
    llega, sin cambiarle el tono, hasta 4,5:1 contra `surface` y `zebra`. Los temas se parecen a
    los originales, pero no son idénticos;
  - **tal cual**: las paletas quedan como en la referencia, y el NFR vale solo para `nzt`. Son
    idénticos a los originales, pero el texto tenue de 13 temas oscuros queda bajo 4,5:1, y en los
    claros hay avisos bajo 2:1.
- respuesta: **ajustar** · agente, por delegación del usuario el 2026-10-18 (*"222 hace las
  propuestas"*). El NFR ya estaba acordado, y la misma regla sirve para las cinco variantes claras
  que la referencia no trae. Cómo se ajusta lo decide la 223. Se reabre si el usuario prefiere los
  colores originales al verlos en vivo (224).

### Q-10 · ¿El mod cambia los textos de Claude Code?
- contexto: con 0.1.0 la fila decía `Correr`, `Editar`, `Leer`; el spinner y el pie, palabras del
  tema; una llamada cortada, `cortado` (Q-08). El usuario lo vio en el mockup de la conversación.
- respuesta: no. *"si me gusta el cambio de estilo digamos pero no me gusta que se le cambien sus
  textos"* · usuario 2026-10-18. Queda RN-skin-textos-claude.
- investigado (tipos del motor, 2026-10-18): la fila recibe `tool`, el nombre de la herramienta
  (`Bash`, `Read`, `Edit`), no la etiqueta que dibuja Claude Code. Para `Edit` Claude Code muestra
  `Update`, y el mod va a mostrar `Edit`. El grupo de lecturas no recibe la frase de Claude Code
  (`Read 3 files, …`), solo las llamadas. El spinner y el pie sí reciben su palabra (`word`). Una
  llamada cortada la dibuja Claude Code como `Interrupted`.
- propuesta del agente, objetable: las palabras del tema quedan como opción apagada; el título de
  un aviso (`Nota`) y lo que el pie suma (herramientas y líneas) son del mod y siguen.
- sin ver todavía, se mira en vivo (L-20): qué escribe una consola sin salida; hasta verlo sigue
  diciendo `sin salida`. Cómo une Claude Code la palabra y el tiempo del pie ya no hace falta: el
  pie es su línea tal cual (Q-11).

### Q-11 · ¿Qué se ajusta después de verlo en vivo?
- contexto: el usuario probó 0.2.0 en su sesión el 2026-10-18.
- respuestas del usuario, 2026-10-18:
  - spinner: *"quiero la opcion de mantener el spinner pero que sea tal cual con la info que da
    Claude"*. El agente avisó que Claude Code no le pasa al mod el tiempo, los tokens ni el effort de
    su spinner, y que devolverle el spinner a Claude Code los mantenía sin trabajo; el usuario eligió
    el estilo del mod con esas cifras. Quedan RN-skin-spinner-cifras y RN-skin-pie-claude;
  - viñeta y tabla ancha: "ok perfecto" (RN-skin-vineta, RN-skin-tabla-ancha);
  - filas: *"se siente como dificil de leer"* (RN-skin-filas-legibles), y el diff de una edición
    legible *"como leer code"* (RN-skin-diff-legible), también en la terminal;
  - colores de diff del tema NZT: "ok perfecto" (Diseño · tema nzt);
  - palabras: `claude` por defecto y el botón como un selector como los demás (RN-skin-palabras).
- investigado (tipos del motor, 2026-10-18): el spinner de Claude Code dibuja el tiempo, los tokens y
  el effort con datos que no llegan al mod; el mod los arma con la hora de inicio del turno, los
  tokens de cada respuesta del modelo (`turn.step`) y el effort de RN-skin-modelo. La forma exacta
  (`(12s, 300 tokens)` en el ejemplo de los tipos) se mira en vivo (L-20).

## Preguntas técnicas (unidad 223)

Registro **append-only**: una respuesta superada se marca con lo que la reemplazó, nunca se borra.
Origen de cada entrada: `usuario`, `agente, dentro del alcance`, `investigado` (con fuente y fecha)
o `propuesta`. Fuentes de lo investigado, leídas el 2026-10-18:
- los tipos de Claude Code 2.1.302 (`mods/nzt-state/.claude-plugin/types/claude-code/index.d.ts`);
- <https://code.claude.com/docs/en/plugins/components> (*Themes and output styles*) y
  <https://code.claude.com/docs/en/terminal-config> (*Create a custom theme*);
- el código de la referencia en la copia local de la máquina.
  Está marcado `.orphaned_at`, así que el motor puede borrarlo.
Salen de las reglas de la spec y de las *Notas técnicas* de abajo.

Modo para los detalles: **propuestas** · usuario 2026-10-18. El agente los decide, cada uno marcado
como suyo, y el usuario objeta lo que no le cierre. Diagrama de secuencia: ofrecido en el reporte
de la 223; mientras tanto, los flujos van en lista.

### QT-01 · ¿Se construye sobre el código de la referencia o desde cero?
- investigado: 16.593 líneas en `hooks/` (60 archivos), 8 archivos de tests, licencia MIT
  (su licencia). Su `vendor/mermaid-ascii.js` también es MIT
  ("Copyright (c) 2026 Craft Docs"). El repo de NZT es MIT. Todo lo que usa `$` está en
  `register.tsx`, como pide la regla de los mods (memoria *$ no cruza imports*).
- opciones:
  - **partir de su código**: se copia a `mods/nzt-look/`, se le quita lo que la spec deja afuera y
    se le suma lo de NZT. Tiene todo el alcance de la referencia desde el primer día. A
    cambio, NZT pasa a mantener 16 mil líneas que no escribió, y las correcciones de la referencia
    hay que traerlas a mano;
  - **desde cero**: código propio y más chico, pero hay que reescribir el resaltado, los 17 tipos
    de diagrama, las fórmulas y el dibujo de las tarjetas. Son semanas de build para llegar a lo
    mismo.
- propuesta: partir de su código, con las licencias conservadas. **Tradeoff: lo decide el usuario.**
- respuesta: **escribir todo nuevo**. La referencia queda solo como guía de qué hace y cómo se ve,
  no como código de partida · usuario 2026-10-18 (*"hay que armar todo lo que tiene [la referencia]
  ... pero para nzt-skins y con las decisiones que tomamos"*; confirmado al repreguntarle con las
  dos opciones explicadas). Consecuencia aceptada: el build es más largo (13 unidades, *Corte para
  build*), y el código es todo de NZT.

### QT-02 · ¿Cómo llegan NZT oscuro y claro a `/theme`?
- investigado (components, 2026-10-18): un plugin trae temas en `themes/<slug>.json`, con el mismo
  formato que los de `~/.claude/themes/`, y aparecen en `/theme` con el `name` del archivo,
  marcados como del plugin. Son de solo lectura: si la persona edita uno en `/theme`, se guarda una
  copia en su carpeta de temas. La clave del manifiesto `experimental.themes` reemplaza la búsqueda
  en la carpeta.
- observado (spike S-04): con el mod cargado desde `dev-mods`, el tema no apareció. Falta S-04c
  (instalado por marketplace o con `--plugin-dir`).
- respuesta: van como temas del plugin, en `mods/nzt-look/themes/`. El mod no escribe en
  `~/.claude/themes/`. Si en la 224 no aparecen instalados, esta pregunta se reabre con
  alternativas. · investigado
- observado (2026-10-19, 2.1.303, `$.config.list` con el mod por `--plugin-dir` y con un tema en
  `~/.claude/themes/`): la opción `theme` es `choice` con los 7 temas de Claude Code; ni los del
  plugin ni los del usuario figuran, así que `$.config.set` no los elige (S-02). Un mod sí escribe
  en `~/.claude/themes/` con `$.fs.write` (probado y borrado).
- respuesta: el mod sigue trayendo `themes/`, y además el panel los copia a la carpeta de
  temas de la persona con un botón (usuario 2026-10-19, opción 1 de tres: copiar, solo seguir
  `/theme`, solo documentarlo). RN-skin-tema-claude. · decidido por el usuario

### QT-03 · ¿Cómo sabe el mod si el tema de Claude Code es claro u oscuro?
- investigado: la referencia mira si el valor de la opción `theme` contiene `light` o `dark`
  (`light.ts`, `isLightTheme`). Un tema propio se guarda como `custom:<slug>` (terminal-config).
  El de un plugin no está documentado, y S-06 queda para la 224.
- consecuencia: si el slug no dice `light` o `dark`, NZT claro se tomaría como `auto`.
- respuesta: los slugs son `nzt-dark` y `nzt-light`. La variante sale de buscar `light` o `dark` en
  el valor de `theme`. Con `auto`, o sin ninguna de las dos palabras, sale de `COLORFGBG` y, si no
  está, del sistema (Windows, macOS, GNOME), consultado cada 5 segundos mientras siga en `auto`,
  como la referencia. La variante forzada manda sobre todo. Si S-06 (224) muestra un valor sin el
  slug, se reabre. · agente, dentro del alcance

### QT-04 · ¿En qué idioma se llaman los temas en `/theme`?
- investigado: el `name` vive en un archivo fijo del plugin, y el mod no lo puede cambiar según la
  opción de idioma (QT-02: los temas de plugin son de solo lectura).
- respuesta: `NZT oscuro` y `NZT claro` en los dos idiomas, como nombres propios. Así los nombra el
  panel desde la 220 (Q-06). · agente, dentro del alcance

### QT-05 · ¿Cómo se ajusta un color que no llega a 4,5:1 (Q-09)?
- abierto, detalle: el método, contra qué fondos se mide y en qué momento se ajusta.
- respuesta: `contrast.ts` mezcla el color hacia el blanco (en la oscura) o hacia el negro (en la
  clara), de a 2%, hasta que pasa 4,5:1 contra `surface` y contra `zebra`, que son los fondos
  donde el mod escribe. Vale para las 13 claves de texto, no para `surface` ni `zebra`. Un color que
  ya pasa no se toca. Se aplica al resolver la paleta (flujo 1.4) y nunca se guarda, así que vale
  también para los temas propios y los diseñados. Un test recorre los 16 temas en las dos
  variantes. · agente, dentro del alcance

### QT-06 · ¿Cómo sale la variante clara de los 5 temas que no la traen?
- investigado: la referencia la calcula con `toLight` (`light.ts`). Lleva cada color al negro un
  45%, y deja `fg` en `#1f1f1f`, `muted` en `#6b6b6b` y las superficies en blanco y `#f2f2f2`.
- respuesta: con la misma idea, en código propio (`light.ts`): superficies blanco y casi blanco,
  `fg` casi negro, y cada color oscurecido manteniendo el tono. Después pasa por el ajuste de
  QT-05, que garantiza el 4,5:1. · agente, dentro del alcance

### QT-07 · ¿Qué pasa si la referencia también está instalada?
- investigado (tipos): los hooks de un mismo nivel se anidan. El de afuera dibuja y solo cede si
  llama a `next`. Los dos mods están en el nivel `user`. Qué orden tienen entre ellos **no está en
  los tipos**: sin verificar.
- respuesta: el mod no detecta a la referencia ni se aparta. El README dice que se use uno solo, y
  que con los dos dibuja el que quede afuera. El comando ya no choca (RN-skin-comando). · agente,
  dentro del alcance

### QT-08 · ¿La banda convive con la de otro mod sobre el prompt?
- investigado: la referencia dibuja su banda y pone debajo lo que devuelve `next(e)` (`register.tsx`,
  `AbovePrompt`), igual que el spike. `AbovePrompt` trae `hasSurvey`, `isWorking` y `maxRows`.
- respuesta: igual que la referencia: la banda propia arriba y lo de los otros mods debajo. S-07 se
  mira en vivo en la 224. · investigado

### QT-09 · ¿Puede el mod correr `/clear` (RN-skin-limpiar)?
- investigado (tipos, `$.command.run`): corre un comando *"as if the person typed `/command
  args`"*, en cola, cuando la sesión queda libre. Rechaza un nombre desconocido y una llamada
  hecha dentro de un hook del que el turno espera respuesta. Los tipos no exceptúan `clear`.
  la referencia corre `compact` desde un temporizador (`$.clock.after`) por ese motivo.
- respuesta: `$.command.run({ command: 'clear' })` desde `$.clock.after`, como la referencia con
  `compact`. Que limpie de verdad se mira en vivo en la 224. · investigado

### QT-10 · ¿Cómo llega la línea al agente (RN-skin-al-agente)?
- investigado: `nzt-context` 0.2.0 (tag `nzt-context--v0.2.0`) la manda en `prompt.submit` y avisa
  el cruce en `tool.call`, con las cifras de `$.session.usage()` y los hooks `session.measure`,
  `session.compact` y `session.end`.
- abierto, detalle: si se porta ese código o se reescribe.
- respuesta: se porta. Es código de NZT, ya probado; QT-01 habla del de la referencia. Va a
  `kernel.ts` (la línea y los tramos, sin `$`) y a `register.tsx` (los hooks). · agente, dentro del
  alcance

### QT-11 · ¿De dónde salen las cifras de la banda?
- investigado (spike S-03, tipos): `$.session.usage()` da `context` (ventana y porcentaje),
  `rateLimits` y `cost.usd`. Antes de la primera respuesta no trae porcentaje ni límites.
- respuesta: de ahí, como `nzt-context` y la referencia. · investigado

### QT-12 · ¿Dónde se guarda lo que elige la persona?
- investigado: la referencia guarda `prefs`, `folders` y `custom` en `$.store`, que dura entre
  sesiones.
- abierto, detalle: las claves nuevas (partes de la banda, línea al agente, idioma, variante
  forzada).
- respuesta: tres claves en `$.store` (`prefs`, `folders` y `custom`), con lo que lista *Datos* del
  diseño técnico. Todo lo de la sesión va en `$.state` y en átomos, nunca en variables del módulo,
  que se pierden al recargar. · agente, dentro del alcance

### QT-13 · ¿Cómo se arma el módulo?
- abierto, detalle: qué archivos se suman al de la referencia (tema `nzt`, marcas del kernel, línea
  al agente, `i18n.ts`) y el nombre del plugin, del comando y de la herramienta para diseñar temas.
- superado por QT-01: no hay archivos de la referencia a los que sumar.
- respuesta: las piezas de *Diseño técnico*, con todo `$` en `register.tsx`. Plugin `nzt-look`,
  comando `/nzt-look` y herramienta `design` (el motor le agrega el prefijo del plugin, como hizo
  como en la referencia). · agente, dentro del alcance

### QT-14 · ¿Cómo se traducen los textos (RN-skin-idioma)?
- investigado: la referencia tiene todo en inglés, repartido en sus archivos de dibujo y en el panel.
- respuesta: todo texto que ve la persona sale de `i18n.ts`, con `es` y `en` y las mismas claves en
  los dos; un test lo controla. Ninguna pieza de dibujo escribe un texto fijo. Lo que recibe el
  agente queda fuera de `i18n.ts`, en inglés. · agente, dentro del alcance

### QT-15 · ¿Qué se saca de la referencia?
- investigado: trae aviso de versión nueva (`updates.ts`, una vez por día), un aviso para pedir una
  estrella (`STAR_NOTICE`), el botón compactar, el dibujo de markdown para otros mods y un panel
  galería (`gallery.tsx`) aparte del de opciones.
- abierto, detalle: la spec deja afuera el aviso de versión, compactar y el dibujo de markdown para otros mods. La
  estrella y la galería no aparecen en la spec.
- respuesta: no se construye nada de eso. La estrella y la galería no están en la spec, y elegir
  tema con la vista previa ya está en el panel. · agente, dentro del alcance

### QT-16 · ¿Qué colores muestra el panel para repintar?
- investigado: una paleta tiene 15 claves, y el panel diseñado en la 220 muestra 11 (Q-06).
- respuesta: las 11 del diseño. `search`, `web`, `mcp` y `other` no se repintan desde el panel.
  Los cambia un tema diseñado con Claude, y en uno repintado quedan como en el original. ·
  agente, dentro del alcance

### QT-17 · ¿Cómo se prueba?
- investigado: la referencia tiene 8 archivos de tests para `claude plugin test`, que monta terminal
  y escritorio. Que los tests pasen no prueba que el módulo cargue en vivo (memoria *$ no cruza
  imports*).
- respuesta:
  - tests de las piezas sin `$`: contraste de los 16 temas por 2, claves de `i18n`, `prefs` rotos,
    tramos, ancho de la banda y cada árbol;
  - tests con `claude plugin test` que montan cada componente en terminal y escritorio;
  - al cerrar cada unidad de build, el mod cargado en vivo con `--plugin-dir`, buscando *hooks
    module did not load*;
  - la línea base de velocidad (Q-04) y lo que no se puede montar, en la 224.
  · agente, dentro del alcance

### QT-18 · ¿Con qué se dibujan los diagramas Mermaid en la terminal?
- investigado: la referencia incluye `vendor/mermaid-ascii.js`, un paquete armado de
  *beautiful-mermaid 1.1.3* (MIT, "Copyright (c) 2026 Craft Docs", según la cabecera del archivo).
  Exporta `renderMermaidAscii(text, options)`. Que esté publicado en npm con ese nombre **no se
  verificó**.
- respuesta: se incluye esa librería en `vendor/`, con su licencia. No es código de la referencia
  sino de un tercero, así que QT-01 no la alcanza. El dibujo del escritorio y los tipos que la
  librería no cubre se escriben nuevos. Si el usuario no quiere código de terceros, se reabre: la
  alternativa es escribir el dibujo de los diagramas, que es la unidad de build más grande. ·
  agente, dentro del alcance
- **superada el 2026-10-18:** el dibujo de Mermaid también se escribe en NZT, en la terminal y en el
  escritorio, sin librería de terceros (*"ok perfecto construyamos eso también ... que forme parte
  de nzt-skins"*) · usuario 2026-10-18. No hay `vendor/`. La unidad de diagramas se parte si no
  entra en una.

### QT-19 · ¿De dónde salen los colores de los 15 temas?
- investigado: la referencia los tiene en `hooks/themes/*.ts`, tomados de los temas públicos que
  llevan esos nombres (Dracula, Nord, Catppuccin…).
- respuesta: se toman esos valores, que son datos y no código, y el README los atribuye a
  la referencia y a cada tema original. · agente, dentro del alcance

### QT-20 · ¿Qué es el tema `default` (0.6.0)?
- opciones: **dibujo de Claude** (el mod no redibuja la conversación, como `off`, y la banda y el
  panel siguen con colores neutros) o **un tema `claude`** con la paleta de Claude Code, que el
  mod sigue redibujando.
- respuesta: dibujo de Claude · usuario 2026-10-20. La paleta neutra es la de `mono` · agente,
  dentro del alcance.

## Notas técnicas (para la unidad 223)

Sin identificador; arquitectura las pasó a *Preguntas técnicas* el 2026-10-18.
- Cómo llegan NZT oscuro y claro a `/theme`: como tema de plugin (`themes/` del mod, pendiente S-04c)
  o como tema de usuario (`~/.claude/themes/`, probado en S-04b), y si la app de escritorio los
  respeta (S-05).
- Qué se toma de la referencia (MIT) y cómo se atribuye: paletas, resaltado, diagramas.
- Qué pasa si la referencia también está instalada y los dos redibujan lo mismo.
- Si la línea de este mod y una banda de otro mod conviven sobre el prompt (S-07).
- Qué valor guarda `/config` al elegir un tema propio en `/theme` (S-06), para saber la variante.
- Si un mod puede correr `/clear` (RN-skin-limpiar). La referencia corre `/compact` con
  `$.command.run({ command: 'compact' })` (`register.tsx`, leído el 2026-10-17); que `clear` funcione
  igual está **sin verificar**.
- Cómo sale la variante clara de dracula, gruvbox, mono, night-owl y nord, que la referencia
  no trae y calcula (`skin.ts`: "without one, light.ts derives it"; leído en su código el 2026-10-17).
  RN-skin-variante pide las dos variantes en todos.
- Cómo se ajusta un color que no pasa 4,5:1 (Q-09), y si se ajusta al cargar el tema o al
  escribirlo.
- La paleta tiene 15 claves (`search`, `web`, `mcp`, `other` y `user` además de las 11 del panel):
  qué colores muestra el panel para repintar.
- Los nombres `NZT oscuro` y `NZT claro` están en un archivo fijo: si `/theme` los muestra en el
  idioma del mod (RN-skin-idioma), o en uno solo.

## Sin determinar

- **Escritorio:** si la app respeta el tema NZT de Claude Code (S-05). Las pruebas en vivo que
  faltan del spike (S-04c a S-07) las hace el usuario al final, con el mod construido (usuario,
  2026-10-17: *"construyamos todo el mod y vayamos probando, cuando terminemos me decís qué
  probar"*).
