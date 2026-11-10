# nzt-ai

NZT tools for working with coding agents. Each product lives in its own folder.

| Product | What it is | Guide |
|---|---|---|
| **nzt** | The generic NZT method, for any work in any domain: a plugin for Claude Code and Codex | [`nzt-method/README.md`](nzt-method/README.md) |
| **nzt-software** | The NZT method for software: a plugin for Claude Code and Codex | [`nzt-software/README.md`](nzt-software/README.md) |
| **mods** | Optional Claude Code mods: general ones (`nzt-*`) and ones for a plugin (`nzt-software-*`) | [`nzt-software/README.md`](nzt-software/README.md#mods) |

## Quick install

Both plugins come from the same `nzt` marketplace. Install the one you want: `nzt` for any
work, `nzt-software` for software.

Claude Code:

```text
/plugin marketplace add Ezefeola/nzt-ai
/plugin install nzt@nzt
/plugin install nzt-software@nzt
```

Codex:

```bash
codex plugin marketplace add Ezefeola/nzt-ai
codex plugin add nzt@nzt
codex plugin add nzt-software@nzt
```

For updates and the mods, follow the [nzt-software guide](nzt-software/README.md#installation).

## The repository

```
.claude-plugin/marketplace.json   the Claude Code marketplace: nzt, nzt-software and the mods
.agents/plugins/marketplace.json  the Codex marketplace: nzt and nzt-software
.github/workflows/                one release workflow per product (tags vX.Y.Z and nzt-vX.Y.Z)
Plan/state.json                   the state of the work in progress in this repo
Plan/specs/                       the specs; the decisions in nzt-core/decisions.md
nzt-method/                       nzt, the generic method: design, plugin and releases
nzt-software/                     nzt-software: method, evals, build and releases
mods/                             the Claude Code mods, one per folder
```

If you come back to the project after a while, start with `Plan/state.json` and
[`Plan/specs/nzt-core/README.md`](Plan/specs/nzt-core/README.md).

## License

[MIT](LICENSE).
