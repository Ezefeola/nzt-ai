# Product architecture

## Contents
- Before deciding
- The file
- Components
- Decide for what is known
- Reasoning is part of the document
- Planned is not adopted
- External systems carry an id
- Diagrams
- The log
- Done when

Produces `Docs/Architecture/architecture.md` — the components that exist, what each one owns, how they
talk to each other, and the reasoning that put them there — and
`Docs/Architecture/architecture-decisions.md`, the log of the questions that produced it. It is the
document every feature design is fitted into.

It does **not** write the stack documents — one per component and area,
`nzt-architecture-stack`'s job — nor the model of the business: the entities and their
aggregates are `nzt-architecture-domain`'s, and the cut into contexts is
`nzt-architecture-contexts`'. This file says which components exist and what each one owns;
an entity listed here is a model growing in two places.

If you did not arrive here from `nzt-architecture`, load it first: it carries the protocol
this skill runs — derive the questions, resolve each by its kind, let the user choose the
mode, and log every answer with where it came from.

**The questions come first, and at this altitude they are the expensive ones**: the stack
of each component, how the components and the client applications talk to each other, which
providers are used and what each one allows. Derive them from the product document, the
specs and their technical notes, write them as open `QT-NN` in
`Docs/Architecture/architecture-decisions.md`, and only then say how many there are and ask the mode.
**The stack's axes go in this same log** — `nzt-architecture-stack` keeps asking them the
way it always did; what changed is only where the answer is recorded.

## Before deciding

Read `Docs/Product/product.md` — its modules, its constraints and its scope — and the feature specs
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
| Id | System | What we need from it | When it is unavailable |
|---|---|---|---|
| INT-01 | Billing | invoice for a confirmed order | the order is confirmed and the invoice is retried |
| INT-02 | Payment gateway | the charge authorised before the order is confirmed | the order is not confirmed and the customer is told |

## Why it is shaped this way
- **Two components, not one.** The screens and the API ship on different schedules and the
  support desk is used from outside the network. Costs one hop per screen.
- **Rejected: a separate promotions service.** One team, one database, no independent
  scaling need. Revisit if promotions get their own lifecycle.

## Open questions
Listed by id; they live and get answered in `architecture-decisions.md`: QT-02.
```

## Components

- **A component is something that is deployed and evolves on its own.** If two things always
  ship together, in the same schedule, by the same people, they are one component with two
  parts.
- **A module is not a component.** Modules are the product's capabilities, in
  `Docs/Product/product.md`; components are how the system is cut. One component usually serves
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

## External systems carry an id

`INT-NN` is assigned once, never reused, and it is what a feature design cites instead of
describing the same integration again. The row here is the product-level contract — what we
need and what happens when it is not there; what a single flow sends and expects belongs to
that feature's design, citing the id.

## Diagrams

Two are earned here, and both are offered, never assumed: **`components`**, the map of who
does what, and **`context`**, the perimeter, when there are third parties or more than one
kind of actor. `nzt-architecture-diagrams` decides and offers;
`nzt-architecture-diagrams-components` draws them. A picture that repeats the component
table in boxes is maintenance with no reader.

## The log

`Docs/Architecture/architecture-decisions.md` holds every `QT-NN` of this altitude, in its own series,
**append-only**: the question, its answer, the date, and the label saying where the answer
came from. Its shape is the one `nzt-architecture-design-feature` writes out, with the
product in the title instead of a feature. One that belongs to a later phase is written
where that phase will read it and is not decided early — deciding a build question during
architecture is deciding it with less information than whoever gets there will have.

**`Docs/Architecture/architecture.md` is the present and gets rewritten; the log is not touched.** A
superseded answer stays and gets a new entry naming what replaced it. When the answer
earned an ADR, the line cites it instead of restating it.

## Done when

Rehearse it: could someone design a feature against this document without asking you where
something belongs?

- Every component says what it owns and lists its areas.
- No two components own the same decision.
- Every external system has its `INT-NN` and says what happens when it is unavailable.
- The questions were derived and logged before anything was proposed, the user chose the
  mode, and every entry says where its answer came from.
- Every non-obvious choice has its reasoning, and every rejected one its trigger.
- Everything not yet built is marked as planned.
- Open technical questions are `QT-NN` in the log, not assumptions in the text.
