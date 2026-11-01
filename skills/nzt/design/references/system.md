# Design system and shared components

Produces, one per unit, `Docs/UX/design-system.md` (direction, brand, voice, roles — stable)
and `Docs/UX/ui-components.md` (shared inventory — changes often).

## The document names; the theme defines

Not a token catalogue: copied values lie at the first palette change. Write what the theme
cannot say — the **role**, when it is used, **its limit**:

```markdown
## Roles
| Role | When it is used | Its limit |
|---|---|---|
| Primary action | the one thing this view is for | one per view |
| Destructive action | removes something the user cannot get back | always confirmed |

## Conventions
- Lists load as a skeleton, never a spinner.
- A form that failed keeps what the user typed.

## Accessibility — how it is met
- Level: WCAG 2.2 AA, as the product's requirement commits to.
- Focus is the theme's ring, never removed; sticky elements leave room for it.
```

The verifiable accessibility requirement is the product's NFR; **how** it is met lives here.

## Steps for a visual direction (only when the product has none)

1. One short round about what exists: brand, products to resemble or differ from and why,
   who uses it and how often, density, tone, constraints.
2. Plan it with `generic.md`: subject, plan, review against the request, tells, alternatives
   varying one dimension.
3. Compute contrast before presenting.
4. Once agreed, write the **brand**: logo (its path and where it may appear, or *none yet* —
   never a placeholder logo); typography with roles; palette by role (values marked
   `provisional` until a theme exists in code, then roles only); **voice** — how the product
   speaks, says an error, invites an empty state — one example each; **rejected directions**,
   one line each with why.

## Shared components

```markdown
## Data table
Used by: orders, coupons.
Carries: pagination at 25, sort on the list's order column, empty state naming the filter.
Do not use for: fewer than five rows.
```

An entry earns its place with two users or a decision that would be re-argued per screen.
Keep it small: it is the document that rots fastest.

## Changing it

A new convention is a change to the system, proposed with what it replaces; existing screens
follow it or say why not. Reviews and screens propose; this document decides. A role nobody
follows is removed. Brand changes bring screens, mockups and kept prototypes along in the
same unit.

## Done when

Someone could design the next screen without inventing a convention or asking which component
to reuse.
