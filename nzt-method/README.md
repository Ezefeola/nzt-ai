# nzt: el método genérico

Exploración en la rama `metodo-generico`, sacada de `pendientes-post-v5` el 2026-11-08. Un
método de trabajo para agentes que no está atado a ningún dominio: mantiene el contexto
entre sesiones, es ágil (nada obligatorio) y de calidad, y se apoya en plugins, MCPs o ambos
solo cuando el trabajo lo necesita. El saber de cada tema llega en paquetes aparte.

## Para retomar

Empezar por [`design/Idea.md`](design/Idea.md): tiene qué se quiere, las reglas de este
trabajo, **cómo retomar** y el **estado actual** con el próximo paso.

## Qué hay acá

| Carpeta | Qué tiene |
|---|---|
| `design/` | Los documentos de diseño, en español: idea, investigación, principios, paquetes, archivos, documentos y estructura |
| `plugin/` | El plugin `nzt` para Claude Code y Codex: sus manifiestos y sus ocho skills en inglés (`nzt`, `define`, `approach`, `plan`, `do`, `learn`, `tools`, `retro`), cada una con sus casos de prueba |
| `VERSION`, `release/` | La versión del plugin (la de su tag `nzt-vX.Y.Z`), el README de la rama `plugin-nzt` y las notas de cada versión; el workflow es `.github/workflows/nzt-release.yml` |

## Restricciones

- **Vive en el monorepo `nzt-ai`**, como una carpeta más en la raíz, al lado de
  `nzt-software/`.
- **Se publica por su cuenta**, en Claude Code y en Codex. Cada producto tiene su pipeline,
  y ese pipeline corre solo si se tocó su carpeta (`nzt-release.yml` filtra por `nzt-method/**`,
  `nzt-software-release.yml` por `nzt-software/**`).
- **`nzt-software` se puede mirar como referencia, pero no se modifica.**
- **Se trabaja sin NZT**, solo con Claude: sin `Plan/state.json` ni el flujo de unidades.
