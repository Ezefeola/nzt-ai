# NZT — Mods

> Estado: **especificada** (2026-10-13) · código en `mods/` · una spec por mod en
> `specs/mods/` · Depende de: `specs/nzt-core.md` (secciones 2, 9 y D63) y
> `specs/nzt-installer.md` (sección 1)

## 1. Qué es un mod

Un mod es una **extensión de la interfaz o del comportamiento de Claude Code**: un panel
lateral, una banda sobre el prompt, un comando de barra, un hook sobre las llamadas a
herramientas o sobre el prompt. Técnicamente es un plugin de *function hooks*: una carpeta
con `.claude-plugin/plugin.json` y un único módulo de hooks (TypeScript) que nombra
`hooks/hooks.json` (fuente: referencia `plugin-authoring` incluida en Claude Code 2.1.296).

**NZT trae mods, y el método no depende de ninguno.** El kernel, los routers y las
referencias funcionan igual con o sin mods instalados. Un mod hace más visible o más cómodo
algo que NZT ya produce —el estado, el plan—, pero nunca es el único lugar donde eso existe.

Lo que separa un mod de una skill:

| | Skill | Mod |
|---|---|---|
| Qué es | Texto que el modelo lee | Código que corre Claude Code |
| Proveedores | Claude Code y Codex | Solo Claude Code |
| Dónde vive en el repo | `skills/` | `mods/` |
| Cómo se instala | El instalador, siempre (D18) | Aparte y opcional (sección 6) |

## 2. Reglas

### RN-mod-opcional · origin: usuario 2026-10-13
Instalar NZT no instala ningún mod. Los mods se eligen aparte, y quien no los instala tiene
el método completo.

### RN-nucleo-no-depende · origin: D63
Ninguna skill, referencia ni el kernel le pide al modelo algo que solo un mod puede dar.
Si una regla del método necesita un mod para cumplirse, la regla está mal ubicada.

### RN-mod-lee-no-escribe · origin: D63 (propuesta del agente, aceptada por el usuario 2026-10-14)
Un mod lee los artefactos de NZT (`Plan/state.json`, specs, documentos) y no los escribe.
El dueño de cada artefacto sigue siendo el método; un mod que escribe el estado abriría un
segundo camino para cambiarlo que el kernel no controla.

### RN-mod-solo-claude · origin: D63
Un mod existe solo para Claude Code. Si el instalador ofrece mods, al elegir Codex no los
ofrece y lo dice; no los instala a medias.

### RN-mod-documentado · origin: usuario 2026-10-13
Un mod no entra al repo sin su spec en `specs/mods/<mod>/spec.md`, su `README.md` y su fila en
el catálogo (sección 5 y `README.md` del repo).

### RN-mod-lee-formatos-viejos · origin: D63 (propuesta del agente, aceptada por el usuario 2026-10-14)
Si el formato de un artefacto que lee el mod cambia (como `Plan/state.json` en D61 y D62),
el mod sigue leyendo el formato anterior. Un proyecto que todavía no se reescribió no puede
romper el panel. Si un mod no puede leer un archivo, lo dice en su propia superficie y no
interrumpe la sesión.

### RN-mod-pestaña · origin: usuario 2026-10-15
Un mod con panel lleva en la pestaña **su nombre en una palabra, en el idioma del mod**, el
mismo con el que aparece su tarjeta en `nzt-hub`: Estado, Cambios, Archivos, Mods (State,
Changes, Files, Mods). Nunca solo "NZT": con varios paneles abiertos no se sabría cuál es
cuál. Adentro, la cabecera repite la marca y el nombre (` NZT ` + nombre) y **deja una línea
en blanco entre la pestaña y la cabecera**, para que no quede pegada a la selección de
pestañas. Pedido del usuario al ver `nzt-state` en vivo (*"esta deberia decir state o algo
asi, asi cuando tengo mas de una ventana abierta … puedo identificar bien cada una"* y *"no
debe estar tan pegado"*); los nombres los propuso el agente y el usuario los aprobó.

### RN-mod-tipo · origin: usuario 2026-10-17 ("tendriamos mods genericos y mods que necesitan del metodo NZT")
Cada mod es de uno de dos tipos, y el catálogo lo dice:

- **Genérico:** sirve en cualquier proyecto, use NZT o no. Puede tener una **capa NZT**: en un
  proyecto con NZT muestra algo más, pero sin NZT funciona completo. Ejemplo: `nzt-context`
  dibuja el contexto de cualquier sesión, y sus marcas 20/30/40 son las del kernel.
- **NZT:** necesita un artefacto del método para mostrar algo. Sin él, dice que no lo hay.
  Ejemplo: `nzt-state` sin `Plan/state.json`.

El tipo lo decide qué lee el mod, no su nombre: todos se llaman `nzt-*` porque los trae NZT.
`nzt-hub` agrupa las tarjetas por tipo (`specs/mods/nzt-hub/spec.md`). Los nombres de los
tipos y la regla, propuesta del agente aceptada por el usuario el 2026-10-17.

## 3. Estructura en el repo

```
nzt-ai/
├─ mods/
│  └─ <mod>/                       # una carpeta por mod; el nombre es el de plugin.json
│     ├─ .claude-plugin/
│     │  └─ plugin.json            # name, version, description, types
│     ├─ hooks/
│     │  ├─ hooks.json             # { "modules": ["./register.tsx"] }
│     │  ├─ register.tsx           # el módulo de hooks
│     │  ├─ <módulo>.ts            # lo que el módulo importa
│     │  └─ *.test.ts              # tests, corren con `claude plugin test`
│     ├─ types/index.d.ts          # el contrato de tipos del mod
│     ├─ tsconfig.json
│     └─ README.md                 # para quien lo usa: qué es, cómo se instala
├─ specs/
│  ├─ nzt-mods.md                  # este documento
│  └─ mods/<mod>/                  # una carpeta por mod, con el mismo nombre que en mods/
│     ├─ spec.md                   # la spec de la feature del mod
│     └─ mockup.html               # su mockup, si lo tiene
└─ .claude-plugin/marketplace.json # el repo como marketplace: una entrada por mod (sección 6)
```

- **La carpeta lleva el nombre del plugin**, sin prefijos ni alias. El mod del panel de
  estado es `mods/nzt-state/` porque su `plugin.json` dice `nzt-state` (usuario,
  2026-10-13: el nombre queda tal cual).
- **Los tipos que genera Claude Code no se versionan.** `.claude-plugin/types/` lo escribe
  el motor cada vez que carga el mod desde una carpeta, y ya trae su propio `.gitignore`.
  Se versiona el contrato propio del mod (`types/index.d.ts`).
- **`mods/` no entra al build de las skills.** `install/build.*` arma `dist/` desde
  `skills/` y `core/`; un mod no es una skill y no se aplana.
- **La spec del mod está en `specs/mods/<mod>/`, no adentro del mod.** Las specs del repo
  viven juntas; dentro del mod va el `README.md`, que es documentación de uso. Cada mod tiene
  su carpeta, con `spec.md` y, si se diseñó con mockup, `mockup.html` al lado (usuario,
  2026-10-14).

## 4. Qué lleva cada mod

| Pieza | Qué es | Quién la lee |
|---|---|---|
| `specs/mods/<mod>/spec.md` | Qué hace el mod, sus reglas, qué lee, sus estados, fuera de alcance | Quien lo cambia |
| `specs/mods/<mod>/mockup.html` | Cómo se ve, estado por estado; solo si el mod se diseñó con mockup | Quien lo cambia y quien lo revisa |
| `mods/<mod>/README.md` | Qué muestra, cómo se instala y cómo se desinstala | Quien lo usa |
| Fila en el catálogo | Nombre, una línea, estado | Quien instala NZT |
| `version` en `plugin.json` | La versión del mod | El instalador, `claude plugin update` |
| Tests | Lo que la spec dice que hace, contra el motor | `claude plugin test` |

Un cambio al mod cambia su spec en la misma unidad, como cualquier documento afectado
(kernel, *Guardrails*).

## 5. Catálogo

| Mod | Tipo | Qué hace | Lee | Spec | Estado |
|---|---|---|---|---|---|
| `nzt-state` | NZT | Panel lateral con el plan y el estado de la corrida: objetivo, fases, unidad en curso, pendientes, lo que espera | `Plan/state.json` | `specs/mods/nzt-state/spec.md` | construido, 0.4.0; 0.5.0 aceptado y cerrado (aviso de preguntas abiertas), en `mods/nzt-state/` |
| `nzt-context` | Genérico | Barra del contexto consumido sobre el prompt, con las marcas 20/30/40 del kernel; le pasa la misma cifra al agente | la cifra de contexto de la sesión (ningún artefacto) | `specs/mods/nzt-context/spec.md` | construido, 0.2.0, en `mods/nzt-context/` |
| `nzt-changes` | Genérico | Panel lateral al estilo Replay Theater que recorre, un diff por vez, lo que Claude editó en el último turno o todo lo cambiado contra `HEAD` | las ediciones de Claude del turno y el repositorio git del proyecto (ningún artefacto de NZT) | `specs/mods/nzt-changes/` (spec y mockup) | aceptado y cerrado, 0.4.0 (alto fijo, scroll, índice clickeable, regla de cambios); 0.4.1 con aire bajo la pestaña; 0.5.0 aceptado y cerrado (aire entre partes, posición arriba, botones a la derecha, índice de HEAD por estado y carpeta desplegable), en `mods/nzt-changes/` |
| `nzt-files` | Genérico | Panel lateral que recorre el proyecto como el explorador de VS Code: árbol de carpetas con marcas de git arriba y el archivo elegido abajo, solo lectura | las carpetas y archivos del proyecto y su repositorio git (ningún artefacto de NZT) | `specs/mods/nzt-files/` (spec y mockup) | aceptado y cerrado, 0.1.0; 0.1.1 con aire bajo la pestaña, en `mods/nzt-files/` |
| `nzt-hub` | Genérico | Panel lateral que junta los mods de NZT: para qué es cada uno, su versión, un botón que lo abre y, para los que faltan, uno que copia el comando para instalarlos | los comandos y las opciones de la sesión y la lista de plugins instalados de Claude Code (ningún artefacto de NZT) | `specs/mods/nzt-hub/` (spec y mockup) | aceptado y cerrado, 0.1.0; 0.2.0 aceptado y cerrado (grupos por tipo y `nzt-questions`), en `mods/nzt-hub/` |
| `nzt-questions` | Genérico | Panel lateral para contestar de a una, con opciones, las preguntas que el agente escribió en el chat; deja las respuestas en un solo mensaje en el prompt | las respuestas del agente en la sesión (ningún artefacto de NZT) | `specs/mods/nzt-questions/` (spec y mockup) | aceptado y cerrado, 0.1.0, en `mods/nzt-questions/` |

Esta tabla y la sección **Mods** del `README.md` del repo dicen lo mismo. Agregar un mod
cambia las dos. **Un mod entra al `README.md` cuando se publica**, no cuando se especifica: la
fila del `README.md` trae el comando de instalación, y con el mod sin publicar ese comando
falla.

## 6. Instalación

**A mano:** se instala un mod por vez desde Claude Code, en una terminal, y sigue siendo
posible con el instalador (RN-inst-mods-cuales). La referencia `plugin-authoring` describe dos
caminos:

- **Desde el repo publicado.** El repo es un marketplace: `.claude-plugin/marketplace.json`
  en la raíz tiene una entrada por mod (`"source": "./mods/<mod>"`), y un mod se instala con
  `/plugin install <mod> --marketplace Ezefeola/nzt-ai` (Claude Code 2.1.275 o posterior).
  Se desinstala con `claude plugin uninstall <mod>@nzt` y se actualiza con
  `claude plugin update <mod>@nzt`. `claude plugin validate .` revisa el marketplace y cada mod
  que lista. Agregar un mod agrega su entrada (M1, usuario 2026-10-14).
- **Mientras se desarrolla.** `claude --plugin-dir mods/<mod>` o la variable
  `CLAUDE_CODE_PLUGIN_DIRS` cargan el mod desde la carpeta.

**Con el instalador:** qué se elige y qué pasa cuando algo falla está en
`specs/nzt-installer.md` sección 11 (unidad 181, 2026-10-16): Todo NZT, solo el método o solo
los mods, y una línea `install-claude-full`. **Cómo** lo hace (M3, unidad 182; preguntas y
fuentes en la sección 10):

- **Con los comandos de Claude Code, como lo haría el usuario** (QT-01): registra el
  marketplace del repo desde `main` y después instala cada mod para toda la máquina, leyendo
  el resultado de cada uno para el reporte. Nunca copia archivos de un mod.
- **Desde `main`, la misma fuente que la instalación a mano** (QT-02): en la máquina hay un
  solo marketplace `nzt`, lo haya agregado quien lo haya agregado. Si ya hay uno registrado
  desde otra fuente —una carpeta local, un fork—, usa ese y el reporte dice de dónde viene
  (QT-08).
- **Qué hay instalado** lo pregunta él mismo a Claude Code, sin abrir sesión, y **quién lo
  instaló** lo anota en su manifiesto de Claude Code: un mod instalado que no figura ahí es del
  usuario (QT-04).
- **Sin CLI `claude`, o con una versión anterior a 2.1.287** (la primera con mods en la
  terminal), instala el método y explica cómo sumar los mods desde la app (QT-05, QT-06).
- **Desinstala mod por mod** los de su manifiesto y **nunca quita el marketplace**: quitarlo
  desinstala también los que el usuario instaló a mano (QT-07).
- **No activa la actualización automática** (QT-03): el reporte y la guía dicen cómo
  activarla, y volver a correr el instalador actualiza los mods.
- **`install-claude-full`** sale de las mismas fuentes que las otras líneas, con el proveedor
  y la opción de mods fijos (QT-09).

**Actualizar los mods**, se hayan instalado como se hayan instalado: la actualización
automática viene apagada para este marketplace (lo es para todo marketplace que no sea de
Anthropic). Se activa una vez en `/plugin` → **Marketplaces** → `nzt` → **Enable
auto-update**, y desde ahí cada sesión nueva baja las versiones nuevas y avisa con
`Run /reload-plugins`. Sin activarla, se actualiza a mano con `claude plugin update
<mod>@nzt`, con **Update marketplace** en esa misma pestaña, o volviendo a correr el
instalador.

**La guía para el usuario** —instalar con el instalador o a mano, activar la actualización
automática, actualizar a mano, desinstalar— está en la sección **Mods** del `README.md` del
repo, y cada `README.md` de mod la resume en su **Instalación** (unidad 191, 2026-10-16). Un
cambio en esta sección cambia esas guías y la de la landing.

## 7. Versionado

Cada mod tiene su propia versión en `plugin.json`, independiente de la de NZT (M2, usuario
2026-10-14). Una release de NZT no sube la versión de un mod que no cambió, y un cambio de
un mod no obliga a sacar una release de NZT. El changelog del repo nombra el mod cuando
cambia. `claude plugin tag mods/<mod>` crea el tag `<mod>--v<versión>` y comprueba que
`plugin.json` y la entrada del marketplace coincidan.

**Un cambio de un mod llega solo si sube su versión**: Claude Code toma la de `plugin.json` y,
mientras no cambie, no reemplaza la copia instalada.

### RN-mod-publica-antes · origin: QT-02 (usuario 2026-10-16)
Un mod que lee un formato nuevo de un artefacto de NZT se publica **antes o junto con** la
release del kernel que introduce ese formato. Los mods se instalan desde `main` y pueden ir
por delante del kernel instalado, nunca por detrás; RN-mod-lee-formatos-viejos cubre el resto.

## 8. Fuera de alcance

- **Mods para Codex.** Codex tiene plugins (skills, MCP, apps), pero no mods: nada que
  corra dentro de la app y dibuje en su interfaz (D24 y D63 revisados el 2026-10-16;
  `specs/nzt-installer.md` sección 1), así que no hay a qué portar un mod.
- **Que un mod escriba artefactos de NZT** (RN-mod-lee-no-escribe).
- **Publicar los mods en un marketplace de terceros.** El repo como marketplace alcanza
  para el caso pedido.

## 9. Decisiones

- **M1 · El repo es un marketplace.** `.claude-plugin/marketplace.json` en la raíz, una
  entrada por mod. Propuesta del agente, aceptada por el usuario el 2026-10-14; hecho en la
  unidad 80.
- **M2 · Cada mod tiene su versión.** Propuesta del agente, aceptada por el usuario el
  2026-10-14 (sección 7).
- **M3 · El instalador instala los mods con los comandos de Claude Code, desde `main`, y no
  activa la actualización automática** (sección 6, preguntas en la sección 10). Lo forzó la
  sección 11 de `specs/nzt-installer.md`.
  - **Opciones descartadas:** fijar el marketplace al tag de la release (QT-02 B): cada NZT
    traería sus mods probados, pero chocaría con la instalación a mano desde `main` (dos
    fuentes para un mismo nombre) y el arreglo de un mod esperaría una release de NZT.
    Activar la actualización automática escribiendo `~/.claude/settings.json` (QT-03 A):
    dejaría los mods al día solos, pero es la configuración entera de Claude Code, no un
    bloque delimitado.
  - **Lo que se acepta:** un mod puede ir por delante del kernel instalado (por eso
    RN-mod-publica-antes), y quien no active la actualización automática tiene los mods de
    la última vez que instaló o actualizó.
  - **Revertirlo** es cambiar la fuente que registra el instalador y migrar el marketplace ya
    registrado en las máquinas.
  - Decidido por el usuario el 2026-10-16: QT-02 A, QT-03 B, el resto con las propuestas del
    agente en una ronda (modo "juntos").

## 10. Preguntas técnicas: el instalador y los mods (unidad 182)

Registro **append-only**: una respuesta superada se marca con lo que la reemplazó, nunca se
borra. Sirve a `specs/nzt-installer.md` sección 11. Origen de cada entrada: `usuario`,
`agente, dentro del alcance`, `investigado` (con fuente y fecha) o `propuesta` (sin contestar).
Versión de Claude Code de referencia: 2.1.301 (la de esta máquina, 2026-10-16). Modo para los detalles: **juntos**, una ronda (usuario 2026-10-16).

Fuentes, leídas el 2026-10-16: [CLI de plugins](https://code.claude.com/docs/en/plugins/cli-reference),
[carga y actualizaciones](https://code.claude.com/docs/en/plugins/loading),
[instalar plugins](https://code.claude.com/docs/en/plugins/install),
[mods](https://code.claude.com/docs/en/plugins/mods).

### QT-01 · ¿Con qué instala el instalador cada mod?
- investigado: `claude plugin marketplace add <fuente>` registra el marketplace (si ya está,
  responde "already on disk" y sale con 0) y `claude plugin install <mod>@nzt --scope user
  --json` instala, con un JSON en la última línea de la salida (`--json` desde 2.1.268). El
  scope `user` es el de toda la máquina. No hace falta `--marketplace` (2.1.292+).
- propuesta: esos dos comandos, uno por mod, leyendo el JSON para el reporte.
- respuesta: ok, la propuesta · usuario 2026-10-16

### QT-02 · ¿De dónde instala el instalador los mods: `main` o el tag de la release?
- investigado: `marketplace add Ezefeola/nzt-ai#v1.3.0` fija el tag; sin `#` sigue la rama por
  defecto. Un mod con `version` en `plugin.json` solo se actualiza cuando esa cadena cambia.
- investigado: la instalación a mano que documenta el repo usa `main`, sin tag, y el usuario
  pidió que siga así.
- opciones:
  - **A · `main`, igual que a mano.** Un solo marketplace `nzt` en la máquina, sea quien sea que
    lo agregó; los arreglos de un mod llegan sin esperar una release de NZT. El riesgo es un
    mod más nuevo que el kernel instalado, y eso ya lo cubre RN-mod-lee-formatos-viejos (un
    mod lee los formatos anteriores). Hace falta una regla de publicación: un mod que lee un
    formato nuevo se publica **antes o junto** con la release del kernel que lo introduce.
  - **B · El tag de la release.** NZT 1.3.0 trae exactamente los mods probados con 1.3.0. Pero
    si el usuario ya agregó `nzt` desde `main` a mano, hay dos fuentes para el mismo nombre, y
    un arreglo de un mod no llega hasta la próxima release de NZT.
- recomendación del agente: **A**.
- respuesta: **A, `main`**, con la regla de publicación (un mod que lee un formato nuevo sale antes o junto con la release del kernel) · usuario 2026-10-16

### QT-03 · ¿El instalador activa la actualización automática de los mods?
- investigado: no hay comando para activarla. Se activa con `/plugin` → Marketplaces → Enable
  auto-update, o con `autoUpdate: true` en la entrada del marketplace dentro de
  `extraKnownMarketplaces` de `~/.claude/settings.json`. Para marketplaces de terceros viene
  apagada. Con `DISABLE_AUTOUPDATER=1` o `DISABLE_UPDATES=1` no corre salvo
  `FORCE_AUTOUPDATE_PLUGINS=1`. Corre en segundo plano después del primer mensaje de una
  sesión, y avisa "Run /reload-plugins".
- opciones:
  - **A · El instalador la activa**, escribiendo `autoUpdate: true` en `~/.claude/settings.json`
    con las mismas reglas que ya usa para `CLAUDE.md`: backup la primera vez, tocar solo esa
    clave, simulación antes. Los mods quedan al día solos.
  - **B · No la activa:** la simulación y el reporte dicen cómo activarla, y volver a correr el
    instalador actualiza los mods (RN-inst-mods-actualizar). No toca un archivo más del
    usuario.
- recomendación del agente: **B**. Es el archivo de configuración entero de Claude Code, no un
  bloque delimitado como el de `CLAUDE.md`, y la guía (unidad 191) cubre activarla en dos
  pasos.
- respuesta: **B, no la activa**; el reporte y la guía dicen cómo · usuario 2026-10-16

### QT-04 · ¿Cómo sabe qué mods hay instalados, su versión y quién los instaló?
- investigado: `claude plugin list --json` da por instalación `id` (`<mod>@nzt`), `version`,
  `scope` y `enabled`.
- propuesta: versión y presencia, de `plugin list --json`; quién lo instaló, del manifiesto de
  Claude Code del instalador, que suma la lista de mods que instaló él. Un mod instalado que no
  figura ahí es "a mano".
- respuesta: ok, la propuesta (aclarado: el instalador corre el comando solo, sin sesión) · usuario 2026-10-16

### QT-05 · ¿Qué versión mínima de Claude Code hace falta?
- investigado: los mods corren desde 2.1.287 en la terminal y 2.1.286 en el escritorio;
  `--json` en install desde 2.1.268.
- propuesta: 2.1.287, leída de `claude --version`. Por debajo, RN-inst-mods-sin-claude.
- respuesta: ok, la propuesta · usuario 2026-10-16

### QT-06 · ¿Cómo detecta que Claude Code no se puede usar desde la terminal?
- propuesta: si `claude --version` no corre o no devuelve una versión, no hay CLI
  (RN-inst-mods-sin-claude). Que la app de escritorio deje o no el comando en el PATH no se
  verificó, y con esta regla no hace falta saberlo.
- respuesta: ok, la propuesta · usuario 2026-10-16

### QT-07 · ¿Cómo desinstala?
- investigado: `claude plugin uninstall <mod>@nzt --scope user --json`. **Quitar el
  marketplace desinstala todos los plugins que vinieron de él**, también los que el usuario
  instaló a mano.
- propuesta: desinstala mod por mod los que figuran en su manifiesto y **nunca quita el
  marketplace**.
- respuesta: ok, la propuesta · usuario 2026-10-16

### QT-08 · Si ya hay un marketplace `nzt` registrado desde otra fuente (una carpeta local, un fork)
- investigado: agregarlo otra vez responde "already on disk" y sale con 0; la doc no dice si
  cambia la fuente.
- propuesta: el instalador usa el `nzt` que ya está y el reporte dice de dónde viene. No lo
  reemplaza: puede ser la copia de desarrollo de quien mantiene NZT.
- respuesta: ok, la propuesta · usuario 2026-10-16

### QT-09 · ¿Cómo sabe la línea `install-claude-full` que tiene que instalar todo?
- propuesta: igual que el proveedor: `install/variants.sh` arma la variante desde las mismas
  fuentes, fijando el proveedor `claude-code` y una opción de mods, y el script se la pasa al
  CLI (`install --provider claude-code --mods all`).
- respuesta: ok, la propuesta · usuario 2026-10-16
