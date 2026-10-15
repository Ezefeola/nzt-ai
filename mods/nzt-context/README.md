# nzt-context

> Versión **0.2.0** · spec en [`specs/mods/nzt-context/spec.md`](../../specs/mods/nzt-context/spec.md)

Una barra de Claude Code, encima del prompt, que muestra cuánto contexto lleva consumido la
sesión, con las marcas del 20, 30 y 40% que usa el kernel de NZT para recomendar limpiar.

```
contexto ━━━━━━━━━━━━━━━━━━━━┃━━┄┄┄┄┄╂┄┄┄┄┄╂────────────────────────────  23%  46k/200k
                             20     30     40
```

**Es opcional.** NZT funciona completo sin la barra. Funciona solo en Claude Code, porque
Codex no tiene mods. No lee ningún archivo del proyecto, así que sirve también en proyectos
que no usan NZT.

## Cómo se usa

No tiene comando: una vez instalada, la barra está siempre encima del prompt. Se pliega
con `ctrl+x ctrl+a`, como cualquier banda sobre el prompt.

- Una barra de 0 a 100% de la ventana de contexto del modelo, la misma cifra que muestran la
  status line y `/context`, con el porcentaje y los tokens usados sobre el total.
- El color según el tramo: **gris** por debajo del 20%, **amarillo** desde el 20%, **rojo**
  desde el 30% y **rojo intenso** desde el 40%, con el porcentaje sobre fondo rojo.
- La zona entre 20 y 40 siempre a la vista: la parte que todavía no se llenó está teñida de
  amarillo y rojo tenues ahí, y gris en el resto.
- Las marcas 20, 30 y 40 siempre a la vista (`╂`), apagadas en gris hasta que el consumo las
  alcanza, y encendidas (`┃`) con el color de su tramo desde ahí.
- Antes de la primera respuesta del modelo, y después de un `/clear`, dice **sin lectura
  todavía** en vez de dibujar un 0%.

### Animaciones

Corren en tu terminal o en la app de escritorio, sin consumir tokens:

- **Llenado suave:** cuando cambia la cifra, el relleno y el porcentaje avanzan (o
  retroceden, al compactar) desde el valor anterior.
- **Brillo mientras trabaja:** durante un turno, un destello recorre el relleno.
- **Marca que se enciende:** al cruzar 20, 30 o 40, la marca y su número titilan tres veces
  y quedan encendidos.
- **Pulso desde 40%:** el porcentaje late entre el fondo rojo y sin fondo.

Se apagan todas con la opción **animations** en `off`; la barra queda quieta y muestra lo
mismo. Si la parte animada falla en una superficie, la barra se dibuja quieta sola.

### Qué le dice al agente

Con cada prompt, el mod le agrega al agente una línea que el usuario no ve, en inglés:

```
[nzt-context] Context used: 23% (46k of 200k tokens), 20%+, recommend clearing.
```

Es la señal que pide el kernel de NZT para decir dónde está el contexto al final de cada
unidad: con el mod instalado, el agente reporta una cifra real en vez de decir que no tiene
señal. Si en mitad de un turno largo —una tanda autónoma— el consumo cruza una marca, se lo
avisa una vez, junto al siguiente resultado de herramienta. Cuesta menos de 40 tokens por
prompt.

## Dónde aparece

En la banda encima del prompt, en la terminal y en la app de escritorio. Se actualiza en
cada paso del agente, no solo al terminar el turno; entre una respuesta y otra la cifra no
cambia, porque Claude Code la mide por respuesta.

En una terminal angosta saca primero el rótulo y después los tokens; el porcentaje y las
marcas quedan siempre. Mientras Claude Code muestra una encuesta en esa banda, la barra no
se dibuja y le deja el lugar. Si la cifra no llega o la lectura falla, dice que no hay
lectura: un fallo del mod nunca frena un prompt ni un turno.

## Idioma y animaciones

La barra habla **español** (por defecto) o **inglés**, y anima (`on`, por defecto) o no
(`off`). Las dos opciones se eligen al instalarla, y se cambian en el menú de configuración
de Claude Code o con:

```bash
claude plugin configure nzt-context
```

La línea que recibe el agente va siempre en inglés.

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.275 o posterior):

```
/plugin install nzt-context --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerla en todos
los proyectos.

Para desinstalarla, desde la terminal: `claude plugin uninstall nzt-context`. Para
actualizarla: `claude plugin update nzt-context`.

## Desarrollo

```bash
claude plugin validate mods/nzt-context   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-context       # los tests de hooks/*.test.tsx
claude --plugin-dir mods/nzt-context      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo.

El chequeo de tipos (`tsc -p mods/nzt-context/tsconfig.json`) necesita los tipos del motor
en `.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta,
con su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-context/spec.md`](../../specs/mods/nzt-context/spec.md),
y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
