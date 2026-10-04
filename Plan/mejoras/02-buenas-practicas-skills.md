# 02 — NZT contra las buenas prácticas oficiales de skills

> Unidad 2 del run `marco-trabajo-mejoras` · 2026-10-03 · Solo lectura: no se tocó ninguna skill.

## Pregunta y decisión que sirve

**¿Qué prácticas oficiales de autoría de skills no cumple NZT, o cumple al revés?** Esto
decide **cómo se empaqueta la capa genérica** de la unidad 4 (skills nuevas o archivos de
referencia) y si las reglas D3 y D4 de la spec se mantienen.

## Fuentes leídas (2026-10-03)

| # | Fuente | Rango |
|---|---|---|
| S1 | [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), Anthropic | oficial |
| S2 | [Claude Code — Skills](https://code.claude.com/docs/en/skills), Anthropic | oficial |
| S3 | [Build skills](https://learn.chatgpt.com/docs/build-skills), OpenAI (destino de la redirección 308 de `developers.openai.com/codex/skills`) | oficial |

S1 y S2 no muestran fecha de versión; S2 cita versiones mínimas de Claude Code (v2.1.218,
v2.1.257). S3 no tiene fecha visible.

## La regla de las 100 líneas

- **documented (S1):** el límite de la SKILL.md es *"under 500 lines"*. Las 100 líneas son
  para los **archivos de referencia**: los que pasan de 100 líneas llevan una tabla de
  contenido al principio.
- **documented (S1):** la lectura parcial (`head -100`) pasa con **referencias anidadas**, o
  sea un archivo de referencia que apunta a otro. Por eso las referencias tienen que estar a
  un solo nivel de la SKILL.md.
- **observed:** el máximo de NZT es 200 líneas (D3). No hay ninguna SKILL.md que se lea
  parcialmente por su tamaño. **No hace falta partir nada por esta regla.**

## Brechas

### B1 · Claude Code también tiene presupuesto de listado, y la spec dice que no — **alto, error en la spec**

- **documented (S2):** el listado de skills está topeado al **1 % de la ventana de contexto**.
  Cuando se desborda, Claude Code *"drops descriptions for less-critical skills, starting
  with those not in recent queries"*. Además, `description` más `when_to_use` se truncan a
  1.536 caracteres.
- **observed:** las 111 descriptions de NZT suman **18.144 caracteres** (163 de promedio),
  sin contar nombres ni rutas.
- **inferred:** con una ventana de 200 mil tokens, el 1 % son 2.000 tokens, unos 8.000
  caracteres a razón de unos 4 caracteres por token. NZT ocupa más del doble. En
  ventanas de 1 millón entra.
- **contradicción:** la spec dice en §12, R1: *"Del lado de Claude Code R1 no existe"*. La
  tabla de §3 no tiene el tope del 1 %. **La fuente actual gana, y la spec queda desactualizada.**
- **Mitigante que ya existe:** el ruteo está instruido (tabla del kernel, hojas nombradas por
  su router), así que perder descriptions de hojas duele menos que en un set convencional.
  Pero ahora R1 aplica a los dos proveedores, no solo a Codex.

### B2 · D4 va en contra del patrón oficial — **alto, decide la unidad 4**

- **documented (S1, S2):** la forma recomendada es una SKILL.md como índice, con el detalle
  en archivos de referencia. Esos archivos **no cuestan nada hasta que se leen** y **no
  aparecen en el listado**.
- **documented (S3):** Codex soporta `references/`, `scripts/` y `assets/` dentro de la
  carpeta de la skill. **Es portable entre los dos proveedores**, así que no choca con C1.
- **observed:** NZT no tiene ni un archivo de soporte. Hay cero archivos fuera de
  `SKILL.md` en `skills/`, porque D4 declara `references/` "sin uso" y D3 manda partir en
  skills.
- **inferred:** cada práctica nueva que entra como skill paga en el listado de **todos** los
  proyectos (B1). La misma práctica como referencia de un router existente cuesta cero hasta
  que la tarea la pide.
- **Condiciones para usar referencias** (S1): un solo nivel desde la SKILL.md; tabla de
  contenido si pasa de 100 líneas; nombres descriptivos (`reference/persistence.md`, no
  `doc2.md`); barras `/` en las rutas.

### B3 · Lo que sobrevive a la compactación — **medio**

- **documented (S2):** el contenido de una skill entra una sola vez y no se vuelve a leer.
  Al compactar, Claude Code vuelve a adjuntar **los primeros 5.000 tokens de cada skill**,
  dentro de un total de **25.000 tokens**, priorizando las invocadas más recientemente.
- **inferred:** una hoja de 200 líneas entra entera en 5.000 tokens. El tope que puede
  pesar es el de 25.000: una unidad de build en .NET carga el kernel aparte, más el router,
  el router de área y de cuatro a seis hojas, y lo más viejo puede quedar afuera.
- **Implicación:** lo que una skill no puede perder va **arriba**, como instrucción
  permanente y no como paso único (S2). Las referencias ayudan a que haya menos SKILL.md
  cargadas a la vez.

### B4 · Evaluaciones — **medio**

- **documented (S1):** las evaluaciones se escriben *antes* de documentar, con al menos tres
  escenarios por skill y probando con Haiku, Sonnet y Opus.
- **observed:** hay 20 casos escritos en `evals/` y corrió uno (`kernel-loaded`), con un solo
  modelo (spec §11).
- **Implicación:** los cambios de este run se verifican con evals, y cada práctica genérica
  nueva trae su caso. Ya hay uno que sirve de molde: `stack/not-dotnet`.

### B5 · Descriptions — **bajo, cumple**

- **documented (S1, S2):** describir qué hace y cuándo usarla, con el caso principal primero,
  en tercera persona, y nunca "I can" o "You can".
- **observed:** 108 de 111 empiezan con "Use when", y las tres restantes con "Use before".
  Después de los dos puntos dicen qué producen. Cubren el qué y el cuándo, y el cuándo va
  primero, que es lo que sobrevive al truncado.
- **No se propone cambio.** `when_to_use` existe en Claude Code, pero rompe C1 y Codex no lo tiene.

### B6 · El resto del checklist de S1 — **cumple**

| Práctica | Estado en NZT |
|---|---|
| `name` en kebab-case, sin "claude" ni "anthropic", hasta 64 caracteres | cumple (el nombre sale del path, §9.1) |
| No ofrecer demasiadas opciones; dar un default | cumple: el router de área carga solo la alternativa que eligió el stack |
| Sin información con fecha de vencimiento | cumple: las 23 fechas encontradas son datos de ejemplo |
| Sin rutas con `\` | cumple: no se encontró ninguna |
| Concisión: no explicar lo que el modelo ya sabe | a confirmar por hoja en la unidad 3 |
| Terminología consistente | a confirmar en la unidad 3 |
| Workflows con pasos y checklist | cumple: las hojas cierran con *Done when* y *Closing checklist* |

### B7 · Opciones exclusivas de un proveedor — **descartadas por C1**

- **documented (S2):** `paths` limitaría una skill a ciertos archivos (por ejemplo, las de
  .NET a `**/*.cs`), y eso atacaría R1 de raíz en Claude Code.
- No existe en S3, y C1 limita el frontmatter a `name` y `description`. **Se anota como
  posibilidad para un adaptador solo de Claude, no se propone.**

## Lo que no se pudo verificar

- **unverified:** si Codex deja invocar por nombre una skill que **omitió del listado**. S3
  dice que una skill seleccionada carga su SKILL.md completa, y eso es selección, no
  omisión. La pregunta de la fase 9 sigue abierta.
- **unverified:** el ratio de caracteres por token de las descriptions de NZT. Lo de 8.000
  caracteres en el 1 % es una estimación.

## Qué le pasa a la unidad 4

1. **La capa genérica conviene como referencias de routers que ya existen**, no como skills
   nuevas: cero costo de listado y portable (B1, B2). Eso pide revisar **D4**, que es una
   decisión tuya.
2. **Se abre una opción mayor:** convertir hojas de la capa de stack en referencias de su
   router de área. El listado bajaría de 111 entradas hacia unas 45 y R1 dejaría de ser un
   riesgo en los dos proveedores. Es grande y va como opción, no como recomendación cerrada.
3. **D3 (200 líneas) puede quedarse**: es más estricta que la guía y no estorba. Lo que
   cambia es "sin excepción, se parte en skills" por "se parte en referencias".
4. §3 y §12 de la spec se corrigen por B1 en la unidad 5, hagamos lo que hagamos.
