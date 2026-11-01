# Product definition

Produces `Docs/Product/product.md`: what the product is, for whom, and what it will not be —
the document every feature is checked against. **The minutes, not the source**: every line
traces to `Docs/Product/analysis.md`; what you filled in is marked proposed. Never written by
reading the repository: existing behavior enters as a question (*"it does X today; is that
what it is for?"*).

## The file

```markdown
# Product — Pedidos

## Objectives
- **Coupons get redeemed.** Today campaigns run and nobody can use the code.
  Known by: campaigns end with redemptions above zero.

## Users
| Who | What they need | What they cannot do today |
|---|---|---|
| Customer | Pay the promotional price alone | Enter a code anywhere |
| Support agent | See why a coupon was rejected | Only sees the final total |

## Modules
- **Ordering** — building an order and confirming it.
- **Promotions** — coupons, validity and redemption.

## Constraints
- Billing stays in the current system. The team is two people.

## Delivery 1
- **For:** coupons get redeemed.
- **In:** applying a valid coupon and the rejected cases.
- **To learn:** whether customers find where to enter the code (Q-15).
- **Known by:** the first campaign after it ends with redemptions above zero.

## Scope
**In**
- Redeeming a coupon during checkout.
**Out**
- Creating campaigns: marketing keeps its own tool (Q-04).

## Open
- Q-13 · Does a refund return the coupon?
```

## Rules

1. **Objectives**: three to five results for someone, each with today's pain and **Known by**
   (what changes when achieved). *Coupons* is a module; *coupons get redeemed* is an objective.
2. **Users**: a role earns a row only if it changes what the product must do or show; the
   third column turns the list into something checkable. Name the daily operator when it is
   not the buyer.
3. **Modules**: what the product does, one line each — not folders, screens or components.
   No feature index here.
4. **Constraints**: what the user imposes (existing systems, deadline, budget, team, law),
   recorded even when you disagree (say so once). An assumed technical constraint is not one.
5. **Delivery 1**: ask *is there anything to learn from users before building the rest?* Yes
   → the least that teaches it, with **To learn**. No → *"the whole scope: nothing to learn
   first"*, written as a decision. It cuts scope, never the definition of done.
6. **Scope in both directions**; each *Out* line says why or where it lives. Neither in nor
   out is an open question.
7. **A first version** (standard work, or an existing product without one): objectives (at
   least the feature's), users it touches, scope and open, opening with `> First version:
   grows with each feature.`
8. It describes the present and is edited in place.

## Done when

Someone could decide whether a proposed feature belongs, using only this file; it names no
technology, component or screen.
