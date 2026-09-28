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

**2. Los routers.** Uno por fase. No hacen el trabajo: leen el pedido y dicen qué hoja
cargar.

**3. Las hojas.** Una skill, un trabajo, ≤ 200 líneas. Sólo se carga la que la tarea pide.

```
pedido → kernel (tabla de ruteo) → router de fase → la hoja que corresponde
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

Cada línea baja el instalador a una carpeta temporal, verifica su SHA256, instala NZT en ese
proveedor —el bloque en `CLAUDE.md` o `AGENTS.md` y las skills— y lo borra. **Para
actualizar, la misma línea de nuevo.** Para desinstalar, la misma línea con
`$env:NZT_UNINSTALL='1'; irm … | iex` en Windows o `curl … | NZT_UNINSTALL=1 sh` en el resto.

Desde el repo, con .NET 10, está el instalador completo:

```bash
dotnet run --project installer/src/Nzt.Cli
```

El menú tiene cuatro acciones —**instalar, desinstalar, verificar el contenido y ver
estado**—, te deja elegir Claude Code, Codex o los dos, y **te muestra la simulación y recién
ahí pregunta**. Instala un bloque delimitado en el archivo de instrucciones —respetando lo
que ya tengas, con backup— y las skills en la carpeta de usuario del proveedor.

```bash
dotnet run --project installer/src/Nzt.Cli -- status
dotnet run --project installer/src/Nzt.Cli -- uninstall --provider claude-code
```

**No es un plugin.** Son skills sueltas y un bloque de texto: nada que tengas que aprender a
manejar, y nada que dependa de un mecanismo que Codex no tiene. El detalle está en
[`installer/README.md`](installer/README.md).

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
specs/       nzt-core.md — la spec fundacional, y la del instalador
installer/   el CLI que instala, con sus comprobaciones
evals/       la suite que mide si dispara la skill correcta
install/     build.sh / build.ps1 — el loop de desarrollo; install.ps1 / install.sh / variants.sh — los comandos de una línea
```

**110 skills.** El estado exacto de la construcción, las decisiones tomadas y lo que queda
abierto están en la sección 14 de [`specs/nzt-core.md`](specs/nzt-core.md), que es el punto
de retomada: si volvés al proyecto después de un tiempo, se empieza por ahí.
