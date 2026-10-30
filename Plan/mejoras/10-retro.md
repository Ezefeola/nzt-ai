# 10 · nzt-retro: decisiones

**Qué se decide**: cómo es `nzt-retro`, una skill opcional que revisa una sesión y deja
propuestas de mejora del entorno en un md para el equipo, sin modificar nada (pedido del usuario
2026-10-29). Base: la skill `retro` de Matt Pocock, analizada en la conversación del 2026-10-29.

## Lo que ya está decidido (usuario, 2026-10-29)

- Skill propia, `nzt-retro` (opción B). Objeción del agente dicha una vez: suma ~200 caracteres
  al listado que todo agente carga (hoy ~2684) y el frontmatter no puede llevar
  `disable-model-invocation` (C1), así que la descripción tiene que limitar el disparo.
- **Opcional**: se ofrece, nunca es obligatoria.
- **No modifica nada**: ni skills, ni references, ni código, ni documentos del proyecto. Su
  único producto es un md con propuestas, pensado para revisarlo en equipo.

## Hechos investigados

- documented: Claude Code guarda cada sesión en `~/.claude/projects/<proyecto>/<id>.jsonl`; el
  formato es interno y cambia entre versiones; se borran a los 30 días por defecto; **un valor
  que una herramienta leyó o imprimió (un `.env`, una credencial) queda escrito ahí**. Fuente:
  https://code.claude.com/docs/en/claude-directory · leído 2026-10-29
- inferred: la sesión actual se lee de la conversación misma; una sesión anterior depende del
  host y de un formato inestable, así que es un extra, no la base.
- inferred: el md no puede copiar fragmentos crudos de la sesión: cita el momento con sus
  palabras, nunca un valor (regla de `nzt-ship`: secretos sólo por nombre de clave).
- unverified: dónde y cómo guarda Codex sus sesiones. Se resolvería leyendo su documentación;
  mientras tanto, en Codex se revisa sólo la sesión actual.

## Lo que se toma de la de Pocock, y lo que no

| De `retro` | En `nzt-retro` |
|---|---|
| Cada propuesta atada a un momento concreto de la sesión; lo genérico se descarta | Igual |
| Error mecánico → chequeo; de criterio → regla escrita | Igual: el destino de un error mecánico es un chequeo (un gate de CI, `nzt-ai lint`), no una frase |
| Que el repo no tenga chequeos es un hallazgo | Igual |
| Destinos: `CODING_STANDARDS.md`, `AGENTS.md`, docs | Los de NZT: el stack, `code-code.md`, `Docs/`, `tech-debt.md`, los gates, el kernel y las skills |
| Presenta en la conversación y aplica lo que el usuario elige | **Sólo escribe el md**; aplicar una propuesta es otro pedido, con su plan |
| Se dispara sólo con `/retro` | Con su nombre, o cuando el usuario acepta la oferta |

## Log de preguntas

Tres de tipo tradeoff (se preguntan siempre) y el modo para los detalles.

- QT-01 · ¿Dónde queda el md? — usuario: *no debe pushearse a un repositorio*; es algo para un
  momento específico, cuando se quiere hacer una retro. Ninguna de las tres opciones (las tres
  vivían en el repo). **Sigue abierta en QT-05**: dónde, fuera del repo.
- QT-02 · ¿Cuándo se ofrece? — **nunca** (usuario). Sólo cuando alguien la pide. Consecuencia:
  la unidad 410 pierde la oferta.
- QT-03 · ¿Sobre qué propone? — usuario: *como la de Pocock, sobre los tropiezos con la IA en
  las últimas 10 sesiones*. **Corrección del agente**: la de Pocock revisa **una** sesión, la
  actual o la que el usuario nombre de los registros (`docs/engineering/retro.md`); varias
  sesiones es una idea del usuario, no de esa skill. Proyecto vs NZT no se contestó. **Sigue
  abierta en QT-06 y QT-07.**
- QT-04 · Modo para los detalles — **propuestas del agente** (usuario).
- QT-05 · ¿Dónde se escribe el md, fuera del repo? — **se elige cada vez** (usuario): la
  retro pregunta la ruta antes de escribir.
- QT-06 · ¿Cuántas sesiones lee? — **la actual por defecto, o las últimas N si se pide**
  (usuario, la recomendada). Varias sesiones: sólo en Claude Code, de los registros del
  proyecto, una por subagente de lectura.
- QT-07 · ¿Propone sobre el proyecto y sobre NZT? — **los dos, en secciones separadas**
  (usuario, la recomendada).

### Detalles (QT-04: propuestas del agente, a objetar al ver la skill)

- **La ruta**: se pregunta con una sugerencia fuera del repo (`~/nzt-retro/<proyecto>/`); si
  la ruta elegida cae dentro de un repo git, avisa que un `git add -A` la subiría, y escribe
  igual si el usuario confirma. Nombre: `retro-<fecha>-<tema>.md`.
- **El md**: encabezado (fecha, sesiones revisadas, host), un resumen de tres líneas,
  *Propuestas para el proyecto*, *Propuestas para NZT* y *Descartado* (lo que no se pudo atar a
  un momento, con una línea de por qué).
- **Cada propuesta**: `R-NN`, título, gravedad, categoría, el momento (qué sesión y qué pasó,
  en palabras, **nunca un valor copiado de la sesión**), mecánico o de criterio, destino
  propuesto, la propuesta, y `estado: propuesta`. El equipo la pasa a `aceptada`,
  `descartada` o `hecha`; la retro no cambia estados.
- **Gravedad**: alta = se repite o terminó en un fallo silencioso o retrabajo; media = costó
  tiempo; baja = fricción.
- **Categorías**: las siete de Pocock en términos de NZT — navegación, chequeos automáticos,
  reglas (stack, `code-code.md`), instrucciones que pesan o no cambian nada (kernel, skills),
  economía de herramientas, información faltante — y una más, **entorno**: una herramienta que
  el agente asumió y no estaba (`python`, `gh`, `tsc` en esta sesión).

### Consecuencias para el plan (propuesta del agente)

- QT-02 = nunca: **410 ya no tiene oferta que agregar.** Tampoco hace falta fila en el kernel:
  la tabla de ruteo es de fases, y `nzt-research` y `nzt-delegate` tampoco están en ella. La
  descripción de la skill es su único disparo. Se propone **quitar 410** y que 409 lo cubra. **Aceptado por el usuario (2026-10-29): 410 queda `dropped`.**
