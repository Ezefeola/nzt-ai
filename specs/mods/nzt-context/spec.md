# Mod · nzt-context — barra de contexto sobre el prompt

> Estado: **construido**, versión 0.2.0, en `mods/nzt-context/` (spec en la unidad 108,
> barra en la 109, línea al agente en la 110; rediseño y animaciones de 0.2.0 en las 113 a
> 115, sección *Diseño*) ·
> Depende de: `specs/nzt-mods.md` y la sección **Context** del kernel (`core/kernel.md`).
> Fuente de lo que el motor permite: los tipos de Claude Code 2.1.296
> (`$.session.usage`, el componente `AbovePrompt`, el evento `prompt.submit` y su `context`).

## Qué resuelve

El kernel pide decir dónde está el contexto al final de cada unidad y recomendar limpiar
la sesión desde el 20% consumido, decirlo claro desde el 30% y recomendarlo fuerte pasado
el 40%. Hoy el usuario solo lo sabe si corre `/context`, y el agente muchas veces no tiene
ninguna señal y tiene que decir que no la tiene. La barra muestra el consumo en todo
momento, encima del prompt, con esas tres marcas a la vista; y el mod le pasa la misma
cifra al agente para que su reporte use un número real.

## Alcance

**Adentro**
- Una banda encima del prompt con una barra de 0 a 100% del contexto consumido, el
  porcentaje y los tokens usados sobre el tamaño de la ventana.
- Tres marcas sobre la barra, en 20, 30 y 40, que se encienden cuando el consumo las
  alcanza.
- El color de la barra según el tramo en que está el consumo.
- Pasarle al agente la cifra de contexto con cada prompt del usuario, y avisarle en mitad
  de un turno cuando el consumo cruza una marca.
- Español e inglés en lo que ve el usuario.

**Afuera**
- **Umbrales configurables.** Son los del kernel y quedan fijos (usuario, 2026-10-14). Si
  el kernel los cambia, cambia esta spec.
- **El desglose por categoría que muestra `/context`.** Medirlo cuesta pedidos de conteo de
  tokens y nadie lo pidió.
- **Limpiar o compactar la sesión desde el mod.** El kernel dice que limpiar es decisión
  del usuario; el mod muestra, no actúa.
- **Codex.** Un mod es solo de Claude Code (D63).
- **Leer artefactos de NZT.** El mod no lee `Plan/state.json` ni ningún otro: la cifra
  viene de la sesión. Funciona igual en un proyecto sin NZT.

## Reglas

### RN-ctx-escala · origin: usuario 2026-10-14
La barra va de 0 a 100% de la ventana de contexto del modelo de la sesión, la misma cifra
que muestran la status line y `/context`. No se amplía el tramo de las marcas.

### RN-ctx-tramos · origin: usuario 2026-10-14
El color de la barra depende del consumo: gris por debajo del 20%, amarillo desde el 20%,
rojo desde el 30% y rojo intenso desde el 40%. Los cortes son los del kernel.

### RN-ctx-marcas · origin: usuario 2026-10-14
Las marcas 20, 30 y 40 se ven siempre sobre la barra, con su número debajo. Una marca no
alcanzada se ve apagada, en gris; una alcanzada se enciende con el color de su tramo
(amarillo, rojo, rojo intenso). Cómo se dibujan está en *Diseño*.

### RN-ctx-zona-visible · origin: usuario 2026-10-14 (diseño "Zonas a la vista")
La parte de la barra que todavía no se llenó deja ver los tramos: entre 20 y 30 en amarillo
tenue, entre 30 y 40 en rojo tenue, y fuera de esa zona en gris tenue. La zona entre 20 y
40 se ve aunque el consumo no haya llegado.

### RN-ctx-animaciones · origin: usuario 2026-10-14
La barra se mueve en cuatro casos, y en ningún otro: cuando cambia la cifra, el relleno y
el porcentaje van del valor anterior al nuevo; mientras el modelo trabaja en un turno, un
destello recorre el relleno; cuando el consumo cruza una marca hacia arriba, esa marca y su
número titilan y quedan encendidos; y pasado el 40%, el porcentaje late. Las animaciones
corren en la superficie que dibuja y no consumen pedidos al modelo.

### RN-ctx-animaciones-opcionales · origin: propuesta del agente, aceptada por el usuario 2026-10-14
La opción **animaciones** del mod, prendida por defecto, las apaga todas: la barra queda
quieta y muestra lo mismo. Si la superficie no puede animar, o la parte animada falla, la
barra se dibuja quieta y la sesión sigue.

### RN-ctx-cifras · origin: propuesta del agente, aceptada por el usuario 2026-10-14
Al lado de la barra van el porcentaje entero y los tokens usados sobre el tamaño de la
ventana, abreviados en miles o millones (`34k/200k`, `412k/1M`).

### RN-ctx-sin-lectura · origin: kernel (Context: nunca inventar un porcentaje)
Si la sesión todavía no tiene una lectura del contexto —antes de la primera respuesta del
modelo, o justo después de un `/clear`—, la banda dice que no hay lectura todavía y no
dibuja un 0%.

### RN-ctx-refresco · origin: propuesta del agente, aceptada por el usuario 2026-10-14
La barra se actualiza cada vez que el motor tiene una cifra nueva: en cada paso de un turno,
al terminar el turno, después de compactar y después de un `/clear`. Entre una respuesta y
otra la cifra no cambia, porque el motor la mide por respuesta.

### RN-ctx-al-agente · origin: usuario 2026-10-14
Con cada prompt del usuario, el mod le agrega al agente, sin mostrárselo al usuario, una
línea con el porcentaje consumido, los tokens sobre la ventana y el tramo. Es la señal del
host que pide la sección **Context** del kernel. Sin lectura, la línea dice que no hay
lectura, nunca un número.

### RN-ctx-cruce-en-turno · origin: propuesta del agente (unidad 108)
Si durante un turno el consumo cruza una marca que el agente todavía no conoce, el mod se lo
avisa una vez, junto al siguiente resultado de herramienta. Una tanda autónoma puede correr
varias unidades en un solo turno; sin este aviso, el reporte del final usaría la cifra del
comienzo. Lo que el agente ya conoce es el tramo de la última línea que recibió; después de
compactar o de un `/clear` vuelve a ser el tramo actual, así una marca cruzada de nuevo
avisa otra vez. Lo que hacen los subagentes no avisa: la cifra es la de la conversación
principal.

### RN-ctx-no-interrumpe · origin: RN-mod-lee-formatos-viejos de `specs/nzt-mods.md`
Si el motor no da la cifra o la lectura falla, la banda dice que no hay lectura y la sesión
sigue. Un fallo del mod nunca frena un prompt ni un turno.

### RN-ctx-cede-la-banda · origin: tipos del motor (`AbovePrompt.hasSurvey`)
Mientras el motor muestra una encuesta en la banda sobre el prompt, el mod no dibuja y le
deja el lugar.

### RN-ctx-ancho · origin: propuesta del agente (unidad 108)
La barra se ajusta al ancho que el motor le da a la banda. Si no entra con el rótulo y las
cifras, primero se saca el rótulo y después los tokens; el porcentaje y las marcas quedan
siempre.

### RN-ctx-idioma · origin: decisión del agente, mismo criterio que RN-panel-idioma
Lo que ve el usuario (el rótulo y el aviso de sin lectura) va en español o en inglés según
la opción **idioma** del mod, `es` por defecto. La línea que recibe el agente va siempre en
inglés, como el kernel que la lee. **Se reabre** si el motor expone el idioma del usuario.

## Requisitos no funcionales

- La barra muestra la cifra nueva **en el mismo paso del turno** en que el motor la tiene,
  sin esperar al final del turno.
- La línea que recibe el agente ocupa **menos de 40 tokens** por prompt.
- Leer la cifra no consume pedidos al modelo ni a la API de conteo.
- Se dibuja en la terminal y en la app de escritorio, las dos superficies donde existe la
  banda. Los tests la montan en las dos.

## Diseño (0.2.0, "Zonas a la vista")

Elegido por el usuario el 2026-10-14 entre tres propuestas. Los colores son roles del tema
del usuario (gris `inactive`, amarillo `warning`, rojo `error`, claro `text`), nunca valores
fijos, así que siguen a su tema. Duraciones y glifos se ajustan al verlo en vivo.

**Regiones**, en orden de lectura: el rótulo (`contexto`), la barra, el porcentaje y los
tokens en la primera fila; los números 20, 30 y 40 en la segunda, bajo su marca.

| Pieza | Cómo se ve | Origen |
|---|---|---|
| Relleno | `━` en el color del tramo actual; en negrita desde el 40% | RN-ctx-tramos |
| Riel sin llenar, zona 20–30 / 30–40 | `┄` en amarillo / rojo, tenue | RN-ctx-zona-visible |
| Riel sin llenar, fuera de la zona | `─` en gris tenue | RN-ctx-zona-visible |
| Marca alcanzada / apagada | `┃` en el color de su tramo, negrita / `╂` en gris | RN-ctx-marcas |
| Porcentaje | en el color del tramo, negrita desde el 20%; siempre con un espacio a cada lado; desde el 40%, pastilla ` 44% `: texto claro sobre fondo rojo | RN-ctx-cifras, RN-ctx-tramos |
| Tokens | `440k/1M`, tenue, separados del porcentaje por dos espacios | RN-ctx-cifras |
| Números de las marcas | apagados en gris, encendidos en el color de su tramo | RN-ctx-marcas |

**Animaciones** (RN-ctx-animaciones), en un cuadro cada 50 ms:

| Caso | Qué se ve | Duración |
|---|---|---|
| Cambia la cifra | el relleno y el porcentaje avanzan o retroceden desde el valor anterior, desacelerando al llegar | 0,4 s |
| Turno en curso | un tramo de 4 celdas en claro (`text`) recorre el relleno de izquierda a derecha y vuelve a empezar | mientras dura el turno |
| Cruce de marca hacia arriba | la marca y su número alternan encendido/apagado tres veces y quedan encendidos | ~0,9 s |
| Pasado el 40% | la pastilla alterna entre fondo rojo y número rojo sin fondo | ciclo de 1,5 s |

La primera cifra de la sesión aparece sin animar desde cero, y bajar de tramo (al compactar)
no hace titilar ninguna marca.

**Estados**

| Estado | Qué se ve | Origen |
|---|---|---|
| Sin lectura | el rótulo, el riel entero en gris tenue y `sin lectura todavía`; sin números de marcas | RN-ctx-sin-lectura |
| Bajo el 20% | relleno gris, riel teñido apagado, ninguna marca encendida | RN-ctx-tramos |
| 20–40% | relleno amarillo o rojo, las marcas alcanzadas encendidas | RN-ctx-tramos |
| Pasado el 40% | relleno rojo en negrita, pastilla latiendo | RN-ctx-tramos |
| Encuesta del motor | no se dibuja | RN-ctx-cede-la-banda |
| Animaciones apagadas, superficie sin animación o fallo de la parte animada | lo mismo, quieto | RN-ctx-animaciones-opcionales |
| Consumo al 100% o más | relleno completo; el porcentaje dice la cifra real | RN-ctx-escala |

**Pantalla angosta** (RN-ctx-ancho): se saca primero el rótulo, después los tokens; la barra
nunca baja de 10 celdas y las marcas quedan en su proporción.

## Sin determinar

- **Escritorio:** la banda se prueba en `desktop` con los tests, pero no se vio dibujada en
  la app.

## Tests

`hooks/register.test.tsx` corre con `claude plugin test mods/nzt-context`. Cubre los tramos,
la lectura que falta, la abreviatura de tokens, las marcas que se encienden y su escala, el
riel teñido por zona y los glifos, el ajuste al ancho, la banda en terminal y escritorio,
sin lectura, pasado el 40%, una marca no alcanzada, la encuesta que ocupa la banda, el
inglés, la medición que empuja el motor, las cuatro animaciones (llenado que va del valor
viejo al nuevo, marca que titila y queda encendida, brillo solo con un turno en curso,
pulso pasado el 40%), las animaciones apagadas, la línea que recibe el agente con cada
prompt y el aviso de cruce una sola vez en mitad del turno. 25 tests. **No cubierto:** la
vuelta a la barra quieta cuando la parte animada falla en una superficie (`ui.fault`), que
el kit de tests no provoca.
