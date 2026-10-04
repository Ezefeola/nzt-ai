---
name: nzt-discovery-write-stories
description: Use when writing or changing one user story: declarative criteria with concrete data, the unhappy path, and the coverage marks per area and for QA.
---

# User story

Produces one file: `Plan/specs/<feature>/stories/US-NNN-<slug>.md`. It carries the
acceptance criteria of one story and their coverage marks. **This is the only place
progress is read from** — the story index in `spec.md` has no checkboxes.

If you did not arrive here from `nzt-discovery`, load it first.

## Before writing

Read the feature's `spec.md`: the story's criteria cite its rules by slug and never restate
them. Read the project's stack documents too — **they are what declares which areas exist**
(`backend`, `frontend`, and whatever else this project has). An area without a stack
document does not exist for coverage purposes.

## The file

```markdown
# US-002 · A coupon that cannot be used
feature: F-003

As a customer with a promotion code, I want to know straight away that it will not apply,
so I do not confirm an order expecting a discount.

## Criteria

- [ ] **An expired coupon leaves the total untouched.** (RN-cupon-vencido)
  When I apply `INVIERNO20`, expired on 2026-05-01, to an order of $10.000, the total
  stays $10.000 and the coupon is reported as expired.
  backend ✓ · frontend — · qa —

- [ ] **A coupon already used by me is rejected.** (RN-un-uso-por-cliente)
  When I apply `VERANO25`, which I already redeemed, the total stays $10.000 and the
  coupon is reported as already used.
  backend — · frontend — · qa —

## Notes
- Q-13 · Does a refund return the coupon? Does not block these criteria.
```

## Writing a criterion

Each criterion is one observable outcome, and it has three parts: **the statement**, the
**When** that produces it with concrete data, and the **coverage line**.

- **Declarative, not imperative.** *"When I apply a valid coupon"*, never *"when I click
  Apply"*. A criterion tied to a button dies the day the button moves, and it belongs to
  the screen, not to the story.
- **One `When` per criterion.** Two triggers are two criteria. An "and then also" hides a
  second outcome that nobody will verify separately.
- **Concrete data, always.** *"The discount is applied to the subtotal"* cannot be
  verified; *"$10.000 with 25% gives $7.500"* can. This matters double when the one
  verifying is an agent: real amounts, real dates, real codes.
- **Cite the rule, do not copy it.** `(RN-cupon-vencido)` after the statement. The text of
  the rule lives in `spec.md` and changes there once.
- **At least one unhappy path per story**, or the explicit reason it does not apply. The
  bad case is what gets invented later if nobody wrote it down.
- If a criterion needs a paragraph to state, it is more than one criterion.

## Coverage per area, and QA

The coverage line goes on the criterion itself, never in a separate table:

```
backend ✓ · frontend ✓ · qa —
```

- The areas are the ones the project's stack documents declare. Write **all** of them on
  every criterion, including the ones that do not apply — `frontend —` and a missing
  `frontend` read the same to the next reader, and only one of them is true. **`qa` closes
  every line**, whatever the areas are.
- **Three marks, three owners, three questions:**

  | Mark | Set by | It means |
  |---|---|---|
  | area `✓` | `nzt-build` | built: it compiles and the tests the stack enables pass |
  | `qa ✓` | `nzt-verify` | the scenarios of **every** area marked `✓` passed |
  | `[x]` | the user | accepted — only once every area and `qa` are `✓` |

  `—` means not yet. What is missing to build, to test and to accept reads off one line.
- `qa ✓` is all the built areas or nothing: an API that passed with a screen still untested
  is `qa —`, and the story's testing file says which half is missing.
- You do not fill these marks here: this skill writes the line so the others have somewhere
  to mark. An unmarked `[ ]` with no coverage line says nothing about which part is missing,
  which is the whole reason the line exists.

## One story is one story

- **Never split a story by area or by system.** *"I see the discount in the summary"* is
  not backend and not frontend: it is the product's, and it needs both. A story split in
  two halves that nobody can accept on its own is two tasks, not two stories.
- One story per unit. A feature with four stories is four units, with a stop between them.
- Splitting is by outcome, never by layer: *applying a coupon* and *a coupon that cannot be
  used* are two stories because they are two things the user can accept separately.

## No priorities

No `P1` / `P2` / `P3`, and no severity column. The work is already ordered by dependency
and by the agreed plan; a second ranking contradicts the first one the day they disagree.

## Changing a story

- **A rewritten criterion returns to `[ ]` only if what is observed changed**, and then its
  `qa` returns to `—` too. Rewording keeps its marks — resetting them throws away
  verification that is still valid.
- A criterion that no longer applies is removed, with its reason recorded where the
  decision was made. It is not left ticked "for history".
- A new criterion arrives as `[ ]` with the full coverage line, whatever state the rest of
  the story is in.

## Done when

Rehearse it: could someone build this story, and someone else verify it, without asking you
anything?

- Every criterion is declarative, has one `When` and uses concrete data.
- Every criterion carries its coverage line with all the project's areas and `qa`.
- At least one unhappy path, or the written reason there is none.
- No criterion names a technology, a screen widget or an endpoint.
- Every rule is cited by slug, and no rule text is copied into this file.
