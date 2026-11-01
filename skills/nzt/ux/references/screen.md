# Screen design

Produces `Plan/specs/<feature>/ux-ui/screen-<slug>.md`: one screen (or menu, HUD, page)
described well enough to build and review, traceable to its criteria.

## Steps — each constrains the next

1. **The task**: who arrives, from where, to do what, and **the** primary action.
2. **The regions**, in reading order.
3. **The elements** per region, each with its origin.
4. **The states**, all of them.
5. **The navigation**: where you arrive from, where each action leaves you.
6. **The pass against the story**: every criterion has a place here or is listed elsewhere.

## The file

```markdown
---
screen: Checkout
stories: US-001, US-002
update-when: the coupon criteria change, or the order summary gains a field
---
# Checkout

## Task
A customer with a full basket confirms the purchase and may apply a code.
**Primary action: Confirm order.**

## Regions
1. **Order summary** — what is bought and what it costs.
2. **Coupon** — entering a code and its result.

## Elements
| Region | Element | Origin |
|---|---|---|
| Coupon | discount line, −$2.500, and the new total | US-001 CA-01 |
| Coupon | rejection message, verbatim | US-002 CA-01 |
| Confirmation | primary button | design system: one primary action per view |

## States
| State | What is shown | Origin |
|---|---|---|
| Loading | summary skeleton; action unavailable | design system |
| Empty | not applicable: checkout needs a basket (US-001) | |
| Extreme data | 60 items: the summary scrolls, the total stays visible | Q-14 pending |

## Narrow screen
Regions stack in order; total and primary action stay reachable.

## Navigation
- From: the basket (`screen-basket.md`). *Confirm order* → `screen-order-confirmed.md`.

## Pending
- Q-14 · Is there a maximum number of items in an order?
```

## Rules

1. **Every element names its origin**: a criterion, a design-system convention, or a shared
   component's documented use. No origin = invented behavior → a `Q-NN`, listed pending.
2. Text a criterion fixes is copied **verbatim**; use the story's own example data.
3. **Every state** — loading, empty, error, partial, no permission, success, extreme data —
   is described or *not applicable with its reason*. How many items can exist is the story's
   rule; how the list paginates is construction.
4. **Regions, not pixels**: hierarchy, grouping, order. Sizes, colours and spacing are the
   design system's. Always say what changes on a narrow screen.
5. A design made elsewhere (export, screenshots) is input: convert it to regions, elements
   and states with origins; what no criterion asks for becomes a `Q-NN` or goes.
6. `update-when` is a checkable condition.

## Done when

Someone could build it and someone else review it without asking what happens in a case you
did not draw.
