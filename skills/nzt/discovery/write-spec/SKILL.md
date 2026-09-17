---
name: nzt-discovery-write-spec
description: Use when writing or changing a feature specification: scope in both directions, business rules with stable slugs, and its story index.
---

# Feature specification

Produces `Plan/specs/F-NNN-<slug>/spec.md`: the cross-cutting document of one feature. It
holds what the whole feature is — scope, rules, non-functional requirements — and indexes
the stories that carry the criteria. **The rules live here and nowhere else.**

If you did not arrive here from `nzt-discovery`, load it first.

## Before writing

Read the feature's `analysis.md`, the product definition and the glossary. Every rule you
are about to write comes from one of them. **If you cannot name where a rule came from, it
is not established yet — it goes back as a question, not into the file.**

## The file

```markdown
# F-003 · Coupons at checkout

## What it solves
Customers with a promotion code cannot use it, so the campaign runs without redemptions.

## Scope

**In**
- Applying one coupon to an order, and seeing the discount before confirming.
- Rejecting a coupon that is expired, already used or does not exist.

**Out**
- Creating and administering coupons — that is F-009, and nobody asked for it yet.
- Stacking two coupons on one order. The user decided one per order (Q-11).

## Business rules

### RN-cupon-vencido · origin: Q-07
If the coupon's expiry date has passed, then the order is confirmed without the discount
and the customer is told the coupon expired.

### RN-un-cupon-por-orden · origin: Q-11
The order accepts at most one coupon.

## Non-functional requirements
- The discount is visible in the order summary before confirming, not after.
- Applying a coupon answers in under 2 seconds with 500 active coupons.

## Stories
| Story | What it covers |
|---|---|
| US-001-aplicar-cupon | Applying a valid coupon and seeing the new total |
| US-002-cupon-rechazado | Expired, used and unknown coupons |

## Open
- Q-13 · Does a refund return the coupon to the customer?
```

## Business rules

Write each rule as a statement that is **always true**, not as a scenario. The scenario is
the story's job.

| Shape | When to write it that way |
|---|---|
| `The <thing> <always does this>.` | It holds unconditionally |
| `When <trigger>, <what happens>.` | It is triggered by an event |
| `If <bad case>, then <what happens>.` | Something goes wrong |
| `While <state>, <what holds>.` | It only holds in a state |

**The `If <bad case>` shape is the one that pays.** It forces the unhappy path into the
file, which is exactly the part that gets invented later if nobody wrote it. Go through the
rules once looking only for what can go wrong.

- **A slug, never a number**: `RN-cupon-vencido`, not `RN-04`. It reads without opening
  anything and survives a reorder. **The slug never changes**, even if the text is
  rewritten.
- **`origin:` says what the rule is worth**: `Q-NN` (the user stated it), `PRD` (it comes
  from the product definition) or `reverse` (extracted from code **and confirmed by the
  user**). A rule reconstructed from code is not worth the same as a dictated one, and the
  reader has to be able to tell.
- **Never copy a rule into a story.** Stories cite the slug. Copied into one it is
  duplicated; copied into two it eventually contradicts itself.
- One rule per statement. If it needs an "and also", it is two rules with two slugs.

## Scope, in both directions

**Out** is worth as much as **In**: it is the half that stops work nobody asked for.

- Each excluded line says **why**, or where it lives instead: another feature, a later
  round, a decision the user made.
- Something the user dismissed goes here, not in your head.
- If a line is neither in nor out, it is an open question, not scope.

## Non-functional requirements

**Expected result, never mechanism.** *"The listing loads in under 2 seconds"* is spec;
*"we use Redis"* is architecture, and it does not go in this file.

- Watch for the ones that sound technical and are not: *"only the owner can see their
  order"* is a business rule, and it belongs with the rules.
- A number the user did not give you is not a requirement. Ask for it, or write what was
  actually agreed.

## Story index

One line per story, saying what it covers.

- **No checkboxes.** Progress is read from the criteria in the stories, in one place only.
  An index with marks is a second source of truth that goes stale.
- The index can name a story that is not written yet. The stories themselves are written
  one per unit by `nzt-discovery-write-stories`.

## The spec describes the present

A change **edits this file in place**. Never write a second document that says something
different about the same feature, and never keep a superseded rule "for reference".

- A rule that no longer holds is removed; its slug is not reused for a different rule.
- What accumulates is the interview in `analysis.md`, not the spec.

## Stay on your side of the line

A spec that names a class, a table, an endpoint or a package has drifted into architecture.
Write what the user observes. When something technical surfaces, it goes to the technical
notes of `analysis.md` and architecture resolves it.

## Done when

Rehearse it: could someone write **every** story of this feature from this file alone,
without asking you anything?

- Every rule has its slug and its `origin:`.
- Scope is written in both directions.
- At least one rule covers something going wrong, or the file says why nothing can.
- No requirement names a technology.
- What is still missing is in **Open**, with its `Q-NN`. It is never invented.
