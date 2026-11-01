---
name: nzt-ux
description: Use when a person will see or operate something - a screen or menu's layout, content, states and navigation, its mockup or prototype, the design system and brand, a usability review, or the end user's manual.
---

# UX — what the person sees and does

Decides how a person accomplishes what the story describes, before anyone builds it.
**Owns** layout, content, every state, navigation, the design system and shared components,
usability and accessibility reviews, and **the end user's manual**. **Does not own** rules
(`nzt-discovery`), component architecture (`nzt-architecture`) or the work that renders it
(`nzt-build`). **The story is the authority**; a design never introduces behavior.

## References

| The unit is | Read | Read with |
|---|---|---|
| One screen: layout, content, states, navigation | `references/screen.md` | — |
| A mockup of a designed screen (asked for), or a prototype (offered by the plan) | `references/mockup.md` | `references/review.md`, `references/generic.md` |
| The end user's manual — on request | `references/manual.md` | `references/review.md`, `references/generic.md` |
| The design system, shared components, visual direction, brand and voice | `references/system.md` | `references/generic.md` |
| Judging a design, mockup or built screen against its task | `references/review.md` | `references/generic.md` |

## Steps

1. Read the story and its criteria, `Docs/UX/design-system.md` and `Docs/UX/ui-components.md`.
2. Do one unit: one screen, one mockup, one review, one system document. The manual is
   several units (shell, one chapter per task, a coherence pass): **load `nzt-plan` with
   it**; the first reply is that plan.
3. What designing reveals as undefined is a `Q-NN` in the feature's `analysis.md`, cited here
   as pending — never decided by drawing it.

**Skip it** when no screen changes, the change stays inside an established pattern, or there
is no interface. A request for the manual is this phase's work even then.

## Where it lands

- A screen design, with its mockup beside it → `Plan/specs/<feature>/ux-ui/`
- A prototype → `Plan/prototype/<slug>.html`; afterwards deleted or kept in
  `Docs/UX/prototype/` and maintained, as the user decides
- `Docs/UX/design-system.md` · `Docs/UX/ui-components.md`
- The manual, one file per audience → `Docs/Manual/<audience>.html`, images in
  `Docs/Manual/assets/`

## Rules

- **The mechanism is cross-cutting (design system); the content is product (story).** If you
  are writing a sentence the user will read and no criterion fixes it, you are writing a story.

## Done when

The unit's reference *Done when* holds, and nothing it produced promises behavior no
criterion supports.
