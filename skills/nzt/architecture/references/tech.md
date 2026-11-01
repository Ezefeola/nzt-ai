# The technical document

Produces `Docs/Architecture/tech.md`: one card per component with what every phase needs to
do the work correctly — its technologies, the packs that guide it, the decisions those packs
ask, the opt-ins, the dependencies and the conventions. Read in a minute; it works for any
product: a web system, a game, a mobile app, a book, a course.

## Contents
- Steps
- The file
- Rules
- Done when

## Steps

1. **Read the product and its components**: `Docs/Product/product.md` (who it is for, where
   it runs or is delivered, constraints of team, budget, lifetime) and
   `Docs/Architecture/architecture.md` (components and their areas). For an existing
   component, read its evidence first — manifests, configuration, version pins, the work
   already there: **evidence answers; ask only what it cannot settle**.
2. **Derive each component's technology decisions from what it is**, never from a fixed
   list. Examples of what comes out:

   | The component is | Its decisions usually include |
   |---|---|
   | a service or API | runtime, language, data store, test framework |
   | a web or mobile client | framework, target devices, rendering, test framework |
   | a game | engine and version, target platforms, scripting language, input, asset pipeline |
   | a document, book or course | format, authoring toolchain, publishing channel |

3. **Resolve them as the router says**, in one round ordered by dependency (the technology
   before what depends on it). Facts here are versions, support windows, licences and
   platform limits.
4. **Prepare the work.** Once the technologies are chosen, or when the user asks what you
   need, propose in one round — written for someone who knows none of it:
   - **What you will do and what each part needs**: writing the work, running it, reading
     its documentation, seeing its output.
   - **How each need is met — catalogue and research, always both**: `nzt-ai project
     packs`, and the MCP servers, editor packages, CLIs or SDKs the technologies offer an
     agent (`nzt-research`, *a tool for the agent*), even when a pack matches. Each with
     its source and date and what it brings; when the research contradicts a pack, say so.
   - **What the user does by hand**, step by step in plain words: install, approve a
     connection, create an account or a key.
   - **What you cannot do even with all of it** — judge how it feels, try it where you
     cannot reach — so the user knows where they are needed.
   - **What to keep in mind**: licences, costs, permissions, what it installs on the machine.

   On the user's yes, install **in the project, never globally**: a pack with `nzt-ai
   project add <pack>...` (`--provider codex` or `all` when the project uses Codex); a
   researched MCP server in the provider's project file (`.mcp.json`, `.codex/config.toml`),
   which `nzt-ai project` leaves untouched. Guide the user's steps. No pack and nothing
   found, or no `nzt-ai`: say so — the work goes on with the generic routers.
5. **Ask the packs' decisions.** Read each installed pack's `SKILL.md` (in `.claude/skills/`
   or `.agents/skills/`) — its `## Axes` and `## Opt-ins` — and ask them in one round, each
   option's cost as its consequence. Write the value **exactly as the pack spells it**: the
   pack selects its references by that text. A concept no pack offers is an open `QT-NN`,
   never an invented value.
6. **Ask the core opt-ins** below, every one, including the `no`s.
7. **Write `tech.md`**, agent tools included, and tell the user that MCP servers load in a
   new session. **Check that each tool answers** before relying on it — an MCP server, in
   that session; what does not answer is said with what is missing.

## The file

```markdown
# Tech — Pedidos

## Pedidos.Api
root: `Pedidos.Api/` · areas: backend · packs: dotnet, ddd

| Decision | Choice | When |
|---|---|---|
| Runtime | .NET 10 | — |
| Database | PostgreSQL 17 | — |
| Architecture | vertical-slice | — |
| Domain model | ddd | the order rules |
| Endpoints | minimal-apis | every HTTP endpoint |

Opt-ins
- **Test levels:** unit yes · integration against the real engine yes · ephemeral containers yes
- **Test-first:** yes, for business rules
- **End-to-end tool:** no
- **Test data:** SQL scripts run by the agent against `dev`
- **DDD:** aggregates yes · value objects yes · domain events no · typed ids no

Dependencies
| Dependency | What for | When |
|---|---|---|
| Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 | PostgreSQL provider | persistence and migrations |

Agent tools
| Tool | What for | Source | Installed by |
|---|---|---|---|
| Microsoft Learn MCP | .NET and Azure documentation | Microsoft Learn, read 2026-09-16 | pack dotnet |

Conventions
- A request without a session answers `401`, never a redirect.

Evidence: versions read 2026-09-16 from `global.json` and `Directory.Packages.props`.
```

## Rules

1. **One section per component**, named as in `architecture.md`, with its `root` (the folder
   holding all of it; `./` when it is the only one), its **areas** and its **packs**. The
   areas across all sections are the closed list acceptance criteria mark (`backend ✓ ·
   frontend —`); `qa` is never an area.
2. **One choice per decision.** An undecided one cites its open `QT-NN`. Two options in use
   is one row with the winner plus a `Planned:` line for the one being retired.
3. **Core opt-ins**, closed list, cost said when asked — what is not written is not enabled:
   - *Test levels* — which automated checks ship with the work, each level answered;
     an existing test project is not a decision to write tests;
   - *Test-first* — whether the test comes before the work, and for what;
   - *End-to-end tool* — named, or `no`;
   - *Test data* — how a test gets the data it needs.

   Packs add their own opt-ins in the same block.
4. **Dependencies are the user's**: one enters only after the user confirmed it (here or via
   `nzt-build`'s `dependencies.md`), with its version. Transitive ones are not listed.
   **Agent tools** too: only installed ones, with their source and date, and `pack <name>`
   or who installed it in a few words (*the user, in the editor*) — never the steps: they
   live in the pack or the source.
5. **The evidence line names where each version came from** (pins, manifests, lock files). What could not be determined says so and what would settle it.
6. **A convention is one line** the agent cannot deduce from the rest. Longer is a decision
   for the decisions log. Sources, history and folder trees go there too, never here.
7. **Kept current in the same unit** that changes a version, a dependency, a pack or a
   decision. Only what is in place is written.

## Done when

Someone could do correct work in any component tomorrow with only this file, the specs and
its pack skills, and the user was told what they do by hand and what the agent cannot do.
