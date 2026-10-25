# nzt-questions

> Versión **0.3.0** · spec en [`specs/mods/nzt-questions/spec.md`](../../specs/mods/nzt-questions/spec.md)

Un panel lateral de Claude Code para **contestar las preguntas que el agente escribió como
texto**: de a una, con sus opciones y la recomendada primero, y con un botón que deja todas las
respuestas en el prompt como **un solo mensaje** para que lo revises antes de mandarlo.

```
╭────────────────────────────────────────────────────────╮
│  NZT  Preguntas                     1 de 3 contestadas │
│ ────────────────────────────────────────────────────── │
│ ● QT-02 · ¿Quién hace el commit?                       │
│ ○ QT-03 · ¿El instalador activa el flag?               │
│ ○ 3 · ¿Que quede en el prompt o se manda solo?         │
│ ────────────────────────────────────────────────────── │
│ QT-03 · 2 de 3                                         │
│ ¿El instalador activa el flag?                         │
│ ○ B · No la activa  ★ recomendada                      │
│   el README lo explica                                 │
│ ○ A · Lo activa                                        │
│   escribe la configuración del usuario                 │
│ ✎ Otra respuesta                                       │
│ + Nota                                                 │
│ ◀ Anterior  Saltear  Siguiente ▶                       │
│ [ Cerrar ]               Revisar y llevar al prompt ›  │
╰────────────────────────────────────────────────────────╯
```

El mockup completo, con todos sus estados, está en
[`specs/mods/nzt-questions/mockup.html`](../../specs/mods/nzt-questions/mockup.html).

**Es genérico:** funciona igual en cualquier proyecto, use NZT o no. Reconoce una pregunta por
su forma, no por un formato de NZT. Funciona solo en Claude Code, porque Codex no tiene mods.

## Qué cuenta como pregunta

- Una línea de la respuesta del agente que **termina en `?`**: sola, numerada, en una viñeta, en
  negrita o como título. Las de bloques de código, citas y tablas no cuentan.
- Sus **opciones** son la lista que viene justo debajo; puede haber una línea en blanco en el
  medio. El nombre de cada opción llega hasta ` — ` o `: `, y lo que sigue es su explicación.
- La **recomendada** es la que el agente marcó *recomendada* o *recommended*. El panel no
  inventa opciones ni recomendaciones: una pregunta sin lista se contesta con texto.
- Si la línea empieza con un identificador (`QT-03 ·`, `Q-1:`, `#4`), la pregunta se nombra con
  él; si no, con su número de orden en la respuesta.

Solo cuentan las respuestas del agente principal en esta sesión: las de un subagente y las de
un turno cortado, no. Si el agente vuelve a hacer una pregunta, se muestra una sola vez, con su
versión más nueva; tu respuesta se conserva mientras la opción que elegiste siga ahí.

## Cómo se usa

El panel **se abre solo** cuando una respuesta trae preguntas nuevas, si hay lugar al costado;
si no hay, avisa una vez. También se abre con:

```
/nzt-questions
```

y `/nzt-questions` otra vez lo cierra. Con el panel enfocado:

| Tecla | Hace |
|---|---|
| Tab o flechas | recorrer las opciones, los campos y los botones |
| Enter o clic | elegir una opción, guardar un campo o apretar un botón |
| `n` / `p` | la pregunta siguiente / la anterior |
| `s` | saltear la pregunta |
| rueda | mover las opciones cuando no entran |
| `c` o Escape | cerrar |

**Revisar y llevar al prompt ›** muestra el mensaje como va a quedar, una línea por pregunta
contestada (`QT-02: A — main, igual que a mano`, `3: Que quede en el prompt`, la nota como
` · nota: …`). **Llevar al prompt ›** lo agrega después de lo que ya tenías escrito, sin
mandarlo: lo revisás y apretás Enter. Las salteadas no van, y siguen pendientes hasta que mandes
un mensaje: **cualquier mensaje que mandes cierra las preguntas que había**, porque es tu
respuesta, y las que contestaste en la ventana de preguntas del agente no quedan esperando. Lo
que el agente vuelva a preguntar aparece de nuevo. Si el mensaje no
se manda, **Llevar otra vez ›** lo vuelve a poner.

En la **app de escritorio** el panel va en su pestaña, sin marco ni Cerrar, y lo desplaza el
scroll de la app: la lista entera, la pregunta y, debajo, los botones; un clic en cualquier parte
de una fila o de una opción la elige, y la acción principal es el botón principal de la app. En la
app los botones no tienen tecla: se usa el mouse.

## Idioma

El panel habla **español** (por defecto) o **inglés**; las preguntas se muestran como las
escribió el agente. Se elige al instalarlo y se cambia en el menú de configuración de Claude
Code o con:

```bash
claude plugin configure nzt-questions
```

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.302 o posterior):

```
/plugin install nzt-questions --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos los
proyectos. Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-questions@nzt`.

## Desarrollo

```bash
claude plugin validate mods/nzt-questions   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-questions       # los tests de hooks/*.test.ts(x)
claude --plugin-dir mods/nzt-questions      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado de
verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$` pasado a
una función importada de otro archivo; el reconocimiento está en `hooks/parse.ts` y el mensaje
en `hooks/message.ts`, los dos sin `$`.

`nzt-state` lee la cantidad de preguntas pendientes de la clave `pending` de este mod, para
avisar que hay preguntas para contestar.

La spec, con sus reglas, está en [`specs/mods/nzt-questions/spec.md`](../../specs/mods/nzt-questions/spec.md),
con el mockup al lado, y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
