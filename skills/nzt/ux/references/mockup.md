# Screen mockup

## Contents
- What makes it a mockup and not half-built code
- The theme defines, the design system names
- Every state, reachable on its own
- Honest placeholders
- Navigation
- Measure, do not trust
- A prototype is a mockup that teaches
- The two files never disagree
- Done when

Produces `Plan/specs/<feature>/ux-ui/screen-<slug>.html`, beside the screen design it
comes from. **Only when the user asked for one.** It is a reference to look at, never code
to copy into the project. A **prototype** is the same file used to learn before delivery 1
is built: its own section below says what changes.

## What makes it a mockup and not half-built code

- **Self-contained**: one file, no network requests, no build step, no imports. It opens
  from disk.
- **No business logic.** Interaction is limited to showing the states. Nothing calculates,
  validates or persists. A prototype is the one exception, in its own section.
- **It imitates the component library instead of using it.** That is precisely what stops
  it turning into unfinished production code, and it is a feature, not a shortcut.
- A header comment ties it to its source: the screen design, the stories, and the date.
- Every element carries, in a comment or a data attribute, its component and its origin —
  the same origins the screen design uses.

## The theme defines, the design system names

- Copy the values from the project's **real** theme and say where they came from. **Never
  introduce a second palette beside the true one**: a mockup with its own colours becomes
  the reference someone builds from.
- In a new product with nothing adopted yet, mark them `/* provisional */` and keep the
  marking until the design system adopts them.
- A value that corresponds to no role is a proposal to `Docs/UX/design-system.md`, not a local
  exception.

## Every state, reachable on its own

Draw **all** the states the design lists — loading, empty, error, partial, no permission,
success, extreme data.

- The state selector lives **outside the frame** of the screen, so it is never mistaken for
  part of the design.
- Each state is reachable by hash (`#state=empty`), so a single state can be linked and
  captured on its own.
- A state the design declared not applicable is not drawn; the selector says so.

## Honest placeholders

- Undefined text shows as `[text pending · Q-10]`, never as invented copy. **A good
  imitation of missing content reads as a decision.**
- An image the project has not provided is a marked box saying what belongs there.
- Data comes from the story's examples. Same amounts, same names, same dates.

## Navigation

Each action links to the mockup of its destination when that one exists, so the circuit can
be walked screen by screen instead of shown as loose images. A destination that has no
mockup says so in place.

## Measure, do not trust

Before presenting it, and with the result written down:

- **320 px with no horizontal scroll**: render it in an iframe at that width and compare
  `scrollWidth` with `clientWidth`. "It looks responsive" is not a measurement.
- **Contrast computed on the real pairs** actually used — text over its surface, control
  over its background — not on the palette in the abstract.
- **Keyboard order walked**, checking focus is visible and nothing is left unreachable.

**A mockup that could not be rendered is a mockup that is not verified**, and it is reported
that way. Do not present a file you could not open as if you had seen it.

## A prototype is a mockup that teaches

When delivery 1 has something to learn from users (`nzt-discovery-product`, **To learn**),
the plan offers a prototype inside the discovery slice: the same kind of file, built to
answer that question before code exists.

- **It starts from the question, not from a screen design.** Its header names the `Q-NN`
  it answers and who will try it. It draws the fewest screens that put the question in
  front of a person, as one walkable flow; there may be no screen design yet.
- **It is used, not just looked at.** The person does the task for real — adds, edits,
  removes — and **the business rules its flow touches apply**, as the spec states them: a
  prototype that lets through what a rule forbids teaches the wrong thing. Data lives in
  memory, unless a rule it shows is about keeping it.
- **Its header lists the rules it implements**, by slug, with the date of the spec it read:
  that list is what says it is out of date when a rule changes.
- **Every other rule above holds**: self-contained and opened with a double click, honest
  placeholders, the measurements run. Lightweight is the point: plain HTML and a little
  script, nothing to install.
- **It never becomes production code**, and nobody copies markup from it: the screens that
  ship are designed per `references/screen.md` and built from the stories. That is what
  keeps a prototype cheap enough to be wrong.

**When it has taught what it was for**, what the people who tried it did and said goes into
`Docs/Product/analysis.md` as the answer to its `Q-NN`, in their terms. Then **the user
decides its fate**, asked with what each option costs:

- **Delete it.** Nothing is left to keep in step; what it taught is already recorded.
- **Keep it** in `Docs/UX/prototype/<slug>.html`, to show and try. It is then maintained: a
  change to a rule in its header, or to a screen it draws, updates it in the same unit. A
  prototype nobody keeps current lies with the authority of what looks real — if it will
  not be maintained, delete it.

## The two files never disagree

- The `.md` and the `.html` describe the same screen. A change to one is a change to both,
  in the same unit.
- The screen design's frontmatter records that a mockup exists.
- **If it is not going to be maintained, delete it** along with that field. An outdated
  mockup is worse than none: it is the artifact people trust precisely because it is
  visual.

## Done when

Rehearse it: could the user click through every state of this screen, and a developer take
nothing from it but the intent?

- Every state in the design is drawn and reachable by hash.
- No network request, no second palette, and no business logic outside a prototype.
- Every pending piece of content is visibly marked as pending, with its question.
- The width, contrast and keyboard checks were **run**, and their results are in the report.
- The design document and the mockup say the same thing.
- A prototype names its `Q-NN` and the rules it implements; once the answer is in
  `analysis.md`, it is deleted or kept and maintained, as the user decided.
