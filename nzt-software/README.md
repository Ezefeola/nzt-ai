# NZT

**A working method for coding agents.** It does not add knowledge to the model or limit it:
it gives it shape —method, memory and stops— so it performs steadily instead of in bursts.

```
 DISCOVERY     ARCHITECTURE  DESIGN        BUILD         VERIFY        SHIP
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ What and │  │ How it   │  │ Screens  │  │ Code     │  │ Tests    │  │ Version  │
│ for whom │─▶│ is built │─▶│ and flows│─▶│ and tests│─▶│ and data │─▶│ and ship │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
 :discovery    :architecture :design       :build        :verify       :ship

 Each phase is cut into units, and every unit runs the same loop:

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Understand│─▶│ Propose  │─▶│ Execute  │─▶│ Verify   │─▶│ Record   │─▶ stops and reports
└──────────┘  └────┬─────┘  └──────────┘  └──────────┘  └──────────┘
                   └─▶ the plan goes to Plan/state.json and waits for your approval
```

The name comes from *Limitless*, a film in which NZT is a fictional pill that lets the main
character make the most of his mental abilities.

In *Limitless*, the pill teaches Eddie nothing new: it gives him ordered access to what he
already knows. That is NZT for Claude Code and Codex. **The agent is still the agent; NZT is
the discipline.** And the film's bad consequences came from taking it without structure, so
here the structure is the product: stop points, persisted state and human review.

## What it is for

An agent without a method is very fast at doing what you did not ask for. The five problems
NZT exists to prevent:

| Without NZT | With NZT |
|---|---|
| Writes code before anyone defined what it has to do | Functional analysis first, and whatever is undefined **is a question, not an assumption** |
| Starts and does not stop until something breaks | Cuts the work into reviewable units and **stops to wait for you** at the end of each one; to move faster you give it a closed batch (N units, or up to a milestone), and it still stops past 40% of context |
| Runs out of context and you lose the thread | The plan and the state live in `Plan/state.json`: work resumes without explaining it again |
| Picks the pattern it likes today, different from yesterday's | The technical document (`Docs/Architecture/tech.md`) decides, and **only what that document declares applies** |
| Tells you it works | Reports what happened: the test that failed, the step it skipped, the assumption it made |

What you gain is not better code: it is that **you can review what it did, pick up where you
left off, and not find out at the end that it understood something else.**

## How it works

Three layers, the top one always loaded, plus the software rules the project declares.

**1. The kernel** (~115 lines) lives inside the `nzt` skill, which the provider loads first in
every session: nothing is written to your `CLAUDE.md` or your `AGENTS.md`, the same with the
plugin as with the one-line installer. It carries the loop, the stops, the state format and
**the routing table**. That last one is the most important design decision of the set: which
skill to load is *instructed in a table*, not left to the model guessing from descriptions.

**2. The routers.** They are the skills: one per phase, plus the entry one (`nzt`), research
(`nzt-research`), delegating to a subagent —readings, or units the approved plan marked as
parallel— (`nzt-delegate`) and, only when you ask for it, retro (`nzt-retro`): it reviews the
session and leaves improvement proposals in a markdown file outside the repo, changing
nothing. They do not do the work: they read the request and the technical document, and say
which reference to read.

**3. The references.** One file per job, up to 200 lines, in its router's `references/`
folder. Only the one the task needs is read, and **it takes no room in the skill listing**,
which the provider loads in every session: the whole set is 13 entries.

```
request → kernel (routing table) → router → the matching reference
                                          ↘ what tech.md declares → its nzt-software reference
```

The loop the kernel enforces is always the same: **understand → propose → execute in units
→ verify → record**, scaled to the request in three sizes: **direct** (a bug, a small change:
no plan, no state), **standard** (an improvement or a feature of one or two stories: a short
plan, approved once) and **full** (a product, a large feature: in slices of one to three
stories). That is what makes it hold up in daily use.

### The phases

| Phase | What it covers |
|---|---|
| `nzt-discovery` | What to build: requirements, business rules, specs, stories, and changes to a feature that already exists |
| `nzt-architecture` | How it is solved: components, technical document, domain model, technical design, ADRs and RFCs, diagrams |
| `nzt-design` | Screens, flows, design system, usability review, and **the end user's manual**: interactive HTML, organized by what the person came to do |
| `nzt-build` | The code, and the tests that ship with it |
| `nzt-verify` | Designing and running tests —API or screen, and it says which before running—, **creating the data that is missing and deleting it afterwards**, measuring the performance the user expects, recording the evidence, and reading code or documents for what does not hold |
| `nzt-ship` | Versioning, CI/CD, deployment, observability |
| `nzt-learn` | **Teaching you** instead of doing it for you |

`nzt-learn` is the set's second mode: curriculum, lessons, exercises with their solutions
kept apart, assessment and spaced reviews. It triggers when you ask to learn, not when you
ask for the work to be done.

### Software rules and the agent's tools

What belongs to a technology, an architecture style or your code rules lives in the
`nzt-software` skill, which comes with the method:

| Rules | Bring |
|---|---|
| `code` | your code rules for any language: names, functions, errors, collections, DTOs |
| `backend` | technology-free backend: architectures, anemic model, persistence, use cases, validation, errors, API, security, data access |
| `frontend` | technology-free frontend: architecture, components, forms, rendering, performance |
| `ddd` | aggregates, value objects, bounded contexts and their diagrams |
| `csharp` | modern C# |
| `dotnet` | .NET: EF Core, minimal APIs or controllers, results, tests, containers, pipeline, observability |
| `blazor` | Blazor: render modes, components, forms, prerendering |

`Docs/Architecture/tech.md` is the product's technical document: one section per component
with its areas, its technologies (language, runtime, framework), its decisions, its practices
—DDD, test levels…—, its dependencies and its conventions. `nzt-architecture` writes it, and
the **axes** —architecture, domain model, persistence, endpoints, render mode…— are asked
once, with what each option costs. **An `nzt-software` rule applies only if `tech.md`
declares its technology or its practice**, and in a repository with its own conventions
NZT's step aside and the difference is reported instead of applied.

**The agent offers you the tools the work needs, in any phase**: an MCP server, a plugin or
both, to read a technology's documentation, drive an editor, see the screen. NZT ships no
list: it searches official sources and tells you where it found each tool and when, what it
installs, what it can access, what you have to do by hand and what it cannot do. With your
yes it installs it **in the project**, never globally, checks that it responds and records
it in `Docs/agent-tools.md`. One you decline is not offered again.

## Installation

### Plugin for Claude Code

In Claude Code, add the marketplace and install the method:

```text
/plugin marketplace add Ezefeola/nzt-ai
/plugin install nzt-software@nzt
```

Open a new session. The plugin includes the subagents and the software rules. Inside the
plugin the skills have no `nzt-` prefix: `/nzt-software:nzt`, `/nzt-software:build`,
`/nzt-software:verify`. Choose a single way to install the method. If you come from the
installer and want to switch to the plugin, first remove the method with
`nzt-ai uninstall --provider claude-code --mods none`.

If you have the v5 `nzt` plugin, uninstall it before installing `nzt-software`, so the
kernel does not load twice:

```text
/plugin uninstall nzt@nzt
```

### Installer for Claude Code and Codex

To update from v4, run your provider's line again. The installer removes the block it
managed in your instructions file and keeps your text. The method now lives in the `nzt`
skill, and the state check runs from `nzt-plan`'s scripts.

**Claude Code**

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.ps1 | iex"
```

```bash
# macOS and Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.sh | sh
```

**Codex**

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.ps1 | iex"
```

```bash
# macOS and Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.sh | sh
```

**Claude Code with the mods** — the method and the [mods](#mods), without asking anything

```powershell
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.ps1 | iex"
```

```bash
# macOS and Linux
curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude-full.sh | sh
```

Each line downloads the installer to a temporary folder, verifies its SHA256, installs NZT
for that provider —the skills, with the kernel inside `nzt`, and the mods if it is the
`install-claude-full` line; if an earlier version left a block in `CLAUDE.md` or `AGENTS.md`,
it removes it and keeps your text—, leaves a copy as `nzt-ai` (in `%LOCALAPPDATA%\nzt\bin`,
which is added to the user's PATH, or in `~/.local/bin`) and deletes the temporary folder.
**To update, run the same line again.** To uninstall, the same line with
`$env:NZT_UNINSTALL='1'; irm … | iex` on Windows or `curl … | NZT_UNINSTALL=1 sh` elsewhere.

From the repo, with .NET 10, there is the full installer:

```bash
dotnet run --project nzt-software/cli/src/Nzt.Cli
```

The menu has four actions —**install, uninstall, verify the content and show status**—, lets
you pick Claude Code, Codex or both —and in Claude Code, all of NZT, only the method or only
the mods—, and **shows you the dry run before it asks**. It installs the skills and the
subagents in the provider's user folders.

```bash
dotnet run --project nzt-software/cli/src/Nzt.Cli -- status
dotnet run --project nzt-software/cli/src/Nzt.Cli -- uninstall --provider claude-code
```

More details in [`nzt-software/cli/README.md`](cli/README.md).

## Mods

NZT comes with **mods**: extensions to the Claude Code interface that make what the method
produces visible. **They are optional**: installing NZT installs none of them and the method
works fully without them. They exist only for Claude Code, because Codex has no mods.

The **generic** ones work in any project, NZT or not; the **NZT** ones need an artifact of the
method to show something.

| Mod | Type | What it does | Install |
|---|---|---|---|
| [`nzt-state`](mods/nzt-state/README.md) | NZT: needs `Plan/state.json` | Side panel with the run's plan and state, read from `Plan/state.json` and updated live | `/plugin install nzt-state --marketplace Ezefeola/nzt-ai` |
| [`nzt-changes`](mods/nzt-changes/README.md) | Generic | Replay Theater-style side panel: steps, one diff at a time, through what Claude edited in the last turn or everything changed against `HEAD` | `/plugin install nzt-changes --marketplace Ezefeola/nzt-ai` |
| [`nzt-files`](mods/nzt-files/README.md) | Generic | Side panel that browses the project like VS Code's explorer: folders that open and close, git marks, what Claude reads and writes, and the chosen file below, read-only and without using context | `/plugin install nzt-files --marketplace Ezefeola/nzt-ai` |
| [`nzt-look`](mods/nzt-look/README.md) | Generic, with an NZT layer | Themes (NZT and fifteen more, dark and light), a band above the prompt with the context and its 30/40 marks, the plan's limits, the cost and the model with its effort, and the conversation redrawn: tools, console, diffs, tables, code, formulas and diagrams | `/plugin install nzt-look --marketplace Ezefeola/nzt-ai` |

### Installing them

- **With the installer.** The `install-claude-full` line installs the method and every mod.
  From the repo, `dotnet run --project nzt-software/cli/src/Nzt.Cli -- install --provider
  claude-code --mods all` does the same, `--mods only` installs only the mods, and the menu
  asks what you want. It needs the `claude` command in the terminal, version 2.1.287 or
  later; without it, it installs the method and tells you how to add the mods by hand.
- **By hand, one at a time.** The line from the table, in a Claude Code session in the
  terminal. The first time it asks whether to add the marketplace: answer `y` and choose the
  **user** scope to have it in every project.

Both ways use the same `nzt` marketplace, which comes from this repo's `main` branch: the
installer updates a mod you installed by hand, but never uninstalls it.

### Updating them

Each mod has its own version, independent of NZT's, and Claude Code downloads a new one only
when that version goes up.

- **Automatic.** Off by default, as in every marketplace not from Anthropic. Turn it on once:
  `/plugin` → **Marketplaces** → `nzt` → **Enable auto-update**. From then on each new
  session downloads new versions and says `Run /reload-plugins` to load them.
- **By hand.** `claude plugin update <mod>@nzt` in the terminal (for example,
  `claude plugin update nzt-state@nzt`), **Update marketplace** in that same `/plugin` tab, or
  run the installer again, which updates every mod there is.

### Uninstalling them

`claude plugin uninstall <mod>@nzt` removes one. When uninstalling, the installer removes only
the mods it installed (`uninstall --provider claude-code --mods only` keeps the method).
**Do not remove the `nzt` marketplace**: that uninstalls every mod that came from it at once.

How a mod is built and what it has to include is in
[`Plan/specs/nzt-mods.md`](../Plan/specs/nzt-mods.md).

## What it does not do

As important as the rest:

- **It does not restrict what the model knows** or what it can do. It defines how it works.
- **It does not hand off decisions.** One conversation owns the plan, the state and every
  decision, and stops at the edges of each unit. It can send work to two subagents of its
  own: one reads for it and the other runs the units the approved plan marked as parallel.
  Without subagents, or with `delegation` set to `off`, everything runs in this conversation,
  one unit after another. It does not install global MCP servers: the ones it offers and you
  accept go to the project's MCP file, which travels with git.
- **It does not guarantee the model always picks the right skill.** That is why routing is
  instructed and why there is an eval suite that measures it.
- **It does not decide for you.** It prescribes the procedure, not the technical judgment:
  NZT says *how to work*; you and the model decide *what to build*.

## The repository

All of nzt-software lives in this folder; the specs and the state of the work, in `Plan/` at
the repo root.

```
nzt-software/
  method/core/     kernel.md + one adapter per provider
  method/skills/   the method's skills (nested here, flat once installed)
  method/agents/   the subagents, for Claude Code and for Codex
  evals/           the suite that measures whether the right skill triggers
  mods/            the Claude Code mods, one per folder (optional)
  build/           build.sh / build.ps1 — the development loop, builds dist/
  cli/             nzt-ai, the CLI that installs, with its checks
  cli/install/     install.ps1 / install.sh / variants.sh — the one-line commands
  release/         the plugin branch's README and each version's notes
  presentation/    the NZT deck
Plan/specs/        nzt-core/ — the founding spec, plus the installer's, the plugin's, the mods' and one per mod
```

**13 skills with 137 references**, 76 of them in `nzt-software`. The current plan and where it
stands are in [`Plan/state.json`](../Plan/state.json); the decisions taken and their history,
in [`Plan/specs/nzt-core/`](../Plan/specs/nzt-core/README.md) —the current state opens
[`build-status.md`](../Plan/specs/nzt-core/build-status.md)—. If you come back to the project
after a while, start with those two.

## License

[MIT](../LICENSE).
