# Context map

## Contents
- It talks about meaning, not machinery
- The file
- Writing it
- Domain events
- What this document does not carry
- The diagram
- Done when

Produces `Docs/context-map.md`: how the business is cut up and who depends on whom. Its
reader is deciding where to spend effort and which model to defend.

## It talks about meaning, not machinery

> *This context understands "reservation" this way, and depends on that one this way* — yes.
> Endpoints, queues, payloads, packages, classes — never, in any form.

**It is written only when there is more than one context, or one of ours plus a third
party's.** With a single context it says less than the first sentence of
`Docs/architecture.md`, and then it does not exist. Offer it when a second context appears
in the conversation, and say what is lost without it: the same word keeps meaning two things
and nobody knows which side has to change when the other moves.

## The file

```markdown
# Context map — Pedidos

## The contexts

<the bounded-contexts diagram>

### Sales · core
Where the product differentiates: building the order and promising delivery. An *order*
here is the customer's intent to buy, until it is confirmed.
- Modules: Catalogue · Checkout
- Components: `Pedidos.Api`, `Pedidos.Web`

### Stock · supporting
Keeps available and reserved units. Ours and necessary, but not why anyone chooses us: it
is built simple on purpose.
- Modules: Inventory
- Components: `Stock.Api`

### Payments · generic
The industry already solved it. We do not model it: the gateway does.
- Modules: —
- Components: the payment gateway — theirs

## How they relate

| From | To | Pattern | What happens if the other changes |
|---|---|---|---|
| Sales | Stock | customer/supplier | Stock plans what Sales needs; a change is agreed before it ships |
| Sales | Billing | open host service | Billing publishes one contract for everyone; we adapt to it |
| Billing | Payments | anticorruption layer | the gateway's vocabulary does not enter our model: it is translated at the boundary, so their change touches one place |

## Domain events

- **Order confirmed** — the customer finished buying. Stock and Billing find out. (INT-02)
- **Units taken** — Stock set aside what the order needs.

## Terms that change meaning

- **Reservation** — in Sales it is what the customer set aside; in Stock it is the unit
  taken out of the available count. Both readings are in `Docs/glossary.md`.
```

## Writing it

- **A context is a boundary of meaning**, and its paragraph says **what a term of the
  business means inside it**. A paragraph that could be copied onto another context is not a
  context: it is a folder with ambitions.
- **The type is one of three and it is never omitted**: `core` (where the product
  differentiates), `supporting` (ours, necessary, built simple) and `generic` (the industry
  solved it; buy it). It is the most actionable line in the file — it says where to build
  carefully and what not to model at all.
- **The join lines are two and they are the point.** Modules order `Docs/product.md`,
  components order `Docs/architecture.md`, and the context orders neither: naming the three
  together is what lets them be read at once **without forcing them to match**. A context
  with no component is normal — it may be a third party's, or not built yet.
- **Every pair that touches has a row, and the last column is what the row is for.** *"What
  happens if the other changes"* turns a pattern name into something someone can act on. A
  row whose last column says nothing means the pattern was picked from a list instead of
  from the conversation.
- **The pattern is one of seven**: customer/supplier, conformist, anticorruption layer,
  shared kernel, open host service, published language, separate ways. Anything else is a
  relationship nobody named.
- **An anticorruption layer is written as what it protects**, never as where it lives. *"The
  gateway's vocabulary does not enter our model"* — yes; a folder, a project or a class that
  translates — never, that is code.
- **Nothing is said about a third party's insides.** Name it, say what it resolves, say how
  we relate to it. Its model is theirs to describe.
- **The prose is in the user's language**, and context names are the ones the business
  already uses.

## Domain events

- **An event is a past-tense fact in ubiquitous language**: *Order confirmed*. Not
  `OrderConfirmedEvent`, not a topic, not a queue.
- Each one says **who needs to find out**, and cites the `INT-NN` of
  `Docs/architecture.md` when an integration carries it.
- **Nothing here says when it is dispatched, who handles it or where it accumulates.** That
  is the feature design and the stack. An event listed by name invites explaining how it
  travels; it does not travel here.

## What this document does not carry

| Not here | Where it goes |
|---|---|
| What we send, what comes back, timeouts, retries | `Docs/architecture.md` external systems, and the feature design |
| Whether it is an event or a call, and over which pipe | the feature design |
| What each component is built with | `Docs/<area>-stack-<component>.md` |
| The fields and relationships of the model | `Docs/domain-model.md` |
| What each term means | `Docs/glossary.md` — here go the boundaries |
| Why the product has this technical shape | `Docs/architecture.md` |

## The diagram

`bounded-contexts` is earned whenever this file exists, and it is the first thing anyone
reads. It is offered like any diagram — `nzt-architecture-diagrams` decides, and
`nzt-architecture-diagrams-domain` draws it. It is **not** the `context` diagram of
`Docs/architecture.md`: that one draws the perimeter with its actors, this one the
boundaries of meaning inside it.

## Done when

Rehearse it: could someone read this file and say which model to defend, and who has to
change when a neighbour moves?

- There is more than one context, or a third party. Otherwise the file does not exist.
- Every context carries its type, and its paragraph says what a term means inside it.
- Every context has its modules and components lines, and none was forced to match.
- Every pair that touches has a named pattern and a real last column.
- Every event is a past-tense fact that says who finds out, with no dispatch mechanism.
- No payloads, no pipes, no packages, no classes, no tables.
- No foreign system's model is described.
