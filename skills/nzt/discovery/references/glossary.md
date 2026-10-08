# Glossary

Produces `Docs/Domain/glossary.md`: the terms this product's domain uses, what each one means
**here**, and the one name it gets in code. It exists so the spec, the screens, the code
and the user are talking about the same thing.

## What earns an entry

- A term the business uses whose meaning is **specific to this product**. *"Order"* means
  something narrower here than in general.
- A term two people use for different things, or two terms used for the same thing.
- A term whose name in code is not the obvious translation of what the user says.
- A distinction that matters: *coupon* and *campaign*, *cancelled* and *refunded*.

What does not earn one: general technical vocabulary, anything everybody reads the same
way, and anything that is really a rule. *"A coupon expires after its date"* is
`RN-cupon-vencido` in the feature spec, not a definition.

## The file

```markdown
# Glossary — Pedidos

## Cupón · `Coupon`
A code a customer enters at checkout to pay less. Belongs to a campaign, is redeemed at
most once per customer, and stops working after its date.
- Not to be confused with **campaña**: the campaign is the rule set, the coupon is the code.

## Redención · `Redemption`
The act of a coupon being accepted on a confirmed order. A coupon applied to an order that
was never confirmed is not a redemption.
- Support calls this "uso". Same thing; the document uses *redención*.

## Orden · `Order`
A purchase the customer confirmed. A basket that was never confirmed is a **carrito** and
is a different thing.
- In the support desk, "orden" is used for the ticket, not for the purchase. That meaning
  belongs to support and is not this one (Q-09).
```

## One entry, one meaning

- The heading is the term in the user's language, and the backticked name is **the single
  name it gets in code**. The project's artifacts follow the user's language; the code is
  English, and this file is where the two are tied together.
- **One name per concept in code.** If the code already has two, say which one wins here
  and treat the other as a rename, not as a synonym to be kept alive.
- Define by what the term **is**, not by how it is stored or displayed. A definition that
  mentions a table, a column or a screen has drifted into another phase.
- Add *not to be confused with* whenever a neighbouring term exists. Most glossary damage
  is two close terms, not one unknown one.

## The same word meaning two things

Do not force one definition on it. Record both, each with the part of the product it
belongs to, and say which one the specs use by default.

- A word that means two things in two parts of the product is worth flagging: it is often
  the visible edge of two different areas of the domain, which is something architecture
  will want when it draws boundaries. Name the observation; do not draw the boundary here.
- A word the user and the team use differently is settled with the user, and the losing
  word is recorded as such — *"support calls this X"* — so nobody re-opens it.

## Keep it current

- The glossary is the tie-breaker: when a spec, a story or a screen uses a different word
  for something that is in here, the document is wrong, not the glossary — or the glossary
  changes and everything follows in the same unit.
- A renamed term is renamed everywhere it appears. It is not left with the old name "for
  now", and the old name stays in the entry as what it used to be called.
- New terms arrive as the interview produces them. A glossary written in one sitting and
  never touched again is a list of words nobody reads.

## Stay on your side of the line

The term and its meaning are discovery's. The entity, its identity, its aggregate and where
it is persisted are architecture's. If the entry is starting to describe fields and
relationships, stop: what you have is a domain model, and it belongs in
`Docs/Domain/domain-model.md`, which `nzt-architecture-domain` writes. A term that means two
different things in two contexts keeps both readings here, and the boundary that separates
them is `Docs/Domain/context-map.md`'s.

## Done when

Rehearse it: could someone new read a feature spec end to end without asking what a word
means?

- Every entry says what the term means here, not how it works.
- Every entry has its single code name.
- Close terms carry their *not to be confused with*.
- Every word that means two things has both meanings and the default one.
- No entry defines a rule, a field or a screen.
