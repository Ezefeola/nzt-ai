# Enseñanza: la skill `nzt-learn`

Decidido el 2026-11-08 por el usuario, sobre la propuesta de Claude. Enseñar deja de ser una
referencia de `nzt-do` (`teaching.md`) y pasa a ser una skill aparte, que parte de
`nzt-learn` de `nzt-software` (`../../nzt-software/method/skills/nzt/learn/`). Esa skill no
se modifica en esta rama; sacarla de `nzt-software` queda para cuando se integren.

## De dónde se parte

- **`teaching.md` de `nzt-do`:** un loop de 6 pasos (punto de partida, una idea, ejercicio,
  esperar el intento, corregir, repetir o seguir). Sin currículo, sin registro, sin
  evaluación ni repasos.
- **`nzt-learn` de `nzt-software`:** 8 archivos, unas 530 líneas. Dos loops (enseñar desde
  cero, entrenar lo que ya hace) y referencias para currículo y registro (`plan`), lección
  con andamiaje que se retira (`teach`), práctica deliberada (`train`), corrección con
  pistas de a un escalón (`tutor`), evaluación sin enseñar (`assess`), repasos espaciados
  por objetivo (`retain`) y ejercicios con la solución aparte (`exercises`). Casi todo es
  genérico; lo atado a software son los ejemplos. Guarda el avance en
  `Learn/<tema>/progress.md`, aparte de `Plan/state.json`.

## Decisiones

- **E1 — En el núcleo, no como paquete.** Cualquiera puede querer aprender cualquier cosa:
  no es de un dominio. El núcleo pasa a tener seis skills: `nzt`, `nzt-plan`, `nzt-do`,
  `nzt-learn`, `nzt-tools` y `nzt-retro`.
- **E2 — Un solo archivo de estado.** Se respeta el principio de un archivo de estado por
  trabajo: cada tema que se aprende es un trabajo con su carpeta y su `Plan/state.md`. Sus
  unidades son los **objetivos** del tema, y la tabla suma dos columnas: el veredicto de la
  evaluación y el **próximo repaso**. Lecciones, ejercicios, soluciones y evaluaciones
  quedan en la carpeta del tema. No hay `progress.md` aparte.
- **E3 — Cómo se llega.** `nzt` (paso de quién hace) deriva a `nzt-learn` cuando la persona
  quiere aprender. Si en un plan una unidad la hace la persona aprendiendo, `nzt-do` le pasa
  esa unidad a `nzt-learn`. Al retomar un tema, `nzt` ofrece primero los repasos vencidos.
- **E4 — `teaching.md` se borra.** El paso 4 de `nzt-do` manda a `nzt-learn` cuando la
  persona aprende. El caso de BUSCARV pasa a `nzt-learn/evals/`.
- **E5 — Cómo se adapta.** Se mantiene la estructura de `nzt-learn` (dos loops y sus
  referencias), con:
  - ejemplos de varios dominios (planilla, idioma, cocina, software), no solo software;
  - mensajes con `nzt/references/messages.md`: sin jerga del método ante la persona (ni
    `OA-NN`, ni nombres de pasos del andamiaje, ni "resuelto por el sistema"); en los
    archivos, palabras simples;
  - documentos con `nzt/references/documents.md` y términos en el glosario del trabajo;
  - recortar lo que se repite entre referencias.
- **Pruebas:** casos en al menos tres dominios, con y sin la skill: tema nuevo con
  currículo, pregunta suelta sin archivos, retomar con repasos vencidos, entrenar algo que
  la persona ya hace.

## Cómo quedó al escribirla

Escrita el 2026-11-08 en `plugin/skills/nzt-learn/` (`SKILL.md` de 83 líneas y 7
referencias, unas 490 líneas en total), con `gestionar-skills` y `skill-creator`.

- **Sin `curriculum.md` ni `progress.md`.** Lo que tenían va al `Plan/state.md` del tema:
  propósito y punto de partida en *What it is*; tiempo, profundidad y lo que quedó afuera en
  *Decisions*; los objetivos como unidades, numerados (el número no cambia y no se reusa) con
  columna *Next review*; y una sección *Log* propia de los temas, donde también va lo que antes
  era la tabla de calibración (qué tan seguro estaba y si acertó).
- **Veredictos cerrados:** `achieved`, `not achieved`, `done with help` (antes "solved by the
  system") y `no evidence`. "No medible" deja de ser veredicto: es un hallazgo que reescribe
  el objetivo.
- **Nombres simples:** los pasos del andamiaje son *worked example*, *half done* y *on your
  own* (antes *solved*, *faded*, *alone*); "confianza" pasa a "qué tan seguro está"; las pistas
  son *hints* numeradas.
- **Tres tamaños de enseñanza** (paso 1): una explicación suelta se contesta con una pregunta
  de control; una cosa que se aprende en una sentada es una lección en la conversación, sin
  archivos; un tema que se sostiene en varias sesiones tiene carpeta. En duda, lo liviano.
- **La escalera de repasos y las reglas comunes** (veredictos, caso distinto cada vez, nada se
  niega ni se acredita sin hacerlo) van en `SKILL.md` → *Rules*, porque las usan varias
  referencias; así ninguna referencia manda a leer otra (regla 5 de `gestionar-skills`).
- **Los archivos del tema son de la persona:** lecciones, ejercicios, soluciones y
  evaluaciones van enteros en su idioma, títulos incluidos.
- **Ejemplos de varios dominios:** planilla (plan, evaluación, correcciones), cocina
  (lección), italiano (ejercicio), guitarra (práctica), software (una corrección).
- **Cambios en las otras skills:** `nzt` paso 6 y 11 derivan a `nzt-learn` (y saltean el paso
  9, porque el tema se ubica solo); `nzt/references/state.md` reconoce un tema por su columna
  *Next review* y lo manda a `nzt-learn`; `nzt-do` paso 4 le pasa la unidad a `nzt-learn`;
  `teaching.md` borrada y el caso de BUSCARV movido a `nzt-learn/evals/`.
- **Casos de prueba** (`nzt-learn/evals/`): BUSCARV en una sentada, italiano como tema nuevo,
  retomar cocina con dos repasos vencidos, practicar mails de ventas más cortos y una pregunta
  suelta sobre interés compuesto.

## Prueba (2026-11-08)

Cinco casos, con y sin la skill, con el método de siempre (subagentes en el scratchpad,
fuera del repo).

- **Iteración 1:** con skill 89%, sin skill 85%. Dos problemas de la skill:
  1. **BUSCARV en una sentada:** el "probá primero" de `teach.md` dejó el primer mensaje sin
     nada de enseñanza; la persona ya había dicho qué tenía y qué quería.
  2. **Practicar mails de ventas:** como era un tema nuevo, se fue a planificar (sondeos y
     preguntas) y no practicó nada, con el mail para el día siguiente.
- **Correcciones:** `teach.md`: en una lección en la conversación, el intento previo se
  saltea si la persona ya dijo qué tiene y qué quiere, y el primer mensaje trae la idea con
  su caso y el primer ejercicio; el *worked example* va sobre un caso parecido, nunca sobre
  el material de la persona (sería hacérselo). `SKILL.md` paso 3 y `plan.md`: para algo que
  la persona ya hace, la primera sesión de práctica arranca ya, sobre una parte, y sirve de
  sondeo. `SKILL.md` paso 1: una explicación suelta termina ahí. `plan.md` paso 4: el
  acuerdo incluye dónde va la carpeta. En el caso de cocina se sumaron las lecciones que el
  estado nombraba y se corrigieron las fechas para que sigan la escalera.
- **Iteración 2:** con skill 96% (27/28), sin skill 79%. El único criterio que no pasa es
  el de BUSCARV que pide "un ejercicio sobre sus datos": la skill da primero un ejemplo
  resuelto sobre otra hoja, a propósito. Es el criterio el que choca con el diseño.

## Decididos después de la prueba

- **E6 — Los repasos vencidos van directo** (2026-11-08, el usuario lo dejó a criterio de
  Claude). Al retomar un tema, el primer mensaje ya trae las preguntas de repaso, con cuánto
  llevan y la opción de saltearlas; preguntar antes si repasar solo gastaba un turno.
  Cambiados `nzt-learn/SKILL.md` (pasos 2 y 4) y `references/retain.md` (paso 1), y los
  criterios del caso de cocina.
- **E7 — El criterio de BUSCARV se ajusta al diseño** (2026-11-08, ídem). Pasa a pedir "un
  ejercicio para hacer ya, con lo que tiene que tener una buena respuesta, sin resolver su
  hoja". Se mantiene el ejemplo resuelto sobre otra hoja como primer ejercicio.
- **Prueba de E6 y E7** (iteración 3): cocina con skill 6/6 (cuatro preguntas sobre casos
  nuevos, unos 10 minutos, "decime vamos al arroz" para saltear), sin skill 3/6 (sin
  tamaño, sin opción de saltear y repite las preguntas de las lecciones). BUSCARV,
  recalificado con el criterio nuevo: 6/6 con y sin skill. Con eso, los cinco casos pasan
  todos los criterios con la skill.
