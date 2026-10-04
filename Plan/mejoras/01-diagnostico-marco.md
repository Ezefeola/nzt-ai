# 01 — Diagnóstico del marco

> Unidad 1 del run `marco-trabajo-mejoras` · 2026-10-03 · Solo lectura: no se tocó ninguna skill.

## Qué se midió

El marco esperado, según la propia spec (`specs/nzt-core.md` §1, §2, §4.5, §10) y el kernel
(`core/kernel.md`):

1. **No agrega conocimiento ni lo limita**: da método, memoria y frenos (§1).
2. **El núcleo metodológico es agnóstico** y "no puede depender" de .NET o Blazor (§2, §4.5).
3. **Carga solo lo que la tarea necesita** (criterio de éxito 3).
4. **Escala al pedido**: un cambio chico no corre el método completo (§5.1).
5. **Mismo comportamiento en Claude Code y Codex** (criterio de éxito 5).

Leído: kernel completo, spec §1–§6, §10–§12 y el índice de decisiones, router `nzt-build`,
`nzt-architecture-stack` (primeras 80 líneas), el fixture `node-project.sh` y el caso
`stack/not-dotnet`. No se leyeron las hojas una por una: eso es la unidad 3.

## Veredicto corto

**El método cumple; el contenido no es agnóstico en la práctica.** El bucle, los frenos, el
estado y el ruteo instruido hacen lo que la spec promete y no restringen al agente. Pero
cumplir el punto 2 "en la letra" (el kernel y los routers no nombran .NET) no alcanzó: la
**ingeniería** del set vive casi entera en la capa de stack, y un proyecto en otro stack
recibe el método sin ninguna práctica de desarrollo. Tu sensación de "sirve solo para .NET
y Blazor" está respaldada por la evidencia.

## Hallazgos

Cada uno: qué se observó, la evidencia, y a qué unidad alimenta. Son **observaciones**, no
decisiones.

### H1 · Fuera de .NET el agente recibe método pero no prácticas — **alto**

- `nzt-build` dice: *"If no area applies to this component, read the neighbouring code and
  follow the conventions already there."* En un proyecto existente eso funciona; **en uno
  nuevo en Node, Python o React no hay código vecino**, y la única guía técnica es ninguna.
- El ruteo de área de build y ship tiene una sola fila por fase: `.NET` y `Blazor`.
- El único eval de otro stack (`stack/not-dotnet`) mide **contención** (que no cargue .NET),
  no que el resultado sea bueno. Nada mide lo que NZT aporta fuera de .NET.
- **Alimenta:** unidad 3 (qué prácticas generales hay escondidas) y unidad 4 (la capa genérica).

### H2 · Prácticas generales encerradas en skills de .NET — **alto**

Reglas que valen en cualquier stack y hoy solo las lee quien usa .NET (inferido por los
nombres y por las decisiones D39, D44, D48 y D49; **se confirma leyendo las hojas en la unidad 3**):

| Práctica general | Dónde vive hoy |
|---|---|
| Fallas esperadas como resultado, excepciones solo para lo excepcional, un handler global | `results/pattern`, `exceptions` |
| Verificar unicidad antes de escribir, más el índice único como garantía | `use-cases`, `ef-core/indexes`, `ef-core/writes` |
| Un único guardado al final de la operación | `ef-core/writes` |
| Paginar con orden que termina en una columna única | `ef-core/pagination` |
| Proyectar a lo que la respuesta necesita, no traer entidades enteras | `ef-core/queries` |
| Validar la forma en el borde, reglas de negocio donde viven | `validation` |
| La autoridad del llamador sale del servidor | `security` |
| Una operación = una unidad con una entrada | `use-cases` |
| Health checks, logs estructurados y telemetría | `ship/backend/dotnet/observability` |

### H3 · El documento de stack obligatorio está pensado en .NET — **medio**

- Es la pieza que "decide" (§6.1) y su único ejemplo es .NET 10 / C# / EF Core / minimal APIs.
- Los ejes (`Architecture`, `Domain model`, `Persistence`, `Endpoints`, `Error handling`)
  son genéricos, pero **sus opciones solo están definidas en los routers de .NET**. En Node
  el agente tiene que inventar qué significa cada eje.
- **Alimenta:** unidad 4 (ejes y opciones definidos en la capa genérica, no en la de stack).

### H4 · La regla de 200 líneas sin referencias empuja el crecimiento al listado — **medio**

- D3 (≤ 200 líneas, sin excepción) más D4 (`references/` declarada y sin uso) hacen que todo
  desborde se resuelva **con más skills**.
- Cada skill nueva suma al listado de descriptions, que es exactamente R1: 17.634 chars
  medidos contra un piso de 8.000 en Codex (§12).
- La guía oficial de Anthropic hace lo contrario: SKILL.md < 500 líneas y el detalle en
  archivos de referencia que **no se cobran hasta que se leen**.
- Una capa genérica hecha con D3 + D4 tal como están **agrava R1**. Esta tensión se tiene que
  resolver antes de construirla.
- **Alimenta:** unidad 2 (buenas prácticas) y unidad 4.

### H5 · El comportamiento prometido está casi sin medir — **medio**

- Roadmap fase 6: corrió `kernel-loaded` y pasó; **faltan 19 casos** (§11, línea 2850 de la spec).
- La guía oficial pone las evaluaciones *antes* de escribir. Hoy la afirmación "el marco
  rinde parejo" se apoya en una corrida.
- **Alimenta:** unidad 6 (las evals entran como verificación de los cambios, no al final).

### H6 · El método en sí no limita al agente — **cumple**

- El kernel no prescribe conocimiento: prescribe bucle, frenos, estado y evidencia. La regla
  10.7 ("prescribir el procedimiento, no el criterio técnico") se respeta en kernel y routers.
- Escala al pedido: §5.1 y `nzt` permiten bug sin ceremonia y cambio chico sin plan. En esta
  misma sesión, crear la rama fue una unidad sin estado ni plan, como corresponde.
- El ruteo instruido (tabla en el kernel, hojas nombradas por su router) es lo más sólido del
  diseño y **no hay que tocarlo**.
- Las hojas de stack sí prescriben criterio técnico, y está bien: son opt-in del documento
  de stack. Lo que falta es el piso genérico debajo de ellas (H1).

### H7 · La spec fundacional se volvió un registro — **bajo**

- `specs/nzt-core.md` tiene 3.381 líneas; §13 (revisión contra Temper) ocupa unas 2.000 y
  funciona como historial.
- No rompe nada, pero cada cambio de esta tanda tiene que encontrar su lugar ahí, y leerla
  entera ya no es barato.
- **Fuera de alcance de este run**: se reporta, no se propone cambio salvo que lo pidas.

## Qué no se pudo afirmar

- **Sin verificar**: qué tan grandes son en realidad las fugas de .NET dentro de las hojas
  genéricas (`implement`, `tests`, `use-cases` del lado genérico). El grep encontró menciones
  a .NET solo en `architecture/stack`, `build`, `ship` y `learn/plan`, pero una fuga de
  forma (ejemplos pensados en C#) no aparece en un grep. Eso es la unidad 3.
- **Sin verificar**: el comportamiento real en Codex con 111 skills (fase 9 del roadmap).

## Qué cambia en el plan

Nada todavía. H4 confirma que la unidad 2 va antes que la 3: cómo se empaqueta la capa
genérica (skills o referencias) depende de las buenas prácticas y de R1.
