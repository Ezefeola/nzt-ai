# NZT

**Un método de trabajo para agentes de código.** No le agrega conocimiento al modelo ni se
lo limita: le da forma —método, memoria y frenos— para que rinda parejo en vez de a los
saltos.

El nombre viene de *Limitless*, una película en la que NZT es una pastilla ficticia que le
permite al protagonista aprovechar al máximo sus capacidades mentales.

En *Limitless*, la pastilla no le enseña nada nuevo a Eddie: le da acceso ordenado a lo que
ya sabe. Eso es NZT para Claude Code y Codex. **El agente sigue siendo el agente; NZT es la
disciplina.** Y las consecuencias malas de la película venían de tomarla sin estructura, así
que acá la estructura es el producto: puntos de freno, estado persistido y revisión humana.

## Para qué sirve

Un agente sin método es rapidísimo haciendo lo que no le pediste. Los cinco problemas que
NZT existe para evitar:

| Sin NZT | Con NZT |
|---|---|
| Escribe código antes de que nadie haya definido qué tiene que hacer | Primero el análisis funcional, y lo que no está definido **es una pregunta, no una suposición** |
| Arranca y no para hasta que algo se rompe | Corta en unidades revisables y **frena a esperarte** al final de cada una; si querés avanzar, le das una tanda cerrada (N unidades, o hasta un hito) y frena igual pasado el 40% de contexto |
| Se le termina el contexto y perdiste el hilo | El plan y el estado viven en `Plan/state.json`: se retoma sin volver a explicar |
| Elige el patrón que le gusta hoy, distinto del de ayer | El documento técnico (`Docs/Architecture/tech.md`) decide, y **solo aplica lo que ese documento declara** |
| Te dice que funciona | Reporta lo que pasó: el test que falló, el paso que salteó, la suposición que hizo |

Lo que ganás no es que escriba mejor código: es que **puedas revisar lo que hizo, retomar
donde quedaste y no descubrir a lo último que entendió otra cosa.**

## Cómo funciona

Tres capas, la de arriba siempre cargada, y las reglas de software que el proyecto declara.

**1. El kernel** (~115 líneas) va dentro de la skill `nzt`, que el proveedor carga primero en
toda sesión: no se escribe nada en tu `CLAUDE.md` ni en tu `AGENTS.md`, igual con el plugin
que con la línea de instalación. Trae el bucle, los frenos, el formato del
estado y **la tabla de ruteo**. Eso último es la decisión de diseño más importante del set:
qué skill cargar está *instruido en una tabla*, no librado a que el modelo adivine por la
descripción.

**2. Los routers.** Son las skills: uno por fase, más el de entrada
(`nzt`), el de investigación (`nzt-research`) y el de delegar en un subagente —lecturas, o
unidades que el plan aprobado marcó en paralelo— (`nzt-delegate`) y, sólo cuando lo pedís, el de
retro (`nzt-retro`): revisa la sesión y deja propuestas de mejora en un md fuera del repo, sin
cambiar nada. No hacen el trabajo:
leen el pedido y el documento técnico, y dicen qué referencia leer.

**3. Las referencias.** Un archivo por trabajo, de hasta 200 líneas, en la carpeta
`references/` de su router. Se lee solo la que la tarea pide, y **no ocupa lugar en el
listado de skills**, que el proveedor carga en toda sesión: el set global son 12 entradas.

```
pedido → kernel (tabla de ruteo) → router → la referencia que corresponde
                                         ↘ lo que tech.md declara → su referencia de nzt-software
```

El bucle que impone el kernel es siempre el mismo: **entender → proponer → ejecutar por
unidades → verificar → registrar**, escalado al pedido en tres tamaños: **directo** (un bug,
un cambio chico: sin plan ni estado), **estándar** (una mejora o una feature de una o dos
historias: un plan corto, aprobado una vez) y **completo** (un producto, una feature grande:
por tramos de una a tres historias). Eso es lo que hace que se banque el uso diario.

### Las fases

| Fase | De qué se ocupa |
|---|---|
| `nzt-discovery` | Qué hay que construir: requisitos, reglas de negocio, specs, historias, y el cambio a una feature que ya existe |
| `nzt-architecture` | Cómo se resuelve: componentes, documento técnico, modelo de dominio, diseño técnico, ADR y RFC, diagramas |
| `nzt-design` | Pantallas, flujos, sistema de diseño, revisión de usabilidad, y **el manual del usuario final**: HTML interactivo, ordenado por lo que la persona vino a hacer |
| `nzt-build` | El código, y los tests que viajan con él |
| `nzt-verify` | Diseñar y correr pruebas —API o pantalla, y lo dice antes de correr—, **crear los datos que faltan y borrarlos después**, medir la performance que espera el usuario, registrar la evidencia, y leer código o documentos buscando lo que no cierra |
| `nzt-ship` | Versionado, CI/CD, despliegue, observabilidad |
| `nzt-learn` | **Enseñarte a vos** en lugar de hacerlo por vos |

`nzt-learn` es el segundo modo del set: currícula, lecciones, ejercicios con su solución
aparte, evaluación y repasos espaciados. Se dispara cuando pedís aprender, no cuando pedís
que se haga.

### Las reglas de software y las herramientas del agente

Lo que es de una tecnología, de un estilo de arquitectura o de tus reglas de código vive en la
skill `nzt-software`, que viene con el método:

| Reglas | Traen |
|---|---|
| `code` | tus reglas de código para cualquier lenguaje: nombres, funciones, errores, colecciones, DTOs |
| `backend` | backend sin tecnología: arquitecturas, modelo anémico, persistencia, casos de uso, validación, errores, API, seguridad, acceso a datos |
| `frontend` | frontend sin tecnología: arquitectura, componentes, formularios, rendering, performance |
| `ddd` | agregados, value objects, contextos acotados y sus diagramas |
| `csharp` | C# moderno |
| `dotnet` | .NET: EF Core, minimal APIs o controllers, resultados, tests, contenedores, pipeline, observabilidad |
| `blazor` | Blazor: modos de render, componentes, formularios, prerendering |

`Docs/Architecture/tech.md` es el documento técnico del producto: una sección por componente
con sus áreas, sus tecnologías (lenguaje, runtime, framework), sus decisiones, sus prácticas
—DDD, niveles de test…—, sus dependencias y sus convenciones. Lo escribe `nzt-architecture`, y
los **ejes** —arquitectura, modelo de dominio, persistencia, endpoints, modo de render…— se
preguntan una vez, con lo que cuesta cada opción. **Una regla de `nzt-software` se aplica solo
si `tech.md` declara su tecnología o su práctica**, y en un repositorio con convenciones
propias las de NZT se corren a un costado y la diferencia se reporta en vez de aplicarse.

**El agente te ofrece las herramientas que el trabajo necesita, en cualquier fase**: un MCP, un
plugin o los dos, para leer la documentación de una tecnología, manejar un editor, ver la
pantalla. NZT no trae una lista: las busca en las fuentes oficiales y te dice de dónde las sacó
y con qué fecha, qué instalan, a qué acceden, lo que tenés que hacer vos a mano y lo que él no
puede hacer. Con tu sí las instala **en el proyecto**, nunca global, comprueba que respondan y
las anota en `Docs/agent-tools.md`. Una que rechazás no te la vuelve a ofrecer.

## Instalación

### Plugin para Claude Code

En Claude Code, agregá el marketplace e instalá el método:

```text
/plugin marketplace add Ezefeola/nzt-ai
/plugin install nzt-software@nzt
```

Abrí una sesión nueva. El plugin incluye los subagentes y las reglas de software. Dentro del
plugin las skills van sin el prefijo `nzt-`: `/nzt-software:nzt`, `/nzt-software:build`,
`/nzt-software:verify`. Elegí una sola vía para el método. Si venís del instalador y querés pasar
al plugin, quitá primero el método con `nzt-ai uninstall --provider claude-code --mods none`.

Si tenés el plugin `nzt` de la v5, desinstalalo antes de instalar `nzt-software`, para que el
kernel no llegue dos veces:

```text
/plugin uninstall nzt@nzt
```

### Instalador para Claude Code y Codex

Para actualizar desde v4, repetí la línea de tu proveedor. El instalador retira el bloque
que administraba en tu archivo de instrucciones y conserva tu texto. El método ahora vive
en la skill `nzt`, y el chequeo de estado se ejecuta desde los scripts de `nzt-plan`.

**Claude Code**

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.ps1 | iex"
```

```bash
# macOS y Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.sh | sh
```

**Codex**

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.ps1 | iex"
```

```bash
# macOS y Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.sh | sh
```

**Claude Code con los mods** — el método y los [mods](#mods), sin preguntar nada

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.ps1 | iex"
```

```bash
# macOS y Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.sh | sh
```

Cada línea baja el instalador a una carpeta temporal, verifica su SHA256, instala NZT en ese
proveedor —las skills, con el kernel dentro de `nzt`, y los mods si es la línea
`install-claude-full`; si una versión anterior dejó un bloque en `CLAUDE.md` o `AGENTS.md`,
lo quita y deja tu texto—, deja una copia como `nzt-ai` (en `%LOCALAPPDATA%\nzt\bin`, que entra
al PATH del usuario, o en `~/.local/bin`) y borra la carpeta temporal. **Para actualizar, la misma línea de nuevo.** Para desinstalar, la misma línea con
`$env:NZT_UNINSTALL='1'; irm … | iex` en Windows o `curl … | NZT_UNINSTALL=1 sh` en el resto.

Desde el repo, con .NET 10, está el instalador completo:

```bash
dotnet run --project installer/src/Nzt.Cli
```

El menú tiene cuatro acciones —**instalar, desinstalar, verificar el contenido y ver
estado**—, te deja elegir Claude Code, Codex o los dos —y en Claude Code, todo NZT, solo el
método o solo los mods—, y **te muestra la simulación y recién
ahí pregunta**. Instala las skills y los subagentes en las carpetas de usuario del proveedor.

```bash
dotnet run --project installer/src/Nzt.Cli -- status
dotnet run --project installer/src/Nzt.Cli -- uninstall --provider claude-code
```

Más detalles en
[`installer/README.md`](installer/README.md).

## Mods

NZT trae **mods**: extensiones de la interfaz de Claude Code que hacen visible lo que el
método produce. **Son opcionales**: instalar NZT no instala ninguno y el método funciona
completo sin ellos. Existen solo para Claude Code, porque Codex no tiene mods.

Los **genéricos** sirven en cualquier proyecto, use NZT o no; los de tipo **NZT** necesitan un
artefacto del método para mostrar algo.

| Mod | Tipo | Qué hace | Instalación |
|---|---|---|---|
| [`nzt-state`](mods/nzt-state/README.md) | NZT: necesita `Plan/state.json` | Panel lateral con el plan y el estado de la corrida, leído de `Plan/state.json` y actualizado en vivo | `/plugin install nzt-state --marketplace Ezefeola/nzt-ai` |
| [`nzt-changes`](mods/nzt-changes/README.md) | Genérico | Panel lateral al estilo Replay Theater: recorre, un diff por vez, lo que Claude editó en el último turno o todo lo cambiado contra `HEAD` | `/plugin install nzt-changes --marketplace Ezefeola/nzt-ai` |
| [`nzt-files`](mods/nzt-files/README.md) | Genérico | Panel lateral que recorre el proyecto como el explorador de VS Code: carpetas que se abren y cierran, marcas de git, lo que Claude lee y escribe, y el archivo elegido debajo, solo para leer y sin ocupar contexto | `/plugin install nzt-files --marketplace Ezefeola/nzt-ai` |
| [`nzt-look`](mods/nzt-look/README.md) | Genérico, con capa NZT | Temas (NZT y quince más, oscuros y claros), una banda sobre el prompt con el contexto y sus marcas 30/40, los límites del plan, el costo y el modelo con su effort, y la conversación redibujada: herramientas, consola, diffs, tablas, código, fórmulas y diagramas | `/plugin install nzt-look --marketplace Ezefeola/nzt-ai` |

### Instalarlos

- **Con el instalador.** La línea `install-claude-full` instala el método y todos los mods.
  Desde el repo, `dotnet run --project installer/src/Nzt.Cli -- install --provider
  claude-code --mods all` hace lo mismo, `--mods only` instala solo los mods, y el menú
  pregunta qué querés. Necesita el comando `claude` en la terminal, versión 2.1.287 o
  posterior; sin eso instala el método y te dice cómo sumar los mods a mano.
- **A mano, uno por vez.** La línea de la tabla, en una sesión de Claude Code en la terminal.
  La primera vez pregunta si agrega el marketplace: contestá `y` y elegí el scope **user**
  para tenerlo en todos los proyectos.

Las dos formas usan el mismo marketplace `nzt`, que sale de la rama `main` de este repo: un
mod que instalaste a mano el instalador lo actualiza, pero no lo desinstala nunca.

### Actualizarlos

Cada mod tiene su propia versión, independiente de la de NZT, y Claude Code baja una nueva
solo cuando esa versión sube.

- **Automático.** Viene apagado, como en todo marketplace que no es de Anthropic. Se activa
  una vez: `/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**. Desde ahí cada sesión
  nueva baja las versiones nuevas y avisa `Run /reload-plugins` para cargarlas.
- **A mano.** `claude plugin update <mod>@nzt` en la terminal (por ejemplo,
  `claude plugin update nzt-state@nzt`), **Update marketplace** en esa misma pestaña de
  `/plugin`, o volver a correr el instalador, que actualiza todos los mods que haya.

### Desinstalarlos

`claude plugin uninstall <mod>@nzt` quita uno. El instalador, al desinstalar, quita solo los
mods que instaló él (`uninstall --provider claude-code --mods only` deja el método). **No
quites el marketplace `nzt`**: eso desinstala de una vez todos los mods que vinieron de él.

Cómo se arma un mod y qué tiene que traer está en [`specs/nzt-mods.md`](specs/nzt-mods.md).

## Qué no hace

Es tan importante como lo otro:

- **No restringe lo que el modelo sabe** ni lo que puede hacer. Define cómo trabaja.
- **No delega decisiones.** Una conversación que es dueña del plan, el estado y
  cada decisión, y que frena en los bordes de cada unidad. Puede mandar a dos subagentes
  propios: uno lee por ella y el otro hace las unidades que el plan aprobado marcó en
  paralelo. Sin subagentes, o con `delegation` en `off`, todo corre en esta conversación,
  una unidad tras otra. No instala MCP globales: los que te ofrece y aceptás van al archivo de MCP
  del proyecto, que viaja con git.
- **No garantiza que el modelo elija siempre la skill correcta.** Por eso el ruteo está
  instruido y por eso hay una suite de evals que lo mide.
- **No decide por vos.** Prescribe el procedimiento, no el criterio técnico: NZT dice *cómo
  trabajar*, vos y el modelo deciden *qué construir*.

## El repositorio

```
core/        kernel.md + un adapter por proveedor
skills/      las skills globales del marco (anidadas acá, planas al instalarse)
specs/       nzt-core.md — la spec fundacional, la del instalador, la de los mods y mods/ con una por mod
mods/        los mods de Claude Code, uno por carpeta (opcionales)
installer/   el CLI que instala, con sus comprobaciones
evals/       la suite que mide si dispara la skill correcta
install/     build.sh / build.ps1 — el loop de desarrollo; install.ps1 / install.sh / variants.sh — los comandos de una línea
```

**13 skills con 137 referencias**, 76 de ellas en `nzt-software`. El plan en curso y dónde
quedó están en [`Plan/state.json`](Plan/state.json); las decisiones tomadas y su historia, en
[`specs/nzt-core.md`](specs/nzt-core.md) —la sección 14 abre con el estado actual—. Si
volvés al proyecto después de un tiempo, se empieza por esos dos.

## Licencia

[MIT](LICENSE).
