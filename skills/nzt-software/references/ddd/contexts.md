# Context map

Produces `Docs/Domain/context-map.md`: how the business is cut up and who depends on whom — for
whoever decides where to spend effort and which model to defend. **Meaning, never machinery**:
no endpoints, queues, payloads, packages or classes.

**Only with more than one context, or one of ours plus a third party's.** Offer it when a
second context appears, saying what is lost without it: one word keeps meaning two things, and
nobody knows who changes when the other moves.

## The file

```markdown
# Context map — Pedidos

## The contexts

<the bounded-contexts diagram>

### Sales · core
Building the order and promising delivery. An *order* here is the customer's intent to buy,
until it is confirmed.
- Modules: Catalogue · Checkout
- Components: `Pedidos.Api`, `Pedidos.Web`

### Payments · generic
The industry solved it; the gateway models it.
- Modules: —
- Components: the payment gateway — theirs

## How they relate

| From | To | Pattern | What happens if the other changes |
|---|---|---|---|
| Billing | Payments | anticorruption layer | the gateway's vocabulary is translated at the boundary: their change touches one place |

## Domain events

- **Order confirmed** — the customer finished buying. Stock and Billing find out. (INT-02)

## Terms that change meaning

- **Reservation** — in Sales, what the customer set aside; in Stock, the unit taken out of
  the available count. Both in `Docs/Domain/glossary.md`.
```

## Rules

1. **A context is a boundary of meaning**: its paragraph says what a business term means inside
   it. One that could be copied onto another context is a folder.
2. **Its type is never omitted**: `core` (where the product differentiates), `supporting` (ours,
   built simple), `generic` (buy it, do not model it).
3. **Modules and components lines** join it to `product.md` and `architecture.md` without
   forcing them to match; a context with no component is normal.
4. **Every pair that touches has a row**, with one of seven patterns — customer/supplier,
   conformist, anticorruption layer, shared kernel, open host service, published language,
   separate ways — and a last column someone can act on. An anticorruption layer is written as
   what it protects, never where it lives.
5. **A domain event is a past-tense fact in the business's words** (*Order confirmed*, not
   `OrderConfirmedEvent`), saying who finds out and citing its `INT-NN`. When, how and where it
   travels is the feature design's and `tech.md`'s.
6. **Never a third party's insides**: name it, what it resolves, how we relate.
7. Prose in the user's language, context names as the business uses them. Not here: what is
   sent and its failures (`architecture.md`, the feature design), technologies (`tech.md`),
   fields (`domain-model.md`), meanings (the glossary).
8. The `bounded-contexts` diagram is earned whenever this file exists (`diagrams.md`); it is not
   the `context` diagram, which draws the perimeter and its actors.

## Done when

Someone could say which model to defend and who changes when a neighbour moves: every context
has its type and meaning, every touching pair a pattern and a real consequence, every event is
a fact with no mechanism.
