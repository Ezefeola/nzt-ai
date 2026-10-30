# Against the generic default

## Contents
- Why the default appears
- The visual plan, before building
- Tried, not repeated
- The tells of a generated design
- Running the pass
- Done when

Shapes every visual thing the work produces — a direction, a screen, a mockup, a prototype,
the manual, a page built in code — so it looks like its subject and not like the average of
everything a model has seen. It produces no document of its own: a short visual plan, and a
pass whose result goes in the unit's report.

## Why the default appears

With no direction, a model converges on the most common choices it was trained on. Banning
one only moves it to the next: forbid one typeface and another one becomes the new default.

- **The catalogue below is for reviewing, never a recipe and never a ban list to generate
  from.** Read as instructions, it produces the next cliché.
- **What avoids the default is a reason from the subject** behind every choice. A logistics
  console and a bakery's order page cannot come out looking the same.

## The visual plan, before building

**When the project has a design system, it is the plan**: read `Docs/UX/design-system.md`,
reuse its roles, palette, typography and voice, and plan only what it leaves open. Without
one, write the plan before the first line of markup — in the screen design, or in the
report of direct work so the user sees the choices.

1. **The subject.** The product, who uses it, the task they came for, and its world: the
   industry, its materials, the words and objects its people use. Every later line cites it.
2. **Palette.** 4–6 named values, each with its role and why it belongs to this subject.
3. **Type.** One family, or two that are clearly distinct, each with its role; a scale with
   deliberate weights and sizes; text lines under about 80 characters.
4. **Layout.** The regions in a few lines or a rough wireframe, the alignment chosen on
   purpose, and **what opens the page: the most characteristic element of the subject's
   world**, not a slogan over a stock arrangement.
5. **One bold place.** The single element meant to be remembered; everything else stays
   disciplined.
6. **Motion.** At most one orchestrated moment the user did not trigger. Motion that answers
   an action is welcome when it shows what changed. Reduced motion is respected.

Then **review the plan against the request before building**: every choice that would fit
any similar page is changed, and the plan says what changed and why. **Structure encodes
information** — a border, a number, a divider or a label is there because the content has
that structure — and one decoration is removed before presenting.

## Tried, not repeated

- Alternatives vary **one meaningful dimension** — density, typographic voice, colour
  temperature — not three versions of the same thing.
- A second pass, or an alternative, lists what the previous one used — palette, families,
  layout — and changes the dimension it varies.
- A direction the user rejected is written in one line in the design system, with why, so
  no later pass offers it again.

## The tells of a generated design

**A tell is a question, not a prohibition**: *what in this subject asks for it?* With an
answer it stays and the answer is written down; without one, it changes.

| Area | Tells |
|---|---|
| Typography | a family chosen by habit — Inter, Roboto, Open Sans, Lato, the system default, or whichever is in fashion · one word of a headline set apart in italic or colour · a small tracked-out uppercase label above every heading · monospace for small data labels · display and body in two near-identical families |
| Colour | indigo or violet as the primary for no reason the subject gives · a violet-to-blue gradient · gradient washes as decoration · warm cream (≈ `#F4F1EA`) with a serif and a terracotta accent (≈ `#D97757`) · near-black (`#0B0B0B`, `#111`) with one acid green or vermilion accent · any colour with no reason tied to the request |
| Structure | the card kit: identical rounded cards, one radius for everything, the same soft grey shadow · a centred hero over three icon cards in a row · numbered markers `01 / 02 / 03` on content that is not a sequence · the broadsheet look — hairline rules, zero radius, dense columns — as a default rather than a choice |
| Template chrome | metadata joined with middle dots `A · B · C` · labels shaped `WORD — fragment` · an arrow `→` glued to every button and link |
| Hero | the big number with a small label, supporting stats and a gradient accent, repeated as every section's opening |
| Motion | fade-and-slide-up on every section · a hover transition on every card |
| Copy | generic actions — *Submit*, *Learn more* — where a verb names the result (*Save changes*) · vague, apologetic or first-person errors · filler and cleverness over clarity · system jargon instead of the user's words |
| Code | one radius and one shadow token used for everything · selectors whose specificity cancels spacing rules, so sections end up with padding nobody chose |

## Running the pass

1. **On the plan**, before building: the palette, families, layout and opening element
   against the table.
2. **On the result**, rendered — the mockup, a screenshot of the built screen, the page —
   because tells show up in the composition, not in the plan.
3. **Each hit is named** with the element where it appears, and either changed or kept with
   the reason from the subject.
4. **In the report**, one line: how many tells were found, how many changed, and why each
   kept one stays. A pass that found none says so; one that could not render the result
   says it checked the plan only.

## Done when

Rehearse it: could someone who never saw the request tell, from the result alone, what the
product is and who it is for?

- The subject is named, and every choice in the plan cites it.
- The plan was reviewed against the request before building, saying what changed.
- The rendered result was checked against every row; each hit was changed or kept with its
  reason from the subject.
- One decoration was removed before presenting.
- Alternatives vary one dimension, and a rejected direction is recorded in the design system.
