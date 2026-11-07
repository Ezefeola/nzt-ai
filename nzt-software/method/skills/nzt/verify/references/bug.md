# Defect record

Produces `testing/bugs/BUG-NNN-<slug>.md`, one per defect. **This phase opens and closes it**,
even when build fixed it.

A defect **contradicts a criterion or a rule**. Otherwise: no requirement defines it → a
`Q-NN`; the expectation is ambiguous → a functional question; blocked or not run → stays
`blocked` in the test document; works but confuses → a usability or risk note.

## The file

```markdown
# BUG-004 · The expiry is not checked when the order is confirmed
state: fixed, pending verification
found: 2026-09-16 · scenario E-02 · story US-002 · rule RN-cupon-vencido

## What happens
An expired coupon discounts the total at confirmation.

## Expected
The total stays $10.000 and the coupon is reported as expired (US-002 CA-01).

## How to reproduce
1. Order of $10.000, coupon `INVIERNO20` expired 2026-05-01.
2. Apply it at checkout — correctly rejected.
3. Confirm the order — the discount is applied anyway.
Evidence: `evidence/2026-09-16/E-02-total.png`

## History
- 2026-09-16 · opened · pending
- 2026-09-17 · change reported by build · fixed, pending verification
- 2026-09-18 · retest E-02 passed · verified
```

## Rules

1. Steps reproduce it with real data; one that cannot be reproduced is filed as unreproduced
   with what you were doing.
2. It names what it violates (`US-NNN CA-NN`, rule).
3. A suspected cause is labelled; diagnosis is not this file's job.
4. **Three states**: `pending` · `fixed, pending verification` (a change proves nothing) ·
   `verified` (only after its scenario re-ran and passed). A failed retest returns it to
   `pending`. History is append-only.
5. One defect per file; one cause with two symptoms is one defect.
6. Every defect has its scenario in the story's test file — the one re-run to verify it.

## Done when

Someone else could reproduce it, fix it, and know exactly what proves it is gone.
