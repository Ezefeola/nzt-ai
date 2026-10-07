---
name: nzt-architecture-diagrams-domain
description: Use when drawing the bounded-context map with its dependency patterns, or the aggregate map of what stays consistent at the same instant.
---

# The context map and the aggregate map

The two diagrams that draw the **business**, not the solution. Everything the shared rules
forbid still holds, and these two add their own lists — because a context and an aggregate
are not built things.

Load `nzt-architecture` and `nzt-architecture-diagrams` before applying this.

## `bounded-contexts` — who adapts to whom

It lives in `Docs/context-map.md`, and it is earned whenever that file exists: more than one
context, or one of ours plus a third party's.

**The limit is eight contexts.** Past eight the map stops reading and, far more likely, **the
contexts are wrong**: eight boundaries of meaning in one product usually means somebody drew
folders. Go back to the conversation instead of splitting the picture.

```
flowchart LR
  sales[Sales · core]
  stock[Stock · supporting]
  billing[Billing · supporting]
  payments{{Payments · generic}}

  sales -- "confirmed order · customer/supplier" --> stock
  sales -- "confirmed order · open host service" --> billing
  billing -- "charge · anticorruption layer" --> payments
```

- `[ ]` a context of ours · `{{ }}` one that belongs to a third party
- **The type goes in the label**, after a middle dot. It is half the value of the picture and
  it costs three words.

### The arrow means dependency, never a call

> **It runs from upstream to downstream — from the one that sets the language to the one
> that adapts to it.** Who calls whom, and which way the bytes move, is the component map.

The two frequently disagree, and that is the point: a downstream context often calls the
upstream one to ask for something. Drawing the call here would hide the only thing this
diagram exists to show — **who has to change when the other one moves**.

### The label carries what travels and the pattern

Both, separated by a middle dot: *"confirmed order · customer/supplier"*. What travels stays
in ubiquitous language; the pattern is one of the names `Docs/context-map.md` uses. **A bare
arrow is not allowed here**: the pattern is the content, and an arrow without one is a
dependency nobody decided.

### What may never appear

| May be a node | Never |
|---|---|
| a context of ours | a component, a service or a database |
| a third party's context | an actor or a user — that is the `context` diagram |
| | an entity, an aggregate or a term |
| | a module, a team or a folder |

**A component is never a node**: a context may end up served by three components or by none,
and drawing them fuses two altitudes into one picture that has to be redrawn whenever either
changes. **An entity is never a node** either — that is the map below, and mixing the two
produces a diagram that is neither.

## `aggregates` — what is true at the same instant

It lives in `Docs/domain-model.md`, and it is earned when the domain axis of the stack says
`ddd` **and there are three aggregates or more**. With one or two, the boundary fits in the
sentence that opens each section and a picture of two boxes says less.

**The limit is six**, lower than every other diagram on purpose: past six the picture stops
being about boundaries and starts being about the model. **Cut it by context** — the context
map already declares the cut — and draw one per context.

```
flowchart LR
  subgraph order[Order · root]
    line[OrderLine]
  end
  customer[Customer · root]
  coupon[Coupon · root]

  order -. CustomerId .-> customer
  order -. CouponId .-> coupon
```

- **A box is an aggregate**, and it names its **root**, marked `· root`.
- **A `subgraph` only when there are child entities inside.** An aggregate that is a single
  entity is a plain node; an empty `subgraph` renders as a box with a hole and reads as if
  something were missing.
- **A dashed arrow is a reference by id across a boundary**, labelled with the id and nothing
  else.
- Names are the ones `Docs/domain-model.md` and the glossary use.

### What the two kinds of line mean

This is the whole content of the picture, and it is what the prose above it points at:

| | Meaning |
|---|---|
| **Inside a box** | consistent at the same instant · changes and is saved as a unit |
| **A dashed arrow out** | consistent **eventually** · there is a moment where the two disagree, and the business tolerates it |

If nobody can say what the user sees during that moment, **that is a question, not a drawing
problem**, and its answer belongs in the feature design.

### What may never appear

| May be drawn | Never |
|---|---|
| an aggregate, as a box | a field or an attribute |
| the root, named in the box | a cardinality — `1..N`, `0..1`, a crow's foot |
| a child entity, inside the box | a value object, which has no identity to be an end of |
| a reference by id, dashed | a table, a key, an index, a join |
| | an arrow between child entities of **different** boxes |

**A reference always leaves from the box, never from an entity inside it.** That is what
having a boundary means; drawing it otherwise says the opposite of what the picture is for.

## Done when

Rehearse it: could the user read the picture out loud in their own words and say whether it
is true?

- `bounded-contexts`: every node is a context with its type, eight or fewer, every arrow
  upstream to downstream and labelled with what travels **and** its pattern.
- `aggregates`: the domain axis says `ddd`, three aggregates or more, six boxes or fewer.
- Every box names its root; an aggregate with no children is a plain node.
- Every cross-boundary reference is dashed, labelled with the id, and leaves from the box.
- No fields, no cardinalities, no value objects, no tables, no components.
- The prose above each picture says what its lines mean.
