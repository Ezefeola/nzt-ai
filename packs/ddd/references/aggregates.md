# Aggregates in the domain model

With DDD, `Docs/Domain/domain-model.md` groups its entities by aggregate, with the aggregate
map above them. Fields, relationships and language follow `nzt-architecture`'s
`references/domain.md` unchanged: **an aggregate is a statement about the business**, not
about code. How it is written in code is `references/ddd.md`.

## The boundary is found, not invented

An **aggregate** is what changes together and is saved together; its **root** is the only
entity the outside names.

| A rule that | Means |
|---|---|
| names two things at once — *an order has at most twenty lines* | same aggregate |
| tolerates a delay — *confirming the order takes the units from stock* | different aggregates |
| names one thing only | that thing is an aggregate by itself |

1. **Start from one entity per aggregate.** Two join only when a rule forces it.
2. **Cite the `RN-` that forces each boundary.** If you cannot name the rule that makes two
   things true at the same instant, they are two aggregates.
3. **A reference to another aggregate is by id**, in words, with its cardinality and its
   optional case. It means the two sides agree eventually: ask in the feature design what
   the user sees while the other side is stale.
4. **A value object is marked *value*** — only with *value objects yes*. When it matters
   *which one* it is, it is an entity.
5. With several contexts, organise by context first, with the names of
   `Docs/Domain/context-map.md`. The same term under two contexts with different fields is
   not a duplicate.

## The file

```markdown
# Domain model — Pedidos

<the aggregate map, once>

## Order · aggregate
The order and its lines change together: a line cannot be added without recalculating the
total. (RN-total-orden)

### Order — root
What a customer buys at a given moment. Born as a basket; an order once confirmed.

Fields
- **Subtotal** — the sum of the products, without shipping or tax
- **ShippingAddress** — *value*: where it is delivered; valid whole or not at all

### OrderLine
A product and how many units of it are bought.

References to other aggregates
- **Customer**, by id — or nobody, if bought as a guest
- **Coupon**, by id — zero or one at a time

## Coupon · aggregate
Nothing else changes with it, so it stands alone.
```

The `aggregates` diagram is earned with three aggregates or more (`references/diagrams.md`).

## Done when

- Every aggregate names its root and cites the rule that forces its boundary.
- References across a boundary say *by id*, with cardinality and optional case, and nothing
  about how they are mapped.
- No *value* mark without *value objects yes*.
