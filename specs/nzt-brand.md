---
update-when: cambia un color de la paleta, se suma un rol, o un tema o mod de NZT necesita un color que esta paleta no tiene
---

# Marca de NZT — paleta y roles

> Estado: **escrita** en la unidad 215 (2026-10-17) con la paleta que dio el usuario ese día;
> estados, derivados y variante clara en la 222 (2026-10-18); tonos de lectura de la oscura y
> colores del código en la 253 (2026-10-18, Q-03).
> Referencia visual: la landing, <https://nzt-ai.com/>. La usan el tema NZT del mod de skins
> (`specs/mods/nzt-look/spec.md`, sección *Diseño · tema nzt*) y cualquier visual de NZT: mods,
> landing, presentación, instalador.

## Paleta

Es la fuente: los colores los fijó el usuario, y un tema o una hoja de estilos los toma de acá.
Cuando el tema NZT exista como archivo, este documento sigue mandando sobre él.

| Color | Valor | Para qué (palabras del usuario) |
|---|---|---|
| Contraste | `#fff069` | "pocos elementos, líneas, íconos chicos y highlights" |
| Fondo | `#07100f` | "fondos" |
| Secundario | `#244146` | "gradientes y textos de botones claros" |
| Acento | `#72f4cd` | "botones e íconos" |
| Texto | `#f4faf7` | "textos" |

`presentation/styles.css` usa valores cercanos pero no iguales (`--accent #73f7c7`, `--warning
#ffd166`). Manda esta paleta; alinear la presentación es otra unidad, si se pide.

## Roles

| Rol | Color | Cuándo se usa | Su límite |
|---|---|---|---|
| Fondo | Fondo | toda superficie de base: panel, tarjeta, banda | — |
| Texto | Texto | todo texto que se lee | — |
| Acción | Acento | el botón principal y los íconos que se aprietan; el estado *bien* | un botón principal por vista |
| Texto sobre acción | Secundario | el texto de un botón de Acento | solo sobre Acento o Contraste |
| Resalte | Contraste | lo que tiene que saltar a la vista: una línea, un ícono chico, un número, una marca | pocos elementos por vista: si todo resalta, nada resalta |
| Profundidad | Secundario | gradientes y superficies elevadas sobre Fondo (una tarjeta, una fila elegida) | **nunca** texto, borde ni control sobre Fondo (contraste 1,76:1) |

## Contraste medido

Cálculo WCAG 2.x de luminancia relativa, 2026-10-17.

| Primer plano | Fondo `#07100f` | Secundario `#244146` |
|---|---|---|
| Texto `#f4faf7` | 18,22:1 | 10,35:1 |
| Contraste `#fff069` | 16,44:1 | 9,34:1 |
| Acento `#72f4cd` | 14,25:1 | 8,09:1 |
| Secundario `#244146` | 1,76:1 | — |

Secundario sobre Acento: 8,09:1, y sobre Contraste: 9,34:1. Todo pasa AA (4,5:1 para texto, 3:1
para controles), salvo Secundario sobre Fondo: por eso su rol lo limita a profundidad.

## Estados

Q-01 (2026-10-18): **aviso** es Contraste y **error** es `#ff8f9c`, el `--danger` de
`presentation/styles.css`. **Bien** es Acento, como ya decía su rol. Ninguno se usa solo: un estado
lleva glifo o palabra (Accesibilidad).

## Derivados

Colores que la marca no trae y que una interfaz necesita. Salen de la paleta: más oscuros o más
claros sobre el mismo tono, o una mezcla con Fondo. Cuando la paleta cambia, se recalculan.

| Derivado | Oscura | Clara | Para qué | Su límite |
|---|---|---|---|---|
| Fondo | `#07100f` | `#f4faf7` (Texto) | toda superficie de base | — |
| Texto | `#f4faf7` | `#07100f` (Fondo) | todo texto que se lee | — |
| Acento | `#72f4cd` | `#0b6b55` | Acción y *bien* | el mismo de Roles |
| Contraste | `#fff069` | `#6b5d00` | Resalte y *aviso* | el mismo de Roles |
| Error | `#ff8f9c` | `#b3263a` | *error* | nunca para avisar algo que no falló |
| Secundario | `#244146` | `#244146` | Profundidad en la oscura; texto secundario fuerte en la clara | en la oscura, nunca texto ni borde sobre Fondo |
| Texto sobre acción | `#244146` (Secundario) | `#f4faf7` (Fondo claro) | el texto de un botón de Acento | solo sobre Acento |
| Tenue | `#8fa9a3` | `#4d6662` | pistas, horas, rótulos, lo que acompaña | nunca lo único que dice un estado |
| Sutil | `#71908a` | `#556d68` | bordes finos y texto de menos peso que Tenue | el texto más débil que se permite |
| Superficie | `#0c1918` | `#ffffff` | tarjetas sobre Fondo | — |
| Cebra | `#102221` | `#e8f2ee` | una fila sí y una no en tablas | solo filas alternadas |
| Mensaje | `#0f2422` | `#e3f1ec` | fondo del mensaje del usuario | — |
| Agregado / Borrado | `#21483d` / `#4b3639` | `#aecfc6` / `#fbb4bc` | fondo de líneas de un diff | solo diffs |
| Palabra agregada / borrada | `#2d6454` / `#785055` | `#8bbaae` / `#fe9aa5` | la palabra que cambió dentro de la línea | solo diffs |

Unidad 251 (2026-10-18): los de la 222 casi no se distinguían del fondo. Cada fondo de diff se separa
ahora de Fondo al menos 1,5:1, y deja el Texto encima en 4,5:1 o más. En la oscura son Fondo
mezclado con el Acento o el Error de lectura al 30% (las palabras, al 45% y al 50%). En la clara,
Fondo claro con el Acento oscuro `#0b6b55` al 30% y con `#ff8f9c` al 65%; las palabras, al 45% y al
90%. El Acento de la marca es demasiado claro: ni al 100% se separa 1,5:1 del Fondo claro.

| Fondo de diff | Contra Fondo | Texto encima |
|---|---|---|
| Agregado oscura / clara | 1,89 / 1,58 | 7,45 / 11,50 |
| Borrado oscura / clara | 1,73 / 1,61 | 8,14 / 11,34 |
| Palabra agregada oscura / clara | 2,81 / 2,04 | 5,01 / 8,93 |
| Palabra borrada oscura / clara | 2,82 / 1,91 | 4,99 / 9,52 |

**La tarjeta de diff del mod** pinta sus líneas sobre Superficie, con el color de *bien* o de *error*
al 22%: así una línea cambiada se separa de la tarjeta (1,58 y 1,47 en la oscura) y el código
resaltado encima pasa 4,5:1. El comentario no pasa (3,06), y por eso en una línea cambiada va en el
color de texto del código. El número de línea queda fuera del fondo: Tenue sobre esos fondos no llega
a 4,5:1.

**La variante clara** (Q-02, 2026-10-18) invierte Fondo y Texto. Oscurece Acento, Contraste y
Error hasta pasar 6:1 sobre su fondo, sin cambiarles el tono. Un amarillo que se lea sobre blanco
ya es oliva: **en la clara, el aviso se reconoce por su glifo y su palabra más que por el color**.
Secundario sobre Acento oscuro da 1,69:1, por eso en la clara el texto de un botón va en Fondo claro.

### Contraste medido de los derivados (2026-10-18)

Peor caso de cada color de texto contra Fondo, Superficie, Cebra y Mensaje.

| Color | Oscura | Clara |
|---|---|---|
| Texto | 15,33 (Mensaje) | 16,57 (Mensaje) |
| Acento | 11,99 | 5,56 |
| Contraste | 13,83 | 5,66 |
| Error | 7,46 | 5,55 |
| Tenue | 6,46 | 5,32 |
| Sutil | 4,68 | 4,79 |
| Texto sobre acción | 8,09 | 6,11 |
| Texto sobre Agregado / Borrado | 7,45 / 8,14 (unidad 251) | 11,50 / 11,34 (unidad 251) |

Sutil y Tenue se distinguen por peso, no por legibilidad: los dos pasan 4,5:1 en todo fondo de texto.
Sobre los fondos de diff se escribe Texto; los números de línea en Tenue ya no pasan sobre los fondos
de la 251 y quedan afuera, en la tarjeta del mod (ver *Derivados*). En el diff de Claude Code, el
número lo dibuja Claude Code.

## Tonos de lectura (variante oscura)

Q-03 (2026-10-18): en una conversación larga, la paleta tal cual se ve demasiado brillante sobre
Fondo. Texto da 18,22:1, y Acento y Contraste son neón. El código, además, se veía casi todo blanco.
**La paleta no cambia**: la landing y lo que es marca siguen con sus valores. **Los temas oscuros
de NZT** (el de Claude Code y el del mod) usan estos tonos, más bajos y sobre el mismo matiz:

| Rol | Paleta | Tono de lectura | Peor caso (Mensaje) |
|---|---|---|---|
| Texto | `#f4faf7` | `#d3dfdb` | 11,84 |
| Acento | `#72f4cd` | `#5ccaa9` | 8,08 |
| Contraste | `#fff069` | `#e2d36e` | 10,63 |
| Error | `#ff8f9c` | `#e8909a` | 6,86 |
| Tenue | `#8fa9a3` | `#7f9893` | 5,26 |

**Excepción (2026-10-18): el borde del prompt.** `promptBorder` y `autoAccept` del tema oscuro
llevan el Acento de la paleta `#72f4cd` (14,25:1 sobre Fondo, medido arriba), no el tono de
lectura: es un trazo de una línea, no un texto, y es el color del recuadro que el usuario quiere de
vuelta. El texto y las pastillas siguen con `#5ccaa9`.

Sutil, Superficie, Cebra, Mensaje y Secundario no cambian. Texto sobre acción sigue siendo
Secundario: sobre el Acento de lectura da 5,46:1. Fondo sobre ese Acento da 9,61:1.

### Colores del código

Cada parte del código tiene su color, para que un bloque no se lea como un muro de un solo color. El
bloque lleva un fondo propio, apenas distinto de Fondo. El cian y el violeta no salen de la paleta:
los aprobó el usuario el 2026-10-18 (Q-03) porque, con solo los tonos de la marca, función, tipo y
propiedad no se distinguían.

| Parte | Oscura | Clara | Peor caso oscura / clara |
|---|---|---|---|
| Fondo del bloque | `#0a1514` | `#edf5f2` | — |
| Texto del código | `#b9c7c3` | `#2b3d3a` | 10,29 / 10,03 |
| Palabra clave | `#62c4a8` | `#0b6b55` | 8,55 / 5,65 |
| Cadena | `#d4c77a` | `#6b5d00` | 10,49 / 5,76 |
| Número | `#e0a08f` | `#a3402c` | 8,22 / 5,52 |
| Comentario (en cursiva) | `#6f8a85` | `#5a716c` | 4,84 / 4,58 |
| Función | `#9fd4e0` | `#1d6878` | 11,10 / 5,56 |
| Tipo | `#c8b4e8` | `#6a46a8` | 9,55 / 6,01 |
| Propiedad | `#a9c4be` | `#3f5d57` | 9,70 / 6,30 |

Medido el 2026-10-18 contra Superficie, el fondo del bloque y Fondo en la oscura, y contra blanco,
Fondo claro, el fondo del bloque y Cebra en la clara. Todo pasa 4,5:1. Un número ya no va en Error:
un número no es un fallo.

## Accesibilidad — cómo se cumple

- Texto con al menos 4,5:1 y controles y gráficos que significan algo con al menos 3:1, medido
  contra el fondo real donde se dibujan.
- Un estado nunca se dice solo con color: lleva también un glifo o una palabra (los mods de NZT ya
  lo hacen así, por ejemplo `✓`, `●`, `○`).

## Preguntas

### Q-01 · ¿Qué colores tienen error y aviso?
La paleta no trae rojo ni ámbar, y un tema de Claude Code los necesita (`error`, `warning`) igual
que cualquier mod que avisa algo. Contraste (`#fff069`) puede hacer de aviso; para error no hay
nada.
- propuesta: aviso = Contraste; error = `#ff8f9c`, el `--danger` de `presentation/styles.css`
  (sobre Fondo 8,86:1, medido el 2026-10-17).
- depende: el tema NZT (unidad 222) y la banda de uso, que se pone roja cerca del límite.
- respuesta: la propuesta, en la sección *Estados* · agente, por delegación del usuario el
  2026-10-18 (*"222 hace las propuestas"*). Se reabre si el usuario da sus propios colores de
  estado o si la landing suma un rojo.

### Q-02 · ¿Cómo es la variante clara?
El usuario pidió NZT oscuro **y** claro, y la paleta es oscura. La clara se deriva de esta (fondo
casi blanco, Secundario o Fondo como texto, Acento oscurecido hasta 4,5:1) y se mide en la 222.
- respuesta: la columna *Clara* de *Derivados*, medida · agente, por delegación del usuario el
  2026-10-18. Se reabre si el usuario la ve en vivo (unidad 224) y no la reconoce como NZT, o si la
  landing tiene una versión clara.

### Q-03 · ¿El tema oscuro usa la paleta tal cual?
El usuario vio el mockup de la conversación: *"esta como super brillante digamos el color"*, y el
código *"se ve muy blanco el texto"*.
- propuesta del agente: tonos de lectura más bajos para los temas oscuros, la paleta intacta para la
  marca, y un color por parte del código, mostrados en una copia del mockup con un selector
  actual/propuesta.
- respuesta: *"Esta buenisima la propuesta, perfecto la apruebo"* · usuario 2026-10-18, con el cian y
  el violeta del código. Queda la sección *Tonos de lectura*.
