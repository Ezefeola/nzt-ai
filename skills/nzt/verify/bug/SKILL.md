---
name: nzt-verify-bug
description: Use when a defect is recorded or its state moves: one file per defect, the three states, and the retest that decides whether it closes.
---

# Bug record

Produces `Plan/specs/<feature>/testing/bugs/BUG-NNN-<slug>.md`, one file per defect. **This
phase opens it and this phase closes it, even when build was the one that fixed it.**

If you did not arrive here from `nzt-verify`, load it first.

## What is a bug and what is not

A bug is behavior that **contradicts a criterion or a business rule**. Everything else has
another home:

- No requirement defines it → a question for analysis (`Q-NN`).
- The expectation itself is ambiguous → a functional question, not a confirmed defect.
- Blocked, unreachable, not run → stays in the test document as `blocked` with its cause.
- Works but is confusing or risky → a usability or risk note.

Filing one of those as a bug puts an opinion in the backlog with the authority of a
violated rule.

## The file

```markdown
# BUG-004 · The expiry is not checked when the order is confirmed
state: fixed, pending verification
found: 2026-09-16 · scenario E-02 · story US-002 · rule RN-cupon-vencido

## What happens
An expired coupon discounts the total when the order is confirmed.

## Expected
The total stays at $10.000 and the coupon is reported as expired (US-002 CA-01).

## How to reproduce
1. Order of $10.000, coupon `INVIERNO20` expired on 2026-05-01.
2. Apply it at checkout — correctly rejected.
3. Confirm the order — the discount is applied anyway.
Evidence: `evidence/2026-09-16/E-02-total.png`

## History
- 2026-09-16 · opened · pending
- 2026-09-17 · code change reported by build · fixed, pending verification
- 2026-09-18 · retest E-02 passed · verified
```

- **Reproduction steps that actually reproduce it**, with the data used. A defect nobody can
  reproduce is a report, and it is filed as unreproduced with what you were doing.
- **What it violates**, by criterion and rule. That is what makes it a defect and not an
  opinion.
- Evidence, reviewed for secrets before it is saved.
- Keep the suspected cause separate from the confirmed fact, and label it. Diagnosing is
  not this file's job.

## Three states, not two

| State | What it means |
|---|---|
| `pending` | Found, not repaired |
| `fixed, pending verification` | Someone changed code. **Nothing has been proved yet** |
| `verified` | The retest was run and passed |

- **A code change never closes a bug.** It moves it to the middle state. "It should be
  fixed" is not a state.
- It becomes `verified` only when the scenario is re-run and passes, with its dated run in
  the test document.
- **If the retest fails, it goes back to `pending` and keeps its whole history.** A second
  cycle on the same defect is information: it usually means the cause was never found.
- The history is append-only. Superseded lines stay.

## One defect per file

A file with two defects gets fixed halfway and verified as if it were whole. If the same
cause produces two visible failures, that is one bug with two symptoms, and both are
written in *What happens*.

## Its scenario

Every bug has a scenario in the story's test file — the one that caught it, or a new one if
it was found by exploring. That scenario is what is re-run to verify it, and what keeps it
from coming back unnoticed.

## Done when

Rehearse it: could someone else reproduce this defect, fix it, and know exactly what
proves it is gone?

- The steps reproduce it, with real data.
- It names the criterion or rule it violates.
- Its state is one of the three, and it reached `verified` only through a passing retest.
- The history shows every cycle, including the ones that went back.
- Nothing in the file is a diagnosis presented as a fact.
