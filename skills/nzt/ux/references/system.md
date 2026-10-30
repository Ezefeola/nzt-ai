# Design system and shared components

## Contents
- The document names; the code defines
- Visual direction
- Brand and voice
- Shared components
- Changing it
- Done when

Produces two documents in `Docs/`, one per unit:

- **`Docs/UX/design-system.md`** — the visual direction and the roles every screen reuses.
- **`Docs/UX/ui-components.md`** — the shared component inventory.

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
- Level: WCAG 2.2 AA, the one the product's NFR commits to.
- Focus is the theme's focus ring, never removed, and sticky elements leave room for it.
- Icon-only controls carry a text label for assistive technology.
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
2. **Plan it and run the pass of `nzt-ux-generic`**: the subject, the visual plan, its
   review against the request, the tells, and alternatives that vary one dimension.
3. **Calculate contrast before presenting.** A palette that fails contrast is not a
   proposal yet.

## Brand and voice

The direction, once agreed, is written in `design-system.md` as the product's brand, so every
screen, mockup and prototype reads it from one place instead of inventing it again.

- **Logo**: the path to its file in the project, and where it may and may not appear. No
  logo is written as *none yet*, never drawn as a placeholder someone mistakes for one.
- **Typography**: the families and the role each one plays.
- **Palette by role** — primary action, surface, text, danger — each with its value. **Before
  any theme exists in code, the values live here marked `provisional`**; once the theme is
  written, it holds them and this section keeps only the roles, as *The document names*
  says.
- **Voice of the texts**: how the product talks to the person — formal or not, how it says an
  error, how it invites an empty state to fill — with one example per case. A text a story
  fixes is copied from the story; the voice is what lets the rest be written without asking.
- **Rejected directions**: one line each — what it was and why the user turned it down — so
  no later pass offers it again.
- A change to any of these is a change to the system (*Changing it*), and the screens,
  mockups and kept prototypes that show it are brought in step in the same unit.

## Shared components

`Docs/UX/ui-components.md` is coarse-grained and short. A component earns an entry only when:

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
- No value that lives in the theme is copied here; before a theme exists, values are marked
  `provisional`.
- Brand and voice are written once a direction is agreed: logo, typography, palette by
  role, and the voice with its examples.
- Accessibility says how it is met, and the verifiable requirement is in the product's NFRs.
- Every component in the inventory has at least two users, or the decision it carries.
- A visual direction, if it was needed, has its references, its contrast checked, and the
  pass of `nzt-ux-generic` with its result in the report.
