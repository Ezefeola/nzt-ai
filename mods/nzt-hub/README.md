# nzt-hub

> Versión **0.4.0** · spec en [`specs/mods/nzt-hub/spec.md`](../../specs/mods/nzt-hub/spec.md)

Un panel lateral de Claude Code que **junta los mods de NZT en un lugar**: qué hay, para qué
es cada uno, qué versión tenés y un botón que lo abre. Los que no tenés instalados también
aparecen, con un botón que copia el comando para instalarlos.

```
╭────────────────────────────────────────────────────────╮
│ █▄ █ ▀▀█ ▀█▀                                           │
│ █ ▀█ █▄▄  █                                            │
│ los mods de Claude Code          ● ● ● ● 2 de 4 inst…  │
│ ────────────────────────────────────────────────────── │
│ CON EL MÉTODO NZT                                      │
│ ┃ ◆ Estado v0.5.0                            Abrir ›   │
│ ┃ El plan y el estado de la corrida, leídos de Plan/…  │
│                                                        │
│ PARA CUALQUIER PROYECTO                                │
│ ┃ ▤ Archivos v0.1.1                          Abrir ›   │
│ ┃ El proyecto como el explorador de VS Code, solo pa…  │
│                                                        │
│ ┃ ± Cambios no instalado         ⧉ Copiar instalación  │
│ ┃ Lo que Claude editó en el último turno o contra HE…  │
│ ┃ ✓ Copiado · pegalo en el prompt y apretá Enter.      │
│                                                        │
│ [ Cerrar ]                                             │
╰────────────────────────────────────────────────────────╯
```

Las tarjetas van en dos grupos: arriba los mods que necesitan el método NZT para mostrar algo
(Estado) y abajo los que sirven en cualquier proyecto (Cambios, Archivos, Preguntas, Aspecto). Cada mod lleva una barra y un glifo de su color. El mockup completo, con todos sus estados,
está en [`specs/mods/nzt-hub/mockup.html`](../../specs/mods/nzt-hub/mockup.html).

**Es opcional.** NZT funciona completo sin el panel, y cada mod se sigue abriendo con su
propio comando. Funciona solo en Claude Code, porque Codex no tiene mods.

## Cómo se usa

```
/nzt-hub
```

Abre el panel; `/nzt-hub` otra vez lo cierra. Con el panel enfocado:

| Tecla | Hace |
|---|---|
| Tab | recorrer los botones |
| Enter o clic | apretar el botón: abrir el mod o copiar su instalación |
| rueda | mover la lista cuando no entra |
| `c` o Escape | cerrar |

**Abrir ›** corre el comando del mod, como si lo escribieras, y el hub se cierra para dejarle
su lugar. Para volver, `/nzt-hub`. Si Claude está trabajando, la fila dice que el mod se abre
al terminar el turno: Claude Code corre el comando cuando la sesión queda libre.

**Copiar instalación** pone en el portapapeles
`/plugin install <mod> --marketplace Ezefeola/nzt-ai`; pegalo en el prompt y apretá Enter. Si
la terminal no deja copiar, la fila lo dice y muestra el comando entero para seleccionarlo.

## Dónde aparece

Claude Code pone el panel **al costado de la conversación** solo en pantalla completa y con
la terminal de 110 columnas o más; ahí lo abre de 58 columnas y con todo el alto. Si no, lo
pone **sobre el prompt**, de 24 filas, y `/nzt-hub` dice por qué.

Un mod cuenta como instalado cuando esta sesión tiene su comando o sus opciones en
`/config`. La versión sale de la lista de plugins instalados de Claude Code; un mod cargado
con `--plugin-dir` no está en esa lista y se ve sin versión. El panel solo lee: no instala, no
actualiza ni cambia la configuración de ningún mod.

## Idioma

El panel habla **español** (por defecto) o **inglés**. Se elige al instalarlo y se cambia
en el menú de configuración de Claude Code o con:

```bash
claude plugin configure nzt-hub
```

## Instalación

En una sesión de Claude Code en la terminal (versión 2.1.275 o posterior):

```
/plugin install nzt-hub --marketplace Ezefeola/nzt-ai
```

Contestá `y` para agregar el marketplace y elegí el scope **user** para tenerlo en todos
los proyectos.

También viene con NZT: la línea `install-claude-full`, o el instalador con `--mods all`,
instala todos los mods (sección **Mods** del [`README.md`](../../README.md) del repo).

**Para actualizarlo**, la actualización automática viene apagada: se activa una vez en
`/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**, y cada sesión nueva baja la
versión nueva y avisa `Run /reload-plugins`. A mano: `claude plugin update nzt-hub@nzt` en
la terminal, o volver a correr el instalador de NZT.

Para desinstalarlo, desde la terminal: `claude plugin uninstall nzt-hub@nzt`.

## Desarrollo

```bash
claude plugin validate mods/nzt-hub   # manifiesto, hooks y contrato de tipos
claude plugin test mods/nzt-hub       # los tests de hooks/*.test.ts(x)
claude --plugin-dir mods/nzt-hub      # una sesión con el mod cargado desde la carpeta
```

Que los tests pasen no prueba que el módulo cargue en una sesión: probalo siempre cargado
de verdad. Todo lo que use `$` va en `hooks/register.tsx`, porque la sesión no acepta `$`
pasado a una función importada de otro archivo. El catálogo de mods está en
`hooks/catalog.ts`: agregar un mod a NZT lo agrega ahí también.

El chequeo de tipos (`tsc -p mods/nzt-hub/tsconfig.json`) necesita los tipos del motor en
`.claude-plugin/types/`. Claude Code los escribe ahí cuando carga el mod desde la carpeta,
con su propio `.gitignore`, así que git no los sigue.

La spec, con sus reglas, está en [`specs/mods/nzt-hub/spec.md`](../../specs/mods/nzt-hub/spec.md),
con el mockup al lado, y las reglas de todos los mods, en [`specs/nzt-mods.md`](../../specs/nzt-mods.md).
