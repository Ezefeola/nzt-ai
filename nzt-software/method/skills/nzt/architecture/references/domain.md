# Domain model

Produces `Docs/Domain/domain-model.md`: the things the business is made of, what each holds
and how they relate — so every story starts from the same model. **The model, not the
schema**: *an order has a confirmation date and many lines*, never column types.

Written **after the specs it models** (fields come from the criteria) and grown with each
feature. Offer it when the first feature's specs close: without it, each story reinvents the
model.

If `tech.md` declares *Domain model* `ddd` for the component, `nzt-software` sets the shape (aggregates,
contexts); this file still holds for everything else.

## The file

```markdown
# Domain model — Pedidos

## Order
What a customer buys at a given moment. Born as a basket; an order once confirmed.

Fields
- **Subtotal** — the sum of the products, without shipping or tax
- **ConfirmedAt** — when it stopped being a basket; empty while it still is

Relationships
- has many **OrderLine**
- belongs to a **Customer**, or to nobody if bought as a guest
- may have one **Coupon**
```

## Rules

1. **One entity: a short paragraph** saying what it is in the business, its fields, its
   relationships.
2. **A field enters only if a rule or criterion asks for it.** Name it and say what it means
   in one line: no type, length, nullability, default, key or index.
3. **Relationships in words with cardinality** (*has many*, *belongs to*, *may have*), and
   **the optional case written out** — that is where the defects live.
4. **Names are the glossary's code names.** A term without an entry gets one first
   (`nzt-discovery`). Prose stays in the user's language.
5. Not here: business rules (the spec), meanings (the glossary), which component owns the
   data (`architecture.md`), technical artifacts (join tables, caches, logs), any line of code.

## Done when

The user can read it and say whether it is true, and an implementer can start a story
without asking what something holds.
