# Usability review

Produces a report of findings about one screen, each with its severity and its **type** —
and the type is what says where the finding goes next.

**This is an expert review, and the report says so.** It finds many problems cheaply. It
**does not replace testing with users**, and wherever a conclusion depends on how people
actually behave, that is stated in the finding.

## What your input can and cannot prove

Say which one you reviewed, and do not claim what it cannot show:

| Input | Shows | Cannot show |
|---|---|---|
| Screen design | structure, missing cases, gaps against criteria | contrast, focus, real spacing |
| Mockup | hierarchy, contrast, keyboard order | real data, latency, real behavior |
| Built screen | actual behavior, real data | the intent it was built against |

Whatever you could not run — because you could not render it, reach it, or log in — is
reported as **not run**, never as passed.

## Walk the tasks first

Take the task from the screen design and do it, start to finish, as the person who arrives
there.

- Task problems are the severe ones, and **they do not appear by inspecting elements one at
  a time**. A screen where every control is fine and the job cannot be finished passes
  every checklist and fails its purpose.
- Walk the unhappy paths too: the rejected coupon, the expired session, the empty result.
- Note where you hesitated. Hesitation is the cheapest signal you get, and it disappears the
  second time you look.

## Then sweep the heuristics

The ten classics — visibility of system status · match with the real world · user control
and freedom · consistency and standards · error prevention · recognition over recall ·
flexibility · minimalist design · help users recover from errors · help and documentation.

**Consistency is measured against this project too**, not only against general convention:
`Docs/design-system.md`, `Docs/ui-components.md`, and the neighbouring screens. A screen
that is internally consistent and unlike every other screen in the product is inconsistent.

## Then accessibility

WCAG 2.2 AA, with the concrete checks:

- Contrast 4.5:1 for text, 3:1 for controls and meaningful graphics — **computed on the
  real pairs**.
- Focus visible on every control, and not hidden behind sticky headers or footers.
- Targets of at least 24×24, with spacing where smaller is unavoidable.
- An alternative to dragging for anything that can be dragged.
- Errors identified in text, not by colour alone, and next to what caused them.
- Name, role and value available for every control.

**The level the product commits to is a product requirement.** If none is declared, review
against AA and ask whether it is adopted.

## The finding

```markdown
### The rejected coupon message disappears when the field is edited
- **Severity:** 3 — every customer who mistypes a code hits it, and the explanation is gone
  before they can read it.
- **Type:** breaks a criterion (US-002 CA-01) → bug.
- **Where:** checkout, coupon region, rejected state.
- **Evidence:** walked with an expired code in the mockup; the message clears on keypress.
```

- **Severity on the 0–4 scale**: 0 is not a problem, 4 is a catastrophe. Judge it by
  frequency, impact and persistence — how many people hit it, how bad it is when they do,
  and whether they can get past it.
- **The type decides the destination**:

| Type | Where it goes |
|---|---|
| Breaks an existing criterion | a bug, opened by `nzt-verify` |
| Needs behavior no criterion states | a proposal to the user; spec change if accepted |
| Construction only, no behavior change | fixed inside the authorised work |
| A missing convention | a proposal to `Docs/design-system.md` |

**The review proposes; the spec decides.** A finding you fixed by inventing behavior is not
a fix, it is an unreviewed spec change.

## Done when

Rehearse it: could the user act on every finding without asking you what to do with it?

- Which input you reviewed is stated, with what it could not show.
- The tasks were walked before any element was inspected.
- Every finding has its severity, its type and its evidence.
- Accessibility was checked against concrete criteria, not asserted.
- Anything that could not be run is named as not run.
- The report says plainly that this is an expert review, not a user test.
