# The technical document

Produces `Docs/Architecture/tech.md`: one card per component with what every phase needs to
do the work correctly — its technologies, the decisions and practices they ask, the
opt-ins, the dependencies and the conventions. Read in a minute; it works for any
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
   - **How each need is met**: the MCP servers, plugins, editor packages, CLIs or SDKs the
     technologies offer an agent, found in official sources and proposed as
     `nzt-research`'s `references/tools.md` says (kernel *Agent tools*), each with its
     source and date and what it brings.
   - **What the user does by hand**, step by step in plain words: install, approve a
     connection, create an account or a key.
   - **What you cannot do even with all of it** — judge how it feels, try it where you
     cannot reach — so the user knows where they are needed.
   - **What to keep in mind**: licences, costs, permissions, what it installs on the machine.

   Each tool is installed and registered as `references/tools.md` says, on the user's yes.
   Nothing found: say so — the work goes on without it.
5. **Ask the software decisions.** Read `nzt-software`'s `references/choosing.md` for the
   technologies the component declares, and ask its axes and opt-ins in one round, each
   option's cost as its consequence. Write the value **exactly as it is spelled there**:
   `nzt-software` selects its references by that text. A concept it does not offer is an
   open `QT-NN`, never an invented value.
6. **Ask the core opt-ins** below, every one, including the `no`s.
7. **Write `tech.md`.**

## The file

```markdown
# Tech — Pedidos

## Pedidos.Api
root: `Pedidos.Api/` · areas: backend

| Decision | Choice | When |
|---|---|---|
| Language | C# 14 | — |
| Runtime | .NET 10 | — |
| Framework | ASP.NET Core 10 | — |
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
   holding all of it; `./` when it is the only one), and its **areas**. Its technologies use
   the row names `Language`, `Runtime` and `Framework` where they apply: `nzt-software`
   recognises the component by them. The
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

   `nzt-software`'s opt-ins for the declared technologies go in the same block.
4. **Dependencies are the user's**: one enters only after the user confirmed it (here or via
   `nzt-build`'s `dependencies.md`), with its version. Transitive ones are not listed. The
   agent's tools are not dependencies: they live in `Docs/agent-tools.md`.
5. **The evidence line names where each version came from** (pins, manifests, lock files). What could not be determined says so and what would settle it.
6. **A convention is one line** the agent cannot deduce from the rest. Longer is a decision
   for the decisions log. Sources, history and folder trees go there too, never here.
7. **Kept current in the same unit** that changes a version, a dependency or a decision.
   Only what is in place is written.

## Done when

Someone could do correct work in any component tomorrow with only this file, the specs and
`nzt-software`, and the user was told what they do by hand and what the agent cannot do.
