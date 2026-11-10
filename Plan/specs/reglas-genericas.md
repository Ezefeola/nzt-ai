# Reglas de código genéricas, sin references por tecnología

Planteado por el usuario el 2026-11-10, al revisar la séptima prueba de `nzt-method`
(`nzt-method/design/Trabajo-por-etapas.md` → *Séptima prueba real*). **Nada decidido:** es un
análisis y un plan para atacar cuando toque, en su rama. Cuando el usuario decida, pasa a
`Plan/specs/nzt-core/decisions.md` como D-NN.

## Qué quiere el usuario

- Que `nzt-software:software` tenga **solo las reglas genéricas de código** (cómo se organiza,
  cómo nos gusta que se escriba) y no references por tecnología (`dotnet/`, `csharp/`,
  `blazor/`), para no tener que escribir un juego de reglas por cada stack.
- **Sin perder lo que anda hoy:** el código en .NET sale "tal cual lo quiero". La pregunta es
  si con reglas genéricas saldría igual.
- **Que se sigan preguntando los patrones**, como hoy en `nzt-architecture`: repositorio o
  acceso directo, la arquitectura, el modelo de dominio, etc. (`software/references/choosing.md`).
- Le gustó que, con *Clean architecture* y .NET, se preguntara si las capas iban en carpetas o
  en proyectos separados.

## Lo que hay hoy

`software/SKILL.md` ya separa dos capas: cada fila lee primero el archivo genérico (`code/`,
`backend/`, `frontend/`, `ddd/`) y después el de la tecnología (`csharp/`, `dotnet/`, `blazor/`).
Unas 2.900 líneas en total; las de tecnología son unas 1.300.

Lo que traen los archivos de tecnología es de tres clases (clasificación inicial, a confirmar
archivo por archivo):

| Clase | Ejemplos | ¿Se puede volver genérico? |
|---|---|---|
| **A · Gusto del usuario escrito en la sintaxis del lenguaje** | `csharp/rules.md`: nunca constructor primario, nunca `var`, `sealed` por defecto, sin `global using`; `dotnet/api.md`: atributo de binding en cada parámetro; `dotnet/architecture-clean.md`: un proyecto por capa, `AddApplication()`/`AddInfrastructure()` | **Sí, casi todo**, como principio: "tipos siempre explícitos donde el lenguaje deja inferirlos", "las dependencias son campos privados de solo lectura, puestos en un constructor explícito", "cerrado a la herencia por defecto", "cada capa con el límite más fuerte que ofrezca la tecnología" (este último ya está en `backend/architecture-clean.md`). Riesgo: el modelo lo traduce distinto en cada lenguaje |
| **B · Forma exacta para copiar** | `dotnet/results-pattern.md` ("Write these types exactly like this"), `dotnet/persistence-repositories.md` (`IUnitOfWork` con los repositorios y un `SaveChangesAsync`), `dotnet/use-cases.md` (`ExecuteAsync` → `Result<T>`), `dotnet/exceptions.md` (el handler global) | **En parte.** El genérico ya describe la forma (`backend/results.md` *The shape*); sin el código exacto saldría parecido pero no idéntico (nombres, `record` en vez de clase, etc.). Opción: el genérico describe la forma con nombres fijos, y el ejemplo de código queda como **un solo ejemplo** dentro del genérico, marcado como ilustración |
| **C · Saber de la plataforma** | `blazor/components.md` (ciclo de vida, `InvokeAsync`), `blazor/render-*.md`, `dotnet/ef-core-*.md` (tracking, bulk, migraciones), `dotnet/ship-*.md` | **Probablemente sobra:** el modelo lo sabe, y lo que no, lo da la documentación oficial por la herramienta del proyecto (`Docs/agent-tools.md`, D96). Lo que haya de gusto adentro (p. ej. "nunca `StateHasChanged` en `Dispose`") pasa a la clase A |

Las preguntas de patrones ya son casi genéricas: `choosing.md` tiene *Architecture*, *Domain
model* y *Persistence* sin tecnología; solo *Endpoints*, *Result to HTTP*, *ORM*, *Render
mode* y *Component organisation* están atados a `dotnet` o `blazor`, y se pueden escribir
genéricos ("cómo expone la entrada las operaciones: una función por operación o una clase
por recurso", "cómo llega un resultado al transporte", "dónde corre la pantalla").

## Evidencia de la séptima prueba de `nzt-method`

`nzt-method` (sin ninguna regla de código del usuario) construyó en .NET una app con Clean
architecture. Contra las reglas de `nzt-software`, salió:

- constructores primarios (`TaskService(ITaskRepository repository, IClock clock)`) → contra
  `csharp/rules.md` regla 3;
- `var` en todo el código → regla 4;
- errores esperados como excepción (`TaskValidationException` → 400) → contra
  `backend/results.md` ("Never: an exception for an expected failure");
- un servicio con todas las operaciones en vez de un caso de uso por operación → contra
  `backend/use-cases.md`;
- repositorio sin unidad de trabajo, `AddAsync` que guarda → contra
  `backend/persistence-repositories.md`.

Conclusión: **sin reglas, no sale como le gusta al usuario.** Lo que no se sabe todavía es si
alcanza con las genéricas. Casi todo lo que falló arriba ya está en un archivo genérico
(`backend/`) salvo los dos de `csharp/rules.md`, que serían clase A.

## Plan propuesto (para cuando se ataque)

1. **Clasificar** cada archivo de `csharp/`, `dotnet/` y `blazor/` regla por regla en A, B o
   C (una tabla en este archivo).
2. **Subir las A** a su genérico (`code/code.md`, `backend/…`, `frontend/…`) como principio
   sin sintaxis, y **las B** como forma con nombres fijos más un ejemplo de ilustración.
3. **Volver genéricos los ejes de `choosing.md`** atados a una tecnología, sin perder ninguna
   pregunta. Sumar el eje "con qué fuerza se separan las capas" (proyectos o carpetas), que
   hoy está como frase en `backend/architecture-clean.md` y no como pregunta.
4. **Medir antes de borrar nada** con los casos de `nzt-software/evals/stack/` (`entity-shape`,
   `result-inline`, `ef-listado`, `endpoint-axis`, `blazor-render`, `ship-pipeline`,
   `not-dotnet`) y criterios que miren el código emitido contra las reglas del usuario:
   - **A:** con todas las references (hoy);
   - **B:** solo genéricos, con las reglas subidas en el paso 2;
   - **C:** solo genéricos, como están hoy (para ver cuánto aporta el paso 2).
   Además un caso nuevo en otro lenguaje (p. ej. TypeScript) para ver que lo genérico se
   traduce bien fuera de .NET.
5. **Borrar un archivo de tecnología solo si B no pierde criterios** frente a A. Lo que B
   pierda queda, mínimo, en su archivo de tecnología.

## Relación con `nzt-method`

`nzt-method` piensa a `nzt-software` como el futuro paquete de software
(`nzt-method/design/Paquetes.md`). Un paquete con reglas genéricas de código sirve para
cualquier stack, que es lo que el método genérico necesita. Decidido el 2026-11-10: los ejes
de patrones (proyectos o carpetas, servicio o clase por operación, excepción o resultado,
repositorio o directo) son de software y **no van en `nzt-method`**, que solo dice que un
patrón que el resultado repite es una elección y se pregunta. La lista de ejes, sus valores y
su costo es de este paquete (`choosing.md`), incluido el eje nuevo "con qué fuerza se separan
las capas" del paso 3 del plan.
