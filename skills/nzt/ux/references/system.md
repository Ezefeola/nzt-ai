# Design system and shared components

## Contents
- The document names; the code defines
- Visual direction
- Shared components
- Changing it
- Done when

Produces two documents in `Docs/`, one per unit:

- **`Docs/design-system.md`** — the visual direction and the roles every screen reuses.
- **`Docs/ui-components.md`** — the shared component inventory.

They are separate because they rot at different speeds: the direction and its roles are
stable, the component list changes with every second screen.

## The document names; the code defines

**The design system is not a token catalogue.** Copying the theme's values into a document
duplicates them and lies at the first palette change. What is written here is what the
theme cannot say: the **role**, when it is used, and **its limit**.

```markdown
## Roles
| Role | When it is used | Its limit |
|---|---|---|
| Primary action | the one thing this view is for | one per view |
| Destructive action | removes something the user cannot get back | always confirmed |
| Warning surface | a consequence the user should read before acting | never for success |

## Conventions
- Lists load as a skeleton, never a spinner.
- Errors are shown next to the field that caused them, and repeated in one summary.
- A form that failed keeps what the user typed.

## Accessibility — how it is met
- Contrast at least 4.5:1 for text, 3:1 for controls and meaningful graphics.
- Focus visible on every control, and never hidden behind sticky elements.
- Tap and click targets at least 24×24, with spacing when smaller is unavoidable.
```

*"The primary action, one per view"* is exactly what an agent cannot deduce from reading a
theme, and it is why this file exists.

**Accessibility splits in two**: the verifiable requirement — *"every control is reachable
by keyboard"* — is a product-level NFR and belongs to the product. **How** it is met lives
here. Written in one place, one of the two stops being verifiable.

## Visual direction

Only when the product has none. A direction invented with no references is a guess dressed
as a decision.

1. **Ask one short round** about what already exists: brand, products to resemble or to
   differ from and why, who uses it and how often, density and tone, constraints.
2. **Anchor it in the subject.** A logistics console and a bakery's order page cannot come
   out looking the same.
3. **Second pass against the generic default.** These are the tells of a generated design:
   everything in rounded cards with the same soft shadow · decorative gradients · a small
   uppercase label above every heading · an arrow glued to every button · the big number
   with a small caption repeated as each section's hero · motion on every hover.
4. **Structure encodes information.** A border, a number or a label is there because the
   content needs it. **Spend boldness in one place**, and remove one decoration before
   presenting.
5. **Calculate contrast before presenting.** A palette that fails contrast is not a
   proposal yet.
6. Alternatives vary **one meaningful dimension** — density, typographic voice, colour
   temperature — not three versions of the same thing.

## Shared components

`Docs/ui-components.md` is coarse-grained and short. A component earns an entry only when:

- two screens use it, **or**
- it carries a decision that would otherwise be re-argued on every screen.

```markdown
## Data table
Used by: orders, coupons.
Carries: pagination at 25, sort on the column the list is ordered by, empty state with the
filter that produced it.
Do not use for: fewer than five rows — a list reads better.
```

**This is the document that rots fastest, and the only defence is keeping it small.** A
component listed with no reader is maintenance with no buyer: if nothing uses it twice, it
is not shared, it is just a component.

## Changing it

- A new convention is a **change to the system**, not a local exception. It is proposed with
  what it replaces, and once it is in, existing screens either follow it or say why they do
  not.
- Proposals arrive from reviews and from screens that needed something the system does not
  have. `nzt-ux-review` proposes; this document decides.
- A role or convention nobody follows is removed. A document describing a system that is
  not the one on screen sends every reader in the wrong direction.

## Done when

Rehearse it: could someone design the next screen without inventing a convention, and
without asking you which component to reuse?

- Every role says when it is used **and its limit**.
- No value that lives in the theme is copied here.
- Accessibility says how it is met, and the verifiable requirement is in the product's NFRs.
- Every component in the inventory has at least two users, or the decision it carries.
- A visual direction, if it was needed, has its references, its contrast checked, and one
  decoration already removed.
