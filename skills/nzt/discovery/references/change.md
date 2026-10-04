---
name: nzt-discovery-change
description: Use when a feature that already exists has to change: the proposal written before the spec is touched, and its merge into the rules, stories and markers.
---

# Changing a feature that exists

Produces `Plan/specs/<feature>/change.md` — the proposal — and, once the user approves it,
the edited `spec.md` and stories with their change markers. Then the proposal is deleted.

If you did not arrive here from `nzt-discovery`, load it first.

It exists for one reason: **editing a spec is destructive and there is no cheap undo.** The
proposal is where the user approves before the source of truth is touched.

> **The proposal is the proposal of a change, never the working surface.** It carries no
> checkboxes and no coverage marks: that would be a second place where progress lives.

## The two signals

- **A `change.md` in the folder** → a change **not yet approved**.
- **Markers in the spec or the stories** → a change **approved and not yet finished**.

Both are read at a glance, and both are gone when the feature closes.

## Before writing it

Read the feature's `spec.md`, its stories, its `analysis.md` and the glossary. Ask only what
would change the result; everything technical that surfaces goes to the technical notes and
is not decided here. **An observation from the code never becomes the new rule on its own** —
the user decides whether what the system does today is what it should do.

## Type the change first

| Type | Means | What it produces in the spec |
|---|---|---|
| `add` | new behavior | new rules and new criteria, in `[ ]` |
| `modify` | existing behavior changes | `[modify]` — it **replaces**, it does not add up |
| `remove` | behavior stops applying | `[remove]`, with its area and its checkbox |
| `deprecate` | alive, on its way out | nothing yet: only the history entry at close |

## The file

```markdown
# Change — F-003 · Discount coupons
opened: 2026-08-16
origin: "the coupon should not apply to shipping"

## modify · RN-base-de-calculo
Before: the discount is calculated over the total, shipping included.
Now:    it is calculated over the products' subtotal.

## add · US-008
A criterion for one coupon per order: applying a second one discards the first.

## remove · RN-acumulacion
Two coupons stop adding up. Nothing in the product replaces it; the second coupon
simply wins.
```

`origin:` is **the user's own sentence**, the one that triggered the change. It is what makes
this readable months later, and it becomes `Reason:` in the history entry at close.

## The cycle

1. Understand the change and what it drags with it.
2. Write the proposal. Nothing undefined is filled in: it is left as an open question.
3. **The user approves it.** Nothing below happens first.
4. Merge it into `spec.md` and the stories, with markers; bring the feature's technical
   design and screen designs along in the same unit.
5. Delete `change.md`.
6. Build the changed criteria, then verify them.
7. The user accepts, and `nzt-plan-close` closes the feature and writes its history.

The merge comes **before** implementation, so the code is written against the current
criteria and never against a proposal.

## The merge

```markdown
### RN-base-de-calculo · origin: Q-01
The system calculates the discount over the products' subtotal, never over the shipping
cost.

### RN-acumulacion · [remove] · backend —
Two coupons stop adding up.
```

```markdown
- [ ] **A valid coupon discounts the subtotal only.** (RN-base-de-calculo) [modify]
  When I apply a 25% coupon to an order of $10.000 with $2.000 of shipping, the total is
  $9.500.
  backend — · frontend —
```

- **`[modify]` tells the implementer *this replaces something, do not add it alongside*.**
  The criterion goes back to `[ ]` and its areas back to `—`, because what is observed
  changed. A criterion whose wording changed but whose observable result did not **keeps its
  mark**.
- **`[remove]` carries an area and a checkbox** because **removing behavior is work, not the
  absence of work**. `nzt-build-remove` is what sweeps the code.
- Markers stay until the feature closes. Whoever implements does not clean them up.

## Removing is where this goes wrong

Deleting a rule from the spec **does not delete it from the code**. Worse: the spec is left
with no trace that the rule existed, so nothing can detect the drift — the spec reads right
and the code keeps doing the old thing.

That is why a `remove` is never *"just take it out"*:

- It says **what behavior stops existing**, in the user's vocabulary, with its area and its
  checkbox. It does not enumerate files or tests: that is the how, and the how is build's.
- **It produces at least one criterion that verifies the absence**: *"given an order of $80,
  when I reach checkout, shipping **is charged**"*. Without it the removal is a promise;
  with it, a regression is detectable.
- That criterion is transient. At close it is replaced by the positive rule that took its
  place, or removed with it — **and its test stays**.

## What travels with the merge

- The feature's technical design, if a changed rule touches a flow, a state or an
  integration. It is maintained in the same unit, not asked about.
- The screen designs and their mockups that showed a changed criterion.
- The glossary, if the change renames or splits a term.

## Done when

Rehearse it: could the implementer work from the spec alone, with no idea a change ever
happened, and get exactly the agreed behavior?

- The change is typed, and every `[modify]` and `[remove]` names an existing rule or
  criterion.
- Every `remove` says what stops existing and leaves a criterion that proves the absence.
- The proposal was approved before anything was merged, and then **deleted**.
- Nothing undefined was invented: it is an open question with its `Q-NN`.
- The design and screens the change touched travelled with it.
- No file path, class, table or package anywhere in the proposal or the spec.
