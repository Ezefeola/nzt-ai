# Mockup and prototype

Produces `Plan/specs/<feature>/ux-ui/screen-<slug>.html` beside its screen design — **only
when the user asked** — as something to look at, never code to copy. A **prototype** is the
same kind of file used to learn before delivery 1 is built.

## Steps

1. **Self-contained**: one file, no network, no build, no imports; it opens from disk. A
   header comment names its screen design, stories and date; every element carries its
   component and origin in a comment or data attribute.
2. **No business logic** (a prototype excepted). It imitates the component library instead of
   using it — that is what keeps it from becoming half-built production code.
3. **Values from the project's real theme**, with their source. Never a second palette. Before
   anything is adopted, mark them `/* provisional */`. A value with no role is a proposal to
   the design system.
4. **Every state the design lists**, each reachable by hash (`#state=empty`), with the
   selector **outside** the screen's frame; not-applicable states say so there.
5. **Honest placeholders**: `[text pending · Q-10]`, a marked box for a missing image, the
   story's own data.
6. **Navigation** links to destination mockups when they exist, or says so in place.
7. **Measure** (`review.md`, *Measuring an HTML file*), then run `generic.md`'s pass on the
   rendered file — a tell in the adopted theme is a proposal to the design system. Not
   rendered → not verified.

## A prototype

- **It starts from the question**: its header names the `Q-NN` it answers (delivery 1's *To
  learn*) and who will try it; it draws the fewest screens that put the question in front of
  a person, as one walkable flow.
- **It is used, not looked at**: the person does the task for real, and **the rules its flow
  touches apply** as the spec states them, listed by slug with the spec's date in its header.
  Data in memory unless a rule is about keeping it.
- **It never becomes production code.**
- When it has taught: what people did and said goes into `Docs/Product/analysis.md` as the
  answer to its `Q-NN`. Then the user decides: **delete it**, or **keep it** in
  `Docs/UX/prototype/<slug>.html` and maintain it with its rules and screens.

## Rules

The `.md` and `.html` never disagree: a change to one is a change to both in the same unit,
and the design's frontmatter records the mockup. Not going to be maintained → delete it.

## Done when

The user could click through every state, a developer could take nothing from it but the
intent, and the measurements and the generic pass are in the report.
