---
name: nzt-architecture
description: Use when technical decisions come before code: component boundaries, stack, how a feature is solved across components, persistence, integrations, decisions worth recording.
---

# Architecture — technical design

This phase defines **how** the system solves the problem discovery defined. It decides
structure, and it records why.

## Boundaries

**Owns:** components and their boundaries, stack and technology choices, the domain model
in technical terms (entities, aggregates, value objects), the cut into contexts,
persistence, consistency, integrations and contracts, cross-cutting concerns, decision
records, deferred technical work, the diagrams of all of it, and the inventory of `Docs/` —
which documents exist, in which folder, and when each one is created.

**Does not own:** business rules (`nzt-discovery`), screen design (`nzt-ux`), writing the
code (`nzt-build`). Nor are two sets of `Docs/` files: the UX documents (design system,
shared components) are `nzt-ux`'s; `product.md`, `glossary.md` and `analysis.md`, discovery's.

## Required guidance

Before deciding, read what already binds you: the feature spec and its stories, the stack
document of every component you touch, and the existing decision records. Reuse what is
already loaded — the table below does not mean load every row.

## The questions come before the design

**This phase never decides alone what it could have asked.** Before writing a line of a
design, derive from the rules, the stories and the stack **every** technical question the
document has to answer — including what each third party allows and how it fails — and
write them as open `QT-NN` in the decisions log. An analysis' technical notes are one
input; the rules are the source.

Then resolve each one **by its kind**, and the kind is not the user's to pick:

| Kind | Example | How it is resolved |
|---|---|---|
| Checkable fact | what the gateway returns when it rejects a charge | researched in its authoritative source (`nzt-research`), answered with source and date — **never asked** |
| Detail inside the agreed scope | how many retries before giving up | the agent decides it, labelled as its own |
| Tradeoff or material change | validating the licence online or with a signed token | **asked**, with the options, their consequences and a recommendation — in every mode |

A finding that contradicts an agreed rule does not bend the design: it goes back to
discovery as a question or a change proposal.

## How they get resolved is the user's choice

Once the questions are derived — **never before, or the user chooses blind, not knowing
whether there are three or twenty-five** — say how many came out and of what kind, and
offer three ways:

| Mode | What the agent does with the details |
|---|---|
| **Proposals** | decides them, labelled, and the user objects to what does not fit |
| **Together** | asks them too, **grouped into one round**, never one at a time |
| **Dictated** | the user says how it goes, and the agent writes it |

The mode governs **only the middle row of the table above**, so those details get no answer
— not even a suggested one — until it is chosen. A checkable fact is never asked in any
mode; a tradeoff is always asked in every one. It is chosen per document, and logged.

**Dictated does not mean stenography.** What the user dictates is contrasted against the
spec and the stack, and a contradiction is raised before it is written — otherwise it is
found in build, by someone with less information than you have now.

## The decisions log

Every `QT-NN` lives in an **append-only log**, beside the document it serves:
`Docs/Architecture/architecture-decisions.md` for the product — the stack's axes included — and
`Plan/specs/<feature>/tech-design/decisions.md` for a feature. One series each.

**The design is the present and gets rewritten; the log is the conversation that produced
it and is never overwritten.** That is why they are two files: a document rewritten whole
that also has to be append-only in half its body is a contradiction. A superseded answer is
marked with what superseded it, never edited away.

Every entry says **where it came from**, and one is never dressed as another:

| Label | What it means |
|---|---|
| `usuario` | the user answered it |
| `agente, dentro del alcance` | the agent decided it; the user can still object |
| `investigado` | a fact, with its source and the date it was read |
| `propuesta` | offered, not answered yet |
| `[TO-DEFINE]` | explicitly out of scope, and it appears in every report until it is resolved |

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The unit is | Read | Read with |
|---|---|---|
| The product's structure: components, boundaries, external systems | `references/design-product.md` | `references/diagrams.md` |
| One component's adopted technologies, versions and areas | `references/stack.md` | — |
| One feature's technical design: flows, data, integrations | `references/design-feature.md` | `references/diagrams.md` |
| The entities of the business, their fields and their aggregates | `references/domain.md` | — |
| More than one context, or meaning shared with a third party | `references/contexts.md` | — |
| A consequential decision with alternatives and consequences | `references/adr.md` | — |
| A decision that needs agreement from people outside this conversation — **on request** | `references/rfc.md` | — |
| Technical work found and deliberately deferred | `references/tech-debt.md` | — |
| Judging an existing structure against evidence, not designing one | `references/review.md` | — |
| Deciding whether a document earns a diagram, and offering it | `references/diagrams.md` | — |
| Drawing `context` or `components` | `references/diagrams-components.md` | `references/diagrams.md` |
| Drawing `bounded-contexts` or `aggregates` | `references/diagrams-domain.md` | `references/diagrams.md` |
| Drawing `sequence`, `state` or `flow` | `references/diagrams-behavior.md` | `references/diagrams.md` |

Wherever a file names `nzt-architecture-<name>`, it means `references/<name>.md` in this
folder (`nzt-architecture-adr` → `references/adr.md`): read that file — it is not a skill.

**A diagram is never drawn from habit, and it is offered while the document is planned.**
So `references/diagrams.md` is read before that plan is shown — with the design rows, as
their Read with says — and the row that draws one is read only once the user wants it. A
diagram the user does not want is not drawn, and the prose carries the weight alone.

## When to skip this phase

Skip it when the change adds no component, chooses no technology, crosses no boundary and
sets no precedent. Most changes to an existing system are in that category. Say you
skipped it and why; do not design a system that already exists.

## One unit

One document: the product design, one feature's design, one stack, or one decision record.

## Where it lands

`Docs/` has one folder per subject, whichever phase writes it: `Product/` (product, interview,
history), `Domain/`, `Architecture/`, `UX/`, `Operations/` (deployment, releases), `Manual/`.

- Components, boundaries, external systems and why → `Docs/Architecture/architecture.md`;
  **each component's row names its folder** (`src/Pedidos.Api/`), fixed when it is designed,
  before the folder exists: it is how every phase finds that component's stack
- Entities, with aggregates when the stack says so → `Docs/Domain/domain-model.md`; contexts,
  dependencies, domain events → `Docs/Domain/context-map.md`, only past one context or with a third party
- Decision records → `Docs/Architecture/adr/` · proposals still being agreed →
  `Docs/Architecture/rfc/`, on request · deferred work → `Docs/Architecture/tech-debt.md`
- One stack per component and area, **inside the component** →
  `<component folder>/Docs/Architecture/<area>-stack.md` (`backend-stack.md`, `frontend-stack.md`)
- The technical questions and their answers → `Docs/Architecture/architecture-decisions.md`
  for the product, `Plan/specs/<feature>/tech-design/decisions.md` for a feature. Append-only
- A feature's technical design → `Plan/specs/<feature>/tech-design/design.md`, **offered, not
  declared**, with any contract or diagram it needs beside it in the same folder
- A review writes no document of its own: its findings land where each belongs — an ADR,
  deferred work, or a proposal back to the product design.

## Rules

- **The stack document is mandatory and this phase writes it.** No component gets built
  without one: a new component gets it when it is designed, an existing one gets it from
  evidence before its code is touched.
- **The stack records the adopted concept, never the name of a skill.**
  `Architecture: vertical-slice`, not the skill that implements it. The concept survives a
  rename and can be read without opening anything.
- **The stack declares which areas exist** in this project. That list is closed, and it is
  the same list acceptance criteria use to mark coverage (`backend ✓ · frontend — · qa —`,
  where `qa` is verify's mark and never an area).
- Distinguish what is planned from what is adopted, until it is adopted.
- Design against the spec, not against the request. If the spec does not say it, it is not
  a requirement — go back to discovery instead of inventing one.
- Decide for what is known. Architecture invented for a load, a tenant or an integration
  nobody asked for is cost with no buyer.
- A decision that is expensive to reverse gets an ADR: the alternatives considered, what
  was chosen, what it costs. A decision nobody can reconstruct gets relitigated every
  quarter. **One that also has to be agreed by people outside this conversation goes through
  an RFC first**, and nothing is built while that RFC is open.
- Respect what exists. In an existing system the current structure is a constraint and a
  source of information, not an accident to correct in passing.
- A technical question that belongs to this phase is written in its log with a stable
  `QT-NN` (`QT-01`, `QT-02`…) **before** it is asked or decided, and every reply names it by
  that id. One that belongs to a later phase goes where that phase reads it, undecided.
- **An answered `QT-NN` is never deleted and never edited**: the log is append-only, and a
  superseded answer stays with a line saying what superseded it. A question that disappears
  once it is answered leaves the next reader deciding it again, with nothing saying it was
  ever asked.
- A version or a capability is verified in the project's own evidence — the manifest, the
  configuration, the SDK pin — not inferred from what compiles or from what is newest. How
  an external system behaves is verified in its own documentation: `nzt-research`.

## Done when

Build can start without an open technical decision in its way: every component you touch
has its stack document with its areas declared, every consequential decision has its
record, and every technical question still open has a `QT-NN` written where it will be
read.

## Closing checklist

- [ ] The questions were derived from the rules and logged before anything was proposed.
- [ ] Each one was resolved by its kind, and the user chose the mode for the ones that
      admit one.
- [ ] Every entry in the log says where it came from, and none is dressed as another.
- [ ] Every component touched has a stack document, and it names its areas.
- [ ] The stack names concepts, not skills.
- [ ] Every expensive-to-reverse decision has its record with the discarded alternative.
- [ ] Nothing in the design contradicts a business rule; contradictions went back to the spec.
- [ ] Open technical questions are written as `QT-NN`, not resolved by assumption.
- [ ] No requirement was invented that no spec asked for.
