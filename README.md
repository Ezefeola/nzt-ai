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
| Arranca y no para hasta que algo se rompe | Corta en unidades revisables y **frena a esperarte** al final de cada una |
| Se le termina el contexto y perdiste el hilo | El plan y el estado viven en `Plan/state.json`: se retoma sin volver a explicar |
| Elige el patrón que le gusta hoy, distinto del de ayer | El documento de stack decide, y **una carpeta instalada no es una autorización** |
| Te dice que funciona | Reporta lo que pasó: el test que falló, el paso que salteó, la suposición que hizo |

Lo que ganás no es que escriba mejor código: es que **puedas revisar lo que hizo, retomar
donde quedaste y no descubrir a lo último que entendió otra cosa.**

## Cómo funciona

Tres capas, y la de arriba está siempre cargada.

**1. El kernel** (~180 líneas) se instala en el archivo que tu proveedor lee en toda sesión
—`~/.claude/CLAUDE.md` o `~/.codex/AGENTS.md`—. Trae el bucle, los frenos, el formato del
estado y **la tabla de ruteo**. Eso último es la decisión de diseño más importante del set:
qué skill cargar está *instruido en una tabla*, no librado a que el modelo adivine por la
descripción.

**2. Los routers.** Son las skills: uno por fase, uno por tecnología, más el de entrada
(`nzt`) y el de investigación (`nzt-research`). No hacen el trabajo:
leen el pedido y el documento de stack, y dicen qué referencia leer.

**3. Las referencias.** Un archivo por trabajo, de hasta 200 líneas, en la carpeta
`references/` de su router. Se lee solo la que la tarea pide, y **no ocupa lugar en el
listado de skills**, que el proveedor carga en toda sesión: el set entero son 14 entradas.

```
pedido → kernel (tabla de ruteo) → router → la referencia que corresponde
```

El bucle que impone el kernel es siempre el mismo: **entender → proponer → ejecutar por
unidades → verificar → registrar**, escalado al pedido. Un cambio de una línea no dispara el
método completo; eso está escrito en el kernel y es lo que hace que se banque el uso diario.

### Las fases

| Fase | De qué se ocupa |
|---|---|
| `nzt-discovery` | Qué hay que construir: requisitos, reglas de negocio, specs, historias, y el cambio a una feature que ya existe |
| `nzt-architecture` | Cómo se resuelve: componentes, stack, modelo de dominio, diseño técnico, ADR y RFC, diagramas |
| `nzt-ux` | Pantallas, flujos, sistema de diseño, revisión de usabilidad, y **el manual del usuario final**: HTML interactivo, ordenado por lo que la persona vino a hacer |
| `nzt-build` | El código, y los tests que viajan con él |
| `nzt-verify` | Diseñar y correr pruebas —API o pantalla, y lo dice antes de correr—, **crear los datos que faltan y borrarlos después**, medir la performance que espera el usuario, registrar la evidencia, y leer código o documentos buscando lo que no cierra |
| `nzt-ship` | Versionado, CI/CD, despliegue, observabilidad |
| `nzt-learn` | **Enseñarte a vos** en lugar de hacerlo por vos |

`nzt-learn` es el segundo modo del set: currícula, lecciones, ejercicios con su solución
aparte, evaluación y repasos espaciados. Se dispara cuando pedís aprender, no cuando pedís
que se haga.

### La capa de stack

Arriba de eso hay skills específicas de tecnología —.NET 10 y Blazor hoy— con las
convenciones concretas: EF Core, minimal APIs, modelo de dominio, modos de render,
contenedores, migraciones. **Se instalan siempre y se aplican sólo si el documento de stack
del componente las eligió.** En un proyecto que no es .NET no se cargan, y en un repositorio
con convenciones propias las de NZT se corren a un costado y la diferencia se reporta en vez
de aplicarse.

Debajo hay una **capa genérica**: el principio de cada práctica —arquitecturas, modelo de
dominio, persistencia, acceso a datos, API, seguridad, reglas de código, componentes,
formularios, rendering, performance— escrito sin nombrar ninguna tecnología. Un stack sin
skills propias (Node, Go, React…) la recibe entera; .NET y Blazor la leen primero y después
leen cómo se hace en su tecnología, así que **cada regla vive en un solo lugar**.

Los **ejes del stack** —arquitectura, modelo de dominio, persistencia y los propios de cada
tecnología— se preguntan una vez, con sus opciones y lo que cuesta cada una, con la
herramienta de preguntas del proveedor cuando la sesión la ofrece.

## Instalación

Global, para toda la máquina, con **una línea por proveedor**. No hace falta clonar el repo
ni tener .NET, y no queda ningún instalador en tu PC: queda NZT en Claude Code o en Codex.

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
proveedor —el bloque en `CLAUDE.md` o `AGENTS.md` y las skills, y los mods si es la línea
`install-claude-full`— y lo borra. **Para actualizar, la misma línea de nuevo.** Para desinstalar, la misma línea con
`$env:NZT_UNINSTALL='1'; irm … | iex` en Windows o `curl … | NZT_UNINSTALL=1 sh` en el resto.

Desde el repo, con .NET 10, está el instalador completo:

```bash
dotnet run --project installer/src/Nzt.Cli
```

El menú tiene cuatro acciones —**instalar, desinstalar, verificar el contenido y ver
estado**—, te deja elegir Claude Code, Codex o los dos —y en Claude Code, todo NZT, solo el
método o solo los mods—, y **te muestra la simulación y recién
ahí pregunta**. Instala un bloque delimitado en el archivo de instrucciones —respetando lo
que ya tengas, con backup— y las skills en la carpeta de usuario del proveedor.

```bash
dotnet run --project installer/src/Nzt.Cli -- status
dotnet run --project installer/src/Nzt.Cli -- uninstall --provider claude-code
```

**No es un plugin.** Son skills sueltas y un bloque de texto: nada que tengas que aprender a
manejar, y el mismo NZT en cada proveedor: ningún sistema de plugins carga el kernel igual
en todos. El detalle está en
[`installer/README.md`](installer/README.md).

## Mods

NZT trae **mods**: extensiones de la interfaz de Claude Code que hacen visible lo que el
método produce. **Son opcionales**: instalar NZT no instala ninguno y el método funciona
completo sin ellos. Existen solo para Claude Code, porque Codex no tiene mods.

| Mod | Qué hace | Instalación |
|---|---|---|
| [`nzt-state`](mods/nzt-state/README.md) | Panel lateral con el plan y el estado de la corrida, leído de `Plan/state.json` y actualizado en vivo | `/plugin install nzt-state --marketplace Ezefeola/nzt-ai` |
| [`nzt-context`](mods/nzt-context/README.md) | Barra del contexto consumido encima del prompt, con las marcas 20/30/40 del kernel; le pasa la misma cifra al agente | `/plugin install nzt-context --marketplace Ezefeola/nzt-ai` |
| [`nzt-changes`](mods/nzt-changes/README.md) | Panel lateral al estilo Replay Theater: recorre, un diff por vez, lo que Claude editó en el último turno o todo lo cambiado contra `HEAD` | `/plugin install nzt-changes --marketplace Ezefeola/nzt-ai` |
| [`nzt-files`](mods/nzt-files/README.md) | Panel lateral que recorre el proyecto como el explorador de VS Code: carpetas que se abren y cierran, marcas de git y el archivo elegido debajo, solo para leer | `/plugin install nzt-files --marketplace Ezefeola/nzt-ai` |
| [`nzt-hub`](mods/nzt-hub/README.md) | Panel lateral que junta los mods de NZT: para qué es cada uno, su versión, un botón que lo abre y, para los que faltan, uno que copia el comando para instalarlos | `/plugin install nzt-hub --marketplace Ezefeola/nzt-ai` |

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
- **No usa agentes, subagentes ni MCP.** Una conversación, un contexto, limpio porque frena
  en los bordes de cada unidad.
- **No garantiza que el modelo elija siempre la skill correcta.** Por eso el ruteo está
  instruido y por eso hay una suite de evals que lo mide.
- **No decide por vos.** Prescribe el procedimiento, no el criterio técnico: NZT dice *cómo
  trabajar*, vos y el modelo deciden *qué construir*.

## El repositorio

```
core/        kernel.md + un adapter por proveedor
skills/      el árbol de skills (anidado acá, plano al instalarse)
specs/       nzt-core.md — la spec fundacional, la del instalador, la de los mods y mods/ con una por mod
mods/        los mods de Claude Code, uno por carpeta (opcionales)
installer/   el CLI que instala, con sus comprobaciones
evals/       la suite que mide si dispara la skill correcta
install/     build.sh / build.ps1 — el loop de desarrollo; install.ps1 / install.sh / variants.sh — los comandos de una línea
```

**14 skills y 131 referencias**, 30 de ellas de la capa genérica. El plan en curso y dónde
quedó están en [`Plan/state.json`](Plan/state.json); las decisiones tomadas y su historia, en
[`specs/nzt-core.md`](specs/nzt-core.md) —la sección 14 abre con el estado actual—. Si
volvés al proyecto después de un tiempo, se empieza por esos dos.

## Licencia

[MIT](LICENSE).
