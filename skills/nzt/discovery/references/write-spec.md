# Feature specification

Produces `Plan/specs/F-NNN-<slug>/spec.md`: scope, rules, non-functional requirements and the
story index of one feature. **The rules live here and nowhere else.**

## Steps

1. Read the feature's `analysis.md`, `product.md` and the glossary. A rule whose source you
   cannot name goes back as a question.
2. Write the file. Go through the rules once looking only for what can go wrong.

## The file

```markdown
# F-003 · Coupons at checkout

## What it solves
Customers with a promotion code cannot use it.

## Scope
**In**
- Applying one coupon and seeing the discount before confirming.
**Out**
- Administering coupons — F-009, not asked for yet.
- Two coupons on one order: one per order (Q-11).

## Business rules
### RN-cupon-vencido · origin: Q-07
If the coupon's expiry date has passed, then the order is confirmed without the discount and
the customer is told the coupon expired.

## Non-functional requirements
- Applying a coupon answers in under 2 seconds with 500 active coupons.

## Stories
| Story | What it covers |
|---|---|
| US-001-aplicar-cupon | Applying a valid coupon and seeing the new total |
| US-003-cupon-en-soporte | As a support agent, I want to see why a coupon was rejected, so I can answer without escalating |

## Open
- Q-13 · Does a refund return the coupon?
```

## Rules

1. **A rule is always true**, never a scenario. Shapes: *The X always…* · *When trigger,
   what happens* · *If bad case, then…* (the one that pays) · *While state, what holds*. One
   statement per rule.
2. **A slug, never a number** (`RN-cupon-vencido`); it never changes. **`origin:`** is `Q-NN`
   (the user said it), `PRD` (from `product.md`) or `reverse (R-NN)` (from the existing
   product, confirmed by the user).
3. **Scope in both directions**; every *Out* says why or where it lives.
4. **Non-functional requirements state the expected result, never the mechanism**, with the
   number and its condition (*at 5,000 orders*) — `nzt-verify` measures against it. A number
   the user did not give is not a requirement. *"Only the owner sees their order"* is a rule.
5. **The story index has no checkboxes**; it is the backlog. A story for a later delivery
   stays one line *As… I want… so that…*. Scope, rules and the whole index exist before the
   feature's first slice is built.
6. **It describes the present**: a change edits it in place; a rule that no longer holds is
   removed and its slug never reused.

## Done when

Someone could write every story from this file alone; every rule has slug and origin; at
least one rule covers something going wrong; no requirement names a technology.
