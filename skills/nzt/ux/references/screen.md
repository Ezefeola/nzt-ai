# Screen design

## Contents
- Order of work
- The file
- Elements and their origin
- States
- Regions, not pixels
- A design made elsewhere
- Keeping it current
- Done when

Produces `Plan/specs/<feature>/ux-ui/screen-<slug>.md`: one screen, described well enough
to be built and reviewed, and traceable back to the criteria it serves. One screen per
unit.

## Order of work

Each step constrains the next. Doing them out of order is how a layout ends up deciding
what the screen is for.

1. **The task.** Who arrives, where from, what they came to do, and what **the** primary
   action is.
2. **The regions**, in reading order.
3. **The elements** of each region, each with its origin.
4. **The states**, all of them.
5. **The navigation**: where you arrive from, where each action leaves you.
6. **The pass against the story**: every criterion has a place, or it is missing from this
   screen.

## The file

```markdown
---
screen: Checkout
stories: US-001, US-002
update-when: the coupon criteria change, or the order summary gains a field
---

# Checkout

## Task
A customer with a full basket confirms their purchase and, if they have one, applies a
promotional code. **Primary action: Confirm order.**

## Regions
1. **Order summary** — what is being bought and what it costs.
2. **Coupon** — entering a code and the result of applying it.
3. **Confirmation** — the primary action and what it commits to.

## Elements
| Region | Element | Origin |
|---|---|---|
| Summary | line per item, with subtotal $10.000 | US-001 CA-01 |
| Coupon | code field and *Apply* | US-001 CA-01 |
| Coupon | discount line, −$2.500, and the new total | US-001 CA-01 |
| Coupon | rejection message, verbatim from the criterion | US-002 CA-01 |
| Confirmation | primary button | design system: one primary action per view |

## States
| State | What is shown | Origin |
|---|---|---|
| Loading | summary skeleton; the action is not available yet | design system |
| Empty | not applicable: you cannot reach checkout with an empty basket (US-001) |  |
| Error | the summary could not be loaded: message and retry | design system |
| Coupon rejected | total unchanged, message from the criterion | US-002 CA-01 |
| No permission | not applicable: the screen is the customer's own | — |
| Extreme data | 60 items: the summary scrolls, the total stays visible | Q-14 pending |

## Narrow screen
The regions stack in the same order. The total and the primary action stay reachable
without scrolling back up.

## Navigation
- Arrived from: the basket (`screen-basket.md`).
- *Confirm order* → order confirmed (`screen-order-confirmed.md`).
- Rejecting a coupon leaves you here; nothing navigates.

## Pending
- Q-14 · Is there a maximum number of items in an order?
```

## Elements and their origin

Every row names where it comes from: a criterion (`US-NNN CA-NN`), a design system
convention, or the documented use of a shared component. **A row with no origin is invented
behavior** — turn it into a `Q-NN`, list it as pending, and do not draw it as decided.

- If you are writing a sentence the user will read on screen and no criterion fixes it, you
  are writing a story. Leave it pending and say so.
- Wording a criterion fixes is copied **verbatim**. Improving it in the design silently
  changes the spec.
- Use the story's own example data — the same amounts, dates and names. Invented data hides
  the case the criterion was about.

## States

Go through the list and write each one, or declare it **not applicable with its reason**:
loading, empty, error, partial, no permission, success, and **extreme data** — one item,
hundreds, a name that does not fit, an amount with too many digits.

- An unwritten state is not "obvious": it is the one that gets built under pressure by
  someone who was fixing something else.
- *"Not applicable"* with no reason is a state nobody checked.
- **How many items can exist is a rule of the story; how the list paginates or the text
  wraps is construction.** Do not decide the first one here.

## Regions, not pixels

Fix hierarchy, grouping and reading order. Sizes, colors, spacing and the shape of controls
belong to the design system, and repeating them here creates a second source that drifts.

**Always say what changes on a narrow screen.** That is where designs break, and it is the
first thing a mockup will make obvious anyway.

## A design made elsewhere

An exported prototype or a set of screenshots is an **input**, not a screen design. Convert
it: regions, elements, states, each with its origin.

- What no criterion asks for is not adopted because someone drew it. It becomes a `Q-NN` or
  it goes.
- Colors and type map to design system roles. A value matching no role is a proposal to the
  design system, not a local exception.

## Keeping it current

`update-when` in the frontmatter says which change forces this document to be revisited.
It is what makes closing a feature a sweep instead of an act of memory, so write it as a
condition someone can check, not as "when it changes".

## Done when

Rehearse it: could someone build this screen, and someone else review it, without asking
you what happens in a case you did not draw?

- The task and its single primary action are written.
- Every criterion of the story has a place here, or is listed as belonging elsewhere.
- Every element has its origin; every state is described or declared not applicable with a
  reason.
- Narrow-screen behavior is stated.
- Navigation names its destinations by file.
- Nothing on the screen promises something no criterion supports.
