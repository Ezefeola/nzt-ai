# Product definition

## Contents
- It is the minutes, not the source
- The file
- Objectives
- Users
- Modules
- Constraints
- Scope, in both directions
- Keep it current
- Done when

Produces `Docs/product.md`: what the product is, for whom, and what it will not be. It is
the document every feature is checked against — a feature that serves none of its
objectives is a feature nobody should be building.

## It is the minutes, not the source

- **It is written from `Docs/analysis.md`**, the product interview. Every line traces back
  to something the user said. What you filled in yourself is marked as proposed until they
  confirm it.
- **Never written by reading the repository.** Code says what exists, not what the product
  is for. Features emerge from the conversation and this document records what the phase
  established; it is not a source features get derived from afterwards.
- On an existing product with no document, it is still built from the interview. Evidence
  from the code goes in as a question — *"the system does X today; is that what it is
  for?"* — never as a definition.

## The file

```markdown
# Product — Pedidos

## Objectives
- **Coupons get redeemed.** Today a campaign runs and nobody can use the code, so the
  spend produces no orders. Known by: campaigns end with redemptions above zero.
- **Support stops handling discounts by hand.** Known by: no manual discount tickets.

## Users
| Who | What they need | What they cannot do today |
|---|---|---|
| Customer | Pay the promotional price without calling anyone | Enter a code anywhere |
| Support agent | See why a coupon was rejected | Only sees the final total |

## Modules
- **Ordering** — building an order and confirming it.
- **Promotions** — coupons, their validity and their redemption.
- **Support desk** — looking up an order and what happened to it.

## Constraints
- Billing stays in the current system; this product does not issue invoices.
- The team is two people; nothing that needs an operations shift.

## Scope

**In**
- Redeeming a coupon during checkout, across the ordering and promotions modules.

**Out**
- Creating campaigns. Marketing keeps doing it in their own tool (Q-04).
- A customer-facing mobile app. Not this round; the user decided web first.

## Open
- Q-13 · Does a refund return the coupon?
```

## Objectives

An objective is a **result for someone**, with how you will know it happened.

- Not a feature list. *"Coupons"* is a module; *"coupons get redeemed"* is an objective.
- Say what is wrong today. An objective with no current pain is a preference, and it is
  worth saying so out loud before anyone builds for it.
- **Known by:** what changes when it is achieved. If nobody can tell the difference, the
  objective is not written yet.
- Three to five. A product with twelve objectives has none.

## Users

Who they are, what they need, and **what they cannot do today**. That third column is what
turns a user list into something a feature can be checked against.

- A role only earns a row when it changes what the product must do or what it is allowed to
  show. Two job titles doing the same thing are one row.
- Name the user who is not the buyer when there is one: the person operating it every day
  often has needs the buyer never mentions.

## Modules

The product's capabilities, one line each. A module is what the product **does** — not a
folder, not a screen, not a component. Components are architecture's.

- The module list is stable; features are not. Do not keep a feature index here: it goes
  stale the day a feature is split, and the features already live in `Plan/specs/`.

## Constraints

What the user imposes and you do not get to trade away: existing systems that stay, a
deadline, a budget, team size, legal or regulatory obligations.

- A constraint the user stated is recorded even when you disagree with it. Say so once,
  with the consequence, and write down their decision.
- A technical constraint you assumed is not a constraint. It goes to architecture.

## Scope, in both directions

**Out** is the half that stops work nobody asked for. Each excluded line says why, or where
it lives instead.

- What the user dismissed goes here in their terms, not paraphrased into something softer.
- Something that is neither in nor out is an open question, not scope.

## Keep it current

The document describes the present. A change edits it in place; a second document that says
something different about the same product is how two truths start. The history of how it
got there is in `analysis.md`, which is the file that accumulates.

## Done when

Rehearse it: could someone decide whether a proposed feature belongs in this product,
using only this file?

- Every objective says how it is known.
- Every user row says what they cannot do today.
- Scope is written in both directions.
- Nothing here names a technology, a component or a screen.
- What is undecided is in **Open** with its `Q-NN`, not filled in by you.
