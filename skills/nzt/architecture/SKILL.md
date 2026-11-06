---
name: nzt-architecture
description: Use when how it is made has to be decided before the work - its parts and boundaries, technologies, tools and the project's packs, the domain model, one feature's technical design, integrations, decision records, debt, diagrams.
---

# Architecture — how it is made

Decides **how** the product does what discovery agreed, records why, and sets up the
project's packs. **Owns** its parts, technologies and packs (`Docs/Architecture/tech.md`),
the domain model, integrations, decision records, deferred debt, diagrams, and the map of
`Docs/`. **Does not own** the rules (`nzt-discovery`), its form (`nzt-design`) or the work
itself (`nzt-build`).

## References

| The unit is | Read | Read with |
|---|---|---|
| The product's structure: components, boundaries, external systems | `references/design-product.md` | `references/decisions-log.md`, `references/diagrams.md` |
| Technologies, packs, decisions and opt-ins of each component; what the agent needs to do the work | `references/tech.md` | `references/decisions-log.md` |
| One feature's technical design | `references/design-feature.md` | `references/decisions-log.md`, `references/diagrams.md` |
| The business entities and their relationships | `references/domain.md` | — |
| A consequential decision with alternatives | `references/adr.md` | — |
| A decision that needs people outside this conversation — **on request** | `references/rfc.md` | `references/adr.md` |
| Work found and deliberately deferred | `references/tech-debt.md` | — |
| Judging an existing structure against evidence | `references/review.md` | — |
| Drawing a diagram the user accepted | `references/diagrams-draw.md` | `references/diagrams.md` |

Every question also follows `../nzt-plan/references/questions.md`.

## Steps

1. **Read what binds you**: the spec and its stories, `tech.md`, `architecture.md`, the ADRs.
2. **Derive every technical question first** — from the rules, the stories and each third
   party's limits — and log each as an open `QT-NN` before designing. Resolve each by kind:

   | Kind | Example | Resolved by |
   |---|---|---|
   | Checkable fact | what the gateway returns on a rejected charge | research with source and date (`nzt-research`) — never asked |
   | Detail inside the agreed scope | how many retries | the mode below |
   | Tradeoff or material change | online licence check or signed token | **asked**, with options, consequences and a recommendation |

3. **Offer the mode** once the questions exist — say how many and of what kind, never before:
   **Proposals** (you decide the details, labelled; the user objects), **Together** (asked
   in one grouped round), **Dictated** (the user says, you write — contrasting it against the
   spec and `tech.md` first). The mode governs only details; log it per document.
4. **Write the document** of the unit's reference. A finding that contradicts an agreed rule
   goes back to discovery; a question of a later phase is left, undecided, where that phase
   reads it.
5. Offer a diagram as `references/diagrams.md` says.

**Skip this phase** when the change adds no component, chooses no technology, crosses no
boundary and sets no precedent. Say so in one line.

## Mandatory

`Docs/Architecture/tech.md` and the component's row in `architecture.md` exist before a
component is built: a new component gets them when designed, an existing one from evidence
before its work is touched.

## Where it lands

`Docs/` has one folder per subject: `Product/`, `Domain/`, `Architecture/`, `Design/`,
`Operations/`, `Manual/`. A project that already has `UX/` keeps it until the user moves it.

- Components, boundaries, external systems → `Docs/Architecture/architecture.md`
- Technologies, packs, decisions, opt-ins, dependencies and agent tools per component →
  `Docs/Architecture/tech.md`
- Technical questions → `Docs/Architecture/architecture-decisions.md` (product) or
  `Plan/specs/<feature>/tech-design/decisions.md` (feature). Append-only
- Entities → `Docs/Domain/domain-model.md`
- Decision records → `Docs/Architecture/adr/` · RFCs → `Docs/Architecture/rfc/` · debt →
  `Docs/Architecture/tech-debt.md`
- A feature's design → `Plan/specs/<feature>/tech-design/design.md`, **offered**, not declared
- A review writes no document of its own: each finding lands where it belongs.

## Rules

- **Design against the spec, not the request.** What the spec does not say is a question for
  discovery.
- **Respect what exists**: the current structure is a constraint and evidence.
- **Planned is not adopted** until it is.
- Versions and capabilities come from the project's own evidence (manifests, configuration,
  pins), never from what compiles or what is newest.

## Done when

The work can start with no open technical decision in its way: every component touched has
its `tech.md` section with its packs and tools, every consequential decision its record, and
every open question its `QT-NN` where it will be read.
