# Against the generic default

Shapes every visual thing the work produces — a direction, screen, mockup, prototype, manual,
a page built in code — so it looks like its subject, not the average of everything a model
has seen. Produces a short visual plan and a pass reported in the unit.

With no direction, a model converges on its most common choices; banning one moves it to the
next. **What avoids the default is a reason from the subject behind every choice.** The table
below is for reviewing, never a recipe or a ban list to generate from.

## The visual plan, before building

With a design system, it **is** the plan: reuse its roles, palette, type and voice, plan only
what it leaves open. Without one, write the plan before any markup:

1. **The subject**: the product, who uses it, the task, its world (industry, materials,
   words and objects). Every later line cites it.
2. **Palette**: 4–6 named values, each with role and reason from the subject.
3. **Type**: one family or two clearly distinct, each with a role; a deliberate scale; lines
   under ~80 characters.
4. **Layout**: regions, alignment chosen on purpose, and **what opens the page — the most
   characteristic element of the subject's world**, not a slogan over a stock arrangement.
5. **One bold place** to remember; everything else disciplined.
6. **Motion**: at most one orchestrated moment the user did not trigger; motion answering an
   action shows what changed; reduced motion respected.

Review the plan against the request: every choice that would fit any similar page changes, and
the plan says what changed. Structure encodes information; remove one decoration before
presenting. Alternatives vary **one** meaningful dimension and list what the previous used. A
rejected direction is written in the design system with why.

## The tells

**A tell is a question**: *what in this subject asks for it?* With an answer it stays and the
answer is written; without one, it changes.

| Area | Tells |
|---|---|
| Typography | a family by habit — Inter, Roboto, Open Sans, Lato, the system default, whatever is in fashion · one headline word set apart in italic or colour · a tracked-out uppercase label above every heading · monospace for small data labels · display and body in near-identical families |
| Colour | indigo or violet primary for no reason · violet-to-blue gradient · gradient washes as decoration · warm cream (≈ `#F4F1EA`) + serif + terracotta (≈ `#D97757`) · near-black (`#0B0B0B`, `#111`) + one acid green or vermilion · any colour with no reason tied to the request |
| Structure | the card kit: identical rounded cards, one radius, the same soft shadow · centred hero over three icon cards · `01 / 02 / 03` on content that is not a sequence · the broadsheet look (hairlines, zero radius, dense columns) as default |
| Template chrome | metadata joined `A · B · C` · labels shaped `WORD — fragment` · `→` glued to every button and link |
| Hero | the big number with a small label, stats and a gradient accent, as every section's opening |
| Motion | fade-and-slide-up on every section · a hover transition on every card |
| Copy | *Submit*, *Learn more* where a verb could name the result (*Save changes*) · vague, apologetic or first-person errors · filler and cleverness · system jargon over the user's words |
| Code | one radius and shadow token for everything · selectors whose specificity cancels spacing, leaving padding nobody chose |

## The pass

1. On the plan, before building. 2. On the **rendered** result — tells show in composition.
3. Name each hit with its element; change it or keep it with its reason. 4. Report in one
line: found, changed, and why each kept one stays — or that only the plan could be checked.

## Done when

Someone who never saw the request could tell from the result what the product is and who it
is for.
