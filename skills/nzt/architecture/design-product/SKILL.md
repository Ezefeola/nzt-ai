---
name: nzt-architecture-design-product
description: Use when the product's technical shape is decided or updated: which components exist, what each one owns, how they communicate, and why.
---

# Product architecture

Produces `Docs/architecture.md`: the components that exist, what each one owns, how they
talk to each other, and the reasoning that put them there. It is the document every feature
design is fitted into.

It does **not** write the stack documents. Those are one per component and area, and they
are `nzt-architecture-stack`'s job.

If you did not arrive here from `nzt-architecture`, load it first.

## Before deciding

Read `Docs/product.md` — its modules, its constraints and its scope — and the feature specs
that already exist. **Design against the spec, not against the request**: if no spec asks
for it, it is not a requirement, and inventing one here is how a system grows a capability
nobody bought.

On an existing system, read the system itself first. The current structure is a constraint
and a source of information, not an accident to correct in passing.

## The file

```markdown
# Architecture — Pedidos

## Shape
A web application with one API and one browser client, one relational database, and one
outbound integration with the billing system. Nothing runs asynchronously today.

## Components
| Component | Owns | Talks to | Areas |
|---|---|---|---|
| `Pedidos.Api` | orders, coupons, redemptions | Postgres, Billing (HTTP) | backend |
| `Pedidos.Web` | checkout and support screens | `Pedidos.Api` (HTTP) | frontend |

## Boundaries
- Coupon validity is decided in the API and never in the client. The client shows what the
  API returned; a second implementation of the rule is a second source of truth.
- Billing owns invoices. We send a confirmed order and store what came back; we never
  reproduce its numbering.

## External systems
| System | What we need from it | When it is unavailable |
|---|---|---|
| Billing | invoice for a confirmed order | the order is confirmed and the invoice is retried |

## Why it is shaped this way
- **Two components, not one.** The screens and the API ship on different schedules and the
  support desk is used from outside the network. Costs one hop per screen.
- **Rejected: a separate promotions service.** One team, one database, no independent
  scaling need. Revisit if promotions get their own lifecycle.

## Open
- QT-02 · Does the support desk need to read orders while billing is down?
```

## Components

- **A component is something that is deployed and evolves on its own.** If two things always
  ship together, in the same schedule, by the same people, they are one component with two
  parts.
- **A module is not a component.** Modules are the product's capabilities, in
  `Docs/product.md`; components are how the system is cut. One component usually serves
  several modules, and that is fine.
- Every component says **what it owns** — the data and the decisions that are its and
  nobody else's. Two components owning the same decision is the defect this table exists to
  catch.
- Every component lists its **areas**, because that list is what acceptance criteria use to
  mark coverage, and what tells `nzt-architecture-stack` how many stack documents this
  component needs.

## Decide for what is known

Architecture invented for a load, a tenant, a second country or an integration nobody asked
for is cost with no buyer. Three questions before any component is added:

- Which spec, constraint or objective requires it?
- What breaks if it is not there?
- What does it cost to add it later instead of now?

Write the answer to the third one in **Why it is shaped this way**. That is what lets the
next person add it later without re-arguing the whole design.

## Reasoning is part of the document

- Every non-obvious choice gets a line: what was chosen and what it costs. A design whose
  reasoning is missing gets relitigated every few months by someone who cannot tell a
  decision from an accident.
- **Record what was rejected and why**, with the condition that would change the answer.
  *"Revisit if promotions get their own lifecycle"* is worth more than a rejected option
  with no trigger.
- A decision that is expensive to reverse does not live only here: it gets its own record
  through `nzt-architecture-adr`, and this file names it.

## Planned is not adopted

Mark anything not yet in place as planned, and keep it marked until it exists. A document
that describes a system that is half true is worse than one that admits which half.

## Diagrams

A diagram earns its place when it shows something the table cannot — a flow, a direction, a
loop. It never replaces the tables, and it is not required. A picture that repeats the
component table in boxes is maintenance with no reader.

## Open questions

A technical question that belongs to this phase is written here as `QT-NN` **before** it is
asked. One that belongs to a later phase is written where that phase will read it and is
not decided early — deciding a build question during architecture is deciding it with less
information than whoever gets there will have.

## Done when

Rehearse it: could someone design a feature against this document without asking you where
something belongs?

- Every component says what it owns and lists its areas.
- No two components own the same decision.
- Every external system says what happens when it is unavailable.
- Every non-obvious choice has its reasoning, and every rejected one its trigger.
- Everything not yet built is marked as planned.
- Open technical questions are `QT-NN` in the file, not assumptions in the text.
