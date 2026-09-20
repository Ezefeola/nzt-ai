---
name: nzt-architecture-design-feature
description: Use when one feature needs its technical design before it is built: the flow across components, what is persisted, failures, and integration contracts.
---

# Feature design

Produces `Plan/specs/<feature>/design/design.md` — how this feature is solved across the
components that already exist — and `design/decisions.md`, the log of the questions that
produced it. One feature per unit.

If you did not arrive here from `nzt-architecture`, load it first: it carries the protocol
this skill runs — derive the questions, resolve each by its kind, let the user choose the
mode, and log every answer with where it came from.

## When a feature earns a design, and how it is offered

A feature earns one when it **crosses components in a way its stories do not settle**,
involves a **third party**, has **states with meaning**, has **requirements that condition
the solution**, or has **alternatives whose consequences must be explained**. A screen
reading a list through the API it already uses earns none, and saying so takes one line.
**It is offered, never declared**: a plan line saying what is lost without it — *"where
each rule is enforced would get decided while the code is written"* — that the user can drop.

## Before designing

Read the feature's `spec.md` and its stories, `Docs/architecture.md`, the stack document of
every component you touch, and `Docs/domain-model.md` if it exists — the entities this
feature works with already have a shape, and a design that invents a second one is where
two models start. You are fitting this feature into a system that already made decisions;
re-deciding them here is how two architectures start.

**Then derive the questions, before writing any of the document.** Each rule and each story
is read asking what the design has to settle for it to be buildable, and every gap becomes
an open `QT-NN` in `decisions.md`. Only then do you say how many there are and of what
kind, and ask the mode — chosen **per feature**, recorded in the log's first line.

**Design against the spec, not against the request.** If a rule is not in the spec, it is
not a requirement — it goes back to discovery as a question, and you design the rest
meanwhile.

## The file

```markdown
# Design — F-003 Coupons at checkout

## Flow
Applying a coupon (US-001):
1. `Pedidos.Web` sends the code with the current order to `Pedidos.Api`.
2. The API validates the coupon, calculates the discount and returns the new total.
3. Nothing is persisted: the discount is only stored when the order is confirmed.

Confirming an order with a coupon (US-003):
1. The API re-validates the coupon — the browser's total is never trusted.
2. It writes the order and its redemption in one transaction.
3. It sends the order to Billing. If Billing fails, the order stays confirmed and the
   invoice is retried; the customer is not blocked.

## Where each rule is enforced
| Rule | Enforced in |
|---|---|
| RN-cupon-vencido | `CouponValidator`, on both validation and confirmation |
| RN-un-uso-por-cliente | unique index on (coupon, customer) plus the check before writing |

## Data
- `Redemption`: coupon, customer, order, date. Written only on confirmation.
- The discount is stored as an amount on the order, not recalculated later: the coupon may
  change afterwards and the order must keep what was charged.

## States
An order goes `draft → confirmed → invoiced`, and `confirmed → cancelled`. A redemption
follows its order and is released on cancellation (RN-cancelar-libera-cupon).

## Integrations
| Id | We send | We expect | On failure |
|---|---|---|---|
| INT-01 · Billing | confirmed order | invoice id | queued and retried; order unaffected |

## Open questions
Listed by id; they live and get answered in `decisions.md`: QT-04.
```

No `Decided` section here: repeating an answer creates a second version that drifts.

## The log

```markdown
# Decisiones de diseño — F-003 Cupones en el checkout

Modo elegido: **juntos** · 2026-09-15

## 2026-09-15

**QT-01 · ¿Quién decide si un cupón es válido?**
> Facturación. Checkout solo muestra lo que le devuelven. — `usuario`

**QT-02 · ¿Qué avisa la pasarela cuando rechaza un pago con cupón?**
> Webhook con estado `rejected` y su motivo. — `investigado`, <URL>, leído 2026-09-15

**QT-03 · ¿Cuántos reintentos antes de avisar?**
> Tres, con espera creciente. — `agente, dentro del alcance`

**QT-04 · ¿El pedido cancelado libera el cupón en el momento o al cierre?**
> `[TO-DEFINE]` — el usuario lo define más adelante

## 2026-09-22

**QT-07 · ¿Dónde queda el registro del cupón usado?**
> En la orden, junto al descuento. — `usuario`  *(supera a QT-03)*
```

Sessions stack chronologically, so the file reads top to bottom following the numbering.
**Nothing is edited or deleted**: a wrong answer gets a new entry naming what it supersedes.

## Flows

- One flow per story, numbered, naming **which component does each step**. A flow with no
  named participants is prose, not a design.
- **Say what is not trusted.** Anything the client sends that a rule depends on is
  re-checked server-side; write where.
- Follow the flow to the end, including what happens after the user's part is done:
  background work, notifications, retries.

## Where each rule is enforced

Every business rule in the spec gets a row saying where it lives. This table is the single
most useful thing in the document:

- A rule with no row is a rule nobody implements.
- A rule enforced in two places is a rule that will disagree with itself. If both are
  needed — a database constraint plus a check for a decent error message — say so
  explicitly, and say which one is the source of truth.
- Enforcement in the client only is not enforcement.

## Data and states

- Say what is persisted, what is derived, and **what is frozen at a point in time**.
  Recalculating later from data that has changed is the defect this line prevents.
- An entity with business states gets its states and its legal transitions written. A
  transition nobody wrote is a transition somebody will allow.
- Do not invent fields, tables or configuration that no spec asked for.

## When a step fails

The question people skip: what happens when the second step fails after the first one
succeeded?

- For each flow with more than one effect, say what is guaranteed together and what is not.
- Say what the user sees when it happens, and what the system does about it — retry, queue,
  leave it inconsistent and reconcile, or refuse the whole thing.
- An operation that can run twice says whether running it twice is safe, and what makes it
  safe.

## Integrations

- **Cite the `INT-NN`** of `Docs/architecture.md` instead of describing the system again.
  The product-level row says what we need from it and what happens when it is not there;
  this table says what **this flow** sends and expects.
- Each one gets what we send, what we expect back, and **what happens when it is unavailable
  or slow**. Timeouts and retries are part of the contract, not an implementation detail.
- A system nobody recorded at product level gets its `INT-NN` there first, in the same unit.
- **How it actually behaves is checked, not remembered**: `nzt-research`, with the sources
  cited from the `QT-NN` that rests on them.

## Questions

- The kinds and the mode are the router's; what is specific here is that **the questions
  come out of the rules**. A rule whose enforcement row you cannot fill without guessing is
  a `QT-NN` you did not derive.
- One that belongs to a later phase is written where that phase will read it and is left
  alone. Deciding a build question now is deciding it with less information than whoever
  gets there will have.
- **Nothing is answered by assumption.** A question has two exits: an answer, or an
  explicit `[TO-DEFINE]` that takes it out of scope and appears in every report until it is
  resolved.
- When an answer earned an ADR, the log's line cites it.
- A contradiction in the spec is not resolved here. Raise it, pause what depends on it, and
  keep designing the rest.

## Diagrams

Three are earned here, all of them offered: **`sequence`** for the order between
participants, **`state`** for an entity's lifecycle, and **`flow`** for branching that lives
inside one component. `nzt-architecture-diagrams` decides which one and offers it;
`nzt-architecture-diagrams-behavior` draws it. Anything a numbered list already says does
not need a picture, and a declined diagram leaves the prose carrying it.

## Done when

Rehearse it: could someone implement this feature without asking you a structural question?

- Every story has its flow, with components named per step.
- Every business rule has its enforcement row.
- Every multi-effect flow says what happens when a step fails.
- Every integration cites its `INT-NN` and says what happens when it is down.
- The questions were derived and logged **before** anything was proposed, the user chose
  the mode, and every entry says where its answer came from.
- Nothing contradicts `Docs/architecture.md` or a stack document; contradictions were
  raised, not absorbed.
- Open technical questions are `QT-NN`, not assumptions.
