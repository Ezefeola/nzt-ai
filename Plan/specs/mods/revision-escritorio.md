---
update-when: cambia cómo dibuja un mod en la superficie desktop, o se agregan las capturas que faltan
---

# Revisión · los mods en la app de escritorio

> Unidad 360 · 2026-10-24 · Pedido del usuario: "como se ven en consola esta perfecto, pero en
> la app de escritorio se ven bastante mal". Decisiones: QT-01 todos los mods; QT-02 una rama
> de dibujo por superficie, la de consola no se toca; QT-03 las capturas las saca el agente.

**Es una revisión experta hecha leyendo el código, no una prueba con usuarios ni una mirada a
la app.** La entrada fue el código de los seis mods y los tipos de la API de mods de Claude
Code 2.1.299 (`claude-code.d.ts`, la referencia de `plugin-authoring`). Eso muestra qué árbol
manda cada mod y qué supone de la superficie; **no muestra cómo lo pinta la app**.

**No corrido:** las capturas de la app. Computer-use no puede controlar la app Claude, y el
usuario decidió cerrar sin capturas (QT-04, sección *Pendiente*). Ningún hallazgo está visto
en pantalla: cada uno es una causa leída en el código, con la evidencia del código y del tipo,
y cada unidad de build lo confirma o descarta con sus tests en las dos superficies.

## Por qué se rompe: lo que cambia entre superficies

| | Consola (`terminal`) | App de escritorio (`desktop`) | Fuente |
|---|---|---|---|
| `Box` | caja de Ink en celdas | un `div` flex | `StyledElement`, tipos |
| `Text` | texto monoespaciado en celdas | un `span` con estilo | ídem |
| Espaciado con número | celdas | "the same on every surface" en celdas | `Space` |
| Espaciado con paso (`sm`, `md`…) | celdas fijas | la escala propia de la app | `Space` |
| Elementos propios | `Raster`, `Image` | `Svg` | `Elements` |
| `Button` | `[ label ]` o texto plano | botón nativo | `ButtonProps` |
| `presentation.isFullscreen` de un comando | `true` en pantalla completa | describe una terminal; sin terminal es `false` | `CommandPresentation` |

La consola es una grilla: un carácter ocupa una celda, y por eso alinear con espacios,
repetir `─` hasta el ancho o rellenar con `padEnd` da filas parejas. En escritorio el texto
es proporcional y el HTML colapsa los espacios seguidos: **todo lo que alinea contando
caracteres queda corto, largo o torcido**, y un borde de caracteres no coincide con el ancho
real de la caja.

## Hallazgos

Severidad de 0 a 4 por frecuencia, impacto y persistencia. Tipo: *construcción* (se arregla
dentro del trabajo autorizado, sin cambiar comportamiento) o *propuesta* (cambia lo que hace
el mod: va al usuario y a la spec).

### H-01 · Los paneles con `isFullscreen` podrían no abrirse en escritorio
- **Severidad:** 4 si se confirma: el panel entero no existe para quien usa la app.
- **Tipo:** construcción, con una propuesta adentro (ver *Pendiente* P-02).
- **Dónde:** `nzt-files` (`register.tsx:771-772`), `nzt-changes` (`:421-422`), `nzt-hub`
  (`:128-129`); el comando de cada uno.
- **Evidencia:** el comando responde `paneInlineNoFullscreen` cuando
  `presentation.isFullscreen` es falso. El tipo dice que ese campo es `false` "on the main
  screen … and headless", y una sesión que abre la app de escritorio no tiene terminal. La
  señal que sí habla de la superficie es `e.viewport.isFullscreen`, que una superficie
  remota informa con su tamaño. Además `nzt-files` solo se abre al empezar si
  `e.surface === 'terminal'` (`:749`).

### H-02 · Filas rellenadas con espacios y reglas de `─` / `━` hasta el ancho
- **Severidad:** 3: aparece en todos los paneles y en cada fila plegable.
- **Tipo:** construcción.
- **Dónde:** `nzt-state` (`padEnd` en `folding` y `toggle-tasks`; `' '.repeat` en la cabecera
  de cada grupo; la barra `'━'.repeat(filled)`); `nzt-files` (`'─'.repeat(width)`, `:1421`);
  `nzt-changes` (`:799`); `nzt-questions` (`:298`); `nzt-hub` (`:185`).
- **Evidencia:** el ancho sale de `e.props.bodyColumns` contado en caracteres; en un `span`
  proporcional los espacios colapsan y los guiones no miden una celda. En escritorio, una
  regla es un `Box` con borde inferior, una fila clickeable es un `Box` con `flexGrow`, y una
  barra es un `Svg` o dos `Box` con `width` en porcentaje.

### H-03 · Barras de scroll y mapas de cambios dibujados con caracteres
- **Severidad:** 3: en `nzt-files` y `nzt-changes` es la manera de moverse por el archivo o el diff.
- **Tipo:** construcción.
- **Dónde:** `nzt-files` (pista `│`/`┃` y mapa, `:941-975`); `nzt-changes` (`█`/`│`, `:666-672`).
- **Evidencia:** cada fila de la pista es un `Button` de un carácter en un `Box width={1}`. La
  consola no tiene scroll propio para un panel y por eso los mods lo dibujan; la altura sale
  de `e.props.scroll.bodyRows`, que en escritorio son filas que la app estima. Se confirma con
  captura si la app ya dibuja su propio scroll y estas pistas sobran.

### H-04 · Cajas con `borderStyle="round"` y alto fijo en filas
- **Severidad:** 2: se lee, pero el marco no calza con el contenido.
- **Tipo:** construcción.
- **Dónde:** el marco de `nzt-files` (`:1040`), `nzt-changes` (`:777`), `nzt-questions`
  (`:302`), `nzt-hub` (`:194`), el bloque AHORA y el de inválidos de `nzt-state`.
- **Evidencia:** `height={height}` con `height = bodyRows - 1` fija un alto en filas que
  escritorio traduce a su altura de línea.

### H-05 · Columnas de ancho fijo para marcas, ids y números de línea
- **Severidad:** 2: las columnas quedan desparejas.
- **Tipo:** construcción.
- **Dónde:** `nzt-state` (`width={2}` para la marca, `idWidth`, `LABEL`); números de línea
  con `padStart` en `nzt-files` (`:991`) y `nzt-changes` (`:570`); sangría del árbol con
  `'  '.repeat(depth)` en `nzt-files` (`:1158`) y `nzt-changes` (`:561`).
- **Evidencia:** en escritorio una sangría hecha de espacios colapsa a uno solo; tiene que ser
  `marginLeft` o `paddingLeft`.

### H-06 · Arte de bloques en `nzt-hub`
- **Severidad:** 1: es decorativo.
- **Tipo:** construcción.
- **Dónde:** `BANNER` (`nzt-hub/hooks/register.tsx:21`).
- **Evidencia:** `█▄▀` en fuente proporcional no forma letras. En escritorio va un `Svg` o
  texto en negrita.

### H-07 · `nzt-look` ya tiene una rama de escritorio, a medias
- **Severidad:** 2: no está claro qué partes faltan sin verlo.
- **Tipo:** construcción.
- **Dónde:** banda (`register.tsx:701`, ya con `Svg`), filas de herramientas (`rows.tsx`),
  respuestas (`reply.tsx`), código (`code.tsx`), spinner (`:882`), el panel (`:948`). La
  barra de herramientas del prompt queda solo para consola (`:912`).
- **Evidencia:** 23 ramas `desktop`; las demás piezas usan los mismos supuestos de celdas que
  H-02 y H-05 (`'━'`, `padStart`, `.repeat` en `band.tsx`, `math.ts`, `mermaid.ts`). Es la
  que más depende de las capturas: hay que ver qué ya se ve bien.

### Lo que ya está bien
- `nzt-state` dibuja el personaje y los sombreritos con `Svg` fuera de la consola
  (`register.tsx:402-403`).
- `nzt-look` diferencia superficie en banda, filas, respuestas y código.
- Los botones se pasan como `Button` y no como texto clickeable: en escritorio ya son nativos.

## Criterio común para la rama de escritorio

Vale para los seis mods y es lo que cada unidad de build aplica. Lo de consola no cambia.

1. **Nada se alinea contando caracteres.** Sin `padEnd`, `padStart`, `.repeat` de espacios ni
   de guiones: el ancho lo da `flexGrow`, el espacio `gap`/`margin`, la regla es un borde.
2. **Lo que es gráfico es `Svg`:** barras de progreso, el banner, mapas de cambios.
3. **Sangría con `marginLeft`**, columnas con `width` en celdas solo para íconos de un glifo.
4. **El alto lo maneja la app:** sin alto fijo ni pista de scroll propia si la app ya scrollea
   el panel (a confirmar, H-03).
5. **Colores de la paleta y no de bordes de carácter**: un marco es `borderStyle` + `borderColor`
   o un fondo `surface`, como ya hace `nzt-look`.
6. **El panel se abre según `e.viewport`**, no según `presentation`, que describe una terminal.
7. Cada mod tiene un test que dibuja su componente en `['terminal', 'desktop']` (la forma que
   recomienda el kit de tests) para probar que la consola sigue igual.

## Pendiente

- **P-01 · Capturas (no corrido).** Hace falta ver cada mod en la app antes de construir su rama.
  **Decidido por el usuario el 2026-10-24:** activó Computer use; las capturas las saca el
  agente en una sesión nueva, que es donde llegan esas herramientas.
  **Intentado el 2026-10-24, bloqueado:** en la sesión nueva, `request_access` con la app
  "Claude" responde que Claude no puede recibir control de su propia ventana y que ese
  permiso no se concede nunca. Sin ese acceso el agente no puede escribir `/nzt-files` en la
  app ni abrir paneles, y la captura enmascara las ventanas no permitidas. QT-03 no se puede
  cumplir así.
  **QT-04 · Decidido por el usuario el 2026-10-24: cerrar sin capturas (opción B).** La 360
  cierra con la revisión por código. H-01 a H-07 quedan **no corridos**: ninguno se vio en
  pantalla. Cada unidad de build (361-366) confirma los hallazgos de su mod con sus tests,
  que dibujan el componente en `['terminal', 'desktop']` (criterio 7). La 367 (recorrido
  final) necesita capturas que saque el usuario, porque computer-use no controla la app.

## Decisiones

- **P-02 · Los paneles se abren en escritorio** (usuario, 2026-10-24, opción A). Si H-01 se
  confirma, el comando mira `e.viewport.isFullscreen` de la superficie que lo pide en lugar de
  `presentation.isFullscreen`. Es un cambio de comportamiento: cada unidad de build lo lleva a
  la spec de `nzt-files`, `nzt-changes` y `nzt-hub` con su marca de cambio.

## Vistos en la app

### H-08 · El hover de nzt-state titila en escritorio
- **Severidad:** 3: cada botón del panel parpadea bajo el puntero mientras algo brilla.
- **Tipo:** construcción, con una propuesta adentro (QT-05).
- **Dónde:** `nzt-state`, el brillo de Tu turno y de la unidad en curso (`register.tsx`, el
  reloj de `FRAME_MS` que escribe el átomo `glow`).
- **Evidencia:** visto por el usuario el 2026-10-24 con 0.10.0 ("cuando paso el mouse por algun
  boton … se ilumina y desilumina todo el tiempo … en la app de escritorio unicamente"), con
  `waiting_on` puesto. Mientras algo brilla, el reloj escribe `glow` cada 220 ms, y el
  render lo lee: el tipo de `$.state.set` dice que cada sitio que leyó el valor "are drawn
  again, at the redraw rate". En la terminal un redibujo solo cambia celdas; en escritorio se
  vuelve a mandar el árbol unas 4 veces por segundo, y es la causa probable del parpadeo. No
  verificado en el código de la app.
- **También visto:** la captura muestra el panel bien acomodado (filas sin rellenos, barra de
  avance, AHORA, personaje). El valor de Delegar (`ask`) queda un poco corrido respecto de
  Plan y Modo: es el botón, que en escritorio trae su propio margen.

### H-09 · La app no colorea el texto de un botón
- **Severidad:** 2: todo botón que se pinta para decir algo (Tu turno en amarillo, Ver tareas y
  Notas en el acento, cada fase en su color, el modo de Delegar) sale en el color de la app.
- **Tipo:** construcción.
- **Dónde:** todos los mods que ponen `Text` con `color` dentro de un `Button`.
- **Evidencia:** la captura del usuario del 2026-10-24: Ver tareas, Notas para retomar y `ask`
  van en `claude` en el código y se ven en el color del texto; lo que no es botón (AHORA · Build)
  sí lleva su color. El tipo de `ButtonProps` dice que el escritorio dibuja "its native button"
  aunque sea `plain`. El usuario lo vio en Tu turno: no se ilumina en amarillo.
- **Cómo se trata:** lo que tiene que verse en color no va dentro de un botón. QT-06 (usuario
  2026-10-24) eligió primero "Título fuera del botón" con la flecha como botón; al verlo, el
  usuario objetó que la flecha sola es un blanco chico, y se cambió a la opción A: el texto que
  brilla es una región (`Client`) que toma el clic ella misma (`onPointer`, `onKey`). Que la app
  le mande el clic está documentado en el tipo, no visto. Cada unidad de build lo revisa en su mod.

### H-10 · nzt-look: las tablas de una respuesta se arman como grilla de consola
- **Severidad:** 3: toda respuesta con tabla; una celda larga parte la fila y desarma las columnas.
- **Tipo:** construcción.
- **Dónde:** `nzt-look`, `reply.tsx` (`drawTable`), y `drawPairs` por lo mismo.
- **Evidencia:** captura del usuario del 2026-10-24: la tabla de "Quedan seis unidades" con `│`,
  el fondo de la paleta y la fila de la 362 partida en dos líneas que no respetan las columnas.
- **Cómo se trata:** QT-07 (usuario, 2026-10-24): una grilla propia del mod, cada celda una caja
  en la parte de la fila que pide su columna, con la banda de cabecera, la cebra, Copiar y el plegado.

### H-11 · nzt-look: el código en escritorio no va en fuente monoespaciada
- **Severidad:** 2: la sangría y los números de línea no se alinean.
- **Tipo:** construcción.
- **Dónde:** `code.tsx` (`drawCode`); los diagramas y las fórmulas ya usan `mono`.
- **Evidencia:** leído en el código; no visto en la app.

### H-12 · nzt-look: la variante oscura no oscurece la app
- **Severidad:** 3: con la app en claro, elegir NZT oscuro deja islas oscuras y texto claro sobre
  fondo claro.
- **Tipo:** propuesta (QT-08): cambia de qué depende el color en escritorio. **Decidido:** opción A
  (usuario 2026-10-24): en la app, la variante del sistema; los temas, copiados solos a `/theme`.
- **Dónde:** `look()` y `variantOf` (`light.ts`); cada dibujo pinta con hex de la paleta.
- **Evidencia:** visto por el usuario el 2026-10-24 ("seteando nzt y variante oscura no veo en
  modo oscuro el theme"). El mod pinta solo lo que dibuja, con colores fijos; el fondo, la prosa
  y el resto de la ventana son de la app. Los tipos no traen ningún dato del modo claro u oscuro
  de la app de escritorio (buscado: `colorScheme`, `appearance`). El mod sí puede cambiar el
  `theme` de Claude Code (`$.config.set`, documentado) y ya trae NZT oscuro y claro para `/theme`;
  que la app de escritorio siga ese `theme` **no está verificado**.
- **QT-08 · Pedido del usuario (2026-10-24):** que elegir un tema en el mod cambie el tema de la
  app, en consola y en escritorio, con los temas copiados solos a `/theme`.
- **Observado (2026-10-24, Claude Code 2.1.310, mod de prueba con `$.config.list`):** la opción
  `theme` es `choice` con `auto`, `dark`, `light`, `light-daltonized`, `dark-daltonized`, `light-ansi`
  y `dark-ansi`, aunque NZT oscuro y claro están en `~/.claude/themes/`. `$.config.set` no puede
  elegir un tema propio: confirma lo observado con 2.1.303 (spec de nzt-look, QT-02).

### H-13 · nzt-look: en la app, la variante del sistema no es la de la app
- **Severidad:** 3: con Windows en claro y la app en oscuro, todo lo que dibuja el mod sale con la
  paleta clara sobre fondo oscuro; el "8%" del contexto casi no se lee.
- **Tipo:** error de la opción A de QT-08: suponía que la app se ve clara u oscura como el sistema.
- **Dónde:** `look()` en `register.tsx`, que en la app tomaba la variante del sistema e ignoraba
  la elegida en el panel.
- **Evidencia:** captura del usuario del 2026-10-24 con NZT oscuro elegido: banda opaca, "8%" casi
  negro. `AppsUseLightTheme` = `0x1` (Windows en claro) y la app en oscuro. Claude Skins 0.5.11
  (leído en su código, no instalado) decide igual (`SKINS_THEME`, `theme`, `COLORFGBG`, sistema) y
  tampoco lee el modo de la app: su salida es forzar la variante.
- **QT-09 · Decidido por el usuario (2026-10-24): A + B.** A: en la app manda la variante elegida
  en el panel, como en la terminal, y el sistema solo en `auto`. B: el porcentaje del contexto,
  mientras está bajo, va sin color propio, en el de la app, como ya iban los límites.

### H-14 · nzt-look: en la app, la banda no muestra cuándo se reinician los límites
- **Severidad:** 2: el reinicio se ve en la terminal y no en la app; tampoco los tokens ni el costo.
- **Tipo:** construcción, con una propuesta adentro (QT-10).
- **Dónde:** `bandModelOf` (`band.tsx`): recorta por ancho en caracteres de terminal contra
  `bodyColumns`, en las dos superficies, y la cuenta regresiva es lo segundo que saca.
- **Evidencia:** visto por el usuario el 2026-10-25 en la app; su captura del 2026-10-24 ya mostraba
  la banda sin tokens, sin reinicios y sin costo. Qué valor pasa la app en `bodyColumns` no está
  medido: los tipos lo describen solo para la terminal.
- **QT-10 · ¿Cómo se muestra el reinicio en la app?** Opciones: al lado del porcentaje como en la
  terminal, con la banda bajando a una segunda línea si la ventana es angosta (recomendada);
  debajo del porcentaje, en chico. **Decidido por el usuario (2026-10-25): al lado, como en la
  terminal.** En la app la banda no recorta nada y se parte en dos líneas si no entra.

### H-15 · nzt-files en la app (captura del usuario, 2026-10-25)
Visto con `/nzt-files` abierto en el panel lateral de la app, archivo C# elegido:
- **H-01 confirmado:** el comando dice "Explorador abierto sobre el prompt … solo en pantalla
  completa" con el panel al costado.
- **H-02 confirmado:** la regla `─` hasta el ancho parte en dos líneas.
- **Doble marco:** la app ya pone pestaña "Archivos" con ✕; el mod suma su marco naranja, su título
  "NZT Archivos" y un botón Cerrar.
- **Búsqueda:** el campo queda de unos 70 px ("Buscar (s" cortado) y su botón de enviar sale como un
  cuadrado gris vacío (`submitLabel=" "`).
- **Teclas como fichas:** cada `hotkey` sale como una ficha (`S`, `G`, `D`, `P`, `A`, `C`, `O`).
- **Código C#:** en fuente proporcional, las líneas largas se parten y el número queda centrado al
  costado; se ven 12 líneas y un hueco grande debajo antes de "líneas 1–12 de 121", porque la
  ventana se calcula en filas de terminal (H-04).
- **Ya bien:** la sangría del árbol (no colapsó), los íconos ▸ ▾, el resaltado de la fila elegida,
  los colores del C#.
- **QT-11 · Decidido por el usuario (2026-10-25):** en la app, sin marco, sin el título "NZT
  Archivos" y sin Cerrar: la pestaña de la app ya los pone. La línea de repo y rama queda arriba.
- **QT-12 · Decidido (2026-10-25):** en la app los botones van sin la ficha de su tecla. En la
  consola se siguen viendo. **Corregido al construir:** la opción decía que las teclas seguían
  andando, y no: la API no tiene evento de tecla y la tecla de un botón es su `hotkey`, que el
  escritorio dibuja como ficha. Sin ficha, en la app no hay tecla; se usa el mouse.
- **QT-13 · Decidido (2026-10-25):** en la app el código va en mono, una línea por fila, cortada al
  ancho; Ampliar lo muestra a lo ancho.

### H-16 · nzt-files en la app: sin barra de scroll y sin scroll (usuario, 2026-10-25, con 0.3.0)
- **Severidad:** 4: un archivo de más de una pantalla no se puede recorrer con la rueda.
- **Tipo:** construcción; la causa está sin confirmar.
- **Dónde:** `scrollBar` (pista de una celda con un `Button` por fila) y el hook `ui.scroll`.
- **Evidencia:** el usuario no ve la barra y la rueda no mueve nada. El panel dibuja un árbol
  exactamente tan alto como el cuerpo y mueve la ventana él mismo en `ui.scroll`; en la consola la
  rueda llega igual. Los tipos no dicen si la app manda `ui.scroll` cuando el árbol entra en el
  cuerpo, ni cómo dibuja un `Button` plano de un carácter en una caja de ancho 1. No verificado.
- **Respuesta del usuario (2026-10-25):** ▲ y ▼ mueven el código, pero no quiere que esa sea la
  manera. **Arreglo (0.3.0):** en la app el panel es una fila más alto que el cuerpo, para que la
  app tenga algo que desplazar y le pase la rueda al hook, que mueve la ventana él mismo; la barra
  es una columna de bloques de color (el pulgar en el acento) y el mapa de cambios igual. Que la app
  mande la rueda así **no está verificado**: lo confirma el usuario en la app.

### H-17 · nzt-files en la app: dos vistas apiladas en un panel no se usan bien (usuario, 2026-10-25)
- **Visto en su captura con el arreglo de H-16:** la barra de bloques se ve (pulgar naranja), pero
  la app suma su propia barra al panel entero por la fila de más, y árbol y archivo compiten por la
  rueda. El C# en la app parte las líneas largas y pierde la sangría (un `Text` por token).
- **Pedido del usuario:** el archivo, en lugar de abajo como en la consola, en un panel aparte que
  se abra solo al elegir un archivo y que se pueda cerrar, para que cada uno tenga su scroll.
- **Lo que permite la API (tipos de 2.1.310):** un mod abre varios paneles, uno por `id`; la app los
  pone en su panel lateral, en pestañas (`placement` es solo `dock` o `inline`). **No hay forma de
  elegir el lado**: a la izquierda no se puede. Por la captura, se ve una pestaña a la vez.
- **QT-14 · ¿Cómo se ve el archivo en la app?** Opciones: una pestaña propia por el archivo
  elegido, con su ✕, scroll de la app y el código en el `Code` de la app (recomendada); el archivo
  ocupa la pestaña Archivos con un botón para volver al árbol. **Decidido por el usuario
  (2026-10-25): pestaña propia.**
- **Cómo se construye (363):** en la app, la pestaña Archivos es solo el árbol (con búsqueda, git y
  la línea de repo), dibujado entero para que lo scrollee la app; elegir un archivo abre un segundo
  panel (`id` propio, título el nombre del archivo) con detalle, herramientas y el contenido entero
  (tope actual de líneas) en `Code` o `Markdown`, scroll de la app; su ✕ lo cierra. Se van en la
  app la fila de más y la barra en bloques de H-16, el C# propio y ▲ ▼. La consola no cambia.
- **Usuario (2026-10-25):** *"las flechas hacia abajo y hacia arriba en la app de escritorio no las
  quiero no van, es todo por scroll"*: en la app ni ▲ ▼ ni barra propia; todo con el scroll de la app.
- **Construido (0.4.0, 2026-10-25):** como dice el plan de arriba. Además, decisiones propias de la
  unidad: elegir otro archivo reutiliza la pestaña con el nombre nuevo; cerrar la pestaña del
  archivo deja el árbol sin archivo elegido; cerrar Archivos cierra las dos (sola, la del archivo
  dejaría de seguir el disco); un archivo de más de 100.000 caracteres muestra sus primeras líneas
  enteras y el detalle dice cuántas; el código, el C# incluido, va cortado al ancho (QT-13). La
  rueda llega a la app porque el hook de scroll la deja pasar cuando el árbol es más alto que el
  cuerpo, que en la consola no pasa nunca. **Sin ver en la app.**

### H-18 · nzt-files frente al explorador propio de la app (captura del usuario, 2026-10-25)
- **Pedido del usuario:** *"podemos mejorar el nuestro asi se ve asi en la app de escritorio y es
  mas facil y lindo"*, con la captura del explorador que la app ya trae (botón de archivos).
- **Lo que muestra la captura:** arriba, un solo campo de búsqueda a lo ancho con lupa; filas de
  peso normal con chevron › ⌄ en las carpetas e ícono de contorno por tipo de archivo, sin `/` ni
  columnas a la derecha; la fila elegida con fondo redondeado. El archivo, en una pestaña con su
  nombre y ✕, con migas (`specs \ mods \ nzt-files \ spec.md`), un botón `</>` arriba a la
  derecha para ver fuente o dibujado, y el Markdown dibujado a lo ancho.
- **Lo que deja la API (tipos de 2.1.308, la app es 2.1.310):** `Svg` en la app para íconos de
  contorno; `Box` con `hover.backgroundColor` para el fondo bajo el puntero; `Text` con `size` y
  `weight`; espaciados por paso (`xs`, `sm`), que la app mide a su escala. **No deja:** esquinas
  redondeadas (`Box` no tiene radio): el fondo de la fila elegida queda recto. Y por H-09, el
  texto adentro de un `Button` sale en el color de la app: el color de actividad y de git va
  afuera del botón (punto o letra). No verificado: un `Svg` adentro de un `Button`.
- **Lo que el nuestro tiene y el de la app no:** marcas de git y líneas cambiadas, los colores de
  lo que Claude lee y escribe, ± Cambios, el archivo como diff, abrir con la app del sistema.
- **QT-15 · ¿En la app seguimos con el explorador nuestro?** Opciones: parecerse al de la app sin
  perder lo propio (recomendada); en la app no abrir el nuestro y dejar el de la app.
- **QT-16 · ¿La columna de fecha o tamaño va en la app?** Opciones: en la app solo la marca de
  git a la derecha, como el de la app (recomendada); dejarla como está.
- **QT-17 · ¿Dónde van ± Cambios, Desplegar y Plegar en la app?** Opciones: íconos chicos a la
  derecha de la búsqueda, con su nombre al pasar el mouse (recomendada); una fila de texto debajo
  de la búsqueda.
- **QT-18 · ¿Cómo van las herramientas de la pestaña del archivo?** Opciones: migas arriba y
  `</>`, copiar y abrir como íconos a la derecha (recomendada); los botones de texto de hoy.
- **Decidido por el usuario (2026-10-25), las cuatro recomendadas:** QT-15 parecido al de la app
  sin perder lo propio; QT-16 en la app solo la marca de git (y las líneas ±) a la derecha;
  QT-17 íconos junto a la búsqueda; QT-18 migas e íconos en la pestaña del archivo.
- **Construido (0.5.0, 2026-10-25), con lo que se vio al construir:** un `Button` solo acepta texto
  adentro (los tipos rechazan otro elemento), así que los íconos que se tocan son glifos (`±`,
  `⊞`, `⊟`, `</>`, `⧉`, `↗`) en botones nativos, y los `Svg` (lupa, tipo de archivo) van afuera del
  botón. El nombre de cada ícono aparece en una etiqueta del acento con el patrón de `hover` de los
  tipos. Fondo de la fila elegida y del hover: gris con transparencia, porque el mod no sabe el
  tema de la app. **Sin ver en la app:** si la app acepta ese color con transparencia, y cómo se
  ven los íconos y la etiqueta.

### H-19 · nzt-files 0.5.0 en la app: las carpetas no se distinguen (captura del usuario, 2026-10-25)
- **Usuario:** *"no me gusta como se ve, como que no sabes que son carpetas y se ve horrendo"*;
  pide que se vea como el explorador de la app, **sin Desplegar todo ni Plegar todo**, dejando
  **Abrir** y **Solo lo cambiado**, y con la **flecha en cada carpeta que cambia al abrirse**.
- **Visto en su captura:** las carpetas sin flecha; los íconos ± ⊞ ⊟ salen como botones con
  texto ("Solo lo cambiado", "Desplegar todo", "Pleg…" cortado); los archivos sí con su ícono.
- **Causa:** la app dibuja el `label` de un `Button` en lugar de sus hijos. La fila llevaba
  `label` con el nombre, y la flecha, que era un hijo, no se dibujó; los íconos llevaban `label`
  con su nombre. Corrige lo anotado en H-18 sobre el nombre al pasar el mouse.
- **Arreglo (0.5.1):** la fila sin `label` (su dirección es su `key`), con la flecha › ⌄ adentro
  del botón para que tocarla abra la carpeta; filas más altas y con margen, como las de la app;
  sin Desplegar ni Plegar en la app; Solo lo cambiado y las herramientas del archivo como
  botones de texto, sin la etiqueta de hover.

### H-20 · nzt-files 0.5.1 en la app: el C# perdió los colores de Visual Studio (usuario, 2026-10-25)
- **Usuario:** *"Genial, ademas los archivos de codigo ya no se ven como se veian antes los .cs que
  era con el theme de codigo de visual studio"*.
- **Causa:** el plan de H-17 pasó todo el código de la pestaña del archivo al `Code` de la app, el
  C# incluido; eso dejó afuera RN-files-colores-cs, una regla que el usuario había pedido. Error
  del plan, no una decisión del usuario.
- **Arreglo (0.5.2):** en la pestaña del archivo el C# vuelve a los colores del mod, en fuente
  mono, una fila por línea cortada al ancho (QT-13). Los espacios van como espacios duros para que
  la app no junte la sangría, que era lo que se perdía en H-17. El resto de los lenguajes sigue con
  el resaltado de la app, como antes en la consola. Un C# cambiado sigue como diff. Tope: lo que la
  app dibuja de una vez (100.000 caracteres de texto por árbol, `reference.md` de 2.1.308).

### H-21 · nzt-files 0.5.2 en la app: la fila se ilumina entera pero solo abre en el nombre (capturas del usuario, 2026-10-25)
- **Usuario:** *"cuando le paso el mouse por arriba se ilumina toda la fila [...] pero solo deja
  abrirlo clickeando en el titulo"*; en el explorador de la app *"cuando lo clickeo en cualquier
  largo lo abre"*, y *"la flecha esta mejor centrada y se mantiene en su posicion cuando se abre"*.
- **Visto en sus capturas:** el botón nativo dibuja su propio resaltado alrededor del nombre
  ("specs"); la flecha › cerrada y ⌄ abierta no ocupan lo mismo, y ⌄ queda más baja y corrida.
- **Causa:** el clic lo toma el `Button`, que solo cubre su texto y no acepta ancho ni `flexGrow`;
  un `Box` no tiene `onPress` (tipos de 2.1.296). Las dos flechas son dos caracteres distintos.
- **Arreglo (0.5.3):** en la app cada fila es una región propia (`Client`, `row-live.tsx`, como
  Tu turno en nzt-state, H-09) que ocupa el resto de la fila y toma el clic en todo su ancho, y
  Enter o espacio cuando tiene el foco. La flecha va en una columna fija de dos celdas, y es
  la misma figura girada (ᐳ ᐯ). El ícono del archivo queda fuera de la región porque una región
  no dibuja `Svg`: un clic justo sobre el ícono no abre el archivo. Como ya no es un botón, las
  marcas de git y el punto de actividad conservan su color dentro de la región.

### H-22 · nzt-files 0.5.3 en la app: el archivo cambiado se ve como diff crudo y la barra no marca los cambios (captura del usuario, 2026-10-25)
- **Usuario:** *"los cambios de GIT que no se ven pintados se ven asi raros y ademas la barra no
  indica donde estamos parados donde hubo creaciones eliminaciones"*, como los marca el diff de
  Visual Studio, para saber hasta dónde bajar.
- **Visto en su captura (`Plan/state.json`):** el `Code` de la app con `format: 'diff'` dibuja el
  diff unificado tal cual: la cabecera `@@ -1,22 +1,77 @@`, cada línea con su `+` o `-` y el texto
  en verde o rojo, sin fondo de línea ni números.
- **Lo que permite la API (tipos de 2.1.308, `plugin-authoring`):** un `Box` puede ser
  `position: "absolute"`, pero contra su padre y dentro de lo que se desplaza; no hay elemento
  fijo ni marcas en la barra de la app. Una región `Client` no recibe la rueda (solo `down`,
  `move`, `up`, `enter`, `leave`). Mover el archivo el mod mismo ya falló en la app (H-16) y el
  usuario lo descartó (H-17: *"es todo por scroll"*).
- **QT-19 · ¿Cómo se marca en la app dónde están los cambios?** Abierta. El usuario preguntó por
  qué no en la barra, si en la consola se ve así: en la consola la barra es del mod, que mueve el
  archivo él mismo; en la app la barra es de la app y la API no la deja pintar. Con el archivo ya
  en su pestaña, la barra propia no compite con el árbol por la rueda, que era lo que fallaba en H-17.
  **Decidido por el usuario (2026-10-25): barra propia, a prueba.** En la pestaña del archivo el
  mod lo mueve con la rueda y dibuja su barra con el pulgar y el mapa de cambios, como la consola;
  si en la app no anda, se vuelve atrás. Reemplaza, solo para esa pestaña, el *"todo por scroll"*
  de H-17.
- **Arreglo (0.5.4):** en la pestaña del archivo, un archivo cambiado se pinta línea por línea,
  en mono, con su número: la agregada sobre verde y la borrada sobre rojo, sin `@@` ni `+` `−`.
  Lo mueve el mod: la rueda llega al hook, que no la pasa a la app. A la derecha, una región
  propia (`bar-live.tsx`) dibuja el pulgar y el mapa de cambios (verde, rojo, azul si hay las dos
  cosas) y toma el clic y el arrastre. Un archivo sin cambios y un Markdown dibujado siguen con el
  scroll de la app. Riesgos: que la app no mande la rueda cuando el contenido entra (H-16), y la
  cabecera supuesta en 5 filas.
- **Visto por el usuario en la app (0.5.4):** las líneas pintadas, bien (*"Perfecto!"*); pero *"no
  puedo scrollear con el scroll del mouse si o si tengo que clickear la barra [...] es muy dificil y
  feo [...] no se siente fluido"*. Confirma H-16: la app no le pasa la rueda a una pestaña cuyo
  contenido entra en ella.
- **Vuelta atrás (0.5.5), como se acordó en QT-19:** sin barra propia; el archivo cambiado sigue
  pintado, entero, y lo desplaza la app. Dónde están los cambios queda sin marcar en la app.
- **QT-20 · ¿Algo que marque dónde están los cambios, con el scroll de la app?** Opciones: un mapa
  arriba del archivo, clickeable, que salta a cada cambio y se va al bajar; o nada más que las
  líneas pintadas. **Decidido por el usuario (2026-10-25): mapa arriba.**
- **Arreglo (0.5.6):** sobre el archivo cambiado, una región propia (`map-live.tsx`) dibuja el
  archivo en 60 tramos a lo ancho, con el color del cambio que cae en cada uno; un clic le pide a la
  app, con `$.ui.scroll`, que traiga al medio esa línea pintada. El scroll sigue siendo de la app.
- **Visto por el usuario en la app (0.5.6):** *"No sirve el mapa arriba de cambios, hay que quitarlo"*.
  Sacado. Además, con capturas: un archivo cambiado pintado línea por línea **perdió el estilo de
  código** (sin colores de sintaxis ni el marco del bloque de código de la app); *"si tiene codigo
  deberia ser como la 2da imagen"*, la de un archivo sin cambios en el `Code` de la app.
- **Lo que permite la API (tipos de 2.1.308):** `Code` toma `source`, `language`, `path`,
  `startLine`, `format` (`source` o `diff` crudo) y `wrap`: no marca ni pinta líneas sueltas. El
  mod solo colorea sintaxis de C# (`csharp.ts`).
- **QT-21 · ¿Cómo se ve en la app un archivo cambiado?** Opciones: como un archivo sin cambios, en el
  `Code` de la app; por tramos (bloques de la app y líneas pintadas entre ellos); o el archivo en
  el `Code` con una columna de marcas al lado. **Usuario (2026-10-25):** *"me gustaria que se vea
  el color del codigo o que se vea como el git diff en visual studio"*. **Decisión propia de la
  unidad, sobre lo que dijo:** el diff de Visual Studio conserva los colores, así que el pintado
  sin colores no lo cumplía. Un C#, que el mod colorea, va como el diff de Visual Studio (colores
  y fondos); cualquier otro lenguaje, en el `Code` de la app como uno sin cambios, con `+N` `-M`
  en el detalle. Se cambia si el usuario lo prefiere de otro modo.
- **Arreglo (0.5.7):** sin el mapa (`map-live.tsx` borrado), y lo de QT-21.

### H-23 · nzt-changes en la app: leído en el código antes de construir (unidad 364, 2026-10-25)
- **Sin ver en la app.** El panel es la consola entera: marco naranja con `NZT Cambios`, Cerrar y
  fichas de tecla (H-15); alto fijo en filas (H-04); el índice y el diff en ventanas que mueve el
  mod con la rueda, más ▲ ▼ y la regla de cambios en caracteres (H-03, H-16); la regla `─` hasta el
  ancho (H-02); sangría y números con espacios (H-05); el diff en el `Code` de la app con
  `format: 'diff'`, que en la app sale crudo con `@@` y `+` `−` (H-22); el nombre de cada paso y
  las vistas Turno y HEAD coloreados dentro de un botón (H-09); y el aviso de pantalla completa al
  abrir (H-01).
- **Visto en la captura del usuario (2026-10-25, 0.5.0):** confirmado todo lo anterior. El aviso de
  pantalla completa sale con el panel al costado; marco naranja, `NZT Cambios`, Cerrar y fichas
  (`T`, `H`, `K`, `J`, `P`, `N`, `C`); la regla `─` parte en dos líneas; el diff sale crudo
  (`@@ -448,1 +448,16 @@`, `+` al comienzo de cada línea, todo en verde) y la app parte las líneas
  largas, así que 16 líneas del diff ocupan toda la altura; la regla de cambios a la derecha se ve
  como una columna de barras verdes junto a la barra propia del bloque de código de la app; la
  ruta larga se corta al final y esconde el nombre del archivo.
- **Lo que se aplica por lo ya decidido en nzt-files:** sin marco, título ni Cerrar (QT-11); sin
  fichas de tecla (QT-12); todo con el scroll de la app, sin ▲ ▼ ni barra propia (H-17, *"es todo
  por scroll"*); sin el aviso (P-02); filas que toman el clic en todo su largo (H-21).
- **QT-22 · ¿Cómo se ordena el panel en la app?** Opciones: una sola pestaña con arriba las vistas
  y Anterior / Siguiente, después el índice entero y debajo el diff entero del paso, todo con el
  scroll de la app (recomendada); o el índice en la pestaña Cambios y el diff del paso en una
  pestaña propia, como el archivo de nzt-files.
- **QT-23 · ¿Cómo se ve el diff en la app?** Opciones: pintado línea por línea en mono, con su
  número, la agregada sobre verde y la borrada sobre rojo, sin `@@` ni `+` `−`, y el C# con los
  colores de Visual Studio, como el C# cambiado de nzt-files (recomendada); o el `Code` de la app
  con el diff crudo.
- **Decidido por el usuario (2026-10-25), las dos recomendadas:** QT-22 una sola pestaña; QT-23
  el diff pintado como el de Visual Studio.
- **Construido (0.6.0):** lo de arriba. Decisiones propias de la unidad: el nombre del archivo en
  negrita y su carpeta debajo, porque en la captura la ruta larga se cortaba y escondía el nombre;
  entre dos tramos del diff, una fila `⋯`; los lenguajes que no son C# van pintados sin colores de
  sintaxis. **Sin ver en la app.**

### H-24 · nzt-questions 0.2.0 en la app (captura del usuario, 2026-10-25, unidad 365)
- **Visto:** marco naranja con `NZT Preguntas` y `Cerrar` (H-15); las reglas `─` parten en dos
  líneas (H-02); alto fijo en filas: entre los campos y los botones queda más de media pestaña
  vacía (H-04); cada botón con la ficha de su tecla (`P`, `N`, `S`, `A`, `C`); la línea de teclas
  (*"Tab recorrer · Enter elegir…"*) se encima con *"Revisar y llevar al prompt ›"* y no se lee
  ninguna de las dos; `Ir a la lista` mueve el foco entre la lista y la respuesta, que sin teclas
  en la app no sirve. La pregunta, el campo `Tu respuesta` y `Nota` con su `guardar` se leen bien.
- **Lo que se aplica por lo ya decidido:** sin marco, título ni Cerrar (QT-11); sin fichas ni
  línea de teclas (QT-12); todo con el scroll de la app (H-17); filas de la lista y opciones que
  toman el clic en todo su largo y conservan sus colores (H-09, H-21); la acción principal como
  botón principal de la app.
- **Construido (0.3.0):** lo de arriba. Decisión propia de la unidad: en la app no está `Ir a la
  lista`, porque solo mueve el foco del teclado. **Sin ver en la app.**

### H-25 · nzt-hub 0.4.1 en la app (captura del usuario, 2026-10-25, unidad 366)
- **Visto:** el aviso de pantalla completa con el panel al costado (H-01); marco naranja y `Cerrar`
  con su ficha `C` (H-15); la regla `─` parte en dos líneas (H-02); alto fijo con más de un tercio
  de la pestaña vacía (H-04); las descripciones y el `Abrir ›` de Aspecto se salen por la derecha
  y se cortan (`Abı`); `Abrir ›` sin su fondo de color (H-09). **Contra H-06:** el banner de
  bloques sí forma las letras NZT en la app.
- **Construido (0.5.0):** sin marco, regla ni Cerrar, sin fichas, todo por scroll; banner como en
  la consola; una franja de color por mod en lugar de la barra `┃`, para que acompañe la
  descripción partida en líneas; `Abrir ›` y `⧉ Copiar instalación` como botones de la app.
  Decisiones propias de la unidad, por lo ya decidido en nzt-files. **Sin ver en la app.**

### Pendiente de ver en nzt-look
Por H-09, todo `Button` con color adentro sale en el color de la app: las filas de herramientas
(`rows.tsx`), y en el panel `/nzt-look` los botones de variante, de palabras y de cada color
(`panel.tsx`), donde la muestra de color es lo que se elige. Falta verlo en la app.

## Seguimiento por mod

| Mod | Unidad | Hallazgos atendidos | Cómo se comprobó | Visto en la app |
|---|---|---|---|---|
| `nzt-look` 0.8.0 | 362 | H-10 (tablas), H-11 (código en mono), H-12 (temas copiados solos), H-13 (en la app manda la variante elegida; el % bajo del contexto en el color de la app), H-14 (la banda en la app no recorta: reinicios, tokens y costo) | 198 tests; los de escritorio fallan sin el cambio | sí: el usuario lo vio el 2026-10-25 ("perfecto"): variante, banda con reinicios en dos líneas y sin botón limpiar; la tabla y el panel no aparecen en su captura |
| `nzt-files` 0.5.7 | 363 | H-01 (aviso del comando), H-02 y H-04 (en la app no hay regla ni alto de borde), H-15 (QT-11 a QT-13: sin título ni Cerrar, sin fichas de teclas, búsqueda ancha), H-16 y H-17 (QT-14: árbol entero en su pestaña con el scroll de la app; el archivo en una pestaña propia, entero, en el código de la app; sin ▲ ▼ ni barra propia), H-18 y H-19 (QT-15 a QT-18 y el pedido del usuario: el aspecto del explorador de la app, flechas en las carpetas, sin Desplegar ni Plegar), H-20 (el C# con los colores de Visual Studio en la pestaña del archivo), H-21 (la fila entera clickeable, la flecha fija), H-22 (el archivo cambiado como código, el C# como el diff de Visual Studio; la barra propia y el mapa se probaron y se sacaron) | 142 tests y `validate` (`tsc` no corrió: falta el compilador); el de la rueda falla sin el cambio | en parte: el usuario vio el explorador de 0.5.2 ("Genial"); cerrada por el usuario el 2026-10-25 con 0.5.7 (*"cerremoslo aca, porque el explorador de archivos que nos da la app ya esta bastante bien"*); no vio el C# ni la fila de 0.5.7: quedan para la 367 |
| `nzt-changes` 0.6.0 | 364 | H-01 (aviso del comando), H-02 a H-05 (sin regla, sin alto ni marco, sin ventanas ni regla de cambios, sin sangría con espacios), H-09 (vista actual como botón principal; filas como región propia), H-22 (diff pintado como el de Visual Studio, QT-23), QT-22 (una pestaña, todo por scroll) | 95 tests en terminal y escritorio y `validate` (`tsc` no corrió: falta el compilador); los de escritorio no se corrieron contra 0.5.0 | sí: el usuario lo recargó y lo aprobó el 2026-10-25 (*"perfecto lo apruebo"*) |
| `nzt-questions` 0.3.0 | 365 | H-02 y H-04 (sin reglas, alto ni marco), H-09 y H-21 (filas y opciones como región propia, con sus colores), H-24 (sin fichas, línea de teclas ni `Ir a la lista`; la acción como botón principal) | 33 tests en terminal y escritorio y `validate` (`tsc` no corrió) | sí: el usuario lo recargó y lo aprobó el 2026-10-25 (*"perfecto"*) |
| `nzt-hub` 0.5.0 | 366 | H-01, H-02, H-04, H-09, H-25 (desborde a la derecha); H-06 descartado: el banner se ve bien | 24 tests en terminal y escritorio y `validate` (`tsc` no corrió) | sí: el usuario lo recargó el 2026-10-25 (*"Genial se ve bien"*) |
| `nzt-state` 0.10.0 | 361 | H-02 (filas rellenadas, línea de avance), H-05 (anchos fijos), H-08 (el brillo redibujaba el panel), H-09 en Tu turno y la unidad en curso | 62 tests en terminal y escritorio; los de escritorio fallan sin el cambio | sí: el usuario lo vio andar el 2026-10-24 (acomodo, hover, Tu turno amarillo y clickeable) |
