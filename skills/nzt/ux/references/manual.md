# User manual

## Contents
- Who reads it, and what that settles
- When it is written
- Organised by what they came to do
- Tone: competent person, not a suspect
- It looks like the product, not like a template
- Interactive where it helps, inert where it does not
- Only what exists, and only what was verified
- Measure, do not trust
- If it will not be maintained, do not create it
- Done when

Produces `Docs/Manual/<audience>.html` — one interactive file per audience — with its
images in `Docs/Manual/assets/`. **It is written on request, at the end of what is being
delivered.** Once it exists it stops being optional: it is a document of the product, and
every close keeps it current.

## Who reads it, and what that settles

This is the only artifact in the set the **end user** reads. Everything else is written for
whoever builds. That single fact decides most of what follows:

- **One file per audience, never per module.** An operator and an administrator do
  different work; one manual with a *"only if you are an admin"* note on every third step
  serves neither.
- **It is written in the language the person uses the product in**, and in the domain's
  words — the terms `Docs/Domain/glossary.md` fixed. A table, an endpoint, a class name or *"the
  system validates that…"* never appears.
- The product is for this person. The manual is where that is either true or a slogan.

## When it is written

**At the end, not while the product is being built.** It is written once the scope being
delivered is finished and accepted, before it reaches the people who will use it — a
hand-over, a training session, the release that opens the product to real users.

- **Nothing is written from memory**: the material is already on disk — the stories with
  their criteria, the test evidence with its captures, the words the glossary fixed. That is
  what makes a manual at the end a reading job instead of an archaeological one.
- **The screens are captured while writing it**, against the product as it is being
  delivered. A capture reused from a version three features old is the oldest way a manual
  lies.
- **It is one stretch of work, cut into units**: first the shell — the audiences, the table
  of contents, the *start here* path — then one chapter per task, each reviewable on its
  own, and a last pass for coherence: order, vocabulary, and the whole thing reading as one
  guide instead of chapters stapled together.
- **Asked for earlier, it is written earlier.** The user's request beats the default moment;
  what is not verified still gets no chapter.
- **Once it exists it is a document like any other**: a later feature that changes what the
  person does brings its chapter current when that feature closes (`nzt-plan-close` carries
  the row). Creating the manual is never the close's job.

## Organised by what they came to do

- **Every chapter title is a goal the person would say out loud**: *"Cobrar un pedido"*,
  never *"Módulo de cobros"*. A manual ordered like the menu is the system's table of
  contents, not the person's.
- Every chapter opens with **what they will have at the end**, and roughly how long it takes.
- **One action per step, with what they will see after it**, so they can tell they are still
  on track. A step whose result is invisible is where people stop.
- Chapters run in the order the work happens — first day first — not alphabetically and not
  by permission level.
- **The front page answers one question: what do I do first?** A front page that lists
  features makes the reader choose before they know anything.

## Tone: competent person, not a suspect

- **Second person, present, active.** *"Cargás el pedido"*, not *"el usuario deberá
  proceder a la carga"*.
- **Never `simplemente`, `obviamente`, `solo tenés que`.** A reader who is stuck reads those
  as *you are the problem*.
- **No infantilising either.** No cheering a click, no emoji per heading. One line at the end
  of a task naming what they achieved is worth more than all of it.
- **Nothing is the reader's fault.** What usually goes wrong is a section written as *this
  happens, and here is how you get out*: the message they will actually see, what it means
  in their words, and the way forward. *"Error del usuario"* does not appear.
- Each chapter **says what it assumes and links to it**, instead of depending on the reader
  having started at the top.

## It looks like the product, not like a template

- **The real theme, from `Docs/UX/design-system.md`.** A manual with its own palette reads as a
  third party's document about your product. **Never a second palette** — same rule and same
  reason as the mockup.
- **Legible before pretty**: text readable at arm's length, a measure of 65–75 characters,
  headings that survive a phone.
- **Screenshots come from evidence** — `Plan/specs/<feature>/testing/evidence/` or the
  screen's mockup — cropped to the region that matters, with real people's data replaced.
  **Never an invented screen**: a visual lie is the one people believe.
- **Re-captured when the screen changes.** An old screenshot is every manual's failure mode,
  and it is the reason a manual nobody maintains is worse than none.
- Movement never delays reading, and `prefers-reduced-motion` is honoured.

## Interactive where it helps, inert where it does not

One file that opens from disk, with no network:

- **Search across the whole manual**, and a table of contents that follows where the reader
  is.
- **Long procedures collapse**, and carry a checklist the reader can tick. Persist it per
  reader when the browser allows, wrapped so blocked storage never breaks the page and never
  loses text.
- **Copy buttons** for anything that must be typed exactly.
- **No build step, no CDN, no font fetched from the network.** It has to open from a pen
  drive, inside a network with no internet, and next year.
- **A phone is a first-class reader, and so is a printer**: what someone prints ends up
  taped next to their screen.
- **WCAG 2.2 AA**: reachable by keyboard, visible focus, real headings, alt text that says
  what the screenshot shows, contrast measured on the pairs actually used.
- **No interaction that pretends to be the product.** A simulated form that "saves" teaches
  a step that does not exist.

## Only what exists, and only what was verified

- **Every step traces to a criterion that passed verification.** Built but unverified gets no
  chapter; planned gets nothing at all.
- A behavior the manual would have to explain and **no criterion defines is a question**
  (`Q-NN`) for analysis, never a sentence invented here to fill the gap.
- **No `TODO` reaches the reader's page.** What has no chapter yet is reported to the user
  who asked for the manual, in the report — not printed as a hole in the product.
- A **header comment** ties the file to its sources: the stories and criteria it covers,
  where its screenshots came from, and the date.

## Measure, do not trust

Before presenting it, with every result written down:

- **320 px with no horizontal scroll**, measured in an iframe by comparing `scrollWidth`
  with `clientWidth`.
- **Contrast computed on the real pairs** in use, not on the palette in the abstract.
- **Keyboard order walked**, including search and every collapsible.
- **Opened with storage blocked**: it still renders, and no text is lost.

**A manual you could not open is a manual that is not verified**, and it is reported that
way. Never present a file you did not see.

## If it will not be maintained, do not create it

Propose it with what it is worth and accept a no. An out-of-date manual is the artifact the
user trusts most, because it looks finished — and the support call it causes is worse than
the question it would have prevented. If it is abandoned, it is deleted, not left to rot.

## Done when

Rehearse it: could someone who has never seen the product finish their first real task with
only this file, and not feel stupid once?

- Chapters are goals in the reader's words, in the order the work happens.
- Every step traces to a verified criterion; nothing planned or unverified is described.
- Screenshots come from evidence and match today's screens.
- It opens from disk with no network, and the four measurements were run and reported.
- Nothing blames the reader, and no `simplemente` survived.
- The design system's theme, with no second palette.
