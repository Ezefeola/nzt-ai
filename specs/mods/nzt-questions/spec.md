# Mod · nzt-questions — contestar las preguntas del agente

> Estado: **aceptada** por el usuario el 2026-10-17 tras probarla en vivo (unidad 210: *"todo esta
> perfecto … ya valide todo y funciona"*) y cerrada, 0.1.0; código en `mods/nzt-questions/`
> (unidades 207 y 213) · especificada en la unidad 199 (genérica desde Q-07); mockup en
> `specs/mods/nzt-questions/mockup.html` (unidad 203) y diseño técnico (unidad 205) · Depende de: `specs/nzt-mods.md` (reglas de todo mod
> y catálogo de la sección 5). D64 de `specs/nzt-core.md` dice cómo pregunta el agente de NZT;
> el panel reconoce esa forma como un caso más, sin depender de ella.
> **0.2.0 aceptado y cerrado** (usuario 2026-10-24): las preguntas contestadas fuera del panel
> se cierran (RN-preg-contestadas-afuera). Origen: D77 de `specs/nzt-core.md`; en **Historia**.
> **0.3.0 (unidad 365, 2026-10-25):** la app de escritorio, regla con `[modify]` hasta que el
> usuario lo vea en la app (H-24 de `specs/mods/revision-escritorio.md`).
> El usuario lo pidió el 2026-10-17: *"poder ver las preguntas que tiene el agente y
> responderlas … de forma organizada como con la tool de questions que tiene pero el agente no
> siempre la usa"*.

## Qué resuelve

Cuando el agente necesita decisiones, muchas veces las escribe en el chat, varias juntas, y para
contestarlas hay que escribir un prompt que las recorra una por una. D64 hace que el agente de
NZT use la tool de preguntas del host cuando la tiene; este panel cubre lo que queda: las
preguntas que llegaron como texto, de cualquier agente y en cualquier proyecto. Se contestan de a
una, con opciones, y la respuesta vuelve al agente como un solo mensaje.

## Alcance

**Adentro**
- Un panel lateral, `/nzt-questions`, con las preguntas pendientes y una vista para contestarlas
  de a una.
- Las preguntas que el agente escribió en sus respuestas de esta sesión, reconocidas por su forma
  y no por un formato de NZT (RN-preg-forma).
- Contestar eligiendo una opción, aceptando la recomendada, escribiendo otra respuesta, sumando una
  nota, o salteando la pregunta.
- Un resumen de lo contestado y un botón que deja **un solo mensaje en el prompt** para revisarlo.
- Abrirse solo cuando llegan preguntas (Q-05).
- Un aviso en `nzt-state` cuando hay preguntas pendientes (spec de `nzt-state`, unidad 202).
- Español e inglés.

**Afuera**
- **Leer preguntas de los documentos del proyecto** (las `Q-NN`/`QT-NN` abiertas de otras
  sesiones). El usuario pidió el mod genérico, sin atarlo a NZT (Q-07); en NZT lo pendiente ya
  lo retoma el estado y el agente lo vuelve a preguntar. Queda para una 0.2 si se extraña.
- **Una tool de preguntas propia del mod.** Descartada en D64: dos tools para lo mismo en Claude
  Code y ninguna en Codex (opción C', usuario 2026-10-17).
- **Interceptar `AskUserQuestion`** para dibujarla en el panel. Su respuesta vuelve directo al
  agente sin pasar por el prompt, y el usuario eligió revisar antes de mandar (Q-03). Queda para
  una 0.2 si la 0.1 se queda corta.
- **Mandar el mensaje solo.** El usuario eligió que quede en el prompt (Q-03).
- **Escribir archivos del proyecto.** El panel solo escribe en el prompt; quien registra las
  respuestas es el agente (`RN-mod-lee-no-escribe`).
- **Las preguntas de un subagente.** No le hablan al usuario.
- **Codex.** No tiene mods (`RN-mod-solo-claude`); allá D64 cae a la lista numerada.

## Reglas

### RN-preg-fuentes · origin: usuario 2026-10-17 (Q-02, Q-07)
El panel toma las preguntas de las respuestas del agente en esta sesión, y de nada más.

### RN-preg-forma · origin: usuario 2026-10-17 (Q-07: "sin tener que ligarlo a que lea el formato QT")
Una pregunta es una línea de la respuesta que termina en `?`, sola o numerada, en negrita o como
título. Sus **opciones** son la lista que viene justo debajo, si la hay, cada una con lo que dice
después de su nombre. La **recomendada** es la opción marcada *recomendada* o *recommended*. Si la
línea empieza con un identificador (`QT-03 ·`, `Q-1:`, `#4`), el panel lo usa para nombrarla; si
no, la nombra por su número de orden. La forma de D64 es un caso de esta regla.

### RN-preg-no-inventa · origin: propuesta del agente, confirmada por el usuario (Q-06)
El panel muestra solo lo que el agente escribió: no completa opciones, no deduce una recomendación
y no convierte en pregunta una frase que no termina en `?`. Una pregunta sin opciones se contesta
con texto.

### RN-preg-una-vez · origin: propuesta del agente, confirmada por el usuario (Q-06)
Una pregunta que el agente repite en una respuesta posterior, con el mismo identificador o el mismo
texto, se muestra una sola vez: la versión más nueva reemplaza a la anterior.

### RN-preg-de-a-una · origin: usuario 2026-10-17 ("responder una por una con opciones")
Al contestar, el panel muestra una pregunta por vez, con sus opciones y la recomendada primero, y
pasa a la siguiente al contestarla o saltearla. Se puede volver a una anterior y cambiar la
respuesta antes de llevarla al prompt.

### RN-preg-respuestas · origin: usuario 2026-10-17 y la forma de `AskUserQuestion` (Other y notas, D64)
Una pregunta se contesta eligiendo una opción, aceptando la recomendada, o escribiendo otra
respuesta; a cualquiera se le puede sumar una nota.

### RN-preg-saltear · origin: propuesta del agente, confirmada por el usuario (Q-06)
Una pregunta salteada no va en el mensaje y sigue pendiente.

### RN-preg-mensaje · origin: usuario 2026-10-17 (Q-03: "que quede en el prompt")
Cuando la persona lleva las respuestas al prompt, el panel arma **un solo mensaje** con una línea
por pregunta contestada (`QT-01: A — <opción>`, o `2: <respuesta>` si no tiene identificador, más
la nota si la hay) y lo deja en el prompt sin mandarlo. La persona lo revisa y aprieta Enter.

### RN-preg-borrador · origin: propuesta del agente, confirmada por el usuario (Q-06)
Si el prompt ya tiene texto escrito, el mensaje se agrega al final y el borrador no se pierde.

### RN-preg-enviadas · origin: propuesta del agente, confirmada por el usuario (Q-06)
Las preguntas llevadas al prompt se marcan como enviadas y dejan de contar como pendientes. Si el
mensaje no se manda, siguen ahí como enviadas y se pueden llevar otra vez.

### RN-preg-contestadas-afuera · origin: usuario 2026-10-24 (QT-08: "al mandar cualquier mensaje"), D77
Cuando la persona manda un mensaje que no es un comando —escrito o llevado desde el panel—, las
preguntas que el panel tenía se cierran y dejan de contar como pendientes, salteadas incluidas:
ese mensaje es la respuesta. Las preguntas de un turno en el que el agente usó
`AskUserQuestion` no entran al panel: se contestaron ahí. Si el agente vuelve a preguntar algo
en una respuesta posterior, aparece de nuevo. Se encontró en la prueba en vivo de
`Systems/TodoList`: lo contestado por la tool o por el prompt seguía pendiente en el panel.

### RN-preg-apertura · origin: usuario 2026-10-17 (Q-05)
El panel se abre con `/nzt-questions`, y `/nzt-questions` otra vez lo cierra. Además se abre solo
al terminar un turno cuya respuesta trae preguntas nuevas, si hay lugar al costado; si no hay
lugar, avisa una vez que hay preguntas para contestar.

### RN-preg-sin-preguntas · origin: propuesta del agente, confirmada por el usuario (Q-06)
Sin preguntas pendientes, el panel lo dice y explica de dónde las toma.

### RN-preg-generico · origin: usuario 2026-10-17 (Q-07: "deberia ser generica … sin estar ligada a nzt")
El panel funciona igual en cualquier proyecto, use NZT o no. Es un mod **genérico**
(`RN-mod-tipo` de `specs/nzt-mods.md`).

### RN-preg-error · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si el panel no puede reconocer o mostrar las preguntas de una respuesta, entonces lo dice en su
propia superficie; un fallo del mod nunca frena un turno ni un prompt.

### RN-preg-alto · origin: mismo criterio que RN-hub-alto de `nzt-hub`
El panel tiene siempre el mismo alto. Si la lista o una pregunta no entran, se mueven con su propio
scroll y los botones no se mueven.

### RN-preg-escritorio · origin: H-24 de `specs/mods/revision-escritorio.md`, por QT-11, QT-12, H-17 y H-21 de nzt-files
**[modify]** En la app de escritorio el panel va en su pestaña sin marco, sin la cabecera ` NZT
Preguntas`, sin `Cerrar`, sin reglas y sin la línea de teclas, porque la pestaña de la app ya pone
título y cierre; sus botones van sin la ficha de su tecla, y por eso sin tecla: en la app se usa el
mouse, y no está `Ir a la lista`, que solo mueve el foco del teclado. Todo va entero y lo desplaza
el scroll de la app (RN-preg-alto no rige ahí): arriba cuántas van contestadas, la lista entera,
la pregunta con sus opciones y los campos de respuesta y nota, y debajo `Anterior`, `Siguiente`,
`Saltear` y, cuando hay alguna contestada, `Revisar y llevar al prompt ›` como botón principal de
la app (en la revisión, `Volver` y `Llevar al prompt ›`, el principal). Cada fila de la lista y
cada opción toma el clic en todo su largo y conserva sus colores (la marca, la recomendada); la
fila de la pregunta a la vista y la opción elegida tienen fondo. En la consola nada de esto cambia.

### RN-preg-pestaña · origin: RN-mod-pestaña de `specs/nzt-mods.md`
La pestaña dice **Preguntas** (Questions en inglés), y la cabecera ` NZT  Preguntas`, con una línea
en blanco entre las dos.

### RN-preg-idioma · origin: mismo criterio que RN-panel-idioma de `nzt-state`
Los textos del panel están en español (por defecto) o en inglés, según la opción de idioma del mod.
Las preguntas se muestran como las escribió el agente. La marca de recomendada se reconoce en los
dos idiomas, sea cual sea el del panel.

## Requisitos no funcionales
- Las preguntas de una respuesta aparecen en el panel en menos de un segundo después de que
  termina el turno (propuesta del agente, confirmada en Q-06).
- Pasar de una pregunta a la siguiente se ve en menos de medio segundo (ídem).

## Diseño (0.1.0, unidad 203)

Mockup: `specs/mods/nzt-questions/mockup.html`, un estado por hash (`#state=noted&place=dock`).
Conserva de `nzt-hub` la paleta aproximada, el borde en el acento, el alto fijo y Cerrar en la
última fila. Imita el panel en una terminal oscura; los colores reales los pone el tema de la
persona. Los datos son preguntas reales de este repo: QT-02 y QT-03 de `specs/nzt-mods.md`
sección 10, con opciones y recomendada, y dos preguntas numeradas sin opciones.
`update-when`: cambian RN-preg-de-a-una, -respuestas, -mensaje, -apertura o la forma de D64.

**Tarea.** Quien trabaja con el agente recibió varias preguntas en una respuesta y quiere
contestarlas sin escribir un prompt que las recorra. **Acción principal: elegir la respuesta de
la pregunta que se ve**; la del panel, cuando hay al menos una contestada, es **Revisar y llevar
al prompt** (RN-preg-mensaje).

**Una tarjeta** con borde redondeado en el acento, de arriba hacia abajo:
1. **Aire y cabecera** (RN-preg-pestaña): ` NZT  Preguntas` y, a la derecha, `n de m
   contestadas` (después de llevar: `n enviadas`).
2. **Índice** (RN-preg-fuentes, -de-a-una): una fila por pregunta pendiente, con su marca, su
   identificador y su texto cortado con `…`: `○` sin contestar, `●` contestada, `→` salteada,
   `✓` enviada (RN-preg-saltear, -enviadas). La elegida va en el color de Preguntas. Hasta 6
   filas al costado y 3 sobre el prompt; con más, `↓ n más` y scroll propio (RN-preg-alto). Un
   clic en una fila lleva a esa pregunta.
3. **Separador.**
4. **La pregunta elegida**, que ocupa lo que queda y se mueve sola si no entra:
   - `QT-03 · 2 de 4`, tenue, y el texto entero en negrita (RN-preg-forma).
   - Las opciones, la recomendada primero (RN-preg-de-a-una), **una línea corrida por opción**:
     `○ B · No la activa ★ recomendada — el README lo explica`, con el nombre en negrita y lo que
     el agente escribió después del nombre en tenue, a continuación. Si no entra, sigue abajo. La
     elegida lleva `●` en el color de Preguntas. Cambiado en la unidad 210 a pedido del usuario:
     con la explicación en su propio renglón *"se veia feo las opciones"*. **★ recomendada** sale solo si el agente la marcó
     (RN-preg-no-inventa).
   - **✎ Otra respuesta**, un campo de texto (RN-preg-respuestas). Sin opciones, el campo es la
     respuesta y arriba dice `Sin opciones: contestá con texto`.
   - **+ Nota**, un campo opcional (RN-preg-respuestas).
5. **Botones**: `◀ Anterior  Saltear  Siguiente ▶` y, en la última fila, `[ Cerrar ]` a la
   izquierda y **Revisar y llevar al prompt ›** a la derecha, con el fondo del color de
   Preguntas; apagado hasta que haya una contestada.

**Navegación (unidad 213, Q-11 a Q-15), reemplaza lo de arriba donde no coincide:**
- El **índice** sigue siendo una fila por pregunta con su texto (Q-15). Elegir una fila muestra
  esa pregunta y **pone el foco en su primera opción** (o en *Otra respuesta* si no tiene).
- **`a`** lleva el foco de la lista a las respuestas y de vuelta; el botón dice adónde va (*Ir a
  la respuesta* o *Ir a la lista*), según dónde esté el foco.
- Los botones muestran su atajo, `p: Anterior  n: Siguiente  s: Saltear  a: Ir a la lista`, la
  letra en el color de acento. Tab no puede ser atajo: el motor solo acepta una letra o un dígito.
- Elegir una opción **no** pasa a la siguiente. Contestar la que deja todas las pendientes
  contestadas muestra **Revisar** con el foco en *Llevar al prompt ›*.
- Abajo, en este orden: la fila de navegación (o `p: Volver` en Revisar), un separador, la fila
  de `c: Cerrar` y el botón principal, y una línea tenue con las teclas de esa vista.

**Revisar** reemplaza la pregunta por el mensaje tal como va a quedar, una línea por pregunta
contestada (`QT-02: A — main, igual que a mano`, `3: Que quede en el prompt`), cuántas se
saltearon, y **Llevar al prompt ›**; `◀ Volver` regresa sin perder nada. **Llevado**: `✓ Está en
el prompt. Revisalo y apretá Enter.`, el mensaje, las salteadas que siguen pendientes y **Llevar
otra vez ›** (RN-preg-enviadas). Con borrador: `Se agregó después de lo que ya tenías escrito.`
(RN-preg-borrador).

**Estados**, todos en el mockup, al costado (40 filas), sobre el prompt (24) y al costado
angosto (40 columnas): llegaron preguntas; opción elegida; otra respuesta; con nota; pregunta
sin opciones; revisar; llevado al prompt; había un borrador; sin preguntas (RN-preg-sin-
preguntas); muchas preguntas (12, el índice con scroll); pregunta larga con cinco opciones (la
pregunta se mueve, los botones no); no se pudo leer (RN-preg-error: el motivo y que las
anteriores siguen); y, fuera del panel, el **aviso** cuando no hay lugar al costado
(RN-preg-apertura).
- *Cargando* no aplica: las preguntas salen del texto que el turno ya entregó.
- *Sin permiso* no aplica: el panel no lee nada protegido.

**Panel angosto** (46 columnas o menos): los botones dicen `◀`, `Siguiente`, `Revisar ›`,
`Llevar ›`. El índice corta el texto, nunca la marca ni el identificador. De 34 columnas para
abajo, `Revisar ›` y `Llevar ›` pierden la palabra del medio.

**Textos del panel:** todos los que no copian una regla (`Así queda el mensaje`, `Sin opciones:
contestá con texto`, el del aviso, las etiquetas de los botones) son propuesta del agente
(Q-08).

**Teclas** (propuesta del agente, Q-08, mismas letras que `nzt-changes`): flechas o Tab para
recorrer, Enter elige, `n` siguiente, `p` anterior, `s` saltear, Escape cierra.

**Medido** en el mockup (Chrome sin ventana, 2026-10-17):
- A 320 px y a 800 px, en los tres lugares y los 13 estados (78 combinaciones), ninguno tiene
  scroll horizontal ni elementos que se salgan de la tarjeta. La primera medición encontró el
  botón principal cortado a 320 px; se corrigió acortando su texto según el ancho del panel.
- El panel mide lo mismo en todos los estados (802 px al costado, 482 sobre el prompt).

**Contraste**, sobre los pares del mockup, todos AA:

| Texto | Contraste |
|---|---|
| Respuesta escrita en el campo | 13,9 |
| Lo que dice cada opción | 10,4 |
| Salteada (amarillo) | 10,1 |
| Texto del botón principal sobre el rosa | 8,5 |
| Pregunta elegida y opción elegida (rosa) | 7,8 |
| Enviada (verde) | 7,8 |
| ★ recomendada (acento) | 5,6 |
| Tenue | 5,4 |

El botón principal apagado (tenue sobre gris, 4,2) no llega a AA. WCAG no lo exige para un
control deshabilitado.

**Teclado**: el orden de Tab es el índice, las opciones, los botones de navegación, Cerrar y el
principal, contado sobre los elementos del mockup. Los campos de texto son imitaciones y no
reciben foco en el mockup, así que no se recorrió con teclado de verdad.

## Diseño técnico (0.1.0, unidad 205)

Cómo se resuelve sobre Claude Code 2.1.302. Las decisiones y sus fuentes están en *Preguntas
técnicas*; acá va solo el resultado.

**Piezas.** `mods/nzt-questions/` con `register.tsx` (todo lo que usa `$`: hooks, panel, estado,
prompt), `parse.ts` (de un texto a una lista de preguntas, sin `$`), `message.ts` (de las
respuestas al mensaje, sin `$`), `i18n.ts` y `types/index.d.ts` (QT-11). `nzt-state` suma una
lectura (flujo 4).

### Flujos

1. **Llegan preguntas.**
   1. `turn.complete` del hilo principal (`agentId` ausente) y no cortado (`isAborted` falso)
      (QT-01, QT-08).
   2. `parse.ts` saca las preguntas del `answer` con las reglas de QT-07, cada una con su clave
      (QT-09). Si falla, el panel muestra el error y conserva lo que tenía (RN-preg-error).
   3. Se mezclan con las de `$.state` por clave. Una clave nueva entra pendiente. Una que ya
      estaba toma el texto y las opciones nuevos, y su respuesta se conserva si la opción
      elegida sigue con el mismo nombre; si no, vuelve a pendiente marcada como cambiada (Q-09).
   4. Si entró alguna clave nueva, `$.ui.open`; si vuelve con `isPlaced` falso, un `$.ui.toast`
      por turno (QT-04, RN-preg-apertura).
2. **Contestar.** Los botones y los `Input` del panel escriben la respuesta, la nota o el salteo
   en `$.state`, desde `onPress` y `ui.input`, nunca mientras se dibuja.
3. **Llevar al prompt.**
   1. `message.ts` arma las líneas de las contestadas (QT-10).
   2. `$.prompt.read` dice si el borrador termina en salto de línea; si no, el mensaje empieza
      con uno.
   3. `$.prompt.fill({ text, mode: 'append' })` (QT-03). Con `isFilled` verdadero, las
      llevadas pasan a enviadas; si es falso, el panel dice que no pudo y nada cambia de estado.
4. **El aviso de `nzt-state`.** `nzt-questions` mantiene `pending` en `$.state`: las preguntas
   que no están enviadas. `nzt-state` lo lee con `$.state.get({ plugin: 'nzt-questions', key:
   'pending' })` al dibujar; con más de 0, el aviso, y **Contestar ›** corre `/nzt-questions`
   como lo hace `nzt-hub` (QT-05, a probar en la 209).

### Dónde se cumple cada regla

| Regla | Dónde |
|---|---|
| RN-preg-fuentes | el hook de `turn.complete`, que descarta subagentes |
| RN-preg-forma, RN-preg-no-inventa | `parse.ts`: devuelve solo lo que está en el texto |
| RN-preg-una-vez | la mezcla por clave del flujo 1.3 |
| RN-preg-de-a-una, -respuestas, -saltear | el panel en `register.tsx` |
| RN-preg-mensaje | `message.ts` |
| RN-preg-borrador | el modo `append` y el salto de línea del flujo 3.2 |
| RN-preg-enviadas | el flujo 3.3, solo con `isFilled` |
| RN-preg-apertura | el flujo 1.4 |
| RN-preg-error | el flujo 1.2 y el 3.3 |
| RN-preg-idioma | `i18n.ts` y la opción `idioma` (QT-12) |
| RN-panel-preguntas (`nzt-state`) | el flujo 4 |

### Datos

En `$.state`, declarados en `types/index.d.ts` (QT-02); nada en `$.store` ni en archivos.
- `questions`: cada pregunta con su clave, su identificador si lo tiene, su texto, sus opciones
  (letra, nombre, explicación, si es la recomendada), su estado, si cambió, y su respuesta (opción,
  texto, nota).
- `current`: la clave de la pregunta que se ve.
- `pending`: cuántas no están enviadas. Es lo que lee `nzt-state`.
- `view`: qué muestra el panel debajo del índice: la pregunta, el mensaje a revisar o el llevado.
- `sent`: el mensaje como se llevó al prompt, para *Llevar otra vez*.
- `notice`: lo que dejó la última acción: el reconocimiento que falló, el prompt que no tomó el
  mensaje o el borrador que se conservó.

Se sumaron al construir (unidad 207): sin `view` y `sent` en `$.state`, una recarga del mod
volvía a la pregunta y perdía el mensaje llevado.

**En la app de celular** no hay campos de texto (`Input` no está en esa superficie, tipos de la
2.1.302): ahí una pregunta se contesta solo con sus opciones. Una sin opciones no se puede
contestar desde el panel en el celular.

**Lo que se congela:** el texto que se llevó al prompt. Si después el agente reescribe la pregunta,
lo enviado no cambia.

### Estados de una pregunta

`pendiente → contestada → enviada`; `pendiente → salteada → contestada`; `contestada →
pendiente`, solo cuando el agente la reescribe y la opción elegida ya no está (Q-09). Una enviada
se puede llevar otra vez (RN-preg-enviadas) y sigue enviada.

**Q-10 (usuario 2026-10-17):** si el agente vuelve a hacer una pregunta ya enviada,
con la misma clave, se toma como que no le llegó la respuesta y vuelve a pendiente, con la
respuesta anterior cargada para reenviarla.

### Cuando algo falla

- **El reconocimiento falla:** el panel lo dice y conserva lo que tenía; el turno no se frena.
- **`$.prompt.fill` no escribe:** nada pasa a enviado y el panel lo dice. Se puede reintentar.
  Llevar dos veces es seguro: el estado no cambia hasta que se escribe, y llevar otra vez está
  permitido.
- **`nzt-state` no puede leer `pending`:** no muestra el aviso, como si no hubiera
  `nzt-questions`.

Sin integraciones externas.

## Preguntas

### Q-01 · ¿Un mod nuevo o una pestaña en `nzt-state`?
- bloquea: dónde vive el panel y sus reglas
- respuesta: mod nuevo, `nzt-questions`; `nzt-state` avisa cuando hay preguntas abiertas.
  · usuario 2026-10-17

### Q-02 · ¿De dónde toma las preguntas?
- bloquea: RN-preg-fuentes, RN-preg-forma
- opciones: A leer el texto del agente; B una tool propia del mod; C las dos, más la capa NZT.
- respuesta: C. Después, con la regla en el kernel (D64), C': sin tool propia y sin interceptar
  `AskUserQuestion` en la 0.1. · usuario 2026-10-17 · La capa NZT la saca Q-07.

### Q-03 · Al terminar de contestar, ¿el mensaje se manda solo o queda en el prompt?
- bloquea: RN-preg-mensaje
- respuesta: queda en el prompt para revisarlo. · usuario 2026-10-17

### Q-04 · ¿Se suma el tipo genérico/NZT al catálogo y `nzt-hub` agrupa por tipo?
- bloquea: la fila del catálogo y la spec de `nzt-hub`
- respuesta: sí, en esta corrida. · usuario 2026-10-17

### Q-05 · ¿El panel se abre solo cuando llegan preguntas?
- bloquea: RN-preg-apertura
- opciones:
  - **A · Se abre solo** si hay lugar al costado, y si no avisa una vez *(recomendada)*.
  - **B · Solo con `/nzt-questions`**.
- respuesta: A, se abre solo. · usuario 2026-10-17, por la tool de preguntas

### Q-06 · ¿Confirmás las propuestas del agente de la unidad 199?
- bloquea: que las reglas con origin "propuesta del agente" cuenten como acordadas
- respuesta: *"Esta perfecto que no invente opciones"*, y sumó Q-07. Las demás propuestas
  (una vez, saltear, borrador, enviadas, sin preguntas, los dos tiempos) no las objetó; el agente
  las da por confirmadas y las nombra en el resumen al usuario. · usuario 2026-10-17

### Q-07 · ¿El mod va atado a NZT o es genérico?
- bloquea: RN-preg-forma, RN-preg-fuentes, la capa NZT y el tipo en el catálogo
- respuesta: *"nzt-questions deberia ser generica … sin estar ligada a nzt digamos y que siempre que
  haya preguntas aparezcan por ahi … sin tener que ligarlo a que lea el formato QT o cosas asi"*.
  El agente estuvo de acuerdo: el reconocimiento pasa a ser por forma, y sale la lectura de
  documentos, porque en NZT lo pendiente ya lo retoma el estado. Lo que se pierde: tras un
  `/clear`, el panel no muestra preguntas viejas hasta que el agente las repite. · usuario 2026-10-17

### Q-08 · ¿Confirmás los textos y las teclas del panel? (unidad 203)
- bloquea: que los textos y las teclas de la sección Diseño cuenten como acordados
- propuesta del agente: los del mockup; el color de Preguntas, un rosa, y su glifo `?` en
  `nzt-hub`.
- respuesta: confirmado todo. · usuario 2026-10-17, por la tool de preguntas

### Q-09 · Si el agente reescribe una pregunta que ya contestaste y todavía no llevaste al prompt, ¿qué pasa con tu respuesta?
- bloquea: RN-preg-una-vez (dice que gana la versión nueva, no qué pasa con la respuesta) y el
  diseño técnico (QT-07)
- salió al derivar las preguntas técnicas de la unidad 205
- opciones:
  - **A · Se conserva si la opción elegida sigue existiendo con el mismo nombre; si no, se
    descarta y la pregunta vuelve a pendiente, marcada como cambiada** *(recomendada)*: no se
    pierde trabajo cuando el agente solo corrige una coma, y no se manda una respuesta a una
    opción que ya no existe.
  - **B · Se descarta siempre** y la pregunta vuelve a pendiente: más simple, pero se recontesta
    lo que no cambió.
  - **C · Se conserva siempre**: nada se pierde, pero puede llegar al agente una respuesta a una
    pregunta que cambió de sentido.
- respuesta: A, se conserva si la opción elegida sigue existiendo con el mismo nombre. · usuario 2026-10-17, por la tool de preguntas

### Q-10 · Si el agente vuelve a hacer una pregunta que ya enviaste, ¿qué pasa?
- bloquea: los estados de una pregunta del diseño técnico
- salió al escribir el diseño técnico (unidad 205)
- propuesta del agente: vuelve a pendiente, con la respuesta anterior cargada para reenviarla; si
  el agente la repite, lo más probable es que no le haya llegado.
- respuesta: aceptada la propuesta. · usuario 2026-10-17

### Q-11 a Q-14 · Navegación del panel (unidad 210, al probarlo en vivo)
- salió de: *"el boton revisar y llevar al prompt se ve raro, esta muy encimado al boton siguiente
  … deberiamos hacer mas navegable este panel"* (usuario 2026-10-17).
- investigado (tipos de Claude Code 2.1.302, leídos el 2026-10-17): el atajo de un `Button` es un
  dígito o una letra minúscula y nada más, así que el mod no puede tomar las flechas; con el panel
  enfocado, las flechas desplazan el contenido, y Tab recorre los elementos. `$.ui.focus` mueve el
  foco a un elemento dibujado.
- **Q-11 · ¿Al elegir una opción, pasa solo a la próxima?** respuesta: **no**, queda en la pregunta
  y se sigue con `n`. · usuario 2026-10-17, por la tool de preguntas
- **Q-12 · ¿Las opciones se eligen con su número?** respuesta: **no**, con Tab y Enter, como hoy.
  · usuario 2026-10-17, por la tool de preguntas
- **Q-13 · ¿El índice pasa a una fila de pestañas arriba?** respuesta: **sí**, `● QT-90  ○ QT-91
  ○ 3`, clickeables; si no entran, la fila se corta y dice cuántas quedan. · usuario 2026-10-17,
  por la tool de preguntas
- **Q-14 · ¿Al contestar la última, muestra solo el mensaje para revisar?** respuesta: **sí**, con
  el foco en *Llevar al prompt ›*. Como no avanza solo (Q-11), "la última" es la que deja todas
  las pendientes contestadas. · usuario 2026-10-17, por la tool de preguntas
- **Q-15 · Probado en vivo, ¿cómo queda?** respuesta: **el índice vuelve a la lista** con el texto
  de cada pregunta (*"las preguntas no las quiero en una sola fila, se me hace raro"*, reemplaza
  Q-13); `n` y `p` se quedan y se ven en sus botones; y un atajo pasa de la lista a las respuestas
  (*"tengo que seguir bajando … por cada pregunta hasta llegar al de respuestas"*). La tecla `a` y
  llevar el foco a la primera opción al elegir una fila son propuesta del agente.
  · usuario 2026-10-17
- propuesta del agente, no objetada: los botones de navegación en su fila, un separador y abajo
  `[ Cerrar ]` y el principal en una fila aparte (arregla el encimado), y una línea tenue al pie
  con las teclas.

## Preguntas técnicas (unidad 205)

Registro **append-only**: una respuesta superada se marca con lo que la reemplazó, nunca se
borra. Origen de cada entrada: `usuario`, `agente, dentro del alcance`, `investigado` (con fuente y
fecha) o `propuesta`. Fuente de lo investigado: los tipos de Claude Code 2.1.302
(`claude-code.d.ts` y `reference.md` del plugin-authoring de esa versión), leídos el 2026-10-17.

Modo para los detalles: **juntos**, una ronda · usuario 2026-10-17. Diagrama de secuencia: ofrecido y no pedido; el flujo va en lista.

### QT-01 · ¿De dónde salen, en tiempo de ejecución, las respuestas del agente?
- investigado: `turn.complete` trae `answer`, el texto final visible del turno, y `agentId` solo
  cuando el turno es de un subagente; `isAborted` dice si se cortó.
- respuesta: un hook en `turn.complete`, solo con `agentId` ausente (RN-preg-fuentes, subagentes
  afuera). · investigado
- abierto como detalle (QT-08): qué hacer con un turno cortado.

### QT-02 · ¿Dónde se guardan las preguntas pendientes, contestadas y enviadas?
- investigado: `$.state` es de la sesión y sobrevive a la recarga del mod; `$.store` dura entre
  sesiones; las variables del módulo se pierden al recargar.
- respuesta: en `$.state`, declarado en `types/index.d.ts`. La spec pide las de esta sesión
  (RN-preg-fuentes), así que no van a `$.store`. · investigado

### QT-03 · ¿Cómo llega el mensaje al prompt sin pisar el borrador?
- investigado: `$.prompt.fill({ text, mode })`, con `mode` `replace`, `append` o `insert`; no manda
  nada, la persona edita o aprieta Enter.
- respuesta: `mode: 'append'` (RN-preg-mensaje, RN-preg-borrador). · investigado

### QT-04 · ¿Cómo se abre solo, y cómo sabe que no hay lugar?
- investigado: `$.ui.open` sin que la persona lo pida se ubica desde 144 columnas (110 si ya lo
  abrió antes); debajo queda esperando sin dibujarse y devuelve `{ isPlaced: false, reason }`.
  `$.ui.toast` muestra un aviso unos segundos.
- respuesta: al llegar preguntas nuevas, `$.ui.open`; con `isPlaced` falso, un `$.ui.toast` por
  turno (RN-preg-apertura). Si después la terminal se agranda, el panel aparece solo. · investigado

### QT-05 · ¿Cómo lee `nzt-state` cuántas preguntas pendientes hay?
- investigado: `$.state.get({ plugin, key })` lee el valor de otro plugin "como lo declara el
  contrato de su dueño"; un valor nunca escrito es `undefined`; escribir el de otro se rechaza. El
  contrato de otro plugin llega a los tipos cuando se lo lista en `dependencies` del
  `plugin.json`.
- sin verificar: si listar `nzt-questions` en `dependencies` obliga a tenerlo instalado (rompería
  RN-panel-preguntas: sin `nzt-questions`, `nzt-state` no muestra nada), y si `claude plugin
  validate` acepta leer la clave sin esa dependencia.
- propuesta: `nzt-questions` publica `pending` (un número) en `$.state`; `nzt-state` lo lee con
  `$.state.get`. Se prueba en la unidad 209 con los dos mods cargados y con `nzt-questions`
  desinstalado. Si la prueba falla, vuelve como pregunta con alternativas.
- unidad 209 (2026-10-17): sin `dependencies`. `nzt-state` declara `nzt-questions.pending` en su
  propio contrato para que el tipo cierre, y validate lo acepta (*"state of other plugins, not
  checked"*). Con `nzt-questions` ausente, la lectura se rechaza y cuenta como cero, probado en
  test. La prueba con los dos mods cargados en vivo queda para la 210.

### QT-06 · ¿Qué elementos dibujan los campos de texto?
- investigado: las tablas de elementos de las superficies traen `Input` (`InputProps`), y
  `ui.input` avisa cuando cambia o se confirma.
- respuesta: `Input` para *Otra respuesta* y *Nota*. · investigado

### QT-07 · Reglas exactas del reconocimiento (RN-preg-forma)
- abierto, detalle: qué líneas cuentan (numeradas, viñetas, títulos, negrita), qué se ignora
  (bloques de código, citas), qué es "la lista justo debajo" (¿una línea en blanco de por medio?),
  cómo se separa el nombre de una opción de su explicación (` — `, `:`), qué patrones son un
  identificador, y que una opción que termina en `?` no es una pregunta nueva.
- respuesta: toda línea que termina en `?` fuera de bloques de código y citas (numerada, viñeta, título o negrita); opciones, la lista justo debajo con una línea en blanco permitida; el nombre llega hasta ` — ` o `: `; una viñeta que termina en `?` es opción, no pregunta. · usuario 2026-10-17, ronda juntos por la tool de preguntas

### QT-08 · Turno cortado y preguntas "nuevas"
- abierto, detalle: si un turno con `isAborted` aporta preguntas, y qué cuenta como "nueva" para
  abrirse solo (una clave que no estaba en la sesión).
- respuesta: un turno con `isAborted` no aporta preguntas; se abre solo cuando llega una pregunta con una clave que no estaba en la sesión. · usuario 2026-10-17, ronda juntos por la tool de preguntas

### QT-09 · Clave de una pregunta y qué pasa al reescribirla
- abierto, detalle: la clave (el identificador, o el texto normalizado sin él) y, cuando se
  responda Q-09, cómo se aplica.
- respuesta: la clave es el identificador con letras si lo hay (`QT-03`, `Q-1`, `#4`); si no, el texto normalizado. El número de una lista no es clave. Q-09 se aplica comparando el nombre de la opción elegida. · usuario 2026-10-17, ronda juntos por la tool de preguntas

### QT-10 · Formato exacto del mensaje
- abierto, detalle: separadores, cómo va la nota, qué número lleva una pregunta sin identificador,
  y si el mensaje empieza en línea nueva cuando el borrador no termina en una.
- respuesta: solo las líneas, una por pregunta (`QT-02: A — main, igual que a mano`, `3: Que quede en el prompt`), la nota como ` · nota: …`, y un salto de línea antes si el borrador no termina en uno. · usuario 2026-10-17, ronda juntos por la tool de preguntas

### QT-11 · Cómo se arma el módulo
- abierto, detalle: qué va en `register.tsx` (todo lo que usa `$`, por la regla de los mods) y qué
  en módulos puros con tests (reconocimiento, mensaje), siguiendo a `nzt-hub`.
- respuesta: como `nzt-hub`: todo lo que usa `$` en `register.tsx`; `parse.ts` y `message.ts` puros con tests; `i18n.ts` y `types/index.d.ts`. · usuario 2026-10-17, ronda juntos por la tool de preguntas

### QT-12 · Opción de idioma
- abierto, detalle: `idioma` `es`/`en`, `es` por defecto, como los otros mods (RN-preg-idioma).
- respuesta: opción `idioma`, `es` o `en`, `es` por defecto. · usuario 2026-10-17, ronda juntos por la tool de preguntas

## Tests

**0.3.0 (unidad 365, 2026-10-25): 33 tests**, todos pasan, más `claude plugin validate`; `tsc` no
corrió (no hay compilador instalado). Los de la consola siguen igual; seis nuevos prueban la app:
sin marco, alto, Cerrar, reglas, línea de teclas, `Ir a la lista` ni fichas (y la consola con
ellos), la lista entera con el clic en el extremo derecho de la fila, la opción elegida con su
color y la recomendada en el acento, llevar al prompt con el botón principal, y la rueda que sigue
a la app cuando el panel es más alto que el cuerpo. **No cubierto hasta QA:** cómo pinta la app el
fondo con transparencia y el hover de la fila sobre la región, y que la rueda le llegue de verdad.

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba. Empieza en 0.2.0: lo anterior está
en el encabezado.

### 2026-10-24 · Lo contestado afuera se cierra — 0.2.0
Type:     add
Change:   un mensaje que no es comando cierra las preguntas pendientes, salteadas incluidas, y un turno que preguntó con `AskUserQuestion` no deja las suyas en el panel.
Reason:   el usuario, en la prueba en vivo: "si la contesto con la tool o por prompt el mod de preguntas no se actualiza queda con preguntas viejas que ya fueron respondidas".
Before:   solo se cerraba lo llevado al prompt desde el panel; lo demás quedaba pendiente para siempre.
Now:      el mensaje de la persona es la respuesta; lo que el agente vuelve a preguntar aparece de nuevo.
Impact:   RN-preg-contestadas-afuera nueva · RN-preg-enviadas sigue igual hasta que se manda un mensaje
Decision: QT-08 del usuario, "al mandar cualquier mensaje"; descartado cerrar solo lo nombrado por id.
