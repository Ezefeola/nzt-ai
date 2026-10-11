# 07 — Extracción de la capa genérica

Unidad 42, 2026-10-09. Este documento es una lectura: no cambia nada en las skills. Cubre
cada referencia de `nzt-build-backend-dotnet` que no es de EF Core (20 referencias más el
router). EF Core, `nzt-build-csharp` y Blazor quedan para la unidad 47, que agrega su sección
en este mismo archivo.

## Qué pidió el usuario (2026-10-08 y 2026-10-09)

- **Extraer, no copiar.** Lo que es práctica de cualquier lenguaje sale de .NET a una capa
  genérica. La referencia de .NET se queda con **cómo se hace en .NET** y lee la genérica
  antes de aplicarse.
- **Mismo funcionamiento de hoy para .NET.** El código .NET que sale tiene que ser igual al
  de ahora. Lo que se gana es que cualquier otro lenguaje reciba las mismas prácticas, en vez
  de tener solo el método.
- Las arquitecturas son el ejemplo. El principio vale en todos los proyectos. En .NET la
  separación de capas la hace cumplir el compilador, con un proyecto por capa en la solution;
  en otros lenguajes puede ser solo una carpeta.
- El usuario también nombró como genéricos use cases, validation, Result, exceptions y DDD.
  Sobre persistence pidió analizarlo.

## Cómo se lee la tabla

- **Genérico**: qué parte de la referencia vale sin .NET. Es una estimación por lectura, no
  algo medido.
- **Queda en .NET**: lo que solo existe en .NET, en C# o en ASP.NET Core.
- **Destino**: la referencia genérica propuesta. Las rutas son relativas a `nzt-build/`.

## Backend sin EF Core

| Referencia .NET | Genérico | Qué es genérico | Queda en .NET | Destino |
|---|---|---|---|---|
| `architecture-vertical-slice.md` | ~85% | La unidad es la operación. El árbol de roles (Contracts, Domain, Features/<Agregado>/<Operación>, Persistence, Integrations, Exceptions). Ninguna slice entra en otra; lo duplicado es barato y el helper compartido es caro. Las carpetas existen cuando algo las llena, en plural salvo la de operación. Un archivo de registro por carpeta raíz, un método por feature, registro explícito y nunca por escaneo | Un solo `.csproj` y ningún proyecto por capa; `Program.cs`; el ejemplo `IServiceCollection` | `references/architecture-vertical-slice.md` |
| `architecture-clean.md` | ~75% | Cuatro capas con las referencias hacia adentro. El contrato lo declara quien lo necesita. Composition root único. Solo DTO y Result salen de Application. La traducción a HTTP y el handler global en la capa de entrada. Las interfaces de persistencia en Application y no en Domain. Un patrón sin usar no tiene carpeta de ningún lado. La interfaz sobre el handle con persistencia directa y el porqué | Que **la capa es un proyecto y la hace cumplir el compilador**; los nombres `<Component>.Domain`, etc.; que `Program.cs` es el único archivo de `Api` que nombra `Infrastructure`; ASP.NET Core | `references/architecture-clean.md` |
| `architecture-hexagonal.md` | ~75% | La unidad es el adaptador: Core sin dependencias, un motivo por adaptador, ningún adaptador ve a otro, composition root aparte y el host que no forma un ciclo. Todos los contratos en un solo lugar salvo la interfaz del use case. El handler global como el único cruce declarado | Proyectos `.csproj` y que el compilador lo resuelve; `AddAdapter<Motive>`; `Program.cs` | `references/architecture-hexagonal.md` |
| `use-cases.md` | ~80% | Una operación con una sola entrada pública, nombrada por lo que hace, sin sufijo. Siempre devuelve Result. Validar antes de tocar nada. La unicidad se chequea antes de escribir, la restricción en la base se queda y la carrera va al handler global. `try/catch` solo en los dos casos, con un comentario. El status se decide acá y coincide con el resto del proyecto. Lo que nunca hace. Cada return construye su Result | `ExecuteAsync`, `Task<Result<T>>`, `CancellationToken`, `AnyAsync`, `SaveChangesAsync`, `HttpContext`, `IActionResult` | `references/use-cases.md` |
| `validation.md` | ~90% | Casi todo: las reglas salen del contrato o de la entidad; ausente ≠ null ≠ vacío; elementos de una colección; normalización sin esconder; lo que necesita estado queda afuera; verificación | Tabla FluentValidation / clase estática | `references/validation.md` |
| `results-pattern.md` | ~60% | Fallas esperadas como valor. Tipo cerrado con exactamente dos constructores, Success con payload y Failure sin payload. Sin descripción libre, porque se desfasa de los errores. Base sin el tipo del payload para quien no lo conoce. El status viaja adentro y lo decide la operación. Cada return construye el suyo. Leer el éxito primero. La traducción al transporte en un solo lugar | El código C# exacto, que .NET sigue copiando tal cual. `private protected`, `sealed`, `!`, un archivo con dos tipos | `references/results.md` |
| `exceptions.md` | ~55% | Lo esperado no llega acá. Un solo manejador global. Se reconoce por tipo, nunca por código del proveedor ni por texto. Lo más específico primero. Misma forma que un Result fallido y mismo status que el pre-chequeo. Nada interno llega al usuario, el detalle solo en desarrollo. Los textos son los del proyecto. Se loguea una vez | `IExceptionHandler`, `ProblemDetails`, `DbUpdate*Exception`, el registro y `SuppressDiagnosticsCallback` desde .NET 10 | `references/errors.md` |
| `domain-ddd.md` + `domain-ddd-behaviour.md` | ~70% | La entidad protege sus invariantes. El agregado es el límite de consistencia y la raíz es lo único que se nombra desde afuera. Rules y Errors en la entidad, citados por toda capa. Entre agregados solo viaja el id. El orden de los miembros. Una creación que valida y devuelve errores o nada, sin entidad inválida. Métodos con nombre de operación que devuelven errores. Sin excepciones, sin HTTP y sin I/O en el dominio. El agregado mínimo y el guardarraíl de invariantes sobre colecciones. La línea de DDD del stack decide qué piezas se usan | `sealed`, setters privados, constructor privado vacío, inicializador de objeto, tupla `(errors, entity?)`, `Guid.CreateVersion7`, `Include` | `references/domain-ddd.md` (una sola referencia si entra en 200 líneas) |
| `domain-anemic.md` | ~80% | Entidades que son datos, sin métodos ni validación. Rules y Errors siguen en la entidad. Las reglas en el use case. Una regla duplicada a propósito con fuente escrita. Sin medio modelo rico ni capa de servicio | `get; set;` públicos, métodos de extensión | `references/domain-anemic.md` |
| `domain-value-objects.md` | ~70% | Cuándo algo se gana un value object, con las dos preguntas. Inmutable e igual por contenido. Creación que valida. El comportamiento adentro, devolviendo valores nuevos. No sale en un DTO. La carpeta según cuántos agregados lo usan | `sealed record`, `init`, la tabla del árbol con `.cs` | `references/domain-value-objects.md` |
| `persistence-direct.md` | ~85% | **Analizado a pedido del usuario: es genérico.** "Directo" es una decisión: sin repositorios ni unit of work en ningún lado, sin helper que envuelva el handle. El handle y la consulta sin ejecutar no salen del use case. El use case es la unidad transaccional y guarda una vez al final. Sin `try/catch` sobre persistencia. Las consultas escritas en el use case, duplicadas antes que extraídas | `readonly`, constructor explícito, "transaction cleanup" de EF | `references/persistence-direct.md` |
| `persistence-repositories.md` | ~80% | **Genérico también.** Uno por raíz de agregado y nunca genérico. Métodos con nombre del dominio. Devuelve resultados, nunca una consulta a medio armar. Las lecturas pasan por él. No guarda, no decide, no expone el handle. El unit of work es la única puerta y lo único que guarda. Transacción explícita solo si dos escrituras no entran en un guardado. Tocar solo los repositorios que la operación necesita | `IQueryable`, `Expression<>`, `SaveChangesAsync`, `await using`, las firmas C# | `references/persistence-repositories.md` |
| `api.md` | ~70% | El endpoint no decide nada. Cada parámetro dice de dónde viene. Un solo body y ninguno en un GET. La identidad nunca sale de un header como autenticación. La traducción del Result en un solo lugar. Autorización por defecto en el grupo y lo público marcado a propósito. Sin versionado inventado | `[FromBody]`, `[Authorize]`, `[AllowAnonymous]`, `[FromServices]` | `references/api.md` |
| `endpoints-minimal.md` / `endpoints-controllers.md` | ~25% | El cuerpo enlaza, llama una vez y devuelve. El handler tiene nombre y no es una lambda. Las dependencias por handler. Una acción por use case | Casi todo es la forma de ASP.NET Core | Ninguno: lo genérico ya está en `api.md` |
| `results-extensions.md` / `results-filter.md` | ~40% | Lo que sale: el payload sin sobre en el éxito y la forma de error del proyecto en la falla. Status del Result en las dos ramas. Sin descripción duplicada. Una sola traducción. Si el Result es el contrato, algo global ajusta el status y nunca se registra endpoint por endpoint | `ProblemDetails`, `ObjectResult`, `IEndpointFilter` | Va a `api.md` genérica como "cómo sale el Result al transporte", con las dos opciones como ejes del stack (unidad 23) |
| `security.md` | ~95% | Toda la referencia | `[Authorize]`, `HttpContext` (dos menciones) | `references/security.md` |
| `testing.md` | ~50% | Unit e integración separados, y el proyecto existe porque el nivel está habilitado. Particiones como filas. El tiempo inyectado y nunca mezclado. Licencia antes de sumar una librería de aserciones. No mockear lo propio frente a la base. Un fake en memoria no prueba el acceso a datos. Base de integración desechable. APIs con el pipeline real. Mutation testing en módulos críticos | xUnit/MSTest/NUnit, runners, `TimeProvider`, FluentAssertions, `WebApplicationFactory`, Stryker.NET | **A cruzar con `references/tests.md`**, que ya es genérica. Lo que falte se suma ahí y no en una referencia nueva |
| Router `SKILL.md` | ~40% | "Ejes independientes" (dominio ≠ persistencia, Result ≠ su traducción, validación ≠ invariante). La versión sale del manifiesto. Una carpeta instalada no es una autorización | La tabla de ejes y referencias | La tabla de `nzt-build` para stacks sin router de área |

## Lo que encontré y no estaba en el pedido

1. **Las referencias de .NET ya están escritas casi en genérico.** Las arquitecturas hablan
   de *roles* y no de carpetas, y la persistencia habla del "handle que nombra el ORM". Por
   eso extraer es sobre todo **recortar el C#**, no reescribir. Eso también hace posible
   comprobar que no se pierde nada (unidad 43).
2. **Persistence es genérica.** La decisión entre repositorios y acceso directo, y todo lo que
   se sigue de ella, no depende de .NET. Lo que es de .NET son los nombres (`IQueryable`,
   `SaveChangesAsync`).
3. **Endpoints y la traducción del Result no se ganan una referencia genérica propia.** Lo
   genérico entra en pocas líneas dentro de `api.md`.
4. **Testing se cruza con lo que ya existe.** `nzt-build/references/tests.md` ya es genérica,
   así que lo que sale de `testing.md` va ahí. Una tercera referencia de tests sería la
   deriva que la regla 15 intenta evitar.

## Destino propuesto: 14 referencias genéricas de backend

Todas en `nzt-build/references/`:

`architecture-vertical-slice.md`, `architecture-clean.md`, `architecture-hexagonal.md`,
`use-cases.md`, `validation.md`, `results.md`, `errors.md`, `domain-ddd.md`,
`domain-anemic.md`, `domain-value-objects.md`, `persistence-direct.md`,
`persistence-repositories.md`, `api.md` y `security.md`. Además, lo que falte de testing se
suma a `tests.md`, que ya existe.

**Cómo se leen:**

- **Stack con router de área (.NET):** la fila del router .NET pasa a tener la genérica en
  *Read with*, para que la genérica se lea primero. La referencia .NET recortada dice solo
  cómo se hace en .NET.
- **Stack sin router de área:** una tabla nueva en `nzt-build`, con los mismos ejes que el
  router .NET (arquitectura, dominio, persistencia) y las filas que la tarea selecciona.

## EF Core, C# y Blazor (unidad 47, 2026-10-10)

### EF Core: casi todo es acceso a datos, sea cual sea el ORM

| Referencia .NET | Genérico | Qué es genérico | Queda en .NET | Destino |
|---|---|---|---|---|
| `ef-core.md` (base) | ~60% | La conexión o sesión vive lo que la operación y es una por operación. Nada va a la base dentro de un loop: N+1, un guardado por fila, update masivo en loop. Sin carga perezosa. Todo I/O es async y cancelable donde el lenguaje lo permita. Lo que depende del proveedor se verifica, no se supone. La cadena de conexión sale de la configuración | `AsNoTracking`, el tracking por defecto y por qué se mantiene, scoped, `DbContext` | `data-access.md` |
| `ef-core-queries.md` | ~70% | Proyectar a lo que la respuesta necesita dentro de la consulta. Cargar la entidad solo si la consulta no puede expresarlo. Filtros opcionales encadenados. Filtrar, ordenar y paginar en el servidor y en ese orden. El operador según la intención (existe, uno, cuántos, agregado). No materializar para tapar un error de traducción. SQL crudo solo si el lenguaje de consulta no alcanza, y siempre parametrizado. La consulta sin ejecutar no sale de su método. Un claim de performance se decide con el plan real | `IQueryable`, `Include`, `AsSplitQuery`, la tabla de operadores EF, client evaluation de EF 3 | `data-queries.md` |
| `ef-core-pagination.md` | ~75% | Paginar está escrito una vez. Cuenta y página en dos consultas, y si la cuenta es cero no se pide la página. Empieza en 1. El total es de los filtros y no de la página. Un solo DTO de página compartido. Se pagina después de proyectar y nunca sobre algo ya materializado. **El orden termina en una columna única.** Página y tamaño se validan y no se corrigen. El costo de la cuenta | La firma `PaginateAsync` sobre `IQueryable`, el `record` C# | `data-pagination.md` |
| `ef-core-writes.md` | ~70% | Cargar, cambiar y guardar, sin escribir columnas que nadie tocó. No cargar lo que no se usa. Un guardado al final, atómico. Transacción explícita solo para dos escrituras inevitables, con comentario. Sin catch que solo hace rollback y relanza, y sin commit por paso. Chequear antes de guardar y nunca atrapar el guardado. La carrera va al handler global | `Add`/`Update`/`Remove`, `SaveChangesAsync`, `await using IDbContextTransaction`, `DbUpdate*Exception` | `data-writes.md` |
| `ef-core-bulk.md` | ~80% | Cuándo usar una sentencia por criterio y cuándo no: se saltea la lógica de la entidad, se pierden los valores previos, la concurrencia va en el predicado. Ejecuta ya, fuera del guardado. El estado en memoria queda viejo. No corre lo que cuelga del guardado. Una tabla por sentencia. **El cascade lo decide la FK desplegada.** Borrados muy grandes por lotes, sin `Skip` creciente | `ExecuteUpdateAsync`/`ExecuteDeleteAsync`, `SetProperty`, interceptores | `data-bulk.md` |
| `ef-core-mappings.md` | ~50% | La configuración de persistencia en un solo lugar por entidad y fuera del tipo de dominio. Clave, requerido, largo citado de la entidad, precisión del dinero, conversiones y borrado explícitos. Sin nombres de columna literales. Cada relación con su FK como propiedad y la opcionalidad en el tipo. Colecciones inicializadas | Un `DbContext` por componente con solo `DbSet`, `ApplyConfigurationsFromAssembly`, `IEntityTypeConfiguration<T>`, sin data annotations | `data-mapping.md` |
| `ef-core-domain.md` | ~40% | Nada del modelo se hace público para el ORM. Entre agregados, FK sin navegación hacia afuera. El value object se guarda sin identidad propia, como parte de la fila del dueño. Cargar el agregado mínimo y el orden del guardarraíl (el número sale de la base) | `PropertyAccessMode.Field`, `ComplexProperty`/`ComplexCollection`, **nunca `OwnsOne`/`OwnsMany`**, `Include` filtrado | `data-mapping.md` (sección propia) |
| `ef-core-migrations.md` | ~75% | Una migración por un cambio concreto. **Se genera con la herramienta, nunca a mano**, ni cuando la herramienta falla. Se quita con la herramienta y lo aplicado se preserva. Editar a mano se avisa antes. Generar no es aplicar. Nombre que dice qué cambió. Leer lo generado: drops y renombres que salen como borrar + agregar. Separar inspección, build y ejecución | `dotnet ef migrations add/remove`, el snapshot, `Database.Migrate()` | `data-migrations.md` |
| `ef-core-indexes.md` | ~90% | Toda la referencia: la consulta decide el índice. Cuándo una columna se lo gana. En un compuesto, el orden. Índice único con pre-chequeo y el mismo alcance. Índice filtrado para unicidad condicional. Lo que cuesta. Verificar la carrera con dos conexiones contra el motor real | `AnyAsync`, que EF indexa las FK por convención | `data-indexes.md` |

### `nzt-build-csharp`: el router tiene reglas de código para cualquier lenguaje

| Referencia | Genérico | Qué es genérico | Queda en C# | Destino |
|---|---|---|---|---|
| Router `SKILL.md` | ~50% | **El código en inglés con los nombres del glosario**, y el texto que lee el usuario en el idioma de la historia. Un tipo principal por archivo con su nombre. Carpeta con nombre distinto al del tipo. Miembros agrupados y en orden, y "agregar un miembro no es pegarlo al final". Async sin fire-and-forget, sin bloquear y con la cancelación pasada hasta abajo. Sin if/else anidados: guard clauses. Sin strings ni números mágicos. Sin forzar un nulo. Reflection solo como excepción, y se pregunta | File-scoped namespace, `sealed`, sin primary constructor, sin `var`, usings explícitos e `ImplicitUsings`, `!`, `async void`, `.Result`, `record` no posicional | `code.md` |
| `dtos.md` | ~70% | Un DTO por operación y nunca compartido, salvo el de página. Request/response en el nombre, que dice para qué es. El DTO hijo es del padre y no se comparte aunque coincidan los campos. Un mapper por entidad, nunca copiado. El mapper transforma y no decide | `record` con `get; set;`, clases anidadas, `static class` de extensión, `To<DtoName>` | `dtos.md` |
| `linq.md` | ~55% | Recorrer una vez. Filtrar primero y materializar al final. Nunca mover un filtro a través de una paginación o agrupación. Un lookup en vez de una búsqueda dentro de un loop. El operador según la intención (máximo por clave, uno solo, distinto). Nunca devolver null en lugar de una colección vacía | Method syntax, `Count` vs `Any()`, `OfType<T>`, `MaxBy`, solo .NET base | `collections.md` |

### Blazor: la arquitectura, componentes y formularios son genéricos; los render modes no

| Referencia | Genérico | Qué es genérico | Queda en Blazor | Destino |
|---|---|---|---|---|
| Router `SKILL.md` | ~30% | "Tres confusiones": dónde corre contra si hubo una pasada en el servidor; **ocultar no es proteger**; **una pantalla nunca habla con la red, solo a través de su cliente tipado**. Primero el design system y la librería de componentes adoptada | Ejes, render modes, `AuthorizeView`, `HttpClient` | `frontend-components.md` |
| `architecture-vertical-slice.md` | ~70% | La unidad es la feature. Árbol de roles (Features/<Plural>/ con página y cliente, Components/ compartidos, State/, Results/). Ninguna feature entra en otra, duplicar es barato. **Un cliente tipado por feature, con sus DTOs.** Registro explícito en el punto de entrada | Uno o dos proyectos según el render mode, `.Client`, `wwwroot`, `_Imports` | `frontend-architecture-vertical-slice.md` |
| `components.md` | ~55% | Parámetros que entran y eventos que salen; nunca mutar lo recibido; clave estable en listas. El dueño del estado es quien lo cambia. Cargar según parámetro, ignorar una respuesta superada. Las suscripciones se liberan. Nada bloquea y la cancelación es del componente. **Cliente tipado con la misma forma de resultado que el backend**, sin excepciones para lo esperado. Error esperado, cancelación y timeout son distintos. **Los tres estados: cargando, vacío y error.** Lo que un componente nunca hace | Ciclo de vida Blazor, `@inject`/`[Inject]`, `EventCallback`, `@key`, `InvokeAsync`, interop JS, `_Imports.razor` | `frontend-components.md` |
| `forms.md` | ~60% | El formulario tiene su propio modelo y nunca edita la respuesta de la API. Label y error por campo. **Acá se valida la forma y en el backend las reglas.** El validador del proyecto no se reemplaza. **Un envío no corre dos veces** y la UI se restaura en éxito y en falla. La protección CSRF nunca se apaga | `EditForm`, `Model`/`EditContext`, SSR estático (`FormName`, `[SupplyParameterFromForm]`), `AddValidation` de .NET 10 | `frontend-forms.md` |
| `performance.md` | ~45% | Medir antes y después; la mayoría de los componentes nunca lo necesitan. Pasar el id y no el objeto entero. Lista grande: paginar o virtualizar según evidencia, con un proveedor que respeta inicio, cantidad, token y total. Eventos de alta frecuencia con throttle; búsquedas con debounce, cancelación y sin respuesta vieja | `ShouldRender`, `Virtualize`, `RenderFragment`, `IsFixed`, splatting, `IHandleEvent` | `frontend-performance.md` |
| `render-server/webassembly/auto/static.md` | ~20% | **Todo lo que llega al navegador es público** y el backend revalida todo. En un render en el servidor, el estado de cada usuario nunca va en un singleton. El búfer de búsqueda espera a que se termine de tipear. Una página que solo muestra no necesita ser interactiva | Casi todo: circuitos, runtime, `@rendermode`, `RendererInfo`, persistencia de .NET 10 | `frontend-rendering.md` |
| `prerendering.md` | ~40% | Si la página se renderiza en el servidor y después en el navegador: **la inicialización puede correr dos veces o una**, sin efectos ahí, lo leído en el servidor no se vuelve a pedir, y lo que cruza al navegador lo puede leer el usuario | `[PersistentState]`, `RegisterPersistentService`, `[StreamRendering]` | `frontend-rendering.md` |

### Lo que encontré en esta parte

1. **EF es la parte más grande para extraer.** Índices, migraciones, bulk y paginación son
   prácticas de base de datos, no de EF. Un proyecto Node con Prisma o uno Go con sqlc reciben
   hoy cero guía de acceso a datos.
2. **`nzt-build-csharp` mezcla reglas de C# con reglas de código.** La del idioma inglés con el
   glosario no tiene nada de C#, y hoy un proyecto TS no la recibe.
3. **Los render modes casi no se extraen.** Lo genérico que tienen (lo público en el navegador,
   el doble render) entra en una sola referencia.

### Total propuesto: 30 referencias genéricas en `nzt-build/references/`

- **Backend (14):** las de la sección anterior.
- **Datos (8):** `data-access`, `data-queries`, `data-pagination`, `data-writes`,
  `data-bulk`, `data-mapping`, `data-migrations`, `data-indexes`.
- **Código (3):** `code`, `dtos`, `collections`.
- **Frontend (5):** `frontend-architecture-vertical-slice`, `frontend-components`,
  `frontend-forms`, `frontend-rendering`, `frontend-performance`.

## Decisiones abiertas para la unidad 43

| # | Pregunta | Opciones | Recomendación |
|---|---|---|---|
| A | ¿Dónde viven las arquitecturas genéricas? | (a) `nzt-build/references/`, junto a las demás; (b) `nzt-architecture/references/`, porque esa fase decide la estructura | **Decidido por el usuario 2026-10-09: (a), en `nzt-build`.** |
| B | Cómo dice la capa genérica dónde se impone el límite entre capas | (a) principio solo: "el límite más fuerte que ofrezca el stack, registrado en el documento de stack"; (b) nombrar el mecanismo de cada lenguaje | **Decidido por el usuario 2026-10-10: (a).** Los proyectos de la solution (clean/hexagonal) y el `.csproj` único (vertical slice) se quedan en las referencias .NET, que siguen existiendo pero más chicas. El script de no-pérdida controla que esas reglas no se pierdan |
| C | Lo genérico que sale de `testing.md` | (a) a `tests.md`; (b) a una referencia nueva | **Decidido por el usuario 2026-10-10: (a).** Leí `tests.md` (186 líneas) y ya tiene casi todo: motor real, reloj inyectado, particiones parametrizadas, un nivel apagado no se finge. Faltan unas pocas reglas: el proyecto unitario sin base ni host, chequear la licencia antes de sumar una librería de aserciones, y mutation testing en módulos críticos |
| D | Cómo se prueba que no se perdió nada | Script: cada línea que sale de una referencia .NET aparece en su genérica, o queda listada para revisarla a mano | Va en la 43. `check-references.sh` hoy compara contra `main`, y las hojas ya no existen ahí: el recorte necesita su propio chequeo |
| E | Cómo se nombran las 30 referencias en una sola carpeta | (a) prefijo por grupo: `backend-`, `data-`, `code-`, `frontend-` (`backend-use-cases.md`, `code-dtos.md`); (b) sin prefijo, como en la sección de backend | **Decidido por el usuario 2026-10-10: (a), prefijo por grupo.** Los nombres de la sección de backend pasan a llevar `backend-` |
| F | Dónde está la tabla que elige las referencias genéricas cuando no hay router de área | (a) en `nzt-build/SKILL.md`; (b) en una referencia índice, `references/practices.md`, con los mismos ejes que el router .NET (arquitectura, dominio, persistencia, resultado al transporte) más las filas por tarea, que `nzt-build` nombra en una fila | **Decidido por el usuario 2026-10-10: dos índices, uno de backend y uno de frontend**: `references/practices-backend.md` (backend + datos) y `references/practices-frontend.md` (frontend). Las de código (`code-*`) aplican a los dos y las nombran ambos. `nzt-build/SKILL.md` suma dos filas, no 30. Los routers .NET y Blazor no pasan por los índices |

## Fuera de alcance, anotado para después

- **Bulk en .NET (observación del usuario, 2026-10-10).** EF Core, sin paquetes, solo trae
  `ExecuteUpdateAsync` y `ExecuteDeleteAsync` como operaciones por criterio. No tiene bulk
  insert: `AddRange` no es una inserción masiva, y la referencia actual
  `ef-core-writes.md` ya lo dice. Las operaciones masivas que faltan (inserción y otras) son
  referencias .NET para construir más adelante. **Sin verificar contra la doc de EF Core.**
  Antes de diseñar esas referencias, eso se confirma en la fuente (nzt-research). Para
  esta rama, `data-bulk.md` cubre solo lo que hoy cubre `ef-core-bulk.md`: update y delete
  por criterio.
