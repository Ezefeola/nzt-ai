---
name: design
description: Use when the form of what a person perceives or operates has to be decided - layout, content, states and navigation, a mockup or prototype, the design system and voice, a usability review, the end user's manual.
---

# Design — the form of what a person perceives and operates

Decides how a person accomplishes what the story describes, before anyone builds it.
**Owns** layout, content, every state, navigation, the design system and shared components,
usability and accessibility reviews, and **the end user's manual**. **Does not own** rules
(`nzt-discovery`), component architecture (`nzt-architecture`) or the work that renders it
(`nzt-build`). **The story is the authority**; a design never introduces behavior.

## References

| The unit is | Read | Read with |
|---|---|---|
| One view a person acts in: layout, content, states, navigation | `references/screen.md` | — |
| A mockup of a designed view (asked for), or a prototype (offered by the plan) | `references/mockup.md` | `references/review.md`, `references/generic.md` |
| The end user's manual — on request | `references/manual.md` | `references/review.md`, `references/generic.md` |
| The design system, shared components, visual direction, brand and voice | `references/system.md` | `references/generic.md` |
| Judging a design, mockup or built view against its task | `references/review.md` | `references/generic.md` |

## Steps

1. Read the story and its criteria, `Docs/Design/design-system.md` and `Docs/Design/ui-components.md`.
2. Do one unit: one screen, one mockup, one review, one system document. The manual is
   several units (shell, one chapter per task, a coherence pass): **load `nzt-plan` with
   it**; the first reply is that plan.
3. What designing reveals as undefined is a `Q-NN` in the feature's `analysis.md`, cited here
   as pending — never decided by drawing it.

**Skip it** when no screen changes, the change stays inside an established pattern, or there
is no interface. A request for the manual is this phase's work even then.

## Where it lands

- A screen design, with its mockup beside it → `Plan/specs/<feature>/design/`
- A prototype → `Plan/prototype/<slug>.html`; afterwards deleted or kept in
  `Docs/Design/prototype/` and maintained, as the user decides
- `Docs/Design/design-system.md` · `Docs/Design/ui-components.md`
- The manual, one file per audience → `Docs/Manual/<audience>.html`, images in
  `Docs/Manual/assets/`
- A project that already has `Docs/UX/` or `Plan/specs/<feature>/ux-ui/` is read and written
  there until the user moves them; never both.

## Rules

- **The mechanism is cross-cutting (design system); the content is product (story).** If you
  are writing a sentence the user will read and no criterion fixes it, you are writing a story.

## Done when

The unit's reference *Done when* holds, and nothing it produced promises behavior no
criterion supports.
