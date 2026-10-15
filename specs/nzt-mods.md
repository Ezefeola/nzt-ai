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

| Mod | Qué hace | Lee | Spec | Estado |
|---|---|---|---|---|
| `nzt-state` | Panel lateral con el plan y el estado de la corrida: objetivo, fases, unidad en curso, pendientes, lo que espera | `Plan/state.json` | `specs/mods/nzt-state/spec.md` | construido, 0.4.0, en `mods/nzt-state/` |
| `nzt-context` | Barra del contexto consumido sobre el prompt, con las marcas 20/30/40 del kernel; le pasa la misma cifra al agente | la cifra de contexto de la sesión (ningún artefacto) | `specs/mods/nzt-context/spec.md` | construido, 0.2.0, en `mods/nzt-context/` |
| `nzt-changes` | Panel lateral al estilo Replay Theater que recorre, un diff por vez, lo que Claude editó en el último turno o todo lo cambiado contra `HEAD` | las ediciones de Claude del turno y el repositorio git del proyecto (ningún artefacto de NZT) | `specs/mods/nzt-changes/` (spec y mockup) | aceptado y cerrado, 0.4.0 (alto fijo, scroll, índice clickeable, regla de cambios); 0.4.1 con aire bajo la pestaña; 0.5.0 en verificación (aire entre partes, posición arriba, botones a la derecha, índice de HEAD por estado y carpeta desplegable), en `mods/nzt-changes/` |
| `nzt-files` | Panel lateral que recorre el proyecto como el explorador de VS Code: árbol de carpetas con marcas de git arriba y el archivo elegido abajo, solo lectura | las carpetas y archivos del proyecto y su repositorio git (ningún artefacto de NZT) | `specs/mods/nzt-files/` (spec y mockup) | aceptado y cerrado, 0.1.0; 0.1.1 con aire bajo la pestaña, en `mods/nzt-files/` |
| `nzt-hub` | Panel lateral que junta los mods de NZT: para qué es cada uno, su versión, un botón que lo abre y, para los que faltan, uno que copia el comando para instalarlos | los comandos y las opciones de la sesión y la lista de plugins instalados de Claude Code (ningún artefacto de NZT) | `specs/mods/nzt-hub/` (spec y mockup) | construido, 0.1.0, en `mods/nzt-hub/`; falta la prueba en vivo y la aceptación |

Esta tabla y la sección **Mods** del `README.md` del repo dicen lo mismo. Agregar un mod
cambia las dos.

## 6. Instalación

**Hoy (sin instalador):** se instala un mod por vez desde Claude Code, en una terminal. La
referencia `plugin-authoring` describe dos caminos:

- **Desde el repo publicado.** El repo es un marketplace: `.claude-plugin/marketplace.json`
  en la raíz tiene una entrada por mod (`"source": "./mods/<mod>"`), y un mod se instala con
  `/plugin install <mod> --marketplace Ezefeola/nzt-ai` (Claude Code 2.1.275 o posterior).
  Se desinstala con `claude plugin uninstall <mod>` y se actualiza con
  `claude plugin update <mod>`. `claude plugin validate .` revisa el marketplace y cada mod
  que lista. Agregar un mod agrega su entrada (M1, usuario 2026-10-14).
- **Mientras se desarrolla.** `claude --plugin-dir mods/<mod>` o la variable
  `CLAUDE_CODE_PLUGIN_DIRS` cargan el mod desde la carpeta.

**Después (instalador):** el instalador pregunta, al elegir Claude Code, si se instalan
también los mods, cuáles, y los instala globales (scope de usuario). Desinstalar NZT
pregunta si se desinstalan también. **No está construido ni diseñado:** cómo lo hace —si
llama a `claude plugin`, si escribe la configuración, cómo entra al manifiesto— es una
decisión de arquitectura que se toma cuando llegue esa corrida, contra la documentación
vigente de Claude Code.

## 7. Versionado

Cada mod tiene su propia versión en `plugin.json`, independiente de la de NZT (M2, usuario
2026-10-14). Una release de NZT no sube la versión de un mod que no cambió, y un cambio de
un mod no obliga a sacar una release de NZT. El changelog del repo nombra el mod cuando
cambia. `claude plugin tag mods/<mod>` crea el tag `<mod>--v<versión>` y comprueba que
`plugin.json` y la entrada del marketplace coincidan.

## 8. Fuera de alcance

- **Instalar mods desde el instalador.** Está descrito en la sección 6 y se construye en
  otra corrida.
- **Mods para Codex.** Codex no tiene mecanismo de plugins (`specs/nzt-installer.md`,
  sección 1), así que no hay a qué portar un mod.
- **Que un mod escriba artefactos de NZT** (RN-mod-lee-no-escribe).
- **Publicar los mods en un marketplace de terceros.** El repo como marketplace alcanza
  para el caso pedido.

## 9. Decisiones

- **M1 · El repo es un marketplace.** `.claude-plugin/marketplace.json` en la raíz, una
  entrada por mod. Propuesta del agente, aceptada por el usuario el 2026-10-14; hecho en la
  unidad 80.
- **M2 · Cada mod tiene su versión.** Propuesta del agente, aceptada por el usuario el
  2026-10-14 (sección 7).
