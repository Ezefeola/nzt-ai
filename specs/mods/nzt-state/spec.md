# Mod · nzt-state — panel del plan y el estado

> Estado: **aceptado y cerrado**, versión 0.7.0; 0.6.0 (aviso de fase que NZT no conoce,
> unidad 271), aceptado con ella. En `mods/nzt-state/` (B-01 a B-04 e idioma en las
> unidades 84 a 88; fases plegables y personajes en 91 a 95; aviso de varias fases en curso
> en la 164; Plan y Modo al lado del personaje en la 166; aviso de preguntas abiertas,
> RN-panel-preguntas y -preguntas-espera, aprobado en la 202, construido en la 209 y aceptado
> por el usuario tras probarlo en vivo el 2026-10-17, unidad 210) · Depende de: `specs/nzt-mods.md`,
> `specs/nzt-core.md` sección 7 (formato de `Plan/state.json`), D61 y D62.
> Escrita el 2026-10-13 leyendo el código; los hallazgos R-01 a R-08 los resolvió el usuario
> el 2026-10-14 (sección **Hallazgos resueltos**).
> **0.7.0 aceptado y cerrado** (usuario 2026-10-20, unidad 298; spec 294, mockup 295, build
> 296, prueba en vivo 297): Tu turno, AHORA y las tareas a pedido. 0.6.0, aceptado con ella.
> Cómo llegó hasta acá, en **Historia** al final.
> **0.8.0 a 0.9.1 aceptados y cerrados** (usuario 2026-10-24, tras la prueba en vivo en
> `Systems/TodoList`): la fila **Delegar** y su excepción a RN-panel-solo-lee (0.8.0, D71),
> los tramos de un estado v2 (0.9.0, D72 y D73) y su lista plegada (0.9.1, D75).

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
- **AHORA**: la última hecha, la que está en curso y la que sigue, en vivo (RN-panel-ahora).- **Las tareas, ocultas detrás de un botón** (RN-panel-tareas): una sola lista de unidades, en el orden del plan y agrupada por fase, que se marca
  como un checklist: hechas, la que está en curso (o la que sigue) y pendientes
  (RN-panel-lista). Las notas (**Notas para retomar**, lo que una sesión nueva necesita para
  seguir) en una sección que se pliega.- **Tu turno**: lo que se espera de nosotros, arriba de todo, plegado y latiendo (RN-panel-espera).- El comando `/nzt-state`, que abre el panel.
- La lectura de los tres formatos del estado: el actual (D62), el de D61 y el anterior con
  `phase`.
- Los avisos de un estado que rompe el formato del kernel: un estado inválido, más de una
  unidad en curso, más de una fase en curso, una tanda que nombra unidades que no existen.
- Español e inglés.
- Las fases plegables dentro de la lista, y la identidad de cada fase: su color, su
  personaje animado y su sombrero en miniatura.
**Afuera**
- **Editar o corregir el estado desde el panel.** El panel solo lee
  (`RN-mod-lee-no-escribe` de `specs/nzt-mods.md`); avisa lo que está mal y no lo arregla.
  La única excepción es el modo de delegación (RN-panel-delegar).
- **Codex.** Un mod es solo de Claude Code (D63).
- **Otros artefactos**, como specs, historias o el glosario. El panel lee únicamente
  `Plan/state.json`. Las preguntas abiertas no las busca en los documentos: toma la
  cuenta que da `nzt-questions` (RN-panel-preguntas), que es el mod que las lee.
- **Historial de corridas.** Una corrida nueva reescribe el estado (D62), y el panel
  muestra solo la corrida actual.
- **Buscar el estado en carpetas de más arriba.** El usuario decidió que lea solo la
  carpeta de la sesión (R-08).
- **Otros idiomas** fuera de español e inglés.
- **Los pasos de Claude dentro de una unidad** (su lista de tareas, como la muestra Clean
  View). Haría falta que el kernel le pida a Claude armarla y marcarla; el usuario decidió no
  sumar ese cambio de funcionalidad (2026-10-20): la lista es de unidades.- **Que el agente escriba el estado más seguido.** La lista se marca con lo que el estado ya
  trae: mientras el agente hace una unidad sin haberla pasado a `doing`, la lista la muestra
  como la que sigue (RN-panel-lista-siguiente).- **Elegir o dibujar personajes propios** desde la configuración, y apagar la animación.
  No se pidió.
- **Personajes de otros mods.** Los de `savvy-progress` dicen venir de DockCrab, cuya
  licencia no se encontró: no se copian (decisión del usuario, 2026-10-14).

## Reglas

### RN-panel-solo-lee · origin: D63; D71, usuario 2026-10-21
El panel no escribe ningún archivo del proyecto. Lo único que guarda es su propio estado de
sesión: qué grupos y secciones están abiertos, y si el detalle de la unidad en curso está
desplegado. **Excepción:** la clave `delegation` de `Plan/state.json`, cuando la
persona aprieta Delegar (RN-panel-delegar).

### RN-panel-delegar · origin: usuario 2026-10-21 (unidad 318 del plan); D71
Debajo de **Plan** y **Modo**, en su misma columna, la fila **Delegar** ("Delegate") muestra
cómo delega lecturas el agente: `auto` *· explora sin preguntar*, `ask` *· pregunta antes* u
`off` *· no delega*. Sin la clave en el estado muestra `ask` *(por defecto)*; con un valor que
no es un modo muestra `ask` y avisa *⚠ "always" no es un modo*. **Un clic pasa al siguiente,
`auto → ask → off → auto`** (sin clave o inválido cuenta como `ask`, así que pasa a `off`), y
lo escribe en el archivo:
- relee el archivo en el momento del clic, no lo que vio el panel, para no pisar lo que el
  agente escribió desde la última lectura;
- cambia esa clave y deja el resto **byte por byte**; una clave nueva va al lado de
  `approved`, como la escribe el schema de `nzt-plan` (`"approved": true, "delegation": "off",`);
- un archivo que no es un objeto JSON no se toca; si la escritura falla, el panel dice
  *No se pudo cambiar el modo:* y el motivo.

Sin `Plan/state.json` o con el archivo roto no hay fila: el panel ya muestra lo de
RN-panel-sin-estado y RN-panel-archivo-roto. Esto reemplaza la propuesta de D71 (*la fila
muestra `ask` y el clic no hace nada*), que el usuario no confirmó: sin estado el panel no
dibuja Plan ni Modo.

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

### RN-panel-fase-desconocida · origin: usuario 2026-10-19 ("eso no es una fase, no? las fases son análisis, ux, build, etc")Si `phases` trae un nombre que no es ninguna fase de NZT (ni en ninguna de sus grafías), la
línea de fases lo muestra igual, tal como viene (RN-panel-fases-tal-cual), y debajo avisa cuáles
no son fases y cuáles son: *⚠ «cambio: modelo y effort en la banda» no es una fase de NZT: las
fases son Análisis, Arquitectura, UX, Build, Verificación, Release*. Se encontró con el estado de
este repo: el agente había escrito cada cambio como una fase.

### RN-panel-tramos · origin: D72 y D73 de `specs/nzt-core.md` (usuario 2026-10-23: "sin fases repetidas en el mod")
Si el estado trae `slices` (v2), el panel muestra **el tramo en curso como si fuera el plan**:
la línea de fases, el avance, AHORA y las tareas son las de ese tramo, y ninguna fase aparece
dos veces. El tramo en curso es el `doing`; sin ninguno, el primero `todo`; sin ninguno, el
último. Arriba de la línea de fases, la fila **Tramo** dice *2 de 3 · F-003 Cupones*, y debajo,
plegada, **▸ Tramos · 3** (D75, QT-04 del usuario 2026-10-24: "si hay muchos tramos se vuelve
ilegible"): un clic, o Enter con el foco, la despliega con cada tramo en un renglón,
`S1 · Análisis de la entrega 1`, con la marca de RN-panel-lista-marcas; el actual en negrita,
los demás atenuados. Empieza plegada, y el panel recuerda si se abrió como las otras
secciones. Con un solo tramo no hay sección: la fila Tramo ya lo dice todo. Si al tramo no le queda
nada pendiente después de lo que muestra AHORA y viene otro, AHORA cierra con *▷ Sigue el
tramo S3 · Release*. *Plan completo* recién cuando no queda tramo por hacer. La tanda cuenta
las unidades de todos los tramos (RN-panel-tanda-ids). Con más de un tramo `doing`, avisa
que el kernel permite uno solo. Un estado sin `slices` se dibuja exactamente como antes.

### RN-panel-unidad-en-su-fase · origin: D62 (unidad 76)Las unidades se leen dentro de su fase (`phases[].units`), y la lista las muestra bajo el
nombre de su fase, en el orden del plan: las fases en el orden del archivo y, dentro de cada
una, las unidades en el orden en que el archivo las trae, sea cual sea su estado.

### RN-panel-ahora · origin: usuario 2026-10-20, Q-04 (propuesta 1: "me gusta el 1 asi que vamos con el 1")Debajo del avance, un cuadro **AHORA** con el borde y el título en el color de la fase de la
unidad en curso muestra lo que está pasando, como Clean View: la **última unidad hecha**, la
**que está en curso** (o la que sigue, RN-panel-lista-siguiente) con su detalle
(RN-panel-lista-detalle), y la **próxima pendiente**, en el orden del plan y con las marcas de
RN-panel-lista-marcas. Arriba a la derecha dice **Unidad n de m** (sin contar descartadas).
Con la 287 en curso, la 297 hecha y la 298 pendiente: `AHORA · Verificación`, `Unidad 5 de 8`,
`✓ 297`, `▶ 287`, `○ 298`. Si falta la anterior o la siguiente, se muestra lo que hay. Con
varias en curso, todas, con el aviso de RN-panel-varias-en-curso. Con el plan completo, el
cuadro dice *✓ Plan completo: no hay unidades en curso ni pendientes.* **La unidad en curso
brilla leve**, marca y texto, en el color de su fase, con la misma onda que Tu turno pero menos
profunda (usuario en la prueba en vivo, H-02: *"en la tarea que se esta haciendo en el momento,
debe tener un efecto digamos de brillo leve"*). Solo ella: ▷ sigue no brilla.

### RN-panel-tareas · origin: usuario 2026-10-20 ("no siempre vamos a querer ver las tareas … quizas un boton para activar la vista y desactivarla"), Q-04Debajo de AHORA, el botón **☰ Ver tareas · n** (n, el total de unidades) muestra la lista de
todo el plan (RN-panel-lista), y entonces dice **☰ Ocultar tareas** y la vuelve a ocultar. Al
abrir el panel, las tareas están ocultas. Lo que la persona elige dura lo que la sesión.

### RN-panel-lista · origin: usuario 2026-10-20 ("me gustaria una lista asi ordenada como clean view")Con las tareas a la vista (RN-panel-tareas), las unidades se muestran en **una sola lista**,
cada una una vez, en el lugar que le toca en el plan, y su marca dice cómo está
(RN-panel-lista-marcas). El panel no agrupa las unidades por estado: con 2 hechas, 1 en curso,
2 pendientes y 1 descartada, cada una de las 6 aparece una sola vez en la lista (AHORA repite, a
propósito, las que muestra). La lista se lee de arriba hacia
abajo como un checklist: lo hecho arriba, la que está en curso en el medio y lo que falta
abajo, porque así las ordena el plan. Ejemplo, con la fase Verificación en curso:

```
Verificación · 1 de 3
✓ 297  Prueba en vivo de nzt-state 0.7.0
▶ 287  Cerrar nzt-files 0.2.0 cuando el usuario lo acepte
○ 298  Cerrar nzt-state 0.7.0 cuando el usuario lo acepte
```

### RN-panel-lista-marcas · origin: usuario 2026-10-20; los glifos, propuesta del agente (Q-03)Cada unidad lleva delante una marca, la misma en la terminal y en el escritorio:
**✓ hecha** · **▶ en curso**, resaltada en el color de su fase · **○ pendiente**, atenuada ·
**✗ descartada**, atenuada y tachada. Una unidad con un status que el kernel no define
lleva la marca de RN-panel-status-invalido.

### RN-panel-lista-siguiente · origin: usuario 2026-10-20 (el agente explicó que el estado se escribe al terminar cada unidad); la forma, propuesta del agente (Q-03)Si ninguna unidad está en curso, la primera pendiente de la fase en curso lleva **▷** y la
palabra **sigue** ("next"), atenuada, en vez de ○: es la que el agente está haciendo o va a
hacer. Con el estado de esta corrida al aprobarse el plan (ninguna en curso, fase Análisis en
curso, 294 primera pendiente), la 294 se muestra como `▷ 294 … sigue`. Si no hay fase en
curso, o la fase en curso no tiene pendientes, ninguna lleva ▷.

### RN-panel-lista-detalle · origin: propuesta del agente, por "nzt-state se siente como que tiene muchisima informacion" (Q-03)El detalle de la unidad en curso va debajo de ella en **un solo renglón**, cortado con «…» si
no entra. Un clic en la unidad lo despliega entero y otro lo vuelve a un renglón; dura lo que
la sesión. Las demás unidades no muestran su detalle.

### RN-panel-espera · origin: usuario 2026-10-20 ("cuando esta esperando algo de nosotros se ve siempre en pantalla, en nzt-state estaria bueno que eso se vea mas lindo"); la forma, Q-01 y Q-04; el nombre, usuario ("en vez de que diga 'Te toca' que diga 'Tu turno'")Mientras el estado trae `waiting_on` o `nzt-questions` tiene preguntas pendientes, el panel
muestra **Tu turno** ("Your turn") en el primer renglón debajo del título, arriba de todo lo
demás. **Plegado**, es un solo renglón: `▸ ⏸ Tu turno`, el texto de `waiting_on` cortado con «…»
y, si además hay preguntas, `? n` al final; sin `waiting_on`, el texto es *n preguntas para
contestar*. **Mientras está a la vista, el título brilla suave**: va de un amarillo apagado al
amarillo entero y vuelve, en una onda de unos 2 segundos, sin saltos (usuario en la prueba en
vivo, H-03: *"es como que se prende y apaga de forma brusca … que este en un amarillo apagado y
se vaya iluminando y desiluminando"*). Un clic lo **despliega** (`▾`): el texto entero
tal como viene, y debajo el aviso de preguntas con Contestar (RN-panel-preguntas); otro clic lo
pliega. Arranca plegado y lo elegido dura lo que la sesión. Sin `waiting_on` y sin preguntas,
no aparece ni deja lugar vacío.

### RN-panel-formatos-viejos · origin: D61 y D62 (unidades 71 y 76)Un estado de D61, con `units` arriba, se muestra como una lista sin grupos, en el orden del
archivo y con las mismas marcas (RN-panel-lista-marcas). Un estado
anterior, con un solo `phase`, muestra las seis fases de NZT: las anteriores a la actual
como hechas, la actual en curso y las demás pendientes. Si ese plan está completo, todas
aparecen hechas.

### RN-panel-status-invalido · origin: reverse (R-02)
Si una unidad o una fase tiene un `status` que no es `todo`, `doing`, `done` ni `dropped`,
se muestra marcada como inválida, con el valor que trae. No cuenta como pendiente, ni como
hecha, ni en el porcentaje, y el panel avisa cuántas hay.

### RN-panel-varias-en-curso · origin: reverse (R-03)Si hay más de una unidad `doing`, la lista las marca todas con ▶, cada una en su lugar, y el
panel avisa que el kernel permite una sola. Ninguna lleva ▷ (RN-panel-lista-siguiente).

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

### RN-panel-carpeta-sesion · origin: reverse (R-08); el cd del agente, usuario 2026-10-20 (H-01)El panel lee `Plan/state.json` de la carpeta donde se abrió la sesión. Abierta en una
subcarpeta del proyecto, dice que no hay estado. **Que el agente se mueva a otra carpeta
durante la sesión no cambia cuál lee**: con la sesión abierta en la raíz y el agente en
`specs/mods`, el panel sigue mostrando el estado de la raíz.

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

### RN-panel-fases-plegables · origin: usuario 2026-10-14; en la lista, usuario 2026-10-20En la lista, cada fase es un grupo con su encabezado: el sombrero en miniatura, el nombre en
su color y cuántas unidades lleva hechas de cuántas, sin contar las descartadas (`Build · 1
de 3`; una fase con todo hecho, `✓ Análisis · 1 de 1`). Cada grupo se pliega y despliega con un
clic. Al abrir el panel solo está desplegado el grupo de la fase en curso; los demás,
plegados a su encabezado. Lo que la persona abre o cierra dura lo que la sesión. Antes de
cada grupo queda una línea en blanco, para que una fase no se lea pegada a la anterior. Las
unidades van con sangría bajo su encabezado. Un estado sin fases (anterior a D62) no tiene
grupos (RN-panel-formatos-viejos).

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

## Diseño 0.7.0 (unidad 295)
Mockup: [`mockup.html`](mockup.html), que se abre desde el disco. Arriba, afuera del marco, se
elige el estado y si va la línea de fases (Q-02); cada combinación se puede enlazar
(`#state=espera&fases=sin`). Salió de dos rondas con el usuario (2026-10-20): en la primera,
la lista con todas las fases a la vista y tres formas de la espera; en la segunda, tres
propuestas, de las que eligió la 1 (Q-04).

- **Tarea:** ver qué está pasando ahora y si la corrida nos espera. No hay acción principal: el
  panel informa. Se aprieta Tu turno (desplegar), Contestar, Ver tareas, una fase (plegar) y la
  unidad en curso (detalle).
- **Orden de lectura, de arriba hacia abajo:** título · **Tu turno**, plegado (RN-panel-espera) ·
  Plan, Modo y Objetivo con el personaje (sin cambios) · línea de fases (Q-02) · avance ·
  **AHORA** (RN-panel-ahora) · **☰ Ver tareas** (RN-panel-tareas) y, abiertas, la lista por fase
  (RN-panel-lista) · Notas para retomar, plegada.
- **Estados dibujados:** unidad en curso · Tu turno con preguntas · Tu turno con texto largo ·
  solo preguntas · ninguna en curso (▷ sigue) · con descartada · varias en curso · plan
  completo · panel angosto · y **Hoy (0.6.0)** para comparar. Sin estado y archivo roto no
  cambian: no se dibujan. Un estado sin fases (D61) muestra AHORA igual y la lista sin grupos.
- **Angosto** (menos de 40 columnas útiles): el personaje arriba, centrado; Tu turno, AHORA y la
  lista, iguales a todo el ancho.
- **El brillo:** en el mockup, una animación CSS de 1,6 s; en la terminal, alternar dos tonos
  con el reloj que ya anima al personaje (sin probar). Con `?quieto` el mockup no se mueve.
- **Medido** en el mockup (Edge sin ventana, 2026-10-20): 10 estados × con y sin línea de fases,
  a 320 y 800 px, con Tu turno, las tareas y el detalle desplegados: ningún scroll horizontal
  (40 de 40). **Contraste** sobre el fondo de la terminal: texto 13,9 · tenue 5,4 · amarillo de
  Tu turno 10,1 y 4,75 en el punto bajo del brillo · preguntas 7,8 · Contestar 8,5 · colores de
  fase entre 5,3 (Análisis) y 9,1, todos AA. El gris de las descartadas daba 2,3: va en el
  tenue, tachada.
- **Sin probar:** el orden de foco con teclado en el panel real; en el mockup, la unidad en
  curso se despliega con Enter.

## Preguntas

### Q-01 · ¿Cómo se ve lo que se espera de nosotros? (RN-panel-espera)
- bloquea: la forma de RN-panel-espera y el build (296)
- se responde: sobre las propuestas del mockup, unidad 295
- respuesta (usuario 2026-10-20, ronda 1 del mockup): *"el Te Toca deberia ser quizas un
  desplegable que brille mientras este esperando algo de nosotros"*. Se llama **Te toca**, va
  plegado en un renglón, se despliega con un clic y brilla mientras hay `waiting_on` o
  preguntas. La forma exacta del brillo sale de Q-04.

### Q-02 · Con la lista agrupada por fase, ¿sigue la línea de fases de arriba?
- por qué: la lista ya muestra cada fase con su sombrero, su color y su avance; la línea de
  fases repite eso arriba, y el usuario dijo que el panel tiene "muchisima informacion"
- opciones: dejarla como está · sacarla y que el encabezado de cada grupo diga si la fase está
  hecha, en curso o pendiente · dejarla solo en el modo angosto
- bloquea: el build (296); el mockup muestra la opción con y sin línea
- respuesta (usuario 2026-10-20, *"perfecta tu propuesta"*): **queda como está**. Con las tareas
  ocultas (RN-panel-tareas), es lo único que muestra todo el plan de un vistazo.

### Q-03 · ¿Confirmás las propuestas del agente de la unidad 294?
- las propuestas: los glifos de RN-panel-lista-marcas; ▷ con «sigue» de
  RN-panel-lista-siguiente; el detalle en un renglón que se despliega de RN-panel-lista-detalle;
  las descartadas dentro de la lista, tachadas
- no bloquea construir: se confirman al ver el mockup (295)
- respuesta (usuario 2026-10-20): *"me gustan las propuestas hechas"*. Confirmadas.

### Q-04 · ¿Cómo se ve lo que está pasando y cómo se muestran las tareas? (ronda 2 del mockup)
- origen: usuario 2026-10-20, *"no quiero todas las fases tiradas ahi con sus unidades porque no
  siempre vamos a querer ver las tareas … quizas un boton para activar la vista y desactivarla …
  la idea es que sea como clean view ese panel osea en tiempo real … dame en el mock 3 propuestas"*
- propuestas, en el mockup (selector Q-04):
  1. **Ahora + «Ver tareas»**: Te toca, un renglón arriba de todo cuyo título late; un cuadro
     **Ahora** con la última hecha, la que está en curso y la que sigue, y «Unidad n de m»; el
     botón «☰ Ver tareas» abre la lista de todo el plan y «☰ Ocultar tareas» la cierra.
  2. **Checklist de la fase en curso**: Te toca, una banda amarilla que late; un cuadro con todas
     las unidades de la fase en curso, «Paso n de m» y su %; «☰ Todo el plan» suma las demás fases,
     plegadas.
  3. **Vista simple / completa**: un botón arriba a la derecha cambia todo el panel; **Simple**
     deja el personaje chico, el objetivo con el %, Te toca (un recuadro cuyo borde late) y
     Ahora; **Completa** suma Plan, Modo, la línea de fases, el avance, las tareas y las notas.
- en las tres, las tareas arrancan ocultas, y lo abierto o cerrado dura lo que la sesión
  (propuesta del agente)
- respuesta (usuario 2026-10-20): *"me gusta el 1 asi que vamos con el 1, y en vez de que diga
  'Te toca' que diga 'Tu turno'"*. Queda en RN-panel-ahora, RN-panel-tareas y RN-panel-espera.
  Las propuestas 2 y 3 se sacaron del mockup.

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
curso, AHORA con la última hecha, la que está en curso y la que sigue (y nada más), el
detalle que se despliega, ▷ sigue sin unidad en curso, el plan completo, Tu turno primero,
plegado y que se despliega, y su ausencia sin espera; las tareas ocultas que Ver tareas
muestra, sin las secciones de antes, con la descartada tachada (en terminal y en escritorio)
y la tanda autónoma con sus paradas y su lista sin grupos; la apertura con y sin estado (B-01), el status
inválido (B-02), varias unidades en curso (B-03), varias fases en curso y una sola sin
aviso, una fase que NZT no conoce con su aviso, la tanda con ids que no existen (B-04) y el panel en inglés; los grupos por fase que
se pliegan, los cuadros y sombreros de cada personaje, las celdas, el personaje y los mini
sombreros en la terminal, y el SVG en el escritorio; Plan y Modo al lado del personaje
desde 40 columnas útiles (terminal y escritorio) y apilados por debajo; el objetivo con su
etiqueta, arriba de las fases; el aviso de preguntas pendientes en Tu turno con Contestar, y su
ausencia sin `nzt-questions` o sin preguntas; la onda del brillo (sube y baja sin saltos, entera
arriba y mezclada con gris abajo) y Tu turno y la unidad en curso dibujados en su brillo; el
estado leído de la carpeta en que empezó la sesión; el modo de delegación (por defecto,
válido, inválido), el ciclo, la escritura en su lugar o al lado de `approved` sin tocar otro
byte, el archivo que no es objeto, la fila con el clic que escribe y el error de escritura
(0.8.0); el estado por tramos: el tramo en curso con sus fases y unidades, la tanda sobre
todos los tramos, la fila Tramo con cada tramo, *Sigue el tramo* y el plan completo solo tras
el último (0.9.0); la lista de tramos plegada, que se abre y se cierra, y sin lista con un solo
tramo (0.9.1). 55 tests en la unidad 340. **Probados en vivo** por el usuario la fila
Delegar y los tramos (2026-10-24). **Sin test:** que el brillo avance en vivo (un paso por cuadro del reloj del personaje, 10
pasos por onda, solo mientras hay algo en curso o se espera): se vio en la prueba en vivo
([testing/2026-10-20-en-vivo.md](testing/2026-10-20-en-vivo.md), V-03).

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba. Empieza en 0.7.0: lo anterior está
en el encabezado y en **Hallazgos resueltos**.

### 2026-10-24 · Delegar y los tramos — 0.8.0 a 0.9.1
Type:     add
Change:   la fila Delegar muestra y cambia el modo de delegación del estado; un estado v2 se dibuja por su tramo en curso, con la fila Tramo y la lista de tramos plegada.
Reason:   D71 (el usuario quería ver y cambiar la delegación desde el panel), D72–D73 (NZT trabaja por tramos) y D75 ("si hay muchos tramos se vuelve ilegible", y el nombre del tramo salía dos veces).
Before:   el panel no escribía nada y solo entendía un estado con `phases`.
Now:      escribe solo la clave `delegation`; con `slices`, fases, avance, AHORA y tareas son las del tramo en curso, y la lista de tramos se abre con un clic.
Impact:   RN-panel-delegar y RN-panel-tramos nuevas · RN-panel-solo-lee con su excepción
Decision: QT-04 del usuario (una línea y la lista plegada). Aceptado tras la prueba en vivo, puntos 3–13.

### 2026-10-20 · Tu turno, AHORA y las tareas a pedido — 0.7.0
Type:     modify
Change:   lo que espera de la persona va primero, plegado y brillando suave; lo que está pasando se ve en un cuadro AHORA (la última hecha, la que está en curso brillando y la que sigue); todas las unidades, como un checklist por fase, solo cuando se piden.
Reason:   el usuario, al ver Clean View: "nzt-state se siente como que tiene muchisima informacion ademas el 'EN CURSO' no se ve bien y no me permite seguir bien con que esta"; "me gustaria una lista asi ordenada"; "no quiero todas las fases tiradas ahi".
Before:   secciones En curso, Pendientes, Hechas y Descartadas, el detalle entero de la unidad en curso, la espera en un recuadro y las preguntas sueltas debajo; el panel leía el estado de la carpeta donde estuviera el agente.
Now:      Tu turno, AHORA y Ver tareas; el detalle en un renglón que se despliega; el estado, siempre de la carpeta donde empezó la sesión.
Impact:   RN-panel-ahora, -tareas, -lista, -lista-marcas, -lista-siguiente, -lista-detalle, -espera nuevas · RN-panel-unidad-en-su-fase, -varias-en-curso, -fases-plegables, -formatos-viejos, -carpeta-sesion cambiadas · las secciones por estado, quitadas
Decision: propuesta 1 de tres (Q-04), "Tu turno" en vez de "Te toca", la línea de fases se queda (Q-02), los pasos de Claude afuera (usuario 2026-10-20). Aceptada con V-04..V-10 de la prueba en vivo sin recorrer uno por uno.
