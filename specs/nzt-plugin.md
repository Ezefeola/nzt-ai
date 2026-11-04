# NZT — Plugin

> Estado: **especificado y diseñado** (unidades 462 y 464) · Decisión: D91 · Depende de:
> `specs/nzt-core.md` (C7, C8, D24, D91) y `specs/nzt-installer.md` · Sin aceptar

## Qué resuelve

Hoy NZT en Claude Code se instala con `nzt-ai`, un CLI aparte que hay que bajar y correr.
Quien ya usa plugins en Claude Code no tiene cómo instalar NZT desde `/plugin`, y un plugin
solo no alcanza: un `CLAUDE.md` dentro de un plugin no se carga (C7), y el kernel tiene que
estar siempre cargado. El plugin trae las skills de NZT y una skill de setup que, a pedido
del usuario, escribe el kernel en su `CLAUDE.md`.

## Alcance

**Adentro**
- Instalar NZT en Claude Code desde un marketplace, como plugin.
- `/nzt:setup`: instalar el bloque del kernel, actualizarlo, quitarlo y ver su estado, global o
  en un proyecto.
- Avisar al empezar la sesión cuando el bloque quedó en una versión vieja.
- Que el bloque deje de aplicar, con aviso, cuando faltan las skills del plugin.

**Afuera**
- Codex: `[TO-DEFINE]` hasta probar lo que C8 deja sin verificar —cómo una skill de plugin llega
  a su script y con qué nombre se invoca— contra Codex 0.164.0 (Q-01). Hasta entonces, en Codex
  NZT se instala con `nzt-ai`.
- Reemplazar a `nzt-ai`: sigue siendo la forma común a Claude Code y Codex (D24), y la que
  instala los packs de proyecto (`nzt-ai project`).
- Pasar una instalación de `nzt-ai` al plugin: el setup se frena y dice cómo desinstalar
  (Q-03); el pase lo hace el usuario.
- Los mods: siguen siendo plugins aparte del mismo marketplace (D63).
- Los subagentes `nzt-explorer` y `nzt-worker`: si van en el plugin y con qué nombre lo decide el
  diseño técnico (unidad 464).

## Glosario de esta spec

- **Bloque**: el kernel de NZT y el adaptador de Claude Code, entre los marcadores de NZT,
  dentro de un `CLAUDE.md`. Es lo mismo que escribe `nzt-ai` (sección 4 de
  `specs/nzt-installer.md`).
- **Global**: el bloque en `~/.claude/CLAUDE.md`; NZT aplica en todos los proyectos.
- **De proyecto**: el bloque en el `CLAUDE.md` de la raíz de un proyecto; NZT aplica solo ahí
  y lo recibe quien clone el repo.
- **Versión del bloque**: la versión de NZT con que se escribió; se compara con la del plugin.

## Reglas

### RN-plugin-setup-una-skill · origin: Q-04
Una sola skill, `/nzt:setup`, instala, actualiza y quita el bloque y muestra su estado. No hay
otra skill para desinstalar.

### RN-plugin-setup-a-pedido · origin: Q-05
El bloque se escribe, se actualiza o se quita solo cuando el usuario corre `/nzt:setup`. Ni
el plugin al instalarse o actualizarse ni Claude por su cuenta escriben un `CLAUDE.md`.

### RN-plugin-destino · origin: Q-02, Q-06
Al instalar, el usuario elige global o el proyecto actual. Global escribe en
`~/.claude/CLAUDE.md`; de proyecto, en el `CLAUDE.md` de la raíz del proyecto, que se versiona
con él.

### RN-plugin-mostrar-antes · origin: Q-08
Antes de escribir o quitar, el setup muestra qué archivo toca y qué cambia, y pide
confirmación con *No* como primera opción, sin marcarla como recomendada (QT-108). Sin
confirmación no escribe nada.

### RN-plugin-solo-el-bloque · origin: Q-08
El setup cambia solo lo que está entre los marcadores de NZT. Si el archivo existe sin bloque,
el bloque va arriba y el contenido previo queda igual abajo. No guarda copias: antes de
tocar un archivo que existe avisa que no queda copia y que, si se la quiere, la haga uno
mismo (QT-107).

### RN-plugin-instalador-presente · origin: Q-03
Si NZT ya está instalado con `nzt-ai`, el setup no escribe nada y dice cómo desinstalarlo
(`nzt-ai uninstall --provider claude-code`) antes de volver a correrlo.

### RN-plugin-un-solo-nzt · origin: Q-08
Si ya hay un bloque global y se pide uno de proyecto, o al revés, el setup se frena y dice
dónde está el otro: con los dos, Claude carga el kernel dos veces.

### RN-plugin-aviso-agents · origin: Q-08
Si el proyecto tiene `AGENTS.md` y no tiene `CLAUDE.md`, antes de crearlo el setup avisa que,
desde ese momento, Claude deja de leer el `AGENTS.md` del proyecto salvo que el usuario cambie
la opción *Project instructions*, y pide confirmación aparte.

### RN-plugin-quitar · origin: Q-04, Q-08
Quitar saca el bloque y deja el resto del archivo como estaba. Si el bloque fue editado a
mano, lo muestra y pide confirmación antes de sacarlo.

### RN-plugin-estado · origin: Q-08
El estado dice dónde hay un bloque (global, de este proyecto, o ninguno), su versión, la del
plugin, y si hay una instalación de `nzt-ai`. No escribe nada.

### RN-plugin-aviso-version · origin: Q-05
Al empezar, retomar o compactar una sesión, si la versión del bloque que aplica es distinta de
la del plugin, Claude Code muestra una línea: el bloque quedó en la versión X, la del plugin
es Y, correr `/nzt:setup`. Si son iguales, o no hay bloque, no muestra nada.

### RN-plugin-guarda · origin: Q-07
Si el bloque está cargado y las skills del plugin (`nzt:…`) no están disponibles —el plugin se desinstaló o
se deshabilitó, o un compañero clonó el proyecto sin el plugin—, Claude no aplica NZT, avisa
una vez en la sesión de dónde sacar el bloque o cómo instalar el plugin, y sigue trabajando
sin el método.

### RN-plugin-dos-bloques · origin: Q-09
Si al empezar, retomar o compactar una sesión hay un bloque global y uno del proyecto, Claude
Code muestra una línea con los dos lugares y Claude aplica solo el del proyecto.

### RN-plugin-mismo-kernel · origin: D24
El kernel del bloque dice lo mismo que el que escribe `nzt-ai`. Solo cambia el adaptador de
Claude Code: dice que las skills se cargan como `nzt:<nombre>` (C7) y trae la línea de
RN-plugin-guarda.

## Requisitos no funcionales

- Ninguno con número: el usuario no dio cifras. El tope de 10.000 caracteres de C7 es una
  restricción de la plataforma para el aviso de versión, no un requisito del producto.

## Historias

| Historia | Qué cubre |
|---|---|
| US-001-instalar-global | Como usuario de Claude Code, quiero instalar el plugin y correr `/nzt:setup` para tener NZT en todos mis proyectos |
| US-002-instalar-proyecto | Como usuario, quiero instalar NZT solo en un proyecto, para que el equipo lo reciba con el repo |
| US-003-frenos | Como usuario con `nzt-ai` o con otro bloque, quiero que el setup se frene y me diga qué hacer, para no cargar NZT dos veces |
| US-004-actualizar | Como usuario, quiero enterarme cuando el bloque quedó viejo y actualizarlo con `/nzt:setup` |
| US-005-quitar | Como usuario, quiero quitar el bloque con `/nzt:setup` y que mi `CLAUDE.md` quede como estaba |
| US-006-guarda | Como compañero sin el plugin, quiero que el bloque no aplique y me avise, para no trabajar con un método a medias |
| US-007-dos-bloques | Como usuario con bloque global, quiero que al abrir un repo con su propio bloque se me avise y se aplique uno solo |

## Diseño técnico (unidad 464)

Modo: **propuestas** (el agente decide los detalles y los marca; el usuario objeta) ·
2026-11-04. Las decisiones están en *Decisiones técnicas*; acá va el presente.

### Piezas

| Pieza | En el repo | En el plugin publicado |
|---|---|---|
| Skills de NZT | `skills/` (las mismas que copia `nzt-ai`) | `skills/nzt`, `skills/nzt-build`… → `nzt:nzt`, `nzt:nzt-build`… |
| Skill de setup | `plugin/skills/setup/SKILL.md` | `skills/setup` → `/nzt:setup` |
| Scripts del setup | `plugin/skills/setup/scripts/setup.ps1` y `setup.sh` | igual |
| Hook de aviso | `plugin/hooks/hooks.json`, `check.ps1`, `check.sh` | `hooks/` |
| Subagentes | `agents/nzt-explorer.md`, `nzt-worker.md` | `agents/` → `nzt:nzt-explorer`, `nzt:nzt-worker` |
| Adaptador del plugin | `core/adapter-claude-plugin.md` | dentro del bloque |
| Bloque a escribir | lo arma el build | `kernel/CLAUDE.md` |
| Manifiesto | lo arma el build | `.claude-plugin/plugin.json`, `name: nzt`, versión de NZT |

El setup vive fuera de `skills/` para que `nzt-ai` no lo instale. El plugin se publica en la
rama `plugin` (QT-96) y el marketplace del repo suma la entrada `nzt` con
`{"source": "github", "repo": "Ezefeola/nzt-ai", "ref": "plugin"}`: se instala como
`nzt@nzt`.

### El bloque

```
<!-- nzt:start -->
<!-- nzt:plugin 4.1.0 -->
…kernel, igual al de nzt-ai…
…adaptador del plugin…
<!-- nzt:end -->
```

- Los marcadores son **los mismos que usa `nzt-ai`** y la segunda línea dice que lo escribió
  el plugin, con su versión. Así `nzt-ai` ve marcadores sin su manifiesto y se frena por su
  propia regla de colisión (`specs/nzt-installer.md` §7), y el setup separa su bloque del de
  `nzt-ai` por esa línea (QT-99).
- El adaptador del plugin es el de Claude Code con dos cambios: **(1)** donde un texto de NZT
  nombra una skill o un subagente `nzt-<x>`, se carga `nzt:nzt-<x>` (QT-97), salvo un pack
  instalado en el proyecto, que no está en el plugin y conserva su nombre `nzt-<pack>`
  (unidad 466); **(2)** la guarda:
  si no hay ninguna skill `nzt:nzt` disponible, no aplicar NZT, avisar una vez de dónde sacar
  el bloque o cómo instalar el plugin, y seguir sin el método.

### Flujos

**Instalar, global o de proyecto (US-001, US-002, US-003).**
1. El usuario corre `/nzt:setup`. La skill lleva `disable-model-invocation: true`, así que
   Claude no la carga solo (C7).
2. La skill corre `setup status` y muestra dónde hay bloques, sus versiones y si hay
   `nzt-ai`.
3. Pregunta la acción y, para instalar, el alcance: global o este proyecto.
4. Corre `setup install --scope <alcance> --dry-run`. **Las reglas de frenado las aplica el
   script, no el modelo**: sale con código 2 y el slug de la regla si hay `nzt-ai`
   (RN-plugin-instalador-presente) o un bloque del otro alcance (RN-plugin-un-solo-nzt). Si el
   proyecto tiene `AGENTS.md` sin `CLAUDE.md`, sale con 2 salvo `--accept-agents-md`
   (RN-plugin-aviso-agents), y la skill hace esa pregunta aparte.
5. Muestra el plan del script y pregunta con *No* marcado (RN-plugin-mostrar-antes).
6. Con *Sí*, corre lo mismo sin `--dry-run` y muestra el resultado. El bloque toma efecto en
   la sesión siguiente: el `CLAUDE.md` se carga al arrancar (inferido de
   [memory](https://code.claude.com/docs/en/memory)).

**Actualizar (US-004).** Al empezar, retomar, limpiar o compactar, el hook `SessionStart`
corre `check`, que lee la línea `nzt:plugin` de `~/.claude/CLAUDE.md` y del `CLAUDE.md` del
proyecto y la compara con la versión de `plugin.json`. Si difiere, devuelve `systemMessage`
(lo ve el usuario) y `additionalContext` (lo ve Claude) con las dos versiones y
`/nzt:setup`. Si son iguales o no hay bloque, no devuelve nada. Nunca escribe. Instalar sobre
un bloque del plugin lo reemplaza en su lugar.

**Quitar (US-005).** `setup remove --scope <alcance>` saca el bloque y deja el resto del
archivo igual. Si el bloque no coincide con el hash que guardó al escribirlo, o no hay hash,
sale con 2 y muestra la diferencia; la skill pregunta y repite con `--force-edited`.

**Guarda (US-006).** No corre nada: es la línea del adaptador. Que el modelo la cumpla se
prueba con un eval en S2.

**Dos bloques (US-007).** El mismo `check`: si hay bloque global y bloque de proyecto,
devuelve las dos rutas y le dice a Claude que aplique solo el del proyecto
(RN-plugin-dos-bloques). El del proyecto gana porque es el que el equipo versionó y Claude Code
lo lee después del global (QT-102).

### Dónde se cumple cada regla

| Regla | Se cumple en |
|---|---|
| RN-plugin-setup-una-skill | una sola skill en `plugin/skills/` |
| RN-plugin-setup-a-pedido | `disable-model-invocation: true`; el hook nunca escribe |
| RN-plugin-destino | `setup install --scope` |
| RN-plugin-mostrar-antes | la skill: `--dry-run`, después la pregunta con *No* marcado |
| RN-plugin-solo-el-bloque | el script: reemplazo entre marcadores y escritura atómica |
| RN-plugin-instalador-presente | el script (código 2); del otro lado, la regla de colisión de `nzt-ai` |
| RN-plugin-un-solo-nzt | el script (código 2) |
| RN-plugin-aviso-agents | el script exige `--accept-agents-md`; la skill pregunta aparte |
| RN-plugin-quitar | el script compara el hash y exige `--force-edited` |
| RN-plugin-estado | `setup status`, que no escribe |
| RN-plugin-aviso-version | el hook `check` |
| RN-plugin-guarda | la línea del adaptador; un eval en S2 |
| RN-plugin-dos-bloques | el hook `check` |
| RN-plugin-mismo-kernel | el build compara el kernel del bloque con el de `dist/CLAUDE.md`, byte a byte |

### Los scripts

`setup.ps1` y `setup.sh` hacen lo mismo con la misma interfaz:
`status | install | remove`, `--scope global|project`, `--project-dir`, `--data-dir`,
`--plugin-root`, `--dry-run`, `--accept-agents-md`, `--force-edited`. Códigos de salida: 0
hecho, 2 frenado por una regla (el mensaje dice cuál), 1 error. Las rutas las pasa la skill
con `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_DATA}` y `${CLAUDE_PLUGIN_ROOT}`, que Claude Code
reemplaza en el texto de la skill y no exporta al shell de Bash (C7). Las mismas rutas van en
`allowed-tools`, así que corren sin pedir permiso. La skill usa `.ps1` en Windows y `.sh` en
el resto (QT-100). Los dos se prueban contra los mismos casos en S2.

Hechos en la unidad 467 (QT-105): `--claude-dir` y `--manifest-dir` aíslan `~/.claude` y el
manifiesto de `nzt-ai` en las pruebas; la skill no los pasa. Actualizar un bloque que no
coincide con su hash también sale con 2 y pide `--force-edited`, como quitar. Quitar un bloque
que era todo el archivo borra el archivo. Las líneas fuera del bloque se escriben byte a byte,
con sus finales CRLF o LF y su BOM. Las pruebas, `plugin/tests/setup.test.sh`, corren los
mismos 18 casos contra `setup.sh`, PowerShell 7 y Windows PowerShell 5.1, y no viajan en el
plugin.

### Datos

- `${CLAUDE_PLUGIN_DATA}/written.json`: por cada archivo escrito, la versión, el hash del
  bloque y la fecha. Se escribe después del archivo.
- Sin copias de seguridad (QT-107, deja sin efecto QT-101): nadie las limpiaba y quedaban
  viejas. La simulación avisa que no se guarda copia.
- **Lo que se acepta:** Claude Code borra `${CLAUDE_PLUGIN_DATA}` al desinstalar el plugin
  (C7), así que se pierden los hashes. Un bloque quitado después de
  reinstalar se trata como editado: pide confirmación, no se pierde nada.

### Cuando algo falla

- La escritura es atómica: archivo temporal y renombre. Un corte deja el archivo como estaba.
- Instalar dos veces da lo mismo; quitar dos veces dice que no hay bloque.
- Si el hook falla o no corre (empresas con `allowManagedHooksOnly`, C7), no hay aviso de
  versión ni de dos bloques; el setup y la guarda siguen funcionando.

### Build y release

- `install/build.*` suma al `dist/plugin/` que ya arma para los evals (D23): el setup, el
  hook, los subagentes, `kernel/CLAUDE.md` y la versión de NZT en `plugin.json`, la misma del
  `.csproj` (D24). En los subagentes reescribe `skills: [nzt-research]` a `nzt:nzt-research`,
  porque ese nombre lo lee Claude Code y no el modelo (QT-103).
- El workflow de release copia `dist/plugin/` **sin `evals/`** a la rama `plugin`, en un
  commit por versión (QT-104).

### Sin verificar, para el comienzo de S2

- QT-98: una forma de hook que corra igual en Windows con y sin Git Bash, en macOS y en
  Linux.
- Que un subagente de plugin precargue una skill con su nombre `nzt:…` (QT-103).
- Que el modelo cumpla la traducción de nombres y la guarda: evals.

## Abierto

- Codex `[TO-DEFINE]` (Q-01).
- QT-98, QT-103 y los evals de la guarda y los nombres: se resuelven al empezar S2.

## Preguntas

#### Q-09 · Un compañero con el plugin y su bloque global clona un proyecto que trae su propio bloque: ¿qué pasa?
- bloquea: el caso que RN-plugin-un-solo-nzt no cubre, porque el segundo bloque no lo
  escribe el setup sino que llega con el repo
- opciones: A, al empezar la sesión se avisa que hay dos bloques y dónde están, y Claude
  aplica uno solo; B, no se hace nada: Claude lee el kernel dos veces. El agente recomendó A.
- respuesta: **A**, avisa y aplica uno · 2026-11-04

#### Q-01 · ¿Codex entra en esta spec?
- bloquea: el alcance, y si el tramo S3 existe
- opciones: A, solo Claude Code y Codex `[TO-DEFINE]` hasta probar lo que C8 deja sin
  verificar; B, los dos desde ahora. El agente recomendó A.
- respuesta: **A**, solo Claude Code · 2026-11-04

#### Q-02 · ¿Dónde escribe el setup el kernel?
- bloquea: la regla de destino y la de desinstalación
- opciones: A, solo global (`~/.claude/CLAUDE.md`), como el instalador; B, global o en un
  proyecto, a elección. El agente recomendó A.
- respuesta: **B**, global o un proyecto · 2026-11-04

#### Q-03 · Si NZT ya está instalado con `nzt-ai`, ¿qué hace el setup?
- bloquea: la regla de convivencia con el instalador
- opciones: A, se frena y dice cómo desinstalar con `nzt-ai`; B, toma el lugar y quita lo
  del instalador; C, conviven las dos copias. El agente recomendó A.
- respuesta: **A**, se frena · 2026-11-04

#### Q-04 · ¿Cómo se quita el bloque al dejar de usar el plugin?
- bloquea: la regla de desinstalación
- opciones: A, una skill `/nzt:uninstall` que lo saca, más una línea en el kernel que lo
  anula si faltan las skills; B, solo esa línea, y el bloque se borra a mano. El agente
  recomendó A.
- respuesta: *"en nzt-setup deberían contemplarse ambas cosas"*: **una sola skill**,
  `/nzt:setup`, que instala y desinstala, para no tener dos skills · 2026-11-04. La línea del
  kernel no la contestó: va en Q-07.

#### Q-05 · Cuando el plugin se actualiza y el bloque quedó viejo, ¿qué pasa?
- bloquea: la regla de actualización
- opciones: A, se avisa en una línea al empezar la sesión y el usuario corre `/nzt:setup`;
  B, el bloque se reescribe solo, sin preguntar. El agente recomendó A.
- respuesta: **A**, avisa y el usuario lo corre · 2026-11-04

#### Q-06 · En un proyecto, ¿en qué archivo va el bloque?
- bloquea: la regla de destino en un proyecto (sigue de Q-02)
- opciones: A, `CLAUDE.local.md`, personal y fuera de git; B, el `CLAUDE.md` del proyecto,
  versionado y compartido. El agente recomendó A, para que un compañero sin el plugin no
  reciba un kernel que nombra skills que no tiene.
- hecho ([memory](https://code.claude.com/docs/en/memory), leído el 2026-11-04):
  `CLAUDE.local.md` carga junto a `CLAUDE.md` y se agrega al `.gitignore` a mano; si el
  proyecto usa `AGENTS.md` y no tiene `CLAUDE.md` ni `CLAUDE.local.md`, crear uno de los dos
  hace que Claude deje de leer el `AGENTS.md`, salvo que se cambie *Project instructions*.
- respuesta: **B**, el `CLAUDE.md` del proyecto · 2026-11-04. Lo que el agente objetó queda
  cubierto en parte por Q-07: a un compañero sin el plugin el bloque se le anula con aviso.

#### Q-07 · ¿El kernel lleva una línea que lo anule si faltan las skills del plugin?
- bloquea: lo que pasa si se desinstala el plugin sin pasar por `/nzt:setup` (sigue de Q-04)
- opciones: A, sí: si las skills de NZT no están, el bloque se ignora y se avisa una vez;
  B, no: el bloque queda activo hasta que se lo saque. El agente recomendó A.
- respuesta: **A**, sí, con aviso · 2026-11-04

#### Q-08 · ¿Confirmás las reglas que propuso el agente?
- bloquea: las reglas que salen de cómo trabaja el instalador
- propuestas: P1, muestra lo que va a escribir y pide confirmación con *No* marcado; P2, toca
  solo el bloque entre marcadores y guarda una copia la primera vez; P3, un solo NZT cargado;
  P4, aviso antes de crear un `CLAUDE.md` en un proyecto con `AGENTS.md`; P5, quitar saca
  solo el bloque; P6, el estado dice dónde está el bloque y las versiones.
- respuesta: **todas** · 2026-11-04

## Decisiones técnicas

Registro de la unidad 464, solo se agrega. Los números siguen la numeración de QT del repo.

### 2026-11-04

**QT-96 · ¿Cómo llega el plugin construido al marketplace, si `dist/` no se versiona?**
> abierta · opciones: A, una rama `plugin` que el workflow de release llena con el build;
> B, el build versionado en `main`; C, un zip en cada release. Recomendada: A.

**QT-97 · ¿Cómo carga el modelo `nzt:nzt-build` si el kernel y las skills dicen `nzt-build`?**
> abierta · opciones: A, una línea del adaptador del plugin traduce cada nombre `nzt-<x>` a
> `nzt:nzt-<x>`, sin reescribir nada; B, el build reescribe los nombres en kernel, skills y
> agentes; C, renombrar las skills a `nzt:build` y reescribir. Recomendada: A, con un eval que
> lo pruebe y B como plan de respaldo.

**QT-98 · ¿Cómo corre el mismo hook en Windows con y sin Git Bash, en macOS y en Linux?**
> abierta · documentado ([hooks](https://code.claude.com/docs/en/hooks), leído el
> 2026-11-04): la forma con shell corre con `sh` en macOS y Linux, con Git Bash en Windows y
> con PowerShell si no hay Git Bash; `shell` acepta `bash` o `powershell` y no hay campo por
> sistema operativo; la forma con `args` no usa shell y en Windows pide un ejecutable real.
> Sin verificar: una línea que funcione en los tres casos. Se resuelve con una prueba al
> empezar S2.

**Modo del diseño**
> Propuestas: el agente decide los detalles y los marca; el usuario objeta. — `usuario`

**QT-96** → A, la rama `plugin` que llena el workflow de release. — `usuario`

**QT-97** → A, una línea del adaptador traduce `nzt-<x>` a `nzt:nzt-<x>`; un eval en S2 lo
prueba y, si falla, se pasa a B. — `usuario`

**QT-99 · ¿Cómo se distingue el bloque del plugin del de `nzt-ai`?**
> Los mismos marcadores y una línea `<!-- nzt:plugin <versión> -->` adentro. `nzt-ai` se frena
> solo ante él por su regla de colisión. — `agente, dentro del alcance`

**QT-100 · ¿En qué lenguaje van el setup y el aviso?**
> Dos scripts, `.ps1` y `.sh`, con la misma interfaz. `nzt-ai` es .NET y meterlo en el plugin
> pide un binario por sistema; Node no viene con Claude Code; en Windows puede no haber Git
> Bash. — `agente, dentro del alcance`

**QT-101 · ¿Dónde van las copias de seguridad?** *(sin efecto desde QT-107: no hay copias)*
> Global, junto al archivo, como `nzt-ai`; de proyecto, en `${CLAUDE_PLUGIN_DATA}/backups/`.
> — `agente, dentro del alcance`

**QT-102 · Con dos bloques, ¿cuál aplica?**
> El del proyecto. — `agente, dentro del alcance` (Q-09 decidió que aplica uno solo)

**QT-103 · ¿Cómo encuentra `nzt-explorer` la skill que precarga dentro del plugin?**
> El build reescribe su `skills:` a `nzt:nzt-research`. Sin verificar que Claude Code acepte
> ese nombre ahí: se prueba al empezar S2. — `agente, dentro del alcance`

**QT-104 · ¿Qué viaja a la rama `plugin`?**
> `dist/plugin/` sin `evals/`, un commit por versión. — `agente, dentro del alcance`

### 2026-11-04 · prueba de la unidad 465

Plugin de prueba con `--plugin-dir`, `claude -p` con Haiku, Claude Code 2.1.312, Windows 11
con Git Bash, PowerShell 7.6.9 y Windows PowerShell 5.1.

**QT-103** → `observado`: un agente de plugin con `skills: [spike:secret]` recibe la skill
precargada con su nombre de plugin (respondió la palabra que solo estaba en esa skill). El
build reescribe `skills:` como dice QT-103.

**QT-98, lo observado**
> - Sin `shell`, el hook corre en Git Bash (`uname` = `MINGW64_NT`).
> - Con `"shell": "powershell"` corre en **PowerShell 7** cuando está instalado.
> - La línea `powershell -NoProfile -ExecutionPolicy Bypass -File "<ps1>" || sh "<sh>"` corre
>   el `.ps1` (Windows PowerShell 5.1) desde Git Bash y desde PowerShell 7.
> - La misma línea en un `sh` sin `powershell` en el `PATH` (como macOS o Linux) cae al `.sh`
>   y sale con 0.
> - Windows PowerShell 5.1 **no entiende `||`**: la línea falla al leerse.
> - Sin verificar: qué PowerShell usa Claude Code en un Windows sin Git Bash y sin
>   PowerShell 7 (si es la 5.1, ahí el hook falla), y la corrida en macOS y Linux reales.
> Elección: abierta, se pregunta al usuario.

**QT-98** → la línea doble, `powershell … -File check.ps1 || sh check.sh`. Se acepta que en un
Windows sin Git Bash ni PowerShell 7 no haya aviso y el hook marque error. — `usuario`

### 2026-11-04 · unidad 471

**Prueba en vivo, ronda 1** (Windows, `--plugin-dir dist/plugin`, sin `nzt-ai` instalado):
instalar en un proyecto con un `CLAUDE.md` propio dejó el bloque arriba y el texto intacto
debajo; **`allowed-tools` evitó el pedido de permiso** al correr el script; al reabrir, con
un bloque al día, el hook no dijo nada. — `usuario, observado`

**Ronda 2.** Con el bloque del proyecto en 3.9.0, **el `systemMessage` del hook se ve en
pantalla** al abrir; actualizar frenó por editado (`RN-plugin-quitar`) y con *Yes* quedó en
4.0.0; instalar en global frenó por `RN-plugin-un-solo-nzt`. Con un bloque global puesto a
mano, el aviso de dos bloques apareció; quitar el del proyecto lo dejó **idéntico byte a byte
al original**. Quitar el global no llegó a correr: en modo automático, el clasificador que
aprueba comandos no respondió tres veces y la sesión paró sin ejecutar nada — una falla de
ese control, no del script; el bloque global siguió en el archivo. El mismo `remove` corrido
a mano sobre una copia frena por editado y con `--force-edited` borra el archivo vacío.
Sin aclarar: si `allowed-tools` evita el clasificador del modo automático o solo el pedido de
permiso (ronda 1). — `agente, observado en el registro de la sesión`

**QT-107 · ¿Se sigue guardando una copia del `CLAUDE.md` antes de escribir el bloque?**
> abierta · lo planteó el usuario en la prueba en vivo: la copia queda en la máquina y nadie
> la limpia. Observado: es una por archivo, solo la primera vez y sin pisarse, así que no
> crece por corrida pero sí por proyecto, y queda vieja (es el archivo de la primera
> instalación). La de proyecto vive en `${CLAUDE_PLUGIN_DATA}/backups/` y se va al
> desinstalar el plugin; la global, `~/.claude/CLAUDE.md.nzt-backup`, queda para siempre.
> Lo que ya protege sin copia: solo se toca lo que está entre marcadores, la escritura es
> atómica, se simula y se confirma antes, y un bloque editado frena con la diferencia.
> Opciones: A, sin copia — se saca de los scripts, los tests y la spec (RN-plugin-solo-el-bloque,
> QT-101 queda sin efecto); B, se mantiene como está; C, solo la global, que no está en git.
> Recomendada: A.

**QT-108 · ¿La confirmación marca *No* como recomendada?**
> abierta · observado en la prueba en vivo: después de pedir instalar, la pregunta ofrece
> "No (Recommended)", y el usuario dudó de qué elegir. P1 de Q-08 dice "con *No* como opción
> marcada"; `SKILL.md` lo aplicó como primera y recomendada. Opciones: A, *No* sigue primera
> —un Enter apurado no escribe nada— pero sin "(Recommended)", también en el freno de
> `AGENTS.md`; B, se deja como está. Recomendada: A.

**QT-107** → sin copia. Antes de escribir se avisa que no se guarda copia y que, si se la
quiere, la haga uno mismo. — `usuario`

**QT-108** → A: *No* primera, sin "(Recommended)". — `usuario`

### 2026-11-04 · unidad 470

**QT-106 · Sin el plugin, ¿alcanza con que avise y no cargue skills, aunque responda con la forma de NZT?**
> abierta · observado en el eval `plugin-guard`, arm sin plugin, una corrida: avisó una vez
> con `/plugin install nzt@nzt` y cómo quitar el bloque, no cargó skills ni escribió estado, y
> después propuso fases (spec → historias → diseño → build) con opciones marcadas
> *(recomendado)*. Causa probable: el kernel sigue en contexto y sus reglas de comunicación
> no dependen de las skills. Opciones: A, se acepta — la guarda es avisar y no correr el
> ciclo con skills, y el criterio del eval se escribe así; B, la línea de la guarda dice
> también que no se sigan las reglas del kernel, y se vuelve a medir. Recomendada: A.

**QT-106** → A: sin el plugin, "no aplicar NZT" es avisar una vez y no correr el ciclo —ni
skills, ni `Plan/state.json`, ni un plan en unidades que espera aprobación—; el estilo de
la respuesta no cuenta. El criterio de `plugin-guard` se reescribió así. — `usuario`

### 2026-11-04 · unidad 469

**El hook, lo hecho.** `plugin/hooks/hooks.json` corre en todo `SessionStart` la línea doble de
QT-98. `check.ps1` sale siempre con 0, para que un error no caiga al `|| sh`. Solo cuentan
para la versión los bloques con línea `nzt:plugin`; para los dos bloques cuenta cualquiera,
también el de `nzt-ai`. Con dos bloques, la versión que se compara es la del proyecto, que es
el que aplica. `plugin/tests/check.test.sh`: 11 casos, iguales en `sh`, PowerShell 7 y
Windows PowerShell 5.1. Sin verificar: que Claude Code muestre `systemMessage` de un hook
`SessionStart` al usuario (la doc lo define para todos los hooks y no lo excluye en este);
se ve en la prueba en vivo de la 471.

### 2026-11-04 · unidad 467

**QT-105 · ¿Qué pasa al actualizar un bloque del plugin editado a mano?**
> Se frena como al quitar: sale con 2, muestra la diferencia y pide `--force-edited`. Sin eso,
> actualizar perdería las ediciones sin avisar. Lo que cuesta: tras reinstalar el plugin
> (`${CLAUDE_PLUGIN_DATA}` se borra) la primera actualización pide confirmación. — `agente,
> dentro del alcance`

## Objeciones

- El agente avisó que un bloque en el `CLAUDE.md` versionado del proyecto llega a compañeros
  sin el plugin, y propuso `CLAUDE.local.md`. El usuario mantiene el `CLAUDE.md` del proyecto
  (Q-06); RN-plugin-guarda cubre ese caso. No se reabre sin un argumento nuevo.
