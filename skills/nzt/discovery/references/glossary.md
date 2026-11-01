# Glossary

Produces `Docs/Domain/glossary.md`: what each domain term means **here**, and the one name it
gets in the work (code, assets, data), so spec, screens, work and user say the same thing.

**Earns an entry**: a term whose meaning is specific to this product, one two people use
differently (or two terms for one thing), one whose code name is not the obvious translation,
a distinction that matters (*coupon* vs *campaign*). Not general vocabulary, nor a rule
(*"a coupon expires after its date"* is `RN-cupon-vencido`).

## The file

```markdown
# Glossary — Pedidos

## Cupón · `Coupon`
A code a customer enters at checkout to pay less. Belongs to a campaign, is redeemed at most
once per customer, and stops working after its date.
- Not to be confused with **campaña**: the campaign is the rule set, the coupon the code.

## Orden · `Order`
A purchase the customer confirmed. An unconfirmed basket is a **carrito**.
- In the support desk "orden" means the ticket (Q-09). Not this meaning.
```

## Rules

1. The heading is the term in the user's language; the backticked name is **the single name
   in the work**. Two names already in use: say which wins and treat the other as a rename.
2. Define what the term **is**, never how it is stored or shown.
3. Add *not to be confused with* for every neighbouring term.
4. A word with two meanings in two parts of the product keeps both, each with its part, and
   the default; flag it — it is often a boundary architecture will want. A word the user and
   team use differently is settled with the user; the losing word is recorded.
5. **It is the tie-breaker**: a document using another word is wrong, or the glossary changes
   and everything follows in the same unit. A rename happens everywhere; the old name stays
   in the entry.
6. Fields, relationships and identity are `domain-model.md`'s, not here.

## Done when

Someone new could read a spec end to end without asking what a word means.
