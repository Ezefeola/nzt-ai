# Survey before touching it

Produces three fields the plan cuts the work by — **what exists**, **what must be built**,
**the risks** — and changes nothing. Worth a unit when the change lands on existing work
nobody can describe from memory; a small edit in an established place skips it.

## Steps

1. **Translate the user's words through the glossary**: search the code names it gives. A
   term with no entry: search plausible names, read what they do, say which you assumed. An
   ambiguous meaning is a question.
2. **Work outwards**: what triggers the behavior (endpoint, screen, job, scene, command) →
   what it reads and writes → **who else uses it** (where the risk lives).
3. Stop when the next file stops changing the three fields.

## The report

```text
Already there:  the total is calculated in one place — Checkout/Total.cs:34; the coupon is
                validated when added to the basket, not at confirmation
To be built:    rejecting an expired coupon — nothing looks at the date today
Risks:          the same calculation feeds the order summary (Orders/Summary.cs:58)
Looked at, nothing there: the payment adapter, the notification handlers
Could not tell: whether the nightly job reuses the basket path
```

- Every claim has a file and line. `To be built` names what is missing, never how.
- An empty `Risks` over shared work means *who else uses it* was not asked.
- Say what you looked at and found empty, and what you could not determine.

## Never

Declare a business rule (behavior found is described; whether it is a rule is the user's,
via `nzt-discovery`'s reverse), fix anything in passing, judge the structure
(`nzt-architecture`'s review) or hunt defects (`nzt-verify`'s review).

## Done when

The plan could cut the work into units and name what it might break from the three fields.
