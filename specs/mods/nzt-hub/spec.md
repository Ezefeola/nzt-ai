# Mod · nzt-hub — panel principal de los mods

> Estado: **aceptado** por el usuario en 0.1.0 el 2026-10-16 ("Acepto nzt-hub y nzt-changes,
> queda todo aprobado") y cerrado (unidad 157); código en `mods/nzt-hub/`; Historia al final · mockup en
> `specs/mods/nzt-hub/mockup.html` (unidades 153 y 158, dirección C) · Depende de: `specs/nzt-mods.md` (reglas de todo mod y catálogo de la sección 5).
> El usuario pidió el mod el 2026-10-14: "un panel principal que tenga botones por cada MOD de
> NZT para poder verlos en un lugar y para que es cada uno y que desde el mismo se pueda
> navegar a cada uno, y otras cosas que elijamos". Propuso el nombre `nzt-panel`; quedó
> `nzt-hub` (Q-01). Lo que decidió el agente está marcado como propuesta: cuenta como
> acordado cuando el usuario lo confirma.

## Qué resuelve

Los mods de NZT son varios (`nzt-state`, `nzt-context`, `nzt-changes`, `nzt-files`) y cada uno
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
  contexto en `nzt-context`.
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

### RN-hub-catalogo · origin: propuesta del agente
Los mods que aparecen son los del catálogo de `specs/nzt-mods.md` (sección 5), en ese orden.
El panel no se muestra a sí mismo.

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

### RN-hub-sin-comando · origin: propuesta del agente
Un mod que no tiene panel que abrir (`nzt-context` es la barra sobre el prompt) tiene tarjeta
pero no botón: la tarjeta dice dónde se lo ve.

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

## Notas técnicas
- Verificado en los tipos de Claude Code 2.1.299 (`types/claude-code.d.ts` del
  plugin-authoring): `$.command.list()` lista los comandos disponibles y `$.command.run` corre
  uno como si lo escribiera la persona; `$.ui.open` solo abre los paneles del propio mod;
  `$.ui.copy({ text, surface })` copia al portapapeles de la terminal como `/copy` y devuelve
  `isCopied` o el motivo (`no-surface`, `no-clipboard`, `refused`); `Box` acepta `borderStyle`,
  `borderColor`, `backgroundColor` y padding.
- Resuelto al construir (unidad 154), decisión del agente:
  - **Instalado** quiere decir que la sesión tiene el comando del mod (`$.command.list()`) o sus
    opciones en `/config` (`$.config.list()`, clave `<mod>.<opción>`). Así entra `nzt-context`,
    que no tiene comando. Todos los mods de NZT tienen la opción de idioma.
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

`claude plugin test mods/nzt-hub`: 14 tests.
- 5 de la lógica pura: el catálogo, el comando de instalación, cuándo un mod está instalado,
  dónde está la lista de instalados y cómo se leen sus versiones.
- 9 del panel dibujado: lista y botones, aire bajo la pestaña, nzt-context sin botón, copiar, copia rechazada, Abrir
  cierra el hub, panel angosto, lista con scroll y cierre con el comando.

**No cubierto hasta probar en vivo:**
- La versión en la fila: en el host de tests la carpeta del plugin no está bajo `.claude`.
- "No se pudo abrir": el host de tests no rechaza `command.run`, porque un hook que falla se
  saltea.
- "Se abre al terminar el turno": el host de tests no tiene reloj.

## Historia

Una entrada por ciclo de cambio cerrado, la más nueva arriba (va acá, como en `nzt-changes`,
porque este repo guarda sus documentos en `specs/`).

### 2026-10-16 · Panel principal de los mods — 0.1.0
Type:     add
Change:   un panel al costado, `/nzt-hub`, con una tarjeta por mod de NZT: para qué es, su versión, un botón que lo abre y, si no está instalado, un botón que copia el comando para instalarlo.
Reason:   el usuario, el 2026-10-14: "un panel principal que tenga botones por cada MOD de NZT para poder verlos en un lugar y para que es cada uno y que desde el mismo se pueda navegar a cada uno".
Impact:   RN-hub-ubicacion · RN-hub-tarjetas · RN-hub-catalogo · RN-hub-version · RN-hub-no-instalado · RN-hub-copiar · RN-hub-abrir · RN-hub-cede · RN-hub-espera · todas nuevas
Decision: dirección visual C, "Portada", con botón Copiar instalación (Q-07); el panel se cierra al abrir otro mod (Q-04).
