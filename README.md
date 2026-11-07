# nzt-ai

Herramientas de NZT para trabajar con agentes de código. Cada producto vive en su carpeta.

| Producto | Qué es | Guía |
|---|---|---|
| **nzt-software** | El método NZT para software: el plugin para Claude Code, el instalador `nzt-ai` para Claude Code y Codex, y los mods opcionales de Claude Code | [`nzt-software/README.md`](nzt-software/README.md) |

## Instalación rápida

En Claude Code:

```text
/plugin marketplace add Ezefeola/nzt-ai
/plugin install nzt-software@nzt
```

Para Codex, el instalador y los mods, seguí la [guía de nzt-software](nzt-software/README.md#instalación).

## El repositorio

```
.claude-plugin/marketplace.json   el marketplace de Claude Code: nzt-software y sus mods
.github/workflows/                un workflow de release por producto
Plan/state.json                   el estado del trabajo en curso en este repo
Plan/specs/                       las specs y las decisiones (nzt-core.md)
nzt-software/                     el producto: método, evals, mods, build, CLI y releases
```

Si volvés al proyecto después de un tiempo, empezá por `Plan/state.json` y
[`Plan/specs/nzt-core.md`](Plan/specs/nzt-core.md).

## Licencia

[MIT](LICENSE).
