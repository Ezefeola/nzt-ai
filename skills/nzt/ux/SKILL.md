---
name: nzt-ux
description: Use when a person will see or operate something: a screen's layout, content, states and navigation, its HTML mockup, the design system, or a usability review.
---

# UX — what the person sees and does

This phase decides how a person accomplishes the task the story describes. It designs
before anyone builds, because a screen is cheaper to change as a description than as code.

## Boundaries

**Owns:** screen layout, the content of each screen, every state a screen can be in,
navigation between screens, the design system and the shared component inventory,
usability and accessibility reviews, and **the manual the end user reads** — the one
artifact in the set written for them and not for whoever builds.

**Does not own:** business rules (`nzt-discovery`), component architecture
(`nzt-architecture`), the code that renders it (`nzt-build`). **The story is the
authority; the screen design is a reference.** A design never introduces behavior.

## Required guidance

Before designing, read the story and its acceptance criteria, the design system, and the
shared component inventory. Reuse what is already loaded — the table below does not mean
load every row.

## Choose the skill

| The unit is | Load |
|---|---|
| One screen: layout, content, states, navigation | `nzt-ux-screen` |
| An HTML mockup of a designed screen — only if the user asked for it | `nzt-ux-mockup` |
| The end user's manual: an interactive HTML guide of the product — on request | `nzt-ux-manual` |
| The design system, shared components, or the visual direction | `nzt-ux-system` |
| Judging a design, a mockup or a built screen against its task | `nzt-ux-review` |

## When to skip this phase

Skip it when no screen changes, when the change stays inside an established pattern of an
existing screen, or when there is no interface at all. An API has no UX phase.

**A request for the end user's manual is this phase's work even when no screen changes**,
and even when the rest of the phase was skipped for this feature.

## One unit

One screen. A design covering six screens is six units. A mockup of a screen is its own
unit, and so is a review. **The manual is written at the end of what is being delivered, in
one stretch whose unit is a chapter** — one task the reader came to accomplish — closing
with the coherence pass, the only unit whose subject is the whole file.

## Where it lands

- One screen design, with its mockup beside it if there is one →
  `Plan/specs/<feature>/design/`
- Visual direction and the design system → `Docs/design-system.md`; the shared component
  inventory → `Docs/ui-components.md`. Both written and maintained by `nzt-ux-system`
- The end user's manual, one file per audience → `Docs/manual/<audience>.html`, its images
  in `Docs/manual/assets/`. On request, written at the end of what is being delivered, and
  kept current at every close after that

## Rules

- **Every element and every state carries its origin**: an acceptance criterion
  (`US-NNN CA-NN`), a design system convention, or the documented use of a shared
  component. A row with no origin is invented behavior: it becomes a `Q-NN`, it is listed
  as pending, and it is not drawn as decided.
- **The mechanism is cross-cutting and lives in the design system; the content is product
  and lives in the story.** The operative test: if you are writing a sentence the user will
  read on screen, you are writing a story, not a design.
- **Start from the task**, not the layout: who arrives, what they came for, and what **the**
  primary action is. A screen with two primary actions has not decided what it is for.
- **Regions, not pixels.** Hierarchy, grouping and reading order are the design; sizes,
  colors and spacing belong to the design system. Always say what changes on a narrow
  screen — that is where designs break.
- **The states are the design**: loading, empty, error, partial, no permission, success,
  and extreme data (one item, hundreds, a very long name, a huge amount). Each one is
  described, or declared *not applicable* with its reason.
- Data and words come from the stories: the same values their examples use, and any wording
  a criterion fixes is copied verbatim. A business promise no criterion makes stays pending.
- **Accessibility splits in two**: the verifiable requirement is a product-level NFR; how it
  is met belongs to the design system. Written in the same place, neither can be verified.
- **A design made elsewhere is an input, not a screen design.** An exported prototype or a
  set of screenshots gets converted: regions, elements and states, each with its origin.
  What no criterion asks for is not adopted just because it was drawn.
- What designing reveals as undefined is a question for analysis. It stays pending; it is
  never decided by drawing it.
- The document declares `update-when` in its frontmatter: which change forces it to be
  updated.

## Done when

Every acceptance criterion of the story has a place on a screen; every state is described
or declared not applicable with its reason; every element has its origin; and everything
the design could not decide is written as a pending question instead of drawn.

## Closing checklist

- [ ] The primary task and its single primary action are stated.
- [ ] Every element and state has an origin.
- [ ] Every state described or explicitly declared not applicable.
- [ ] Narrow-screen behavior stated.
- [ ] Navigation says where you arrive from and where each action leads, by file name.
- [ ] No new behavior, wording or business promise that no criterion supports.
- [ ] `update-when` written in the frontmatter.
