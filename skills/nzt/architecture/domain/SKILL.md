---
name: nzt-architecture-domain
description: Use when the domain model is written or updated: entities, fields and relationships, grouped by aggregate when the stack says DDD. Never the schema.
---

# Domain model

Produces `Docs/domain-model.md`: the things the business is made of, what each one holds and
how they relate. It exists so every story starts from the same model instead of adding
attributes one at a time, each one inventing the shape it needs.

If you did not arrive here from `nzt-architecture`, load it first.

## It is the model, not the schema

> *An order has a confirmation date and many lines* — yes.
> `orders.confirmed_at timestamptz null`, keys, indexes, lengths — never.

A **field** is an attribute of the business and what it means. Types, nullability, length,
keys and indexes are code, and the component that owns the data owns them. Writing them here
guarantees the document lies at the next migration, and a document that lies with confidence
is worse than no document.

## When it is written

**After the specs it models**, and that is what lets it carry fields at all: the detail comes
from the acceptance criteria. Written before them, every field is a guess.

It **grows with the features**. A new feature adds what its criteria ask for; nothing is
modelled ahead for a story nobody wrote. Offer it when the first feature's specs are closed,
and say what is lost without it: every story invents the model again, and two of them will
invent it differently.

## Two shapes, and the stack decides which

| The domain axis says | The shape |
|---|---|
| anemic | a flat list of entities — a heading per entity, and nothing more |
| `ddd` | the same entities **grouped by aggregate**, with the aggregate map above them |

**Nothing else changes.** Fields, relationships, language and everything this document
refuses are identical in both: **an aggregate is a statement about the business**, not about
code. With more than one context, the file is organised by context first, with the names
`Docs/context-map.md` declares — the same term under two of them with different fields is not
a duplicate, it is what having two contexts means.

> **How an aggregate is written in code does not belong here.** Private setters,
> constructors, factories, mapping: that is `nzt-build`'s, and naming it here leaves the
> implementation with two sources fighting.

## The file

```markdown
# Domain model — Pedidos

<the aggregate map, once, here at the top>

## Order · aggregate
The order and its lines change together: a line cannot be added without recalculating the
total. (RN-total-orden)

### Order — root
What a customer buys at a given moment. It is born as a basket and becomes an order when it
is confirmed.

Fields
- **Subtotal** — the sum of the products, without shipping or tax
- **ConfirmedAt** — when it stopped being a basket; empty while it still is
- **ShippingAddress** — *value*: where it is delivered; it is valid whole or not at all

### OrderLine
A product and how many units of it are being bought.

References to other aggregates
- **Customer**, by id — or nobody, if the purchase was as a guest
- **Coupon**, by id — zero or one at a time

## Coupon · aggregate
Nothing else changes with it, so it stands alone.

### Coupon — root
A code with a validity window that discounts over the subtotal.

Fields
- **Code** — what the customer types at checkout
- **ExpiresAt** — from when it stops applying

Relationships
- applies to **zero or one Order** at a time
```

Without `ddd`, the same content loses the `· aggregate` headings and the references section:
a flat list of entities, each with its paragraph, its fields and its relationships.

## With DDD, the boundary is found, not invented

An **aggregate** is what **changes together and is saved together**; one of its entities is
the **root**, the only one the outside world names.

| What a rule does | What it means |
|---|---|
| names two things **at once** — *"an order cannot have more than twenty lines"* | same aggregate |
| tolerates a delay — *"confirming the order takes the units from stock"* | **different** aggregates |
| only ever names one thing | that thing is an aggregate by itself |

**The default is one entity per aggregate**, and two join only when a rule forces it. If you
cannot name the rule that makes two things true at the same instant, they are two aggregates
— that is the test, and each aggregate **cites the `RN-` that forces its boundary**. One
citing nothing was drawn by intuition.

**A reference to another aggregate is by id**, in words, with its cardinality and its
optional case. Those two words say the two sides agree **eventually**, which raises the
question that belongs in the feature design: *while the other side is stale, what does the
user see?*

**Value objects only if the stack adopted them.** Then a field with rules of its own and no
identity is marked with one word — *value* — and explained like any other. The moment it
matters *which one* it is, it is an entity.

## Writing it

- **One entity: a short paragraph, its fields, its relationships.** The paragraph says what
  it *is* in the business. An entity with no field worth naming has none.
- **A field enters only if a rule or a criterion asks for it.** If you cannot name the one
  that does, it does not go in. That is the guard against `createdAt`, `active` and `notes`
  arriving out of habit.
- **A field is a name and what it means**, in one line. No type, no length, no nullability,
  no default. Whether it can be empty is said in words when it matters.
- **Relationships are in words, with their cardinality**: *has many*, *belongs to*, *may
  have*. `0..1`, `1..N` and foreign keys do not appear — prose is what the user can confirm.
- **The optional case is written out**, because that is where the bugs live: *"belongs to a
  Customer, or to nobody if the purchase was as a guest"* is the guest checkout made visible.
- **Names are the glossary's code names** — `Order`, not the domain word. If a term of the
  business has no glossary entry, that is an entry to write, not a name to improvise.
- **The prose stays in the user's language**, because the user is the one who confirms it is
  true.
- **A technical artifact is not an entity.** A join table, an audit log, a cache: none of
  them belong.

## What this document is not

| Not here | Where it goes |
|---|---|
| Types, lengths, nullability, indexes, keys | nowhere — it is code |
| Migrations, tables, columns as such | nowhere — code |
| A business rule, or the lifecycle as a rule | the feature's `spec.md` |
| What each term means | `Docs/glossary.md` — here go the relationships |
| Which context an entity belongs to, and how contexts relate | `Docs/context-map.md` |
| Which component owns the data | `Docs/architecture.md` |
| Setters, constructors, mapping — any line of code | `nzt-build` |

The third row is the frequent one. *"A confirmed order cannot be modified"* is a business
rule: in the feature it gets criteria and verification, and here it would be a rule nobody
checks.

## The diagram

The aggregate map is `aggregates`, and it is earned with `ddd` and three aggregates or more.
It is offered like any diagram — `nzt-architecture-diagrams` decides, and its own skill
draws it.

## Done when

Rehearse it: could the user read this file and say whether it is true, and could an
implementer start a story without asking what something holds?

- Every field traces to a rule or a criterion that asks for it.
- No types, lengths, nullability, indexes or foreign keys.
- Every relationship has its cardinality and its optional case, in words.
- Names match the glossary's code names.
- With `ddd`, every aggregate names its root and cites the rule that forces its boundary.
- References across a boundary say *by id*, with nothing about how they are mapped.
- No business rules, and no technical artifact posing as an entity.
