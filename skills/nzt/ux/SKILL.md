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

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The unit is | Read | Read with |
|---|---|---|
| One screen: layout, content, states, navigation | `references/screen.md` | `../nzt-plan/references/questions.md` |
| An HTML mockup of a designed screen — only if the user asked for it | `references/mockup.md` | `references/review.md` — its measurements; `references/generic.md` |
| A usable prototype to learn what delivery 1 has to teach — offered by the plan | `references/mockup.md` | `references/review.md` — its measurements; `references/generic.md` |
| The end user's manual: an interactive HTML guide of the product — on request | `references/manual.md` | `references/review.md` — its measurements; `references/generic.md` |
| The design system, shared components, the visual direction, or the brand and its voice | `references/system.md` | `references/generic.md` — when the unit sets or changes the direction |
| Judging a design, a mockup or a built screen against its task | `references/review.md` | `references/generic.md` — its tells |

Wherever a file names `nzt-ux-<name>`, it means `references/<name>.md` in this folder
(`nzt-ux-system` → `references/system.md`): read that file — it is not a skill.

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

**A request for the manual is therefore more than one unit: load `nzt-plan` with it.** The
first reply is the plan — the file it will be (one HTML that opens from disk, per
`references/manual.md`), the chapters named as the reader's tasks, and what gets no chapter
and why. What you still need to ask is the plan's first step, never a reason to hold the
plan back.

## Where it lands

- One screen design, with its mockup beside it if there is one →
  `Plan/specs/<feature>/ux-ui/`
- A prototype → `Plan/prototype/<slug>.html`; once what it taught is recorded, deleted or
  kept in `Docs/UX/prototype/<slug>.html` and maintained, as the user decides
- Visual direction and the design system → `Docs/UX/design-system.md`; the shared component
  inventory → `Docs/UX/ui-components.md`. Both written and maintained per `references/system.md`
- The end user's manual, one file per audience → `Docs/Manual/<audience>.html`, its images
  in `Docs/Manual/assets/`. On request, written at the end of what is being delivered, and
  kept current at every close after that

## Rules

Each reference holds the rules of its own document. These hold for every unit of the phase:

- **The mechanism is cross-cutting and lives in the design system; the content is product
  and lives in the story.** The operative test: if you are writing a sentence the user will
  read on screen, you are writing a story, not a design.
- **What designing reveals as undefined is a question for analysis**: a `Q-NN` opened in the
  feature's `analysis.md`, cited here by that id and listed as pending. It is never decided
  by drawing it.

## Done when

The unit's reference says its own *Done when*, and it holds. Nothing the unit produced
promises a behavior no acceptance criterion supports.
