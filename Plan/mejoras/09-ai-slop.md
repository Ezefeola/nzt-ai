# 09 · AI slop en lo visual: investigación y evaluación

**Pregunta** (escrita antes de buscar): ¿qué hace que una interfaz generada se vea genérica, y
qué guía la evita? **Decide**: qué cambia en `nzt-ux` (y quién la carga) para que los diseños,
mockups y pantallas que produce NZT no salgan con la estética por defecto.

Leído 2026-10-29. Versión: la actual de cada fuente (ninguna es dependencia del proyecto).

## Lo investigado

**Causa**

- documented: los modelos convergen al "centro de alta probabilidad" de su entrenamiento; sin
  dirección, salen las elecciones seguras y más comunes. Fuente: Anthropic, *Improving
  frontend design through Skills*, 2025-11-12 —
  https://www.claude.com/blog/improving-frontend-design-through-skills
- documented: prohibir no alcanza: con las fuentes prohibidas, el modelo converge en la
  siguiente (Space Grotesk). Misma fuente.
- inferred: una lista de prohibiciones usada como receta genera el *siguiente* cliché; la lista
  sirve para **revisar**, y lo que evita el cliché es **anclar cada decisión en el sujeto**.

**Método de la skill oficial** (`anthropics/skills`, `frontend-design/SKILL.md`, rama main —
https://github.com/anthropics/skills/tree/main/skills/frontend-design) — documented:

1. Identificar el sujeto (producto, audiencia, tarea); las elecciones salen de su industria,
   materiales y vernáculo.
2. Plan antes de construir: 4–6 colores con nombre, tipografías y su rol, layout con wireframe,
   principios.
3. Revisar el plan contra el brief: lo que se lee como default de cualquier página similar se
   cambia, diciendo qué y por qué.
4. Construir y criticar: responsive, foco, reduced motion, accesibilidad, capturas.
5. Audacia en un solo lugar; la estructura codifica información; una nota de lo ya probado
   para no repetirlo en la próxima pasada.

**Catálogo de tells** (misma fuente, documented), por categoría:

| Categoría | Tells |
|---|---|
| Tipografía | una palabra del titular acentuada (itálica, color) · etiquetas en mayúsculas espaciadas sobre cada título · monoespaciada para etiquetas chicas de datos · familias elegidas por hábito |
| Estructura | marcadores 01/02/03 sin secuencia real · kit de tarjetas SaaS: mismas tarjetas redondeadas, un radio para todo, la misma sombra gris suave, lavados de gradiente · el estilo "periódico" (filetes finos, radio 0, columnas densas) como default |
| Cromo de plantilla | metadatos unidos con punto medio `A · B · C` · etiquetas `PALABRA — fragmento` · `→` pegada a cada botón o link |
| Paletas por defecto | crema (~#F4F1EA) + serif + terracota (~#D97757) · casi negro + un acento ácido · casi negro teñido (#0B0B0B, #111) |
| Movimiento | fade + slide-up en cada sección · transición hover en cada tarjeta |
| Hero | número grande + etiqueta chica + stats + acento de gradiente |
| Texto | errores vagos o en primera persona · relleno, ingenio antes que claridad, jerga del sistema · CTA genéricos ("Enviar" en vez de "Guardar cambios") |

- documented (post de Anthropic): nombra Inter, Roboto, Open Sans, Lato y fuentes de sistema
  como sobreusadas.
- contradicción: el post (2025-11) recomienda fondos con gradientes en capas; la skill actual
  advierte contra lavados de gradiente decorativos. **Gana la skill actual.**

**Impeccable** (pbakaus/impeccable, Apache 2.0, nacida de la skill oficial —
https://github.com/pbakaus/impeccable) — documented (rank 4, repo oficial del proyecto):

- Un detector determinista, sin LLM: reglas sobre los archivos de UI (patrones) y sobre la
  página renderizada (contraste, texto diminuto); corre como hook antes de que el agente dé el
  trabajo por hecho, como CLI y en CI.
- Contexto del proyecto en archivos del repo: `PRODUCT.md` (lo que no puede inferir) y
  `DESIGN.md` (el sistema visual existente). Equivalen a `Docs/UX/design-system.md` de NZT.
- Comandos de crítica (`critique`, `audit` con severidad P0–P3) separados de los de dirección.

**Leads de rank 5** (no sostienen nada solos): el indigo de Tailwind UI como origen del
"botón violeta" (prg.sh); "hero centrado + tres tarjetas con ícono" como el layout típico
(varios blogs); "cambiar la tipografía es la jugada de mayor palanca" (opinión de diseñador).

## Lo que NZT ya tiene

`ux/references/system.md` §Visual direction ya hace lo correcto en parte: pregunta referencias,
**ancla en el sujeto**, una pasada contra el default con 6 tells, audacia en un lugar, contraste
calculado, alternativas que varían una dimensión.

## Huecos

| # | Hueco | Caso que se rompe |
|---|---|---|
| H1 | La pasada contra el default vive solo en *Visual direction*, que corre **sólo si el producto no tiene dirección** | Con dirección ya escrita, el mockup de la pantalla 5 sale con tarjetas idénticas y `→` en cada botón, y nada lo revisa |
| H2 | El catálogo tiene 6 tells; faltan tipografía, paletas por defecto, cromo de plantilla, texto | Una dirección "aprobada" con Inter + indigo pasa la pasada |
| H3 | `mockup.md` y `review.md` miden ancho, contraste y teclado, no lo genérico | Un mockup accesible y genérico cumple su *Done when* |
| H4 | El trabajo **directo** que produce algo visual ("hacé una landing", un dashboard) salta UX: lo construye `nzt-build` sin leer nada de esto | El caso más común de slop no pasa por ninguna guía |
| H5 | Sin plan visual antes de construir (paleta con nombre, escala tipográfica, layout) ni revisión del plan contra el brief | La primera idea, que es el default, es la que se construye |
| H6 | Sin nota de lo ya probado | La segunda alternativa repite la primera con otro color |
| H7 | Ningún chequeo determinista | Depende de que el agente se acuerde de mirar |

## Opciones

| | Qué | Costo | Cubre |
|---|---|---|---|
| A | Una reference nueva `ux/references/generic.md` (método positivo + catálogo como lista de revisión); `system.md` la cita en vez de su lista | 1 archivo ~120 líneas, 1 editado | H2, H5, H6 |
| B | A + leerla en *Read with* de mockup, prototipo, manual y review, y en sus *Done when*; y desde `nzt-build` cuando un trabajo sin fase UX produce una pantalla | A + 5–6 archivos editados | H1–H6 |
| C | B + chequeo determinista en `nzt-ai` (patrones en HTML/CSS), como gate de mockups | B + código C# y tests en el CLI | H1–H7 |

## Log de preguntas

- QT-01 · ¿Hasta dónde llega el cambio? (A / B / C) — **B** (usuario, 2026-10-29)
- QT-02 · ¿El trabajo directo que produce una pantalla debe pasar por la guía? — **sí**: se lee
  siempre que se hace front, desde `nzt-build`, además de en UX (usuario, 2026-10-29)
- QT-03 · ¿El catálogo nombra fuentes y paletas concretas o sólo categorías? — **concretas,
  sólo como lista de revisión** (usuario, 2026-10-29)

## §406 · Cada hueco contra lo hecho (2026-10-29)

| # | Resuelto por | Dónde |
|---|---|---|
| H1 | La pasada corre en toda unidad visual, no sólo al fijar la dirección | `ux/SKILL.md` (Read with de mockup, prototipo, manual, review), `mockup.md`, `manual.md`, `review.md` |
| H2 | Catálogo en 8 áreas con tipografías, paletas y patrones concretos, como pregunta (QT-03) | `generic.md` *The tells of a generated design* |
| H3 | La pasada está en el *Done when* de mockup, manual y review; review la clasifica como `construction` o `missing convention` | `mockup.md`, `manual.md`, `review.md` |
| H4 | Build lee `generic.md` al escribir lo que una persona ve, con o sin fase UX (QT-02); ítem en el checklist de componentes | `build/SKILL.md`, `frontend-components.md` |
| H5 | Plan visual de 6 pasos antes del markup y revisión del plan contra el pedido; el design system es el plan si existe | `generic.md` *The visual plan* |
| H6 | Alternativas que varían una dimensión, segunda pasada que cambia lo anterior, *Rejected directions* en el design system | `generic.md` *Tried, not repeated*, `system.md` |
| H7 | **Fuera de alcance** (QT-01 = B): sin detector determinista | — |

**Puertas:** `nzt-ai lint` y `verify` 0 problemas; `build.sh` pasa y en `dist/` la ruta
`../nzt-ux/references/generic.md` resuelve; 171 checks del instalador pasan; ningún `.md` pasa
de 200 (máx. `stack.md` 198; UX máx. `manual.md` 151); 356 citas a references resuelven salvo
el falso positivo conocido de `blazor/SKILL.md:20`.

**Documentos al día:** D86 en `specs/nzt-core.md` (§4.3 con la hoja nueva); el README pasa de
131 a 140 referencias — 131 ya estaba desactualizado antes de esta run (`main` tenía 139).

**No verificado:** si la guía mejora de verdad lo que se genera. No hay eval visual en
`evals/`; sólo se comprobó que la guía se carga en los caminos correctos. Medirlo sería
generar la misma pantalla con y sin la guía y contar tells.
