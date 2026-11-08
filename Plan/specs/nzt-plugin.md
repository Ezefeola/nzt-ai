# NZT — Plugin

> Estado: **diseñado, construido y probado** en Claude Code (unidades 473–476); **construido
> para Codex** (D100, unidades 530–535), sin probar instalado · Decisiones: D91, revisada por
> D97, D92 y D100 · Depende de: `Plan/specs/nzt-core/README.md` (C7, C8, 9.2) y `decisions.md`
> (D24, D91, D92, D100) · Sin aceptar. El primer diseño —`/nzt:setup` escribía el kernel en un `CLAUDE.md`, con un hook
> de aviso— se construyó y probó en las unidades 462–471 y se retiró en la 476 (QT-109): queda
> en el registro de abajo y en el commit `db92912`.

## Qué resuelve

Hasta la v5, NZT se instalaba con `nzt-ai`, un CLI aparte que había que bajar y correr, y
quien ya instalaba todo desde `/plugin` no tenía cómo traer NZT por ahí. Desde D100 el plugin
es la única forma de instalar NZT, en Claude Code y en Codex. Un plugin no puede
traer un `CLAUDE.md` que se cargue (C7), y el kernel tiene que estar presente en toda la
sesión. El plugin resuelve las dos cosas: trae las skills de NZT y lleva **el kernel dentro
de la skill `nzt-software:nzt`**, que Claude carga primero en cada sesión por su descripción. No
escribe en ningún archivo del usuario: activar o desactivar el plugin es activar o desactivar
NZT.

## Alcance

**Adentro**
- Instalar NZT desde el marketplace del repo, como plugin, en Claude Code y en Codex (D100).
- Que `nzt-software:nzt`, con el kernel, cargue primero en toda sesión —también ante una pregunta— y
  siga presente después de compactar.
- Desactivar o desinstalar el plugin sin dejar nada de NZT en la máquina ni en el proyecto.
- Migrar desde `nzt-ai`: se desinstala antes de instalar el plugin; si no, el kernel llega dos
  veces. El comando de una línea no dejó copia del binario, así que se corre su script de la
  v5.0.0 en modo desinstalar, fijado en esa versión (`NZT_VERSION=v5.0.0`). Lo dicen la guía
  de `nzt-software/README.md` y las notas de la v6.0.0.

**Afuera**
- Otro camino de instalación: `nzt-ai` y sus comandos de una línea se borraron (D100, QT-121).
  Las reglas de software viajan en el plugin (D93); desde D96 no hay packs ni `nzt-games`.
- Subagentes en Codex: Codex no los documenta en un plugin; allí todo corre en la conversación.
- Los mods: plugins aparte del mismo marketplace, solo de Claude Code (D63).
- Partir NZT en partes que se instalen por separado (contexto, discovery, build…): es la
  dirección después de lanzar este plugin completo, no parte de él.

## Glosario de esta spec

- **Kernel**: las reglas de NZT que valen en todos los turnos (`nzt-software/method/core/kernel.md`).
- **`nzt-software:nzt`**: la skill de entrada del plugin. Su cuerpo es el kernel y el adaptador del
  plugin; lo que la skill `nzt` del repo hace es su referencia `references/entry.md`.
- **Entrada**: leer el estado, dimensionar el pedido, elegir las fases y pasar la posta
  (`references/entry.md`).

## Reglas

### RN-plugin-metodo-en-skill · origin: QT-109
El kernel vive en el cuerpo de la skill `nzt-software:nzt`, arriba de todo, seguido del adaptador del
plugin. No hay otra copia del kernel en el plugin.

### RN-plugin-carga-primero · origin: QT-109, QT-110
`nzt-software:nzt` es la primera skill que se carga en una sesión nueva, antes de cualquier otra y antes
de editar o escribir, también ante una pregunta suelta. Lo logra solo su descripción. Después
de compactar, el kernel sigue presente: Claude Code re-adjunta las skills cargadas, y si no
estuviera, el adaptador dice que se vuelva a cargar `nzt-software:nzt`.

### RN-plugin-sin-rastros · origin: QT-109
El plugin no escribe en archivos del usuario para funcionar. Desactivado o desinstalado, Claude
trabaja sin NZT y no queda nada que limpiar.

### RN-plugin-mismo-kernel · origin: D24
El kernel de `nzt-software:nzt` es, byte por byte, `nzt-software/method/core/kernel.md`: el build lo
copia sin tocarlo. Claude Code y Codex reciben la misma skill; lo que cambia por host lo dice
un solo adaptador, `nzt-software/method/core/adapter-plugin.md`, con una parte por proveedor (D100).

### RN-plugin-nombres · origin: QT-97, D97
El plugin se llama `nzt-software`, y sus skills y subagentes no llevan el prefijo `nzt-`
del repo: `nzt-software:build`, `nzt-software:explorer`. Donde NZT nombra `nzt-<x>`, se
carga `nzt-software:<x>`; el kernel es `nzt-software:nzt`. Solo el build cambia los nombres:
en el repo siguen siendo `nzt-<x>`. En Codex se invocan `$nzt-software:<x>` (openai/codex PR
28608; sin probar en una sesión).

## Requisitos no funcionales

- La descripción de `nzt-software:nzt` entra en los 250 caracteres del build (hoy 199) y la skill en las
  200 líneas (hoy 136).
- Después de compactar, Claude Code conserva los primeros 5.000 tokens de cada skill cargada
  (docs de skills): el kernel tiene que quedar adentro. Hoy la skill mide 8.601 caracteres;
  ~2.200 tokens es una estimación, no una medida.

## Historias

| Historia | Qué cubre |
|---|---|
| US-001-instalar | Como usuario de Claude Code o de Codex, quiero instalar el plugin y trabajar con NZT desde la sesión siguiente, sin otro paso |
| US-002-apagar | Como usuario, quiero desactivar o desinstalar el plugin y que Claude trabaje sin NZT, sin archivos que limpiar |
| US-003-actualizar | Como usuario, quiero que actualizar el plugin actualice el método, sin tocar nada más |
| US-004-retomar | Como usuario, quiero que el método siga aplicando después de compactar una sesión larga |

## Diseño técnico (unidades 473, 476 y 532–534)

### Piezas

| Pieza | En el repo | En el plugin publicado |
|---|---|---|
| Kernel | `nzt-software/method/core/kernel.md` | cuerpo de `skills/nzt/SKILL.md` → `nzt-software:nzt` |
| Adaptador del plugin | `nzt-software/method/core/adapter-plugin.md` (Claude Code y Codex, D100) | después del kernel, en la misma skill |
| Entrada | cuerpo de `nzt-software/method/skills/nzt/SKILL.md` | `skills/nzt/references/entry.md` |
| Resto de las skills | `nzt-software/method/skills/` | sin prefijo (D97): `skills/build/` → `nzt-software:build`, `nzt-software:plan`… |
| Subagentes | `nzt-software/method/agents/nzt-explorer.md`, `nzt-worker.md` | `agents/explorer.md`, `worker.md` → `nzt-software:explorer`, `nzt-software:worker`; solo los usa Claude Code |
| Manifiesto | lo arma el build | `.claude-plugin/plugin.json`, `name: nzt-software`, versión de `nzt-software/VERSION`; Codex lo lee igual (531) |
| Marketplace de Claude Code | `.claude-plugin/marketplace.json` | fuente `github` con `ref: plugin-nzt-software`, más los mods |
| Marketplace de Codex | `.agents/plugins/marketplace.json` | fuente `url` con `ref: plugin-nzt-software`, solo `nzt-software` |

No hay hooks ni archivos que escriba el plugin. El único código es el state check de
`nzt-software:plan` (`skills/plan/scripts/`, S2d): lo corre el agente, no el plugin, y sin
intérprete revisa el estado a mano (ver *El state check en macOS*). Se publica en la rama `plugin-nzt-software` (QT-96; `plugin` hasta la v5, D98) y se instala
como `nzt-software@nzt` (D97; hasta la v5, `nzt@nzt`) desde uno de los dos marketplaces:

- Claude Code: `.claude-plugin/marketplace.json`, con
  `{"source": "github", "repo": "Ezefeola/nzt-ai", "ref": "plugin-nzt-software"}`.
- Codex: `codex plugin marketplace add Ezefeola/nzt-ai` y `codex plugin add nzt-software@nzt`.
  Codex lee `.agents/plugins/marketplace.json` antes que el de `.claude-plugin` y no entiende
  la fuente `github` (531), así que el suyo usa
  `{"source": "url", "url": "https://github.com/Ezefeola/nzt-ai.git", "ref": "plugin-nzt-software"}`
  y no lista los mods.

### Build y release

- `nzt-software/build/build.*` arma `nzt-software/dist/plugin/` (D23): la skill `nzt` con el kernel y su entrada, las
  demás skills y los subagentes sin el prefijo `nzt-` (D97), los subagentes con los nombres del plugin en su lista `skills:` (QT-103) y la
  versión de `nzt-software/VERSION` en `plugin.json` (D100). El build arma solo `dist/plugin/`:
  sin `dist/claude-code` ni `dist/codex`, que eran del instalador. Las dos builds dan la misma salida.
- El workflow corre las puertas —el build y el state check— y copia `nzt-software/dist/plugin/`
  **sin `evals/`** a la rama `plugin-nzt-software` (`plugin` hasta la v5, D98), en un commit
  por versión (QT-104); el release se crea sin assets (D100).

### Lo verificado

| Qué | Cómo | Resultado |
|---|---|---|
| `nzt:nzt` primera en sesión nueva | evals `skill/` sin `CLAUDE.md`, 4 pedidos × 3 corridas (474) | 12/12, leído de la traza |
| El kernel tras `/compact` | en vivo (475) | Claude Code re-adjuntó `nzt:nzt` y `nzt:nzt-plan` solo |
| Plugin desactivado | en vivo (475) | ninguna skill, escritura ni mención de NZT |
| Nombres `nzt:nzt-<x>` | evals de la 470 y de la 474 | el modelo carga los nombres del plugin |
| Nombres `nzt-software:<x>` sin prefijo (D97) | sin medir: los evals se reescribieron (513) y no se corrieron | — |
| Codex instala el plugin (531) | `codex-cli 0.164.0` con un plugin mínimo en un `CODEX_HOME` descartable | lo instala con `.claude-plugin/plugin.json`; lee `.agents/plugins/marketplace.json` primero; saltea la fuente `github` y acepta `url` con `ref` |
| `nzt-software:nzt` primera en Codex, y sus nombres | sin probar en una sesión (536 descartada) | nombres según openai/codex PR 28608 |

### El state check en macOS (unidad 489)

`nzt-plan` corre `state-check.ps1` en Windows y `state-check.py` con `python3` en macOS y
Linux. La pregunta: ¿un Mac sin nada instalado tiene `python3`? Leído el 2026-11-06:

- documented: macOS incluye Python, Ruby y Perl solo por compatibilidad con software viejo,
  y versiones futuras no los traerán por defecto; para 2.7 recomienda correr `python3`.
  [Notas de macOS Catalina 10.15](https://developer.apple.com/documentation/macos-release-notes/macos-catalina-10_15-release-notes),
  *Scripting Language Runtimes* (49764202, 51097165).
- documented: macOS 12.3 quitó Python 2.7.
  [Notas de macOS 12.3](https://developer.apple.com/documentation/macos-release-notes/macos-12_3-release-notes) (39795874).
- Fuente de rango 5, de personal de Apple: *"Python3 has never been bundled with macOS"*, y
  `/usr/bin/python3` es un shim que ofrece instalarlo con las Command Line Tools. Lo dice un
  Developer Tools Engineer de Apple en el
  [foro de desarrolladores](https://developer.apple.com/forums/thread/652014) (julio de 2020).
  Las notas de versión no lo dicen.
- unverified: que en macOS 26 siga igual, y qué devuelve el shim al agente sin las Command
  Line Tools (si sale con error o espera el diálogo). Lo resuelve una corrida en un Mac limpio.
- inferred: sin las Command Line Tools, `python3` no corre el script. Por eso `nzt-plan`
  dice *"If the script cannot run"* (sin intérprete, o macOS ofrece instalar las Command
  Line Tools): revisar contra `references/state.md` y decir que el script no corrió. Con
  las Command Line Tools instaladas, corre.

## Abierto

- Codex: el plugin está construido (D100) y Codex lo instala (531), pero no se probó en una
  sesión que `nzt-software:nzt` cargue primero ni cómo nombra las skills; el usuario lo dio por
  bueno si funciona en Claude Code (536 descartada).
- La suite de evals mide todavía con el kernel en `CLAUDE.md`: pasa a medir el plugin en la
  unidad 477 (QT-111).
- Desvíos del método vistos en la 474 y la 475 —no objetar una vez saltear el plan, una
  pregunta sin id `QT`, un cambio chico que escribió estado—: son del método, no del plugin.
- `nzt-ai` y el plugin juntos, en quien migra sin desinstalar: sin medir; las notas de la
  v6.0.0 dicen que se desinstale antes.

## Preguntas

Q-02 a Q-09 respondieron al diseño con setup, retirado por QT-109; quedan como registro.

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
- respuesta: **A**, solo Claude Code · 2026-11-04 · *superada por D100 (QT-121, 2026-11-08):
  Codex entra, y el plugin es la única forma de instalar*

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

### 2026-11-08 · D100, unidades 530–535

**QT-121 · ¿Se borra el CLI `nzt-ai`?**
> Sí: el plugin es la única forma de instalar, en Claude Code y en Codex (D100). Con eso se
> van `nzt-software/cli/`, `adapter-claude.md`, `adapter-codex.md`, los `.toml` de los
> subagentes y las salidas `dist/claude-code` y `dist/codex`. Un solo adaptador,
> `adapter-plugin.md`, con una parte por proveedor; la versión pasa a `nzt-software/VERSION`.
> Codex tiene su marketplace en `.agents/plugins/marketplace.json` porque no entiende la
> fuente `github` de Claude (spike 531). — el usuario, 2026-11-08

### 2026-11-04

**QT-96 · ¿Cómo llega el plugin construido al marketplace, si `nzt-software/dist/` no se versiona?**
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

### 2026-11-05 · después de la 471

**QT-109 · ¿Cómo se entera quien instala el plugin de que tiene que correr `/nzt:setup`?**
> Observado: nada se lo dice. La descripción del plugin lo nombra una vez, el hook calla sin
> bloque y Claude no ve `/nzt:setup` (`disable-model-invocation`). Además, desactivar el
> plugin no apaga NZT: el bloque sigue en el `CLAUDE.md`. Investigado (docs de skills y
> hooks, `explanatory-output-style` de Anthropic y Superpowers): los plugins con
> instrucciones que valen siempre las inyectan por un hook `SessionStart`; una skill no
> tiene forma propia de cargar siempre. Opciones debatidas: aviso del hook sin bloque;
> kernel inyectado por hook; skill con el kernel inyectada por hook (Superpowers); hook que
> solo dice "cargá `nzt:nzt`"; skill con el kernel que carga por su descripción.

**QT-109** → el usuario no lanza el diseño con setup. El método va dentro de la skill
`nzt:nzt` —el kernel arriba, la entrada de hoy como referencia de la misma skill— y carga
por su descripción, sin hook: desactivar el plugin deja a Claude solo, sin archivos que
limpiar. Se van `/nzt:setup`, el hook y los bloques. `nzt-ai` no cambia. Si la skill no carga
de forma confiable, plan B: un hook de una línea que diga que se cargue. — `usuario`

**QT-110 · ¿`nzt:nzt` carga también ante una pregunta suelta?**
> A, sí: igual que hoy con el `CLAUDE.md`, a cambio de ~2.000 tokens donde quizá no hacían
> falta; B, solo cuando hay trabajo. Recomendada: A.

**QT-110** → A. — `usuario`

**Criterio de la prueba:** en una sesión nueva y después de compactar, la primera skill
cargada es `nzt:nzt`, antes de cualquier otra y antes de editar o escribir. Unidades 473
(armar la variante) y 474 (evals de carga), aprobadas por el usuario; 475 (prueba en vivo:
compactar y plugin desactivado) y 476 (decidir) quedan propuestas.

**Unidades 473 y 474.** El build arma `skills/nzt/SKILL.md` del plugin con el kernel y
`nzt-software/method/core/adapter-claude-skill.md`, y la entrada de hoy como `references/entry.md`; sin setup,
hook ni bloque en el plugin. Evals `skill/` sin `CLAUDE.md`, 3 corridas por caso, US$3,15
medidos: **en las 12 corridas la primera herramienta fue `Skill(nzt:nzt)`** —leído en la
traza de cada corrida, no solo del juez— para una feature, una historia, un cambio de una
palabra y una pregunta. Después aplicó el método: plan sin aprobar en la feature y la
historia, sin código. Observado para mirar: en un cambio chico, 1 de 3 escribió
`Plan/state.json` en vez de editar; en la historia, 1 de 3 escribió un documento de
arquitectura antes de la aprobación. Sin medir: después de `/compact` y con el plugin
desactivado (475). — `agente, observado`

**Unidad 475, en vivo** (Windows, Claude Code 2.1.318, `--plugin-dir`, proyecto de los evals
sin `CLAUDE.md` y sin `CLAUDE.md` global). **(1)** Sesión nueva, pedido de feature: primera
herramienta `Skill(nzt:nzt)`, después `nzt:nzt-plan` y un plan sin aprobar. **(2)** Tras
`/compact`, Claude Code mostró *Skills restored (nzt:nzt-plan, nzt:nzt)*: re-adjunta solo las
skills cargadas, así que el kernel siguió sin recargarlo, y releyó `Plan/state.json`. Ante
"implementá directamente, sin plan" no escribió código: revisó la API, encontró un hueco que
cambia el resultado y preguntó con opciones. Desvíos del método, no de la carga: no objetó una
vez saltear el plan pendiente y la pregunta no llevó id `QT-NN`. **(3)** Sin el plugin, mismo
pedido: ninguna skill, ninguna escritura, ninguna mención de NZT. Revisado en los registros de
las dos sesiones. — `usuario y agente, observado`

### 2026-11-05 · unidad 476

**QT-111 · ¿Qué hace la suite de evals ahora que `nzt:nzt` trae el kernel?**
> Observado: todos los casos siembran el kernel en `CLAUDE.md` y corren contra `nzt-software/dist/plugin`,
> donde `nzt:nzt` ya lo trae: el kernel llega dos veces, y los casos de contención que piden
> "ninguna skill" ante una pregunta chocan con QT-110. Opciones: A, la suite deja de sembrar
> `CLAUDE.md` y mide el plugin tal como se publica; los graders de "ninguna skill" pasan a
> "ninguna skill salvo `nzt:nzt`", y se recalibra en una unidad aparte; B, se mantiene como
> está, con el kernel dos veces; C, un segundo destino de evals con el `nzt` de `nzt-ai` para
> medir los dos productos. Recomendada: A — el texto del kernel es el mismo en los dos
> productos, y C duplica el costo de cada corrida.

**QT-111** → A, en la unidad 477. — `usuario`

**Unidad 476, lo hecho.** Con 473–475 a favor, el diseño de la skill queda (D92 en
`Plan/specs/nzt-core/README.md`). Se retiraron del repo `plugin/` (setup, hook y sus pruebas),
`nzt-software/method/core/adapter-claude-plugin.md`, los evals `plugin/` y el fixture `plugin-block.sh`; el build
ya no arma el bloque. Esta spec se reescribió arriba; `Plan/specs/nzt-installer.md` y la guía de la
landing, al día. — `agente, dentro del alcance aprobado`

### 2026-11-06 · antes de la 490

**QT-113 · El `irm` pasa a instalar como el plugin: ¿hasta dónde llega el cambio?**
> Revisa lo decidido antes (el `irm` seguía escribiendo el kernel en `CLAUDE.md`/`AGENTS.md`):
> el usuario pide que las dos formas de instalar sean la misma vía, el kernel dentro de la
> skill `nzt` y sin escribir `CLAUDE.md` ni `AGENTS.md`. Para Claude Code hay evidencia (474,
> 475); para Codex no, porque C8 dejó sin verificar cómo carga una skill. Opciones: A, Claude
> Code ya y Codex después de probarlo (recomendada); B, los dos ya; C, probar Codex primero.

**QT-113** → B, los dos ya: el usuario lo prueba en Codex cuando esté hecho y verificado en
Claude Code. Riesgo aceptado: si Codex no carga `nzt` primero, sus usuarios se quedan sin el
método hasta corregirlo. — `usuario`

### 2026-11-04 · unidad 471

**Prueba en vivo, ronda 1** (Windows, `--plugin-dir nzt-software/dist/plugin`, sin `nzt-ai` instalado):
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
