# nzt-ai

NZT tools for working with coding agents. Each product lives in its own folder.

| Product | What it is | Guide |
|---|---|---|
| **nzt-software** | The NZT method for software: a plugin for Claude Code and Codex, and the optional Claude Code mods | [`nzt-software/README.md`](nzt-software/README.md) |

## Quick install

Claude Code:

```text
/plugin marketplace add Ezefeola/nzt-ai
/plugin install nzt-software@nzt
```

Codex:

```bash
codex plugin marketplace add Ezefeola/nzt-ai
codex plugin add nzt-software@nzt
```

For updates and the mods, follow the [nzt-software guide](nzt-software/README.md#installation).

## The repository

```
.claude-plugin/marketplace.json   the Claude Code marketplace: nzt-software and its mods
.agents/plugins/marketplace.json  the Codex marketplace: nzt-software
.github/workflows/                one release workflow per product
Plan/state.json                   the state of the work in progress in this repo
Plan/specs/                       the specs; the decisions in nzt-core/decisions.md
nzt-software/                     the product: method, evals, mods, build and releases
```

If you come back to the project after a while, start with `Plan/state.json` and
[`Plan/specs/nzt-core/README.md`](Plan/specs/nzt-core/README.md).

## License

[MIT](LICENSE).
