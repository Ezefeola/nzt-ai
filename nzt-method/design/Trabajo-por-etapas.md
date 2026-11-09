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

Hallazgos con `gestionar-skills` en las skills no tocadas, **sin aplicar** (a decidir):

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
