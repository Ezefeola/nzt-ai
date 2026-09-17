---
name: nzt-architecture
description: Use when technical decisions come before code: component boundaries, stack, how a feature is solved across components, persistence, integrations, decisions worth recording.
---

# Architecture — technical design

This phase defines **how** the system solves the problem discovery defined. It decides
structure, and it records why.

## Boundaries

**Owns:** components and their boundaries, stack and technology choices, the domain model
in technical terms (entities, aggregates, value objects), persistence, consistency,
integrations and contracts, cross-cutting concerns, decision records, and the inventory of
`Docs/` — which documents exist and when each one is created.

**Does not own:** business rules (`nzt-discovery`), screen design (`nzt-ux`), writing the
code (`nzt-build`). Two sets of `Docs/` files are not yours either: the UX documents —
design system and shared component inventory — belong to `nzt-ux-system`, and
`product.md`, `glossary.md` and `analysis.md` belong to discovery.

## Required guidance

Before deciding, read what already binds you: the feature spec and its stories, the stack
document of every component you touch, and the existing decision records. Reuse what is
already loaded — the table below does not mean load every row.

## Choose the skill

| The unit is | Load |
|---|---|
| The product's structure: components, boundaries, external systems | `nzt-architecture-design-product` |
| One component's adopted technologies, versions and areas | `nzt-architecture-stack` |
| One feature's technical design: flows, data, integrations | `nzt-architecture-design-feature` |
| A consequential decision with alternatives and consequences | `nzt-architecture-adr` |

## When to skip this phase

Skip it when the change adds no component, chooses no technology, crosses no boundary and
sets no precedent. Most changes to an existing system are in that category. Say you
skipped it and why; do not design a system that already exists.

## One unit

One document. The product design, one feature's design, one stack document, or one
decision record.

## Where it lands

- Components, boundaries and the reasoning behind them → `Docs/architecture.md`
- Decision records → `Docs/adr/`
- One stack document per component and area → `Docs/<area>-stack-<component>.md`
- A feature's technical design → `Plan/specs/<feature>/design/design.md`, with any contract
  or diagram it needs beside it in the same folder

## Rules

- **The stack document is mandatory and this phase writes it.** No component gets built
  without one: a new component gets it when it is designed, an existing one gets it from
  evidence before its code is touched.
- **The stack records the adopted concept, never the name of a skill.**
  `Architecture: vertical-slice`, not the skill that implements it. The concept survives a
  rename and can be read without opening anything.
- **The stack declares which areas exist** in this project. That list is closed, and it is
  the same list acceptance criteria use to mark coverage (`backend ✓ · frontend —`).
- Distinguish what is planned from what is adopted, until it is adopted.
- Design against the spec, not against the request. If the spec does not say it, it is not
  a requirement — go back to discovery instead of inventing one.
- Decide for what is known. Architecture invented for a load, a tenant or an integration
  nobody asked for is cost with no buyer.
- A decision that is expensive to reverse gets an ADR: the alternatives considered, what
  was chosen, what it costs. A decision nobody can reconstruct gets relitigated every
  quarter.
- Respect what exists. In an existing system the current structure is a constraint and a
  source of information, not an accident to correct in passing.
- A technical question that belongs to this phase is written here with a stable `QT-NN`
  before it is asked. One that belongs to a later phase is written where that phase will
  read it, and is not decided early.
- A version or a capability is verified in the project's own evidence — the manifest, the
  configuration, the SDK pin — not inferred from what compiles or from what is newest.

## Done when

Build can start without an open technical decision in its way: every component you touch
has its stack document with its areas declared, every consequential decision has its
record, and every technical question still open has a `QT-NN` written where it will be
read.

## Closing checklist

- [ ] Every component touched has a stack document, and it names its areas.
- [ ] The stack names concepts, not skills.
- [ ] Every expensive-to-reverse decision has its record with the discarded alternative.
- [ ] Nothing in the design contradicts a business rule; contradictions went back to the spec.
- [ ] Open technical questions are written as `QT-NN`, not resolved by assumption.
- [ ] No requirement was invented that no spec asked for.
