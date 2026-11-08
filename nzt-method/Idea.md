# Idea: un método de trabajo genérico

Anotado el 2026-11-08, en la rama `metodo-generico`. Es una exploración: puede terminar
descartada. Lo que sigue es lo que pidió el usuario. Lo marcado como *propuesta de Claude* no
está decidido.

## Qué se quiere

Un **método de trabajo genérico**, **no atado a nada**: ni a software ni a ningún dominio,
herramienta o tipo de producto. Tiene que servir para trabajar en **cualquier cosa**
(software, un juego, un documento, un curso, una investigación, una mudanza) y lograr tres
cosas:

1. **Mantener el contexto.** El trabajo se puede retomar en otra sesión sin explicarlo otra
   vez.
2. **Trabajo ágil.** Nada es obligatorio. El método permite ajustar en cada momento qué se
   hace y cuánto proceso lleva: no es una cascada de fases que hay que recorrer enteras.
3. **Trabajo de calidad.** Lo hecho se puede revisar, se verifica y se reporta lo que pasó de
   verdad.

Y tiene que **poder apoyarse en plugins, MCPs o ambos**, y en las herramientas que tenga el
agente, **cuando el trabajo las necesite** o el agente lo considere útil. No como requisito.

**Cómo se apoya en herramientas** (aclarado por el usuario el 2026-11-08): el agente **no
instala ni usa un plugin o MCP de una**. Se fija qué necesitaría el trabajo para hacerse de
manera excelente y **se lo consulta a la persona**, por ejemplo preguntándole si quiere que
investigue si hace falta algún plugin, MCP o ambos para lo que pidió. La forma exacta (cuándo
preguntar, cuánto investigar, qué mostrar, dónde se registra) **está por debatir**.

## De dónde viene

- **`nzt-software`** (`../nzt-software/README.md`) define su forma de trabajo al principio
  del README: las fases DISCOVERY → ARCHITECTURE → DESIGN → BUILD → VERIFY → SHIP, y en cada
  unidad el loop Entender → Proponer → Ejecutar → Verificar → Registrar, con el estado en
  `Plan/state.json`. **La idea es tomar esa forma, pero genérica:** las fases y sus nombres
  son de software; lo que se quiere es lo que queda debajo de ellas, y que ninguna sea
  obligatoria.
- **BMAD-Method** y métodos parecidos: según el usuario, ninguno es genérico. Antes de
  diseñar hay que comprobarlo en sus fuentes oficiales y ver qué toman de bueno y dónde se
  atan a un dominio.
- **Lo que ya se decidió en `nzt-software` y probablemente sirva** (*propuesta de Claude*):
  la regla de herramientas de D96 (*Agent tools*: cualquier MCP o plugin en cualquier fase,
  registrado por para qué sirve), las paradas al final de cada unidad, el estado persistido,
  y decir qué se comprobó en vez de qué se cree.

## Reglas para este trabajo

- **Todo va dentro de `nzt-method/`**: specs, ideas, decisiones, borradores. Fuera de esta
  carpeta no se toca nada.
- **Se trabaja sin NZT**, solo con Claude: sin `Plan/state.json`, sin unidades ni routers de
  NZT. El usuario lo desactiva para estas sesiones.
- **Vive en el monorepo `nzt-ai`** y se despliega por su cuenta: su pipeline corre solo si se
  tocó su carpeta, como pasa hoy con `nzt-software`.
- **No se mergea** a `pendientes-post-v5` ni a `main` mientras sea exploración.
- **`nzt-software` se puede mirar como referencia, pero no se modifica.**
- **Al escribir las skills del método** se usan las skills `gestionar-skills` y
  `skill-creator` (pedido del usuario, 2026-11-08).

## Preguntas abiertas

- **El nombre:** `nzt-method` es provisorio. *Propuesta de Claude:* no usar solo `nzt`,
  porque es la marca y el monorepo entero.
- **La relación con `nzt-software`:** lo reemplaza, `nzt-software` se apoya en él, o
  conviven. Se decide **después** de tener el método genérico; la idea del usuario es que
  los dominios (software y otros) lleguen como paquetes.
- **Qué es lo mínimo** que tiene que tener el método para mantener el contexto sin volverse
  burocracia en un trabajo chico.
- **Cómo se adapta a un dominio** sin nombrarlo: quién aporta el vocabulario y las
  prácticas de cada tipo de trabajo (el usuario, un plugin, un MCP, el propio agente).
- **En qué hosts corre:** Claude Code y Codex como `nzt-software`, o también otros.
- **Cómo propone herramientas:** en qué momento pregunta (al empezar un trabajo, cuando
  aparece un hueco, o ambos), qué muestra al proponer, qué pasa con lo que la persona
  rechaza, y dónde queda registrado lo instalado.

## Cómo retomar

Si se limpia el contexto, una sesión nueva retoma así:

1. Leer este archivo y `README.md` de esta carpeta. Lo de esta carpeta es la única fuente:
   no hay `Plan/state.json` ni NZT activo. Según el estado, seguir con `Principios.md`
   (principios y sus decisiones), `Paquetes.md` (paquetes de dominio), `Archivos.md`
   (archivos de estado y de herramientas), `Documentos.md` (default de documentos) e
   `Investigacion.md` (métodos parecidos revisados).
2. Mirar **Estado actual** (abajo) y los últimos commits de la rama `metodo-generico`.
3. Seguir desde el próximo paso, sin decidir nada que figure como abierto sin consultarlo.

## Estado actual

- **2026-11-08:** leídos `Idea.md`, `README.md` y el principio de
  `../nzt-software/README.md`. Sumada la aclaración sobre cómo se proponen las herramientas.
  Claude propuso el primer paso y el usuario aprobó empezar por investigar.
- **2026-11-08:** hecha la investigación de BMAD-Method, Spec Kit, Agent OS y Shape Up en
  `Investigacion.md`: se confirma que ninguno es genérico, y al final hay ideas para tomar.
- **2026-11-08, decisión del usuario:** el método genérico se hace **aparte y primero**.
  `nzt-software` **no se modifica**, pero **se puede mirar como referencia**, igual que los
  métodos de `Investigacion.md`; no es una base a desmontar. Después se verá si se integra
  con paquetes por dominio (software y otros).
  **Próximo paso:** debatir con el usuario los principios del método genérico, partiendo de
  las conclusiones de `Investigacion.md`, antes de escribir su estructura.
- **2026-11-08:** empezó el debate. Borrador en `Principios.md`: 11 principios propuestos y
  5 preguntas (P1–P5). **Próximo paso:** recoger las respuestas del usuario y pasar lo
  aceptado a **Decididos** en ese archivo.
- **2026-11-08:** decididas P2 (un solo archivo de estado) y P3 (proponer herramientas solo
  si falta algo). P1, P4 y P5 siguen **En charla** en `Principios.md`. Los 11 principios
  todavía no fueron revisados uno por uno.
- **2026-11-08:** decididas P1 (tres tamaños), P4 (criterio de hecho siempre, en proporción)
  y P5 (diseñar los paquetes ya). Borrador de paquetes en `Paquetes.md` con 4 preguntas
  (PQ1–PQ4). **Próximo paso:** las respuestas del usuario a PQ1–PQ4; después revisar los 11
  principios uno por uno.
- **2026-11-08:** decididas PQ1, PQ2 (paquetes en el archivo de herramientas del agente, no
  en el estado) y PQ4 (se arman con el agente, ayudados por una retro). En charla en
  `Paquetes.md`: PQ3 y si los documentos tienen forma genérica o dependen de paquetes.
- **2026-11-08:** decididas PQ3 (cada paquete es un plugin aparte) y que el núcleo trae un
  default genérico para escribir cualquier documento. Quedan abiertos: el nombre y el lugar
  del archivo de estado y del de herramientas, y qué dice el default de documentos.
  **Próximo paso:** revisar con el usuario los 11 principios de `Principios.md` uno por uno.
- **2026-11-08:** commit `c6fc8ea`. Claude probó los 11 principios contra ocho trabajos
  distintos y anotó en `Principios.md` → *Revisión* lo que pasa sin cambios, 5 huecos
  (R1–R5) y 4 principios que podrían faltar (R6–R9). **Próximo paso:** que el usuario
  decida R1–R9; después reescribir los principios con lo decidido.
- **2026-11-08:** el usuario aceptó R1–R9. `Principios.md` quedó reescrito con **14
  principios aceptados**, lo abierto y el historial de decisiones. **Próximo paso:** definir
  lo abierto (nombre y lugar del archivo de estado y del de herramientas, y el default
  genérico de documentos) y después la estructura del método (qué skills y archivos tiene),
  usando `gestionar-skills` y `skill-creator` al escribir las skills.
- **2026-11-08:** borradores de lo abierto: `Archivos.md` (dónde van y qué tienen
  `estado.md` y `herramientas.md`, preguntas A1–A3), `Documentos.md` (el default genérico,
  preguntas D1–D2) y, en `Principios.md` → *Abierto*, la propuesta de herramientas en medio
  del trabajo. **Próximo paso:** las respuestas del usuario; después, la estructura del
  método.
- **2026-11-08:** decididos A1 (archivos y skills del método en inglés), A2, A3 (sin carpeta
  del método) y D2 (Markdown). Pendientes: dónde van los archivos sin carpeta del método
  (`Archivos.md`), qué regla falta o sobra en D1 (`Documentos.md`) y la propuesta de
  herramientas en medio del trabajo (`Principios.md` → *Abierto*).
- **2026-11-08:** decididos el lugar de los archivos (`Plan/state.md` y
  `Docs/agent-tools.md`), D1 (sin cambios) y las herramientas antes y durante el trabajo
  (principio 10). **No queda nada abierto en principios, paquetes, archivos ni documentos.**
  **Próximo paso:** proponer la estructura del método (qué skills y archivos tiene, en
  inglés), usando `gestionar-skills` y `skill-creator` al escribir las skills.

## Primer paso sugerido

*Propuesta de Claude:* antes de escribir el método, investigar BMAD-Method y dos o tres
métodos más en sus fuentes. Después, separar en `nzt-software` lo que es genérico de lo que
es de software, y escribir en esta carpeta los principios del método antes que su
estructura.
