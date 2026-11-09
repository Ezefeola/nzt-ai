# Trabajo por etapas: entender, decidir cómo, planear, hacer

Decidido por el usuario el 2026-11-09, después de la segunda prueba real en la app
(`nzt-proyecto`, "quiero hacer una aplicación para cargar una lista de tareas").

## Por qué

En la prueba el agente mezcló qué se quería con cómo hacerlo en una sola ronda (las opciones
de "¿dónde la usás?" ya traían HTML, React Native o Python), el usuario tuvo que corregir dos
veces con "Otro" (SQLite, .NET 10), indagó poco (solo quién la usa y qué funciones), lo tomó
como trabajo directo, no escribió nada y no propuso herramientas. Las reglas lo permitían:
"ante la duda, el tamaño más liviano", unas preguntas de arranque mínimas, y la base `nzt`
haciendo de todo.

## Lo decidido

1. **La base `nzt` solo habla, lee el estado, dimensiona y rutea.** No entiende el pedido
   ni decide cómo se hace: eso es de otras skills.
2. **Cada skill es dueña de una responsabilidad y de sus documentos:**

   | Skill | Responsabilidad | Escribe |
   |---|---|---|
   | `nzt` | cómo se habla, el estado, el tamaño, a dónde va cada pedido | — |
   | `define` *(nueva)* | qué se quiere y para quién: la entrevista, las definiciones, los cambios | `Docs/General/definition.md`, `Docs/General/questions.md`, y por parte `definition.md`, `questions.md`, `change.md` |
   | `approach` *(nueva)* | cómo se hace: tecnologías, materiales, proveedores, lugar; después, las herramientas para trabajar con eso | `Docs/How/how.md`, `Docs/How/questions.md`, y por parte `how.md` |
   | `plan` | en qué unidades y en qué orden | `Plan/state.md` |
   | `do` | hacer una unidad y verificarla | el resultado |
   | `learn`, `tools`, `retro` | como antes | como antes (rutas nuevas) |

3. **Etapas en orden para lo planeado o por partes:** `define` → `approach` → `plan` → `do`,
   cada una con su parada. Lo directo sigue igual: sin documentos, preguntas en el mismo
   mensaje y, si tiene elecciones de base, se proponen ahí (la regla P2 queda solo para lo
   directo).
4. **Entender primero, en lenguaje natural:** `define` pregunta qué se quiere sin nombrar
   tecnologías, en rondas de 3 a 5 preguntas ordenadas por lo que destraban, con casos
   concretos, los bordes y el caso malo por su nombre. El cómo recién en `approach`, en
   preguntas aparte, cada opción con lo que se usaría en concreto y lo que implica.
5. **No hace falta entender todo al principio:** al empezar se define lo general (para qué,
   para quién, qué entra y qué no, en qué partes se divide); el detalle de cada parte se
   pregunta cuando le toca. Una pregunta sin respuesta queda abierta con lo que traba; lo
   que no depende de ella sigue. Nada se inventa: lo supuesto queda marcado como propuesto.
6. **Las preguntas se guardan** antes de hacerlas, con número (`Q-NN` las de qué, `H-NN`
   las de cómo), lo que traban y la respuesta en palabras de la persona con fecha. Solo se
   agrega: una respuesta reemplazada se marca, no se borra.
7. **Cambios con `change.md`,** como en `nzt-software` pero genérico: agregar, modificar o
   quitar, con "antes / ahora" y la frase de la persona como motivo; se aprueba, se aplica
   a la definición con su historial al final y se borra. Quitar deja un criterio que
   comprueba que eso ya no pasa.
8. **`how.md` en vez de `tech.md`,** porque sirve para cualquier trabajo. Su esqueleto es
   fijo (una tabla Decisión | Elección | Por qué | Qué implica por parte, herramientas del
   agente, lo que hace la persona a mano, pendientes) y qué decisiones lleva se deduce de
   qué es el trabajo con una tabla guía (algo que se construye y funciona, contenido, algo
   físico o un servicio, una investigación), con un ejemplo técnico y uno no técnico.
9. **Herramientas después de elegir el cómo:** `approach` siempre revisa qué ayudaría a
   trabajar con lo elegido y lo pasa por `tools`, aunque no falte nada.
10. **Tamaño:** algo nuevo con varias partes que va a seguir creciendo (una app, un curso,
    un libro) nunca es directo.

## La carpeta del trabajo

```
Docs/
  General/              lo que vale para todo el trabajo, sin técnica
    definition.md       qué es, para quién, objetivos, qué entra y qué no, partes, cómo se sabe que salió bien
    questions.md        preguntas y respuestas de qué (Q-NN)
    glossary.md
  How/                  cómo se hace, para todo el trabajo
    how.md
    questions.md        preguntas y respuestas de cómo (H-NN)
    agent-tools.md
  Parts/
    <NN>-<nombre>/      una carpeta por parte o módulo, creada cuando se define
      definition.md
      questions.md
      how.md            solo si la parte decide algo propio
      change.md         solo mientras hay un cambio sin aprobar
  Retros/
Plan/
  state.md
```

- Los nombres de carpetas y archivos son fijos y en inglés, como `Plan/state.md`; lo que se
  escribe adentro va en el idioma de la persona.
- Mudan de lugar: `Docs/glossary.md` → `Docs/General/glossary.md`,
  `Docs/agent-tools.md` → `Docs/How/agent-tools.md`, `Docs/retros/` → `Docs/Retros/`.
- El mapa vive en una referencia de `nzt` (`references/folder.md`); cada skill nombra la
  ruta de lo que escribe.

## Dónde vive cada cosa en las skills

| Pieza | Dónde |
|---|---|
| Mapa de la carpeta del trabajo | `nzt/references/folder.md` (nueva) |
| Formato de los registros de preguntas (lo usan `define` y `approach`) | `nzt/references/questions.md` (nueva, compartida) |
| Las preguntas de arranque y cómo se entrevista | `define/references/interview.md` (reemplaza `nzt/references/starting.md`) |
| La definición (general y de una parte), con un ejemplo técnico y uno no técnico | `define/references/definition-file.md` |
| Los cambios | `define/references/change-file.md` |
| Qué decisiones de cómo tiene cada tipo de trabajo | `approach/references/decisions.md` |
| El archivo `how.md`, con un ejemplo técnico y uno no técnico | `approach/references/how-file.md` |

## Pruebas

Casos con la versión nueva y con la anterior (copia en el scratchpad), de software y de
otros dominios: entrevista de una app nueva, definición de un curso, quitar algo ya
acordado, el cómo de una app, el cómo de un evento, escribir `how.md` y proponer
herramientas, más regresión (un bug directo, una planilla, la mudanza).

**Resultado (2026-11-09):** 9 casos, versión nueva contra la anterior. Nueva 48/52 en la
primera vuelta, anterior 72%. Dos ajustes tras mirar los resultados:
- `define` no escribía la definición cuando la persona decía "ya lo hablamos todo, armala":
  seguía preguntando. Ahora, si la pide, la escribe con lo que hay y deja lo que falta como
  *proposed* u *Open*. Segunda vuelta del caso del curso: 6/6. Total: 51/52.
- Los registros de preguntas traducían los encabezados y los campos; el formato fija en
  inglés los encabezados, los ids y los campos (`blocks`, `proposed`, `answer`).

Queda abierto: en el cumple, `approach` dejó el reparto del presupuesto para después en vez
de preguntarlo con las demás decisiones (el único criterio que no pasó). La versión anterior
no guardaba preguntas, no escribía `change.md` ni `how.md`, mezclaba tecnologías con lo que
se quería y dejaba la definición del curso suelta en la raíz.

