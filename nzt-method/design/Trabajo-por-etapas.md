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


## Tercera prueba real y los temas del cómo (2026-11-09)

Sesión en la app (`nzt-proyecto`, "quiero hacer una aplicación para cargar una lista de
tareas"), ya con `define` y `approach`. Claude leyó el registro entero con un script y la
carpeta que quedó.

### Lo que se vio

- **Herramientas, nunca:** `approach` pasó de las respuestas `H-01`/`H-02` directo a `plan`.
  Se saltó el paso 8: no cargó `tools` ni dijo en una línea que no hacía falta nada. No hay
  `Docs/How/agent-tools.md` y `how.md` no tiene *Agent's tools*. `nzt` tampoco dijo que iba
  sin paquete y con lo que sabe (paso 7). Causa: el paso 8 dice "para lo que una herramienta
  haría mejor" y `tools` paso 1 dice "si ya lo podés hacer bien, no hay herramienta": el
  agente decidió en silencio que no hacía falta.
- **El cómo, corto:** solo dos preguntas (con qué y dónde se guardan los datos). "Cómo se
  comprueba" lo decidió el agente ("sin pruebas automáticas"), contra la regla 1 de
  `how-file.md`; "cómo llega a quien la usa" no se preguntó. Ni estructura ni patrones: todo
  el servidor quedó en `Program.cs` (SQL a mano por endpoint, sin pruebas, sin git). Causa:
  la tabla de `decisions.md` no tiene estructura, calidad ni convenciones, y el filtro "solo
  lo costoso de cambiar" invita a recortar.
- **Sesgo de los ejemplos:** `decisions.md` y `how-file.md` traen ".NET 10 con SQLite" y "No
  automated tests for now", y eso fue lo que el agente recomendó y escribió.
- **Referencia:** `nzt-software` lo cubre con `architecture/references/tech.md` (decisiones
  por componente, preparar herramientas en una ronda, opt-ins de calidad siempre
  preguntados, incluidos los "no") y `software/references/choosing.md` (cada eje con lo que
  cuesta cada valor).

### Decidido con el usuario

- **D1 · Herramientas:** al decidir el cómo, las herramientas son **siempre** una pregunta
  más, con opciones concretas para trabajar mejor con lo elegido y la opción de ninguna,
  aunque al agente le parezca que no falta nada. Además, en cualquier momento, cuando el
  agente ve que una herramienta haría mejor el trabajo, pregunta si quiere que se fije. Nunca
  suma nada solo: pregunta y propone. Reemplaza P3 → principio 10 (`Principios.md`).
- **D2 · Siete temas del cómo**, que `approach` recorre siempre en un trabajo nuevo:

  | Tema | Qué decide | Ejemplo en software | Ejemplo en otro trabajo |
  |---|---|---|---|
  | Base | con qué y dónde se hace | lenguaje, plataforma, datos | lugar, catering, materiales |
  | Estructura | cómo se organiza por dentro para poder mantenerlo y crecer | arquitectura, patrones, organización del código | orden del día, capítulos, quién coordina qué |
  | Calidad | cómo se comprueba que está bien | niveles de prueba, prueba primero | prueba de menú, corrección, checklist |
  | Convenciones | reglas que se siguen siempre | nombres, estilo del código | guía de estilo, marca |
  | Dependencias | lo de terceros que se suma, con el sí de la persona | librerías | proveedores, señas |
  | Entrega | cómo llega a quien lo usa | instalar, publicar | invitaciones, publicación |
  | Herramientas del agente | con qué trabaja mejor el agente (D1) | documentación oficial, analizadores | planilla compartida |

  Cada tema se pregunta, se lee de lo que ya está (`how.md`, la evidencia) o se dice en una
  línea "no aplica porque…"; nunca se saltea en silencio. El usuario pidió ver **cómo se
  construye** antes de escribirlo.
- **D3 · Cuándo se pregunta:** en lo planeado o por partes, los siete temas; en lo directo,
  solo la base si hace falta. Y **solo lo que falta**: si `how.md` ya lo dice, se lee de ahí;
  en un trabajo existente sin `how.md`, la evidencia responde primero. No se pregunta
  siempre, sino cuando hace falta.
- **D4 · Preguntar bien sin paquetes:** el método genérico tiene que poder preguntar bien
  cada tema por sí solo: el agente deduce los ejes y las opciones del tema según lo elegido
  en la base, cada opción con su nombre real y lo que cuesta, como `choosing.md` pero sin
  lista fija. Un paquete de dominio, si está, solo aporta valores fijos para un tema; la
  forma de preguntar es siempre la de `approach`.
- **Relación con `nzt-software` (observación del usuario, para cuando se integre):** si
  `nzt-software` pasa a apoyarse en el método genérico, tendrá que quitar lo que el genérico
  ya hace (entender, decidir el cómo, herramientas, plan, retro, enseñar, estado) y quedarse
  con el saber de software (por ejemplo los valores de `choosing.md` y sus prácticas) como
  paquete. Sigue abierto en `Idea.md` → *Preguntas abiertas*.

### Cómo construirlo (aprobado por el usuario el 2026-11-09)

1. **`approach/references/decisions.md`** pasa a ser los siete temas: qué decide cada uno,
   ejemplos de tres dominios, cómo deducir los ejes de un tema según la base (D4), la regla
   "se pregunta, se lee o no aplica" y que la calidad nunca la decide el agente solo. Se
   quita el filtro "solo lo costoso" como motivo para no preguntar un tema (sigue valiendo
   para los detalles dentro de un tema).
2. **`approach/SKILL.md`:** el paso 3 recorre los temas y anota cuáles ya están (D3); el
   paso 6 pregunta en rondas por dependencia (base → estructura, calidad, convenciones,
   dependencias, entrega → herramientas); el paso 8 siempre pregunta las herramientas con
   opciones concretas y la de ninguna, y con un sí carga `tools` para investigar e
   instalar. El *Done when* pide los siete temas resueltos y la pregunta de herramientas
   hecha.
3. **`approach/references/how-file.md`:** la tabla suma la columna *Tema*, una línea por
   decisión; sección *Conventions* de una línea cada una; *Agent's tools* obligatoria (o
   "ninguna, porque…"); el detalle va al registro `H-NN`. Ejemplos nuevos que no enseñan
   "sin pruebas" ni repiten el caso de la prueba.
4. **`tools/SKILL.md`:** el paso 1 deja de cortar en "si ya lo podés hacer bien"; si viene
   de `approach` con la herramienta ya elegida, esa elección es el sí para investigar. La
   `description` suma "cuando una herramienta haría mejor el trabajo".
5. **`do/SKILL.md`:** en la parada, si vio que una herramienta haría mejor el trabajo, lo
   dice y pregunta si se fija (D1, "en cualquier momento").
6. **Pruebas** con `skill-creator`, contra la versión actual copiada en el scratchpad:
   `app-how` (pide los siete temas y la pregunta de herramientas), `party-how` (los temas se
   adaptan a un evento), nuevo `book-how` (contenido), nuevo `existing-how` (con `how.md`
   a medias: pregunta solo lo que falta) y `how-written-tools` como regresión.

### Hecho (2026-11-09)

Con `gestionar-skills` (reglas: una responsabilidad por skill, sin redundancia, genéricas,
referencias a un nivel) y `skill-creator`:

- **`approach`:** `SKILL.md` con 10 pasos (recorre los siete temas, busca opciones, pregunta
  en rondas, dice en una línea lo que no aplica, escribe `how.md`, **siempre** carga `tools`).
  `references/decisions.md` reescrita como *los temas del cómo* (tabla por tipo de trabajo,
  tres formas de cerrar un tema, cómo deducir ejes y valores sin paquete, orden de las
  rondas). `references/how-file.md`: columna *Topic*, una línea por decisión, *Conventions*,
  *Not applicable*; ejemplos nuevos (Python con PostgreSQL y pruebas; la mudanza) que ya no
  enseñan "sin pruebas" ni repiten el caso de la prueba real.
- **Assets:** las plantillas de archivos que se crean desde un esqueleto fijo pasan a
  `assets/`: `approach/assets/how.md` y `tools/assets/agent-tools.md`. La referencia queda con
  las reglas y un ejemplo.
- **Redundancias quitadas:** `how.md` ya no tiene sección de herramientas (la única fuente
  es `Docs/How/agent-tools.md`, de `tools`); "los hechos se investigan" y "los detalles los
  decide el agente" quedan solo en `nzt/references/questions.md`; "no aplica" se dice en un
  solo paso de `approach`.
- **`tools`:** el paso 1 ya no corta en "si ya lo podés hacer bien"; nombra las necesidades
  (escribir, comprobar la calidad, leer la documentación, correr, llegar a un servicio); el
  paso 3 pregunta **cuáles buscar**, con una opción por tipo de herramienta y la de ninguna,
  siempre si viene de `approach`; "ninguna" queda como rechazo en `agent-tools.md`.
  `description` con "cuando una herramienta haría mejor el trabajo".
- **`do`** paso 8 y **`nzt`** paso 8: también cuando una herramienta haría mejor el trabajo.
- **`nzt/references/packages.md`:** un paquete aporta ejes y valores de un tema; sin paquete,
  los deduce el agente.
- **Casos de `approach`:** `app-how` (ronda de la base y anuncia los demás temas),
  `app-structure` (nuevo: base respondida → estructura, calidad y el resto), `book-how` (nuevo:
  libro de recetas), `change-one-choice` (nuevo: cambiar SQLite por PostgreSQL toca solo ese
  tema), `how-written-tools` (ahora con los seis temas respondidos: escribe `how.md` y
  pregunta herramientas aunque no falte nada) y `party-how` (suma los demás temas).

### Auditoría del resto (2026-11-09)

Hallazgos con `gestionar-skills` en las skills no tocadas; **aplicados el 2026-11-09** (ver *Auditoría aplicada*):

1. **Plantillas a `assets/`** para que todas sigan la misma forma que `approach` y `tools`
   (regla 9, consistencia): `nzt/references/state.md`, `glossary.md` y `questions.md`;
   `define/references/definition-file.md` (general y de parte) y `change-file.md`;
   `retro/references/retro-file.md`; `learn/references/plan.md` (estado de un tema),
   `exercises.md` y `teach.md` (archivos de la persona).
2. **Redundancia (regla 2):** "no preguntar lo que ya responden la carpeta o los registros"
   está en `define` paso 3, `define/references/interview.md` regla 7 y
   `nzt/references/questions.md` regla 2; "un detalle dentro de lo acordado lo decide el
   agente" en `do` paso 2 y `questions.md` regla 2. `nzt` paso 8 (elecciones de base en lo
   directo) repite la forma de las opciones de `approach/references/decisions.md`.
3. **Referencias a un nivel (regla 5):** `nzt/references/state.md` remite a `learn` para leer
   el estado de un tema (nombra otra skill, no otra referencia: aceptable, se anota).
4. **Pasos con dos acciones (regla 3):** `approach` paso 6 (preguntar y registrar), `do` paso 6
   (estado y glosario), `learn` paso 6.
5. **Ejemplo de `messages.md` en inglés:** ya anotado; si se repite, pasarlo al español.

### Prueba (2026-11-09, iteración 1)

Seis casos, versión nueva contra la anterior (copia en el scratchpad), 12 corridas:
**nueva 40/42 (95%), anterior 31/42 (75%)**.

| Caso | Nueva | Anterior | Qué se vio |
|---|---|---|---|
| `app-how` | 6/7 | 6/7 | La nueva anuncia estructura, calidad y herramientas; la anterior decide sola cómo se prueba. Pero la nueva **juntó toda la base en una sola pregunta** (dónde corre + lenguaje + guardado + tarea programada) |
| `app-structure` | 7/7 | 4/7 | La nueva pregunta organización del código, acceso a datos, pruebas, convenciones, librerías y arranque; la anterior solo el framework y decide las pruebas. La nueva hizo **siete preguntas en una ronda** |
| `book-how` | 7/7 | 5/7 | La nueva pregunta orden del libro, revisión y convenciones, y dice por qué no hay licencias; la anterior decide la estructura sola |
| `change-one-choice` | 6/6 | 6/6 | No discrimina. La anterior miró la compu (PostgreSQL 17 ya instalado); la nueva no y recomendó instalar el 18 |
| `how-written-tools` | 8/8 | 5/8 | La nueva escribe `how.md` por tema con convenciones y pregunta herramientas con 4 opciones concretas y ninguna; la anterior, un sí o no sobre documentación. La anterior **detectó un choque** (arranque a mano contra los mails del día antes) que la nueva solo dejó como implicancia |
| `party-how` | 6/7 | 5/7 | Ninguna pregunta el reparto del presupuesto (abierto desde la prueba anterior) |

**Para la iteración 2 (aprobados y aplicados el 2026-11-09):**
1. Volver a poner en `decisions.md` "cada decisión en su propia pregunta" (se perdió al
   reescribirla) para que la base no se junte en una sola.
2. Rondas de hasta cuatro preguntas, el resto en la siguiente.
3. El paso 2 de `approach` (leer lo que la persona ya tiene instalado o contratado) se
   cumplió en la anterior y no en la nueva: reforzarlo en el paso 3 ("leído de lo que
   existe" incluye la compu de la persona).
4. Un choque entre una elección y lo que el trabajo tiene que hacer es una pregunta, no una
   implicancia.
5. Algo hecho en el mundo con presupuesto: el reparto del presupuesto va en la base.

Resultados y visor en el scratchpad de la sesión (fuera del repo): `approach-ws/`.

### Prueba (2026-11-09, iteración 2)

Aplicados los 5 ajustes en `approach/references/decisions.md`: una decisión por pregunta;
rondas de hasta cuatro; mirar lo que la persona ya tiene antes de recomendar; un choque con
lo que el trabajo tiene que hacer es una pregunta; el reparto del presupuesto va en la base
de algo hecho en el mundo. Casos: cuatro criterios nuevos (`app-how` una decisión por
pregunta, `app-structure` hasta cuatro por ronda, `change-one-choice` mira lo instalado) y
`how-written-tools` con el choque quitado de sus datos (arranca con Windows, Razor Pages,
contraseña de aplicación), porque con choque lo correcto es preguntar antes de escribir
`how.md`.

Resultado: **nueva 44/44 (100%), anterior 34/45 (76%)**. Lo visto: la base ya sale en
preguntas separadas y recomienda lo que la persona tiene instalado (.NET 10, PostgreSQL 17);
los choques se preguntan (también uno nuevo en `how-written-tools`: qué pasa si la compu
estuvo apagada); el cumple pregunta el reparto del presupuesto; ninguna ronda pasa de
cuatro. `change-one-choice` sigue sin discriminar (la anterior también miró la compu).

### Auditoría aplicada (2026-11-09)

Commit `69aee51` (approach, tools, do y casos) y push antes de empezar. Después, a pedido del
usuario, con `gestionar-skills`:

- **Plantillas a `assets/`:** `nzt/assets/state.md`, `glossary.md` y `questions.md`;
  `define/assets/definition.md`, `part-definition.md` y `change.md`;
  `retro/assets/retro.md` (más los de `approach` y `tools`). Las referencias quedan con las
  reglas y, donde la forma no se deduce, un ejemplo. Cada `SKILL.md` nombra el asset en la
  misma fila del índice que su referencia, y las skills que usan las compartidas dicen que
  sus plantillas están en `nzt/assets/`.
- **`learn` sin assets, a propósito:** sus archivos (lecciones, ejercicios, evaluaciones)
  son de la persona y van enteros en su idioma, títulos incluidos; una plantilla con
  títulos fijos en inglés no sirve. Sus tablas de partes y ejemplos se quedan.
- **Redundancias:** la forma de las opciones (una decisión por pregunta, nombre real, qué
  implica, recomendada primero, palabras simples) pasa a `nzt/references/questions.md` →
  *Options*, que usan `approach`, `define` y `nzt` paso 8; sale de `decisions.md`, de
  `interview.md` y del paso 8 de `nzt`. "No preguntar lo que ya está respondido" queda en
  `define` paso 3 y `questions.md` regla 2 (que suma "o la carpeta"); sale de
  `interview.md`. "Un detalle lo decide el agente" queda solo en `questions.md`; `do` paso 2
  manda a esa regla.
- **Pasos con dos acciones partidos:** `approach` (preguntar / registrar, ahora 11 pasos),
  `do` (estado / glosario, ahora 9) y `learn` (estado / glosario, ahora 8).
- **Error de numeración:** `nzt` paso 7 decía "say so in step 9" y el paso que avisa es el
  10; corregido.
- **Segunda pasada:** ninguna referencia nombra otra referencia; no quedan plantillas
  dentro de referencias.
- **Ajuste tras la regresión:** el índice de `nzt` separa `references/questions.md` (siempre
  que se pregunta o se ofrece una elección) de `assets/questions.md` (solo al crear un
  registro), porque un trabajo directo leía la plantilla sin necesitarla.

### Regresión de la auditoría (2026-11-09)

Seis casos de las skills tocadas, solo con la versión nueva (las corridas contra `69aee51`
se cortaron por el límite de uso y se dejaron para no gastar el doble):

| Caso | Resultado | Qué se vio |
|---|---|---|
| `define/course-definition` | 6/6 | Definición desde `assets/definition.md`, lo no dicho como propuesto, preguntas Q-NN, glosario |
| `define/remove-reminders` | 6/6 | `change.md` desde el asset, con la comprobación de ausencia; nada más tocado |
| `do/person-books-movers` | 6/6 | Material listo con huecos, pide la confirmación escrita, estado en `partial` |
| `retro/house-move-retro` | 7/7 | Retro desde `assets/retro.md`, 8 propuestas `proposed`, estado intacto |
| `nzt/spreadsheet-no-learn-question` | 4/4 | Pregunta el programa con opciones concretas, no pregunta si quiere aprender |
| `plan/birthday-planned` | 2/5 | Se frenó en la entrevista de `define`: **el caso está viejo**, es de antes de las etapas (`af068dd`) y espera que `plan` arme el plan directo desde el pedido |

Total **31/34**; las tres fallas son del caso viejo, no de la auditoría.

**Pendiente de esta parte:**
- ~~Actualizar `plan/evals/birthday-planned` y `move-fixed-deadline`~~ hecho el
  2026-11-09: arrancan con `Docs/General/definition.md` y `Docs/How/how.md` ya escritos y
  el pedido "armá el plan". Corridos con la versión nueva: cumple **5/5** (cinco pasos con
  quién hace cada uno, criterio de terminado, pide aprobación, nada escrito antes del sí) y
  mudanza **6/6** (aviso al dueño y flete primero, cambio de domicilio último como
  recortable, pide aprobación, nada escrito).
- ~~Hueco en `define`: un cambio que saca una parte entera~~ resuelto el 2026-11-09 con la
  propuesta de Claude, que el usuario pidió aplicar: **un pedido es un solo `change.md`**,
  que se aprueba una vez. Si toca una sola definición va al lado de ella; si toca varias
  (sacar una parte cambia también *Parts* e *In* de la general) va en `Docs/General/`, y
  cada punto dice en qué archivo cambia (`in:`). Al aplicarlo, cada definición tocada suma
  su línea de *History*; la parte sacada conserva su carpeta con `Status: removed`; la
  comprobación de ausencia va al *Done when* de la general. Por qué así: una sola
  aprobación y un solo motivo para todo el pedido, y nada se borra sin rastro. Cambiados
  `define/references/change-file.md` (*Where it goes*), `define/assets/change.md` (campo
  `in:`), `define/SKILL.md` paso 9 y `nzt/references/folder.md` (`change.md` en `General/`).
  Caso `remove-reminders` ajustado (criterios 01 y 07) y corrido con la versión nueva: **7/7** (un solo `Docs/General/change.md` con dos puntos, cada uno con su `in:`, comprobación de ausencia en el *Done when* de la general, nada más tocado, pide aprobación).
- Dos corridas vieron los criterios del caso al leer `eval_metadata.json` para sacar la
  consigna: en la próxima, pasar la consigna en el prompt y no el archivo.

## Cuarta prueba real (2026-11-09)

Sesión en la app (`nzt-proyecto`, "Hola quiero construir una aplicacion de tareas"), con
`approach` de siete temas. Claude leyó el registro entero con un script (registro
`7116cee0…`) y la carpeta que quedó.

### Lo que se vio

- **Recorrido completo:** `nzt` → `define` (3 rondas, sin tecnologías, `Q-01`–`Q-10`,
  definición general, parte `01-la-lista`, glosario) → `approach` (3 rondas, miró lo
  instalado) → `tools` → `plan` (4 unidades, 1–3 en batch) → `do` (probó cada regla en el
  navegador, incluido el error al guardar).
- **Los siete temas, preguntados:** base (plataforma, guardado, pantallas), estructura
  (carpeta por función), calidad (la persona eligió sin pruebas automáticas; quedó como
  *Objection*), convenciones (idioma del código), dependencias (EF Core), entrega
  ("localhost") y herramientas. El código ya no quedó todo en `Program.cs`.
- **Herramientas, bien:** opciones concretas y ninguna, investigó en fuentes oficiales,
  segundo sí antes de instalar, re-preguntó cuando la persona no entendió "revisor de
  código", MCP de Microsoft Learn solo en la carpeta, analizador de .NET encendido,
  Roslynator anotado como rechazado.
- **Huecos:** (1) `nzt` no dijo cómo iba el trabajo ni que iba sin paquete (pasos 7 y 10;
  repetido de la tercera prueba); (2) ante "localhost" no re-preguntó la entrega y escribió
  en `how.md` una fila "Asumido… falta confirmarlo", contra la regla 1 de `how-file.md`;
  (3) `approach` paso 8 salteado: el "no aplica" quedó en `how.md` pero no se dijo; (4)
  `agent-tools.md` quedó con "no comprobado" aunque después compiló sin avisos y usó el
  navegador; (5) no hay control de versiones: ningún tema lo cubre.
- **Visto además por Claude:** la interactividad en el servidor de Blazor quedó en `how.md`
  sin preguntarse (venía escondida en "Blazor" y en la plantilla `dotnet new`); `define` no
  preguntó plazo ni límites (dos de las preguntas de arranque).

### Decidido con el usuario

Aceptadas las cinco propuestas de Claude:
1. `nzt` siempre manda el mensaje del paso 10 antes de cualquier pregunta, aunque lo único a
   aprobar sea la carpeta; caso nuevo que lo exige.
2. Una respuesta ambigua o que no elige ninguna opción se vuelve a preguntar antes de seguir
   (`nzt/references/questions.md`); `how-file.md` deja explícito que un supuesto va a `H-NN`
   como abierto, nunca como fila.
3. Decir lo que no aplica va en el mismo mensaje que una ronda de preguntas, no como paso
   suelto.
4. `do` actualiza *Checked* de `agent-tools.md` cuando usa una herramienta.
5. Sumar "cómo se guardan las versiones y cómo se vuelve atrás", genérico (git, historial
   del documento, copias). **En charla:** en qué tema va.

### En charla: lo que sintió el usuario (2026-11-09)

- **G1 · Glosario en dos idiomas:** cada término con su nombre en el idioma de la persona y
  en inglés, para que el agente tenga la traducción cuando trabaja en inglés (código,
  archivos). Referencia: `nzt-software` ya pone el nombre en el trabajo (`Cupón · Coupon`).
- **G2 · La forma del todo no se pregunta:** hizo todo en un Blazor Server con EF Core sin
  preguntar si una sola pieza o una API y un front por separado. Se quiere genérico: no
  hacer de una sin preguntar. Referencia: `nzt-software` `design-product.md` → *Shape*.
- **G3 · La definición es una spec chica:** `define` no pregunta límites (cantidad máxima de
  caracteres y similares, que `nzt-software` sí pregunta), sin atarlo a software.
- **G4 · Las partes quedan cortas:** `01-la-lista` junta agregar, editar, borrar…; ¿está
  bien o van en más archivos?, ¿y cómo se planifican en unidades?
- **G5 · Criterios de aceptación** genéricos, por cada cosa (agregar, editar…), además de
  las *Rules*. Referencia: `nzt-software` separa reglas (`RN-`, siempre verdaderas, en la
  spec) de criterios (`CA-NN`, con datos concretos, en cada historia).

**Propuesta de Claude (sin decidir):**
- **G1:** el glosario suma la columna *In English* (o el nombre en el idioma del trabajo, si
  no es inglés): el único nombre que se usa en el código, archivos y datos. Se llena siempre.
- **G2:** el tema *Estructura* empieza por **la forma**: en cuántas piezas que se entregan o
  evolucionan por separado se divide el todo y cómo se hablan (una app o API + front; una
  fiesta o ceremonia y fiesta en dos lugares; un curso o tres cursos cortos). Siempre una
  pregunta cuando la base admite más de una. Y una regla general: **una elección escondida
  en otra** (Blazor trae servidor o navegador; una plantilla trae sus valores) se pregunta
  aparte o la opción la nombra; el agente no la toma de un default.
- **G3:** `define` pregunta, por cada cosa que el trabajo maneja, **sus límites y valores**:
  qué es obligatorio, cuánto como máximo o mínimo, qué valores valen, qué pasa si se repite.
  Va en la parte, en una sección *What it handles*. La general suma **How well** (lo que se
  espera con número y condición: cuántas tareas sin que tarde, cuántos invitados sin
  esperar) y siempre pregunta plazo y límites (dos preguntas de arranque que se saltó).
- **G4:** una parte es lo que se entiende, se acepta y crece por su cuenta (un módulo);
  `01-la-lista` como única parte está bien para una app chica. Dentro de la parte, lo que se
  puede hacer va como **capacidades** (agregar, editar…), no en archivos aparte. `plan`
  corta las unidades por capacidad (una o varias por unidad, nunca por capa) y el *Done
  when* de la unidad cita sus criterios.
- **G5:** cada capacidad tiene **criterios de aceptación** `AC-NN` (cuando…, entonces…, con
  datos reales, al menos uno del caso malo) y cita las reglas que cumple. Las *Rules* quedan
  solo para lo que es siempre verdad (una tarea vencida y sin hacer se destaca). Así *Known
  by* desaparece: lo reemplazan los criterios.

### En charla: carpeta por módulo y un archivo por capacidad (2026-11-09)

Pedido del usuario: agrupar por carpeta, tipo módulo (`Tasks/` y adentro crear, editar…),
cada cosa con su definición, con un registro de preguntas como el `analysis.md` por
feature de `nzt-software`, y revisar si `Parts` es el mejor nombre.

**Cómo lo hace `nzt-software`** (`discovery`): `Docs/Product/product.md` con los módulos en
una línea (sin carpetas) y su `analysis.md`; cada feature en `Plan/specs/F-NNN-<slug>/` con
`analysis.md` (preguntas `Q-NN` de la feature), `spec.md` (alcance, reglas `RN-<slug>` con
`origin:`, requisitos no funcionales con número y condición, índice de historias),
`stories/US-NNN-<slug>.md` (una historia por archivo con criterios `CA-NN` concretos y al
menos un caso malo) y `change.md` mientras hay un cambio. El plan corta **una unidad por
historia**; una historia se escribe cuando le toca y hasta entonces es una línea del índice.

**Propuesta de Claude (sin decidir):** dos niveles, igual que feature → historias:

```
Docs/
  General/             definition.md, questions.md, glossary.md  (como hoy)
  How/                 how.md, questions.md, agent-tools.md      (como hoy)
  Parts/               (nombre en charla)
    01-tasks/          un módulo: se entiende, se acepta y crece por su cuenta
      definition.md    la spec del módulo: qué cubre, reglas siempre verdaderas,
                       What it handles (límites y valores), How well, índice de capacidades
      questions.md     las Q-NN de este módulo (como analysis.md)
      change.md        solo mientras hay un cambio sin aprobar
      how.md           solo si el módulo decide algo propio
      01-create.md     una capacidad: para quién y para qué, criterios AC-NN, reglas que cita
      02-edit.md
      03-delete.md
```

- **Capacidad = historia:** un archivo por cosa que se puede hacer o lograr. Criterios
  `AC-NN` numerados dentro de la capacidad, citados `01-tasks/02-edit AC-01`. Se escribe
  cuando se acerca su unidad; hasta entonces es una línea del índice del módulo.
- **Reglas en el módulo,** no en la capacidad: varias capacidades cumplen la misma regla
  (atrasada vale para crear y editar); la capacidad la cita por su nombre.
- **Preguntas por módulo,** no por capacidad: un solo registro por carpeta, como
  `analysis.md` por feature.
- **Sin tercer nivel:** un módulo que pasa de unas ocho capacidades se parte en dos.
- **Plan:** una unidad por capacidad (las chicas en batch); un módulo sin definir empieza con
  su definición. El *Done when* de la unidad cita los `AC-NN`. El avance sigue solo en
  `Plan/state.md`: los criterios no llevan casillas.
- **Ejemplo no técnico (una fiesta):** `01-invitados/` con `01-invitar.md`,
  `02-confirmar.md` (AC-01: cuando Juan confirma con acompañante, la lista suma 2);
  `02-comida/` con `01-elegir-menu.md`, `02-prueba-de-menu.md`.
- **Nombre de la carpeta:** opciones `Parts` (el más genérico: libro, mudanza, curso),
  `Modules` (natural en apps y cursos, raro en una mudanza) o `Areas`. Recomendación:
  dejar `Parts` fijo y que el glosario diga cómo lo llama la persona en la conversación
  ("módulo", "capítulo", "etapa").

**Decidido (2026-11-09):** la carpeta se queda como `Parts`; el glosario dice cómo la llama
la persona en la conversación.

### En charla: cada pieza del resultado en su carpeta (2026-11-09)

Pedido del usuario: el resultado no va suelto en la raíz; cada componente en su carpeta
(la API en una, el front en otra). En la cuarta prueba el proyecto de Blazor quedó en la
raíz, mezclado con `Docs/` y `Plan/`. Referencia: `nzt-software` `architecture.md` →
*Components*, con la columna *Root* de cada componente.

**Propuesta de Claude (sin decidir):**
- **Regla en `nzt/references/folder.md`:** el resultado vive en carpetas propias, nunca
  suelto en la raíz junto a `Docs/` y `Plan/`; aunque sea una sola pieza, va en su carpeta.
- **Se decide con la forma (G2):** al preguntar en cuántas piezas se divide el todo, cada
  pieza lleva su carpeta (`TaskList.Api/`, `TaskList.Web/`; en un libro `Manuscript/`; en
  una fiesta `Invitaciones/`, `Proveedores/`). `how.md` anota la carpeta de cada pieza en la
  fila de la forma (tema *Structure*).
- **Trabajo existente:** la carpeta que ya tiene se respeta; mover algo se propone y se
  pregunta, nunca se hace solo.

### Aplicado (2026-11-09)

El usuario aprobó todo ("Sí, aplicalo"), con las versiones en **Calidad**. Hecho con
`gestionar-skills` y `skill-creator`, versión anterior copiada en el scratchpad
(`ws/skill-snapshot`):

- **`nzt`:** paso 10, el mensaje de cómo va el trabajo sale antes de la primera pregunta,
  aunque solo haya que aprobar la carpeta. `references/questions.md`: regla 4 nueva (una
  respuesta que no elige opción, se lee de dos formas o es otra pregunta se vuelve a
  preguntar ya; nunca se anota un supuesto) y en *Options* "ninguna elección escondida en
  otra" (un default nunca se toma en silencio). `references/folder.md`: parte con su
  `definition.md`, `questions.md` y un archivo por capacidad; dos niveles (más de unas ocho
  capacidades → dos partes); el resultado en carpetas propias, una por pieza de la forma,
  nunca suelto en la raíz; `agent-tools.md` lo marca también `do`. Glosario: columna *In
  English* (G1) y el nombre que la persona da a las partes es un término.
- **`define`:** `assets/part-definition.md` (qué cubre, reglas siempre verdaderas, *What it
  handles* con límites, *How well*, índice de capacidades), `assets/capability.md` nuevo
  (criterios `AC-NN`), `assets/definition.md` con *How well*. `definition-file.md`
  reescrita: la definición es la spec; reglas, criterios, límites con número, nivel con
  número y condición; ejemplos de app y de mudanza. `interview.md`: pregunta de *How
  well*, cada pregunta de arranque se hace, se lee o se dice que no aplica, preguntas de la
  parte (capacidades, reglas, límites) y "límites por su número". `SKILL.md`: pasos 8
  (definiciones y capacidades) y 9 (glosario con nombre en inglés), ahora 12 pasos.
  `change-file.md`: un cambio puede agregar o cambiar capacidades y criterios.
- **`approach`:** `decisions.md`: Estructura empieza por **la forma** (piezas y carpeta de
  cada una); Calidad suma versiones y cómo volver atrás. `how-file.md`: lo adivinado es un
  `H-NN` abierto, nunca una fila "asumido"; ejemplo con fila de forma y de versiones.
  `SKILL.md`: el "no aplica" va en el mensaje de la primera ronda (paso 8 viejo
  absorbido; 10 pasos). Se acepta que el paso 6 diga dos cosas porque son un solo mensaje.
- **`plan`:** `slicing.md`: una unidad entrega capacidades enteras (una o pocas de la misma
  parte), nunca una capa; su *Done when* cita los `AC-NN`.
- **`do`:** paso 8 nuevo, marca *Checked* en `agent-tools.md` de lo que usó (10 pasos);
  `verify.md`: cada `AC-NN` es una línea que se prueba con sus valores y se reporta por id.
- **Casos:** nuevos `approach/ambiguous-delivery`, `define/part-capabilities`,
  `plan/plan-by-capability`; criterios nuevos en `nzt/new-app-interview` (mensaje antes
  de preguntar), `approach/app-structure` (forma, versiones) y `approach/party-how`
  (forma). Glosario del método: parte, capacidad, regla, criterio de aceptación, forma.

### Prueba (2026-11-10)

Siete casos, versión nueva contra la anterior (`ws/skill-snapshot`), consigna pasada en el
prompt de cada corrida. Iteración 1: **nueva 91%, anterior 63%**.

| Caso | Nueva | Anterior | Qué se vio |
|---|---|---|---|
| `define/part-capabilities` | 7/7 | 2/7 | La nueva: reglas aparte, *What it handles* con 200 caracteres propuestos, un archivo por capacidad con `AC-NN` y casos malos, glosario con inglés. La anterior: todo en un `definition.md`, sin criterios ni límites |
| `approach/ambiguous-delivery` | 6/6 | 3/6 | Las dos re-preguntan "localhost"; solo la nueva pregunta el modo de Blazor, las versiones y la carpeta |
| `approach/app-structure` | 10/10 | 8/10 | La nueva pregunta la forma (piezas y carpetas) y anota git como pregunta |
| `approach/party-how` | 7/8 | 6/8 | La nueva dice la forma ("una sola fiesta") y anuncia las copias de lo firmado; ninguna pregunta el reparto del presupuesto (abierto desde antes) |
| `plan/plan-by-capability` | 4/4 | 3/4 | Las dos cortan por capacidad; solo la nueva cita los `AC-NN` |
| `define/course-definition` | 5/6 | 3/6 | La nueva no anotó lo dicho como respuestas en el registro |
| `nzt/new-app-interview` | 4/6 | 5/6 | La nueva se frenó a pedir el sí de la carpeta sin entrevistar, y no dijo que se elige el cómo |

Ajustes (iteración 2 y 3, solo la nueva):
- `nzt` paso 10: la carpeta o el paquete a aprobar van en la misma ronda que las primeras
  preguntas de la skill siguiente; se para solo si nada puede seguir sin el sí.
  `messages.md`: el tamaño planeado se dice "primero entiendo qué necesitás, después
  elegimos con qué se hace y te armo un plan".
- `define` paso 3: lo dicho se anota como preguntas respondidas, en sus palabras.
- `interview.md` regla 3: cada ronda, también la primera, trae al menos un caso concreto.
- Criterio 04 de `new-app-interview`: el glosario también es válido en `Docs/General/`.

Resultado: `course-definition` **6/6**; `new-app-interview` 4/6 en la iteración 2 (sin caso
concreto; escribió glosario) y **6/6** en la 3 (pregunta "pagar el alquiler vence el 1 y no
lo tachaste, ¿qué pasa el 2?"). Queda abierto: el reparto del presupuesto en el cumple. Visor
de la iteración 1 en el scratchpad (`ws/iteration-1/review.html`), fuera del repo.

**Decidido (2026-11-10):** los ejemplos con tecnologías reales de `how-file.md` (Python con
FastAPI y PostgreSQL), `decisions.md` y `nzt/references/questions.md` se dejan como están.
El usuario preguntó si rompían lo genérico; Claude explicó que son ejemplos de la forma
(uno técnico y uno no técnico, punto 8 de *Lo decidido*) con riesgo de sesgo, y propuso
aclarar que no son recomendaciones. El usuario prefirió no tocar nada. Si en una prueba el
agente vuelve a copiar el stack del ejemplo, se retoma.

## Quinta prueba real (2026-11-10)

Sesión en la app (`nzt-proyecto`, "Hola quiero crear una aplicacion de tareas"), con todo lo
de la cuarta prueba aplicado. Claude leyó el registro entero con un script (registro
`20a3be0b…`, 597 líneas) y la carpeta que quedó.

### Lo que se vio

- **Bien:** re-preguntó una respuesta ambigua ("si" a una pregunta doble) con opciones;
  preguntó la forma (dos piezas: `TaskList.Api/` y `TaskList.Web/`, cada una en su carpeta),
  el modo de Blazor, las versiones (git, commit al cerrar el paso 1), los límites (200
  caracteres, orden, hechas aparte, fechas pasadas) y *How well* (1.000 tareas, medido: 0,6
  s); capacidades `01-add` y `02-list` con `AC-NN` y casos malos, 03–05 "to define";
  plan por capacidad; glosario con *In English*.
- **Mensaje antes de preguntar:** falló otra vez (segunda prueba seguida). Cargó `define` y
  lanzó la primera ronda sin texto antes; nunca dijo cómo iba el trabajo.
- **Preguntas por texto (lo sintió el usuario):** la segunda ronda de `define` fueron 4
  preguntas escritas, no por la herramienta. Causa: `messages.md` → *Asking* deja las
  respuestas abiertas en el mensaje, y el agente las tomó como abiertas aunque daba ejemplos
  y una opción propuesta. Además juntó dos decisiones en una (la 2 y la 4).
- **Arquitectura y convenciones sin preguntar (lo sintió el usuario):** de *Estructura* solo
  preguntó la forma; el orden interno (`Tasks/` por función) y "código en inglés (decidido
  por mí, avisado)" los decidió solo y no lo dijo en ningún mensaje. Causa: la persona dijo
  "No, solo usarla" sobre el código, y "nunca es solo del agente" estaba solo en *Calidad*.
- **MCP de Microsoft Learn sin usar (lo sintió el usuario):** lo instaló bien (en la carpeta,
  segundo sí) pero responde recién en una sesión nueva; lo dijo recién al final, y la opción
  aceptada prometía una prueba que no se hizo. `tools` paso 7 decía "se sigue sin ella".
- **Menores:** el *Done when* de las unidades no cita los `AC-NN` (el plan se escribió antes
  que las capacidades); dio el paso 1 por hecho con una falla sin explicar (clics rápidos).

### Decidido con el usuario (2026-11-10)

- **Jamás asumir** (regla general, va solo en `nzt/SKILL.md`: es comportamiento del agente y
  esa skill queda cargada toda la sesión). Una duda se pregunta, con opciones y la
  recomendada primero, por la herramienta de preguntas. Lo único que no se pregunta es lo
  comprobable (una versión, un precio, un horario): se investiga con su fuente y se dice.
  Referencia: `nzt-software` ("Assuming is not an exit"); su `kernel.md` "state every other
  assumption" **no** se copia.
- **Decir todo lo que la persona necesita saber, cuando pasa:** lo que cambia lo que ve,
  hace, espera o paga (una herramienta que pide reiniciar, una prueba prometida que no se
  hizo, una falla sin explicar, algo hecho distinto de lo acordado).
- **`messages.md`:** se saca "Lo que estoy suponiendo"; se suma "Lo que decidí yo", solo
  con el modo *Propongo yo*. *Asking* sigue ahí (cómo se pregunta): toda decisión va por la
  herramienta; si se pueden dar ejemplos, son opciones; en el mensaje solo lo que no tiene
  opciones (un ejercicio, un archivo, un texto largo); una decisión por pregunta; rondas
  del tamaño que acepte la herramienta.
- **`nzt` paso 10:** el mensaje es texto escrito antes de cargar la skill siguiente; la
  herramienta de preguntas no lo reemplaza.
- **`define` sin modo:** todo se pregunta. Un valor que propone el agente es su propia
  pregunta con la opción recomendada; en la definición nunca queda nada *(proposed)*: está
  respondido o abierto.
- **Modo de decidir en `approach`** (como `nzt-architecture`): después de recorrer los siete
  temas dice cuántas preguntas hay y de qué clase y pregunta el modo: **Juntos**
  (recomendado), **Propongo yo** (decide los detalles y los dice en "Lo que decidí yo") o
  **Vos me decís**. Cubre solo detalles: base, forma, organización interna (arquitectura),
  convenciones, calidad y versiones se preguntan siempre. Se anota en la primera línea de
  `Docs/How/questions.md` con la fecha; se puede cambiar. "No voy a tocar el código" no es
  delegar.
- **`do`:** lo que no cambia nada para la persona (un nombre interno, un puerto) se hace; lo
  que cambia lo que ve, usa o paga, o costaría cambiar, se pregunta (o se decide y se dice
  con *Propongo yo*). Una falla sin explicar se dice y no deja dar la unidad por hecha en
  silencio; cuando las capacidades se escriben, el *Done when* de la unidad cita sus `AC-NN`.
- **`tools`:** si la herramienta responde recién tras reiniciar, se dice en la pregunta del
  sí; después se pregunta si se sigue en una sesión nueva (recomendado) o ahora sin ella,
  leyendo mientras tanto la documentación oficial por otro medio. Nunca se promete una
  prueba que no se puede hacer.
- **Casos:** criterios de `define/course-definition` (04) y `define/part-capabilities` (02)
  pasan a exigir que se pregunte en vez de marcar *proposed*; casos nuevos para "solo
  usarla" (igual pregunta arquitectura, convenciones y modo) y herramienta que pide reiniciar.

El usuario pidió aplicarlo todo y probarlo con evals mientras no está.

### Aplicado (2026-11-10)

Hecho con `gestionar-skills` y `skill-creator`; versión anterior copiada en el scratchpad
(`ws5/skill-snapshot`).

- **`nzt/SKILL.md`:** sección *Rules* nueva (vale para todas las skills): 1 **jamás
  asumir** (una duda es una pregunta con opciones y la recomendada; solo lo comprobable se
  investiga y se dice; no saber del tema o no tocar el resultado no es delegar; solo decide
  el agente los detalles que la persona le dejó en `approach`, y los dice) y 2 **decir lo
  que la persona necesita saber, cuando pasa**. Paso 8 resumido (la base se pregunta por la
  regla 1). Paso 10: el mensaje es texto antes de cargar la skill siguiente y antes de
  cualquier pregunta; la herramienta no lo reemplaza.
- **`messages.md`:** fuera "What I'm assuming"; nuevo "What I decided" (solo detalles
  dejados al agente). *Asking*: toda pregunta con respuestas posibles va por la
  herramienta, también lo que suena abierto ("¿cómo lo manejás hoy?": papel, nota,
  otra app); si hay ejemplos, son opciones; ronda del tamaño que acepte la herramienta;
  en el mensaje solo lo que no tiene opciones. "assuming:" sacado de *Words*; ejemplo de
  la mudanza con los supuestos pasados a preguntas.
- **`nzt/references/questions.md`:** regla 2, todo lo no comprobable se pregunta; la
  única excepción es un detalle de cómo se hace con el modo *I propose*. Regla 3: un valor
  propuesto se pregunta como opción recomendada, nunca se escribe como acordado.
  `assets/questions.md`: línea `Mode:` (solo el registro del cómo).
- **`define`:** sin modo, todo se pregunta (dicho en la intro). Paso 3: huecos en *Open*,
  nunca rellenados. Paso 7: lo que el agente agregaría va como pregunta propia, no dentro
  del resumen a aprobar. `definition-file.md`: sin *(proposed)* (regla 6 reescrita, regla 4
  pregunta el número, ejemplos citan `Q-NN`); `assets/part-definition.md` origin solo
  `Q-NN`.
- **`approach`:** paso 6 nuevo, preguntar el modo (11 pasos). `decisions.md`: "Quality is
  never the agent's alone" pasa a **ningún tema es solo del agente** (base, forma y orden
  interno, calidad y versiones, convenciones, terceros, entrega; también con "solo la
  quiero usar") y sección nueva *Deciding the details* (Together recomendado, I propose,
  You dictate; primera línea del registro del cómo; vale para `do`). `how-file.md` regla 1:
  admite filas de detalles dejados al agente, citadas "decided by the agent, told on…".
- **`tools`:** paso 5, la propuesta dice si anda ya o tras reiniciar y promete solo la
  prueba posible; paso 7, si responde recién tras reiniciar se dice ya y se pregunta
  (sesión nueva recomendada, o seguir sin ella leyendo la documentación por otro medio),
  anotado en el próximo paso del estado.
- **`do`:** paso 2, lo que no cambia nada para la persona se hace; lo que cambia lo que ve,
  usa o paga se pregunta (o se decide y se dice con *I propose*). Paso 3: el *Done when*
  cita los `AC-NN` si las capacidades se escribieron después del plan. `verify.md`: una
  falla sin explicar no deja dar *done*.
- **Casos:** `define/course-definition` 04 (renombrado `04-asked-or-open`) y
  `define/part-capabilities` 02 exigen preguntar en vez de *proposed*;
  `nzt/new-app-interview` 07 (preguntas por la herramienta, una decisión cada una);
  `approach/app-structure` 11 (modo); nuevos `approach/use-only-still-asks` (6 criterios) y
  `tools/restart-needed` (5 criterios, instala de verdad con `claude mcp add` en la carpeta).

### Prueba (2026-11-10, quinta)

Ocho casos, nueva contra anterior (`ws5/iteration-1` en el scratchpad), consigna en el
prompt de cada corrida. Iteración 1: **nueva 94%, anterior 78%** (con `app-structure`
recalificado con una regla pareja: un tema cuenta como preguntado si va en esta ronda, o
si está anotado con opciones en el registro y anunciado para la próxima).

| Caso | Nueva | Anterior | Qué se vio |
|---|---|---|---|
| `nzt/new-app-interview` | 7/7 | 6/7 | La anterior dejó "¿cómo anotás hoy?" escrita en el texto (y doble); la nueva la pasó por la herramienta con opciones (papel, nota, otra app, de memoria) |
| `define/course-definition` | 6/6 | 4/6 | La anterior escribió en la definición Android o iPhone, contenido de las clases, 9 de 10 y 12 alumnos como *proposed*; la nueva los dejó abiertos y los preguntó |
| `define/part-capabilities` | 6/7 | 6/7 | La anterior escribió "200 caracteres (proposed)"; la nueva dejó sin caso malo a agregar y editar porque dependían de una pregunta abierta |
| `approach/app-structure` | 11/11 | 5/11 | Solo la nueva pregunta el modo y anota con opciones la organización, pruebas, versiones, forma y librerías |
| `approach/use-only-still-asks` | 5/6 | 5/6 | Las dos siguen preguntando con "solo la quiero usar"; la nueva pregunta el modo, pero sus opciones de organización del código no dicen qué significan para la persona |
| `approach/ambiguous-delivery` | 5/6 | 5/6 | La anterior eligió sola la carpeta `TaskApp/` ("es un detalle mío"); la nueva no nombró carpeta |
| `approach/party-how` | 8/8 | 6/8 | La nueva pregunta el modo y anota el reparto del presupuesto (H-05, abierto desde antes) y la forma; la anterior trae "Lo que estoy suponiendo" |
| `tools/restart-needed` | 5/5 | 5/5 | No discrimina: en una corrida corta las dos avisan y preguntan cómo seguir. La falla real pasó en una sesión larga |

Ajustes (iteración 2 y 3, solo la nueva):
- `definition-file.md` regla 3: un caso malo cuya respuesta está abierta se escribe igual,
  con su *then* citando el `Q-NN`. `decisions.md`: con la forma ya respondida, una pieza
  sin carpeta igual la recibe, preguntada como detalle. Criterio 04 de
  `ambiguous-delivery` aclara que el nombre de la carpeta puede quedar abierto.
- Iteración 2: `part-capabilities` **7/7**, `ambiguous-delivery` **6/6**. Pero el
  calificador encontró en `part-capabilities` cosas dadas por acordadas que la persona no
  dijo ("si dejás el texto vacío no se guarda y te avisa", "se muestra el límite",
  "texto obligatorio"). Ajuste: `define` paso 7, el resumen va en tres grupos (lo que
  dijo, en sus palabras; lo que se deduce, a confirmar; lo abierto) y un comportamiento no
  dicho nunca está en los dos primeros; `definition-file.md` regla 6, un criterio tiene solo
  lo dicho o lo que se deduce, lo demás se pregunta. Criterio nuevo 08-nothing-invented.
- Iteración 3: `part-capabilities` **8/8**. El resumen separa "Lo que dijiste" (sus
  palabras), "Lo que deduje" (texto obligatorio, se guarda al cerrar, una hecha o sin
  fecha nunca en rojo…, confirmado en la primera pregunta) y lo que falta; los criterios
  citan la deducción o la pregunta abierta.
- Iteración 4 (pedido del usuario, los dos detalles chicos): `define` paso 7, cada
  deducción se acepta o rechaza por separado (con la herramienta, una pregunta de elección
  múltiple con una opción por deducción), nunca un solo sí para todas; criterio nuevo
  09-deductions-separable. `nzt/references/questions.md` → *Options*: las opciones se
  escriben así ya en la línea `proposed` del registro, no solo al preguntar. Corrido:
  `part-capabilities` pregunta las seis deducciones como opciones de elección múltiple;
  `use-only-still-asks` anota la organización del código con lo que significa cada
  opción para la persona ("para cambiar o sacar algo se toca un solo lugar").

**Abierto:** `tools/restart-needed` no discrimina en corridas cortas (las dos versiones
avisan y preguntan); la falla real pasó en una sesión larga, así que se corrobora en la
próxima prueba en la app. El mensaje antes de preguntar también se corrobora ahí: en los
casos siempre pasa, en la app falló dos veces. Visor de la iteración 1 en el scratchpad
(`ws5/iteration-1/review.html`), fuera del repo. Sin commit.

## Sexta prueba real (2026-11-10)

Sesión en la app (`nzt-proyecto`, "Continuemos"), que retoma la quinta: Claude leyó el
registro entero con un script (registro `cb9919b8…`, 974 líneas extraídas) y la carpeta. La
parte anterior (definición y cómo) no tiene registro guardado: no se pudo revisar.

### Lo que se vio

- **Bien:** retomó desde `Plan/state.md` sin preguntar nada ya respondido; primero probó el
  MCP de Microsoft Learn (ya andaba tras reiniciar) y lo anotó en *Checked*; lo usó para
  resolver un error real (la cultura es-AR en Blazor); probó cada `AC-NN` por su id, en
  pantalla y en la API; reconoció un error propio (escribió 198 caracteres en vez de 201) y
  repitió; simuló la fecha solo en la página, sin tocar el reloj, y lo dijo; no dio el paso
  por hecho sin medir la velocidad (`partial`, con el porqué); frenó cuando la persona dijo
  "dejalo acá" y dejó el estado y el próximo paso al día; no hizo commit porque lo acordado
  era al terminar el paso.
- **"Lo que decidí yo" con el modo Juntos:** el registro del cómo dice `Mode: together`,
  pero decidió solo que la fecha se pueda escribir (cambia lo que la persona ve) y cargar
  todos los datos de idioma (hace más pesada la primera carga, que toca el "menos de 3 s"
  acordado en H-21). Las dos se debían preguntar. Causa: la sección de `messages.md` decía
  "lo que la persona dejó al agente" sin atarlo al modo, y el criterio de qué se hace, qué
  se decide y qué se pregunta estaba repartido entre `do`, `questions.md` y `decisions.md`.
- **Líneas sueltas en inglés** entre acciones ("The shell rejected…", "Now index.html…",
  "The browser pane closed…"). `messages.md` pedía el idioma de la persona en todo, pero no
  nombraba esas líneas.
- **Datos de prueba en los datos de la persona:** cargó 1.000 tareas de prueba en la base
  real para medir y lo dijo recién al final. Sin decidir (ver abajo).
- **Menor:** al retomar, el mensaje fue de una línea ("Retomo: …"); alcanza, porque
  `state.md` pide reportar en una línea lo que estaba en curso.

### Auditoría con `gestionar-skills` y `skill-creator` (2026-11-10)

Pedido del usuario: todas las skills y references, sin redundancias, genéricas, en pasos
simples, quizás más cortas, **sin perder ningún comportamiento**. Versión anterior copiada
en el scratchpad (`ws6/skill-snapshot`).

Hallazgos y lo hecho (regla de `gestionar-skills` entre paréntesis):

- **H1 (9, consistente) — tres tamaños de ronda:** `interview.md` "de tres a cinco",
  `decisions.md` "a lo sumo cuatro", `messages.md` "lo que acepte la herramienta". Queda uno
  solo, en `messages.md` → *Asking*: **hasta cuatro** (menos si la herramienta acepta menos),
  la que más destraba primero, el resto en la ronda siguiente y dicho, nunca una por turno.
  Se eligió cuatro porque era el de `approach` y lo exige `app-structure/08`. `define` paso
  5 e `interview.md` regla 2 dicen solo "en rondas".
- **H2 (2) — qué se hace, qué se decide y qué se pregunta**, repetido en `do` paso 2,
  `questions.md` regla 2 y `decisions.md`: queda en `questions.md` regla 2 como lista (ya
  está escrito → leerlo; comprobable → investigarlo; no cambia nada para la persona → se
  hace; detalle con *I propose* → se decide y se dice; todo lo demás, incluido lo que
  cambia lo que ve, usa o paga → se pregunta). `do` paso 2 la cita.
- **H3 (2):** "una adivinanza no es respuesta" estaba en las reglas 3, 4 y 7 de
  `questions.md`; queda en la 3.
- **H4 (2):** `definition-file.md` regla 4 repetía la 6 (un número no dado se pregunta);
  queda en la 6.
- **H5 (2):** la intro de `define` repetía la regla 1 de `nzt`; queda solo lo propio (el
  modo de `approach` no aplica acá).
- **H6 (2):** `decisions.md` repetía "a quien no sabe se le pregunta más simple" (regla 1 de
  `nzt`); fuera.
- **H7 (2):** `state.md` repetía la tabla de ruteo de `nzt`; ahora la cita. **H8 (2):** la
  intro de `nzt` también la repetía; acortada.
- **H9 (3, pasos simples) — pasos con "y además", partidos:** `nzt` 10 (decir cómo va / pedir
  las aprobaciones con las primeras preguntas → 10 y 11, el ruteo pasa a 12), `define` 7
  (devolución en tres grupos / confirmar cada deducción → 7 y 8, el resto corre uno),
  `approach` 7 (decir lo que no aplica / preguntar en rondas → 7 y 8), `tools` 7 (comprobar /
  si pide reinicio → 7 y 8). `nzt` paso 8 en dos viñetas.
- **H10 (formato):** sangría del paso 10 de `do`; una línea en blanco en medio de la lista
  de `slicing.md`.
- **Por la sexta prueba:** `messages.md` → *What I decided* existe solo con el modo **I
  propose**; en otro modo no hay nada que poner, porque esos detalles se preguntaron.
  *Words*: el idioma de la persona vale también para las líneas cortas entre acciones.
- **Sin cambios:** `learn`, `retro`, `plan/SKILL.md`, `documents`, `folder`, `glossary`,
  `packages`, `sizing` y las plantillas: sin hallazgos que valga tocar. Los ejemplos con
  tecnologías reales siguen (decisión del 2026-11-10). Regla 5 (una referencia no manda a
  leer otra): se cuidó en `messages.md`.
- **Largo:** casi igual (9.150 → 9.092 palabras en los 12 archivos tocados). Lo que se ganó
  es una sola fuente por regla y pasos de una acción; achicar más cortaba reglas que los
  casos usan.

### Prueba (2026-11-10, sexta)

Doce casos de lo tocado, solo la versión nueva (`ws6/iteration-1` en el scratchpad),
consigna en el prompt de cada corrida; la anterior se corrió solo donde la nueva falló.
**Nueva: 81 de 82 criterios.**

| Caso | Nueva | Qué se vio |
|---|---|---|
| `nzt/new-app-interview` | 7/7 | Mensaje antes de preguntar; cuatro preguntas por la herramienta, una decisión cada una |
| `nzt/resume-from-state` | 7/7 | Faltan archivos que el estado nombra: lo dice y pregunta sin tocar el estado |
| `nzt/direct-software-bug` | 5/6 | Pregunta qué hacer con el email en mayúsculas (04, deducible). La anterior hace la misma pregunta: no es regresión |
| `define/part-capabilities` | 9/9 | Tres grupos; las cinco deducciones en una pregunta de elección múltiple; casos malos citan su `Q-NN` abierta |
| `define/course-definition` | 6/6 | Comprobó que marzo de 2027 tiene 4 sábados y lo preguntó; nada *proposed* |
| `define/remove-reminders` | 7/7 | Un `change.md` en `General/`, chequeo de ausencia en la definición general |
| `approach/app-structure` | 11/11 | Modo, choque del recordatorio, ronda de cuatro, el resto anotado y anunciado |
| `approach/use-only-still-asks` | 6/6 | (antes 5/6) organización del código con lo que significa para la persona |
| `approach/party-how` | 8/8 | Forma dicha desde la definición, reparto del presupuesto preguntado |
| `do/person-books-movers` | 6/6 | Borrador con huecos, evidencia escrita, unidad en curso |
| `tools/restart-needed` | 5/5 | Instala en la carpeta, dice que no responde acá, pregunta cómo seguir |
| `plan/plan-by-capability` | 4/4 | Una unidad por capacidad, cita `AC-NN` |

**Ajuste (pedido del usuario, iteración 2):** el criterio que fallaba (`direct-software-bug`
04) lo causaba "jamás asumir" llevado a lo que el pedido ya responde. `do` paso 2: lo que
el pedido ya responde no está indefinido (una falla a arreglar se comporta como el caso
que anda); va al criterio de hecho del paso 3, que la persona puede corregir, y no se
pregunta. Va solo en `do`, para que `define` siga confirmando sus deducciones. Corrido
(`ws6/iteration-2`): `direct-software-bug` **6/6** (escribe el criterio sin preguntar; solo
pregunta dónde está el código), `person-books-movers` 6/6 y `fix-spelling-direct` 6/6. Total
de la sexta: **82/82**. Visto sin criterio: `fix-spelling-direct` cierra con una oferta
opcional por texto ("¿le echo un ojo a la puntuación?"); se deja.

**Sin decidir (para el usuario):** datos de prueba en los datos reales de la persona (la
sexta prueba cargó 1.000 tareas en su base). Propuesta: en `verify.md`, probar sobre una
copia o datos aparte y, si no se puede, preguntar antes de tocar lo de la persona; lo que
quede se dice en el momento (regla 2 de `nzt`). Sin commit.

## Séptima prueba real (2026-11-10)

Sesión en la app (`nzt-proyecto`, "continua", registro `0c83bcb6…`, extraído con un script):
construye la unidad 1 (agregar y ver la lista). La sesión anterior, con la definición y el
cómo (`81c67753…`), **se borró**: solo quedan sus archivos (`Docs/How/how.md`,
`Docs/How/questions.md`, `Plan/state.md`). Lo que pasó en las rondas (tamaño, mensaje antes de
preguntar) no se puede revisar. Para la próxima: no borrar la sesión hasta revisarla.

### Lo que contó el usuario

- **Bien:** con *Clean architecture* elegida y .NET, preguntó si las capas iban en carpetas o
  en proyectos separados (H-11, "Proyectos separados"). El usuario quiere saber si lo pregunta
  siempre.
- **Mal:** puso las carpetas de las piezas en la raíz; no separó la API y la pantalla en una
  carpeta cada una.

### Lo que se vio, contra el pendiente 0

- **Bien:** retomó desde `Plan/state.md`; probó primero el MCP de documentación y anotó
  *Checked*; buscó las versiones de los paquetes en vez de suponerlas; probó cada `AC-NN` por
  su id, en pantalla y contra la API; dijo lo que no pudo comprobar (la mitad de AC-03); dejó
  el veredicto en `partial` porque falta que la persona pruebe; se recuperó de un comando que
  falló y de no tener Python; el mensaje final en español, con las secciones bien.
- **"Lo que decidí yo" en modo Juntos, otra vez** (`Mode: together` en el registro del cómo):
  decidió que la fecha se pueda escribir a mano (el mismo detalle que en la sexta), lo puso en
  *Qué decidí* y en *Decisions* de `state.md` como "detalle de pantalla". Cambia lo que la
  persona ve y usa: era una pregunta. La regla de la sexta (`messages.md` y `questions.md`
  regla 2) no alcanzó: la decisión aparece **mientras construye**, en `do`, y ahí no se mira.
- **Patrones decididos solos y sin decirlos:** el código tiene un repositorio
  (`ITaskRepository`), un reloj inyectado (`IClock`), un solo servicio con todas las
  operaciones (`TaskService`) y errores esperados como excepciones
  (`TaskValidationException` → 400). Nada de eso está en `how.md` ni en `questions.md`, ni se
  dijo. Son decisiones de cómo se organiza cada pieza por dentro (Structure), que en modo
  Juntos se preguntan. `approach` preguntó la arquitectura y "cómo se llega a la base" (EF
  Core), pero no los patrones: la fila de Structure de `decisions.md` dice "the patterns it
  follows" sin decir cuáles hay que mirar. Y `do` paso 2 ("falta una elección de cómo →
  `approach`") no se disparó, porque nada le pide revisar qué patrones va a introducir.
- **Líneas entre acciones en inglés, otra vez:** unas doce ("The documentation server is
  responding…", "Nothing got written…", "It builds with no errors…", "AC-04 of the list
  holds…"), y también el resumen y la pregunta con botones del cierre ("The app's first unit is
  built…", "Did you try the app — does it work?", "Works, keep going"). La regla está en
  `messages.md` → *Words*; no alcanzó.
- **Datos de prueba en la base real, otra vez:** quedaron cinco tareas de prueba en
  `tasks.db` y marcó una como hecha tocando la base directo. Lo dijo en el informe final, pero
  no ofreció limpiarlas. La base es nueva, así que el daño es chico, pero la persona va a
  empezar a usarla con eso adentro. Sigue sin decidir (propuesta de la sexta).
- **Carpetas en la raíz (punto del usuario):** H-16 se preguntó ("¿Dónde van las carpetas…?",
  respuesta "En la raíz") y el porqué escrito es "Coincide con la configuración existente": la
  configuración de arranque que el propio agente había creado. No se ven las opciones que dio
  (sesión borrada). Con dos piezas decididas (H-04: TaskList.Api y TaskList.Web), lo esperable
  era recomendar una carpeta por pieza, con sus proyectos adentro; la recomendación salió de
  un archivo propio y no de la forma acordada.
- **Carpetas o proyectos (pregunta del usuario): no está garantizado.** H-11 salió del saber
  del agente sobre .NET; ninguna skill ni caso lo pide. `nzt-software` sí lo tiene
  (`backend/architecture-clean.md`: "separated by the strongest boundary the technology
  offers. `tech.md` records the mechanism").
- **Rondas de hasta cuatro, mensaje antes de preguntar:** no se puede ver (sesión borrada).
  `questions.md` tiene H-01 a H-17 con el modo primero, coherente con lo pedido.
- **Lo que el pedido ya responde va al criterio:** no aplica (trabajo planeado).

### Propuestas (sin decidir, para el usuario)

- **S1 · Elecciones que aparecen al construir:** en `do`, antes de hacer algo que la persona
  ve o usa y que no está en la definición ni en `how.md`, aplicar `questions.md` regla 2; en
  modo Juntos es una pregunta, y se sigue con lo que no depende de ella (ya lo dice `do` paso
  2, última viñeta). Caso nuevo: construir con modo Juntos y un detalle de pantalla abierto.
- **S2 · Patrones dentro de cada pieza:** en `decisions.md`, la fila de Structure para "algo
  que corre" nombra los ejes que se preguntan siempre: cómo se separan las capas o módulos y
  **con qué fuerza** (lo hace cumplir la herramienta, como proyectos o paquetes separados, o es
  una convención de carpetas), cómo se organizan las operaciones (un servicio o una clase por
  operación), cómo viaja un error esperado (excepción o resultado), y si los datos se alcanzan
  detrás de una interfaz (repositorio) o directo. Genérico, sin tecnología. Y en `do` paso 2:
  un patrón que el código va a introducir y no está en `how.md` es "una elección de cómo que
  falta" → `approach`. Criterio nuevo en `approach/app-structure`.
- **S3 · Idioma:** subir "todo lo que la persona puede leer va en su idioma, también las
  líneas entre acciones, los resúmenes y los botones que muestre el host" a las reglas de
  `nzt` (siempre en contexto), no solo en `messages.md`.
- **S4 · Carpetas de las piezas:** en `decisions.md` → *Settling each topic*, con la forma
  decidida, cada pieza tiene su carpeta y adentro su división; la opción recomendada nunca se
  justifica con un archivo que creó el agente.
- **S5 · Datos de prueba:** decidir la propuesta de la sexta (probar en una copia o datos
  aparte; si no se puede, preguntar antes; lo que quede se dice en el momento y se ofrece
  limpiarlo).

### Lo que va a `nzt-software`

El usuario planteó dejar en `nzt-software` solo las reglas genéricas de código, sin las de
.NET, C# y Blazor, conservando las preguntas de patrones (repositorio o directo, etc.). Es
trabajo de `nzt-software`: análisis y plan guardados en `Plan/specs/reglas-genericas.md`, con
su entrada en `Plan/specs/pendientes.md` (punto 4). Esta prueba sirve de evidencia: sin
ninguna regla, el código salió con constructores primarios, `var`, excepciones para errores
esperados y un servicio único, todo contra las reglas del usuario en `nzt-software`.

### Decidido con el usuario (2026-11-10)

- **Nunca decidir solo en modo Juntos ni en Vos me decís**, "sí o sí", como en
  `nzt-software`. Se miró cómo lo logra `nzt-software`: es un **mundo cerrado**. No se
  hace trabajo que la spec no pida (`build/SKILL.md`: "No work no spec asks for"); un
  mecanismo que `tech.md` no registra es un hueco que se pregunta y se escribe
  (`build/SKILL.md`); una dependencia no listada se confirma antes y se sigue con el resto
  (`implement.md` paso 3); un valor que falta se pregunta, nunca se elige (`software/SKILL.md`
  paso 1). Reemplaza a S1.
- **S2, corregida por el usuario:** los ejes de S2 (proyectos o carpetas, servicio o clase por
  operación, excepción o resultado, repositorio o directo) son de desarrollo, no del método
  genérico (no sirven para un libro). La lista concreta va al paquete de software
  (`nzt-software` → `choosing.md`, ver `Plan/specs/reglas-genericas.md`). En el método queda
  solo lo genérico, que ya cubre el mundo cerrado: **un patrón o estructura que el resultado
  repite es una elección**, y en Juntos se pregunta. `decisions.md` no se toca.
- S3, S4 y S5 siguen sin decidir.

### Aplicado (2026-11-10, mundo cerrado)

La causa: `questions.md` regla 2 tenía la rama "no cambia nada para la persona → se hace", y
el agente metía ahí lo que veía como chico o interno (la fecha escribible, "detalle de
pantalla"; los patrones de código). Cambios, con `gestionar-skills` (versión anterior en el
scratchpad, `ws7/skill-snapshot`):

- **`nzt` regla 1:** solo se hace lo acordado; lo que el resultado tendría de más (un
  comportamiento, un agregado, un patrón, una librería) es una elección, y "chico",
  "interno" o "un detalle" nunca es razón para hacerlo solo.
- **`questions.md` regla 2:** la rama de "se hace" queda solo para lo que lo acordado deja
  **una sola manera** (un nombre por las convenciones acordadas, un puerto libre, un archivo
  en la carpeta acordada de su tipo); **más de una manera razonable** es una elección: con
  *I propose* se decide y se dice, en cualquier otro modo se pregunta, por chica o interna que
  sea (lo que la persona ve, usa o paga, un patrón o estructura que se repite, una librería,
  algo más allá de lo pedido).
- **`do` paso 2:** lo que el resultado va a tener y los archivos de la unidad no dicen pasa
  por la regla 2 **antes de hacerlo**.

### Prueba (2026-11-10, séptima)

Consigna en el prompt de cada corrida; nueva contra la anterior.

| Caso | Nueva | Anterior | Qué se vio |
|---|---|---|---|
| `do/together-screen-details` (nuevo) | 6/6 | 6/6 | Las dos preguntan cómo se pone la fecha, el orden, los textos; la nueva arma la página con huecos `[pendiente]`, la anterior deja la página sin hacer |
| `do/together-code-patterns` (nuevo) | 5/5 | 5/5 | Las dos preguntan la organización del código, la sintaxis de los comandos y los centavos antes de escribir |
| `do/i-propose-screen-details` (nuevo, control) | 4/4 | 4/4 | Con *I propose* deciden los detalles y los dicen en *Qué decidí*; no pregunta de más |
| `do/together-fix-mid-build` (nuevo, 2 corridas por versión) | **6/6 y 6/6** | **3/6 y 3/6** | Unidad a medio hacer, AC-03 falla. Las dos arreglan lo mínimo, pero "solo espacios" (que AC-03 no dice): la nueva lo **pregunta** las dos veces; la anterior **lo decide sola** (`trim()`) las dos veces y lo dice después ("lo tomé como vacío… si preferís otra cosa, decime") |
| `nzt/direct-software-bug` (regresión) | 6/6 | — | Escribe el criterio sin preguntar; solo pregunta dónde está el código |
| `do/fix-spelling-direct` (regresión) | 6/6 | — | Corrige cuatro palabras, sin preguntas |
| `do/person-books-movers` (regresión) | 6/6 | — | Borrador con huecos, pide la confirmación escrita |

Los tres primeros no separan las versiones: con la skill recién leída y nada a medio hacer,
las dos preguntan. La falla real aparece **en medio de construir**, al arreglar algo, que es
lo que reproduce `together-fix-mid-build`: ahí la nueva gana 12/12 contra 6/12. Sin commit.
