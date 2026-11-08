# Paquetes de dominio (en debate)

Borrador del 2026-11-08, después de que el usuario decidió diseñar los paquetes junto con el
núcleo (P5 en `Principios.md`). Todo es *propuesta de Claude* hasta que figure en
**Decididos**.

## Qué es un paquete

El núcleo sabe trabajar, pero no sabe de ningún tema. Un **paquete de dominio** le suma el
saber de un tema: software, escritura, cursos, juegos, eventos. Ejemplos: un paquete de
software sabe qué es un test y cómo se revisa código; uno de escritura sabe qué es un
borrador y cómo se edita el estilo.

**Referencia:** las reglas de `nzt-software` ya funcionan así para un solo dominio. Solo se
aplican las que declara el documento técnico del proyecto (`tech.md`), cada regla es un
archivo aparte que se lee cuando la tarea lo pide, y si el proyecto tiene sus propias
convenciones, ganan las del proyecto.

## Propuesta

### 1. Qué aporta un paquete

Lo que suma, ordenado por el paso del loop en que se usa:

| Aporta | Para qué paso | Ejemplo en escritura |
|---|---|---|
| **Vocabulario:** cómo se llaman las unidades y los documentos | Todos | capítulo, borrador, versión editada |
| **Preguntas de arranque:** qué hay que saber antes de empezar | Entender | público, tono, extensión, fecha |
| **Cómo se corta el trabajo en unidades** | Proponer | un capítulo por unidad |
| **Prácticas:** cómo se hace bien | Hacer | estructura, voz, ritmo |
| **Criterios de hecho típicos y cómo se comprueban** | Verificar | se lee en voz alta, lo revisa un lector |
| **Herramientas que suelen hacer falta** | Al empezar, solo si falta algo (P3) | un corrector, un MCP de documentos |

Un paquete **no tiene que traer todo**: puede traer solo vocabulario y criterios, por
ejemplo.

### 2. Qué no puede hacer un paquete

- **Saltear el núcleo:** no quita paradas, no quita la verificación, no instala herramientas
  sin el sí de la persona. Solo suma.
- **Ser obligatorio:** sin paquete, el núcleo funciona igual.

### 3. Cómo se activa

- Al empezar, el agente reconoce el dominio y **propone** qué paquete aplicaría. Con el sí
  de la persona, queda **anotado en el archivo de herramientas del agente** (PQ2), igual
  que `tech.md` declara las reglas en `nzt-software`.
- Solo se lee lo que ese archivo declara, y de cada paquete solo la parte que la unidad
  necesita.
- **Puede haber varios a la vez:** un juego puede llevar software, diseño y escritura.

### 4. Quién gana si hay conflicto

1. Lo que dice la persona.
2. Las convenciones del propio trabajo (lo que ya está hecho, el archivo de estado).
3. Los paquetes. Si dos paquetes se contradicen, el agente pregunta.

### 5. Si no hay paquete: el default de cada aporte

**El núcleo trae un default genérico para cada cosa que un paquete puede aportar**, igual
que trae el default de documentos. Así funciona en cualquier trabajo sin ningún paquete; un
paquete solo lo mejora o lo vuelve más consistente en su tema. (Ampliado el 2026-11-08 a
pedido del usuario.)

| Aporte | Default del núcleo, sin paquete |
|---|---|
| **Vocabulario** | Las palabras de la persona. El agente fija las clave en el glosario del trabajo (principio 15) y no inventa jerga |
| **Preguntas de arranque** | Un juego genérico: qué se quiere lograr, para quién, para cuándo, qué existe ya, qué restricciones hay (plata, tiempo, reglas) y cómo se va a saber que salió bien. Solo se pregunta lo que no se puede deducir |
| **Cómo cortar en unidades** | Cada unidad deja algo que se puede verificar solo; es lo bastante chica para una parada; primero va lo que más riesgo o incógnitas tiene, y después lo que depende de otra cosa |
| **Prácticas** | Lo que el agente sabe de ese tema, dicho como propuesta y no como regla: "así se suele hacer, ¿te sirve?". Si no sabe, lo dice y propone investigar |
| **Criterios de hecho** | Se derivan de *cómo se va a saber que salió bien* y se acuerdan (principio 6) |
| **Herramientas** | El principio 10, igual que con paquete |

Cuando el agente trabaja sin paquete, **lo dice una vez al empezar**. Si el mismo tipo de
trabajo se repite, la retro lo señala y se puede armar un paquete con lo aprendido (PQ4).

## Preguntas para el debate

- **PQ1.** ¿La lista de lo que aporta un paquete (sección 1) está bien, o falta o sobra algo?
- **PQ2.** ¿Te parece bien que el paquete quede declarado en el archivo de estado y que solo
  se lea lo declarado?
- **PQ3. Cómo se instala:** ¿cada paquete es un plugin aparte (por ejemplo `nzt-software`,
  `nzt-escritura`) que se instala si lo querés, o todos vienen juntos con el núcleo?
- **PQ4.** ¿El agente puede proponer armar un paquete nuevo cuando un dominio se repite, o
  los paquetes los armás solo vos?

## Decididos

- **PQ1 (2026-11-08):** la lista de lo que aporta un paquete (sección 1) está bien.
- **PQ2 (2026-11-08): los paquetes en uso no van en el archivo de estado, sino en el archivo
  de herramientas del agente**, como `Docs/agent-tools.md` en `nzt-software`: ahí queda qué
  paquetes, plugins y MCPs usa el trabajo y para qué. Corrige la sección 3. Falta decidir el
  nombre y el lugar de ese archivo en el método genérico.
- **PQ4 (2026-11-08): los paquetes se arman entre la persona y el agente.** Para notar qué
  se repite y vale un paquete se puede usar una retro, como la de `nzt-software`
  (`nzt-retro`: revisa la sesión y deja propuestas de mejora sin cambiar nada).

- **PQ3 (2026-11-08): cada paquete es un plugin aparte,** que se instala solo si se quiere,
  para no consumir contexto ni cargar lo que el trabajo no usa. El núcleo es su propio
  plugin y funciona sin ninguno.
- **Documentos (2026-11-08): el núcleo trae un default genérico para escribir cualquier
  documento,** no solo los suyos, porque rara vez un plugin o paquete dice cómo escribir la
  documentación. Quedan así:
  - **Los del método:** el archivo de estado, la propuesta o plan de una unidad (qué, para
    qué, criterio de hecho, unidades) y el reporte de la parada (veredicto, qué se comprobó,
    qué no). Existen siempre que el tamaño los pida, haya paquete o no.
  - **Los entregables del trabajo** (un capítulo, una spec, el temario de un curso): se
    escriben con el **default genérico** del núcleo. Un paquete puede sumarle o reemplazarle
    la forma de un entregable de su dominio; si no lo hace, vale el default.
  - Qué dice ese default (cómo se organiza y se escribe un documento) **está por
    definir.**
