# Los archivos del trabajo (en debate)

Borrador del 2026-11-08 para lo que quedó abierto en `Principios.md`: el nombre, el lugar y
el contenido del **archivo de estado** (principio 8) y del **archivo de herramientas**
(principio 10). Todo es *propuesta de Claude* hasta que figure en **Decididos**.

**Referencia:** `nzt-software` usa `Plan/state.json` (estado, en JSON) y
`Docs/agent-tools.md` (herramientas). Acá se propone Markdown para los dos, porque el
principio 8 pide archivos legibles por una persona, y el trabajo puede no ser de software.

## Dónde van

- **Si el trabajo ya tiene carpeta** (un repositorio, una carpeta de documentos): una
  carpeta del método en su raíz.
- **Si no la tiene** (una mudanza, un evento): el agente propone dónde crear la carpeta del
  trabajo, y la del método va adentro.
- **Nombre de la carpeta:** el del método, que todavía es provisorio (`Idea.md`). Mientras
  tanto, `<método>/`. Visible, no oculta (sin punto adelante), para que la persona la vea y
  la pueda leer.

```
<carpeta del trabajo>/
├── <método>/
│   ├── estado.md
│   └── herramientas.md
└── … lo que produce el trabajo
```

- **Al paso no se crea nada** (principio 2). Con plan corto se crea `estado.md`;
  `herramientas.md` solo cuando se instala o se rechaza la primera herramienta.

## `estado.md`

Uno solo por trabajo (P2). Corto: lo que una sesión nueva necesita para seguir.

```markdown
# <Nombre del trabajo>

## Qué es
Qué se quiere lograr y para quién. Tamaño: <al paso | con plan corto | por partes>.

## Hecho cuando
El criterio acordado (principio 6).

## Unidades
| Unidad | Quién hace | Estado | Veredicto |
|---|---|---|---|
| … | agente / persona / los dos | pendiente / en curso / parada | hecho / parcial / no logrado |

## Decisiones
- **<fecha> — <qué se decidió>.** Por qué: <motivo>.

## Dónde estamos
Qué se hizo en la última sesión y qué quedó sin comprobar.

## Próximo paso
Lo que el agente recomendó y si la persona ya lo aprobó.
```

Las secciones vacías no se escriben. Si un tiempo fijo aplica (principio 14), va en *Qué
es*, y lo recortable se marca en *Unidades*.

## `herramientas.md`

Todo lo que usa el trabajo además del agente: plugins, MCPs y paquetes de dominio (PQ2).

```markdown
# Herramientas

## En uso
| Nombre | Tipo | Para qué | Fuente | Dónde está instalado | Desde | Comprobado |
|---|---|---|---|---|---|---|
| … | plugin / MCP / paquete | … | URL oficial | este trabajo / el equipo | fecha | cómo se comprobó que responde |

## Rechazadas
| Nombre | Para qué se ofreció | Fecha |
|---|---|---|
```

*Rechazadas* existe para cumplir "lo que la persona rechaza no se vuelve a ofrecer".

## Preguntas

- **A1. Idioma de los nombres:** ¿`estado.md` y `herramientas.md` en español, o en inglés
  (`state.md`, `tools.md`) como `nzt-software`? Depende de en qué idioma se escribe el método
  y para quién se publica.
- **A2.** ¿Te sirven las secciones de `estado.md` y las columnas de `herramientas.md`, o
  falta o sobra algo?
- **A3.** ¿La carpeta del método visible en la raíz del trabajo te parece bien?

## Decididos

- **A1 (2026-11-08): los archivos y las skills del método van en inglés.** Los nombres de
  arriba (`estado.md`, `herramientas.md`) y los títulos de sus secciones se traducen al
  escribir el método. Lo que se escribe *dentro* de los archivos va en el idioma de la
  persona (regla 8 de `Documentos.md`). Los documentos de diseño de esta carpeta siguen en
  español.
- **A2 (2026-11-08):** las secciones del archivo de estado y las columnas del de
  herramientas están bien.
- **A3 (2026-11-08): no hay carpeta del método.** Se descarta `<método>/` y la sección
  *Dónde van* de arriba queda reemplazada por la decisión siguiente.
- **Lugar (2026-11-08): carpetas genéricas, como en `nzt-software`.** El estado va en
  `Plan/state.md` y las herramientas en `Docs/agent-tools.md`, dentro de la carpeta del
  trabajo. Si el trabajo no tiene carpeta, el agente propone dónde crearla (principio 8).
  Siguen valiendo los momentos de creación: al paso no se crea nada, con plan corto se crea
  `Plan/state.md`, y `Docs/agent-tools.md` aparece con la primera herramienta instalada o
  rechazada.

```
<carpeta del trabajo>/
├── Plan/
│   └── state.md
├── Docs/
│   ├── agent-tools.md
│   └── glossary.md
└── … lo que produce el trabajo
```

- **Glosario (2026-11-08, principio 15):** `Docs/glossary.md` se crea con el primer término
  que haga falta fijar, también en un trabajo al paso si aparece uno. Forma propuesta:

```markdown
# Glossary

| Término | Qué significa en este trabajo | No confundir con |
|---|---|---|
| … | … | otro término parecido, si lo hay |
```

  Orden alfabético; un término por concepto; si un término cambia, se reemplaza y se anota
  en *Decisiones* de `Plan/state.md`.

- **Herramientas, al escribir `nzt-tools` (2026-11-09, decidido por el usuario con lo
  recomendado por Claude):**
  - **T1. Columnas:** las de A2, y *Rechazadas* suma **Motivo** (como en `nzt-software`),
    para que se entienda por qué no se vuelve a ofrecer.
  - **T2. Trabajo al paso sin carpeta:** si se instala o se rechaza una herramienta, el
    agente **propone crear la carpeta del trabajo** para anotarla en `Docs/agent-tools.md`.
  - **T3. Qué cuenta como herramienta:** plugins, MCPs y paquetes, **y también los programas
    que el agente usa** (por ejemplo, de línea de comandos) cuando se instalan para el
    trabajo. Tipo: `plugin / MCP / package / program`.
  - **T4. "Si está anotada, se usa":** una línea en el paso 3 de `nzt`, que ya lee
    `Docs/agent-tools.md`: cuando una herramienta anotada cubre lo que hay que hacer, se
    hace a través de ella; si lo que dice contradice lo decidido en el trabajo, gana lo
    decidido y se avisa.
  - **T5. Alcance:** se instala en el alcance más chico que sirva (el trabajo antes que todo
    el equipo). Si el host no permite ese alcance, **se avisa y se pregunta** antes de
    instalar más arriba.
