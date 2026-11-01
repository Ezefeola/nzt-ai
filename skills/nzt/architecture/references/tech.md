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
   list, and log each as `QT-NN`. Examples of what comes out:

   | The component is | Its decisions usually include |
   |---|---|
   | a service or API | runtime, language, data store, test framework |
   | a web or mobile client | framework, target devices, rendering, test framework |
   | a game | engine and version, target platforms, scripting language, input, asset pipeline |
   | a document, book or course | format, authoring toolchain, publishing channel |

3. **Resolve them**: facts (versions, support windows, licences, platform limits) are
   researched with source and date; tradeoffs are asked with a recommendation, in one round
   ordered by dependency (the technology before what depends on it).
4. **Choose the packs.** Run `nzt-ai project packs`, match packs to what was chosen, and
   propose them with what each brings (its skill, its MCP servers, what it requires). On the
   user's yes, run `nzt-ai project add <pack>...` (`--provider codex` or `all` when the
   project uses Codex). No matching pack, or no `nzt-ai`: say so — the component is built
   from the generic routers and the work next to it.
5. **Ask the packs' decisions.** Read each installed pack's `SKILL.md` (in `.claude/skills/`
   or `.agents/skills/`) — its `## Axes` and `## Opt-ins` — and ask them in one round, each
   option's cost as its consequence. Write the value **exactly as the pack spells it**: the
   pack selects its references by that text. A concept no pack offers is an open `QT-NN`,
   never an invented value.
6. **Ask the core opt-ins** below, every one, including the `no`s.
7. **Write `tech.md`** and tell the user that MCP servers load in a new session.

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
5. **Versions come from evidence** — the pins, manifests and lock files — named in the
   evidence line. What could not be determined says so and what would settle it.
6. **A convention is one line** the agent cannot deduce from the rest. Longer is a decision
   for the decisions log. Sources, history and folder trees go there too, never here.
7. **Kept current in the same unit** that changes a version, a dependency, a pack or a
   decision. Only what is in place is written.

## Done when

Someone could do correct work in any component tomorrow with only this file, the specs and
its pack skills: every decision has one value or an open `QT-NN`, every opt-in is answered,
every pack listed is installed, and every version names its source.
