# 03 — Inventario de las 111 skills

> Unidad 3 del run `marco-trabajo-mejoras` · 2026-10-03 · Solo lectura: no se tocó ninguna skill.

## Cómo se hizo

- **Quién referencia a quién:** para cada skill se buscó su nombre entre backticks en las
  otras 110 y en `core/kernel.md`. Eso da el grafo de carga: qué router la nombra y qué
  hojas la citan.
- **Qué contiene:** de las 47 skills de la capa de stack se leyeron los títulos `##` y las
  reglas en negrita. Las hojas genéricas no se leyeron por dentro: para clasificarlas alcanza
  el grafo.
- **Medido:** el listado (nombre + description) suma **21.257 caracteres** con 111 skills.
  En `/context` de esta sesión, las skills ocupan **9,9k tokens = 1,0 %** de una ventana de
  1M. Es justo el tope que documenta Claude Code (02, B1). Que ya esté truncando
  descriptions es **inferido**, no observado.

## Clasificación

| Grupo | Skills | Destino propuesto |
|---|---|---|
| A · Routers de fase y raíz | `nzt`, `nzt-plan`, `nzt-discovery`, `nzt-architecture`, `nzt-ux`, `nzt-build`, `nzt-verify`, `nzt-ship`, `nzt-learn` (9) | **Quedan skills.** Son lo que nombra el kernel |
| B · Routers de área | `build-backend-dotnet`, `build-frontend-blazor`, `ship-backend-dotnet`, `build-csharp` (4) | **Quedan skills**, y pasan a ser el índice de sus referencias |
| C · Hojas de la capa de stack | las 43 restantes de `build/backend`, `build/frontend`, `build/csharp` y `ship/backend` | **Pasan a `reference/` de su router de área** (tu decisión) |
| D · Hojas genéricas de fase | las 55 restantes | **Quedan skills por ahora.** Razones abajo; hay una excepción opcional (D-learn) |

`build-csharp` queda como skill y no como referencia porque la usan **dos** routers de área,
backend y Blazor. Como referencia, viviría en la carpeta de uno y el otro la tendría que
leer cruzando skills.

### Grupo C, por router de destino

| Router de área | Referencias que recibe |
|---|---|
| `build-backend-dotnet` (28) | api · architecture-{clean, hexagonal, vertical-slice} · domain-{anemic, ddd, value-objects} · ef-core (base) · ef-core-{bulk, domain, indexes, mappings, migrations, pagination, queries, writes} · endpoints-{controllers, minimal} · exceptions · persistence-{direct, repositories} · results-{extensions, filter, pattern} · security · testing · use-cases · validation |
| `build-frontend-blazor` (9) | architecture-vertical-slice · components · forms · performance · prerendering · render-{auto, server, static, webassembly} |
| `build-csharp` (2) | dtos · linq |
| `ship-backend-dotnet` (4) | containers · migrations · observability · pipeline |

`ef-core` hoy es un sub-router: "se carga junto con la operación EF Core que aplique". Como
referencia es la **base** que la tabla del router manda leer junto con la específica, así no
queda una referencia apuntando a otra.

### Por qué el grupo D queda como skill

1. **Lo citan desde varias fases.** `discovery-change` lo nombran 9 skills; `verify-test-data`,
   7; `build-tests` y `verify-bug`, 6; `architecture-review`, 4. Como referencia de un solo
   router, las demás fases tendrían que leer un archivo de la carpeta de otra skill.
2. **Invocarlas directo es parte del funcionamiento.** El kernel dice *"Load a leaf directly
   only when the user named it"*, y el README publica `/nzt-ux-mockup` y similares. Una
   referencia no aparece en el menú `/`. **Pasar el grupo D sería perder funcionalidad**, y
   pediste que no se pierda.
3. **El ahorro grande ya está en C.** Ver los números abajo.

**Excepción opcional — D-learn.** Las 7 hojas de `nzt-learn` las referencia solo su propia
rama, ninguna otra fase. Pasarlas a referencia ahorra unos 1.200 caracteres más, con un costo:
`/nzt-learn-teach` y las demás dejan de existir como comando y quedan accesibles solo por
`/nzt-learn`. **Se decide en la unidad 4.**

## Números

| Escenario | Skills | Listado (nombre + description) |
|---|---|---|
| Hoy | 111 | 21.257 caracteres |
| C a referencias | **68** | ~11.500 (−9.700) |
| C + D-learn | 61 | ~10.300 |
| Piso de Codex sin contexto conocido | — | 8.000 |

- **inferred:** en Claude Code con 1M de contexto, el 1 % son unos 40.000 caracteres, y con C
  queda muy holgado. Con 200 mil tokens, el 1 % son unos 8.000: no alcanza, pero las
  descriptions que se pierdan son de hojas genéricas que su router nombra igual.
- Los ~11.500 son una estimación: se restaron las descriptions medidas (8.132 caracteres) y
  los nombres a ~37 caracteres cada uno.

## Lo que el grafo muestra que hay que resolver en la unidad 4

### Un defecto que ya existe hoy

**`nzt-build-csharp-linq` no la nombra nadie.** Ni el router de .NET, ni el de Blazor, ni
`nzt-build-csharp`: cero referencias, y `csharp` solo menciona "a LINQ chain" en la regla de
`var`. Hoy solo se carga si el matching de descriptions la elige, que es justo el mecanismo
que NZT no usa (R2). **Hay que arreglarlo en la migración:** pasa a ser una fila de la tabla
de `build-csharp`.

### Referencias que cruzan áreas

Con referencias a un nivel (02, B2), una referencia **no** puede mandar a leer otra. Hoy las
hojas se citan mucho entre sí:

| Cita cruzada | Ejemplo |
|---|---|
| Dentro del mismo router | `exceptions` la citan 7 hojas; `results-pattern`, 2; `ef-core-domain` cita `value-objects` |
| Entre routers de área | `ship-dotnet/migrations` ↔ `build-dotnet/ef-core-migrations`; Blazor cita `build-backend-dotnet-security` |
| De Blazor a C# | Blazor cita `csharp-dtos` |

Opciones a decidir en la unidad 4. Las dos primeras son excluyentes; la tercera se suma a la
que se elija:
- **(a)** La referencia nombra a la otra **solo como mención**, y la tabla del router dice qué
  se lee junto con qué ("`use-cases` → leer también `exceptions`"). Todo queda a un nivel.
- **(b)** Se permite leer una referencia hermana del mismo router. Es más simple de escribir,
  pero es anidamiento, justo lo que la guía dice que provoca lecturas parciales.
- **Entre áreas, en cualquier caso:** el router de área carga la skill de la otra área
  (`build-backend-dotnet` desde `ship-backend-dotnet`), igual que hoy carga `build-csharp`.

## Prácticas generales escondidas en la capa de stack

Sacadas de los títulos y reglas de las 47 skills. Son **observaciones**: qué entra en la capa
genérica se decide en la unidad 4. "Ya genérico" marca lo que ya existe fuera de .NET.

### Backend

| # | Práctica general | Fuente hoy | Ya genérico |
|---|---|---|---|
| G1 | Una operación es una unidad con una sola entrada, nombrada por lo que hace, y devuelve un resultado | `use-cases` | — |
| G2 | Validar la forma en el borde antes de tocar nada; las reglas salen del contrato, nunca inventadas; ausente ≠ vacío ≠ nulo; una colección válida no hace válidos sus elementos | `validation` | en parte: `nzt-build` dice "frontend valida forma" |
| G3 | Fallas esperadas como valor, con su status; excepciones solo para lo excepcional; un único manejador global; reconocer errores por tipo, nunca por código o texto; nada interno llega al usuario | `results-pattern`, `exceptions` | — |
| G4 | Unicidad: chequeo previo **más** restricción única en la base, porque dos pedidos pueden pasar el chequeo a la vez | `use-cases`, `ef-core-indexes`, `ef-core-writes` | — |
| G5 | La operación es la unidad transaccional: un solo guardado al final | `ef-core-writes`, `persistence-direct` | — |
| G6 | Leer lo que la respuesta necesita (proyección), no la entidad entera; filtros opcionales encadenados | `ef-core-queries` | — |
| G7 | Nada va a la base dentro de un loop; todo I/O es asíncrono y cancelable; la conexión vive lo que la operación | `ef-core` | — |
| G8 | Paginar con un orden que termina en una columna única; página y tamaño se validan, no se corrigen | `ef-core-pagination` | — |
| G9 | Un índice se gana con una consulta real; en uno compuesto el orden es la decisión; cada índice cuesta en escritura | `ef-core-indexes` | — |
| G10 | Operaciones masivas: cuándo sí y cuándo no (no corre la lógica de la entidad, se pierden los valores previos) | `ef-core-bulk` | — |
| G11 | Migraciones generadas por comando y leídas antes de aceptarlas (borrados, renombres que salen como borrar + agregar); generar ≠ aplicar; se aplican una vez, antes de la versión nueva y compatibles con la que sigue corriendo | `ef-core-migrations`, `ship-dotnet/migrations` | en parte: `nzt-build` dice "lo generado se genera por comando" |
| G12 | El endpoint no decide nada: recibe, llama y devuelve; cada parámetro dice de dónde viene | `api`, `endpoints-*` | — |
| G13 | La autoridad de quien llama sale del servidor; los jobs no son un bypass; listados, conteos y exports respetan el alcance; los ids padre-hijo se verifican; un rechazo no modifica nada | `security` | — |
| G14 | Tests: el framework del proyecto; particiones como filas; el tiempo se inyecta; el acceso a datos se prueba contra el motor real | `testing` | en parte: `nzt-build-tests` |
| G15 | Las dependencias apuntan hacia adentro; ninguna feature entra en otra; un patrón que no se usa no tiene carpeta; un único punto de composición | `architecture-*` | — |
| G16 | La entidad protege sus invariantes y su creación devuelve errores; entre agregados solo viaja el id; se carga el agregado mínimo; cuándo algo se gana un value object | `domain-ddd`, `domain-value-objects` | en parte: `nzt-architecture-domain` modela, pero no dice cómo se escribe |
| G17 | Un DTO por operación, nunca compartido; el nombre dice para qué es; el mapper no decide; un mapper por entidad | `csharp-dtos` | — |
| G18 | Colecciones: enumerar una vez, lookups en vez de loops anidados, nunca devolver null para una secuencia | `csharp-linq` | — |

### Frontend

| # | Práctica general | Fuente hoy | Ya genérico |
|---|---|---|---|
| G19 | Parámetros entran, eventos salen; un componente nunca muta lo que recibe; clave estable en listas que cambian; las suscripciones se liberan | `blazor-components` | en parte: `nzt-build` dice "tres estados" |
| G20 | El formulario tiene su propio modelo; la forma se valida acá y las reglas del lado del backend; un envío no puede correr dos veces; cada campo tiene su label y su error | `blazor-forms` | en parte |
| G21 | Performance se arregla con medición; listas grandes paginadas o virtualizadas según evidencia; eventos de alta frecuencia acotados | `blazor-performance` | en parte: `nzt-verify-performance` mide |
| G22 | Todo lo que llega al navegador es público: ni secretos, ni claves, ni reglas privilegiadas | `render-webassembly`, `render-auto`, `prerendering` | — |
| G23 | Lo que el servidor ya leyó en el primer render no se vuelve a pedir | `prerendering` | — |

### Ship

| # | Práctica general | Fuente hoy | Ya genérico |
|---|---|---|---|
| G24 | Una imagen se construye una vez y se promueve entre entornos; la configuración y los secretos llegan en runtime; un proceso por imagen | `ship-dotnet/containers` | — |
| G25 | La versión del SDK la fija el repo; nada se actualiza para que algo pase; nunca imprimir configuración ni entorno en CI | `ship-dotnet/pipeline` | en parte: `nzt-ship-pipeline` |
| G26 | Health checks, logs estructurados, y no reimplementar lo que la plataforma ya emite | `ship-dotnet/observability` | sí: `nzt-ship-observability` |

**Lectura:** el hueco real está en **backend (G1–G18)** y **frontend (G19–G23)**. Ship ya
tiene casi todo en su versión genérica. Hoy, en un proyecto Node o Python, un agente bajo
NZT no recibe ninguna de las G1–G23.

## Sin verificar

- Que las G sean agnósticas **en el cuerpo** y no solo en el título: se confirma al escribir
  cada referencia genérica, leyendo la hoja de origen completa.
- Cuánto se pisa `nzt-build-tests` con `dotnet-testing` (G14), y `nzt-ship-*` con sus pares de
  .NET (G25, G26).
