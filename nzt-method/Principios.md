# Principios del método genérico (en debate)

Borrador del 2026-11-08 para debatir con el usuario. **Nada de esto está decidido:** cada
principio es *propuesta de Claude* hasta que figure en **Decididos**. Sale de lo pedido en
`Idea.md`, de las conclusiones de `Investigacion.md` y de la forma de trabajo de
`../nzt-software/README.md`, tomada como referencia.

## Propuestos

1. **El núcleo no nombra ningún dominio.** No trae fases, roles ni tipos de documento fijos
   (nada de PRD, épica, capítulo o lección). Habla de *trabajo*, *pieza*, *decisión*,
   *verificación*. El vocabulario y las prácticas de un dominio llegan de afuera: de la
   persona, de un paquete de dominio o de lo que el agente proponga para ese trabajo.

2. **El proceso se dimensiona al trabajo, y se puede cambiar en cualquier momento.** Antes de
   empezar se acuerda cuánto proceso lleva, a partir de cuánto vale el trabajo para la
   persona (el *apetito* de Shape Up), no de cuánto se estima que tarda. Tres tamaños de
   referencia: **al paso** (se hace y se reporta, sin plan ni estado), **con plan corto**
   (un plan que se aprueba una vez) y **por partes** (el trabajo se corta en piezas). La
   persona puede subir o bajar el tamaño en cualquier momento.

3. **Cada pieza recorre el mismo loop, tan corto como haga falta:** entender → proponer →
   hacer → verificar → registrar. En una tarea al paso cada paso puede ser una línea; en una
   grande, un documento. Ningún paso es un trámite.

4. **Lo que no está definido es una pregunta, no una suposición.** Si el agente supone algo
   para avanzar, lo dice.

5. **Cada pieza termina en una parada con veredicto.** Hecho, parcial o no logrado, con qué
   se comprobó y qué quedó sin comprobar. Para avanzar más rápido la persona puede dar un
   lote cerrado de piezas, y el agente igual para al terminarlo.

6. **"Hecho" se define al principio, en los términos del trabajo.** Como el núcleo no sabe
   qué es un test, cada trabajo acuerda su criterio de terminado (un texto que revisa un
   lector, una mudanza con todo en su lugar, un programa con sus pruebas). Verificar es
   comprobar contra ese criterio, no opinar.

7. **El contexto vive en archivos legibles por una persona,** no en la memoria del agente. Lo
   mínimo es un archivo con qué es el trabajo, qué se decidió, dónde se está y cuál es el
   próximo paso. Crece solo si el trabajo lo pide. Una sesión nueva retoma leyéndolo, sin
   que nadie explique nada otra vez.

8. **No duplica lo que el agente ya trae.** Si el host tiene modo plan, lista de tareas o
   memoria, el método los usa en vez de inventar los suyos (idea tomada de Agent OS).

9. **Las herramientas se proponen, no se imponen.** El agente nota qué le faltaría al
   trabajo para hacerse de manera excelente y pregunta si quiere que investigue. Con un sí,
   busca en fuentes oficiales y presenta qué encontró, de dónde, qué accede, qué cuesta y qué
   hay que hacer a mano. Instala solo con otro sí, en el proyecto y no en todo el equipo,
   comprueba que responde y lo registra. Lo que la persona rechaza no se vuelve a ofrecer.

10. **El agente recomienda el próximo paso, la persona decide.** Al final de cada parada dice
    qué haría después y por qué, sin seguir solo (idea tomada de BMAD).

11. **Reporta lo que pasó de verdad.** Lo que falló, lo que se saltó y lo que supuso, igual
    de visible que lo que salió bien.

## Preguntas para el debate

- **P1. Tamaños:** ¿tres tamaños de referencia, o que el agente lo proponga libre en cada
  trabajo?
- **P2. El archivo de estado:** ¿uno solo por trabajo (por ejemplo `TRABAJO.md`) con todo lo
  mínimo, o una carpeta con un archivo por tipo de cosa (decisiones, estado, herramientas)?
- **P3. Cuándo pregunta por herramientas:** ¿al empezar un trabajo, cuando aparece un hueco
  en el medio, o en los dos momentos?
- **P4. El criterio de hecho:** ¿siempre se acuerda al principio, o solo en los trabajos con
  plan?
- **P5. Paquetes de dominio:** ¿el núcleo ya prevé cómo se enchufa un paquete (software,
  escritura, cursos), o eso queda para después de tener el núcleo?

## Decididos

- **P2 (2026-11-08): un solo archivo de estado por trabajo.** Ahí va todo lo mínimo del
  principio 7. Falta decidir el nombre y qué secciones tiene.
- **P3 (2026-11-08): al empezar, el agente evalúa si le falta algo para hacer el trabajo de
  manera excelente, y solo si le falta propone qué herramientas necesitaría.** Si no le
  falta nada, no pregunta. Queda abierto si hace lo mismo cuando la falta aparece en medio
  del trabajo.

- **P1 (2026-11-08): tres tamaños de referencia** (al paso, con plan corto, por partes). El
  agente tiene que categorizar bien cada pedido, dice qué tamaño eligió y la persona lo
  puede cambiar.
- **P4 (2026-11-08): el criterio de hecho se acuerda siempre, en proporción al tamaño.** Al
  paso es una línea que el agente propone en su respuesta ("lo doy por hecho cuando…") y la
  persona corrige si quiere; con plan es una lista que se aprueba junto con el plan.
- **P5 (2026-11-08): los paquetes de dominio se diseñan ya**, junto con el núcleo, porque
  el método va a funcionar así. El diseño está en debate en `Paquetes.md`. Sigue valiendo
  que el núcleo funciona solo, sin ningún paquete.
