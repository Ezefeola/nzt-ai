# Mod · nzt-hub — panel principal de los mods

> Estado: **aceptado** por el usuario en 0.1.0 el 2026-10-16 ("Acepto nzt-hub y nzt-changes,
> queda todo aprobado") y cerrado (unidad 157); 0.2.0, grupos por tipo y `nzt-questions`,
> aceptado tras probarlo en vivo el 2026-10-17 (unidad 210) y cerrado; **0.3.0 en curso**: sin
> `nzt-context`, que se retira ya (M4 de `specs/nzt-mods.md`, unidad 226); **0.4.0 construida**
> en la unidad 239 (2026-10-18), sin aceptar: la tarjeta Aspecto de `nzt-look`, que sale con su
> publicación (aprobado el 2026-10-17, unidades 218 y 225).
> Marcas `[add]`, `[modify]` y `[remove]` hasta cerrar cada una; código en `mods/nzt-hub/`; Historia al final · mockup en
> `specs/mods/nzt-hub/mockup.html` (unidades 153 y 158, dirección C) · Depende de: `specs/nzt-mods.md` (reglas de todo mod y catálogo de la sección 5).
> El usuario pidió el mod el 2026-10-14: "un panel principal que tenga botones por cada MOD de
> NZT para poder verlos en un lugar y para que es cada uno y que desde el mismo se pueda
> navegar a cada uno, y otras cosas que elijamos". Propuso el nombre `nzt-panel`; quedó
> `nzt-hub` (Q-01). Lo que decidió el agente está marcado como propuesta: cuenta como
> acordado cuando el usuario lo confirma.

## Qué resuelve

Los mods de NZT son varios (`nzt-state`, `nzt-changes`, `nzt-files`, `nzt-questions` y, desde 0.4.0, `nzt-look`) y cada uno
se abre con su propio comando. Para usarlos hay que recordar que existen, cómo se llaman y para
qué sirve cada uno. El panel los junta en un lugar: qué hay, para qué es cada uno, y un botón
que lleva a cada uno.

## Alcance

**Adentro**
- Un panel lateral, abierto con `/nzt-hub`, con una tarjeta por cada mod de NZT.
- En cada tarjeta, el nombre del mod, para qué sirve en una línea y su versión instalada.
- Un botón por mod que abre su panel y cierra este.
- Los mods que no están instalados, con un botón que copia el comando para instalarlos.
- Español e inglés.

**Afuera**
- **Instalar, actualizar o desinstalar mods desde el panel.** No se pidió y cambia la
  configuración de Claude Code; el panel solo copia el comando para instalarlo (Q-02, Q-07).
- **Resumen de la corrida, contexto usado y atajos a las skills NZT.** Se ofrecieron como
  extras y el usuario eligió solo la versión (Q-03). El resumen está en `nzt-state` y el
  contexto en la banda de `nzt-look`. [modify]
- **Abrirse solo al empezar la sesión.** Propuesta del agente (Q-05): se abre cuando se pide.
- **Cambiar las opciones de un mod** (su idioma, por ejemplo). Se hacen donde Claude Code las
  maneja.
- **Mostrar mods que no son de NZT.** El pedido es "cada MOD de NZT".
- **Escribir artefactos de NZT.** `RN-mod-lee-no-escribe` de `specs/nzt-mods.md`.

## Reglas

### RN-hub-ubicacion · origin: propuesta del agente (Q-05, mismo lugar que `nzt-files`)
El panel se abre al costado de la conversación con `/nzt-hub`, y `/nzt-hub` otra vez lo
cierra. Si no hay lugar al costado, se abre sobre el prompt y `/nzt-hub` dice dónde quedó.
No se abre solo al empezar la sesión.

### RN-hub-tarjetas · origin: usuario 2026-10-14 ("botones por cada MOD de NZT ... para que es cada uno")
El panel muestra una tarjeta por cada mod de NZT, con su nombre y para qué sirve en una línea.

### RN-hub-catalogo · origin: propuesta del agente; los grupos, usuario 2026-10-17
Los mods que aparecen son los del catálogo de `specs/nzt-mods.md` (sección 5), agrupados por
tipo (RN-hub-grupos) y, dentro de cada grupo, en el orden del catálogo. El panel no se muestra
a sí mismo.

### RN-hub-grupos · origin: usuario 2026-10-17 ("me gusta tu propuesta con lo de que nzt-hub agrupe por tipo"); el orden y los títulos, propuesta del agente
Las tarjetas van en dos grupos, cada uno con su título: primero **Con el método NZT** (los mods
de tipo NZT) y después **Para cualquier proyecto** (los genéricos, con o sin capa NZT), según
`RN-mod-tipo` de `specs/nzt-mods.md`. Un grupo sin mods no se muestra.

### RN-hub-capa-nzt · origin: propuesta del agente
La tarjeta de un mod genérico con capa NZT lo dice en su línea de para qué sirve, para que se
entienda por qué está entre los genéricos y nombra cosas del método.

### RN-hub-version · origin: usuario 2026-10-14 (Q-03: "Versión de cada mod")
La tarjeta de un mod instalado muestra la versión instalada.

### RN-hub-no-instalado · origin: usuario 2026-10-14 (Q-02: "Sí, con cómo instalarlo"; la forma, Q-07)
Un mod de NZT que no está instalado aparece igual, tenue, con la palabra "no instalado" y,
en lugar de Abrir, el botón **Copiar instalación**.

### RN-hub-copiar · origin: usuario 2026-10-14 (Q-07: "un boton que tenga para copiar el comando de instalacion")
Cuando se aprieta Copiar instalación, `/plugin install <mod> --marketplace Ezefeola/nzt-ai`
queda en el portapapeles y la fila dice "✓ Copiado · pegalo en el prompt y apretá Enter."

### RN-hub-copiar-falla · origin: propuesta del agente (Claude Code avisa si no pudo copiar, tipos 2.1.299, `$.ui.copy`)
Si la terminal no deja copiar, entonces la fila dice "No se pudo copiar" y muestra el comando
entero para seleccionarlo a mano; el comando nunca se corta con `…`.

### RN-hub-abrir · origin: usuario 2026-10-14 ("que desde el mismo se pueda navegar a cada uno")
El botón de una tarjeta abre el panel de ese mod, igual que si la persona escribiera su
comando.

### RN-hub-cede · origin: usuario 2026-10-14 (Q-04: "Se cierra")
Cuando el botón abre otro mod, este panel se cierra y el mod abierto toma su lugar. Se vuelve
con `/nzt-hub`.

### RN-hub-espera · origin: propuesta del agente (cómo se comporta Claude Code, tipos 2.1.299, `$.command.run`: "queued and run once the session is idle")
Mientras Claude está trabajando en un turno, un botón apretado no abre el panel enseguida: la
tarjeta dice que se abre al terminar el turno, y se abre entonces.

### RN-hub-sin-comando · [remove] · código —
Deja de existir la tarjeta sin botón que dice dónde se ve el mod (*barra sobre el prompt*). Solo
la usaba `nzt-context`; con él fuera del catálogo, todos los mods tienen panel (Q-09). Si un mod
futuro no tiene panel, la regla vuelve con ese caso.

### RN-hub-error · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si abrir un mod falla, entonces su tarjeta dice que no se pudo y el resto del panel sigue
funcionando.

### RN-hub-alto · origin: propuesta del agente (mismo criterio que RN-files-alto de `nzt-files`)
El panel tiene siempre el mismo alto. Si las tarjetas no entran, la lista se recorre con su
propio scroll y el botón Cerrar no se mueve.

### RN-hub-acento · origin: mismo criterio que RN-cambios-acento de `nzt-changes` (usuario 2026-10-14)
El panel sigue la estética de NZT: el acento y la etiqueta NZT de los otros mods.

### RN-hub-idioma · origin: mismo criterio que RN-panel-idioma de `nzt-state`
Los textos del panel están en español (por defecto) o en inglés, según la opción de idioma del
mod, que se elige al instalarlo.

## Requisitos no funcionales
- Abrir el panel o apretar un botón con la sesión libre se ve en menos de medio segundo
  (propuesta del agente).

## Diseño (0.3.0 y 0.4.0, unidades 218 y 225) · [modify]

Mockup `specs/mods/nzt-hub/mockup.html`, que dibuja **0.4.0**; 0.3.0 es el mismo sin la fila de
Aspecto y con `n de 4`. Lo demás de 0.2.0 y 0.1.0, abajo, sigue valiendo salvo lo que nombra a
Contexto. La 0.3.0 se separó de la 0.4.0 en la 225: `nzt-context` se retira ya, y una tarjeta de
`nzt-look` antes de publicarlo copiaría un comando de instalación que falla (usuario 2026-10-17:
"ok").

**0.3.0, ahora:**
- **Sale Contexto** (◔ azul, *barra sobre el prompt*). Con ella se va lo que cedía en un panel
  angosto `barra sobre el prompt`. [remove]
- La portada cuenta `n de 4 instalados`. [modify]

**0.4.0, con la publicación de `nzt-look`:**
- **Entra Aspecto** (`nzt-look`), última del grupo *Para cualquier proyecto*, en el orden del
  catálogo: glifo **◐** en el azul que tenía Contexto; título **Aspecto** / **Look** (Q-10); línea
  *Temas, banda de uso con las marcas 30/40 de NZT y la conversación redibujada.* /
  *Themes, a usage band with NZT's 30/40 marks and a redrawn conversation.* Lleva **Abrir ›**,
  que corre `/nzt-look`, o **Copiar instalación** si no está (Q-08). [add]
- La portada vuelve a contar `n de 5 instalados`.
- **Sin medir todavía:** el mockup cambió una fila por otra del mismo largo; la medición a 320 y
  800 px se repite al construir cada versión.

**Criterios de 0.3.0** (código ✓ · qa —; construido en la 226, el test *every installed mod has
its button, and none is the context bar any more* prueba la ausencia):
- [ ] Con `nzt-context` 0.2.0 todavía instalado en la máquina, el hub muestra cuatro tarjetas, la
  portada dice `4 de 4 instalados` y ninguna tarjeta se llama *Contexto*. [remove]
- [ ] Con los cuatro mods instalados, ninguna tarjeta dice *barra sobre el prompt*: todas llevan
  **Abrir ›**. [remove]

**Criterios de 0.4.0** (código ✓ · qa —; construido en la 239: el primero y el tercero los prueba
el test *Aspecto is the last of the generic mods, and without nzt-look it copies its install*; el
segundo usa el mismo **Abrir ›** de los otros mods y no tiene test propio):
- [ ] Con los cinco mods instalados, el grupo *Para cualquier proyecto* muestra Cambios, Archivos,
  Preguntas y Aspecto, en ese orden, y Aspecto dice `v0.2.0` y **Abrir ›**. [add]
- [ ] Apretar Abrir en Aspecto abre `/nzt-look` y el hub se cierra (RN-hub-abrir, RN-hub-cede). [add]
- [ ] Sin `nzt-look` instalado, su tarjeta dice `no instalado` y Copiar instalación copia
  `/plugin install nzt-look --marketplace Ezefeola/nzt-ai`. [add]

## Diseño (0.2.0, unidad 204)

Mockup `specs/mods/nzt-hub/mockup.html` actualizado; lo demás de la sección Diseño de 0.1.0, abajo,
sigue valiendo.
- **Dos grupos** debajo del separador, cada uno con su título tenue en mayúsculas, como las
  secciones de `nzt-state`: `CON EL MÉTODO NZT` (Estado) y `PARA CUALQUIER PROYECTO` (Contexto,
  Cambios, Archivos, Preguntas). Una fila en blanco antes del segundo título (RN-hub-grupos).
- **Preguntas**: glifo `?` en rosa; *Las preguntas del agente, de a una y con opciones, al prompt
  en un mensaje.* El glifo, el color y el texto, propuesta del agente (Q-08 de
  `specs/mods/nzt-questions/spec.md`).
- **Contexto** dice *con las marcas 30/40 de NZT* (RN-hub-capa-nzt; 0.4.1, D80) [modify].
- La portada cuenta `n de 5 instalados`, con un punto por mod.
- **Arreglo del mockup de 0.1.0:** a 320 px, `se abre al terminar el turno` se salía de la tarjeta
  en el estado *Claude trabajando* (medido el 2026-10-17; la medición de 0.1.0 miraba solo el
  scroll horizontal). Ahora en un panel angosto dice `al terminar el turno` y cede con `…` antes
  que el nombre. **La unidad 208 revisa si el código tiene el mismo desborde.** Lo tenía: la
  caja del texto no podía achicarse. Ahora se achica y corta con `…`, y debajo de 40 columnas
  de fila dice `al terminar el turno`. Revisado leyendo el código, sin test: el estado necesita
  un comando que no termine; mirado en vivo en la 210 por el usuario, sin desborde.
- **Medido** (Chrome sin ventana, 2026-10-17): a 320 px y a 800 px, al costado y sobre el prompt,
  los 9 estados sin scroll horizontal ni elementos fuera de la tarjeta (36 combinaciones), y el
  mismo alto en todos (802 y 482 px). Contraste nuevo: títulos de grupo 5,4 y `Abrir ›` sobre el
  rosa 8,5, los dos AA.

## Diseño (0.1.0, unidades 153 y 158 · dirección C, "Portada")

Mockup: `specs/mods/nzt-hub/mockup.html`, un estado por hash (`#state=some&place=dock`). La primera
versión (unidad 153) era una lista de texto con `[ Abrir ]`; el usuario: "No me cierra el estilo
del hub, hay que hacerlo mas bonito". De tres direcciones (A tarjetas de color, B grilla, C
portada) eligió la C (Q-07). Conserva de `nzt-files` la paleta aproximada, el borde en el acento,
el alto fijo y Cerrar en la última fila. Imita el panel en una terminal oscura; los colores reales
los pone el tema de la persona.

**Tarea.** Quien trabaja con Claude quiere ver qué mods de NZT hay y abrir uno sin recordar su
comando. **Acción principal: Abrir, en la fila del mod elegido**; no hay un botón principal del
panel, como en `nzt-files` la acción es la fila.

**Una tarjeta** con borde redondeado en el acento (RN-hub-acento), de arriba hacia abajo:
1. **Portada**: `NZT` en letras de bloque, dos filas, en el acento. Debajo, en cursiva tenue, `los
   mods de Claude Code`; a la derecha, un punto por mod del catálogo, en el acento los
   instalados y gris los demás, y `n de 4 instalados`. *Origen: dirección C, elegida (Q-07).*
2. **Separador.**
3. **Lista de mods** (RN-hub-tarjetas, -catalogo), que ocupa lo que queda: una fila por mod en el
   orden del catálogo, separadas por una fila en blanco, sin cajas. Cada una lleva a la izquierda
   una barra vertical `┃` del color del mod, del alto de su bloque. *Origen: Q-07; el color y el
   glifo de cada mod son propuesta del agente: Estado ◆ naranja (el acento), Contexto ◔ azul,
   Cambios ± violeta, Archivos ▤ verde. Amarillo y rojo quedan para espera y error.*
   - Primera fila: el glifo en el color del mod; el nombre del panel en negrita (`Estado`,
     `Contexto`, `Cambios`, `Archivos`, los títulos que ya usan los mods); la versión tenue
     (`v0.3.0`, RN-hub-version); a la derecha **`Abrir ›`** con el fondo del color del mod
     (RN-hub-abrir). En `nzt-context`, en lugar del botón, `barra sobre el prompt` en cursiva
     tenue (RN-hub-sin-comando).
   - Segunda fila: para qué sirve, en una línea que resume su fila del catálogo; se corta con
     `…` si no entra. *Origen: el catálogo de `specs/nzt-mods.md`; el texto, propuesta del agente.*
   - No instalado (RN-hub-no-instalado): barra gris, nombre y línea tenues, `no instalado` en
     lugar de la versión y, a la derecha, **`⧉ Copiar instalación`** sobre un fondo gris oscuro,
     para que no compita con Abrir. Al apretarlo, una tercera fila verde: `✓ Copiado · pegalo en el
     prompt y apretá Enter.` (RN-hub-copiar). Si no se pudo copiar, en rojo `No se pudo copiar:
     esta terminal no deja. Seleccionalo:` y debajo el comando entero en cian, que sigue en otra
     fila si no entra (RN-hub-copiar-falla).
   - Si no entra todo, la lista se mueve con la rueda y la última fila dice `↓ n más`
     (RN-hub-alto).
4. **Botón**: `[ Cerrar ]`, siempre en la última fila.

**Estados**, todos en el mockup, al costado (40 filas) y sobre el prompt (24):
- todos instalados;
- algunos sin instalar (`nzt-changes` y `nzt-files`);
- comando copiado, en la fila del mod que se apretó;
- no se pudo copiar;
- solo `nzt-hub` instalado (los cuatro grises, cada uno con su Copiar);
- Claude trabajando: la fila apretada dice `se abre al terminar el turno` en amarillo, en lugar
  del botón (RN-hub-espera);
- no se pudo abrir: el botón sigue y debajo, en rojo, `No se pudo abrir:` y el motivo que da
  Claude Code (RN-hub-error);
- abierto: el hub ya no está y en su lugar queda el panel del mod (RN-hub-cede);
- buscando los mods (`Buscando los mods…`), mientras el panel averigua cuáles están instalados.

*Vacío* no aplica: los cuatro mods del catálogo aparecen siempre, instalados o no. *Sin
permiso* no aplica: el panel no lee nada protegido. *Datos extremos*: el catálogo tiene cuatro
mods; si crece, la lista se recorre con scroll (RN-hub-alto).

**Panel angosto** (de 40 columnas para abajo): el glifo, el nombre y el botón no se cortan. Lo
que cede es, en este orden: la versión o `no instalado` (con `…`), `barra sobre el prompt` (con
`…`) y la descripción (con `…`). El botón de copiar pasa a decir `⧉ Copiar`. Al costado de 40
columnas sobra alto debajo de la lista; queda así para que Cerrar no se mueva entre estados.

**Medido** en el mockup (Chrome sin ventana, 2026-10-14):
- A 320 px y a 800 px, al costado y sobre el prompt, ninguno de los 9 estados tiene scroll
  horizontal.
- El panel mide lo mismo en todos los estados (802 px al costado, 482 sobre el prompt), y
  Cerrar queda siempre a la misma altura.
- Ninguna lista se pasa del alto.
- A 320 px se miró una captura dentro de un iframe del ancho exacto. La captura directa de Chrome
  sin ventana recorta, porque su ventana no baja de cierto ancho.

**Contraste**, medido sobre los pares del mockup, todos AA:

| Texto | Contraste |
|---|---|
| Nombre | 13,9 |
| Descripción | 10,4 |
| Versión, tenue y no instalado | 5,4 |
| Acento y glifos | 5,6 a 7,8 |
| `Abrir ›` sobre el color de su mod | 6,0 a 8,5 |
| `Copiar instalación` sobre su fondo | 10,9 |
| Copiado (verde) | 7,8 |
| Comando para seleccionar | 7,4 |
| Rojo de error | 6,1 |

El fondo de Copiar se distingue poco del panel (1,3). No hace falta que llegue a AA porque el
texto del botón sí llega, pero hay que mirarlo en vivo con el tema real.

**Teclado**: el orden de Tab es Abrir Estado › Copiar Cambios › Copiar Archivos › Cerrar (estado
"algunos sin instalar"), contado sobre los elementos del mockup, no recorrido con teclado. Enter
aprieta y Escape cierra.

## Preguntas

### Q-01 · ¿Cómo se llama el mod?
- bloquea: la carpeta, el comando que lo abre y todos los textos
- respuesta: `nzt-hub`, la recomendación del agente. El usuario había propuesto `nzt-panel`;
  el agente advirtió que es ambiguo porque los otros mods también son paneles. · 2026-10-14

### Q-02 · Un mod de NZT que no está instalado, ¿aparece en el panel?
- bloquea: RN-hub-tarjetas para los no instalados y si la tarjeta muestra cómo instalarlo
- respuesta: Sí, con cómo instalarlo: tarjeta tenue, "no instalado" y la línea
  `/plugin install` para copiar. · 2026-10-14 · La forma de mostrarlo la reemplaza Q-07.

### Q-03 · ¿Qué extras lleva el panel, además de las tarjetas?
- bloquea: el alcance, el mockup (unidad 153) y qué lee el panel
- respuesta: Solo la versión de cada mod. Se ofrecieron también el resumen de la corrida, el
  contexto usado y atajos a las skills NZT, y quedaron afuera. · 2026-10-14

### Q-04 · Al abrir un mod desde el panel, ¿el panel se queda abierto o se cierra?
- bloquea: RN-hub-abrir y el lugar al costado, que comparten los dos paneles
- respuesta: Se cierra; el mod abierto toma el lugar. · 2026-10-14

### Q-05 · ¿Cómo se abre el panel?
- bloquea: RN-hub-ubicacion y si el panel se abre solo al empezar la sesión
- propuesta del agente: con `/nzt-hub`, al costado como `nzt-files`, sin abrirse solo.
- respuesta: "la 05 la confirmo". · 2026-10-14

### Q-06 · ¿Confirmás las propuestas del agente de la unidad 152?
- bloquea: que las reglas con origin "propuesta del agente" cuenten como acordadas
- respuesta: "perfecto, vamos con esto", dicho después del resumen de lo acordado, lo
  propuesto y lo pendiente. Lo que el mockup muestre distinto de lo esperado se cambia al
  verlo. · 2026-10-14

### Q-07 · El estilo de la primera versión no convenció: ¿cuál de las tres direcciones?
- bloquea: la sección Diseño, el mockup y cómo se dibuja el panel en la unidad 154
- respuesta: "Me gusto la C, lo unico lo del sin instalar hay que hacerlo tambien mas practico,
  como con un boton que tenga para copiar el comando de instalacion, me explico? asi es mas
  amigable". El agente había recomendado la A. · 2026-10-14

### Q-08 · ¿Cómo se ve la tarjeta de `nzt-skins`?
- bloquea: la fila de Skins en el mockup y en el código de 0.3.0
- propuesta del agente: título **Skins** en los dos idiomas, glifo ◐ en el azul de Contexto, y la
  línea *Temas, banda de uso con las marcas 30/40 de NZT y la conversación redibujada.* [modify]
- respuesta: "perfecto". · 2026-10-17 · *el título lo supera Q-10*

### Q-10 · El mod se renombra a `nzt-look`: ¿cómo se llama su tarjeta?
- contexto: el usuario renombró `nzt-skins` a `nzt-look` el 2026-10-18 (`specs/mods/nzt-look/spec.md`,
  Q-01).
- propuesta del agente: **Aspecto** en español y **Look** en inglés (RN-mod-pestaña: una palabra en el
  idioma del mod). Glifo, color y línea, como en Q-08.
- respuesta: elegida con el nombre (*"nzt-look … En el hub: Aspecto / Look"*) · usuario 2026-10-18

### Q-09 · RN-hub-sin-comando, sin ningún mod que la use: ¿se quita o queda dormida?
- bloquea: si 0.3.0 borra la tarjeta sin botón del código
- propuesta del agente: quitarla; una regla sin caso real no se prueba en vivo, y vuelve con el
  primer mod sin panel.
- respuesta: "ok perfecto la quitamos". · 2026-10-17

## Notas técnicas
- Verificado en los tipos de Claude Code 2.1.299 (`types/claude-code.d.ts` del
  plugin-authoring): `$.command.list()` lista los comandos disponibles y `$.command.run` corre
  uno como si lo escribiera la persona; `$.ui.open` solo abre los paneles del propio mod;
  `$.ui.copy({ text, surface })` copia al portapapeles de la terminal como `/copy` y devuelve
  `isCopied` o el motivo (`no-surface`, `no-clipboard`, `refused`); `Box` acepta `borderStyle`,
  `borderColor`, `backgroundColor` y padding.
- Resuelto al construir (unidad 154), decisión del agente:
  - **Instalado** quiere decir que la sesión tiene el comando del mod (`$.command.list()`) o sus
    opciones en `/config` (`$.config.list()`, clave `<mod>.<opción>`). Todos los mods de NZT
    tienen la opción de idioma. [modify: desde 0.3.0 ningún mod del catálogo depende solo de las
    opciones; la detección no cambia]
  - **La versión** sale de `~/.claude/plugins/installed_plugins.json`. La carpeta `.claude` se
    deduce de la del propio plugin. **No está documentado:** el archivo se observó en esta
    máquina, no en la documentación de Claude Code. Si no está o no se puede leer, la fila va sin
    versión. Un mod cargado con `--plugin-dir` no figura ahí y también va sin versión.
  - **El comando que copia el botón**, `/plugin install <mod> --marketplace Ezefeola/nzt-ai`,
    está verificado en la documentación oficial (code.claude.com/docs/en/discover-plugins): existe
    en una sesión desde Claude Code 2.1.275.
  - `$.ui.open` solo abre los paneles del propio mod, así que Abrir corre el comando del otro.
    Si ese panel ya estaba abierto, su comando lo cierra, porque cada comando abre y cierra su
    panel. **Sin decidir:** se ve al probar en vivo.

## Tests

`claude plugin test mods/nzt-hub`: 17 tests.
- 7 de la lógica pura: el catálogo, los grupos por tipo y el grupo vacío que no se muestra, el
  comando de instalación, cuándo un mod está instalado, dónde está la lista de instalados y cómo
  se leen sus versiones.
- 10 del panel dibujado: lista y botones, aire bajo la pestaña, toda tarjeta instalada con botón y ninguna de Contexto (0.3.0), copiar, copia rechazada, Abrir
  cierra el hub, los dos títulos de grupo con Preguntas entre los genéricos, panel angosto,
  lista con scroll y cierre con el comando.

**No cubierto hasta probar en vivo:**
- La versión en la fila: en el host de tests la carpeta del plugin no está bajo `.claude`.
- "No se pudo abrir": el host de tests no rechaza `command.run`, porque un hook que falla se
  saltea.
- "Se abre al terminar el turno": el host de tests no tiene reloj.

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba (va acá, como en `nzt-changes`,
porque este repo guarda sus documentos en `specs/`).

### 2026-10-17 · Grupos por tipo y nzt-questions — 0.2.0
Type:     modify
Change:   las tarjetas van en dos grupos, *Con el método NZT* y *Para cualquier proyecto*, y el catálogo suma `nzt-questions`: cinco mods en lugar de cuatro.
Reason:   el usuario, el 2026-10-17: "me gusta tu propuesta con lo de que nzt-hub agrupe por tipo"; los tipos son `RN-mod-tipo` de `specs/nzt-mods.md`.
Impact:   RN-hub-catalogo modificada · RN-hub-grupos · RN-hub-capa-nzt nuevas
Decision: títulos de grupo y glifo de Preguntas, propuesta del agente aceptada; aceptado tras probarlo en vivo (unidad 210).

### 2026-10-16 · Panel principal de los mods — 0.1.0
Type:     add
Change:   un panel al costado, `/nzt-hub`, con una tarjeta por mod de NZT: para qué es, su versión, un botón que lo abre y, si no está instalado, un botón que copia el comando para instalarlo.
Reason:   el usuario, el 2026-10-14: "un panel principal que tenga botones por cada MOD de NZT para poder verlos en un lugar y para que es cada uno y que desde el mismo se pueda navegar a cada uno".
Impact:   RN-hub-ubicacion · RN-hub-tarjetas · RN-hub-catalogo · RN-hub-version · RN-hub-no-instalado · RN-hub-copiar · RN-hub-abrir · RN-hub-cede · RN-hub-espera · todas nuevas
Decision: dirección visual C, "Portada", con botón Copiar instalación (Q-07); el panel se cierra al abrir otro mod (Q-04).
