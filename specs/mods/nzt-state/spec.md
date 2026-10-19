# Mod · nzt-state — panel del plan y el estado

> Estado: **construido**, versión 0.6.0 (aviso de fase que NZT no conoce, unidad 271, sin
> aceptar), en `mods/nzt-state/` (B-01 a B-04 e idioma en las
> unidades 84 a 88; fases plegables y personajes en 91 a 95; aviso de varias fases en curso
> en la 164; Plan y Modo al lado del personaje en la 166; aviso de preguntas abiertas,
> RN-panel-preguntas y -preguntas-espera, aprobado en la 202, construido en la 209 y aceptado
> por el usuario tras probarlo en vivo el 2026-10-17, unidad 210) · Depende de: `specs/nzt-mods.md`,
> `specs/nzt-core.md` sección 7 (formato de `Plan/state.json`), D61 y D62.
> Escrita el 2026-10-13 leyendo el código; los hallazgos R-01 a R-08 los resolvió el usuario
> el 2026-10-14 (sección **Hallazgos resueltos**).

## Qué resuelve

El plan y el avance de una corrida de NZT viven en `Plan/state.json`. Para saber dónde
está la corrida hay que abrir el archivo o preguntarle al agente, y en una corrida
autónoma el usuario no ve qué unidad está corriendo ni cuántas faltan. El panel muestra el
estado en vivo, al costado de la conversación, sin que nadie tenga que pedirlo.

## Alcance

**Adentro**
- Un panel lateral en Claude Code, llamado **Estado** (State en inglés; RN-mod-pestaña de
  `specs/nzt-mods.md`), que muestra el `Plan/state.json` del
  proyecto en el que está abierta la sesión.
- Si el plan está aprobado, el modo (acompañado o autónomo, y en autónomo la tanda con su
  avance y las paradas que se mantienen), la línea de fases, el objetivo, el porcentaje de
  avance, hace cuánto se actualizó y lo que se está esperando.
- La unidad en curso con su detalle. Las pendientes agrupadas por fase, y las hechas, las
  descartadas y las notas (**Notas para retomar**, lo que una sesión nueva necesita para seguir) en secciones que se pliegan.
- El comando `/nzt-state`, que abre el panel.
- La lectura de los tres formatos del estado: el actual (D62), el de D61 y el anterior con
  `phase`.
- Los avisos de un estado que rompe el formato del kernel: un estado inválido, más de una
  unidad en curso, más de una fase en curso, una tanda que nombra unidades que no existen.
- Español e inglés.
- Las fases plegables dentro de cada sección, y la identidad de cada fase: su color, su
  personaje animado y su sombrero en miniatura.

**Afuera**
- **Editar o corregir el estado desde el panel.** El panel solo lee
  (`RN-mod-lee-no-escribe` de `specs/nzt-mods.md`); avisa lo que está mal y no lo arregla.
- **Codex.** Un mod es solo de Claude Code (D63).
- **Otros artefactos**, como specs, historias o el glosario. El panel lee únicamente
  `Plan/state.json`. Las preguntas abiertas no las busca en los documentos: toma la
  cuenta que da `nzt-questions` (RN-panel-preguntas), que es el mod que las lee.
- **Historial de corridas.** Una corrida nueva reescribe el estado (D62), y el panel
  muestra solo la corrida actual.
- **Buscar el estado en carpetas de más arriba.** El usuario decidió que lea solo la
  carpeta de la sesión (R-08).
- **Otros idiomas** fuera de español e inglés.
- **Elegir o dibujar personajes propios** desde la configuración, y apagar la animación.
  No se pidió.
- **Personajes de otros mods.** Los de `savvy-progress` dicen venir de DockCrab, cuya
  licencia no se encontró: no se copian (decisión del usuario, 2026-10-14).

## Reglas

### RN-panel-solo-lee · origin: D63
El panel no escribe ningún archivo del proyecto. Lo único que guarda es su propio estado de
sesión: qué secciones están abiertas.

### RN-panel-abre-con-estado · origin: reverse (R-01)
Al empezar la sesión, el panel se abre solo si el proyecto tiene `Plan/state.json`. En un
proyecto sin estado no aparece, y `/nzt-state` lo abre igual.

### RN-panel-sin-estado · origin: reverse (R-01)
Si el panel está abierto y el proyecto no tiene `Plan/state.json`, lo dice y se llena solo
cuando el archivo aparece.

### RN-panel-archivo-roto · origin: reverse (R-01)
Si el archivo no es JSON válido o no se puede leer, el panel muestra que no lo pudo leer y
el motivo, y la sesión sigue funcionando.

### RN-panel-fases-tal-cual · origin: D61 (unidad 71)
Si el estado trae `phases`, la línea de fases muestra esas fases y no otras, en el orden
del archivo y cada una con su estado. Una fase `dropped` aparece tachada.

### RN-panel-fase-desconocida · origin: usuario 2026-10-19 ("eso no es una fase, no? las fases son análisis, ux, build, etc") · [add]
Si `phases` trae un nombre que no es ninguna fase de NZT (ni en ninguna de sus grafías), la
línea de fases lo muestra igual, tal como viene (RN-panel-fases-tal-cual), y debajo avisa cuáles
no son fases y cuáles son: *⚠ «cambio: modelo y effort en la banda» no es una fase de NZT: las
fases son Análisis, Arquitectura, UX, Build, Verificación, Release*. Se encontró con el estado de
este repo: el agente había escrito cada cambio como una fase.

### RN-panel-unidad-en-su-fase · origin: D62 (unidad 76)
Las unidades se leen dentro de su fase (`phases[].units`), y las pendientes se muestran
agrupadas bajo el nombre de su fase, en el orden del plan.

### RN-panel-formatos-viejos · origin: D61 y D62 (unidades 71 y 76)
Un estado de D61, con `units` arriba, se muestra con las pendientes sin agrupar. Un estado
anterior, con un solo `phase`, muestra las seis fases de NZT: las anteriores a la actual
como hechas, la actual en curso y las demás pendientes. Si ese plan está completo, todas
aparecen hechas.

### RN-panel-status-invalido · origin: reverse (R-02)
Si una unidad o una fase tiene un `status` que no es `todo`, `doing`, `done` ni `dropped`,
se muestra marcada como inválida, con el valor que trae. No cuenta como pendiente, ni como
hecha, ni en el porcentaje, y el panel avisa cuántas hay.

### RN-panel-varias-en-curso · origin: reverse (R-03)
Si hay más de una unidad `doing`, el panel las muestra todas en **En curso** y avisa que el
kernel permite una sola.

### RN-panel-objetivo · origin: usuario 2026-10-15
El objetivo de la corrida va debajo de Plan y Modo, en su misma columna (al lado del
personaje cuando entran lado a lado) y arriba de la línea de fases. Lleva delante la
etiqueta **Objetivo** ("Goal" en inglés), atenuada, y el texto, tal como lo trae el estado,
va en negrita y en el color propio de la terminal, igual que el número de unidades hechas
(usuario: *"que sea blanco como el numero 16 de 18 unidades hechas, despues el texto debe
llegar hasta antes del crab"*). Antes iba debajo de las fases y sin etiqueta, y no se entendía qué era (usuario:
*"el Goal primero deberia decir que es ese texto osea Objetivo: y el texto y deberia estar
arriba de las fases"*).

### RN-panel-varias-fases-en-curso · origin: usuario 2026-10-15 (unidad 164)
Si hay más de una fase `doing`, la línea de fases las muestra todas en curso, tal como
vienen, y debajo avisa cuántas son y que el kernel permite una sola. El personaje de
arriba es el de la primera, como ya pasa hoy: el panel no adivina cuál es la verdadera. Se
encontró con el estado de este repo (`testing/2026-10-15-dibujo.md` E-01): tres fases
iluminadas, el personaje de UX y ningún aviso.

### RN-panel-porcentaje · origin: reverse (R-04)
El avance es *hechas ÷ (todas − descartadas)*. Con 3 hechas, 1 descartada y 2 pendientes,
muestra 50%.

### RN-panel-tanda-ids · origin: reverse (R-07)
Un id de `autonomy.units` sin unidad en el estado no cuenta para el avance de la tanda: la
tanda se da por terminada cuando terminan las unidades que existen, y el panel avisa qué
ids no existen.

### RN-panel-carpeta-sesion · origin: reverse (R-08)
El panel lee `Plan/state.json` de la carpeta donde se abrió la sesión. Abierta en una
subcarpeta del proyecto, dice que no hay estado.

### RN-panel-idioma · origin: usuario 2026-10-14 (R-06)
El panel habla en español o en inglés: textos, nombres de fase, tiempos ("hace 2 h" /
"2 h ago") y la descripción del comando. Lo que viene del estado (objetivo, unidades,
detalle, notas) se muestra tal cual, en el idioma en que se escribió.

**Cómo se elige** (decisión del agente, 2026-10-14; el usuario no eligió entre las tres
opciones ofrecidas): una opción del mod, **idioma**, con los valores `es` y `en` y `es` por
defecto. Se elige al instalar y se cambia en el menú de configuración o con
`claude plugin configure nzt-state`. Razón: Claude Code no le da al mod el idioma del
usuario (no hay ningún dato de idioma ni región en los tipos del motor, versión 2.1.296), y
adivinarlo del texto del estado puede fallar con un objetivo corto o mezclado. `es` por
defecto porque es lo que el panel hace hoy. **Se reabre** si el motor empieza a exponer el
idioma, o si el usuario prefiere que se adivine del estado.

### RN-panel-preguntas · origin: usuario 2026-10-17 ("me gusta lo de que nzt-state avise lo de las preguntas"); la forma, propuesta del agente
Si `nzt-questions` está instalado y tiene preguntas pendientes, el panel muestra, debajo de lo
que se está esperando, **`? n preguntas para contestar`** con un botón **Contestar ›** que abre
`nzt-questions`, igual que si la persona escribiera su comando. Las ya llevadas al prompt no
cuentan. Sin preguntas pendientes, o sin `nzt-questions` instalado, no muestra nada: el panel no
le pide a nadie que instale otro mod.

### RN-panel-preguntas-espera · origin: mismo criterio que RN-hub-espera de `nzt-hub`
Si Claude está trabajando en un turno cuando se aprieta Contestar, el aviso dice que
`nzt-questions` se abre al terminar el turno, y se abre entonces.

### RN-panel-fases-plegables · origin: usuario 2026-10-14
Dentro de **Pendientes**, **Hechas** y **Descartadas**, las unidades se agrupan por fase y
cada grupo se pliega y despliega con un clic, aparte de la sección. Al abrir el panel solo
está desplegado el grupo de la fase en curso; los demás, plegados. Lo que la persona abre
o cierra dura lo que la sesión. Antes de cada grupo queda una línea en blanco, también
antes del primero, para que no se lea pegado al título de la sección ni a la fase anterior.
Las unidades de un grupo van con sangría bajo su encabezado, para que se lean como de esa
fase y no de la sección. Un estado sin fases (anterior a D62) no tiene grupos: la
sección muestra la lista como antes.

### RN-panel-identidad-fase · origin: usuario 2026-10-14
Cada fase de NZT tiene un color, un personaje y un sombrero, los mismos en la terminal y en
el escritorio:

| Fase | Sombrero | Color |
|---|---|---|
| Análisis | birrete | violeta |
| Arquitectura | casco de obra | azul |
| UX | boina | rosa |
| Build | casco con llave, y un martillo chico en alto en la mano derecha | naranja |
| Verificación | gorro de detective con lupa | verde agua |
| Release | galera gris con cinta dorada | dorado |

El personaje es un cangrejo pixelado al estilo de Clawd, dibujado para este mod (decisión
del usuario, 2026-10-14: se le avisó que Clawd es el personaje de Anthropic y que el repo es
público, y lo mantiene). Una fase que NZT no conoce usa el personaje sin sombrero y un
color neutro.

### RN-panel-personaje-en-curso · origin: usuario 2026-10-14; ubicación, usuario 2026-10-15
Arriba del panel se ve, grande y animado, el personaje de la fase en curso, con el nombre
de la fase en su color centrado debajo. Si ninguna está en curso, el de la primera pendiente; con el plan
completo, el de la última fase de la corrida. Un estado anterior con un solo `phase` muestra
el de esa fase; uno sin fases, ninguno.

**Dónde va** (cambio pedido por el usuario el 2026-10-15: *"podriamos poner los labels de
Plan y Modo arriba a la par del crab … que esten arriba a la izquierda y el crab que este a
la derecha … y aprovechamos mejor el espacio"*):
- **Si el panel tiene 40 columnas útiles o más**, el personaje va arriba a la derecha, con
  su nombre debajo. A su izquierda, en una columna que empieza justo debajo del título NZT,
  van **Plan**, **Modo** y el **Objetivo** (RN-panel-objetivo). Si un texto no entra en una
  línea, se parte en renglones en esa misma columna, sin pasar por debajo del personaje.
- **Si tiene menos**, va como antes: centrado arriba, y Plan y Modo debajo.
- Lo demás del panel (línea de fases, objetivo, avance, secciones) sigue debajo, a todo el
  ancho, en los dos casos.
- El corte en 40 columnas lo propuso el agente con el plan, y el usuario lo aprobó ("hace
  todas en autonomo"). El agente también propuso alinear la columna arriba; al verlo en vivo,
  el usuario lo cambió: *"quedo como arriba a la izquierda literalmente y desalineado con el
  crab, yo los quiero alineados"*, y quedó centrada. Al sumar el objetivo a esa columna, el
  usuario la volvió a poner arriba: *"La parte de Plan aprobado y el modo dejalo justo
  debajo del titulo NZT, tal cual esta alineado a la izquierda, debajo la seccion de
  objetivo"*.
- Un estado sin personaje (sin fases) muestra Plan y Modo a todo el ancho, como antes.

### RN-panel-mini-sombrero · origin: usuario 2026-10-14
En la línea de fases y en el encabezado de cada grupo, cada fase lleva su sombrero en
miniatura y su nombre en su color. El estado de la fase (hecha, en curso, pendiente,
descartada) se sigue viendo como antes. Si la línea de fases no entra en una fila y se
parte, queda una fila en blanco entre una fila y la siguiente. Cada sombrero tiene que
verse sobre fondo oscuro y claro: la galera es gris pizarra con cinta dorada, no negra (en
negro, sobre la terminal oscura solo se veía la cinta, un rectangulito).

El personaje completo va solo arriba: se probó un personaje chico en la fase en curso de la
línea de fases (opción C) y el usuario lo descartó el 2026-10-14.

### RN-panel-dos-superficies · origin: usuario 2026-10-14
Cada personaje y cada sombrero se define una sola vez, como una grilla de píxeles con sus
colores, y se dibuja en la terminal como celdas y en el escritorio como SVG. Retocar un
dibujo lo cambia en las dos.

## Requisitos no funcionales

- Un cambio en el estado aparece en el panel **en 2 segundos como máximo**, y **en el acto**
  cuando lo escribe el agente con Write o Edit (R-05, aceptado por el usuario).
- Se dibuja igual en la terminal y en la app de escritorio. Los tests montan el panel en
  las dos superficies.
- Cambiar el idioma se ve sin reiniciar la sesión.
- El personaje anima a unos 4 cuadros por segundo sin redibujar el resto del panel.
- El color completo se ve en terminales de 24 bits (Windows Terminal, iTerm2, Ghostty,
  kitty, WezTerm; Terminal.app desde macOS Tahoe 26). En una terminal de 256 colores el
  dibujo puede salir con tonos aproximados: no se garantiza.

## Bugs

| Bug | Hallazgo | Comportamiento esperado | Unidad | Estado |
|---|---|---|---|---|
| B-01 | R-01 | RN-panel-abre-con-estado | 84 | verificado por su test (89); falta verlo en vivo |
| B-02 | R-02 | RN-panel-status-invalido | 85 | verificado por su test (89) y por el árbol dibujado sobre el demo (162, [testing/2026-10-15-dibujo.md](testing/2026-10-15-dibujo.md) E-04); falta verlo en vivo |
| B-03 | R-03 | RN-panel-varias-en-curso | 86 | verificado por su test (89) y por el árbol dibujado (162, E-05); falta verlo en vivo |
| B-04 | R-07 | RN-panel-tanda-ids | 87 | verificado por su test (89) y por el árbol dibujado (162, E-06); falta verlo en vivo |

## Hallazgos resueltos

Leídos del código el 2026-10-13 y resueltos por el usuario el 2026-10-14.

| Hallazgo | Lo que hacía el código | Resolución |
|---|---|---|
| R-01 | Se abría en cada sesión, en cualquier proyecto | Bug B-01 (el usuario aceptó la alternativa propuesta) |
| R-02 | Un `status` desconocido se mostraba como pendiente | Bug B-02 |
| R-03 | Con dos unidades en curso, la segunda no se veía | Bug B-03 |
| R-04 | El porcentaje no cuenta las descartadas | Regla: RN-panel-porcentaje |
| R-05 | Relee cada 2 s, y en el acto con Write o Edit | Regla: requisito no funcional |
| R-06 | Todo en español; la descripción del comando, en inglés | Español e inglés: RN-panel-idioma |
| R-07 | Un id de tanda inexistente impedía "tanda terminada" | Bug B-04 |
| R-08 | Lee solo la carpeta de la sesión | Regla: RN-panel-carpeta-sesion |

## Sin determinar

- **Escritorio:** los tests montan el panel en `desktop`, pero no lo vi dibujado en la app.
  Tampoco está probado si la animación CSS del SVG corre dibujado como imagen o necesita
  `isInteractive`; los tipos del motor solo lo afirman de la animación SMIL.
- **Terminal de 256 colores:** no se probó cómo se ve el personaje.
- **Cómo sabe `nzt-state` cuántas preguntas tiene `nzt-questions`** (RN-panel-preguntas, unidad
  202): el motor deja que un mod lea el estado de sesión de otro que declara como dependencia,
  pero no está verificado si declararlo obliga a tener instalado `nzt-questions`, lo que
  rompería *sin `nzt-questions` instalado, no muestra nada*. Se decide en el diseño técnico de
  `nzt-questions` (unidad 205). **Probado en la unidad 209:** `nzt-state` no declara la
  dependencia y declara en su propio contrato la única clave que lee (`nzt-questions.pending`).
  `claude plugin validate` lo acepta y avisa que la clave de otro plugin no la puede comprobar.
  En el test, sin `nzt-questions`, la lectura se rechaza, el panel la toma como cero y no muestra
  nada. **Verificado en vivo en la unidad 210** (usuario, 2026-10-17): con los dos mods cargados
  el aviso aparece, Contestar abre `nzt-questions` y no hay quejas por los dos contratos.

## Tests

`hooks/register.test.ts` corre con `claude plugin test mods/nzt-state`. Cubre la línea de
fases en los tres formatos, la lectura del estado, el JSON roto, el panel con la unidad en
curso, las pendientes por fase, las secciones que se pliegan (en terminal y en escritorio)
y la tanda autónoma con sus paradas; la apertura con y sin estado (B-01), el status
inválido (B-02), varias unidades en curso (B-03), varias fases en curso y una sola sin
aviso, una fase que NZT no conoce con su aviso, la tanda con ids que no existen (B-04) y el panel en inglés; los grupos por fase que
se pliegan, los cuadros y sombreros de cada personaje, las celdas, el personaje y los mini
sombreros en la terminal, y el SVG en el escritorio; Plan y Modo al lado del personaje
desde 40 columnas útiles (terminal y escritorio) y apilados por debajo; el objetivo con su
etiqueta, arriba de las fases; el aviso de preguntas pendientes con Contestar, y su ausencia
sin `nzt-questions` o sin preguntas. 32 tests.
